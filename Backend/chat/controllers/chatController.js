const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const chatService = require("../services/chatService");
const User = require("../../model/registerUser/UserScehma");
const resolveProfileImage = require("../../utils/profileImageResolver");
const { decrypt } = require("../utils/crypto");
const { decryptConversationKey } = require("../security/keyManager");
const NotificationService = require("../../modules/notifications/notificationService.js");
const notificationService = new NotificationService();
const {
  handleFindOrCreateConversation,
  handleCreateMessage,
  handleGetMessagesPaginated,
  handleMarkConversationSeen,
  handleAddReaction,
  handleRemoveReaction,
} = require("../services/chatService");

/**
 * GET /api/chat/conversations
 */
async function handleGetConversations(req, res) {
  try {
    const userId = req.user.id;

    // Get all conversations for this user
    const allConvs = await Conversation.find({ participants: userId })
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean();

    // Filter: exclude conversations where user deleted AND there are no new messages after deletion
    const convs = allConvs.filter((c) => {
      const deleteEntry = c.deletedFor.find(
        (d) => String(d.userId) === String(userId),
      );
      if (!deleteEntry) return true; // Not deleted, include it

      // User deleted this conversation
      // Check if lastMessage is after the deletion timestamp
      if (c.lastMessage && c.lastMessage.createdAt) {
        const lastMsgTime = new Date(c.lastMessage.createdAt);
        const deletedTime = new Date(deleteEntry.deletedAt);
        return lastMsgTime > deletedTime; // Include if last message is after deletion
      }

      return false; // No messages after deletion, exclude it
    });

    const formatted = await Promise.all(
      convs.map(async (c) => {
        const other = c.participants.find((p) => String(p) !== String(userId));

        const unreadEntry = c.unreadCount.find(
          (u) => String(u.userId) === String(userId),
        );

        // If unreadEntry is missing (older conversations), fallback to computing
        // unread by counting messages not seen by the user.
        let computedUnread = 0;
        if (!unreadEntry) {
          try {
            // Count only messages sent by others that the user hasn't seen
            computedUnread = await Message.countDocuments({
              conversationId: c._id,
              sender: { $ne: userId },
              seenBy: { $ne: userId },
            });
          } catch (e) {
            computedUnread = 0;
          }
        }

        // Fetch partner user details
        const partnerUser = await User.findById(other)
          .select("name role")
          .lean();

        // Get partner's profile image
        const avatar = partnerUser
          ? await resolveProfileImage(String(other), partnerUser.role)
          : null;

        return {
          id: String(c._id),
          partner: {
            id: String(other),
            name: partnerUser?.name || String(other),
            role: partnerUser?.role || null,
            avatar:
              avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerUser?.name || "User")}`,
          },
          // Provide a decrypted preview for the last message (if available)
          lastMessage: (function () {
            try {
              if (!c.lastMessage) return null;
              const { iv, content, tag } = c.encryptedConversationKey;
              const conversationKey = decryptConversationKey({
                iv,
                content,
                tag,
              });
              const text = decrypt(
                c.lastMessage.encryptedPayload,
                conversationKey,
                `${String(c._id)}:${String(c.lastMessage.sender)}`,
              );

              return {
                id: String(c.lastMessage._id),
                text,
                sender: String(c.lastMessage.sender),
                createdAt: c.lastMessage.createdAt,
              };
            } catch (e) {
              return null;
            }
          })(),
          updatedAt: c.updatedAt,
          unread: unreadEntry ? unreadEntry.count : computedUnread || 0,
        };
      }),
    );

    return res.json({ conversations: formatted });
  } catch (err) {
    console.error("getConversations error:", err);
    return res.status(500).json({ message: "Failed to load conversations" });
  }
}

/**
 * GET /api/chat/messages/:conversationId?limit=20&before=timestamp
 */
async function handleGetMessages(req, res) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    let limit = parseInt(req.query.limit, 10) || 20;
    limit = Math.min(limit, 50); // hard cap

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => String(p) === String(userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user deleted this conversation and get the deletion timestamp
    const userDeleteEntry = conv.deletedFor.find(
      (d) => String(d.userId) === String(userId),
    );

    const { before } = req.query;

    // If user previously deleted, only show messages after deletion timestamp
    if (userDeleteEntry) {
      const beforeTime = before ? new Date(before) : undefined;
      const deletedTime = new Date(userDeleteEntry.deletedAt);

      // Use the deletion time as a minimum, or the before time if it's after deletion
      const minTime =
        beforeTime && beforeTime > deletedTime ? deletedTime : deletedTime;

      const q = { conversationId, createdAt: { $gt: minTime } };
      if (before) q.createdAt.$lt = new Date(before);

      const docs = await Message.find(q).sort({ createdAt: -1 }).limit(limit);

      // Decrypt messages
      const { iv, content, tag } = conv.encryptedConversationKey;
      const conversationKey = decryptConversationKey({
        iv,
        content,
        tag,
      });

      const messages = docs
        .reverse()
        .map((m) => {
          try {
            return {
              ...m.toObject(),
              text: decrypt(
                m.encryptedPayload,
                conversationKey,
                `${conversationId}:${m.sender}`,
              ),
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      return res.json({ messages, hasMore: docs.length === limit });
    }

    const result = await handleGetMessagesPaginated(conversationId, {
      before,
      limit,
    });

    return res.json(result);
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ message: "Failed to load messages" });
  }
}

/**
 * POST /api/chat/messages
 * body: { conversationId (optional), to, text, attachment }
 */

async function handlePostMessage(req, res) {
  try {
    const sender = req.user.id;
    const { conversationId, to, text = "", attachment = null } = req.body;

    let conv;

    if (conversationId) {
      conv = await Conversation.findById(conversationId);
      if (
        !conv ||
        !conv.participants.some((p) => String(p) === String(sender))
      ) {
        return res.status(403).json({ message: "Invalid conversation" });
      }
    } else {
      if (!to || String(to) === String(sender)) {
        return res.status(400).json({ message: "Invalid recipient" });
      }
      console.log(
        "handlePostMessage: creating/finding conversation for",
        sender,
        to,
      );
      conv = await handleFindOrCreateConversation(String(sender), String(to));
      console.log(
        "handlePostMessage: conversation result ->",
        conv && conv._id,
      );
    }

    // Don't remove from deletedFor - keep the deletion timestamp for message filtering
    // The conversation will still appear in the list if there are new messages
    // (see handleGetConversations filter logic)

    const message = await handleCreateMessage({
      conversationId: conv._id,
      sender,
      text,
      attachment,
    });

    const recipientId =
      to ||
      conv.participants.find((id) => String(id) !== String(sender));

    let notificationSent = null;
    if (recipientId) {
      notificationSent = await notificationService.createNotification({
        recipient: recipientId,
        sender,
        type: "NEW_MESSAGE",
        entityId: message._id,
        entityType: "MESSAGE",
        metadata: {
          text: message.text,
        },
      });
    }

    console.log(
      "handlePostMessage: message created",
      message._id,
      "convId",
      conv._id,
    );

    return res.status(201).json({
      message: {
        id: message._id,
        sender: message.sender,
        createdAt: message.createdAt,
      },
      notificationSent: {
        success: !!notificationSent,
        notificationId: notificationSent ? notificationSent._id : null,
      }
    });
  } catch (err) {
    console.error("postMessage error:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
}

async function handleDeleteChat(req, res) {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user id required" });
    }

    // Find the 1-to-1 conversation via participants
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId], $size: 2 },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Soft delete: mark deleted for THIS user only with timestamp
    const existing = conversation.deletedFor.find(
      (d) => String(d.userId) === String(userId),
    );
    if (existing) {
      // refresh deletion timestamp so repeated deletes hide newer messages
      existing.deletedAt = new Date();
    } else {
      conversation.deletedFor.push({ userId, deletedAt: new Date() });
    }

    await conversation.save();

    return res.status(200).json({
      message: "Conversation removed from your inbox",
      conversationId: conversation._id,
    });
  } catch (err) {
    console.error("handleDeleteChat error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * POST /api/chat/seen
 * body: { conversationId }
 */
async function handleSeenConversation(req, res) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.body;

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => String(p) === String(userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    await handleMarkConversationSeen(conversationId, userId);
    return res.json({ ok: true });
  } catch (err) {
    console.error("seenConversation error:", err);
    return res.status(500).json({ message: "Failed to update seen status" });
  }
}

/**
 * POST /api/chat/reaction
 * body: { messageId, reaction, action } action = "add" | "remove"
 */
async function handleReaction(req, res) {
  try {
    const userId = req.user.id;
    const { messageId, reaction, action } = req.body;

    if (!["add", "remove"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const msg =
      action === "add"
        ? await handleAddReaction(messageId, reaction, userId)
        : await handleRemoveReaction(messageId, reaction, userId);

    return res.json({ ok: true });
  } catch (err) {
    console.error("reaction error:", err);
    return res.status(500).json({ message: "Reaction failed" });
  }
}

module.exports = {
  handleGetConversations,
  handleGetMessages,
  handlePostMessage,
  handleSeenConversation,
  handleReaction,
  handleDeleteChat,
};

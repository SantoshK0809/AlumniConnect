const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const { encrypt, decrypt } = require("../utils/crypto");
const {
  decryptConversationKey,
  generateConversationKey,
  encryptConversationKey,
} = require("../security/keyManager");

const {
  getCachedMessages,
  setCachedMessages,
  pushCachedMessage,
  incrementUnread,
  resetUnread,
} = require("../utils/chatCache");

async function handleFindOrCreateConversation(userAId, userBId) {
  try {
    const existing = await Conversation.findOne({
      participants: { $all: [userAId, userBId], $size: 2 },
    });

    if (existing) return existing;

    const conversationKey = generateConversationKey();
    const encryptedKey = encryptConversationKey(conversationKey);

    const conversation = new Conversation({
      participants: [userAId, userBId],
      encryptedConversationKey: {
        iv: encryptedKey.iv,
        content: encryptedKey.content,
        tag: encryptedKey.tag,
        keyVersion: 1,
      },
      // initialize unread counters for both participants
      unreadCount: [
        { userId: userAId, count: 0 },
        { userId: userBId, count: 0 },
      ],
    });

    console.log("BEFORE save conversation");
    await conversation.save();
    console.log("AFTER save conversation", conversation._id);
    try {
      console.log(
        "SAVED CONVERSATION DOC:",
        JSON.stringify(
          {
            _id: conversation._id,
            participants: conversation.participants,
            encryptedConversationKey: conversation.encryptedConversationKey,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      console.warn("Could not serialize conversation for logging", e);
    }

    return conversation;
  } catch (err) {
    // internal logging only
    console.error("findOrCreateConversation failed:", err);

    throw new Error("Unable to create conversation");
  }
}

async function handleCreateMessage({
  conversationId,
  sender,
  text = "",
  attachment = null,
}) {
  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      throw new Error("Conversation not found");
    }

    // const conversationKey = decryptConversationKey(
    //   conv.encryptedConversationKey.value,
    // );

    const { iv, content, tag } = conv.encryptedConversationKey;

    const conversationKey = decryptConversationKey({
      iv,
      content,
      tag,
    });

    const encryptedPayload = encrypt(
      text,
      conversationKey,
      `${conversationId}:${sender}`,
    );

    const msg = await Message.create({
      conversationId,
      sender,
      encryptedPayload,
      attachment,
    });

    // cache failure must NOT break message send
    try {
      pushCachedMessage(conversationId, msg);
    } catch (cacheErr) {
      console.warn("Cache push failed:", cacheErr);
    }

    // unread count update
    conv.lastMessage = msg._id;

    // Consolidate any duplicate unread entries into a map
    const countsMap = new Map();
    (conv.unreadCount || []).forEach((u) => {
      const uid = String(u.userId);
      const prev = countsMap.get(uid) || 0;
      countsMap.set(uid, prev + (u.count || 0));
    });

    // For 1:1 conversation, increment only the other participant(s)
    conv.participants.forEach((p) => {
      const pid = String(p);
      if (pid === String(sender)) return;

      const prev = countsMap.get(pid) || 0;
      countsMap.set(pid, prev + 1);

      // update ephemeral UI cache
      incrementUnread(pid, conversationId);
    });

    // Rebuild unreadCount array from map
    conv.unreadCount = Array.from(countsMap.entries()).map(([userId, count]) => ({ userId, count }));

    await conv.save();
    return msg;
  } catch (err) {
    console.error("createMessage failed:", err);

    throw new Error("Unable to send message");
  }
}

async function handleGetMessagesPaginated(
  conversationId,
  { before = null, limit = 20 } = {},
) {
  try {
    // const conv = await Conversation.findById(conversationId);
    // if (!conv) throw new Error("Conversation not found");

    // const conversationKey = decryptConversationKey(
    //   conv.encryptedConversationKey.value,
    // );

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const { iv, content, tag } = conversation.encryptedConversationKey;

    const conversationKey = decryptConversationKey({
      iv,
      content,
      tag,
    });

    const q = { conversationId };
    if (before) q.createdAt = { $lt: new Date(before) };

    const docs = await Message.find(q).sort({ createdAt: -1 }).limit(limit);

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
          // corrupted message → skip, don’t crash
          return null;
        }
      })
      .filter(Boolean);

    return {
      messages,
      hasMore: docs.length === limit,
    };
  } catch (err) {
    console.error("getMessagesPaginated failed:", err);
    throw new Error("Unable to fetch messages");
  }
}

/**
 * markConversationSeen(conversationId, userId)
 */
async function handleMarkConversationSeen(conversationId, userId) {
  await Message.updateMany(
    { conversationId, seenBy: { $ne: userId } },
    { $addToSet: { seenBy: userId } },
  );

  // Use atomic update to prevent VersionError collisions
  await Conversation.updateOne(
    { _id: conversationId, "unreadCount.userId": userId },
    { $set: { "unreadCount.$.count": 0 } }
  );

  resetUnread(userId, conversationId);
}


/**
 * addReaction(messageId, reaction, userId)
 */
async function handleAddReaction(messageId, reaction, userId) {
  // Use $addToSet to avoid duplicates
  const update = { $addToSet: {} };
  update.$addToSet[`reactions.${reaction}`] = userId;
  const msg = await Message.findByIdAndUpdate(messageId, update, { new: true });
  return msg;
}

/**
 * removeReaction(messageId, reaction, userId)
 */
async function handleRemoveReaction(messageId, reaction, userId) {
  const msg = await Message.findByIdAndUpdate(
    messageId,
    { $pull: { [`reactions.${reaction}`]: userId } },
    { new: true },
  );
  return msg;
}

module.exports = {
  handleFindOrCreateConversation,
  handleCreateMessage,
  handleGetMessagesPaginated,
  handleMarkConversationSeen,
  handleAddReaction,
  handleRemoveReaction,
  // backward-compatible aliases used by socket layer
  findOrCreateConversation: handleFindOrCreateConversation,
  createMessage: handleCreateMessage,
  markConversationSeen: handleMarkConversationSeen,
};

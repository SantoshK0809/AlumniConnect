// const chatService = require("../services/chatService");
// const jwt = require("jsonwebtoken");

// /**
//  * Assumptions (MANDATORY):
//  * 1. Socket authentication middleware already attaches:
//  *    socket.user = { _id: ObjectId }
//  * 2. chatService methods are production-safe:
//  *    - findOrCreateConversation
//  *    - createMessage
//  *    - getMessagesPaginated
//  *    - markConversationSeen
//  *    - addReaction
//  *    - removeReaction
//  */

// function setupChatSocket(io) {
//   // ---- SOCKET AUTH GUARD (HARD REQUIREMENT) ----
//   // io.use((socket, next) => {
//   //   if (!socket.request.user || !socket.request.user.id) {
//   //     return next(new Error("Unauthorized socket connection"));
//   //   }
//   //   socket.userId = String(socket.request.user.id);
//   //   next();
//   // });

//   io.use((socket, next) => {
//     try {
//       const token = socket.handshake.auth?.token;

//       if (!token) {
//         return next(new Error("Missing auth token"));
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//       // Attach user to socket
//       socket.user = decoded;
//       socket.userId = String(decoded.id);

//       next();
//     } catch (err) {
//       return next(new Error("Invalid auth token"));
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("⚡ Socket connected:", socket.id, "User:", socket.userId);

//     // 1. JOIN PERSONAL ROOM (NO USER ID FROM CLIENT)

//     socket.on("join", () => {
//       socket.join(socket.userId);
//     });

//     // 2. SEND MESSAGE
//     // payload: { conversationId?, to, text?, attachment?, tempId }

//     socket.on("sendMessage", async (payload) => {
//       try {
//         if (
//           !payload ||
//           (!payload.conversationId && !payload.to) ||
//           (!payload.text && !payload.attachment)
//         ) {
//           return socket.emit("error", { message: "Invalid payload" });
//         }

//         const sender = socket.userId;
//         const {
//           conversationId,
//           to,
//           text = "",
//           attachment = null,
//           tempId,
//         } = payload;

//         let convId = conversationId;

//         // Create conversation if needed
//         if (!convId) {
//           const conv = await chatService.findOrCreateConversation(
//             sender,
//             String(to),
//           );
//           convId = conv._id;
//         }

//         // Create message (ENCRYPTED inside service)
//         const message = await chatService.createMessage({
//           conversationId: convId,
//           sender,
//           text,
//           attachment,
//         });

//         // Ack to sender
//         io.to(sender).emit("message:sent", {
//           message,
//           tempId,
//         });

//         // Deliver to receiver
//         if (to) {
//           io.to(String(to)).emit("message:new", {
//             message,
//           });
//         }

//         // Sidebar update
//         io.to(sender).emit("conversation:update", {
//           conversationId: convId,
//           lastMessage: message,
//         });

//         if (to) {
//           io.to(String(to)).emit("conversation:update", {
//             conversationId: convId,
//             lastMessage: message,
//           });
//         }
//       } catch (err) {
//         console.error("sendMessage socket error:", err);
//         socket.emit("error", { message: "Failed to send message" });
//       }
//     });

//     // 3. MARK CONVERSATION SEEN
//     // payload: { conversationId }

//     socket.on("seen", async ({ conversationId }) => {
//       try {
//         if (!conversationId) return;

//         // Mark messages as seen in DB
//         await chatService.markConversationSeen(conversationId, socket.userId);

//         // Fetch conversation to get all participants
//         const Conversation = require("../models/Conversation");
//         const conv = await Conversation.findById(conversationId);
        
//         if (!conv) return;

//         // Broadcast to ALL participants that this user has seen the conversation
//         conv.participants.forEach((p) => {
//           io.to(String(p)).emit("messages:seen", {
//             conversationId,
//             userId: socket.userId,
//           });
//         });
//       } catch (err) {
//         console.error("seen socket error:", err);
//       }
//     });

//     // 4. ADD REACTION
//     // payload: { messageId, reaction }

//     socket.on("addReaction", async ({ messageId, reaction }) => {
//       try {
//         if (!messageId || !reaction) return;

//         const msg = await chatService.addReaction(
//           messageId,
//           reaction,
//           socket.userId,
//         );

//         if (!msg) return;

//         io.to(socket.userId).emit("message:reaction", { message: msg });
//       } catch (err) {
//         console.error("addReaction socket error:", err);
//       }
//     });

//     // 5. REMOVE REACTION
//     // payload: { messageId, reaction }

//     socket.on("removeReaction", async ({ messageId, reaction }) => {
//       try {
//         if (!messageId || !reaction) return;

//         const msg = await chatService.removeReaction(
//           messageId,
//           reaction,
//           socket.userId,
//         );

//         if (!msg) return;

//         io.to(socket.userId).emit("message:reaction", { message: msg });
//       } catch (err) {
//         console.error("removeReaction socket error:", err);
//       }
//     });

//     // 6. DISCONNECT
//     socket.on("disconnect", () => {
//       console.log("Socket disconnected:", socket.id);
//     });
//   });
// }

// module.exports = setupChatSocket;

const chatService = require("../services/chatService");
const NotificationService = require("../../modules/notifications/notificationService");

/**
 * This file ONLY attaches event handlers to an already connected socket.
 * NO io.on("connection")
 * NO io.use()
 */

function setupChatSocket(io, socket) {
  const notificationService = new NotificationService(io);

  console.log("💬 Chat module attached for user:", socket.userId);

  // -----------------------------
  // 1. JOIN PERSONAL ROOM
  // -----------------------------
  socket.on("join", () => {
    socket.join(socket.userId);
  });

  // -----------------------------
  // 2. SEND MESSAGE
  // -----------------------------
  socket.on("sendMessage", async (payload) => {
    try {
      if (
        !payload ||
        (!payload.conversationId && !payload.to) ||
        (!payload.text && !payload.attachment)
      ) {
        return socket.emit("error", { message: "Invalid payload" });
      }

      const sender = socket.userId;
      const {
        conversationId,
        to,
        text = "",
        attachment = null,
        tempId,
      } = payload;

      let convId = conversationId;

      // Create conversation if needed
      if (!convId) {
        const conv = await chatService.findOrCreateConversation(
          sender,
          String(to)
        );
        convId = conv._id;
      }

      // Create message (ENCRYPTED inside service)
      const message = await chatService.createMessage({
        conversationId: convId,
        sender,
        text,
        attachment,
      });

      // Create notification record for recipient
      let recipientId = to;
      if (!recipientId && convId) {
        const Conversation = require("../models/Conversation");
        const conv = await Conversation.findById(convId);
        recipientId = conv?.participants?.find(
          (p) => String(p) !== String(sender),
        );
      }

      if (recipientId) {
        await notificationService.createNotification({
          recipient: recipientId,
          sender,
          type: "NEW_MESSAGE",
          entityId: message._id,
          entityType: "MESSAGE",
          metadata: { text: message.text },
        });
      }

      // ✅ ACK to sender
      io.to(sender).emit("message:sent", {
        message,
        tempId,
      });

      // ✅ Deliver to receiver
      if (to) {
        io.to(String(to)).emit("message:new", {
          message,
        });
      }

      // ✅ Sidebar updates
      io.to(sender).emit("conversation:update", {
        conversationId: convId,
        lastMessage: message,
        partnerId: to
      });

      if (to) {
        io.to(String(to)).emit("conversation:update", {
          conversationId: convId,
          lastMessage: message,
          partnerId: sender
        });
      }
    } catch (err) {
      console.error("sendMessage socket error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // -----------------------------
  // 3. MARK CONVERSATION SEEN
  // -----------------------------
  socket.on("seen", async ({ conversationId }) => {
    try {
      if (!conversationId) return;

      await chatService.markConversationSeen(
        conversationId,
        socket.userId
      );

      const Conversation = require("../models/Conversation");
      const conv = await Conversation.findById(conversationId);

      if (!conv) return;

      conv.participants.forEach((p) => {
        io.to(String(p)).emit("messages:seen", {
          conversationId,
          userId: socket.userId,
        });
      });
    } catch (err) {
      console.error("seen socket error:", err);
    }
  });

  // -----------------------------
  // 4. ADD REACTION
  // -----------------------------
  socket.on("addReaction", async ({ messageId, reaction }) => {
    try {
      if (!messageId || !reaction) return;

      const msg = await chatService.addReaction(
        messageId,
        reaction,
        socket.userId
      );

      if (!msg) return;

      io.to(socket.userId).emit("message:reaction", { message: msg });
    } catch (err) {
      console.error("addReaction socket error:", err);
    }
  });

  // -----------------------------
  // 5. REMOVE REACTION
  // -----------------------------
  socket.on("removeReaction", async ({ messageId, reaction }) => {
    try {
      if (!messageId || !reaction) return;

      const msg = await chatService.removeReaction(
        messageId,
        reaction,
        socket.userId
      );

      if (!msg) return;

      io.to(socket.userId).emit("message:reaction", { message: msg });
    } catch (err) {
      console.error("removeReaction socket error:", err);
    }
  });

  // -----------------------------
  // 6. DISCONNECT
  // -----------------------------
  socket.on("disconnect", () => {
    console.log("❌ Chat socket disconnected:", socket.userId);
  });
}

module.exports = setupChatSocket;

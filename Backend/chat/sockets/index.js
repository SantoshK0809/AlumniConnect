// const jwt = require("jsonwebtoken");

// //const setupChatSocket = require("./chat.socket");
// const setupNotificationSocket = require("./notification.socket");

// function setupSocket(io, notificationService) {
//   // 🔐 AUTH (ONLY ONCE)
//   io.use((socket, next) => {
//     try {
//       const token = socket.handshake.auth?.token;

//       if (!token) return next(new Error("Missing token"));

//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//       socket.user = decoded;
//       socket.userId = String(decoded.id);

//       next();
//     } catch (err) {
//       next(new Error("Invalid token"));
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("⚡ Connected:", socket.userId);

//     // 🔥 IMPORTANT FIX (your bug)
//     socket.join(`user:${socket.userId}`);

//     // Attach handlers
//     //setupChatSocket(io, socket);
//     setupNotificationSocket(socket, notificationService);

//     socket.on("disconnect", () => {
//       console.log("Disconnected:", socket.userId);
//     });
//   });
// }

// module.exports = setupSocket;


const jwt = require("jsonwebtoken");

const setupChatSocket = require("./chatSocket.js");
const setupNotificationSocket = require("./notification.socket.js");

function setupSocket(io, notificationService) {
  // -----------------------------
  // 🔐 GLOBAL AUTH (ONLY ONCE)
  // -----------------------------
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Missing token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      socket.user = decoded;
      socket.userId = String(decoded.id);

      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  // -----------------------------
  // 🔌 CONNECTION HANDLER (ONLY ONE)
  // -----------------------------
  io.on("connection", (socket) => {
    console.log("⚡ Connected:", socket.userId);

    // Personal room (IMPORTANT for both chat + notifications)
    socket.join(socket.userId);
    socket.join(`user:${socket.userId}`);

    // -----------------------------
    // Attach feature modules
    // -----------------------------
    setupChatSocket(io, socket);
    setupNotificationSocket(socket, notificationService);

    // -----------------------------
    // DISCONNECT
    // -----------------------------
    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.userId);
    });
  });
}

module.exports = setupSocket;

// function setupNotificationSocket( socket, notificationService) {
//   // Replay missed notifications
//   socket.on("notification:connected", async ({ lastSeenAt }) => {
//     try {
//       if (!lastSeenAt) return;

//       const missed =
//         await notificationService.replayMissedNotifications(
//           socket.userId,
//           lastSeenAt
//         );

//       socket.emit("notification:bulk", missed);
//     } catch (err) {
//       console.error("Notification sync error:", err);
//     }
//   });
// }

// module.exports = setupNotificationSocket;


/**
 * Notification socket module
 * ONLY handles events for a connected socket
 */

function setupNotificationSocket(socket, notificationService) {
  console.log("🔔 Notification module attached for user:", socket.userId);

  // -----------------------------------
  // 1. SYNC MISSED NOTIFICATIONS
  // -----------------------------------
  socket.on("notification:sync", async ({ lastSeenAt }) => {
    try {
      if (!lastSeenAt || isNaN(new Date(lastSeenAt))) {
        return;
      }

      const missed =
        await notificationService.replayMissedNotifications(
          socket.userId,
          lastSeenAt
        );

      socket.emit("notification:bulk", missed);
    } catch (err) {
      console.error("Notification sync error:", err);
    }
  });

  // -----------------------------------
  // 2. CLIENT ACK (OPTIONAL BUT GOOD)
  // -----------------------------------
  socket.on("notification:received", async ({ notificationId }) => {
    try {
      if (!notificationId) return;

      // Optional: mark delivered if you want stronger tracking
      // (you can implement this in service later)
    } catch (err) {
      console.error("Notification received ack error:", err);
    }
  });
}

module.exports = setupNotificationSocket;
import { io } from "socket.io-client";
import server from "../../environment.js";

// Create socket but do not auto-connect. We'll attach token and connect when ready.
// export const socket = io("http://localhost:4000", {
//   autoConnect: false,
// });

export const socket = io(`${server}`, {
  autoConnect: false,
  transports: ["websocket"],
  reconnectionAttempts: 5, // Limit reconnection attempts
  timeout: 5000, // Connection timeout in milliseconds
});

socket.on("connect_error", (err) => {
  console.error("Socket connect_error:", err && err.message ? err.message : err);
});

export function connectSocket(token) {
  if (token) {
    socket.auth = { token };
  }
  socket.connect();
}

export function disconnectSocket() {
  try {
    socket.disconnect();
  } catch (e) {
    // ignore
  }
}


const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectMongoDB } = require("./connection");

// Routes
const chatRoutes = require("./chat/routes/chatRoutes");
const setupSocket = require("./chat/sockets/index");
const adminRoutes = require("./routes/adminRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const loginRegister = require("./routes/loginRegisterRoutes");
const postRoutes = require("./routes/postRoutes");
const directoryRoutes = require("./routes/directoryRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const connectionRoutes = require("./modules/connections/connectionRoutes");
const resumeRoutes = require("./modules/resumeAI/resumeRoute")
const mentorshipRequestRoutes = require("./modules/mentorship/index");
const alumniDiscoveryRoutes = require("./modules/alumniDiscovery/alumniDiscoveryRoutes");
const professionalProfileRoutes = require("./modules/achievements/alumniProfessionalProfile.routes");

const { NotificationController, setupNotificationRoutes, router: notificationRouter } = require("./modules/notifications/notificationRoutes");
const NotificationService = require("./modules/notifications/notificationService");
const { globalErrorHandler } = require("./middlewares/errorMiddleware");

// ── CONFIG ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/AlumniPortalDB";
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174"];

// ── HTTP + SOCKET.IO SERVER ─────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true,
  },
});

// ── NOTIFICATION SERVICE (global) ───────────────────────────────────
const notificationService = new NotificationService(io);
app.set("notificationService", notificationService);

// ── SOCKET SETUP ────────────────────────────────────────────────────
setupSocket(io, notificationService);

// ── CONNECT MONGODB ─────────────────────────────────────────────────
connectMongoDB(MONGODB_URI);

// ── GLOBAL MIDDLEWARE ───────────────────────────────────────────────
app.use(cookieParser());
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true,
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

// ── NOTIFICATION CONTROLLER ─────────────────────────────────────────
const notificationController = new NotificationController(notificationService, io);
setupNotificationRoutes(notificationController);

// ── API ROUTES ──────────────────────────────────────────────────────
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/notifications", notificationRouter);
app.use("/api/chat", chatRoutes);
app.use("/api", loginRegister);
app.use("/api/resume", resumeRoutes);
app.use("/api/post", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/discovery", alumniDiscoveryRoutes);
app.use("/api/mentorship-requests", mentorshipRequestRoutes);
app.use("/api/alumni/achievements", professionalProfileRoutes);

// ── 404 FALLBACK ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

// ── GLOBAL ERROR HANDLER (must be last) ─────────────────────────────
app.use(globalErrorHandler);

// ── START SERVER ────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});

// ── GRACEFUL SHUTDOWN ───────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.message);
  server.close(() => process.exit(1));
});

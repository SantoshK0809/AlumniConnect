const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
    verified: { type: Boolean, default: true },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    permissions: {
      type: [String],
      enum: ["manageStudents", "manageTeachers", "manageAlumni", "viewReports"],
      default: ["manageStudents", "manageTeachers", "manageAlumni"],
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

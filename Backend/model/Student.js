const mongoose = require("mongoose");
const DEPARTMENTS = require("../constants/departments");


const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    profileImage: {
      url: String,
      public_id: String,
    },

    coverImage: {
      url: String,
      public_id: String,
    },

    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },

    batch: { type: Number, required: true },
    course: { type: String, default: "" },
    address: { type: String, default: "" },
    contact: { type: String, default: "" },
    currentYear: { type: String, default: "" },

    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    projects: { type: [{ title: String, description: String }], default: [] },
    achievements: { type: [String], default: [] },

    verified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;

const mongoose = require("mongoose");
const DEPARTMENTS = require("../constants/departments");

const alumniSchema = new mongoose.Schema(
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

    graduationYear: { type: Number, required: true },

    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },

    currentCompany: { type: String, default: "" },
    currentPosition: { type: String, default: "" },
    bio: { type: String, default: "" },

    linkedin: { type: String, default: "" },
    contact: { type: String, default: "" },
    location: { type: String, default: "" },

    skills: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    contributions: { type: [String], default: [] },

    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Alumni = mongoose.model("Alumni", alumniSchema);

module.exports = Alumni;

const mongoose = require("mongoose");


const DEPARTMENTS = require("../constants/departments");
const SPECIALIZATIONS = require("../constants/specializations");

const teacherSchema = new mongoose.Schema(
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

    designation: { type: String, default: "" },
    contact: { type: String, default: "" },

    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },

    specialization: {
      type: [{ type: String, enum: SPECIALIZATIONS }],
      default: [],
    },

    achievements: [
      {
        type: String,
      },
    ],

    bio: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    qualifications: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;

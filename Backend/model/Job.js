const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["Teacher", "Alumni"],
      required: true,
    },

    authorName: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Internship", "Contract"],
      required: [true, "Job type is required"],
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },

    salary: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    applyLink: {
      type: String,
      default: "",
    },

    deadline: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for search and filtering
jobSchema.index({ title: "text", company: "text", description: "text" });
jobSchema.index({ type: 1, isActive: 1, createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;

const mongoose = require('mongoose')

const mentorProfileSchema = new mongoose.Schema({
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  headline: String,

  bio: String,

  expertise: [String],

  yearsOfExperience: Number,

  company: String,

  mentorshipEnabled: {
    type: Boolean,
    default: true,
  },

  maxMentees: {
    type: Number,
    default: 5,
  },

  currentMentees: {
    type: Number,
    default: 0,
  },

}, { timestamps: true });

const Mentor = mongoose.model("MentorProfile", mentorProfileSchema);

module.exports = { Mentor };
const mongoose = require("mongoose");
const User = require("../model/registerUser/UserScehma");
const Student = require("../model/Student");
const Alumni = require("../model/Alumni");
const Teacher = require("../model/Teacher");
const Admin = require("../model/Admin");

exports.handleGetPublicProfile = async (req, res) => {
  try {
    const { role, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    let profile;
    const normalizedRole = role.toLowerCase();

    if (normalizedRole === "student") {
      profile = await Student.findOne({ user: id }).populate("user", "name email role connectionsCount");
    } else if (normalizedRole === "alumni") {
      profile = await Alumni.findOne({ user: id }).populate("user", "name email role connectionsCount");
    } else if (normalizedRole === "teacher") {
      profile = await Teacher.findOne({ user: id }).populate("user", "name email role connectionsCount");
    } else if (normalizedRole === "admin") {
      profile = await Admin.findOne({ user: id }).populate("user", "name email role connectionsCount");
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    if (!profile) {
      // If no specific profile exists, return at least the user data from User model
      const user = await User.findById(id).select("-password -__v");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json({ user, name: user.name, email: user.email, role: user.role });
    }

    // Standardize the response
    const profileObj = profile.toObject();
    res.status(200).json({
      ...profileObj,
      name: profile.user?.name,
      email: profile.user?.email,
      role: profile.user?.role,
      connections: profile.user?.connectionsCount || 0
    });

  } catch (error) {
    console.error("Public Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

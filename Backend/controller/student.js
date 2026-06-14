const mongoose = require("mongoose");
const User = require("../model/registerUser/UserScehma");
const bcrypt = require("bcrypt");
const Student = require("../model/Student");
const Post = require("../model/Posts");
const Connection = require("../modules/connections/connectionSchema");
const { handleAddRemoveArray } = require("../utils/profileDataArray");
const cloudinary = require("../utils/cloudinaryConfig");
const fs = require("fs");

async function handleUpdateStudentProfile(req, res) {
  try {
    const id = req.user?.id;

    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { name, email, password } = req.body;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }

    await student.save();

    const { password: _, __v, ...safeStudent } = student.toObject();
    res
      .status(200)
      .json({ message: "Student updated successfully", student: safeStudent });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}


async function handleInsertDataToStudentModel(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    console.log("BODY →", req.body);
    console.log("FILES →", req.files);

    // Only Student can modify student profile
    if (role !== "Student") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if profile exists
    let student = await Student.findOne({ user: userId });

    // Create if not exists
    if (!student) {
      student = new Student({ user: userId });
    }

    // Ownership check
    if (student.user.toString() !== userId) {
      return res.status(403).json({
        message: "You are not allowed to modify this profile",
      });
    }

    const uploadToCloudinary = async (file, folder) => {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder,
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
        ],
      });

      fs.unlinkSync(file.path);

      return {
        url: upload.secure_url,
        public_id: upload.public_id,
      };
    };

    // profileImage
    if (req.files?.profileImage?.length > 0) {
      const file = req.files.profileImage[0];

      if (student.profileImage?.public_id) {
        await cloudinary.uploader.destroy(student.profileImage.public_id);
      }

      student.profileImage = await uploadToCloudinary(file, "student_profiles");
    }

    // coverImage
    if (req.files?.coverImage?.length > 0) {
      const file = req.files.coverImage[0];

      if (student.coverImage?.public_id) {
        await cloudinary.uploader.destroy(student.coverImage.public_id);
      }

      student.coverImage = await uploadToCloudinary(file, "student_covers");
    }

    const allowed = [
      "department",
      "bio",
      "achievements",
      "batch",
      "course",
      "address",
      "contact",
      "currentYear",
      "skills",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        student[field] = req.body[field];
      }
    });

    if (req.body.skills) {
      student.skills = handleAddRemoveArray(
        student.skills || [],
        req.body.skills
      );
    }

    if (req.body.achievements) {
      student.achievements = handleAddRemoveArray(
        student.achievements || [],
        req.body.achievements
      );
    }

    await student.save();

    res.status(200).json({
      message: "Student profile updated successfully",
      profile: student,
    });
  } catch (err) {
    console.error("Student Update Error:", err);

    // cleanup temp file if failed
    try {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkErr) {
      console.warn("Cleanup failed:", unlinkErr.message);
    }

    return res.status(500).json({ message: "Something went wrong." });
  }
}

async function handleGetStudentProfile(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role.toLowerCase();

    console.log("INSIDE GET STUDENT PROFILE:", userId, role);

    // Role check
    if (role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch with user details populated
    let student = await Student.findOne({ user: userId }).populate(
      "user",
      "name email connectionsCount"
    );

    if (!student) {
      const basicUser = await User.findById(userId).select("name email connectionsCount");
      if (!basicUser) return res.status(404).json({ message: "Profile not found" });

      return res.status(200).json({
        name: basicUser.name,
        email: basicUser.email,
        connections: basicUser.connectionsCount || 0,
        profileImage: { url: "", public_id: "" },
        coverImage: { url: "", public_id: "" },
      });
    }

    // Convert to plain JS object
    student = student.toObject();

    // Return structured response
    res.status(200).json({
      ...student,
      name: student.user?.name || "",
      email: student.user?.email || "",
      connections: student.user?.connectionsCount || 0,
      profileImage: student.profileImage || { url: "", public_id: "" },
      coverImage: student.coverImage || { url: "", public_id: "" },
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


async function handleGetMyProfile(req, res) {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Fetch user safely
    const user = await User.findById(id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send safe response
    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/users/:id
async function handleGetUserById(req, res) {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Fetch minimal safe fields
    const user = await User.findById(id)
      .select("name email role about avatarUrl graduationYear department")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching public user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function handleStudentProfileDelete(req, res) {
  try {
    const id = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role.toLowerCase() !== "student") {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this account" });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Delete user after password match
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function handleGetDashboardData(req, res) {
  try {
    const userId = req.user.id;

    const [
      studentProfile,
      postCount,
      connectionCount,
      recentPosts
    ] = await Promise.all([
      Student.findOne({ user: userId }),
      Post.countDocuments({ user: userId }),
      Connection.countDocuments({
        $or: [{ requesterId: userId }, { recipientId: userId }],
        status: "ACCEPTED"
      }),
      Post.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const dashboardData = {
      stats: [
        { label: "Total Posts", value: postCount },
        { label: "Connections", value: connectionCount },
        { label: "Projects", value: studentProfile?.projects?.length || 0 },
        { label: "Skills", value: studentProfile?.skills?.length || 0 }
      ],
      activities: recentPosts.map(post => ({
        type: "post",
        title: "New Post",
        description: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
        timestamp: post.createdAt
      }))
    };

    // Add a default activity if none exist
    if (dashboardData.activities.length === 0) {
      dashboardData.activities.push({
        type: "info",
        title: "Welcome!",
        description: "Start by creating your first post or connecting with alumni.",
        timestamp: "Now"
      });
    }

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: dashboardData
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handleUpdateStudentProfile,
  handleGetMyProfile,
  handleStudentProfileDelete,
  handleGetUserById,
  handleInsertDataToStudentModel,
  handleGetStudentProfile,
  handleGetDashboardData,
};

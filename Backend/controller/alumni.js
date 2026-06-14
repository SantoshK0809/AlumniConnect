const mongoose = require("mongoose");
const User = require("../model/registerUser/UserScehma");
const bcrypt = require("bcrypt");
const Alumni = require("../model/Alumni");
const Post = require("../model/Posts");
const Connection = require("../modules/connections/connectionSchema");
const { handleAddRemoveArray } = require("../utils/profileDataArray");
const cloudinary = require("../utils/cloudinaryConfig");
const fs = require("fs");

async function getAllAlumni(req, res) {
  res.send("Get all Alumni");
}

async function getAlumniById(req, res) {
  const { id } = req.params;
  res.send(`Get Alumni with ID: ${id}`);
}

async function createAlumni(req, res) {
  const data = req.body;
  res.send(`Create Alumni with data: ${JSON.stringify(data)}`);
}

async function handleUpdateAlumniProfile(req, res) {
  try {
    const id = req.user?.id;
    const { email, password, name } = req.body;

    const alumni = await User.findById(id);

    if (!alumni) return res.status(404).json({ message: "Alumni not found" });

    if (alumni.role?.toLowerCase() !== "alumni")
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (email) alumni.email = email;
    if (name) alumni.name = name;
    if (password) alumni.password = await bcrypt.hash(password, 10);

    await alumni.save();

    const { password: _, __v, ...safeAlumni } = alumni.toObject();

    res.status(200).json({
      message: "Alumni updated sucessfully",
      alumni: safeAlumni,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}


async function handleInsertDataToAlumniModel(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    console.log("BODY →", req.body);
    console.log("FILES →", req.files);

    // Only alumni can update/create alumni profile
    if (role !== "Alumni") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if profile exists
    let alumni = await Alumni.findOne({ user: userId });

    // Create new profile if none exists
    if (!alumni) {
      alumni = new Alumni({ user: userId });
    }

    // Ownership check
    if (alumni.user.toString() !== userId) {
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

      if (alumni.profileImage?.public_id) {
        await cloudinary.uploader.destroy(alumni.profileImage.public_id);
      }

      alumni.profileImage = await uploadToCloudinary(file, "alumni_profiles");
    }

    // coverImage
    if (req.files?.coverImage?.length > 0) {
      const file = req.files.coverImage[0];

      if (alumni.coverImage?.public_id) {
        await cloudinary.uploader.destroy(alumni.coverImage.public_id);
      }

      alumni.coverImage = await uploadToCloudinary(file, "alumni_covers");
    }

    const allowed = [
      "graduationYear",
      "department",
      "skills",
      "achievements",
      "contributions",
      "currentCompany",
      "currentPosition",
      "linkedin",
      "contact",
      "location",
      "bio",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        alumni[field] = req.body[field];
      }
    });

    if (req.body.skills) {
      alumni.skills = handleAddRemoveArray(
        alumni.skills || [],
        req.body.skills
      );
    }

    if (req.body.achievements) {
      alumni.achievements = handleAddRemoveArray(
        alumni.achievements || [],
        req.body.achievements
      );
    }

    if (req.body.contributions) {
      alumni.contributions = handleAddRemoveArray(
        alumni.contributions || [],
        req.body.contributions
      );
    }

    await alumni.save();

    res.status(200).json({
      message: "Alumni profile updated successfully",
      profile: alumni,
    });
  } catch (err) {
    console.error("Alumni Update Error:", err);
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


async function handleGetAlumniProfile(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role.toLowerCase();

    console.log("INSIDE GET ALUMNI PROFILE", userId, role);

    if (role !== "alumni") {
      return res.status(403).json({ message: "Access denied" });
    }

    let alumni = await Alumni.findOne({ user: userId }).populate(
      "user",
      "name email connectionsCount"
    );

    let post = await Post.find({user: userId});

    if (!alumni) {
      const basicUser = await User.findById(userId).select("name email connectionsCount");
      if (!basicUser) return res.status(404).json({ message: "Profile not found" });

      return res.status(200).json({
        name: basicUser.name,
        email: basicUser.email,
        connections: basicUser.connectionsCount || 0,
        post: post.length,
        profileImage: { url: "", public_id: "" },
        coverImage: { url: "", public_id: "" },
      });
    }

    alumni = alumni.toObject();

    res.status(200).json({
      ...alumni,
      name: alumni.user?.name || "",
      email: alumni.user?.email || "",
      connections: alumni.user?.connectionsCount || 0,
      post: post.length,
    });
  } catch (error) {
    console.error("Get Alumni Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function handleDeleteAlumni(req, res) {
  try {
    const id = req.user?.id;
    const deletedAlumni = await User.findByIdAndDelete(id);

    if (!deletedAlumni)
      return res.status(404).json({ message: "Alumni not found" });

    res
      .status(200)
      .json({ message: "Deleted alumni sucessfully", deletedAlumni });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}

async function handleGetUserById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User retrieved sucessfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}

async function handleGetProfile(req, res) {
  try {
    const id = req.user?.id;
    const alumniProfile = await User.findById(id).select("-password -__v");
    if (!alumniProfile)
      return res.status(404).json({ message: "Can't find User" });
    res
      .status(200)
      .json({ message: "User retrieved sucessfuly", alumniProfile });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}async function handleGetDashboardData(req, res) {
  try {
    const userId = req.user.id;

    const [
      alumniProfile,
      postCount,
      connectionCount,
      recentPosts
    ] = await Promise.all([
      Alumni.findOne({ user: userId }),
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
        { label: "Achievements", value: alumniProfile?.achievements?.length || 0 },
        { label: "Contributions", value: alumniProfile?.contributions?.length || 0 }
      ],
      activities: recentPosts.map(post => ({
        type: "post",
        title: "New Insight",
        description: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
        timestamp: post.createdAt
      }))
    };

    // Add a default activity if none exist
    if (dashboardData.activities.length === 0) {
      dashboardData.activities.push({
        type: "info",
        title: "Welcome Back!",
        description: "Check out the directory to connect with juniors or share your professional journey.",
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
  getAllAlumni,
  getAlumniById,
  createAlumni,
  handleUpdateAlumniProfile,
  handleDeleteAlumni,
  handleGetUserById,
  handleGetProfile,
  handleInsertDataToAlumniModel,
  handleGetAlumniProfile,
  handleGetDashboardData,
};

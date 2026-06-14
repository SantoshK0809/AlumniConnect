const mongoose = require("mongoose");
const User = require("../model/registerUser/UserScehma");
const Post = require("../model/Posts");
const Alumni = require("../model/Alumni");
const Student = require("../model/Student");
const Teacher = require("../model/Teacher");
const Admin = require("../model/Admin");
const cloudinary = require("../utils/cloudinaryConfig");
const fs = require("fs");
const Connection = require("../modules/connections/connectionSchema");
const NotificationService = require("../modules/notifications/notificationService");
const { sendEmail, getPostConfirmationTemplate } = require("../utils/emailService");


async function handleCreatePost(req, res) {
  try {
    console.log("🚀 POST /api/post HIT! req.body =", req.body, "req.file =", req.file ? "Attached" : "None");
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const id = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    let imageData = {};
    let authorProfileImage = null; // ✅ define it here — function-scope

    // Fetch role-based profile image (always normalize to string URL)
    let profileImage = null;
    switch (String(user.role || "").toLowerCase()) {
      case "student":
        profileImage = (await Student.findOne({ user: user._id }))?.profileImage || null;
        break;
      case "teacher":
        profileImage = (await Teacher.findOne({ user: user._id }))?.profileImage || null;
        break;
      case "alumni":
        profileImage = (await Alumni.findOne({ user: user._id }))?.profileImage || null;
        break;
      case "admin":
        profileImage = (await Admin.findOne({ user: user._id }))?.profileImage || null;
        break;
    }
    // Normalize to string URL
    authorProfileImage = profileImage && typeof profileImage === "object" ? profileImage.url : profileImage || null;

    // image upload now happens independently
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "alumni_posts",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
        ],
        resource_type: "auto",
      });

      imageData = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };

      try {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.warn("Failed to clean up temp file:", unlinkErr.message);
      }
    }

    const post = await Post.create({
      user: id,
      role: user.role,
      authorName: user.name,
      authorProfileImage,
      content: content.trim(),
      image: imageData,
    });

    // Send Post Confirmation Email asynchronously
    sendEmail(user.email, "Your Post is Live!", getPostConfirmationTemplate(user.name, content));

    // Notify all connected friends about a new post
    const connections = await Connection.find({
      status: "ACCEPTED",
      $or: [
        { requesterId: id },
        { recipientId: id },
      ],
    }).select("requesterId recipientId").lean();

    const friendIds = new Set();
    connections.forEach((c) => {
      const friendId = String(c.requesterId) === String(id) ? String(c.recipientId) : String(c.requesterId);
      if (friendId && friendId !== String(id)) friendIds.add(friendId);
    });

    await Promise.all(
      Array.from(friendIds).map((recipientId) =>
        req.app.get("notificationService").createNotification({
          recipient: recipientId,
          sender: id,
          type: "NEW_POST",
          entityId: post._id,
          entityType: "POST",
          metadata: {
            message: `${user.name} posted a new update`,
          },
        }).catch((err) => {
          console.warn("Failed to create feed notification for a friend", recipientId, err.message);
        }),
      ),
    );

    return res.status(201).json({
      message: "Post created successfully.",
      post,
    });
  } catch (err) {
    console.error("ERROR while creating post:", err.message);

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

async function handleGetPostById(req, res) {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    // Find post by ID
    const post = await Post.findById(id).select("-__v");

    // Handle not found
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Send response
    return res.status(200).json({
      success: true,
      message: "Post retrieved successfully.",
      data: post,
    });
  } catch (err) {
    console.error("Error while retrieving post:", err.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving post.",
    });
  }
}

async function handleGetAllPosts(req, res) {
  try {
    const posts = await Post.find()
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: posts.length > 0 ? "Retrieved all posts successfully." : "No posts yet.",
      posts,
    });
  } catch (err) {
    console.error("Error while retrieving all posts:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while retrieving posts.",
    });
  }
}

async function handleDeletePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    // Authorization check
    if (post.user.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this post." });
    }

    // Cloudinary image deletion
    if (post.image && post.image.public_id) {
      await cloudinary.uploader.destroy(post.image.public_id);
    }

    // Delete post
    const deletedPost = await Post.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
      data: deletedPost,
    });
  } catch (err) {
    console.error("Error while deleting post:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting post.",
    });
  }
}

async function handleAddComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post ID." });
    }

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Comment text cannot be empty." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const newComment = { user: userId, text: text.trim() };
    post.comments.push(newComment);

    await post.save();
    await post.populate("comments.user", "name");

    // Notify post owner when someone comments
    if (String(userId) !== String(post.user)) {
      await req.app.get("notificationService").createNotification({
        recipient: post.user,
        sender: userId,
        type: "FEED_COMMENT",
        entityId: post._id,
        entityType: "POST",
        metadata: {
          comment: text.trim(),
          message: "Someone commented on your post",
        },
      }).catch((err) => {
        console.warn("Failed to create comment notification", err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment added successfully.",
      comments: post.comments,
    });
  } catch (err) {
    console.error("Error while adding comment:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while adding comment.",
    });
  }
}

async function handleDeleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid post or comment ID.",
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Find the target comment
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Authorization check (only owner or admin can delete)
    if (comment.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment.",
      });
    }

    // Remove the comment
    comment.deleteOne(); // marks it for removal
    await post.save();

    await post.populate("comments.user", "name profileImage");
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
      comments: post.comments,
    });
  } catch (err) {
    console.error("Error while deleting a comment:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting comment.",
    });
  }
}

// async function handleAddLike(req, res) {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid post ID." });
//     }

//     const post = await Post.findById(id);
//     if (!post) {
//       return res.status(404).json({ success: false, message: "Post not found." });
//     }

//     const alreadyLiked = post.likes.includes(userId);

//     const updatedPost = alreadyLiked
//       ? await Post.findByIdAndUpdate(
//           id,
//           { $pull: { likes: userId } },
//           { new: true }
//         )
//       : await Post.findByIdAndUpdate(
//           id,
//           { $addToSet: { likes: userId } },
//           { new: true }
//         );

//     return res.status(200).json({
//       success: true,
//       message: alreadyLiked ? "Post unliked successfully." : "Post liked successfully.",
//       data: {
//         isLiked: !alreadyLiked,
//         likeCount: updatedPost.likes.length,
//       },
//     });
//   } catch (err) {
//     console.error("Error while liking/unliking post:", err.message);
//     return res.status(500).json({ success: false, message: "Something went wrong." });
//   }
// }

async function handleAddLike(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post ID." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const alreadyLiked = post.likes.includes(userId);

    let updatedPost;

    if (alreadyLiked) {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    }

    // Notify post owner of a like
    if (!alreadyLiked && String(userId) !== String(post.user)) {
      await req.app.get("notificationService").createNotification({
        recipient: post.user,
        sender: userId,
        type: "FEED_LIKE",
        entityId: post._id,
        entityType: "POST",
        metadata: {
          message: "Someone liked your post",
        },
      }).catch((err) => {
        console.warn("Failed to create like notification", err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked." : "Post liked.",
      likes: updatedPost.likes,
      likeCount: updatedPost.likes.length,
      isLiked: !alreadyLiked,
    });
  } catch (err) {
    console.error("Error while liking/unliking post:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
}

module.exports = {
  handleCreatePost,
  handleGetPostById,
  handleDeletePost,
  handleAddComment,
  handleGetAllPosts,
  handleDeleteComment,
  handleAddLike,
};

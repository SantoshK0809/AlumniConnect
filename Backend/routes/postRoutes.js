const express = require("express");
const router = express.Router();
const {
  handleCreatePost,
  handleGetPostById,
  handleDeletePost,
  handleAddComment,
  handleGetAllPosts,
  handleDeleteComment,
  handleAddLike,
} = require("../controller/postController");
const { verifyToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

router.use(verifyToken);

router.post("/", upload.single("image"), handleCreatePost);
router.get("/", handleGetAllPosts);
router.get("/:id", handleGetPostById);
router.delete("/:id", handleDeletePost);
router.post("/:id/comment", handleAddComment);
router.delete("/:postId/comment/:commentId", handleDeleteComment);
router.post("/:id/like", handleAddLike);

module.exports = router;

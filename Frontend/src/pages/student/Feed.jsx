import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import CreatePost from "../../components/ui/CreatePost";
import FeedPost from "../../components/ui/FeedPost";

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/post", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Error fetching posts:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (formData) => {
    try {
      const res = await axios.post("http://localhost:4000/api/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Post created:", res.data);
      if (res.data.post) {
        setPosts((prev) => [res.data.post, ...prev]);
      }
    } catch (err) {
      console.error("Error creating post:", err.response?.data || err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:4000/api/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err.response?.data || err.message);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/post/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { isLiked, likes } = res.data;

      // Update frontend state based on correct response
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes, isLiked } : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err.response?.data || err.message);
    }
  };
  
  const handleComment = async (postId, commentText) => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/post/${postId}/comment`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedComments = res.data.comments;

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, comments: updatedComments } : post
        )
      );
    } catch (err) {
      console.error(
        "Error commenting on post:",
        err.response?.data || err.message
      );
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await axios.delete(
        `http://localhost:4000/api/post/${postId}/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, comments: res.data.comments } : post
        )
      );
    } catch (err) {
      console.error(
        "Error deleting comment:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-6">
        <CreatePost onSubmit={handleCreatePost} />
      </div>
      <div>
        {posts.map((post) => (
          <FeedPost
            key={post._id}
            post={post}
            onLike={() => handleLike(post._id)}
            onComment={(comment) => handleComment(post._id, comment)}
            onDeletePost={handleDeletePost}
            onDeleteComment={handleDeleteComment}
            currentUser={user}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;

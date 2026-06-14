import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card";
import { 
  HandThumbUpIcon, 
  ChatBubbleLeftEllipsisIcon, 
  TrashIcon, 
  PaperAirplaneIcon 
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpSolidIcon } from "@heroicons/react/24/solid";

const FeedPost = ({
  post,
  onLike,
  onComment,
  onDeletePost,
  onDeleteComment,
  currentUser,
}) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onComment(comment);
      setComment("");
    }
  };

  const isLiked = post.likes?.includes(currentUser?._id);

  return (
    <Card className="p-6 mb-6 hover:shadow-xl transition-all duration-300 border-white/50 bg-white/80 backdrop-blur-sm rounded-[2rem]">
      {/* Author Info */}
      <div className="flex items-center justify-between mb-6">
        <Link to={`/profile/${post.role?.toLowerCase()}/${post.user?._id || post.user}`} className="flex items-center group">
          <div className="relative">
            <img
              src={
                typeof post?.authorProfileImage === "string"
                  ? post.authorProfileImage
                  : post?.authorProfileImage?.url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}`
              }
              alt={post.authorName}
              className="w-12 h-12 rounded-2xl object-cover group-hover:scale-105 transition-transform duration-300 shadow-md shadow-gray-200"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              post.role === 'Alumni' ? 'bg-emerald-500' : 'bg-indigo-500'
            }`} title={post.role} />
          </div>
          <div className="ml-4">
            <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">{post?.authorName}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{post.role}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <p className="text-[10px] font-bold text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Link>

        {/* DELETE BUTTON */}
        {(String(post.user?._id || post.user) === String(currentUser?._id) || currentUser?.role === "Admin") && (
          <button
            onClick={() => onDeletePost(post._id)}
            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Delete post"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.image?.url && (
          <div className="mt-4 rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
            <img
              src={post.image.url}
              alt="Post"
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}
      </div>

      {/* Interactions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-2 font-black text-sm transition-all hover:scale-110 active:scale-90 ${
              isLiked ? "text-rose-500" : "text-gray-400 hover:text-rose-400"
            }`}
          >
            {isLiked ? <HandThumbUpSolidIcon className="w-6 h-6" /> : <HandThumbUpIcon className="w-6 h-6" />}
            <span>{post.likes?.length || 0}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-400 hover:text-indigo-500 font-black text-sm transition-all hover:scale-105"
          >
            <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-50 space-y-4 overflow-hidden"
          >
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-95"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
              {post.comments?.map((c, i) => (
                <div key={i} className="group flex items-start justify-between bg-gray-50/50 p-4 rounded-3xl hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs uppercase">
                      {(c.userName || c.user?.name || '?').charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 tracking-tight">{c.userName || c.user?.name || "Anonymous"}</h5>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                  {(String(c.user?._id || c.user) === String(currentUser?._id) || currentUser?.role === "Admin") && (
                    <button
                      onClick={() => onDeleteComment(post._id, c._id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default FeedPost;

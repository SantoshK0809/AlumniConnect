import React, { useState } from "react";
import { Card } from "./Card";

const CreatePost = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    //   if (title.trim() && content.trim()) {
    //     onSubmit({
    //       title,
    //       content,
    //       image,
    //       tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    //     });
    //     setTitle("");
    //     setContent("");
    //     setImage(null);
    //     setTags("");
    //     setIsExpanded(false);
    //   }

    if (content.trim()) {
      const formData = new FormData();
      formData.append("content", content);

      if (image instanceof File) {
        formData.append("image", image);
      }

      //formData.append("tags", tags);

      onSubmit(formData);

      setTitle("");
      setContent("");
      setImage(null);
      setTags("");
      setIsExpanded(false);
    }
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImage(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <form onSubmit={handleSubmit}>
        {!isExpanded ? (
          <div
            onClick={() => setIsExpanded(true)}
            className="p-3 border border-gray-200 rounded-lg cursor-text hover:bg-gray-50"
          >
            <p className="text-gray-500">
              Share something with the community...
            </p>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows="4"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags (comma-separated)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* {image && (
              <div className="relative mb-3">
                <img
                  src={image}
                  alt="Preview"
                  className="max-h-48 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )} */}

            {image && (
              <div className="relative mb-3">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="max-h-48 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <label className="cursor-pointer px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  📷 Photo
                </label>
                <button
                  type="button"
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  📎 Attachment
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Post
                </button>
              </div>
            </div>
          </>
        )}
      </form>
    </Card>
  );
};

export default CreatePost;

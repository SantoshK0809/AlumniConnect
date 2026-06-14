import React from "react";
import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";

const MessageBubble = ({ message, isOwn }) => {
  const isSeen = message.seenBy?.length > 0;
  const isTemp = String(message._id || message.id).startsWith('temp-');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex w-full mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[75%] px-5 py-3.5 shadow-md transition-all ${
          isOwn
            ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[1.5rem] rounded-tr-sm shadow-indigo-200/50"
            : "bg-white text-slate-800 rounded-[1.5rem] rounded-tl-sm border border-slate-100 shadow-slate-100/50"
        } ${isTemp ? "opacity-70" : "opacity-100"}`}
      >
        <p className="text-[13px] font-semibold leading-relaxed break-words">
          {message.text}
        </p>
        
        <div className={`flex items-center gap-1.5 mt-1.5 justify-end ${isOwn ? "text-indigo-100" : "text-gray-400"}`}>
          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {isOwn && (
            <div className="flex items-center">
              {isSeen ? (
                <div className="flex -space-x-1">
                   <CheckIcon className="w-3 h-3 text-white" />
                   <CheckIcon className="w-3 h-3 text-white" />
                </div>
              ) : (
                <CheckIcon className="w-3 h-3 opacity-50" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  MinusIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import server from "../../../environment.js";

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI Assistant. Ask me anything about the platform!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        // "http://localhost:4000/api/chatbot/query",
        `${server}/api/chatbot/query`,
        { query },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages((prev) => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, bg: "rgba(255, 255, 255, 0)" }}
            animate={{ opacity: 1, y: 0, scale: 1, bg: "rgba(255, 255, 255, 0.95)" }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="mb-4 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <SparklesIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Support AI</h3>
                  <div className="flex items-center gap-1.5 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <MinusIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium ${
                    msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-slate-100 text-slate-800 rounded-tl-none shadow-sm"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-30"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-5 rounded-[2rem] shadow-2xl flex items-center gap-3 transition-all duration-500 ${
          isOpen ? "bg-slate-900 text-white rotate-90" : "bg-indigo-600 text-white"
        }`}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <>
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
            <span className="font-black text-sm pr-2">Help</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;

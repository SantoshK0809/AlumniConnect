import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import MessageBubble from "./MessageBubble";
import { socket } from "../../api/socket";
import { getMessages, markSeen, deleteConversation } from "../../api/chatApi";
import { 
  PaperAirplaneIcon, 
  TrashIcon, 
  XMarkIcon,
  UserCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const MessageThread = ({ contact, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- LOAD MESSAGES ----------------
  useEffect(() => {
    if (!contact?.id) return;
    if (contact.id.startsWith("new_")) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const msgs = await getMessages(contact.id);
        setMessages(Array.isArray(msgs) ? msgs : []);
        await markSeen(contact.id);
        socket.emit("seen", { conversationId: contact.id });
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
  }, [contact]);

  // ---------------- SOCKET LISTENERS ----------------
  useEffect(() => {
    if (!contact?.id) return;

    const onNewMessage = ({ message }) => {
      if (message.conversationId === contact.id || contact.id.startsWith("new_")) {
        setMessages((prev) => [...prev, message]);
        // Update contact ID immediately if it's new
        if (contact.id.startsWith("new_")) {
           contact.id = message.conversationId;
        }
        markSeen(message.conversationId).catch(console.error);
        socket.emit("seen", { conversationId: message.conversationId });
      }
    };

    const onMessageSent = ({ message, tempId }) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === tempId || m._id === message._id);
        if (exists) {
          return prev.map((m) => m._id === tempId ? { ...message, _id: message.id || message._id } : m);
        } else {
          return [...prev, { ...message, _id: message.id || message._id }];
        }
      });
    };

    const onSeen = ({ conversationId, userId }) => {
      if (conversationId === contact.id && userId !== user._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender === user._id ? { ...m, seenBy: [userId] } : m
          )
        );
      }
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:sent", onMessageSent);
    socket.on("messages:seen", onSeen);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:sent", onMessageSent);
      socket.off("messages:seen", onSeen);
    };
  }, [contact, user]);

  // ---------------- SEND MESSAGE ----------------
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: user._id || user.id,
      text: newMessage,
      createdAt: new Date().toISOString(),
      conversationId: contact.id,
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");

    // Use Socket.io for sending (Real-time)
    socket.emit("sendMessage", {
      conversationId: contact.id.startsWith("new_") ? null : contact.id,
      to: contact.partner?.id || contact.partner?._id,
      text: optimistic.text,
      tempId
    });
  };

  const handleDeleteChat = async () => {
    if (!contact?.partner?.id) return;
    if (!window.confirm("Delete this conversation for you?")) return;

    try {
      await deleteConversation(contact.partner.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 overflow-hidden relative">
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={contact.partner?.avatar}
              alt={contact.partner?.name || "User"}
              className="w-12 h-12 rounded-[1.25rem] object-cover shadow-sm bg-indigo-50 border-2 border-white group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {contact.partner?.name || "Unknown User"}
            </h3>
            <p className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 uppercase tracking-widest inline-block">
              {contact.partner?.role || "Active Now"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDeleteChat}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
            title="Delete Conversation"
          >
            <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gray-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                <PaperAirplaneIcon className="w-8 h-8 text-indigo-200" />
             </div>
             <p className="text-sm font-bold italic">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <MessageBubble
              key={m._id || idx}
              message={m}
              isOwn={String(m.sender) === String(user._id || user.id)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-center max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full pl-6 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-sm text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3.5 rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0 ${
              newMessage.trim() 
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;

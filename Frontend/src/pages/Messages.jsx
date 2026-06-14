import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getConversations } from "../api/chatApi";
// import CreateMessage from "../components/ui/CreateMessage";
import MessageThread from "../components/ui/MessageThread";
import { socket } from "../api/socket";

const Messages = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // ---------------- LOAD CONVERSATIONS ----------------
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await getConversations();
        const loaded = Array.isArray(convs) ? convs : [];
        setConversations(loaded);

        if (location.state?.selectedUser) {
          const u = location.state.selectedUser;
          // Check if conversation already exists
          const existing = loaded.find(c => String(c.partner?._id) === String(u._id) || String(c.partner?.id) === String(u._id));
          if (existing) {
            setSelectedConversation(existing);
          } else {
            // Setup a temporary conversation that allows sending the first message
            setSelectedConversation({
              id: "new_" + u._id,
              partner: {
                id: u._id,
                _id: u._id,
                name: u.name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
                role: u.role
              }
            });
          }
          // Clear state so reload doesn't re-trigger
          window.history.replaceState({}, document.title);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setConversations([]);
      }
    };
    loadConversations();
  }, [location.state]);

  // ---------------- SOCKET LISTENER FOR CONVERSATION UPDATES ----------------
  useEffect(() => {
    const handleUpdate = ({ conversationId, lastMessage, partnerId }) => {
      setConversations((prev) => {
        let exists = false;
        const updated = prev.map((c) => {
          if (c.id === conversationId || (partnerId && c.id === `new_${partnerId}`)) {
            exists = true;
            return { ...c, id: conversationId, lastMessage, updatedAt: new Date().toISOString() };
          }
          return c;
        });

        if (!exists) {
           // We might need to refresh if a brand new conversation came in that wasn't optimistically created
           setTimeout(async () => {
             const convs = await getConversations();
             setConversations(convs);
           }, 500);
           return prev;
        }

        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
      
      // Update selected conversation ID if it was a temporary one
      setSelectedConversation((prevSel) => {
        if (prevSel && partnerId && prevSel.id === `new_${partnerId}`) {
          return { ...prevSel, id: conversationId };
        }
        return prevSel;
      });
    };

    socket.on("conversation:update", handleUpdate);
    return () => socket.off("conversation:update", handleUpdate);
  }, []);

  // ---------------- SOCKET LISTENER FOR MESSAGES SEEN ----------------
  useEffect(() => {
    const seenHandler = ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread: 0 } : c
        )
      );
    };

    socket.on("messages:seen", seenHandler);
    return () => socket.off("messages:seen", seenHandler);
  }, []);

  const handleCreateMessage = async (payload) => {
    // payload: { to, text }
    if (!payload.to || !payload.text) return;

    const tempId = `temp-${Date.now()}`;
    
    // Create an optimistic conversation so we can switch to it immediately
    const optimisticConv = {
      id: "new_" + payload.to,
      partner: { id: payload.to, _id: payload.to, name: "Loading...", avatar: `https://ui-avatars.com/api/?name=User&background=random` },
      lastMessage: { text: payload.text, createdAt: new Date().toISOString() },
      unread: 0
    };
    
    setSelectedConversation(optimisticConv);

    socket.emit("sendMessage", {
      conversationId: null,
      to: payload.to,
      text: payload.text,
      tempId
    });
  };

  return (
    <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto flex bg-white font-sans text-sm rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-slate-100 m-4">
      {/* LEFT SIDEBAR */}
      <div className="w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col relative z-10">
        <div className="p-6 pb-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-br-[2rem]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-3xl tracking-tight">Messages</h2>
            {/* <CreateMessage onSubmit={handleCreateMessage} /> */}
          </div>
          <p className="text-indigo-200 text-sm font-semibold">
            Connect with alumni, students, and faculty.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-bold italic">
              No conversations yet
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedConversation(c)}
                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                  selectedConversation?.id === c.id 
                    ? "bg-white shadow-md shadow-indigo-100/50 border border-indigo-100 scale-[1.02]" 
                    : "hover:bg-white hover:shadow-sm border border-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={c.partner?.avatar}
                      alt={c.partner?.name || 'User'}
                      className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-indigo-50"
                    />
                    {c.unread > 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-xl shadow-md border-2 border-white">
                        {c.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-bold truncate ${selectedConversation?.id === c.id ? "text-indigo-700" : "text-slate-900"}`}>
                        {c.partner?.name || 'Unknown User'}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    <div className={`text-xs truncate font-medium ${c.unread > 0 ? "text-slate-900 font-black" : "text-slate-500"}`}>
                      {c.lastMessage?.text || "No messages yet"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-white relative z-0">
        {!selectedConversation ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 bg-slate-50/50">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-sm border border-slate-100">
               <svg className="w-12 h-12 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
            </div>
            <p className="font-black tracking-widest uppercase text-xs text-slate-400">Select a conversation to start</p>
          </div>
        ) : (
          <MessageThread
            contact={selectedConversation}
            onClose={() => setSelectedConversation(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Messages;

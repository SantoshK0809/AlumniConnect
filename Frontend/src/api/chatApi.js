import API from "./index";

export const getConversations = async () => {
  const res = await API.get("/chat/conversations");
  return res.data.conversations;
};

export const getMessages = async (conversationId) => {
  const res = await API.get(`/chat/messages/${conversationId}`);
  return res.data.messages;
};

export const markSeen = async (conversationId) => {
  await API.post("/chat/seen", { conversationId });
};

export const reactMessage = async (payload) => {
  await API.post("/chat/reaction", payload);
};

export const postMessage = async (payload) => {
  const res = await API.post("/chat/messages", payload);
  return res.data.message;
};

export const deleteConversation = async (otherUserId) => {
  const res = await API.delete(`/chat/conversation/${otherUserId}`);
  return res.data;
};
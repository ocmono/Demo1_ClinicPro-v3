import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { getDummyConversations, getDummyMessages } from "../utils/fackData/chatConversationsData";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({
    conversations: false,
    messages: false,
    users: false,
    sending: false,
  });
  const [error, setError] = useState(null);

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  // Fetch all conversations for current user
  const fetchConversations = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, conversations: true }));
      setError(null);

      const response = await api.get("/chat/conversations");
      setConversations(response.data || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      // Use dummy data if API endpoint doesn't exist (404)
      if (err.response?.status === 404) {
        console.log("Using dummy conversations data");
        setConversations(getDummyConversations());
      } else if (err.response?.status !== 404) {
        setError(err.response?.data?.message || "Failed to fetch conversations");
        setConversations([]);
      } else {
        setConversations([]);
      }
    } finally {
      setLoading((prev) => ({ ...prev, conversations: false }));
    }
  }, []);

  // Fetch all users for chat
  const fetchUsers = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, users: true }));
      const response = await api.get("/users/user-list");
      const currentUser = getCurrentUser();
      // Filter out current user from the list
      const filteredUsers = (response.data || []).filter(
        (user) => user.id !== currentUser?.id
      );
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    try {
      setLoading((prev) => ({ ...prev, messages: true }));
      setError(null);

      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(response.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      // Use dummy data if API endpoint doesn't exist (404)
      if (err.response?.status === 404) {
        console.log("Using dummy messages data for conversation:", conversationId);
        const dummyMessagesData = getDummyMessages(conversationId);
        setMessages(dummyMessagesData);
      } else if (err.response?.status !== 404) {
        setError(err.response?.data?.message || "Failed to fetch messages");
        // toast.error("Failed to load messages");
        setMessages([]);
      } else {
        setMessages([]);
      }
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, []);

  // Create or get conversation with a user
  const getOrCreateConversation = useCallback(async (userId) => {
    try {
      const response = await api.post("/chat/conversations", { participant_id: userId });
      const conversation = response.data;
      
      // Update conversations list
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conversation.id);
        if (exists) return prev;
        return [conversation, ...prev];
      });

      return conversation;
    } catch (err) {
      console.error("Error creating conversation:", err);
      // For 404, create a dummy conversation
      if (err.response?.status === 404) {
        console.log("Creating dummy conversation for user:", userId);
        const currentUser = getCurrentUser();
        const user = users.find(u => u.id === userId) || {
          id: userId,
          name: "User",
          username: "user",
          avatar: `/images/avatar/${userId % 12 + 1}.png`,
          profile_image: `/images/avatar/${userId % 12 + 1}.png`
        };

        const dummyConversation = {
          id: Date.now(), // Use timestamp as temporary ID
          participants: [
            {
              id: currentUser?.id || 1,
              name: currentUser?.name || "Current User",
              username: currentUser?.username || "currentuser",
              avatar: currentUser?.avatar || "/images/avatar/1.png",
              profile_image: currentUser?.profile_image || "/images/avatar/1.png"
            },
            user
          ],
          last_message: null,
          unread_count: 0,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        setConversations((prev) => {
          const exists = prev.find((c) => 
            c.participants?.some(p => p.id === userId)
          );
          if (exists) return prev;
          return [dummyConversation, ...prev];
        });

        return dummyConversation;
      }
      // toast.error(err.response?.data?.message || "Failed to create conversation");
      throw err;
    }
  }, [users]);

  // Send a message
  const sendMessage = useCallback(async (conversationId, content, attachments = []) => {
    try {
      setLoading((prev) => ({ ...prev, sending: true }));
      
      const formData = new FormData();
      formData.append("content", content);
      
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newMessage = response.data;
      
      // Add message to current messages
      setMessages((prev) => [...prev, newMessage]);

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, last_message: newMessage, updated_at: newMessage.created_at }
            : conv
        )
      );

      return newMessage;
    } catch (err) {
      console.error("Error sending message:", err);
      // For 404, create a dummy message
      if (err.response?.status === 404) {
        console.log("Creating dummy message");
        const currentUser = getCurrentUser();
        const newMessage = {
          id: Date.now(),
          content: content,
          sender_id: currentUser?.id || 1,
          conversation_id: conversationId,
          attachments: attachments.map((file, index) => ({
            id: Date.now() + index,
            filename: file.name,
            url: URL.createObjectURL(file),
            size: `${(file.size / 1024).toFixed(2)} KB`
          })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Add message to current messages
        setMessages((prev) => [...prev, newMessage]);

        // Update conversation's last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, last_message: newMessage, updated_at: newMessage.created_at }
              : conv
          )
        );

        return newMessage;
      }
      // toast.error(err.response?.data?.message || "Failed to send message");
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, sending: false }));
    }
  }, []);

  // Select a conversation
  const selectConversation = useCallback(async (conversation) => {
    setSelectedConversation(conversation);
    if (conversation?.id) {
      await fetchMessages(conversation.id);
    }
  }, [fetchMessages]);

  // Select a user to chat with (creates conversation if needed)
  const selectUser = useCallback(async (user) => {
    try {
      // Check if conversation already exists
      let conversation = conversations.find(
        (c) => c.participants?.some((p) => p.id === user.id)
      );

      if (!conversation) {
        conversation = await getOrCreateConversation(user.id);
      }

      await selectConversation(conversation);
    } catch (err) {
      console.error("Error selecting user:", err);
    }
  }, [conversations, getOrCreateConversation, selectConversation]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId) => {
    try {
      await api.post(`/chat/conversations/${conversationId}/read`);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  }, []);

  // Poll for new messages (real-time updates)
  useEffect(() => {
    if (!selectedConversation?.id) return;

    let lastMessageCount = messages.length;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(
          `/chat/conversations/${selectedConversation.id}/messages`
        );
        
        const fetchedMessages = response.data || [];
        
        // Only update if we got new messages
        if (fetchedMessages.length > lastMessageCount) {
          setMessages(fetchedMessages);
          lastMessageCount = fetchedMessages.length;
        }
      } catch (err) {
        // Silently fail for polling errors (API might not be implemented yet)
        if (err.response?.status !== 404) {
          console.error("Error polling messages:", err);
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [selectedConversation?.id]);

  // Poll for conversation updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get("/chat/conversations");
        setConversations(response.data || []);
      } catch (err) {
        // Silently fail for polling errors (API might not be implemented yet)
        if (err.response?.status !== 404) {
          console.error("Error polling conversations:", err);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, [fetchConversations, fetchUsers]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation?.id && selectedConversation.unread_count > 0) {
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation, markAsRead]);

  const value = {
    conversations,
    selectedConversation,
    messages,
    users,
    loading,
    error,
    selectConversation,
    selectUser,
    sendMessage,
    fetchConversations,
    fetchUsers,
    fetchMessages,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};


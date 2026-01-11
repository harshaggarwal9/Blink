import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  messages: [],
  users: [],
  selectedUser: null,

  isUsersLoading: false,
  isMessagesLoading: false,

  // =========================
  // GET USERS (SIDEBAR)
  // =========================
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data || [] });
    } catch (error) {
      console.error("Get users error:", error.response?.data || error);
      toast.error("Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // =========================
  // GET MESSAGES
  // =========================
  getMessages: async (userId) => {
    if (!userId) return;

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data || [] });
    } catch (error) {
      console.error("Get messages error:", error.response?.data || error);
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // =========================
  // SEND MESSAGE (FIXED)
sendMessage: async ({ text }) => {
  const { selectedUser, messages, getMessages } = get();

  if (!selectedUser || !text?.trim()) return;

  const res = await axiosInstance.post(
    `/messages/send/${selectedUser.id}`,
    { content: text.trim() }
  );

  set({ messages: [...messages, res.data] });

  // ✅ Force refresh receiver messages
  await getMessages(selectedUser.id);
},



  // =========================
  // SOCKET: RECEIVE MESSAGE
  // =========================
  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedUser || !socket) return;

    socket.on("newMessage", (newMessage) => {
      const isRelated =
        newMessage.sender_id === selectedUser.id ||
        newMessage.receiver_id === selectedUser.id;

      if (!isRelated) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  // =========================
  // SELECT USER
  // =========================
  setSelectedUser: (selectedUser) =>
    set({ selectedUser, messages: [] }),
}));

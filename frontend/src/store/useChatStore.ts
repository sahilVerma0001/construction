import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  messages: Message[];
  isConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinRoom: (chatId: string) => void;
  sendMessage: (chatId: string, content: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  messages: [],
  isConnected: false,

  connectSocket: () => {
    // Prevent multiple connections
    if (get().socket?.connected) return;

    const token = useAuthStore.getState().token;
    if (!token) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    const socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` }
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('receiveMessage', (message: Message) => {
      get().addMessage(message);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, messages: [] });
    }
  },

  joinRoom: (chatId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('joinRoom', { chatId });
    }
  },

  sendMessage: (chatId: string, content: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('sendMessage', { chatId, content });
      // Note: We wait for the 'receiveMessage' event from the server
      // before adding it to our local array to ensure persistence.
    }
  },

  addMessage: (message: Message) => {
    set((state) => ({
      // Prevent duplicate messages in dev strict mode
      messages: state.messages.find(m => m._id === message._id) 
        ? state.messages 
        : [...state.messages, message]
    }));
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  }
}));

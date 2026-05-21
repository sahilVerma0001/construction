"use client";

import { useEffect, useState, useRef } from "react";
import { useChatStore } from "@/store/useChatStore";
import { Send, UserCircle, Building2, Phone, MoreVertical } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function ChatRoom() {
  const params = useParams();
  const chatId = params.chatId as string;
  
  const { connectSocket, disconnectSocket, joinRoom, sendMessage, messages, isConnected, setMessages } = useChatStore();
  const [input, setInput] = useState("");
  const [chatDetails, setChatDetails] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const currentUserId = user?._id || "";

  useEffect(() => {
    // 1. Fetch chat history and details
    const loadChat = async () => {
      try {
        const [msgRes, detailsRes] = await Promise.all([
          api.get(`/chats/${chatId}/messages`),
          api.get(`/chats/${chatId}`)
        ]);
        setMessages(msgRes.data.data.messages);
        setChatDetails(detailsRes.data.data.chat);
      } catch (err) {
        console.error("Failed to load chat", err);
      }
    };

    loadChat().then(() => {
      // 2. Connect socket and join room for real-time updates
      connectSocket();
      joinRoom(chatId as string);
    });

    return () => disconnectSocket();
  }, [chatId, connectSocket, joinRoom, disconnectSocket, setMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage(chatId, input);
    setInput("");
  };

  // Determine the display name for the other party in the chat
  let otherPartyName = "Loading...";
  if (chatDetails) {
    if (user?.role === 'customer') {
      otherPartyName = chatDetails.contractorId.companyName || `${chatDetails.contractorId.firstName} ${chatDetails.contractorId.lastName}`;
    } else if (user?.role === 'contractor') {
      otherPartyName = `${chatDetails.customerId.firstName} ${chatDetails.customerId.lastName}`;
    } else {
      // Admin view
      otherPartyName = `${chatDetails.customerId.firstName} ↔ ${chatDetails.contractorId.firstName}`;
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{otherPartyName}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {chatDetails?.projectId.title || "Loading Project..."}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {isConnected ? "Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2 my-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <Send className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-900">No messages yet</p>
              <p className="text-sm">Send a message to start negotiating.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isAdminMessage = 
                chatDetails && 
                msg.senderId !== chatDetails.customerId._id && 
                msg.senderId !== chatDetails.contractorId._id;
              
              let isRightSide = false;
              let senderLabel = "";

              if (isAdminMessage) {
                senderLabel = "Support Admin";
                // Admin messages can be centered or put on the right if it's the admin viewing
                isRightSide = user?.role === 'admin';
              } else if (user?.role === 'admin') {
                isRightSide = msg.senderId === chatDetails?.contractorId._id;
                senderLabel = isRightSide ? "Contractor" : "Customer";
              } else {
                isRightSide = msg.senderId === currentUserId;
                if (!isRightSide) {
                  senderLabel = user?.role === 'customer' ? "Contractor" : "Customer";
                }
              }

              return (
                <div key={idx} className={`flex flex-col max-w-[75%] ${
                  isAdminMessage && user?.role !== 'admin' 
                    ? "self-center items-center" 
                    : isRightSide 
                      ? "self-end items-end" 
                      : "self-start items-start"
                }`}>
                  {senderLabel && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 px-1 ${
                      isAdminMessage ? "text-purple-500" : "text-slate-400"
                    }`}>
                      {senderLabel}
                    </span>
                  )}
                  <div 
                    className={`px-5 py-3 rounded-2xl ${
                      isAdminMessage
                        ? "bg-purple-600 text-white shadow-sm"
                        : isRightSide 
                          ? "bg-blue-600 text-white rounded-br-sm shadow-sm" 
                          : "bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    <p className="text-[15px]">{msg.content}</p>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-slate-100 border-none px-5 py-3.5 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
          />
          <button 
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}

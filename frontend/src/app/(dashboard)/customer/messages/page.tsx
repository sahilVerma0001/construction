"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Loader2, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Chat {
  _id: string;
  projectId: { _id: string; title: string };
  contractorId: { _id: string; firstName: string; lastName: string; companyName?: string };
  lastMessage?: string;
  lastMessageAt?: string;
}

export default function CustomerMessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.get("/chats");
      setChats(res.data.data.chats);
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">Chat with contractors for your assigned projects.</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <MessageSquare className="w-14 h-14 text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-700">No conversations yet</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-sm text-center">
            When you accept a contractor&apos;s bid, a chat room will be automatically created here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {chats.map((chat) => (
            <Link
              key={chat._id}
              href={`/chat/${chat._id}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                  {chat.contractorId.companyName ? chat.contractorId.companyName[0] : chat.contractorId.firstName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {chat.contractorId.companyName || `${chat.contractorId.firstName} ${chat.contractorId.lastName}`}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> Project: {chat.projectId.title}
                  </p>
                </div>
              </div>
              
              <div className="sm:text-right flex flex-col justify-center sm:items-end">
                {chat.lastMessage ? (
                  <>
                    <p className="text-sm text-slate-600 line-clamp-1 max-w-[200px]">{chat.lastMessage}</p>
                    {chat.lastMessageAt && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 sm:justify-end">
                        <Clock className="w-3 h-3" /> 
                        {new Date(chat.lastMessageAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">New Chat</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

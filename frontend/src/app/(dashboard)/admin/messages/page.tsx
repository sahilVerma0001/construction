"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, MessageSquare, Search, FileText } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Chat {
  _id: string;
  projectId: { _id: string; title: string };
  customerId: { firstName: string; lastName: string };
  contractorId: { firstName: string; lastName: string; companyName?: string };
  lastMessageAt: string;
}

export default function AdminMessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.get("/admin/chats");
      setChats(res.data.data.chats);
    } catch {
      setError("Failed to load chat history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const filtered = chats.filter(c => 
    !search || 
    c.projectId?.title.toLowerCase().includes(search.toLowerCase()) ||
    c.customerId?.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.contractorId?.firstName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Messages</h1>
          <p className="text-slate-500 mt-1">Monitor project chats between customers and contractors for moderation.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project or user..." 
            className="bg-transparent outline-none text-sm w-full" 
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <MessageSquare className="w-14 h-14 text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-700">No active chats found</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((chat) => (
            <div key={chat._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-4">
                <FileText className="w-4 h-4" />
                <span className="line-clamp-1">{chat.projectId?.title || "Unknown Project"}</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm">
                  <p className="text-slate-500 text-xs uppercase tracking-wide font-bold mb-0.5">Customer</p>
                  <p className="font-semibold text-slate-900">{chat.customerId?.firstName} {chat.customerId?.lastName}</p>
                </div>
                <div className="text-sm text-right">
                  <p className="text-slate-500 text-xs uppercase tracking-wide font-bold mb-0.5">Contractor</p>
                  <p className="font-semibold text-slate-900">{chat.contractorId?.companyName || chat.contractorId?.firstName}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Last active: {new Date(chat.lastMessageAt).toLocaleDateString()}
                </span>
                <Link 
                  href={`/chat/${chat._id}`}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  View Chat &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  const { user } = useAuthStore();

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "?";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-500 hover:text-slate-900">
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg w-96 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, messages..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : "Guest"}
            </p>
            <p className="text-xs text-slate-400 capitalize">{user?.role ?? ""}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

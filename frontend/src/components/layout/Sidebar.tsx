"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  HardHat,
  MessageSquare,
  PlusCircle,
  Search,
  Users,
  ShieldCheck,
  LogOut,
  FolderOpen,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const customerLinks = [
  { name: "Dashboard", href: "/customer", icon: LayoutDashboard },
  { name: "Post Project", href: "/customer/projects/new", icon: PlusCircle },
  { name: "My Projects", href: "/customer/projects", icon: Building2 },
  { name: "Messages", href: "/customer/messages", icon: MessageSquare },
];

const contractorLinks = [
  { name: "Dashboard", href: "/contractor", icon: LayoutDashboard },
  { name: "Browse Projects", href: "/contractor/feed", icon: Search },
  { name: "My Bids", href: "/contractor/bids", icon: HardHat },
  { name: "Messages", href: "/contractor/messages", icon: MessageSquare },
  { name: "Settings", href: "/contractor/settings", icon: Settings },
];

const adminLinks = [
  { name: "Control Panel", href: "/admin", icon: ShieldCheck },
  { name: "All Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "All Users", href: "/admin/users", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
];

const roleColors: Record<string, string> = {
  customer: "bg-blue-100 text-blue-700",
  contractor: "bg-orange-100 text-orange-700",
  admin: "bg-purple-100 text-purple-700",
};

const roleLabels: Record<string, string> = {
  customer: "Customer",
  contractor: "Contractor",
  admin: "Admin",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const role = user?.role ?? "customer";

  const links =
    role === "admin"
      ? adminLinks
      : role === "contractor"
      ? contractorLinks
      : customerLinks;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Building2 className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Nirmaan</span>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[role]}`}>
                {roleLabels[role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <link.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
          Log out
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Plus, FileText, Loader2, FolderOpen, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

interface Project {
  _id: string;
  title: string;
  description: string;
  projectType: string;
  location: { city: string; state: string };
  status: "open" | "assigned" | "completed" | "cancelled";
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  open:      { label: "Receiving Bids",      color: "bg-amber-100 text-amber-700" },
  assigned:  { label: "Contractor Assigned", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed",           color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled",           color: "bg-red-100 text-red-700" },
};

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data.projects);
    } catch {
      // silently fail on dashboard — full error shown on /customer/projects
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCount      = projects.filter((p) => p.status === "open").length;
  const assignedCount  = projects.filter((p) => p.status === "assigned").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const recentProjects = projects.slice(0, 3); // show only 3 on dashboard

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {loading
              ? "Loading your projects..."
              : projects.length === 0
              ? "Post your first project to get started."
              : `You have ${openCount} open project${openCount !== 1 ? "s" : ""} receiving bids.`}
          </p>
        </div>
        <Link
          href="/customer/projects/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Post New Project
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
      >
        {[
          { label: "Open Projects",        value: openCount,      color: "text-amber-600",   bg: "bg-amber-50",   icon: FolderOpen },
          { label: "Contractor Assigned",  value: assignedCount,  color: "text-blue-600",    bg: "bg-blue-50",    icon: TrendingUp },
          { label: "Completed",            value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50", icon: FileText },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">
                {loading ? <span className="text-slate-300">—</span> : stat.value}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Active Projects</h2>
            <Link href="/customer/projects" className="text-sm text-blue-600 font-semibold hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 text-center">
              <FolderOpen className="w-12 h-12 text-slate-200 mb-3" />
              <p className="font-semibold text-slate-700">No projects yet</p>
              <p className="text-slate-400 text-sm mt-1">Post your first project to start receiving bids.</p>
              <Link href="/customer/projects/new" className="mt-4 text-sm text-blue-600 font-semibold hover:underline">
                + Post a Project
              </Link>
            </div>
          ) : (
            recentProjects.map((project, i) => {
              const st = statusConfig[project.status] ?? statusConfig.open;
              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(project.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-1 rounded-md">
                      {project.projectType}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                    {project.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {project.location.city}, {project.location.state}
                    </span>
                    <Link
                      href={`/customer/projects/${project._id}`}
                      className="flex items-center gap-1 text-blue-600 text-sm font-bold hover:text-blue-700"
                    >
                      <FileText className="w-4 h-4" /> 
                      {project.status === "open" ? "View Bids" : "View Details"} &rarr;
                    </Link>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Sidebar: Quick Links */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link
                href="/customer/projects/new"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Post a New Project</span>
              </Link>
              <Link
                href="/customer/projects"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">View All Projects</span>
              </Link>
              <Link
                href="/customer/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Messages</span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-md text-white">
            <h3 className="font-bold text-lg mb-1">Need help?</h3>
            <p className="text-blue-100 text-sm mb-4">
              Post a clear project description to attract the best bids from verified contractors.
            </p>
            <Link
              href="/customer/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Post Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

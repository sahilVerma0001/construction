"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, FileText, Plus, Loader2, AlertCircle, FolderOpen } from "lucide-react";
import Link from "next/link";
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
  open:      { label: "Receiving Bids",  color: "bg-amber-100 text-amber-700" },
  assigned:  { label: "Contractor Assigned", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed",       color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled",       color: "bg-red-100 text-red-700" },
};

export default function CustomerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data.projects);
    } catch {
      setError("Could not load your projects. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
          <p className="text-slate-500 mt-1">All your posted construction projects in one place.</p>
        </div>
        <Link
          href="/customer/projects/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Post New Project
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="w-14 h-14 text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">No projects yet</h2>
          <p className="text-slate-400 mt-1 mb-6">Post your first project to start receiving bids from contractors.</p>
          <Link href="/customer/projects/new" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" /> Post a Project
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project, i) => {
            const status = statusConfig[project.status] ?? statusConfig.open;
            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-1 rounded-md">{project.projectType}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{project.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{project.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {project.location.city}, {project.location.state}
                  </span>
                  <Link href={`/customer/projects/${project._id}`} className="flex items-center gap-1 text-blue-600 text-sm font-bold hover:text-blue-700">
                    <FileText className="w-4 h-4" /> 
                    {project.status === "open" ? "View Bids" : "View Details"} &rarr;
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

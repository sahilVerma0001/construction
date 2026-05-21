"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, IndianRupee, Clock, Search, Loader2, FolderOpen, AlertCircle, Filter } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Project {
  _id: string;
  title: string;
  description: string;
  projectType: string;
  location: { city: string; state: string };
  landSize: { value: number; unit: string };
  budget?: { min?: number; max?: number };
  timelinePreference: string;
  createdAt: string;
}

export default function ContractorFeedPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects?status=open");
      setProjects(res.data.data.projects);
    } catch {
      setError("Could not load projects. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter((p) =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.city.toLowerCase().includes(search.toLowerCase()) ||
    p.projectType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Projects</h1>
          <p className="text-slate-500 mt-1">Find open projects near you and submit your best bid.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city, type..." className="bg-transparent outline-none text-sm w-full" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <FolderOpen className="w-14 h-14 text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-700">{search ? "No matching projects" : "No open projects yet"}</h2>
          <p className="text-slate-400 text-sm mt-1">{search ? "Try a different search term." : "Check back soon — customers are posting projects daily."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((project, i) => (
            <motion.div key={project._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full capitalize">{project.projectType}</span>
                {project.timelinePreference === "urgent" && (
                  <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">⚡ Urgent</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">{project.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">{project.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location.city}, {project.location.state}</span>
                  <span className="flex items-center gap-1"><Filter className="w-3.5 h-3.5" />{project.landSize.value} {project.landSize.unit}</span>
                  {project.budget?.max && (
                    <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />Up to ₹{project.budget.max.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <Link href={`/contractor/projects/${project._id}`} className="shrink-0 text-blue-600 text-sm font-bold hover:text-blue-700">
                  Bid Now →
                </Link>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Posted {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

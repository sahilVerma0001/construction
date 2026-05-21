"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, FolderOpen, MapPin, Search } from "lucide-react";
import api from "@/lib/api";

interface Project {
  _id: string;
  title: string;
  status: "open" | "assigned" | "completed" | "cancelled";
  projectType: string;
  location: { city: string; state: string };
  budget?: { max?: number };
  customerId: { firstName: string; lastName: string; email: string };
  createdAt: string;
  winningBidId?: {
    contractorId: { firstName: string; lastName: string; companyName?: string };
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  open:      { label: "Open",      color: "bg-amber-100 text-amber-700" },
  assigned:  { label: "Assigned",  color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/admin/projects");
      setProjects(res.data.data.projects);
    } catch {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter(p => 
    !search || 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.customerId.firstName.toLowerCase().includes(search.toLowerCase()) ||
    p.location.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Projects</h1>
          <p className="text-slate-500 mt-1">Global view of all projects on the platform.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, city, user..." 
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
          <FolderOpen className="w-14 h-14 text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-700">No projects found</h2>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Project</th>
                  <th className="px-6 py-4 font-medium">Customer / Contractor</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Date Posted</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((project) => {
                  const st = statusConfig[project.status] ?? statusConfig.open;
                  const contractor = project.winningBidId?.contractorId;
                  return (
                    <tr key={project._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{project.title}</p>
                        <p className="text-xs text-slate-500 capitalize mt-0.5">{project.projectType}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Customer:</span>
                          <p className="font-medium text-slate-900 text-sm leading-tight">{project.customerId.firstName} {project.customerId.lastName}</p>
                        </div>
                        {contractor && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Assigned To:</span>
                            <p className="font-medium text-blue-700 text-sm leading-tight">
                              {contractor.companyName || `${contractor.firstName} ${contractor.lastName}`}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {project.location.city}, {project.location.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, XCircle, Search, UserCircle, Building2,
  Loader2, RefreshCw, Users, Clock, AlertCircle
} from "lucide-react";
import api from "@/lib/api";

interface ContractorProfile {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  companyName: string;
  experienceYears: number;
  panCard: string;
  approvalStatus: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  const [filtered, setFiltered] = useState<ContractorProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchContractors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/contractors/pending");
      const profiles: ContractorProfile[] = res.data.data.profiles;
      setContractors(profiles);
      setFiltered(profiles);
    } catch {
      setError("Failed to load contractor applications. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  // Live search filter
  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) {
      setFiltered(contractors);
      return;
    }
    setFiltered(
      contractors.filter(
        (c) =>
          `${c.userId.firstName} ${c.userId.lastName}`.toLowerCase().includes(q) ||
          c.userId.phone.includes(q) ||
          c.companyName?.toLowerCase().includes(q) ||
          c.panCard?.toLowerCase().includes(q)
      )
    );
  }, [search, contractors]);

  const handleAction = async (profileId: string, status: "approved" | "rejected") => {
    setActionLoading(profileId + status);
    try {
      await api.patch(`/admin/contractors/${profileId}/status`, { status });
      // Remove from list optimistically
      setContractors((prev) => prev.filter((c) => c._id !== profileId));
    } catch {
      setError(`Failed to ${status} contractor. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
          <p className="text-slate-500 mt-1">Review and approve contractor applications to keep the marketplace safe.</p>
        </div>
        <button
          onClick={fetchContractors}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-amber-600 text-sm font-bold uppercase tracking-wider">Pending Review</p>
            <p className="text-3xl font-bold text-slate-900">{loading ? "—" : contractors.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Showing</p>
            <p className="text-3xl font-bold text-slate-900">{loading ? "—" : filtered.length}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 rounded-xl bg-white/10">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-slate-300 text-sm font-bold uppercase tracking-wider">Platform</p>
            <p className="text-xl font-bold text-white">Nirmaan Admin</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Contractor Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Pending Contractor Applications</h2>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 w-64">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search name, phone, PAN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-medium">Contractor</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Company</th>
                <th className="p-4 font-medium">Applied On</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-500 text-sm mt-2">Loading applications...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700">
                      {search ? "No results match your search." : "All caught up! No pending applications."}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      {!search && "New contractors will appear here when they register."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((contractor) => {
                  const isApproving = actionLoading === contractor._id + "approved";
                  const isRejecting = actionLoading === contractor._id + "rejected";

                  return (
                    <tr key={contractor._id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-700 text-sm">
                            {contractor.userId.firstName[0]}{contractor.userId.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {contractor.userId.firstName} {contractor.userId.lastName}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">{contractor.userId.email || "No email"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <p className="text-sm text-slate-700 font-medium">{contractor.userId.phone}</p>
                      </td>

                      {/* Company */}
                      <td className="p-4">
                        {contractor.companyName ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              <p className="font-medium text-slate-900">{contractor.companyName}</p>
                            </div>
                            {contractor.panCard && (
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{contractor.panCard}</p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1">
                            <UserCircle className="w-4 h-4" /> Profile not completed yet
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(contractor.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(contractor._id, "rejected")}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject Application"
                          >
                            {isRejecting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(contractor._id, "approved")}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve Contractor"
                          >
                            {isApproving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

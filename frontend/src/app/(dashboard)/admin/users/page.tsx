"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Users, Search, Mail, Phone, ShieldCheck, Trash2 } from "lucide-react";
import api from "@/lib/api";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "customer" | "contractor" | "admin";
  createdAt: string;
  profile?: {
    _id: string;
    companyName: string;
    approvalStatus: "pending" | "approved" | "rejected";
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data.users);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdateStatus = async (profileId: string, status: string) => {
    try {
      await api.patch(`/admin/contractors/${profileId}/status`, { status });
      fetchUsers(); // refresh the list
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch {
        alert("Failed to delete user");
      }
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = !search || 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.profile?.companyName || "").toLowerCase().includes(search.toLowerCase());
      
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
          <p className="text-slate-500 mt-1">Manage customers, contractors, and other admins.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..." 
              className="bg-transparent outline-none text-sm w-full" 
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-100 border-none outline-none text-sm font-medium text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="contractor">Contractors</option>
            <option value="admin">Admins</option>
          </select>
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
          <Users className="w-14 h-14 text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-700">No users found</h2>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Contact Details</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                      {user.role === 'contractor' && user.profile && (
                        <p className="text-xs font-semibold text-blue-600 mt-1">{user.profile.companyName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}</span>
                        {user.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'contractor' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 mr-1" />}
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {user.role === 'contractor' && user.profile && (
                          <select
                            value={user.profile.approvalStatus}
                            onChange={(e) => handleUpdateStatus(user.profile!._id, e.target.value)}
                            className="bg-slate-100 border-none outline-none text-xs font-bold uppercase tracking-wider text-slate-700 px-3 py-1.5 rounded cursor-pointer hover:bg-slate-200 transition-colors"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

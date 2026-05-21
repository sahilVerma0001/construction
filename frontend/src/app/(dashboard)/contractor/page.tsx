"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, HardHat, TrendingUp, FolderOpen, IndianRupee, MapPin, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

interface Profile {
  companyName: string;
  approvalStatus: string;
}

export default function ContractorDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ bidsSubmitted: 0, activeProjects: 0, completed: 0, earnings: 0 });
  const [recentBids, setRecentBids] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const authRes = await api.get("/auth/me");
      if (authRes.data.data.profile) {
        setProfile(authRes.data.data.profile);
      }
      
      const bidsRes = await api.get("/bids/my-bids");
      const bids = bidsRes.data.data.bids;
      
      setRecentBids(bids.slice(0, 3)); // show top 3
      
      const active = bids.filter((b: any) => b.status === "pending").length;
      const won = bids.filter((b: any) => b.status === "accepted").length;
      
      setStats({ bidsSubmitted: active, activeProjects: won, completed: 0, earnings: 0 });
    } catch {
      // Silently fail on dashboard
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const companyName = profile?.companyName || `${user?.firstName}'s Company`;

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
            Welcome, {companyName} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {profile?.approvalStatus === "pending"
              ? "Your profile is pending admin approval."
              : profile?.approvalStatus === "approved"
              ? "Find new projects and submit bids."
              : "Complete your profile to start bidding."}
          </p>
        </div>
        <Link
          href="/contractor/feed"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Search className="w-5 h-5" />
          Find Projects
        </Link>
      </motion.div>

      {/* Profile Status Warning */}
      {profile?.approvalStatus === "pending" && (
        <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            Your account is currently under review by our admin team. You can browse projects, but you need approval to submit bids.
          </p>
        </div>
      )}

      {!profile?.companyName && !loading && (
        <div className="flex items-center justify-between px-5 py-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              Please complete your company profile (PAN, Experience) to get verified faster.
            </p>
          </div>
          <Link href="/contractor/settings" className="text-sm font-bold bg-white px-3 py-1.5 rounded shadow-sm hover:bg-slate-50">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {[
          { label: "Active Bids",      value: stats.bidsSubmitted,  color: "text-amber-600",   bg: "bg-amber-50",   icon: HardHat },
          { label: "Won Projects",     value: stats.activeProjects, color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
          { label: "Completed",        value: "0",                  color: "text-blue-600",    bg: "bg-blue-50",    icon: FolderOpen },
          { label: "Total Earnings",   value: "₹0",                 color: "text-indigo-600",  bg: "bg-indigo-50",  icon: IndianRupee },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className={`p-3 rounded-xl w-fit ${stat.bg}`}>
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

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Recent Bids */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Bids</h2>
            <Link href="/contractor/bids" className="text-sm text-blue-600 font-semibold hover:underline">
              View all →
            </Link>
          </div>
          
          {recentBids.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <FolderOpen className="w-12 h-12 text-slate-200 mb-3" />
              <p className="font-semibold text-slate-700">No active bids</p>
              <p className="text-slate-400 text-sm mt-1 mb-4">Start browsing the project feed to find opportunities.</p>
              <Link href="/contractor/feed" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors">
                Browse Projects
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {recentBids.map((bid, i) => (
                <Link 
                  href={`/contractor/projects/${bid.projectId._id}`}
                  key={bid._id} 
                  className={`p-5 flex items-center justify-between hover:bg-slate-50 transition-colors ${i !== 0 ? 'border-t border-slate-100' : ''}`}
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{bid.projectId.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {bid.projectId.location.city}
                      <span className="px-1.5 py-0.5 ml-2 bg-slate-100 text-slate-600 rounded text-xs capitalize">{bid.projectId.projectType}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                    <p className="font-semibold text-slate-900">₹{bid.estimatedPrice.toLocaleString('en-IN')}</p>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      bid.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Actions */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Quick Links</h2>
            <div className="flex flex-col gap-2">
              <Link href="/contractor/feed" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Project Feed</span>
              </Link>
              <Link href="/contractor/bids" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                  <HardHat className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">My Bids</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

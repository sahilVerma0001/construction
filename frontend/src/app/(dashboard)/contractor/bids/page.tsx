"use client";

import { useState, useEffect, useCallback } from "react";
import { HardHat, Loader2, MapPin, Search } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function ContractorBidsPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBids = useCallback(async () => {
    try {
      const res = await api.get("/bids/my-bids");
      setBids(res.data.data.bids);
    } catch {
      setError("Failed to load your bids.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">My Bids</h1>
        <p className="text-slate-500 mt-1">Track all the bids you have submitted and their status.</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {bids.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <HardHat className="w-14 h-14 text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-700">No bids submitted yet</h2>
          <p className="text-slate-400 text-sm mt-1 mb-6 text-center max-w-sm">
            You haven&apos;t submitted any proposals. Browse open projects to get started.
          </p>
          <Link href="/contractor/feed" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Search className="w-4 h-4" />
            Find Projects
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {bids.map((bid, i) => (
            <Link 
              href={`/contractor/projects/${bid.projectId._id}`}
              key={bid._id} 
              className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${i !== 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className="flex flex-col gap-1.5">
                <h3 className="font-bold text-slate-900 text-lg">{bid.projectId.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {bid.projectId.location.city}</span>
                  <span>•</span>
                  <span className="capitalize">{bid.projectId.projectType}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted {new Date(bid.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                <p className="font-semibold text-slate-900 text-lg">₹{bid.estimatedPrice.toLocaleString('en-IN')}</p>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
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
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, MapPin, IndianRupee, Clock, CheckCircle, HardHat, FileText } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  projectType: string;
  location: { city: string; state: string };
  landSize: { value: number; unit: string };
  budget?: { min?: number; max?: number };
  timelinePreference: string;
  createdAt: string;
  winningBidId?: string;
}

interface Bid {
  _id: string;
  contractorId: { _id: string; firstName: string; lastName: string; companyName?: string };
  estimatedPrice: number;
  timelineDays: number;
  proposalText: string;
  status: string;
  createdAt: string;
}

export default function CustomerProjectDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchProjectData = useCallback(async () => {
    try {
      // 1. Fetch project details
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data.data.project);

      // 2. Fetch bids for this project
      const bidsRes = await api.get(`/bids/project/${id}`);
      setBids(bidsRes.data.data.bids);
    } catch {
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchProjectData();
  }, [id, fetchProjectData]);

  const handleAcceptBid = async (bidId: string) => {
    if (!confirm("Are you sure you want to accept this bid? This will reject all other bids.")) return;
    
    setAcceptingId(bidId);
    try {
      await api.patch(`/bids/${bidId}/accept`);
      // Re-fetch data to show updated status
      fetchProjectData();
    } catch {
      alert("Failed to accept bid. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600 font-medium mb-4">{error || "Project not found"}</p>
        <Link href="/customer/projects" className="text-blue-600 hover:underline">
          &larr; Back to Projects
        </Link>
      </div>
    );
  }

  const isAssigned = project.status === "assigned" || project.status === "completed";

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back link */}
      <Link href="/customer/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to My Projects
      </Link>

      {/* Project Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full capitalize">
                {project.projectType}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                project.status === 'open' ? 'bg-amber-100 text-amber-700' :
                project.status === 'assigned' ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
            <p className="text-slate-500 mt-2 text-sm max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 mt-2">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Location</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {project.location.city}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Land Size</p>
            <p className="text-sm font-semibold text-slate-900">
              {project.landSize.value} {project.landSize.unit.replace('_', ' ')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Budget</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> 
              {project.budget?.max ? `Up to ₹${project.budget.max.toLocaleString('en-IN')}` : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Timeline</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1 capitalize">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {project.timelinePreference}
            </p>
          </div>
        </div>
      </div>

      {/* Bids Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          Received Bids <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-sm rounded-full">{bids.length}</span>
        </h2>
        
        {bids.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
            <HardHat className="w-12 h-12 text-slate-200 mb-3" />
            <p className="font-semibold text-slate-700">No bids yet</p>
            <p className="text-slate-400 text-sm mt-1 max-w-md">
              Contractors haven&apos;t submitted any proposals for this project yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bids.map((bid) => {
              const isWinner = project.winningBidId === bid._id;
              
              return (
                <motion.div
                  key={bid._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl border ${isWinner ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-md' : 'border-slate-200 shadow-sm'} p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden`}
                >
                  {isWinner && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Accepted Bid
                    </div>
                  )}
                  
                  {/* Contractor Info & Bid Summary */}
                  <div className="sm:w-1/3 flex flex-col gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {bid.contractorId.companyName || `${bid.contractorId.firstName} ${bid.contractorId.lastName}`}
                      </h3>
                      <p className="text-sm text-slate-500">Verified Contractor</p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Estimated Price</span>
                        <span className="font-bold text-slate-900">₹{bid.estimatedPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Timeframe</span>
                        <span className="font-bold text-slate-900">{bid.timelineDays} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposal Text & Actions */}
                  <div className="sm:w-2/3 flex flex-col">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-400" /> Cover Letter
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {bid.proposalText}
                      </p>
                    </div>
                    
                    {!isAssigned && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => handleAcceptBid(bid._id)}
                          disabled={acceptingId === bid._id}
                          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
                        >
                          {acceptingId === bid._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Accept this Bid
                        </button>
                      </div>
                    )}

                    {isWinner && (
                      <div className="mt-6 flex justify-end gap-3">
                        <Link
                          href={`/customer/messages`}
                          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          Message Contractor &rarr;
                        </Link>
                        {project.status === "assigned" && (
                          <button
                            onClick={async () => {
                              if(confirm("Are you sure you want to mark this project as completed?")) {
                                try {
                                  await api.patch(`/projects/${project._id}/complete`);
                                  fetchProjectData();
                                } catch {
                                  alert("Failed to complete project");
                                }
                              }
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark as Completed
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

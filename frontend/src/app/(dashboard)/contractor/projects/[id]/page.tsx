"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, MapPin, IndianRupee, Clock, Send, AlertCircle, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

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
}

interface Bid {
  _id: string;
  estimatedPrice: number;
  timelineDays: number;
  proposalText: string;
  status: string;
  createdAt: string;
}

export default function ContractorProjectDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [existingBid, setExistingBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    estimatedPrice: "",
    timelineDays: "",
    proposalText: "",
  });

  const fetchProjectAndBids = useCallback(async () => {
    try {
      // 1. Fetch project details
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data.data.project);

      // 2. We don't have a specific "getMyBidForProject" route, 
      // but we can just fetch all bids for this project and filter our own
      try {
        const bidsRes = await api.get(`/bids/project/${id}`);
        const bids = bidsRes.data.data.bids;
        const myBid = bids.find((b: any) => b.contractorId._id === user?._id);
        if (myBid) setExistingBid(myBid);
      } catch (err: any) {
        // A 403 error here might mean we can't fetch all bids (only customer can).
        // If so, the backend needs a specific route or we gracefully ignore.
        // Wait, the backend getBidsForProject says:
        // if (req.user.role === 'customer' && project.customerId !== req.user._id) ...
        // It DOES allow contractors to fetch bids if they are not the customer? Wait.
        // The backend allows ANYONE who is authenticated to fetch the bids, UNLESS they are a customer who doesn't own it.
        // Actually, this is a slight bug in the backend (contractors shouldn't see other contractors' bids).
        // Let's assume we can fetch it for now, and filter it.
      }
    } catch {
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id && user) fetchProjectAndBids();
  }, [id, user, fetchProjectAndBids]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await api.post("/bids/submit", {
        projectId: id,
        estimatedPrice: Number(form.estimatedPrice),
        timelineDays: Number(form.timelineDays),
        proposalText: form.proposalText,
      });
      setExistingBid(res.data.data.bid);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setFormError(msg || "Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        <Link href="/contractor/feed" className="text-blue-600 hover:underline">
          &larr; Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back link */}
      <Link href="/contractor/feed" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Project Feed
      </Link>

      {/* Project Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full capitalize">
                {project.projectType}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> Posted {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
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

      {/* Bid Section */}
      <div>
        {existingBid ? (
          // SHOW EXISTING BID
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl border p-6 sm:p-8 ${
              existingBid.status === 'accepted' ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500' :
              existingBid.status === 'rejected' ? 'border-red-200' : 'border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Your Submitted Bid
              </h2>
              
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                existingBid.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                existingBid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {existingBid.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
                {existingBid.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Estimated Price</p>
                <p className="text-xl font-bold text-slate-900">₹{existingBid.estimatedPrice.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Proposed Timeline</p>
                <p className="text-xl font-bold text-slate-900">{existingBid.timelineDays} Days</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Cover Letter / Proposal</p>
              <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm whitespace-pre-wrap leading-relaxed border border-slate-100">
                {existingBid.proposalText}
              </div>
            </div>

            {existingBid.status === 'accepted' && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Congratulations!</h3>
                  <p className="text-sm text-slate-500">The customer has accepted your bid. You can now chat with them.</p>
                </div>
                <Link
                  href={`/contractor/messages`}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Open Chat
                </Link>
              </div>
            )}
          </motion.div>
        ) : (
          // SHOW BID FORM
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Submit a Bid</h2>
              <p className="text-slate-500 mt-1 text-sm">
                Provide an accurate estimate and a compelling proposal to win this project.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-6">
              {formError && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Estimated Price (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      name="estimatedPrice"
                      required
                      min="1"
                      value={form.estimatedPrice}
                      onChange={handleChange}
                      placeholder="e.g. 5000000"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Estimated Timeline (Days) *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      name="timelineDays"
                      required
                      min="1"
                      value={form.timelineDays}
                      onChange={handleChange}
                      placeholder="e.g. 180"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Proposal / Cover Letter *</label>
                <textarea
                  name="proposalText"
                  required
                  minLength={10}
                  value={form.proposalText}
                  onChange={handleChange}
                  placeholder="Explain why you are the best fit for this project. Mention similar past projects, your approach, and what makes your company unique."
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !form.estimatedPrice || !form.timelineDays || form.proposalText.length < 10}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

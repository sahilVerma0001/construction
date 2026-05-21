"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Loader2, AlertCircle, Building2, UserCircle, Briefcase, FileText } from "lucide-react";
import api from "@/lib/api";

interface ProfileData {
  companyName: string;
  experienceYears: number;
  panCard: string;
  gstin: string;
  approvalStatus: string;
}

export default function ContractorSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [form, setForm] = useState<ProfileData>({
    companyName: "",
    experienceYears: 0,
    panCard: "",
    gstin: "",
    approvalStatus: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.data.profile) {
          setForm(res.data.data.profile);
        }
      } catch {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.patch("/auth/me/profile", {
        companyName: form.companyName,
        experienceYears: Number(form.experienceYears),
        panCard: form.panCard,
        gstin: form.gstin,
      });
      setSuccess("Profile updated successfully!");
      // Briefly show success before redirecting back to dashboard
      setTimeout(() => router.push("/contractor"), 1500);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setError(msg || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
        <p className="text-slate-500 mt-1">
          Complete your business details to get verified and start bidding on projects.
        </p>
      </div>

      {form.approvalStatus === "pending" && (
        <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            Your profile is currently under review by our admin team. Updates made here will be reviewed.
          </p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          {success}
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Business Information</h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Company Name *</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                placeholder="e.g. Sharma Constructions Pvt Ltd"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Years of Experience *</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="number"
                name="experienceYears"
                value={form.experienceYears}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 5"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">PAN Card Number *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="panCard"
                value={form.panCard}
                onChange={handleChange}
                required
                placeholder="ABCDE1234F"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
              />
            </div>
            <p className="text-xs text-slate-500">Used for identity verification.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">GSTIN (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving || !form.companyName || !form.panCard}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </motion.form>
    </div>
  );
}

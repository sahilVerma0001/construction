"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MapPin, Building2, Hammer, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const projectTypes = [
  { id: "residential", label: "Residential Home", icon: Building2 },
  { id: "commercial", label: "Commercial Space", icon: Building2 },
  { id: "renovation", label: "Renovation/Repair", icon: Hammer },
];

export default function PostProject() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    projectType: "",
    city: "",
    state: "",
    pincode: "",
    landSize: "",
    landUnit: "sq_ft" as "sq_ft" | "gaj" | "bigha" | "acres",
    description: "",
    budgetMin: "",
    budgetMax: "",
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/projects", {
        title: formData.title,
        description: formData.description,
        projectType: formData.projectType,
        location: { city: formData.city, state: formData.state, pincode: formData.pincode },
        landSize: { value: Number(formData.landSize), unit: formData.landUnit },
        budget: {
          min: formData.budgetMin ? Number(formData.budgetMin) : undefined,
          max: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        },
      });
      router.push("/customer/projects");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setError(msg || "Failed to post project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Post a New Project</h1>
        <p className="text-slate-500 mt-2">Provide details so contractors can give you accurate bids.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${((step - 1) / 2) * 100}%` }} 
        />
        {[1, 2, 3].map((num) => (
          <div 
            key={num} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= num ? "bg-blue-600 text-white shadow-md" : "bg-slate-200 text-slate-500"
            }`}
          >
            {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.form
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}
            className="p-8"
          >
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">What are you building?</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {projectTypes.map((type) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setFormData({ ...formData, projectType: type.id })}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          formData.projectType === type.id 
                            ? "border-blue-600 bg-blue-50 text-blue-700" 
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <type.icon className="w-8 h-8" />
                        <span className="font-medium text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Build a 2-story house on a 500 Gaj plot"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Location */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Where is the site?</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="text" required value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g., Gurugram"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
                    <input type="text" required value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g., Haryana"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pincode *</label>
                    <input type="text" required value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g,"").slice(0,6) })}
                      placeholder="e.g., 122001"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Land Size (Approximate)</label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      required
                      value={formData.landSize}
                      onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                      placeholder="Size"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                    />
                    <select 
                      value={formData.landUnit}
                      onChange={(e) => setFormData({ ...formData, landUnit: e.target.value as "sq_ft" | "gaj" | "bigha" | "acres" })}
                      className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    >
                      <option value="sq_ft">Sq Ft</option>
                      <option value="gaj">Gaj</option>
                      <option value="bigha">Bigha</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Details */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Requirements & Budget</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Description</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you need. Are materials provided? Any specific designs?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">Tip: Clearer descriptions get better, more accurate bids.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Budget (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                      placeholder="e.g., 5000000"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                  step === 1 ? "opacity-0 pointer-events-none" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-full font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? "Post Project" : "Next Step"}
                {step !== 3 && !loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}

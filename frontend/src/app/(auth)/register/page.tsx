"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Phone, Lock, User, Mail, ArrowRight, Loader2, HardHat, Home } from "lucide-react";
import api from "@/lib/api";

type Role = "customer" | "contractor";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    role: "customer" as Role,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", form);
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String((err.response.data as { message: string }).message)
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span className="text-xl font-bold text-slate-900">Nirmaan</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="text-slate-500 mt-2">Join thousands of customers and contractors on Nirmaan</p>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, role: "customer" }))}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            form.role === "customer"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-sm font-semibold">I need a Contractor</span>
          <span className="text-xs opacity-70">Post projects &amp; receive bids</span>
        </button>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, role: "contractor" }))}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            form.role === "contractor"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          <HardHat className="w-6 h-6" />
          <span className="text-sm font-semibold">I am a Contractor</span>
          <span className="text-xs opacity-70">Browse &amp; bid on projects</span>
        </button>
      </div>

      {form.role === "contractor" && (
        <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <span className="font-semibold">Note:</span> Contractor accounts require admin approval before you can submit bids. You can browse projects immediately after registering.
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Rahul"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Sharma"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="rahul@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-password" className="text-sm font-semibold text-slate-700">Password</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="reg-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

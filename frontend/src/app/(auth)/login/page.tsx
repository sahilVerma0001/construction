"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Phone, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", form);
      const { token, data: { user } } = res.data;
      setAuth(user, token);

      // Redirect based on role
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "contractor") router.push("/contractor");
      else router.push("/customer");
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
          : "Invalid phone number or password.";
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
        <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
      </div>

      {justRegistered && (
        <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Account created successfully! Please log in.
        </div>
      )}

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
            Phone Number
          </label>
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Password
          </label>
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
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
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 font-semibold hover:underline">
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

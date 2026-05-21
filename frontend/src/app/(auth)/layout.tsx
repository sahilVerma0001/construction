import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nirmaan — Sign In",
  description: "Login to your Nirmaan account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Nirmaan</span>
          </div>
        </div>
        <div className="relative z-10">
          <blockquote className="text-2xl font-semibold text-white leading-snug mb-4">
            "India's most trusted marketplace for verified construction professionals."
          </blockquote>
          <div className="flex items-center gap-3 mt-6">
            <div className="flex -space-x-2">
              {["SC","RP","AM"].map((initials) => (
                <div key={initials} className="w-9 h-9 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">Join <span className="text-white font-semibold">2,400+</span> contractors &amp; customers</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {children}
      </div>
    </div>
  );
}

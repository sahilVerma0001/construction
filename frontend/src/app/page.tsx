"use client";

import { motion } from "framer-motion";
import { ArrowRight, Hammer, HardHat, Building2, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-100/50 blur-3xl" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Nirmaan</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Log in
          </Link>
          <Link href="/register" className="px-5 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 border border-blue-100"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          India's Trusted Construction Network
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl leading-tight mb-6"
        >
          Build your dream project with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">verified experts.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12"
        >
          Post your requirements, compare bids from top-rated local contractors, and start building. Secure, transparent, and built for India.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/register" className="group flex items-center justify-center gap-2 px-8 py-4 text-base font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Post a Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/register" className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium bg-white text-slate-700 rounded-full hover:bg-slate-50 transition-all shadow-md hover:shadow-lg border border-slate-200 hover:-translate-y-0.5">
            I am a Contractor
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          {[
            {
              icon: HardHat,
              title: "Verified Contractors",
              desc: "Every contractor goes through a strict manual KYC and portfolio check.",
              color: "text-orange-500",
              bg: "bg-orange-50"
            },
            {
              icon: Hammer,
              title: "Transparent Bidding",
              desc: "Receive multiple bids, compare timelines, and choose the best fit.",
              color: "text-blue-500",
              bg: "bg-blue-50"
            },
            {
              icon: MessageCircle,
              title: "Direct Communication",
              desc: "Chat instantly with contractors before making your final decision.",
              color: "text-green-500",
              bg: "bg-green-50"
            }
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className={`p-4 rounded-2xl ${feature.bg} mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

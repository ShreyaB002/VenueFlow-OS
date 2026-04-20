"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, Activity, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold tracking-tighter"
        >
          VenueFlow <span className="text-primary">OS</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <Link href="/fan" className="px-4 py-2 text-sm font-medium rounded-full hover:bg-surface-hover transition-colors">
            Fan App
          </Link>
          <Link href="/guard" className="px-4 py-2 text-sm font-medium rounded-full hover:bg-surface-hover transition-colors text-amber-500">
            Guard Dashboard
          </Link>
          <Link href="/staff" className="px-5 py-2 text-sm font-medium rounded-full bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25">
            Admin Console
          </Link>
        </motion.div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass px-6 py-2 mb-8 inline-flex items-center gap-2 text-sm text-foreground/80"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Active • 45,210 Fans Connected
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50"
        >
          The Future of Stadium <br /> Management is Here
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-foreground/60 max-w-2xl mb-12"
        >
          Real-time AI camera integration, seamless fan experiences, and unified command center control. Redefining how we experience live events.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/fan" className="flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full glass hover:bg-surface-hover transition-all duration-300 border border-white/10">
            Launch Fan PWA
          </Link>
          <Link href="/staff" className="group flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-full bg-foreground text-background hover:scale-105 transition-all duration-300 shadow-xl">
            Open Command Center
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/guard" className="flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 transition-all duration-300">
            Dispatch Guard App
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl mt-24"
        >
          {[
            { title: "Real-time Density", icon: Users, desc: "AI-powered heatmap of stadium zones" },
            { title: "Smart Ordering", icon: Activity, desc: "Queue-less food & merch delivery" },
            { title: "Instant SOS", icon: ShieldAlert, desc: "Immediate rapid-response deployment" },
            { title: "Live Guard Dispatch", icon: ShieldAlert, desc: "Automated turn-by-turn routing for ground staff to intercept security threats and deliver food directly to seats." }
          ].map((feature, idx) => (
            <div key={idx} className="glass p-6 text-left group hover:bg-surface-hover transition-colors flex flex-col justify-between">
              <div>
                <feature.icon className={`w-8 h-8 mb-4 ${idx === 3 ? 'text-amber-500' : 'text-primary'}`} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              </div>
              <p className="text-sm text-foreground/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

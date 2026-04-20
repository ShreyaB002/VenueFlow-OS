"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Activity, Camera, ArrowLeft, CheckCircle, Clock, ShieldAlert, Target, Shield, Crosshair } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import StadiumMap from "@/components/StadiumMap";
import ZoneSurveillanceGrid from "@/components/ZoneSurveillanceGrid";

export default function StaffCommandCenter() {
  const { 
    zones, 
    activeIncidents, 
    dispatchStaff, 
    activeThreat, 
    triggerThreat, 
    resolveThreat,
    activeDeliveries,
    updateDeliveryStatus,
    triggerDensityAutoLock,
    triggerPanic
  } = useStore();
  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sentinel'>('dashboard');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWaitTime = (zone: string) => {
    const state = zones[zone];
    if (state === 'critical') return '15+ mins';
    if (state === 'crowded') return '8 mins';
    return '2 mins';
  };

  const handleThreatTrigger = (type: string, zoneId: string, protocol: string) => {
    triggerThreat(type, zoneId, protocol);
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col h-screen overflow-hidden relative">
      
      {/* High-Contrast Red Alert Overlay */}
      <AnimatePresence>
        {activeThreat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 pointer-events-none border-[16px] border-red-600/80 bg-red-600/10 flex items-center justify-center mix-blend-overlay"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`flex items-center justify-between mb-6 px-6 py-4 flex-shrink-0 transition-colors z-40 rounded-2xl border ${activeThreat ? 'bg-red-950/80 border-red-500/50 backdrop-blur-xl' : 'glass'}`}>
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
            <p className="text-sm text-foreground/60">System Online • {currentTime}</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-surface p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Operations Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('sentinel')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'sentinel' ? 'bg-red-600 text-white shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            <Shield className="w-4 h-4" />
            Sentinel Sirius AI
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeThreat ? (
            <span className="flex items-center gap-2 text-sm text-red-500 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/40 font-bold uppercase tracking-widest animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              Threat Active
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active Surveillance
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative z-40">
        
        {activeTab === 'dashboard' ? (
          /* Operations Dashboard */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
          >
            {/* Left Area */}
            <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0 overflow-y-auto pr-2 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                <div className="glass p-6 flex flex-col">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Global Heatmap
                  </h2>
                  <div className="flex-1 bg-black/40 rounded-xl border border-border flex items-center justify-center relative overflow-hidden">
                    <StadiumMap />
                  </div>
                </div>

                <div className="glass p-6 flex flex-col">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Zone Wait Times
                  </h2>
                  <div className="flex-1 bg-surface/50 rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-surface border-b border-border text-sm text-foreground/60">
                        <tr>
                          <th className="px-4 py-3 font-medium">Zone</th>
                          <th className="px-4 py-3 font-medium text-right">Est. Wait</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {Object.entries(zones).map(([zone, state]) => (
                          <tr key={zone} className="hover:bg-surface-hover/50 transition-colors">
                            <td className="px-4 py-4 font-medium uppercase text-sm">{zone.replace(/-/g, ' ')}</td>
                            <td className={`px-4 py-4 text-right font-mono font-bold
                              ${state === 'critical' ? 'text-red-500' : state === 'crowded' ? 'text-orange-500' : 'text-green-500'}
                            `}>
                              {getWaitTime(zone)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="glass p-6 flex flex-col min-h-[400px]">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                <Camera className="w-5 h-5" /> Zone Surveillance Grid
              </h2>
              <div className="flex-1 w-full mx-auto mb-6">
                <ZoneSurveillanceGrid />
              </div>
              <div className="pt-4 border-t border-border mt-auto">
                <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-3">Advanced Sentinel Protocols</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => triggerDensityAutoLock('section-101')}
                    className="p-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl font-bold text-sm transition-colors text-left"
                  >
                    Trigger 95% Capacity: Sector 101
                  </button>
                  <button 
                    onClick={() => triggerPanic('north-gate')}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm transition-colors text-left"
                  >
                    Trigger Panic / Reverse Flow: North Stand
                  </button>
                  <button 
                    onClick={() => useStore.getState().triggerUpcomingEvent(3)}
                    className="p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-bold text-sm transition-colors text-left col-span-2"
                  >
                    Trigger Next Event Alert (15m warning)
                  </button>
                </div>
              </div>
            </div>
            </div>

            {/* Incident Feed */}
            <div className="flex flex-col gap-6 h-full">
              <div className="glass p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-accent" /> Incident Management
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                  <AnimatePresence>
                    {activeIncidents.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-foreground/40 py-8">
                        <CheckCircle className="w-12 h-12 mb-2 opacity-50" />
                        <p>All systems normal</p>
                      </motion.div>
                    ) : (
                      activeIncidents.map((incident) => (
                        <motion.div
                          key={incident.id}
                          layout
                          className={`p-4 rounded-xl border relative overflow-hidden ${
                            incident.status === 'active' ? 'bg-red-500/10 border-red-500/30' : incident.status === 'dispatched' ? 'bg-orange-500/10 border-orange-500/50' : 'bg-green-500/10 border-green-500/30 opacity-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-bold flex items-center gap-2 ${incident.status === 'active' ? 'text-red-400' : 'text-orange-400'}`}>
                              {incident.status === 'active' && <ShieldAlert className="w-4 h-4" />}
                              {incident.type}
                            </span>
                          </div>
                          <div className="text-sm mb-4 bg-background/50 p-2 rounded-lg">
                            <span className="text-foreground/60">Location:</span> <span className="font-semibold">{incident.location}</span>
                          </div>
                          {incident.status === 'active' && (
                            <button onClick={() => dispatchStaff(incident.id, incident.zoneId)} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-red-500/25 active:scale-95">
                              Deploy Rapid Response Team
                            </button>
                          )}
                          {incident.status === 'dispatched' && (
                            <div className="w-full py-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-sm font-bold text-center flex items-center justify-center gap-2">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Clock className="w-4 h-4" /></motion.div>
                              Staff Dispatched - Resolving in 5m
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Active Deliveries Widget */}
              <div className="glass p-6 flex flex-col h-64 flex-shrink-0 overflow-hidden">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                  <Activity className="w-5 h-5" /> SeatEats Deliveries
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                  {activeDeliveries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-foreground/40">
                      <p>No active deliveries</p>
                    </div>
                  ) : (
                    activeDeliveries.filter(d => d.status !== 'Completed').map((delivery) => (
                      <div key={delivery.id} className="p-3 bg-surface border border-border rounded-lg text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-primary">Order #{delivery.id}</span>
                          <span className="text-xs text-foreground/60">{delivery.time}</span>
                        </div>
                        <p className="font-semibold mb-1">{delivery.location}</p>
                        <p className="text-xs text-foreground/60 line-clamp-2 mb-2">{delivery.items}</p>
                        <button 
                          onClick={() => updateDeliveryStatus(delivery.id, 'Completed')}
                          className="w-full py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded text-xs font-bold transition-colors"
                        >
                          Mark Delivered
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        ) : (

          /* Sentinel Sirius Wing */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              
              {/* Simulator Controls */}
              <div className="glass p-8 flex flex-col h-full border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-foreground pointer-events-none">
                  <Shield className="w-64 h-64" />
                </div>
                
                <h2 className="text-3xl font-black mb-2 flex items-center gap-3 text-red-500 tracking-tighter">
                  <Target className="w-8 h-8" />
                  SENTINEL SIRIUS
                </h2>
                <p className="text-foreground/60 mb-8 border-b border-border pb-6">Advanced AI Threat Detection & Pose Estimation Simulator</p>
                
                <div className="flex-1 flex flex-col justify-center space-y-4 max-w-md relative z-10">
                  <button 
                    onClick={() => handleThreatTrigger("Conflict / Violence", "section-101", "Deploying Quick Response Team Alpha. Locking adjacent food court shutters. Rerouting crowd flow away from Sec 101.")}
                    className="flex flex-col text-left p-6 rounded-2xl bg-surface border border-border hover:border-red-500 hover:bg-red-500/10 transition-all group"
                  >
                    <span className="font-bold text-lg mb-1 group-hover:text-red-500 flex items-center gap-2"><Crosshair className="w-5 h-5"/> Detect Violence</span>
                    <span className="text-sm text-foreground/60">Simulate a fight breaking out in Sector 101</span>
                  </button>

                  <button 
                    onClick={() => handleThreatTrigger("Suspicious Object", "north-gate", "Isolating North Gate. Dispatching Bomb Squad & K9 Unit. Diverting all entry traffic to South Gate.")}
                    className="flex flex-col text-left p-6 rounded-2xl bg-surface border border-border hover:border-orange-500 hover:bg-orange-500/10 transition-all group"
                  >
                    <span className="font-bold text-lg mb-1 group-hover:text-orange-500 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> Detect Suspicious Object</span>
                    <span className="text-sm text-foreground/60">Simulate an unattended bag at North Gate</span>
                  </button>

                  <button 
                    onClick={() => handleThreatTrigger("Unauthorized Access", "south-gate", "Dispatching Security Team Bravo to South Gate. Temporarily freezing turnstile motors.")}
                    className="flex flex-col text-left p-6 rounded-2xl bg-surface border border-border hover:border-yellow-500 hover:bg-yellow-500/10 transition-all group"
                  >
                    <span className="font-bold text-lg mb-1 group-hover:text-yellow-500 flex items-center gap-2"><Activity className="w-5 h-5"/> Detect Unauthorized Access</span>
                    <span className="text-sm text-foreground/60">Simulate a person jumping the South Gate turnstile</span>
                  </button>
                </div>
              </div>

              {/* Protocol Display */}
              <div className="flex flex-col h-full">
                <AnimatePresence mode="wait">
                  {activeThreat ? (
                    <motion.div 
                      key="active"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass bg-red-950/40 border-red-500/50 p-8 h-full flex flex-col justify-between rounded-2xl relative overflow-hidden"
                    >
                      {/* Scanning line animation */}
                      <motion.div 
                        animate={{ top: ['-10%', '110%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,1)] z-0"
                      />

                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-full mb-6">
                          Threat Detected
                        </div>
                        <h3 className="text-4xl font-black text-white mb-2">{activeThreat.type}</h3>
                        <p className="text-xl text-red-300 font-mono mb-8">LOCATION: {activeThreat.zoneId.replace(/-/g, ' ').toUpperCase()}</p>
                        
                        <div className="bg-black/50 p-6 rounded-xl border border-red-500/30">
                          <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            DECISION & SOLUTION PROTOCOL
                          </h4>
                          <p className="text-white text-lg leading-relaxed">{activeThreat.protocol}</p>
                        </div>

                        <div className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4 text-red-200 text-sm">
                          <Activity className="w-8 h-8 animate-pulse text-red-500" />
                          <div>
                            <p className="font-bold">Global State Updated</p>
                            <p>Push notification sent to all Fan Portals. Dynamic routing algorithm recalculated to avoid {activeThreat.zoneId.replace(/-/g, ' ')}.</p>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={resolveThreat}
                        className="relative z-10 w-full py-4 mt-8 bg-surface/50 hover:bg-surface border border-white/10 hover:border-white/30 text-white rounded-xl font-bold transition-all"
                      >
                        Acknowledge & Stand Down
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass p-8 h-full flex flex-col items-center justify-center text-foreground/40 text-center"
                    >
                      <Shield className="w-24 h-24 mb-6 opacity-20" />
                      <h3 className="text-2xl font-bold mb-2">Sentinel Sirius Standby</h3>
                      <p className="max-w-xs">AI Pose Estimation active. Awaiting threat detection triggers from simulation panel.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>

        )}

      </div>
    </div>
  );
}

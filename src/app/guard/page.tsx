"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ArrowLeft, CheckCircle, Navigation, MapPin, ArrowUp, ArrowRight, ArrowDown, Shield, Target, Users, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function GuardApp() {
  const { activeIncidents, resolveIncident, resolveThreat, resolvePanic, activePanic } = useStore();
  const [guardLocation, setGuardLocation] = useState('Food Court A');
  const [routingIncidentId, setRoutingIncidentId] = useState<string | null>(null);

  const securityIncidents = activeIncidents.filter(inc => inc.status !== 'resolved');

  const activeRouteIncident = securityIncidents.find(inc => inc.id === routingIncidentId);

  const completeIncident = () => {
    if (activeRouteIncident) {
      resolveIncident(activeRouteIncident.id);
      
      // If it's a threat, resolve it
      if (activeRouteIncident.type.includes('Conflict') || activeRouteIncident.type.includes('Suspicious') || activeRouteIncident.type.includes('Access')) {
        resolveThreat(); // Reverts threat and sets camera to Clear
      }
      
      // If it's panic, resolve it
      if (activeRouteIncident.type === 'Mass Panic / Reverse Flow') {
        resolvePanic();
      }

      setRoutingIncidentId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto relative overflow-hidden pb-24">
      {/* Mobile-first Header */}
      <header className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full glass hover:bg-surface-hover">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-black text-xl flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Guard Portal</h1>
            <p className="text-xs text-foreground/60 font-mono">LIVE DISPATCH UNIT</p>
          </div>
        </div>
      </header>

      {/* Guard Location Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-4 rounded-2xl mb-8 border border-primary/20"
      >
        <label className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Current Patrol Location
        </label>
        <select 
          value={guardLocation} 
          onChange={e => setGuardLocation(e.target.value)} 
          className="w-full bg-surface/50 border border-border rounded-xl p-3 focus:border-primary outline-none appearance-none font-semibold"
        >
          <option>Food Court A</option>
          <option>North Gate</option>
          <option>South Gate</option>
          <option>Sector 101</option>
        </select>
      </motion.div>

      {/* Main Feed */}
      <h2 className="text-sm font-bold text-foreground/60 uppercase tracking-widest mb-4">Active Dispatches</h2>
      
      <div className="space-y-4">
        <AnimatePresence>
          {securityIncidents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-foreground/40 text-center"
            >
              <CheckCircle className="w-12 h-12 mb-4 opacity-50 text-green-500" />
              <p className="font-bold">No Active Incidents</p>
              <p className="text-sm">Continue standard patrol route.</p>
            </motion.div>
          ) : (
            securityIncidents.map((incident) => {
              
              const isLostChild = incident.type === 'Lost Child Broadcast';
              const isPanic = incident.type === 'Mass Panic / Reverse Flow';
              const isDensity = incident.type === 'Critical Density Auto-Lock';

              let bgColor = 'bg-red-500/10';
              let borderColor = 'border-red-500/40';
              let shadowColor = 'shadow-red-500/10';
              let textColor = 'text-red-500';
              let textAccentColor = 'text-red-400';
              let btnColor = 'bg-red-600 hover:bg-red-700 shadow-red-600/30';
              let Icon = ShieldAlert;

              if (isLostChild) {
                bgColor = 'bg-amber-500/10';
                borderColor = 'border-amber-500/40';
                shadowColor = 'shadow-amber-500/10';
                textColor = 'text-amber-500';
                textAccentColor = 'text-amber-400';
                btnColor = 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30';
                Icon = Users;
              } else if (isPanic) {
                bgColor = 'bg-red-900/50';
                borderColor = 'border-red-500';
                shadowColor = 'shadow-red-500/50';
                textColor = 'text-white';
                textAccentColor = 'text-red-300';
                btnColor = 'bg-red-600 hover:bg-red-700 shadow-red-600/50';
                Icon = TriangleAlert;
              } else if (isDensity) {
                bgColor = 'bg-orange-500/10';
                borderColor = 'border-orange-500/40';
                shadowColor = 'shadow-orange-500/10';
                textColor = 'text-orange-500';
                textAccentColor = 'text-orange-400';
                btnColor = 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30';
                Icon = Users;
              }

              return (
                <motion.div
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-5 rounded-2xl border relative overflow-hidden ${bgColor} ${borderColor} shadow-lg ${shadowColor} ${isPanic ? 'animate-pulse' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`font-black flex items-center gap-2 ${textColor} uppercase tracking-wide`}>
                      <Icon className="w-5 h-5" />
                      {incident.type}
                    </span>
                    <span className={`text-xs ${textAccentColor} font-mono font-bold ${bgColor} px-2 py-1 rounded`}>UNRESOLVED</span>
                  </div>
                  
                  <div className={`mb-6 bg-black/40 p-4 rounded-xl border ${borderColor}`}>
                    <h4 className={`text-[10px] font-bold ${textAccentColor} uppercase tracking-widest mb-1 flex items-center gap-1`}>
                      <Target className="w-3 h-3" /> Details
                    </h4>
                    <span className="font-bold text-lg text-white">
                      {isLostChild ? `⚠️ LOST CHILD: Last seen: ${incident.location}` : incident.location}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => setRoutingIncidentId(incident.id)}
                    className={`w-full py-4 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2 ${btnColor}`}
                  >
                    <Navigation className="w-5 h-5" /> Acknowledge & Route Me There
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Guard Navigation Modal */}
      <AnimatePresence>
        {routingIncidentId && activeRouteIncident && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex flex-col max-w-md mx-auto p-6"
          >
            <div className="flex justify-between items-center mb-8 pt-4">
              <h2 className="text-xl font-black flex items-center gap-2 text-primary"><Navigation className="w-6 h-6"/> Rapid Dispatch Route</h2>
            </div>
            
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="glass p-6 rounded-3xl relative overflow-y-auto scrollbar-thin shadow-2xl border-primary/20 bg-black/40 mb-6">
                <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-border z-0" />
                
                <div className="relative z-10 space-y-8">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-4 border-background shadow-lg shadow-primary/30 z-10">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="pt-1">
                      <p className="font-black text-lg">Start: {guardLocation}</p>
                      <p className="text-xs text-foreground/60 uppercase tracking-widest mt-1 font-bold">Patrol Position</p>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border-4 border-background z-10">
                      <ArrowUp className="w-4 h-4 text-foreground/80" />
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-lg">Sprint down the main concourse.</p>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border-4 border-background z-10">
                      <ArrowRight className="w-4 h-4 text-foreground/80" />
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-lg">Enter {activeRouteIncident.zoneId.replace(/-/g, ' ').toUpperCase()} perimeter.</p>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 border-4 border-background z-10 shadow-lg shadow-red-600/50 animate-pulse">
                      <ShieldAlert className="w-4 h-4 text-white" />
                    </div>
                    <div className="pt-1">
                      <p className="font-black text-xl text-red-500">Arrive at Incident</p>
                      <p className="text-sm font-bold opacity-80 text-white mt-1">{activeRouteIncident.location}</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={completeIncident}
                  className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest text-lg rounded-2xl transition-all shadow-xl shadow-green-500/25 active:scale-95 flex justify-center items-center gap-3"
                >
                  <CheckCircle className="w-6 h-6" /> Resolve Incident
                </button>
                <button 
                  onClick={() => setRoutingIncidentId(null)}
                  className="w-full py-4 bg-transparent text-foreground/60 font-bold uppercase tracking-widest text-sm mt-2 hover:text-foreground transition-colors"
                >
                  Abort Route
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

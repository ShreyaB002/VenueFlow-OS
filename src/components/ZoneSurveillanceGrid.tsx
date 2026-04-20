"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Focus, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function ZoneSurveillanceGrid() {
  const { cameras, updateCameraStatus, setZoneState, triggerThreat } = useStore();
  const [activeCam, setActiveCam] = useState<string | null>(null);

  useEffect(() => {
    // Independent interval simulation for cameras
    const interval = setInterval(() => {
      // Pick a random camera to simulate
      const randomCamIndex = Math.floor(Math.random() * cameras.length);
      const cam = cameras[randomCamIndex];
      
      // Randomly decide status (mostly clear)
      const rand = Math.random();
      if (rand > 0.95) {
        // 5% chance of Violence
        updateCameraStatus(cam.zoneId, 'Violence');
        triggerThreat("Conflict / Violence", cam.zoneId, `Automated Dispatch: Security team routed to ${cam.name}. Securing perimeter.`);
      } else if (rand > 0.8) {
        // 15% chance of High Crowd
        updateCameraStatus(cam.zoneId, 'High Crowd');
        setZoneState(cam.zoneId, 'crowded');
      } else {
        // Clear
        if (cam.status !== 'Violence') { // Don't auto-clear violence, must be resolved by guard
          updateCameraStatus(cam.zoneId, 'Clear');
          setZoneState(cam.zoneId, 'normal');
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [cameras, updateCameraStatus, setZoneState, triggerThreat]);

  const activeCamData = activeCam ? cameras.find(c => c.id === activeCam) : null;

  return (
    <div className="flex flex-col gap-4 h-full relative">
      {/* Main Expand View */}
      <AnimatePresence mode="wait">
        {activeCamData ? (
          <motion.div 
            key="main"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full aspect-video bg-black rounded-2xl border border-white/20 relative overflow-hidden group cursor-pointer"
            onClick={() => setActiveCam(null)}
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay z-0 pointer-events-none" />
            
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-20">
              <div className="flex items-center gap-3 text-sm font-mono text-white/90 font-bold">
                <Camera className="w-5 h-5" />
                <span>{activeCamData.name} - MAIN FEED</span>
              </div>
              <span className="text-xs font-mono text-gray-400 bg-black/50 px-2 py-1 rounded">CLICK TO MINIMIZE</span>
            </div>

            {/* Simulated Live Action Overlay based on status */}
            {activeCamData.status === 'Violence' && (
              <div className="absolute inset-0 border-[8px] border-red-600/80 z-10 flex items-center justify-center bg-red-900/20">
                <div className="w-[40%] h-[50%] border-2 border-red-500 bg-red-500/10 relative">
                  <div className="absolute -top-8 left-0 bg-red-600 text-white font-mono text-xs px-2 py-1 flex items-center gap-2">
                    <Focus className="w-4 h-4 animate-pulse" /> TARGET LOCK: VIOLENCE
                  </div>
                </div>
              </div>
            )}
            
            {activeCamData.status === 'High Crowd' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-orange-900/10">
                <div className="w-[70%] h-[80%] border border-orange-500/50 relative">
                  <div className="absolute -top-6 left-0 bg-orange-600 text-white font-mono text-[10px] px-2 py-1 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> ELEVATED DENSITY
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="grid" className="grid grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {cameras.map((cam) => (
              <div 
                key={cam.id} 
                onClick={() => setActiveCam(cam.id)}
                className={`relative aspect-video bg-black rounded-xl overflow-hidden cursor-pointer border-2 transition-all group
                  ${cam.status === 'Violence' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                    cam.status === 'High Crowd' ? 'border-orange-500/50' : 'border-white/10 hover:border-white/30'}
                `}
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay z-0" />
                
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                  <span className="text-[10px] font-mono font-bold bg-black/60 px-2 py-1 rounded border border-white/10 text-white/90">
                    {cam.name}
                  </span>
                  {cam.status === 'Violence' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
                  {cam.status === 'High Crowd' && <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                  {cam.status === 'Clear' && <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-50" />}
                </div>

                {cam.status === 'Violence' && (
                  <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center z-0">
                    <div className="w-1/2 h-1/2 border border-red-500/50" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors z-20" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

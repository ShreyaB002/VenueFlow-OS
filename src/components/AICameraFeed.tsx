"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Focus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AICameraFeed() {
  const { zones, setZoneState, addIncident, setGlobalAlert, activeIncidents } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [densityScore, setDensityScore] = useState(0);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let interval: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }

        // Random density score generator every 3s
        interval = setInterval(() => {
          const score = Math.floor(Math.random() * 100);
          setDensityScore(score);

          if (score >= 80) {
            setZoneState('food-court-a', 'critical');
            setGlobalAlert("⚠️ Heavy crowd detected in Food Court A, please use alternate routes.");
            
            // Check if incident already exists and active
            const state = useStore.getState();
            const hasActive = state.activeIncidents.some(i => i.zoneId === 'food-court-a' && i.status !== 'resolved');
            if (!hasActive) {
              addIncident({
                id: Math.random().toString(36).substring(7),
                type: 'Crowd Surge',
                location: 'Food Court A',
                zoneId: 'food-court-a',
                status: 'active',
                time: new Date().toLocaleTimeString()
              });
            }
          } else if (score >= 50) {
            setZoneState('food-court-a', 'crowded');
            setGlobalAlert(null);
          } else {
            setZoneState('food-court-a', 'normal');
            setGlobalAlert(null);
          }
        }, 3000);

      } catch (err) {
        console.error("Camera access denied or unavailable", err);
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      clearInterval(interval);
    };
  }, [setZoneState, setGlobalAlert, addIncident]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl border border-border overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-xs font-mono text-white/80">
          <Camera className="w-4 h-4" />
          <span>LIVE CAM : FOOD COURT A</span>
        </div>
        <div className="flex items-center gap-2">
          {streamActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono text-red-500">REC</span>
            </>
          ) : (
            <span className="text-xs font-mono text-gray-500">OFFLINE</span>
          )}
        </div>
      </div>

      {/* Real Camera Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover z-0"
      />

      {/* Density Overlay */}
      <div className="absolute bottom-3 right-3 z-20 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 flex flex-col items-end">
        <span className="text-[10px] text-white/60 font-mono">DENSITY SCORE</span>
        <span className={`text-lg font-bold font-mono transition-colors ${densityScore >= 80 ? 'text-red-500' : densityScore >= 50 ? 'text-orange-500' : 'text-green-500'}`}>
          {densityScore}%
        </span>
      </div>

      {/* AI Bounding Boxes overlay if crowded/critical */}
      <AnimatePresence>
        {densityScore >= 50 && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            <div className={`relative w-[60%] h-[70%] border-2 bg-red-500/10 ${densityScore >= 80 ? 'border-red-500/80' : 'border-orange-500/80'}`}>
              <div className="absolute -top-6 left-0 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 flex items-center gap-1">
                <Focus className="w-3 h-3" />
                {densityScore >= 80 ? 'CRITICAL CROWD SURGE' : 'ELEVATED CROWD DENSITY'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

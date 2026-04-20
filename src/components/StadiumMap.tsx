"use client";

import { useStore, ZoneState } from "@/store/useStore";
import { motion } from "framer-motion";

const getColorForState = (state: ZoneState) => {
  switch (state) {
    case "critical": return "rgba(239, 68, 68, 0.6)"; // Red
    case "crowded": return "rgba(249, 115, 22, 0.6)"; // Orange
    case "normal": default: return "rgba(59, 130, 246, 0.2)"; // Blue
  }
};

export default function StadiumMap() {
  const { zones } = useStore();

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto flex items-center justify-center p-4">
      {/* Glow effect behind the map */}
      <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl z-10">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Stadium Outer Ring */}
        <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
        
        {/* Field */}
        <rect x="130" y="80" width="140" height="240" rx="20" fill="rgba(34, 197, 94, 0.1)" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="2" />
        <line x1="130" y1="200" x2="270" y2="200" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="2" />
        <circle cx="200" cy="200" r="30" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="2" />

        {/* North Gate */}
        <motion.path
          d="M 120 40 Q 200 10 280 40 L 260 70 Q 200 50 140 70 Z"
          fill={getColorForState(zones['north-gate'])}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          animate={{ fill: getColorForState(zones['north-gate']) }}
          transition={{ duration: 1 }}
          filter={zones['north-gate'] === 'critical' ? 'url(#glow)' : ''}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <text x="200" y="45" fill="white" fontSize="10" textAnchor="middle" opacity="0.8">NORTH GATE</text>

        {/* South Gate */}
        <motion.path
          d="M 120 360 Q 200 390 280 360 L 260 330 Q 200 350 140 330 Z"
          fill={getColorForState(zones['south-gate'])}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          animate={{ fill: getColorForState(zones['south-gate']) }}
          transition={{ duration: 1 }}
          filter={zones['south-gate'] === 'critical' ? 'url(#glow)' : ''}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <text x="200" y="365" fill="white" fontSize="10" textAnchor="middle" opacity="0.8">SOUTH GATE</text>

        {/* Section 101 (West) */}
        <motion.path
          d="M 40 120 Q 10 200 40 280 L 70 260 Q 50 200 70 140 Z"
          fill={getColorForState(zones['section-101'])}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          animate={{ fill: getColorForState(zones['section-101']) }}
          transition={{ duration: 1 }}
          filter={zones['section-101'] === 'critical' ? 'url(#glow)' : ''}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <text x="35" y="200" fill="white" fontSize="10" textAnchor="middle" opacity="0.8" transform="rotate(-90 35,200)">SEC 101</text>

        {/* Food Court A (East) */}
        <motion.path
          d="M 360 120 Q 390 200 360 280 L 330 260 Q 350 200 330 140 Z"
          fill={getColorForState(zones['food-court-a'])}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          animate={{ fill: getColorForState(zones['food-court-a']) }}
          transition={{ duration: 1 }}
          filter={zones['food-court-a'] === 'critical' ? 'url(#glow)' : ''}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <text x="365" y="200" fill="white" fontSize="10" textAnchor="middle" opacity="0.8" transform="rotate(90 365,200)">FOOD COURT A</text>

      </svg>
    </div>
  );
}

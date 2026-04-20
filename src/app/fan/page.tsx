"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Coffee, ShieldAlert, ArrowLeft, X, CheckCircle2, Navigation, AlertTriangle, ShoppingCart, Plus, Minus, Search, MapPin, ArrowUp, ArrowRight, ArrowDown, Flag, ScanLine, Ticket, Clock, ChefHat, Fingerprint, Users, TriangleAlert, CalendarClock, MessageSquare, Mic, Send, Bot } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import StadiumMap from "@/components/StadiumMap";
import { calculateRoute, venueGraph } from "@/data/venueGraph";

type FoodItem = { id: string; name: string; price: number };
const MENU: FoodItem[] = [
  { id: '1', name: 'Classic Burger', price: 12 },
  { id: '2', name: 'Stadium Pizza Slice', price: 8 },
  { id: '3', name: 'Large Coke', price: 6 },
  { id: '4', name: 'Loaded Nachos', price: 10 },
];

export default function FanPWA() {
  // ==========================================
  // ALL REACT HOOKS AT TOP LEVEL (NO EARLY RETURNS)
  // ==========================================
  const { 
    zones, globalAlert, activeThreat, addIncident, userLocation, 
    currentTicket, setCurrentTicket, addDelivery, activeDeliveries, 
    triggerThreat, activePanic, eventSchedule, upcomingEvent, clearUpcomingEvent 
  } = useStore();
  
  const [sosSent, setSosSent] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  // Food Ordering State
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'seat'>('pickup');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Smart Routing State
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);

  // Specific Seat Finder State
  const [seatStartPoint, setSeatStartPoint] = useState('North Entry Gate');
  const [seatDestBlock, setSeatDestBlock] = useState('Sector 101');
  const [seatDestRow, setSeatDestRow] = useState('A');
  const [seatDestSeat, setSeatDestSeat] = useState('12');
  const [seatRouteActive, setSeatRouteActive] = useState(false);

  // Lost Child Form State
  const [isLostChildOpen, setIsLostChildOpen] = useState(false);
  const [lostChildDesc, setLostChildDesc] = useState('');
  const [lostChildLoc, setLostChildLoc] = useState('');
  const [lostChildSent, setLostChildSent] = useState(false);

  // Derived State
  const trackedOrder = activeDeliveries.find(d => d.id === activeOrderId);
  const subTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = MENU.find(m => m.id === id);
    return total + (item ? item.price * qty : 0);
  }, 0);
  const cartTotal = subTotal + (deliveryMethod === 'seat' ? 5 : 0);

  const isEvacuating = activePanic === 'north-gate' && (currentTicket?.entry_gate === 'North Gate' || currentTicket?.sector === 'North Stand');
  
  // Density Lock detection
  const isDensityLocked = isRouteOpen && seatRouteActive && seatDestBlock === 'Sector 101' && zones['section-101'] === 'critical';

  // AI Concierge State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{sender: 'bot'|'user', text: string, action?: 'order'|'route', actionPayload?: string}>>([]);
  
  // Voice Nav State
  const [isListening, setIsListening] = useState(false);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleValidScan = () => {
    setScanStatus('scanning');
    
    // The simulated payload required by requirements
    const payload = {
      ticket_id: "TKT-8924A",
      status: "VALID",
      fan_name: "Rahul M.",
      zone: "VIP Box",
      sector: "Sector 101",
      row: "A",
      seat: "12",
      entry_gate: "North Gate"
    };

    setTimeout(() => {
      setScanStatus('success');
      setTimeout(() => {
        setCurrentTicket(payload);
        
        // Auto-fill routing so it welcomes them with instructions to their seat
        setDestination('Find a Specific Seat');
        setSeatStartPoint(payload.entry_gate);
        setSeatDestBlock(payload.sector);
        setSeatDestRow(payload.row);
        setSeatDestSeat(payload.seat);
        setSeatRouteActive(true);
        setIsRouteOpen(true);
      }, 1500);
    }, 1500);
  };

  const handleFakeScan = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('error');
      triggerThreat('Counterfeit Ticket Scanned', 'north-gate', 'Intercept unauthorized individual at North Gate Turnstile.');
      setTimeout(() => setScanStatus('idle'), 4000);
    }, 1500);
  };

  const handleSOS = () => {
    const locString = currentTicket ? `${currentTicket.zone}, Row ${currentTicket.row}, Seat ${currentTicket.seat}` : 'Unknown Location';
    const zoneId = currentTicket?.sector === 'North Stand' ? 'north-gate' : 'section-101';
    
    addIncident({
      id: Math.random().toString(36).substring(7),
      type: 'Medical Emergency (Fan SOS)',
      location: locString,
      zoneId: zoneId,
      status: 'active',
      time: new Date().toLocaleTimeString()
    });
    setSosSent(true);
    setTimeout(() => setSosSent(false), 3000);
  };

  const submitLostChild = () => {
    if (!lostChildDesc || !lostChildLoc) return;
    addIncident({
      id: Math.random().toString(36).substring(7),
      type: 'Lost Child Broadcast',
      location: lostChildLoc,
      zoneId: 'north-gate', // Broadcasts to all guards essentially
      status: 'active',
      time: new Date().toLocaleTimeString()
    });
    setLostChildSent(true);
    setTimeout(() => {
      setLostChildSent(false);
      setIsLostChildOpen(false);
      setLostChildDesc('');
      setLostChildLoc('');
    }, 3000);
  };

  const updateCart = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleCheckout = () => {
    const newOrderId = Math.random().toString(36).substring(7).toUpperCase();
    setActiveOrderId(newOrderId);

    if (deliveryMethod === 'seat' && currentTicket) {
      const itemsString = Object.entries(cart).map(([id, qty]) => {
        const item = MENU.find(m => m.id === id);
        return `${qty}x ${item?.name}`;
      }).join(', ');
      
      addDelivery({
        id: newOrderId,
        location: `${currentTicket.zone}, Row ${currentTicket.row}, Seat ${currentTicket.seat}`,
        items: itemsString,
        destination: { block: currentTicket.sector, row: currentTicket.row, seat: currentTicket.seat }
      });
    } else {
      const itemsString = Object.entries(cart).map(([id, qty]) => {
        const item = MENU.find(m => m.id === id);
        return `${qty}x ${item?.name}`;
      }).join(', ');
      
      addDelivery({
        id: newOrderId,
        location: `Counter Pickup`,
        items: itemsString
      });
    }
  };

  const generateRouteSteps = (dest: string | null) => {
    if (!dest) return { steps: [], isRerouted: false, isRestricted: false, startLoc: '' };

    let startLoc = currentTicket ? currentTicket.zone : 'Sector 101';
    if (dest === 'Find a Specific Seat') {
      startLoc = seatStartPoint;
    }

    // Map UI start points to graph nodes
    let startNodeId = "Concourse B";
    if (startLoc.includes("North")) startNodeId = "North Gate";
    if (startLoc.includes("VIP") || startLoc.includes("101")) startNodeId = "Sector 101";
    if (startLoc.includes("Food Court A")) startNodeId = "Food Court A";

    // Map UI destinations to graph nodes
    let destNodeId = dest;
    if (dest === 'Find a Specific Seat') {
      if (seatDestBlock.includes("101") || seatDestBlock.includes("VIP")) destNodeId = "Sector 101";
      else if (seatDestBlock.includes("North")) destNodeId = "North Gate";
      else destNodeId = "Sector 101";
    }

    // Check complete restriction
    const targetZoneId = venueGraph.nodes[destNodeId]?.zoneId;
    if (activeThreat && activeThreat.zoneId === targetZoneId) {
      return { steps: [], isRerouted: false, isRestricted: true, startLoc };
    }

    // Run Dijkstra's Algorithm using the Digital Twin Graph
    const pathEdges = calculateRoute(startNodeId, destNodeId, venueGraph, zones);

    let isRerouted = false;
    
    const steps = pathEdges.map(edge => {
      // Check if we dynamically avoided a high-density area
      const node = venueGraph.nodes[edge.to];
      if (node?.zoneId && (zones[node.zoneId] === 'critical' || zones[node.zoneId] === 'crowded')) {
        isRerouted = true;
      }
      return {
        icon: ArrowRight, 
        text: edge.instructions
      };
    });

    if (steps.length > 0) {
      steps.push({ icon: Flag, text: `Arrive at ${dest === 'Find a Specific Seat' ? 'Seat ' + seatDestSeat : dest}.` });
    } else {
      steps.push({ icon: Flag, text: `You are already at ${dest}.` });
    }

    return { steps, isRerouted, isRestricted: false, startLoc };
  };

  const routeToEvent = (location: string) => {
    if (location === 'Find a Specific Seat') {
      setDestination(location);
      setSeatRouteActive(true);
      setIsRouteOpen(true);
      clearUpcomingEvent();
      return;
    }
    setDestination(location);
    setSeatRouteActive(false); // Since it's a general destination, not a specific seat
    setIsRouteOpen(true);
    clearUpcomingEvent(); // Dismiss alert if they route
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceNav = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      
      // Simulate "Take me to my seat"
      setDestination('Find a Specific Seat');
      setSeatRouteActive(true);
      setIsRouteOpen(true);
      
      const res = generateRouteSteps('Find a Specific Seat');
      if (res.steps.length > 0) {
        speak(`Routing to your seat. ${res.steps[0].text}`);
      }
    }, 2500);
  };

  const handleSendChat = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.toLowerCase();
    const newMsg = { sender: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      let botReply: {sender: 'bot'|'user', text: string, action?: 'order'|'route', actionPayload?: string} = { sender: 'bot', text: "I'm sorry, I didn't quite catch that. Try asking about 'food' or 'washrooms'." };
      
      if (query.includes('food') || query.includes('hungry')) {
        const isCrowded = zones['food-court-a'] === 'crowded' || zones['food-court-a'] === 'critical';
        botReply = { 
          sender: 'bot', 
          text: `The shortest queue right now is Food Court A (${isCrowded ? '8' : '4'} min wait). Want me to open the menu?`,
          action: 'order'
        };
      } else if (query.includes('washroom') || query.includes('restroom') || query.includes('toilet')) {
        botReply = {
          sender: 'bot',
          text: "The nearest washroom is 50m away near North Gate. Route you there?",
          action: 'route',
          actionPayload: 'Nearest Washroom'
        };
      } else if (query.includes('seat')) {
        botReply = {
          sender: 'bot',
          text: "I can route you directly to your seat right now.",
          action: 'route',
          actionPayload: 'Find a Specific Seat'
        };
      }

      setChatMessages(prev => [...prev, botReply]);
    }, 1000);
  };

  const initChat = () => {
    setIsChatOpen(true);
    if (chatMessages.length === 0) {
      setChatMessages([{
        sender: 'bot',
        text: `Hi ${currentTicket?.fan_name?.split(' ')[0] || 'there'}! I can help you find your seat, order food, or check wait times. What do you need?`
      }]);
    }
  };

  // ==========================================
  // VIEW RENDERERS (Conditional)
  // ==========================================

  // 0. EVACUATION OVERRIDE
  if (isEvacuating) {
    return (
      <div className="fixed inset-0 z-[999] bg-red-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute inset-0 bg-red-600 z-0 mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col items-center">
          <TriangleAlert className="w-32 h-32 text-white mb-8 animate-pulse" />
          <h1 className="text-5xl font-black text-white uppercase tracking-widest mb-6">Emergency</h1>
          <p className="text-2xl font-bold text-white/90 leading-relaxed max-w-sm">
            Proceed immediately to the nearest <span className="text-white underline underline-offset-4 decoration-4">East Exit</span>. Follow the flashing arrows on the floor.
          </p>
        </div>
      </div>
    );
  }

  // 1. ENTRY GATEWAY (QR Scanner)
  if (!currentTicket) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        <div className="w-full max-w-sm px-6 relative z-10 flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-white tracking-widest uppercase flex items-center justify-center gap-3">
              <ScanLine className="w-8 h-8 text-primary" /> Entry Gateway
            </h1>
            <p className="text-white/60 font-mono text-sm mt-2">Hold your Match Ticket QR Code inside the frame to enter the stadium.</p>
          </div>

          {/* Scanner Viewfinder UI */}
          <div className={`relative w-full aspect-square rounded-3xl overflow-hidden border-2 mb-8 transition-colors duration-500
            ${scanStatus === 'success' ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 
              scanStatus === 'error' ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 
              'border-white/20'}`}>
            
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

            {/* Corner Markers */}
            <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl opacity-80" />
            <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl opacity-80" />
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl opacity-80" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl opacity-80" />

            {/* Status Overlays */}
            <AnimatePresence mode="wait">
              {scanStatus === 'idle' && (
                <motion.div key="idle" className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint className="w-20 h-20 text-white/20" />
                </motion.div>
              )}
              {scanStatus === 'scanning' && (
                <motion.div key="scan" className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-6 right-6 h-1 bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,1)]"
                  />
                  <Fingerprint className="w-20 h-20 text-white/50 animate-pulse" />
                </motion.div>
              )}
              {scanStatus === 'success' && (
                <motion.div key="success" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/10">
                  <CheckCircle2 className="w-24 h-24 text-green-500 mb-2" />
                  <p className="text-green-500 font-bold uppercase tracking-widest">Authenticated</p>
                </motion.div>
              )}
              {scanStatus === 'error' && (
                <motion.div key="error" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20 backdrop-blur-md border-4 border-red-500 rounded-3xl">
                  <ShieldAlert className="w-24 h-24 text-red-500 mb-2" />
                  <p className="text-red-500 font-black uppercase tracking-widest text-xl">Access Denied</p>
                  <p className="text-red-200/80 font-mono text-xs mt-2 bg-black/50 px-3 py-1 rounded">Counterfeit Pass Detected</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full space-y-4">
            <button 
              onClick={handleValidScan}
              disabled={scanStatus !== 'idle'}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-colors border border-white/10 flex justify-center items-center gap-2"
            >
              <Ticket className="w-5 h-5" /> Simulate Scan: Valid VIP Ticket
            </button>
            <button 
              onClick={handleFakeScan}
              disabled={scanStatus !== 'idle'}
              className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-bold transition-colors border border-red-500/20 flex justify-center items-center gap-2"
            >
              <ShieldAlert className="w-5 h-5" /> Simulate Scan: Counterfeit Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN FAN PORTAL UI
  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto relative overflow-hidden pb-24">
      
      {/* Smart Alert Notification */}
      <AnimatePresence>
        {upcomingEvent && !isDensityLocked && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-4 right-4 z-[150] glass bg-purple-900/90 border border-purple-500/50 p-4 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="font-bold text-white tracking-widest uppercase text-sm">Upcoming Event</h3>
              </div>
              <button onClick={clearUpcomingEvent} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-white font-medium mb-4">
              ⏰ UP NEXT: &apos;{upcomingEvent.title}&apos; starts in 15 minutes at {upcomingEvent.location}!
            </p>
            <button 
              onClick={() => routeToEvent(upcomingEvent.location)}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <Navigation className="w-5 h-5" /> Get Directions
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Density Lock Overlay */}
      <AnimatePresence>
        {isDensityLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-red-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <AlertTriangle className="w-24 h-24 text-red-500 mb-6" />
            <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-4">Route Paused</h2>
            <p className="text-xl font-bold text-white/90 leading-relaxed mb-8">
              Sector 101 is at critical capacity. Please hold your position in the concourse to prevent crowding.
            </p>
            <button onClick={() => { setIsRouteOpen(false); setSeatRouteActive(false); }} className="w-full max-w-xs py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-600/30">
              Acknowledge
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Alert */}
      <AnimatePresence>
        {globalAlert && !isDensityLocked && !upcomingEvent && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50 bg-red-600/90 backdrop-blur-md text-white p-4 flex items-center gap-3 shadow-2xl"
          >
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="text-sm font-semibold">{globalAlert}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-first Header */}
      <header className={`flex items-center justify-between mb-6 ${globalAlert ? 'pt-20' : 'pt-4'} transition-all`}>
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full glass hover:bg-surface-hover">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold">Welcome, {currentTicket.fan_name}</h1>
            <p className="text-xs text-primary font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {currentTicket.zone}, Row {currentTicket.row}, Seat {currentTicket.seat}
            </p>
          </div>
        </div>
      </header>

      {/* Smart Venue Navigator */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-4 mb-6 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" /> Smart Venue Navigator
          </h2>
        </div>

        <div className="mb-4 h-48 rounded-xl overflow-hidden relative border border-border">
           <StadiumMap />
           <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
           <button 
             onClick={() => setIsRouteOpen(true)}
             className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-bold shadow-xl shadow-primary/40 flex items-center gap-2 transition-all w-max z-20 cursor-pointer pointer-events-auto"
           >
             <Search className="w-5 h-5" /> Where To?
           </button>
        </div>
      </motion.section>

      {/* Event Schedule (Itinerary) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6 mb-6 relative overflow-hidden"
      >
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" /> Event Itinerary
        </h2>
        
        <div className="relative border-l-2 border-border ml-3 space-y-8 pb-4">
          {eventSchedule.map((ev) => (
            <div key={ev.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 border-4 border-background" />
              
              <div className="mb-1 flex justify-between items-start">
                <h3 className="font-bold text-md">{ev.title}</h3>
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">{ev.time}</span>
              </div>
              <p className="text-xs text-foreground/60 mb-2">{ev.description}</p>
              
              <div className="flex justify-between items-center bg-surface p-2 rounded-lg border border-border">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-foreground/60" /> {ev.location}
                </span>
                <button 
                  onClick={() => routeToEvent(ev.location)}
                  className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" /> Route Me There
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Food Ordering */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => { setIsOrderOpen(true); setCart({}); setDeliveryMethod('pickup'); setActiveOrderId(null); }}
        className="glass p-6 mb-6 flex items-center justify-between group hover:bg-surface-hover cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-full text-primary">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">SeatEats Delivery</h3>
            <p className="text-sm text-foreground/60">Order food directly to your seat.</p>
          </div>
        </div>
      </motion.section>

      {/* SOS Button */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-col items-center gap-4 pb-8"
      >
        <button 
          onClick={handleSOS}
          disabled={sosSent}
          className={`relative group w-32 h-32 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 shadow-2xl
            ${sosSent ? 'bg-green-600 scale-95' : 'bg-red-600 hover:bg-red-700 hover:scale-105 shadow-red-600/50'}`}
        >
          {!sosSent && <span className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping" />}
          <ShieldAlert className="w-8 h-8 mb-2 z-10" />
          <span className="font-bold tracking-widest z-10">{sosSent ? 'SENT' : 'SOS'}</span>
        </button>

        <button 
          onClick={() => setIsLostChildOpen(true)}
          className="px-6 py-3 glass bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl font-bold flex items-center gap-2 transition-colors mt-4"
        >
          <Users className="w-5 h-5" /> Report Lost Child/Person
        </button>
      </motion.section>

      {/* Navigation Modal */}
      <AnimatePresence>
        {isRouteOpen && !isDensityLocked && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col max-w-md mx-auto"
          >
            <div className="p-4 flex justify-between items-center border-b border-border bg-surface">
              <h2 className="text-xl font-bold flex items-center gap-2"><Navigation className="w-5 h-5"/> Venue Navigator</h2>
              <button onClick={() => { setIsRouteOpen(false); setDestination(null); setSeatRouteActive(false); }} className="p-2 bg-background rounded-full hover:bg-border transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {!destination ? (
                <div className="space-y-4">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <input 
                      type="text" 
                      placeholder="Where do you want to go?" 
                      className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-14 focus:outline-none focus:border-primary transition-colors"
                      readOnly
                    />
                    <button 
                      onClick={handleVoiceNav}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-colors flex items-center justify-center"
                    >
                      {isListening ? (
                        <div className="w-5 h-5 rounded-full bg-primary animate-ping" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>
                    {isListening && <p className="absolute -bottom-6 right-2 text-xs text-primary font-bold animate-pulse">Listening...</p>}
                  </div>
                  
                  <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-2">Specific Location</h3>
                  <button 
                    onClick={() => setDestination('Find a Specific Seat')}
                    className="w-full p-4 glass border-primary/40 bg-primary/10 rounded-xl text-left font-bold text-primary hover:bg-primary/20 hover:border-primary transition-all flex items-center gap-4 shadow-lg shadow-primary/10"
                  >
                    <Search className="w-5 h-5" />
                    Find a Specific Seat
                  </button>

                  <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-2 mt-6">Quick Destinations</h3>
                  {['Nearest Washroom', 'Food Court A', 'South Exit Gate', 'Medical Tent'].map((dest) => (
                    <button 
                      key={dest}
                      onClick={() => setDestination(dest)}
                      className="w-full p-4 glass rounded-xl text-left font-semibold hover:bg-primary/20 hover:border-primary transition-all flex items-center gap-4"
                    >
                      <MapPin className="w-5 h-5 text-primary" />
                      {dest}
                    </button>
                  ))}
                </div>
              ) : destination === 'Find a Specific Seat' && !seatRouteActive ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col h-full"
                >
                  <button 
                    onClick={() => setDestination(null)}
                    className="flex items-center gap-2 text-primary font-semibold mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Search
                  </button>

                  <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><MapPin className="text-primary"/> Find Your Seat</h3>
                  
                  <div className="glass p-6 rounded-2xl space-y-4 mb-6">
                    <div>
                      <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1 block">Starting Point</label>
                      <select value={seatStartPoint} onChange={e => setSeatStartPoint(e.target.value)} className="w-full bg-surface border border-border rounded-xl p-3 focus:border-primary outline-none appearance-none">
                        <option>North Entry Gate</option>
                        <option>Food Court A</option>
                        <option>Restroom B</option>
                        <option>South Concourse</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider mb-3 block">Target Destination</label>
                      <div className="space-y-4">
                        <div>
                          <select value={seatDestBlock} onChange={e => setSeatDestBlock(e.target.value)} className="w-full bg-surface border border-border rounded-xl p-3 focus:border-primary outline-none appearance-none">
                            <option>Sector 101</option>
                            <option>VIP Box</option>
                            <option>North Stand</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <select value={seatDestRow} onChange={e => setSeatDestRow(e.target.value)} className="w-full bg-surface border border-border rounded-xl p-3 focus:border-primary outline-none appearance-none">
                            {['A','B','C','D','E','F','G'].map(r => <option key={r}>{r}</option>)}
                          </select>
                          <input type="number" min="1" max="50" value={seatDestSeat} onChange={e => setSeatDestSeat(e.target.value)} className="w-full bg-surface border border-border rounded-xl p-3 focus:border-primary outline-none" placeholder="Seat" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSeatRouteActive(true)}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                  >
                    Get Directions to Seat
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col h-full"
                >
                  <button 
                    onClick={() => {
                      if (destination === 'Find a Specific Seat') {
                        setSeatRouteActive(false);
                      } else {
                        setDestination(null);
                      }
                    }}
                    className="flex items-center gap-2 text-primary font-semibold mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" /> {destination === 'Find a Specific Seat' ? 'Edit Details' : 'Back to Search'}
                  </button>

                  {generateRouteSteps(destination).isRestricted ? (
                    <div className="glass p-8 rounded-3xl text-center border-red-500/30 bg-red-500/10">
                      <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-black text-red-500 mb-2">Access Denied</h3>
                      <p className="text-foreground/80 font-semibold leading-relaxed">
                        🛑 Area currently restricted by Security. Please wait at the concourse. Do not proceed to {seatDestBlock}.
                      </p>
                    </div>
                  ) : (
                    <>
                      {generateRouteSteps(destination).isRerouted && destination !== 'Find a Specific Seat' && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3 text-orange-400"
                        >
                          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-sm">Security Routing Active</p>
                            <p className="text-xs opacity-80 mt-1">Route updated to avoid security incident at {activeThreat?.zoneId.replace(/-/g, ' ')}.</p>
                          </div>
                        </motion.div>
                      )}

                      <div className="glass p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-border z-0" />
                        
                        <div className="relative z-10 space-y-8">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-4 border-background shadow-lg shadow-primary/30 z-10">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div className="pt-1">
                              <p className="font-bold text-lg">Start: {destination === 'Find a Specific Seat' ? seatStartPoint : 'Your Seat'}</p>
                              {destination !== 'Find a Specific Seat' && (
                                <p className="text-sm text-foreground/60">{generateRouteSteps(destination).startLoc}, Row {currentTicket.row}</p>
                              )}
                            </div>
                          </div>

                          {generateRouteSteps(destination).steps.map((step, idx) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              key={idx} 
                              className="flex items-start gap-4"
                            >
                              <div className="w-8 h-8 rounded-full bg-surface border-4 border-background flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                                <step.icon className="w-4 h-4 text-foreground/80" />
                              </div>
                              <div className="pt-1">
                                <p className={`font-medium ${step.icon === AlertTriangle ? 'text-orange-400 font-bold' : ''}`}>{step.text}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lost Child Modal */}
      <AnimatePresence>
        {isLostChildOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="glass p-8 rounded-3xl w-full max-w-sm border-amber-500/30">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-amber-500">Lost Child Alert</h3>
                </div>
                <button onClick={() => setIsLostChildOpen(false)} className="p-2 hover:bg-surface rounded-full"><X className="w-5 h-5"/></button>
              </div>

              {!lostChildSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2 block">Description & Clothing</label>
                    <textarea 
                      value={lostChildDesc}
                      onChange={e => setLostChildDesc(e.target.value)}
                      placeholder="e.g. 7yo boy, red shirt, blue jeans"
                      className="w-full bg-surface border border-border rounded-xl p-3 focus:border-amber-500 outline-none h-24 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-2 block">Last Seen Location</label>
                    <input 
                      value={lostChildLoc}
                      onChange={e => setLostChildLoc(e.target.value)}
                      placeholder="e.g. Near Food Court A"
                      className="w-full bg-surface border border-border rounded-xl p-3 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <button 
                    onClick={submitLostChild}
                    disabled={!lostChildDesc || !lostChildLoc}
                    className="w-full py-4 bg-amber-500 disabled:bg-surface disabled:text-foreground/50 hover:bg-amber-600 text-white font-bold rounded-xl mt-4 shadow-lg shadow-amber-500/30 transition-all"
                  >
                    Broadcast to Security
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                  <p className="font-bold text-lg text-amber-500 mb-2">Broadcast Sent</p>
                  <p className="text-sm text-foreground/60">All security units have been notified. Please stay where you are.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Ordering Modal */}
      <AnimatePresence>
        {isOrderOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col max-w-md mx-auto"
          >
            <div className="p-4 flex justify-between items-center border-b border-border bg-surface">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> SeatEats</h2>
              <button onClick={() => setIsOrderOpen(false)} className="p-2 bg-background rounded-full hover:bg-border transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {!activeOrderId ? (
                <div className="h-full flex flex-col">
                  <h3 className="font-semibold text-lg mb-4 text-foreground/80">Menu</h3>
                  <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                    {MENU.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 glass rounded-xl">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="font-bold text-primary">${item.price}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateCart(item.id, -1)} className="p-1.5 rounded-full bg-surface-hover hover:bg-border transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-4 text-center font-semibold">{cart[item.id] || 0}</span>
                          <button onClick={() => updateCart(item.id, 1)} className="p-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-foreground/60 uppercase mb-2">Delivery Method</h4>
                      <div className="flex gap-2 p-1 bg-surface rounded-xl">
                        <button 
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${deliveryMethod === 'pickup' ? 'bg-background shadow-md' : 'text-foreground/60'}`}
                        >
                          Counter Pickup
                        </button>
                        <button 
                          onClick={() => setDeliveryMethod('seat')}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${deliveryMethod === 'seat' ? 'bg-primary text-white shadow-md' : 'text-foreground/60'}`}
                        >
                          Deliver to Seat
                        </button>
                      </div>
                      {deliveryMethod === 'seat' && (
                        <p className="text-xs text-primary mt-2 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Delivering to: {currentTicket.zone}, Row {currentTicket.row}, Seat {currentTicket.seat} (+$5 Fee)
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-4 text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-xl">${cartTotal}</span>
                    </div>
                    <button 
                      onClick={handleCheckout}
                      disabled={subTotal === 0}
                      className="w-full py-4 bg-primary disabled:bg-surface disabled:text-foreground/50 text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 disabled:shadow-none"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                  
                  {trackedOrder?.status === 'Pending' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                        <Clock className="w-20 h-20 text-foreground/40 mb-6" />
                      </motion.div>
                      <h3 className="text-2xl font-bold">Order Received</h3>
                      <p className="text-foreground/60 mt-2">Waiting for kitchen to accept your order...</p>
                    </motion.div>
                  )}

                  {trackedOrder?.status === 'Preparing' && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <ChefHat className="w-20 h-20 text-orange-500 mb-6" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-orange-400">Preparing Order</h3>
                      <p className="text-foreground/60 mt-2">👨‍🍳 Kitchen is preparing your order!</p>
                    </motion.div>
                  )}

                  {trackedOrder?.status === 'Delivering' && (
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center w-full">
                      <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <div className="text-6xl mb-6">🏃‍♂️</div>
                      </motion.div>
                      <h3 className="text-2xl font-bold text-primary">Out for Delivery!</h3>
                      <div className="glass p-4 rounded-xl border-primary/30 w-full mt-4">
                        <p className="font-bold text-sm uppercase text-primary mb-1">Destination</p>
                        <p>{currentTicket.zone}, Row {currentTicket.row}, Seat {currentTicket.seat}</p>
                      </div>
                    </motion.div>
                  )}

                  {trackedOrder?.status === 'Completed' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center w-full">
                      <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
                      <h3 className="text-3xl font-black text-green-500 mb-2">Enjoy your meal!</h3>
                      <p className="text-foreground/60">Your order has been marked as delivered.</p>
                      
                      <button 
                        onClick={() => { setIsOrderOpen(false); setActiveOrderId(null); setCart({}); }} 
                        className="mt-8 w-full py-4 bg-surface rounded-xl font-bold hover:bg-surface-hover transition-colors"
                      >
                        Return to Portal
                      </button>
                    </motion.div>
                  )}

                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for AI Concierge */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={initChat}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 border-2 border-white/20"
      >
        <Bot className="w-6 h-6" />
      </motion.button>

      {/* AI Concierge Chatbot Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 left-6 md:left-auto md:w-96 z-[95] glass bg-surface/95 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden h-[400px]"
          >
            <div className="p-4 bg-primary text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm tracking-wide">Venue AI Guide</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
              {chatMessages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-background border border-border text-foreground rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                  {msg.action && (
                    <button 
                      onClick={() => {
                        setIsChatOpen(false);
                        if (msg.action === 'order') { setIsOrderOpen(true); setCart({}); setDeliveryMethod('pickup'); setActiveOrderId(null); }
                        if (msg.action === 'route' && msg.actionPayload) routeToEvent(msg.actionPayload);
                      }}
                      className="mt-2 text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                    >
                      {msg.action === 'order' ? <ShoppingCart className="w-3 h-3"/> : <Navigation className="w-3 h-3"/>}
                      {msg.action === 'order' ? 'Open SeatEats' : 'Get Directions'}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="p-3 bg-background border-t border-border shrink-0">
              <form onSubmit={handleSendChat} className="relative flex items-center">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="w-full bg-surface border border-border rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-primary text-sm"
                />
                <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 p-1.5 bg-primary disabled:bg-primary/50 text-white rounded-full transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

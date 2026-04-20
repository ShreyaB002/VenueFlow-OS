"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, MapPin, Activity, CheckCircle, Flame, ArrowLeft, Package, Navigation, ArrowUp, ArrowDown, Flag } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function RunnerApp() {
  const { activeDeliveries, updateDeliveryStatus } = useStore();
  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [navigatingOrder, setNavigatingOrder] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingCount = activeDeliveries.filter(d => d.status === 'Pending').length;
  const preparingCount = activeDeliveries.filter(d => d.status === 'Preparing').length;
  const deliveringCount = activeDeliveries.filter(d => d.status === 'Delivering').length;

  const activeOrders = activeDeliveries.filter(d => d.status !== 'Completed');
  const historyOrders = activeDeliveries.filter(d => d.status === 'Completed');

  const navOrderDetails = activeDeliveries.find(d => d.id === navigatingOrder);

  const completeDelivery = () => {
    if (navigatingOrder) {
      updateDeliveryStatus(navigatingOrder, 'Completed');
      setNavigatingOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col h-screen overflow-hidden relative">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8 glass px-6 py-4 flex-shrink-0 z-40 rounded-2xl border border-border">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
              <ChefHat className="w-6 h-6" /> SeatEats Kitchen & Ops
            </h1>
            <p className="text-sm text-foreground/60 font-mono">System Online • {currentTime}</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-surface p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-primary text-white shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Active Queue
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-surface-hover text-foreground shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            History
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-black">{pendingCount}</div>
            <span className="text-xs font-bold text-foreground/60 uppercase">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-black">{preparingCount}</div>
            <span className="text-xs font-bold text-foreground/60 uppercase">Cooking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black">{deliveringCount}</div>
            <span className="text-xs font-bold text-foreground/60 uppercase">Runners</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative z-30 overflow-y-auto pr-2 scrollbar-thin">
        
        {activeTab === 'active' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            <AnimatePresence>
              {activeOrders.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="col-span-full h-[50vh] flex flex-col items-center justify-center text-foreground/40"
                >
                  <Package className="w-24 h-24 mb-6 opacity-20" />
                  <h3 className="text-2xl font-bold mb-2">Queue Empty</h3>
                  <p>Awaiting new orders from Fan Portals.</p>
                </motion.div>
              ) : (
                activeOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`glass rounded-2xl flex flex-col relative overflow-hidden transition-all duration-300 border-2
                      ${order.status === 'Pending' ? 'border-red-500/30 bg-red-500/5' : 
                        order.status === 'Preparing' ? 'border-orange-500/30 bg-orange-500/5' : 
                        'border-primary/30 bg-primary/5'}
                    `}
                  >
                    {/* Top Bar */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                      <div className="font-mono font-black text-lg tracking-widest text-white/90">#{order.id}</div>
                      <div className="text-xs font-mono text-foreground/60">{order.time}</div>
                    </div>

                    {/* Order Details */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Order Items
                        </h4>
                        <ul className="space-y-2">
                          {order.items.split(', ').map((item, idx) => (
                            <li key={idx} className="font-semibold text-lg flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto bg-black/30 p-4 rounded-xl border border-white/10">
                        <h4 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Destination
                        </h4>
                        <p className="font-bold text-lg text-primary">{order.location}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0">
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => updateDeliveryStatus(order.id, 'Preparing')}
                          className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-red-500/20"
                        >
                          Accept & Start Cooking
                        </button>
                      )}
                      
                      {order.status === 'Preparing' && (
                        <button 
                          onClick={() => updateDeliveryStatus(order.id, 'Delivering')}
                          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2"
                        >
                          <Flame className="w-5 h-5" /> Food Ready - Send Runner
                        </button>
                      )}

                      {order.status === 'Delivering' && (
                        <button 
                          onClick={() => setNavigatingOrder(order.id)}
                          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
                        >
                          <Navigation className="w-5 h-5" /> Get Delivery Directions
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-surface/50 rounded-2xl border border-border p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Completed Deliveries</h2>
            {historyOrders.length === 0 ? (
              <p className="text-foreground/40">No completed orders yet.</p>
            ) : (
              <div className="space-y-3">
                {historyOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 glass rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-mono font-bold">#{order.id}</p>
                        <p className="text-sm text-foreground/60">{order.items}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.location}</p>
                      <p className="text-xs text-foreground/60">{order.time} - Delivered</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Runner Navigation Modal */}
      <AnimatePresence>
        {navigatingOrder && navOrderDetails && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col items-center p-8"
          >
            <div className="w-full max-w-3xl flex flex-col h-full relative">
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black flex items-center gap-3 text-primary"><Navigation className="w-8 h-8" /> Smart Venue Navigator</h2>
                  <p className="text-foreground/60 font-mono mt-1">RUNNER MODE • ACTIVE ORDER #{navOrderDetails.id}</p>
                </div>
                <button onClick={() => setNavigatingOrder(null)} className="p-3 bg-surface rounded-full hover:bg-border transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex gap-8">
                
                {/* Visual Map Space (Mocked via glass card for runner) */}
                <div className="flex-1 glass rounded-3xl border-primary/20 flex flex-col items-center justify-center relative overflow-hidden bg-black/40">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                  <MapPin className="w-24 h-24 text-primary opacity-20 mb-4" />
                  <p className="text-2xl font-bold font-mono text-primary">DESTINATION</p>
                  <p className="text-4xl font-black mt-2">{navOrderDetails.location}</p>
                </div>

                {/* Turn by Turn */}
                <div className="w-[400px] flex flex-col">
                  <div className="glass p-8 rounded-3xl relative overflow-hidden flex-1 shadow-2xl">
                    <div className="absolute left-12 top-14 bottom-14 w-0.5 bg-border z-0" />
                    
                    <div className="relative z-10 space-y-10">
                      
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-start gap-5">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-4 border-background shadow-lg shadow-primary/30">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="pt-1.5">
                          <p className="font-black text-lg">Start: Food Court A (Kitchen)</p>
                          <p className="text-sm text-foreground/60">Pickup completed.</p>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-start gap-5">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border-4 border-background z-10">
                          <ArrowUp className="w-5 h-5 text-foreground/80" />
                        </div>
                        <div className="pt-1.5">
                          <p className="font-semibold text-lg">Walk down the main concourse towards the North End.</p>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-start gap-5">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border-4 border-background z-10">
                          <ArrowLeft className="w-5 h-5 text-foreground/80" />
                        </div>
                        <div className="pt-1.5">
                          <p className="font-semibold text-lg">Turn left into the {navOrderDetails.destination?.block || "Sector"} tunnel.</p>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-start gap-5">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border-4 border-background z-10">
                          <ArrowDown className="w-5 h-5 text-foreground/80" />
                        </div>
                        <div className="pt-1.5">
                          <p className="font-semibold text-lg">Walk down the stairs to Row {navOrderDetails.destination?.row || "A"}.</p>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-start gap-5">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 border-4 border-background z-10 shadow-lg shadow-green-500/30">
                          <Flag className="w-5 h-5 text-white" />
                        </div>
                        <div className="pt-1.5">
                          <p className="font-black text-lg text-green-500">Arrive at Seat {navOrderDetails.destination?.seat || "1"}</p>
                          <p className="text-sm font-bold opacity-80">(Deliver to: Fan)</p>
                        </div>
                      </motion.div>

                    </div>
                  </div>

                  <button 
                    onClick={completeDelivery}
                    className="mt-6 w-full py-5 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest text-lg rounded-2xl transition-all shadow-xl shadow-green-500/25 active:scale-95 flex justify-center items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6" /> Complete Delivery
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

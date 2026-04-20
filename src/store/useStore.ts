import { create } from 'zustand';

export type ZoneState = 'normal' | 'crowded' | 'critical';
export type Incident = { id: string; type: string; location: string; status: 'active' | 'dispatched' | 'resolved'; time: string; zoneId: string };

export type Threat = {
  id: string;
  type: string;
  zoneId: string;
  protocol: string;
  time: string;
};

export type UserLocation = {
  block: string;
  row: string;
  seat: string;
};

export type TicketPayload = {
  ticket_id: string;
  status: string;
  fan_name: string;
  zone: string;
  sector: string;
  row: string;
  seat: string;
  entry_gate: string;
};

export type DeliveryStatus = 'Pending' | 'Preparing' | 'Delivering' | 'Completed';

export type Delivery = {
  id: string;
  location: string;
  items: string;
  status: DeliveryStatus;
  time: string;
  destination?: UserLocation | null;
};

export type CameraState = {
  id: string;
  name: string;
  zoneId: string;
  status: 'Clear' | 'High Crowd' | 'Violence' | 'Suspicious Object';
};

export type ScheduleEvent = {
  id: number;
  title: string;
  location: string;
  time: string;
  description: string;
};

interface VenueState {
  zones: { [key: string]: ZoneState };
  activeIncidents: Incident[];
  activeThreat: Threat | null;
  globalAlert: string | null;
  userLocation: UserLocation | null;
  currentTicket: TicketPayload | null;
  activeDeliveries: Delivery[];
  cameras: CameraState[];
  eventSchedule: ScheduleEvent[];
  upcomingEvent: ScheduleEvent | null;
  
  setZoneState: (zone: string, state: ZoneState) => void;
  addIncident: (incident: Incident) => void;
  dispatchStaff: (id: string, zoneId: string) => void;
  resolveIncident: (id: string) => void;
  
  triggerThreat: (type: string, zoneId: string, protocol: string) => void;
  resolveThreat: () => void;
  
  setGlobalAlert: (message: string | null) => void;
  simulateAITrigger: () => void;

  setUserLocation: (location: UserLocation) => void;
  setCurrentTicket: (ticket: TicketPayload) => void;
  addDelivery: (delivery: { id: string; location: string; items: string; destination?: UserLocation | null }) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  
  updateCameraStatus: (zoneId: string, status: CameraState['status']) => void;

  activePanic: string | null;
  triggerDensityAutoLock: (zoneId: string) => void;
  triggerPanic: (zoneId: string) => void;
  resolvePanic: () => void;
  triggerUpcomingEvent: (eventId: number) => void;
  clearUpcomingEvent: () => void;
}

export const useStore = create<VenueState>((set, get) => ({
  zones: {
    'north-gate': 'normal',
    'south-gate': 'normal',
    'food-court-a': 'normal',
    'section-101': 'normal',
  },
  activeIncidents: [],
  activeThreat: null,
  globalAlert: null,
  userLocation: null,
  currentTicket: null,
  activeDeliveries: [],
  eventSchedule: [
    { id: 1, title: "Opening Ceremony", location: "North Gate", time: "10:00 AM", description: "Inauguration by the Chief Guest." },
    { id: 2, title: "Hackathon Pitching", location: "Sector 101", time: "02:00 PM", description: "Final project presentations." },
    { id: 3, title: "Live EDM Concert", location: "Food Court A", time: "07:30 PM", description: "Main event headliner." }
  ],
  upcomingEvent: null,
  cameras: [
    { id: 'cam-01', name: 'CAM-01: North Gate', zoneId: 'north-gate', status: 'Clear' },
    { id: 'cam-02', name: 'CAM-02: Sector 101', zoneId: 'section-101', status: 'Clear' },
    { id: 'cam-03', name: 'CAM-03: South Gate', zoneId: 'south-gate', status: 'Clear' },
    { id: 'cam-04', name: 'CAM-04: Food Court A', zoneId: 'food-court-a', status: 'Clear' },
  ],
  activePanic: null,
  
  setZoneState: (zone, state) => set((prev) => ({
    zones: { ...prev.zones, [zone]: state }
  })),

  addIncident: (incident) => set((prev) => ({
    activeIncidents: [incident, ...prev.activeIncidents]
  })),

  dispatchStaff: (id, zoneId) => {
    set((prev) => ({
      activeIncidents: prev.activeIncidents.map(inc => 
        inc.id === id ? { ...inc, status: 'dispatched' } : inc
      )
    }));

    setTimeout(() => {
      get().resolveIncident(id);
      get().setZoneState(zoneId, 'normal');
    }, 5000);
  },

  resolveIncident: (id) => set((prev) => {
    const incident = prev.activeIncidents.find(i => i.id === id);
    return {
      activeIncidents: prev.activeIncidents.map(inc => 
        inc.id === id ? { ...inc, status: 'resolved' } : inc
      ),
      cameras: incident ? prev.cameras.map(cam => cam.zoneId === incident.zoneId ? { ...cam, status: 'Clear' } : cam) : prev.cameras
    };
  }),

  triggerThreat: (type, zoneId, protocol) => {
    const threatId = Math.random().toString(36).substring(7);
    set({
      activeThreat: {
        id: threatId,
        type,
        zoneId,
        protocol,
        time: new Date().toLocaleTimeString()
      },
      globalAlert: `🚨 SECURITY ALERT: ${type} at ${zoneId.replace(/-/g, ' ').toUpperCase()}. Please follow staff instructions.`
    });
    get().setZoneState(zoneId, 'critical');
    get().updateCameraStatus(zoneId, type === 'Conflict / Violence' ? 'Violence' : 'Suspicious Object');
    
    // Auto-create an incident for the Guard App
    get().addIncident({
      id: threatId,
      type: type,
      location: `${zoneId.replace(/-/g, ' ').toUpperCase()} (Auto-Detected by Sentinel Sirius)`,
      zoneId: zoneId,
      status: 'active',
      time: new Date().toLocaleTimeString()
    });
  },

  resolveThreat: () => {
    const threat = get().activeThreat;
    if (threat) {
      get().setZoneState(threat.zoneId, 'normal');
      get().updateCameraStatus(threat.zoneId, 'Clear');
    }
    set({ activeThreat: null, globalAlert: null });
  },

  setGlobalAlert: (message) => set({ globalAlert: message }),

  simulateAITrigger: () => {
    set((prev) => ({
      zones: { ...prev.zones, 'food-court-a': 'critical' }
    }));
    
    set((prev) => ({
      activeIncidents: [
        {
          id: Math.random().toString(36).substring(7),
          type: 'Crowd Surge',
          location: 'Food Court A',
          zoneId: 'food-court-a',
          status: 'active',
          time: new Date().toLocaleTimeString()
        },
        ...prev.activeIncidents
      ]
    }));
  },

  setUserLocation: (location) => set({ userLocation: location }),
  
  setCurrentTicket: (ticket) => set({ currentTicket: ticket, userLocation: { block: ticket.sector, row: ticket.row, seat: ticket.seat } }),

  addDelivery: (delivery) => set((prev) => ({
    activeDeliveries: [
      {
        ...delivery,
        status: 'Pending',
        time: new Date().toLocaleTimeString()
      },
      ...prev.activeDeliveries
    ]
  })),

  updateDeliveryStatus: (id, status) => set((prev) => ({
    activeDeliveries: prev.activeDeliveries.map(del => 
      del.id === id ? { ...del, status } : del
    )
  })),

  updateCameraStatus: (zoneId, status) => set((prev) => ({
    cameras: prev.cameras.map(cam => 
      cam.zoneId === zoneId ? { ...cam, status } : cam
    )
  })),

  triggerDensityAutoLock: (zoneId) => {
    set((prev) => ({
        zones: { ...prev.zones, [zoneId]: 'critical' },
        globalAlert: `⚠️ CRITICAL DENSITY in ${zoneId.replace(/-/g, ' ').toUpperCase()}`
    }));
    get().addIncident({
        id: Math.random().toString(36).substring(7),
        type: 'Critical Density Auto-Lock',
        location: zoneId.replace(/-/g, ' ').toUpperCase(),
        zoneId: zoneId,
        status: 'active',
        time: new Date().toLocaleTimeString()
    });
  },

  triggerPanic: (zoneId) => {
    set({ activePanic: zoneId });
    get().addIncident({
        id: Math.random().toString(36).substring(7),
        type: 'Mass Panic / Reverse Flow',
        location: zoneId.replace(/-/g, ' ').toUpperCase(),
        zoneId: zoneId,
        status: 'active',
        time: new Date().toLocaleTimeString()
    });
  },

  resolvePanic: () => {
    set({ activePanic: null });
  },

  triggerUpcomingEvent: (eventId: number) => {
    const ev = get().eventSchedule.find(e => e.id === eventId);
    if (ev) {
      set({ upcomingEvent: ev });
    }
  },

  clearUpcomingEvent: () => {
    set({ upcomingEvent: null });
  }
}));

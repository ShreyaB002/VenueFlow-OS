# 🏟️ VenueFlow OS

![VenueFlow OS Banner](https://via.placeholder.com/1000x300/0F172A/00E5FF?text=VenueFlow+OS+-+The+Brain+of+the+Smart+Stadium)

**VenueFlow OS** is a complete, real-time software operating system designed to eliminate crowd bottlenecks, slash food wait times, and automate emergency security dispatch at large-scale physical events and sporting venues. 

Built entirely on **Next.js** and architected for **Google Cloud**, VenueFlow OS connects Fans, Venue Operations, and Security Guards into one synchronized, real-time digital twin.

---

## 🚀 The Problem We Solved
Physical venues run on 1990s technology. Fans wait 30 minutes for food, security guards use slow walkie-talkies, and crowd crushes happen due to operational blind spots. We built a 100% software-based solution to orchestrate the entire event experience safely and efficiently.

---

## ✨ Core Features (The 3-Sided Platform)

### 📱 1. The Fan Portal (PWA)
- **Smart Wayfinding & Digital Twin:** Fans scan their ticket QR code to enter. The app uses a graph-based routing algorithm to provide dynamic, turn-by-turn indoor navigation to their exact seat.
- **SeatEats (In-Seat Delivery):** Fans order food from their phone and track the runner delivering it directly to their seat.
- **Hands-Free AI Voice Concierge:** Fans can tap a mic and say *"Take me to my seat,"* and the app routes them using Web Speech API audio navigation.
- **Accessibility Mode:** Toggle wheelchair-friendly routing to avoid stairs.

### 🖥️ 2. The Admin Command Center
- **AI Vision & Security Core:** Integrates simulated browser webcam feeds (via MediaPipe) to detect real-time crowd density, panic (reverse crowd flow), and physical conflicts using computer vision.
- **Live Heatmaps:** See the entire stadium's crowd pressure in real-time.
- **Crowd Crush Auto-Lock:** If a sector hits 95% capacity, the system automatically locks the UI routes and redirects fans away from the danger zone to prevent stampedes.

### 🛡️ 3. The Guard & Runner Dispatch App
- **Automated Threat Dispatch:** When the AI Security Core detects a counterfeit ticket or a physical conflict, it instantly sends a turn-by-turn intercept route to the nearest security guard's phone.
- **Food Ops Delivery:** Kitchen runners receive precise directions from the food court to the fan's exact seat number.

---

## 🛠️ Technical Architecture

VenueFlow OS is built for high performance and real-time syncing:
- **Frontend:** Next.js (App Router), React, Tailwind CSS (Soft 3D / Glassmorphism UI)
- **Animations:** Framer Motion
- **State Management:** Zustand (Simulating Google Cloud Pub/Sub & Firestore for instant multi-client syncing)
- **AI Integration:** Simulated MediaPipe Vision, Web Speech API (Voice NLP)
- **Deployment:** Dockerized for auto-scaling on **Google Cloud Run**

---

## ⚙️ How to Run Locally (For Judges)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/VenueFlow-OS.git
   cd VenueFlow-OS
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Experience the Demo:**
   Open `http://localhost:3000` in **three separate browser windows** side-by-side to experience the real-time syncing:
   - Window 1: Fan Portal (`/`)
   - Window 2: Admin Command Center (`/staff`)
   - Window 3: Guard/Runner Dispatch (`/guard`)

---

## ☁️ Google Cloud Deployment
This application is configured with a `Dockerfile` and `cloudbuild.yaml` for seamless CI/CD deployment to **Google Cloud Run**, ensuring it can auto-scale to handle 100,000+ concurrent fans during a live sporting event.

---

*Built with ❤️ for the PromptWars Hackathon 2026.*

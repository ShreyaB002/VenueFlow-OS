# VenueFlow OS 🏟️

**The AI-powered operating system for smart stadiums.**  
Built for the PromptWars Google Cloud Hackathon.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://venueflow-38hjf1lhj-shreya-bhuimbars-projects.vercel.app)

## 📌 Overview
Stadiums are built for 50,000 people but often run on outdated tech, leading to crowd bottlenecks, missed game moments in food queues, and delayed emergency responses. **VenueFlow OS** is a real-time, browser-native platform that manages crowd flow, fan experience, food ordering, and safety emergencies. 

Instead of relying on expensive IoT hardware or ESP32 boards, VenueFlow OS operates entirely via browser webcams and software, processing live data through a robust Google Cloud architecture to deliver an enterprise-grade venue management system.

## ✨ Key Features
- **🚶‍♂️ Real-Time Crowd Routing:** Live heatmaps and dynamic crowd routing to prevent bottlenecks.
- **🍔 SeatEats Delivery:** PWA food menu accessed via QR code for in-seat food delivery—fans never miss a goal.
- **🚨 Autonomous Security Dispatch:** Integrates directly with **Sentinel Sirius AI** to detect anomalies via pose estimation and instantly dispatch first-aid or security in seconds.
- **🤖 Voice AI & Chatbot Assistant:** Hands-free AI voice navigation and chatbot to help fans easily locate seats, restrooms, or exits.
- **⏰ Smart Event Alerts:** Proactive push notifications 15 minutes before an event or match starts.
- **💻 Zero-Hardware Deployments:** Point a browser webcam at the crowd and the system comes alive.

## 🛠️ Tech Stack & Architecture
VenueFlow OS is built to scale instantly across massive physical venues using modern web and cloud technologies:
- **Frontend UI/UX:** Next.js, React, TailwindCSS (Accelerated via Google Antigravity)
- **State Management:** Zustand (for ultra-fast, real-time cross-window syncing)
- **Backend & Real-Time DB:** Google Cloud Platform, Firebase / Firestore
- **AI Integration:** Google Cloud AI, Sentinel Sirius AI (Pose estimation/Computer Vision)
- **Deployment:** Vercel (Frontend), Google Cloud Run (Backend services)

## 🚀 How to Experience the Demo (For Judges)
To truly experience the real-time magic of VenueFlow OS, we recommend testing the system using a **side-by-side window setup**:
1. Open the [Live Demo](https://venueflow-38hjf1lhj-shreya-bhuimbars-projects.vercel.app) in your browser.
2. Open **Window 1 (Fan App)** on the left half of your screen.
3. Open **Window 2 (Staff Command Center)** on the right half of your screen.
4. Trigger an action in the Fan App (e.g., press the SOS button or order food) and watch it sync **instantly** to the Command Center without refreshing.

## 💻 Local Installation

Clone the repository and run it locally:

```bash
# Clone the repo
git clone https://github.com/ShreyaB002/VenueFlow-OS.git

# Navigate into the directory
cd VenueFlow-OS

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🏆 Hackathon Track
**PromptWars - Google Cloud**  
Focus: Improving crowd movement, waiting times, and real-time coordination at physical venues using AI and Google Cloud.

---
*Built by Shreya Bhuimbar*

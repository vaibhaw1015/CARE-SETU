# 🏥 CareSetu (केयर सेतु) — Bridge to Healthcare

<div align="center">

![CareSetu Banner](https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80)

**A comprehensive digital healthcare bridge platform built for India.**  
Genuine medicines · Emergency ambulance dispatch · AI Doctor triage · Vadodara hospital registry

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015%20+%20PostGIS-3ECF8E?logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-Qwen%2027B-FF4F00)](https://groq.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**🔴 Live Demo**](https://github.com/vaibhaw1015/CARE-SETU) · [**📖 Docs**](#-getting-started) · [**🐛 Issues**](https://github.com/vaibhaw1015/CARE-SETU/issues)

</div>

---

## 📖 What is CareSetu?

**CareSetu** (Hindi: *केयर सेतु*, meaning "Care Bridge") is a full-stack healthcare super-app designed for Indian users — primarily focused on **Vadodara, Gujarat**.

It puts everything a person needs in a health emergency or routine care situation in **one single platform**:

- 💊 **Buy genuine medicines** with doorstep delivery
- 🩺 **Rent/buy medical equipment** (BP monitors, wheelchairs, pulse oximeters)
- 🚑 **Book emergency ambulances** with real-time GPS tracking on a live map
- 🤖 **Consult an AI Doctor** for instant symptom triage with dual-layer safety
- 🗺️ **Find nearby hospitals** in Vadodara with emergency filters and an interactive map
- 📅 **Discover free health camps** for eye, cardiac, and wellness checkups
- 🛡️ **Operations admin portal** for pharmacists and healthcare managers

---

## 🎬 Feature Showcase

### 1. 💊 Pharmacy & Medical Equipment
- Curated catalog of OTC + prescription medicines in Indian Rupees (₹ INR)
- **Schedule H prescription compliance** — mandatory Rx upload for controlled drugs
- Multi-payment checkout:
  - 💵 Cash on Delivery (COD)
  - 💳 Mock Card / Netbanking
  - 📲 **Manual UPI QR** with dynamic QR code + bank UTR reference submission
- Real-time multi-stage order tracking (`pending → confirmed → shipped → delivered`)

### 2. 🚑 Emergency Ambulance Dispatch
- **PostGIS spatial queries** — finds nearest on-duty ambulance using real GPS coordinates
- **1-Tap SOS Dispatch** with live status timeline (`requested → accepted → on_the_way → reached → completed`)
- **Driver Dashboard** (`/driver`) — 5-second GPS beacon broadcast, patient navigation via Google Maps, mission state controls
- Permanent speed-dial buttons for **108 (Ambulance)** and **112 (National Emergency)** across the entire app

### 3. 🤖 AI Doctor Triage Chatbot
- **Dual-Layer Safety Architecture:**
  - **Layer 1 (Client-side):** Instant keyword scanner for life-threatening red flags — Cardiac, Stroke, Breathing, Unconscious, Seizure, Bleeding, Poisoning, Pediatric, Anaphylaxis — *in English and Hindi* — before any network call
  - **Layer 2 (Groq AI):** Streaming health advice powered by Groq's **Qwen 27B** (`qwen/qwen3-27b`) model with strict safety system prompts
- **Emergency Modal + Audio Alert** — dual-tone chime + 108/112/Ambulance booking on red flag
- **Voice input** — Web Speech API mic dictation for hands-free symptom entry
- **Session sync** — all consultations saved to Supabase with severity rating

### 4. 🗺️ Vadodara Hospitals & Free Camps
- **10 real Vadodara hospitals** — Zydus, Sterling, Bhailal Amin, Baroda Heart Institute, SSG Hospital, and more
- **Safe data policy**: *"In healthcare, wrong data is worse than missing data"* — hospitals with unverified coordinates use `location = NULL` by design, gracefully falling back to Google Maps address search
- **Interactive Leaflet map** — radius filter (1–25 km), 24/7 Emergency toggle, live user GPS
- **Free health camps** with countdown badge showing days remaining

### 5. 🛡️ Operations Control Center (`/admin`)
- Order lifecycle management and search
- Prescription review — view attached Rx files, approve/reject with pharmacist notes
- UPI reconciliation — verify submitted bank UTR codes
- **Inventory CRUD** — stock stepper, price/MRP editing, Schedule H toggle
- **Hospital GPS manager** — safely add verified lat/lng to hospitals with missing coordinates
- Real-time Supabase Realtime updates on all order data

### 6. 📱 Progressive Web App (PWA)
- **Installable** on Android and desktop via Web App Manifest
- **Service Worker** caches critical app shell for offline resilience
- **Offline banner** — when internet drops, 108/112 phone links remain accessible
- **Mobile floating SOS button** — 1-tap ambulance booking always visible on phones

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS 3 + Lucide Icons + Inter (Google Fonts) |
| **Routing** | React Router DOM 7 |
| **Mapping** | Leaflet + React-Leaflet + OpenStreetMap (free, no API key) |
| **Database** | Supabase — PostgreSQL 15 + **PostGIS** spatial extension |
| **Auth & Security** | Supabase Auth + Row-Level Security (RLS) policies |
| **AI Inference** | Groq API — `qwen/qwen3-27b` low-latency streaming |
| **Realtime** | Supabase Realtime (WebSocket channels) |
| **PWA** | Service Worker + Web App Manifest + Web Speech API + Web Audio API |
| **Payments** | UPI QR (`qrcode.react`) + COD + Mock payment flows |

---

## 🗄️ Database Schema Overview

```
users (Supabase Auth)
  └── profiles (full_name, role, phone)
  └── orders → order_items → products
  └── cart_items → products
  └── prescriptions (Rx file uploads)
  └── emergency_requests → ambulances (PostGIS location)
  └── consultation_sessions (AI Doctor chat history)

hospitals (PostGIS POINT location, nullable for unverified)
health_camps
ambulances (PostGIS POINT, is_available, GPS broadcast)
products (medicines + equipment, stock, requires_prescription)
```

**Key Supabase RPC:** `nearest_ambulances(lat, lng, lim)` — uses PostGIS `ST_Distance` to find closest available ambulances.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- A [Supabase](https://supabase.com/) project (free tier works)
- A [Groq](https://console.groq.com/) API key (free)

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhaw1015/CARE-SETU.git
cd CARE-SETU
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Then open `.env` and fill in your real values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_API_KEY=gsk_your_groq_api_key
VITE_UPI_ID=caresetu@upi
VITE_UPI_NAME=CareSetu Health Services
VITE_ENABLE_MOCK_PAYMENT=true
```

### 4. Set Up Database
Run the migration file in Supabase SQL Editor:
```
supabase/migrations/00001_initial_schema.sql
```
This creates all tables, enables PostGIS, sets up RLS policies, and seeds sample data.

### 5. Run Locally
```bash
npm run dev
```
App runs at **http://localhost:5173/**

### 6. Build for Production
```bash
npm run build
```

---

## 🧪 Demo Walkthrough

### As a Patient
1. Open `/pharmacy` → search "Dolo" → add to cart
2. Go to `/pharmacy/cart` → Checkout → select **Manual UPI QR**
3. Enter mock UTR `UTR9876543210` → Place Order
4. Check `/orders` to see your order status

### Test AI Doctor Safety System
1. Open `/ai-doctor`
2. Type: *"What helps a mild dry cough?"* → watch streaming AI response
3. Type: *"I have severe chest pain and left arm numbness"* → **Emergency overlay fires immediately** with audio chime

### Test Emergency Ambulance
1. Open `/emergency` → Allow GPS (or use default Vadodara location)
2. Select an ambulance → click **Request This Ambulance**
3. Open `/driver` in another tab → switch to Demo Driver mode
4. Advance mission state → watch live status update on patient screen

### Test Admin Portal
1. Open `/admin` → click **Switch to Demo Admin**
2. **UPI tab** → confirm the UTR payment as "Paid"
3. **Inventory tab** → adjust stock counts with quick `+5/-5` steppers
4. **Hospitals tab** → filter "Missing GPS" → add verified coordinates

---

## 🔒 Security & Privacy

- All `.env` files are in `.gitignore` — **no secrets are committed**
- Supabase **Row-Level Security (RLS)** enforces that users can only read their own orders, prescriptions, and cart items
- AI Doctor is explicitly constrained: *never prescribes dosages, never diagnoses, always recommends a real doctor*
- Hospital data follows strict integrity policy — no fabricated phone numbers or coordinates

## ⚠️ Medical Disclaimer

CareSetu is a **digital healthcare connector**, not a medical service provider. The AI Doctor tool provides general health information only and is **not a substitute for professional medical diagnosis or treatment**. In any life-threatening emergency, always call **108** (Ambulance) or **112** (National Emergency) immediately.

---

## 📁 Project Structure

```
CareAI/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── favicon.svg
├── src/
│   ├── components/            # Navbar, Footer, SOSButton, ProductCard, MapView...
│   ├── context/               # AuthContext, CartContext, GeolocationContext, ToastContext
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── auth/              # Login, Profile
│   │   ├── pharmacy/          # Search, Cart, Checkout, OrderPlaced
│   │   ├── equipment/         # EquipmentList
│   │   ├── emergency/         # Emergency.jsx
│   │   ├── ai-doctor/         # Chat.jsx
│   │   ├── nearby/            # Hospitals.jsx, Camps.jsx
│   │   ├── orders/            # MyOrders.jsx
│   │   ├── driver/            # DriverDashboard.jsx
│   │   └── admin/             # Dashboard.jsx
│   ├── lib/                   # supabaseClient.js, utils.js
│   ├── App.jsx                # Routes, offline banner, mobile SOS
│   └── main.jsx               # App entry point
├── supabase/
│   └── migrations/            # Full DB schema + seed data
├── .env.example               # Environment template (safe to commit)
├── .gitignore                 # Protects .env and secrets
└── README.md
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for India · Primary Hub: **Vadodara, Gujarat**

*Aapka Swasthya Setu — केयर सेतु*

</div>

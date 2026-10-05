# CareSetu (केयर सेतु) — Bridge to Healthcare 🏥

<div align="center">

![CareSetu](https://img.shields.io/badge/CareSetu-Bridge%20to%20Healthcare-0d9488?style=for-the-badge&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq_AI-F55036?style=flat-square&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)

**A full-stack Indian healthcare bridge platform** — buy genuine medicines, book emergency ambulances with live GPS tracking, consult an AI Doctor, and discover verified hospitals near you.

**Primary Hub: Vadodara, Gujarat, India**

</div>

---

## What is CareSetu?

CareSetu (केयर सेतु, *"Care Bridge"*) is a comprehensive digital healthcare platform built for India. It solves the fragmented nature of accessing healthcare services by putting everything a person needs in a health emergency in one single, mobile-first Progressive Web App.

---

## Key Features

### 1. Online Pharmacy & Medical Equipment
- Curated catalog with medicines and medical devices in INR
- Schedule H prescription compliance with pharmacist review
- Multi-payment: Cash on Delivery, Mock Card, UPI QR + bank UTR
- Real-time order tracking: pending -> confirmed -> shipped -> delivered

### 2. Emergency Ambulance Dispatch
- PostGIS geolocation finds the nearest on-duty ambulance
- 1-Tap SOS booking with live status timeline via Supabase Realtime
- Always-On 108 and 112 hotlines accessible everywhere, even offline

### 3. Driver Console (/driver)
- Dedicated ambulance driver dashboard with 5-second GPS beacon broadcasting
- Mission state controls and Google Maps navigation to patient pickup
- Demo driver mode for testing without login

### 4. AI Doctor Chatbot (/ai-doctor)
- Dual-Layer Safety: Client-side keyword scanner (English + Hindi) + Groq Qwen 27B AI
- Emergency Modal with audio chime and direct 108/112 triggers on red-flag detection
- Voice input via Web Speech API
- Chat history saved to Supabase with severity ratings

### 5. Vadodara Hospitals & Free Health Camps
- 10 real verified hospitals: Zydus, Sterling, Bhailal Amin (BAGH), SSG, and more
- Safe Data Policy: hospitals with unconfirmed GPS have NULL location by design
- Interactive Leaflet Map with radius slider and 24/7 emergency filter
- Free community wellness camps with countdown days

### 6. Admin & Pharmacist Portal (/admin)
- Order lifecycle management, prescription review, UPI payment reconciliation
- Inventory CRUD with quick stock steppers
- Hospital GPS Manager for safely adding verified coordinates

### 7. Progressive Web App (PWA)
- Installable on mobile and desktop
- Service Worker with offline caching
- Offline Banner always shows 108/112 when connectivity drops
- Mobile floating SOS button and toast notifications throughout

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v3 + Lucide Icons |
| Typography | Google Fonts — Inter |
| Mapping | Leaflet + React-Leaflet + OpenStreetMap |
| Backend & Database | Supabase (PostgreSQL 15 + PostGIS) |
| Authentication | Supabase Auth + Row-Level Security (RLS) |
| AI / LLM | Groq API — qwen/qwen3.8-27b (streaming) |
| Edge Functions | Deno TypeScript Supabase Edge Functions |
| Payments | Manual UPI QR (qrcode.react) + COD |
| PWA | Service Worker + Web App Manifest |
| Voice | Web Speech API |
| Realtime | Supabase Realtime Channels (WebSocket) |

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm v9+
- A Supabase project with PostGIS enabled
- A Groq API key (https://console.groq.com)

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhaw1015/CARE-SETU.git
cd CARE-SETU
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root (gitignored — never committed):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_UPI_ID=yourname@upi
VITE_UPI_NAME=Your Business Name
VITE_ENABLE_MOCK_PAYMENT=true
```

See `.env.example` for the full template.

### 3. Apply Database Migrations
Run the SQL in your Supabase SQL Editor:
```
supabase/migrations/00001_initial_schema.sql
```

### 4. Run Locally
```bash
npm run dev
```
App launches at http://localhost:5173/

### 5. Build for Production
```bash
npm run build
```

---

## Demo Walkthrough

### As a Patient
1. Browse /pharmacy, search "Dolo" or "Pan 40", add to cart
2. Checkout with Manual UPI QR, enter mock UTR e.g. UTR1234567890
3. Visit /orders to see real-time order status

### Testing AI Safety (Critical Feature)
1. Open /ai-doctor
2. Type a normal question: "What helps a mild dry cough?" — watch streaming AI response
3. Type a cardiac red flag: "I have severe chest pain and left arm numbness"
4. The Emergency Overlay should instantly appear with audio alert BEFORE the AI responds

### As a Driver
1. Open /driver — switch to Demo Driver Mode
2. Click Start GPS Broadcast to simulate live ambulance location
3. Advance mission states when a request comes in

### As an Admin/Pharmacist
1. Open /admin — click Switch to Demo Admin
2. Orders tab: update order statuses
3. UPI tab: confirm payment with the UTR from step 1 above
4. Inventory tab: use stock steppers
5. Hospitals tab: filter Missing GPS and add verified coordinates

---

## Database Schema

```
users (Supabase Auth)
├── profiles (full_name, role: patient/pharmacist/driver/admin)
├── orders → order_items → products
├── prescriptions (pharmacist review workflow)
├── cart_items (real-time cloud sync)
├── emergency_requests → ambulances (PostGIS POINT locations)
├── hospitals (PostGIS, nullable coords for unverified data)
├── health_camps (free community medical camps)
└── ai_consultations (chat history with severity ratings)
```

PostGIS Functions:
- `nearest_ambulances(lat, lng, lim)` — returns nearest N available ambulances
- `hospitals_within_radius(lat, lng, radius_km)` — hospitals within radius

---

## Security & Medical Disclaimers

1. **Medical Disclaimer**: CareSetu AI Doctor provides general health information only — not a substitute for professional medical advice.
2. **Emergency**: Always dial 108 (Ambulance) or 112 (National Emergency) in life-threatening situations.
3. **Data Integrity**: No fabricated coordinates or phone numbers. Wrong data is worse than missing data.
4. **Security**: All DB operations use Supabase Row-Level Security. Patients can only access their own data.
5. **API Keys**: Never committed to the repo — always use environment variables.

---

## Project Structure

```
CareAI/
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   └── favicon.svg
├── src/
│   ├── components/         # Navbar, Footer, SOSButton, ProductCard, etc.
│   ├── context/            # AuthContext, CartContext, ToastContext, GeolocationContext
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── pharmacy/       # Search, Cart, Checkout, OrderPlaced
│   │   ├── equipment/      # EquipmentList
│   │   ├── emergency/      # Emergency dispatch
│   │   ├── ai-doctor/      # Groq streaming + dual-layer safety
│   │   ├── nearby/         # Hospitals and Camps with Leaflet maps
│   │   ├── orders/         # MyOrders
│   │   ├── driver/         # DriverDashboard with GPS beacon
│   │   ├── admin/          # Full operations control center
│   │   └── auth/           # Login, Profile
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   └── utils.js
│   ├── App.jsx             # Root routing + offline banner + mobile SOS
│   └── main.jsx            # App entry point
├── supabase/migrations/
│   └── 00001_initial_schema.sql
├── .env.example            # Template — copy to .env and fill keys
├── .gitignore              # .env excluded — credentials are safe
└── README.md
```

---

## License

MIT License

---

<div align="center">

© 2025 CareSetu India — Built with love for Vadodara, Gujarat, India

*Aapka Swasthya Setu — Bridge to Quality Care*

</div>

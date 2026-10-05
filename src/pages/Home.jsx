import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Pill,
  Stethoscope,
  Ambulance,
  Bot,
  MapPin,
  CalendarHeart,
  PhoneCall,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Navigation
} from "lucide-react";
import SOSButton from "../components/SOSButton";
import { formatDistance, getGoogleMapsSearchUrl } from "../lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to pharmacy search
    navigate(`/pharmacy?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // 6 Quick Action Feature Cards
  const quickActions = [
    {
      title: "Buy Medicines",
      desc: "Doorstep delivery of OTC and prescription medicines across India.",
      icon: Pill,
      link: "/pharmacy",
      color: "from-teal-500 to-emerald-600",
      bgLight: "bg-teal-50",
      border: "border-teal-100",
      tag: "Verified Genuine",
    },
    {
      title: "Medical Equipment",
      desc: "BP monitors, pulse oximeters, wheelchairs & home ICU gear.",
      icon: Stethoscope,
      link: "/equipment",
      color: "from-blue-500 to-cyan-600",
      bgLight: "bg-blue-50",
      border: "border-blue-100",
      tag: "Certified Devices",
    },
    {
      title: "Emergency Ambulance",
      desc: "Instant dispatch with live GPS tracking on Leaflet map.",
      icon: Ambulance,
      link: "/emergency",
      color: "from-red-600 to-rose-700",
      bgLight: "bg-red-50",
      border: "border-red-200",
      tag: "24x7 Rapid Dispatch",
      isEmergency: true,
    },
    {
      title: "AI Doctor Triage",
      desc: "Dual-layer safety symptoms checker powered by Groq LLM.",
      icon: Bot,
      link: "/ai-doctor",
      color: "from-purple-600 to-indigo-600",
      bgLight: "bg-purple-50",
      border: "border-purple-100",
      tag: "AI + Safety Red-Flags",
    },
    {
      title: "Nearby Hospitals",
      desc: "Explore 10 verified Vadodara hospitals with emergency filters.",
      icon: MapPin,
      link: "/nearby/hospitals",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      border: "border-amber-100",
      tag: "Vadodara Verified",
    },
    {
      title: "Free Health Camps",
      desc: "Upcoming community eye, cardiac & wellness camps in Vadodara.",
      icon: CalendarHeart,
      link: "/nearby/camps",
      color: "from-emerald-600 to-teal-700",
      bgLight: "bg-emerald-50",
      border: "border-emerald-100",
      tag: "100% Free Access",
    },
  ];

  // Spotlight of Real Vadodara Emergency Centers
  const vadodaraSpotlight = [
    {
      name: "Zydus Multispeciality and Cancer Hospital",
      address: "Akshar Chowk, Old Padra Rd, Tandalja, Vadodara",
      emergency: true,
      phone: null,
    },
    {
      name: "Aadicura Superspeciality Hospital",
      address: "Jetalpur Rd, Anand Nagar, Haripura, Vadodara",
      emergency: true,
      phone: null,
    },
    {
      name: "Bhailal Amin General Hospital (BAGH)",
      address: "Bhailal Amin Marg, Gorwa, Vadodara",
      emergency: true,
      phone: null,
    },
    {
      name: "Sir Sayajirao General Hospital (SSG)",
      address: "Jail Road, Vadodara (Government Emergency)",
      emergency: true,
      phone: null,
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-10 sm:pt-16 pb-12 sm:pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 bg-brand-100/80 border border-brand-200/80 px-3 py-1 rounded-full text-xs font-bold text-brand-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Aapka Swasthya Setu — Bridge to Quality Care in India</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Everything You Need in a{" "}
              <span className="bg-gradient-to-r from-brand-600 to-teal-500 bg-clip-text text-transparent">
                Health Situation
              </span>
              , in One Place.
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              From doorstep medicine delivery and medical equipment to instant 24x7 ambulance dispatch, AI symptom triage, and Vadodara emergency hospital mapping.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-xl mx-auto relative flex items-center shadow-lg shadow-brand-900/5 rounded-2xl overflow-hidden border border-slate-200 bg-white"
            >
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines (e.g., Dolo, Pan 40), BP monitors..."
                className="w-full py-3.5 px-3 text-sm focus:outline-none text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-3.5 text-xs font-bold transition-colors uppercase tracking-wider flex items-center space-x-1"
              >
                <span>Search</span>
              </button>
            </form>

            {/* Quick Emergency Strip */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <SOSButton size="normal" />

              <a
                href="tel:108"
                className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                <span>Call 108 Ambulance</span>
              </a>

              <a
                href="tel:112"
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                <span>Call 112 National</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Quick Action Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Healthcare Services
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Select what you need right now for immediate care or scheduled home delivery.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-xs font-semibold text-slate-500 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            <span>All services active in Vadodara & Pan-India</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className={`group relative p-6 rounded-3xl bg-white border ${action.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden`}
              >
                {/* Background Tint Gradient on Hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`}></div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${action.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${action.isEmergency ? "text-red-600" : "text-brand-700"}`} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      action.isEmergency 
                        ? "bg-red-100 text-red-700" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {action.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-5 flex items-center text-xs font-bold text-brand-600 group-hover:text-brand-700 relative z-10">
                  <span>Access Service</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Vadodara 24x7 Emergency Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold text-red-300">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              <span>Vadodara Emergency Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              24x7 Critical Care & Trauma Centers
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Verified real hospitals in Vadodara equipped for trauma, oncology, and 24-hour emergencies.
            </p>
          </div>

          {/* Hospital Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-10">
            {vadodaraSpotlight.map((hosp) => (
              <div
                key={hosp.name}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-red-400/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {hosp.name}
                    </h4>
                    <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                      Emergency
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-start space-x-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                    <span>{hosp.address}</span>
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-3 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Phone not available (Call 108/112)
                  </span>
                  <a
                    href={getGoogleMapsSearchUrl(hosp.name, hosp.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-brand-300 hover:text-white font-medium transition-colors"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 gap-3">
            <p className="text-[11px] text-slate-400">
              * Hospital details are compiled from public information. Please call to confirm before visiting.
            </p>
            <Link
              to="/nearby/hospitals"
              className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <span>View All 10 Vadodara Hospitals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Safety Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pharmacist Verified</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Mandatory prescription verification for Schedule H drugs. Secure private storage with zero data leaks.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">PostGIS Live Geolocation</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Sub-kilometer spatial calculations using OpenStreetMap. Real-time driver GPS broadcast every 5 seconds.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Groq Dual-Layer AI Safety</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Rule-based red-flag keyword detection overrides instantly for heart attack or trauma before AI generation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

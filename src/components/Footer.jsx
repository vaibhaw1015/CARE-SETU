import React from "react";
import { Link } from "react-router-dom";
import { Heart, PhoneCall, ShieldCheck, MapPin, Mail, AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">CareSetu</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              CareSetu (केयर सेतु) puts everything a person needs in a health situation in one place: genuine medicines, medical equipment, 24x7 emergency ambulance dispatch with live GPS tracking, and AI triage guidance.
            </p>
            <div className="flex items-center space-x-2 text-xs text-brand-400 font-medium pt-1">
              <MapPin className="w-4 h-4" />
              <span>Primary Hub: Vadodara, Gujarat, India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Health Services</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/pharmacy" className="hover:text-brand-400 transition-colors">
                  Buy Medicines
                </Link>
              </li>
              <li>
                <Link to="/equipment" className="hover:text-brand-400 transition-colors">
                  Medical Equipment
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-brand-400 transition-colors">
                  Request Ambulance
                </Link>
              </li>
              <li>
                <Link to="/ai-doctor" className="hover:text-brand-400 transition-colors">
                  AI Doctor Chatbot
                </Link>
              </li>
              <li>
                <Link to="/nearby/hospitals" className="hover:text-brand-400 transition-colors">
                  Nearby Hospitals (Vadodara)
                </Link>
              </li>
              <li>
                <Link to="/nearby/camps" className="hover:text-brand-400 transition-colors">
                  Free Health Camps
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals & Roles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Portals & Account</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  User Login & Signup
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-400 transition-colors">
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link to="/driver" className="hover:text-brand-400 transition-colors">
                  Ambulance Driver Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-brand-400 transition-colors">
                  Pharmacist / Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* 24x7 Helplines */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency Helplines</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 uppercase block">Medical Emergency</span>
                <a href="tel:108" className="text-sm font-bold text-white hover:text-red-400">
                  Dial 108 (National Ambulance)
                </a>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 uppercase block">All-in-One Emergency</span>
                <a href="tel:112" className="text-sm font-bold text-white hover:text-red-400">
                  Dial 112 (Police, Fire, Medical)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4 mb-8 flex items-start space-x-3 text-xs text-slate-400">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300">Important Medical Disclaimer:</strong> CareSetu is a digital healthcare connector. The AI Doctor triage tool and hospital directory are compiled from public data for informational purposes only and do not replace professional medical judgment, diagnosis, or treatment. Always consult qualified healthcare professionals or call 108/112 in life-threatening emergencies.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareSetu India. Built with care for health and community safety.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span>Currency: INR (₹)</span>
            <span>•</span>
            <span>Secure Supabase RLS</span>
            <span>•</span>
            <span>Vadodara, Gujarat</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { PhoneCall, AlertTriangle, X, ShieldAlert, HeartPulse, Navigation } from "lucide-react";

export default function SOSModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-red-500 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
      >
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-2xl font-black tracking-tight">
                EMERGENCY SOS
              </h2>
              <p className="text-red-100 text-xs font-medium">
                Immediate medical assistance in India
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 leading-relaxed font-medium">
              If someone is experiencing chest pain, severe bleeding, breathing distress, stroke symptoms, or unconsciousness, <strong>dial emergency helplines immediately</strong>.
            </p>
          </div>

          {/* Quick Helplines */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:108"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-transform active:scale-95 shadow-md shadow-red-200 text-center group"
            >
              <PhoneCall className="w-6 h-6 mb-1 group-hover:animate-pulse" />
              <span className="text-lg">Call 108</span>
              <span className="text-[11px] font-normal text-red-100">National Ambulance</span>
            </a>

            <a
              href="tel:112"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-transform active:scale-95 shadow-md text-center group"
            >
              <PhoneCall className="w-6 h-6 mb-1 group-hover:animate-pulse" />
              <span className="text-lg">Call 112</span>
              <span className="text-[11px] font-normal text-slate-300">All-in-One Helpline</span>
            </a>
          </div>

          {/* Platform Actions */}
          <div className="space-y-2.5 pt-2">
            <Link
              to="/emergency"
              onClick={onClose}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-red-600 bg-red-50/50 hover:bg-red-100/70 text-red-900 font-bold transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-red-950">Book CareSetu Ambulance</div>
                  <div className="text-xs text-red-700 font-normal">Live GPS tracking & hospital dispatch</div>
                </div>
              </div>
              <span className="text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-full group-hover:translate-x-1 transition-transform">
                Book Now &rarr;
              </span>
            </Link>

            <Link
              to="/nearby/hospitals"
              onClick={onClose}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 text-slate-800 font-semibold transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">Nearby Emergency Hospitals</div>
                  <div className="text-xs text-slate-500 font-normal">View 24x7 trauma centers in Vadodara</div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-brand-600 transition-colors">
                View &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            CareSetu Emergency Network • Vadodara Rapid Response Hub
          </p>
        </div>
      </div>
    </div>
  );
}

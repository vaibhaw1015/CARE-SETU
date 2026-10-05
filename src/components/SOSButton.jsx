import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import SOSModal from "./SOSModal";

export default function SOSButton({ className = "", size = "normal" }) {
  const [modalOpen, setModalOpen] = useState(false);

  const isSmall = size === "small";

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`relative inline-flex items-center justify-center font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-emergency-600 hover:from-red-700 hover:to-emergency-700 shadow-lg shadow-red-500/40 rounded-full transition-all transform active:scale-95 animate-pulse-ring focus:outline-none focus:ring-4 focus:ring-red-400/50 ${
          isSmall
            ? "px-3 py-1.5 text-xs space-x-1.5"
            : "px-4 py-2 text-sm space-x-2"
        } ${className}`}
        aria-label="Emergency SOS Assistance"
        title="Immediate Emergency Medical Assistance"
      >
        <AlertCircle className={isSmall ? "w-3.5 h-3.5 animate-spin" : "w-4 h-4 animate-spin"} style={{ animationDuration: '3s' }} />
        <span>SOS EMERGENCY</span>
      </button>

      <SOSModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

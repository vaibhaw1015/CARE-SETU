import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, CheckCircle, Info } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function UpiQr({ orderId, amount, upiId, upiName }) {
  const payeeId = upiId || import.meta.env.VITE_UPI_ID || "caresetu@upi";
  const payeeName = upiName || import.meta.env.VITE_UPI_NAME || "CareSetu Health Services";
  const formattedAmount = Number(amount).toFixed(2);
  const transactionNote = `CareSetu Order ${orderId}`;

  // Standard India UPI deep link specification
  const upiLink = `upi://pay?pa=${encodeURIComponent(payeeId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 text-center">
      <div className="space-y-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
          Instant UPI Payment (0% Gateway Fees)
        </span>
        <h3 className="text-base font-black text-slate-900 mt-2">
          Scan QR Code using any UPI App
        </h3>
        <p className="text-xs text-slate-500">
          Works with Google Pay, PhonePe, Paytm, BHIM, and Cred
        </p>
      </div>

      {/* QR Code Canvas */}
      <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-inner">
        <QRCodeSVG
          value={upiLink}
          size={180}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230d9488'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      {/* Payment Meta Details */}
      <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-600 text-left">
        <div className="flex justify-between">
          <span>Payee Name:</span>
          <span className="font-bold text-slate-900">{payeeName}</span>
        </div>
        <div className="flex justify-between">
          <span>UPI ID (VPA):</span>
          <span className="font-mono text-slate-900 font-semibold">{payeeId}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
          <span>Payable Amount:</span>
          <span className="font-black text-brand-700 text-sm">{formatCurrency(amount)}</span>
        </div>
      </div>

      {/* Direct Mobile Deep Link Button */}
      <div>
        <a
          href={upiLink}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Pay via Installed UPI App</span>
        </a>
        <p className="text-[11px] text-slate-400 mt-2">
          (On mobile phones, tapping opens your UPI app with the exact amount pre-filled)
        </p>
      </div>
    </div>
  );
}

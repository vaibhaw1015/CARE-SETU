import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, Home, Clock, ShieldCheck, Sparkles, QrCode } from "lucide-react";

export default function OrderPlaced() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-" + Date.now().toString().slice(-6);
  const paymentMethod = searchParams.get("method") || "cod";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Order Successfully Placed</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Thank you for choosing CareSetu!
        </h1>
        <p className="text-xs text-slate-500">
          Your order has been recorded in our Vadodara distribution facility.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Order ID
            </span>
            <p className="text-xs font-mono font-bold text-slate-900">{orderId}</p>
          </div>
          <span className="text-[11px] font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-full capitalize">
            Payment: {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "mock" ? "Demo Mock Pay" : "Manual UPI"}
          </span>
        </div>

        {/* Dynamic Next Step Guidelines */}
        {paymentMethod === "cod" && (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <span className="font-bold flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Cash on Delivery Confirmation:</span>
            </span>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Your order status is marked as <strong>COD Pending</strong>. Please keep the exact cash amount ready or you can scan the delivery rider's UPI QR upon arrival.
            </p>
          </div>
        )}

        {paymentMethod === "mock" && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Demo Payment Verified:</span>
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Order marked as <strong>Paid (Confirmed)</strong> in demo simulation mode. Ready for packaging and delivery.
            </p>
          </div>
        )}

        {paymentMethod === "upi" && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <span className="font-bold flex items-center space-x-1.5">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Manual UPI Verification:</span>
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Your 12-digit UTR reference has been submitted. Our accounting team will reconcile it against the bank statement and update the status to <strong>Paid</strong> shortly.
            </p>
          </div>
        )}

        <div className="pt-2 text-xs text-slate-500 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>If any medicine requires a prescription, our pharmacist will review the document before dispatch.</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
        >
          <Package className="w-4 h-4" />
          <span>View in My Orders</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
        >
          <Home className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}

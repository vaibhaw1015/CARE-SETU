import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldAlert,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Truck,
  ArrowLeft,
  FileCheck
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../lib/utils";
import { placeOrder, executeMockPayment } from "../../lib/orderService";
import PrescriptionUpload from "../../components/PrescriptionUpload";
import UpiQr from "../../components/UpiQr";

export default function Checkout() {
  const { items, subtotal, deliveryCharge, total, requiresPrescription, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // State
  const [address, setAddress] = useState(profile?.address || "102, Shivalik Residency, Old Padra Road, Vadodara, Gujarat - 390020");
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' | 'mock' | 'upi'
  const [upiReference, setUpiReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Flags
  const isMockPaymentEnabled = import.meta.env.VITE_ENABLE_MOCK_PAYMENT === "true";

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add items from the pharmacy catalog before checking out.</p>
        <Link
          to="/pharmacy"
          className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          Go to Pharmacy
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Validate prescription requirement
    if (requiresPrescription && !prescriptionId) {
      setErrorMessage("Please upload a valid doctor's prescription for the Schedule H medicines in your cart.");
      window.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }

    // 2. Validate UPI reference if manual UPI selected
    if (paymentMethod === "upi" && !upiReference.trim()) {
      setErrorMessage("Please enter the 12-digit UPI transaction reference (UTR) after completing your payment.");
      return;
    }

    setLoading(true);

    try {
      // Step A: Create order in Supabase
      const result = await placeOrder({
        user,
        items,
        paymentMethod,
        deliveryAddress: address,
        prescriptionId,
        upiReference: paymentMethod === "upi" ? upiReference.trim() : null,
      });

      const orderId = result.orderId;

      // Step B: If Mock Payment, simulate payment step
      if (paymentMethod === "mock") {
        await executeMockPayment(orderId);
      }

      // Step C: Clear cart & navigate to Order Placed page
      clearCart();
      navigate(`/pharmacy/order-placed?orderId=${orderId}&method=${paymentMethod}`);
    } catch (err) {
      console.error("Order placement failed:", err);
      setErrorMessage(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout & Safe Payment
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            CareSetu Healthcare Logistics • Vadodara Delivery Hub
          </p>
        </div>

        <Link
          to="/pharmacy/cart"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Cart</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div>
            <span className="font-bold block">Checkout Attention Required:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery Address, Prescription, Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                1. Delivery Address (Vadodara & Beyond)
              </h2>
            </div>

            <div>
              <textarea
                required
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Door/Flat No, Apartment, Street, Locality, Vadodara, Gujarat - Pincode"
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Medicines will be dispatched via rapid local courier with tamper-evident seal.
              </p>
            </div>
          </div>

          {/* 2. Mandatory Prescription Upload (if requiresPrescription) */}
          {requiresPrescription ? (
            <div className="space-y-2">
              <PrescriptionUpload
                onPrescriptionUploaded={(id) => setPrescriptionId(id)}
                currentPrescriptionId={prescriptionId}
              />
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-2.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>All items in your cart are OTC. No doctor's prescription required.</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                OTC Approved
              </span>
            </div>
          )}

          {/* 3. Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                2. Select Payment Option
              </h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Cash on Delivery */}
              <label
                className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-brand-600 bg-brand-50/30 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                      <Banknote className="w-4 h-4 text-slate-700" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pay via cash or UPI to the delivery executive upon arrival at your doorstep.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-600">Standard</span>
              </label>

              {/* Option 2: Mock Payment (Demo Mode) */}
              {isMockPaymentEnabled && (
                <label
                  className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === "mock"
                      ? "border-amber-500 bg-amber-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="mock"
                      checked={paymentMethod === "mock"}
                      onChange={() => setPaymentMethod("mock")}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-amber-900 flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Mock Payment (Instant Demo Test)</span>
                      </div>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Simulates an instant successful bank transaction. No real money charged.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    DEMO
                  </span>
                </label>
              )}

              {/* Option 3: Manual UPI Payment */}
              <label
                className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "upi"
                    ? "border-brand-600 bg-brand-50/30 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                      <QrCode className="w-4 h-4 text-brand-600" />
                      <span>Manual UPI (QR Code & Deep Link)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Scan QR with Google Pay, PhonePe, Paytm, or BHIM. Enter transaction UTR to verify.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">0% Surcharge</span>
              </label>
            </div>

            {/* Mock Payment Banner Notice */}
            {paymentMethod === "mock" && (
              <div className="p-3.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span className="font-semibold">
                  DEMO MODE: No real money is charged. Clicking place order will automatically mark the order as paid.
                </span>
              </div>
            )}

            {/* Manual UPI QR Code Box */}
            {paymentMethod === "upi" && (
              <div className="pt-2 space-y-4">
                <UpiQr
                  orderId={`ORD-${Date.now().toString().slice(-6)}`}
                  amount={total}
                  upiId={import.meta.env.VITE_UPI_ID || "caresetu@upi"}
                  upiName={import.meta.env.VITE_UPI_NAME || "CareSetu Health Services"}
                />

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Step 2: Enter 12-Digit UPI Transaction ID / UTR Number
                  </label>
                  <input
                    type="text"
                    required={paymentMethod === "upi"}
                    value={upiReference}
                    onChange={(e) => setUpiReference(e.target.value)}
                    placeholder="e.g. 428198273619"
                    className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-500">
                    You can find this 12-digit reference number in your UPI app receipt under "UPI Ref No." or "UTR". Our admin/accounts team verifies it against our merchant statement.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Breakdown
            </h2>

            {/* Mini Items Preview */}
            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100 text-xs">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-2 flex justify-between items-center text-slate-700">
                  <div className="truncate pr-2">
                    <span className="font-semibold">{product.name}</span>
                    <span className="text-slate-400 ml-1">x {quantity}</span>
                  </div>
                  <span className="font-bold flex-shrink-0">
                    {formatCurrency(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-semibold text-slate-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatCurrency(deliveryCharge)
                  )}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-brand-700">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>
                    {paymentMethod === "mock"
                      ? "Pay Now (Demo Test)"
                      : paymentMethod === "cod"
                      ? "Confirm & Place COD Order"
                      : "Submit Order with UPI Reference"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p>🔒 256-Bit SSL Encrypted Verification</p>
              <p>Government Compliant Pharmacy Dispensary</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

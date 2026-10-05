import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShieldAlert, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../lib/utils";

export default function Cart() {
  const { items, subtotal, deliveryCharge, total, requiresPrescription, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/pharmacy/checkout" } } });
    } else {
      navigate("/pharmacy/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Your Medical Cart is Empty</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse genuine pharmaceuticals, OTC medicines, and home health devices with doorstep delivery.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/pharmacy"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Browse Medicines
          </Link>
          <Link
            to="/equipment"
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors"
          >
            Medical Equipment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Review Your Medical Cart
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Prescription Notice if applicable */}
      {requiresPrescription && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Prescription Required for Certain Items:</span>
            <span>
              Your cart contains Schedule H medicines (e.g. Antibiotics or Inhalers). You will be prompted to upload a valid doctor's prescription during checkout.
            </span>
          </div>
        </div>
      )}

      {/* Cart Grid: Items + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80";
                  }}
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    {product.requires_prescription && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Rx Required
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {product.name}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Unit: {formatCurrency(product.price)}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 w-5 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center hover:bg-brand-700"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">
                    {formatCurrency(product.price * quantity)}
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-[11px] text-red-500 hover:text-red-700 mt-0.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/pharmacy"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Doorstep Delivery:</span>
                <span className="font-semibold text-slate-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatCurrency(deliveryCharge)
                  )}
                </span>
              </div>

              {subtotal < 500 && (
                <div className="p-2.5 rounded-xl bg-teal-50 text-[11px] text-teal-800">
                  Add <strong>{formatCurrency(500 - subtotal)}</strong> more for <strong>FREE delivery</strong>!
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-brand-700">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-2 text-[11px] text-slate-400 text-center pt-2">
              <p>🔒 100% Genuine Medicines • Pharmacist Audited</p>
              <p>Available Payment Options: Cash on Delivery, Mock Pay, Manual UPI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

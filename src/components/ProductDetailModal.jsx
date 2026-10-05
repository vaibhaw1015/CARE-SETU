import React, { useState } from "react";
import { X, ShieldAlert, ShoppingCart, Plus, Minus, Check, Package, Info } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { useCart } from "../context/CartContext";

export default function ProductDetailModal({ product, onClose }) {
  const { items, addToCart, updateQuantity } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const cartItem = items.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image Column */}
          <div className="relative h-60 sm:h-full bg-slate-100">
            <img
              src={product.image_url}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80";
              }}
              className="w-full h-full object-cover"
            />
            {product.requires_prescription && (
              <div className="absolute bottom-3 left-3 bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                Rx Required
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
                  {product.category}
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-2 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Prescription warning notice */}
              {product.requires_prescription && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2 text-[11px] text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Valid doctor's prescription mandatory during checkout. Will be verified by licensed pharmacist.
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto">
                {product.description}
              </p>

              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Package className="w-4 h-4 text-slate-400" />
                <span>
                  {product.stock > 0 ? (
                    <strong className="text-emerald-700">{product.stock} units available</strong>
                  ) : (
                    <strong className="text-red-600">Currently Out of Stock</strong>
                  )}
                </span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-xs text-slate-400 line-through">
                      MRP {formatCurrency(product.mrp)}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {product.stock <= 0 ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : currentQuantity > 0 ? (
                <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl p-1.5">
                  <span className="text-xs font-bold text-brand-900 pl-2">In Cart:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white text-brand-700 font-bold flex items-center justify-center hover:bg-brand-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-brand-900">{currentQuantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                      className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center hover:bg-brand-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    addedAnimation
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 text-white hover:bg-brand-600 shadow-md"
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

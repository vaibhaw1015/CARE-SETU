import React, { useState } from "react";
import { Plus, Minus, Check, AlertCircle, Eye, ShoppingCart } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductCard({ product, onOpenDetail }) {
  const { items, addToCart, updateQuantity } = useCart();
  const toast = useToast();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
    toast.success(`${product.name} added to cart`);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (currentQuantity < product.stock) {
      updateQuantity(product.id, currentQuantity + 1);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, currentQuantity - 1);
  };

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(product)}
      className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-brand-300 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
            {product.requires_prescription && (
              <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                <span>Rx Required</span>
              </span>
            )}
            {discountPercent && (
              <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                isOutOfStock
                  ? "bg-slate-900/80 text-white backdrop-blur-xs"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <span className="text-[10px] text-slate-400 font-medium capitalize">
              {product.type}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Price & Add to Cart Footer */}
      <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-base font-black text-slate-900">
            {formatCurrency(product.price)}
          </div>
          {product.mrp && product.mrp > product.price && (
            <div className="text-[11px] text-slate-400 line-through -mt-0.5">
              MRP {formatCurrency(product.mrp)}
            </div>
          )}
        </div>

        {/* Action button */}
        {isOutOfStock ? (
          <button
            disabled
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            Unavailable
          </button>
        ) : currentQuantity > 0 ? (
          <div className="flex items-center space-x-2 bg-brand-50 border border-brand-200 rounded-xl p-1">
            <button
              onClick={handleDecrement}
              className="w-6 h-6 rounded-lg bg-white text-brand-700 font-bold flex items-center justify-center hover:bg-brand-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-brand-900 w-4 text-center">
              {currentQuantity}
            </span>
            <button
              onClick={handleIncrement}
              className="w-6 h-6 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center hover:bg-brand-700 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              addedAnimation
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 text-white hover:bg-brand-600 active:scale-95 shadow-xs"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

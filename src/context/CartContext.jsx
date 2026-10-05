import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";

const CartContext = createContext({
  items: [],
  cartCount: 0,
  subtotal: 0,
  deliveryCharge: 0,
  total: 0,
  requiresPrescription: false,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

const CART_STORAGE_KEY = "caresetu_cart_items";

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  }, [items]);

  // Sync with Supabase cart_items when user signs in
  useEffect(() => {
    if (!user) return;

    async function syncCart() {
      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select("id, quantity, product:products(*)")
          .eq("user_id", user.id);

        if (!error && data && data.length > 0) {
          const dbItems = data
            .filter((row) => row.product)
            .map((row) => ({
              product: row.product,
              quantity: row.quantity,
              dbId: row.id,
            }));
          setItems(dbItems);
        }
      } catch (err) {
        console.error("Cart sync error:", err);
      }
    }

    syncCart();
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    // If logged in, sync with Supabase cart_items
    if (user) {
      try {
        await supabase
          .from("cart_items")
          .upsert(
            {
              user_id: user.id,
              product_id: product.id,
              quantity: quantity,
            },
            { onConflict: "user_id,product_id" }
          );
      } catch (err) {
        console.warn("Could not sync item to DB cart:", err);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    if (user) {
      try {
        await supabase
          .from("cart_items")
          .update({ quantity })
          .match({ user_id: user.id, product_id: productId });
      } catch (err) {
        console.warn("Could not update item quantity in DB:", err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));

    if (user) {
      try {
        await supabase
          .from("cart_items")
          .delete()
          .match({ user_id: user.id, product_id: productId });
      } catch (err) {
        console.warn("Could not remove item from DB cart:", err);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);

    if (user) {
      try {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id);
      } catch (err) {
        console.warn("Could not clear DB cart:", err);
      }
    }
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.product.price) || 0) * item.quantity,
    0
  );

  // Free delivery above ₹500, otherwise ₹40 flat
  const deliveryCharge = items.length === 0 ? 0 : subtotal >= 500 ? 0 : 40;
  const total = subtotal + deliveryCharge;

  // Check if any product in cart requires a prescription
  const requiresPrescription = items.some(
    (item) => item.product.requires_prescription === true
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        deliveryCharge,
        total,
        requiresPrescription,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

import { supabase } from "./supabaseClient";

/**
 * Places an order securely.
 * Tries Supabase Edge Function 'place-order' first.
 * Falls back to client-driven database flow with database price re-verification.
 */
export async function placeOrder({
  user,
  items,
  paymentMethod,
  deliveryAddress,
  prescriptionId = null,
  upiReference = null,
}) {
  if (!user) throw new Error("User must be authenticated to place an order");
  if (!items || items.length === 0) throw new Error("Cart is empty");
  if (!deliveryAddress) throw new Error("Delivery address is required");

  // Format payload for Edge Function
  const payload = {
    items: items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
    })),
    paymentMethod,
    deliveryAddress,
    prescriptionId,
    upiReference,
  };

  try {
    // 1. Try Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("place-order", {
      body: payload,
    });

    if (!error && data && data.success) {
      return data;
    }
  } catch (edgeErr) {
    console.warn("Edge function invocation unavailable, proceeding with direct DB order creation:", edgeErr);
  }

  // 2. Direct DB execution fallback (ensuring server prices from products table)
  const productIds = items.map((i) => i.product.id);
  const { data: dbProducts, error: prodErr } = await supabase
    .from("products")
    .select("id, price, stock, requires_prescription")
    .in("id", productIds);

  if (prodErr || !dbProducts) {
    throw new Error("Could not verify product catalog in database");
  }

  let subtotal = 0;
  const orderItemsData = [];

  for (const item of items) {
    const dbProd = dbProducts.find((p) => p.id === item.product.id);
    if (!dbProd) throw new Error(`Product ${item.product.name} not found in database`);
    if (dbProd.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.product.name}`);
    }

    const itemPrice = Number(dbProd.price);
    subtotal += itemPrice * item.quantity;

    orderItemsData.push({
      product_id: dbProd.id,
      quantity: item.quantity,
      price: itemPrice,
    });
  }

  const deliveryCharge = subtotal >= 500 ? 0 : 40;
  const total = subtotal + deliveryCharge;

  let paymentStatus = "pending";
  if (paymentMethod === "cod") {
    paymentStatus = "cod_pending";
  }

  // Insert into orders table
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total,
      status: "pending",
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      upi_reference: upiReference || null,
      delivery_address: deliveryAddress,
      prescription_id: prescriptionId || null,
    })
    .select()
    .single();

  if (orderErr) throw orderErr;

  // Insert order items
  const itemsWithOrderId = orderItemsData.map((oi) => ({
    ...oi,
    order_id: order.id,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId);

  if (itemsErr) {
    console.warn("Order items warning:", itemsErr);
  }

  return {
    success: true,
    orderId: order.id,
    total,
    paymentStatus,
  };
}

/**
 * Handles Mock Payment completion
 */
export async function executeMockPayment(orderId) {
  try {
    const { data, error } = await supabase.functions.invoke("mock-pay", {
      body: { orderId },
    });

    if (!error && data && data.success) {
      return data;
    }
  } catch (edgeErr) {
    console.warn("Edge function mock-pay unavailable, updating order directly in demo mode:", edgeErr);
  }

  // Fallback demo update
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, order: data };
}

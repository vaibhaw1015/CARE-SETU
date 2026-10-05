// Supabase Edge Function: place-order
// Enforces server-side price calculation, validates stock, and creates order records.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { items, paymentMethod, deliveryAddress, prescriptionId, upiReference } = await req.json();

    if (!items || items.length === 0 || !deliveryAddress || !paymentMethod) {
      return new Response(JSON.stringify({ error: "Invalid order payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch products from database to calculate server-authoritative prices
    const productIds = items.map((i: any) => i.productId);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, name, price, stock, requires_prescription")
      .in("id", productIds);

    if (productError || !products) {
      return new Response(JSON.stringify({ error: "Failed to verify products in database" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Validate stock and calculate authoritative total
    let calculatedSubtotal = 0;
    const validatedOrderItems = [];
    let requiresRx = false;

    for (const item of items) {
      const dbProd = products.find((p) => p.id === item.productId);
      if (!dbProd) {
        return new Response(JSON.stringify({ error: `Product ${item.productId} not found` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (dbProd.stock < item.quantity) {
        return new Response(JSON.stringify({ error: `Insufficient stock for ${dbProd.name}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (dbProd.requires_prescription) {
        requiresRx = true;
      }

      const itemTotal = Number(dbProd.price) * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        product_id: dbProd.id,
        quantity: item.quantity,
        price: dbProd.price,
      });
    }

    // If prescription is required, verify prescriptionId was passed
    if (requiresRx && !prescriptionId) {
      return new Response(JSON.stringify({ error: "Doctor prescription required for these medicines" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delivery calculation: Free above ₹500, else ₹40
    const deliveryCharge = calculatedSubtotal >= 500 ? 0 : 40;
    const finalTotal = calculatedSubtotal + deliveryCharge;

    // Determine initial payment status
    let paymentStatus = "pending";
    if (paymentMethod === "cod") {
      paymentStatus = "cod_pending";
    }

    // 3. Insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: finalTotal,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        upi_reference: upiReference || null,
        delivery_address: deliveryAddress,
        prescription_id: prescriptionId || null,
      })
      .select()
      .single();

    if (orderError) {
      return new Response(JSON.stringify({ error: orderError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Insert order items
    const orderItemsPayload = validatedOrderItems.map((oi) => ({
      ...oi,
      order_id: orderData.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error("Order items insert warning:", itemsError);
    }

    // 5. Decrement stock
    for (const item of items) {
      const dbProd = products.find((p) => p.id === item.productId);
      if (dbProd) {
        await supabase
          .from("products")
          .update({ stock: Math.max(0, dbProd.stock - item.quantity) })
          .eq("id", dbProd.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderData.id,
        total: finalTotal,
        paymentStatus,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

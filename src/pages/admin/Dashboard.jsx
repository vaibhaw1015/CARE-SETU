import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Package,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Navigation,
  Truck,
  RefreshCw,
  IndianRupee,
  Layers,
  Check,
  ExternalLink,
  ChevronDown,
  Clock,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../lib/utils";

const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending", cls: "bg-amber-100 text-amber-800" },
  { value: "confirmed", label: "Confirmed", cls: "bg-blue-100 text-blue-800" },
  { value: "shipped", label: "Shipped", cls: "bg-purple-100 text-purple-800" },
  { value: "delivered", label: "Delivered", cls: "bg-emerald-100 text-emerald-800" },
  { value: "cancelled", label: "Cancelled", cls: "bg-red-100 text-red-800" },
];

function extractCoords(loc) {
  if (!loc) return null;
  if (typeof loc === "object" && Array.isArray(loc.coordinates)) {
    return { lng: loc.coordinates[0], lat: loc.coordinates[1] };
  }
  if (typeof loc === "string") {
    const m = loc.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (m) return { lng: parseFloat(m[1]), lat: parseFloat(m[2]) };
  }
  return null;
}

export default function Dashboard() {
  const { user, role, demoRole, setDemoRole } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState({}); // order_id -> items
  const [prescriptions, setPrescriptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);

  // Modals & form state
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({ lat: "", lng: "", phone: "", is_emergency: false, data_verified: false });
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    type: "medicine",
    category: "General",
    price: "",
    mrp: "",
    stock: "",
    requires_prescription: false,
    description: "",
    image_url: "",
  });

  // Filter & Search states
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryType, setInventoryType] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all"); // all, missing, emergency, verified
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Fetch all administrative datasets
  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [ordRes, rxRes, prodRes, hospRes, ambRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("prescriptions").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("hospitals").select("*").order("name", { ascending: true }),
        supabase.from("ambulances").select("*").order("vehicle_number", { ascending: true }),
      ]);

      if (ordRes.data) setOrders(ordRes.data);
      if (rxRes.data) setPrescriptions(rxRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      if (hospRes.data) setHospitals(hospRes.data);
      if (ambRes.data) setAmbulances(ambRes.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch items for an expanded order
  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) {
      setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
      return;
    }
    const { data } = await supabase
      .from("order_items")
      .select("*, products(name, type)")
      .eq("order_id", orderId);
    if (data) {
      setOrderItems((prev) => ({ ...prev, [orderId]: data }));
    }
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
  };

  // Realtime updates on orders
  useEffect(() => {
    const channel = supabase
      .channel("admin_orders_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchAllData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  // Status transitions
  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order status updated to ${newStatus}`);
    } else {
      toast.error("Failed to update order status");
    }
  };

  // UPI Payment status update
  const updatePaymentStatus = async (orderId, newPaymentStatus, newOrderStatus) => {
    const payload = { payment_status: newPaymentStatus, updated_at: new Date().toISOString() };
    if (newOrderStatus) payload.status = newOrderStatus;

    const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...payload } : o))
      );
      toast.success(newPaymentStatus === "paid" ? "Payment confirmed ✓" : "Payment status updated");
    } else {
      toast.error("Failed to update payment status");
    }
  };

  // Prescription Review
  const reviewPrescription = async (rxId, status) => {
    const payload = {
      status,
      notes: prescriptionNotes,
      reviewed_by: user?.id || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("prescriptions").update(payload).eq("id", rxId);
    if (!error) {
      setPrescriptions((prev) =>
        prev.map((rx) => (rx.id === rxId ? { ...rx, ...payload } : rx))
      );
      setSelectedPrescription(null);
      setPrescriptionNotes("");
      toast.success(`Prescription ${status === "approved" ? "approved" : "rejected"}`);
    } else {
      toast.error("Failed to review prescription");
    }
  };

  // Product CRUD
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: productForm.name,
      type: productForm.type,
      category: productForm.category,
      price: parseFloat(productForm.price) || 0,
      mrp: parseFloat(productForm.mrp) || parseFloat(productForm.price) || 0,
      stock: parseInt(productForm.stock) || 0,
      requires_prescription: productForm.requires_prescription,
      description: productForm.description,
      image_url: productForm.image_url || null,
      is_active: true,
    };

    if (editingProduct) {
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id)
        .select()
        .single();
      if (!error && data) {
        setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        toast.success(`${data.name} updated successfully`);
      } else if (error) {
        toast.error("Failed to update product");
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        setProducts((prev) => [data, ...prev]);
        toast.success(`${data.name} added to inventory`);
      } else if (error) {
        toast.error("Failed to add product");
      }
    }
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleStockAdjust = async (productId, delta) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId);
    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      toast.success(`Stock ${delta > 0 ? "increased" : "decreased"} to ${newStock}`);
    } else {
      toast.error("Stock update failed");
    }
  };

  const handleToggleProductStatus = async (productId, currentActive) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !currentActive })
      .eq("id", productId);
    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: !currentActive } : p))
      );
    }
  };

  // Hospital Coordinate update
  const handleSaveHospital = async (e) => {
    e.preventDefault();
    if (!selectedHospital) return;

    let locationValue = null;
    if (hospitalForm.lat && hospitalForm.lng) {
      const lat = parseFloat(hospitalForm.lat);
      const lng = parseFloat(hospitalForm.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        locationValue = `POINT(${lng} ${lat})`;
      }
    }

    const payload = {
      phone: hospitalForm.phone.trim() || null,
      is_emergency: Boolean(hospitalForm.is_emergency),
      data_verified: Boolean(hospitalForm.data_verified),
    };
    if (locationValue !== undefined) {
      payload.location = locationValue;
    }

    const { error } = await supabase
      .from("hospitals")
      .update(payload)
      .eq("id", selectedHospital.id);

    if (!error) {
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === selectedHospital.id
            ? {
                ...h,
                phone: payload.phone,
                is_emergency: payload.is_emergency,
                data_verified: payload.data_verified,
                location: payload.location,
              }
            : h
        )
      );
      setSelectedHospital(null);
      toast.success("Hospital data saved successfully");
    } else {
      toast.error("Failed to save hospital data");
    }
  };

  // Ambulance availability toggle
  const toggleAmbulanceAvailability = async (ambId, currentAvail) => {
    const { error } = await supabase
      .from("ambulances")
      .update({ is_available: !currentAvail, updated_at: new Date().toISOString() })
      .eq("id", ambId);
    if (!error) {
      setAmbulances((prev) =>
        prev.map((a) => (a.id === ambId ? { ...a, is_available: !currentAvail } : a))
      );
    }
  };

  // Computed metrics
  const metrics = useMemo(() => {
    const totalRev = orders
      .filter((o) => o.payment_status === "paid" || o.status === "delivered")
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const pendingRx = prescriptions.filter((rx) => rx.status === "pending").length;
    const pendingUpi = orders.filter((o) => o.payment_method === "upi" && o.payment_status === "pending").length;
    const lowStock = products.filter((p) => p.stock < 10).length;
    const missingCoordsHospitals = hospitals.filter((h) => !h.location).length;

    return { totalRev, pendingOrders, pendingRx, pendingUpi, lowStock, missingCoordsHospitals };
  }, [orders, prescriptions, products, hospitals]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = orderFilter === "all" || o.status === orderFilter;
      const matchesSearch =
        !orderSearch ||
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.delivery_address && o.delivery_address.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.upi_reference && o.upi_reference.toLowerCase().includes(orderSearch.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesType = inventoryType === "all" || p.type === inventoryType;
      const matchesSearch =
        !inventorySearch ||
        p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.category.toLowerCase().includes(inventorySearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [products, inventoryType, inventorySearch]);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      if (hospitalFilter === "missing") return !h.location;
      if (hospitalFilter === "emergency") return h.is_emergency;
      if (hospitalFilter === "verified") return h.data_verified;
      return true;
    });
  }, [hospitals, hospitalFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading CareSetu Operations Hub…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Operations & Pharmacist Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CareSetu Control Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Orders, Prescriptions, UPI Reconciliation, Stock & Vadodara Medical Registry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Demo Role Switcher */}
          <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 text-xs font-semibold">
            <span className="px-2 text-slate-500 text-[11px]">Role:</span>
            <button
              onClick={() => setDemoRole("admin")}
              className={`px-2.5 py-1 rounded-xl text-xs transition-all ${
                role === "admin"
                  ? "bg-purple-600 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setDemoRole("pharmacist")}
              className={`px-2.5 py-1 rounded-xl text-xs transition-all ${
                role === "pharmacist"
                  ? "bg-brand-600 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pharmacist
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-600" : ""}`} />
            <span>{refreshing ? "Syncing…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(metrics.totalRev)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">From paid / delivered</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</p>
          <div className="flex items-center space-x-2">
            <p className="text-xl sm:text-2xl font-black text-slate-900">{metrics.pendingOrders}</p>
            {metrics.pendingOrders > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-[10px] text-slate-500">of {orders.length} total orders</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prescriptions</p>
          <p className="text-xl sm:text-2xl font-black text-purple-700">{metrics.pendingRx}</p>
          <p className="text-[10px] text-purple-600 font-semibold">Requires pharmacist check</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">UPI Approvals</p>
          <p className="text-xl sm:text-2xl font-black text-amber-700">{metrics.pendingUpi}</p>
          <p className="text-[10px] text-amber-600 font-semibold">Pending UTR verify</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stock Alerts</p>
          <p className="text-xl sm:text-2xl font-black text-red-600">{metrics.lowStock}</p>
          <p className="text-[10px] text-red-600 font-semibold">&lt; 10 units in stock</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hospitals Missing GPS</p>
          <p className={`text-xl sm:text-2xl font-black ${metrics.missingCoordsHospitals > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {metrics.missingCoordsHospitals}
          </p>
          <p className="text-[10px] text-slate-500">Need coordinates</p>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex border-b border-slate-200 space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide pb-px">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "orders", label: `Orders (${orders.length})`, icon: Package },
          { id: "prescriptions", label: `Prescriptions (${metrics.pendingRx})`, icon: FileText },
          { id: "upi", label: `UPI Reconciliation (${metrics.pendingUpi})`, icon: IndianRupee },
          { id: "inventory", label: `Inventory (${products.length})`, icon: Plus },
          { id: "hospitals", label: `Hospitals (${hospitals.length})`, icon: MapPin },
          { id: "ambulances", label: `Ambulances (${ambulances.length})`, icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? "border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: OVERVIEW ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Quick Operations</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      type: "medicine",
                      category: "General",
                      price: "",
                      mrp: "",
                      stock: "",
                      requires_prescription: false,
                      description: "",
                      image_url: "",
                    });
                    setProductModalOpen(true);
                  }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors text-center"
                >
                  <Plus className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Add New Product</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("hospitals");
                    setHospitalFilter("missing");
                  }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors text-center"
                >
                  <MapPin className="w-5 h-5 mb-1 text-amber-600" />
                  <span className="text-xs font-bold">Resolve Missing GPS</span>
                </button>

                <button
                  onClick={() => setActiveTab("prescriptions")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors text-center"
                >
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Review Prescriptions</span>
                </button>

                <button
                  onClick={() => setActiveTab("upi")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors text-center"
                >
                  <IndianRupee className="w-5 h-5 mb-1 text-emerald-600" />
                  <span className="text-xs font-bold">Verify UPI UTRs</span>
                </button>
              </div>
            </div>

            {/* Critical Attention Required */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Action Items</span>
              </h2>

              <div className="space-y-2.5 text-xs">
                {metrics.pendingRx > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="font-semibold text-purple-900">
                      🩺 {metrics.pendingRx} prescription(s) awaiting approval
                    </span>
                    <button
                      onClick={() => setActiveTab("prescriptions")}
                      className="text-purple-700 font-bold hover:underline"
                    >
                      Review &rarr;
                    </button>
                  </div>
                )}

                {metrics.pendingUpi > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="font-semibold text-amber-900">
                      💳 {metrics.pendingUpi} UPI order(s) awaiting UTR verification
                    </span>
                    <button
                      onClick={() => setActiveTab("upi")}
                      className="text-amber-700 font-bold hover:underline"
                    >
                      Verify &rarr;
                    </button>
                  </div>
                )}

                {metrics.missingCoordsHospitals > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="font-semibold text-amber-900">
                      🏥 {metrics.missingCoordsHospitals} hospital(s) with missing coordinates
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab("hospitals");
                        setHospitalFilter("missing");
                      }}
                      className="text-amber-700 font-bold hover:underline"
                    >
                      Update &rarr;
                    </button>
                  </div>
                )}

                {metrics.lowStock > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50 border border-red-200">
                    <span className="font-semibold text-red-900">
                      ⚠️ {metrics.lowStock} product(s) are low in stock (&lt;10 units)
                    </span>
                    <button
                      onClick={() => setActiveTab("inventory")}
                      className="text-red-700 font-bold hover:underline"
                    >
                      Restock &rarr;
                    </button>
                  </div>
                )}

                {metrics.pendingRx === 0 &&
                  metrics.pendingUpi === 0 &&
                  metrics.missingCoordsHospitals === 0 &&
                  metrics.lowStock === 0 && (
                    <div className="text-center py-6 text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                      <p className="font-semibold text-slate-700">All Systems Clear</p>
                      <p className="text-[11px]">No urgent operational alerts at this time.</p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Recent Orders Snapshot */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Package className="w-4 h-4 text-brand-600" />
                <span>Recent Orders</span>
              </h2>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                View All ({orders.length}) &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900">{o.id.slice(0, 8)}…</td>
                      <td className="py-3 text-slate-500">
                        {new Date(o.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 font-bold text-slate-900">{formatCurrency(o.total)}</td>
                      <td className="py-3">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {o.payment_method} · {o.payment_status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setActiveTab("orders");
                            fetchOrderItems(o.id);
                          }}
                          className="text-brand-600 font-bold hover:underline"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: ORDERS ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Order ID, Address, UTR…"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide">
              {ORDER_STATUSES.map((st) => (
                <button
                  key={st.value}
                  onClick={() => setOrderFilter(st.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    orderFilter === st.value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Order</th>
                    <th className="p-4">Delivery Address</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No orders match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <React.Fragment key={o.id}>
                        <tr className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 space-y-1">
                            <button
                              onClick={() => fetchOrderItems(o.id)}
                              className="font-mono font-bold text-slate-900 hover:text-brand-600 flex items-center space-x-1"
                            >
                              <span>#{o.id.slice(0, 8)}</span>
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                            <p className="text-[10px] text-slate-400">
                              {new Date(o.created_at).toLocaleString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {o.prescription_id && (
                              <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                <FileText className="w-2.5 h-2.5" />
                                <span>Prescription Attached</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="truncate text-slate-700 font-medium" title={o.delivery_address}>
                              {o.delivery_address}
                            </p>
                          </td>
                          <td className="p-4 font-black text-slate-900">{formatCurrency(o.total)}</td>
                          <td className="p-4 space-y-1">
                            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 block w-fit">
                              {o.payment_method}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full block w-fit ${
                                o.payment_status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : o.payment_status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                                o.status === "delivered"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : o.status === "shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : o.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : o.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>

                        {/* Expanded Items Drawer */}
                        {selectedOrderId === o.id && (
                          <tr className="bg-slate-50/90 border-b border-slate-200">
                            <td colSpan={6} className="p-4 pl-8 space-y-3">
                              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                Order Items Breakdown:
                              </p>
                              {orderItems[o.id] ? (
                                <div className="space-y-1.5 max-w-xl">
                                  {orderItems[o.id].map((it) => (
                                    <div
                                      key={it.id}
                                      className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-slate-200"
                                    >
                                      <span className="font-semibold text-slate-800">
                                        {it.products?.name || "Product"} × {it.quantity}
                                      </span>
                                      <span className="font-mono text-slate-600">
                                        {formatCurrency(it.price * it.quantity)}
                                      </span>
                                    </div>
                                  ))}
                                  {o.upi_reference && (
                                    <p className="text-[11px] text-slate-500 mt-2">
                                      UPI UTR Reference: <strong className="font-mono text-slate-900">{o.upi_reference}</strong>
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">Loading order items…</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: PRESCRIPTIONS ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Prescription Approvals Queue</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pharmacist verification required for schedule H / prescription-only medicines before dispatch.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Rx ID</th>
                    <th className="p-3">Uploaded Date</th>
                    <th className="p-3">File Path / Attachment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No prescriptions uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    prescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">#{rx.id.slice(0, 8)}</td>
                        <td className="p-3 text-slate-500">
                          {new Date(rx.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="p-3">
                          <a
                            href={rx.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Document</span>
                          </a>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              rx.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : rx.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {rx.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{rx.notes || "—"}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPrescription(rx);
                              setPrescriptionNotes(rx.notes || "");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: UPI RECONCILIATION ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "upi" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              <span>Manual UPI Payments Reconciliation</span>
            </h2>
            <p className="text-xs text-slate-500">
              Review submitted bank UTR reference codes against your merchant bank statement and approve orders.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Submitted UTR Reference</th>
                    <th className="p-3">Payment Status</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.filter((o) => o.payment_method === "upi").length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No UPI orders found.
                      </td>
                    </tr>
                  ) : (
                    orders
                      .filter((o) => o.payment_method === "upi")
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900">#{o.id.slice(0, 8)}</td>
                          <td className="p-3 font-black text-slate-900">{formatCurrency(o.total)}</td>
                          <td className="p-3 font-mono font-bold text-brand-700 bg-brand-50/50 px-2 py-1 rounded">
                            {o.upi_reference || "No UTR Provided"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                o.payment_status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : o.payment_status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">
                            {new Date(o.created_at).toLocaleDateString("en-IN")}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {o.payment_status !== "paid" && (
                              <button
                                onClick={() => updatePaymentStatus(o.id, "paid", "confirmed")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                              >
                                Confirm Paid
                              </button>
                            )}
                            {o.payment_status !== "failed" && o.payment_status !== "paid" && (
                              <button
                                onClick={() => updatePaymentStatus(o.id, "failed", "cancelled")}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 5: INVENTORY ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search medicines, equipment…"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <select
                value={inventoryType}
                onChange={(e) => setInventoryType(e.target.value)}
                className="text-xs font-bold border border-slate-200 rounded-2xl px-3 py-2.5 bg-white text-slate-800 focus:outline-none shadow-sm"
              >
                <option value="all">All Types</option>
                <option value="medicine">Medicines Only</option>
                <option value="equipment">Equipment Only</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: "",
                  type: "medicine",
                  category: "General",
                  price: "",
                  mrp: "",
                  stock: "50",
                  requires_prescription: false,
                  description: "",
                  image_url: "",
                });
                setProductModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Type / Category</th>
                    <th className="p-4">Price / MRP</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4">Rx Required</th>
                    <th className="p-4">Active</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.description}</p>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-semibold text-slate-700">{p.type}</span>
                        <p className="text-[10px] text-slate-400">{p.category}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{formatCurrency(p.price)}</p>
                        <p className="text-[10px] text-slate-400 line-through">{formatCurrency(p.mrp)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStockAdjust(p.id, -5)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded ${
                              p.stock < 10 ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleStockAdjust(p.id, 5)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.requires_prescription
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.requires_prescription ? "Yes (Rx)" : "No"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleProductStatus(p.id, p.is_active)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {p.is_active ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm({
                              name: p.name,
                              type: p.type,
                              category: p.category,
                              price: String(p.price),
                              mrp: String(p.mrp),
                              stock: String(p.stock),
                              requires_prescription: p.requires_prescription,
                              description: p.description || "",
                              image_url: p.image_url || "",
                            });
                            setProductModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 6: HOSPITALS & SAFE COORDINATE MANAGER ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "hospitals" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex items-start space-x-3 text-xs text-amber-800 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 mb-0.5">Safe Medical Data Policy</p>
              <p>
                In a medical platform, <strong>wrong data is worse than missing data</strong>. If a hospital’s coordinates are not verified, leave them NULL. Do not invent fake coordinates or phone numbers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {[
                { id: "all", label: `All (${hospitals.length})` },
                { id: "missing", label: `Missing GPS (${metrics.missingCoordsHospitals})` },
                { id: "emergency", label: "24/7 Emergency" },
                { id: "verified", label: "Verified Data" },
              ].map((flt) => (
                <button
                  key={flt.id}
                  onClick={() => setHospitalFilter(flt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    hospitalFilter === flt.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Hospital Name & Address</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">GPS Coordinates</th>
                    <th className="p-4">24/7 Emergency</th>
                    <th className="p-4">Data Verified</th>
                    <th className="p-4 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHospitals.map((h) => {
                    const coords = extractCoords(h.location);
                    return (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 max-w-sm">
                          <p className="font-bold text-slate-900 text-sm">{h.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{h.address}</p>
                        </td>
                        <td className="p-4 font-mono font-semibold text-slate-700">
                          {h.phone ? (
                            <a href={`tel:${h.phone}`} className="hover:text-brand-600">
                              {h.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Not Available</span>
                          )}
                        </td>
                        <td className="p-4">
                          {coords ? (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              <span>
                                {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>NULL (Missing)</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              h.is_emergency
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {h.is_emergency ? "24/7 Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              h.data_verified
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {h.data_verified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedHospital(h);
                              setHospitalForm({
                                lat: coords ? String(coords.lat) : "",
                                lng: coords ? String(coords.lng) : "",
                                phone: h.phone || "",
                                is_emergency: Boolean(h.is_emergency),
                                data_verified: Boolean(h.data_verified),
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 font-bold text-xs transition-colors"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 7: AMBULANCES FLEET ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "ambulances" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Truck className="w-5 h-5 text-amber-600" />
              <span>Registered Ambulances Fleet (Vadodara)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Vehicle Number</th>
                    <th className="p-3">Equipment Type</th>
                    <th className="p-3">Fleet Category</th>
                    <th className="p-3">Current Availability</th>
                    <th className="p-3">Last Ping</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ambulances.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{a.vehicle_number}</td>
                      <td className="p-3 capitalize font-semibold text-slate-700">
                        {a.type === "icu" ? "ICU with Ventilator" : "Basic Life Support"}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {a.is_demo ? "Demo Fleet" : "Verified Fleet"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            a.is_available
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {a.is_available ? "Available" : "Dispatched / Off-Duty"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(a.updated_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleAmbulanceAvailability(a.id, a.is_available)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            a.is_available
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {a.is_available ? "Set Off-Duty" : "Set Available"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: PRESCRIPTION REVIEW ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>Review Prescription #{selectedPrescription.id.slice(0, 8)}</span>
              </h3>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Prescription File</p>
                  <p className="text-slate-500 text-[11px] truncate max-w-xs">{selectedPrescription.file_path}</p>
                </div>
                <a
                  href={selectedPrescription.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open File</span>
                </a>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pharmacist Notes / Reason for Rejection:
                </label>
                <textarea
                  rows={3}
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="e.g. Valid doctor signature verified, approved for 10 strips."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => reviewPrescription(selectedPrescription.id, "approved")}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Approve Prescription
                </button>
                <button
                  onClick={() => reviewPrescription(selectedPrescription.id, "rejected")}
                  className="flex-1 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors"
                >
                  Reject Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: HOSPITAL COORDINATES & DATA ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Hospital Data & Coordinates</h3>
                <p className="text-xs text-slate-500">{selectedHospital.name}</p>
              </div>
              <button onClick={() => setSelectedHospital(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHospital} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude (°N)</label>
                  <input
                    type="text"
                    placeholder="e.g. 22.3072"
                    value={hospitalForm.lat}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, lat: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude (°E)</label>
                  <input
                    type="text"
                    placeholder="e.g. 73.1812"
                    value={hospitalForm.lng}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, lng: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0265-2334455"
                  value={hospitalForm.phone}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hospitalForm.is_emergency}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, is_emergency: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span className="font-semibold text-slate-800">24/7 Emergency Department Available</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hospitalForm.data_verified}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, data_verified: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span className="font-semibold text-slate-800">Mark Hospital Data as Confirmed & Verified</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Save Hospital Coordinates
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHospital(null)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: PRODUCT INVENTORY FORM ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Medical Item"}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Paracetamol 650mg or Wheelchair"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none font-semibold"
                  >
                    <option value="medicine">Medicine</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Fever, Diabetes, Mobility"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="120"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="150"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Units</label>
                  <input
                    required
                    type="number"
                    placeholder="50"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Usage instructions, dosage, or equipment specs…"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/…"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.requires_prescription}
                    onChange={(e) =>
                      setProductForm({ ...productForm, requires_prescription: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Requires Doctor Prescription (Schedule H/X)
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {editingProduct ? "Update Item" : "Create Item"}
                </button>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


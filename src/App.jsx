import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { WifiOff, PhoneCall, Ambulance } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Profile from "./pages/auth/Profile";
import Search from "./pages/pharmacy/Search";
import EquipmentList from "./pages/equipment/EquipmentList";
import Cart from "./pages/pharmacy/Cart";
import Checkout from "./pages/pharmacy/Checkout";
import OrderPlaced from "./pages/pharmacy/OrderPlaced";
import Emergency from "./pages/emergency/Emergency";
import Chat from "./pages/ai-doctor/Chat";
import Hospitals from "./pages/nearby/Hospitals";
import Camps from "./pages/nearby/Camps";
import MyOrders from "./pages/orders/MyOrders";
import Dashboard from "./pages/admin/Dashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white relative">
      {/* Offline Emergency Fallback Banner */}
      {!isOnline && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>You are currently offline. Emergency hotlines remain active:</span>
          </div>
          <div className="flex items-center space-x-3">
            <a href="tel:108" className="bg-white text-red-700 px-2 py-0.5 rounded-full font-bold">
              Call 108
            </a>
            <a href="tel:112" className="bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">
              Call 112
            </a>
          </div>
        </div>
      )}

      {/* Global Navigation Bar with SOS & Cart Badge */}
      <Navbar />

      {/* Main Page Routing Container */}
      <main className="flex-1">
        <Routes>
          {/* Public Core Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pharmacy" element={<Search />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/pharmacy/cart" element={<Cart />} />
          <Route
            path="/pharmacy/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/pharmacy/order-placed" element={<OrderPlaced />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/ai-doctor" element={<Chat />} />

          {/* Nearby Services: Hospitals (Vadodara) & Free Camps */}
          <Route path="/nearby/hospitals" element={<Hospitals />} />
          <Route path="/nearby/camps" element={<Camps />} />

          {/* User Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* Role Protected Portals */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={["driver", "admin"]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Floating 1-Tap SOS Button */}
      <div className="sm:hidden fixed bottom-5 right-4 z-40">
        <Link
          to="/emergency"
          className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-full shadow-2xl shadow-red-500/50 font-black text-xs uppercase tracking-wider border-2 border-white animate-bounce active:scale-95"
        >
          <Ambulance className="w-4 h-4 animate-pulse" />
          <span>SOS Ambulance</span>
        </Link>
      </div>

      {/* Global Footer with Emergency Contacts & Vadodara Hub Info */}
      <Footer />
    </div>
  );
}

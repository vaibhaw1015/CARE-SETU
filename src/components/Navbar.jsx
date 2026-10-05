import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  Pill,
  Stethoscope,
  MapPin,
  CalendarHeart,
  Bot,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  PhoneCall,
  Shield,
  Truck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SOSButton from "./SOSButton";

export default function Navbar() {
  const { user, profile, role, signOut } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      setProfileDropdownOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { name: "Medicines", path: "/pharmacy", icon: Pill },
    { name: "Equipment", path: "/equipment", icon: Stethoscope },
    { name: "Nearby Hospitals", path: "/nearby/hospitals", icon: MapPin },
    { name: "Free Camps", path: "/nearby/camps", icon: CalendarHeart },
    { name: "AI Doctor", path: "/ai-doctor", icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Emergency Top Quick Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
            <span className="inline-flex items-center space-x-1 text-red-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>24x7 Emergency Helplines:</span>
            </span>
            <a href="tel:108" className="hover:text-white font-bold flex items-center space-x-1">
              <PhoneCall className="w-3 h-3 text-red-400" />
              <span>108 (Ambulance)</span>
            </a>
            <span className="text-slate-600">|</span>
            <a href="tel:112" className="hover:text-white font-bold flex items-center space-x-1">
              <PhoneCall className="w-3 h-3 text-red-400" />
              <span>112 (National)</span>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4 text-[11px]">
            <span className="text-slate-400">Serving Vadodara, Gujarat</span>
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">CareSetu</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">
                  India
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 font-medium">Bridge to Healthcare</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-slate-700">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-colors ${
                      isActive
                        ? "text-brand-700 bg-brand-50/80 font-semibold"
                        : "hover:text-brand-600 hover:bg-slate-100/70"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Actions: SOS Button, Cart, User Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* SOS Emergency Button */}
            <SOSButton size="small" />

            {/* Cart Icon */}
            <Link
              to="/pharmacy/cart"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-brand-600 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  aria-label="User Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-200">
                    {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profile?.full_name || "CareSetu User"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        Role: {role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    {role === "driver" && (
                      <Link
                        to="/driver"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 font-medium"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Driver Dashboard</span>
                      </Link>
                    )}

                    {(role === "admin" || role === "pharmacist") && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-brand-600 transition-colors shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-3 pb-2 border-t border-slate-100 mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Shield, CheckCircle, AlertCircle, LogOut, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

export default function Profile() {
  const { user, profile, role, refreshProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      setMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err) {
      console.error("Profile update failed:", err);
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 font-extrabold text-2xl flex items-center justify-center border-2 border-brand-200">
            {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {profile?.full_name || "CareSetu Member"}
            </h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-2 inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <Shield className="w-3 h-3 text-brand-600" />
              <span>Role: {role}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Role specific quick action banners */}
      {role === "driver" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="w-6 h-6 text-amber-700" />
            <div>
              <p className="text-xs font-bold text-amber-900">Active Ambulance Driver Portal</p>
              <p className="text-[11px] text-amber-700">Receive emergency calls and broadcast live GPS location.</p>
            </div>
          </div>
          <Link
            to="/driver"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Open Driver Portal &rarr;
          </Link>
        </div>
      )}

      {(role === "admin" || role === "pharmacist") && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-purple-700" />
            <div>
              <p className="text-xs font-bold text-purple-900">Management & Verification Dashboard</p>
              <p className="text-[11px] text-purple-700">Verify manual UPI references, approve prescriptions, manage stock.</p>
            </div>
          </div>
          <Link
            to="/admin"
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Open Admin Panel &rarr;
          </Link>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Contact & Delivery Information
        </h2>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Delivery Address (Vadodara / Pin Code)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Flat number, Society name, Street, Vadodara, Gujarat - Pincode"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Quick navigation to Orders */}
      <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShoppingBag className="w-5 h-5 text-slate-700" />
          <div>
            <p className="text-xs font-bold text-slate-800">Review Past Pharmacy Orders</p>
            <p className="text-[11px] text-slate-500">Track shipments, manual UPI reference status, and invoices.</p>
          </div>
        </div>
        <Link
          to="/orders"
          className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1"
        >
          <span>View Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

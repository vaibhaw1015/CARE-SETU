import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Heart, Lock, Mail, User, Phone, MapPin, AlertCircle, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("user");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, {
          fullName,
          phone,
          role,
          address,
        });
        setSuccessMsg(
          "Account created successfully! Please check your email or proceed to sign in."
        );
        setTimeout(() => {
          setIsSignUp(false);
        }, 1500);
      } else {
        await signInWithEmail(email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to quickly fill demo credentials for testing
  const handleQuickDemo = (demoRole) => {
    setIsSignUp(false);
    setErrorMsg("");
    if (demoRole === "admin") {
      setEmail("admin@caresetu.local");
      setPassword("Admin@123456");
    } else if (demoRole === "driver") {
      setEmail("driver@caresetu.local");
      setPassword("Driver@123456");
    } else if (demoRole === "pharmacist") {
      setEmail("pharmacist@caresetu.local");
      setPassword("Pharma@123456");
    } else {
      setEmail("user@caresetu.local");
      setPassword("User@123456");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-600 text-white items-center justify-center shadow-md shadow-brand-500/20">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? "Create your CareSetu Account" : "Welcome Back to CareSetu"}
          </h1>
          <p className="text-slate-500 text-xs">
            {isSignUp
              ? "Join the healthcare bridge for doorstep medicines and rapid response"
              : "Sign in to manage orders, live emergency tracking, and consult AI Doctor"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg("");
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isSignUp
                ? "bg-white text-slate-900 shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg("");
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isSignUp
                ? "bg-white text-slate-900 shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start space-x-2.5 animate-in fade-in">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
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
                  Address (Vadodara / Area)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 402, Alkapuri Heights, Vadodara"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="user">Patient / General User</option>
                  <option value="driver">Ambulance Driver</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="admin">Platform Admin</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isSignUp ? "Complete Registration" : "Sign In to CareSetu"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Role Auto-fill for Testing */}
        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-center space-y-2">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Developer / Quick Demo Access</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo("user")}
              className="py-1.5 px-2 bg-white rounded-lg border border-slate-200 hover:border-brand-500 text-slate-700 font-medium"
            >
              Demo Patient
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("driver")}
              className="py-1.5 px-2 bg-white rounded-lg border border-slate-200 hover:border-brand-500 text-slate-700 font-medium"
            >
              Demo Driver
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("pharmacist")}
              className="py-1.5 px-2 bg-white rounded-lg border border-slate-200 hover:border-brand-500 text-slate-700 font-medium"
            >
              Demo Pharmacist
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="py-1.5 px-2 bg-white rounded-lg border border-slate-200 hover:border-brand-500 text-slate-700 font-medium"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">Verifying security credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-amber-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
          🛡️
        </div>
        <h2 className="text-xl font-black text-slate-900">Admin / Staff Access</h2>
        <p className="text-slate-600 text-xs leading-relaxed">
          You are signed in as <span className="font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full">{role}</span>.
          This portal requires role: <span className="font-semibold text-brand-700">{allowedRoles.join(" or ")}</span>.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => {
              const { setDemoRole } = useAuth; // accessed via hook
              window.localStorage.setItem("caresetu_demo_role", allowedRoles[0]);
              window.location.reload();
            }}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Switch to Demo {allowedRoles[0].toUpperCase()} Mode
          </button>
          <a
            href="/"
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}

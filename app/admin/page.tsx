"use client";

import { useState, useEffect } from "react";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminSession } from "@/lib/admin-session";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ Check for existing admin session
    const existingSession = getAdminSession();
    setIsAuthenticated(existingSession);
    setIsLoading(false);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-serif">Admin Portal</h1>
        <p className="text-muted-foreground">
          {isAuthenticated
            ? "Monitor event analytics and manage data"
            : "Secure access for event administrators"}
        </p>
      </div>

      {isAuthenticated ? (
        // ⬇️ No more participants/volunteers props
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
}

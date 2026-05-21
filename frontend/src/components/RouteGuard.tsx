"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: "customer" | "contractor" | "admin";
}

export default function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // ⚠️ CRITICAL: Don't do ANYTHING until Zustand has loaded from localStorage.
    // Without this check, every page navigation shows the loading spinner and
    // then immediately redirects to /login because isAuthenticated is still false.
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      // Send the user to their own dashboard
      if (user?.role === "admin") router.replace("/admin");
      else if (user?.role === "contractor") router.replace("/contractor");
      else router.replace("/customer");
    }
  }, [_hasHydrated, isAuthenticated, user, requiredRole, router]);

  // Show spinner while Zustand is loading from localStorage (typically <50ms)
  if (!_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not logged in → redirect is in-flight
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Wrong role → redirect is in-flight
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}

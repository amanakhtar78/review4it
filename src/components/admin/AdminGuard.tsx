"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Minimal JWT payload decode without verifying signature
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return payload;
  } catch {
    try {
      // Fallback for browsers without Buffer
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return payload;
    } catch {
      return null;
    }
  }
}

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      router.replace("/404");
      return;
    }
    const payload = decodeJwtPayload(token);
    if (!payload || payload.isAdmin !== true) {
      router.replace("/404");
      return;
    }
    // Optional: check exp
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem("authToken");
      router.replace("/404");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) return null; // Prevent flash
  return <>{children}</>;
}

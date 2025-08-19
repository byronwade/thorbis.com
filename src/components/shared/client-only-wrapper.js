"use client";

import { useEffect, useState } from "react";

/**
 * ClientOnlyWrapper - Prevents hydration mismatches by only rendering children on the client
 * Use this for components that generate different content on server vs client (like Radix UI)
 */
export default function ClientOnlyWrapper({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show fallback on server, children on client
  if (!mounted) {
    return fallback || (
      <div className="animate-pulse">
        <div className="h-8 w-24 bg-muted dark:bg-muted rounded"></div>
      </div>
    );
  }

  return children;
}

/**
 * HydrationSafeWrapper - Renders the same structure on server and client but suppresses hydration warnings
 * Use this for components that should render on both but may have minor differences
 */
export function HydrationSafeWrapper({ children, className = "" }) {
  return (
    <div suppressHydrationWarning className={className}>
      {children}
    </div>
  );
}

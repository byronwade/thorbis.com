"use client";

import { useEffect } from "react";
import logger from "@lib/utils/logger";

/**
 * HydrationMonitor - Monitors and logs hydration mismatches for debugging
 * This component helps identify hydration issues in development
 */
export default function HydrationMonitor() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return;

    // Monitor for hydration warnings
    const originalWarn = console.warn;
    console.warn = function(...args) {
      const message = args[0];
      if (typeof message === "string" && message.includes("hydration")) {
        // Defer logger call to prevent useInsertionEffect errors
        setTimeout(() => {
          logger.warn("Hydration mismatch detected:", {
            message: args.join(" "),
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          });
        }, 0);
      }
      originalWarn.apply(console, args);
    };

    // Monitor for hydration errors (avoid infinite loops)
    const originalError = console.error;
    let isLoggingError = false;
    console.error = function(...args) {
      if (isLoggingError) {
        originalError.apply(console, args);
        return;
      }
      
      const message = args[0];
      if (typeof message === "string" && message.includes("hydration") && !message.includes("useInsertionEffect")) {
        isLoggingError = true;
        // Defer logger call to prevent useInsertionEffect errors
        setTimeout(() => {
          logger.error("Hydration error detected:", {
            message: args.join(" "),
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          });
          isLoggingError = false;
        }, 0);
      }
      originalError.apply(console, args);
    };

    // Log successful hydration (defer to prevent useInsertionEffect errors)
    setTimeout(() => {
      logger.info("Hydration completed successfully", {
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }, 0);

    // Cleanup
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null; // This component doesn't render anything
}

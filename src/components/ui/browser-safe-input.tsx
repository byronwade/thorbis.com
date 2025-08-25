"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BrowserSafeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suppressBrowserExtensions?: boolean;
}

const BrowserSafeInput = React.forwardRef<HTMLInputElement, BrowserSafeInputProps>(
  ({ className, type, suppressBrowserExtensions = true, ...props }, ref) => {
    // Use useEffect to handle browser extension attributes after hydration
    const [isClient, setIsClient] = React.useState(false);
    
    React.useEffect(() => {
      setIsClient(true);
    }, []);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
        // Suppress hydration warnings for browser extension attributes
        suppressHydrationWarning={suppressBrowserExtensions}
        // Only render certain attributes on client side to prevent hydration mismatch
        {...(isClient && suppressBrowserExtensions ? {} : {})}
      />
    );
  }
);

BrowserSafeInput.displayName = "BrowserSafeInput";

export { BrowserSafeInput };

"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface HydrationSafeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * HydrationSafeInput - Completely prevents hydration mismatches
 * by only rendering on the client side with proper loading states
 */
export function HydrationSafeInput({ 
  label, 
  error, 
  className, 
  id,
  ...props 
}: HydrationSafeInputProps) {
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Small delay to ensure browser extensions have time to process
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton during SSR and initial hydration
  if (!isClient || !mounted) {
    return (
      <div className="space-y-2">
        {label && (
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        )}
        <div className="h-10 bg-muted rounded-md animate-pulse" />
        {error && (
          <div className="h-4 bg-destructive/10 rounded w-32 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        suppressHydrationWarning={true}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

/**
 * HydrationSafeForm - Wrapper for forms that need to be completely client-side
 */
interface HydrationSafeFormProps {
  children: React.ReactNode;
  className?: string;
}

export function HydrationSafeForm({ children, className }: HydrationSafeFormProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded-md animate-pulse" />
          <div className="h-10 bg-muted rounded-md animate-pulse" />
          <div className="h-10 bg-muted rounded-md animate-pulse" />
          <div className="h-10 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

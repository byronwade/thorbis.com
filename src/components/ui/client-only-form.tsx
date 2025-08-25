"use client";

import React, { useState, useEffect } from 'react';

interface ClientOnlyFormProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ClientOnlyForm - Wraps form content to prevent hydration mismatches
 * from browser extensions like password managers
 */
export function ClientOnlyForm({ children, className }: ClientOnlyFormProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR and initial hydration
  if (!isClient) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded-md mb-4" />
          <div className="h-10 bg-muted rounded-md mb-4" />
          <div className="h-10 bg-muted rounded-md mb-4" />
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

/**
 * ClientOnlyInput - Input component that only renders on client side
 */
interface ClientOnlyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function ClientOnlyInput({ label, className, ...props }: ClientOnlyInputProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-2">
        {label && <div className="h-4 bg-muted rounded w-20" />}
        <div className="h-10 bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        suppressHydrationWarning={true}
        {...props}
      />
    </div>
  );
}

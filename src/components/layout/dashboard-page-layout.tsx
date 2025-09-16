import React from 'react';
import { Suspense } from 'react';

interface DashboardPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: React.ReactNode;
}

export function DashboardPageLayout({
  title,
  description,
  children,
  actions,
  loading = <div className="animate-pulse">Loading...</div>
}: DashboardPageLayoutProps) {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      
      <Suspense fallback={loading}>
        {children}
      </Suspense>
    </div>
  );
}
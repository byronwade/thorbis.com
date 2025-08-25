"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IntegrationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/business/settings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to Integrations...</p>
      </div>
    </div>
  );
}

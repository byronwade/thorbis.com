"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

interface AnalyticsBackButtonProps {
  className?: string;
}

export function AnalyticsBackButton({ className }: AnalyticsBackButtonProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromIndustry = searchParams.get('from');
  
  // Construct the back URL with preserved parameters
  const backUrl = fromIndustry 
    ? '/dashboards/analytics?from=${fromIndustry}'
    : '/dashboards/analytics';

  // Add keyboard shortcut for back navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Left Arrow or Escape key
      if ((event.altKey && event.key === 'ArrowLeft') || event.key === 'Escape') {
        event.preventDefault();
        router.push(backUrl);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, backUrl]);

  return (
    <Link href={backUrl} className={`flex-shrink-0 ${className || ''}`}>
      <Button variant="ghost" size="sm" className="group">
        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Back
      </Button>
    </Link>
  );
}
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface ScrollSectionProps {
  title: string;
  subtitle?: string;
  link?: string;
  children: ReactNode;
}

export default function ScrollSection({ title, subtitle, link, children }: ScrollSectionProps) {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center px-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {link && (
          <Link 
            href={link} 
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            See all
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 px-6 pb-2" style={{ width: 'max-content' }}>
          {children}
        </div>
      </div>

      <style jsx global>{'
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      '}</style>
    </section>
  );
}
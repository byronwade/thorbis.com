'use client';

import Image from "next/image";
import { Badge } from "@components/ui/badge";
import { cn } from "@utils";

/**
 * USA Pride Strip - Clean & Simple Design
 * Matches the exact style requested by user
 */
export default function USAPrideSection({ className }) {
  return (
    <section 
      className={cn(
        "bg-white dark:bg-neutral-900",
        className
      )}
      aria-label="Made in USA Banner"
    >
      <div className="flex flex-col p-6 space-y-4 sm:space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-5 shrink-0">
              <Image
                alt="USA Flag"
                width={32}
                height={20}
                className="object-cover rounded-sm"
                src="/usa.png"
                style={{ color: 'transparent', width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="font-semibold tracking-tight text-lg">
              Made in United States
            </div>
          </div>
          <Badge variant="secondary" className="w-fit">
            100% American Manufacturing
          </Badge>
        </div>
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Thorbis",
            "foundingLocation": {
              "@type": "Country",
              "name": "United States"
            },
            "manufacturingLocation": {
              "@type": "Country", 
              "name": "United States"
            },
            "description": "100% American manufacturing company"
          })
        }}
      />
    </section>
  );
}

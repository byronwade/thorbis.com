import { evaluateAllFlags } from "@/lib/flags/server";
import { cookies } from "next/headers";

// Disable caching for store pages to ensure real-time inventory
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// SEO metadata for store pages
export const metadata = {
  title: {
    default: "Transform Your Business With Our Products - Thorbis Store",
    template: "%s | Thorbis Store"
  },
  description: "Discover professional-grade POS systems, fleet management solutions, and business hardware that powers 10,000+ successful businesses worldwide. Shop our complete product range.",
  keywords: [
    "POS systems",
    "fleet management",
    "business hardware",
    "payment terminals",
    "barcode scanners",
    "receipt printers",
    "business software",
    "Thorbis store",
    "business solutions"
  ],
  authors: [{ name: "Thorbis" }],
  creator: "Thorbis",
  publisher: "Thorbis",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thorbis.com"),
  alternates: {
    canonical: "/store",
  },
  openGraph: {
    title: "Transform Your Business With Our Products - Thorbis Store",
    description: "Discover professional-grade POS systems, fleet management solutions, and business hardware that powers 10,000+ successful businesses worldwide.",
    url: "/store",
    siteName: "Thorbis Store",
    images: [
      {
        url: "/logos/ThorbisLogo.webp",
        width: 1200,
        height: 630,
        alt: "Thorbis Store - Business Solutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Transform Your Business With Our Products - Thorbis Store",
    description: "Discover professional-grade POS systems, fleet management solutions, and business hardware trusted by 10,000+ businesses.",
    images: ["/logos/ThorbisLogo.webp"],
    creator: "@thorbis",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// JSON-LD structured data for ecommerce store
const generateStoreStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Thorbis Store",
    "description": "Transform your business with our professional-grade POS systems, fleet management solutions, and business hardware trusted by 10,000+ successful businesses worldwide.",
    "url": "https://thorbis.com/store",
    "logo": "https://thorbis.com/logos/ThorbisLogo.webp",
    "image": "https://thorbis.com/logos/ThorbisLogo.webp",
    "telephone": "+1-800-THORBIS",
    "email": "store@thorbis.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://twitter.com/thorbis",
      "https://linkedin.com/company/thorbis"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Business Solutions",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Thorbis POS Pro",
            "description": "Advanced point-of-sale system with integrated payment processing",
            "category": "POS Systems"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Thorbis Fleet Tracker",
            "description": "Real-time GPS tracking for fleet vehicles",
            "category": "Fleet Management"
          }
        }
      ]
    },
    "priceRange": "$$",
    "paymentAccepted": ["Cash", "Credit Card", "PayPal"],
    "currenciesAccepted": "USD",
    "openingHours": "Mo-Fr 09:00-18:00",
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    }
  };
};

export default async function StoreLayout({ children }) {
	const ff = await evaluateAllFlags();
	
	// Apply dev-only cookie overrides to SSR flags
	let overridden = { ...ff };
	if (process.env.NODE_ENV !== "production") {
		try {
            const cookieStore = await cookies();
			const raw = cookieStore.get("dev_flag_overrides")?.value;
			if (raw) {
				const parsed = JSON.parse(decodeURIComponent(raw));
				if (parsed && typeof parsed === "object") {
					for (const [k, v] of Object.entries(parsed)) {
						if (typeof v === "boolean" && k in overridden) {
							overridden[k] = v;
						}
					}
				}
			}
		} catch {}
	}

	return (
		<div
			data-flags={JSON.stringify(overridden)}
			data-flag-new-navigation={overridden.newNavigation ? "1" : "0"}
			data-flag-linkedin-clone={overridden.linkedinClone ? "1" : "0"}
			data-flag-jobs-app={overridden.jobsApp ? "1" : "0"}
			data-flag-affiliates={overridden.affiliates ? "1" : "0"}
			data-flag-landing-pages={overridden.landingPages ? "1" : "0"}
			data-flag-business-certification={overridden.businessCertification ? "1" : "0"}
			data-flag-investor-relations={overridden.investorRelations ? "1" : "0"}
			data-flag-about-us={overridden.aboutUs ? "1" : "0"}
		>
			{/* JSON-LD structured data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(generateStoreStructuredData()),
				}}
			/>
			
			<main className="min-h-screen bg-white dark:bg-slate-900">
				{children}
			</main>
		</div>
	);
}

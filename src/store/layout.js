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

export default function StoreLayout({ children }) {
	// Simplified layout without feature flags for now
	const defaultFlags = {
		newNavigation: false,
		linkedinClone: false,
		jobsApp: false,
		affiliates: false,
		landingPages: true,
		businessCertification: false,
		investorRelations: false,
		aboutUs: false
	};

	return (
		<div
			data-flags={JSON.stringify(defaultFlags)}
			data-flag-new-navigation="0"
			data-flag-linkedin-clone="0"
			data-flag-jobs-app="0"
			data-flag-affiliates="0"
			data-flag-landing-pages="1"
			data-flag-business-certification="0"
			data-flag-investor-relations="0"
			data-flag-about-us="0"
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

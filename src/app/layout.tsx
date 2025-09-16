import "./globals.css";
import React from "react";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import WebVitalsTracker from "@/components/performance/web-vitals-tracker";
import { ErrorMonitoringProvider } from "@/components/providers/error-monitoring-provider";
import { SWRProvider } from "@/components/providers/swr-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { BusinessProvider } from "@/components/providers/business-provider";
import { GlobalErrorBoundary } from "@/components/error-handling/error-boundary";

// Font configuration
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Basic metadata for the unified app
export const metadata = {
  title: {
    default: "Thorbis - AI-First Business Operating System",
    template: "%s | Thorbis Business OS",
  },
  description: "AI-first business operating system for local commerce. Manage home services, restaurants, auto repair, retail, and more - all in one unified platform.",
  keywords: [
    "business operating system", 
    "AI-first", 
    "home services", 
    "restaurant POS", 
    "auto repair", 
    "retail management",
    "unified platform",
    "local commerce",
    "business management",
    "integrated solution"
  ],
  authors: [{ name: "Byron Wade", url: "https://github.com/byronwade" }],
  creator: "Byron Wade",
  publisher: "Thorbis",
  applicationName: "Thorbis Business OS",
  generator: "Next.js",
  category: "Business Software",
  referrer: "origin-when-cross-origin",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://thorbis.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thorbis.com",
    siteName: "Thorbis Business OS",
    title: "Thorbis - AI-First Business Operating System",
    description: "Unified platform for managing all aspects of local business - from home services to restaurants, auto repair to retail.",
    images: [
      {
        url: "/ThorbisLogo.webp",
        width: 1200,
        height: 630,
        alt: "Thorbis Business OS",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@byronwade",
    creator: "@byronwade",
    title: "Thorbis - AI-First Business Operating System",
    description: "Unified platform for managing all aspects of local business.",
    images: ["/ThorbisLogo.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "hsl(var(--background))",
    "msapplication-TileColor": "hsl(var(--background))",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Thorbis Business OS",
    "format-detection": "telephone=no",
    "X-UA-Compatible": "IE=edge",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(var(--background))" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(var(--background))" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Dark mode script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: '
              (function() {
                try {
                  const savedTheme = localStorage.getItem('thorbis-theme');
                  if (savedTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // Keep dark mode as default
                    document.documentElement.classList.add('dark');
                  }
                } catch (_error) {
                  // Fallback: keep existing dark class
                }
              })();
            ',
          }}
        />

        {/* NextFaster Performance Optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Critical resource prefetching */}
        <link rel="preload" href="/ThorbisLogo.webp" as="image" />

        {/* Performance hints */}
        <meta name="resource-hints" content="preload,prefetch,preconnect" />
        
        {/* Preload Inter font for instant loading */}
        <link 
          rel="preload" 
          href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />

        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Thorbis Business OS",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "url": "https://thorbis.com",
              "description": "AI-first business operating system for local commerce",
              "author": {
                "@type": "Person",
                "name": "Byron Wade"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }),
          }}
        />
      </head>
      <body 
        className={cn(
          "min-h-screen bg-background text-foreground font-sans antialiased",
          fontSans.variable
        )}
      >
        <GlobalErrorBoundary>
          <ThemeProvider>
            <ErrorMonitoringProvider>
              <SWRProvider>
                <AuthProvider>
                  <BusinessProvider>
                    {/* Web Vitals tracking for performance monitoring */}
                    <WebVitalsTracker />
                    
                    {/* Main application content */}
                    {children}
                  </BusinessProvider>
                </AuthProvider>
              </SWRProvider>
            </ErrorMonitoringProvider>
          </ThemeProvider>
        </GlobalErrorBoundary>
        
        {/* Global toast notifications */}
        <Toaster />
        
        {/* Global error handling and performance optimizations */}
        <script
          dangerouslySetInnerHTML={{
            __html: '
              // Handle uncaught promise rejections gracefully
              window.addEventListener('unhandledrejection', function(event) {
                console.warn('Uncaught promise rejection:', event.reason);
                event.preventDefault();
              });

              // Handle other uncaught errors
              window.addEventListener('error', function(event) {
                console.warn('Uncaught error:', event.error);
                event.preventDefault();
              });
            ',
          }}
        />
      </body>
    </html>
  );
}

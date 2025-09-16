# Thorbis Schema Markup Strategy

Comprehensive structured data implementation for Thorbis Business OS with LocalBusiness, Product, and FAQ schema markup for enhanced search visibility and rich snippets.

## Schema Markup Architecture

### Core Schema Types Implementation
1. **Organization** - Thorbis company information
2. **SoftwareApplication** - Thorbis Business OS product
3. **LocalBusiness** - Customer business profiles
4. **Product** - Industry-specific solutions
5. **FAQ** - Common questions and answers
6. **Article** - Blog posts and guides
7. **BreadcrumbList** - Site navigation
8. **Review** - Customer testimonials
9. **Event** - Webinars and training
10. **JobPosting** - Career opportunities

## Organization Schema (Thorbis Company)

### Main Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://thorbis.com/#organization",
  "name": "Thorbis",
  "alternateName": "Thorbis Business OS",
  "description": "AI-first business operating system for home services, restaurants, auto services, and retail companies. Comprehensive POS, scheduling, inventory, and analytics platform.",
  "url": "https://thorbis.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://thorbis.com/images/thorbis-logo.png",
    "width": 300,
    "height": 100
  },
  "image": "https://thorbis.com/images/thorbis-hero-image.jpg",
  "sameAs": [
    "https://twitter.com/thorbis",
    "https://linkedin.com/company/thorbis",
    "https://facebook.com/thorbis",
    "https://github.com/thorbis"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+1-800-THORBIS",
      "contactType": "customer support",
      "availableLanguage": ["English"],
      "areaServed": ["US", "CA"]
    },
    {
      "@type": "ContactPoint",
      "telephone": "+1-800-THORBIS",
      "contactType": "sales",
      "availableLanguage": ["English"],
      "areaServed": ["US", "CA"]
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Tech Street",
    "addressLocality": "San Francisco",
    "addressRegion": "CA", 
    "postalCode": "94105",
    "addressCountry": "US"
  },
  "founder": {
    "@type": "Person",
    "name": "Byron Wade",
    "jobTitle": "CEO & Founder"
  },
  "foundingDate": "2024",
  "employee": [
    {
      "@type": "Person",
      "name": "Byron Wade",
      "jobTitle": "CEO & Founder"
    }
  ],
  "numberOfEmployees": "50-100",
  "industry": "Software",
  "naics": "541511",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  }
}
```

## SoftwareApplication Schema (Main Product)

### Thorbis Business OS Product Schema
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://thorbis.com/#software",
  "name": "Thorbis Business OS",
  "description": "All-in-one business operating system with POS, scheduling, inventory management, customer management, analytics, and AI-powered insights for small to medium businesses.",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Business Management Software",
  "operatingSystem": "Web Browser, iOS, Android",
  "url": "https://thorbis.com",
  "downloadUrl": [
    "https://apps.apple.com/app/thorbis-business-os",
    "https://play.google.com/store/apps/details?id=com.thorbis.businessos"
  ],
  "softwareVersion": "2.0.0",
  "datePublished": "2024-01-15",
  "dateModified": "2024-08-27",
  "author": {
    "@type": "Organization",
    "@id": "https://thorbis.com/#organization"
  },
  "publisher": {
    "@type": "Organization", 
    "@id": "https://thorbis.com/#organization"
  },
  "offers": {
    "@type": "Offer",
    "price": "49",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "49",
      "priceCurrency": "USD",
      "unitText": "monthly"
    },
    "availability": "https://schema.org/InStock",
    "validThrough": "2025-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sarah Johnson"
      },
      "datePublished": "2024-08-15",
      "reviewBody": "Thorbis transformed our HVAC business operations. The scheduling and invoicing features are incredibly intuitive.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }
  ],
  "featureList": [
    "Point of Sale (POS) System",
    "Appointment Scheduling",
    "Inventory Management", 
    "Customer Management",
    "Invoice & Payment Processing",
    "Business Analytics & Reporting",
    "Multi-location Management",
    "Staff Management",
    "AI Business Assistant",
    "Hardware Integration",
    "Third-party Integrations",
    "Mobile Applications"
  ],
  "screenshot": [
    "https://thorbis.com/images/dashboard-screenshot.png",
    "https://thorbis.com/images/pos-screenshot.png",
    "https://thorbis.com/images/scheduling-screenshot.png"
  ],
  "requirements": "Web browser or iOS 13+/Android 8+",
  "storageRequirements": "50MB",
  "memoryRequirements": "1GB RAM",
  "processorRequirements": "1GHz",
  "softwareHelp": "https://thorbis.com/support",
  "releaseNotes": "https://thorbis.com/changelog",
  "license": "https://thorbis.com/terms"
}
```

## LocalBusiness Schema (Customer Profiles)

### Basic LocalBusiness Example
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://thorbis.com/businesses/example-business/#business",
  "name": "Example Local Business",
  "description": "Example local business using Thorbis Business OS",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business Street",
    "addressLocality": "Los Angeles", 
    "addressRegion": "CA",
    "postalCode": "90210",
    "addressCountry": "US"
  },
  "telephone": "+1-555-123-4567"
}
```

### Home Services Business Example
```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Plumber"],
  "@id": "https://thorbis.com/businesses/reliable-plumbing-los-angeles/#business",
  "name": "Reliable Plumbing Los Angeles",
  "alternateName": "Reliable Plumbing LA",
  "description": "Professional plumbing services in Los Angeles. Emergency repairs, drain cleaning, pipe installation, and bathroom remodeling. Licensed and insured plumbers serving LA since 2010.",
  "url": "https://reliableplumbingla.com",
  "image": [
    "https://thorbis.com/businesses/reliable-plumbing-los-angeles/logo.png",
    "https://thorbis.com/businesses/reliable-plumbing-los-angeles/storefront.jpg"
  ],
  "logo": "https://thorbis.com/businesses/reliable-plumbing-los-angeles/logo.png",
  "telephone": "+1-323-555-0123",
  "email": "info@reliableplumbingla.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "456 Plumbing Way",
    "addressLocality": "Los Angeles",
    "addressRegion": "CA",
    "postalCode": "90210",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "34.0522",
    "longitude": "-118.2437"
  },
  "openingHours": [
    "Mo-Fr 08:00-18:00",
    "Sa 09:00-16:00",
    "Su 10:00-14:00"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00", 
      "closes": "16:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "10:00",
      "closes": "14:00"
    }
  ],
  "areaServed": [
    {
      "@type": "City",
      "name": "Los Angeles"
    },
    {
      "@type": "City", 
      "name": "Beverly Hills"
    },
    {
      "@type": "City",
      "name": "Santa Monica"
    }
  ],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "34.0522",
      "longitude": "-118.2437"
    },
    "geoRadius": "25 miles"
  },
  "priceRange": "$$",
  "paymentAccepted": ["Cash", "Credit Card", "Check", "PayPal"],
  "currenciesAccepted": "USD",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "342",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Mike Rodriguez"
      },
      "datePublished": "2024-08-20",
      "reviewBody": "Outstanding service! Fixed our kitchen sink leak quickly and professionally. Highly recommend!",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Plumbing Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Emergency Plumbing Repair",
          "description": "24/7 emergency plumbing repairs"
        },
        "price": "150",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Drain Cleaning",
          "description": "Professional drain cleaning services"
        },
        "price": "95",
        "priceCurrency": "USD"
      }
    ]
  },
  "founder": {
    "@type": "Person",
    "name": "Roberto Martinez",
    "jobTitle": "Owner & Master Plumber"
  },
  "employee": [
    {
      "@type": "Person", 
      "name": "Roberto Martinez",
      "jobTitle": "Master Plumber"
    },
    {
      "@type": "Person",
      "name": "Carlos Gonzalez", 
      "jobTitle": "Licensed Plumber"
    }
  ],
  "numberOfEmployees": "5",
  "foundingDate": "2010",
  "slogan": "Your Reliable Plumbing Solution",
  "awards": "Best Plumber Los Angeles 2023",
  "knowsAbout": [
    "Plumbing Repair",
    "Drain Cleaning",
    "Water Heater Installation",
    "Bathroom Remodeling",
    "Pipe Installation",
    "Emergency Plumbing"
  ],
  "sameAs": [
    "https://facebook.com/reliableplumbingla",
    "https://yelp.com/biz/reliable-plumbing-los-angeles",
    "https://google.com/maps/place/reliable-plumbing-la"
  ],
  "makesOffer": [
    {
      "@type": "Offer",
      "name": "Free Estimates",
      "description": "Free estimates on all plumbing projects over $500"
    },
    {
      "@type": "Offer",
      "name": "Senior Discount",
      "description": "10% discount for seniors (65+)",
      "eligibleCustomerType": "Senior"
    }
  ],
  "brand": {
    "@type": "Brand",
    "name": "Reliable Plumbing"
  }
}
```

### Restaurant Business Example
```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Restaurant"],
  "@id": "https://thorbis.com/businesses/marios-pizza-brooklyn/#business",
  "name": "Mario's Authentic Pizza",
  "alternateName": "Mario's Pizza Brooklyn",
  "description": "Authentic New York style pizza in Brooklyn since 1985. Fresh ingredients, wood-fired oven, family recipes passed down for generations.",
  "url": "https://mariospizzabrooklyn.com",
  "image": [
    "https://thorbis.com/businesses/marios-pizza-brooklyn/restaurant.jpg",
    "https://thorbis.com/businesses/marios-pizza-brooklyn/pizza.jpg"
  ],
  "logo": "https://thorbis.com/businesses/marios-pizza-brooklyn/logo.png",
  "telephone": "+1-718-555-0198",
  "email": "info@mariospizzabrooklyn.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "789 Pizza Avenue",
    "addressLocality": "Brooklyn", 
    "addressRegion": "NY",
    "postalCode": "11201",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.6892",
    "longitude": "-74.0445"
  },
  "openingHours": [
    "Mo-Th 11:00-22:00",
    "Fr-Sa 11:00-23:00", 
    "Su 12:00-21:00"
  ],
  "servesCuisine": ["Italian", "Pizza", "Mediterranean"],
  "priceRange": "$$",
  "acceptsReservations": true,
  "paymentAccepted": ["Cash", "Credit Card", "Apple Pay", "Google Pay"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "ratingCount": "892",
    "bestRating": "5",
    "worstRating": "1"
  },
  "hasMenu": {
    "@type": "Menu",
    "@id": "https://thorbis.com/businesses/marios-pizza-brooklyn/menu",
    "name": "Mario's Pizza Menu",
    "description": "Authentic Italian pizzas, pasta, salads, and desserts",
    "hasMenuSection": [
      {
        "@type": "MenuSection",
        "name": "Pizzas",
        "description": "Wood-fired authentic pizzas",
        "hasMenuItem": [
          {
            "@type": "MenuItem",
            "name": "Margherita Pizza",
            "description": "Fresh mozzarella, tomato sauce, basil",
            "offers": {
              "@type": "Offer",
              "price": "18",
              "priceCurrency": "USD"
            }
          },
          {
            "@type": "MenuItem",
            "name": "Pepperoni Pizza",
            "description": "Pepperoni, mozzarella, tomato sauce",
            "offers": {
              "@type": "Offer",
              "price": "20",
              "priceCurrency": "USD"
            }
          }
        ]
      }
    ]
  },
  "founder": {
    "@type": "Person",
    "name": "Mario Rossi",
    "jobTitle": "Owner & Head Chef"
  },
  "foundingDate": "1985",
  "slogan": "Authentic Brooklyn Pizza Since 1985",
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Free Wi-Fi",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification", 
      "name": "Outdoor Seating",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Delivery Available",
      "value": true
    }
  ],
  "knowsAbout": [
    "New York Style Pizza",
    "Italian Cuisine",
    "Wood-fired Cooking",
    "Family Recipes",
    "Fresh Ingredients"
  ]
}
```

## Product Schema (Industry Solutions)

### Home Services Solution
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://thorbis.com/industries/home-services/#product",
  "name": "Thorbis Home Services Solution", 
  "alternateName": "Home Services Management Software",
  "description": "Complete business management solution for home service companies. Field service management, scheduling, dispatching, invoicing, customer management, and mobile apps for HVAC, plumbing, electrical, and landscaping businesses.",
  "category": "Business Management Software",
  "productID": "THORBIS-HS-2024",
  "mpn": "THORBIS-HS",
  "brand": {
    "@type": "Brand",
    "name": "Thorbis"
  },
  "manufacturer": {
    "@type": "Organization",
    "@id": "https://thorbis.com/#organization"
  },
  "url": "https://thorbis.com/industries/home-services",
  "image": [
    "https://thorbis.com/images/home-services-dashboard.png",
    "https://thorbis.com/images/home-services-mobile.png",
    "https://thorbis.com/images/home-services-scheduling.png"
  ],
  "offers": {
    "@type": "Offer",
    "url": "https://thorbis.com/pricing/home-services",
    "price": "89",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "89",
      "priceCurrency": "USD", 
      "unitText": "monthly",
      "referenceQuantity": {
        "@type": "QuantitativeValue",
        "value": "1",
        "unitCode": "license"
      }
    },
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "validThrough": "2025-12-31",
    "seller": {
      "@type": "Organization",
      "@id": "https://thorbis.com/#organization"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "456",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Tom Wilson",
        "jobTitle": "HVAC Business Owner"
      },
      "datePublished": "2024-08-10",
      "reviewBody": "Thorbis revolutionized our HVAC business. Scheduling is seamless, technicians love the mobile app, and our customer satisfaction has improved dramatically.",
      "reviewRating": {
        "@type": "Rating", 
        "ratingValue": "5",
        "bestRating": "5"
      }
    }
  ],
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Industry Focus",
      "value": "Home Services"
    },
    {
      "@type": "PropertyValue",
      "name": "Deployment Type", 
      "value": "Cloud-based SaaS"
    },
    {
      "@type": "PropertyValue",
      "name": "Mobile Apps",
      "value": "iOS and Android"
    },
    {
      "@type": "PropertyValue",
      "name": "Integration Support",
      "value": "QuickBooks, Stripe, Google Calendar"
    }
  ],
  "hasMeasurement": [
    {
      "@type": "QuantitativeValue",
      "name": "Setup Time",
      "value": "1",
      "unitText": "day"
    },
    {
      "@type": "QuantitativeValue", 
      "name": "User Training",
      "value": "2",
      "unitText": "hours"
    }
  ],
  "audience": {
    "@type": "BusinessAudience",
    "audienceType": "Home Service Businesses",
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": "1",
      "maxValue": "500"
    }
  },
  "applicationCategory": "Business Management",
  "applicationSubCategory": "Field Service Management",
  "operatingSystem": ["Web Browser", "iOS", "Android"],
  "softwareVersion": "2.0.0",
  "releaseDate": "2024-01-15"
}
```

### Restaurant Solution
```json
{
  "@context": "https://schema.org", 
  "@type": "Product",
  "@id": "https://thorbis.com/industries/restaurants/#product",
  "name": "Thorbis Restaurant Solution",
  "alternateName": "Restaurant Management Software", 
  "description": "Complete restaurant management platform with POS system, kitchen display system (KDS), online ordering, inventory management, staff scheduling, and analytics for restaurants, cafes, and food service businesses.",
  "category": "Restaurant Management Software",
  "productID": "THORBIS-REST-2024",
  "mpn": "THORBIS-REST",
  "brand": {
    "@type": "Brand",
    "name": "Thorbis"
  },
  "url": "https://thorbis.com/industries/restaurants",
  "offers": {
    "@type": "Offer",
    "price": "99",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "99", 
      "priceCurrency": "USD",
      "unitText": "monthly"
    },
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "723"
  },
  "audience": {
    "@type": "BusinessAudience",
    "audienceType": "Restaurants and Food Service"
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Hardware Supported",
      "value": "POS Terminals, KDS Displays, Receipt Printers"
    },
    {
      "@type": "PropertyValue",
      "name": "Payment Processing", 
      "value": "Credit Cards, Mobile Payments, Cash"
    }
  ]
}
```

## FAQ Schema Implementation

### General Business Software FAQ
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://thorbis.com/faq/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Thorbis Business OS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Thorbis Business OS is an all-in-one business management platform designed for small to medium businesses across home services, restaurants, auto services, and retail industries. It includes POS systems, scheduling, inventory management, customer management, analytics, and AI-powered insights to streamline business operations."
      }
    },
    {
      "@type": "Question", 
      "name": "How much does Thorbis cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Thorbis pricing starts at $49/month for basic features, with industry-specific plans ranging from $89-$149/month. All plans include unlimited users, 24/7 support, and core features like POS, scheduling, and customer management. Enterprise plans with advanced features and integrations are available for larger businesses."
      }
    },
    {
      "@type": "Question",
      "name": "What industries does Thorbis support?", 
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Thorbis specializes in four main industries: Home Services (HVAC, plumbing, electrical, landscaping), Restaurants (fine dining, quick service, cafes), Auto Services (repair shops, dealerships, tire shops), and Retail (clothing, electronics, specialty stores). Each industry has customized features and workflows."
      }
    },
    {
      "@type": "Question",
      "name": "Does Thorbis integrate with existing business tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Thorbis integrates with over 100 business tools including QuickBooks, Stripe, Square, Google Calendar, Mailchimp, and many industry-specific applications. Our API allows custom integrations, and our support team can help with setup and data migration from existing systems."
      }
    },
    {
      "@type": "Question",
      "name": "Is Thorbis suitable for multi-location businesses?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "Absolutely! Thorbis offers comprehensive multi-location management with centralized reporting, location-specific settings, inventory management across locations, staff scheduling, and unified customer data. You can manage multiple locations from a single dashboard while maintaining location-specific operations."
      }
    },
    {
      "@type": "Question",
      "name": "What kind of customer support does Thorbis provide?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Thorbis provides 24/7 customer support via phone, email, and live chat. All plans include free onboarding, training sessions, data migration assistance, and ongoing support. We also offer extensive documentation, video tutorials, and a community forum for self-service help."
      }
    },
    {
      "@type": "Question",
      "name": "Can I try Thorbis before purchasing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Thorbis offers a 14-day free trial with full access to all features. No credit card required to start your trial. Our team can also provide a personalized demo to show how Thorbis works for your specific business needs and industry requirements."
      }
    },
    {
      "@type": "Question",
      "name": "Is my business data secure with Thorbis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Security is our top priority. Thorbis uses enterprise-grade encryption, SOC 2 compliance, regular security audits, and secure cloud infrastructure. Your data is automatically backed up daily, and we maintain 99.9% uptime. All payment processing is PCI DSS compliant for maximum security."
      }
    }
  ]
}
```

### Home Services FAQ
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://thorbis.com/industries/home-services/faq/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does Thorbis help home service businesses?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "Thorbis streamlines home service operations with features like job scheduling and dispatching, customer management, estimates and invoicing, GPS tracking for technicians, inventory management, and mobile apps for field workers. It's designed specifically for HVAC, plumbing, electrical, landscaping, and other home service businesses."
      }
    },
    {
      "@type": "Question",
      "name": "Can technicians use Thorbis in the field?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Our mobile apps for iOS and Android allow technicians to view job details, update job status, capture photos, collect customer signatures, process payments, and create invoices on-site. The apps work offline and sync when internet connection is restored."
      }
    },
    {
      "@type": "Question", 
      "name": "Does Thorbis support recurring service appointments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Thorbis handles recurring appointments for maintenance contracts, seasonal services, and ongoing service agreements. You can set up automatic scheduling, send reminder notifications to customers, and track service history for each recurring job."
      }
    },
    {
      "@type": "Question",
      "name": "Can I track my technicians' locations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Thorbis includes GPS tracking that allows you to see technician locations in real-time (with their consent), optimize routing, track time on jobs, and provide accurate arrival time estimates to customers. This feature improves efficiency and customer service."
      }
    },
    {
      "@type": "Question",
      "name": "How does inventory management work for home services?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Thorbis tracks parts and materials inventory, alerts you when stock is low, helps with ordering from suppliers, and can automatically deduct used parts from jobs. Technicians can check inventory levels and request parts through the mobile app."
      }
    }
  ]
}
```

### Restaurant FAQ
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://thorbis.com/industries/restaurants/faq/#faq", 
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What POS features does Thorbis offer for restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Thorbis restaurant POS includes order taking, menu management, table management, kitchen display system (KDS), payment processing, split bills, discounts and promotions, inventory tracking, staff management, and detailed reporting. It works on tablets, terminals, and mobile devices."
      }
    },
    {
      "@type": "Question",
      "name": "Does Thorbis support online ordering and delivery?", 
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Thorbis includes online ordering capabilities, delivery management, integration with third-party delivery platforms (DoorDash, Uber Eats, Grubhub), and customer self-service options. Orders flow directly into your POS and kitchen display system."
      }
    },
    {
      "@type": "Question",
      "name": "How does the kitchen display system work?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "Our KDS shows incoming orders on screen displays in the kitchen, with color-coding for order timing, special instructions, and modification alerts. Kitchen staff can mark items as prepared, and the system coordinates with front-of-house staff for efficient service timing."
      }
    },
    {
      "@type": "Question",
      "name": "Can Thorbis manage restaurant inventory automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Thorbis tracks ingredient inventory, automatically deducts items based on menu item sales, alerts when ingredients are running low, helps with vendor ordering, and provides detailed food cost analysis to optimize menu profitability."
      }
    },
    {
      "@type": "Question",
      "name": "Does Thorbis work for different restaurant types?", 
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Thorbis adapts to fine dining restaurants, quick service restaurants (QSR), fast casual, cafes, bars, food trucks, and catering businesses. Each setup is customized with appropriate features and workflows for your restaurant type."
      }
    }
  ]
}
```

## Article Schema (Blog Posts & Guides)

### Blog Post Example
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://thorbis.com/learn/guides/restaurant-pos-guide/#article",
  "headline": "Complete Guide to Choosing Restaurant POS System in 2024",
  "alternativeHeadline": "Restaurant POS System Buyer's Guide",
  "description": "Comprehensive guide to selecting the best restaurant POS system for your business. Compare features, pricing, and implementation strategies for different restaurant types.",
  "url": "https://thorbis.com/learn/guides/restaurant-pos-guide",
  "datePublished": "2024-08-15T09:00:00-08:00",
  "dateModified": "2024-08-27T14:30:00-08:00",
  "author": {
    "@type": "Person",
    "name": "Sarah Mitchell",
    "jobTitle": "Restaurant Technology Expert",
    "url": "https://thorbis.com/team/sarah-mitchell"
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://thorbis.com/#organization"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://thorbis.com/learn/guides/restaurant-pos-guide"
  },
  "image": [
    {
      "@type": "ImageObject",
      "url": "https://thorbis.com/images/restaurant-pos-guide-hero.jpg",
      "width": 1200,
      "height": 675
    }
  ],
  "articleSection": "Restaurant Guides",
  "wordCount": "3500",
  "articleBody": "Restaurant POS systems are the backbone of modern food service operations...",
  "about": [
    {
      "@type": "Thing",
      "name": "Restaurant POS System"
    },
    {
      "@type": "Thing", 
      "name": "Restaurant Management"
    },
    {
      "@type": "Thing",
      "name": "Point of Sale Software"
    }
  ],
  "mentions": [
    {
      "@type": "SoftwareApplication",
      "name": "Thorbis Restaurant Solution"
    },
    {
      "@type": "Thing",
      "name": "Kitchen Display System"
    }
  ],
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", "h2", ".summary"]
  }
}
```

## BreadcrumbList Schema

### Navigation Breadcrumbs
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home", 
      "item": "https://thorbis.com"
    },
    {
      "@type": "ListItem", 
      "position": 2,
      "name": "Industries",
      "item": "https://thorbis.com/industries"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Restaurants",
      "item": "https://thorbis.com/industries/restaurants"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "POS System",
      "item": "https://thorbis.com/industries/restaurants/pos-system"
    }
  ]
}
```

## Event Schema (Webinars & Training)

### Webinar Example
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "@id": "https://thorbis.com/events/restaurant-success-webinar/#event",
  "name": "Restaurant Success: Maximizing Efficiency with Modern POS",
  "description": "Learn how restaurant owners are increasing efficiency and profitability with modern POS systems. Live demo, Q&A session, and industry best practices.",
  "url": "https://thorbis.com/events/restaurant-success-webinar",
  "image": "https://thorbis.com/images/restaurant-webinar.jpg",
  "startDate": "2024-09-15T14:00:00-07:00",
  "endDate": "2024-09-15T15:00:00-07:00",
  "duration": "PT1H",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "location": {
    "@type": "VirtualLocation",
    "url": "https://zoom.us/webinar/restaurant-success"
  },
  "organizer": {
    "@type": "Organization",
    "@id": "https://thorbis.com/#organization"
  },
  "performer": [
    {
      "@type": "Person",
      "name": "Sarah Mitchell",
      "jobTitle": "Restaurant Technology Expert"
    }
  ],
  "offers": {
    "@type": "Offer",
    "url": "https://thorbis.com/events/restaurant-success-webinar/register",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2024-08-15T00:00:00-07:00"
  },
  "audience": {
    "@type": "BusinessAudience", 
    "audienceType": "Restaurant Owners and Managers"
  }
}
```

## Review Schema (Customer Testimonials)

### Customer Review Example  
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "@id": "https://thorbis.com/customers/reviews/acme-hvac/#review",
  "itemReviewed": {
    "@type": "SoftwareApplication",
    "@id": "https://thorbis.com/#software",
    "name": "Thorbis Business OS"
  },
  "author": {
    "@type": "Person",
    "name": "Tom Wilson",
    "jobTitle": "Owner",
    "worksFor": {
      "@type": "Organization",
      "name": "ACME HVAC Services"
    }
  },
  "datePublished": "2024-08-10T00:00:00-07:00",
  "reviewBody": "Thorbis has completely transformed our HVAC business operations. The scheduling system is intuitive, our technicians love the mobile app, and our customer satisfaction scores have improved by 40%. The invoicing and payment processing features have reduced our billing time by 75%. Highly recommended for any home service business!",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5",
    "worstRating": "1"
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://thorbis.com/#organization"
  }
}
```

## JobPosting Schema (Careers Page)

### Job Posting Example
```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting", 
  "@id": "https://thorbis.com/careers/senior-software-engineer/#job",
  "title": "Senior Software Engineer - Full Stack",
  "description": "Join our engineering team to build the future of business management software. Work on AI-powered features, scalable infrastructure, and intuitive user experiences for small business owners.",
  "url": "https://thorbis.com/careers/senior-software-engineer",
  "datePosted": "2024-08-20T00:00:00-07:00",
  "validThrough": "2024-10-20T00:00:00-07:00",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "@id": "https://thorbis.com/#organization"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "addressCountry": "US"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": "120000",
      "maxValue": "180000",
      "unitText": "YEAR"
    }
  },
  "qualifications": "Bachelor's degree in Computer Science, 5+ years experience with React/Node.js, experience with cloud platforms",
  "responsibilities": "Design and implement new features, collaborate with product team, mentor junior developers, ensure code quality",
  "benefits": "Health insurance, dental, vision, 401k matching, stock options, flexible PTO, remote work options",
  "industry": "Software",
  "occupationalCategory": "Software Engineering"
}
```

## Implementation Guidelines

### JSON-LD Placement
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restaurant POS System | Thorbis</title>
  
  <!-- Organization Schema (Global) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    // ... organization schema
  }
  </script>
  
  <!-- Page-specific Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org", 
    "@type": "Product",
    // ... product schema
  }
  </script>
  
  <!-- FAQ Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    // ... FAQ schema  
  }
  </script>
  
  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList", 
    // ... breadcrumb schema
  }
  </script>
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

### Schema Testing & Validation
- Use Google's Rich Results Test: https://search.google.com/test/rich-results
- Schema.org validator: https://validator.schema.org/
- Google Search Console Rich Results monitoring
- Structured Data Testing Tool for development

### Performance Considerations
- Keep JSON-LD scripts small and focused
- Use schema concatenation for related entities
- Implement lazy loading for non-critical schema
- Monitor Core Web Vitals impact of structured data

This comprehensive schema markup strategy ensures maximum search visibility and rich snippet opportunities across all Thorbis content and customer business profiles.

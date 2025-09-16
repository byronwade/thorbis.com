// Mock business data for the Netflix-style home page with trust system integration

export interface Business {
  id: string;
  name: string;
  image: string;
  industry: string;
  rating: number;
  location: string;
  services?: string[];
  href: string;
  phone?: string;
  businessHours?: string;
  isOpen?: boolean;
  trustScore?: number;
  verified?: boolean;
  responseTime?: string;
  completedJobs?: number;
  blockchain?: {
    verified: boolean;
    did?: string;
  };
}

export const mockBusinesses: Business[] = [
  // Home Services - San Francisco Bay Area
  {
    id: "1",
    name: "Elite Home Services",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    industry: "Home Services",
    rating: 4.8,
    location: "San Francisco, CA",
    services: ["Plumbing", "Electrical", "HVAC"],
    href: "/us/ca/san-francisco/elite-home-services",
    phone: "(415) 555-0123",
    businessHours: "8 AM - 6 PM",
    isOpen: true,
    trustScore: 4.8,
    verified: true,
    responseTime: "within 1 hour",
    completedJobs: 1250,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:elite-home-services-sf-ca-us"
    }
  },
  {
    id: "2", 
    name: "ProFix Solutions",
    image: "https://images.unsplash.com/photo-1609778705752-d4c34b8b4e3d?w=400&h=300&fit=crop",
    industry: "Home Services", 
    rating: 4.9,
    location: "Los Angeles, CA",
    services: ["Handyman", "Repairs", "Maintenance"],
    href: "/us/ca/los-angeles/profix-solutions",
    phone: "(213) 555-0456",
    businessHours: "7 AM - 7 PM",
    isOpen: true,
    trustScore: 4.9,
    verified: true,
    responseTime: "within 2 hours",
    completedJobs: 890,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:profix-solutions-la-ca-us"
    }
  },
  {
    id: "3",
    name: "Quick Response Plumbing",
    image: "https://images.unsplash.com/photo-1607472829080-677b5c2a3c21?w=400&h=300&fit=crop", 
    industry: "Home Services",
    rating: 4.7,
    location: "Seattle, WA",
    services: ["Emergency Plumbing", "Drain Cleaning"],
    href: "/us/wa/seattle/quick-response-plumbing",
    phone: "(206) 555-0789",
    businessHours: "24/7 Emergency",
    isOpen: true,
    trustScore: 4.7,
    verified: true,
    responseTime: "within 30 minutes",
    completedJobs: 2100,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:quick-response-plumbing-seattle-wa-us"
    }
  },

  // Restaurants
  {
    id: "4",
    name: "Bella Vista Italian",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    industry: "Restaurant",
    rating: 4.6,
    location: "New York, NY", 
    services: ["Fine Dining", "Italian Cuisine"],
    href: "/us/ny/new-york/bella-vista-italian",
    phone: "(212) 555-0321",
    businessHours: "5 PM - 10 PM",
    isOpen: false,
    trustScore: 4.6,
    verified: true,
    responseTime: "within 4 hours",
    completedJobs: 750,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:bella-vista-italian-nyc-ny-us"
    }
  },
  {
    id: "5",
    name: "Farm Fresh Bistro",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    industry: "Restaurant",
    rating: 4.8,
    location: "Portland, OR",
    services: ["Farm to Table", "Organic"],
    href: "/us/or/portland/farm-fresh-bistro",
    phone: "(503) 555-0654",
    businessHours: "11 AM - 9 PM",
    isOpen: true,
    trustScore: 4.8,
    verified: true,
    responseTime: "within 2 hours",
    completedJobs: 1100,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:farm-fresh-bistro-portland-or-us"
    }
  },
  {
    id: "6", 
    name: "Coastal Seafood Grill",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&h=300&fit=crop",
    industry: "Restaurant", 
    rating: 4.5,
    location: "Miami, FL",
    services: ["Seafood", "Ocean View"],
    href: "/us/fl/miami/coastal-seafood-grill",
    trustScore: 4.5,
    verified: true,
    responseTime: "within 3 hours",
    completedJobs: 650,
    blockchain: {
      verified: false
    }
  },

  // Auto Services
  {
    id: "7",
    name: "Precision Auto Care",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop",
    industry: "Auto Services",
    rating: 4.9,
    location: "Denver, CO",
    services: ["Oil Change", "Brake Service", "Tune-ups"],
    href: "/us/co/denver/precision-auto-care",
    trustScore: 4.9,
    verified: true,
    responseTime: "within 1 hour",
    completedJobs: 1800,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:precision-auto-care-denver-co-us"
    }
  },
  {
    id: "8",
    name: "Metro Collision Center", 
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    industry: "Auto Services",
    rating: 4.7,
    location: "Chicago, IL",
    services: ["Body Work", "Paint", "Collision Repair"],
    href: "/us/il/chicago/metro-collision-center",
    trustScore: 4.7,
    verified: true,
    responseTime: "within 4 hours",
    completedJobs: 950,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:metro-collision-center-chicago-il-us"
    }
  },
  {
    id: "9",
    name: "Express Tire & Lube",
    image: "https://images.unsplash.com/photo-1632823471565-1ecdf4abb1a2?w=400&h=300&fit=crop",
    industry: "Auto Services", 
    rating: 4.6,
    location: "Phoenix, AZ",
    services: ["Tires", "Oil Change", "Quick Service"],
    href: "/us/az/phoenix/express-tire-lube",
    trustScore: 4.6,
    verified: true,
    responseTime: "within 2 hours",
    completedJobs: 1320,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:express-tire-lube-phoenix-az-us"
    }
  },

  // Retail
  {
    id: "10", 
    name: "Artisan Craft Store",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    industry: "Retail",
    rating: 4.8,
    location: "Austin, TX",
    services: ["Handmade Crafts", "Local Artists"],
    href: "/us/tx/austin/artisan-craft-store",
    trustScore: 4.8,
    verified: true,
    responseTime: "within 6 hours",
    completedJobs: 420,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:artisan-craft-store-austin-tx-us"
    }
  },
  {
    id: "11",
    name: "Green Valley Nursery", 
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    industry: "Retail",
    rating: 4.7, 
    location: "Nashville, TN",
    services: ["Plants", "Garden Supplies", "Landscaping"],
    href: "/us/tn/nashville/green-valley-nursery",
    trustScore: 4.7,
    verified: true,
    responseTime: "within 8 hours",
    completedJobs: 680,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:green-valley-nursery-nashville-tn-us"
    }
  },
  {
    id: "12",
    name: "Tech Hub Electronics",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    industry: "Retail",
    rating: 4.5,
    location: "Boston, MA", 
    services: ["Electronics", "Repairs", "Accessories"],
    href: "/us/ma/boston/tech-hub-electronics",
    trustScore: 4.5,
    verified: true,
    responseTime: "within 12 hours",
    completedJobs: 340,
    blockchain: {
      verified: false
    }
  },

  // Sample Restaurant - Featured business for demo
  {
    id: "sample-restaurant",
    name: "Sample Restaurant",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    industry: "Restaurant",
    rating: 4.5,
    location: "San Francisco, CA",
    services: ["Fine Dining", "Contemporary American"],
    href: "/us/ca/san-francisco/sample-restaurant",
    phone: "(555) 123-4567",
    businessHours: "5 PM - 10 PM",
    isOpen: true,
    trustScore: 4.5,
    verified: true,
    responseTime: "within 2 hours",
    completedJobs: 500,
    blockchain: {
      verified: true,
      did: "did:thorbis:business:sample-restaurant-sf-ca-us"
    }
  }
];

export const businessCategories = [
  {
    name: "Home Services",
    businesses: mockBusinesses.filter(b => b.industry === "Home Services")
  },
  {
    name: "Restaurants", 
    businesses: mockBusinesses.filter(b => b.industry === "Restaurant")
  },
  {
    name: "Auto Services",
    businesses: mockBusinesses.filter(b => b.industry === "Auto Services")
  },
  {
    name: "Retail",
    businesses: mockBusinesses.filter(b => b.industry === "Retail")
  }
];

// Featured businesses for hero section
export const featuredBusinesses = mockBusinesses.slice(0, 6);

// Function to get businesses by category
export function getBusinessesByCategory(category: string): Business[] {
  return mockBusinesses.filter(business => 
    business.industry.toLowerCase().includes(category.toLowerCase())
  );
}

// Function to get random businesses with enhanced data
export function getRandomBusinesses(count: number): Business[] {
  const shuffled = [...mockBusinesses].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(business => ({
    ...business,
    phone: business.phone || `(${Math.floor(Math.random() * 900 + 100)}) 555-${Math.floor(Math.random() * 9000 + 1000)}`,
    businessHours: business.businessHours || getRandomBusinessHours(business.industry),
    isOpen: business.isOpen !== undefined ? business.isOpen : Math.random() > 0.3 // 70% chance of being open
  }));
}

// Helper function to generate realistic business hours based on industry
function getRandomBusinessHours(industry: string): string {
  const hours = {
    "Home Services": ["8 AM - 6 PM", "7 AM - 7 PM", "24/7 Emergency", "9 AM - 5 PM"],
    "Restaurant": ["11 AM - 10 PM", "5 PM - 11 PM", "12 PM - 9 PM", "10 AM - 8 PM"],
    "Auto Services": ["7 AM - 6 PM", "8 AM - 5 PM", "9 AM - 7 PM", "24/7 Service"],
    "Retail": ["10 AM - 9 PM", "9 AM - 10 PM", "11 AM - 8 PM", "12 PM - 7 PM"]
  };
  
  const industryHours = hours[industry as keyof typeof hours] || hours["Retail"];
  return industryHours[Math.floor(Math.random() * industryHours.length)];
}
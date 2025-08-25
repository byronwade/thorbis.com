// Shared mock data for dashboard businesses
// This ensures consistency across all dashboard components

export const dashboardBusinesses = [
  {
    id: "1",
    name: "Acme Field Services",
    industry: "field_service",
    plan: "pro",
    description: "Professional field service management company",
    logo: "/placeholder-business.svg"
  },
  {
    id: "2", 
    name: "Downtown Restaurant",
    industry: "restaurant",
    plan: "basic",
    description: "Popular downtown restaurant with full service",
    logo: "/placeholder-restaurant.svg"
  },
  {
    id: "3",
    name: "Smith's Auto Repair", 
    industry: "automotive",
    plan: "basic",
    description: "Automotive repair and maintenance services",
    logo: "/placeholder-auto.svg"
  },
  {
    id: "4",
    name: "Urban Retail Hub",
    industry: "retail",
    plan: "pro",
    description: "Modern retail store with e-commerce integration",
    logo: "/placeholder-retail.svg"
  },
  {
    id: "5",
    name: "Premier Real Estate",
    industry: "real_estate",
    plan: "enterprise",
    description: "Luxury real estate agency with premium listings",
    logo: "/placeholder-business.svg"
  },
  {
    id: "6",
    name: "Tech Solutions Inc",
    industry: "technology",
    plan: "pro",
    description: "IT consulting and software development services",
    logo: "/placeholder-business.svg"
  },
  {
    id: "7",
    name: "Wellness Spa & Salon",
    industry: "beauty",
    plan: "basic",
    description: "Full-service beauty and wellness establishment",
    logo: "/placeholder-spa.svg"
  },
  {
    id: "8",
    name: "City Medical Center",
    industry: "healthcare",
    plan: "enterprise",
    description: "Comprehensive healthcare facility",
    logo: "/placeholder-medical.svg"
  }
];

export const getBusinessById = (id) => {
  return dashboardBusinesses.find(b => b.id === id) || null;
};

export const getBusinessesByIndustry = (industry) => {
  return dashboardBusinesses.filter(b => b.industry === industry);
};

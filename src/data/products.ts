// Product data for the Thorbis store

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  trending?: boolean;
  badge?: string;
  features?: string[];
  specifications?: Record<string, string>;
  inStock?: boolean;
}

// Mock product data
export const allProducts: Product[] = [
  {
    id: "thorbis-pos-pro",
    name: "Thorbis POS Pro",
    description: "Advanced point-of-sale system with integrated payment processing, inventory management, and customer analytics.",
    price: 299.99,
    originalPrice: 399.99,
    image: "/products/pos-pro.jpg",
    category: "POS Systems",
    rating: 4.8,
    reviewCount: 124,
    trending: true,
    badge: "BESTSELLER",
    inStock: true,
    features: [
      "Cloud-based POS system",
      "Integrated payment processing",
      "Real-time inventory tracking",
      "Customer management",
      "Sales analytics and reporting"
    ],
    specifications: {
      "Display": "15.6\" Touch Screen",
      "Processor": "Intel Core i5",
      "Memory": "8GB RAM",
      "Storage": "256GB SSD",
      "Connectivity": "Wi-Fi, Ethernet, Bluetooth"
    }
  },
  {
    id: "thorbis-fleet-tracker",
    name: "Thorbis Fleet Tracker",
    description: "Real-time GPS tracking device for fleet vehicles with route optimization and driver monitoring.",
    price: 149.99,
    image: "/products/fleet-tracker.jpg",
    category: "Fleet Management",
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    features: [
      "Real-time GPS tracking",
      "Route optimization",
      "Driver behavior monitoring",
      "Fuel usage tracking",
      "Mobile app integration"
    ]
  },
  {
    id: "thorbis-security-cam",
    name: "Thorbis Security Camera Pro",
    description: "4K security camera with AI-powered motion detection and cloud storage integration.",
    price: 199.99,
    originalPrice: 249.99,
    image: "/products/security-cam.jpg",
    category: "Security Systems",
    rating: 4.6,
    reviewCount: 156,
    badge: "NEW",
    inStock: true,
    features: [
      "4K Ultra HD recording",
      "AI motion detection",
      "Night vision",
      "Cloud storage",
      "Mobile alerts"
    ]
  },
  {
    id: "thorbis-kitchen-display",
    name: "Thorbis Kitchen Display System",
    description: "Digital kitchen display system for restaurants to streamline order management and kitchen operations.",
    price: 449.99,
    image: "/products/kitchen-display.jpg",
    category: "Kitchen Systems",
    rating: 4.9,
    reviewCount: 67,
    trending: true,
    inStock: true,
    features: [
      "24\" HD display",
      "Order tracking",
      "Kitchen timer integration",
      "Multi-station support",
      "Easy-clean design"
    ]
  },
  {
    id: "thorbis-inventory-scanner",
    name: "Thorbis Inventory Scanner",
    description: "Wireless barcode scanner for efficient inventory management and stock tracking.",
    price: 89.99,
    image: "/products/inventory-scanner.jpg",
    category: "Inventory Management",
    rating: 4.5,
    reviewCount: 201,
    inStock: true,
    features: [
      "Wireless connectivity",
      "Long battery life",
      "Rugged design",
      "Multiple barcode formats",
      "Real-time sync"
    ]
  },
  {
    id: "thorbis-tech-tee",
    name: "Thorbis Tech T-Shirt",
    description: "Premium cotton t-shirt with Thorbis logo. Perfect for tech professionals and business owners.",
    price: 24.99,
    image: "/products/tech-tee.jpg",
    category: "Merchandise",
    rating: 4.3,
    reviewCount: 45,
    inStock: true,
    features: [
      "100% organic cotton",
      "Screen-printed logo",
      "Multiple sizes",
      "Comfortable fit",
      "Machine washable"
    ]
  },
  {
    id: "thorbis-flippad",
    name: "Thorbis FlipPad",
    description: "Dual-screen payment terminal with customer-facing display for enhanced checkout experience.",
    price: 349.99,
    image: "/products/flippad.jpg",
    category: "POS Systems",
    rating: 4.7,
    reviewCount: 92,
    badge: "FEATURED",
    inStock: true,
    features: [
      "Dual 8\" displays",
      "EMV chip reader",
      "Contactless payments",
      "Customer signatures",
      "Receipt printing"
    ]
  },
  {
    id: "thorbis-aegis-360",
    name: "Thorbis Aegis 360",
    description: "360-degree security camera with panoramic view and advanced AI analytics.",
    price: 599.99,
    originalPrice: 699.99,
    image: "/products/aegis-360.jpg",
    category: "Security Systems",
    rating: 4.8,
    reviewCount: 134,
    trending: true,
    inStock: true,
    features: [
      "360-degree panoramic view",
      "4K resolution",
      "AI-powered analytics",
      "Auto-tracking",
      "Weather resistant"
    ]
  },
  {
    id: "thorbis-doorsense",
    name: "Thorbis DoorSense",
    description: "Smart door sensor with access control and visitor management capabilities.",
    price: 129.99,
    image: "/products/doorsense.jpg",
    category: "Security Systems",
    rating: 4.4,
    reviewCount: 78,
    inStock: true,
    features: [
      "Smart door monitoring",
      "Access control",
      "Visitor management",
      "Mobile notifications",
      "Battery powered"
    ]
  },
  {
    id: "thorbis-pay-brick-mini",
    name: "Thorbis Pay Brick Mini",
    description: "Compact payment processing device for mobile businesses and pop-up shops.",
    price: 79.99,
    image: "/products/pay-brick-mini.jpg",
    category: "POS Systems",
    rating: 4.6,
    reviewCount: 167,
    badge: "PORTABLE",
    inStock: true,
    features: [
      "Compact design",
      "Mobile connectivity",
      "Long battery life",
      "Multiple payment methods",
      "Easy setup"
    ]
  }
];

// Get all unique categories
export function getAllCategories(): string[] {
  const categories = [...new Set(allProducts.map(product => product.category))];
  return categories.sort();
}

// Search products by name, description, or category
export function searchProducts(query: string): Product[] {
  if (!query.trim()) return allProducts;
  
  const searchTerm = query.toLowerCase();
  return allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    product.features?.some(feature => feature.toLowerCase().includes(searchTerm))
  );
}

// Get products by category
export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') return allProducts;
  return allProducts.filter(product => product.category === category);
}

// Get product by ID
export function getProductById(id: string): Product | undefined {
  return allProducts.find(product => product.id === id);
}

// Get trending products
export function getTrendingProducts(): Product[] {
  return allProducts.filter(product => product.trending);
}

// Get featured products (with badges)
export function getFeaturedProducts(): Product[] {
  return allProducts.filter(product => product.badge);
}

// Get products on sale
export function getSaleProducts(): Product[] {
  return allProducts.filter(product => product.originalPrice && product.originalPrice > product.price);
}
"use client";

import { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { 
  ShoppingCart, 
  Star,
  BarChart3,
  Users,
  Headphones,
  Info,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@components/store/ProductCard";
import ScrollSection from "@components/site/home/scroll-section";
import { 
  allProducts, 
  featuredProducts, 
  getProductsByCategory, 
  getAllCategories,
  searchProducts 
} from "@data/products";

// Force dynamic rendering for real-time inventory
export const dynamic = "force-dynamic";

// Mock testimonials data
const testimonials = [
  {
    content: "Thorbis POS Pro transformed our restaurant operations. The inventory management is incredible and the customer analytics help us make better business decisions.",
    name: "Sarah Mitchell",
    role: "Restaurant Owner",
    rating: 5
  },
  {
    content: "The fleet tracker has saved us thousands in fuel costs and improved our delivery times. Highly recommend for any business with vehicles.",
    name: "Mike Rodriguez",
    role: "Logistics Manager",
    rating: 5
  },
  {
    content: "Easy to set up, reliable, and the customer support is outstanding. Thorbis products are worth every penny.",
    name: "Jennifer Chen",
    role: "Small Business Owner",
    rating: 5
  }
];

// Thorbis-style Product Slider Component - Updated to match Netflix-style home hero
function ProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Featured products for the slider - use actual products from data
  const sliderProducts = [
    allProducts.find(p => p.id === "thorbis-pos-pro"),
    allProducts.find(p => p.id === "thorbis-aegis-360"),
    allProducts.find(p => p.id === "thorbis-doorsense")
  ].filter(Boolean);

  // Auto-rotate products every 8 seconds
  useEffect(() => {
    if (!sliderProducts || sliderProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderProducts.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [sliderProducts]);

  const currentProduct = sliderProducts?.[currentIndex];
  
  // If no products available, show a fallback
  if (!currentProduct) {
    return (
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Loading Products...</h1>
            <p className="text-muted-foreground">Please wait while we load our product catalog.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-black">
      {/* Netflix-style hero background image */}
      <div className="absolute inset-0">
        <Image
          src={currentProduct.image}
          alt={currentProduct.name}
          fill
          className="object-cover transition-all duration-1000 ease-in-out"
          priority
          onError={(e) => {
            e.target.src = "/placeholder-business.svg";
          }}
        />
        
        {/* Gradient overlays with design system colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      {/* Netflix-style content overlay - mobile responsive */}
      <div className="relative z-10 h-full flex items-center">
        <div className="px-4 md:px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
          <div className="max-w-full md:max-w-2xl">
            {/* Product category badge - mobile responsive */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
              					<div className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs sm:text-sm font-semibold">
                {currentProduct.badge}
              </div>
              <span className="text-muted-foreground text-sm font-medium">
                {currentProduct.category}
              </span>
            </div>

            {/* Product name - mobile responsive sizing */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
              {currentProduct.name}
            </h1>

            {/* Product info row - mobile stacked */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mb-6">
              {/* Rating */}
              <div className="flex items-center gap-2">
                					<Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-current" />
                <span className="text-white font-semibold text-base sm:text-lg">
                  {currentProduct.rating}
                </span>
                <span className="text-muted-foreground text-xs sm:text-sm">
                  ({currentProduct.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                					<span className="text-primary font-bold text-lg sm:text-xl">
                  ${currentProduct.price}
                </span>
                {currentProduct.originalPrice > currentProduct.price && (
                  <span className="text-muted-foreground text-sm line-through">
                    ${currentProduct.originalPrice}
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {(currentProduct.features || []).slice(0, 2).map((feature, index) => (
                    <span key={index} className="text-muted-foreground text-xs sm:text-sm">
                      {feature}
                      {index < 1 && (currentProduct.features || []).length > 1 && " • "}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Description - hidden on small mobile */}
            <p className="hidden sm:block text-muted-foreground text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
              {currentProduct.description}
            </p>

            {/* Mobile short description */}
            <p className="block sm:hidden text-muted-foreground text-sm leading-relaxed mb-6">
              {currentProduct.description.split('.')[0]}.
            </p>

            {/* Action buttons with Thorbis design system */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link href={`/store/product/${currentProduct.id}`} className="flex-1 sm:flex-none">
                					<button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded font-bold text-base sm:text-lg hover:bg-primary/90 transition-colors duration-200">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  Add to Cart
                </button>
              </Link>
              
              <button className="flex items-center justify-center gap-3 bg-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded font-bold text-base sm:text-lg hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm border border-white/20">
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicators with Thorbis colors */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-2">
        {(sliderProducts || []).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 sm:w-3 h-1 rounded-full transition-all duration-300 ${
              					index === currentIndex ? 'bg-primary' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Fade gradient at bottom for seamless transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}

function FeaturedProductsSection() {
  return (
    <section className="py-16 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked solutions to elevate your business operations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    				<section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            					<div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">10,000+</div>
            <div className="text-sm font-medium text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            					<div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
						<BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">99.9%</div>
            <div className="text-sm font-medium text-muted-foreground">Uptime Guarantee</div>
          </div>
          <div className="text-center">
            					<div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Headphones className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">24/7</div>
            <div className="text-sm font-medium text-muted-foreground">Expert Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Categorize products by type for different sections
function categorizeProducts(products) {
  const categories = {
    posSystems: [],
    fleetManagement: [],
    securitySystems: [],
    kitchenSystems: [],
    inventoryManagement: [],
    selfService: [],
    digitalSignage: [],
    iotSensors: [],
    tradesEquipment: [],
    infrastructure: [],
    safetyCompliance: [],
    customerExperience: [],
    developmentTools: [],
    computerVision: [],
    trainingAR: [],
    serviceSolutions: [],
    outdoorSystems: [],
    edgeComputing: [],
    supplyHouse: [],
    clothing: [],
    officeSupplies: [],
    drinkware: [],
    bagsAccessories: [],
    safetyPPE: [],
    techElectronics: [],
    promotional: [],
  };

  products.forEach((product) => {
    const categoryName = product.category?.toLowerCase() || "";
    
    if (categoryName.includes("pos systems")) {
      categories.posSystems.push(product);
    } else if (categoryName.includes("fleet management")) {
      categories.fleetManagement.push(product);
    } else if (categoryName.includes("security systems")) {
      categories.securitySystems.push(product);
    } else if (categoryName.includes("kitchen systems")) {
      categories.kitchenSystems.push(product);
    } else if (categoryName.includes("inventory management")) {
      categories.inventoryManagement.push(product);
    } else if (categoryName.includes("self-service") || categoryName.includes("self service")) {
      categories.selfService.push(product);
    } else if (categoryName.includes("digital signage")) {
      categories.digitalSignage.push(product);
    } else if (categoryName.includes("iot sensors")) {
      categories.iotSensors.push(product);
    } else if (categoryName.includes("trades equipment")) {
      categories.tradesEquipment.push(product);
    } else if (categoryName.includes("infrastructure")) {
      categories.infrastructure.push(product);
    } else if (categoryName.includes("safety & compliance")) {
      categories.safetyCompliance.push(product);
    } else if (categoryName.includes("customer experience")) {
      categories.customerExperience.push(product);
    } else if (categoryName.includes("development tools")) {
      categories.developmentTools.push(product);
    } else if (categoryName.includes("computer vision")) {
      categories.computerVision.push(product);
    } else if (categoryName.includes("training & ar")) {
      categories.trainingAR.push(product);
    } else if (categoryName.includes("service solutions")) {
      categories.serviceSolutions.push(product);
    } else if (categoryName.includes("outdoor systems")) {
      categories.outdoorSystems.push(product);
    } else if (categoryName.includes("edge computing")) {
      categories.edgeComputing.push(product);
    } else if (categoryName.includes("supply house")) {
      categories.supplyHouse.push(product);
    } else if (categoryName.includes("clothing")) {
      categories.clothing.push(product);
    } else if (categoryName.includes("office supplies")) {
      categories.officeSupplies.push(product);
    } else if (categoryName.includes("drinkware")) {
      categories.drinkware.push(product);
    } else if (categoryName.includes("bags & accessories")) {
      categories.bagsAccessories.push(product);
    } else if (categoryName.includes("warehouse systems")) {
      // Add warehouse systems to infrastructure
      categories.infrastructure.push(product);
    } else {
      // Distribute remaining products across categories deterministically
      const keys = Object.keys(categories);
      const productHash = product.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const selectedKey = keys[Math.abs(productHash) % keys.length];
      categories[selectedKey].push(product);
    }
  });

  return categories;
}

// Product sections with real data - similar to home page business sections
function ProductSections({ categories }) {
  return (
    <>
      {/* POS & PAYMENT SYSTEMS SECTION */}
      {categories.posSystems.length > 0 && (
        <div className="space-y-12 animate-fade-in-up mb-20" data-section="pos-systems">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white animate-slide-in-left">POS & Payment Systems</h2>
            					<Link href="/store/categories/pos-systems" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-200">
              See all
            </Link>
          </div>

          {/* Best Sellers - POS Systems */}
          <ScrollSection title="Best Sellers" subtitle="Most popular POS solutions" link="/store/categories/pos-systems?sort=popular">
            {(categories.posSystems || []).slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollSection>

          {/* New Arrivals - POS Systems */}
          {(categories.posSystems || []).length > 10 && (
            <ScrollSection title="New Arrivals" subtitle="Latest POS innovations" link="/store/categories/pos-systems?sort=newest">
              {(categories.posSystems || []).slice(10, 20).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollSection>
          )}
        </div>
      )}

      {/* FLEET MANAGEMENT SECTION */}
      {categories.fleetManagement.length > 0 && (
        <div className="space-y-12 animate-fade-in-up animate-delay-100 mb-20" data-section="fleet-management">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white animate-slide-in-left animate-delay-100">Fleet Management</h2>
            					<Link href="/store/categories/fleet-management" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-300">
              See all
            </Link>
          </div>

          {/* GPS Tracking Solutions */}
          <ScrollSection title="GPS Tracking Solutions" subtitle="Real-time fleet monitoring" link="/store/categories/fleet-management?type=gps">
            {(categories.fleetManagement || []).slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollSection>

          {/* Fleet Accessories */}
          {(categories.fleetManagement || []).length > 10 && (
            <ScrollSection title="Fleet Accessories" subtitle="Essential fleet equipment" link="/store/categories/fleet-management?type=accessories">
              {(categories.fleetManagement || []).slice(10, 20).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollSection>
          )}
        </div>
      )}

      {/* SECURITY SYSTEMS SECTION */}
      {categories.securitySystems.length > 0 && (
        <div className="space-y-12 animate-fade-in-up animate-delay-200 mb-20" data-section="security-systems">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white animate-slide-in-left animate-delay-200">Security & Monitoring</h2>
            					<Link href="/store/categories/security-systems" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-400">
              See all
            </Link>
          </div>

          {/* Surveillance Cameras */}
          <ScrollSection title="Surveillance Cameras" subtitle="Professional security monitoring" link="/store/categories/security-systems?type=cameras">
            {(categories.securitySystems || []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollSection>
        </div>
      )}

      {/* KITCHEN SYSTEMS SECTION */}
      {categories.kitchenSystems.length > 0 && (
        <div className="space-y-12 animate-fade-in-up animate-delay-300 mb-20" data-section="kitchen-systems">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white animate-slide-in-left animate-delay-300">Kitchen & Back-of-House</h2>
            					<Link href="/store/categories/kitchen-systems" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-500">
              See all
            </Link>
          </div>

          {/* Kitchen Display Systems */}
          <ScrollSection title="Kitchen Display Systems" subtitle="Streamline kitchen operations" link="/store/categories/kitchen-systems?type=kds">
            {(categories.kitchenSystems || []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollSection>
        </div>
      )}

      {/* INVENTORY MANAGEMENT SECTION */}
      {categories.inventoryManagement.length > 0 && (
        <div className="space-y-12 animate-fade-in-up animate-delay-400 mb-20" data-section="inventory-management">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white animate-slide-in-left animate-delay-400">Inventory Management</h2>
            					<Link href="/store/categories/inventory-management" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-500">
              See all
            </Link>
          </div>

          {/* Smart Inventory Solutions */}
          <ScrollSection title="Smart Inventory Solutions" subtitle="Automated inventory tracking" link="/store/categories/inventory-management?type=smart">
            {categories.inventoryManagement.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollSection>
        </div>
      )}

      {/* MERCHANDISE SECTION */}
      {(categories.clothing.length > 0 || categories.officeSupplies.length > 0 || categories.drinkware.length > 0) && (
        <div className="space-y-12 animate-fade-in-up animate-delay-500 mb-20" data-section="merchandise">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white animate-slide-in-left animate-delay-500">Thorbis Merchandise</h2>
            					<Link href="/store/categories/merchandise" className="text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-600">
              See all
            </Link>
          </div>

          {/* Clothing & Apparel */}
          {categories.clothing.length > 0 && (
            <ScrollSection title="Clothing & Apparel" subtitle="Professional Thorbis branded clothing" link="/store/categories/merchandise?type=clothing">
              {categories.clothing.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollSection>
          )}

          {/* Office Supplies */}
          {categories.officeSupplies.length > 0 && (
            <ScrollSection title="Office Supplies" subtitle="Essential office accessories" link="/store/categories/merchandise?type=office">
              {categories.officeSupplies.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollSection>
          )}

          {/* Drinkware */}
          {categories.drinkware.length > 0 && (
            <ScrollSection title="Drinkware" subtitle="Stay hydrated with Thorbis style" link="/store/categories/merchandise?type=drinkware">
              {categories.drinkware.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollSection>
          )}
        </div>
      )}

      {/* TRENDING & NEW SECTION */}
      <div className="space-y-12 animate-fade-in-up animate-delay-600 mb-20" data-section="trending">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white animate-slide-in-left animate-delay-600">Trending & New</h2>
        </div>

        {/* Trending This Week */}
        <ScrollSection title="Trending This Week" subtitle="Most viewed products" link="/store/trending">
          {(allProducts || []).slice(0, 20).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ScrollSection>

        {/* Recently Added */}
        {(allProducts || []).length > 20 && (
          <ScrollSection title="New Arrivals" subtitle="Recently added to our catalog" link="/store/search?sort=newest">
            {(allProducts || []).slice(-20).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollSection>
        )}
      </div>
    </>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-16 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from businesses that trust Thorbis
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            					<div key={index} className="bg-background rounded-xl p-6 shadow-lg border border-border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  					<Star key={i} className="w-4 h-4 fill-muted-foreground text-muted-foreground" />
                ))}
              </div>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-base text-white">
                  {testimonial.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main store page component
export default function StorePage() {
  // Categorize all products with safety check
  const categories = categorizeProducts(allProducts || []);
  
  // Check if we have any products to display
  const hasAnyCategories = Object.values(categories || {}).some(category => (category || []).length > 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Thorbis-style Product Slider */}
      <ProductSlider />

      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Main Content with Categorized Product Sections */}
      				<section className="py-24 bg-background">
        <div className="max-w-screen-2xl mx-auto px-6 space-y-24">
          {hasAnyCategories ? (
            <ProductSections categories={categories} />
          ) : (
            <div className="text-center py-24 space-y-6">
                              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  No Products Found
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  We're working on adding products to our catalog. Check back soon!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button className="px-6 py-2 border border-border text-foreground hover:bg-muted transition-colors rounded">
                  <Link href="/store/categories">Browse Categories</Link>
                </button>
                					<button className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded">
                  <Link href="/contact">Contact Sales</Link>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />
    </div>
  );
}

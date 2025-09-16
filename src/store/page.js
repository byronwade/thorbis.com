"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  List,
  ArrowLeft,
  Menu,
  Heart,
  X,
  ChevronDown,
  Share2,
  Play
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/store/ProductCard";
import ProductListItem from "@/components/store/ProductListItem";
import MobileProductList from "@/components/store/MobileProductList";
import ScrollSection from "@/components/shared/scroll-section";
import { 
  allProducts, 
  getAllCategories,
  searchProducts 
} from "@/data/products";

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

// Mobile-optimized Product Slider Component
function ProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use all products for the slider - rotate through different categories
  const sliderProducts = [
    allProducts.find(p => p.id === "thorbis-flippad"),
    allProducts.find(p => p.id === "thorbis-aegis-360"),
    allProducts.find(p => p.id === "thorbis-doorsense"),
    allProducts.find(p => p.id === "thorbis-tech-tee"),
    allProducts.find(p => p.id === "thorbis-pay-brick-mini")
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
      <section className="relative h-[85vh] sm:h-[90vh] lg:h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Loading Products...</h1>
            <p className="text-muted-foreground">Please wait while we load our product catalog.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[80vh] sm:h-[85vh] lg:h-screen overflow-hidden bg-background">
      {/* Netflix-style full-screen background image */}
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
        
        {/* Netflix-style gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent lg:to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Netflix-style content overlay - responsive layout */}
      <div className="relative z-10 h-full flex items-center">
        <div className="px-4 sm:px-6 lg:px-12 xl:px-16 max-w-screen-2xl mx-auto w-full">
          {/* Mobile app-style layout for small screens */}
          <div className="block lg:hidden">
            <div className="flex flex-col justify-end h-full pb-6 sm:pb-8">
              {/* Top action buttons - mobile app style */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold">
                    FEATURED
                  </div>
                  <span className="text-muted-foreground/80 text-xs sm:text-sm font-medium">
                    {currentProduct.category}
                  </span>
                </div>
                
                {/* Mobile app-style action buttons */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button className="p-2 sm:p-2.5 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button className="p-2 sm:p-2.5 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200">
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Product name - mobile app typography */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                {currentProduct.name}
              </h1>

              {/* Product info - mobile app layout */}
              <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
                {/* Rating and reviews */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-current" />
                    <span className="text-foreground font-semibold text-sm sm:text-base">
                      {currentProduct.rating || 4.8}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      ({currentProduct.reviewCount || 127} reviews)
                    </span>
                  </div>
                </div>

                {/* Price and availability */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                      ${currentProduct.price}
                    </span>
                    {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                      <span className="text-base sm:text-lg text-muted-foreground line-through">
                        ${currentProduct.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-500 text-xs sm:text-sm font-medium">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>

              {/* Description - mobile app style */}
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-6 max-w-lg">
                {currentProduct.description}
              </p>

              {/* Mobile app-style action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href={`/store/product/${currentProduct.id}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-primary text-primary-foreground px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:bg-primary/90 transition-all duration-200 active:scale-95 touch-manipulation">
                    <Play className="w-5 h-5 fill-current" />
                    Learn More
                  </button>
                </Link>
                
                <button className="flex items-center justify-center gap-3 bg-background/20 backdrop-blur-sm border border-border/50 text-foreground px-6 py-4 rounded-xl font-semibold text-base hover:bg-background/30 transition-all duration-200 active:scale-95 touch-manipulation">
                  <Info className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Netflix-style desktop layout for larger screens */}
          <div className="hidden lg:block">
            <div className="max-w-2xl xl:max-w-3xl">
              {/* Netflix-style category badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold">
                  FEATURED
                </div>
                <span className="text-muted-foreground text-lg font-medium">
                  {currentProduct.category}
                </span>
              </div>

              {/* Netflix-style prominent title */}
              <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-bold text-foreground mb-6 leading-tight">
                {currentProduct.name}
              </h1>

              {/* Netflix-style product info */}
              <div className="flex items-center gap-6 mb-6">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-current" />
                  <span className="text-foreground font-semibold text-lg">
                    {currentProduct.rating || 4.8}
                  </span>
                  <span className="text-muted-foreground text-base">
                    ({currentProduct.reviewCount || 127} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-3xl xl:text-4xl font-bold text-primary">
                    ${currentProduct.price}
                  </span>
                  {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${currentProduct.originalPrice}
                    </span>
                  )}
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500 text-base font-medium">
                    In Stock
                  </span>
                </div>
              </div>

              {/* Netflix-style description */}
              <p className="text-muted-foreground text-lg xl:text-xl leading-relaxed mb-8 max-w-2xl">
                {currentProduct.description}
              </p>

              {/* Netflix-style action buttons */}
              <div className="flex items-center gap-4">
                <Link href={`/store/product/${currentProduct.id}`}>
                  <button className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-200">
                    <Play className="w-6 h-6 fill-current" />
                    Learn More
                  </button>
                </Link>
                
                <button className="flex items-center justify-center gap-3 bg-background/20 backdrop-blur-sm border border-border/50 text-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-background/30 transition-all duration-200">
                  <Info className="w-6 h-6" />
                  Add to Cart
                </button>

                {/* Desktop action buttons */}
                <button className="p-3 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="p-3 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Netflix-style progress indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {(sliderProducts || []).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }'}
          />
        ))}
      </div>

      {/* Netflix-style fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}

// Mobile-optimized All Products Section
function AllProductsSection({ products, searchQuery, selectedCategory }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'rating'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      case 'name':
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  return (
    <section className="py-8 md:py-16 bg-black">
      <div className="px-4 md:px-6">
        {/* Header with search results info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
              {searchQuery ? 'Search Results for "${searchQuery}"' : 'All Products'}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : '} found
              {selectedCategory !== 'all` && ` in ${selectedCategory}'}
            </p>
          </div>
          
          {/* View and Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={'${sortBy}-${sortOrder}'}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="bg-background border border-border text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-background border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Products Display */}
        {sortedProducts.length > 0 ? (
          <>
            {/* Mobile List View */}
            <div className="block md:hidden">
              <MobileProductList>
                {sortedProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </MobileProductList>
            </div>
            
            {/* Desktop Grid View */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Mobile-optimized Stats Section
function StatsSection() {
  return (
    <section className="py-8 md:py-16 bg-background">
      <div className="px-4 md:px-6">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">10,000+</div>
            <div className="text-xs md:text-sm font-medium text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">99.9%</div>
            <div className="text-xs md:text-sm font-medium text-muted-foreground">Uptime Guarantee</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Headphones className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">24/7</div>
            <div className="text-xs md:text-sm font-medium text-muted-foreground">Expert Support</div>
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
    merchandise: [],
    trending: []
  };

  products.forEach(product => {
    if (product.category === 'POS Systems') categories.posSystems.push(product);
    else if (product.category === 'Fleet Management') categories.fleetManagement.push(product);
    else if (product.category === 'Security Systems') categories.securitySystems.push(product);
    else if (product.category === 'Kitchen Systems') categories.kitchenSystems.push(product);
    else if (product.category === 'Inventory Management') categories.inventoryManagement.push(product);
    else if (product.category === 'Self-Service') categories.selfService.push(product);
    else if (product.category === 'Digital Signage') categories.digitalSignage.push(product);
    else if (product.category === 'IoT Sensors') categories.iotSensors.push(product);
    else if (product.category === 'Trades Equipment') categories.tradesEquipment.push(product);
    else if (product.category === 'Infrastructure') categories.infrastructure.push(product);
    else if (product.category === 'Safety & Compliance') categories.safetyCompliance.push(product);
    else if (product.category === 'Customer Experience') categories.customerExperience.push(product);
    else if (product.category === 'Development Tools') categories.developmentTools.push(product);
    else if (product.category === 'Merchandise`) categories.merchandise.push(product);
    else if (product.trending) categories.trending.push(product);
  });

  return categories;
}

// Mobile-optimized Product Category Section
function ProductCategorySection({ title, products, categorySlug, subtitle = "" }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-6 md:space-y-12 animate-fade-in-up animate-delay-100 mb-12 md:mb-20">
      <div className="flex justify-between items-center px-4 md:px-6">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-white animate-slide-in-left animate-delay-100">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <Link 
          href={`/store/categories/${categorySlug}'} 
          className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors animate-fade-in-scale animate-delay-300"
        >
          See all
        </Link>
      </div>

      {/* Mobile List View */}
      <div className="block md:hidden">
        <MobileProductList>
          {products.slice(0, 8).map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </MobileProductList>
      </div>
      
      {/* Desktop Scroll View */}
      <div className="hidden md:block">
        <ScrollSection title={title} subtitle={subtitle} link={'/store/categories/${categorySlug}'}>
          {products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ScrollSection>
      </div>
    </div>
  );
}

// Mobile-optimized Testimonials Section
function TestimonialsSection() {
  return (
    <section className="py-8 md:py-16 bg-background">
      <div className="px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied businesses using Thorbis solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-card rounded-2xl p-6 md:p-8 border border-border/50"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-semibold text-white text-sm md:text-base">
                  {testimonial.name}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
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

// Mobile-optimized CTA Section
function CTASection() {
  return (
    <section className="py-8 md:py-16 bg-primary/10">
      <div className="px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-8">
            Get started with Thorbis solutions today and join thousands of successful businesses
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 px-8 py-3 rounded-xl font-semibold w-full sm:w-auto">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get all categories
  const allCategories = getAllCategories();

  // Debug logging
  console.log('Store Page Debug:', {
    totalProducts: allProducts.length,
    filteredProducts: filteredProducts.length,
    searchQuery,
    selectedCategory,
    allCategories: allCategories.length
  });

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchProducts(query);
      setFilteredProducts(results);
      console.log('Search results:', results.length);
    } else {
      setFilteredProducts(allProducts);
      console.log('Reset to all products:', allProducts.length);
    }
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === "all") {
      setFilteredProducts(allProducts);
      console.log('Category filter reset to all:', allProducts.length);
    } else {
      const categoryProducts = allProducts.filter(product => product.category === category);
      setFilteredProducts(categoryProducts);
      console.log('Category filter applied:', category, categoryProducts.length);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setFilteredProducts(allProducts);
    console.log('Filters cleared, showing all products:', allProducts.length);
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-border md:hidden">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-white">Store</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 p-0"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 bg-background border-border text-white placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Thorbis Store</h1>
            
            {/* Desktop Search */}
            <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search all products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 bg-background border-border text-white placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearch("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Desktop Category Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="bg-background border border-border text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              {(searchQuery || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-white"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Slider */}
      <ProductSlider />

      {/* Stats */}
      <StatsSection />

      {/* All Products Section */}
      <AllProductsSection 
        products={filteredProducts}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />

      {/* Product Categories - Show if no search/filter is active */}
      {!searchQuery && selectedCategory === "all" && (
        <div className="space-y-8 md:space-y-16">
          {/* Categorize all products */}
          {(() => {
            const categories = categorizeProducts(allProducts);
            
            return (
              <>
                {/* POS Systems */}
                {categories.posSystems.length > 0 && (
                  <ProductCategorySection
                    title="POS Systems"
                    products={categories.posSystems}
                    categorySlug="pos-systems"
                    subtitle="Complete point-of-sale solutions"
                  />
                )}

                {/* Fleet Management */}
                {categories.fleetManagement.length > 0 && (
                  <ProductCategorySection
                    title="Fleet Management"
                    products={categories.fleetManagement}
                    categorySlug="fleet-management"
                    subtitle="GPS tracking and fleet optimization"
                  />
                )}

                {/* Security Systems */}
                {categories.securitySystems.length > 0 && (
                  <ProductCategorySection
                    title="Security & Monitoring"
                    products={categories.securitySystems}
                    categorySlug="security-systems"
                    subtitle="Advanced security solutions"
                  />
                )}

                {/* Kitchen Systems */}
                {categories.kitchenSystems.length > 0 && (
                  <ProductCategorySection
                    title="Kitchen Systems"
                    products={categories.kitchenSystems}
                    categorySlug="kitchen-systems"
                    subtitle="Restaurant and kitchen automation"
                  />
                )}

                {/* Inventory Management */}
                {categories.inventoryManagement.length > 0 && (
                  <ProductCategorySection
                    title="Inventory Management"
                    products={categories.inventoryManagement}
                    categorySlug="inventory-management"
                    subtitle="Smart inventory tracking"
                  />
                )}

                {/* Merchandise */}
                {categories.merchandise.length > 0 && (
                  <ProductCategorySection
                    title="Merchandise"
                    products={categories.merchandise}
                    categorySlug="merchandise"
                    subtitle="Thorbis branded merchandise"
                  />
                )}

                {/* Trending & New */}
                {categories.trending.length > 0 && (
                  <ProductCategorySection
                    title="Trending & New"
                    products={categories.trending}
                    categorySlug="trending"
                    subtitle="Latest and most popular products"
                  />
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA */}
      <CTASection />
    </main>
  );
}

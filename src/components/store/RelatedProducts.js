"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Star, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { allProducts } from "@data/products";

export default function RelatedProducts({ currentProduct }) {
  // Create deterministic shuffle based on product ID for SSR consistency
  const getDeterministicShuffle = (array, seed) => {
    const hash = seed?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) || 0;
    
    // Use hash to create a deterministic shuffle
    return array.sort((a, b) => {
      const aHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const bHash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (aHash + hash) % array.length - (bHash + hash) % array.length;
    });
  };

  // Get related products from the same category or similar categories
  const getRelatedProducts = () => {
    const sameCategory = allProducts.filter(p => 
      p.category === currentProduct.category && p.id !== currentProduct.id
    );
    
    const similarCategories = allProducts.filter(p => 
      p.id !== currentProduct.id && 
      p.category !== currentProduct.category && // Ensure no overlap with sameCategory
      (p.category.includes("Systems") || p.category.includes("Management"))
    );
    
    // Use Set to ensure absolute uniqueness by product ID
    const seenIds = new Set();
    const uniqueProducts = [];
    
    // Add same category products first (priority)
    sameCategory.forEach(product => {
      if (!seenIds.has(product.id)) {
        seenIds.add(product.id);
        uniqueProducts.push(product);
      }
    });
    
    // Add similar category products
    similarCategories.forEach(product => {
      if (!seenIds.has(product.id)) {
        seenIds.add(product.id);
        uniqueProducts.push(product);
      }
    });
    
    // Shuffle deterministically and take first 4
    const related = getDeterministicShuffle(uniqueProducts, currentProduct.id)
      .slice(0, 4);
    
    return related;
  };

  const relatedProducts = getRelatedProducts();
  
  // Debug logging for duplicate keys
  if (process.env.NODE_ENV === 'development') {
    const productIds = relatedProducts.map(p => p.id);
    const duplicateIds = productIds.filter((id, index) => productIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      console.warn('Duplicate product IDs in RelatedProducts:', duplicateIds);
      console.warn('Full relatedProducts array:', relatedProducts);
    }
    
    // Also check if the issue might be in the original allProducts array
    const allProductIds = allProducts.map(p => p.id);
    const allDuplicateIds = allProductIds.filter((id, index) => allProductIds.indexOf(id) !== index);
    if (allDuplicateIds.length > 0) {
      console.error('Duplicate product IDs found in allProducts array:', allDuplicateIds);
    }
  }

  return (
    <section className="mt-32" itemScope itemType="https://schema.org/ItemList">
      <meta itemProp="name" content="Related Products" />
      <meta itemProp="description" content="Business technology products you might also like" />
      
      <div className="mb-24">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            Recommended for You
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
            You Might Also Like
          </h2>
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Handpicked products that complement your selection perfectly
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {relatedProducts.map((product, index) => (
            <div key={`related-${currentProduct.id}-${product.id}-${index}`} className="group relative" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <meta itemProp="position" content={index + 1} />
              <div className="group relative h-full flex flex-col bg-gradient-to-br from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 border border-border hover:border-primary dark:hover:border-primary transition-all duration-300 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02]">
                
                {/* Enhanced Wishlist Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute z-[1] right-4 top-4 h-10 w-10 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm shadow-lg border border-border/50 rounded-xl hover:scale-110 transition-all duration-200"
                >
                  <Heart className="h-5 w-5 transition-colors duration-200 fill-secondary stroke-neutral-600 dark:stroke-neutral-300 hover:stroke-destructive hover:fill-destructive" />
                </Button>

                {/* Enhanced Product Image */}
                <Link href={`/store/product/${product.id}`} className="block shrink-0 w-full">
                  <div className="relative bg-white dark:bg-neutral-800 overflow-hidden aspect-square w-full rounded-t-3xl p-6">
                    <div className="relative w-full h-full bg-neutral-100 dark:bg-neutral-700 rounded-2xl flex items-center justify-center">
                      <Image
                        alt={product.name}
                        loading="eager"
                        fill
                        className="object-contain hover:scale-110 transition-transform duration-500 p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        src={product.image}
                      />
                    </div>
                  </div>
                </Link>

                {/* Enhanced Product Info */}
                <div className="flex flex-col flex-1 p-6 pt-4">
                  <Link href={`/store/product/${product.id}`} className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{product.brand}</p>
                      <h2 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {product.name}
                      </h2>
                    </div>
                    
                    {/* Enhanced Rating */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-muted-foreground text-muted-foreground' : 'text-neutral-300 dark:text-neutral-600'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Price */}
                    <div className="space-y-2">
                      {product.originalPrice && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 line-through">
                          Was ${product.originalPrice.toFixed(2)}
                        </div>
                      )}
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-primary dark:text-primary" aria-label={`Price: $${product.price.toFixed(2)}`}>
                          ${product.price.toFixed(0)}
                          <span className="text-lg">.{(product.price % 1).toFixed(2).slice(2)}</span>
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-primary font-bold bg-primary/20 dark:bg-primary/30 px-2 py-1 rounded-full">
                            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Availability & Shipping */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-semibold text-primary">In Stock</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-primary font-semibold">{product.shipping}</div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">{product.shippingTime}</div>
                      </div>
                    </div>
                  </Link>

                  {/* Enhanced Add to Cart Button */}
                  <div className="pt-4">
                    <Button className="h-12 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Star, ShoppingCart, Heart, CheckCircle, Truck } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="group relative">
      <div className="group relative h-full flex flex-col border border-border hover:border-primary/30 transition-colors duration-200 rounded-lg overflow-hidden bg-background">
        
        {/* Wishlist Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute z-[1] right-2 top-2 h-9 w-9"
        >
          <Heart className="h-5 w-5 transition-colors duration-200 fill-muted-foreground stroke-muted-foreground group-hover:stroke-destructive group-hover:fill-destructive/30" />
        </Button>

        {/* Product Image */}
        <Link href={`/store/product/${product.id}`} className="block shrink-0 w-full">
          <div className="relative bg-muted overflow-hidden border border-border hover:border-primary/30 transition-colors border-0 aspect-square w-full rounded-t-lg">
            <Image
              alt={product.name}
              loading="lazy"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={product.image}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              quality={85}
            />
            
            {/* Badge Overlay */}
            {product.badge && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-xs font-semibold">
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex flex-col mt-3 flex-1 p-3">
          <Link href={`/store/product/${product.id}`} className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{product.brand || "Thorbis"}</p>
            <h2 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {product.name}
            </h2>
            
            {/* Rating */}
            <div className="mt-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'fill-muted-foreground text-muted-foreground' : 'text-muted-foreground/50'}`} 
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mt-2">
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-primary" aria-label={`Price: $${product.price}`}>
                  ${product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-primary font-semibold">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Availability & Shipping */}
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">In Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">Free shipping</span>
              </div>
            </div>
          </Link>

          {/* Add to Cart Button */}
          <div className="flex items-stretch gap-2 mt-3">
            <Button className="h-9 w-full bg-primary hover:bg-primary/90 text-primary-foreground border border-border hover:border-primary/30">
              <div className="flex items-center justify-center w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span>Add to Cart</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

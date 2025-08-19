"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Star, ShoppingCart, Heart, CheckCircle, Truck } from "lucide-react";

export default function ProductListItem({ product }) {
  return (
    <div className="group relative">
      <div className="flex items-start gap-3 px-2 py-3 border-b border-border/20 bg-background transition-colors duration-150 last:border-b-0 active:bg-muted/20">
        
        {/* Product Image - Left Side */}
        <Link href={`/store/${product.id}`} className="block shrink-0">
          <div className="relative bg-muted overflow-hidden border border-border hover:border-primary/30 transition-colors rounded-lg w-16 h-16 sm:w-20 sm:h-20">
            <Image
              alt={product.name}
              loading="lazy"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 64px, 80px"
              src={product.image}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              quality={85}
            />
            
            {/* Badge Overlay */}
            {product.badge && (
              <div className="absolute top-0.5 left-0.5 z-10">
                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground px-1.5 py-0.5 text-xs font-semibold">
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info - Right Side */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {/* Product Title */}
          <Link href={`/store/${product.id}`} className="block">
            <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(product.rating || 0) 
                      ? "fill-muted-foreground text-muted-foreground" 
                      : "text-muted-foreground/30"
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-foreground">
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
            {product.discount && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {product.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Features/Benefits */}
          {product.features && product.features.length > 0 && (
            <div className="flex flex-col gap-0.5 mb-2">
              {product.features.slice(0, 1).map((feature, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle className="w-2.5 h-2.5 text-success flex-shrink-0" />
                  <span className="line-clamp-1">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Shipping Info */}
          {product.freeShipping && (
            <div className="flex items-center gap-1 text-xs text-success mb-2">
              <Truck className="w-2.5 h-2.5 flex-shrink-0" />
              <span>Free Shipping</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm min-h-[32px] sm:min-h-[36px] px-2 sm:px-3"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Add to Cart
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-200 fill-muted-foreground stroke-muted-foreground group-hover:stroke-destructive group-hover:fill-destructive/30" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

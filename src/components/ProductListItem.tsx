"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, Info } from "lucide-react";

interface ProductListItemProps {
  product: {
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
  };
}

export default function ProductListItem({ product }: ProductListItemProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex gap-4 p-4 bg-background border border-border rounded-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
        <Link href={`/store/product/${product.id}`}>
          <Image
            src={imageError ? "/placeholder-product.svg" : product.image}
            alt={product.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </Link>
        
        {/* Product Badge */}
        {(product.trending || product.badge) && (
          <div className="absolute -top-1 -right-1">
            <Badge 
              variant="default" 
              className="bg-primary text-primary-foreground text-xs font-medium scale-75"
            >
              {product.badge || "HOT"}
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        {/* Category */}
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
          {product.category}
        </p>

        {/* Product Name */}
        <Link href={`/store/product/${product.id}`}>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-1 hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Product Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {product.description}
        </p>

        {/* Rating & Price Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{product.rating}</span>
                {product.reviewCount && (
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center gap-1">
              <span className="font-bold text-foreground">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : '}'} />
            </Button>
            
            <Button variant="outline" size="sm" className="h-8 px-3">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            
            <Button asChild size="sm" className="h-8 px-4">
              <Link href={'/store/product/${product.id}'}>
                View
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
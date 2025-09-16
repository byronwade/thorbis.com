"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Heart, ShoppingCart, Info } from "lucide-react";

interface ProductCardProps {
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

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card className="group relative bg-background border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Link href={`/store/product/${product.id}`}>
            <Image
              src={imageError ? "/placeholder-product.svg" : product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          </Link>
          
          {/* Product Badge */}
          {(product.trending || product.badge) && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant="default" 
                className="bg-primary text-primary-foreground text-xs font-medium"
              >
                {product.badge || "TRENDING"}
              </Badge>
            </div>
          )}
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : '}`} />
          </Button>

          {/* Discount Badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-3 right-3 group-hover:right-14 transition-all duration-300">
              <Badge variant="destructive" className="text-xs">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Category */}
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          {product.category}
        </p>

        {/* Product Name */}
        <Link href={`/store/product/${product.id}'}>
          <CardTitle className="text-base font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </CardTitle>
        </Link>

        {/* Product Description */}
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </CardDescription>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            {product.reviewCount && (
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-foreground">
            ${product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button asChild className="flex-1" size="sm">
            <Link href={'/store/product/${product.id}'}>
              <Info className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" className="px-3">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ShoppingCart, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { allProducts, getProductsByCategory } from "@/data/products";
import { useState } from "react";

interface Product {
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
}

interface RelatedProductsProps {
  currentProduct: Product;
  maxProducts?: number;
}

export default function RelatedProducts({ currentProduct, maxProducts = 4 }: RelatedProductsProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Get related products from the same category, excluding the current product
  const relatedProducts = getProductsByCategory(currentProduct.category)
    .filter(product => product.id !== currentProduct.id)
    .slice(0, maxProducts);

  // If we don't have enough from the same category, fill with other products
  if (relatedProducts.length < maxProducts) {
    const additionalProducts = allProducts
      .filter(product => 
        product.id !== currentProduct.id && 
        product.category !== currentProduct.category &&
        !relatedProducts.some(related => related.id === product.id)
      )
      .slice(0, maxProducts - relatedProducts.length);
    
    relatedProducts.push(...additionalProducts);
  }

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">Related Products</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            You Might Also Like
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover other products that complement your selection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <Card key={product.id} className="group bg-background border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Link href={`/store/product/${product.id}`}>
                    <Image
                      src={imageErrors[product.id] ? "/placeholder-product.svg" : product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => handleImageError(product.id)}
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

                  {/* Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-3 right-3">
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
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    {product.reviewCount && (
                      <span className="text-xs text-muted-foreground">
                        ({product.reviewCount})
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
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/store">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
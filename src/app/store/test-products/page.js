"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import { allProducts } from "@data/products";

export default function TestProductsPage() {
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category] = allProducts.filter(p => p.category === category);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Product Details Pages Test
          </h1>
          <p className="text-muted-foreground text-lg">
            Testing all {allProducts.length} products from the catalog
          </p>
        </div>

        <div className="space-y-8">
          {categories.map(category => (
            				<Card key={category} className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {category}
                  <Badge variant="secondary" className="ml-2">
                    {productsByCategory[category].length} products
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsByCategory[category].map(product => (
                    <div
                      key={product.id}
                      className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          ${product.price}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          						<span className="text-muted-foreground text-xs">★</span>
                          <span className="text-muted-foreground text-xs">
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="h-7 px-2 text-xs"
                        >
                          <Link href={`/store/product/${product.id}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" className="text-white border-border">
            <Link href="/store">
              Back to Store
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Package, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { allProducts } from "@data/products";

export default function DebugPage() {
  const testProductIds = [
    "thorbis-pos-pro",
    "thorbis-aegis-360", 
    "thorbis-doorsense",
    "thorbis-tech-tee",
    "thorbis-lanyard"
  ];

  const testResults = testProductIds.map(id => {
    const product = allProducts.find(p => p.id === id);
    return {
      id,
      found: !!product,
      product: product
    };
  });

  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  const totalProducts = allProducts.length;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Store Debug & Test Page
          </h1>
          <p className="text-muted-foreground text-lg">
            Testing product data loading and component functionality
          </p>
        </div>

        {/* Data Summary */}
        <Card className="bg-background border-border mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5" />
              Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4">
                <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
                <div className="text-muted-foreground text-sm">Total Products</div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="text-2xl font-bold text-foreground">{categories.length}</div>
                <div className="text-muted-foreground text-sm">Categories</div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="text-2xl font-bold text-foreground">{testResults.filter(r => r.found).length}/{testResults.length}</div>
                <div className="text-muted-foreground text-sm">Test Products Found</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="bg-background border-border mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 bg-card rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.found ? (
                      					<CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      						<AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <div className="font-semibold text-foreground">{result.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.found ? result.product.name : "Not found"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {result.found && (
                      <Button asChild size="sm">
                        <Link href={`/store/product/${result.id}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Test Page
                        </Link>
                      </Button>
                    )}
                    <Badge variant={result.found ? "default" : "destructive"}>
                      {result.found ? "Found" : "Missing"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="bg-background border-border mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const categoryProducts = allProducts.filter(p => p.category === category);
                return (
                  <div key={category} className="bg-card rounded-lg p-4">
                    <div className="font-semibold text-foreground mb-2">{category}</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {categoryProducts.length} products
                    </div>
                    <div className="space-y-1">
                      {categoryProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="text-xs text-muted-foreground">
                          • {product.name}
                        </div>
                      ))}
                      {categoryProducts.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          ... and {categoryProducts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline" className="text-foreground border-border">
            <Link href="/store">
              Back to Store
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-foreground border-border">
            <Link href="/store/test-products">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

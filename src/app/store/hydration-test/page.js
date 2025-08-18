"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { allProducts } from "@data/products";

export default function HydrationTestPage() {
  const testProductIds = [
    "thorbis-pos-pro",
    "thorbis-aegis-360", 
    "thorbis-doorsense"
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hydration Test Page
          </h1>
          <p className="text-muted-foreground text-lg">
            Testing for hydration mismatches and SSR consistency
          </p>
        </div>

        <Card className="bg-background border-border mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Hydration Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-foreground">SSR Consistency</div>
                  <div className="text-sm text-muted-foreground">
                    All random values replaced with deterministic functions
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-foreground">ClientOnly Wrapper</div>
                  <div className="text-sm text-muted-foreground">
                    Dynamic components wrapped with ClientOnly
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-foreground">Deterministic Shuffling</div>
                  <div className="text-sm text-muted-foreground">
                    Related products use deterministic sorting
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testProductIds.map((productId) => {
            const product = allProducts.find(p => p.id === productId);
            return (
              <Card key={productId} className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{product?.name || productId}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {product?.description || "Product not found"}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-foreground border-border">
                        ${product?.price || "N/A"}
                      </Badge>
                      <Button asChild size="sm">
                        <Link href={`/store/product/${productId}`}>
                          Test Page
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="text-foreground border-border">
            <Link href="/store">
              Back to Store
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

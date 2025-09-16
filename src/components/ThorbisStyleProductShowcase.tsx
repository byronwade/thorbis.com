"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, CheckCircle, Award, Zap } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features?: string[];
  specifications?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
}

interface ThorbisStyleProductShowcaseProps {
  product: Product;
}

export default function ThorbisStyleProductShowcase({ product }: ThorbisStyleProductShowcaseProps) {
  return (
    <section className="w-full py-16 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Features Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <Star className="w-5 h-5" />
            <span className="font-semibold">Key Features</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Why Choose {product.name}?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the powerful features that make this product essential for your business
          </p>
        </div>

        {/* Features Grid */}
        {product.features && product.features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.features.slice(0, 6).map((feature, index) => (
              <Card key={index} className="bg-background border-border hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    {index % 3 === 0 && <CheckCircle className="w-6 h-6 text-primary" />}
                    {index % 3 === 1 && <Award className="w-6 h-6 text-primary" />}
                    {index % 3 === 2 && <Zap className="w-6 h-6 text-primary" />}
                  </div>
                  <CardTitle className="text-lg">{feature}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Advanced functionality designed to streamline your operations and boost productivity.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Specifications Section */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="bg-background rounded-2xl p-8 border border-border">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Technical Specifications</h3>
              <p className="text-muted-foreground">Detailed product specifications and requirements</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <dt className="font-semibold text-foreground text-sm uppercase tracking-wide">{key}</dt>
                  <dd className="text-muted-foreground">{value}</dd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Signals */}
        <div className="bg-primary/5 rounded-2xl p-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center items-center gap-2">
              <Award className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">Trusted by Industry Leaders</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">{product.rating || 4.8}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
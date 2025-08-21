"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  CheckCircle, 
  Copy,
  Shield,
  Award,
  Microscope,
  Leaf,
  Clock
} from "lucide-react";

export default function BusinessInfoCard({ product }) {
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safety check for product data
  if (!product) {
    return null;
  }

  const copyToClipboard = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Don't render clipboard functionality during SSR
  if (!isClient) {
    return (
      <>
        {/* Enhanced USA Made Section */}
        <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 shrink-0">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg shadow-md">
                  <rect width="32" height="20" fill="#FFFFFF"/>
                  <rect width="32" height="1.538" fill="#B22234"/>
                  <rect y="3.077" width="32" height="1.538" fill="#B22234"/>
                  <rect y="6.154" width="32" height="1.538" fill="#B22234"/>
                  <rect y="9.231" width="32" height="1.538" fill="#B22234"/>
                  <rect y="12.308" width="32" height="1.538" fill="#B22234"/>
                  <rect y="15.385" width="32" height="1.538" fill="#B22234"/>
                  <rect y="18.462" width="32" height="1.538" fill="#B22234"/>
                  <rect width="13.231" height="10.769" fill="#3C3B6E"/>
                </svg>
              </div>
              <div className="font-black text-lg text-white">
                Made in {product.madeIn || "United States"}
              </div>
            </div>
            <Badge className="w-fit bg-destructive/30 text-destructive border-destructive/30 px-2.5 py-1 text-xs font-bold">
              🇺🇸 100% American Manufacturing
            </Badge>
          </div>
        </div>

        {/* Enhanced Quality Indicators */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 616 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <span className="font-black text-white text-sm">Supporting Workers</span>
            </div>
          </div>
          <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-black text-white text-sm">Quality First</span>
            </div>
          </div>
        </div>

        {/* Enhanced Specifications Grid */}
        <div className="space-y-3">
          <h3 className="text-lg font-black text-white tracking-tight">Product Specifications</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-bold text-sm">Category</span>
                  <span className="font-black text-white text-sm">{product.category || "N/A"}</span>
                </div>
              </div>
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-bold text-sm">Brand</span>
                  <span className="font-black text-white text-sm">{product.brand || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-bold text-sm">SKU</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white text-sm">{product.specifications?.SKU || "N/A"}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="h-6 w-6 p-0 hover:bg-primary/30 rounded-lg"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Feature Highlights */}
        <div className="space-y-3">
          <h3 className="text-lg font-black text-white tracking-tight">Key Features</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(product.features || {}).map(([title, description], index) => {
              const icons = [Award, Microscope, Leaf, Clock];
              const colors = [
                { bg: 'bg-primary/30', text: 'text-primary' },
                { bg: 'bg-muted-foreground/30', text: 'text-muted-foreground' },
                { bg: 'bg-primary/20', text: 'text-primary' },
                { bg: 'bg-muted-foreground/20', text: 'text-muted-foreground' }
              ];
              const IconComponent = icons[index % icons.length];
              const colorScheme = colors[index % colors.length];
              
              return (
                <div key={title} className="group bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${colorScheme.bg} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-4 w-4 ${colorScheme.text}`} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-black text-sm text-white">{title}</h4>
                      <p className="text-muted-foreground leading-relaxed text-xs">{description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Trust Indicators */}
        <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base font-bold text-white">Trusted Quality</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Trusted by thousands of business professionals nationwide
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Enhanced USA Made Section */}
      <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 shrink-0">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg shadow-md">
                <rect width="32" height="20" fill="#FFFFFF"/>
                <rect width="32" height="1.538" fill="#B22234"/>
                <rect y="3.077" width="32" height="1.538" fill="#B22234"/>
                <rect y="6.154" width="32" height="1.538" fill="#B22234"/>
                <rect y="9.231" width="32" height="1.538" fill="#B22234"/>
                <rect y="12.308" width="32" height="1.538" fill="#B22234"/>
                <rect y="15.385" width="32" height="1.538" fill="#B22234"/>
                <rect y="18.462" width="32" height="1.538" fill="#B22234"/>
                <rect width="13.231" height="10.769" fill="#3C3B6E"/>
              </svg>
            </div>
            <div className="font-black text-lg text-white">
              Made in {product.madeIn || "United States"}
            </div>
          </div>
          <Badge className="w-fit bg-destructive/30 text-destructive border-destructive/30 px-2.5 py-1 text-xs font-bold">
            🇺🇸 100% American Manufacturing
          </Badge>
        </div>
      </div>

      {/* Enhanced Quality Indicators */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 616 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className="font-black text-white text-sm">Supporting Workers</span>
          </div>
        </div>
        <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-black text-white text-sm">Quality First</span>
          </div>
        </div>
      </div>

      {/* Enhanced Specifications Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-white tracking-tight">Product Specifications</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-3">
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-bold text-sm">Category</span>
                <span className="font-black text-white text-sm">{product.category || "N/A"}</span>
              </div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-bold text-sm">Brand</span>
                <span className="font-black text-white text-sm">{product.brand || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-bold text-sm">SKU</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-sm">{product.specifications?.SKU || "N/A"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(product.specifications?.SKU || "")}
                    className="h-6 w-6 p-0 hover:bg-primary/30 rounded-lg"
                  >
                    {copied ? <CheckCircle className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Feature Highlights */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-white tracking-tight">Key Features</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(product.features || {}).map(([title, description], index) => {
            const icons = [Award, Microscope, Leaf, Clock];
            const colors = [
              { bg: 'bg-primary/30', text: 'text-primary' },
              { bg: 'bg-muted-foreground/30', text: 'text-muted-foreground' },
              { bg: 'bg-primary/20', text: 'text-primary' },
              { bg: 'bg-muted-foreground/20', text: 'text-muted-foreground' }
            ];
            const IconComponent = icons[index % icons.length];
            const colorScheme = colors[index % colors.length];
            
            return (
              <div key={title} className="group bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${colorScheme.bg} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-4 w-4 ${colorScheme.text}`} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-black text-sm text-white">{title}</h4>
                    <p className="text-muted-foreground leading-relaxed text-xs">{description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Trust Indicators */}
      <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-bold text-white">Trusted Quality</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Trusted by thousands of business professionals nationwide
          </p>
        </div>
      </div>
    </>
  );
}

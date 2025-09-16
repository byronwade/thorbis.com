"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail, Globe, Shield } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  madeIn?: string;
  businessType?: string;
  returnPolicy?: string;
}

interface BusinessInfoCardProps {
  product: Product;
}

export default function BusinessInfoCard({ product }: BusinessInfoCardProps) {
  return (
    <div className="bg-gray-25 border border-gray-300 rounded p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-5 h-5 text-gray-700" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
          <p className="text-sm text-gray-700">Trusted by professionals worldwide</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-gray-700 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-gray-700">Made in:</span>
            <span className="ml-2 text-gray-900">{product.madeIn || "United States"}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-gray-700 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-gray-700">Business Type:</span>
            <span className="ml-2 text-gray-900">{product.businessType || "Technology Company"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-700 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-gray-700">Return Policy:</span>
            <span className="ml-2 text-gray-900">{product.returnPolicy || "30-day money-back guarantee"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-gray-700 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-gray-700">Support:</span>
            <span className="ml-2 text-gray-900">24/7 Customer Service</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-700 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-gray-700">Contact:</span>
            <span className="ml-2 text-gray-900">support@thorbis.com</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-300 mt-6">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            ✓ Verified Business
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            ✓ Secure Checkout
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            ✓ Free Shipping
          </span>
        </div>
      </div>
    </div>
  );
}
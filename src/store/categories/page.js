"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, ShoppingCart, Heart, CheckCircle, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/store/ProductCard";
import ProductListItem from "@/components/store/ProductListItem";
import MobileProductList from "@/components/store/MobileProductList";
import { allProducts, getAllCategories, getProductsByCategory } from "@/data/products";

// Category data with icons and descriptions
const categoryDetails = {
  "POS Systems": {
    icon: "💳",
    description: "Complete point-of-sale solutions for restaurants, retail, and service businesses"
  },
  "Fleet Management": {
    icon: "🚛", 
    description: "GPS tracking and fleet optimization solutions for transportation businesses"
  },
  "Security Systems": {
    icon: "🔒",
    description: "Professional security cameras and monitoring solutions"
  },
  "Kitchen Systems": {
    icon: "🍳",
    description: "Digital kitchen management systems for restaurants"
  },
  "Inventory Management": {
    icon: "📦",
    description: "Barcode scanners and inventory tracking solutions"
  },
  "Merchandise": {
    icon: "👕",
    description: "Thorbis branded merchandise and apparel"
  }
};

// Get categories with details
const categories = getAllCategories().map(category => ({
  id: category.toLowerCase().replace(/\s+/g, '-'),
  name: category,
  description: categoryDetails[category]?.description || 'Professional ${category.toLowerCase()} solutions',
  icon: categoryDetails[category]?.icon || "📱",
  slug: category.toLowerCase().replace(/\s+/g, '-`),
  products: getProductsByCategory(category)
}));

function CategoryHeader({ category }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">{category.icon}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            {category.name}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            {category.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryProducts({ products }) {
  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        {/* Mobile List View */}
        <div className="block md:hidden">
          <MobileProductList>
            {products.map((product) => (
              <ProductListItem key={product.id} product={product} />
            ))}
          </MobileProductList>
        </div>
        
        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryNavigation({ categories, currentCategory }) {
  return (
    <section className="py-8 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((category) => (
            <Link key={category.id} href={`/store/categories/${category.slug}'}>
              <Button
                variant={currentCategory?.id === category.id ? "default" : "outline"}
                className={'px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  currentCategory?.id === category.id
                    					? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }'}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CategoriesPage() {
  // For now, show the first category as an example
  const currentCategory = categories[0];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <CategoryHeader category={currentCategory} />
      <CategoryNavigation categories={categories} currentCategory={currentCategory} />
      <CategoryProducts products={currentCategory.products} />
    </div>
  );
}

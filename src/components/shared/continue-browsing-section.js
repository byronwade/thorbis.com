"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import BusinessCard from "@components/site/home/business-card";
import { Clock, Eye, Heart, TrendingUp } from "lucide-react";

export default function ContinueBrowsingSection({ businesses = [] }) {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [savedBusinesses, setSavedBusinesses] = useState([]);

  // Simulate recently viewed businesses (normally from localStorage/cookies)
  useEffect(() => {
    // Mock recently viewed data
    const mockRecentlyViewed = businesses.slice(0, 6).map(business => ({
      ...business,
      viewedAt: Date.now() - Math.random() * 86400000, // Random time in last 24h
      viewProgress: Math.floor(Math.random() * 100) // Simulate scroll progress
    }));
    
    setRecentlyViewed(mockRecentlyViewed);

    // Mock saved businesses
    const mockSaved = businesses.slice(6, 10).map(business => ({
      ...business,
      savedAt: Date.now() - Math.random() * 604800000 // Random time in last week
    }));
    
    setSavedBusinesses(mockSaved);
  }, [businesses]);

  if (!businesses.length) return null;

  return (
    <div className="space-y-8">
      {/* Continue Exploring - Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              						<Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Continue Exploring</h2>
            </div>
            <Link href="/profile/history" className="text-sm text-muted-foreground hover:text-white transition-colors">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyViewed.map((business) => (
              <div key={`recent-${business.id}`} className="relative group">
                <BusinessCard business={business} />
                
                {/* Netflix-style progress bar */}
                <div className="absolute bottom-12 left-0 right-0 h-1 bg-muted mx-2">
                  <div 
                    					className="h-full bg-destructive transition-all duration-300"
                    style={{ width: `${business.viewProgress || 0}%` }}
                  />
                </div>

                {/* Recently viewed badge */}
                					<div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Recently Viewed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My List / Saved Businesses */}
      {savedBusinesses.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              						<Heart className="w-5 h-5 text-destructive" />
              <h2 className="text-xl font-bold text-white">My List</h2>
            </div>
            <Link href="/profile/saved" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Manage List
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {savedBusinesses.map((business) => (
              <div key={`saved-${business.id}`} className="relative group">
                <BusinessCard business={business} />
                
                {/* Saved badge */}
                					<div className="absolute top-2 left-2 bg-destructive/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                  <Heart className="w-3 h-3 inline mr-1 fill-current" />
                  Saved
                </div>

                {/* Remove from list button */}
                <button 
                  className="absolute top-2 right-2 w-6 h-6 bg-black/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    setSavedBusinesses(prev => prev.filter(b => b.id !== business.id));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending in Your Area */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            						<TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-white">Trending in Your Area</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {businesses.slice(10, 16).map((business, index) => (
            <div key={`trending-${business.id}`} className="relative">
              <BusinessCard business={business} />
              
              {/* Trending rank */}
              					<div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                #{index + 1} Trending
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

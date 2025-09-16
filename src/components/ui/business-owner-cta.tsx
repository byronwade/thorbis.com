"use client";

import { ArrowRight, Users, Star, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";

export function BusinessOwnerCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-neutral-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Own a Business?
          </h2>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Join thousands of local businesses already growing their customer base on Thorbis
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4 mx-auto">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">2.5M+</div>
            <div className="text-neutral-400 text-sm">Monthly Visitors</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4 mx-auto">
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.8</div>
            <div className="text-neutral-400 text-sm">Average Rating</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4 mx-auto">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">85%</div>
            <div className="text-neutral-400 text-sm">Growth Rate</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4 mx-auto">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
            <div className="text-neutral-400 text-sm">Verified Businesses</div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Reach More Customers</h3>
            <p className="text-neutral-400">
              Get discovered by millions of potential customers searching for businesses like yours
            </p>
          </div>
          
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Grow Your Revenue</h3>
            <p className="text-neutral-400">
              Businesses on our platform see an average of 40% increase in new customer inquiries
            </p>
          </div>
          
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Build Trust</h3>
            <p className="text-neutral-400">
              Showcase reviews, certifications and build credibility with verified business profiles
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-y-4">
          <Link
            href="/business/claim"
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            Claim Your Business
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/business/signup"
              className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors underline underline-offset-4"
            >
              Create New Business Profile
            </Link>
            <span className="text-neutral-600">•</span>
            <Link
              href="/business/pricing"
              className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors underline underline-offset-4"
            >
              View Pricing Plans
            </Link>
          </div>
          
          <p className="text-neutral-500 text-sm mt-6">
            Free to claim • Takes less than 5 minutes • Start getting customers today
          </p>
        </div>
      </div>
    </section>
  );
}
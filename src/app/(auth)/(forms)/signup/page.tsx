'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForms } from '@/components/auth/auth-forms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Zap, 
  Users, 
  CheckCircle,
  Star,
  TrendingUp,
  Lock,
  Gift,
  Calendar,
  CreditCard
} from 'lucide-react';


// Modern SaaS Signup Page
const ModernSignupPage = () => {
  const [authMode, setAuthMode] = useState('sign-up');
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/onboarding');
  };

  const features = [
    { icon: Calendar, title: "Schedule Management", desc: "Smart scheduling across all your service teams" },
    { icon: Users, title: "Customer Management", desc: "Complete customer relationship management" },
    { icon: CreditCard, title: "Payment Processing", desc: "Accept payments online and in-person" },
    { icon: Zap, title: "AI Automation", desc: "Automate repetitive tasks with AI" },
  ];

  const industries = [
    { name: "Home Services", count: "3,200+ businesses", color: "bg-blue-500" },
    { name: "Restaurants", count: "1,800+ locations", color: "bg-green-500" },
    { name: "Auto Services", count: "950+ shops", color: "bg-red-500" },
    { name: "Retail", count: "2,100+ stores", color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex">
      {/* Left Side - Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <Image 
              src="/logos/ThorbisLogo.webp" 
              alt="Thorbis" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Thorbis</h1>
              <p className="text-sm text-neutral-400">Business Operations Suite</p>
            </div>
          </div>
          
          <Badge className="bg-green-600 hover:bg-green-600 mb-6">
            <Gift className="w-3 h-3 mr-1" />
            Free 30-day trial • No credit card required
          </Badge>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Join thousands of businesses growing with Thorbis
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8">
            Start your free trial today and see why over 10,000 businesses 
            trust Thorbis to run their operations.
          </p>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-neutral-200">{feature.title}</span>
                </div>
                <p className="text-sm text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Industry Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Trusted across industries</h3>
            <div className="grid grid-cols-2 gap-3">
              {industries.map((industry, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={'w-3 h-3 rounded-full ${industry.color}'} />
                  <div>
                    <div className="text-sm font-medium text-neutral-200">{industry.name}</div>
                    <div className="text-xs text-neutral-400">{industry.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">40%</div>
            <div className="text-sm text-neutral-400">avg efficiency gain</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">4.9/5</div>
            <div className="text-sm text-neutral-400">customer rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-sm text-neutral-400">expert support</div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-2xl">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-12">
            <Image 
              src="/logos/ThorbisLogo.webp" 
              alt="Thorbis" 
              width={60} 
              height={60}
              className="rounded-lg"
            />
          </div>

          {/* Header Section */}
          <div className="text-center mb-10">
            <Badge className="bg-green-600 hover:bg-green-600 mb-6">
              <Gift className="w-3 h-3 mr-1" />
              30-day free trial
            </Badge>
            
            <h1 className="text-3xl font-bold text-white mb-3">
              {authMode === 'sign-up' ? 'Create your account' : authMode === 'sign-in' ? 'Welcome back' : 'Reset password'}
            </h1>
            <p className="text-neutral-400 text-lg">
              {authMode === 'sign-up' && 'Start your free trial - no credit card required'}
              {authMode === 'sign-in' && 'Sign in to access your business dashboard'}
              {authMode === 'reset-password' && 'Enter your email to reset your password'}
            </p>
          </div>
          
          {/* Form Section */}
          <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8">
            <AuthForms 
              mode={authMode} 
              onModeChange={setAuthMode}
              onSuccess={handleAuthSuccess}
              redirectTo="/onboarding"
              showCreditCardOption={true}
              showDemoButton={true}
            />

            {/* What's Included */}
            {authMode === 'sign-up' && (
              <div className="mt-8 space-y-4">
                <h4 className="text-base font-medium text-neutral-200">What's included in your free trial:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-neutral-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Complete business suite</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>AI-powered insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>No setup fees</span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-neutral-900/30 rounded-xl border border-neutral-700/30">
              <div className="flex items-center space-x-2 text-sm text-neutral-300">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Your data is protected with enterprise-grade security</span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-neutral-400">4.9/5 from 2,500+ reviews</span>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="/security" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Security
              </Link>
            </div>

            <div className="text-xs text-neutral-500">
              © 2025 Thorbis. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function SignupPage() {
  return <ModernSignupPage />;
}
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForms } from '@/components/auth/auth-forms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle,
  Star,
  TrendingUp,
  Lock
} from 'lucide-react';


// Modern SaaS Login Page with Real Authentication
const ModernLoginPage = () => {
  const [authMode, setAuthMode] = useState('sign-in');
  const router = useRouter();

  const handleAuthSuccess = () => {
    console.log('handleAuthSuccess called'); // Debug
    // Check if there's a redirect URL, otherwise go to default business dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirectTo');
    
    console.log('Redirect params:', { redirectTo }); // Debug
    
    if (redirectTo) {
      console.log('Redirecting to:', redirectTo); // Debug
      router.push(redirectTo);
    } else {
      // Default to the main business dashboard - HS (Home Services) as the primary
      console.log('Redirecting to default dashboard: /dashboards/hs'); // Debug
      router.push('/dashboards/hs');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between">
        {/* Logo & Tagline */}
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
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Run your entire business from one platform
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8">
            From field service to restaurant management, auto repair to retail - 
            Thorbis handles it all with AI-powered efficiency.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-neutral-200">AI-powered automation & insights</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-neutral-200">Multi-industry support (HVAC, Restaurant, Auto, Retail)</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-neutral-200">Enterprise-grade security & compliance</span>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 bg-neutral-600 rounded-full border-2 border-neutral-800" />
              ))}
            </div>
            <span className="text-sm text-neutral-400">
              Join 10,000+ businesses already using Thorbis
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm text-neutral-400">4.9/5 from 2,500+ reviews</span>
          </div>

          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-neutral-400">
              Average 40% efficiency increase in first 90 days
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-2xl">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-16">
            <Image 
              src="/logos/ThorbisLogo.webp" 
              alt="Thorbis" 
              width={80} 
              height={80}
              className="rounded-lg"
            />
          </div>

          
          {/* Form Section */}
          <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-3xl p-12 lg:p-16">
            <AuthForms 
              mode={authMode} 
              onModeChange={setAuthMode}
              onSuccess={handleAuthSuccess}
              redirectTo="/dashboard"
            />

            {/* Security Notice */}
            <div className="mt-12 p-6 bg-neutral-900/30 rounded-2xl border border-neutral-700/30">
              <div className="flex items-center space-x-3 text-base text-neutral-300">
                <Lock className="w-6 h-6 text-blue-400" />
                <span>Secured with enterprise-grade encryption</span>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-12 text-center space-y-6">
            <div className="flex items-center justify-center space-x-8 text-base">
              <Link 
                href="/privacy" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors py-2"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors py-2"
              >
                Terms of Service
              </Link>
              <Link 
                href="/support" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors py-2"
              >
                Help & Support
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


export default function LoginPage() {
  return <ModernLoginPage />;
}
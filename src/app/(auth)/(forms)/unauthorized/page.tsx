"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ArrowLeft, 
  AlertTriangle,
  Home,
  LogIn,
  Mail
} from 'lucide-react';


export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get('returnUrl');
  const reason = searchParams.get('reason');

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToLogin = () => {
    const loginUrl = returnUrl ? '/auth/login?redirectTo=${encodeURIComponent(returnUrl)}' : '/auth/login';
    router.push(loginUrl);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex">
      {/* Left Side - Information */}
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
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Secure access protection
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8">
            We protect your business data with role-based permissions 
            and secure access controls.
          </p>

          {/* Security Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Role-Based Access</h3>
                <p className="text-neutral-400">
                  Access to features is controlled by your role and permissions within the organization.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Data Protection</h3>
                <p className="text-neutral-400">
                  We ensure sensitive business information is only accessible to authorized users.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Request Access</h3>
                <p className="text-neutral-400">
                  Need access to a feature? Contact your administrator or our support team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm text-neutral-400">security uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">SOC 2</div>
            <div className="text-sm text-neutral-400">Type II certified</div>
          </div>
        </div>
      </div>

      {/* Right Side - Unauthorized Message */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
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

          <div className="bg-neutral-800/50 backdrop-blur-sm border border-red-600/50 rounded-2xl p-8">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
                <p className="text-neutral-400 text-lg">
                  You don't have permission to access this resource
                </p>
              </div>

              {/* Reason (if provided) */}
              {reason && (
                <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-700/50">
                  <p className="text-neutral-300 text-sm">
                    <strong className="text-red-400">Reason:</strong> {reason}
                  </p>
                </div>
              )}

              {/* What to do */}
              <div className="space-y-4 text-left">
                <h3 className="text-lg font-medium text-neutral-200">What you can do:</h3>
                <div className="space-y-3 text-neutral-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                    <span>Contact your system administrator to request access</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                    <span>Verify you're signed in with the correct account</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                    <span>Check if your account permissions have changed</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleGoBack} variant="outline" className="w-full border-neutral-600 hover:bg-neutral-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={handleGoHome} variant="outline" className="w-full border-neutral-600 hover:bg-neutral-700">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </div>
                <Button onClick={handleGoToLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In Again
                </Button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link 
                href="/contact" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Contact Support
              </Link>
              <Link 
                href="/security" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Security Policy
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
}
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForms } from '@/components/auth/auth-forms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ArrowLeft, 
  Clock,
  Mail,
  CheckCircle,
  Lock,
  AlertCircle
} from 'lucide-react';


// Modern SaaS Password Reset Page
const ModernPasswordResetPage = () => {
  const [authMode, setAuthMode] = useState('reset-password');
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/auth/login?message=password-reset-sent');
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex">
      {/* Left Side - Security Information */}
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
            Secure password recovery
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8">
            We'll send you a secure link to reset your password. 
            Your account security is our top priority.
          </p>

          {/* Security Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Secure Recovery Process</h3>
                <p className="text-neutral-400">
                  Password reset links are encrypted, time-limited, and can only be used once.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">15-Minute Time Limit</h3>
                <p className="text-neutral-400">
                  Reset links expire automatically for your security. Request a new one if needed.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Email Verification</h3>
                <p className="text-neutral-400">
                  We only send reset links to verified email addresses on your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm text-neutral-400">uptime guarantee</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">SOC 2</div>
            <div className="text-sm text-neutral-400">Type II certified</div>
          </div>
        </div>
      </div>

      {/* Right Side - Password Reset Form */}
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

          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLogin}
            className="w-fit mb-6 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Button>

          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">
              Reset your password
            </h1>
            <p className="text-neutral-400 text-lg">
              Enter your email address and we'll send you a secure link to reset your password
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8">
            <AuthForms 
              mode={authMode} 
              onModeChange={setAuthMode}
              onSuccess={handleAuthSuccess}
              redirectTo="/auth/login"
            />

            {/* What happens next */}
            <div className="mt-8 space-y-4">
              <h4 className="text-lg font-medium text-neutral-200">What happens next:</h4>
              <div className="space-y-3 text-neutral-300">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>We'll send a secure reset link to your email</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Click the link to create a new password</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Sign in with your new password</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-neutral-900/30 rounded-xl border border-neutral-700/30">
              <div className="flex items-start space-x-3 text-neutral-300">
                <Lock className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-400" />
                <div>
                  <p className="font-medium text-neutral-200 mb-2">Security Notice</p>
                  <p>
                    If you don't receive the email within 5 minutes, check your spam folder or 
                    contact our support team for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center space-y-4">
            <div className="p-4 bg-amber-900/20 border border-amber-800/30 rounded-lg">
              <div className="flex items-start space-x-2 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-amber-200 font-medium mb-1">Need help?</p>
                  <p className="text-amber-300/80">
                    If you're having trouble accessing your account, our support team is here to help 24/7.
                  </p>
                </div>
              </div>
            </div>

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
                Security Center
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


export default function PasswordResetPage() {
  return <ModernPasswordResetPage />;
}
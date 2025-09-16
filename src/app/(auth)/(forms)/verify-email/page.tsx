'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Mail, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Clock,
  Shield,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';


// Component that uses useSearchParams
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [verificationStatus, setVerificationStatus] = useState('checking'); // 'checking', 'success', 'error', 'pending'
  const [error, setError] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState('/dashboard');
  const [timeLeft, setTimeLeft] = useState(null);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    // Get the redirect URL from query params
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect));
    }

    // Handle email verification
    const handleEmailVerification = async () => {
      try {
        // Check if user is already verified (without refreshing first to avoid loops)
        if (user?.email_confirmed_at) {
          setVerificationStatus('success');
          console.log('Email already verified');
          
          // Redirect immediately if already verified
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1500);
          return;
        }

        // Listen for auth state changes (email verification)
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change during verification:', event);

          if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
            setVerificationStatus('success');
            console.log('Email verification successful');

            toast.success('Email verified successfully!');

            // Redirect after a short delay
            setTimeout(() => {
              router.push(redirectUrl);
            }, 2000);
          } else if (event === 'TOKEN_REFRESHED' && session?.user?.email_confirmed_at) {
            // Handle verification via token refresh
            setVerificationStatus('success');
            console.log('Email verification detected via token refresh');

            toast.success('Email verified successfully!');

            // Redirect after a short delay
            setTimeout(() => {
              router.push(redirectUrl);
            }, 2000);
          }
        });

        // If user exists but email not confirmed, show pending state
        if (user && !user.email_confirmed_at) {
          setVerificationStatus('pending');
        } else if (!user) {
          // No user session, might need to sign in
          setVerificationStatus('error');
          setError('No user session found. Please sign in again.');
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Email verification error:', err);
        setError(err.message);
        setVerificationStatus('error');
      }
    };

    if (!authLoading) {
      handleEmailVerification();
    }
  }, [user, authLoading, router, searchParams, redirectUrl]);

  const handleResendVerification = async () => {
    try {
      if (!user?.email) {
        toast.error('No email address found. Please sign in again.');
        return;
      }

      setResendDisabled(true);
      setTimeLeft(60); // 60 second cooldown

      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: '${window.location.origin}/auth/verify-email?redirect=${encodeURIComponent(redirectUrl)}',
        },
      });

      if (error) throw error;

      toast.success('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Resend verification error:', err);
      toast.error('Failed to resend verification email. Please try again.');
      setResendDisabled(false);
      setTimeLeft(null);
    }
  };

  const handleGoToDashboard = () => {
    router.push(redirectUrl);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={60} height={60} className="animate-pulse" />
          <p className="text-sm text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      {verificationStatus === 'checking' && (
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Checking verification status</h2>
              <p className="text-neutral-400 mt-3">Please wait while we verify your email address.</p>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-green-600/50 rounded-2xl p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-green-400">Email verified successfully!</h2>
              <p className="text-neutral-400 mt-3">
                Your email has been verified. You can now access all features of your Thorbis account.
              </p>
            </div>
            <Button onClick={handleGoToDashboard} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              Continue to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Check your email</h1>
            <p className="text-neutral-400 text-lg">
              We've sent a verification link to <strong className="text-white">{user?.email}</strong>
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8 space-y-8">
            {/* Quick Email Access */}
            <div>
              <h3 className="text-lg font-medium text-neutral-200 mb-4">Quick email access:</h3>
              <div className="grid grid-cols-3 gap-3">
                <a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-neutral-600 hover:bg-neutral-700">
                    Gmail
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <a href="https://outlook.live.com/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-neutral-600 hover:bg-neutral-700">
                    Outlook
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <a href="https://mail.yahoo.com/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-neutral-600 hover:bg-neutral-700">
                    Yahoo
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-200">What to do next:</h3>
              <div className="space-y-3 text-neutral-300">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <span>Check your email inbox for our verification message</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <span>Click the "Verify Email" button in the email</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <span>You'll be automatically redirected to your dashboard</span>
                </div>
              </div>
            </div>

            {/* Didn't receive email */}
            <div className="pt-6 border-t border-neutral-700/50">
              <p className="text-neutral-400 mb-4 text-center">
                Didn't receive the email? Check your spam folder or:
              </p>
              <Button 
                variant="outline" 
                onClick={handleResendVerification} 
                disabled={resendDisabled}
                size="lg"
                className="w-full border-neutral-600 hover:bg-neutral-700 disabled:opacity-50"
              >
                {resendDisabled ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {timeLeft}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>
            </div>

            {/* Security notice */}
            <div className="p-4 bg-neutral-900/30 rounded-xl border border-neutral-700/30">
              <div className="flex items-start space-x-3 text-neutral-300">
                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-400" />
                <div>
                  <p className="font-medium text-neutral-200 mb-2">Security Notice</p>
                  <p>Verification links expire in 24 hours for your security. If the link expires, you can request a new one.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'error' && (
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-red-600/50 rounded-2xl p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-red-400">Verification Error</h2>
              <p className="text-neutral-400 mt-3">
                {error || 'We encountered an error while verifying your email address.'}
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleResendVerification} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full border-neutral-600 hover:bg-neutral-700">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modern SaaS Email Verification Page
const ModernEmailVerificationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex">
      {/* Left Side - Email Security Information */}
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
            Secure your account with email verification
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8">
            Email verification helps protect your account and ensures you receive 
            important security notifications.
          </p>

          {/* Security Benefits */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Account Protection</h3>
                <p className="text-neutral-400">
                  Verified accounts are more secure and protected against unauthorized access.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Important Notifications</h3>
                <p className="text-neutral-400">
                  Receive security alerts, updates, and important account information via email.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Full Access</h3>
                <p className="text-neutral-400">
                  Unlock all Thorbis features and integrations with a verified account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-neutral-400">
              Enterprise-grade email security
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-neutral-400">
              SOC 2 Type II compliant verification process
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Verification Interface */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image 
              src="/logos/ThorbisLogo.webp" 
              alt="Thorbis" 
              width={60} 
              height={60}
              className="rounded-lg"
            />
          </div>

          <VerifyEmailContent />

          {/* Help Section */}
          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link 
                href="/contact" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Need Help?
              </Link>
              <Link 
                href="/security" 
                className="text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Security Info
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


export default function VerifyEmailPage() {
  return <ModernEmailVerificationPage />;
}
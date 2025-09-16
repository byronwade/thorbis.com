'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  ArrowLeft, 
  Clock,
  Smartphone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lock,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';


// Modern SaaS OTP Verification Page
const ModernOTPVerificationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [otp, setOtp] = useState([', ', ', ', ', ']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('sms'); // 'sms' or 'email'
  const [maskedContact, setMaskedContact] = useState('***-***-1234');
  
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get contact info and method from URL params
    const method = searchParams.get('method') || 'sms';
    const contact = searchParams.get('contact');
    
    setVerificationMethod(method);
    if (contact) {
      setMaskedContact(decodeURIComponent(contact));
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split(');
      const newOtp = [...otp];
      pastedData.forEach((digit, i) => {
        if (i + index < 6) {
          newOtp[i + index] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus on next empty input or last input
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== ') && newOtp.join(').length === 6) {
      setTimeout(() => verifyOtp(newOtp.join(')), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (otpCode = otp.join(')) => {
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any code that starts with '1'
      if (otpCode.startsWith('1')) {
        toast.success('Code verified successfully!');
        router.push('/dashboard');
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (_error) {
      toast.error('Invalid verification code. Please try again.');
      setOtp([', ', ', ', ', ']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setCanResend(false);
      setTimeLeft(60);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('New verification code sent via ${verificationMethod === 'sms' ? 'SMS' : 'email'}!');
    } catch (_error) {
      toast.error('Failed to resend code. Please try again.');
      setCanResend(true);
    }
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
            Multi-factor authentication keeps you secure
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8">
            We've sent a verification code to protect your account. This extra layer 
            of security ensures only you can access your business data.
          </p>

          {/* Security Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Enhanced Security</h3>
                <p className="text-neutral-400">
                  Two-factor authentication prevents unauthorized access even if your password is compromised.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Instant Delivery</h3>
                <p className="text-neutral-400">
                  Verification codes are delivered instantly via SMS or email for quick access.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-200 mb-2">Time-Limited Codes</h3>
                <p className="text-neutral-400">
                  Verification codes expire quickly to minimize security risks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">99.99%</div>
            <div className="text-sm text-neutral-400">delivery success rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">&lt;5s</div>
            <div className="text-sm text-neutral-400">average delivery time</div>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Verification Form */}
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
            <div className="mx-auto w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
              {verificationMethod === 'sms' ? (
                <Smartphone className="w-10 h-10 text-blue-400" />
              ) : (
                <MessageSquare className="w-10 h-10 text-blue-400" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">
              Enter verification code
            </h1>
            <p className="text-neutral-400 text-lg">
              We sent a 6-digit code to {maskedContact} via {verificationMethod === 'sms' ? 'SMS' : 'email'}
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8">
            {/* OTP Input */}
            <div className="space-y-8">
              <div className="flex justify-center space-x-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-xl font-bold bg-neutral-900 border border-neutral-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isVerifying}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button 
                onClick={() => verifyOtp()}
                disabled={isVerifying || otp.some(digit => digit === ')}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verify Code
                  </>
                )}
              </Button>

              {/* Resend Section */}
              <div className="text-center space-y-4">
                <p className="text-neutral-300">
                  Didn't receive the code?
                </p>
                
                {canResend ? (
                  <Button
                    variant="outline"
                    onClick={handleResendCode}
                    size="lg"
                    className="w-full border-neutral-600 hover:bg-neutral-700"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Resend code via {verificationMethod === 'sms' ? 'SMS' : 'email'}
                  </Button>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-neutral-300">
                    <Clock className="w-5 h-5" />
                    <span>Resend in {timeLeft}s</span>
                  </div>
                )}

                {/* Switch Method */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const newMethod = verificationMethod === 'sms' ? 'email' : 'sms';
                      setVerificationMethod(newMethod);
                      handleResendCode();
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                    disabled={!canResend}
                  >
                    Send via {verificationMethod === 'sms' ? 'email' : 'SMS'} instead
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-neutral-900/30 rounded-xl border border-neutral-700/30">
                <div className="flex items-start space-x-3 text-neutral-300">
                  <Shield className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-400" />
                  <div>
                    <p className="font-medium text-neutral-200 mb-2">Security Tip</p>
                    <p>
                      Verification codes expire in 10 minutes. Never share your code with anyone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center space-y-4">
            <div className="p-4 bg-amber-900/20 border border-amber-800/30 rounded-lg">
              <div className="flex items-start space-x-2 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-amber-200 font-medium mb-1">Having trouble?</p>
                  <p className="text-amber-300/80">
                    Check your spam folder, ensure you have cell service, or contact support if you need help.
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
                Security Help
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


export default function OTPPage() {
  return <ModernOTPVerificationPage />;
}
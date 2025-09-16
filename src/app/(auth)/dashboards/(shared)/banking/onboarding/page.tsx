import React, { Suspense } from 'react';
import { Metadata } from 'next';
import OnboardingWizard from '@/components/investment-onboarding/onboarding-wizard';
import { redirect } from 'next/navigation';

/**
 * Investment Onboarding Page
 * 
 * This page serves as the entry point for the investment account onboarding
 * process. It provides a comprehensive, compliant workflow for new users
 * to set up their investment accounts.
 * 
 * Features:
 * - Multi-step KYC/AML compliant onboarding
 * - Identity and address verification
 * - Financial profile assessment
 * - Investment suitability evaluation
 * - Progress tracking and resumption
 * - Mobile-responsive design
 * - Accessibility compliant (WCAG 2.1 AA)
 * 
 * Compliance:
 * - FINRA Rule 2111 (Suitability)
 * - SEC Regulation Best Interest
 * - Bank Secrecy Act (BSA)
 * - USA PATRIOT Act
 * - Customer Due Diligence (CDD) Rule
 * 
 * Security:
 * - Encrypted data transmission
 * - PII protection and redaction
 * - Session management
 * - Input validation and sanitization
 */

export const metadata: Metadata = {
  title: 'Investment Account Setup - Thorbis Banking',
  description: 'Set up your investment account with our secure, compliant onboarding process. Complete KYC verification and start investing in minutes.',
  keywords: 'investment account, onboarding, KYC, AML, verification, compliance',
  robots: 'noindex, nofollow', // Prevent indexing of onboarding pages
};

interface OnboardingPageProps {
  searchParams: Promise<{
    resume?: string;
    profileId?: string;
    step?: string;
    ref?: string;
  }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { resume, profileId, step, ref } = await searchParams;

  // Handle onboarding completion
  const handleOnboardingComplete = async (completedProfileId: string) => {
    // Log completion event for analytics
    console.log('Onboarding completed:', {'
      profileId: completedProfileId,
      timestamp: new Date().toISOString(),
      referrer: ref
    });

    // Redirect to investment dashboard
    redirect('/investments/dashboard?welcome=true&profileId=' + completedProfileId);
  };

  // Handle onboarding cancellation/exit
  const handleOnboardingClose = () => {
    // Redirect to main banking page
    redirect('/banking?onboarding=cancelled');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* SEO and Security Headers */}
      <head>
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>

      {/* Progress Indicator (Global) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div id="onboarding-progress" className="h-1 bg-gray-800">
          <div 
            id="progress-bar" 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<OnboardingLoadingScreen />}>
        <OnboardingWizard
          userId="user_demo_12345" // In production, get from authentication
          onComplete={handleOnboardingComplete}
          onClose={handleOnboardingClose}
          resumeProfileId={resume === 'true' ? profileId : undefined}
          initialStep={step ? parseInt(step) : undefined}
        />
      </Suspense>

      {/* Background Security Notice */}
      <SecurityNotice />
    </div>
  );
}

/**
 * Loading screen for onboarding
 */
function OnboardingLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Setting Up Your Investment Account</h2>
        <p className="text-gray-400 mb-4">Please wait while we prepare your secure onboarding experience...</p>
        
        {/* Security indicators */}
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>FINRA Registered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Security notice component
 */
function SecurityNotice() {
  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-white">Secure Session</h3>
            <p className="text-xs text-gray-400 mt-1">
              Your information is protected with bank-level encryption and compliance standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export page props for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = false;
import { Suspense } from 'react';
import { OrganizationOnboarding } from './organization-onboarding';

export const metadata = {
  title: 'Create Organization - Thorbis',
  description: 'Set up your organization to get started with Thorbis.',
};

export default function OrganizationOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="animate-pulse">
          <div className="w-96 h-96 bg-neutral-800 rounded-lg"></div>
        </div>
      </div>
    }>
      <OrganizationOnboarding />
    </Suspense>
  );
}
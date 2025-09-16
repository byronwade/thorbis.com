'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';


function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code and other params from URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle error from Supabase
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setStatus('error');
          setMessage(
            errorDescription || 
            'Authentication failed. Please try again.'
          );
          
          // Redirect to login page after delay
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Exchange code for session
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setStatus('error');
            setMessage('Failed to complete authentication. Please try again.');
            
            setTimeout(() => {
              router.push('/auth/login');
            }, 3000);
            return;
          }

          if (data.user) {
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            // Refresh auth state
            await refreshAuth();
            
            // Get redirect URL or default to dashboard
            const redirectTo = searchParams.get('redirect_to') || '/dashboard';
            
            // Redirect after short delay
            setTimeout(() => {
              router.push(redirectTo);
            }, 1500);
          }
        } else {
          // No code parameter, might be a direct callback
          setStatus('error');
          setMessage('Invalid authentication callback. Please try again.');
          
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, router, refreshAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-6">
          <svg 
            className="w-8 h-8 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M13 3L4 14h6.5l-1.5 7 9-11h-6.5L13 3z"/>
          </svg>
        </div>

        {/* Status Icon */}
        <div className="mb-6">
          {status === 'loading' && (
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          )}
        </div>

        {/* Message */}
        <h1 className="text-xl font-semibold text-white mb-2">
          {status === 'loading' && 'Completing Authentication'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className="text-neutral-400 text-sm mb-6">
          {message}
        </p>

        {/* Additional info for different states */}
        {status === 'loading' && (
          <p className="text-xs text-neutral-500">
            Please wait while we complete your authentication...
          </p>
        )}

        {status === 'success' && (
          <p className="text-xs text-neutral-500">
            You will be redirected automatically.
          </p>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <p className="text-xs text-neutral-500">
              You will be redirected to try again.
            </p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Go back now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return <AuthCallback />;
}
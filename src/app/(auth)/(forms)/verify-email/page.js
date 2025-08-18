"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { CheckCircle2, Mail, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@context/auth-context";
import { toast } from "sonner";
import { logger } from "@utils/logger";
import { supabase } from "@lib/database/supabase/client";

// Component that uses useSearchParams
function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user, loading: authLoading, refreshUser } = useAuth();

	const [verificationStatus, setVerificationStatus] = useState("checking"); // 'checking', 'success', 'error', 'pending'
	const [error, setError] = useState(null);
	const [redirectUrl, setRedirectUrl] = useState("/dashboard");

	useEffect(() => {
		// Get the redirect URL from query params
		const redirect = searchParams.get("redirect");
		if (redirect) {
			setRedirectUrl(decodeURIComponent(redirect));
		}

				// Handle email verification
		const handleEmailVerification = async () => {
			try {
				// Check if user is already verified (without refreshing first to avoid loops)
				if (user?.email_confirmed_at) {
					setVerificationStatus("success");
					logger.info("Email already verified", {
						userId: user.id,
						email: user.email,
						redirectUrl,
					});
					
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
					logger.debug("Auth state change during verification:", { event, hasSession: !!session, emailConfirmed: !!session?.user?.email_confirmed_at });

					if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
						setVerificationStatus("success");
						await refreshUser();

						logger.info("Email verification successful", {
							userId: session.user.id,
							email: session.user.email,
							redirectUrl,
						});

						toast.success("Email verified successfully!");

						// Redirect after a short delay
						setTimeout(() => {
							router.push(redirectUrl);
						}, 2000);
					} else if (event === "TOKEN_REFRESHED" && session?.user?.email_confirmed_at) {
						// Handle verification via token refresh
						setVerificationStatus("success");
						await refreshUser();

						logger.info("Email verification detected via token refresh", {
							userId: session.user.id,
							email: session.user.email,
							redirectUrl,
						});

						toast.success("Email verified successfully!");

						// Redirect after a short delay
						setTimeout(() => {
							router.push(redirectUrl);
						}, 2000);
					}
				});

				// If user exists but email not confirmed, show pending state
				if (user && !user.email_confirmed_at) {
					setVerificationStatus("pending");
				} else if (!user) {
					// No user session, might need to sign in
					setVerificationStatus("error");
					setError("No user session found. Please sign in again.");
				}

				return () => {
					subscription.unsubscribe();
				};
			} catch (err) {
				logger.error("Email verification error:", err);
				setError(err.message);
				setVerificationStatus("error");
			}
		};

		if (!authLoading) {
			handleEmailVerification();
		}
	}, [user, authLoading, router, searchParams, redirectUrl, refreshUser]);

	const handleResendVerification = async () => {
		try {
			if (!user?.email) {
				toast.error("No email address found. Please sign in again.");
				return;
			}

			const { error } = await supabase.auth.resend({
				type: "signup",
				email: user.email,
				options: {
					emailRedirectTo: `${window.location.origin}/verify-email?redirect=${encodeURIComponent(redirectUrl)}`,
				},
			});

			if (error) throw error;

			toast.success("Verification email sent! Please check your inbox.");
		} catch (err) {
			logger.error("Resend verification error:", err);
			toast.error("Failed to resend verification email. Please try again.");
		}
	};

	const handleGoToDashboard = async () => {
		try {
			// Refresh user session one more time before redirecting to ensure latest state
			const refreshResult = await refreshUser();

			if (refreshResult?.success && refreshResult?.user?.email_confirmed_at) {
				logger.info("Manual dashboard navigation", {
					userId: refreshResult.user.id,
					redirectUrl,
				});

				router.push(redirectUrl);
			} else {
				// If refresh failed or email still not verified, show error
				toast.error("Email verification status could not be confirmed. Please try again.");
				setVerificationStatus("error");
				setError("Unable to confirm email verification. Please check your email and try the verification link again.");
			}
		} catch (error) {
			logger.error("Manual dashboard navigation failed:", error);
			toast.error("Failed to navigate to dashboard. Please try again.");
		}
	};

	if (authLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="flex flex-col items-center space-y-4">
					<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={60} height={60} className="animate-breathe" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto">
			{verificationStatus === "checking" && (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center space-y-4">
							<div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
								<Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
							</div>
							<div>
								<h2 className="text-xl font-semibold">Checking verification status...</h2>
								<p className="text-sm text-muted-foreground mt-2">Please wait while we verify your email.</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{verificationStatus === "success" && (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center space-y-4">
							<div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
								<CheckCircle2 className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<h2 className="text-xl font-semibold text-green-700 dark:text-green-400">Email Verified Successfully!</h2>
								<p className="text-sm text-muted-foreground mt-2">Your email has been verified. You can now access your account.</p>
							</div>
							<Button onClick={handleGoToDashboard} className="w-full">
								Continue to Dashboard
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{verificationStatus === "pending" && (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center space-y-4">
							<div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
								<Mail className="w-6 h-6 text-amber-600" />
							</div>
							<div>
								<h2 className="text-xl font-semibold">Verify Your Email</h2>
								<p className="text-sm text-muted-foreground mt-2">
									We&apos;ve sent a verification email to <strong>{user?.email}</strong>. Please check your inbox and click the verification link.
								</p>
							</div>

							<div className="space-y-4">
								<div className="flex flex-wrap justify-center gap-3">
									<a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer">
										<Button variant="outline" size="sm">
											Gmail
										</Button>
									</a>
									<a href="https://mail.yahoo.com/" target="_blank" rel="noopener noreferrer">
										<Button variant="outline" size="sm">
											Yahoo
										</Button>
									</a>
									<a href="https://outlook.live.com/" target="_blank" rel="noopener noreferrer">
										<Button variant="outline" size="sm">
											Outlook
										</Button>
									</a>
								</div>

								<div className="pt-4 border-t">
									<p className="text-xs text-muted-foreground mb-3">Didn&apos;t receive the email? Check your spam folder or:</p>
									<Button variant="outline" onClick={handleResendVerification} className="w-full">
										Resend Verification Email
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{verificationStatus === "error" && (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center space-y-4">
							<div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
								<AlertCircle className="w-6 h-6 text-red-600" />
							</div>
							<div>
								<h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Verification Error</h2>
								<p className="text-sm text-muted-foreground mt-2">{error || "We encountered an error while verifying your email."}</p>
							</div>
							<div className="space-y-3">
								<Button onClick={handleResendVerification} className="w-full">
									Try Again
								</Button>
								<Link href="/login" passHref>
									<Button variant="outline" className="w-full">
										Back to Login
									</Button>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<div className="container max-w-lg mx-auto px-4 py-8">
			<div className="text-center mb-8">
				<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={60} height={60} className="mx-auto mb-4" />
				<h1 className="text-2xl font-bold">Email Verification</h1>
			</div>

			<VerifyEmailContent />
		</div>
	);
}

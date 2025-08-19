"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Alert, AlertDescription } from "@components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@context/auth-context";
import { supabase } from "@lib/database/supabase";
import { CheckCircle, AlertCircle, Mail, Smartphone, Loader2, RefreshCw } from "lucide-react";
import logger from "@lib/utils/logger";

export default function OTPVerification() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user, isAuthenticated } = useAuth();

	// OTP input refs for auto-focus
	const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

	// State management
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [isVerifying, setIsVerifying] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [verificationError, setVerificationError] = useState(null);
	const [verificationType, setVerificationType] = useState("email"); // 'email' or 'phone'
	const [contactInfo, setContactInfo] = useState("");
	const [timeRemaining, setTimeRemaining] = useState(60);
	const [canResend, setCanResend] = useState(false);
	const [verificationSent, setVerificationSent] = useState(false);

	// Initialize component based on URL parameters
	useEffect(() => {
		const type = searchParams.get("type") || "email";
		const email = searchParams.get("email");
		const phone = searchParams.get("phone");

		setVerificationType(type);

		if (type === "email") {
			setContactInfo(email || user?.email || "");
		} else if (type === "phone") {
			setContactInfo(phone || user?.phone || "");
		}

		// Auto-send verification if this is a fresh request
		const autoSend = searchParams.get("auto_send");
		if (autoSend === "true" && (email || phone)) {
			handleSendVerification();
		}
	}, [searchParams, user]);

	// Countdown timer for resend button
	useEffect(() => {
		let interval;
		if (timeRemaining > 0 && verificationSent) {
			interval = setInterval(() => {
				setTimeRemaining((prev) => {
					if (prev <= 1) {
						setCanResend(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [timeRemaining, verificationSent]);

	// Handle OTP input changes
	const handleOtpChange = (index, value) => {
		// Only allow numeric input
		if (!/^\d*$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value.slice(-1); // Only take the last digit
		setOtp(newOtp);

		// Auto-focus next input
		if (value && index < 5) {
			otpRefs[index + 1].current?.focus();
		}

		// Auto-verify when all 6 digits are entered
		if (newOtp.every((digit) => digit !== "") && !isVerifying) {
			handleVerifyOtp(newOtp);
		}

		// Clear error when user starts typing
		if (verificationError) {
			setVerificationError(null);
		}
	};

	// Handle key down for backspace navigation
	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			otpRefs[index - 1].current?.focus();
		}
	};

	// Send verification code
	const handleSendVerification = async () => {
		if (!contactInfo) {
			toast.error("Contact information is required");
			return;
		}

		setIsResending(true);
		setVerificationError(null);

		try {
			if (verificationType === "email") {
				// Send email OTP
				const { error } = await supabase.auth.signInWithOtp({
					email: contactInfo,
					options: {
						shouldCreateUser: false, // Don't create user if they don't exist
					},
				});

				if (error) {
					throw error;
				}

				toast.success("Verification code sent to your email");
			} else if (verificationType === "phone") {
				// Send phone OTP
				const { error } = await supabase.auth.signInWithOtp({
					phone: contactInfo,
					options: {
						shouldCreateUser: false,
					},
				});

				if (error) {
					throw error;
				}

				toast.success("Verification code sent to your phone");
			}

			setVerificationSent(true);
			setTimeRemaining(60);
			setCanResend(false);
			setOtp(["", "", "", "", "", ""]);

			// Focus first input
			otpRefs[0].current?.focus();

			logger.info("OTP verification sent", {
				type: verificationType,
				contact: contactInfo,
				userId: user?.id,
			});
		} catch (error) {
			logger.error("Failed to send OTP:", error);
			setVerificationError(error.message);
			toast.error(error.message || "Failed to send verification code");
		} finally {
			setIsResending(false);
		}
	};

	// Verify OTP code
	const handleVerifyOtp = async (otpArray = otp) => {
		const otpCode = otpArray.join("");

		if (otpCode.length !== 6) {
			setVerificationError("Please enter all 6 digits");
			return;
		}

		setIsVerifying(true);
		setVerificationError(null);

		try {
			const verifyData = {
				token: otpCode,
				type: "email", // Supabase expects 'email' type for OTP verification
			};

			if (verificationType === "email") {
				verifyData.email = contactInfo;
			} else if (verificationType === "phone") {
				verifyData.phone = contactInfo;
				verifyData.type = "sms";
			}

			const { data, error } = await supabase.auth.verifyOtp(verifyData);

			if (error) {
				throw error;
			}

			if (data.session) {
				toast.success("Verification successful!");

				logger.info("OTP verification successful", {
					type: verificationType,
					contact: contactInfo,
					userId: data.user?.id,
				});

				// Redirect based on context
				const redirectTo = searchParams.get("redirect_to");
				const returnUrl = searchParams.get("return_url");

				if (redirectTo) {
					router.push(redirectTo);
				} else if (returnUrl) {
					router.push(returnUrl);
				} else {
					// Default redirect based on verification type
					if (verificationType === "email") {
						router.push("/dashboard?verified=email");
					} else {
						router.push("/dashboard?verified=phone");
					}
				}
			} else {
				throw new Error("Verification failed - no session created");
			}
		} catch (error) {
			logger.error("OTP verification failed:", error);
			setVerificationError(error.message);

			// Clear OTP on error
			setOtp(["", "", "", "", "", ""]);
			otpRefs[0].current?.focus();

			// Show specific error messages
			if (error.message.includes("expired")) {
				toast.error("Verification code has expired. Please request a new one.");
			} else if (error.message.includes("invalid")) {
				toast.error("Invalid verification code. Please try again.");
			} else {
				toast.error("Verification failed. Please try again.");
			}
		} finally {
			setIsVerifying(false);
		}
	};

	// Manual verify button (for accessibility)
	const handleManualVerify = () => {
		handleVerifyOtp();
	};

	// Format contact info for display
	const formatContactInfo = (info) => {
		if (verificationType === "email") {
			const [local, domain] = info.split("@");
			if (local && domain) {
				return `${local.slice(0, 2)}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
			}
		} else if (verificationType === "phone") {
			return info.replace(/(\d{3})\d{3}(\d{4})/, "$1***$2");
		}
		return info;
	};

	const Icon = verificationType === "email" ? Mail : Smartphone;

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="w-16 h-16 bg-primary/10 dark:bg-primary rounded-full flex items-center justify-center">
							<Icon className="w-8 h-8 text-primary dark:text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl">{verificationType === "email" ? "Verify Email" : "Verify Phone"}</CardTitle>
					<CardDescription className="text-center">
						{verificationSent ? (
							<>
								We've sent a 6-digit verification code to <span className="font-medium text-foreground">{formatContactInfo(contactInfo)}</span>
							</>
						) : (
							`Enter your ${verificationType} to receive a verification code`
						)}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Contact Info Input (if not sent yet) */}
					{!verificationSent && (
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">{verificationType === "email" ? "Email Address" : "Phone Number"}</label>
								<Input type={verificationType === "email" ? "email" : "tel"} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder={verificationType === "email" ? "your@email.com" : "+1 (555) 123-4567"} className="text-center" />
							</div>
							<Button onClick={handleSendVerification} disabled={!contactInfo || isResending} className="w-full">
								{isResending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending Code...
									</>
								) : (
									`Send Verification Code`
								)}
							</Button>
						</div>
					)}

					{/* OTP Input */}
					{verificationSent && (
						<>
							<div className="space-y-4">
								<div className="flex justify-center space-x-2">
									{otp.map((digit, index) => (
										<Input key={index} ref={otpRefs[index]} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className="w-12 h-12 text-center text-lg font-semibold" disabled={isVerifying} />
									))}
								</div>

								{verificationError && (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{verificationError}</AlertDescription>
									</Alert>
								)}

								<Button onClick={handleManualVerify} disabled={otp.join("").length !== 6 || isVerifying} className="w-full">
									{isVerifying ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Verifying...
										</>
									) : (
										<>
											<CheckCircle className="mr-2 h-4 w-4" />
											Verify Code
										</>
									)}
								</Button>
							</div>

							{/* Resend Code */}
							<div className="text-center space-y-2">
								{!canResend ? (
									<p className="text-sm text-muted-foreground">Resend code in {timeRemaining} seconds</p>
								) : (
									<Button variant="outline" onClick={handleSendVerification} disabled={isResending} className="w-full">
										{isResending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Resending...
											</>
										) : (
											<>
												<RefreshCw className="mr-2 h-4 w-4" />
												Resend Code
											</>
										)}
									</Button>
								)}

								<div className="text-xs text-muted-foreground">
									<p>Didn't receive the code? Check your spam folder or try resending.</p>
								</div>
							</div>

							{/* Change Contact Method */}
							<div className="text-center">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setVerificationSent(false);
										setOtp(["", "", "", "", "", ""]);
										setVerificationError(null);
									}}
								>
									Use different {verificationType}
								</Button>
							</div>
						</>
					)}

					{/* Back to Login */}
					<div className="text-center pt-4 border-t">
						<Button variant="ghost" onClick={() => router.push("/login")}>
							Back to Login
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

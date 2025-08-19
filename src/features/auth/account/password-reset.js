"use client";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@context/auth-context";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, Mail } from "lucide-react";
import { supabase } from "@lib/database/supabase";

// Schema for requesting password reset email
const resetRequestSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

// Schema for setting new password with token
const passwordResetSchema = z
	.object({
		newPassword: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
				message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
			}),
		confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters" }),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export default function PasswordReset() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasToken, setHasToken] = useState(false);
	const [resetEmailSent, setResetEmailSent] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState(null);

	const {
		resetPassword,
		updatePassword,
		error: authError,
		clearError,
		validateEmail,
		validatePasswordStrength,
		loading,
	} = useAuth();

	// Check if we have a reset token in URL (modern Supabase approach)
	useEffect(() => {
		const checkResetSession = async () => {
			// Check for Supabase auth hash fragments (modern approach)
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			const accessToken = hashParams.get("access_token");
			const refreshToken = hashParams.get("refresh_token");
			const type = hashParams.get("type");

			// Or check for reset=true parameter
			const resetParam = searchParams.get("reset");
			
			if (type === "recovery" && accessToken && refreshToken) {
				// Modern Supabase flow - establish session with tokens
				try {
					const { data, error } = await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: refreshToken,
					});
					
					if (error) {
						console.error("Error setting session:", error);
						toast.error("Invalid or expired reset link. Please request a new password reset.");
						return;
					}
					
					if (data.session) {
						setHasToken(true);
						toast.success("You can now set your new password.");
						// Clear hash from URL for security
						window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
					}
				} catch (error) {
					console.error("Session setup error:", error);
					toast.error("Failed to verify reset link. Please try again.");
				}
			} else if (resetParam === "true") {
				// Fallback check for already authenticated users
				const { data: { session } } = await supabase.auth.getSession();
				if (session) {
					setHasToken(true);
				}
			}
		};

		checkResetSession();
	}, [searchParams]);

	// Form for requesting password reset email
	const resetRequestForm = useForm({
		resolver: zodResolver(resetRequestSchema),
		defaultValues: {
			email: "",
		},
	});

	// Form for setting new password
	const passwordResetForm = useForm({ 
		resolver: zodResolver(passwordResetSchema),
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
	});

	// Watch password field for strength validation
	const watchedNewPassword = passwordResetForm.watch("newPassword");

	// Validate password strength in real-time
	useEffect(() => {
		if (watchedNewPassword && watchedNewPassword.length > 0) {
			const strength = validatePasswordStrength(watchedNewPassword);
			setPasswordStrength(strength);
		} else {
			setPasswordStrength(null);
		}
	}, [watchedNewPassword, validatePasswordStrength]);

	// Handle URL parameters for errors
	useEffect(() => {
		const urlError = searchParams.get("error");
		const message = searchParams.get("message");

		if (message) {
			if (urlError) {
				toast.error(message);
			} else {
				toast.success(message);
			}
		}
	}, [searchParams]);

	const onRequestReset = async (data) => {
		if (isSubmitting || loading) return;

		// Clear any previous errors
		clearError();
		setIsSubmitting(true);

		try {
			const result = await resetPassword(data.email);
			
			if (result.success) {
				setResetEmailSent(true);
				toast.success("Password reset email sent! Please check your inbox.");
			} else {
				if (result.error?.userMessage) {
					toast.error(result.error.userMessage);
				}
			}
		} catch (error) {
			console.error("Password reset request failed:", error);
			toast.error("Failed to send password reset email. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onUpdatePassword = async (data) => {
		if (isSubmitting || loading) return;

		// Clear any previous errors
		clearError();
		setIsSubmitting(true);

		try {
			const result = await updatePassword(data.newPassword);
			
			if (result.success) {
				toast.success("Password updated successfully! Redirecting to login...");
				setTimeout(() => {
					router.push("/login?message=Password updated successfully");
				}, 2000);
			} else {
				if (result.error?.userMessage) {
					toast.error(result.error.userMessage);
					
					// Handle specific error cases
					if (result.error.message?.includes("session_not_found") || 
						result.error.message?.includes("invalid_token")) {
						setTimeout(() => {
							router.push("/password-reset?error=expired&message=Reset link has expired. Please request a new password reset.");
						}, 2000);
					}
				}
			}
		} catch (error) {
			console.error("Password update failed:", error);
			toast.error("Failed to update password. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};
	// Show success message after reset email is sent
	if (resetEmailSent && !hasToken) {
		return (
			<div className="flex flex-col justify-center items-center space-y-4 text-center">
				<div className="flex justify-center items-center mb-4 w-16 h-16 bg-primary/20 rounded-full dark:bg-primary/20">
					<Mail className="w-8 h-8 text-primary dark:text-primary" />
				</div>
				<h2 className="text-2xl font-bold">Check your email</h2>
				<p className="max-w-sm text-muted-foreground">
					We&apos;ve sent a password reset link to your email address. Please click the link to reset your password.
				</p>
				<div className="flex flex-col mt-6 space-y-2">
					<Button variant="outline" onClick={() => setResetEmailSent(false)}>
						Back to password reset
					</Button>
					<Link href="/login">
						<Button variant="ghost" className="w-full">
							Back to login
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Show password update form if user has reset token
	if (hasToken) {
		return (
			<>
				<h2 className="mb-1 text-2xl font-bold leading-9 text-left">Set new password</h2>
				<p className="text-sm leading-6 text-left text-muted-foreground">Enter your new password and confirm it.</p>
				
				{/* Display auth errors */}
				{authError && (
					<div className="p-3 mt-4 bg-destructive/10 rounded-md border border-destructive/20 dark:bg-destructive/10 dark:border-destructive/20">
						<div className="flex">
							<AlertCircle className="w-5 h-5 text-destructive" />
							<div className="ml-3">
								<p className="text-sm text-destructive dark:text-destructive">{authError.userMessage}</p>
							</div>
						</div>
					</div>
				)}

				<div className="flex flex-col mt-6">
					<FormProvider {...passwordResetForm}>
						<Form {...passwordResetForm}>
							<form onSubmit={passwordResetForm.handleSubmit(onUpdatePassword)} className="space-y-6">
								<FormField
									control={passwordResetForm.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input 
														{...field} 
														type={showNewPassword ? "text" : "password"} 
														placeholder="••••••••" 
														className={`pr-10 ${passwordResetForm.formState.errors.newPassword ? "border-destructive" : passwordResetForm.formState.touchedFields.newPassword ? "border-success" : ""}`}
														autoComplete="new-password"
													/>
													<button
														type="button"
														className="flex absolute inset-y-0 right-0 items-center pr-3"
														onClick={() => setShowNewPassword(!showNewPassword)}
													>
														{showNewPassword ? (
															<EyeOff className="w-4 h-4 text-muted-foreground" />
														) : (
															<Eye className="w-4 h-4 text-muted-foreground" />
														)}
													</button>
												</div>
											</FormControl>
											<FormMessage />
											
											{/* Password Strength Indicator */}
											{passwordStrength && watchedNewPassword && (
												<div className="mt-2 space-y-2">
													<div className="flex items-center space-x-2">
														<div className="flex space-x-1">
															{[...Array(4)].map((_, i) => (
																<div
																	key={i}
																																className={`h-1 w-6 rounded-full ${
																i < passwordStrength.score
																	? passwordStrength.score < 2
																		? "bg-destructive"
																		: passwordStrength.score < 3
																		? "bg-muted-foreground"
																		: "bg-primary"
																	: "bg-muted"
															}`}
																/>
															))}
														</div>
														<span className="text-xs text-muted-foreground">
															{passwordStrength.score < 2 ? "Weak" : 
															 passwordStrength.score < 3 ? "Fair" : 
															 passwordStrength.score < 4 ? "Good" : "Strong"}
														</span>
													</div>
													{passwordStrength.feedback.length > 0 && (
														<ul className="space-y-1 text-xs text-muted-foreground">
															{passwordStrength.feedback.map((item, index) => (
																<li key={index} className="flex items-center space-x-1">
																	<span className="w-1 h-1 rounded-full bg-muted-foreground" />
																	<span>{item}</span>
																</li>
															))}
														</ul>
													)}
												</div>
											)}
										</FormItem>
									)}
								/>
								
								<FormField
									control={passwordResetForm.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm new password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input 
														{...field} 
														type={showConfirmPassword ? "text" : "password"} 
														placeholder="••••••••" 
														className={`pr-10 ${passwordResetForm.formState.errors.confirmPassword ? "border-destructive" : passwordResetForm.formState.touchedFields.confirmPassword ? "border-success" : ""}`}
														autoComplete="new-password"
													/>
													<button
														type="button"
														className="flex absolute inset-y-0 right-0 items-center pr-3"
														onClick={() => setShowConfirmPassword(!showConfirmPassword)}
													>
														{showConfirmPassword ? (
															<EyeOff className="w-4 h-4 text-muted-foreground" />
														) : (
															<Eye className="w-4 h-4 text-muted-foreground" />
														)}
													</button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								
								<Button 
									type="submit" 
									className="w-full" 
									disabled={!passwordResetForm.formState.isValid || isSubmitting || loading || (passwordStrength && !passwordStrength.isValid)}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 w-4 h-4 animate-spin" />
											Updating password...
										</>
									) : (
										"Update password"
									)}
								</Button>
							</form>
						</Form>
					</FormProvider>
					<div className="mt-4 text-sm text-center">
						<Link href="/login" className="underline">
							Back to login
						</Link>
					</div>
				</div>
			</>
		);
	}

	// Show email request form (default state)
	return (
		<>
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left">Reset your password</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
			
			{/* Display auth errors */}
			{authError && (
				<div className="p-3 mt-4 bg-destructive rounded-md border border-destructive dark:bg-destructive/20 dark:border-destructive">
					<div className="flex">
						<AlertCircle className="w-5 h-5 text-destructive" />
						<div className="ml-3">
							<p className="text-sm text-destructive dark:text-destructive/80">{authError.userMessage}</p>
						</div>
					</div>
				</div>
			)}

			<div className="flex flex-col mt-6">
				<FormProvider {...resetRequestForm}>
					<Form {...resetRequestForm}>
						<form onSubmit={resetRequestForm.handleSubmit(onRequestReset)} className="space-y-6">
							<FormField
								control={resetRequestForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input 
												{...field} 
												type="email" 
												placeholder="your@email.com" 
												className={`${resetRequestForm.formState.errors.email ? "border-destructive" : resetRequestForm.formState.touchedFields.email ? "border-success" : ""}`}
												autoComplete="email"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							
							<Button 
								type="submit" 
								className="w-full" 
								disabled={!resetRequestForm.formState.isValid || isSubmitting || loading}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 w-4 h-4 animate-spin" />
										Sending reset link...
									</>
								) : (
									"Send reset link"
								)}
							</Button>
						</form>
					</Form>
				</FormProvider>
				
				<div className="mt-6 text-sm text-center">
					Remember your password?{" "}
					<Link href="/login" className="underline">
						Sign in
					</Link>
				</div>
			</div>
		</>
	);
}

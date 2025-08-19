"use client";

import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@context/auth-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getEnabledProviders } from "@lib/database/supabase/auth/providers";
import { validatePasswordStrength } from "@lib/database/supabase/auth/utils";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@utils";
import { IntelligentLoginMessage, PersonalizedSignupFlow } from "@features/auth";
import { LoginContextDetector } from "@lib/auth/login-context";
import ZodErrorBoundary from "@components/shared/zod-error-boundary";

// Lenient validation schema for real-time typing (allows empty values)
const typingSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().optional(),
	password: z.string().optional(),
	confirmPassword: z.string().optional(),
});

// Strict validation schema for form submission
const submitSchema = z
	.object({
		firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
		lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
		email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }).toLowerCase(),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
				message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
			}),
		confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don&apos;t match",
		path: ["confirmPassword"],
	});

// Use the lenient schema for real-time validation
const signupSchema = typingSchema;

export default function SignupPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isConfirmationEmailSent, setIsConfirmationEmailSent] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [oauthProviders, setOauthProviders] = useState([]);
	const [passwordStrength, setPasswordStrength] = useState(null);
	const [loginContext, setLoginContext] = useState(null);
	const [showPersonalizedFlow, setShowPersonalizedFlow] = useState(false);

	const formMethods = useForm({
		resolver: (data) => {
			// Always return success during typing to prevent any Zod validation
			return { values: data, errors: {} };
		},
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onSubmit", // Only validate on form submission
		reValidateMode: "onSubmit", // Keep validation minimal
		shouldFocusError: false, // Prevent forced reflow on error focus
	});

	const {
		handleSubmit,
		formState: { errors, isValid, touchedFields },
		watch,
		setError,
	} = formMethods;

	const { user, isAuthenticated, userRoles, loading, signup, loginWithOAuth, error: authError, clearError } = useAuth();

	// Watch password field for strength validation
	const watchedPassword = watch("password");

	// Load OAuth providers on mount
	useEffect(() => {
		const providers = getEnabledProviders();
		setOauthProviders(providers);
	}, []);

	// Detect login context for personalization
	useEffect(() => {
		const detectedContext = LoginContextDetector.detectContext(window.location.href, searchParams);
		setLoginContext(detectedContext);

		// Store context globally for access by other components
		window.signupContext = detectedContext;
	}, [searchParams]);

	// Handle URL parameters for redirects and errors
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

	// Validate password strength in real-time
	useEffect(() => {
		if (watchedPassword && watchedPassword.length > 0) {
			const strength = validatePasswordStrength(watchedPassword);
			setPasswordStrength(strength);
		} else {
			setPasswordStrength(null);
		}
	}, [watchedPassword]);

	// Redirect authenticated users to their dashboard
	useEffect(() => {
		if (isAuthenticated && user && userRoles.length > 0) {
			const redirectTo = searchParams.get("redirectTo");

			let dashboardPath = "/dashboard/user"; // Default

			if (userRoles.includes("admin")) {
				dashboardPath = "/dashboard/admin";
			} else if (userRoles.includes("business_owner")) {
				dashboardPath = "/dashboard/business";
			}

			// Use custom redirect or default dashboard
			const targetPath = redirectTo && redirectTo.startsWith("/") ? redirectTo : dashboardPath;

			router.push(targetPath);
		}
	}, [isAuthenticated, user, userRoles, router, searchParams]);

	const onSubmit = async (data) => {
		if (isSubmitting || loading) return;

		// Clear any previous errors
		clearError();
		setIsSubmitting(true);

		try {
			// Validate with strict schema before submission
			let validationResult;

			try {
				validationResult = submitSchema.safeParse(data);
			} catch (zodError) {
				// Handle any unexpected Zod errors gracefully
				console.warn("Zod validation error caught:", zodError);
				toast.error("Form validation failed. Please check your inputs.");
				setIsSubmitting(false);
				return;
			}

			if (!validationResult.success) {
				// Handle validation errors gracefully
				const fieldErrors = validationResult.error.errors || [];
				fieldErrors.forEach((error) => {
					const fieldName = error.path?.[0];
					if (fieldName) {
						setError(fieldName, {
							type: "manual",
							message: error.message || "Invalid input",
						});
					}
				});

				toast.error("Please correct the form errors before submitting.");
				setIsSubmitting(false);
				return;
			}

			const validatedData = validationResult.data;

			const result = await signup(validatedData.email, validatedData.password, {
				firstName: validatedData.firstName,
				lastName: validatedData.lastName,
				fullName: `${validatedData.firstName} ${validatedData.lastName}`,
			});

			if (result.success) {
				if (result.data?.user && !result.data?.session) {
					// User created but needs email confirmation
					setIsConfirmationEmailSent(true);
					toast.success("Account created! Please check your email to confirm your account.");
				} else {
					// User signed up and automatically logged in
					toast.success("Account created successfully! Welcome to Thorbis!");

					// Show personalized onboarding flow for new users
					if (loginContext && loginContext.key !== "default") {
						setShowPersonalizedFlow(true);
					}
				}
			} else {
				// Error already handled by the auth hook
				if (result.error?.userMessage) {
					toast.error(result.error.userMessage);
				}
			}
		} catch (error) {
			console.error("Signup failed:", error);
			toast.error("Account creation failed. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOAuthSignup = async (providerName) => {
		if (isSubmitting || loading) return;

		try {
			const redirectTo = `${window.location.origin}/auth/callback?type=signup`;
			const result = await loginWithOAuth(providerName, redirectTo);

			if (!result.success && result.error?.userMessage) {
				toast.error(result.error.userMessage);
			}
			// OAuth success will redirect automatically
		} catch (error) {
			console.error(`${providerName} signup error:`, error);
			toast.error(`${providerName} signup failed. Please try again.`);
		}
	};

	if (isConfirmationEmailSent) {
		return (
			<div className="flex flex-col items-center justify-center text-center space-y-4">
				<div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
					<svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h2 className="text-2xl font-bold">Check your email</h2>
				<p className="text-muted-foreground max-w-sm">We&apos;ve sent a confirmation link to your email address. Please click the link to activate your account.</p>
				<div className="flex flex-col space-y-2 mt-6">
					<Button variant="outline" onClick={() => setIsConfirmationEmailSent(false)}>
						Back to signup
					</Button>
					<Link href="/login">
						<Button variant="ghost" className="w-full">
							Already have an account? Sign in
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Handle personalized flow completion
	const handlePersonalizedFlowComplete = (data) => {
		setShowPersonalizedFlow(false);

		// Store user preferences for later use
		localStorage.setItem("thorbis_user_preferences", JSON.stringify(data.preferences));

		// Redirect based on context
		const redirectPath = loginContext?.redirectPath || "/dashboard";
		router.push(redirectPath);
	};

	// Show personalized onboarding flow after successful signup
	if (showPersonalizedFlow) {
		return (
			<div className="space-y-6">
				<PersonalizedSignupFlow context={loginContext} onComplete={handlePersonalizedFlowComplete} />
			</div>
		);
	}

	return (
		<ZodErrorBoundary>
			{/* Context-aware welcome message */}
			{loginContext && loginContext.key !== "default" && (
				<div className="mb-6">
					<IntelligentLoginMessage context={loginContext} isSignupMode={true} onContextDetected={setLoginContext} />
				</div>
			)}

			<h2 className="mb-1 text-2xl font-bold leading-9 text-left">{loginContext?.title ? `${loginContext.title}` : "Create your account"}</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">{loginContext?.subtitle || "Enter your details below to create your account"}</p>

			{/* Display auth errors */}
			{authError && (
				<div className="mt-4 p-3 rounded-md bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive">
					<div className="flex">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<div className="ml-3">
							<p className="text-sm text-destructive dark:text-destructive/80">{authError.userMessage}</p>
						</div>
					</div>
				</div>
			)}

			<div className="flex flex-col mt-6">
				<FormProvider {...formMethods}>
					<Form {...formMethods}>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={formMethods.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First name</FormLabel>
											<FormControl>
												<Input
													{...field}
													id="firstName"
													type="text"
													placeholder="John"
													className={cn("transition-all duration-200", errors.firstName ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-red-500/20 bg-destructive/50 dark:bg-destructive/20" : touchedFields.firstName && field.value?.length > 1 ? "border-success focus:border-success focus:ring-2 focus:ring-green-500/20 bg-success/50 dark:bg-success/20" : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20")}
													required
													autoComplete="given-name"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={formMethods.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last name</FormLabel>
											<FormControl>
												<Input
													{...field}
													id="lastName"
													type="text"
													placeholder="Doe"
													className={cn("transition-all duration-200", errors.lastName ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-red-500/20 bg-destructive/50 dark:bg-destructive/20" : touchedFields.lastName && field.value?.length > 1 ? "border-success focus:border-success focus:ring-2 focus:ring-green-500/20 bg-success/50 dark:bg-success/20" : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20")}
													required
													autoComplete="family-name"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={formMethods.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												{...field}
												id="email"
												type="email"
												placeholder="john@example.com"
												className={cn("transition-all duration-200", errors.email ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-red-500/20 bg-destructive/50 dark:bg-destructive/20" : touchedFields.email && field.value?.includes("@") && field.value?.includes(".") ? "border-success focus:border-success focus:ring-2 focus:ring-green-500/20 bg-success/50 dark:bg-success/20" : "border-input focus:border-primary focus:ring-2 focus:ring-primary/20")}
												required
												autoComplete="email"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={formMethods.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													id="password"
													type={showPassword ? "text" : "password"}
													placeholder="••••••••"
													className={cn(
														"pr-10 transition-all duration-200",
														errors.password
															? "border-destructive focus:border-destructive focus:ring-2 focus:ring-red-500/20 bg-destructive/50 dark:bg-destructive/20"
															: passwordStrength?.score >= 3
																? "border-success focus:border-success focus:ring-2 focus:ring-green-500/20 bg-success/50 dark:bg-success/20"
																: passwordStrength?.score >= 2
																	? "border-warning focus:border-warning focus:ring-2 focus:ring-yellow-500/20 bg-warning/50 dark:bg-warning/20"
																	: touchedFields.password && field.value?.length > 0
																		? "border-warning focus:border-warning focus:ring-2 focus:ring-orange-500/20 bg-warning/50 dark:bg-warning/20"
																		: "border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
													)}
													required
													autoComplete="new-password"
												/>
												<button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
													{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
												</button>
											</div>
										</FormControl>
										<FormMessage />

										{/* Password Strength Indicator */}
										{passwordStrength && watchedPassword && (
											<div className="mt-2 space-y-2">
												<div className="flex items-center space-x-2">
													<div className="flex space-x-1">
														{[...Array(4)].map((_, i) => (
															<div key={i} className={`h-1 w-6 rounded-full ${i < passwordStrength.score ? (passwordStrength.score < 2 ? "bg-destructive" : passwordStrength.score < 3 ? "bg-warning" : "bg-success") : "bg-muted dark:bg-muted"}`} />
														))}
													</div>
													<span className="text-xs text-muted-foreground">{passwordStrength.score < 2 ? "Weak" : passwordStrength.score < 3 ? "Fair" : passwordStrength.score < 4 ? "Good" : "Strong"}</span>
												</div>
												{passwordStrength.feedback.length > 0 && (
													<ul className="text-xs text-muted-foreground space-y-1">
														{passwordStrength.feedback.map((item, index) => (
															<li key={index} className="flex items-center space-x-1">
																<span className="w-1 h-1 bg-muted-foreground rounded-full" />
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
								control={formMethods.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													id="confirmPassword"
													type={showConfirmPassword ? "text" : "password"}
													placeholder="••••••••"
													className={cn(
														"pr-10 transition-all duration-200",
														errors.confirmPassword
															? "border-destructive focus:border-destructive focus:ring-2 focus:ring-red-500/20 bg-destructive/50 dark:bg-destructive/20"
															: touchedFields.confirmPassword && field.value && field.value === watch("password")
																? "border-success focus:border-success focus:ring-2 focus:ring-green-500/20 bg-success/50 dark:bg-success/20"
																: touchedFields.confirmPassword && field.value && field.value !== watch("password")
																	? "border-warning focus:border-warning focus:ring-2 focus:ring-orange-500/20 bg-warning/50 dark:bg-warning/20"
																	: "border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
													)}
													required
													autoComplete="new-password"
												/>
												<button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
													{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
												</button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={!isValid || isSubmitting || loading || (passwordStrength && !passwordStrength.isValid)}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating account...
									</>
								) : (
									"Create account"
								)}
							</Button>
						</form>
					</Form>
				</FormProvider>

				{/* OAuth Providers */}
				{oauthProviders.length > 0 && (
					<>
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
							</div>
						</div>

						<div className="grid gap-3">
							{oauthProviders.map((provider) => (
								<Button key={provider.name} type="button" variant="outline" className="w-full" onClick={() => handleOAuthSignup(provider.name)} disabled={isSubmitting || loading}>
									{isSubmitting || loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="mr-2">{provider.icon}</span>}
									Sign up with {provider.displayName}
								</Button>
							))}
						</div>
					</>
				)}

				<div className="mt-6 text-sm text-center">
					Already have an account?{" "}
					<Link href="/login" className="underline">
						Sign in
					</Link>
				</div>

				<div className="mt-4 text-xs text-muted-foreground text-center">
					By creating an account, you agree to our{" "}
					<Link href="/terms" className="underline">
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link href="/privacy" className="underline">
						Privacy Policy
					</Link>
				</div>
			</div>
		</ZodErrorBoundary>
	);
}

"use client";

import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@context/auth-context";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { getEnabledProviders } from "@lib/database/supabase/auth/providers";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaTwitter, FaApple } from "react-icons/fa";
import { SiDiscord, SiLinkedin } from "react-icons/si";
import { cn } from "@utils";
import logger from "@lib/utils/logger";
import { DeviceFingerprint } from "@lib/security/device-fingerprint";
import { LoginContextDetector } from "@lib/auth/login-context";
import ZodErrorBoundary from "@components/shared/zod-error-boundary";
import IntelligentLoginMessage from "@features/auth/shared/intelligent-login-message";

// Import the new i18n hooks
import { useAuthTranslation } from '@lib/i18n/use-translation';

// Create internationalized validation schema
const createLoginSchemas = (tLogin) => {
	// Lenient validation schema for real-time typing (allows empty values)
	const typingSchema = z.object({
		email: z.string().optional(),
		password: z.string().optional(),
		rememberMe: z.boolean().optional(),
		trustedDevice: z.boolean().optional(),
	});

	// Strict validation schema for form submission
	const submitSchema = z.object({
		email: z
			.string()
			.min(1, { message: tLogin('errors.required') })
			.email({ message: tLogin('errors.email') })
			.toLowerCase()
			.refine(
				(email) => {
					// Basic email security validation
					const domain = email.split("@")[1];
					return domain && !domain.includes("..");
				},
				{ message: tLogin('errors.invalid') }
			),
		password: z
			.string()
			.min(1, { message: tLogin('errors.required') })
			.min(8, { message: tLogin('errors.password') })
			.max(128, { message: tLogin('errors.password') })
			.refine(
				(password) => {
					// Check for common patterns that indicate weak passwords
					const commonPatterns = ["123456", "password", "qwerty", "abc123"];
					return !commonPatterns.some((pattern) => password.toLowerCase().includes(pattern));
				},
				{ message: tLogin('errors.invalid') }
			),
		rememberMe: z.boolean().optional(),
		trustedDevice: z.boolean().optional(),
	});

	return { typingSchema, submitSchema };
};

// Custom hook for real-time email validation
const useEmailValidation = (email) => {
	const [emailState, setEmailState] = useState({
		isValid: false,
		isChecking: false,
		suggestions: [],
		error: null,
	});

	const debounceTimer = useRef(null);

	useEffect(() => {
		if (!email || email.length < 3) {
			setEmailState({ isValid: false, isChecking: false, suggestions: [], error: null });
			return;
		}

		// Clear previous timer
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		// Debounced validation
		debounceTimer.current = setTimeout(() => {
			setEmailState((prev) => ({ ...prev, isChecking: true }));

			// Basic email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const isBasicValid = emailRegex.test(email);

			// Common domain suggestions
			const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
			const [localPart, domain] = email.split("@");
			const suggestions = [];

			if (domain && !commonDomains.includes(domain.toLowerCase())) {
				// Simple domain correction suggestions
				commonDomains.forEach((commonDomain) => {
					if (domain.length > 2 && commonDomain.includes(domain.toLowerCase().slice(0, 3))) {
						suggestions.push(`${localPart}@${commonDomain}`);
					}
				});
			}

			setEmailState({
				isValid: isBasicValid,
				isChecking: false,
				suggestions: suggestions.slice(0, 2), // Limit to 2 suggestions
				error: !isBasicValid && email.includes("@") ? "Please enter a valid email address" : null,
			});
		}, 300);

		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, [email]);

	return emailState;
};

export default function LoginPage() {
	// Use the auth translation hook
	const { tLogin, tCommon, locale } = useAuthTranslation();

	const router = useRouter();
	const searchParams = useSearchParams();
	const [isSubmitting] = useState(false); // Never show submitting state
	const setIsSubmitting = () => {}; // No-op
	const [showPassword, setShowPassword] = useState(false);
	const [oauthProviders, setOauthProviders] = useState([]);
	const [deviceFingerprint, setDeviceFingerprint] = useState(null);
	const [loginAttempts, setLoginAttempts] = useState(0);
	const [isRateLimited, setIsRateLimited] = useState(false);
	const [securityFeatures, setSecurityFeatures] = useState({
		captchaEnabled: false,
		mfaRequired: false,
		deviceVerification: false,
	});
	const [loginContext, setLoginContext] = useState(null);
	const [contextualRedirect, setContextualRedirect] = useState(null);
	const [focusedField, setFocusedField] = useState(null);
	const [fieldTouched, setFieldTouched] = useState({ email: false, password: false });

	const formMethods = useForm({
		resolver: (data) => {
			// Always return success during typing to prevent any Zod validation
			return { values: data, errors: {} };
		},
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
			trustedDevice: false,
		},
		mode: "onSubmit", // Only validate on form submission
		reValidateMode: "onSubmit", // Keep validation minimal
		shouldFocusError: false, // Prevent forced reflow on error focus
	});

	const {
		handleSubmit,
		watch,
		formState: { errors, isValid, touchedFields, isValidating },
	} = formMethods;

	const { user, isAuthenticated, userRoles, loading, login, loginWithOAuth, error: authError, clearError, validateEmail, checkBreachedPassword } = useAuth();

	// Create internationalized schemas
	const { typingSchema, submitSchema } = useMemo(() => createLoginSchemas(tLogin), [tLogin]);

	// Watch form values for real-time validation
	const watchedValues = watch();
	const currentEmail = watch("email");
	const currentPassword = watch("password");

	// Custom validation hooks
	const emailValidation = useEmailValidation(currentEmail);

	// Password strength assessment
	const passwordStrength = useMemo(() => {
		if (!currentPassword || currentPassword.length === 0) return { score: 0, level: "none" };

		let score = 0;
		let feedback = [];

		// Length check
		if (currentPassword.length >= 8) score += 25;
		else feedback.push("At least 8 characters");

		// Complexity checks
		if (/[a-z]/.test(currentPassword)) score += 15;
		else feedback.push("Lowercase letter");

		if (/[A-Z]/.test(currentPassword)) score += 15;
		else feedback.push("Uppercase letter");

		if (/\d/.test(currentPassword)) score += 15;
		else feedback.push("Number");

		if (/[^a-zA-Z0-9]/.test(currentPassword)) score += 30;
		else feedback.push("Special character");

		let level = "weak";
		if (score >= 90) level = "excellent";
		else if (score >= 70) level = "strong";
		else if (score >= 50) level = "good";
		else if (score >= 30) level = "fair";

		return { score, level, feedback };
	}, [currentPassword]);

	// Auto-save form data to localStorage (excluding password for security)
	useEffect(() => {
		const savedEmail = localStorage.getItem("thorbis_login_email");
		if (savedEmail && !currentEmail) {
			formMethods.setValue("email", savedEmail);
		}
	}, [currentEmail, formMethods]);

	useEffect(() => {
		if (currentEmail && emailValidation.isValid) {
			localStorage.setItem("thorbis_login_email", currentEmail);
		}
	}, [currentEmail, emailValidation.isValid]);

	// Detect login context for intelligent messaging
	useEffect(() => {
		const detectedContext = LoginContextDetector.detectContext(window.location.href, searchParams);
		setLoginContext(detectedContext);

		// Store context globally for access by other components
		window.loginContext = detectedContext;
	}, [searchParams]);

	// Initialize security features and device fingerprinting
	useEffect(() => {
		const initializeSecurityFeatures = async () => {
			try {
				// Generate device fingerprint for security
				const fingerprint = await DeviceFingerprint.generate();
				setDeviceFingerprint(fingerprint);

				// Load OAuth providers
				const providers = getEnabledProviders();
				setOauthProviders(providers);

				// Check if user has previous failed attempts (stored in sessionStorage)
				const storedAttempts = sessionStorage.getItem("loginAttempts");
				if (storedAttempts) {
					const attempts = parseInt(storedAttempts, 10);
					setLoginAttempts(attempts);

					// Enable additional security after 3 failed attempts
					if (attempts >= 3) {
						setSecurityFeatures((prev) => ({
							...prev,
							captchaEnabled: true,
							deviceVerification: true,
						}));
					}
				}

				// Log security initialization
				logger.security({
					action: "login_page_initialized",
					deviceFingerprint: fingerprint.id,
					userAgent: navigator.userAgent,
					timestamp: Date.now(),
				});
			} catch (error) {
				logger.error("Failed to initialize security features:", error);
			}
		};

		initializeSecurityFeatures();
	}, []);

	// Handle URL parameters for redirects and errors (never prefill credentials from URL)
	useEffect(() => {
		const redirectTo = searchParams.get("redirectTo");
		const urlError = searchParams.get("error");
		const message = searchParams.get("message");

		// Explicitly ignore and wipe any sensitive params if present in client (defense-in-depth)
		if (typeof window !== 'undefined') {
			const sensitiveParams = ["password", "pass", "pwd", "email"]; // never use these from URL
			const url = new URL(window.location.href);
			let mutated = false;
			sensitiveParams.forEach((k) => {
				if (url.searchParams.has(k)) {
					url.searchParams.delete(k);
					mutated = true;
				}
			});
			if (mutated) {
				window.history.replaceState({}, "", url.toString());
			}
		}

		if (message) {
			if (urlError) {
				toast.error(message);
			} else {
				toast.success(message);
			}
		}
	}, [searchParams]);

	// Handle context detection and smart redirects
	const handleContextDetected = useCallback(
		(detectedContext) => {
			setLoginContext(detectedContext);

			// Generate smart redirect URL
			const smartRedirect = LoginContextDetector.getPostLoginRedirect(detectedContext, searchParams);
			setContextualRedirect(smartRedirect);

			try {
				// Enhanced logger validation with debugging
				if (!logger) {
					console.warn("Logger is null or undefined in login component");
					return;
				}

				if (typeof logger !== "object") {
					console.warn("Logger is not an object in login component, type:", typeof logger);
					return;
				}

				if (typeof logger.interaction !== "function") {
					console.warn("Logger.interaction is not a function in login component, type:", typeof logger.interaction, "Available methods:", Object.keys(logger));
					// Fallback to analytics if available
					if (typeof logger.analytics === "function") {
						logger.analytics({
							type: "login_context_set",
							context: detectedContext.key,
							redirectUrl: smartRedirect,
							timestamp: Date.now(),
						});
					}
					return;
				}

				// Safe to call logger.interaction
				logger.interaction({
					type: "login_context_set",
					context: detectedContext.key,
					redirectUrl: smartRedirect,
					timestamp: Date.now(),
				});
			} catch (error) {
				// Robust error handling - always log the interaction somehow
				console.error("Logger error in LoginPage:", error);
				console.log("👆 INTERACTION (fallback):", {
					type: "login_context_set",
					context: detectedContext.key,
					redirectUrl: smartRedirect,
					timestamp: Date.now(),
					error: error.message,
				});
			}
		},
		[searchParams]
	);

	// Redirect authenticated users to their dashboard (run once to avoid loops)
	const didRedirectRef = useRef(false);
	useEffect(() => {
		console.log('🔍 Login redirect check:', { 
			didRedirect: didRedirectRef.current, 
			isAuthenticated, 
			hasUser: !!user,
			userRoles 
		});
		
		if (didRedirectRef.current) return;
		if (isAuthenticated && user) {
			didRedirectRef.current = true;
			let targetPath = contextualRedirect;
			if (!targetPath) {
				const redirectTo = searchParams.get("redirectTo");
				if (redirectTo && redirectTo.startsWith("/")) {
					targetPath = redirectTo;
				} else {
					// Use same logic as dashboard router
					const userRole = user?.user_metadata?.role || user?.role || "user";
					const accountType = user?.user_metadata?.account_type || user?.account_type;
					
					if (userRoles.includes("admin") || userRoles.includes("super_admin") || userRole === "admin" || userRole === "super_admin") {
						targetPath = "/dashboard/admin";
					} else if (userRole === "localhub_operator" || accountType === "localhub") {
						targetPath = "/dashboard/localhub";
					} else {
						targetPath = "/dashboard/business"; // All other users use business dashboard
					}
				}
			}
			console.log('🚀 Login successful, redirecting to:', targetPath);
			router.replace(targetPath);
		}
	}, [isAuthenticated, user, userRoles, router, searchParams, contextualRedirect]);

	// Enhanced submit with security features
	const onSubmit = useCallback(
		async (data) => {
			if (isRateLimited) return; // Removed loading checks

			// Clear any previous errors
			clearError();
			setIsSubmitting(true);

			const startTime = performance.now();

			try {
				// Validate with strict schema at submission time
				let validationResult;

				try {
					validationResult = submitSchema.safeParse(data);
				} catch (zodError) {
					// Handle any unexpected Zod errors gracefully
					console.warn("Zod validation error caught:", zodError);
					toast.error(tLogin('errors.generic'));
					setIsSubmitting(false);
					return;
				}

				if (!validationResult.success) {
					const errors = validationResult.error.errors || [];
					errors.forEach((error) => {
						if (error.message) {
							toast.error(error.message);
						}
					});
					setIsSubmitting(false);
					return;
				}

				// Security validations
				if (loginAttempts >= 5) {
					throw new Error(tLogin('errors.generic'));
				}

				// Check for breached passwords on client side
				if (checkBreachedPassword) {
					const isBreached = await checkBreachedPassword(data.password);
					if (isBreached) {
						toast.error(tLogin('errors.generic'));
						setIsSubmitting(false);
						return;
					}
				}

				// Enhanced login with security context
				const loginContext = {
					deviceFingerprint: deviceFingerprint?.id,
					rememberMe: data.rememberMe,
					trustedDevice: data.trustedDevice,
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					screen: {
						width: window.screen.width,
						height: window.screen.height,
					},
					language: navigator.language,
				};

				// Include detected context in login request
				const enhancedLoginContext = {
					...loginContext,
					detectedContext: window.loginContext || null,
					intendedAction: window.loginContext?.actionText,
				};

				const result = await login(data.email, data.password, enhancedLoginContext);

				if (result.success) {
					// Clear failed attempts on success
					sessionStorage.removeItem("loginAttempts");
					setLoginAttempts(0);

					// Contextual success message
					const successMessage = window.loginContext && window.loginContext.key !== "default" 
						? `${tLogin('success')} Taking you to ${window.loginContext.actionText.toLowerCase()}...` 
						: tLogin('success');

					toast.success(successMessage);

					// Log contextual login success
					logger.security({
						action: "contextual_login_success",
						email: data.email,
						deviceFingerprint: deviceFingerprint?.id,
						duration: performance.now() - startTime,
						context: window.loginContext?.key,
						intendedAction: window.loginContext?.actionText,
						timestamp: Date.now(),
					});

					// EXPLICIT REDIRECT - Don't rely on auth state change listener
					setTimeout(() => {
						// Determine redirect destination
						const redirectTo = searchParams.get("redirectTo");
						let destination = "/dashboard/business"; // Default to business dashboard
						
						if (redirectTo && redirectTo.startsWith("/")) {
							destination = redirectTo;
						} else if (window.loginContext?.redirectUrl) {
							destination = window.loginContext.redirectUrl;
						} else {
							// Use same logic as dashboard router
							const userRole = user?.user_metadata?.role || user?.role || "user";
							const accountType = user?.user_metadata?.account_type || user?.account_type;
							
							if (userRole === "admin" || userRole === "super_admin") {
								destination = "/dashboard/admin";
							} else if (userRole === "localhub_operator" || accountType === "localhub") {
								destination = "/dashboard/localhub";
							} else {
								destination = "/dashboard/business"; // All other users use business dashboard
							}
						}
						
						console.log('🚀 Login successful, redirecting to:', destination);
						router.push(destination);
					}, 500); // Reduced delay since auth state is now updated immediately
				} else {
					// Handle failed login
					const newAttempts = loginAttempts + 1;
					setLoginAttempts(newAttempts);
					sessionStorage.setItem("loginAttempts", newAttempts.toString());

					// Enable additional security measures
					if (newAttempts >= 3) {
						setSecurityFeatures((prev) => ({
							...prev,
							captchaEnabled: true,
							deviceVerification: true,
						}));
					}

					if (newAttempts >= 5) {
						setIsRateLimited(true);
						// Auto-unlock after 15 minutes
						setTimeout(
							() => {
								setIsRateLimited(false);
								sessionStorage.removeItem("loginAttempts");
								setLoginAttempts(0);
							},
							15 * 60 * 1000
						);
					}

					// Show appropriate error message
					if (result.error?.userMessage) {
						toast.error(result.error.userMessage);
					} else {
						toast.error("Login failed. Please check your credentials.");
					}

					// Log failed attempt
					logger.security({
						action: "login_failed",
						email: data.email,
						deviceFingerprint: deviceFingerprint?.id,
						attemptNumber: newAttempts,
						error: result.error?.message,
						timestamp: Date.now(),
					});
				}
			} catch (error) {
				logger.error("Login failed:", error);
				toast.error(error.message || "Login failed. Please try again.");

				// Increment failed attempts even for exceptions
				const newAttempts = loginAttempts + 1;
				setLoginAttempts(newAttempts);
				sessionStorage.setItem("loginAttempts", newAttempts.toString());
			} finally {
				setIsSubmitting(false);
			}
		},
		[isRateLimited, loginAttempts, deviceFingerprint, login, clearError, checkBreachedPassword] // Removed loading dependencies
	);

	const handleOAuthLogin = async (providerName) => {
		// Removed loading checks for immediate OAuth

		try {
			const redirectTo = searchParams.get("redirectTo");
			const targetUrl = redirectTo && redirectTo.startsWith("/") ? `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}` : `${window.location.origin}/auth/callback`;

			const result = await loginWithOAuth(providerName, targetUrl);

			if (!result.success && result.error?.userMessage) {
				toast.error(result.error.userMessage);
			}
			// OAuth success will redirect automatically
		} catch (error) {
			console.error(`${providerName} login error:`, error);
			toast.error(`${providerName} login failed. Please try again.`);
		}
	};

	// Smart security level calculation
	const securityLevel = useMemo(() => {
		let level = "standard";
		if (securityFeatures.mfaRequired) level = "high";
		if (securityFeatures.captchaEnabled) level = "enhanced";
		return level;
	}, [securityFeatures]);

	// Smart form state for better UX
	const isFormReady = useMemo(() => {
		return !isRateLimited; // Removed loading checks
	}, [isRateLimited]); // Removed loading dependencies

  const ProviderIcon = ({ name }) => {
		switch (name) {
			case "google":
				return <FcGoogle className="mr-2 h-5 w-5" />;
			case "facebook":
				return <FaFacebook className="mr-2 h-5 w-5 text-muted-foreground" />;
			case "github":
				return <FaGithub className="mr-2 h-5 w-5" />;
			case "twitter":
				return <FaTwitter className="mr-2 h-5 w-5 text-muted-foreground" />;
			case "discord":
				return <SiDiscord className="mr-2 h-5 w-5 text-muted-foreground" />;
			case "linkedin":
				return <SiLinkedin className="mr-2 h-5 w-5 text-muted-foreground" />;
			case "apple":
				return <FaApple className="mr-2 h-5 w-5" />;
			default:
				return null;
		}
  };

	return (
		<>
			{/* Intelligent Login Message Banner - Outside the card */}
			<IntelligentLoginMessage onContextDetected={setLoginContext} isSignupMode={false} />
			
			<ZodErrorBoundary>
				{/* Minimal error messages only */}
				{isRateLimited && (
					<div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-destructive/20 dark:border-red-800">
						<div className="flex items-center text-sm text-destructive dark:text-destructive/90">
							<AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
							<span>Too many attempts. Please wait before trying again.</span>
						</div>
					</div>
				)}

				{/* Display auth errors - simplified */}
				{authError && (
					<div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-destructive/20 dark:border-red-800">
						<div className="flex items-center">
							<AlertCircle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />
							<p className="text-sm text-destructive dark:text-destructive/90">{authError.userMessage}</p>
						</div>
					</div>
				)}

				<div className="w-full">
					<FormProvider {...formMethods}>
						<Form {...formMethods}>
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-6"
								suppressHydrationWarning={true}
								onKeyDown={(e) => {
									// Enhanced keyboard navigation
									if (e.key === "Enter") { // Removed submitting check
										e.preventDefault();
										handleSubmit(onSubmit)();
									}
									// Escape to clear focused field
									if (e.key === "Escape") {
										setFocusedField(null);
										e.target.blur();
									}
								}}
								role="form"
								aria-label="Sign in to your account"
							>
							{/* Email Field - Clean Design */}
							<FormField
								control={formMethods.control}
								name="email"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-sm font-medium text-foreground">
											Email address
										</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													id="email"
													type="email"
													placeholder="Enter your email"
													className={cn(
														"h-11 pr-4 text-base transition-all duration-200 border-border/60 focus:border-foreground/60 focus:ring-1 focus:ring-foreground/20 rounded-lg",
														// Error state - cleaner colors
														emailValidation.error && fieldTouched.email && "border-red-300 focus:border-red-400 focus:ring-red-400/20",
														// Success state - cleaner colors
														emailValidation.isValid && fieldTouched.email && "border-green-300 focus:border-green-400 focus:ring-green-400/20"
													)}
													required
													autoComplete="email"
													autoFocus
													spellCheck={false}
													aria-describedby={emailValidation.error ? "email-error" : emailValidation.suggestions.length > 0 ? "email-suggestions" : undefined}
													onFocus={() => {
														setFocusedField("email");
														setFieldTouched((prev) => ({ ...prev, email: true }));
													}}
													onBlur={() => setFocusedField(null)}
													suppressHydrationWarning={true}
												/>
												{/* Removed email validation loading indicator */}
												{emailValidation.isValid && fieldTouched.email && !emailValidation.isChecking && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />}
											</div>
										</FormControl>

										{/* Email suggestions - Cleaner design */}
										{emailValidation.suggestions.length > 0 && fieldTouched.email && (
											<div id="email-suggestions" className="space-y-2">
												<p className="text-xs text-muted-foreground">Did you mean:</p>
												<div className="flex flex-wrap gap-2">
													{emailValidation.suggestions.map((suggestion, index) => (
														<button
															key={index}
															type="button"
															onClick={() => {
																field.onChange(suggestion);
																setFieldTouched((prev) => ({ ...prev, email: true }));
															}}
															className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-foreground hover:text-foreground/80"
														>
															{suggestion}
														</button>
													))}
												</div>
											</div>
										)}

										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							{/* Password Field - Clean Design */}
							<FormField
								control={formMethods.control}
								name="password"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<div className="flex items-center justify-between">
											<FormLabel className="text-sm font-medium text-foreground">
												Password
											</FormLabel>
											<Link href="/password-reset" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
												Forgot password?
											</Link>
										</div>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													id="password"
													type={showPassword ? "text" : "password"}
													placeholder="Enter your password"
													className={cn(
														"h-11 pr-12 text-base transition-all duration-200 border-border/60 focus:border-foreground/60 focus:ring-1 focus:ring-foreground/20 rounded-lg",
														// Error state - cleaner colors
														errors.password && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
													)}
													required
													autoComplete="current-password"
													onFocus={() => {
														setFocusedField("password");
														setFieldTouched((prev) => ({ ...prev, password: true }));
													}}
													onBlur={() => setFocusedField(null)}
													suppressHydrationWarning={true}
												/>
												<button 
													type="button" 
													className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1" 
													onClick={() => setShowPassword(!showPassword)} 
													tabIndex={-1} 
													aria-label={showPassword ? "Hide password" : "Show password"}
												>
													{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
												</button>
											</div>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							{/* Remember Me - Simplified */}
							<FormField
								control={formMethods.control}
								name="rememberMe"
								render={({ field }) => (
									<div className="flex items-center space-x-2 py-1">
										<input 
											type="checkbox" 
											id="rememberMe" 
											checked={field.value} 
											onChange={field.onChange} 
											className="w-4 h-4 text-foreground focus:ring-foreground/20 focus:ring-2 border-border/60 rounded transition-all" 
										/>
										<label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer select-none">
											Remember me
										</label>
									</div>
								)}
							/>

							{/* Clean Submit Button */}
							<Button 
								type="submit" 
								className={cn(
									"w-full h-11 text-base font-medium transition-all duration-200 rounded-lg",
									"bg-foreground hover:bg-foreground/90 text-background",
									"focus:ring-2 focus:ring-foreground/20 focus:outline-none",
									"disabled:opacity-60 disabled:cursor-not-allowed",
									"shadow-sm hover:shadow-md"
								)} 
								disabled={isRateLimited} // Removed loading states
							>
								{isRateLimited ? (
									<div className="flex items-center justify-center">
										<AlertCircle className="mr-2 h-4 w-4" />
										<span>Please wait</span>
									</div>
								) : (
									<span>Sign in</span>
								)}
							</Button>
						</form>
					</Form>
				</FormProvider>
				</div>

				{/* OAuth Providers - Clean Design */}
				{oauthProviders.length > 0 && (
					<>
						<div className="relative my-8">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-border/60" />
							</div>
							<div className="relative flex justify-center text-xs">
								<span className="bg-background px-3 text-muted-foreground">
									or
								</span>
							</div>
						</div>

						<div className="space-y-3">
							{oauthProviders.map((provider) => (
								<Button 
									key={provider.name} 
									type="button" 
									variant="outline" 
									className="w-full h-11 border-border/60 hover:border-border hover:bg-muted/50 transition-all duration-200 rounded-lg" 
									onClick={() => handleOAuthLogin(provider.name)} 
									disabled={false} // Removed loading states
								>
									<ProviderIcon name={provider.name} /> {/* Removed loading state */}
									<span className="ml-2">Continue with {provider.displayName}</span>
								</Button>
							))}
						</div>
					</>
				)}

				{/* Clean Footer */}
				<div className="mt-8 text-center">
					<p className="text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link href="/signup" className="font-medium text-foreground hover:text-foreground/80 transition-colors underline-offset-4 hover:underline">
							Sign up
						</Link>
					</p>
				</div>
			</ZodErrorBoundary>
		</>
	);
}

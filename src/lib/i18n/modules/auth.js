export const authTranslations = {
	en: {
		auth: {
			// Login
			login: {
				title: "Welcome Back",
				subtitle: "Sign in to your account",
				email: "Email",
				password: "Password",
				forgotPassword: "Forgot your password?",
				signIn: "Sign In",
				signInWith: "Sign in with",
				noAccount: "Don't have an account?",
				signUp: "Sign Up",
				rememberMe: "Remember me",
				signingIn: "Signing in...",
				success: "Successfully signed in!",
				errors: {
					invalid: "Invalid email or password",
					required: "This field is required",
					email: "Please enter a valid email address",
					password: "Password must be at least 6 characters",
					generic: "An error occurred. Please try again."
				}
			},
			// Signup
			signup: {
				title: "Create Your Account",
				subtitle: "Join thousands of businesses and customers",
				firstName: "First Name",
				lastName: "Last Name",
				email: "Email",
				password: "Password",
				confirmPassword: "Confirm Password",
				createAccount: "Create Account",
				signUpWith: "Sign up with",
				alreadyHave: "Already have an account?",
				terms: "By creating an account, you agree to our",
				termsLink: "Terms of Service",
				and: "and",
				privacyLink: "Privacy Policy",
				creating: "Creating account...",
				success: "Account created successfully!",
				verifyEmail: "Please check your email to verify your account",
				errors: {
					passwordMismatch: "Passwords do not match",
					weakPassword: "Password must contain at least 8 characters, one uppercase, one lowercase, and one number",
					emailExists: "An account with this email already exists",
					generic: "Failed to create account. Please try again."
				}
			},
			// Password Reset
			passwordReset: {
				title: "Reset Your Password",
				subtitle: "Enter your email to receive reset instructions",
				email: "Email Address",
				sendReset: "Send Reset Link",
				backToLogin: "Back to Login",
				checkEmail: "Check your email for reset instructions",
				newPassword: "New Password",
				confirmNewPassword: "Confirm New Password",
				resetPassword: "Reset Password",
				success: "Password reset successfully!",
				expired: "This reset link has expired",
				invalid: "Invalid reset link",
				errors: {
					emailNotFound: "No account found with this email address",
					generic: "Failed to send reset email. Please try again."
				}
			},
			// Two-Factor Authentication
			twoFactor: {
				title: "Two-Factor Authentication",
				subtitle: "Enter the verification code from your authenticator app",
				code: "Verification Code",
				verify: "Verify",
				backupCode: "Use backup code instead",
				resend: "Resend code",
				verifying: "Verifying...",
				success: "Successfully verified!",
				errors: {
					invalid: "Invalid verification code",
					expired: "Verification code has expired",
					generic: "Verification failed. Please try again."
				}
			},
			// Email Verification
			emailVerification: {
				title: "Verify Your Email",
				subtitle: "We've sent a verification link to your email",
				resend: "Resend verification email",
				change: "Change email address",
				verifying: "Verifying...",
				success: "Email verified successfully!",
				alreadyVerified: "Your email is already verified",
				expired: "Verification link has expired",
				invalid: "Invalid verification link",
				checkInbox: "Please check your inbox and click the verification link"
			},
			// Profile Setup
			profile: {
				setup: {
					title: "Complete Your Profile",
					subtitle: "Help us personalize your experience",
					businessOwner: "I'm a business owner",
					customer: "I'm a customer",
					firstName: "First Name",
					lastName: "Last Name",
					phone: "Phone Number",
					location: "Location",
					interests: "Interests",
					howFound: "How did you hear about us?",
					continue: "Continue",
					skip: "Skip for now",
					saving: "Saving...",
					success: "Profile updated successfully!"
				}
			},
			// Business Forms
			business: {
				add: {
					title: "Add Your Business",
					subtitle: "Join thousands of businesses on Thorbis",
					step1: {
						title: "Business Information",
						businessName: "Business Name",
						category: "Business Category",
						description: "Business Description",
						website: "Website (optional)",
						phone: "Phone Number",
						email: "Business Email"
					},
					step2: {
						title: "Location & Hours",
						address: "Street Address",
						city: "City",
						state: "State/Province",
						zipCode: "ZIP/Postal Code",
						country: "Country",
						hours: "Business Hours",
						serviceArea: "Service Area (miles)"
					},
					step3: {
						title: "Profile & Services",
						logo: "Business Logo",
						photos: "Business Photos",
						services: "Services Offered",
						specialties: "Specialties",
						certifications: "Certifications",
						insurance: "Insurance Information"
					},
					continue: "Continue",
					back: "Back",
					submit: "Add Business",
					saving: "Saving...",
					success: "Business added successfully!",
					errors: {
						required: "This field is required",
						invalidPhone: "Please enter a valid phone number",
						invalidEmail: "Please enter a valid email address",
						invalidWebsite: "Please enter a valid website URL"
					}
				},
				claim: {
					title: "Claim Your Business",
					subtitle: "Verify ownership and take control of your business listing",
					search: "Search for your business",
					notFound: "Business not found?",
					addNew: "Add it now",
					verification: {
						title: "Verify Ownership",
						subtitle: "Upload documents to verify you own this business",
						businessLicense: "Business License",
						taxDocument: "Tax Document",
						utilityBill: "Utility Bill",
						other: "Other Documentation",
						upload: "Upload Document",
						submit: "Submit for Review",
						pending: "Verification Pending",
						approved: "Verification Approved",
						rejected: "Verification Rejected"
					}
				}
			},
			// Navigation
			navigation: {
				dashboard: "Dashboard",
				profile: "Profile",
				settings: "Settings",
				logout: "Sign Out",
				back: "Back to Thorbis"
			},
			// Common
			common: {
				loading: "Loading...",
				error: "Error",
				success: "Success",
				warning: "Warning",
				info: "Information",
				close: "Close",
				cancel: "Cancel",
				confirm: "Confirm",
				save: "Save",
				delete: "Delete",
				edit: "Edit",
				view: "View",
				next: "Next",
				previous: "Previous",
				finish: "Finish",
				optional: "Optional",
				required: "Required"
			}
		}
	},
	es: {
		auth: {
			// Login
			login: {
				title: "Bienvenido de Vuelta",
				subtitle: "Inicia sesión en tu cuenta",
				email: "Correo Electrónico",
				password: "Contraseña",
				forgotPassword: "¿Olvidaste tu contraseña?",
				signIn: "Iniciar Sesión",
				signInWith: "Iniciar sesión con",
				noAccount: "¿No tienes una cuenta?",
				signUp: "Registrarse",
				rememberMe: "Recordarme",
				signingIn: "Iniciando sesión...",
				success: "¡Sesión iniciada exitosamente!",
				errors: {
					invalid: "Correo o contraseña inválidos",
					required: "Este campo es obligatorio",
					email: "Por favor ingresa un correo válido",
					password: "La contraseña debe tener al menos 6 caracteres",
					generic: "Ocurrió un error. Por favor intenta de nuevo."
				}
			},
			// Signup
			signup: {
				title: "Crea Tu Cuenta",
				subtitle: "Únete a miles de negocios y clientes",
				firstName: "Nombre",
				lastName: "Apellido",
				email: "Correo Electrónico",
				password: "Contraseña",
				confirmPassword: "Confirmar Contraseña",
				createAccount: "Crear Cuenta",
				signUpWith: "Registrarse con",
				alreadyHave: "¿Ya tienes una cuenta?",
				terms: "Al crear una cuenta, aceptas nuestros",
				termsLink: "Términos de Servicio",
				and: "y",
				privacyLink: "Política de Privacidad",
				creating: "Creando cuenta...",
				success: "¡Cuenta creada exitosamente!",
				verifyEmail: "Por favor revisa tu correo para verificar tu cuenta",
				errors: {
					passwordMismatch: "Las contraseñas no coinciden",
					weakPassword: "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número",
					emailExists: "Ya existe una cuenta con este correo",
					generic: "Error al crear la cuenta. Por favor intenta de nuevo."
				}
			},
			// Password Reset
			passwordReset: {
				title: "Restablecer Contraseña",
				subtitle: "Ingresa tu correo para recibir instrucciones",
				email: "Correo Electrónico",
				sendReset: "Enviar Enlace",
				backToLogin: "Volver al Inicio",
				checkEmail: "Revisa tu correo para las instrucciones",
				newPassword: "Nueva Contraseña",
				confirmNewPassword: "Confirmar Nueva Contraseña",
				resetPassword: "Restablecer Contraseña",
				success: "¡Contraseña restablecida exitosamente!",
				expired: "Este enlace ha expirado",
				invalid: "Enlace de restablecimiento inválido",
				errors: {
					emailNotFound: "No se encontró cuenta con este correo",
					generic: "Error al enviar correo. Por favor intenta de nuevo."
				}
			},
			// Two-Factor Authentication
			twoFactor: {
				title: "Autenticación de Dos Factores",
				subtitle: "Ingresa el código de verificación de tu aplicación",
				code: "Código de Verificación",
				verify: "Verificar",
				backupCode: "Usar código de respaldo",
				resend: "Reenviar código",
				verifying: "Verificando...",
				success: "¡Verificación exitosa!",
				errors: {
					invalid: "Código de verificación inválido",
					expired: "El código ha expirado",
					generic: "Verificación fallida. Por favor intenta de nuevo."
				}
			},
			// Email Verification
			emailVerification: {
				title: "Verifica Tu Correo",
				subtitle: "Hemos enviado un enlace de verificación a tu correo",
				resend: "Reenviar correo de verificación",
				change: "Cambiar dirección de correo",
				verifying: "Verificando...",
				success: "¡Correo verificado exitosamente!",
				alreadyVerified: "Tu correo ya está verificado",
				expired: "El enlace de verificación ha expirado",
				invalid: "Enlace de verificación inválido",
				checkInbox: "Por favor revisa tu bandeja de entrada y haz clic en el enlace"
			}
		}
	},
	fr: {
		auth: {
			// Login
			login: {
				title: "Bon Retour",
				subtitle: "Connectez-vous à votre compte",
				email: "E-mail",
				password: "Mot de passe",
				forgotPassword: "Mot de passe oublié ?",
				signIn: "Se connecter",
				signInWith: "Se connecter avec",
				noAccount: "Vous n'avez pas de compte ?",
				signUp: "S'inscrire",
				rememberMe: "Se souvenir de moi",
				signingIn: "Connexion en cours...",
				success: "Connexion réussie !",
				errors: {
					invalid: "E-mail ou mot de passe invalide",
					required: "Ce champ est obligatoire",
					email: "Veuillez entrer une adresse e-mail valide",
					password: "Le mot de passe doit contenir au moins 6 caractères",
					generic: "Une erreur s'est produite. Veuillez réessayer."
				}
			},
			// Signup
			signup: {
				title: "Créez Votre Compte",
				subtitle: "Rejoignez des milliers d'entreprises et clients",
				firstName: "Prénom",
				lastName: "Nom",
				email: "E-mail",
				password: "Mot de passe",
				confirmPassword: "Confirmer le mot de passe",
				createAccount: "Créer un compte",
				signUpWith: "S'inscrire avec",
				alreadyHave: "Vous avez déjà un compte ?",
				terms: "En créant un compte, vous acceptez nos",
				termsLink: "Conditions d'utilisation",
				and: "et",
				privacyLink: "Politique de confidentialité",
				creating: "Création du compte...",
				success: "Compte créé avec succès !",
				verifyEmail: "Veuillez vérifier votre e-mail pour confirmer votre compte",
				errors: {
					passwordMismatch: "Les mots de passe ne correspondent pas",
					weakPassword: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
					emailExists: "Un compte avec cet e-mail existe déjà",
					generic: "Échec de la création du compte. Veuillez réessayer."
				}
			}
		}
	},
	de: {
		auth: {
			// Login
			login: {
				title: "Willkommen zurück",
				subtitle: "Melden Sie sich in Ihrem Konto an",
				email: "E-Mail",
				password: "Passwort",
				forgotPassword: "Passwort vergessen?",
				signIn: "Anmelden",
				signInWith: "Anmelden mit",
				noAccount: "Noch kein Konto?",
				signUp: "Registrieren",
				rememberMe: "Angemeldet bleiben",
				signingIn: "Anmeldung läuft...",
				success: "Erfolgreich angemeldet!",
				errors: {
					invalid: "Ungültige E-Mail oder Passwort",
					required: "Dieses Feld ist erforderlich",
					email: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
					password: "Passwort muss mindestens 6 Zeichen haben",
					generic: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
				}
			}
		}
	}
};

// OAuth Provider Configurations for Supabase Auth
// Based on Supabase documentation: https://supabase.com/docs/guides/auth/social-login

import { Provider } from "@supabase/supabase-js";

export type OAuthProvider = {
	name: string;
	provider: Provider;
	displayName: string;
	icon: string;
	color: string;
	enabled: boolean;
	redirectTo?: string;
	scopes?: string;
};

// OAuth providers configuration
export const oauthProviders: Record<string, OAuthProvider> = {
	google: {
		name: "google",
		provider: "google" as Provider,
		displayName: "Google",
		icon: "🔗", // Replace with proper icon component
		color: "hsl(var(--destructive))",
		enabled: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
		scopes: "openid email profile",
	},
	github: {
		name: "github",
		provider: "github" as Provider,
		displayName: "GitHub",
		icon: "🔗",
		color: "hsl(var(--foreground))",
		enabled: !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
		scopes: "user:email",
	},
	facebook: {
		name: "facebook",
		provider: "facebook" as Provider,
		displayName: "Facebook",
		icon: "🔗",
		color: "hsl(var(--muted-foreground))",
		enabled: !!process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
		scopes: "email",
	},
	twitter: {
		name: "twitter",
		provider: "twitter" as Provider,
		displayName: "Twitter",
		icon: "🔗",
		color: "hsl(var(--muted-foreground))",
		enabled: !!process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
		scopes: "tweet.read users.read",
	},
	discord: {
		name: "discord",
		provider: "discord" as Provider,
		displayName: "Discord",
		icon: "🔗",
		color: "hsl(var(--muted-foreground))",
		enabled: !!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
		scopes: "identify email",
	},
	linkedin: {
		name: "linkedin",
		provider: "linkedin" as Provider,
		displayName: "LinkedIn",
		icon: "🔗",
		color: "hsl(var(--muted-foreground))",
		enabled: !!process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
		scopes: "r_liteprofile r_emailaddress",
	},
	apple: {
		name: "apple",
		provider: "apple" as Provider,
		displayName: "Apple",
		icon: "🔗",
		color: "hsl(var(--background))",
		enabled: !!process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
		scopes: "name email",
	},
};

// Get enabled providers
export const getEnabledProviders = (): OAuthProvider[] => {
	return Object.values(oauthProviders).filter((provider) => provider.enabled);
};

// Get specific provider
export const getProvider = (name: string): OAuthProvider | undefined => {
	return oauthProviders[name];
};

// Default redirect URLs for OAuth
export const getOAuthRedirectUrls = (baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") => {
	return {
		signIn: `${baseUrl}/auth/callback`,
		signUp: `${baseUrl}/auth/callback?type=signup`,
		dashboard: `${baseUrl}/dashboard/user`,
		onboarding: `${baseUrl}/onboarding`,
	};
};

// OAuth sign-in options factory
export const createOAuthSignInOptions = (provider: OAuthProvider, redirectTo?: string) => {
	const redirectUrls = getOAuthRedirectUrls();

	return {
		provider: provider.provider,
		options: {
			redirectTo: redirectTo || redirectUrls.signIn,
			scopes: provider.scopes,
			queryParams: {
				access_type: "offline",
				prompt: "consent",
			},
		},
	};
};

// Provider-specific configurations for enhanced security
export const providerSpecificOptions = {
	google: {
		queryParams: {
			access_type: "offline",
			prompt: "consent",
			include_granted_scopes: "true",
		},
	},
	github: {
		queryParams: {
			allow_signup: "true",
		},
	},
	facebook: {
		queryParams: {
			auth_type: "rerequest",
		},
	},
	linkedin: {
		queryParams: {
			response_type: "code",
			state: "random_string",
		},
	},
};

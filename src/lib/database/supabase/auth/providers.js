/**
 * OAuth Provider Configuration
 * Enterprise-grade provider management with security assessment
 */

import logger from "@lib/utils/logger";

// OAuth provider configurations with security metadata
export const OAUTH_PROVIDERS = {
	google: {
		name: "google",
		displayName: "Google",
		enabled: !!process.env.GOOGLE_CLIENT_ID,
		scopes: ["email", "profile"],
		security: {
			trustLevel: "high",
			requireEmailVerification: true,
			riskFactors: ["privacy_focused"],
		},
		ui: {
			icon: "google",
			color: "hsl(var(--primary))",
			description: "Sign in with your Google account",
		},
	},
	github: {
		name: "github",
		displayName: "GitHub",
		enabled: !!process.env.GITHUB_CLIENT_ID,
		scopes: ["user:email"],
		security: {
			trustLevel: "high",
			requireEmailVerification: true,
			riskFactors: ["developer_account"],
		},
		ui: {
			icon: "github",
			color: "hsl(var(--foreground))",
			description: "Sign in with your GitHub account",
		},
	},
};

/**
 * Get enabled OAuth providers
 */
export function getEnabledProviders() {
	const startTime = performance.now();

	try {
		const enabledProviders = Object.values(OAUTH_PROVIDERS)
			.filter((provider) => provider.enabled)
			.map((provider) => ({
				...provider,
				securityScore: calculateProviderSecurityScore(provider),
				available: checkProviderAvailability(provider),
			}))
			.filter((provider) => provider.available)
			.sort((a, b) => b.securityScore - a.securityScore);

		const duration = performance.now() - startTime;
		logger.performance(`Provider enumeration completed in ${duration.toFixed(2)}ms`);

		return enabledProviders;
	} catch (error) {
		logger.error("Failed to get enabled providers:", error);
		return [];
	}
}

/**
 * Get provider configuration by name
 */
export function getProviderConfig(providerName) {
	const provider = OAUTH_PROVIDERS[providerName];

	if (!provider) {
		logger.warn(`Unknown OAuth provider: ${providerName}`);
		return null;
	}

	if (!provider.enabled) {
		logger.warn(`OAuth provider disabled: ${providerName}`);
		return null;
	}

	return {
		...provider,
		securityScore: calculateProviderSecurityScore(provider),
		available: checkProviderAvailability(provider),
	};
}

/**
 * Calculate security score for provider
 */
function calculateProviderSecurityScore(provider) {
	let score = 50; // Base score

	// Trust level scoring
	switch (provider.security.trustLevel) {
		case "high":
			score += 30;
			break;
		case "medium":
			score += 20;
			break;
		case "low":
			score += 10;
			break;
	}

	// Email verification requirement
	if (provider.security.requireEmailVerification) {
		score += 15;
	}

	// Risk factor penalties
	provider.security.riskFactors.forEach((factor) => {
		switch (factor) {
			case "social_media":
				score -= 5;
				break;
			case "gaming_platform":
				score -= 3;
				break;
			case "public_platform":
				score -= 7;
				break;
			case "developer_account":
				score += 5; // Actually increases trust
				break;
			case "privacy_focused":
				score += 10;
				break;
		}
	});

	return Math.max(0, Math.min(100, score));
}

/**
 * Check if provider is available
 */
function checkProviderAvailability(provider) {
	return provider.enabled;
}

export default {
	OAUTH_PROVIDERS,
	getEnabledProviders,
	getProviderConfig,
};

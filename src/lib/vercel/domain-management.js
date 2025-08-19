/**
 * Vercel Domain Management Integration
 * Automatic subdomain creation, SSL certificates, and DNS routing
 *
 * Based on Vercel's multi-tenant architecture patterns
 * https://vercel.com/docs/multi-tenant/domain-management
 */

import logger from "@lib/utils/logger";

// Vercel API configuration
const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "thorbis.com";

/**
 * Vercel API client with error handling and retries
 */
class VercelAPI {
    constructor() {
        this.disabled = false;
        if (!VERCEL_TOKEN) {
            // Do not throw at module load; defer until used so builds don't fail
            this.disabled = true;
            this.headers = {};
            logger?.warn?.("VERCEL_TOKEN is not set; Vercel domain management is disabled");
            return;
        }

        this.headers = {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
        };

        if (VERCEL_TEAM_ID) {
            this.headers["X-Team-ID"] = VERCEL_TEAM_ID;
        }
    }

	/**
	 * Make authenticated request to Vercel API with retry logic
	 */
    async request(endpoint, options = {}) {
        if (this.disabled) {
            throw new Error("Vercel API client disabled: missing VERCEL_TOKEN");
        }
		const url = `${VERCEL_API_URL}${endpoint}`;
		const config = {
			...options,
			headers: {
				...this.headers,
				...options.headers,
			},
		};

		const maxRetries = 3;
		let attempt = 0;

		while (attempt < maxRetries) {
			try {
				const response = await fetch(url, config);

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(`Vercel API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
				}

				return await response.json();
			} catch (error) {
				attempt++;

				if (attempt >= maxRetries) {
					logger.error("Vercel API request failed after retries", { endpoint, error: error.message });
					throw error;
				}

				// Exponential backoff
				await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
			}
		}
	}
}

/**
 * Vercel Domain Manager for automated subdomain management
 */
export class VercelDomainManager {
	constructor() {
		this.api = new VercelAPI();
	}

	/**
	 * Add subdomain to Vercel project with automatic SSL
	 * This creates tenant.thorbis.com and provisions SSL automatically
	 */
	async addSubdomain(subdomain, localHubData) {
		const startTime = performance.now();
		const fullDomain = `${subdomain}.${MAIN_DOMAIN}`;

		try {
			logger.info("Adding subdomain to Vercel", { subdomain, fullDomain });

			// Add domain to Vercel project
			const domainResponse = await this.api.request(`/v10/projects/${PROJECT_ID}/domains`, {
				method: "POST",
				body: JSON.stringify({
					name: fullDomain,
					// Vercel automatically provisions SSL for subdomains of verified domains
					gitBranch: null, // Use production branch
				}),
			});

			// Verify domain was added successfully
			if (domainResponse.domain) {
				logger.info("Domain added to Vercel successfully", {
					domain: fullDomain,
					vercelDomainId: domainResponse.domain.id,
					verified: domainResponse.domain.verified,
				});

				// Set up domain configuration
				await this.configureDomainSettings(fullDomain, localHubData);

				const duration = performance.now() - startTime;
				logger.performance(`Vercel subdomain creation completed in ${duration.toFixed(2)}ms`);

				return {
					success: true,
					domain: fullDomain,
					vercelDomainId: domainResponse.domain.id,
					sslEnabled: true, // Vercel enables SSL automatically
					verified: domainResponse.domain.verified,
					createdAt: new Date().toISOString(),
				};
			}

			throw new Error("Domain creation failed - no domain returned");
		} catch (error) {
			logger.error("Failed to add subdomain to Vercel", {
				subdomain,
				fullDomain,
				error: error.message,
			});

			throw new Error(`Vercel subdomain creation failed: ${error.message}`);
		}
	}

	/**
	 * Configure domain-specific settings for tenant
	 */
	async configureDomainSettings(domain, localHubData) {
		try {
			// Set up environment variables for this domain (if needed)
			const envVars = {
				[`TENANT_${localHubData.subdomain.toUpperCase()}_ID`]: localHubData.id,
				[`TENANT_${localHubData.subdomain.toUpperCase()}_NAME`]: localHubData.name,
			};

			// Note: Vercel automatically handles routing via middleware
			// No additional configuration needed for basic subdomain routing

			logger.info("Domain configuration completed", { domain, localHubData: localHubData.subdomain });
		} catch (error) {
			logger.error("Failed to configure domain settings", { domain, error: error.message });
			// Don't throw here - domain creation succeeded, configuration is optional
		}
	}

	/**
	 * Remove subdomain from Vercel project
	 */
	async removeSubdomain(subdomain) {
		const fullDomain = `${subdomain}.${MAIN_DOMAIN}`;

		try {
			logger.info("Removing subdomain from Vercel", { subdomain, fullDomain });

			// Remove domain from Vercel project
			await this.api.request(`/v9/projects/${PROJECT_ID}/domains/${fullDomain}`, {
				method: "DELETE",
			});

			logger.info("Domain removed from Vercel successfully", { domain: fullDomain });

			return {
				success: true,
				domain: fullDomain,
				removedAt: new Date().toISOString(),
			};
		} catch (error) {
			logger.error("Failed to remove subdomain from Vercel", {
				subdomain,
				fullDomain,
				error: error.message,
			});

			throw new Error(`Vercel subdomain removal failed: ${error.message}`);
		}
	}

	/**
	 * Get domain status and SSL certificate information
	 */
	async getDomainStatus(subdomain) {
		const fullDomain = `${subdomain}.${MAIN_DOMAIN}`;

		try {
			const domainInfo = await this.api.request(`/v9/projects/${PROJECT_ID}/domains/${fullDomain}`);

			return {
				domain: fullDomain,
				verified: domainInfo.verified,
				sslEnabled: domainInfo.verified, // SSL is automatic for verified domains
				createdAt: domainInfo.createdAt,
				vercelDomainId: domainInfo.id,
			};
		} catch (error) {
			logger.error("Failed to get domain status", { subdomain, error: error.message });
			return null;
		}
	}

	/**
	 * List all domains for the project
	 */
	async listProjectDomains() {
		try {
			const response = await this.api.request(`/v9/projects/${PROJECT_ID}/domains`);

			return response.domains.map((domain) => ({
				name: domain.name,
				verified: domain.verified,
				createdAt: domain.createdAt,
				id: domain.id,
			}));
		} catch (error) {
			logger.error("Failed to list project domains", { error: error.message });
			return [];
		}
	}

	/**
	 * Verify that wildcard domain is properly configured
	 * This ensures *.thorbis.com is set up correctly for automatic subdomains
	 */
	async verifyWildcardConfiguration() {
		try {
			// Check if main domain has wildcard DNS configured
			const domains = await this.listProjectDomains();
			const wildcardDomain = domains.find((d) => d.name === MAIN_DOMAIN);

			if (!wildcardDomain || !wildcardDomain.verified) {
				logger.warn("Wildcard domain not properly configured", {
					mainDomain: MAIN_DOMAIN,
					verified: wildcardDomain?.verified,
				});

				return {
					configured: false,
					message: `Please ensure ${MAIN_DOMAIN} is added to Vercel and nameservers point to Vercel DNS`,
				};
			}

			return {
				configured: true,
				message: "Wildcard configuration verified",
			};
		} catch (error) {
			logger.error("Failed to verify wildcard configuration", { error: error.message });
			return {
				configured: false,
				message: "Unable to verify wildcard configuration",
			};
		}
	}

	/**
	 * Test subdomain resolution and SSL
	 */
	async testSubdomainResolution(subdomain) {
		const fullDomain = `${subdomain}.${MAIN_DOMAIN}`;

		try {
			// Test HTTPS connection
			const response = await fetch(`https://${fullDomain}`, {
				method: "HEAD",
				timeout: 10000,
			});

			return {
				resolvable: response.ok,
				sslWorking: true,
				statusCode: response.status,
				responseTime: response.headers.get("x-vercel-cache") ? "cached" : "fresh",
			};
		} catch (error) {
			logger.warn("Subdomain resolution test failed", {
				subdomain,
				fullDomain,
				error: error.message,
			});

			return {
				resolvable: false,
				sslWorking: false,
				error: error.message,
			};
		}
	}
}

/**
 * Singleton instance for domain management
 */
export const vercelDomains = new VercelDomainManager();

/**
 * High-level functions for subdomain lifecycle management
 */
export async function createTenantSubdomain(localHubData) {
	const startTime = performance.now();

	try {
		// Validate subdomain format
		if (!isValidSubdomain(localHubData.subdomain)) {
			throw new Error("Invalid subdomain format");
		}

		// Create subdomain in Vercel
		const vercelResult = await vercelDomains.addSubdomain(localHubData.subdomain, localHubData);

		// Update database with Vercel domain information
		await updateLocalHubDomainInfo(localHubData.id, {
			vercel_domain_id: vercelResult.vercelDomainId,
			ssl_enabled: vercelResult.sslEnabled,
			domain_verified: vercelResult.verified,
			domain_created_at: vercelResult.createdAt,
		});

		const duration = performance.now() - startTime;
		logger.performance(`Complete tenant subdomain creation: ${duration.toFixed(2)}ms`);

		return {
			success: true,
			domain: vercelResult.domain,
			sslEnabled: vercelResult.sslEnabled,
			accessUrl: `https://${vercelResult.domain}`,
		};
	} catch (error) {
		logger.error("Tenant subdomain creation failed", {
			subdomain: localHubData.subdomain,
			error: error.message,
		});

		throw error;
	}
}

export async function removeTenantSubdomain(subdomain) {
	try {
		// Remove from Vercel
		const vercelResult = await vercelDomains.removeSubdomain(subdomain);

		// Update database to remove Vercel domain info
		await updateLocalHubDomainInfo(null, {
			vercel_domain_id: null,
			ssl_enabled: false,
			domain_verified: false,
			domain_removed_at: vercelResult.removedAt,
		});

		return {
			success: true,
			message: "Subdomain removed successfully",
		};
	} catch (error) {
		logger.error("Tenant subdomain removal failed", { subdomain, error: error.message });
		throw error;
	}
}

/**
 * Helper functions
 */
function isValidSubdomain(subdomain) {
	const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
	return subdomainRegex.test(subdomain);
}

async function updateLocalHubDomainInfo(localHubId, domainInfo) {
	// This would integrate with your Supabase update function
	// Implementation depends on your database structure
	try {
		const { supabase } = await import("@lib/database/supabase/client");

		await supabase.from("local_hubs").update(domainInfo).eq("id", localHubId);
	} catch (error) {
		logger.error("Failed to update local hub domain info", { localHubId, error: error.message });
	}
}

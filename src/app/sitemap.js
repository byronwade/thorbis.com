import { headers } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import { BusinessDataFetchers } from "@lib/database/supabase/server";

// Refresh sitemap daily via ISR (experimental high-reward freshness)
export const revalidate = 86400; // 24 hours (60 * 60 * 24)

export default async function sitemap() {
	const headersList = headers();
	let domain = headersList.get("host");

	if (domain === "localhost:3000" || domain.endsWith(".vercel.app")) {
		console.log(domain);
	}

	const paths = [
		"/",
		"/industries",
		"/academy-learning-platform",
		"/admin-operations-console",
		"/agriculture-management-software",
		"/automotive-shop-software",
		"/beauty-salon-software",
		"/business-management-platform",
		"/construction-management-software",
		"/ecommerce-operations-platform",
		"/energy-services-software",
		"/field-management-software",
		"/fitness-studio-software",
		"/healthcare-operations-platform",
		"/hospitality-operations-platform",
		"/localhub-marketplace-platform",
		"/logistics-operations-platform",
		"/nonprofit-operations-platform",
		"/professional-services-platform",
		"/property-management-platform",
		"/real-estate-operations-platform",
		"/retail-operations-platform",
	];

	// Priority category and location coverage (mirrors category static params)
	const PRIORITY_CATEGORIES = ["restaurants", "plumbing", "electrician", "dentist", "hair-salon", "auto-repair"];
	const PRIORITY_LOCATIONS = ["new-york", "los-angeles", "chicago", "houston", "san-francisco"];

	for (const c of PRIORITY_CATEGORIES) paths.push(`/categories/${c}`);
	for (const l of PRIORITY_LOCATIONS) paths.push(`/categories/${l}`);

	// Include latest blog posts (filesystem, zero DB cost)
	try {
		const blogDir = path.join(process.cwd(), "src", "app", "(site)", "blog");
		const entries = await fs.readdir(blogDir, { withFileTypes: true });
		const postDirs = entries.filter((e) => e.isDirectory());
		if (postDirs.length) {
			// Best-effort: treat directories under blog as routes; skip heavy reads
			// If directory is [slug], we rely on runtime slugs; otherwise map static dirs
			if (!postDirs.find((e) => e.name === "[slug]")) {
				for (const dir of postDirs) {
					paths.push(`/blog/${dir.name}`);
				}
			}
		}
	} catch {}

	// Note: business/category dynamic URLs can be added with a cheap cache later
	try {
		// Low-cost, cached fetch of recent businesses (limit small). If fails, skip silently.
		const { data: recent } = await BusinessDataFetchers.searchBusinesses({ limit: 50, offset: 0, featured: true });
		if (recent?.businesses?.length) {
			for (const b of recent.businesses) {
				if (b?.slug) {
					// Validate required business data for URL generation
					if (b.country && b.state && b.city && b.name) {
						const country = (b.country || 'US').toLowerCase();
						const state = (b.state || '').toLowerCase();
						const city = (b.city || '').toLowerCase();
						const namePart = (b.name || b.slug || '')
							.toLowerCase()
							.replace(/&/g, ' and ')
							.replace(/[^a-z0-9\s-]/g, '')
							.replace(/\s+/g, '-')
							.replace(/-+/g, '-')
							.trim();
						const suffix = b.short_id || b.shortId ? `-${b.short_id || b.shortId}` : '';
						paths.push(`/${country}/${state}/${city}/${namePart}${suffix}`);
					}
				}
			}
		}
	} catch {}

	return paths.map((p) => ({ url: `https://${domain}${p}`, lastModified: new Date() }));
}

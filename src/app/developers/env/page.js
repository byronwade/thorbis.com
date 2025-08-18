import Link from "next/link";
import { evaluateAllFlags } from "@/lib/flags/server";
import { flagDocs } from "@/lib/flags/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";

export const metadata = {
	title: "Environment & Feature Flags – Developer View | Thorbis",
	description: "Resolved feature flags and public environment variables for the current deployment.",
	openGraph: {
		title: "Environment & Feature Flags – Developer View",
		description: "Resolved feature flags and public environment variables for the current deployment.",
		url: "https://thorbis.com/developers/env",
		type: "website",
	},
	alternates: { canonical: "https://thorbis.com/developers/env" },
};

function PublicEnvRow({ k, v }) {
	return (
		<tr className="border-b last:border-0">
			<td className="px-4 py-2 font-mono text-xs align-top text-muted-foreground">{k}</td>
			<td className="px-4 py-2 font-mono text-xs break-all">{v ?? ""}</td>
		</tr>
	);
}

export default async function EnvPage() {
	const flags = await evaluateAllFlags();

	// Public env variables only (NEXT_PUBLIC_*)
	const publicKeys = [
		"NEXT_PUBLIC_FLAG_NEW_NAV",
		"NEXT_PUBLIC_FLAG_LINKEDIN_CLONE",
		"NEXT_PUBLIC_FLAG_JOBS_APP",
		"NEXT_PUBLIC_FLAG_AFFILIATES",
		"NEXT_PUBLIC_FLAG_LANDING_PAGES",
		"NEXT_PUBLIC_FLAG_BUSINESS_CERTIFICATION",
		"NEXT_PUBLIC_FLAG_INVESTOR_RELATIONS",
		"NEXT_PUBLIC_FLAG_ABOUT_US",
		// Common public config
		"NEXT_PUBLIC_SUPABASE_URL",
		"NEXT_PUBLIC_SUPABASE_ANON_KEY",
		"NEXT_PUBLIC_APP_URL",
		"NEXT_PUBLIC_API_URL",
		"NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN",
		"NEXT_PUBLIC_MAPBOX_STYLE_URL",
		"NEXT_PUBLIC_ALGOLIA_APP_ID",
		"NEXT_PUBLIC_ALGOLIA_SEARCH_KEY",
		"NEXT_PUBLIC_POSTHOG_KEY",
		"NEXT_PUBLIC_POSTHOG_HOST",
		"NEXT_PUBLIC_GA_MEASUREMENT_ID",
	];

	const publicEnv = publicKeys.map((k) => [k, process.env[k]]);

	const edgeConfigSignals = ["EDGE_CONFIG", "NEXT_PUBLIC_EDGE_CONFIG", "VERCEL_EDGE_CONFIG", "VERCEL", "VERCEL_ENV"].map((k) => [k, process.env[k] ? "set" : "unset"]);

	const recommendedEdgeConfigJSON = {
		"feature:new-navigation": false,
		"feature:linkedin-clone": true,
		"feature:jobs-app": true,
		"feature:affiliates": true,
		"feature:landing-pages": true,
		"feature:business-certification": true,
		"feature:investor-relations": true,
		"feature:about-us": true,
	};

	return (
		<main className="w-full min-h-screen bg-background">
			<section className="container px-4 py-10 mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold tracking-tight">Environment & Feature Flags</h1>
					<p className="mt-1 text-muted-foreground">Server‑resolved flags and public environment variables for the current deployment.</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Resolved Feature Flags</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-2">
								{flagDocs.map((doc) => (
									<div key={doc.key} className="flex justify-between items-center px-3 py-2 rounded border">
										<div>
											<div className="font-mono text-xs text-muted-foreground">{doc.key}</div>
											<div className="text-xs text-muted-foreground">{doc.description}</div>
										</div>
										<Badge variant={flags[doc.key] ? "default" : "secondary"}>{flags[doc.key] ? "on" : "off"}</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Edge Config Signals</CardTitle>
						</CardHeader>
						<CardContent>
							<table className="w-full text-sm">
								<tbody>
									{edgeConfigSignals.map(([k, v]) => (
										<tr key={k} className="border-b last:border-0">
											<td className="px-4 py-2 font-mono text-xs align-top text-muted-foreground">{k}</td>
											<td className="px-4 py-2 font-mono text-xs">{v}</td>
										</tr>
									))}
								</tbody>
							</table>
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-6 mt-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Public Environment Variables (NEXT_PUBLIC_*)</CardTitle>
						</CardHeader>
						<CardContent>
							<table className="w-full text-sm">
								<tbody>
									{publicEnv.map(([k, v]) => (
										<PublicEnvRow key={String(k)} k={String(k)} v={typeof v === "string" ? v : ""} />
									))}
								</tbody>
							</table>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recommended Edge Config Keys</CardTitle>
						</CardHeader>
						<CardContent>
							<pre className="overflow-x-auto p-3 text-xs rounded bg-muted">{JSON.stringify(recommendedEdgeConfigJSON, null, 2)}</pre>
							<p className="mt-2 text-xs text-muted-foreground">Manage via Vercel → Storage → Edge Config. Keys are read at the edge for SSR decisions. You can also override with NEXT_PUBLIC_FLAG_* envs during development.</p>
							<div className="mt-3 text-xs">
								<Link className="underline" href="/api/flags">
									View current flags JSON
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}

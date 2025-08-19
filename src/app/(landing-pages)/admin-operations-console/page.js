export const metadata = {
	title: "Admin Operations Console – Multi-Tenant Controls & Security | Thorbis",
	description: "Centralized administration: user roles, permissions, audit logs, billing, and platform-wide settings with enterprise-grade security.",
	keywords: ["admin console", "multi-tenant administration", "role-based access control", "RBAC", "audit logs", "billing management", "SAML SSO", "org policies"],
	alternates: { canonical: "https://thorbis.com/admin-operations-console" },
	openGraph: {
		title: "Admin Operations Console – Control & Compliance",
		description: "Manage roles, permissions, billing, and security from one console.",
		type: "website",
		url: "https://thorbis.com/admin-operations-console",
		siteName: "Thorbis",
		images: [
			{
				url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent("Admin Operations Console")}&description=${encodeURIComponent("Manage roles, permissions, billing, and security from one console.")}`,
				width: 1200,
				height: 630,
				alt: "Thorbis Admin Operations Console",
			},
		],
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Admin Operations Console – Control & Compliance",
		description: "Manage roles, permissions, billing, and security from one console.",
		images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent("Admin Operations Console")}`],
		creator: "@thorbis",
		site: "@thorbis",
	},
};

import { Star } from "lucide-react";

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Admin Operations Console",
		description: "Centralized multi-tenant administration for roles, billing, and security.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com" },
			{ "@type": "ListItem", position: 2, name: "Admin Operations Console", item: "https://thorbis.com/admin-operations-console" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function AdminOperationsConsole() {
	const features = [
		{ title: "Role-Based Access", points: ["Granular permissions", "Audit-friendly logs"] },
		{ title: "Billing & Subscriptions", points: ["Usage insights", "Team-based billing"] },
		{ title: "Security Controls", points: ["SAML/SSO", "Org policies"] },
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<JsonLd />
			<BreadcrumbsJsonLd />
			{/* Social Proof */}
			<section className="px-4 py-4 mx-auto max-w-6xl">
				<div className="flex flex-col items-center gap-2 text-center">
					<div className="flex items-center gap-1 text-amber-500" aria-label="rating 4.9 out of 5">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
						))}
					</div>
					<p className="text-sm text-muted-foreground">Enterprise trust • 4.9/5 average satisfaction</p>
				</div>
			</section>
			<section className="max-w-6xl mx-auto text-center space-y-4">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Admin Operations Console</h1>
				<p className="text-muted-foreground max-w-3xl mx-auto">Control users, billing, and security across your organization.</p>
				<div className="flex items-center justify-center gap-3">
					<a href="/contact" className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-white font-semibold hover:bg-primary">
						Talk to sales
					</a>
					<a href="/signup" className="inline-flex items-center rounded-md border px-5 py-3 font-semibold hover:bg-accent">
						Start free
					</a>
				</div>
			</section>

			<section className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
				{features.map((f) => (
					<div key={f.title} className="rounded-xl border p-6 bg-card">
						<h3 className="font-bold text-lg mb-2">{f.title}</h3>
						<ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
							{f.points.map((p) => (
								<li key={p}>{p}</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* CTA */}
			<section className="max-w-6xl mx-auto mt-16">
				<div className="rounded-2xl bg-primary text-primary-foreground p-8 text-center">
					<h2 className="text-3xl font-bold">Control, compliance, and clarity</h2>
					<p className="mt-2 opacity-90">Unify roles, billing, and security with audit‑ready controls.</p>
					<div className="mt-6 flex items-center justify-center gap-3">
						<a href="/contact" className="inline-flex items-center rounded-md bg-white text-primary px-5 py-3 font-semibold hover:bg-white/90">
							Talk to sales
						</a>
						<a href="/signup" className="inline-flex items-center rounded-md border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">
							Start free
						</a>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="max-w-6xl mx-auto mt-16">
				<h2 className="text-2xl font-bold text-center">Frequently asked questions</h2>
				<div className="mt-6 grid gap-6 md:grid-cols-2">
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Do you support SSO and SAML?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Enterprise authentication with SSO/SAML and role mapping.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Is there an audit log?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Full audit trails for user and admin actions.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">How granular are permissions?</div>
						<p className="mt-2 text-sm text-muted-foreground">Fine‑grained RBAC with organization, team, and resource scopes.</p>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="font-semibold">Can I export billing usage?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes. Exportable usage and invoice data for reconciliation.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Do you support SSO and SAML?", acceptedAnswer: { "@type": "Answer", text: "Yes. Enterprise authentication with SSO/SAML and role mapping." } },
								{ "@type": "Question", name: "Is there an audit log?", acceptedAnswer: { "@type": "Answer", text: "Yes. Full audit trails for user and admin actions." } },
								{ "@type": "Question", name: "How granular are permissions?", acceptedAnswer: { "@type": "Answer", text: "Fine‑grained RBAC with organization, team, and resource scopes." } },
								{ "@type": "Question", name: "Can I export billing usage?", acceptedAnswer: { "@type": "Answer", text: "Yes. Exportable usage and invoice data for reconciliation." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}

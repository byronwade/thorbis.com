import { getDictionary, languages } from '@/lib/i18n/dictionaries';

// Generate internationalized metadata
export async function generateMetadata({ params, searchParams }) {
	const locale = 'en'; // Default to English for now
	const dict = await getDictionary(locale);
	
	// Get landing pages translations with fallbacks
	const fieldTranslations = dict.landingPages?.fieldManagement || {};
	const commonTranslations = dict.landingPages?.common || {};
	
	const title = fieldTranslations.hero?.title || "Field Management Software – Scheduling, Invoicing, CRM, Automations";
	const description = fieldTranslations.hero?.subtitle || "All‑in‑one field service platform: real‑time scheduling, dispatch, mobile app, proposals, invoicing, payments, CRM, memberships, inventory, analytics, automations.";
	const shortDescription = fieldTranslations.hero?.description || "Replace point tools with one fast platform for jobs, teams, customers, and cash flow.";
	
	// Generate alternate language URLs
	const alternateLanguages = {};
	Object.keys(languages).forEach(lang => {
		alternateLanguages[`${lang}-${lang.toUpperCase()}`] = `https://thorbis.com/${lang}/field-management-software`;
	});

	return {
		title: title,
		description: description,
		keywords: ["field management software", "field service management", "FSM platform", "scheduling and dispatch", "job management", "invoicing and payments", "CRM for contractors", "service business software"],
		alternates: { 
			canonical: `https://thorbis.com/${locale}/field-management-software`,
			languages: alternateLanguages,
		},
		openGraph: {
			title: title,
			description: shortDescription,
			type: "website",
			url: `https://thorbis.com/${locale}/field-management-software`,
			siteName: "Thorbis",
			images: [
				{
					url: `https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(shortDescription)}`,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
			locale: `${locale}_${locale.toUpperCase()}`,
		},
		twitter: {
			card: "summary_large_image",
			title: title,
			description: shortDescription,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
			creator: "@thorbis",
			site: "@thorbis",
		},
	};
}

function JsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Field Management Software",
		description: "All‑in‑one platform for scheduling, dispatch, proposals, invoicing, payments, CRM, memberships, inventory, and analytics.",
		brand: { "@type": "Brand", name: "Thorbis" },
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "214" },
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbsJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com" },
			{ "@type": "ListItem", position: 2, name: "Field Management Software", item: "https://thorbis.com/field-management-software" },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function CheckIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20 6 9 17l-5-5" />
		</svg>
	);
}

function XIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M18 6 6 18M6 6l12 12" />
		</svg>
	);
}

function InfoIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</svg>
	);
}

function VendorBadge({ label, bgClass, textClass, initials }) {
	return (
		<div className="flex gap-2 justify-center items-center">
			<span className={`inline-flex justify-center items-center w-6 h-6 font-bold rounded-full text-[10px] ${bgClass} ${textClass}`}>{initials}</span>
			<span className="font-medium whitespace-nowrap">{label}</span>
		</div>
	);
}

function Yes() {
	return (
		<span className="inline-flex justify-center items-center" aria-label="Yes">
			<CheckIcon />
		</span>
	);
}

function No() {
	return (
		<span className="inline-flex justify-center items-center" aria-label="No">
			<XIcon />
		</span>
	);
}

function ComparisonTable() {
	const headers = [
		{ key: "thorbis", label: "Thorbis", initials: "T", bgClass: "bg-primary", textClass: "text-white" },
		{ key: "servicetitan", label: "ServiceTitan", initials: "ST", bgClass: "bg-neutral-800", textClass: "text-white" },
		{ key: "housecallpro", label: "Housecall Pro", initials: "HP", bgClass: "bg-sky-600", textClass: "text-white" },
		{ key: "jobber", label: "Jobber", initials: "J", bgClass: "bg-emerald-700", textClass: "text-white" },
		{ key: "fieldpulse", label: "FieldPulse", initials: "FP", bgClass: "bg-indigo-700", textClass: "text-white" },
	];

	const featureTooltips = {
		"Real-time scheduling": "Live calendar updates and conflict prevention across teams.",
		"Drag-drop calendar": "Quickly reschedule jobs by dragging between times/techs.",
		"Route optimization": "Minimizes drive time and fuel cost with optimal routes.",
		"Mobile app (offline)": "Capture notes/photos and time tracking without signal.",
		"Good–Better–Best proposals": "Present tiered options to increase average ticket size.",
		eSignature: "Customer signs estimates and approvals digitally.",
		"One‑tap payments (card/ACH)": "Collect payment in the field or customer portal.",
		"Memberships & dunning": "Auto renewals, retry logic, and recovery workflows.",
		"Inventory (multi‑location)": "Track stock across warehouse, trucks, and transfers.",
		"Purchase orders & returns": "Issue POs, receive, and manage returns/adjustments.",
		"CSR console (calls)": "Call handling with screen‑pop, recordings, and outcomes.",
		"2‑way SMS": "Text with customers from desktop and mobile, stay in thread.",
		"Call recordings": "Quality control and coaching from recorded calls.",
		"Tech scorecards": "KPIs for performance: conversion, upsell, on‑time, etc.",
		"Job profit analytics": "Track margin by job, tech, category, or time period.",
		Forecasting: "Forward‑looking demand and revenue projections.",
		"Automations (AI)": "Trigger campaigns, scheduling, and suggestions automatically.",
		"API & integrations": "Connect accounting, payments, and third‑party tools.",
		"Leads from marketplace": "Inbound jobs from consumer discovery flow directly to schedule.",
		"Pricing transparency": "Show upfront pricing or ranges to improve conversion.",
		"Customer portal": "Customers can review past jobs, pay, and schedule follow‑ups.",
		"Financing options": "Offer financing for large tickets to boost close rates.",
		"Accounting sync (QBO/Intacct)": "Two‑way sync for invoices, payments, and GL.",
	};

	const rows = [
		{ feature: "Real-time scheduling", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "Drag-drop calendar", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "Route optimization", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: false, fieldpulse: true } },
		{ feature: "Mobile app (offline)", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: false, fieldpulse: true } },
		{ feature: "Good–Better–Best proposals", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "eSignature", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "One‑tap payments (card/ACH)", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "Memberships & dunning", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: false, fieldpulse: true } },
		{ feature: "Inventory (multi‑location)", values: { thorbis: true, servicetitan: true, housecallpro: false, jobber: false, fieldpulse: true } },
		{ feature: "Purchase orders & returns", values: { thorbis: true, servicetitan: true, housecallpro: false, jobber: false, fieldpulse: true } },
		{ feature: "CSR console (calls)", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: false, fieldpulse: false } },
		{ feature: "2‑way SMS", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "Call recordings", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: false, fieldpulse: false } },
		{ feature: "Tech scorecards", values: { thorbis: true, servicetitan: true, housecallpro: false, jobber: false, fieldpulse: true } },
		{ feature: "Job profit analytics", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: false, fieldpulse: true } },
		{ feature: "Forecasting", values: { thorbis: true, servicetitan: true, housecallpro: false, jobber: false, fieldpulse: true } },
		{ feature: "Automations (AI)", values: { thorbis: true, servicetitan: true, housecallpro: false, jobber: false, fieldpulse: true } },
		{ feature: "API & integrations", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "Leads from marketplace", values: { thorbis: true, servicetitan: false, housecallpro: false, jobber: false, fieldpulse: false } },
		{ feature: "Pricing transparency", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "Customer portal", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: true, fieldpulse: true } },
		{ feature: "Financing options", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: false, fieldpulse: true } },
		{ feature: "Accounting sync (QBO/Intacct)", values: { thorbis: true, servicetitan: true, housecallpro: true, jobber: false, fieldpulse: false } },
	];

	return (
		<section className="mx-auto mt-12 max-w-6xl" aria-labelledby="feature-comparison">
			<h3 id="feature-comparison" className="mb-4 text-xl font-bold">
				Feature comparison
			</h3>
			<div className="overflow-x-auto rounded-xl border" style={{ ["--sticky-top"]: "88px" }}>
				<table className="min-w-full text-sm">
					<thead className="text-left bg-accent/40">
						<tr>
							<th className="px-4 py-3 font-semibold sticky left-0 z-50 min-w-[240px] bg-white dark:bg-neutral-900" style={{ top: "var(--sticky-top)" }}>
								Feature
							</th>
							{headers.map((h) => (
								<th key={h.key} className={`px-4 py-3 font-semibold text-center whitespace-nowrap sticky ${h.key === "thorbis" ? "left-[240px] z-[60] bg-white dark:bg-neutral-900" : "z-50 bg-accent/40 dark:bg-neutral-900"}'} style={{ top: "var(--sticky-top)" }}>
									<VendorBadge label={h.label} initials={h.initials} bgClass={h.bgClass} textClass={h.textClass} />
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y">
						{rows.map((row) => (
							<tr key={row.feature} className="bg-card/50">
								<td className="px-4 py-3 whitespace-pre-wrap sticky left-0 z-10 min-w-[240px] bg-white dark:bg-neutral-900">
									<span title={featureTooltips[row.feature] || undefined} className="inline-flex gap-2 items-center">
										<span>{row.feature}</span>
										{featureTooltips[row.feature] ? <InfoIcon /> : null}
									</span>
								</td>
								{headers.map((h) => (
									<td key={h.key} className={'px-4 py-3 text-center ${h.key === "thorbis" ? "sticky left-[240px] z-10 bg-white dark:bg-neutral-900" : ""}'}>
										{row.values[h.key] ? <Yes /> : <No />}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<p className="mt-2 text-xs text-muted-foreground">Feature availability may vary by plan. Logos and trademarks belong to their respective owners.</p>
		</section>
	);
}

export default function FieldManagementSoftware() {
	const features = [
		{ title: "Real‑time Scheduling & Dispatch", points: ["Drag‑drop calendar", "Route optimization", "Capacity planning"] },
		{ title: "Mobile App for Techs", points: ["Offline notes/photos", "Checklists", "Time tracking"] },
		{ title: "Proposals & Invoicing", points: ["Good‑Better‑Best options", "eSignature", "One‑tap payments"] },
		{ title: "Payments & Financing", points: ["Card/ACH", "Surcharges", "QuickBooks/Sage sync"] },
		{ title: "CRM & Communication", points: ["CSR console", "Call recordings", "2‑way SMS"] },
		{ title: "Memberships & Dunning", points: ["Auto‑renewals", "Billing retries", "Churn insights"] },
		{ title: "Inventory & Purchasing", points: ["Multi‑location", "Cycle counts", "Vendor catalogs"] },
		{ title: "Analytics & Scorecards", points: ["Tech scorecards", "Job profit", "Forecasting"] },
		{ title: "Automations (AI)", points: ["Review requests", "Auto‑scheduling", "Sales suggestions"] },
	];

	const competitors = [
		{ name: "ServiceTitan", pros: ["Enterprise depth"], gaps: ["High cost", "Heavy UI"], ideal: "200+ users" },
		{ name: "Housecall Pro", pros: ["Simple"], gaps: ["Limited ops"], ideal: "1–25 users" },
		{ name: "Jobber", pros: ["Clean UI"], gaps: ["Basic inventory"], ideal: "1–25 users" },
		{ name: "FieldPulse", pros: ["Affordable"], gaps: ["Fewer integrations"], ideal: "1–50 users" },
	];

	return (
		<main className="px-4 py-10 w-full min-h-screen bg-white dark:bg-neutral-900 sm:px-6 lg:px-8">
			<JsonLd />
			<BreadcrumbsJsonLd />

			{/* Hero */}
			<section className="mx-auto space-y-4 max-w-6xl text-center">
				<h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Field Management Software</h1>
				<p className="mx-auto max-w-3xl text-muted-foreground">Run jobs, teams, and cash flow in one fast platform. Fewer tabs. Fewer clicks. More revenue.</p>
				<div className="flex gap-3 justify-center items-center">
					<a href="/signup" className="inline-flex items-center px-5 py-3 font-semibold text-white bg-primary rounded-md hover:bg-primary">
						Start free
					</a>
					<a href="/contact" className="inline-flex items-center px-5 py-3 font-semibold rounded-md border hover:bg-accent">
						Schedule demo
					</a>
				</div>
			</section>

			{/* Feature grid */}
			<section className="grid grid-cols-1 gap-6 mx-auto mt-12 max-w-6xl md:grid-cols-2 lg:grid-cols-3">
				{features.map((f) => (
					<div key={f.title} className="p-6 rounded-xl border bg-card">
						<h3 className="mb-2 text-lg font-bold">{f.title}</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							{f.points.map((p) => (
								<li key={p}>{p}</li>
							))}
						</ul>
					</div>
				))}
			</section>

			{/* Comparison (concise) */}
			<section className="mx-auto mt-16 max-w-6xl">
				<h2 className="mb-4 text-2xl font-bold">How we compare</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{competitors.map((c) => (
						<div key={c.name} className="p-4 rounded-xl border">
							<div className="font-semibold">{c.name}</div>
							<div className="mt-2 text-sm">
								<div>
									<span className="font-medium">Pros:</span> {c.pros.join(", ")}
								</div>
								<div>
									<span className="font-medium">Gaps:</span> {c.gaps.join(", ")}
								</div>
								<div>
									<span className="font-medium">Best for:</span> {c.ideal}
								</div>
							</div>
						</div>
					))}
				</div>
				<p className="mt-3 text-sm text-muted-foreground">We focus on speed, clarity, and powerful ops at SMB-friendly pricing.</p>
				<ComparisonTable />
			</section>

			{/* Detailed Walkthrough */}
			<section className="mx-auto mt-16 space-y-10 max-w-6xl" id="walkthrough">
				<h2 className="text-2xl font-bold">Product walkthrough</h2>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div className="p-6 rounded-xl border">
						<h3 className="mb-2 text-lg font-semibold">1) Scheduling & Dispatch</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Drag‑drop calendar, route optimization, travel time, breaks</li>
							<li>Capacity planning (teams, shifts, time‑off)</li>
							<li>Auto‑assign by skills, zones, or availability</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border">
						<h3 className="mb-2 text-lg font-semibold">2) CSR Console</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Inbound calls with IVR whisper; screen‑pop customer history</li>
							<li>Book jobs in seconds with address/issue templates</li>
							<li>Call recordings, outcomes, conversion tracking</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border">
						<h3 className="mb-2 text-lg font-semibold">3) Job Execution</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Mobile app: offline notes, photos, checklists, time tracking</li>
							<li>Parts usage, warranty capture, signatures</li>
							<li>Tech scorecards, drive/onsite time, completion quality</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border">
						<h3 className="mb-2 text-lg font-semibold">4) Estimates & Proposals</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Good‑Better‑Best templates, pricebook versions</li>
							<li>eSignature approvals, financing options</li>
							<li>Follow‑ups automation with SMS/email</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border">
						<h3 className="mb-2 text-lg font-semibold">5) Invoicing & Payments</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							<li>One‑tap payments (card/ACH), surcharges</li>
							<li>Accounting sync (QuickBooks, Sage Intacct)</li>
							<li>Deposits, progress billing, retainage</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border">
						<h3 className="mb-2 text-lg font-semibold">6) Memberships & Dunning</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Auto‑renewals, billing retries, dunning workflows</li>
							<li>Seasonal tune‑ups, benefit tracking, renewals pipeline</li>
							<li>Revenue recognition, cohort churn analytics</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border">
						<h3 className="mb-2 text-lg font-semibold">7) Inventory & Purchasing</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Multi‑location, cycle counts, transfers</li>
							<li>Vendor catalogs, purchase orders, returns & adjustments</li>
							<li>Warranty parts, barcode support</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border">
						<h3 className="mb-2 text-lg font-semibold">8) Analytics & Automations</h3>
						<ul className="pl-5 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Tech scorecards, job profit, forecasting, heatmaps</li>
							<li>Automations: review requests, AI scheduling, sales suggestions</li>
							<li>Custom report builder; export & scheduled delivery</li>
						</ul>
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section className="mx-auto mt-16 max-w-6xl" id="pricing">
				<h2 className="mb-6 text-2xl font-bold">Simple pricing</h2>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="p-6 rounded-xl border bg-card">
						<div className="text-lg font-semibold">Starter</div>
						<div className="mt-2 text-3xl font-extrabold">$0</div>
						<ul className="pl-5 mt-4 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Scheduling & basic CRM</li>
							<li>Estimates & invoices</li>
							<li>1 location, 2 techs</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="text-lg font-semibold">Pro</div>
						<div className="mt-2 text-3xl font-extrabold">$199</div>
						<ul className="pl-5 mt-4 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Dispatch, proposals, payments</li>
							<li>Memberships & dunning</li>
							<li>Inventory, basic automations</li>
						</ul>
					</div>
					<div className="p-6 rounded-xl border bg-card">
						<div className="text-lg font-semibold">Scale</div>
						<div className="mt-2 text-3xl font-extrabold">Custom</div>
						<ul className="pl-5 mt-4 space-y-1 text-sm list-disc text-muted-foreground">
							<li>Advanced automations & APIs</li>
							<li>Multi‑location, advanced analytics</li>
							<li>Dedicated onboarding</li>
						</ul>
					</div>
				</div>
				<div className="flex gap-3 mt-6">
					<a href="/contact" className="inline-flex items-center px-5 py-3 font-semibold text-white bg-primary rounded-md hover:bg-primary">
						Talk to sales
					</a>
					<a href="/signup" className="inline-flex items-center px-5 py-3 font-semibold rounded-md border hover:bg-accent">
						Start free
					</a>
				</div>
			</section>

			{/* FAQ */}
			<section className="mx-auto mt-16 max-w-6xl" id="faq">
				<h2 className="mb-4 text-2xl font-bold">Frequently asked questions</h2>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="p-6 rounded-xl border">
						<div className="font-semibold">Can I import from Jobber/Housecall Pro?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes — customers, pricebook, and scheduled jobs via CSV/API.</p>
					</div>
					<div className="p-6 rounded-xl border">
						<div className="font-semibold">Do you support financing and surcharges?</div>
						<p className="mt-2 text-sm text-muted-foreground">Yes — card/ACH with optional surcharges and financing options.</p>
					</div>
					<div className="p-6 rounded-xl border">
						<div className="font-semibold">Does it work offline for techs?</div>
						<p className="mt-2 text-sm text-muted-foreground">Tech app supports offline notes, photos, and checklists.</p>
					</div>
					<div className="p-6 rounded-xl border">
						<div className="font-semibold">Which accounting tools do you integrate?</div>
						<p className="mt-2 text-sm text-muted-foreground">QuickBooks and Sage Intacct — with two‑way sync.</p>
					</div>
				</div>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{ "@type": "Question", name: "Can I import from Jobber/Housecall Pro?", acceptedAnswer: { "@type": "Answer", text: "Yes — customers, pricebook, and scheduled jobs via CSV/API." } },
								{ "@type": "Question", name: "Do you support financing and surcharges?", acceptedAnswer: { "@type": "Answer", text: "Yes — card/ACH with optional surcharges and financing options." } },
								{ "@type": "Question", name: "Does it work offline for techs?", acceptedAnswer: { "@type": "Answer", text: "Tech app supports offline notes, photos, and checklists." } },
								{ "@type": "Question", name: "Which accounting tools do you integrate?", acceptedAnswer: { "@type": "Answer", text: "QuickBooks and Sage Intacct — with two‑way sync." } },
								{ "@type": "Question", name: "Is there a mobile app?", acceptedAnswer: { "@type": "Answer", text: "Yes — iOS and Android with offline support for notes, photos, and checklists." } },
							],
						}),
					}}
				/>
			</section>
		</main>
	);
}

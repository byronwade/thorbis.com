// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Financial Services Platform – Client Management, Compliance, Portfolio Tracking | Thorbis",
		description: "Comprehensive financial services management with client relationship management, compliance tracking, and portfolio analysis tools.",
		path: "/financial-services-platform",
		keywords: ["financial services software", "wealth management platform", "financial advisor tools", "compliance management", "portfolio tracking"],
	});
}

import { DollarSign, Shield, TrendingUp } from "lucide-react";

import { generateStaticPageMetadata } from "@/utils/server-seo";

export default function FinancialServicesPlatform() {
	const features = [
		{ 
			title: "Client Relationship Management", 
			points: ["Client onboarding", "Communication tracking", "Meeting scheduling"],
			icon: DollarSign
		},
		{ 
			title: "Compliance & Regulatory", 
			points: ["Regulatory reporting", "Audit trails", "Risk assessment"],
			icon: Shield
		},
		{ 
			title: "Portfolio Management", 
			points: ["Investment tracking", "Performance analytics", "Risk analysis"],
			icon: TrendingUp
		},
	];

	return (
		<main className="min-h-screen w-full bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-10">
			<section className="max-w-6xl mx-auto text-center space-y-6">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Financial Services Platform
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Complete financial services management with client relationship tools, compliance tracking, and portfolio analysis for financial advisors and firms.
				</p>
				<div className="flex items-center justify-center gap-4 pt-4">
					<a href="/signup" className="inline-flex items-center rounded-md bg-teal-600 px-6 py-3 text-white font-semibold hover:bg-teal-700 transition-colors">
						Start Free Trial
					</a>
				</div>
			</section>

			<section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<div key={feature.title} className="rounded-xl border p-6 bg-card hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 mb-4">
							<feature.icon className="w-8 h-8 text-teal-600" />
							<h3 className="font-bold text-lg">{feature.title}</h3>
						</div>
					</div>
				))}
			</section>
		</main>
	);
}

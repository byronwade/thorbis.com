import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { DollarSign, Target } from "lucide-react";

/**
 * Reusable ROI calculator component for comparison pages
 * @param {Object} props
 * @param {string} props.title - Calculator section title
 * @param {string} props.subtitle - Calculator section subtitle
 * @param {Object} props.competitorData - Competitor cost breakdown
 * @param {string} props.competitorData.name - Competitor name
 * @param {Array} props.competitorData.costs - Array of cost items {label, amount}
 * @param {string} props.competitorData.total - Total cost
 * @param {Object} props.thorbisData - Thorbis benefits breakdown
 * @param {Array} props.thorbisData.benefits - Array of benefit items {label, amount, positive}
 * @param {string} props.thorbisData.total - Total benefit
 * @param {Object} props.summary - Final summary
 * @param {string} props.summary.amount - Total savings/revenue increase
 * @param {string} props.summary.description - Description of the calculation
 * @param {string} props.summary.note - Additional note/context
 */
export function ROICalculator({ title, subtitle, competitorData, thorbisData, summary }) {
	return (
		<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
			<div className="mb-12 text-center">
				<h2 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
				<p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
			</div>
			<div className="max-w-5xl mx-auto">
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Competitor Costs */}
					<Card className="p-8 border-destructive/20">
						<CardHeader className="px-0 pt-0">
							<CardTitle className="flex items-center gap-2 text-destructive">
								<DollarSign className="w-5 h-5" />
								{competitorData.name} Costs
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-4">
							{competitorData.costs.map((cost, index) => (
								<div key={index} className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">{cost.label}</span>
									<span className="font-semibold text-destructive">{cost.amount}</span>
								</div>
							))}
							<div className="border-t pt-4">
								<div className="flex justify-between items-center font-bold text-lg">
									<span>Total Annual Cost</span>
									<span className="text-destructive">{competitorData.total}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Thorbis Benefits */}
					<Card className="p-8 bg-primary/5 border-primary/20">
						<CardHeader className="px-0 pt-0">
							<CardTitle className="flex items-center gap-2 text-primary">
								<Target className="w-5 h-5" />
								Thorbis Results
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 space-y-4">
							{thorbisData.benefits.map((benefit, index) => (
								<div key={index} className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">{benefit.label}</span>
									<span className={`font-semibold ${benefit.positive !== false ? "text-success dark:text-success" : "text-foreground"}`}>{benefit.amount}</span>
								</div>
							))}
							<div className="border-t pt-4">
								<div className="flex justify-between items-center font-bold text-lg">
									<span>Net Annual Gain</span>
									<span className="text-success dark:text-success">{thorbisData.total}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Summary */}
				<div className="mt-8 p-6 bg-primary text-primary-foreground rounded-xl text-center">
					<div className="text-3xl font-bold mb-2">{summary.amount}</div>
					<div className="text-lg opacity-90">{summary.description}</div>
					<p className="text-sm opacity-80 mt-2">{summary.note}</p>
				</div>
			</div>
		</section>
	);
}

/**
 * Pre-configured ROI calculator for service businesses (Bark, Angie's List, etc.)
 */
export function ServiceBusinessROI({ competitorName, competitorCommission, totalSavings }) {
	const competitorData = {
		name: competitorName,
		costs: [
			{ label: `Commission fees (${competitorCommission}% average)`, amount: "$42,000" },
			{ label: "Lead qualification costs", amount: "$8,400" },
			{ label: "Lost prospects (poor leads)", amount: "$24,000" },
			{ label: "Additional marketing costs", amount: "$12,000" },
			{ label: "Customer acquisition inflation", amount: "$6,000" },
		],
		total: "$92,400",
	};

	const thorbisData = {
		benefits: [
			{ label: "Thorbis platform (all features)", amount: "$348", positive: false },
			{ label: "Saved commission fees", amount: "+$42,000" },
			{ label: "Qualified leads only", amount: "+$48,000" },
			{ label: "Higher conversion rates", amount: "+$36,000" },
			{ label: "Reduced marketing costs", amount: "+$12,000" },
		],
		total: "+$137,652",
	};

	const summary = {
		amount: totalSavings || "$230,052",
		description: "Total Annual Savings + Revenue Increase",
		note: `Based on average service business switching from ${competitorName} to Thorbis`,
	};

	return <ROICalculator title="Service Business ROI Calculator" subtitle={`Calculate your potential savings and revenue increase vs ${competitorName}`} competitorData={competitorData} thorbisData={thorbisData} summary={summary} />;
}

/**
 * Pre-configured ROI calculator for travel businesses (Booking.com, Expedia, etc.)
 */
export function TravelBusinessROI({ competitorName, competitorCommission, totalSavings }) {
	const competitorData = {
		name: competitorName,
		costs: [
			{ label: `Commission fees (${competitorCommission}% average)`, amount: "$60,000" },
			{ label: "Processing and penalty fees", amount: "$4,200" },
			{ label: "Lost direct booking revenue", amount: "$36,000" },
			{ label: "Customer acquisition cost increase", amount: "$18,000" },
			{ label: "Price competition losses", amount: "$24,000" },
		],
		total: "$142,200",
	};

	const thorbisData = {
		benefits: [
			{ label: "Thorbis platform (all features)", amount: "$348", positive: false },
			{ label: "Saved commission fees", amount: "+$60,000" },
			{ label: "Direct booking premium pricing", amount: "+$48,000" },
			{ label: "Repeat guest revenue", amount: "+$54,000" },
			{ label: "Reduced acquisition costs", amount: "+$18,000" },
		],
		total: "+$309,652",
	};

	const summary = {
		amount: totalSavings || "$451,852",
		description: "Total Annual Savings + Revenue Increase",
		note: `Based on average accommodation switching from ${competitorName} to Thorbis`,
	};

	return <ROICalculator title="Travel Business ROI Calculator" subtitle={`Calculate your potential commission savings and revenue increase vs ${competitorName}`} competitorData={competitorData} thorbisData={thorbisData} summary={summary} />;
}

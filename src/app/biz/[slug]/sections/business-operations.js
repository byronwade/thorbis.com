import React from "react";
import { Badge } from "@components/ui/badge";
import { Eye } from "lucide-react";

export default function BusinessOperations({ business }) {
	// Defensive programming - provide fallback data if business or businessTransparency is undefined
	if (!business || !business.businessTransparency) {
		return (
			<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
				<div className="mb-8">
					<h2 className="flex items-center mb-2 text-2xl font-bold text-foreground">
						<Eye className="w-6 h-6 mr-3 text-primary" />
						👁️ Business Operations
					</h2>
					<div className="w-20 h-1 rounded-full bg-gradient-to-r from-primary to-primary/50"></div>
				</div>
				<div className="p-6 border rounded-xl bg-card/30 border-border">
					<p className="text-muted-foreground">Business operations information is loading...</p>
				</div>
			</section>
		);
	}

	const { operationalAreas = [], whyQualityMatters = [], costBreakdown = [], qualityAssurance = [] } = business.businessTransparency;

	return (
		<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
			<div className="mb-8">
				<h2 className="flex items-center mb-2 text-2xl font-bold text-foreground">
					<Eye className="w-6 h-6 mr-3 text-primary" />
					👁️ Business Operations
				</h2>
				<div className="w-20 h-1 rounded-full bg-gradient-to-r from-primary to-primary/50"></div>
			</div>

			<div className="space-y-8">
				{/* Educational Introduction */}
				<div className="p-6 border bg-gradient-to-r rounded-xl from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-primary/30/50">
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Understanding Professional Service Costs</h3>
						<p className="text-sm leading-relaxed text-muted-foreground">We believe in transparency. Quality service businesses invest in many areas that customers don&apos;t always see. Here&apos;s an educational look at what goes into delivering professional, reliable service.</p>
					</div>
				</div>

				{/* Operational Areas */}
				<div className="space-y-6">
					<h3 className="text-lg font-semibold text-foreground">Key Investment Areas</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{operationalAreas.map((area, index) => (
							<div key={index} className="p-4 border rounded-lg bg-card/30 border-border">
								<div className="flex items-start justify-between mb-3">
									<h4 className="font-medium text-foreground">{area.category}</h4>
									<Badge variant="outline" className={`text-xs ${area.importance === "Critical" ? "border-destructive text-destructive bg-destructive/20" : area.importance === "High" ? "border-warning text-warning bg-warning/20" : "border-primary text-primary bg-primary/20"}`}>
										{area.importance}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground">{area.description}</p>
							</div>
						))}
					</div>
				</div>

				{/* Why Quality Matters */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground">Why Quality Service Matters</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{whyQualityMatters.map((factor, index) => (
							<div key={index} className="p-4 border rounded-lg bg-card/30 border-border">
								<h4 className="font-medium text-foreground">{factor.title}</h4>
								<p className="mt-1 text-sm text-muted-foreground">{factor.description}</p>
							</div>
						))}
					</div>
				</div>

				{/* Cost Breakdown */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground">Typical Service Cost Breakdown</h3>
					<div className="p-6 border rounded-lg bg-card/30 border-border">
						<div className="space-y-4">
							{costBreakdown.map((item, index) => (
								<div key={index} className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">{item.category}</span>
									<span className="text-sm font-medium text-foreground">{item.percentage}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Quality Assurance */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground">Quality Assurance Processes</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{qualityAssurance.map((process, index) => (
							<div key={index} className="p-4 border rounded-lg bg-card/30 border-border">
								<h4 className="font-medium text-foreground">{process.title}</h4>
								<p className="mt-1 text-sm text-muted-foreground">{process.description}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

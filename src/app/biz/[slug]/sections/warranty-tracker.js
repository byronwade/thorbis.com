import React from "react";
import { Badge } from "@components/ui/badge";
import { ClipboardCheck } from "lucide-react";

export default function WarrantyTracker({ business }) {
	// Defensive programming - provide fallback data if business or warrantyTracker is undefined
	if (!business || !business.warrantyTracker) {
		return (
			<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
				<div className="mb-8">
					<h2 className="flex items-center mb-2 text-2xl font-bold text-foreground">
						<ClipboardCheck className="w-6 h-6 mr-3 text-primary" />
						🛡️ Warranty Tracker
					</h2>
					<div className="w-20 h-1 rounded-full bg-gradient-to-r from-primary to-primary/50"></div>
				</div>
				<div className="p-6 border rounded-xl bg-card/30 border-border">
					<p className="text-muted-foreground">Warranty tracker information is loading...</p>
				</div>
			</section>
		);
	}

	const { warranties = [], activeWarranties = [], claims = [] } = business.warrantyTracker;

	return (
		<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
			<div className="mb-8">
				<h2 className="flex items-center mb-2 text-2xl font-bold text-foreground">
					<ClipboardCheck className="w-6 h-6 mr-3 text-primary" />
					🛡️ Warranty Tracker
				</h2>
				<div className="w-20 h-1 rounded-full bg-gradient-to-r from-primary to-primary/50"></div>
			</div>

			<div className="space-y-8">
				{/* Warranty Overview */}
				<div className="p-6 border rounded-lg bg-card/30 border-border">
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Warranty Coverage</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{warranties.map((warranty, index) => (
								<div key={index} className="p-4 border rounded-lg bg-card/20 border-border">
									<div className="text-center">
										<p className="text-sm text-muted-foreground">{warranty.type}</p>
										<p className="text-lg font-bold text-foreground">{warranty.duration}</p>
										<p className="text-xs text-muted-foreground">{warranty.coverage}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Active Warranties */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground">Active Warranties</h3>
					<div className="space-y-3">
						{activeWarranties.map((warranty, index) => (
							<div key={index} className="p-4 border rounded-lg bg-card/30 border-border">
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<h4 className="font-medium text-foreground">{warranty.service}</h4>
										<p className="text-sm text-muted-foreground">{warranty.description}</p>
										<div className="flex items-center space-x-4 text-xs text-muted-foreground">
											<span>Started: {warranty.startDate}</span>
											<span>Expires: {warranty.expiryDate}</span>
										</div>
									</div>
									<Badge variant="outline" className={`text-xs ${warranty.status === "Active" ? "border-success text-success bg-success/20" : "border-warning text-warning bg-warning/20"}`}>
										{warranty.status}
									</Badge>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Warranty Claims */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground">Warranty Claims History</h3>
					<div className="space-y-3">
						{claims.map((claim, index) => (
							<div key={index} className="p-4 border rounded-lg bg-card/30 border-border">
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<h4 className="font-medium text-foreground">{claim.title}</h4>
										<p className="text-sm text-muted-foreground">{claim.description}</p>
										<div className="flex items-center space-x-4 text-xs text-muted-foreground">
											<span>Filed: {claim.filedDate}</span>
											<span>Resolved: {claim.resolvedDate}</span>
										</div>
									</div>
									<Badge variant="outline" className={`text-xs ${claim.status === "Resolved" ? "border-success text-success bg-success/20" : claim.status === "In Progress" ? "border-primary text-primary bg-primary/20" : "border-destructive text-destructive bg-destructive/20"}`}>
										{claim.status}
									</Badge>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

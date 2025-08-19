/**
 * Partnerships Overview Component
 * Displays partnership statistics and summary information
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Handshake, Users, Shield, TrendingUp, CheckCircle, Clock, AlertCircle, Building } from "lucide-react";
import { getPartnershipStats, calculateVerificationScore, getVerificationProgress } from "@lib/business/partnerships/utils";

const StatCard = ({ title, value, icon: Icon, description, trend }) => (
	<Card>
		<CardContent className="p-4">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					<div className="flex items-center space-x-2">
						<p className="text-2xl font-bold">{value}</p>
						{trend && (
							<Badge variant={trend > 0 ? "default" : "secondary"} className="text-xs">
								{trend > 0 ? "+" : ""}
								{trend}%
							</Badge>
						)}
					</div>
					{description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
				</div>
				<div className="p-2 bg-primary/10 rounded-lg">
					<Icon className="w-5 h-5 text-primary" />
				</div>
			</div>
		</CardContent>
	</Card>
);

const TypeDistributionChart = ({ typeDistribution }) => {
	const total = Object.values(typeDistribution).reduce((sum, count) => sum + count, 0);

	if (total === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<Building className="w-8 h-8 mx-auto mb-2" />
				<p>No partnerships yet</p>
			</div>
		);
	}

	const sortedTypes = Object.entries(typeDistribution)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5); // Show top 5 types

	return (
		<div className="space-y-3">
			{sortedTypes.map(([type, count]) => {
				const percentage = Math.round((count / total) * 100);
				return (
					<div key={type} className="space-y-1">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">{type}</span>
							<span className="text-muted-foreground">
								{count} ({percentage}%)
							</span>
						</div>
						<Progress value={percentage} className="h-2" />
					</div>
				);
			})}
		</div>
	);
};

const VerificationOverview = ({ partnerships }) => {
	const verificationScores = partnerships.map((p) => ({
		name: p.name,
		progress: getVerificationProgress(p.verification),
		status: p.verification?.status || "not_started",
	}));

	const avgScore = verificationScores.length > 0 ? Math.round(verificationScores.reduce((sum, p) => sum + p.progress, 0) / verificationScores.length) : 0;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="font-medium">Verification Status</h4>
				<Badge variant="outline" className="text-xs">
					Avg: {avgScore}%
				</Badge>
			</div>

			<div className="space-y-3">
				{verificationScores.slice(0, 5).map((partnership) => {
					const StatusIcon = partnership.status === "verified" ? CheckCircle : partnership.status === "in_progress" ? Clock : AlertCircle;
					const statusColor = partnership.status === "verified" ? "text-success" : partnership.status === "in_progress" ? "text-primary" : "text-muted-foreground";

					return (
						<div key={partnership.name} className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center space-x-2">
									<StatusIcon className={`w-4 h-4 ${statusColor}`} />
									<span className="font-medium truncate">{partnership.name}</span>
								</div>
								<span className="text-muted-foreground">{partnership.progress}%</span>
							</div>
							<Progress value={partnership.progress} className="h-1.5" />
						</div>
					);
				})}
			</div>

			{verificationScores.length > 5 && <p className="text-xs text-muted-foreground text-center">+{verificationScores.length - 5} more partnerships</p>}
		</div>
	);
};

const PartnershipsOverview = ({ partnerships }) => {
	const stats = getPartnershipStats(partnerships);
	const overallScore = calculateVerificationScore(partnerships);

	return (
		<div className="grid gap-6">
			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard title="Total Partnerships" value={stats.total} icon={Handshake} description="Active business relationships" />
				<StatCard title="Verified Partners" value={stats.verified} icon={Shield} description={`${stats.verificationRate}% verification rate`} />
				<StatCard title="Active Partners" value={stats.active} icon={Users} description="Currently active partnerships" />
				<StatCard title="Overall Score" value={`${overallScore}%`} icon={TrendingUp} description="Partnership quality score" />
			</div>

			{/* Detailed Breakdown */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Partnership Types */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Partnership Types</CardTitle>
					</CardHeader>
					<CardContent>
						<TypeDistributionChart typeDistribution={stats.typeDistribution} />
					</CardContent>
				</Card>

				{/* Verification Status */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Verification Progress</CardTitle>
					</CardHeader>
					<CardContent>
						<VerificationOverview partnerships={partnerships} />
					</CardContent>
				</Card>
			</div>

			{/* Status Summary */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Status Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-success">{stats.verified}</div>
							<p className="text-xs text-muted-foreground">Verified</p>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-primary">{stats.active}</div>
							<p className="text-xs text-muted-foreground">Active</p>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-warning">{stats.pending}</div>
							<p className="text-xs text-muted-foreground">Pending</p>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold">{stats.total}</div>
							<p className="text-xs text-muted-foreground">Total</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default PartnershipsOverview;

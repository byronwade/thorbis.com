import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * Feature comparison row component
 * @param {Object} props
 * @param {string} props.feature - Feature name
 * @param {string|React.ReactNode} props.competitor - Competitor value/status
 * @param {string|React.ReactNode} props.thorbis - Thorbis value/status
 * @param {string} props.competitorClass - Additional CSS classes for competitor cell
 * @param {string} props.thorbisClass - Additional CSS classes for Thorbis cell
 */
function ComparisonRow({ feature, competitor, thorbis, competitorClass = "", thorbisClass = "" }) {
	const renderCellContent = (content) => {
		if (content === true) {
			return <CheckCircle className="inline w-5 h-5 text-success dark:text-success" />;
		}
		if (content === false) {
			return <XCircle className="inline w-5 h-5 text-destructive" />;
		}
		return content;
	};

	return (
		<tr className="hover:bg-muted/50 transition-colors">
			<td className="px-6 py-4 font-medium text-foreground">{feature}</td>
			<td className={`px-6 py-4 text-center ${competitorClass}`}>{renderCellContent(competitor)}</td>
			<td className={`px-6 py-4 text-center ${thorbisClass}`}>{renderCellContent(thorbis)}</td>
		</tr>
	);
}

/**
 * Feature comparison table component for comparison pages
 * @param {Object} props
 * @param {string} props.title - Table section title
 * @param {string} props.subtitle - Table section subtitle
 * @param {string} props.competitorName - Name of the competitor
 * @param {Array} props.features - Array of feature comparison objects
 * @param {string} props.features[].name - Feature name
 * @param {string|React.ReactNode|boolean} props.features[].competitor - Competitor value
 * @param {string|React.ReactNode|boolean} props.features[].thorbis - Thorbis value
 * @param {string} props.features[].competitorClass - CSS class for competitor cell
 * @param {string} props.features[].thorbisClass - CSS class for Thorbis cell
 */
export function ComparisonTable({ title, subtitle, competitorName, features }) {
	return (
		<section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
			<div className="mb-12 text-center">
				<h2 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
				<p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
			</div>
			<div className="overflow-hidden rounded-xl shadow-lg border border-border">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-primary text-primary-foreground">
							<tr>
								<th className="px-6 py-4 text-left font-semibold">Feature</th>
								<th className="px-6 py-4 text-center font-semibold">{competitorName}</th>
								<th className="px-6 py-4 text-center font-semibold">Thorbis</th>
							</tr>
						</thead>
						<tbody className="bg-card divide-y divide-border">
							{features.map((feature, index) => (
								<ComparisonRow key={index} feature={feature.name} competitor={feature.competitor} thorbis={feature.thorbis} competitorClass={feature.competitorClass || ""} thorbisClass={feature.thorbisClass || ""} />
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}

/**
 * Pre-configured comparison table for service platforms (Bark, Angie's List, etc.)
 */
export function ServicePlatformComparison({ competitorName }) {
	const features = [
		{
			name: "Commission Rate",
			competitor: "15-25%",
			thorbis: "$29/month",
			competitorClass: "text-destructive font-semibold",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Lead Quality",
			competitor: "Basic Screening",
			thorbis: "AI-Qualified",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Customer Data Access",
			competitor: false,
			thorbis: true,
		},
		{
			name: "Multi-Platform Sync",
			competitor: false,
			thorbis: true,
		},
		{
			name: "Business Growth Tools",
			competitor: false,
			thorbis: true,
		},
		{
			name: "Customer Support",
			competitor: "Limited",
			thorbis: "24/7 Priority",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Review Management",
			competitor: "Basic",
			thorbis: "Advanced AI",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
	];

	return <ComparisonTable title="Quick Comparison" subtitle={`See how Thorbis stacks up against ${competitorName}`} competitorName={competitorName} features={features} />;
}

/**
 * Pre-configured comparison table for travel platforms (Booking.com, Expedia, etc.)
 */
export function TravelPlatformComparison({ competitorName, commissionRate = "20-25%" }) {
	const features = [
		{
			name: "Commission Rate",
			competitor: commissionRate,
			thorbis: "$29/month",
			competitorClass: "text-destructive font-semibold",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Direct Bookings",
			competitor: "Limited",
			thorbis: "Full Control",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Customer Data",
			competitor: "Restricted",
			thorbis: "Full Access",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Multi-Platform Sync",
			competitor: false,
			thorbis: true,
		},
		{
			name: "Customer Support",
			competitor: "Limited",
			thorbis: "24/7 Priority",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Business Growth Tools",
			competitor: false,
			thorbis: true,
		},
		{
			name: "Review Management",
			competitor: "Basic",
			thorbis: "Advanced AI",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Analytics & Insights",
			competitor: "Basic",
			thorbis: "Advanced AI",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
	];

	return <ComparisonTable title="Quick Comparison" subtitle={`See how Thorbis stacks up against ${competitorName}`} competitorName={competitorName} features={features} />;
}

/**
 * Pre-configured comparison table for restaurant platforms (TripAdvisor, Yelp, etc.)
 */
export function RestaurantPlatformComparison({ competitorName }) {
	const features = [
		{
			name: "Monthly Cost",
			competitor: "$200-500",
			thorbis: "$29",
			competitorClass: "text-destructive font-semibold",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Reservation System",
			competitor: "Basic",
			thorbis: "Advanced",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Review Management",
			competitor: "Limited",
			thorbis: "AI-Powered",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Menu Management",
			competitor: "Manual",
			thorbis: "Automated",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Customer Data Access",
			competitor: "Limited",
			thorbis: "Full Access",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "Multi-Platform Sync",
			competitor: false,
			thorbis: true,
		},
		{
			name: "Analytics Dashboard",
			competitor: "Basic",
			thorbis: "Advanced",
			competitorClass: "text-warning dark:text-warning",
			thorbisClass: "text-success dark:text-success font-bold",
		},
		{
			name: "POS Integration",
			competitor: false,
			thorbis: true,
		},
	];

	return <ComparisonTable title="Quick Comparison" subtitle={`See how Thorbis stacks up against ${competitorName}`} competitorName={competitorName} features={features} />;
}

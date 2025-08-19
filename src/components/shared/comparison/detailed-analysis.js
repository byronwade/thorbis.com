import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * Individual analysis point component
 * @param {Object} props
 * @param {string} props.title - Analysis point title
 * @param {string} props.description - Analysis point description
 * @param {string} props.type - Type: 'problem' or 'solution'
 * @param {string} props.quote - Optional customer quote
 * @param {string} props.attribution - Optional quote attribution
 */
function AnalysisPoint({ title, description, type, quote, attribution }) {
	const isPositive = type === "solution";
	const titleColor = isPositive ? "text-success dark:text-success" : "text-destructive";

	return (
		<div className={`p-4 bg-card rounded-lg border ${isPositive ? "border-primary/20" : "border-destructive/20"}`}>
			<h4 className={`font-semibold ${titleColor} mb-2`}>{title}</h4>
			<p className="text-sm text-muted-foreground mb-3">{description}</p>
			{quote && (
				<>
					<blockquote className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3 mb-2">"{quote}"</blockquote>
					{attribution && (
						<div className="flex items-center gap-2 text-xs">
							<div className="w-3 h-3 rounded-full bg-primary/20" />
							<span>{attribution}</span>
						</div>
					)}
				</>
			)}
		</div>
	);
}

/**
 * Detailed analysis section comparing competitor problems with Thorbis solutions
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section subtitle
 * @param {Object} props.competitor - Competitor analysis data
 * @param {string} props.competitor.name - Competitor name
 * @param {string} props.competitor.title - Competitor section title
 * @param {Array} props.competitor.points - Array of analysis points
 * @param {Object} props.thorbis - Thorbis analysis data
 * @param {string} props.thorbis.title - Thorbis section title
 * @param {Array} props.thorbis.points - Array of analysis points
 * @param {string} props.className - Additional CSS classes
 */
export function DetailedAnalysis({ title, subtitle, competitor, thorbis, className = "" }) {
	return (
		<section className={`px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 ${className}`}>
			<div className="mb-12 text-center">
				<h2 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
				<p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
			</div>
			<div className="grid gap-8 lg:grid-cols-2">
				{/* Competitor Problems */}
				<Card className="border-destructive/20 hover:shadow-lg transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-3 text-destructive">
							<XCircle className="w-6 h-6" />
							{competitor.title}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							{competitor.points.map((point, index) => (
								<AnalysisPoint key={index} title={point.title} description={point.description} quote={point.quote} attribution={point.attribution} type="problem" />
							))}
						</div>
					</CardContent>
				</Card>

				{/* Thorbis Solutions */}
				<Card className="border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-3 text-primary">
							<CheckCircle className="w-6 h-6" />
							{thorbis.title}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							{thorbis.points.map((point, index) => (
								<AnalysisPoint key={index} title={point.title} description={point.description} quote={point.quote} attribution={point.attribution} type="solution" />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

/**
 * Pre-configured detailed analysis for service platforms (Bark, Angie's List, etc.)
 */
export function ServicePlatformAnalysis({ competitorName }) {
	const competitor = {
		name: competitorName,
		title: `${competitorName}'s Limitations`,
		points: [
			{
				title: "Poor Lead Quality",
				description: "Most leads are price shoppers, tire kickers, or unqualified prospects, leading to low conversion rates.",
				quote: "90% of leads from Bark were people just fishing for prices. Waste of time and money.",
				attribution: "Mike T., Plumbing Contractor",
			},
			{
				title: "High Commission Costs",
				description: "Commission fees eat into already thin margins, making it difficult to grow profitably.",
				quote: "Between commissions and fees, I was paying 25% of every job to Bark. Couldn't sustain it.",
				attribution: "Sarah L., Electrician",
			},
			{
				title: "No Customer Relationship",
				description: "Platform owns the customer data and relationship, preventing repeat business development.",
				quote: "Never got customer contact info. Couldn't build relationships or get referrals.",
				attribution: "David R., HVAC Technician",
			},
		],
	};

	const thorbis = {
		title: "Thorbis Advantages",
		points: [
			{
				title: "AI-Qualified Leads Only",
				description: "Advanced AI screening ensures you only get serious customers ready to hire.",
				quote: "With Thorbis, 80% of leads turn into paying customers. Night and day difference.",
				attribution: "Same Mike T., now 5x revenue",
			},
			{
				title: "Fixed Monthly Pricing",
				description: "Predictable $29/month cost with no commissions, regardless of business volume.",
				quote: "Saved $18,000 in commissions last year alone. Pure profit back in my pocket.",
				attribution: "Same Sarah L., expanded to 3 trucks",
			},
			{
				title: "Own Your Customers",
				description: "Full access to customer data enables relationship building and repeat business.",
				quote: "Now I have 60% repeat customers. Built a real business, not just a lead source.",
				attribution: "Same David R., premium pricing",
			},
		],
	};

	return <DetailedAnalysis title="Detailed Analysis" subtitle="Dive deeper into the differences" competitor={competitor} thorbis={thorbis} />;
}

/**
 * Pre-configured detailed analysis for travel platforms (Booking.com, Expedia, etc.)
 */
export function TravelPlatformAnalysis({ competitorName }) {
	const competitor = {
		name: competitorName,
		title: `${competitorName}'s Problems`,
		points: [
			{
				title: "Escalating Commission Rates",
				description: "Commission rates increase as your business grows, penalizing success with higher costs.",
				quote: "Started at 18%, now paying 25%. They punish you for being successful.",
				attribution: "Hotel Manager, Beach Resort",
			},
			{
				title: "No Guest Loyalty Building",
				description: "Platform controls guest relationships, preventing direct communication and repeat bookings.",
				quote: "Guests book through them, not us. Can't build relationships or offer loyalty programs.",
				attribution: "B&B Owner, Mountain Lodge",
			},
			{
				title: "Rate Parity Restrictions",
				description: "Required to match platform rates everywhere, eliminating ability to incentivize direct bookings.",
				quote: "Forced to match their rates. Can't offer direct booking discounts. It's a trap.",
				attribution: "Boutique Hotel Owner",
			},
		],
	};

	const thorbis = {
		title: "Thorbis Empowers Properties",
		points: [
			{
				title: "Fixed Cost, Scale Rewards",
				description: "$29/month regardless of booking volume. The more you grow, the more you save.",
				quote: "Last year saved $156,000 in commissions. The more successful we get, the more we keep.",
				attribution: "Same Beach Resort, now expanding",
			},
			{
				title: "Direct Guest Relationships",
				description: "Own all guest data and communications to build loyalty and increase repeat bookings.",
				quote: "70% repeat booking rate now. We're a destination, not a commodity.",
				attribution: "Same Mountain Lodge, premium rates",
			},
			{
				title: "Pricing Freedom",
				description: "Set your own rates and offer direct booking incentives without platform restrictions.",
				quote: "Offer loyalty programs and direct discounts. Guests love the personal service.",
				attribution: "Same Boutique Hotel, 5-star reviews",
			},
		],
	};

	return <DetailedAnalysis title="Detailed Analysis" subtitle="Why commission platforms hurt accommodation providers" competitor={competitor} thorbis={thorbis} />;
}

/**
 * Pre-configured detailed analysis for restaurant platforms (TripAdvisor, Yelp, etc.)
 */
export function RestaurantPlatformAnalysis({ competitorName }) {
	const competitor = {
		name: competitorName,
		title: `${competitorName}'s Limitations`,
		points: [
			{
				title: "Limited Reservation Control",
				description: "Basic reservation systems with limited customization and poor integration capabilities.",
				quote: "Their reservation system was clunky and didn't integrate with our POS. Constant headaches.",
				attribution: "Chef Maria, Italian Bistro",
			},
			{
				title: "Expensive Add-On Features",
				description: "Core features require expensive upgrades, making total cost much higher than advertised.",
				quote: "Started at $200/month, ended up paying $600 with all the features we actually needed.",
				attribution: "Restaurant Owner, Family Diner",
			},
			{
				title: "Poor Customer Support",
				description: "Slow response times and unhelpful solutions when issues arise during busy service periods.",
				quote: "Reservation system crashed on Valentine's Day. Took them 3 hours to respond. Disaster.",
				attribution: "Manager, Fine Dining Restaurant",
			},
		],
	};

	const thorbis = {
		title: "Thorbis Restaurant Solutions",
		points: [
			{
				title: "Integrated Reservation System",
				description: "Advanced reservations with full POS integration, table management, and customer preferences.",
				quote: "Everything works together seamlessly. Reservations, orders, payments - all connected.",
				attribution: "Same Chef Maria, doubled revenue",
			},
			{
				title: "All-Inclusive Pricing",
				description: "Every feature included in $29/month with no hidden costs or expensive upgrades.",
				quote: "All features for $29. Saved $7,000 annually and got better functionality.",
				attribution: "Same Restaurant Owner, expanded location",
			},
			{
				title: "24/7 Priority Support",
				description: "Dedicated restaurant support team with average response time under 2 minutes.",
				quote: "Issue on busy Saturday night, fixed in 90 seconds. They understand restaurants.",
				attribution: "Same Manager, stress-free service",
			},
		],
	};

	return <DetailedAnalysis title="Detailed Analysis" subtitle="Compare restaurant management solutions" competitor={competitor} thorbis={thorbis} />;
}

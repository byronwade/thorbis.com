export const metadata = {
	title: "Membership Billing & Renewals | Service Plans",
	description: "Manage auto-renewals and dunning workflows for memberships.",
};

export default function MembershipBillingPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Membership Billing & Renewals",
		description: "Manage auto-renewals and dunning workflows for memberships.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Membership Billing & Renewals</h1>
			<p className="text-muted-foreground">Manage auto-renewals and dunning workflows for memberships.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}

export const metadata = {
	title: "Commissions | Time & Payroll",
	description: "Configure commission plans and payouts.",
};

export default function CommissionsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Commissions",
		description: "Configure commission plans and payouts.",
	};

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
      <p className="text-muted-foreground">Configure commission plans and payouts.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

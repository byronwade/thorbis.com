export const metadata = {
	title: "Approvals | Time & Payroll",
	description: "Approve timesheets and adjustments.",
};

export default function PayrollApprovalsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Approvals",
		description: "Approve timesheets and adjustments.",
	};

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
      <p className="text-muted-foreground">Approve timesheets and adjustments.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

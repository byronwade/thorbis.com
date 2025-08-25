export const metadata = {
	title: "Timesheets | Time & Payroll",
	description: "Track and approve employee timesheets.",
};

export default function TimesheetsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Timesheets",
		description: "Track and approve employee timesheets.",
	};

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Timesheets</h1>
      <p className="text-muted-foreground">Track and approve employee timesheets.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

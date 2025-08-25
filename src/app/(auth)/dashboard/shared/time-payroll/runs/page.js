export const metadata = {
	title: "Payroll Runs | Time & Payroll",
	description: "Run payroll and export to accounting.",
};

export default function PayrollRunsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Payroll Runs",
		description: "Run payroll and export to accounting.",
	};

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Payroll Runs</h1>
      <p className="text-muted-foreground">Run payroll and export to accounting.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

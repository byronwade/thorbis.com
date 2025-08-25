export const metadata = {
	title: "Call Recordings | Communication",
	description: "Search and review CSR call recordings.",
};

export default function CallRecordingsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Call Recordings",
		description: "Search and review CSR call recordings.",
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}

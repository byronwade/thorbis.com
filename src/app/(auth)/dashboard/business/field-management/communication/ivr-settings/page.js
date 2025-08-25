export const metadata = {
	title: "IVR Settings | Communication",
	description: "Configure call flows, whisper, and routing.",
};

export default function IVRSettingsPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "IVR Settings",
		description: "Configure call flows, whisper, and routing.",
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}

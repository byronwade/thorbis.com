export const metadata = {
	title: "Purchase Orders | Inventory",
	description: "Create and track purchase orders and fulfillment.",
};

export default function PurchaseOrdersPage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Purchase Orders",
		description: "Create and track purchase orders and fulfillment.",
	};

	return (
		<>
			<h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
			<p className="text-muted-foreground">Create and track purchase orders and fulfillment.</p>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
		</>
	);
}

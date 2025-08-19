"use client";
import { Copy } from "lucide-react";
import { Button } from "@components/ui/button";

export default function RssCopyButton({ url }) {
	return (
		<Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(url)} aria-label="Copy feed URL" title="Copy feed URL">
			<Copy className="w-4 h-4" />
		</Button>
	);
}

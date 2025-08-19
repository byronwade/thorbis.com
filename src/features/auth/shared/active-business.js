import React from "react";
import Image from "next/image";
import { Card } from "@components/ui/card";

export default function ActiveBusiness() {
	return (
		<div className="mt-10">
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left ">These businesses are linked to your account</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">Select a company from below</p>
			<div className="mt-4 space-y-4">
				<Card className="relative flex flex-row p-2">
					<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={100} height={100} className="inline-block w-12 h-12 rounded-md" />
					<div className="ml-4">
						<h3>Wades Plumbing & Septic</h3>
						<p className="text-sm text-dark-500 dark:text-muted-foreground">17655 old summit road, los gatos, CA, 95033</p>
					</div>
				</Card>
				<Card className="relative flex flex-row p-2 ">
					<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={100} height={100} className="inline-block w-12 h-12 rounded-md" />
					<div className="ml-4">
						<h3>Wades Plumbing & Septic</h3>
						<p className="text-sm text-dark-500 dark:text-muted-foreground">17655 old summit road, los gatos, CA, 95033</p>
					</div>
				</Card>
				<Card className="relative flex flex-row p-2 ">
					<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={100} height={100} className="inline-block w-12 h-12 rounded-md" />
					<div className="ml-4">
						<h3>Wades Plumbing & Septic</h3>
						<p className="text-sm text-dark-500 dark:text-muted-foreground">17655 old summit road, los gatos, CA, 95033</p>
					</div>
				</Card>
			</div>
		</div>
	);
}

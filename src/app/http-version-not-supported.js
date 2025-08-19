"use client";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";
import { Settings, HelpCircle } from "lucide-react";

export default function HttpVersionNotSupported() {
	const handleGoBack = () => {
		if (typeof window !== "undefined") {
			window.history.back();
		}
	};

	const handleRefresh = () => {
		if (typeof window !== "undefined") {
			window.location.reload();
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
			<div className="max-w-md text-center">
				<div className="relative inline-block mb-8">
					<h1 className="text-9xl font-bold text-destructive">505</h1>
					<p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-background text-sm font-medium px-2 bg-destructive rounded-full">Version Not Supported</p>
				</div>
				<h2 className="text-2xl font-semibold mb-2">Time traveler detected!</h2>
				<p className="text-muted-foreground mb-8">It looks like you&apos;re using an HTTP version from the distant past (or future). Our servers are a bit picky about which HTTP versions they&apos;ll chat with. Perhaps it&apos;s time for an upgrade?</p>
				<div className="flex gap-4 justify-center">
					<Button className="bg-destructive hover:bg-destructive" onClick={handleRefresh}>
						<RefreshCw className="w-4 h-4 mr-2" />
						Try Again
					</Button>
					<Button asChild variant="outline">
						<Link href="/">
							<Home className="w-4 h-4 mr-2" />
							Go to Homepage
						</Link>
					</Button>
					<Button variant="outline" onClick={handleGoBack}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Travel Back
					</Button>
				</div>
				<div className="mt-12 text-sm text-muted-foreground/80">
					<p>This usually means your browser or client needs updating:</p>
					<div className="flex justify-center gap-6 mt-4">
						<Link href="/support" className="flex items-center gap-1.5 hover:text-destructive transition-colors">
							<HelpCircle className="w-4 h-4" /> Get Help
						</Link>
						<Link href="/contact-support" className="flex items-center gap-1.5 hover:text-destructive transition-colors">
							<Settings className="w-4 h-4" /> Technical Support
						</Link>
					</div>
					<div className="mt-6 text-xs text-muted-foreground/60">
						Error Code: <span className="font-mono text-destructive">HTTP_505_{Date.now().toString(36).toUpperCase()}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

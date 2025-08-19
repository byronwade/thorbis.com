"use client";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";
import { AlertTriangle, HelpCircle } from "lucide-react";

export default function InternalServerError() {
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
					<h1 className="text-9xl font-bold text-destructive">500</h1>
					<p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-background text-sm font-medium px-2 bg-destructive rounded-full">Internal Server Error</p>
				</div>
				<h2 className="text-2xl font-semibold mb-2">Houston, we have a problem.</h2>
				<p className="text-muted-foreground mb-8">Our servers are having a bit of a moment. A team of highly trained engineers has been dispatched to fix the issue. Please stand by while we work our magic.</p>
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
						Go Back
					</Button>
				</div>
				<div className="mt-12 text-sm text-muted-foreground/80">
					<p>If you&apos;re still having trouble, try these options:</p>
					<div className="flex justify-center gap-6 mt-4">
						<Link href="/support" className="flex items-center gap-1.5 hover:text-destructive transition-colors">
							<HelpCircle className="w-4 h-4" /> Get Support
						</Link>
						<Link href="/contact-support" className="flex items-center gap-1.5 hover:text-destructive transition-colors">
							<AlertTriangle className="w-4 h-4" /> Report Issue
						</Link>
					</div>
					<div className="mt-6 text-xs text-muted-foreground/60">
						Error Code: <span className="font-mono text-destructive">ERR_{Date.now().toString(36).toUpperCase()}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

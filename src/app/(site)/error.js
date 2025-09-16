"use client";

export default function Error({ error, reset }) {
	const isDevMode = process.env.NODE_ENV === "development";

	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
			<div className="max-w-md text-center">
				<div className="relative inline-block mb-8">
					<h1 className="text-9xl font-bold text-destructive">500</h1>
					<p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-background text-sm font-medium px-2 bg-destructive rounded-full">Server Error</p>
				</div>
				<h2 className="text-2xl font-semibold mb-2">Houston, we have a problem.</h2>
				<p className="text-muted-foreground mb-8">Our servers are having a bit of a moment. A team of highly trained engineers has been dispatched to fix the issue. Please stand by while we work our magic.</p>
				<div className="flex gap-4 justify-center">
					<button onClick={() => reset()} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-white shadow hover:bg-destructive h-9 px-4 py-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2" aria-hidden="true">
							<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
							<path d="M22 2 12 12"></path>
						</svg>
						Try Again
					</button>
					<a href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary h-9 px-4 py-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2" aria-hidden="true">
							<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
							<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
						</svg>
						Go to Homepage
					</a>
				</div>

				{isDevMode && error && (
					<div className="mt-12 text-left text-sm bg-muted/40 border rounded-md p-4">
						<p className="font-semibold text-destructive mb-2">Technical Details</p>
						<pre className="whitespace-pre-wrap text-muted-foreground">{error.message || "No error message provided."}{error.stack && `\n\n${error.stack}`}</pre>
					</div>
				)}

				<div className="mt-6 text-xs text-muted-foreground/60">Error Code: <span className="font-mono text-destructive">ERR_{Date.now().toString(36).toUpperCase()}</span></div>
			</div>
		</div>
	);
}

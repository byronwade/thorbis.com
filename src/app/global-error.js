"use client";

export default function GlobalError({ error, reset }) {
	const isDevMode = process.env.NODE_ENV === "development";

	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
			<div className="max-w-md text-center">
				<div className="relative inline-block mb-8">
					<h1 className="text-9xl font-bold text-destructive">500</h1>
					<p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-background text-sm font-medium px-2 bg-destructive rounded-full">Critical Error</p>
				</div>
				<h2 className="text-2xl font-semibold mb-2">Something Went Wrong</h2>
				<p className="text-muted-foreground mb-8">We're experiencing some technical difficulties. Please try again in a moment or head back home.</p>
				<div className="flex gap-4 justify-center">
					<button onClick={() => reset()} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-white shadow hover:bg-destructive h-9 px-4 py-2">
						Try Again
					</button>
					<a href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary h-9 px-4 py-2">
						Go Home
					</a>
				</div>

				{isDevMode && error && (
					<div className="mt-12 text-left text-sm bg-muted/40 border rounded-md p-4">
						<p className="font-semibold text-destructive mb-2">Error Details</p>
						<pre className="whitespace-pre-wrap text-muted-foreground">{error.message || "No error message provided."}</pre>
					</div>
				)}

				<div className="mt-6 text-xs text-muted-foreground/60">Error ID: <span className="font-mono text-destructive">{Date.now().toString(36).toUpperCase()}</span></div>
			</div>
		</div>
	);
}
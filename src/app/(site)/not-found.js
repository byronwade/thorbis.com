import { generateStaticPageMetadata } from "@/utils/server-seo";
import BackButton from "@/components/ui/back-button";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Page Not Found | Thorbis",
		description: "Sorry, we couldn't find that page. Explore top sections of Thorbis instead.",
		path: "/404",
		keywords: ["404", "page not found", "error"],
	});
}

export default function NotFound() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
			<div className="max-w-md text-center">
				<div className="relative inline-block mb-8">
					<h1 className="text-9xl font-bold text-primary">404</h1>
					<p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-background text-sm font-medium px-2 bg-foreground rounded-full">Page Not Found</p>
				</div>
				<h2 className="text-2xl font-semibold mb-2">Well, this is awkward.</h2>
				<p className="text-muted-foreground mb-8">It seems the page you're looking for has either been moved to a parallel universe or we're just really bad at hide-and-seek. Let's pretend it's the former.</p>
				<div className="flex gap-4 justify-center">
					<a className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2" href="/">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house w-4 h-4 mr-2" aria-hidden="true">
							<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
							<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
						</svg>
						Go to Homepage
					</a>
					<BackButton />
				</div>
				<div className="mt-12 text-sm text-muted-foreground/80">
					<p>If you're feeling adventurous, pick a direction:</p>
					<div className="flex justify-center gap-6 mt-4">
						<a className="flex items-center gap-1.5 hover:text-primary transition-colors" href="/learn">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket w-4 h-4" aria-hidden="true">
								<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
								<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
								<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
								<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
							</svg>
							 Learn Something New
						</a>
						<a className="flex items-center gap-1.5 hover:text-primary transition-colors" href="/localhub">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-compass w-4 h-4" aria-hidden="true">
								<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"></path>
								<circle cx="12" cy="12" r="10"></circle>
							</svg>
							 Explore LocalHub
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

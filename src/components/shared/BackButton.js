"use client";

export function BackButton() {
	const handleBack = () => {
		if (typeof window !== "undefined") {
			window.history.back();
		}
	};

	return (
		<button 
			onClick={handleBack} 
			className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary h-9 px-4 py-2"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-4 h-4 mr-2" aria-hidden="true">
				<path d="m12 19-7-7 7-7"></path>
				<path d="M19 12H5"></path>
			</svg>
			Travel Back
		</button>
	);
}

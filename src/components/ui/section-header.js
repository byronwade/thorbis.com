import React from "react";
import { ChevronRight } from "lucide-react";

export default function SectionHeader({ 
	title, 
	subtitle, 
	viewAllLink, 
	viewAllText = "View all" 
}) {
	return (
		<div className="flex items-center justify-between py-6 sm:py-8">
			<div className="flex flex-col space-y-2 flex-1">
				<h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight hover:text-primary transition-colors duration-200 animate-fade-in-up">
					{title}
				</h3>
				{subtitle && (
					<p className="text-sm sm:text-base text-muted-foreground animate-fade-in-up animate-delay-100">
						{subtitle}
					</p>
				)}
			</div>
			{viewAllLink && (
				<a 
					href={viewAllLink} 
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 animate-fade-in-scale animate-delay-200 font-medium px-4 py-3 rounded-xl hover:bg-muted/50 self-start sm:self-auto touch-manipulation"
				>
					{viewAllText}
					<ChevronRight className="w-4 h-4" />
				</a>
			)}
		</div>
	);
}

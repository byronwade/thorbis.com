"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "react-feather";
import { Button } from "@components/ui/button";

export default function ScrollSection({ title, link, children, subtitle, category }) {
	const scrollContainerRef = useRef(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [partiallyVisibleIndices, setPartiallyVisibleIndices] = useState({});

	const scrollBy = (distance) => {
		const scrollContainer = scrollContainerRef.current;
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: distance, behavior: "smooth" });
		}
	};

	const checkPartialVisibility = useCallback(() => {
		const scrollContainer = scrollContainerRef.current;
		if (scrollContainer) {
			const containerRect = scrollContainer.getBoundingClientRect();
			const children = Array.from(scrollContainer.children);
			children.forEach((child, index) => {
				const childRect = child.getBoundingClientRect();
				const isVisible = (childRect.left < containerRect.right && childRect.right > containerRect.right) || (childRect.right > containerRect.left && childRect.left < containerRect.left);
				setPartiallyVisibleIndices((prev) => ({
					...prev,
					[index]: isVisible,
				}));
			});
		}
	}, []);

	const handleScroll = useCallback(() => {
		const scrollContainer = scrollContainerRef.current;
		if (scrollContainer) {
			const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
			const atEnd = scrollContainer.scrollLeft >= maxScrollLeft - 1;
			const atStart = scrollContainer.scrollLeft <= 0;
			setCanScrollLeft(!atStart);
			setCanScrollRight(!atEnd);
			checkPartialVisibility();
		}
	}, [checkPartialVisibility]);

	useEffect(() => {
		handleScroll();
	}, [children, handleScroll]);

	useEffect(() => {
		const handleResize = () => handleScroll();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [handleScroll]);

	const getScrollDistance = () => {
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		return ((vw - parseFloat(getComputedStyle(document.documentElement).fontSize) * 8) / 5.5) * 3;
	};

	return (
		<div className="w-full">
			<div className="relative w-full overflow-hidden group">
				{(title || link || category) && (
					<div className="flex flex-col space-y-3 py-6 sm:py-8 lg:py-10">
						{category && (
							<div className="flex items-center space-x-2">
								<span className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full border border-primary/20">{category}</span>
							</div>
						)}
						<div className="flex items-center justify-between">
							<div className="flex flex-col space-y-2">
								{title && <h2 className="text-2xl font-bold text-foreground tracking-tight hover:text-primary transition-colors duration-200 sm:text-3xl lg:text-4xl">{title}</h2>}
								{subtitle && <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed sm:text-base lg:text-lg">{subtitle}</p>}
							</div>
							{link && (
								<Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-200 group flex-shrink-0" asChild>
									<a href={link} className="flex items-center space-x-2">
										<span className="text-sm sm:text-base">View all</span>
										<ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
									</a>
								</Button>
							)}
						</div>
					</div>
				)}
				<div className="relative">
					<div ref={scrollContainerRef} onScroll={handleScroll} className="flex flex-row gap-4 py-4 overflow-x-auto sm:gap-6 scrollbar-hide scroll-smooth" style={{ scrollBehavior: "smooth" }}>
						{React.Children.map(children, (child, idx) => (
							<div
								key={idx}
								className="flex-none relative min-w-[210px] sm:min-w-[230px] lg:min-w-[250px]"
								style={{
									aspectRatio: "1 / 1.18",
								}}
							>
								{child && React.cloneElement(child, { disabled: partiallyVisibleIndices[idx] })}
							</div>
						))}
					</div>
					{canScrollLeft && (
						<button onClick={() => scrollBy(-getScrollDistance())} className="absolute inset-y-0 left-0 z-50 items-center justify-center hidden px-2 transition-all cursor-pointer md:flex sm:px-4 lg:px-6 text-foreground hover:text-foreground group-hover:opacity-100 bg-gradient-to-r from-background/80 to-transparent pointer-events-auto" style={{ pointerEvents: "auto" }}>
							<div className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors duration-200 shadow-lg border border-border">
								<ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
							</div>
						</button>
					)}
					{canScrollRight && (
						<button onClick={() => scrollBy(getScrollDistance())} className="absolute inset-y-0 right-0 z-50 items-center justify-center hidden px-2 transition-all cursor-pointer md:flex sm:px-4 lg:px-6 text-foreground hover:text-foreground group-hover:opacity-100 bg-gradient-to-l from-background/80 to-transparent pointer-events-auto" style={{ pointerEvents: "auto" }}>
							<div className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors duration-200 shadow-lg border border-border">
								<ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
							</div>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

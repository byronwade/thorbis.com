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
		// Adjust for new larger card sizes
		return vw < 640 ? 280 : vw < 768 ? 340 : vw < 1024 ? 400 : 420;
	};

	return (
		<div className="w-full">
			<div className="relative w-full overflow-hidden group">
				{(title || link || category) && (
					<div className="flex flex-col space-y-4 py-4 sm:py-6">
						{category && (
							<div className="flex items-center space-x-2 animate-fade-in-scale">
								<span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-600/10 rounded-full">
									<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
									{category}
								</span>
							</div>
						)}
						<div className="flex items-start justify-between">
							<div className="flex flex-col space-y-2 flex-1">
								{title && <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight hover:text-blue-600 transition-colors duration-200 animate-fade-in-up">{title}</h3>}
								{subtitle && <p className="text-base text-gray-400 max-w-2xl animate-fade-in-up animate-delay-100">{subtitle}</p>}
							</div>
							{link && (
								<a href={link} className="text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200 animate-fade-in-scale animate-delay-200 font-medium">
									View all
								</a>
							)}
						</div>
					</div>
				)}
				<div className="relative">
					{/* Scroll indicators */}
					{canScrollLeft && <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-40 pointer-events-none" />}
					{canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-40 pointer-events-none" />}

					<div ref={scrollContainerRef} onScroll={handleScroll} className="flex flex-row gap-4 sm:gap-6 py-4 overflow-x-auto scrollbar-hide scroll-smooth" style={{ scrollBehavior: "smooth" }}>
						{React.Children.map(children, (child, idx) => (
							<div 
								key={idx} 
								className={`flex-none relative w-[260px] sm:w-[320px] md:w-[380px] animate-fade-in-scale animate-delay-${Math.min(idx * 100, 500)}`}
								style={{
									animationDelay: `${Math.min(idx * 0.1, 0.5)}s`
								}}
							>
								{React.cloneElement(child, { disabled: partiallyVisibleIndices[idx] })}
							</div>
						))}
					</div>

					{/* Navigation Arrows with Thorbis Design System */}
					{canScrollLeft && (
						<button onClick={() => scrollBy(-getScrollDistance())} className="absolute inset-y-0 left-0 z-50 items-center justify-center flex px-2 lg:px-3 text-white hover:text-blue-600 transition-all duration-300 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent opacity-0 group-hover:opacity-100" style={{ pointerEvents: "auto" }}>
							<div className="p-2 lg:p-3 rounded-full bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700 hover:scale-105">
								<ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
							</div>
						</button>
					)}
					{canScrollRight && (
						<button onClick={() => scrollBy(getScrollDistance())} className="absolute inset-y-0 right-0 z-50 items-center justify-center flex px-2 lg:px-3 text-white hover:text-blue-600 transition-all duration-300 bg-gradient-to-l from-gray-900/95 via-gray-900/80 to-transparent opacity-0 group-hover:opacity-100" style={{ pointerEvents: "auto" }}>
							<div className="p-2 lg:p-3 rounded-full bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700 hover:scale-105">
								<ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
							</div>
						</button>
					)}

					{/* Mobile indicators with Thorbis colors */}
					{children.length > 2 && (
						<div className="flex justify-center mt-3 md:hidden">
							<div className="flex gap-1">
								{Array.from({ length: Math.min(5, children.length) }).map((_, idx) => (
									<div key={idx} className={`w-2 h-2 rounded-full transition-colors duration-200 ${idx === 0 ? "bg-blue-600" : "bg-gray-600"}`} />
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

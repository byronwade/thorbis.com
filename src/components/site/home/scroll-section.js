"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "react-feather";
import { Button } from "@components/ui/button";

export default function ScrollSection({ title, link, children, subtitle, category }) {
	const scrollContainerRef = useRef(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [partiallyVisibleIndices, setPartiallyVisibleIndices] = useState({});
	const [isScrolling, setIsScrolling] = useState(false);

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

	// Touch handling for bidirectional scrolling
	const touchStartRef = useRef({ x: 0, y: 0 });
	const touchMoveRef = useRef({ x: 0, y: 0 });

	const handleTouchStart = useCallback((e) => {
		const touch = e.touches[0];
		touchStartRef.current = { x: touch.clientX, y: touch.clientY };
		touchMoveRef.current = { x: touch.clientX, y: touch.clientY };
		setIsScrolling(false);
	}, []);

	const handleTouchMove = useCallback((e) => {
		const touch = e.touches[0];
		const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
		const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
		
		// Determine if this is primarily a horizontal or vertical gesture
		if (deltaX > deltaY && deltaX > 10) {
			// Horizontal gesture - allow horizontal scrolling
			setIsScrolling(true);
			e.preventDefault();
		} else if (deltaY > deltaX && deltaY > 10) {
			// Vertical gesture - allow vertical scrolling
			setIsScrolling(false);
		}
		
		touchMoveRef.current = { x: touch.clientX, y: touch.clientY };
	}, []);

	const handleTouchEnd = useCallback(() => {
		setIsScrolling(false);
	}, []);

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
		// Mobile-optimized scroll distances
		return vw < 640 ? 320 : vw < 768 ? 360 : vw < 1024 ? 400 : 420;
	};

	return (
		<div className="w-full">
			<div className="relative w-full overflow-hidden group">
				{(title || subtitle || link) && (
					<div className="flex items-center justify-between py-6 sm:py-8">
						<div className="flex flex-col space-y-2 flex-1">
							{title && (
								<h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight hover:text-primary transition-colors duration-200 animate-fade-in-up">
									{title}
								</h3>
							)}
							{subtitle && (
								<p className="text-sm sm:text-base text-muted-foreground leading-relaxed animate-fade-in-up animate-delay-100">
									{subtitle}
								</p>
							)}
						</div>
						{link && (
							<a
								href={link}
								className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 animate-fade-in-scale animate-delay-200 font-medium px-4 py-3 rounded-xl hover:bg-muted/50 self-start sm:self-auto touch-manipulation"
							>
								View all
								<ArrowRight className="w-4 h-4" />
							</a>
						)}
					</div>
				)}
				<div className="relative">
					{/* Enhanced scroll indicators for mobile - only show on desktop */}
					{canScrollLeft && (
						<div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-background via-background/80 to-transparent z-40 pointer-events-none hidden md:block" />
					)}
					{canScrollRight && (
						<div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-background via-background/80 to-transparent z-40 pointer-events-none hidden md:block" />
					)}

					{/* Native mobile scroll container with bidirectional scrolling */}
					<div
						ref={scrollContainerRef}
						onScroll={handleScroll}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						className="flex flex-row gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory overscroll-x-contain"
						style={{ 
							scrollBehavior: "smooth",
							touchAction: isScrolling ? "pan-x" : "pan-x pan-y"
						}}
					>
						{React.Children.map(children, (child, idx) => (
							<div
								key={idx}
								className={`flex-none relative w-[280px] sm:w-[320px] md:w-[360px] animate-fade-in-scale animate-delay-${Math.min(idx * 100, 500)} snap-start`}
								style={{
									animationDelay: `${Math.min(idx * 0.1, 0.5)}s`
								}}
							>
								{child && React.cloneElement(child, { disabled: partiallyVisibleIndices[idx] })}
							</div>
						))}
					</div>

					{/* Navigation Arrows - ONLY on desktop (md and up) */}
					{canScrollLeft && (
						<button
							onClick={() => scrollBy(-getScrollDistance())}
							className="absolute inset-y-0 left-0 z-50 items-center justify-center flex px-2 sm:px-3 lg:px-4 text-foreground hover:text-primary transition-all duration-300 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 touch-manipulation hidden md:flex"
							style={{ pointerEvents: "auto" }}
						>
							<div className="p-2.5 sm:p-3 lg:p-4 rounded-full bg-card/95 backdrop-blur-sm hover:bg-muted transition-all duration-300 shadow-lg hover:shadow-xl border border-border/50 hover:border-primary/30 hover:scale-105 active:scale-95">
								<ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
							</div>
						</button>
					)}
					{canScrollRight && (
						<button
							onClick={() => scrollBy(getScrollDistance())}
							className="absolute inset-y-0 right-0 z-50 items-center justify-center flex px-2 sm:px-3 lg:px-4 text-foreground hover:text-primary transition-all duration-300 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 touch-manipulation hidden md:flex"
							style={{ pointerEvents: "auto" }}
						>
							<div className="p-2.5 sm:p-3 lg:p-4 rounded-full bg-card/95 backdrop-blur-sm hover:bg-muted transition-all duration-300 shadow-lg hover:shadow-xl border border-border/50 hover:border-primary/30 hover:scale-105 active:scale-95">
								<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
							</div>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

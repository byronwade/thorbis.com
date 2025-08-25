"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "@components/shared/image";

// Use all available placeholder images for visual variety
const images = [
	"/placeholder-restaurant.svg",
	"/placeholder-business.svg",
	"/placeholder-medical.svg",
	"/placeholder-services.svg",
	"/placeholder-shopping.svg",
	"/placeholder-entertainment.svg",
	"/placeholder-auto.svg",
	"/placeholder-spa.svg",
	"/placeholder-image.svg",
	"/placeholder-avatar.svg",
	// Add some repeats for the grid
	"/placeholder-restaurant.svg",
	"/placeholder-business.svg",
];

const ImageGrid = () => {
	const [currentImages, setCurrentImages] = useState([]);

	useEffect(() => {
		const interval = setInterval(() => {
			const shuffled = [...images].sort(() => 0.5 - Math.random());
			setCurrentImages(shuffled.slice(0, 8));
		}, 5000);

		// Initial load
		const shuffled = [...images].sort(() => 0.5 - Math.random());
		setCurrentImages(shuffled.slice(0, 8));

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
			<div className="grid grid-cols-4 grid-rows-2 gap-2 h-full w-full min-h-[400px]">
				<AnimatePresence>
					{currentImages.map((src, i) => (
						<motion.div key={src + i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }} className="relative w-full h-full min-h-[150px]">
							<Image
								src={src}
								alt={`Hero image ${i}`}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 50vw, 25vw"
								priority={i < 4} // First 4 images get priority for LCP
								fallbackSrc="/placeholder-image.svg"
							/>
							<div className="absolute inset-0 bg-black/20" />
						</motion.div>
					))}
				</AnimatePresence>
			</div>
			<div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
		</div>
	);
};

export default ImageGrid;

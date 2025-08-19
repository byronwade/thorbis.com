import React from "react";
import Image from "@components/shared/image";

// Utility function to split the media array into main and additional images
const splitMedia = (media) => {
	if (!Array.isArray(media) || media.length === 0) return { mainImage: null, additionalImages: [] };

	const [mainImage, ...additionalImages] = media;
	return {
		mainImage: mainImage || null,
		additionalImages: additionalImages || [],
	};
};

const ImagePost = ({ post }) => {
	const { content, media } = post;
	const { mainImage, additionalImages } = splitMedia(media);

	// Combine mainImage and additionalImages for accurate count
	const allImages = [mainImage, ...additionalImages].filter(Boolean);
	const imageCount = allImages.length;

	return (
		<div>
			<p className="px-4">{content}</p>
			<div className="mt-4">
				{/* Single Image */}
				{imageCount === 1 && (
					<div className="relative w-full aspect-w-1 aspect-h-1">
						<Image src={mainImage || "/placeholder.svg"} alt="Main post media" width={1920} height={1020} priority className="object-cover w-full h-full" />
					</div>
				)}

				{/* Two Images */}
				{imageCount === 2 && (
					<div className="grid grid-cols-2 gap-0">
						<div className="relative border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[0] || "/placeholder.svg"} alt="Post media 1" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-l border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[1] || "/placeholder.svg"} alt="Post media 2" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
					</div>
				)}

				{/* Three Images */}
				{imageCount === 3 && (
					<div>
						{/* Main Image */}
						<div className="relative w-full aspect-[16/8] border-b border-border">
							<Image src={allImages[0] || "/placeholder.svg"} alt="Main post media" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						{/* Additional Images */}
						<div className="grid grid-cols-2 gap-0">
							<div className="relative border-r-0 border-border aspect-w-1 aspect-h-1">
								<Image src={allImages[1] || "/placeholder.svg"} alt="Post media 2" width={1920} height={1020} priority className="object-cover w-full h-full" />
							</div>
							<div className="relative border-l border-border aspect-w-1 aspect-h-1">
								<Image src={allImages[2] || "/placeholder.svg"} alt="Post media 3" width={1920} height={1020} priority className="object-cover w-full h-full" />
							</div>
						</div>
					</div>
				)}

				{/* Four Images */}
				{imageCount === 4 && (
					<div className="grid grid-cols-2 gap-0">
						<div className="relative border-b border-r border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[0] || "/placeholder.svg"} alt="Post media 1" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-b border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[1] || "/placeholder.svg"} alt="Post media 2" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-r border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[2] || "/placeholder.svg"} alt="Post media 3" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[3] || "/placeholder.svg"} alt="Post media 4" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
					</div>
				)}

				{/* Five Images */}
				{imageCount === 5 && (
					<div className="flex">
						<div className="relative w-1/2 border-b border-r border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[0] || "/placeholder.svg"} alt="Post media 1" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="grid w-1/2 grid-cols-2 grid-rows-2 gap-0">
							<div className="relative border-b border-border aspect-w-1 aspect-h-1">
								<Image src={allImages[1] || "/placeholder.svg"} alt="Post media 2" width={1920} height={1020} priority className="object-cover w-full h-full" />
							</div>
							<div className="relative border-b border-l border-border aspect-w-1 aspect-h-1">
								<Image src={allImages[2] || "/placeholder.svg"} alt="Post media 3" width={1920} height={1020} priority className="object-cover w-full h-full" />
							</div>
							<div className="relative border-border aspect-w-1 aspect-h-1">
								<Image src={allImages[3] || "/placeholder.svg"} alt="Post media 4" width={1920} height={1020} priority className="object-cover w-full h-full" />
							</div>
							<div className="relative border-l border-border aspect-w-1 aspect-h-1">
								<Image src={allImages[4] || "/placeholder.svg"} alt="Post media 5" width={1920} height={1020} priority className="object-cover w-full h-full" />
							</div>
						</div>
					</div>
				)}

				{/* Six Images */}
				{imageCount === 6 && (
					<div className="grid grid-cols-3 grid-rows-2 gap-0">
						<div className="relative border-b border-r border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[0] || "/placeholder.svg"} alt="Post media 1" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-b border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[1] || "/placeholder.svg"} alt="Post media 2" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-b border-l border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[2] || "/placeholder.svg"} alt="Post media 3" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-r border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[3] || "/placeholder.svg"} alt="Post media 4" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[4] || "/placeholder.svg"} alt="Post media 5" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
						<div className="relative border-l border-border aspect-w-1 aspect-h-1">
							<Image src={allImages[5] || "/placeholder.svg"} alt="Post media 6" width={1920} height={1020} priority className="object-cover w-full h-full" />
						</div>
					</div>
				)}

				{/* More than Six Images */}
				{imageCount > 6 && (
					<div className="flex items-center justify-center h-24 bg-muted cursor-pointer hover:bg-muted">
						<span className="text-muted-foreground">View More</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default ImagePost;

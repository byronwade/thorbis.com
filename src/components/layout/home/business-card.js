import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "react-feather";

export default function BusinessCard({ business, disabled }) {
	const slug =
		business.slug ||
		business.name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();

	const rating = parseFloat(business.rating);

	return (
		<Link href={`/biz/${slug}`} className={`group block w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
			<div className="w-full">
				{/* Image - Better aspect ratio */}
				<div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3">
					<Image 
						className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" 
						src={business.image} 
						alt={business.name} 
						width={350} 
						height={260}
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					/>
				</div>

				{/* Business Info - Improved spacing and typography */}
				<div className="space-y-2">
					{/* Business Name - Larger font to match image */}
					<h3 className="text-base font-semibold leading-tight tracking-tight text-foreground line-clamp-1">{business.name}</h3>

					{/* Category & Location - Increased font size */}
					<div className="flex items-center text-sm font-medium text-muted-foreground">
						<span className="line-clamp-1">{business.category}</span>
						<span className="mx-2">•</span>
						<div className="flex items-center">
							<MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
							<span className="truncate">{business.location}</span>
						</div>
					</div>

					{/* Rating & Price - Larger text */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-1">
							<Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
							<span className="text-sm font-semibold text-foreground">{business.rating}</span>
							<span className="text-sm font-medium text-muted-foreground">({business.reviewCount})</span>
						</div>
						<div className="text-sm font-semibold text-foreground">{business.price}</div>
					</div>

					{/* Status - Larger status text */}
					<div className="flex items-center">
						<div className={`w-2 h-2 rounded-full mr-2 ${business.status === "Open" ? "bg-green-500" : "bg-red-500"}`} />
						<span className={`text-sm font-semibold ${business.status === "Open" ? "text-green-600" : "text-red-600"}`}>{business.status}</span>
					</div>
				</div>
			</div>
		</Link>
	);
}

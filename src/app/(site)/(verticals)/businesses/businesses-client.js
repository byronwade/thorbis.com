"use client";

import { useState } from "react";
import { Building2, MapPin, Star, Clock, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const businessTypes = ["Restaurants", "Retail", "Professional Services", "Healthcare", "Beauty & Wellness", "Entertainment", "Automotive", "Home Services"];
const businessHours = ["Open Now", "Open 24/7", "Open Late", "Open Weekends"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Business Type</h3>
				<div className="space-y-2">
					{businessTypes.map((type) => (
						<div key={type} className="flex items-center space-x-2">
							<Checkbox id={type.toLowerCase().replace(/\s+/g, "-")} />
							<Label htmlFor={type.toLowerCase().replace(/\s+/g, "-")} className="text-sm font-normal">
								{type}
							</Label>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Rating</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any rating" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any rating</SelectItem>
						<SelectItem value="4+">4+ stars</SelectItem>
						<SelectItem value="4.5+">4.5+ stars</SelectItem>
						<SelectItem value="5">5 stars only</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Price Range</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any price" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any price</SelectItem>
						<SelectItem value="$">$ - Inexpensive</SelectItem>
						<SelectItem value="$$">$$ - Moderate</SelectItem>
						<SelectItem value="$$$">$$$ - Expensive</SelectItem>
						<SelectItem value="$$$$">$$$$ - Very Expensive</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Hours</h3>
				<div className="space-y-2">
					{businessHours.map((hours) => (
						<div key={hours} className="flex items-center space-x-2">
							<Checkbox id={hours.toLowerCase().replace(/\s+/g, "-")} />
							<Label htmlFor={hours.toLowerCase().replace(/\s+/g, "-")} className="text-sm font-normal">
								{hours}
							</Label>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Distance</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any distance" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any distance</SelectItem>
						<SelectItem value="1">Within 1 mile</SelectItem>
						<SelectItem value="5">Within 5 miles</SelectItem>
						<SelectItem value="10">Within 10 miles</SelectItem>
						<SelectItem value="25">Within 25 miles</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button variant="secondary" className="w-full">
				Clear Filters
			</Button>
		</CardContent>
	</Card>
);

const BusinessListItem = ({ business }) => (
	<Card className="overflow-hidden">
		<div className="aspect-video bg-gray-200 relative">
			{business.images?.[0] ? (
				<Image 
					src={business.images[0]} 
					alt={business.name} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<Building2 className="h-12 w-12 text-gray-400" />
				</div>
			)}
			<Button 
				size="icon" 
				variant="ghost" 
				className="absolute top-2 right-2 bg-white/80 hover:bg-white"
			>
				<Heart className="h-5 w-5" />
			</Button>
		</div>
		<CardContent className="p-4">
			<div className="flex justify-between items-start mb-2">
				<div>
					<p className="font-semibold text-lg">{business.name}</p>
					<p className="text-sm text-muted-foreground">{business.category}</p>
					<p className="text-sm text-muted-foreground">{business.address}</p>
					<p className="text-sm text-muted-foreground">{business.city}, {business.state}</p>
				</div>
				<div className="text-right">
					{business.priceRange && (
						<Badge variant="outline">{business.priceRange}</Badge>
					)}
				</div>
			</div>
			
			<div className="flex items-center gap-4 text-sm text-muted-foreground my-3">
				{business.rating && (
					<div className="flex items-center gap-1">
						<Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
						<span>{business.rating}</span>
						<span>({business.reviewCount} reviews)</span>
					</div>
				)}
				{business.phone && (
					<div className="flex items-center gap-1">
						<Phone className="h-4 w-4" />
						{business.phone}
					</div>
				)}
			</div>

			{business.isOpen !== undefined && (
				<div className="flex items-center gap-1 text-sm mb-3">
					<Clock className="h-4 w-4" />
					<span className={business.isOpen ? "text-green-600" : "text-red-600"}>
						{business.isOpen ? "Open" : "Closed"}
					</span>
					{business.hours && <span className="text-muted-foreground">• {business.hours}</span>}
				</div>
			)}

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{business.description}
			</p>

			{business.services?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{business.services.slice(0, 3).map(service => (
						<Badge key={service} variant="secondary" className="text-xs">
							{service}
						</Badge>
					))}
					{business.services.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{business.services.length - 3} more
						</Badge>
					)}
				</div>
			)}

			{business.distance && (
				<div className="text-xs text-muted-foreground mb-3">
					{business.distance} miles away
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/biz/${business.slug || business.id}`}>View Business</Link>
				</Button>
				<Button variant="outline" className="flex-1">
					{business.phone ? "Call" : "Contact"}
				</Button>
			</div>
		</CardContent>
	</Card>
);

export default function BusinessesClient({ businesses = [], searchMetadata, searchParams }) {
	const router = useRouter();
	const urlSearchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams?.search || searchParams?.q || "");
	const [location, setLocation] = useState(searchParams?.location || "");

	const handleSearch = (e) => {
		e.preventDefault();
		const params = new URLSearchParams(urlSearchParams);
		if (searchQuery) params.set("search", searchQuery);
		else params.delete("search");
		if (location) params.set("location", location);
		else params.delete("location");
		router.push(`/businesses?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Discover Local Businesses</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search businesses, services, products..."
						className="flex-1"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<div className="flex items-center gap-2 px-3 border rounded-md">
						<MapPin className="h-4 w-4 text-gray-400" />
						<Input
							type="text"
							placeholder="Location"
							className="border-0 p-0 focus:ring-0"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
						/>
					</div>
					<Button type="submit">Search</Button>
				</form>
			</div>

			<div className="grid lg:grid-cols-4 gap-6">
				<div className="lg:col-span-1">
					<FilterSidebar />
				</div>
				<div className="lg:col-span-3">
					{businesses.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} businesses found
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								{businesses.map((business) => (
									<BusinessListItem key={business.id} business={business} />
								))}
							</div>
							{searchMetadata?.hasMore && (
								<div className="mt-6 text-center">
									<Button variant="outline">Load More</Button>
								</div>
							)}
						</>
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No businesses found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find businesses in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
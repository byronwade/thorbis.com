"use client";

import { useState } from "react";
import { Home, MapPin, DollarSign, Bed, Bath, Square, Calendar, Heart } from "lucide-react";
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

const propertyTypes = ["Single Family", "Condo", "Townhouse", "Multi-Family", "Manufactured", "Land"];
const listingTypes = ["For Sale", "New Construction", "Foreclosure", "Price Reduced"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Property Type</h3>
				<div className="space-y-2">
					{propertyTypes.map((type) => (
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
				<h3 className="font-semibold mb-3">Price Range</h3>
				<div className="flex gap-2">
					<Input type="number" placeholder="Min" />
					<Input type="number" placeholder="Max" />
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Bedrooms</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any</SelectItem>
						<SelectItem value="1">1+</SelectItem>
						<SelectItem value="2">2+</SelectItem>
						<SelectItem value="3">3+</SelectItem>
						<SelectItem value="4">4+</SelectItem>
						<SelectItem value="5">5+</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Bathrooms</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any</SelectItem>
						<SelectItem value="1">1+</SelectItem>
						<SelectItem value="2">2+</SelectItem>
						<SelectItem value="3">3+</SelectItem>
						<SelectItem value="4">4+</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Square Feet</h3>
				<div className="flex gap-2">
					<Input type="number" placeholder="Min sq ft" />
					<Input type="number" placeholder="Max sq ft" />
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Listing Type</h3>
				<div className="space-y-2">
					{listingTypes.map((type) => (
						<div key={type} className="flex items-center space-x-2">
							<Checkbox id={type.toLowerCase().replace(/\s+/g, "-")} />
							<Label htmlFor={type.toLowerCase().replace(/\s+/g, "-")} className="text-sm font-normal">
								{type}
							</Label>
						</div>
					))}
				</div>
			</div>

			<Button variant="secondary" className="w-full">
				Clear Filters
			</Button>
		</CardContent>
	</Card>
);

const HomeListItem = ({ home }) => (
	<Card className="overflow-hidden">
		<div className="aspect-video bg-gray-200 relative">
			{home.images?.[0] ? (
				<Image 
					src={home.images[0]} 
					alt={home.address} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<Home className="h-12 w-12 text-gray-400" />
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
					<p className="font-semibold text-xl">${home.price?.toLocaleString()}</p>
					<p className="text-sm text-muted-foreground">{home.address}</p>
					<p className="text-sm text-muted-foreground">{home.city}, {home.state} {home.zip}</p>
				</div>
				<Badge variant="outline">{home.type}</Badge>
			</div>
			
			<div className="flex gap-4 text-sm text-muted-foreground my-3">
				{home.beds && (
					<div className="flex items-center gap-1">
						<Bed className="h-4 w-4" />
						{home.beds} bed{home.beds > 1 ? "s" : ""}
					</div>
				)}
				{home.baths && (
					<div className="flex items-center gap-1">
						<Bath className="h-4 w-4" />
						{home.baths} bath{home.baths > 1 ? "s" : ""}
					</div>
				)}
				{home.sqft && (
					<div className="flex items-center gap-1">
						<Square className="h-4 w-4" />
						{home.sqft.toLocaleString()} sqft
					</div>
				)}
			</div>

			{home.lotSize && (
				<div className="text-sm text-muted-foreground mb-3">
					Lot size: {home.lotSize}
				</div>
			)}

			{home.yearBuilt && (
				<div className="text-sm text-muted-foreground mb-3">
					Built in {home.yearBuilt}
				</div>
			)}

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{home.description}
			</p>

			{home.features?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{home.features.slice(0, 3).map(feature => (
						<Badge key={feature} variant="secondary" className="text-xs">
							{feature}
						</Badge>
					))}
					{home.features.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{home.features.length - 3} more
						</Badge>
					)}
				</div>
			)}

			{home.daysOnMarket && (
				<div className="text-xs text-muted-foreground mb-3">
					On market for {home.daysOnMarket} days
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/homes/${home.id}`}>View Details</Link>
				</Button>
				<Button variant="outline" className="flex-1">Contact Agent</Button>
			</div>
		</CardContent>
	</Card>
);

export default function HomesClient({ homes = [], searchMetadata, searchParams }) {
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
		router.push(`/homes?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Find Your Dream Home</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search by address, neighborhood, features..."
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
					{homes.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} homes found
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								{homes.map((home) => (
									<HomeListItem key={home.id} home={home} />
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
								<Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No homes found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find available properties in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
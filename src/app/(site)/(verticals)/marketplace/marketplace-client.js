"use client";

import { useState } from "react";
import { ShoppingBag, MapPin, DollarSign, Star, Heart, Package } from "lucide-react";
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

const itemTypes = ["Electronics", "Furniture", "Clothing", "Books", "Sports", "Toys", "Home & Garden", "Automotive"];
const conditions = ["New", "Like New", "Good", "Fair", "For Parts"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Category</h3>
				<div className="space-y-2">
					{itemTypes.map((type) => (
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
				<h3 className="font-semibold mb-3">Condition</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any condition" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any condition</SelectItem>
						{conditions.map(condition => (
							<SelectItem key={condition} value={condition.toLowerCase().replace(/\s+/g, "-")}>
								{condition}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Distance</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any distance" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any distance</SelectItem>
						<SelectItem value="5">Within 5 miles</SelectItem>
						<SelectItem value="10">Within 10 miles</SelectItem>
						<SelectItem value="25">Within 25 miles</SelectItem>
						<SelectItem value="50">Within 50 miles</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button variant="secondary" className="w-full">
				Clear Filters
			</Button>
		</CardContent>
	</Card>
);

const MarketplaceListItem = ({ item }) => (
	<Card className="overflow-hidden">
		<div className="aspect-square bg-gray-200 relative">
			{item.images?.[0] ? (
				<Image 
					src={item.images[0]} 
					alt={item.title} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<Package className="h-12 w-12 text-gray-400" />
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
					<p className="font-semibold text-lg">{item.title}</p>
					<p className="text-sm text-muted-foreground">{item.seller}</p>
					<p className="text-sm text-muted-foreground">{item.location}</p>
				</div>
				<Badge variant="outline">{item.condition}</Badge>
			</div>
			
			<div className="flex items-center justify-between my-3">
				<p className="text-xl font-bold text-green-600">${item.price}</p>
				{item.rating && (
					<div className="flex items-center gap-1">
						<Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
						<span className="text-sm">{item.rating}</span>
					</div>
				)}
			</div>

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{item.description}
			</p>

			{item.tags?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{item.tags.slice(0, 3).map(tag => (
						<Badge key={tag} variant="secondary" className="text-xs">
							{tag}
						</Badge>
					))}
					{item.tags.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{item.tags.length - 3} more
						</Badge>
					)}
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/marketplace/${item.id}`}>View Item</Link>
				</Button>
				<Button variant="outline" className="flex-1">Message</Button>
			</div>
		</CardContent>
	</Card>
);

export default function MarketplaceClient({ items = [], searchMetadata, searchParams }) {
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
		router.push(`/marketplace?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Local Marketplace</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search items, brands, categories..."
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
					{items.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} items found
							</p>
							<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
								{items.map((item) => (
									<MarketplaceListItem key={item.id} item={item} />
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
								<ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No items found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find great deals in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
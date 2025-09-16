"use client";

import { useState } from "react";
import { Tag, MapPin, Clock, Percent, Heart, Gift } from "lucide-react";
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

const dealTypes = ["Restaurant", "Retail", "Services", "Entertainment", "Travel", "Health & Beauty", "Automotive", "Home & Garden"];
const discountRanges = ["Up to 25%", "25-50%", "50-75%", "75%+"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Category</h3>
				<div className="space-y-2">
					{dealTypes.map((type) => (
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
				<h3 className="font-semibold mb-3">Discount</h3>
				<div className="space-y-2">
					{discountRanges.map((range) => (
						<div key={range} className="flex items-center space-x-2">
							<Checkbox id={range.replace(/\s+/g, "-").toLowerCase()} />
							<Label htmlFor={range.replace(/\s+/g, "-").toLowerCase()} className="text-sm font-normal">
								{range}
							</Label>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Expiring Soon</h3>
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox id="expires-today" />
						<Label htmlFor="expires-today" className="text-sm font-normal">Today</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox id="expires-this-week" />
						<Label htmlFor="expires-this-week" className="text-sm font-normal">This week</Label>
					</div>
				</div>
			</div>

			<Button variant="secondary" className="w-full">
				Clear Filters
			</Button>
		</CardContent>
	</Card>
);

const DealListItem = ({ deal }) => (
	<Card className="overflow-hidden">
		<div className="aspect-video bg-gray-200 relative">
			{deal.images?.[0] ? (
				<Image 
					src={deal.images[0]} 
					alt={deal.title} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<Gift className="h-12 w-12 text-gray-400" />
				</div>
			)}
			<Button 
				size="icon" 
				variant="ghost" 
				className="absolute top-2 right-2 bg-white/80 hover:bg-white"
			>
				<Heart className="h-5 w-5" />
			</Button>
			<div className="absolute top-2 left-2">
				<Badge variant="destructive" className="bg-red-500">
					{deal.discount}% OFF
				</Badge>
			</div>
		</div>
		<CardContent className="p-4">
			<div className="flex justify-between items-start mb-2">
				<div>
					<p className="font-semibold text-lg">{deal.title}</p>
					<p className="text-sm text-muted-foreground">{deal.business}</p>
					<p className="text-sm text-muted-foreground">{deal.address}</p>
				</div>
				<Badge variant="outline">{deal.category}</Badge>
			</div>
			
			<div className="flex items-center gap-4 text-sm text-muted-foreground my-3">
				<div className="flex items-center gap-1">
					<Tag className="h-4 w-4" />
					<span className="line-through">${deal.originalPrice}</span>
					<span className="font-bold text-green-600">${deal.salePrice}</span>
				</div>
				{deal.expiresAt && (
					<div className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						Expires {deal.expiresAt}
					</div>
				)}
			</div>

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{deal.description}
			</p>

			{deal.restrictions && (
				<p className="text-xs text-orange-600 mb-3">
					{deal.restrictions}
				</p>
			)}

			{deal.tags?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{deal.tags.slice(0, 3).map(tag => (
						<Badge key={tag} variant="secondary" className="text-xs">
							{tag}
						</Badge>
					))}
					{deal.tags.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{deal.tags.length - 3} more
						</Badge>
					)}
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/deals/${deal.id}`}>Get Deal</Link>
				</Button>
				<Button variant="outline" className="flex-1">
					Save ${(deal.originalPrice - deal.salePrice).toFixed(2)}
				</Button>
			</div>
		</CardContent>
	</Card>
);

export default function DealsClient({ deals = [], searchMetadata, searchParams }) {
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
		router.push(`/deals?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Local Deals & Offers</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search deals, businesses, categories..."
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
					{deals.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} deals found
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								{deals.map((deal) => (
									<DealListItem key={deal.id} deal={deal} />
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
								<Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No deals found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find amazing deals in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
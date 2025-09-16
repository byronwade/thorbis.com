"use client";

import { useState } from "react";
import { Wrench, MapPin, Star, Clock, DollarSign, Heart } from "lucide-react";
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

const serviceTypes = ["Home Improvement", "Cleaning", "Automotive", "Technology", "Health & Beauty", "Legal", "Financial", "Pet Services"];
const availability = ["Emergency 24/7", "Same Day", "Next Day", "Within a Week"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Service Type</h3>
				<div className="space-y-2">
					{serviceTypes.map((type) => (
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
				<h3 className="font-semibold mb-3">Availability</h3>
				<div className="space-y-2">
					{availability.map((avail) => (
						<div key={avail} className="flex items-center space-x-2">
							<Checkbox id={avail.toLowerCase().replace(/\s+/g, "-")} />
							<Label htmlFor={avail.toLowerCase().replace(/\s+/g, "-")} className="text-sm font-normal">
								{avail}
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

const ServiceListItem = ({ service }) => (
	<Card className="overflow-hidden">
		<div className="aspect-video bg-gray-200 relative">
			{service.images?.[0] ? (
				<Image 
					src={service.images[0]} 
					alt={service.name} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<Wrench className="h-12 w-12 text-gray-400" />
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
					<p className="font-semibold text-lg">{service.name}</p>
					<p className="text-sm text-muted-foreground">{service.provider}</p>
					<p className="text-sm text-muted-foreground">{service.location}</p>
				</div>
				<Badge variant="outline">{service.category}</Badge>
			</div>
			
			<div className="flex items-center gap-4 text-sm text-muted-foreground my-3">
				{service.rating && (
					<div className="flex items-center gap-1">
						<Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
						<span>{service.rating}</span>
						<span>({service.reviewCount} reviews)</span>
					</div>
				)}
				{service.priceRange && (
					<div className="flex items-center gap-1">
						<DollarSign className="h-4 w-4" />
						{service.priceRange}
					</div>
				)}
			</div>

			{service.responseTime && (
				<div className="flex items-center gap-1 text-sm text-green-600 mb-3">
					<Clock className="h-4 w-4" />
					Responds in {service.responseTime}
				</div>
			)}

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{service.description}
			</p>

			{service.specialties?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{service.specialties.slice(0, 3).map(specialty => (
						<Badge key={specialty} variant="secondary" className="text-xs">
							{specialty}
						</Badge>
					))}
					{service.specialties.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{service.specialties.length - 3} more
						</Badge>
					)}
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/services/${service.id}`}>View Details</Link>
				</Button>
				<Button variant="outline" className="flex-1">Get Quote</Button>
			</div>
		</CardContent>
	</Card>
);

export default function ServicesClient({ services = [], searchMetadata, searchParams }) {
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
		router.push(`/services?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Find Local Services</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search services, contractors, professionals..."
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
					{services.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} services found
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								{services.map((service) => (
									<ServiceListItem key={service.id} service={service} />
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
								<Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No services found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find qualified service providers in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
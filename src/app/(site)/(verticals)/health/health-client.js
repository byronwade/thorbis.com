"use client";

import { useState } from "react";
import { Stethoscope, MapPin, Star, Clock, Calendar, Heart } from "lucide-react";
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

const healthTypes = ["Primary Care", "Dental", "Vision", "Mental Health", "Specialists", "Urgent Care", "Physical Therapy", "Alternative Medicine"];
const insuranceTypes = ["Medicaid", "Medicare", "Blue Cross", "Aetna", "UnitedHealth", "Cigna", "Kaiser", "Humana"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Provider Type</h3>
				<div className="space-y-2">
					{healthTypes.map((type) => (
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
				<h3 className="font-semibold mb-3">Insurance Accepted</h3>
				<div className="space-y-2">
					{insuranceTypes.slice(0, 5).map((insurance) => (
						<div key={insurance} className="flex items-center space-x-2">
							<Checkbox id={insurance.toLowerCase().replace(/\s+/g, "-")} />
							<Label htmlFor={insurance.toLowerCase().replace(/\s+/g, "-")} className="text-sm font-normal">
								{insurance}
							</Label>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Availability</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any time" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any time</SelectItem>
						<SelectItem value="today">Today</SelectItem>
						<SelectItem value="this-week">This week</SelectItem>
						<SelectItem value="next-week">Next week</SelectItem>
						<SelectItem value="accepting-new">Accepting new patients</SelectItem>
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
					</SelectContent>
				</Select>
			</div>

			<Button variant="secondary" className="w-full">
				Clear Filters
			</Button>
		</CardContent>
	</Card>
);

const HealthListItem = ({ provider }) => (
	<Card className="overflow-hidden">
		<div className="aspect-video bg-gray-200 relative">
			{provider.images?.[0] ? (
				<Image 
					src={provider.images[0]} 
					alt={provider.name} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<Stethoscope className="h-12 w-12 text-gray-400" />
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
					<p className="font-semibold text-lg">{provider.name}</p>
					<p className="text-sm text-muted-foreground">{provider.credentials}</p>
					<p className="text-sm text-muted-foreground">{provider.practice}</p>
					<p className="text-sm text-muted-foreground">{provider.address}</p>
				</div>
				<Badge variant="outline">{provider.type}</Badge>
			</div>
			
			<div className="flex items-center gap-4 text-sm text-muted-foreground my-3">
				{provider.rating && (
					<div className="flex items-center gap-1">
						<Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
						<span>{provider.rating}</span>
						<span>({provider.reviewCount} reviews)</span>
					</div>
				)}
				{provider.nextAvailable && (
					<div className="flex items-center gap-1">
						<Calendar className="h-4 w-4" />
						Next: {provider.nextAvailable}
					</div>
				)}
			</div>

			{provider.acceptingNew && (
				<div className="flex items-center gap-1 text-sm text-green-600 mb-3">
					<Clock className="h-4 w-4" />
					Accepting new patients
				</div>
			)}

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{provider.description}
			</p>

			{provider.specialties?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{provider.specialties.slice(0, 3).map(specialty => (
						<Badge key={specialty} variant="secondary" className="text-xs">
							{specialty}
						</Badge>
					))}
					{provider.specialties.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{provider.specialties.length - 3} more
						</Badge>
					)}
				</div>
			)}

			{provider.insuranceAccepted?.length > 0 && (
				<div className="text-xs text-muted-foreground mb-3">
					Accepts: {provider.insuranceAccepted.slice(0, 3).join(", ")}
					{provider.insuranceAccepted.length > 3 && ` +${provider.insuranceAccepted.length - 3} more`}
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/health/${provider.id}`}>View Profile</Link>
				</Button>
				<Button variant="outline" className="flex-1">Book Appointment</Button>
			</div>
		</CardContent>
	</Card>
);

export default function HealthClient({ providers = [], searchMetadata, searchParams }) {
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
		router.push(`/health?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Find Healthcare Providers</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search doctors, specialists, conditions..."
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
					{providers.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} providers found
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								{providers.map((provider) => (
									<HealthListItem key={provider.id} provider={provider} />
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
								<Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No providers found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find healthcare providers in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
"use client";

import { useState } from "react";
import { Car, MapPin, Gauge, Fuel, Calendar, Heart } from "lucide-react";
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

const carMakes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes", "Audi", "Hyundai", "Volkswagen"];
const bodyTypes = ["Sedan", "SUV", "Truck", "Coupe", "Convertible", "Hatchback", "Wagon", "Minivan"];
const fuelTypes = ["Gasoline", "Hybrid", "Electric", "Diesel"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Make</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any make" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any make</SelectItem>
						{carMakes.map(make => (
							<SelectItem key={make} value={make.toLowerCase()}>
								{make}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			
			<div>
				<h3 className="font-semibold mb-3">Price Range</h3>
				<div className="flex gap-2">
					<Input type="number" placeholder="Min" />
					<Input type="number" placeholder="Max" />
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Year Range</h3>
				<div className="flex gap-2">
					<Input type="number" placeholder="Min Year" />
					<Input type="number" placeholder="Max Year" />
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Mileage</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any mileage" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any mileage</SelectItem>
						<SelectItem value="under-25k">Under 25,000</SelectItem>
						<SelectItem value="25k-50k">25,000 - 50,000</SelectItem>
						<SelectItem value="50k-75k">50,000 - 75,000</SelectItem>
						<SelectItem value="75k-100k">75,000 - 100,000</SelectItem>
						<SelectItem value="over-100k">Over 100,000</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Body Type</h3>
				<div className="space-y-2">
					{bodyTypes.map((type) => (
						<div key={type} className="flex items-center space-x-2">
							<Checkbox id={type.toLowerCase()} />
							<Label htmlFor={type.toLowerCase()} className="text-sm font-normal">
								{type}
							</Label>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Fuel Type</h3>
				<div className="space-y-2">
					{fuelTypes.map((fuel) => (
						<div key={fuel} className="flex items-center space-x-2">
							<Checkbox id={fuel.toLowerCase()} />
							<Label htmlFor={fuel.toLowerCase()} className="text-sm font-normal">
								{fuel}
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

const CarListItem = ({ car }) => (
	<Card className="overflow-hidden">
		<div className="aspect-video bg-gray-200 relative">
			{car.images?.[0] ? (
				<Image 
					src={car.images[0]} 
					alt={`${car.year} ${car.make} ${car.model}`} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<Car className="h-12 w-12 text-gray-400" />
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
					<p className="font-semibold text-lg">{car.year} {car.make} {car.model}</p>
					<p className="text-sm text-muted-foreground">{car.trim}</p>
					<p className="text-sm text-muted-foreground">{car.dealer || car.seller}</p>
					<p className="text-sm text-muted-foreground">{car.location}</p>
				</div>
				<Badge variant="outline">{car.condition}</Badge>
			</div>
			
			<div className="text-xl font-bold text-green-600 mb-3">
				${car.price?.toLocaleString() || "Call for price"}
			</div>

			<div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
				{car.mileage && (
					<div className="flex items-center gap-1">
						<Gauge className="h-4 w-4" />
						{car.mileage.toLocaleString()} mi
					</div>
				)}
				{car.fuelType && (
					<div className="flex items-center gap-1">
						<Fuel className="h-4 w-4" />
						{car.fuelType}
					</div>
				)}
				{car.transmission && (
					<div className="flex items-center gap-1">
						<Calendar className="h-4 w-4" />
						{car.transmission}
					</div>
				)}
			</div>

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{car.description}
			</p>

			{car.features?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{car.features.slice(0, 3).map(feature => (
						<Badge key={feature} variant="secondary" className="text-xs">
							{feature}
						</Badge>
					))}
					{car.features.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{car.features.length - 3} more
						</Badge>
					)}
				</div>
			)}

			{car.mpg && (
				<div className="text-xs text-muted-foreground mb-3">
					Fuel Economy: {car.mpg.city}/{car.mpg.highway} city/hwy mpg
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/cars/${car.id}`}>View Details</Link>
				</Button>
				<Button variant="outline" className="flex-1">Contact Dealer</Button>
			</div>
		</CardContent>
	</Card>
);

export default function CarsClient({ cars = [], searchMetadata, searchParams }) {
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
		router.push(`/cars?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Find Your Next Car</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search by make, model, year..."
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
					{cars.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} cars found
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								{cars.map((car) => (
									<CarListItem key={car.id} car={car} />
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
								<Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No cars found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find vehicles in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
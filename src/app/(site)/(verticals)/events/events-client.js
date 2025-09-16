"use client";

import { useState } from "react";
import { Calendar, MapPin, Clock, Users, Tag, Heart } from "lucide-react";
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

const eventTypes = ["Concert", "Conference", "Workshop", "Sports", "Festival", "Meetup", "Networking", "Exhibition"];
const categories = ["Music", "Business", "Technology", "Sports", "Food & Drink", "Arts & Culture", "Health & Wellness", "Education"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Event Type</h3>
				<div className="space-y-2">
					{eventTypes.map((type) => (
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
				<h3 className="font-semibold mb-3">Price Range</h3>
				<div className="flex gap-2">
					<Input type="number" placeholder="Min" />
					<Input type="number" placeholder="Max" />
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Date</h3>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Any time" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="any">Any time</SelectItem>
						<SelectItem value="today">Today</SelectItem>
						<SelectItem value="tomorrow">Tomorrow</SelectItem>
						<SelectItem value="this-week">This week</SelectItem>
						<SelectItem value="this-month">This month</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Category</h3>
				<div className="space-y-2">
					{categories.map((category) => (
						<div key={category} className="flex items-center space-x-2">
							<Checkbox id={category.toLowerCase().replace(/\s+/g, "-")} />
							<Label htmlFor={category.toLowerCase().replace(/\s+/g, "-")} className="text-sm font-normal">
								{category}
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

const EventListItem = ({ event }) => (
	<Card className="overflow-hidden">
		<div className="aspect-video bg-gray-200 relative">
			{event.images?.[0] ? (
				<Image 
					src={event.images[0]} 
					alt={event.title} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<Calendar className="h-12 w-12 text-gray-400" />
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
					<p className="font-semibold text-xl">{event.title}</p>
					<p className="text-sm text-muted-foreground">{event.venue}</p>
					<p className="text-sm text-muted-foreground">{event.address}</p>
				</div>
				<Badge variant="outline">{event.type}</Badge>
			</div>
			
			<div className="flex gap-4 text-sm text-muted-foreground my-3">
				{event.date && (
					<div className="flex items-center gap-1">
						<Calendar className="h-4 w-4" />
						{event.date}
					</div>
				)}
				{event.time && (
					<div className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						{event.time}
					</div>
				)}
				{event.capacity && (
					<div className="flex items-center gap-1">
						<Users className="h-4 w-4" />
						{event.capacity} capacity
					</div>
				)}
			</div>

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{event.description}
			</p>

			{event.tags?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{event.tags.slice(0, 3).map(tag => (
						<Badge key={tag} variant="secondary" className="text-xs">
							{tag}
						</Badge>
					))}
					{event.tags.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{event.tags.length - 3} more
						</Badge>
					)}
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/events/${event.id}`}>View Details</Link>
				</Button>
				<Button variant="outline" className="flex-1">
					{event.price ? `$${event.price}` : "Free"}
				</Button>
			</div>
		</CardContent>
	</Card>
);

export default function EventsClient({ events = [], searchMetadata, searchParams }) {
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
		router.push(`/events?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Discover Local Events</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search events, venues, artists..."
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
					{events.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} events found
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								{events.map((event) => (
									<EventListItem key={event.id} event={event} />
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
								<Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No events found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find exciting events in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
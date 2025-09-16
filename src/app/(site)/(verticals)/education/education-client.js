"use client";

import { useState } from "react";
import { GraduationCap, MapPin, Star, Users, DollarSign, Heart } from "lucide-react";
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

const educationTypes = ["K-12 Schools", "Colleges", "Universities", "Trade Schools", "Online Courses", "Tutoring", "Test Prep", "Adult Education"];
const levelOptions = ["Elementary", "Middle School", "High School", "Undergraduate", "Graduate", "Professional", "Adult Learning"];

const FilterSidebar = () => (
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div>
				<h3 className="font-semibold mb-3">Education Type</h3>
				<div className="space-y-2">
					{educationTypes.map((type) => (
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
				<h3 className="font-semibold mb-3">Tuition Range</h3>
				<div className="flex gap-2">
					<Input type="number" placeholder="Min" />
					<Input type="number" placeholder="Max" />
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Level</h3>
				<div className="space-y-2">
					{levelOptions.map((level) => (
						<div key={level} className="flex items-center space-x-2">
							<Checkbox id={level.toLowerCase().replace(/\s+/g, "-")} />
							<Label htmlFor={level.toLowerCase().replace(/\s+/g, "-")} className="text-sm font-normal">
								{level}
							</Label>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-3">Program Type</h3>
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox id="full-time" />
						<Label htmlFor="full-time" className="text-sm font-normal">Full-time</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox id="part-time" />
						<Label htmlFor="part-time" className="text-sm font-normal">Part-time</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox id="online" />
						<Label htmlFor="online" className="text-sm font-normal">Online</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox id="hybrid" />
						<Label htmlFor="hybrid" className="text-sm font-normal">Hybrid</Label>
					</div>
				</div>
			</div>

			<Button variant="secondary" className="w-full">
				Clear Filters
			</Button>
		</CardContent>
	</Card>
);

const EducationListItem = ({ institution }) => (
	<Card className="overflow-hidden">
		<div className="aspect-video bg-gray-200 relative">
			{institution.images?.[0] ? (
				<Image 
					src={institution.images[0]} 
					alt={institution.name} 
					fill 
					className="object-cover"
				/>
			) : (
				<div className="flex items-center justify-center h-full">
					<GraduationCap className="h-12 w-12 text-gray-400" />
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
					<p className="font-semibold text-lg">{institution.name}</p>
					<p className="text-sm text-muted-foreground">{institution.type}</p>
					<p className="text-sm text-muted-foreground">{institution.location}</p>
				</div>
				<Badge variant="outline">{institution.accreditation}</Badge>
			</div>
			
			<div className="flex items-center gap-4 text-sm text-muted-foreground my-3">
				{institution.rating && (
					<div className="flex items-center gap-1">
						<Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
						<span>{institution.rating}</span>
						<span>({institution.reviewCount} reviews)</span>
					</div>
				)}
				{institution.enrollment && (
					<div className="flex items-center gap-1">
						<Users className="h-4 w-4" />
						{institution.enrollment} students
					</div>
				)}
				{institution.tuition && (
					<div className="flex items-center gap-1">
						<DollarSign className="h-4 w-4" />
						${institution.tuition}/year
					</div>
				)}
			</div>

			<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
				{institution.description}
			</p>

			{institution.programs?.length > 0 && (
				<div className="flex gap-2 flex-wrap mb-3">
					{institution.programs.slice(0, 3).map(program => (
						<Badge key={program} variant="secondary" className="text-xs">
							{program}
						</Badge>
					))}
					{institution.programs.length > 3 && (
						<Badge variant="secondary" className="text-xs">
							+{institution.programs.length - 3} more programs
						</Badge>
					)}
				</div>
			)}

			{institution.features?.length > 0 && (
				<div className="text-xs text-muted-foreground mb-3">
					Features: {institution.features.slice(0, 3).join(", ")}
					{institution.features.length > 3 && ` +${institution.features.length - 3} more`}
				</div>
			)}
			
			<div className="flex gap-2 pt-3 border-t">
				<Button asChild className="flex-1">
					<Link href={`/education/${institution.id}`}>View Details</Link>
				</Button>
				<Button variant="outline" className="flex-1">
					{institution.applicationDeadline ? "Apply Now" : "Get Info"}
				</Button>
			</div>
		</CardContent>
	</Card>
);

export default function EducationClient({ institutions = [], searchMetadata, searchParams }) {
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
		router.push(`/education?${params.toString()}`);
	};

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Find Educational Opportunities</h1>
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						placeholder="Search schools, programs, courses..."
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
					{institutions.length > 0 ? (
						<>
							<p className="text-muted-foreground mb-4">
								{searchMetadata?.total || 0} educational institutions found
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								{institutions.map((institution) => (
									<EducationListItem key={institution.id} institution={institution} />
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
								<GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">No institutions found</h3>
								<p className="text-muted-foreground">
									Try adjusting your search or filters to find educational opportunities in your area.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
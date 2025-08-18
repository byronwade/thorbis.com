"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { MapPin, Star, Clock, Phone, Globe, Grid, List, Map } from "lucide-react";
import { Skeleton } from "@components/ui/skeleton";
import { useBusinessStore } from "@store/business";
import logger from "@utils/logger";

export default function SearchResults() {
	const searchParams = useSearchParams();
	const query = searchParams.get("query") || "";
	const location = searchParams.get("location") || "";

	const [viewMode, setViewMode] = useState("grid"); // grid, list, map
	const [sortBy, setSortBy] = useState("relevance");
	const [filterOpen, setFilterOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [businesses, setBusinesses] = useState([]);
	const [filteredBusinesses, setFilteredBusinesses] = useState([]);

	const { fetchBusinesses } = useBusinessStore();

	useEffect(() => {
		const loadBusinesses = async () => {
			try {
				setLoading(true);
				// For now, we'll use the existing business store
				// In a real app, you'd fetch based on search query and location
				const businessData = await fetchBusinesses();
				setBusinesses(businessData || []);

				// Filter businesses based on search query
				if (query) {
					const filtered = businessData.filter((business) => business.name?.toLowerCase().includes(query.toLowerCase()) || business.description?.toLowerCase().includes(query.toLowerCase()) || business.category?.toLowerCase().includes(query.toLowerCase()));
					setFilteredBusinesses(filtered);
				} else {
					setFilteredBusinesses(businessData || []);
				}
			} catch (error) {
				logger.error("Error loading businesses:", error);
				setBusinesses([]);
				setFilteredBusinesses([]);
			} finally {
				setLoading(false);
			}
		};

		loadBusinesses();
	}, [query, location, fetchBusinesses]);

	const handleSortChange = (value) => {
		setSortBy(value);
		let sorted = [...filteredBusinesses];

		switch (value) {
			case "rating":
				sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
				break;
			case "distance":
				// For now, just sort alphabetically as we don't have distance data
				sorted.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "name":
				sorted.sort((a, b) => a.name.localeCompare(b.name));
				break;
			default: // relevance
				// Keep original order for relevance
				break;
		}

		setFilteredBusinesses(sorted);
	};

	const BusinessCard = ({ business }) => (
		<Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-card border-border">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<CardTitle className="text-lg font-semibold line-clamp-1 text-card-foreground">
							<Link href={`/biz/${business.slug}`} className="hover:text-primary transition-colors">
								{business.name}
							</Link>
						</CardTitle>
						<div className="flex items-center gap-2 mt-1">
							{business.rating && (
								<div className="flex items-center gap-1">
									<Star className="w-4 h-4 fill-muted-foreground text-muted-foreground" />
									<span className="text-sm font-medium text-foreground">{business.rating}</span>
									<span className="text-sm text-muted-foreground">({business.reviewCount || 0})</span>
								</div>
							)}
							{business.category && (
								<Badge variant="secondary" className="text-xs bg-secondary/80 text-secondary-foreground border-border">
									{business.category}
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					{business.description && <p className="text-sm text-muted-foreground line-clamp-2">{business.description}</p>}

					<div className="space-y-1">
						{business.address && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<MapPin className="w-4 h-4" />
								<span className="line-clamp-1">{business.address}</span>
							</div>
						)}

						{business.phone && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Phone className="w-4 h-4" />
								<span>{business.phone}</span>
							</div>
						)}

						{business.hours && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Clock className="w-4 h-4" />
								<span>{business.hours}</span>
							</div>
						)}
					</div>

					<div className="flex gap-2 pt-2">
						<Button asChild size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
							<Link href={`/biz/${business.slug}`}>View Details</Link>
						</Button>
						{business.website && (
							<Button asChild variant="outline" size="sm" className="border-border hover:bg-accent">
								<Link href={business.website} target="_blank" rel="noopener noreferrer">
									<Globe className="w-4 h-4" />
								</Link>
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const BusinessListItem = ({ business }) => (
		<Card className="transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-card border-border">
			<CardContent className="p-4">
				<div className="flex gap-4">
					<div className="flex-1">
						<div className="flex items-start justify-between mb-2">
							<h3 className="text-lg font-semibold text-card-foreground">
								<Link href={`/biz/${business.slug}`} className="hover:text-primary transition-colors">
									{business.name}
								</Link>
							</h3>
							{business.rating && (
								<div className="flex items-center gap-1">
									<Star className="w-4 h-4 fill-muted-foreground text-muted-foreground" />
									<span className="text-sm font-medium text-foreground">{business.rating}</span>
								</div>
							)}
						</div>

						<div className="flex items-center gap-2 mb-2">
							{business.category && (
								<Badge variant="secondary" className="text-xs bg-secondary/80 text-secondary-foreground border-border">
									{business.category}
								</Badge>
							)}
						</div>

						{business.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{business.description}</p>}

						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							{business.address && (
								<div className="flex items-center gap-1">
									<MapPin className="w-4 h-4" />
									<span>{business.address}</span>
								</div>
							)}
							{business.phone && (
								<div className="flex items-center gap-1">
									<Phone className="w-4 h-4" />
									<span>{business.phone}</span>
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
							<Link href={`/biz/${business.slug}`}>View Details</Link>
						</Button>
						{business.website && (
							<Button asChild variant="outline" size="sm" className="border-border hover:bg-accent">
								<Link href={business.website} target="_blank" rel="noopener noreferrer">
									<Globe className="w-4 h-4" />
								</Link>
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-6">
				{/* Search Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold mb-2 text-foreground">{query ? `Search results for "${query}"` : "All Businesses"}</h1>
					{location && typeof location === "string" && <p className="text-muted-foreground">in {location}</p>}
					<p className="text-sm text-muted-foreground mt-1">{loading ? "Loading..." : `${filteredBusinesses.length} results found`}</p>
				</div>

				{/* Controls */}
				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="flex items-center gap-2">
						<Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-accent"}>
							<Grid className="w-4 h-4" />
						</Button>
						<Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-accent"}>
							<List className="w-4 h-4" />
						</Button>
						<Button variant={viewMode === "map" ? "default" : "outline"} size="sm" onClick={() => setViewMode("map")} asChild className={viewMode === "map" ? "bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-accent"}>
							<Link href={`/search?q=${query}&location=${location}`}>
								<Map className="w-4 h-4" />
							</Link>
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<Select value={sortBy} onValueChange={handleSortChange}>
							<SelectTrigger className="w-40 border-border bg-background text-foreground">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent className="bg-popover border-border">
								<SelectItem value="relevance">Relevance</SelectItem>
								<SelectItem value="rating">Rating</SelectItem>
								<SelectItem value="distance">Distance</SelectItem>
								<SelectItem value="name">Name</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Results */}
				{loading ? (
					<div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
						{Array.from({ length: 6 }).map((_, i) => (
							<Card key={i} className="bg-card border-border">
								<CardHeader>
									<Skeleton className="h-6 w-3/4 bg-muted" />
									<Skeleton className="h-4 w-1/2 bg-muted" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-4 w-full mb-2 bg-muted" />
									<Skeleton className="h-4 w-2/3 bg-muted" />
								</CardContent>
							</Card>
						))}
					</div>
				) : filteredBusinesses.length === 0 ? (
					<div className="text-center py-12">
						<h3 className="text-lg font-semibold mb-2 text-foreground">No results found</h3>
						<p className="text-muted-foreground mb-4">Try adjusting your search terms or location.</p>
						<Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
							<Link href="/">Back to Home</Link>
						</Button>
					</div>
				) : (
					<div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
						{filteredBusinesses.map((business) => (
							<div key={business.id}>{viewMode === "grid" ? <BusinessCard business={business} /> : <BusinessListItem business={business} />}</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

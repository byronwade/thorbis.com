"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card, CardContent, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Alert, AlertDescription } from "@components/ui/alert";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { Search, MapPin, Phone, Star, Building2, CheckCircle, AlertTriangle, Plus, Loader2, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBusinessStore } from "@store/business";
import { useToast } from "@components/ui/use-toast";
import Image from "next/image";

export default function BusinessSearch({ onBusinessSelect, mode = "claim" }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [selectedBusiness, setSelectedBusiness] = useState(null);
	const [showNoResults, setShowNoResults] = useState(false);
	const searchTimeoutRef = useRef(null);

	const { filteredBusinesses, fetchBusinesses, initializeWithSupabaseData } = useBusinessStore();
	const { toast } = useToast();

	// Initialize mock data
	useEffect(() => {
		initializeWithSupabaseData();
	}, [initializeWithSupabaseData]);

	// Debounced search function
	const debouncedSearch = useCallback(
		async (query) => {
			if (!query.trim()) {
				setSearchResults([]);
				setShowNoResults(false);
				setHasSearched(false);
				return;
			}

			setIsSearching(true);
			setHasSearched(true);

			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 500));

				// Search through mock businesses
				const results = filteredBusinesses.filter((business) => business.name.toLowerCase().includes(query.toLowerCase()) || business.description?.toLowerCase().includes(query.toLowerCase()) || business.categories?.some((cat) => cat.toLowerCase().includes(query.toLowerCase()))).slice(0, 10); // Limit to 10 results

				setSearchResults(results);
				setShowNoResults(results.length === 0);
			} catch (error) {
				console.error("Search error:", error);
				setSearchResults([]);
				setShowNoResults(true);
			} finally {
				setIsSearching(false);
			}
		},
		[filteredBusinesses]
	);

	// Debounce search input
	useEffect(() => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			debouncedSearch(searchQuery);
		}, 300);

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchQuery, debouncedSearch]);

	const handleBusinessSelect = (business) => {
		setSelectedBusiness(business);
		if (onBusinessSelect) {
			onBusinessSelect(business);
		}
	};

	const handleClaimBusiness = (business) => {
		// Here you would typically redirect to a claim form with the business pre-filled
		console.log("Claiming business:", business);

		// Show toast notification
		toast({
			title: "Business Selected",
			description: `Selected ${business.name} for claiming`,
		});

		// Set the selected business
		setSelectedBusiness(business);

		// Automatically advance to next step after a short delay
		setTimeout(() => {
			// Trigger the next step in the parent form
			// This will work if the parent component has a way to advance steps
			const event = new CustomEvent("businessSelected", {
				detail: { business },
			});
			window.dispatchEvent(event);

			toast({
				title: "Proceeding to Verification",
				description: "Please complete the verification process",
			});
		}, 500);
	};

	const handleAddNewBusiness = () => {
		// Redirect to add business form
		window.location.href = "/add-a-business";
	};

	const BusinessCard = ({ business, isSelected, onSelect, onClaim, mode }) => (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? "shadow-md border-primary bg-primary/5" : "hover:border-primary/50"}`} onClick={() => onSelect(business)}>
				<CardContent className="p-4">
					{/* Mobile-first layout */}
					<div className="space-y-3">
						{/* Header Row: Logo, Name, Rating */}
						<div className="flex gap-3 items-start">
							{/* Business Logo/Image */}
							<div className="flex-shrink-0">
								{business.logo ? (
									<div className="relative w-14 h-14">
										<Image src={business.logo} alt={`${business.name} logo`} fill className="object-cover rounded-lg border border-border" />
									</div>
								) : (
									<div className="flex justify-center items-center w-14 h-14 rounded-lg border bg-muted border-border">
										<Building2 className="w-7 h-7 text-muted-foreground" />
									</div>
								)}
							</div>

							{/* Business Name and Rating */}
							<div className="flex-1 min-w-0">
								<div className="flex justify-between items-start">
									<CardTitle className="text-lg font-semibold leading-tight text-foreground">{business.name}</CardTitle>
									{business.ratings?.overall && (
										<div className="flex flex-shrink-0 gap-1 items-center ml-2">
											<Star className="w-4 h-4 text-warning fill-yellow-400" />
											<span className="text-sm font-medium">{business.ratings.overall}</span>
										</div>
									)}
								</div>

								{business.reviewCount && <p className="mt-1 text-sm text-muted-foreground">{business.reviewCount} reviews</p>}
							</div>
						</div>

						{/* Contact Info Row */}
						<div className="flex flex-col gap-2">
							{business.address && (
								<div className="flex gap-2 items-center text-sm text-muted-foreground">
									<MapPin className="flex-shrink-0 w-4 h-4" />
									<span className="truncate">{business.address.split(",")[0]}</span>
								</div>
							)}
							{business.phone && (
								<div className="flex gap-2 items-center text-sm text-muted-foreground">
									<Phone className="flex-shrink-0 w-4 h-4" />
									<span>{business.phone}</span>
								</div>
							)}
						</div>

						{/* Action Buttons Row */}
						<div className="flex gap-2 pt-2">
							{mode === "review" ? (
								<Button
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										onSelect(business);
									}}
									className="flex-1"
								>
									<Star className="mr-2 w-4 h-4" />
									Write Review
								</Button>
							) : (
								<Button
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										onClaim(business);
									}}
									className="flex-1"
								>
									<CheckCircle className="mr-2 w-4 h-4" />
									Claim This Business
								</Button>
							)}
							{business.website && (
								<Button
									variant="outline"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										window.open(business.website, "_blank");
									}}
									className="flex-shrink-0"
								>
									<ExternalLink className="w-4 h-4" />
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h2 className="text-2xl font-bold">{mode === "review" ? "Search for a Business" : "Search for Your Business"}</h2>
				<p className="text-muted-foreground">{mode === "review" ? "Find the business you want to review" : "Find your business in our directory to claim ownership and start managing your profile"}</p>
			</div>

			{/* Search Input */}
			<div className="relative">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
					<Input placeholder="Search for your business name, category, or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-4 pl-10 h-12 text-base" />
					{isSearching && <Loader2 className="absolute right-3 top-1/2 w-4 h-4 animate-spin transform -translate-y-1/2 text-muted-foreground" />}
					{searchQuery && !isSearching && (
						<Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 p-0 w-8 h-8 transform -translate-y-1/2">
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Search Results */}
			<AnimatePresence>
				{hasSearched && (
					<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
						{/* Results Header */}
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-semibold">{isSearching ? "Searching..." : `Found ${searchResults.length} businesses`}</h3>
							{searchResults.length > 0 && (
								<Badge variant="secondary">
									{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
								</Badge>
							)}
						</div>

						{/* No Results */}
						{showNoResults && !isSearching && (
							<Alert>
								<AlertTriangle className="w-4 h-4" />
								<AlertDescription>No businesses found matching &quot;{searchQuery}&quot;. You can add your business to our directory.</AlertDescription>
							</Alert>
						)}

						{/* Results List */}
						{searchResults.length > 0 && (
							<ScrollArea className="h-96">
								<div className="pr-4 space-y-3">
									{searchResults.map((business, index) => (
										<BusinessCard key={business.id || index} business={business} isSelected={selectedBusiness?.id === business.id} onSelect={handleBusinessSelect} onClaim={handleClaimBusiness} mode={mode} />
									))}
								</div>
							</ScrollArea>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Add New Business Section */}
			<Separator />
			<div className="space-y-4 text-center">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold">Can&apos;t find your business?</h3>
					<p className="text-muted-foreground">Add your business to our directory and start connecting with customers</p>
				</div>
				<Button onClick={handleAddNewBusiness} className="w-full max-w-md" size="lg">
					<Plus className="mr-2 w-4 h-4" />
					Add New Business
				</Button>
			</div>

			{/* Help Text */}
			<Alert>
				<Building2 className="w-4 h-4" />
				<AlertDescription>
					<strong>Why claim your business?</strong> Claiming allows you to manage your profile, respond to reviews, update information, and access business analytics.
				</AlertDescription>
			</Alert>
		</div>
	);
}

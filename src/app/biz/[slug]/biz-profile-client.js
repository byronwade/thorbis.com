"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import ErrorBoundary from "@components/shared/error-boundary";
import { 
	ArrowLeft, Share, Share2, Heart, Star, MapPin, CheckCircle, Shield, Award, Users, MessageCircle, 
	Car, DollarSign, Building, Eye, Target, Settings, Handshake, Utensils, Phone, Globe, Clock, 
	Calendar, Camera, ChevronRight, TrendingUp, MessageSquare, Video, Navigation, Verified, 
	ExternalLink, Briefcase, Menu, ChevronDown, Zap, Mail, Timer, CreditCard, Headphones, 
	Lightbulb, Wrench
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { toast } from "@components/ui/use-toast";
import { cn } from "@utils";
import businessProfileAnalytics, { initializeAnalytics } from "@lib/analytics/business-profile-analytics";

// Direct imports instead of lazy loading
import BusinessOverview from "./sections/business-overview";
import CertifiedElite from "./sections/certified-elite";
import Reviews from "./sections/reviews";
import Credentials from "./sections/credentials";
import Availability from "./sections/availability";
import Services from "./sections/services";
import Expertise from "./sections/expertise";
import Pricing from "./sections/pricing";
import BusinessOperations from "./sections/business-operations";
import WarrantyTracker from "./sections/warranty-tracker";
import FAQ from "./sections/faq";
import Careers from "./sections/careers";
import Partnerships from "./sections/partnerships";
import MenuSection from "./sections/menu-section";
import AutomotiveServices from "./sections/automotive-services";
import EnhancedContact from "./sections/enhanced-contact";

// Performance optimization: Memoized loading component
const LoadingSpinner = () => (
	<div className="flex items-center justify-center p-8">
		<div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
	</div>
);

// Enhanced loading component for different sections
const SectionLoader = ({ className = "" }) => (
	<div className={cn("animate-pulse space-y-4", className)}>
		<div className="h-4 bg-muted rounded w-3/4"></div>
		<div className="h-4 bg-muted rounded w-1/2"></div>
		<div className="h-32 bg-muted rounded"></div>
	</div>
);

export default function BizProfileClient({ businessId, initialBusiness, seoData }) {
	const [business, setBusiness] = useState(initialBusiness || null);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [activeTab, setActiveTab] = useState("overview");

	// Tab definitions for streamlined navigation
	const businessTabs = useMemo(
		() => [
			{ id: "overview", label: "Overview", icon: Building },
			{ id: "services", label: "Services & Pricing", icon: Settings },
			{ id: "reviews", label: "Reviews & Ratings", icon: Star },
			{ id: "gallery", label: "Gallery & Work", icon: Camera },
			{ id: "about", label: "About & Team", icon: Users },
			{ id: "availability", label: "Availability", icon: Calendar },
			{ id: "contact", label: "Contact", icon: Phone },
			{ id: "location", label: "Location & Hours", icon: MapPin },
			{ id: "credentials", label: "Credentials", icon: Shield },
		],
		[]
	);

	// Transform real Supabase business data to match component expectations
	const transformRealBusinessData = (realBusiness) => {
		const primaryCategory = realBusiness.categories?.[0]?.name?.toLowerCase() || "";
		let industry = "general";
		if (primaryCategory.includes("restaurant") || primaryCategory.includes("food")) {
			industry = "restaurant";
		} else if (primaryCategory.includes("automotive") || primaryCategory.includes("auto")) {
			industry = "automotive";
		}

		return {
			...realBusiness,
			ratings: {
				overall: realBusiness.rating || 4.5,
				quality: realBusiness.rating || 4.5,
				communication: realBusiness.rating || 4.5,
				timeliness: realBusiness.rating || 4.5,
				value: realBusiness.rating || 4.5,
			},
			industry,
			trustScore: Math.floor((realBusiness.rating || 4.5) * 20),
			responseRate: 95,
			responseTime: "within 2 hours",
			detailedServices: realBusiness.categories?.map((c) => c.name) || [],
			businessHighlights: [
				...(realBusiness.verified ? ["Verified Business"] : []),
				...(realBusiness.amenities || []).slice(0, 2),
				"Licensed & Insured",
				"Customer Satisfaction Guaranteed",
				"Free Estimates",
				"Emergency Services Available",
				"5+ Years Experience",
				"Professional Team",
				"Quality Materials",
				"Timely Service"
			],
			photos: [
				...(realBusiness.photos || []),
				"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1554774853-719586f82d77?w=800&h=600&fit=crop",
			],
			serviceArea: {
				primary: `${realBusiness.city}, ${realBusiness.state}`,
				coverage: "Local area",
				cities: [realBusiness.city],
				radius: "25 miles"
			},
			pricing: {
				consultationFee: "$0",
				hourlyRate: "$85-125",
				emergencyRate: "$150",
				minimumCharge: "$95",
				paymentMethods: ["Cash", "Credit/Debit", "Digital Payments", "Financing Available"],
				estimates: "Free estimates available",
				startingPrice: "$95"
			},
			realTimeAvailability: {
				currentStatus: "Available Now",
				nextAvailable: "Today 2:00 PM",
				emergencyAvailable: true,
				avgResponseTime: "45 minutes",
			},
		};
	};

	// Initialize analytics when component mounts
	useEffect(() => {
		if (business?.id && business?.name) {
			initializeAnalytics(business.id, business.name);
		}

		return () => {
			businessProfileAnalytics.cleanup();
		};
	}, [business?.id, business?.name]);

	// Load business data
	useEffect(() => {
		const loadBusinessData = () => {
			try {
				if (initialBusiness) {
					try {
						const transformedBusiness = transformRealBusinessData(initialBusiness);
						setBusiness(transformedBusiness);
						return;
					} catch (transformError) {
						console.warn("Failed to transform business data, using as-is:", transformError);
						setBusiness({
							...initialBusiness,
							name: initialBusiness.name || "Business Name",
							description: initialBusiness.description || "Professional service provider",
							categories: initialBusiness.categories || ["Professional Service"],
							ratings: { overall: initialBusiness.rating || 4.5 },
							reviewCount: initialBusiness.review_count || 0,
							isOpenNow: initialBusiness.is_open_now || false,
							trustScore: Math.floor((initialBusiness.rating || 4.5) * 20),
							responseTime: "within 2 hours",
							businessHighlights: ["Licensed & Insured", "Professional Service", "Customer Satisfaction"],
							serviceArea: {
								primary: initialBusiness.city || "Local area",
								coverage: "Local area"
							}
						});
						return;
					}
				}

				setBusiness({
					id: businessId || "fallback",
					name: "Business Not Found",
					slug: businessId || "not-found",
					description: "This business could not be loaded. Please try again later.",
					categories: ["Business"],
					industry: "general",
					ratings: { overall: 0 },
					reviewCount: 0,
					isOpenNow: false,
					trustScore: 0,
					responseTime: "N/A",
					businessHighlights: [],
					serviceArea: { primary: "Not available" }
				});
			} catch (error) {
				console.error("Error in BizProfileClient initialization:", error);
			}
		};

		loadBusinessData();
	}, [businessId, initialBusiness]);

	// Combine images safely
	const safeImages = business?.photos?.length > 0 
		? business.photos.map((photo, index) => ({
			src: photo,
			title: `${business.name} - Image ${index + 1}`,
			type: "business"
		}))
		: [
			{
				src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
				title: `${business.name} - Main Photo`,
				type: "business"
			},
			{
				src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
				title: `${business.name} - Interior View`,
				type: "business"
			},
			{
				src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
				title: `${business.name} - Team at Work`,
				type: "business"
			},
			{
				src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop",
				title: `${business.name} - Service Area`,
				type: "business"
			},
			{
				src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
				title: `${business.name} - Equipment`,
				type: "business"
			},
			{
				src: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop",
				title: `${business.name} - Additional View`,
				type: "business"
			}
		];

	// Show loading state while business data is being generated
	if (!business || !business.name) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-background">
				<div className="w-12 h-12 rounded-full border-b-2 animate-spin border-white"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Breadcrumb Navigation - SEO Optimized */}
			<nav className="bg-background/20 border-b border-border/20" aria-label="Breadcrumb">
				<div className="max-w-screen-2xl mx-auto px-6 py-3">
					<ol className="flex items-center space-x-2 text-sm">
						<li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</a></li>
						<span className="text-muted-foreground">/</span>
						<li><a href="/search" className="text-muted-foreground hover:text-foreground transition-colors">Businesses</a></li>
						<span className="text-muted-foreground">/</span>
						<li><a href={`/categories/${(business.categories?.[0] || 'business').toLowerCase().replace(/\s+/g, '-')}`} className="text-muted-foreground hover:text-foreground transition-colors">{business.categories?.[0] || 'Business'}</a></li>
						<span className="text-muted-foreground">/</span>
						<li><span className="text-foreground font-medium" aria-current="page">{business.name}</span></li>
					</ol>
				</div>
			</nav>

			{/* Enhanced Hero Section - Vercel Style with Comprehensive Business Info */}
			<section className="bg-card border-b border-border/30" itemScope itemType="https://schema.org/LocalBusiness">
				<meta itemProp="name" content={business.name} />
				<meta itemProp="telephone" content={business.phone || ""} />
				<meta itemProp="url" content={`https://local.byronwade.com/biz/${business.slug}`} />
				
				<div className="max-w-screen-2xl mx-auto px-6 py-12">
					{/* Business Identity & Status Header */}
					<div className="mb-8">
						<div className="flex flex-wrap items-center gap-2 mb-6">
							{business.categories?.slice(0, 3).map((category, index) => (
								<span key={index} className="text-muted-foreground text-sm bg-muted/40 px-3 py-1.5 rounded-md font-medium">
									{category}
								</span>
							))}
							{business.verified && (
								<div className="inline-flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-md text-sm font-medium border border-success/30">
									<CheckCircle className="w-3 h-3" />
									Verified Business
								</div>
							)}
							{business.isOpenNow && (
								<div className="inline-flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-md text-sm font-medium border border-success/30">
									<div className="w-2 h-2 bg-success/40 rounded-full animate-pulse"></div>
									Open Now
								</div>
							)}
						</div>

						{/* Business Logo & Name Section */}
						<div className="flex items-center gap-6 mb-4">
							{business.logo ? (
								<div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white/5 border border-border/30 shadow-lg flex-shrink-0">
									<img
										src={business.logo}
										alt={`${business.name} logo`}
										className="w-full h-full object-cover"
										itemProp="logo"
									/>
								</div>
							) : (
								<div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-primary/20 border border-border/30 flex items-center justify-center shadow-lg flex-shrink-0">
									<span className="text-2xl md:text-3xl font-bold text-foreground">
										{business.name?.charAt(0)?.toUpperCase() || 'B'}
									</span>
								</div>
							)}
							<div className="flex-1 min-w-0">
								<h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-2" itemProp="name">
									{business.name}
								</h1>
								<p className="text-muted-foreground leading-relaxed text-lg" itemProp="description">
									{business.description || "Professional services you can trust with years of experience serving the local community"}
								</p>
							</div>
						</div>

						{/* Quick Action Bar */}
						<div className="flex flex-wrap gap-3">
							<Button 
								className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
								onClick={() => window.open(`tel:${business.phone}`, '_self')}
							>
								<Phone className="w-4 h-4 mr-2" />
								Call Now
							</Button>
							<Button 
								variant="outline" 
								className="border-border hover:bg-muted/50"
								onClick={() => setActiveTab('contact')}
							>
								<MessageSquare className="w-4 h-4 mr-2" />
								Message
							</Button>
							<Button 
								variant="outline" 
								className="border-border hover:bg-muted/50"
								onClick={() => setActiveTab('location')}
							>
								<MapPin className="w-4 h-4 mr-2" />
								Directions
							</Button>
							<Button 
								variant="outline" 
								className="border-border hover:bg-muted/50 bg-success/10 border-success/30 text-success hover:bg-success/20"
								onClick={() => setActiveTab('availability')}
							>
								<Calendar className="w-4 h-4 mr-2" />
								Book Now
							</Button>
						</div>
					</div>

					{/* Bento Box Layout */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 auto-rows-min">
						{/* Rating & Reviews - Premium Large Card */}
						<div className="md:col-span-2 lg:col-span-2 xl:col-span-2 bg-warning/10 border border-warning/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-warning/10 border border-yellow-500/20 group-hover:bg-warning/20 transition-all">
										<Star className="w-6 h-6 text-warning" />
									</div>
									<div>
										<div className="text-sm font-medium text-muted-foreground">Customer Rating</div>
										<div className="flex items-center gap-2" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
											<span className="text-foreground font-bold text-3xl" itemProp="ratingValue">{business.ratings?.overall || 4.5}</span>
											<div className="flex items-center gap-1">
												{[...Array(5)].map((_, i) => (
													<Star key={i} className={`w-4 h-4 ${i < Math.floor(business.ratings?.overall || 4.5) ? 'text-warning fill-yellow-500' : 'text-muted-foreground'}`} />
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Total Reviews</span>
									<span className="font-semibold text-foreground" itemProp="reviewCount">{business.reviews?.length || 125}</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Satisfaction Rate</span>
									<span className="text-success font-semibold">98%</span>
								</div>
								<Button 
									variant="ghost" 
									className="w-full mt-3 h-9 text-sm hover:bg-warning/10 border border-yellow-500/20" 
									onClick={() => setActiveTab("reviews")}
								>
									View All Reviews
									<ChevronRight className="w-4 h-4 ml-1" />
								</Button>
							</div>
						</div>

						{/* Business Hours - Enhanced Card */}
						<div className="relative bg-primary/10 border border-primary/30 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
							<div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10"></div>
							<div className="relative">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all">
										<Clock className="w-5 h-5 text-primary" />
									</div>
									<div>
										<div className="text-sm font-medium text-muted-foreground">Business Hours</div>
										<div className={`font-bold text-lg flex items-center gap-2 ${business.isOpenNow ? 'text-success' : 'text-warning'}`}>
											<div className={`w-2 h-2 rounded-full ${business.isOpenNow ? 'bg-success' : 'bg-warning'} animate-pulse`}></div>
											{business.isOpenNow ? 'Open Now' : 'Closed'}
										</div>
									</div>
								</div>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Today</span>
										<span className="font-medium text-foreground">{business.todayHours || '8AM - 6PM'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tomorrow</span>
										<span className="font-medium text-foreground">8AM - 6PM</span>
									</div>
								</div>
								<button 
									onClick={() => setActiveTab("location")}
									className="w-full mt-3 px-3 py-2 text-xs font-medium text-primary hover:text-primary/90 hover:bg-primary/5 rounded-lg transition-all border border-primary/20"
								>
									View Full Schedule
								</button>
							</div>
						</div>

						{/* Response Time - Enhanced Card */}
						<div className="relative bg-success/10 border border-success/30 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
							<div className="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-full -mr-8 -mt-8"></div>
							<div className="relative">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 rounded-lg bg-success/10 border border-success/30 group-hover:bg-success/20 transition-all">
										<Timer className="w-5 h-5 text-success" />
									</div>
									<div>
										<div className="text-sm font-medium text-muted-foreground">Response Time</div>
										<div className="font-bold text-xl text-success flex items-center gap-2">
											{business.responseTime || '< 1hr'}
											<Zap className="w-4 h-4 text-warning" />
										</div>
									</div>
								</div>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Average Reply</span>
										<span className="text-success font-medium">Fast</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Active Now</span>
										<div className="flex items-center gap-1">
											<div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
											<span className="text-success text-xs font-medium">Online</span>
										</div>
									</div>
								</div>
								<div className="mt-3 px-3 py-2 bg-success/5 rounded-lg text-center">
									<span className="text-xs font-medium text-success">Quick to respond</span>
								</div>
							</div>
						</div>

						{/* Gallery Preview - Enhanced Wide Card */}
						<div className="md:col-span-2 lg:col-span-2 xl:col-span-2 bg-muted/20 border border-border/30 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-muted/20 border border-border/30 group-hover:bg-muted/30 transition-all">
<Camera className="w-5 h-5 text-muted-foreground" />
									</div>
									<div>
										<h3 className="font-semibold text-foreground">Work Gallery</h3>
										<p className="text-xs text-muted-foreground">Recent projects & examples</p>
									</div>
								</div>
								<Button 
									variant="ghost"
									size="sm"
									onClick={() => setActiveTab("gallery")} 
									className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-border/30"
								>
									View All {safeImages.length}
									<ChevronRight className="w-3 h-3 ml-1" />
								</Button>
							</div>
							<div className="grid grid-cols-3 gap-3">
								{safeImages.slice(0, 3).map((image, index) => (
									<div key={index} className="relative group/img aspect-square bg-muted rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all">
										<img
											src={image.src}
											alt={`${business.name} - Work Example ${index + 1}`}
											className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500 cursor-pointer"
											onClick={() => setActiveTab("gallery")}
										/>
										<div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all rounded-xl"></div>
										<div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center">
											<Eye className="w-5 h-5 text-white" />
										</div>
									</div>
								))}
							</div>
							<div className="mt-3 text-center">
								<span className="text-xs text-muted-foreground">Tap any image to explore our portfolio</span>
							</div>
						</div>

						{/* Pricing Card - Enhanced */}
						<div className="relative bg-success/10 border border-success/30 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
							<div className="absolute top-0 right-0 w-16 h-16 bg-success/10 rounded-full -mr-8 -mt-8"></div>
							<div className="relative">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 rounded-lg bg-success/10 border border-success/30 group-hover:bg-success/20 transition-all">
<DollarSign className="w-5 h-5 text-success" />
									</div>
									<div>
										<div className="text-sm font-medium text-muted-foreground">Starting Price</div>
										<div className="font-bold text-2xl text-foreground flex items-baseline gap-1">
											{business.startingPrice || '$99'}
											<span className="text-sm text-muted-foreground font-normal">+</span>
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Free Estimates</span>
										<div className="flex items-center gap-1">
											<CheckCircle className="w-3 h-3 text-success" />
<span className="text-success font-medium">Yes</span>
										</div>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Avg. Project</span>
										<span className="font-medium text-foreground">{business.avgProjectCost || '$250-500'}</span>
									</div>
								</div>
								<button 
									onClick={() => setActiveTab("contact")}
									className="w-full mt-3 px-3 py-2 text-xs font-medium text-success hover:text-success/80 hover:bg-success/10 rounded-lg transition-all border border-success/30"
								>
									Get Quote
								</button>
							</div>
						</div>

						{/* Service Area - Enhanced */}
						<div className="relative bg-warning/10 border border-warning/30 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
							<div className="absolute top-0 right-0 w-16 h-16 bg-warning/5 rounded-full -mr-8 -mt-8"></div>
							<div className="relative">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 rounded-lg bg-warning/10 border border-orange-500/20 group-hover:bg-warning/20 transition-all">
										<MapPin className="w-5 h-5 text-warning" />
									</div>
									<div>
										<div className="text-sm font-medium text-muted-foreground">Service Area</div>
										<div className="font-bold text-xl text-foreground flex items-center gap-2">
											{business.serviceRadius || '25mi'}
											<Target className="w-4 h-4 text-warning" />
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Base Location</span>
										<span className="font-medium text-foreground">{business.city}</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Travel Fee</span>
										<span className="text-success font-medium">{business.travelFee || 'Free'}</span>
									</div>
								</div>
								<button 
									onClick={() => setActiveTab("location")}
									className="w-full mt-3 px-3 py-2 text-xs font-medium text-warning hover:text-warning/90 hover:bg-warning/5 rounded-lg transition-all border border-orange-500/20"
								>
									View Coverage Map
								</button>
							</div>
						</div>

						{/* Why Choose Us - Premium Banner Card */}
						<div className="md:col-span-2 lg:col-span-4 xl:col-span-6 relative bg-muted/20 border border-border/30 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
							{/* Decorative Background Elements */}
							<div className="absolute top-0 right-0 w-32 h-32 bg-muted/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
<div className="absolute bottom-0 left-0 w-24 h-24 bg-muted/30 rounded-full -ml-12 -mb-12 group-hover:scale-110 transition-transform duration-700"></div>
							
							<div className="relative">
								<div className="flex items-center justify-center mb-6">
									<div className="flex items-center gap-4">
										<div className="p-3 rounded-xl bg-warning/20 border border-warning/30 group-hover:scale-110 transition-transform duration-300">
											<Zap className="w-8 h-8 text-warning" />
										</div>
										<div>
											<h3 className="text-2xl font-bold text-foreground">Why Choose {business.name}?</h3>
											<p className="text-muted-foreground text-sm mt-1">Premium quality service & guaranteed satisfaction</p>
										</div>
									</div>
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									<div className="flex flex-col items-center text-center p-4 rounded-xl bg-success/10 border border-success/30 hover:bg-success/20 transition-all group/item">
										<div className="p-3 rounded-xl bg-success/10 border border-success/30 mb-3 group-hover/item:scale-110 transition-transform">
											<CheckCircle className="w-6 h-6 text-success" />
										</div>
										<span className="text-sm font-semibold text-foreground mb-1">Satisfaction Guaranteed</span>
										<span className="text-xs text-muted-foreground">{business.guarantee || '100% money back if not satisfied'}</span>
									</div>
									
									<div className="flex flex-col items-center text-center p-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all group/item">
										<div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-3 group-hover/item:scale-110 transition-transform">
											<Shield className="w-6 h-6 text-primary" />
										</div>
										<span className="text-sm font-semibold text-foreground mb-1">Licensed & Insured</span>
										<span className="text-xs text-muted-foreground">{business.insurance || 'Fully licensed & insured for your protection'}</span>
									</div>
									
									<div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-all group/item">
										<div className="p-3 rounded-xl bg-muted/20 border border-border/30 mb-3 group-hover/item:scale-110 transition-transform">
<Award className="w-6 h-6 text-muted-foreground" />
										</div>
										<span className="text-sm font-semibold text-foreground mb-1">Expert Experience</span>
										<span className="text-xs text-muted-foreground">{business.experience || '10+ years of professional expertise'}</span>
									</div>
									
									<div className="flex flex-col items-center text-center p-4 rounded-xl bg-warning/10 border border-warning/30 hover:bg-warning/20 transition-all group/item">
										<div className="p-3 rounded-xl bg-warning/10 border border-orange-500/20 mb-3 group-hover/item:scale-110 transition-transform">
											<Timer className="w-6 h-6 text-warning" />
										</div>
										<span className="text-sm font-semibold text-foreground mb-1">Fast Service</span>
										<span className="text-xs text-muted-foreground">{business.availability || 'Same-day & emergency service available'}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Contact Info - Enhanced Card */}
						<div className="md:col-span-2 lg:col-span-3 xl:col-span-3 bg-primary/10 border border-primary/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-3 rounded-xl bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-all">
<Phone className="w-6 h-6 text-primary" />
								</div>
								<div>
									<h3 className="font-bold text-foreground text-lg">Get In Touch</h3>
									<p className="text-sm text-muted-foreground">Ready to start your project?</p>
								</div>
							</div>
							
							<div className="space-y-4">
								{business.phone && (
									<div className="flex items-center gap-4 p-3 rounded-lg bg-success/5 border border-success/20 hover:bg-success/10 transition-all group/contact cursor-pointer"
										 onClick={() => window.open(`tel:${business.phone}`, '_self')}>
										<div className="p-2 rounded-lg bg-success/20 border border-success/30">
											<Phone className="w-5 h-5 text-success" />
										</div>
										<div className="flex-1">
											<div className="text-sm font-semibold text-foreground">Call Directly</div>
											<div className="text-lg font-mono text-success hover:text-success transition-colors">
												{business.phone}
											</div>
										</div>
										<ChevronRight className="w-5 h-5 text-muted-foreground group-hover/contact:text-success transition-colors" />
									</div>
								)}
								
								<div className="flex items-center gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all group/contact cursor-pointer"
									 onClick={() => setActiveTab("location")}>
									<div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
										<MapPin className="w-5 h-5 text-primary" />
									</div>
									<div className="flex-1">
										<div className="text-sm font-semibold text-foreground">Visit Our Location</div>
										<div className="text-muted-foreground text-sm">
											{business.address || `${business.city}, ${business.state}`}
										</div>
									</div>
									<ChevronRight className="w-5 h-5 text-muted-foreground group-hover/contact:text-primary transition-colors" />
								</div>

								<div className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-all group/contact cursor-pointer"
									 onClick={() => setActiveTab("contact")}>
									<div className="p-2 rounded-lg bg-muted/20 border border-border/30">
<MessageCircle className="w-5 h-5 text-muted-foreground" />
									</div>
									<div className="flex-1">
										<div className="text-sm font-semibold text-foreground">Send Message</div>
										<div className="text-muted-foreground text-sm">Get a free quote & consultation</div>
									</div>
									<ChevronRight className="w-5 h-5 text-muted-foreground group-hover/contact:text-foreground transition-colors" />
								</div>
							</div>
						</div>

						{/* Payment & Pricing - Enhanced Card */}
						<div className="md:col-span-2 lg:col-span-3 xl:col-span-3 bg-success/10 border border-success/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-3 rounded-xl bg-success/10 border border-success/30 group-hover:bg-success/20 transition-all">
<CreditCard className="w-6 h-6 text-success" />
								</div>
								<div>
									<h3 className="font-bold text-foreground text-lg">Payment & Pricing</h3>
									<p className="text-sm text-muted-foreground">Transparent & flexible options</p>
								</div>
							</div>
							
							<div className="space-y-4">
								<div className="p-3 rounded-lg bg-success/10 border border-success/30">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-foreground">Free Estimates</span>
										<div className="flex items-center gap-1">
											<CheckCircle className="w-4 h-4 text-success" />
<span className="text-success font-semibold text-sm">Always</span>
										</div>
									</div>
									<p className="text-xs text-muted-foreground">No upfront costs for quotes & consultations</p>
								</div>

								<div className="space-y-3">
									<div className="text-sm">
										<div className="text-muted-foreground mb-2 font-medium">We Accept:</div>
										<div className="flex items-center gap-2 flex-wrap">
											<div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
												<CreditCard className="w-3 h-3 text-primary" />
												<span className="text-xs font-medium text-primary">Credit Cards</span>
											</div>
											<div className="flex items-center gap-1 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
												<DollarSign className="w-3 h-3 text-success" />
												<span className="text-xs font-medium text-success">Cash</span>
											</div>
											<div className="flex items-center gap-1 px-3 py-1.5 bg-muted/20 border border-border/30 rounded-full">
												<CheckCircle className="w-3 h-3 text-muted-foreground" />
<span className="text-xs font-medium text-muted-foreground">Checks</span>
											</div>
										</div>
									</div>
								</div>

								<div className="pt-3 border-t border-success/30">
									<div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
										<div>
											<div className="text-sm font-medium text-foreground">Typical Project Range</div>
											<div className="text-xs text-muted-foreground">Varies by scope & complexity</div>
										</div>
										<div className="text-right">
											<div className="text-xl font-bold text-foreground">{business.typicalPrice || '$150-300'}</div>
											<div className="text-xs text-success font-medium">Average cost</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Business Stats Section */}
			<section className="bg-muted/20 border-b border-border/30" itemScope itemType="https://schema.org/LocalBusiness">
				<meta itemProp="name" content={business.name} />
				<meta itemProp="telephone" content={business.phone || ""} />
				<div className="max-w-screen-2xl mx-auto px-6 py-6">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
							<div className="flex items-center justify-center mb-2">
								<DollarSign className="w-5 h-5 text-primary" />
							</div>
							<div className="text-xl font-bold text-foreground" itemProp="priceRange">
								{business.startingPrice || '$99+'}
							</div>
							<div className="text-sm text-muted-foreground">Starting Price</div>
							<div className="text-xs text-success mt-1">Free estimates</div>
						</div>
						
						<div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
							<div className="flex items-center justify-center mb-2">
								<Timer className="w-5 h-5 text-primary" />
							</div>
							<div className="text-xl font-bold text-foreground">{business.responseTime || '< 1hr'}</div>
							<div className="text-sm text-muted-foreground">Response Time</div>
							<div className="text-xs text-primary mt-1">Quick replies</div>
						</div>
						
						<div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
							<div className="flex items-center justify-center mb-2">
								<Users className="w-5 h-5 text-primary" />
							</div>
							<div className="text-xl font-bold text-foreground">{business.completedJobs || '500+'}</div>
							<div className="text-sm text-muted-foreground">Jobs Completed</div>
							<div className="text-xs text-muted-foreground mt-1">Experienced</div>
						</div>
						
						<div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
							<div className="flex items-center justify-center mb-2">
								<MapPin className="w-5 h-5 text-primary" />
							</div>
							<div className="text-xl font-bold text-foreground" itemProp="areaServed" itemScope itemType="https://schema.org/City">
								<span itemProp="name">{business?.serviceRadius || '25mi'}</span>
							</div>
							<div className="text-sm text-muted-foreground">Service Radius</div>
							<div className="text-xs text-warning mt-1">From {business.city}</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Tabbed Content Area */}
			<div className="px-6 pt-8 mx-auto max-w-screen-2xl pb-24 lg:pb-8">
				<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
					{/* Left Sidebar Navigation - Enhanced for Mobile */}
					<aside className="space-y-1">
						{/* Mobile Tab Scroll - Only visible on mobile */}
						<div className="lg:hidden mb-6">
							<div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">{businessTabs.map((tab) => (
								<button 
									key={tab.id} 
									onClick={() => setActiveTab(tab.id)} 
									className={cn(
										"flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap", 
										activeTab === tab.id
											? "bg-primary text-primary-foreground shadow-md" 
											: "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50"
									)}
								>
									<tab.icon className="w-4 h-4" />
									{tab.label}
								</button>
							))}
							</div>
						</div>

						{/* Desktop Sidebar Navigation */}
						<nav aria-label="Profile sections" className="space-y-1 hidden lg:block">
							{businessTabs.map((tab) => (
								<button 
									key={tab.id} 
									onClick={() => setActiveTab(tab.id)} 
									aria-current={activeTab === tab.id ? "page" : undefined} 
									className={cn(
										"w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all text-left group", 
										activeTab === tab.id
											? "bg-primary text-primary-foreground shadow-md" 
											: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
									)}
								>
									<tab.icon className={cn(
										"w-4 h-4",
										activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
									)} />
									<span className="font-medium">{tab.label}</span>
									{activeTab === tab.id && (
										<div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full"></div>
									)}
								</button>
							))}
						</nav>
					</aside>

					{/* Right Content Area */}
					<div className="space-y-6">
						{/* Tab Content */}
						{activeTab === "overview" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<BusinessOverview business={business} />
								</Suspense>
							</div>
						)}

						{activeTab === "reviews" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card className="border-border bg-card">
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Customer Reviews & Ratings</CardTitle>
											<CardDescription>See what our customers are saying about us</CardDescription>
										</CardHeader>
										<CardContent>
											<BusinessReviews business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "gallery" && (
							<div className="space-y-8">
								<Card className="border-border bg-card">
									<CardHeader>
										<CardTitle className="text-xl font-semibold text-foreground">Photo Gallery & Work Examples</CardTitle>
										<CardDescription>Browse through our work and see what we can do for you</CardDescription>
									</CardHeader>
									<CardContent>
										<BusinessGallery business={business} />
									</CardContent>
								</Card>
							</div>
						)}

						{activeTab === "services" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<BusinessServices business={business} />
								</Suspense>
							</div>
						)}

						{activeTab === "contact" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<BusinessContact business={business} />
								</Suspense>
							</div>
						)}

						{activeTab === "location" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<BusinessLocation business={business} />
								</Suspense>
							</div>
						)}

						{activeTab === "about" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<BusinessAbout business={business} />
								</Suspense>
							</div>
						)}

						{activeTab === "availability" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<BusinessAvailability business={business} />
								</Suspense>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

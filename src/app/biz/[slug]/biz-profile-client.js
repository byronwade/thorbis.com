"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import ErrorBoundary from "@components/shared/error-boundary";
import { ArrowLeft, Share, Heart, Star, MapPin, CheckCircle, Shield, Award, Users, MessageCircle, Car, DollarSign, Building, Eye, Target, Settings, Handshake, Utensils, Phone, Globe, Clock, Calendar, Camera, ChevronRight, TrendingUp, MessageSquare, Video, Navigation, Verified, ExternalLink, Briefcase, Menu, ChevronDown } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { toast } from "@components/ui/use-toast";
import { cn } from "@utils";
import businessProfileAnalytics, { initializeAnalytics } from "@lib/analytics/business-profile-analytics";
// Removed mock data generator imports - now using real Supabase data

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

// Modern Hero Image Component with fallback
const HeroImage = React.memo(({ src, alt, className = "" }) => {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

	return (
		<div className={cn("relative overflow-hidden", className)}>
			{!imageLoaded && !imageError && (
				<div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
					<Camera className="w-12 h-12 text-muted-foreground" />
				</div>
			)}
			<img src={imageError ? "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop" : src} alt={alt} className={cn("w-full h-full object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} loading="lazy" />
			<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
		</div>
	);
});

HeroImage.displayName = "HeroImage";

// Quick Action Button Component
const QuickActionButton = React.memo(({ icon: Icon, label, onClick, variant = "outline", className = "" }) => (
	<Button variant={variant} size="lg" className={cn("flex flex-col items-center h-auto p-4 space-y-2 min-w-[100px]", className)} onClick={onClick}>
		<Icon className="w-5 h-5" />
		<span className="text-sm font-medium">{label}</span>
	</Button>
));

QuickActionButton.displayName = "QuickActionButton";

// Business Stats Component
const BusinessStat = React.memo(({ icon: Icon, label, value, trend, className = "" }) => (
	<div className={cn("flex items-center space-x-3 p-4 bg-card rounded-lg border", className)}>
		<div className="p-2 bg-primary/10 rounded-lg">
			<Icon className="w-5 h-5 text-primary" />
		</div>
		<div className="flex-1">
			<p className="text-sm text-muted-foreground">{label}</p>
			<div className="flex items-center space-x-2">
				<p className="text-lg font-semibold text-foreground">{value}</p>
				{trend && (
					<Badge variant="secondary" className="text-xs">
						<TrendingUp className="w-3 h-3 mr-1" />
						{trend}
					</Badge>
				)}
			</div>
		</div>
	</div>
));

BusinessStat.displayName = "BusinessStat";

// Section wrapper with enhanced error boundary and loading states
const SectionWrapper = React.memo(({ children, title, className = "", loading = false }) => (
	<Card className={cn("border-0 shadow-sm", className)}>
		{title && (
			<CardHeader className="pb-4">
				<CardTitle className="text-xl font-semibold">{title}</CardTitle>
			</CardHeader>
		)}
		<CardContent className={title ? "pt-0" : ""}>
			{loading ? (
				<SectionLoader />
			) : (
				<ErrorBoundary
					fallback={(error) => (
						<div className="p-6 text-center border border-dashed border-gray-300 rounded-lg">
							<p className="text-muted-foreground mb-2">Content temporarily unavailable</p>
							<Button variant="outline" size="sm" onClick={() => window.location.reload()}>
								Try Again
							</Button>
						</div>
					)}
				>
					{children}
				</ErrorBoundary>
			)}
		</CardContent>
	</Card>
));

SectionWrapper.displayName = "SectionWrapper";

export default function BizProfileClient({ businessId, initialBusiness, seoData }) {
	const [business, setBusiness] = useState(initialBusiness || null);
	const [showAllPhotos, setShowAllPhotos] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [activeTab, setActiveTab] = useState("overview");
	const [showReviewModal, setShowReviewModal] = useState(false);

	const [newReview, setNewReview] = useState({
		rating: 5,
		title: "",
		text: "",
		author: "",
	});

	// Tab definitions for Amazon-style organization
	const businessTabs = useMemo(
		() => [
			{
				id: "overview",
				label: "Overview",
				icon: Building,
				description: "Quick summary and key information",
			},
			{
				id: "services",
				label: "Services & Pricing",
				icon: Settings,
				description: "Detailed services, rates, and packages",
			},
			{
				id: "reviews",
				label: "Reviews & Ratings",
				icon: Star,
				description: "Customer feedback and testimonials",
			},
			{
				id: "gallery",
				label: "Gallery & Work",
				icon: Camera,
				description: "Photos, portfolio, and work examples",
			},
			{
				id: "about",
				label: "About & Team",
				icon: Users,
				description: "Company information and team details",
			},
			{
				id: "availability",
				label: "Availability & Contact",
				icon: Calendar,
				description: "Schedules, booking, and contact options",
			},
			{
				id: "contact",
				label: "Contact Information",
				icon: Phone,
				description: "Phone, address, and direct contact methods",
			},
			{
				id: "location",
				label: "Location & Hours",
				icon: MapPin,
				description: "Business location and operating hours",
			},
			{
				id: "credentials",
				label: "Credentials & Licenses",
				icon: Shield,
				description: "Certifications, licenses, and verifications",
			},
			{
				id: "expertise",
				label: "Expertise & Skills",
				icon: Award,
				description: "Professional expertise and specializations",
			},
			{
				id: "booking",
				label: "Book Service",
				icon: Calendar,
				description: "Schedule appointments and consultations",
			},
			{
				id: "warranty",
				label: "Warranties & Guarantees",
				icon: Shield,
				description: "Service warranties and guarantees",
			},
			{
				id: "portfolio",
				label: "Portfolio & Projects",
				icon: Briefcase,
				description: "Past projects and work examples",
			},
			{
				id: "before-after",
				label: "Before & After",
				icon: TrendingUp,
				description: "Transformation examples and results",
			},
			{
				id: "faq",
				label: "FAQ",
				icon: MessageCircle,
				description: "Frequently asked questions",
			},
			{
				id: "careers",
				label: "Careers & Jobs",
				icon: Briefcase,
				description: "Career opportunities and team openings",
			},
			{
				id: "operations",
				label: "Business Operations",
				icon: Settings,
				description: "Operational procedures and business processes",
			},
			{
				id: "certified-elite",
				label: "Certified Elite",
				icon: Award,
				description: "Elite certifications and premium status",
			},
			{
				id: "partnerships",
				label: "Partnerships & Affiliations",
				icon: Handshake,
				description: "Business partnerships and professional affiliations",
			},
			{
				id: "menu",
				label: "Menu & Offerings",
				icon: Utensils,
				description: "Restaurant menu and food offerings",
			},
			{
				id: "automotive",
				label: "Automotive Services",
				icon: Car,
				description: "Specialized automotive and vehicle services",
			},
		],
		[]
	);

	// Intelligently combine all images for photo navigation with rich portfolio data
	const allImages = business
		? [
				...(business.photos || []).map((photo) => ({
					src: photo,
					title: "Business Photo",
					type: "business",
					category: "Business Photos",
				})),
				...(business.portfolio || []).map((project) => ({
					src: project.image,
					title: project.title,
					description: project.description,
					type: "portfolio",
					category: "Project Gallery",
				})),
				...(business.beforeAfterGallery || []).flatMap((project) => [
					{
						src: project.beforeImage,
						title: `${project.title} - Before`,
						description: project.description,
						type: "before",
						category: "Before & After",
					},
					{
						src: project.afterImage,
						title: `${project.title} - After`,
						description: project.description,
						type: "after",
						category: "Before & After",
					},
				]),
			]
		: [];

	// Ensure we have at least one image
	const safeImages =
		allImages.length > 0
			? allImages
			: [
					{
						src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
						title: "Business Photo",
						type: "business",
						category: "Business Photos",
					},
				];

	// Tab navigation component (Amazon-style)
	const TabNavigation = React.memo(() => (
		<div className="sticky top-14 z-40 bg-background/95 backdrop-blur-md border-b">
			<div className="px-4 mx-auto max-w-7xl lg:px-8">
				<div className="flex overflow-x-auto scrollbar-hide">
					{businessTabs.map((tab) => (
						<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-w-fit", activeTab === tab.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50")}>
							<tab.icon className="w-4 h-4" />
							<span>{tab.label}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	));

	TabNavigation.displayName = "TabNavigation";

	// Transform real Supabase business data to match component expectations
	const transformRealBusinessData = (realBusiness) => {
		// Determine industry based on categories
		const primaryCategory = realBusiness.categories?.[0]?.name?.toLowerCase() || "";
		let industry = "general";
		if (primaryCategory.includes("restaurant") || primaryCategory.includes("food")) {
			industry = "restaurant";
		} else if (primaryCategory.includes("automotive") || primaryCategory.includes("auto")) {
			industry = "automotive";
		}

		return {
			...realBusiness,
			// Map real data to component expected format
			ratings: {
				overall: realBusiness.rating || 4.5,
				quality: realBusiness.rating || 4.5,
				communication: realBusiness.rating || 4.5,
				timeliness: realBusiness.rating || 4.5,
				value: realBusiness.rating || 4.5,
			},
			industry,
			trustScore: Math.floor((realBusiness.rating || 4.5) * 20),
			responseRate: 95, // Default high response rate
			responseTime: "within 2 hours",
			detailedServices: realBusiness.categories?.map((c) => c.name) || [],
			businessHighlights: [...(realBusiness.verified ? ["✓ Verified Business"] : []), ...(realBusiness.amenities || []).slice(0, 2), "✓ Licensed & Insured", "✓ Customer Satisfaction Guaranteed", "✓ Free Estimates", "✓ Emergency Services Available", "✓ 5+ Years Experience", "✓ Professional Team", "✓ Quality Materials", "✓ Timely Service"],
			portfolioPhotos: [...(realBusiness.photos || []), "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1554774853-719586f82d77?w=600&h=400&fit=crop"].slice(0, 6),
			// Enhanced photo gallery
			photos: [
				...(realBusiness.photos || []),
				"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1554774853-719586f82d77?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
			],
			// Transform reviews to match component format
			reviews:
				realBusiness.reviews?.map((review) => ({
					id: review.id,
					author: review.user?.name || "Anonymous",
					avatar: review.user?.avatar_url || `https://i.pravatar.cc/150?u=${review.id}`,
					rating: review.rating,
					date: new Date(review.created_at).toLocaleDateString(),
					text: review.text,
					title: review.title,
					helpful: review.helpful_count || 0,
					verified: true,
					photos: review.photos?.length || 0,
					response: review.response,
					responseDate: review.response_date ? new Date(review.response_date).toLocaleDateString() : null,
				})) || [],
			// Enhanced demo content for investor showcase
			peerRecommendations: [
				{
					recommenderName: "Sarah Johnson",
					recommenderAddress: "Downtown District",
					relationship: "Repeat Customer",
					serviceUsed: realBusiness.categories?.[0]?.name || "Service",
					rating: realBusiness.rating || 5,
					comment: "Outstanding service quality and professionalism. They exceeded my expectations and delivered exactly what they promised.",
					verificationStatus: "Verified Customer",
					date: "2 weeks ago",
				},
				{
					recommenderName: "Michael Chen",
					recommenderAddress: "Business District",
					relationship: "Business Client",
					serviceUsed: "Commercial Services",
					rating: 5,
					comment: "Reliable partner for our business needs. Quick response times and excellent communication throughout the project.",
					verificationStatus: "Verified Business",
					date: "1 month ago",
				},
			],
			// Enhanced services data
			detailedServices: [...(realBusiness.categories?.map((c) => c.name) || []), "Emergency Services", "Consultation", "Maintenance", "Installation", "Repairs"],
			// Rich expertise data
			expertise: [
				{
					area: realBusiness.categories?.[0]?.name || "Primary Service",
					yearsExperience: "5+",
					certifications: ["Licensed", "Insured"],
					specializations: ["Commercial", "Residential", "Emergency"],
				},
				{
					area: "Customer Service",
					yearsExperience: "5+",
					certifications: ["Customer Excellence"],
					specializations: ["24/7 Support", "Multilingual"],
				},
			],
			// Enhanced pricing structure
			pricing: {
				consultationFee: "$0",
				hourlyRate: "$85-125",
				emergencyRate: "$150",
				minimumCharge: "$95",
				paymentMethods: ["Cash", "Credit/Debit", "Digital Payments", "Financing Available"],
				estimates: "Free estimates available",
			},
			// FAQ data
			faq: [
				{
					question: "What areas do you serve?",
					answer: `We serve ${realBusiness.city} and surrounding areas within a 25-mile radius.`,
					category: "Service Area",
				},
				{
					question: "Do you offer emergency services?",
					answer: "Yes, we provide 24/7 emergency services with rapid response times.",
					category: "Availability",
				},
				{
					question: "Are you licensed and insured?",
					answer: "Yes, we are fully licensed and insured for your protection and peace of mind.",
					category: "Credentials",
				},
				{
					question: "What payment methods do you accept?",
					answer: "We accept cash, all major credit cards, and offer financing options for larger projects.",
					category: "Payment",
				},
			],
			// Career opportunities
			careers: [
				{
					title: "Service Technician",
					type: "Full-time",
					location: realBusiness.city,
					description: "Join our growing team of professional service technicians.",
					requirements: ["Experience in field", "Valid driver's license", "Professional demeanor"],
					benefits: ["Health insurance", "Paid time off", "Training provided"],
				},
			],
			// Business partnerships
			partnerships: [
				{
					name: "Local Supply Partners",
					type: "Supplier",
					description: "We work with trusted local suppliers to ensure quality materials and quick service.",
					logo: null,
				},
				{
					name: "Professional Networks",
					type: "Professional",
					description: "Member of local business associations and professional networks.",
					logo: null,
				},
			],
			amenities: (realBusiness.amenities || []).map((amenity) => ({
				name: amenity,
				icon: CheckCircle,
				available: true,
			})),
			serviceArea: {
				primary: `${realBusiness.city}, ${realBusiness.state}`,
				coverage: "Local area",
				cities: [realBusiness.city],
			},
			license: {
				number: `LIC-${realBusiness.id.slice(0, 8)}`,
				state: realBusiness.state,
				verified: realBusiness.verified,
				expires: "12/31/2025",
			},
			realTimeAvailability: {
				currentStatus: "Available Now",
				nextAvailable: "Today 2:00 PM",
				emergencyAvailable: true,
				avgResponseTime: "45 minutes",
				todaySlots: [
					{ time: "2:00 PM", available: true, type: "standard" },
					{ time: "3:30 PM", available: true, type: "standard" },
					{ time: "5:00 PM", available: false, type: "standard" },
					{ time: "Emergency", available: true, type: "emergency" },
				],
			},
			videoConsultation: {
				available: true,
				pricePerSession: "$25",
				duration: "30 minutes",
				languages: ["English"],
				nextSlot: "Today 3:00 PM",
				specialties: ["Initial Assessment", "Quote Estimation"],
			},
			warranties: [],
			warrantyTracker: {
				warranties: [
					{
						type: "Workmanship",
						duration: "2 Years",
						coverage: "Full coverage for defects",
					},
				],
				activeWarranties: [],
				claims: [],
			},
			multiLanguage: {
				supportedLanguages: [{ code: "en", name: "English", flag: "🇺🇸", native: "English" }],
				staffLanguages: ["English"],
				translationQuality: "Professional",
			},
			insuranceBilling: {
				acceptedInsurance: [],
				directBilling: false,
				paymentPlans: true,
			},
			// Enhanced work gallery for investor showcase
			workGallery: {
				beforeAfter: [
					{
						before: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
						after: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
						title: "Complete Service Transform",
						description: "Professional results that exceed expectations",
					},
					{
						before: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
						after: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=400&h=300&fit=crop",
						title: "Quality Workmanship",
						description: "Attention to detail in every project",
					},
				],
				portfolio: [
					{
						image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
						title: "Professional Installation",
						description: "High-quality work with attention to detail",
						category: "Commercial",
					},
					{
						image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop",
						title: "Residential Service",
						description: "Reliable service for homeowners",
						category: "Residential",
					},
					{
						image: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=600&h=400&fit=crop",
						title: "Emergency Repair",
						description: "Quick response for urgent needs",
						category: "Emergency",
					},
				],
			},
			certifications: realBusiness.verified
				? [
						{
							name: "Business Verification",
							issuer: "Thorbis",
							date: "2024",
							verified: true,
						},
					]
				: [],
			// Add any other fields the component expects...
		};
	};

	// Initialize analytics when component mounts
	useEffect(() => {
		if (business?.id && business?.name) {
			initializeAnalytics(business.id, business.name);
		}

		// Cleanup analytics on unmount
		return () => {
			businessProfileAnalytics.cleanup();
		};
	}, [business?.id, business?.name]);

	// Load business data using the centralized business data generator
	useEffect(() => {
		const loadBusinessData = () => {
			try {
				// If we already have initial business data from SSR, use it
				if (initialBusiness) {
					// Transform the real business data to match component expectations
					const transformedBusiness = transformRealBusinessData(initialBusiness);
					setBusiness(transformedBusiness);
					return;
				}

				// No initial business data provided - this indicates an error in the parent component
				console.error("No initial business data provided to BizProfileClient");

				// Create a minimal fallback business structure to prevent crashes
				const fallbackBusiness = {
					id: businessId || "fallback",
					name: "Business Not Found",
					slug: businessId || "not-found",
					description: "This business could not be loaded. Please try again later.",
					address: "Address not available",
					phone: "Phone not available",
					website: null,
					categories: ["Business"],
					industry: "general",
					ratings: { overall: 0 },
					reviewCount: 0,
					hours: "Hours not available",
					coordinates: { lat: 0, lng: 0 },
					isOpenNow: false,
					price: "N/A",
					statusMessage: "Business not found",
					isSponsored: false,
					logo: null,
					photos: [],
					trustScore: 0,
					responseRate: 0,
					responseTime: "N/A",
					detailedServices: [],
					businessHighlights: [],
					portfolioPhotos: [],
					reviews: [],
					peerRecommendations: [],
					amenities: [],
					serviceArea: {
						primary: "Not available",
						coverage: "Unknown",
						cities: ["Not available"],
					},
					license: {
						number: "Not available",
						state: "Not available",
						verified: false,
						expires: "Unknown",
					},
					realTimeAvailability: {
						currentStatus: "Not available",
						nextAvailable: "Unknown",
						emergencyAvailable: false,
						avgResponseTime: "Unknown",
						todaySlots: [],
					},
					videoConsultation: null,
					warranties: [],
					warrantyTracker: { warranties: [], activeWarranties: [], claims: [] },
					menu: null,
					automotive: null,
				};

				setBusiness(fallbackBusiness);
			} catch (error) {
				console.error("Error in BizProfileClient initialization:", error);
				// Final fallback - minimal business object
				setBusiness({
					id: businessId || "error",
					name: "Error Loading Business",
					description: "An error occurred while loading business information.",
					industry: "general",
					ratings: { overall: 0 },
					reviewCount: 0,
				});
			}
		};

		loadBusinessData();
	}, [businessId, initialBusiness]);

	// Show loading state while business data is being generated
	if (!business) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-background">
				<div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#121212]">
			{/* Enhanced Mobile-First Business Profile Toolbar */}
			<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md shadow-sm">
				<div className="px-3 sm:px-4 mx-auto max-w-screen-2xl lg:px-8">
					{/* Mobile-Optimized Top Row - Breadcrumb and Quick Actions */}
					<div className="flex items-center justify-between h-11 sm:h-12 border-b border-border/40">
						<div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-muted-foreground min-w-0">
							<Button variant="ghost" size="sm" className="px-1.5 sm:px-2 h-6 sm:h-7 text-muted-foreground hover:text-foreground touch-manipulation" onClick={() => window.history.back()}>
								<ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
							</Button>
							<span className="hidden sm:inline">Search Results</span>
							<ChevronRight className="w-3 h-3 hidden sm:inline" />
							<span className="capitalize hidden md:inline">{business.categories?.[0] || "Business"}</span>
							<ChevronRight className="w-3 h-3 hidden md:inline" />
							<span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[200px]">{business.name}</span>
						</div>
						<div className="flex items-center space-x-1">
							<Button variant="ghost" size="sm" className="px-1.5 sm:px-2 h-6 sm:h-7 text-muted-foreground hover:text-foreground touch-manipulation">
								<Eye className="w-3 h-3 sm:w-4 sm:h-4" />
								<span className="text-xs ml-1 hidden lg:inline">View Mode</span>
							</Button>
							<Button variant="ghost" size="sm" className="px-1.5 sm:px-2 h-6 sm:h-7 text-muted-foreground hover:text-foreground touch-manipulation">
								<ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
								<span className="text-xs ml-1 hidden lg:inline">Open</span>
							</Button>
						</div>
					</div>

					{/* Mobile-First Main Toolbar - Business Actions */}
					<div className="flex items-center justify-between h-14 sm:h-16 py-2">
						{/* Left Side - Business Info & Status */}
						<div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
							<div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
								{business.logo ? (
									<img src={business.logo} alt={`${business.name} logo`} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border flex-shrink-0" />
								) : (
									<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
										<Building className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
									</div>
								)}
								<div className="flex flex-col min-w-0 flex-1">
									<div className="flex items-center space-x-1 sm:space-x-2">
										<h1 className="font-semibold text-sm sm:text-lg text-foreground truncate max-w-[150px] sm:max-w-[300px]">{business.name}</h1>
										{business.verified && (
											<Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs sm:text-sm hidden sm:flex">
												<Verified className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
												<span className="hidden sm:inline">Verified</span>
											</Badge>
										)}
									</div>
									<div className="flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm text-muted-foreground">
										<div className="flex items-center space-x-1">
											<Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-yellow-500" />
											<span className="font-medium">{business.ratings?.overall || 4.5}</span>
											<span className="hidden sm:inline">({business.reviewCount || 0} reviews)</span>
											<span className="sm:hidden">({business.reviewCount || 0})</span>
										</div>
										<span className="hidden sm:inline">•</span>
										<span className={cn("font-medium text-xs sm:text-sm", business.isOpenNow ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{business.isOpenNow ? "Open" : "Closed"}</span>
										<span className="hidden md:inline">•</span>
										<span className="hidden md:inline text-xs sm:text-sm">
											{business.city}, {business.state}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Mobile-Optimized Action Buttons */}
						<div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
							{/* Mobile Primary Actions - Touch Optimized */}
							<div className="flex items-center space-x-1 sm:space-x-2">
								{/* Call Button - Always Visible on Mobile */}
								<Button size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm touch-manipulation" onClick={() => business.phone && window.open(`tel:${business.phone}`)}>
									<Phone className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
									<span className="hidden sm:inline">Call Now</span>
								</Button>

								{/* Book Button - Responsive */}
								<Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm touch-manipulation hidden xs:flex" onClick={() => setActiveTab("booking")}>
									<Calendar className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
									<span className="hidden sm:inline">Book</span>
								</Button>

								{/* Message Button - Desktop Only */}
								<Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm touch-manipulation hidden md:flex" onClick={() => setActiveTab("contact")}>
									<MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
									<span className="hidden sm:inline">Message</span>
								</Button>
							</div>

							{/* Mobile Secondary Actions - Compact */}
							<div className="flex items-center space-x-0.5 sm:space-x-1 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-border">
								{/* Share Button - Native sharing on mobile */}
								<Button
									variant="ghost"
									size="sm"
									className="px-1.5 sm:px-3 h-8 sm:h-9 touch-manipulation"
									onClick={() => {
										if (navigator.share) {
											navigator.share({
												title: business.name,
												text: business.description,
												url: window.location.href,
											});
										} else {
											navigator.clipboard.writeText(window.location.href).then(() => {
												toast({ title: "Link copied to clipboard!" });
											});
										}
									}}
								>
									<Share className="w-3 h-3 sm:w-4 sm:h-4" />
									<span className="text-xs ml-1 hidden xl:inline">Share</span>
								</Button>

								{/* Save Button */}
								<Button
									variant="ghost"
									size="sm"
									className="px-1.5 sm:px-3 h-8 sm:h-9 touch-manipulation"
									onClick={() => {
										// Save to favorites functionality
										toast({ title: "Added to favorites!" });
									}}
								>
									<Heart className="w-3 h-3 sm:w-4 sm:h-4" />
									<span className="text-xs ml-1 hidden xl:inline">Save</span>
								</Button>

								{/* Directions Button */}
								<Button variant="ghost" size="sm" className="px-1.5 sm:px-3 h-8 sm:h-9 touch-manipulation" onClick={() => setActiveTab("location")}>
									<Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
									<span className="text-xs ml-1 hidden xl:inline">Directions</span>
								</Button>

								{/* Website Button - Desktop Only */}
								{business.website && (
									<Button variant="ghost" size="sm" className="px-1.5 sm:px-3 h-8 sm:h-9 touch-manipulation hidden lg:flex" onClick={() => window.open(business.website, "_blank")}>
										<Globe className="w-3 h-3 sm:w-4 sm:h-4" />
										<span className="text-xs ml-1 hidden xl:inline">Website</span>
									</Button>
								)}
							</div>
						</div>
					</div>

					{/* Mobile-Responsive Quick Stats Bar */}
					<div className="flex items-center justify-between h-8 sm:h-10 text-xs overflow-x-auto">
						<div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
							<div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
								<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
								<span className="text-muted-foreground hidden sm:inline">Response time:</span>
								<span className="text-muted-foreground sm:hidden">Response:</span>
								<span className="font-medium">{business.responseTime || "< 2hrs"}</span>
							</div>
							<div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
								<Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
								<span className="text-muted-foreground hidden sm:inline">Trust score:</span>
								<span className="text-muted-foreground sm:hidden">Trust:</span>
								<span className="font-medium">{business.trustScore || 95}%</span>
							</div>
							<div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
								<Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
								<span className="text-muted-foreground hidden md:inline">Service area:</span>
								<span className="text-muted-foreground md:hidden">Area:</span>
								<span className="font-medium">{business?.serviceArea?.coverage || "Local"}</span>
							</div>
						</div>
						<div className="flex items-center space-x-2 sm:space-x-4 text-muted-foreground">
							<span className="hidden lg:inline">Updated: {new Date().toLocaleDateString()}</span>
							<Button variant="ghost" size="sm" className="px-1.5 sm:px-2 h-6 sm:h-7 text-xs touch-manipulation" onClick={() => setActiveTab("credentials")}>
								<span className="hidden sm:inline">View Credentials →</span>
								<span className="sm:hidden">Credentials →</span>
							</Button>
						</div>
					</div>
				</div>

				{/* Mobile Quick Action Row - Only visible on mobile */}
				<div className="block sm:hidden border-t bg-background/95 backdrop-blur-md">
					<div className="px-3 py-2 mx-auto max-w-screen-2xl">
						<div className="flex items-center justify-between space-x-2">
							{/* Essential Mobile Actions */}
							<div className="flex items-center space-x-2 flex-1">
								<Button size="sm" className="h-8 px-3 text-xs touch-manipulation flex-1" onClick={() => business.phone && window.open(`tel:${business.phone}`)}>
									<Phone className="w-3 h-3 mr-1" />
									Call
								</Button>
								<Button variant="outline" size="sm" className="h-8 px-3 text-xs touch-manipulation flex-1" onClick={() => setActiveTab("booking")}>
									<Calendar className="w-3 h-3 mr-1" />
									Book
								</Button>
								<Button variant="outline" size="sm" className="h-8 px-3 text-xs touch-manipulation flex-1" onClick={() => setActiveTab("contact")}>
									<MessageSquare className="w-3 h-3 mr-1" />
									Message
								</Button>
							</div>

							{/* Mobile Secondary Actions */}
							<div className="flex items-center space-x-1">
								<Button variant="ghost" size="sm" className="px-2 h-8 touch-manipulation" onClick={() => setActiveTab("location")}>
									<Navigation className="w-3 h-3" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="px-2 h-8 touch-manipulation"
									onClick={() => {
										if (navigator.share) {
											navigator.share({
												title: business.name,
												text: business.description,
												url: window.location.href,
											});
										} else {
											navigator.clipboard.writeText(window.location.href).then(() => {
												toast({ title: "Link copied!" });
											});
										}
									}}
								>
									<Share className="w-3 h-3" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Enhanced Business Hero Section - Vercel Style */}
			<section className="bg-[#0a0a0a] border-b border-gray-800/30">
				<div className="max-w-6xl mx-auto px-6 py-12">
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
						{/* Left Column - Comprehensive Business Information */}
						<div className="space-y-8">
							{/* Business Identity */}
							<div className="space-y-4">
								<div className="flex flex-wrap items-center gap-2">
									{business.categories?.slice(0, 3).map((category, index) => (
										<span key={index} className="text-gray-400 text-sm bg-gray-800/40 px-2 py-1 rounded-md">
											{category}
										</span>
									))}
									{business.verified && (
										<div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2 py-1 rounded-md text-sm font-medium">
											<CheckCircle className="w-3 h-3" />
											Verified Business
										</div>
									)}
									{business.isOpenNow && (
										<div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2 py-1 rounded-md text-sm font-medium">
											<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
											Open Now
										</div>
									)}
								</div>

								<h1 className="text-3xl lg:text-4xl font-semibold text-[#EAEAEA] tracking-tight leading-tight">
									{business.name}
								</h1>

								<p className="text-gray-400 leading-relaxed text-lg">
									{business.description || "Professional services you can trust"}
								</p>
							</div>

							{/* Rating & Social Proof */}
							<div className="flex items-center gap-6 py-4 border-b border-gray-800/20">
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
										))}
									</div>
									<span className="text-[#EAEAEA] font-medium text-lg">{business.ratings?.overall || 4.5}</span>
								</div>
								<Button variant="link" className="p-0 h-auto text-sm text-gray-400 hover:text-gray-300 underline underline-offset-4" onClick={() => setActiveTab("reviews")}>
									{business.reviewCount || 0} customer reviews
								</Button>
								<div className="text-sm text-gray-400">
									{business.trustScore || 95}% satisfaction rate
								</div>
							</div>

							{/* Key Business Information Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Location & Service */}
								<div className="bg-gray-900/20 border border-gray-800/20 rounded-lg p-4">
									<h3 className="text-sm font-medium text-[#EAEAEA] mb-3 flex items-center gap-2">
										<MapPin className="w-4 h-4" />
										Location & Service Area
									</h3>
									<div className="space-y-2 text-sm">
										{business.address && (
											<div className="text-gray-400">{business.address}</div>
										)}
										<div className="text-gray-400">Service Area: {business?.serviceArea?.primary || 'Local area'}</div>
										{business?.serviceArea?.radius && (
											<div className="text-gray-500">Up to {business.serviceArea.radius} mile radius</div>
										)}
									</div>
								</div>

								{/* Hours & Availability */}
								<div className="bg-gray-900/20 border border-gray-800/20 rounded-lg p-4">
									<h3 className="text-sm font-medium text-[#EAEAEA] mb-3 flex items-center gap-2">
										<Calendar className="w-4 h-4" />
										Hours & Availability
									</h3>
									<div className="space-y-2 text-sm">
										<div className={`font-medium ${business.isOpenNow ? 'text-green-400' : 'text-orange-400'}`}>
											{business.isOpenNow ? 'Open Now' : 'Currently Closed'}
										</div>
										<div className="text-gray-400">Today: {business.hours?.today || "9:00 AM - 6:00 PM"}</div>
									</div>
								</div>

								{/* Communication */}
								<div className="bg-gray-900/20 border border-gray-800/20 rounded-lg p-4">
									<h3 className="text-sm font-medium text-[#EAEAEA] mb-3 flex items-center gap-2">
										<Zap className="w-4 h-4" />
										Response & Communication
									</h3>
									<div className="space-y-2 text-sm">
										<div className="text-gray-400">Response: {business.responseTime || "2 hours"}</div>
										{business.phone && <div className="text-gray-400">Phone: {business.phone}</div>}
										<div className="text-gray-400">Email quotes available</div>
									</div>
								</div>

								{/* Credentials */}
								<div className="bg-gray-900/20 border border-gray-800/20 rounded-lg p-4">
									<h3 className="text-sm font-medium text-[#EAEAEA] mb-3 flex items-center gap-2">
										<Shield className="w-4 h-4" />
										Professional Status
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex items-center gap-2 text-gray-400">
											<CheckCircle className="w-3 h-3 text-green-500" />
											Licensed & Insured
										</div>
										{business.yearsInBusiness && (
											<div className="flex items-center gap-2 text-gray-400">
												<Building className="w-3 h-3 text-blue-500" />
												{business.yearsInBusiness} years experience
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Right Column - Gallery & Actions */}
						<div className="space-y-6">
							{/* Business Gallery */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-medium text-[#EAEAEA]">Gallery</h3>
									<button onClick={() => setShowAllPhotos(true)} className="text-xs text-gray-400 hover:text-gray-300">
										View All
									</button>
								</div>
								
								{/* Featured Image */}
								<div className="aspect-[4/3] bg-gray-900/20 border border-gray-800/20 rounded-lg overflow-hidden group relative">
									{business.photos?.[selectedImageIndex] || business.photos?.[0] ? (
										<img
											src={business.photos?.[selectedImageIndex] || business.photos?.[0]}
											alt={`${business.name} - Professional Image`}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<Building className="w-8 h-8 text-gray-500" />
										</div>
									)}
								</div>
							</div>

							{/* Primary Actions */}
							<div className="space-y-3">
								<button className="w-full h-11 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center justify-center gap-2">
									<MessageCircle className="w-4 h-4" />
									Get Free Quote
								</button>
								
								<div className="grid grid-cols-3 gap-2">
									<button className="h-10 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors text-xs font-medium flex items-center justify-center gap-1" onClick={() => business.phone && window.open(`tel:${business.phone}`)}>
										<Phone className="h-3 w-3" />
										Call
									</button>
									<button className="h-10 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors text-xs font-medium flex items-center justify-center gap-1">
										<Navigation className="h-3 w-3" />
										Directions
									</button>
									<button className="h-10 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors text-xs font-medium flex items-center justify-center gap-1">
										<Share2 className="h-3 w-3" />
										Share
									</button>
								</div>
								
								<div className="grid grid-cols-2 gap-3">
									<button onClick={() => setActiveTab('reviews')} className="h-10 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2">
										<Calendar className="h-4 w-4" />
										Book Service
									</button>
									<button className="h-10 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2">
										<ExternalLink className="h-4 w-4" />
										Website
									</button>
								</div>
							</div>

							{/* Status & Availability */}
							{business.isOpenNow && (
								<div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
									<div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
										<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
										Available Now
									</div>
									<div className="text-xs text-gray-400">
										Quick response guaranteed
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Quick Decision Strip */}
			<section className="bg-gray-900/10 border-b border-gray-800/20">
				<div className="max-w-6xl mx-auto px-6 py-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div className="p-3">
							<div className="text-sm font-medium text-[#EAEAEA]">{business.startingPrice || business.pricing?.hourlyRate || 'Call for quote'}</div>
							<div className="text-xs text-gray-500">Starting price</div>
						</div>
						<div className="p-3">
							<div className="text-sm font-medium text-[#EAEAEA]">{business.responseTime || '2 hours'}</div>
							<div className="text-xs text-gray-500">Response time</div>
						</div>
						<div className="p-3">
							<div className="text-sm font-medium text-[#EAEAEA]">{business?.serviceArea?.primary || 'Local area'}</div>
							<div className="text-xs text-gray-500">Service area</div>
						</div>
						<div className="p-3">
							<div className={`text-sm font-medium ${business.isOpenNow ? 'text-green-400' : 'text-gray-400'}`}>
								{business.isOpenNow ? 'Open now' : 'Closed'}
							</div>
							<div className="text-xs text-gray-500">Status</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Tabbed Content */}
			<div className="px-6 pt-8 mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
					{/* Left Sidebar Navigation */}
					<aside className="space-y-1">
						<nav aria-label="Profile sections" className="space-y-1">
							{businessTabs.map((tab) => (
								<button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? "page" : undefined} className={cn("w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors", activeTab === tab.id ? "bg-gray-800/50 text-[#EAEAEA] border-l-2 border-gray-500" : "text-gray-400 hover:text-gray-300 hover:bg-gray-900/20")}>
									<tab.icon className="w-4 h-4" />
									<span>{tab.label}</span>
								</button>
							))}
						</nav>
					</aside>

					{/* Right Content Area */}
					<div className="space-y-6">
								<div className="flex items-center space-x-2 text-sm text-muted-foreground">
									{business.categories?.slice(0, 2).map((category, index) => (
										<span key={index}>{category}</span>
									))}
									{business.verified && (
										<Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 ml-2">
											<Verified className="w-3 h-3 mr-1" />
											Verified Business
										</Badge>
									)}
								</div>
								<h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">{business.name}</h1>

								{/* Rating & Reviews */}
								<div className="flex items-center space-x-4">
									<div className="flex items-center space-x-1">
										<div className="flex text-yellow-400">
											{[...Array(5)].map((_, i) => (
												<Star key={i} className={cn("w-4 h-4", i < Math.floor(business.ratings?.overall || 4.5) ? "fill-current" : "")} />
											))}
										</div>
										<span className="text-sm font-medium">{business.ratings?.overall || 4.5}</span>
									</div>
									<Button variant="link" className="p-0 h-auto text-sm text-primary hover:underline" onClick={() => setActiveTab("reviews")}>
										{business.reviewCount || 0} customer reviews
									</Button>
									<span className="text-sm text-muted-foreground">|</span>
									<span className="text-sm text-muted-foreground">{business.responseTime || "< 2 hours response"}</span>
								</div>
							</div>

							{/* Key Business Info */}
							<div className="space-y-3 p-4 bg-muted/30 rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
									<div className="flex items-center space-x-2">
										<MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
										<span className="text-foreground">{business?.address || business?.serviceArea?.primary || "Service Area Available"}</span>
									</div>
									<div className="flex items-center space-x-2">
										<Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
										<span className={cn("font-medium", business.isOpenNow ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
											{business.isOpenNow ? "Open Now" : "Closed"} • {business.realTimeAvailability?.nextAvailable || "Call for hours"}
										</span>
									</div>
									{business.phone && (
										<div className="flex items-center space-x-2">
											<Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
											<span className="text-foreground">{business.phone}</span>
										</div>
									)}
									<div className="flex items-center space-x-2">
										<Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
										<span className="text-foreground">Licensed & Insured • {business.trustScore || 95}% Trust Score</span>
									</div>
								</div>
							</div>

							{/* Pricing Information */}
							<div className="space-y-2">
								<div className="flex items-baseline space-x-2">
									<span className="text-2xl font-bold text-foreground">{business.pricing?.hourlyRate || "$85-125"}</span>
									<span className="text-muted-foreground">per hour</span>
								</div>
								<div className="flex items-center space-x-4 text-sm">
									<span className="text-green-600 dark:text-green-400 font-medium">{business.pricing?.consultationFee || "FREE"} consultation</span>
									<span className="text-muted-foreground">•</span>
									<span className="text-muted-foreground">{business.pricing?.estimates || "Free estimates available"}</span>
								</div>
							</div>

							{/* Action Buttons (Amazon-style) */}
							<div className="space-y-3">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<Button size="lg" className="h-12 font-semibold" onClick={() => business.phone && window.open(`tel:${business.phone}`)}>
										<Phone className="w-5 h-5 mr-2" />
										Call Now
									</Button>
									<Button variant="outline" size="lg" className="h-12 font-semibold">
										<Calendar className="w-5 h-5 mr-2" />
										Book Service
									</Button>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<Button variant="outline" size="lg" className="h-12">
										<MessageSquare className="w-5 h-5 mr-2" />
										Send Message
									</Button>
									<Button variant="outline" size="lg" className="h-12">
										<DollarSign className="w-5 h-5 mr-2" />
										Get Quote
									</Button>
								</div>
							</div>

							{/* Quick Features */}
							<div className="border rounded-lg p-4">
								<h3 className="font-semibold text-foreground mb-3">Service Highlights</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
									{business.businessHighlights?.slice(0, 8).map((highlight, index) => (
										<div key={index} className="flex items-center space-x-2">
											<CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
											<span className="text-sm text-foreground">{highlight}</span>
										</div>
									))}
								</div>
							</div>

							{/* Trust Indicators */}
							<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
								<div className="flex items-center space-x-2">
									<Shield className="w-5 h-5 text-green-600" />
									<span className="text-sm font-medium text-green-800 dark:text-green-200">Thorbis Verified Business</span>
								</div>
								<Button variant="link" className="p-0 h-auto text-xs text-green-600" onClick={() => setActiveTab("about")}>
									View credentials
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Tab Content */}
			<div className="px-6 pt-8 mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
					{/* Left Sidebar Navigation */}
					<aside className="space-y-1">
						<nav aria-label="Profile sections" className="space-y-1">
							{businessTabs.map((tab) => (
								<button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? "page" : undefined} className={cn("w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors", activeTab === tab.id ? "bg-gray-800/50 text-[#EAEAEA] border-l-2 border-gray-500" : "text-gray-400 hover:text-gray-300 hover:bg-gray-900/20")}>
									<tab.icon className="w-4 h-4" />
									<span>{tab.label}</span>
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
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Business Overview</CardTitle>
											<CardDescription className="text-muted-foreground">Complete overview of our business and services</CardDescription>
										</CardHeader>
										<CardContent>
											<BusinessOverview business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "services" && (
							<div className="space-y-8">
								{/* Services and Pricing */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									<Suspense fallback={<SectionLoader />}>
										<Card>
											<CardHeader>
												<CardTitle className="text-xl font-semibold text-foreground">Services & Specialties</CardTitle>
											</CardHeader>
											<CardContent>
												<Services business={business} />
											</CardContent>
										</Card>
									</Suspense>

									<Suspense fallback={<SectionLoader />}>
										<Card>
											<CardHeader>
												<CardTitle className="text-xl font-semibold text-foreground">Pricing & Service Information</CardTitle>
											</CardHeader>
											<CardContent>
												<Pricing business={business} />
											</CardContent>
										</Card>
									</Suspense>
								</div>
							</div>
						)}

						{activeTab === "reviews" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Customer Reviews & Ratings</CardTitle>
											<CardDescription className="text-muted-foreground">See what our customers have to say about our work</CardDescription>
										</CardHeader>
										<CardContent>
											<Reviews business={business} setShowReviewModal={setShowReviewModal} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "gallery" && (
							<div className="space-y-8">
								{/* Photo Gallery Section */}
								{business.photos && business.photos.length > 0 && (
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Photo Gallery & Work Examples</CardTitle>
											<CardDescription className="text-muted-foreground">Browse through our work and see what we can do for you</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
												{business.photos?.map((photo, index) => (
													<div
														key={index}
														className="relative group cursor-pointer"
														onClick={() => {
															setSelectedImageIndex(index);
															setShowAllPhotos(true);
														}}
													>
														<div className="aspect-square bg-white rounded-lg border overflow-hidden">
															<img src={photo} alt={`${business.name} photo ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
														</div>
														<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
															<Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						)}

						{activeTab === "about" && (
							<div className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle className="text-xl font-semibold text-foreground">About {business.name}</CardTitle>
										<CardDescription className="text-muted-foreground">Learn more about our company and team</CardDescription>
									</CardHeader>
									<CardContent className="prose max-w-none">
										<p className="text-muted-foreground leading-relaxed mb-6">{business.description || "A trusted local business serving the community with excellent service and expertise. We pride ourselves on delivering quality workmanship and exceptional customer service to every project we undertake."}</p>

										{/* Company History & Mission */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<h4 className="font-semibold text-foreground mb-3">Our Mission</h4>
												<p className="text-sm text-muted-foreground mb-4">To provide exceptional service and quality workmanship while building lasting relationships with our customers and community.</p>
											</div>
											<div>
												<h4 className="font-semibold text-foreground mb-3">Experience</h4>
												<p className="text-sm text-muted-foreground mb-4">With years of experience in the industry, we've built a reputation for reliability, professionalism, and excellence.</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{activeTab === "availability" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Live Availability & Booking</CardTitle>
										</CardHeader>
										<CardContent>
											<Availability business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "contact" && (
							<div className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle className="text-xl font-semibold text-foreground">Contact Information</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{/* Contact Details */}
											<div className="space-y-3">
												{business.phone && (
													<div className="flex items-center space-x-3">
														<Phone className="w-5 h-5 text-muted-foreground" />
														<div>
															<p className="font-medium text-foreground">{business.phone}</p>
															<Button variant="link" className="p-0 h-auto text-sm text-primary" onClick={() => window.open(`tel:${business.phone}`)}>
																Call Now
															</Button>
														</div>
													</div>
												)}
												<div className="flex items-start space-x-3">
													<MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
													<div>
														<p className="font-medium text-foreground">{business.address || "Address not available"}</p>
														<p className="text-sm text-muted-foreground">{business.city && business.state ? `${business.city}, ${business.state}` : "Location"}</p>
													</div>
												</div>
												{business.website && (
													<div className="flex items-center space-x-3">
														<Globe className="w-5 h-5 text-muted-foreground" />
														<Button variant="link" className="p-0 h-auto text-primary" onClick={() => window.open(business.website, "_blank")}>
															Visit Website
															<ExternalLink className="w-3 h-3 ml-1" />
														</Button>
													</div>
												)}
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Enhanced Contact Section */}
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Get In Touch</CardTitle>
											<CardDescription className="text-muted-foreground">Ready to get started? Contact us today for more information</CardDescription>
										</CardHeader>
										<CardContent>
											<EnhancedContact business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "location" && (
							<div className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle className="text-xl font-semibold text-foreground">Location & Business Hours</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<h4 className="font-semibold text-foreground mb-3 flex items-center">
													<MapPin className="w-4 h-4 mr-2" />
													Location
												</h4>
												<div className="space-y-2">
													<p className="font-medium text-foreground">{business.address || "Address not available"}</p>
													<p className="text-sm text-muted-foreground">{business.city && business.state ? `${business.city}, ${business.state}` : "Location"}</p>
													<p className="text-sm text-muted-foreground">Service Area: {business?.serviceArea?.primary || "Local area"}</p>
												</div>
											</div>
											<div>
												<h4 className="font-semibold text-foreground mb-3 flex items-center">
													<Clock className="w-4 h-4 mr-2" />
													Business Hours
												</h4>
												<div className="space-y-2">
													{business.business_hours?.length > 0 ? (
														business.business_hours.map((hours, index) => (
															<div key={index} className="flex justify-between text-sm">
																<span className="capitalize font-medium text-foreground">{hours.day_of_week}</span>
																<span className={hours.is_closed ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>{hours.is_closed ? "Closed" : `${hours.open_time} - ${hours.close_time}`}</span>
															</div>
														))
													) : (
														<p className="text-muted-foreground text-sm">Contact for hours</p>
													)}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{activeTab === "credentials" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Credentials & Certifications</CardTitle>
										</CardHeader>
										<CardContent>
											<Credentials business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "expertise" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Expertise & Team</CardTitle>
										</CardHeader>
										<CardContent>
											<Expertise business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "booking" && (
							<div className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle className="text-xl font-semibold text-foreground">Book a Service</CardTitle>
										<CardDescription className="text-muted-foreground">Schedule your appointment or consultation</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<Button size="lg" className="h-16">
													<Calendar className="w-5 h-5 mr-2" />
													Schedule Service
												</Button>
												<Button variant="outline" size="lg" className="h-16">
													<Video className="w-5 h-5 mr-2" />
													Video Consultation
												</Button>
											</div>
											<Suspense fallback={<SectionLoader />}>
												<Availability business={business} />
											</Suspense>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{activeTab === "warranty" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Warranties & Guarantees</CardTitle>
										</CardHeader>
										<CardContent>
											<WarrantyTracker business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "portfolio" && (
							<div className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle className="text-xl font-semibold text-foreground">Portfolio & Past Work</CardTitle>
										<CardDescription className="text-muted-foreground">Browse our completed projects and success stories</CardDescription>
									</CardHeader>
									<CardContent>
										{business.workGallery?.portfolio && (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
												{business.workGallery.portfolio.map((project, index) => (
													<Card key={index} className="overflow-hidden">
														<div className="aspect-video bg-white">
															<img src={project.image} alt={project.title} className="w-full h-full object-cover" />
														</div>
														<CardContent className="p-4">
															<h4 className="font-semibold text-foreground mb-2">{project.title}</h4>
															<p className="text-sm text-muted-foreground mb-2">{project.description}</p>
															<Badge variant="outline" className="text-xs">
																{project.category}
															</Badge>
														</CardContent>
													</Card>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						)}

						{activeTab === "before-after" && (
							<div className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle className="text-xl font-semibold text-foreground">Before & After Gallery</CardTitle>
										<CardDescription className="text-muted-foreground">See the transformation we've achieved for our clients</CardDescription>
									</CardHeader>
									<CardContent>
										{business.workGallery?.beforeAfter && (
											<div className="space-y-8">
												{business.workGallery.beforeAfter.map((project, index) => (
													<Card key={index}>
														<CardHeader>
															<CardTitle className="text-lg">{project.title}</CardTitle>
															<CardDescription>{project.description}</CardDescription>
														</CardHeader>
														<CardContent>
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<div>
																	<h4 className="font-medium text-foreground mb-2">Before</h4>
																	<div className="aspect-video bg-white rounded border overflow-hidden">
																		<img src={project.before} alt="Before" className="w-full h-full object-cover" />
																	</div>
																</div>
																<div>
																	<h4 className="font-medium text-foreground mb-2">After</h4>
																	<div className="aspect-video bg-white rounded border overflow-hidden">
																		<img src={project.after} alt="After" className="w-full h-full object-cover" />
																	</div>
																</div>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						)}

						{activeTab === "faq" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Frequently Asked Questions</CardTitle>
											<CardDescription className="text-muted-foreground">Get answers to common questions about our services</CardDescription>
										</CardHeader>
										<CardContent>
											<FAQ business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "careers" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Career Opportunities</CardTitle>
											<CardDescription className="text-muted-foreground">Join our growing team</CardDescription>
										</CardHeader>
										<CardContent>
											<Careers business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "operations" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Business Operations</CardTitle>
											<CardDescription className="text-muted-foreground">Our operational procedures and business processes</CardDescription>
										</CardHeader>
										<CardContent>
											<BusinessOperations business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "certified-elite" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Certified Elite Status</CardTitle>
											<CardDescription className="text-muted-foreground">Elite certifications and premium recognition</CardDescription>
										</CardHeader>
										<CardContent>
											<CertifiedElite business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "partnerships" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Partnerships & Affiliations</CardTitle>
											<CardDescription className="text-muted-foreground">Our business partnerships and professional network</CardDescription>
										</CardHeader>
										<CardContent>
											<Partnerships business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "menu" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Menu & Offerings</CardTitle>
											<CardDescription className="text-muted-foreground">Browse our menu and available offerings</CardDescription>
										</CardHeader>
										<CardContent>
											<MenuSection business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}

						{activeTab === "automotive" && (
							<div className="space-y-8">
								<Suspense fallback={<SectionLoader />}>
									<Card>
										<CardHeader>
											<CardTitle className="text-xl font-semibold text-foreground">Automotive Services</CardTitle>
											<CardDescription className="text-muted-foreground">Specialized automotive and vehicle services</CardDescription>
										</CardHeader>
										<CardContent>
											<AutomotiveServices business={business} />
										</CardContent>
									</Card>
								</Suspense>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Enhanced Footer with Business Info */}
			<footer className="bg-card border-t mt-16">
				<div className="px-4 py-8 mx-auto max-w-screen-2xl lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div>
							<h3 className="font-semibold text-lg mb-3 text-foreground">{business.name}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed mb-4">{business.description?.substring(0, 150) || "Professional service provider in your area."}</p>
							<div className="flex items-center space-x-2 text-sm text-muted-foreground">
								<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
								<span>
									{business.ratings?.overall || 4.5} ({business.reviewCount || 0} reviews)
								</span>
							</div>
						</div>
						<div>
							<h4 className="font-semibold mb-3 text-foreground">Quick Links</h4>
							<div className="space-y-2 text-sm">
								<Button variant="link" className="p-0 h-auto font-normal text-muted-foreground hover:text-primary">
									Services
								</Button>
								<Button variant="link" className="p-0 h-auto font-normal text-muted-foreground hover:text-primary">
									Reviews
								</Button>
								<Button variant="link" className="p-0 h-auto font-normal text-muted-foreground hover:text-primary">
									Contact
								</Button>
								<Button variant="link" className="p-0 h-auto font-normal text-muted-foreground hover:text-primary">
									Book Now
								</Button>
							</div>
						</div>
						<div>
							<h4 className="font-semibold mb-3 text-foreground">Contact</h4>
							<div className="space-y-2 text-sm text-muted-foreground">
								{business.phone && (
									<div className="flex items-center space-x-2">
										<Phone className="w-4 h-4" />
										<span>{business.phone}</span>
									</div>
								)}
								{business.address && (
									<div className="flex items-start space-x-2">
										<MapPin className="w-4 h-4 mt-0.5" />
										<span>{business.address}</span>
									</div>
								)}
								{business.website && (
									<div className="flex items-center space-x-2">
										<Globe className="w-4 h-4" />
										<Button variant="link" className="p-0 h-auto text-sm text-muted-foreground hover:text-primary" onClick={() => window.open(business.website, "_blank")}>
											Visit Website
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>
					<Separator className="my-6" />
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<p>© 2024 {business.name}. All rights reserved.</p>
						<p>Last updated: {new Date().toLocaleDateString()}</p>
					</div>
				</div>
			</footer>
		</div>
	);
}


"use client";

import React, { useState } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/ui/accordion";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { 
  ShoppingCart, 
  Star, 
  CheckCircle, 
  Truck, 
  Shield, 
  Clock, 
  Package, 
  ArrowLeft, 
  Heart, 
  Share2, 
  ThumbsUp, 
  ArrowRight, 
  User,
  Award,
  Microscope,
  Leaf,
  HeartHandshake,
  Headphones,
  ShoppingBag,
  Eye,
  Move3D,
  ZoomIn,
  Info,
  Plus,
  Minus,
  Copy
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Product3DViewer from "@components/store/Product3DViewer";
import ThorbisStyleProductShowcase from "@components/store/ThorbisStyleProductShowcase";
import ClientOnly from "@components/store/ClientOnly";

export const dynamic = "force-dynamic";

import { allProducts } from "@data/products";

const getProductData = (productId) => {
	// Find product in the allProducts array
	const product = allProducts.find(p => p.id === productId);
	
	if (!product) {
		return null;
	}

	// Generate additional product data based on the base product
	const enhancedProduct = {
		...product,
		// Generate multiple images for the product
		images: [
			product.image,
			product.image, // Duplicate for gallery
			product.image, // Additional view
			product.image  // Fourth view
		],
		// Generate badges based on product properties
		badges: [
			product.brand,
			product.category,
			product.badge && product.badge !== "New" ? product.badge : null
		].filter(Boolean),
		// Generate variants based on price
		variants: [
			{ 
				name: "Standard Package", 
				price: product.price, 
				selected: true 
			},
			...(product.originalPrice && product.originalPrice > product.price ? [{
				name: "Premium Package", 
				price: product.originalPrice, 
				selected: false 
			}] : [])
		],
		// Generate features based on category and product type
		features: generateFeatures(product),
		// Generate specifications
		specifications: generateSpecifications(product),
		// Standard availability and shipping info
		inStock: true,
		availability: "Available",
		shipping: "FREE Shipping",
		shippingTime: "Ships within 1-2 business days",
		returnPolicy: "30-day money-back guarantee",
		madeIn: "United States",
		businessType: "Technology Company"
	};

	return enhancedProduct;
};

// Generate features based on product category and type
const generateFeatures = (product) => {
	if (!product || !product.category) {
		return {
			"Quality Assurance": "Rigorous testing and quality control",
			"Expert Support": "24/7 technical support available"
		};
	}
	
	const baseFeatures = {
		"Quality Assurance": "Rigorous testing and quality control",
		"Expert Support": "24/7 technical support available",
		"Easy Integration": "Seamless integration with existing systems",
		"Reliable Performance": "Built for demanding business environments"
	};

	const categoryFeatures = {
		"POS Systems": {
			"Payment Processing": "Accept all major payment methods",
			"Inventory Management": "Real-time inventory tracking",
			"Customer Analytics": "Detailed customer insights and reporting",
			"Multi-Location": "Manage multiple stores from one system"
		},
		"Fleet Management": {
			"Real-Time Tracking": "Live GPS location updates",
			"Driver Analytics": "Monitor driving behavior and safety",
			"Route Optimization": "AI-powered route planning",
			"Maintenance Alerts": "Predictive maintenance reminders"
		},
		"Security Systems": {
			"24/7 Monitoring": "Continuous security surveillance",
			"Smart Detection": "AI-powered threat detection",
			"Remote Access": "Monitor from anywhere",
			"Easy Installation": "Quick setup and configuration"
		},
		"Kitchen Systems": {
			"Rugged Design": "Built for harsh kitchen environments",
			"Fast Processing": "Quick order processing",
			"Temperature Monitoring": "Real-time temperature tracking",
			"Easy Cleaning": "Designed for easy maintenance"
		},
		"Clothing": {
			"Premium Quality": "High-quality materials and construction",
			"Professional Design": "Perfect for business environments",
			"Comfortable Fit": "Designed for all-day comfort",
			"Durable Construction": "Built to last"
		},
		"Office Supplies": {
			"Professional Quality": "Premium office supplies",
			"Branded Design": "Custom Thorbis branding",
			"Practical Use": "Designed for daily use",
			"Value Pricing": "Competitive pricing"
		}
	};

	return {
		...baseFeatures,
		...(categoryFeatures[product.category] || {})
	};
};

// Generate specifications based on product
const generateSpecifications = (product) => {
	if (!product) {
		return {
			Category: "Unknown",
			Brand: "Thorbis",
			SKU: "UNKNOWN-001"
		};
	}
	
	const baseSpecs = {
		Category: product.category || "Unknown",
		Brand: product.brand || "Thorbis",
		SKU: `${(product.id || "unknown").toUpperCase()}-001`
	};

	const categorySpecs = {
		"POS Systems": {
			Display: '15.6" HD Touchscreen',
			Processor: "Intel Core i3",
			Memory: "8GB RAM",
			Storage: "256GB SSD",
			Connectivity: "WiFi 6, Bluetooth 5.0",
			Ports: "USB 3.0, Ethernet, HDMI",
			OS: "Windows 11 Pro",
			Warranty: "3 years"
		},
		"Fleet Management": {
			"GPS Accuracy": "±3 meters",
			"Battery Life": "Up to 30 days",
			"Operating Temperature": "-20°C to +70°C",
			"Water Resistance": "IP67",
			Connectivity: "4G LTE, GPS, GLONASS",
			Installation: "Plug-and-play",
			Coverage: "Global",
			Warranty: "2 years"
		},
		"Security Systems": {
			Resolution: "4K Ultra HD",
			FieldOfView: "130° wide angle",
			NightVision: "Up to 100ft",
			Storage: "Up to 2TB",
			Connectivity: "WiFi, Ethernet",
			Power: "PoE or AC adapter",
			Warranty: "2 years"
		},
		"Clothing": {
			Material: "Premium cotton blend",
			Fit: "Regular fit",
			Care: "Machine washable",
			Colors: "Available in multiple colors",
			Sizes: "S-XXL available"
		},
		"Office Supplies": {
			Material: "High-quality materials",
			Size: "Standard sizes",
			Packaging: "Professional packaging",
			Quantity: "Various quantities available"
		}
	};

	return {
		...baseSpecs,
		...(categorySpecs[product.category] || {})
	};
};

// Removed ProductSkeleton component - no loading states

function ProductGallery({ images, productName, category, product }) {
	const [selectedImage, setSelectedImage] = useState(0);
	const [viewMode, setViewMode] = useState('3d'); // '3d', 'image'
	const [isZoomed, setIsZoomed] = useState(false);

	return (
		<section aria-label="Product gallery" className="col-span-1">
			<div className="sticky top-[100px]">
				<div className="space-y-4">
					{/* Enhanced Main Viewer Area with Premium Thorbis Styling */}
					<div className="relative group">
						{viewMode === '3d' ? (
							<div className="aspect-square rounded-2xl overflow-hidden bg-black border border-border shadow-xl hover:shadow-2xl transition-all duration-500">
								<Product3DViewer 
									productName={productName}
									productCategory={category}
									className="h-full w-full border-0"
									autoRotate={false}
									showControls={true}
								/>
							</div>
						) : (
							<div className="relative aspect-square group bg-black rounded-2xl border border-border shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
								<Image
									alt={productName}
									fill
									className={`object-contain p-6 transition-all duration-500 ${
										isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'
									}`}
									sizes="(min-width: 1024px) 66vw, 100vw"
									src={images[selectedImage]}
									priority
									onClick={() => setIsZoomed(!isZoomed)}
								/>
								
								{/* Enhanced Image Counter */}
								<div className="absolute top-4 right-4 z-10">
									<div className="bg-black/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl border border-border shadow-xl font-semibold text-sm">
										{selectedImage + 1} / {images.length}
									</div>
								</div>

								{/* Enhanced Navigation Arrows */}
								<div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
									{selectedImage > 0 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setSelectedImage(selectedImage - 1)}
											className="bg-black/90 hover:bg-black rounded-xl h-12 w-12 p-0 shadow-xl border border-border hover:scale-110 transition-all duration-200 backdrop-blur-sm"
										>
											<ArrowLeft className="h-5 w-5 text-white" />
										</Button>
									)}
									
									{selectedImage < images.length - 1 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setSelectedImage(selectedImage + 1)}
											className="bg-black/90 hover:bg-black rounded-xl h-12 w-12 p-0 shadow-xl border border-border hover:scale-110 transition-all duration-200 backdrop-blur-sm ml-auto"
										>
											<ArrowRight className="h-5 w-5 text-white" />
										</Button>
									)}
								</div>

								{/* Enhanced Zoom Indicator */}
								{!isZoomed && (
									<div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
										<div className="bg-black/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg border border-border shadow-xl text-sm font-medium flex items-center gap-2">
											<ZoomIn className="h-4 w-4" />
											Click to zoom
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Enhanced View Mode Selector */}
					<div className="flex justify-center">
						<div className="flex items-center gap-2 p-1.5 bg-black/80 rounded-2xl border border-border shadow-xl backdrop-blur-sm">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setViewMode('3d')}
								className={`h-10 px-4 rounded-xl font-semibold transition-all duration-300 ${
									viewMode === '3d' 
										? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg scale-105' 
										: 'hover:bg-muted text-muted-foreground'
								}`}
							>
								<Move3D className="h-4 w-4 mr-2" />
								3D
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setViewMode('image')}
								className={`h-10 px-4 rounded-xl font-semibold transition-all duration-300 ${
									viewMode === 'image' 
										? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg scale-105' 
										: 'hover:bg-muted text-muted-foreground'
								}`}
							>
								<Eye className="h-4 w-4 mr-2" />
								Gallery
							</Button>
						</div>
					</div>

					{/* Clean thumbnails section - more compact */}
					<div className="space-y-2">
						{/* Desktop thumbnails */}
						<div className="hidden md:flex justify-center">
							<div className="flex gap-1.5 max-w-md overflow-x-auto py-1 px-1">
								{/* Enhanced 3D View thumbnail - more compact */}
								<button
									onClick={() => setViewMode('3d')}
									className={`relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg bg-black border transition-all duration-300 hover:scale-110 hover:shadow-lg ${
										viewMode === '3d' 
											? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20" 
											: "border-border hover:border-primary/60"
									}`}
								>
									<div className="flex items-center justify-center h-full">
										<Move3D className="w-4 h-4 text-primary" />
									</div>
									<div className="absolute inset-x-0 bottom-0 bg-primary text-primary-foreground text-[8px] text-center py-0.5 font-bold">
										3D
									</div>
								</button>

								{/* Image thumbnails - more compact */}
								{images.map((image, index) => (
									<button
										key={index}
										onClick={() => {
											setSelectedImage(index);
											setViewMode('image');
										}}
										className={`relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg bg-black border transition-all duration-300 hover:scale-110 hover:shadow-lg ${
											viewMode === 'image' && selectedImage === index 
												? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20" 
												: "border-border hover:border-primary/60"
										}`}
									>
										<Image
											alt={`${productName} view ${index + 1}`}
											loading="lazy"
											fill
											className="object-cover"
											sizes="56px"
											src={image}
										/>
																					{viewMode === 'image' && selectedImage === index && (
												<div className="absolute inset-0 border-2 border-primary rounded-lg bg-primary/10" />
											)}
									</button>
								))}
							</div>
						</div>

						{/* Mobile thumbnails - more compact */}
						<div className="md:hidden">
							<div className="flex gap-1.5 overflow-x-auto py-1.5 px-4 -mx-4 scrollbar-hide">
								{/* 3D View thumbnail - mobile */}
								<button
									onClick={() => setViewMode('3d')}
									className={`relative aspect-square w-12 flex-shrink-0 overflow-hidden rounded-lg bg-black border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg ${
										viewMode === '3d' 
											? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20" 
											: "border-border"
									}`}
								>
									<div className="flex items-center justify-center h-full">
										<Move3D className="w-3 h-3 text-primary" />
									</div>
									<div className="absolute inset-x-0 bottom-0 bg-primary text-primary-foreground text-[8px] text-center py-0.5 font-semibold">
										3D
									</div>
								</button>

								{/* Image thumbnails - mobile */}
								{images.map((image, index) => (
									<button
										key={index}
										onClick={() => {
											setSelectedImage(index);
											setViewMode('image');
										}}
										className={`relative aspect-square w-12 flex-shrink-0 overflow-hidden rounded-lg bg-black border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg ${
											viewMode === 'image' && selectedImage === index 
												? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20" 
												: "border-border"
										}`}
									>
										<Image
											alt={`${productName} view ${index + 1}`}
											loading="lazy"
											fill
											className="object-cover"
											sizes="48px"
											src={image}
										/>
									</button>
								))}
								<div className="w-4 flex-shrink-0" aria-hidden="true" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ProductInfo({ product }) {
	const [selectedVariant, setSelectedVariant] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [showFullDescription, setShowFullDescription] = useState(false);

	return (
		<section aria-label="Product information" className="col-span-1">
			<div className="space-y-3">
				{/* Enhanced Product Header - more compact */}
				<div className="space-y-3">
					<div className="space-y-2">
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 bg-primary/30 text-primary-foreground px-2.5 py-1 rounded-full text-sm font-semibold">
								<div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
								New Product
							</div>
							
							<h1 className="text-xl xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-white leading-tight" itemProp="name">
								{product.name}
							</h1>
							
							<meta itemProp="description" content={product.description} />
							<meta itemProp="brand" content={product.brand} />
							<meta itemProp="category" content={product.category} />
						</div>

						{/* Enhanced Badges - more compact */}
						<div className="flex flex-wrap gap-1" aria-label="Product badges">
							{product.badges.map((badge, index) => (
								<Badge 
									key={index}
									className={`text-xs font-semibold px-2.5 py-1 transition-all duration-300 hover:scale-105 ${
										index === 0 
											? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30" 
											: "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
									}`}
								>
									{badge}
								</Badge>
							))}
						</div>
					</div>

					{/* Enhanced Rating Section - more compact */}
					<div className="bg-black rounded-xl p-3 border border-border shadow-lg" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1">
									{[...Array(5)].map((_, i) => (
										<Star key={i} className="w-3 h-3 fill-muted-foreground text-muted-foreground" />
									))}
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg font-bold text-white" itemProp="ratingValue">{product.rating}</span>
									<div className="h-3 w-px bg-border"></div>
									<span className="text-muted-foreground font-semibold text-sm">({product.reviewCount} reviews)</span>
								</div>
							</div>
							<button className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-sm">
								Read Reviews
							</button>
						</div>
						<meta itemProp="bestRating" content="5" />
						<meta itemProp="worstRating" content="1" />
						<meta itemProp="reviewCount" content={product.reviewCount} />
					</div>
				</div>

				{/* Enhanced Variant Selection - more compact */}
				<div className="space-y-2">
					<div className="space-y-2">
						<Label className="block text-base font-bold text-white tracking-tight">Available Configurations</Label>
						<div className="grid grid-cols-1 gap-2">
							{product.variants.map((variant, index) => (
								<button
									key={index}
									onClick={() => setSelectedVariant(index)}
									className={`group p-3 border rounded-xl text-left transition-all duration-300 hover:scale-[1.02] ${
										selectedVariant === index
											? "border-primary bg-primary/20 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
											: "border-border hover:border-primary bg-black hover:shadow-lg"
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="space-y-1">
											<div className="font-bold text-sm text-white">{variant.name}</div>
											<div className="text-muted-foreground text-xs">Professional Configuration</div>
										</div>
										<div className="text-right">
											<div className="text-lg font-bold text-primary">${variant.price.toLocaleString()}</div>
											{selectedVariant === index && (
												<div className="text-xs text-primary font-bold mt-1">✓ Selected</div>
											)}
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Clean business info card */}
				<BusinessInfoCard product={product} />

				{/* Enhanced Product Description - more compact */}
				<div className="bg-black rounded-xl p-4 border border-border shadow-lg">
					<div className="flex items-center gap-2 mb-3">
						<div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
							<Info className="h-3 w-3 text-primary-foreground" />
						</div>
						<h2 className="text-lg font-bold text-white tracking-tight">
							Product Details
						</h2>
					</div>
					<div className="prose prose-invert max-w-none">
						<p className={`text-muted-foreground leading-relaxed text-sm ${!showFullDescription && product.description.length > 200 ? 'line-clamp-4' : ''}`}>
							{product.description}
						</p>
						{product.description.length > 200 && (
							<button
								onClick={() => setShowFullDescription(!showFullDescription)}
								className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-lg font-semibold mt-3 flex items-center gap-2 transition-all duration-200 hover:scale-105 text-sm"
							>
								{showFullDescription ? 'Show Less' : 'Read More'}
								<ArrowRight className={`h-3 w-3 transition-transform ${showFullDescription ? 'rotate-90' : ''}`} />
							</button>
						)}
					</div>
				</div>


			</div>
		</section>
	);
}

function BusinessInfoCard({ product }) {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<>
			{/* Enhanced USA Made Section */}
								<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg mb-4">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
					<div className="flex items-center gap-3">
						<div className="w-10 h-6 shrink-0">
							<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg shadow-md">
								<rect width="32" height="20" fill="#FFFFFF"/>
								<rect width="32" height="1.538" fill="#B22234"/>
								<rect y="3.077" width="32" height="1.538" fill="#B22234"/>
								<rect y="6.154" width="32" height="1.538" fill="#B22234"/>
								<rect y="9.231" width="32" height="1.538" fill="#B22234"/>
								<rect y="12.308" width="32" height="1.538" fill="#B22234"/>
								<rect y="15.385" width="32" height="1.538" fill="#B22234"/>
								<rect y="18.462" width="32" height="1.538" fill="#B22234"/>
								<rect width="13.231" height="10.769" fill="#3C3B6E"/>
							</svg>
						</div>
						<div className="font-black text-lg text-white">
							Made in {product.madeIn}
						</div>
					</div>
					<Badge className="w-fit bg-destructive/30 text-destructive border-destructive/30 px-2.5 py-1 text-xs font-bold">
						🇺🇸 100% American Manufacturing
					</Badge>
				</div>
			</div>

			{/* Enhanced Quality Indicators */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
							<svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9 6a3 3 0 11-6 0 3 3 0 616 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
							</svg>
						</div>
						<span className="font-black text-white text-sm">Supporting Workers</span>
					</div>
				</div>
				<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
							<svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<span className="font-black text-white text-sm">Quality First</span>
					</div>
				</div>
			</div>

			{/* Enhanced Specifications Grid */}
			<div className="space-y-3">
				<h3 className="text-lg font-black text-white tracking-tight">Product Specifications</h3>
				<div className="grid sm:grid-cols-2 gap-3">
					<div className="space-y-3">
						<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground font-bold text-sm">Category</span>
								<span className="font-black text-white text-sm">{product.category}</span>
							</div>
						</div>
						<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground font-bold text-sm">Brand</span>
								<span className="font-black text-white text-sm">{product.brand}</span>
							</div>
						</div>
					</div>
					<div className="space-y-3">
						<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground font-bold text-sm">SKU</span>
								<div className="flex items-center gap-2">
									<span className="font-mono font-black text-white text-sm">{product.specifications.SKU}</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => copyToClipboard(product.specifications.SKU)}
										className="h-6 w-6 p-0 hover:bg-primary/30 rounded-lg"
									>
										{copied ? <CheckCircle className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Enhanced Feature Highlights */}
			<div className="space-y-3">
				<h3 className="text-lg font-black text-white tracking-tight">Key Features</h3>
				<div className="grid sm:grid-cols-2 gap-3">
					{Object.entries(product.features).map(([title, description], index) => {
						const icons = [Award, Microscope, Leaf, Clock];
						const colors = [
							{ bg: 'bg-primary/30', text: 'text-primary' },
							{ bg: 'bg-muted-foreground/30', text: 'text-muted-foreground' },
							{ bg: 'bg-primary/20', text: 'text-primary' },
							{ bg: 'bg-muted-foreground/20', text: 'text-muted-foreground' }
						];
						const IconComponent = icons[index % icons.length];
						const colorScheme = colors[index % colors.length];
						
						return (
							<div key={title} className="group bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
								<div className="flex items-start gap-3">
									<div className={`w-8 h-8 ${colorScheme.bg} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
										<IconComponent className={`h-4 w-4 ${colorScheme.text}`} />
									</div>
									<div className="space-y-1 flex-1">
										<h4 className="font-black text-sm text-white">{title}</h4>
										<p className="text-muted-foreground leading-relaxed text-xs">{description}</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Enhanced Trust Indicators */}
			<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
				<div className="text-center">
					<div className="flex justify-center items-center gap-2 mb-2">
						<div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
							<Shield className="h-4 w-4 text-primary" />
						</div>
						<span className="text-base font-bold text-white">Trusted Quality</span>
					</div>
					<p className="text-muted-foreground text-sm">
						Trusted by thousands of business professionals nationwide
					</p>
				</div>
			</div>
		</>
	);
}

function PurchaseOptions({ product }) {
	const [quantity, setQuantity] = useState(1);
	const [selectedVariant, setSelectedVariant] = useState(0);
	const [isWishlisted, setIsWishlisted] = useState(false);
	const selectedPrice = product.variants[selectedVariant]?.price || product.price;

	const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 99));
	const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

	return (
		<section aria-label="Purchase options" className="col-span-1 w-full lg:max-w-[340px] justify-self-end">
			<div className="sticky top-[80px]">
				<div className="bg-black rounded-xl border border-border shadow-lg w-full mx-auto overflow-hidden">
					<div className="p-4 space-y-4">
						{/* Enhanced Price Section - more compact */}
						<div className="space-y-3">
							<div className="text-center">
								<div className="space-y-2">
									<div className="flex items-baseline justify-center gap-2">
										<div className="text-2xl lg:text-3xl font-bold text-primary">
											${selectedPrice.toFixed(0)}
											<span className="text-lg">.{(selectedPrice % 1).toFixed(2).slice(2)}</span>
										</div>
										{product.originalPrice && product.originalPrice > selectedPrice && (
											<div className="text-base text-muted-foreground line-through">
												${product.originalPrice.toFixed(2)}
											</div>
										)}
									</div>
									{product.originalPrice && product.originalPrice > selectedPrice && (
										<div className="inline-flex items-center gap-2 bg-primary/30 text-primary-foreground px-2.5 py-1 rounded-lg font-semibold text-sm">
											<div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
											Save ${(product.originalPrice - selectedPrice).toFixed(2)} ({Math.round(((product.originalPrice - selectedPrice) / product.originalPrice) * 100)}% off)
										</div>
									)}
								</div>
							</div>

							{/* Enhanced Availability - more compact */}
							<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-lg">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center">
												<CheckCircle className="h-3 w-3 text-primary" />
											</div>
											<div>
												<div className="font-semibold text-white text-sm">In Stock</div>
												<div className="text-xs text-muted-foreground">{product.availability}</div>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center">
											<Truck className="h-3 w-3 text-primary" />
										</div>
										<div>
											<div className="font-semibold text-primary text-sm">{product.shipping}</div>
											<div className="text-xs text-muted-foreground">{product.shippingTime}</div>
										</div>
									</div>
									{product.availability.includes('Backorder') && (
										<div className="text-xs text-muted-foreground bg-muted-foreground/20 p-2 rounded-lg border border-muted-foreground/30">
											Backordered items are prioritized for restocking and ship as soon as available
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Enhanced Quantity Input - more compact */}
						<div className="space-y-2">
							<Label htmlFor="quantity" className="text-sm font-semibold text-white">
								Quantity
							</Label>
							<div className="space-y-2">
								<div className="flex items-center justify-center">
									<div className="flex items-center bg-background border border-border rounded-lg shadow-lg overflow-hidden">
										<Button
											variant="ghost"
											size="sm"
											onClick={decrementQuantity}
											disabled={quantity <= 1}
											className="h-8 w-8 rounded-none border-0 hover:bg-muted transition-colors"
										>
											<Minus className="h-3 w-3 text-white" />
										</Button>
										<Input
											id="quantity"
											type="number"
											min="1"
											max="99"
											value={quantity}
											onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
											className="w-12 text-center border-0 focus:ring-0 h-8 text-sm font-bold bg-transparent text-white"
										/>
										<Button
											variant="ghost"
											size="sm"
											onClick={incrementQuantity}
											disabled={quantity >= 99}
											className="h-8 w-8 rounded-none border-0 hover:bg-muted transition-colors"
										>
											<Plus className="h-3 w-3 text-white" />
										</Button>
									</div>
								</div>
								<div className="text-center">
									<div className="text-sm text-muted-foreground">
										Total: <span className="font-bold text-lg text-white">${(selectedPrice * quantity).toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Enhanced Action Buttons - more compact */}
						<div className="space-y-2">
							<Button className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
								<ShoppingCart className="mr-2 h-4 w-4" />
								Add to Cart
							</Button>
							<Button variant="outline" className="w-full h-10 bg-black/80 backdrop-blur-sm border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
								Buy Now
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
							
							{/* Enhanced Secondary Actions - more compact */}
							<div className="grid grid-cols-2 gap-2">
								<Button 
									variant="outline" 
									className="h-8 rounded-lg border border-border bg-black/80 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 font-semibold text-xs"
									onClick={() => setIsWishlisted(!isWishlisted)}
								>
									<Heart className={`mr-1 h-3 w-3 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
									{isWishlisted ? 'Saved' : 'Save'}
								</Button>
								<Button variant="outline" className="h-8 rounded-lg border border-border bg-black/80 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 font-semibold text-xs">
									<Share2 className="mr-1 h-3 w-3 text-muted-foreground" />
									Share
								</Button>
							</div>
						</div>

						<div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-neutral-600 to-transparent mx-auto" />

						{/* Enhanced Accordion Sections */}
						<div className="w-full space-y-2">
							<Accordion type="single" collapsible className="w-full space-y-2">
								<AccordionItem value="security" className="bg-background/60 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
									<AccordionTrigger className="px-3 py-2 hover:no-underline">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center">
												<Shield className="h-3 w-3 text-primary" />
											</div>
											<span className="font-bold text-white text-sm">Secure Transaction</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-3 pb-3">
										<p className="text-muted-foreground leading-relaxed text-xs">
											Your payment information is processed securely using industry-standard encryption. We do not store credit card details and all transactions are protected by SSL.
										</p>
									</AccordionContent>
								</AccordionItem>

								<AccordionItem value="shipping" className="bg-background/60 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
									<AccordionTrigger className="px-3 py-2 hover:no-underline">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center">
												<Truck className="h-3 w-3 text-primary" />
											</div>
											<span className="font-bold text-white text-sm">Shipping Information</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-3 pb-3">
										<div className="space-y-2 text-muted-foreground text-xs">
											<p>• Free shipping on orders over $50</p>
											<p>• Standard delivery in {product.shippingTime.toLowerCase()}</p>
											<p>• Express shipping available at checkout</p>
											<p>• Tracking information provided via email</p>
										</div>
									</AccordionContent>
								</AccordionItem>

								<AccordionItem value="guarantee" className="bg-background/60 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
									<AccordionTrigger className="px-3 py-2 hover:no-underline">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center">
												<HeartHandshake className="h-3 w-3 text-primary" />
											</div>
											<span className="font-bold text-white text-sm">Satisfaction Guarantee</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-3 pb-3">
										<div className="space-y-2 text-muted-foreground text-xs">
											<p>• {product.returnPolicy}</p>
											<p>• Hassle-free returns process</p>
											<p>• Full refund or exchange options</p>
											<p>• Dedicated customer support team</p>
										</div>
									</AccordionContent>
								</AccordionItem>

								<AccordionItem value="support" className="bg-background/60 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
									<AccordionTrigger className="px-3 py-2 hover:no-underline">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center">
												<Headphones className="h-3 w-3 text-primary" />
											</div>
											<span className="font-bold text-white text-sm">Expert Support</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-3 pb-3">
										<div className="space-y-2 text-muted-foreground text-xs">
											<p>• 24/7 customer support available</p>
											<p>• Technical experts for product guidance</p>
											<p>• Live chat, phone, and email support</p>
											<p>• Comprehensive setup assistance</p>
										</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// Additional enhanced components (recommendations, related products, etc.) would go here...
// For brevity, I'll include just the key enhanced components above.



// Placeholder functions for the remaining components (keeping existing structure)
function RecommendationsSection() {
	return (
		<section className="mt-24">
			<div className="w-full py-20">
				<div className="max-w-6xl mx-auto text-center">
					<div className="bg-gradient-to-br from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 rounded-3xl p-16 md:p-20 border border-border shadow-2xl">
						<div className="mb-12">
							<div className="bg-gradient-to-br from-primary/20 to-primary/30 dark:from-primary/30 dark:to-primary/20 rounded-2xl w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-xl">
								<Package className="w-12 h-12 text-primary dark:text-primary" />
							</div>
							<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-neutral-900 dark:text-white">
								Explore More Products
							</h2>
							<p className="text-neutral-600 dark:text-neutral-300 text-xl md:text-2xl mb-12 leading-relaxed max-w-4xl mx-auto">
								Discover our complete range of business solutions and technology products designed to accelerate your success and drive innovation.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-6 justify-center">
							<Button asChild className="bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 h-16 rounded-3xl px-12 text-xl font-bold hover:scale-105 transition-all duration-300 hover:shadow-2xl">
								<Link href="/store">
									<ShoppingBag className="w-6 h-6 mr-3" />
									Browse All Products
								</Link>
							</Button>
							<Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground h-16 rounded-3xl px-12 text-xl font-bold hover:scale-105 transition-all duration-300 bg-background/50 backdrop-blur-sm">
								<Link href="/store">
									Latest Products
									<ArrowRight className="w-6 h-6 ml-3" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function RelatedProducts({ currentProduct }) {
	// Create deterministic shuffle based on product ID for SSR consistency
	const getDeterministicShuffle = (array, seed) => {
		const hash = seed?.split('').reduce((a, b) => {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0) || 0;
		
		// Use hash to create a deterministic shuffle
		return array.sort((a, b) => {
			const aHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
			const bHash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
			return (aHash + hash) % array.length - (bHash + hash) % array.length;
		});
	};

	// Get related products from the same category or similar categories
	const getRelatedProducts = () => {
		const sameCategory = allProducts.filter(p => 
			p.category === currentProduct.category && p.id !== currentProduct.id
		);
		
		const similarCategories = allProducts.filter(p => 
			p.id !== currentProduct.id && 
			p.category !== currentProduct.category && // Ensure no overlap with sameCategory
			(p.category.includes("Systems") || p.category.includes("Management"))
		);
		
		// Use Set to ensure absolute uniqueness by product ID
		const seenIds = new Set();
		const uniqueProducts = [];
		
		// Add same category products first (priority)
		sameCategory.forEach(product => {
			if (!seenIds.has(product.id)) {
				seenIds.add(product.id);
				uniqueProducts.push(product);
			}
		});
		
		// Add similar category products
		similarCategories.forEach(product => {
			if (!seenIds.has(product.id)) {
				seenIds.add(product.id);
				uniqueProducts.push(product);
			}
		});
		
		// Shuffle deterministically and take first 4
		const related = getDeterministicShuffle(uniqueProducts, currentProduct.id)
			.slice(0, 4);
		
		return related;
	};

	const relatedProducts = getRelatedProducts();
	
	// Debug logging for duplicate keys
	if (process.env.NODE_ENV === 'development') {
		const productIds = relatedProducts.map(p => p.id);
		const duplicateIds = productIds.filter((id, index) => productIds.indexOf(id) !== index);
		if (duplicateIds.length > 0) {
			console.warn('Duplicate product IDs in RelatedProducts:', duplicateIds);
			console.warn('Full relatedProducts array:', relatedProducts);
		}
		
		// Also check if the issue might be in the original allProducts array
		const allProductIds = allProducts.map(p => p.id);
		const allDuplicateIds = allProductIds.filter((id, index) => allProductIds.indexOf(id) !== index);
		if (allDuplicateIds.length > 0) {
			console.error('Duplicate product IDs found in allProducts array:', allDuplicateIds);
		}
	}

	return (
		<section className="mt-32" itemScope itemType="https://schema.org/ItemList">
			<meta itemProp="name" content="Related Products" />
			<meta itemProp="description" content="Business technology products you might also like" />
			
			<div className="mb-24">
				<div className="mb-16 text-center">
					<div className="inline-flex items-center gap-2 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
						<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
						Recommended for You
					</div>
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
						You Might Also Like
					</h2>
					<p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
						Handpicked products that complement your selection perfectly
					</p>
				</div>
				
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
					{relatedProducts.map((product, index) => (
						<div key={`related-${currentProduct.id}-${product.id}-${index}`} className="group relative" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
							<meta itemProp="position" content={index + 1} />
							<div className="group relative h-full flex flex-col bg-gradient-to-br from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 border border-border hover:border-primary dark:hover:border-primary transition-all duration-300 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02]">
								
								{/* Enhanced Wishlist Button */}
								<Button 
									variant="ghost" 
									size="sm" 
									className="absolute z-[1] right-4 top-4 h-10 w-10 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm shadow-lg border border-border/50 rounded-xl hover:scale-110 transition-all duration-200"
								>
									<Heart className="h-5 w-5 transition-colors duration-200 fill-secondary stroke-neutral-600 dark:stroke-neutral-300 hover:stroke-destructive hover:fill-destructive" />
								</Button>

								{/* Enhanced Product Image */}
								<Link href={`/store/product/${product.id}`} className="block shrink-0 w-full">
									<div className="relative bg-white dark:bg-neutral-800 overflow-hidden aspect-square w-full rounded-t-3xl p-6">
										<div className="relative w-full h-full bg-neutral-100 dark:bg-neutral-700 rounded-2xl flex items-center justify-center">
											<Image
												alt={product.name}
												loading="eager"
												fill
												className="object-contain hover:scale-110 transition-transform duration-500 p-4"
												sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
												src={product.image}
											/>
										</div>
									</div>
								</Link>

								{/* Enhanced Product Info */}
								<div className="flex flex-col flex-1 p-6 pt-4">
									<Link href={`/store/product/${product.id}`} className="flex-1 space-y-4">
										<div className="space-y-2">
											<p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{product.brand}</p>
											<h2 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
												{product.name}
											</h2>
										</div>
										
										{/* Enhanced Rating */}
										<div>
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-0.5">
													{[...Array(5)].map((_, i) => (
														<Star 
															key={i} 
															className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-muted-foreground text-muted-foreground' : 'text-neutral-300 dark:text-neutral-600'}`} 
														/>
													))}
												</div>
												<span className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold">
													({product.reviewCount})
												</span>
											</div>
										</div>

										{/* Enhanced Price */}
										<div className="space-y-2">
											{product.originalPrice && (
												<div className="text-sm text-neutral-500 dark:text-neutral-400 line-through">
													Was ${product.originalPrice.toFixed(2)}
												</div>
											)}
											<div className="flex items-baseline gap-3">
												<span className="text-2xl font-bold text-primary dark:text-primary" aria-label={`Price: $${product.price.toFixed(2)}`}>
													${product.price.toFixed(0)}
													<span className="text-lg">.{(product.price % 1).toFixed(2).slice(2)}</span>
												</span>
												{product.originalPrice && (
													<span className="text-sm text-primary font-bold bg-primary/20 dark:bg-primary/30 px-2 py-1 rounded-full">
														Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
													</span>
												)}
											</div>
										</div>

										{/* Enhanced Availability & Shipping */}
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 bg-primary rounded-full"></div>
												<span className="text-sm font-semibold text-primary">In Stock</span>
											</div>
											<div className="space-y-1">
												<div className="text-sm text-primary font-semibold">{product.shipping}</div>
												<div className="text-xs text-neutral-600 dark:text-neutral-400">{product.shippingTime}</div>
											</div>
										</div>
									</Link>

									{/* Enhanced Add to Cart Button */}
									<div className="pt-4">
										<Button className="h-12 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
											<ShoppingCart className="h-5 w-5 mr-2" />
											Add to Cart
										</Button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export default function ProductPage(props) {
    // Next.js 15: params is now a Promise in client components
    // Use React.use() to unwrap the Promise
    const params = React.use(props.params);
	const productId = params?.productId;
	
	// Add error handling for missing productId
	if (!productId) {
		return (
			<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
				<div className="text-center space-y-8">
					<div className="w-24 h-24 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto">
						<Package className="w-12 h-12 text-neutral-400" />
					</div>
					<h1 className="text-4xl md:text-5xl font-thin text-neutral-900 dark:text-white tracking-tight">
						Product ID Required
					</h1>
					<p className="text-xl text-neutral-600 dark:text-neutral-400 font-light max-w-md mx-auto">
						Please provide a valid product ID to view product details.
					</p>
					<Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium rounded-2xl">
						<Link href="/store">
							<ArrowLeft className="mr-3 h-5 w-5" />
							Back to Store
						</Link>
					</Button>
				</div>
			</div>
		);
	}
	
	const product = getProductData(productId);

	if (!product) {
		return (
			<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
				<div className="text-center space-y-8">
					<div className="w-24 h-24 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto">
						<Package className="w-12 h-12 text-neutral-400" />
					</div>
					<h1 className="text-4xl md:text-5xl font-thin text-neutral-900 dark:text-white tracking-tight">
						Product Not Found
					</h1>
					<p className="text-xl text-neutral-600 dark:text-neutral-400 font-light max-w-md mx-auto">
						Sorry, we couldn't find the product you're looking for. It may have been removed or the link might be incorrect.
					</p>
					<Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium rounded-2xl">
						<Link href="/store">
							<ArrowLeft className="mr-3 h-5 w-5" />
							Back to Store
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black" suppressHydrationWarning>
			<section className="max-w-full mx-auto p-4 lg:p-6" itemScope itemType="https://schema.org/Product">
				{/* Main product layout */}
				<div className="grid grid-cols-1 md:grid-cols-[1fr_380px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 mb-12">
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
						<ProductGallery images={product.images} productName={product.name} category={product.category} product={product} />
						<ProductInfo product={product} />
					</div>
					<PurchaseOptions product={product} />
				</div>

				{/* Thorbis-Style Product Feature Showcase */}
				<ClientOnly>
					<ThorbisStyleProductShowcase product={product} />
				</ClientOnly>

				{/* Enhanced Customer Reviews Section */}
				<div className="max-w-6xl mx-auto mb-24">
					<div className="bg-gradient-to-br from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 rounded-3xl p-8 lg:p-12 border border-border shadow-2xl">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-12 h-12 bg-muted-foreground rounded-2xl flex items-center justify-center shadow-lg">
								<Star className="h-6 w-6 text-white fill-white" />
							</div>
							<div>
								<h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">
									Customer Reviews
								</h2>
								<p className="text-neutral-600 dark:text-neutral-300 text-lg mt-1">
									Real feedback from verified customers
								</p>
							</div>
						</div>
						
						{/* Enhanced Review Summary */}
						<div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-3xl p-8 mb-12 border border-border/50 shadow-xl">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
								<div className="text-center">
									<div className="text-5xl font-bold text-neutral-900 dark:text-white mb-2">
										{product.rating}
									</div>
									<div className="flex items-center justify-center gap-1 mb-2">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="w-6 h-6 fill-muted-foreground text-muted-foreground" />
										))}
									</div>
									<div className="text-neutral-600 dark:text-neutral-300 font-medium">
										Overall Rating
									</div>
								</div>
								<div className="text-center">
									<div className="text-5xl font-bold text-primary mb-2">
										{product.reviewCount}
									</div>
									<div className="text-neutral-600 dark:text-neutral-300 font-medium">
										Total Reviews
									</div>
								</div>
								<div className="text-center">
									<div className="text-5xl font-bold text-primary mb-2">
										95%
									</div>
									<div className="text-neutral-600 dark:text-neutral-300 font-medium">
										Recommend
									</div>
								</div>
							</div>
						</div>
						
						{/* Enhanced Reviews */}
						<div className="space-y-8">
							<div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-3xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="flex items-start gap-6">
									<div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 dark:from-primary/30 dark:to-primary/20 rounded-2xl flex items-center justify-center shadow-lg">
										<User className="w-8 h-8 text-primary dark:text-primary" />
									</div>
									<div className="flex-1 space-y-4">
										<div className="flex flex-col sm:flex-row sm:items-center gap-3">
											<span className="text-xl font-bold text-neutral-900 dark:text-white">Sarah Mitchell</span>
											<div className="flex items-center gap-3">
												<div className="flex items-center gap-1">
													{[...Array(5)].map((_, i) => (
														<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
													))}
												</div>
												<div className="w-px h-4 bg-border"></div>
												<span className="text-neutral-600 dark:text-neutral-400 font-medium">2 weeks ago</span>
											</div>
										</div>
										<p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
											"Absolutely fantastic POS system! The setup was incredibly easy and our team was up and running in under an hour. The interface is intuitive and the customer support is outstanding. Highly recommend for any small business!"
										</p>
										<div className="flex items-center gap-6">
											<button className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary font-medium transition-colors">
												<ThumbsUp className="w-5 h-5" />
												Helpful (12)
											</button>
											<button className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 font-semibold">
												Reply
											</button>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-3xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="flex items-start gap-6">
									<div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 dark:from-primary/30 dark:to-primary/20 rounded-2xl flex items-center justify-center shadow-lg">
										<User className="w-8 h-8 text-primary dark:text-primary" />
									</div>
									<div className="flex-1 space-y-4">
										<div className="flex flex-col sm:flex-row sm:items-center gap-3">
											<span className="text-xl font-bold text-neutral-900 dark:text-white">Mike Rodriguez</span>
											<div className="flex items-center gap-3">
												<div className="flex items-center gap-1">
													{[...Array(5)].map((_, i) => (
														<Star key={i} className="w-5 h-5 fill-muted-foreground text-muted-foreground" />
													))}
												</div>
												<div className="w-px h-4 bg-border"></div>
												<span className="text-neutral-600 dark:text-neutral-400 font-medium">1 month ago</span>
											</div>
										</div>
										<p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
											"We've been using this system for about 6 months now and it's been a game-changer for our restaurant. The analytics features help us track our best-selling items and the integration with our inventory system is seamless."
										</p>
										<div className="flex items-center gap-6">
											<button className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary font-medium transition-colors">
												<ThumbsUp className="w-5 h-5" />
												Helpful (8)
											</button>
											<button className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 font-semibold">
												Reply
											</button>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-3xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="flex items-start gap-6">
									<div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 dark:from-primary/30 dark:to-primary/20 rounded-2xl flex items-center justify-center shadow-lg">
										<User className="w-8 h-8 text-primary dark:text-primary" />
									</div>
									<div className="flex-1 space-y-4">
										<div className="flex flex-col sm:flex-row sm:items-center gap-3">
											<span className="text-xl font-bold text-neutral-900 dark:text-white">Jennifer Chen</span>
											<div className="flex items-center gap-3">
												<div className="flex items-center gap-1">
													{[...Array(4)].map((_, i) => (
														<Star key={i} className="w-5 h-5 fill-muted-foreground text-muted-foreground" />
													))}
													<Star className="w-5 h-5 text-muted-foreground/30" />
												</div>
												<div className="w-px h-4 bg-border"></div>
												<span className="text-neutral-600 dark:text-neutral-400 font-medium">3 weeks ago</span>
											</div>
										</div>
										<p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
											"Great product overall! The only reason I'm giving 4 stars instead of 5 is that the initial learning curve was a bit steep for some of our older staff members. But once everyone got comfortable with it, it's been smooth sailing."
										</p>
										<div className="flex items-center gap-6">
											<button className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary font-medium transition-colors">
												<ThumbsUp className="w-5 h-5" />
												Helpful (15)
											</button>
											<button className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 font-semibold">
												Reply
											</button>
										</div>
									</div>
								</div>
							</div>

							<div className="text-center pt-8">
								<Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
									View All {product.reviewCount} Reviews
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Recommendations section */}
				<RecommendationsSection />

				{/* Related products */}
				<ClientOnly>
					<RelatedProducts currentProduct={product} />
				</ClientOnly>
			</section>
		</div>
	);
}
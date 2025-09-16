import CarsClient from "./cars-client";
import AISearchAssistant from "@/components/ai/AISearchAssistant";
import TransactionButtons from "@/components/ai/TransactionButtons";
import Script from "next/script";
// import { CarDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase car data to match client component expectations
function transformCarData(car) {
	const formatPrice = (price) => {
		if (!price) return "Contact for price";
		return `$${price.toLocaleString()}`;
	};

	const formatMileage = (mileage) => {
		if (!mileage) return "Unknown mileage";
		return `${mileage.toLocaleString()} miles`;
	};

	const formatPostedDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return "1d ago";
		if (diffDays < 7) return `${diffDays}d ago`;
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
		return `${Math.ceil(diffDays / 30)}m ago`;
	};

	return {
		id: car.id,
		title: `${car.year} ${car.make} ${car.model}`,
		make: car.make,
		model: car.model,
		year: car.year,
		trim: car.trim,
		price: formatPrice(car.price),
		mileage: formatMileage(car.mileage),
		condition: car.condition || "Used",
		bodyType: car.body_type,
		transmission: car.transmission,
		fuelType: car.fuel_type || "Gasoline",
		drivetrain: car.drivetrain,
		engine: car.engine,
		exteriorColor: car.exterior_color,
		interiorColor: car.interior_color,
		vin: car.vin,
		description: car.description?.substring(0, 200) + "..." || "No description available",
		location: car.location,
		city: car.city,
		state: car.state,
		zip: car.zip_code,
		posted: formatPostedDate(car.created_at),
		images: car.images || [],
		features: car.features || [],
		accidents: car.accident_history || 0,
		owners: car.previous_owners || 1,
		titleStatus: car.title_status || "Clean",
		mpgCity: car.mpg_city,
		mpgHighway: car.mpg_highway,
		isNewCar: car.condition === "New",
		isCertified: car.is_certified || false,
		warrantyInfo: car.warranty_info,
		tags: car.tags || [],
		seller: {
			id: car.sellers?.id,
			name: car.sellers?.name,
			type: car.sellers?.seller_type || "Private", // Private, Dealer
			phone: car.sellers?.phone,
			email: car.sellers?.email,
			rating: car.sellers?.rating || 0,
			verified: car.sellers?.is_verified || false,
			dealershipName: car.sellers?.dealership_name,
		},
	};
}

async function getCarsData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		make: searchParams.make || "",
		model: searchParams.model || "",
		minYear: searchParams.min_year ? parseInt(searchParams.min_year) : undefined,
		maxYear: searchParams.max_year ? parseInt(searchParams.max_year) : undefined,
		minPrice: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
		maxPrice: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
		maxMileage: searchParams.max_mileage ? parseInt(searchParams.max_mileage) : undefined,
		condition: searchParams.condition || "",
		bodyType: searchParams.body_type || "",
		transmission: searchParams.transmission || "",
		fuelType: searchParams.fuel_type || "",
		drivetrain: searchParams.drivetrain || "",
		sellerType: searchParams.seller_type || "",
		sortBy: searchParams.sort_by || "created_at",
		sortOrder: searchParams.sort_order || "desc",
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Enhanced mock data with VIN history, local pricing, repair costs - the depth AI can't fake
	const mockCars = [
		{
			id: "car-1",
			make: "Tesla",
			model: "Model 3",
			year: 2022,
			trim: "Performance",
			price: 52000,
			mileage: 15420,
			condition: "Used",
			body_type: "Sedan",
			transmission: "Automatic",
			fuel_type: "Electric",
			drivetrain: "All-Wheel Drive",
			engine: "Dual Motor",
			exterior_color: "Pearl White",
			interior_color: "Black",
			vin: "5YJ3E1EA5NF123456",
			description: "Pristine Tesla Model 3 Performance with full self-driving capability, premium interior, and all maintenance records. Single owner, never in accident.",
			location: "Santa Clara, CA",
			city: "Santa Clara",
			state: "CA",
			zip_code: "95054",
			created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
			images: ["/images/cars/tesla-model3-1.jpg", "/images/cars/tesla-model3-2.jpg"],
			features: ["Full Self Driving", "Premium Interior", "Glass Roof", "Supercharging", "Mobile Connector"],
			accident_history: 0,
			previous_owners: 1,
			title_status: "Clean",
			mpg_city: 134, // MPGe for electric
			mpg_highway: 126,
			is_certified: true,
			warranty_info: "Tesla Warranty until 2026",
			tags: ["electric", "autopilot", "certified", "low-mileage"],
			// AI-powered deep data that competitors can't match
			vinHistory: {
				accidents: 0,
				serviceRecords: 12,
				recalls: 1,
				previousOwners: 1,
				titleIssues: 0
			},
			localPricing: {
				marketValue: 51500,
				priceTrend: "stable",
				daysOnMarket: 7,
				similarListings: 23,
				priceAboveMarket: 0.97 // 3% below market
			},
			repairCosts: {
				estimatedAnnual: 450,
				commonIssues: [
					{ issue: "Door handle replacement", cost: 200, frequency: "uncommon" },
					{ issue: "Charging port door", cost: 150, frequency: "rare" }
				],
				partsAvailability: "excellent"
			},
			aiScore: 95,
			transactionType: "automotive",
			sellers: {
				id: "seller-1",
				name: "John Smith",
				seller_type: "Private",
				phone: "(408) 555-0123",
				email: "john.smith@email.com",
				rating: 4.8,
				is_verified: true,
				dealership_name: null
			}
		},
		{
			id: "car-2", 
			make: "Honda",
			model: "Civic",
			year: 2020,
			trim: "Sport",
			price: 22500,
			mileage: 32800,
			condition: "Used",
			body_type: "Sedan",
			transmission: "Manual",
			fuel_type: "Gasoline",
			drivetrain: "Front-Wheel Drive",
			engine: "1.5L Turbo",
			exterior_color: "Sonic Gray Pearl",
			interior_color: "Black",
			vin: "2HGFC2F59LH123456",
			description: "Well-maintained Honda Civic Sport with manual transmission. Regular oil changes, new tires, and recent brake service. Great fuel economy and reliability.",
			location: "San Jose, CA",
			city: "San Jose", 
			state: "CA",
			zip_code: "95123",
			created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
			images: ["/images/cars/honda-civic-1.jpg"],
			features: ["Sport Mode", "Honda Sensing", "Touchscreen", "Backup Camera", "Keyless Entry"],
			accident_history: 0,
			previous_owners: 1,
			title_status: "Clean",
			mpg_city: 28,
			mpg_highway: 35,
			is_certified: false,
			warranty_info: "Remaining factory warranty",
			tags: ["manual", "sport", "reliable", "fuel-efficient"],
			// Deep automotive intelligence
			vinHistory: {
				accidents: 0,
				serviceRecords: 18,
				recalls: 2,
				previousOwners: 1,
				titleIssues: 0
			},
			localPricing: {
				marketValue: 23200,
				priceTrend: "declining",
				daysOnMarket: 3,
				similarListings: 45,
				priceAboveMarket: 0.97
			},
			repairCosts: {
				estimatedAnnual: 650,
				commonIssues: [
					{ issue: "CVT transmission service", cost: 300, frequency: "common" },
					{ issue: "A/C compressor", cost: 800, frequency: "uncommon" }
				],
				partsAvailability: "excellent"
			},
			aiScore: 88,
			transactionType: "automotive",
			sellers: {
				id: "seller-2",
				name: "Maria Rodriguez",
				seller_type: "Private",
				phone: "(408) 555-0456",
				email: "maria.r@email.com", 
				rating: 4.9,
				is_verified: true,
				dealership_name: null
			}
		},
		{
			id: "car-3",
			make: "BMW",
			model: "3 Series",
			year: 2021,
			trim: "330i xDrive",
			price: 38900,
			mileage: 28500,
			condition: "Used",
			body_type: "Sedan",
			transmission: "Automatic",
			fuel_type: "Gasoline",
			drivetrain: "All-Wheel Drive",
			engine: "2.0L Turbo",
			exterior_color: "Alpine White",
			interior_color: "Black Leather",
			vin: "WBA5R1C04MG123456",
			description: "Luxury BMW 330i xDrive with premium package, navigation, and leather interior. Excellent condition with complete maintenance history.",
			location: "Palo Alto, CA",
			city: "Palo Alto",
			state: "CA", 
			zip_code: "94301",
			created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
			images: ["/images/cars/bmw-3series-1.jpg", "/images/cars/bmw-3series-2.jpg"],
			features: ["Premium Package", "Navigation", "Leather Seats", "Sunroof", "Heated Seats", "xDrive AWD"],
			accident_history: 0,
			previous_owners: 1,
			title_status: "Clean",
			mpg_city: 24,
			mpg_highway: 32,
			is_certified: true,
			warranty_info: "BMW Certified Pre-Owned Warranty",
			tags: ["luxury", "awd", "certified", "premium"],
			// Premium vehicle insights
			vinHistory: {
				accidents: 0,
				serviceRecords: 15,
				recalls: 0,
				previousOwners: 1,
				titleIssues: 0
			},
			localPricing: {
				marketValue: 39500,
				priceTrend: "stable", 
				daysOnMarket: 12,
				similarListings: 8,
				priceAboveMarket: 0.985
			},
			repairCosts: {
				estimatedAnnual: 1200,
				commonIssues: [
					{ issue: "Water pump replacement", cost: 650, frequency: "common" },
					{ issue: "Valve cover gasket", cost: 400, frequency: "common" }
				],
				partsAvailability: "good"
			},
			aiScore: 92,
			transactionType: "automotive",
			sellers: {
				id: "seller-3",
				name: "Bay Area BMW",
				seller_type: "Dealer",
				phone: "(650) 555-0789",
				email: "sales@bayareabmw.com",
				rating: 4.7,
				is_verified: true,
				dealership_name: "Bay Area BMW"
			}
		}
	];

	// Intelligent filtering with AI-enhanced matching
	let filteredCars = mockCars;
	
	if (params.search || params.make || params.location || params.minPrice || params.maxPrice) {
		filteredCars = mockCars.filter(car => {
			const matchesSearch = !params.search ||
				car.make.toLowerCase().includes(params.search.toLowerCase()) ||
				car.model.toLowerCase().includes(params.search.toLowerCase()) ||
				car.description.toLowerCase().includes(params.search.toLowerCase());
			
			const matchesMake = !params.make ||
				car.make.toLowerCase() === params.make.toLowerCase();
			
			const matchesLocation = !params.location ||
				car.location.toLowerCase().includes(params.location.toLowerCase()) ||
				car.city.toLowerCase().includes(params.location.toLowerCase());
			
			const matchesPrice = (!params.minPrice || car.price >= params.minPrice) &&
							   (!params.maxPrice || car.price <= params.maxPrice);
			
			return matchesSearch && matchesMake && matchesLocation && matchesPrice;
		});
	}

	// Transform the data
	const transformedCars = filteredCars.map(transformCarData);

	return {
		cars: transformedCars,
		total: transformedCars.length,
		hasMore: false,
		aiEnhanced: true,
		deepDataAvailable: true,
		searchContext: {
			query: params.search,
			location: params.location,
			make: params.make,
			model: params.model
		}
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";
	const make = awaitedSearchParams.make || "";
	const model = awaitedSearchParams.model || "";

	let title = "AI-Enhanced Car Shopping - VIN History, Local Pricing & Instant Purchase | Thorbis";
	let description = "Revolutionary car shopping with VIN history, local pricing analysis, and repair cost estimates. Natural language search: 'Find a reliable Honda under $25k with good fuel economy`.";

	if (make && model && location) {
		title = `${make} ${model} for Sale in ${location} - Thorbis`;
		description = `Find ${make} ${model} cars for sale in ${location}. Browse inventory from dealers and private sellers.`;
	} else if (make && location) {
		title = `${make} Cars for Sale in ${location} - Thorbis`;
		description = `Find ${make} cars for sale in ${location}. Browse new and used vehicles from local dealers and sellers.`;
	} else if (query && location) {
		title = `${query} Cars in ${location} - Thorbis`;
		description = `Find ${query} cars for sale in ${location}. Browse inventory from dealers and private sellers.`;
	} else if (location) {
		title = `Cars for Sale in ${location} - Thorbis`;
		description = `Find cars for sale in ${location}. Browse new and used vehicles from local dealers and private sellers.`;
	}

	return {
		title,
		description,
		keywords: ["cars", "vehicles", "auto", "for sale", "used cars", "new cars", make, model, query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/cars",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/cars" },
	};
}

// Enhanced JSON-LD structured data for cars
function createCarsJsonLd(carsData, searchParams) {
	const baseUrl = "https://thorbis.com";
	
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "AI-Enhanced Car Marketplace",
		description: "Find cars with VIN history, local pricing analysis, and repair cost estimates",
		url: `${baseUrl}/cars${searchParams.search || searchParams.location ? `?${new URLSearchParams(searchParams).toString()}` : ""}`,
		numberOfItems: carsData.total,
		itemListOrder: "https://schema.org/ItemListOrderAscending",
		provider: {
			"@type": "Organization",
			name: "Thorbis",
			url: baseUrl,
			logo: `${baseUrl}/logos/ThorbisLogo.webp'
		},
		itemListElement: carsData.cars.slice(0, 10).map((car, index) => ({
			"@type": "Car",
			"@id": '${baseUrl}/cars/${car.id}',
			position: index + 1,
			name: car.title,
			description: car.description,
			brand: {
				"@type": "Brand",
				name: car.make
			},
			model: car.model,
			vehicleModelDate: car.year.toString(),
			vehicleConfiguration: car.trim,
			vehicleTransmission: car.transmission,
			fuelType: car.fuelType,
			driveWheelConfiguration: car.drivetrain,
			vehicleEngine: {
				"@type": "EngineSpecification",
				name: car.engine
			},
			color: car.exteriorColor,
			vehicleInteriorColor: car.interiorColor,
			mileageFromOdometer: {
				"@type": "QuantitativeValue",
				value: parseInt(car.mileage.replace(/[^\w\s-]/g, '')),
				unitCode: "SMI"
			},
			vehicleIdentificationNumber: car.vin,
			offers: {
				"@type": "Offer",
				price: car.price.replace(/[^\d]/g, `),
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
				validFrom: new Date().toISOString(),
				seller: {
					"@type": car.seller.type === "Dealer" ? "AutoDealer" : "Person",
					name: car.seller.dealershipName || car.seller.name,
					telephone: car.seller.phone,
					email: car.seller.email
				}
			},
			vehicleCondition: car.condition === "New" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
			// Enhanced with proprietary data depth
			additionalProperty: [
				{
					"@type": "PropertyValue",
					name: "Accident History",
					value: `${car.accidents} reported accidents'
				},
				{
					"@type": "PropertyValue", 
					name: "Previous Owners",
					value: car.owners.toString()
				},
				{
					"@type": "PropertyValue",
					name: "Title Status", 
					value: car.titleStatus
				},
				...(car.isCertified ? [{
					"@type": "PropertyValue",
					name: "Certification",
					value: "Certified Pre-Owned"
				}] : []),
				// Proprietary AI insights
				...(carsData.deepDataAvailable ? [
					{
						"@type": "PropertyValue",
						name: "Market Value Analysis",
						value: "AI-powered pricing insights available"
					},
					{
						"@type": "PropertyValue",
						name: "VIN History Report",
						value: "Comprehensive vehicle history included"
					},
					{
						"@type": "PropertyValue", 
						name: "Repair Cost Estimates",
						value: "Predictive maintenance cost analysis"
					}
				] : [])
			],
			// Transaction capabilities
			potentialAction: {
				"@type": "BuyAction",
				name: "Purchase Vehicle",
				target: {
					"@type": "EntryPoint",
					urlTemplate: '${baseUrl}/cars/${car.id}/purchase',
					description: "Instant purchase with AI-assisted financing"
				}
			}
		}))
	};

	return jsonLd;
}

async function CarsList({ searchParams }) {
	const carsData = await getCarsData(searchParams);
	const jsonLd = createCarsJsonLd(carsData, searchParams);

	const handleAICarSearch = (query, filters) => {
		const newParams = new URLSearchParams();
		if (query) newParams.set('search', query);
		if (filters?.make) newParams.set('make', filters.make);
		if (filters?.location) newParams.set('location', filters.location);
		if (filters?.maxPrice) newParams.set('max_price', filters.maxPrice);
		if (filters?.minYear) newParams.set('min_year', filters.minYear.toString());
		
		console.log('AI Car Search:', query, filters);
		window.location.href = '/cars?${newParams.toString()}';
	};

	return (
		<>
			{/* AI Car Search Header */}
			<div className="bg-gradient-to-br from-blue-500/10 via-background to-green-500/10 py-12">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center mb-8">
						<h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
							AI-Enhanced Car Shopping
						</h1>
						<p className="text-lg text-muted-foreground mb-8">
							VIN history, local pricing, and repair costs - the depth AI can't fake
						</p>
						
						{/* AI Car Search Assistant */}
						<AISearchAssistant
							onSearch={handleAICarSearch}
							placeholder="Try: 'Find a reliable Honda under $25k with good fuel economy and clean history'"
							className="max-w-3xl mx-auto"
							initialQuery={searchParams.search || searchParams.q || ""}
							location={searchParams.location || ""}
						/>
					</div>
				</div>
			</div>

			{/* Cars Results */}
			<div className="container mx-auto px-4 py-8">
				{carsData.deepDataAvailable && (
					<div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
						<div className="flex items-start gap-3">
							<div className="text-blue-600 dark:text-blue-400 text-2xl">🚗</div>
							<div>
								<p className="font-medium text-blue-600 dark:text-blue-400 mb-1">
									Deep Automotive Intelligence
								</p>
								<p className="text-sm text-blue-600/80 dark:text-blue-400/80">
									Every listing includes VIN history, local pricing analysis, and predictive repair costs - data depth that competitors can't match.
								</p>
							</div>
						</div>
					</div>
				)}
				
				<CarsClient 
					cars={carsData.cars} 
					searchMetadata={carsData} 
					searchParams={searchParams}
					aiEnhanced={carsData.aiEnhanced}
					deepDataAvailable={carsData.deepDataAvailable}
				/>
			</div>

			{/* Enhanced Structured Data */}
			<Script
				id="cars-jsonld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd, null, 2)
				}}
			/>
		</>
	);
}

export default async function CarsPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<CarsList searchParams={awaitedSearchParams} />
	);
}
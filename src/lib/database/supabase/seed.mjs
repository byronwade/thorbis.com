// REQUIRED: Intelligent database seeding script with real business data
// Advanced seeding strategies inspired by: https://tighten.com/insights/10-efficient-and-fun-ways-to-seed-your-database/
// Run with: bun run seed:database

import { faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import readline from "readline";

// Load environment variables from .env.local
function loadEnvFile() {
	try {
		const envPath = resolve(".env.local");
		const envFile = readFileSync(envPath, "utf8");

		envFile.split("\n").forEach((line) => {
			const [key, ...valueParts] = line.split("=");
			if (key && !key.startsWith("#")) {
				const value = valueParts.join("=").trim();
				process.env[key.trim()] = value;
			}
		});

		console.log("✅ Loaded environment variables from .env.local\n");
	} catch (error) {
		console.log("⚠️  Could not load .env.local file");
		console.log("   Make sure .env.local exists in the project root\n");
	}
}

// Initialize Supabase client
loadEnvFile();

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations
);

// Intelligent Seeding Configuration
const SEED_CONFIG = {
	users: 100,
	businesses: 200,
	companies: 50,
	jobs: 150,
	blogPosts: 80,
	events: 60,
	courses: 40,
	reviews: 500,
	posts: 300,
	shorts: 100,
	reservations: 200,
};

// Advanced Seeding Settings
const INTELLIGENT_SEEDING = {
	useRealBusinessData: true,
	useAIGeneration: true,
	interactive: process.env.NODE_ENV === "development",
	cacheApiResponses: true,
	apiRateLimit: 100, // requests per minute
};

// Real Business Data Sources
const BUSINESS_APIS = {
	googlePlaces: process.env.GOOGLE_PLACES_API_KEY,
	yelp: process.env.YELP_API_KEY,
	foursquare: process.env.FOURSQUARE_API_KEY,
};

// Target Cities for Real Business Data
const TARGET_CITIES = [
	{ name: "San Francisco", state: "CA", country: "US", lat: 37.7749, lng: -122.4194 },
	{ name: "New York", state: "NY", country: "US", lat: 40.7128, lng: -74.006 },
	{ name: "Los Angeles", state: "CA", country: "US", lat: 34.0522, lng: -118.2437 },
	{ name: "Chicago", state: "IL", country: "US", lat: 41.8781, lng: -87.6298 },
	{ name: "Austin", state: "TX", country: "US", lat: 30.2672, lng: -97.7431 },
	{ name: "Seattle", state: "WA", country: "US", lat: 47.6062, lng: -122.3321 },
	{ name: "Denver", state: "CO", country: "US", lat: 39.7392, lng: -104.9903 },
	{ name: "Miami", state: "FL", country: "US", lat: 25.7617, lng: -80.1918 },
];

// Business Categories with Real-World Examples
const REAL_BUSINESS_CATEGORIES = {
	restaurants: ["italian", "mexican", "japanese", "american", "pizza", "burgers", "coffee", "bakery"],
	retail: ["clothing", "electronics", "books", "jewelry", "shoes", "furniture", "grocery"],
	services: ["hair-salon", "auto-repair", "cleaning", "legal", "accounting", "consulting"],
	health: ["dentist", "doctor", "pharmacy", "fitness", "spa", "veterinarian"],
	entertainment: ["movie-theater", "bowling", "arcade", "bar", "nightclub", "museum"],
	education: ["school", "tutoring", "music-lessons", "language-school", "training"],
};

// Helper functions
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
const randomElements = (array, count = 3) => faker.helpers.arrayElements(array, { min: 1, max: count });
const randomBoolean = (probability = 0.5) => Math.random() < probability;

// Data storage for foreign keys
let seededData = {
	users: [],
	businesses: [],
	companies: [],
	categories: [],
	blogCategories: [],
	jobs: [],
	blogPosts: [],
	events: [],
	courses: [],
	courseLessons: [],
	subscriptionPlans: [],
};

// Intelligent Seeding Utilities
class IntelligentSeeder {
	static async prompt(question, choices = null) {
		if (!INTELLIGENT_SEEDING.interactive) {
			return choices ? choices[0] : "yes";
		}

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		return new Promise((resolve) => {
			if (choices) {
				console.log(`\n${question}`);
				choices.forEach((choice, index) => {
					console.log(`${index + 1}. ${choice}`);
				});
				rl.question("Choose an option (number): ", (answer) => {
					const index = parseInt(answer) - 1;
					resolve(choices[index] || choices[0]);
					rl.close();
				});
			} else {
				rl.question(`${question} (y/n): `, (answer) => {
					resolve(answer.toLowerCase().startsWith("y"));
					rl.close();
				});
			}
		});
	}

	static async cacheData(key, data) {
		if (!INTELLIGENT_SEEDING.cacheApiResponses) return;

		const cacheDir = resolve("database/cache");
		if (!existsSync(cacheDir)) {
			mkdirSync(cacheDir, { recursive: true });
		}

		const cachePath = resolve(cacheDir, `${key}.json`);
		writeFileSync(cachePath, JSON.stringify(data, null, 2));
		console.log(`💾 Cached data: ${key}`);
	}

	static getCachedData(key) {
		if (!INTELLIGENT_SEEDING.cacheApiResponses) return null;

		const cachePath = resolve("database/cache", `${key}.json`);
		if (!existsSync(cachePath)) return null;

		try {
			const cached = JSON.parse(readFileSync(cachePath, "utf8"));
			console.log(`📁 Using cached data: ${key}`);
			return cached;
		} catch (error) {
			console.log(`⚠️  Failed to read cache: ${key}`);
			return null;
		}
	}

	static async fetchRealBusinessData(city, category, limit = 20) {
		const cacheKey = `businesses_${city.name}_${category}_${limit}`;
		const cached = this.getCachedData(cacheKey);
		if (cached) return cached;

		console.log(`🌐 Fetching real ${category} businesses in ${city.name}...`);

		try {
			// Google Places API implementation
			if (BUSINESS_APIS.googlePlaces) {
				const businesses = await this.fetchFromGooglePlaces(city, category, limit);
				await this.cacheData(cacheKey, businesses);
				return businesses;
			}

			// Fallback to enhanced fake data
			console.log(`⚠️  No API keys available, generating enhanced fake data...`);
			return this.generateEnhancedFakeBusinesses(city, category, limit);
		} catch (error) {
			console.log(`❌ API fetch failed: ${error.message}`);
			return this.generateEnhancedFakeBusinesses(city, category, limit);
		}
	}

	static async fetchFromGooglePlaces(city, category, limit) {
		const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
		const params = new URLSearchParams({
			location: `${city.lat},${city.lng}`,
			radius: "10000", // 10km
			type: category,
			key: BUSINESS_APIS.googlePlaces,
		});

		const response = await fetch(`${url}?${params}`);
		const data = await response.json();

		if (data.status !== "OK") {
			throw new Error(`Google Places API error: ${data.status}`);
		}

		return data.results.slice(0, limit).map((place) => ({
			name: place.name,
			address: place.vicinity,
			latitude: place.geometry.location.lat,
			longitude: place.geometry.location.lng,
			rating: place.rating || faker.number.float({ min: 3.5, max: 5.0, multipleOf: 0.1 }),
			price_level: place.price_level || faker.number.int({ min: 1, max: 4 }),
			place_id: place.place_id,
			photos: place.photos?.map((photo) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${BUSINESS_APIS.googlePlaces}`) || [],
			types: place.types,
			website: null, // Will be fetched separately if needed
			phone: null, // Will be fetched separately if needed
		}));
	}

	static generateEnhancedFakeBusinesses(city, category, limit) {
		console.log(`🎭 Generating enhanced fake businesses for ${city.name}...`);

		const businesses = [];
		const categoryWords = REAL_BUSINESS_CATEGORIES[category] || [category];

		for (let i = 0; i < limit; i++) {
			const subcategory = randomElement(categoryWords);
			const businessName = this.generateRealisticBusinessName(subcategory, city);

			businesses.push({
				name: businessName,
				address: `${faker.location.streetAddress()}, ${city.name}, ${city.state}`,
				latitude: city.lat + (Math.random() - 0.5) * 0.1, // Within ~5km of city center
				longitude: city.lng + (Math.random() - 0.5) * 0.1,
				rating: faker.number.float({ min: 3.5, max: 5.0, multipleOf: 0.1 }),
				price_level: faker.number.int({ min: 1, max: 4 }),
				place_id: faker.string.alphanumeric(20),
				photos: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, (_, idx) => `https://via.placeholder.com/800x600/1f2937/ffffff?text=Business+Photo+${idx + 1}`),
				types: [subcategory, category],
				website: randomBoolean(0.6) ? faker.internet.url() : null,
				phone: randomBoolean(0.8) ? faker.phone.number() : null,
			});
		}

		return businesses;
	}

	static generateRealisticBusinessName(subcategory, city) {
		const namePatterns = {
			restaurant: [() => `${faker.person.lastName()}'s ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} Kitchen`, () => `The ${city.name} ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`, () => `${faker.word.adjective()} ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} Co.`, () => `${faker.person.firstName()}'s ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`],
			cafe: [() => `${faker.word.adjective()} Bean Coffee`, () => `${city.name} Roasters`, () => `The Daily Grind`, () => `${faker.person.firstName()}'s Cafe`],
			default: [() => `${faker.company.name()}`, () => `${city.name} ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`, () => `${faker.word.adjective()} ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} LLC`, () => `${faker.person.lastName()} & Associates`],
		};

		const patterns = namePatterns[subcategory] || namePatterns.default;
		return randomElement(patterns)();
	}

	static async generateAIContent(businessData) {
		if (!INTELLIGENT_SEEDING.useAIGeneration) {
			return {
				description: faker.lorem.paragraphs(2),
				amenities: randomElements(["WiFi", "Parking", "Outdoor Seating", "Delivery", "Takeout"]),
				specialties: randomElements(["Quality Service", "Local Favorite", "Family Owned"]),
			};
		}

		// Placeholder for AI integration - could use OpenAI, Claude, etc.
		// For now, return enhanced fake content based on business type
		const businessType = businessData.types?.[0] || "business";

		return {
			description: this.generateContextualDescription(businessData, businessType),
			amenities: this.getRealisticAmenities(businessType),
			specialties: this.getRealisticSpecialties(businessType),
		};
	}

	static generateContextualDescription(business, type) {
		const descriptions = {
			restaurant: `Welcome to ${business.name}, where culinary excellence meets warm hospitality. Our kitchen crafts each dish with fresh, locally-sourced ingredients, creating memorable dining experiences for our guests. Whether you're enjoying a casual meal or celebrating a special occasion, our attentive staff ensures every visit is exceptional.`,
			cafe: `${business.name} is your neighborhood coffee haven, serving artisanal coffee and fresh pastries in a cozy, welcoming atmosphere. We pride ourselves on our carefully curated bean selection and skilled baristas who craft each cup to perfection. Come for the coffee, stay for the community.`,
			retail: `At ${business.name}, we offer a carefully curated selection of quality products to meet your needs. Our knowledgeable staff is always ready to help you find exactly what you're looking for, and we're committed to providing exceptional customer service and competitive prices.`,
		};

		return descriptions[type] || descriptions.retail.replace("products", "services");
	}

	static getRealisticAmenities(type) {
		const amenityMap = {
			restaurant: ["Free WiFi", "Outdoor Seating", "Delivery", "Takeout", "Catering", "Private Dining", "Full Bar", "Parking Available"],
			cafe: ["Free WiFi", "Outdoor Seating", "Drive-Through", "Takeout", "Meeting Rooms", "Live Music", "Pet Friendly"],
			retail: ["Free WiFi", "Parking Available", "Gift Cards", "Returns Accepted", "Personal Shopping", "Delivery", "Curbside Pickup"],
			health: ["Online Booking", "Insurance Accepted", "Parking Available", "Wheelchair Accessible", "Emergency Services"],
		};

		const amenities = amenityMap[type] || amenityMap.retail;
		return randomElements(amenities, faker.number.int({ min: 3, max: 6 }));
	}

	static getRealisticSpecialties(type) {
		const specialtyMap = {
			restaurant: ["Fresh Ingredients", "Local Sourcing", "Chef's Specials", "Seasonal Menu", "Farm-to-Table"],
			cafe: ["Artisan Coffee", "Fresh Pastries", "Local Roasting", "Specialty Drinks", "Organic Options"],
			retail: ["Expert Service", "Quality Products", "Competitive Prices", "Local Business", "Customer Care"],
		};

		const specialties = specialtyMap[type] || specialtyMap.retail;
		return randomElements(specialties, faker.number.int({ min: 2, max: 4 }));
	}
}

/**
 * Seed Users with various roles
 */
async function seedUsers() {
	console.log("🌱 Seeding users...");

	const users = [];
	const roles = ["user", "business_owner", "admin", "moderator"];
	const statuses = ["active", "suspended"];

	// First, create the admin user through Supabase Auth
	console.log("👑 Creating admin user...");
	try {
		const { data: adminAuthData, error: adminAuthError } = await supabase.auth.admin.createUser({
			email: "bcw1995@gmail.com",
			password: "Byronwade1995!",
			email_confirm: true,
			user_metadata: {
				name: "Byron Wade",
				role: "admin",
			},
		});

		if (adminAuthError) {
			console.log(`⚠️  Admin user may already exist: ${adminAuthError.message}`);
			// If user already exists, try to get their info
			const { data: existingUsers } = await supabase.auth.admin.listUsers();
			const existingAdmin = existingUsers?.users?.find((u) => u.email === "bcw1995@gmail.com");

			if (existingAdmin) {
				console.log("✅ Using existing admin user");
				// Add to users array for seeding other tables
				users.push({
					id: existingAdmin.id,
					email: existingAdmin.email,
					name: "Byron Wade",
					avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
					phone: "+1-555-0123",
					location: "San Francisco, CA",
					bio: "Platform Administrator and Founder",
					role: "admin",
					status: "active",
					last_login_at: new Date(),
					verified: true,
					preferences: {
						notifications: true,
						marketing: false,
						theme: "dark",
						source: "web",
						onboarded: true,
					},
				});
			}
		} else {
			console.log("✅ Admin user created successfully");
			// Add to users array for seeding other tables
			users.push({
				id: adminAuthData.user.id,
				email: adminAuthData.user.email,
				name: "Byron Wade",
				avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
				phone: "+1-555-0123",
				location: "San Francisco, CA",
				bio: "Platform Administrator and Founder",
				role: "admin",
				status: "active",
				last_login_at: new Date(),
				verified: true,
				preferences: {
					notifications: true,
					marketing: false,
					theme: "dark",
					source: "web",
					onboarded: true,
				},
			});
		}
	} catch (error) {
		console.log(`⚠️  Admin user creation failed: ${error.message}`);
	}

	// Create a few additional test users through Supabase Auth for realistic reviews
	const testUserEmails = ["john.doe@example.com", "jane.smith@example.com", "mike.johnson@example.com", "sarah.wilson@example.com", "david.brown@example.com"];

	for (const email of testUserEmails) {
		try {
			const { data: testUserData, error: testUserError } = await supabase.auth.admin.createUser({
				email,
				password: "TempPassword123!",
				email_confirm: true,
				user_metadata: {
					name: email
						.split("@")[0]
						.replace(".", " ")
						.replace(/\b\w/g, (l) => l.toUpperCase()),
				},
			});

			if (!testUserError && testUserData?.user) {
				users.push({
					id: testUserData.user.id,
					email: testUserData.user.email,
					name: testUserData.user.user_metadata?.name || "Test User",
					avatar_url: faker.image.avatar(),
					phone: faker.phone.number(),
					location: `${faker.location.city()}, ${faker.location.state()}`,
					bio: faker.lorem.paragraph(),
					role: randomElement(roles.filter((r) => r !== "admin")),
					status: "active",
					last_login_at: faker.date.recent({ days: 30 }),
					verified: true,
					preferences: {
						notifications: randomBoolean(),
						marketing: randomBoolean(),
						theme: randomElement(["light", "dark", "auto"]),
						source: "web",
						onboarded: true,
					},
				});
			}
		} catch (error) {
			console.log(`⚠️  Test user ${email} may already exist or failed to create`);
		}
	}

	// Generate remaining mock users for other seeding purposes
	const remainingUsers = SEED_CONFIG.users - users.length;
	for (let i = 0; i < remainingUsers; i++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();

		users.push({
			id: faker.string.uuid(),
			email,
			name: `${firstName} ${lastName}`,
			avatar_url: faker.image.avatar(),
			phone: faker.phone.number(),
			location: `${faker.location.city()}, ${faker.location.state()}`,
			bio: faker.lorem.paragraph(),
			role: randomElement(roles.filter((r) => r !== "admin")), // Only one admin
			status: randomElement(statuses),
			last_login_at: faker.date.recent({ days: 30 }),
			verified: randomBoolean(0.8),
			preferences: {
				notifications: randomBoolean(),
				marketing: randomBoolean(),
				theme: randomElement(["light", "dark", "auto"]),
				source: randomElement(["web", "mobile", "api"]),
				onboarded: randomBoolean(0.9),
			},
		});
	}

	// Create user references for seeding other tables
	seededData.users = users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role }));
	console.log(`✅ Prepared ${users.length} user references for seeding (including 1 admin)`);
}

/**
 * Seed Categories (business categories)
 */
async function seedCategories() {
	console.log("🌱 Seeding categories...");

	// Get existing categories
	const { data: existingCategories } = await supabase.from("categories").select("*");
	seededData.categories = existingCategories || [];

	console.log(`✅ Using ${seededData.categories.length} existing categories`);
}

/**
 * Clear existing data to prevent duplicates
 */
async function clearExistingData() {
	console.log("🧹 Clearing existing data...");

	try {
		// Clear tables in the correct order (reverse of foreign key dependencies)
		// Start with the most dependent tables first
		const tablesToClear = [
			// Tables that depend on businesses
			"business_photos",
			"business_categories",
			"reviews",
			"shorts", // has business_id foreign key
			"posts", // has business_id foreign key
			"notifications", // has business_id foreign key
			"analytics_events", // has business_id foreign key
			"events", // has business_id foreign key

			// Tables that depend on users
			"job_applications", // has applicant_id foreign key
			"course_enrollments", // has user_id foreign key
			"user_connections", // has follower_id and following_id foreign keys
			"post_interactions", // has user_id foreign key
			"shorts_interactions", // has user_id foreign key
			"event_attendees", // has user_id foreign key
			"blog_comments", // has author_id foreign key
			"blog_posts", // has author_id foreign key
			"user_reports", // has reporter_id and reported_user_id foreign keys
			"support_messages", // has user_id foreign key
			"support_tickets", // has user_id foreign key
			"user_subscriptions", // has user_id foreign key
			"payments", // has user_id foreign key
			"table_reservations", // has user_id foreign key
			"form_submissions", // has user_id foreign key
			"newsletter_subscriptions", // has user_id foreign key
			"courses", // has instructor_id foreign key to users

			// Tables that depend on companies
			"jobs", // has company_id foreign key

			// Main tables (clear these after their dependents)
			"companies", // has owner_id foreign key to users
			"businesses", // has owner_id foreign key to users
			"users",
		];

		for (const table of tablesToClear) {
			try {
				const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
				if (error) {
					console.warn(`Warning: Could not clear ${table}: ${error.message}`);
				} else {
					console.log(`   ✅ Cleared ${table}`);
				}
			} catch (err) {
				console.warn(`Warning: Could not clear ${table}: ${err.message}`);
			}
		}

		console.log("✅ Data clearing completed\n");
	} catch (error) {
		console.warn("Warning: Some tables could not be cleared:", error.message);
	}
}

/**
 * Seed Businesses with realistic data
 */
async function seedBusinesses() {
	console.log("🚀 Starting Intelligent Business Seeding...");

	// Interactive prompts for seeding strategy
	const useRealData = await IntelligentSeeder.prompt("Do you want to use real business data from APIs?", null);

	let selectedCities = TARGET_CITIES;
	if (INTELLIGENT_SEEDING.interactive) {
		console.log("\n🏙️  Available cities for real business data:");
		TARGET_CITIES.forEach((city, index) => {
			console.log(`${index + 1}. ${city.name}, ${city.state}`);
		});

		const cityChoice = await IntelligentSeeder.prompt("Select cities to fetch businesses from:", ["All cities", "Major metros only", "West Coast", "East Coast", "Custom selection"]);

		switch (cityChoice) {
			case "Major metros only":
				selectedCities = TARGET_CITIES.filter((c) => ["San Francisco", "New York", "Los Angeles", "Chicago"].includes(c.name));
				break;
			case "West Coast":
				selectedCities = TARGET_CITIES.filter((c) => ["CA", "WA", "OR"].includes(c.state));
				break;
			case "East Coast":
				selectedCities = TARGET_CITIES.filter((c) => ["NY", "FL", "MA"].includes(c.state));
				break;
			case "Custom selection":
				// For simplicity, use first 3 cities in custom selection
				selectedCities = TARGET_CITIES.slice(0, 3);
				break;
			default:
				selectedCities = TARGET_CITIES;
		}
	}

	const businessesPerCity = Math.ceil(SEED_CONFIG.businesses / selectedCities.length);
	const businesses = [];
	const businessOwners = seededData.users.filter((u) => u.role === "business_owner");
	const statuses = ["draft", "published", "archived"];
	const priceRanges = ["$", "$$", "$$$", "$$$$"];
	const usedSlugs = new Set();

	console.log(`\n📊 Seeding ${SEED_CONFIG.businesses} businesses across ${selectedCities.length} cities...`);

	for (const city of selectedCities) {
		console.log(`\n🏙️  Processing ${city.name}, ${city.state}...`);

		// Distribute businesses across different categories for this city
		const categories = Object.keys(REAL_BUSINESS_CATEGORIES);
		const businessesPerCategory = Math.ceil(businessesPerCity / categories.length);

		for (const category of categories) {
			try {
				console.log(`   📂 Fetching ${category} businesses...`);

				const realBusinessData = useRealData ? await IntelligentSeeder.fetchRealBusinessData(city, category, businessesPerCategory) : IntelligentSeeder.generateEnhancedFakeBusinesses(city, category, businessesPerCategory);

				// Convert real business data to our schema
				for (const realBusiness of realBusinessData) {
					// Generate AI-enhanced content
					const aiContent = await IntelligentSeeder.generateAIContent(realBusiness);

					// Generate unique slug
					let baseSlug = faker.helpers.slugify(realBusiness.name).toLowerCase();
					let slug = baseSlug;
					let counter = 1;

					while (usedSlugs.has(slug)) {
						slug = `${baseSlug}-${counter}`;
						counter++;
					}
					usedSlugs.add(slug);

					// Create business hours based on category
					const hours = generateBusinessHours(category);

					// Create realistic social media presence
					const socialMedia = generateSocialMedia(realBusiness.name, category);

					const business = {
						id: faker.string.uuid(),
						name: realBusiness.name,
						slug,
						description: aiContent.description,
						address: realBusiness.address,
						city: city.name,
						state: city.state,
						zip_code: faker.location.zipCode(),
						country: "US",
						latitude: realBusiness.latitude,
						longitude: realBusiness.longitude,
						phone: realBusiness.phone || faker.phone.number(),
						email: faker.internet.email({
							firstName: realBusiness.name
								.split(" ")[0]
								.toLowerCase()
								.replace(/[^a-z]/g, ""),
						}),
						website: realBusiness.website || (randomBoolean(0.7) ? faker.internet.url() : null),
						hours,
						rating: realBusiness.rating,
						review_count: faker.number.int({ min: Math.floor(realBusiness.rating * 10), max: 200 }),
						price_range: realBusiness.price_level ? "$".repeat(realBusiness.price_level) : randomElement(priceRanges),
						status: randomElement(statuses.filter((s) => s !== "draft")), // Mostly published
						verified: randomBoolean(0.8), // Higher verification rate for real businesses
						featured: randomBoolean(0.25),
						owner_id: businessOwners.length > 0 ? randomElement(businessOwners).id : null,
						claimed_by: randomBoolean(0.6) && businessOwners.length > 0 ? randomElement(businessOwners).id : null,
						claimed_at: randomBoolean(0.6) ? faker.date.past() : null,
						photos: realBusiness.photos.length > 0 ? realBusiness.photos : [`https://via.placeholder.com/800x600/1f2937/ffffff?text=Business+Main`, `https://via.placeholder.com/800x600/1f2937/ffffff?text=Business+Interior`],
						social_media: socialMedia,
						amenities: aiContent.amenities,
						payment_methods: generatePaymentMethods(category),
					};

					businesses.push(business);

					// Rate limiting for API calls
					if (useRealData && BUSINESS_APIS.googlePlaces) {
						await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
					}
				}
			} catch (error) {
				console.log(`⚠️  Error processing ${category} in ${city.name}: ${error.message}`);
				console.log("   Continuing with next category...");
			}
		}
	}

	// Limit to requested number of businesses
	const finalBusinesses = businesses.slice(0, SEED_CONFIG.businesses);

	console.log(`\n💾 Inserting ${finalBusinesses.length} intelligent businesses into database...`);
	const { data, error } = await supabase.from("businesses").insert(finalBusinesses).select();
	if (error) throw error;

	seededData.businesses = data;
	console.log(`✅ Successfully seeded ${data.length} intelligent businesses!`);
	console.log(`   📊 Real data sources: ${useRealData ? "API + Enhanced" : "Enhanced Fake"}`);
	console.log(`   🏙️  Cities: ${selectedCities.map((c) => c.name).join(", ")}`);
	console.log(`   📂 Categories: ${Object.keys(REAL_BUSINESS_CATEGORIES).join(", ")}`);
}

// Helper functions for intelligent business generation
function generateBusinessHours(category) {
	const hourTemplates = {
		restaurants: {
			monday: "11:00 AM - 10:00 PM",
			tuesday: "11:00 AM - 10:00 PM",
			wednesday: "11:00 AM - 10:00 PM",
			thursday: "11:00 AM - 10:00 PM",
			friday: "11:00 AM - 11:00 PM",
			saturday: "11:00 AM - 11:00 PM",
			sunday: "11:00 AM - 9:00 PM",
		},
		retail: {
			monday: "10:00 AM - 8:00 PM",
			tuesday: "10:00 AM - 8:00 PM",
			wednesday: "10:00 AM - 8:00 PM",
			thursday: "10:00 AM - 8:00 PM",
			friday: "10:00 AM - 9:00 PM",
			saturday: "10:00 AM - 9:00 PM",
			sunday: "12:00 PM - 6:00 PM",
		},
		health: {
			monday: "8:00 AM - 5:00 PM",
			tuesday: "8:00 AM - 5:00 PM",
			wednesday: "8:00 AM - 5:00 PM",
			thursday: "8:00 AM - 5:00 PM",
			friday: "8:00 AM - 5:00 PM",
			saturday: "9:00 AM - 2:00 PM",
			sunday: "Closed",
		},
	};

	return hourTemplates[category] || hourTemplates.retail;
}

function generateSocialMedia(businessName, category) {
	const handle = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");

	return randomBoolean(0.8)
		? {
				facebook: `https://facebook.com/${handle}`,
				instagram: randomBoolean(0.7) ? `https://instagram.com/${handle}` : null,
				twitter: randomBoolean(0.5) ? `https://twitter.com/${handle}` : null,
				yelp: randomBoolean(0.9) ? `https://yelp.com/biz/${handle}` : null,
			}
		: {};
}

function generatePaymentMethods(category) {
	const baseMethods = ["Cash", "Credit Card", "Debit Card"];
	const modernMethods = ["Apple Pay", "Google Pay", "PayPal", "Venmo"];

	const allMethods = [...baseMethods];

	// Modern businesses are more likely to accept digital payments
	if (randomBoolean(0.8)) {
		allMethods.push(...randomElements(modernMethods, 2));
	}

	return allMethods;
}

/**
 * Seed Business Categories (junction table)
 */
async function seedBusinessCategories() {
	console.log("🌱 Seeding business categories...");

	const businessCategories = [];

	for (const business of seededData.businesses) {
		const categoriesForBusiness = randomElements(seededData.categories, 2);

		categoriesForBusiness.forEach((category, index) => {
			businessCategories.push({
				id: faker.string.uuid(),
				business_id: business.id,
				category_id: category.id,
				is_primary: index === 0, // First category is primary
			});
		});
	}

	const { data, error } = await supabase.from("business_categories").insert(businessCategories);
	if (error) throw error;

	console.log(`✅ Seeded ${businessCategories.length} business category relationships`);
}

/**
 * Seed Business Photos
 */
async function seedBusinessPhotos() {
	console.log("🌱 Seeding business photos...");

	const photos = [];

	for (const business of seededData.businesses.slice(0, 50)) {
		// Only for first 50 businesses
		const photoCount = faker.number.int({ min: 2, max: 8 });

		for (let i = 0; i < photoCount; i++) {
			photos.push({
				id: faker.string.uuid(),
				business_id: business.id,
				url: `https://via.placeholder.com/800x600/1f2937/ffffff?text=Photo+${i + 1}`,
				alt_text: faker.lorem.sentence(),
				caption: faker.lorem.sentence(),
				is_primary: i === 0,
				order: i,
				uploaded_by: business.owner_id,
			});
		}
	}

	const { data, error } = await supabase.from("business_photos").insert(photos);
	if (error) throw error;

	console.log(`✅ Seeded ${photos.length} business photos`);
}

/**
 * Seed Reviews
 */
async function seedReviews() {
	console.log("🌱 Seeding reviews...");

	const reviews = [];
	const statuses = ["pending", "approved", "rejected"];
	const usedCombinations = new Set(); // Track user-business combinations

	// Separate real users (first 6: admin + 5 test users) from mock users
	const realUsers = seededData.users.slice(0, 6); // Real users with actual auth IDs
	const mockUsers = seededData.users.slice(6); // Mock users for other purposes

	let attempts = 0;
	const maxAttempts = SEED_CONFIG.reviews * 3; // Allow multiple attempts to find unique combinations

	while (reviews.length < SEED_CONFIG.reviews && attempts < maxAttempts) {
		attempts++;

		const business = randomElement(seededData.businesses);

		// Use real users for first 70% of reviews, mock users for remainder
		const shouldUseRealUser = reviews.length < SEED_CONFIG.reviews * 0.7;
		const user = shouldUseRealUser && realUsers.length > 0 ? randomElement(realUsers) : randomElement(seededData.users);

		const combinationKey = `${user.id}-${business.id}`;

		// Skip if this user-business combination already exists
		if (usedCombinations.has(combinationKey)) {
			continue;
		}

		usedCombinations.add(combinationKey);
		const rating = faker.number.int({ min: 1, max: 5 });

		reviews.push({
			id: faker.string.uuid(),
			business_id: business.id,
			user_id: user.id,
			rating,
			title: faker.lorem.sentence(),
			text: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
			photos: randomBoolean(0.3) ? [`https://via.placeholder.com/400x300/1f2937/ffffff?text=Review+Photo`] : [],
			helpful_count: faker.number.int({ min: 0, max: 20 }),
			status: randomElement(statuses),
			is_flagged: randomBoolean(0.05),
			response: randomBoolean(0.4) ? faker.lorem.paragraph() : null,
			response_date: randomBoolean(0.4) ? faker.date.recent() : null,
			visit_date: faker.date.recent({ days: 60 }),
			verified_purchase: randomBoolean(0.6),
			tags: randomElements(["service", "quality", "price", "atmosphere", "cleanliness"]),
		});
	}

	if (reviews.length < SEED_CONFIG.reviews) {
		console.warn(`⚠️  Only generated ${reviews.length} unique reviews out of ${SEED_CONFIG.reviews} requested`);
	}

	const { data, error } = await supabase.from("reviews").insert(reviews);
	if (error) throw error;

	console.log(`✅ Seeded ${reviews.length} reviews`);
}

/**
 * Seed Companies for job postings
 */
async function seedCompanies() {
	console.log("🌱 Seeding companies...");

	const companies = [];
	const industries = ["Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Construction", "Real Estate", "Hospitality"];
	const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
	const statuses = ["draft", "published"];

	for (let i = 0; i < SEED_CONFIG.companies; i++) {
		const name = faker.company.name();
		const businessOwners = seededData.users.filter((u) => u.role === "business_owner");

		companies.push({
			id: faker.string.uuid(),
			name,
			slug: faker.helpers.slugify(name).toLowerCase(),
			description: faker.lorem.paragraphs(2),
			website: faker.internet.url(),
			logo_url: `https://via.placeholder.com/200x200/1f2937/ffffff?text=Logo`,
			banner_url: `https://via.placeholder.com/1200x400/1f2937/ffffff?text=Banner`,
			industry: randomElement(industries),
			company_size: randomElement(companySizes),
			founded_year: faker.number.int({ min: 1950, max: 2020 }),
			headquarters: `${faker.location.city()}, ${faker.location.state()}`,
			culture: {
				values: randomElements(["Innovation", "Collaboration", "Integrity", "Excellence"]),
				perks: randomElements(["Remote Work", "Health Insurance", "Flexible Hours", "401k"]),
			},
			benefits: randomElements(["Health Insurance", "Dental Insurance", "Vision Insurance", "401k Matching", "Flexible PTO", "Remote Work", "Gym Membership"]),
			owner_id: businessOwners.length > 0 ? randomElement(businessOwners).id : null,
			verified: randomBoolean(0.8),
			status: randomElement(statuses),
		});
	}

	const { data, error } = await supabase.from("companies").insert(companies).select();
	if (error) throw error;

	seededData.companies = data;
	console.log(`✅ Seeded ${data.length} companies`);
}

/**
 * Seed Jobs
 */
async function seedJobs() {
	console.log("🌱 Seeding jobs...");

	const jobs = [];
	const jobTypes = ["full_time", "part_time", "contract", "freelance", "internship"];
	const jobStatuses = ["draft", "published", "filled", "closed"];
	const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Executive"];

	const jobTitles = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "Marketing Manager", "Sales Representative", "Customer Success Manager", "DevOps Engineer", "Content Writer", "Graphic Designer"];

	for (let i = 0; i < SEED_CONFIG.jobs; i++) {
		const company = randomElement(seededData.companies);
		const title = randomElement(jobTitles);
		const location = randomBoolean(0.7) ? `${faker.location.city()}, ${faker.location.state()}` : "Remote";

		jobs.push({
			id: faker.string.uuid(),
			title,
			slug: faker.helpers.slugify(`${title} ${company.name} ${faker.string.alpha(4)}`).toLowerCase(),
			description: faker.lorem.paragraphs(3),
			requirements: faker.lorem.paragraphs(2),
			responsibilities: faker.lorem.paragraphs(2),
			company_id: company.id,
			posted_by: company.owner_id,
			location,
			remote_ok: location === "Remote" || randomBoolean(0.4),
			job_type: randomElement(jobTypes),
			salary_min: faker.number.int({ min: 40000, max: 80000 }),
			salary_max: faker.number.int({ min: 80000, max: 200000 }),
			salary_currency: "USD",
			experience_level: randomElement(experienceLevels),
			skills: randomElements(["JavaScript", "Python", "React", "Node.js", "SQL", "AWS", "Docker", "Git", "Agile", "Communication"]),
			benefits: randomElements(["Health Insurance", "Dental", "Vision", "401k", "Flexible PTO", "Remote Work"]),
			application_deadline: faker.date.future({ years: 1 }),
			status: randomElement(jobStatuses),
			view_count: faker.number.int({ min: 0, max: 500 }),
			application_count: faker.number.int({ min: 0, max: 50 }),
			external_url: randomBoolean(0.3) ? faker.internet.url() : null,
			apply_instructions: faker.lorem.paragraph(),
		});
	}

	const { data, error } = await supabase.from("jobs").insert(jobs).select();
	if (error) throw error;

	seededData.jobs = data;
	console.log(`✅ Seeded ${data.length} jobs`);
}

/**
 * Seed Job Applications
 */
async function seedJobApplications() {
	console.log("🌱 Seeding job applications...");

	const applications = [];
	const statuses = ["pending", "reviewing", "interviewed", "rejected", "hired"];

	// Create applications for published jobs
	const publishedJobs = seededData.jobs.filter((j) => j.status === "published");

	for (const job of publishedJobs.slice(0, 30)) {
		// Limit to first 30 jobs
		const applicantCount = faker.number.int({ min: 1, max: 10 });
		const jobApplicants = new Set(); // Track applicants for this specific job
		const eligibleUsers = seededData.users.filter((u) => u.role === "user");

		let attempts = 0;
		const maxAttempts = Math.min(applicantCount * 3, eligibleUsers.length); // Limit attempts

		while (jobApplicants.size < applicantCount && attempts < maxAttempts) {
			attempts++;

			const applicant = randomElement(eligibleUsers);

			// Skip if this user already applied to this job
			if (jobApplicants.has(applicant.id)) {
				continue;
			}

			jobApplicants.add(applicant.id);

			applications.push({
				id: faker.string.uuid(),
				job_id: job.id,
				applicant_id: applicant.id,
				cover_letter: faker.lorem.paragraphs(2),
				resume_url: faker.internet.url(),
				portfolio_url: randomBoolean(0.4) ? faker.internet.url() : null,
				status: randomElement(statuses),
				notes: randomBoolean(0.3) ? faker.lorem.sentence() : null,
				interview_date: randomBoolean(0.2) ? faker.date.future() : null,
				salary_expectation: faker.number.int({ min: 50000, max: 150000 }),
				additional_info: {
					preferred_start_date: faker.date.future(),
					visa_required: randomBoolean(0.1),
				},
			});
		}
	}

	const { data, error } = await supabase.from("job_applications").insert(applications);
	if (error) throw error;

	console.log(`✅ Seeded ${applications.length} job applications`);
}

/**
 * Seed User Profiles
 */
async function seedUserProfiles() {
	console.log("🌱 Seeding user profiles...");

	const profiles = [];

	for (const user of seededData.users.slice(0, 50)) {
		// Profiles for first 50 users
		profiles.push({
			id: faker.string.uuid(),
			user_id: user.id,
			headline: faker.person.jobTitle(),
			summary: faker.lorem.paragraphs(2),
			experience: [
				{
					company: faker.company.name(),
					position: faker.person.jobTitle(),
					start_date: faker.date.past({ years: 5 }),
					end_date: faker.date.recent({ years: 1 }),
					description: faker.lorem.paragraph(),
				},
			],
			education: [
				{
					school: faker.company.name() + " University",
					degree: "Bachelor of Science",
					field: faker.person.jobArea(),
					start_date: faker.date.past({ years: 10 }),
					end_date: faker.date.past({ years: 6 }),
				},
			],
			skills: randomElements(["JavaScript", "Python", "Project Management", "Communication", "Leadership", "Problem Solving", "Team Work"]),
			certifications: [
				{
					name: "Professional Certification",
					issuer: faker.company.name(),
					date: faker.date.past({ years: 2 }),
				},
			],
			languages: [
				{ language: "English", proficiency: "Native" },
				{ language: "Spanish", proficiency: "Conversational" },
			],
			portfolio_url: faker.internet.url(),
			resume_url: faker.internet.url(),
			linkedin_url: faker.internet.url(),
			github_url: randomBoolean(0.5) ? faker.internet.url() : null,
			website_url: randomBoolean(0.3) ? faker.internet.url() : null,
			availability: randomElement(["Immediately", "2 weeks", "1 month", "Not available"]),
			open_to_work: randomBoolean(0.3),
		});
	}

	// Use upsert to handle existing profiles gracefully
	const { data, error } = await supabase.from("user_profiles").upsert(profiles, {
		onConflict: "user_id",
		ignoreDuplicates: false,
	});

	if (error) {
		console.log(`⚠️  User profiles seeding failed: ${error.message}`);
		console.log("This might be due to existing profiles - continuing with seeding...");
	} else {
		console.log(`✅ Seeded ${profiles.length} user profiles`);
	}
}

/**
 * Seed Blog Categories
 */
async function seedBlogCategories() {
	console.log("🌱 Seeding blog categories...");

	// Get existing blog categories
	const { data: existingCategories } = await supabase.from("blog_categories").select("*");
	seededData.blogCategories = existingCategories || [];

	console.log(`✅ Using ${seededData.blogCategories.length} existing blog categories`);
}

/**
 * Seed Blog Posts
 */
async function seedBlogPosts() {
	console.log("🌱 Seeding blog posts...");

	const posts = [];
	const statuses = ["draft", "published", "archived"];

	for (let i = 0; i < SEED_CONFIG.blogPosts; i++) {
		const author = randomElement(seededData.users);
		const title = faker.lorem.sentence();
		const category = randomElement(seededData.blogCategories);

		posts.push({
			id: faker.string.uuid(),
			title,
			slug: faker.helpers.slugify(title).toLowerCase(),
			excerpt: faker.lorem.paragraph(),
			content: faker.lorem.paragraphs(faker.number.int({ min: 5, max: 15 })),
			featured_image: `https://via.placeholder.com/1200x600/1f2937/ffffff?text=Featured+Image`,
			author_id: author.id,
			category_id: category?.id || null,
			tags: randomElements(["business", "tips", "entrepreneurship", "marketing", "technology"]),
			status: randomElement(statuses),
			published_at: randomBoolean(0.7) ? faker.date.past() : null,
			view_count: faker.number.int({ min: 0, max: 1000 }),
			like_count: faker.number.int({ min: 0, max: 100 }),
			comment_count: faker.number.int({ min: 0, max: 30 }),
			reading_time: faker.number.int({ min: 2, max: 15 }),
			seo_title: title,
			seo_description: faker.lorem.sentence(),
			is_featured: randomBoolean(0.1),
		});
	}

	const { data, error } = await supabase.from("blog_posts").insert(posts).select();
	if (error) throw error;

	seededData.blogPosts = data;
	console.log(`✅ Seeded ${data.length} blog posts`);
}

/**
 * Seed Events
 */
async function seedEvents() {
	console.log("🌱 Seeding events...");

	const events = [];
	const eventStatuses = ["upcoming", "ongoing", "completed", "cancelled"];

	for (let i = 0; i < SEED_CONFIG.events; i++) {
		const organizer = randomElement(seededData.users);
		const business = randomBoolean(0.5) ? randomElement(seededData.businesses) : null;
		const title = faker.lorem.sentence();
		const isVirtual = randomBoolean(0.3);
		const startDate = faker.date.future();

		events.push({
			id: faker.string.uuid(),
			title,
			slug: faker.helpers.slugify(title).toLowerCase(),
			description: faker.lorem.paragraph(),
			content: faker.lorem.paragraphs(3),
			start_date: startDate,
			end_date: faker.date.future({ refDate: startDate }),
			timezone: "UTC",
			location: isVirtual ? null : `${faker.location.city()}, ${faker.location.state()}`,
			venue: isVirtual ? null : faker.company.name(),
			address: isVirtual ? null : faker.location.streetAddress(),
			latitude: isVirtual ? null : faker.location.latitude(),
			longitude: isVirtual ? null : faker.location.longitude(),
			is_virtual: isVirtual,
			virtual_url: isVirtual ? faker.internet.url() : null,
			organizer_id: organizer.id,
			business_id: business?.id || null,
			category_id: randomElement(seededData.categories)?.id || null,
			featured_image: `https://via.placeholder.com/1200x600/1f2937/ffffff?text=Event+Image`,
			gallery: Array.from({ length: 3 }, (_, idx) => `https://via.placeholder.com/800x600/1f2937/ffffff?text=Gallery+${idx + 1}`),
			price: randomBoolean(0.6) ? 0 : faker.number.float({ min: 10, max: 500, multipleOf: 5 }),
			currency: "USD",
			max_attendees: faker.number.int({ min: 20, max: 500 }),
			current_attendees: faker.number.int({ min: 0, max: 50 }),
			status: randomElement(eventStatuses),
			is_featured: randomBoolean(0.2),
			tags: randomElements(["networking", "business", "conference", "workshop", "seminar"]),
			requirements: randomBoolean(0.3) ? faker.lorem.sentence() : null,
		});
	}

	const { data, error } = await supabase.from("events").insert(events).select();
	if (error) throw error;

	seededData.events = data;
	console.log(`✅ Seeded ${data.length} events`);
}

/**
 * Seed Additional Tables (simplified for brevity)
 */
async function seedAdditionalTables() {
	console.log("🌱 Seeding additional tables...");

	// Seed Courses
	const courses = [];
	for (let i = 0; i < SEED_CONFIG.courses; i++) {
		const instructor = randomElement(seededData.users);
		const title = faker.lorem.sentence();

		courses.push({
			id: faker.string.uuid(),
			title,
			slug: faker.helpers.slugify(title).toLowerCase(),
			description: faker.lorem.paragraphs(2),
			content: faker.lorem.paragraphs(5),
			instructor_id: instructor.id,
			category_id: randomElement(seededData.categories)?.id || null,
			featured_image: `https://via.placeholder.com/800x600/1f2937/ffffff?text=Course+Image`,
			price: randomBoolean(0.7) ? faker.number.float({ min: 50, max: 300, multipleOf: 10 }) : 0,
			currency: "USD",
			duration_minutes: faker.number.int({ min: 60, max: 600 }),
			difficulty_level: randomElement(["Beginner", "Intermediate", "Advanced"]),
			prerequisites: randomElements(["Basic knowledge", "Computer access", "Internet connection"]),
			learning_objectives: randomElements(["Understand core concepts", "Apply practical skills", "Master advanced techniques"]),
			status: randomElement(["draft", "published"]),
			published_at: randomBoolean(0.8) ? faker.date.past() : null,
			enrollment_count: faker.number.int({ min: 0, max: 100 }),
			rating: faker.number.float({ min: 3, max: 5, multipleOf: 0.1 }),
			review_count: faker.number.int({ min: 0, max: 50 }),
			is_featured: randomBoolean(0.15),
		});
	}

	const { data: courseData } = await supabase.from("courses").insert(courses).select();
	seededData.courses = courseData || [];

	// Seed Posts (social feed)
	const posts = [];
	for (let i = 0; i < SEED_CONFIG.posts; i++) {
		const author = randomElement(seededData.users);

		posts.push({
			id: faker.string.uuid(),
			author_id: author.id,
			content: faker.lorem.paragraph(),
			media_urls: randomBoolean(0.3) ? [faker.image.url()] : [],
			post_type: randomElement(["text", "image", "video", "link"]),
			visibility: randomElement(["public", "private", "friends"]),
			like_count: faker.number.int({ min: 0, max: 100 }),
			comment_count: faker.number.int({ min: 0, max: 20 }),
			share_count: faker.number.int({ min: 0, max: 10 }),
			hashtags: randomElements(["business", "entrepreneur", "startup", "success"]),
			mentions: [],
		});
	}

	await supabase.from("posts").insert(posts);

	// Seed Shorts
	const shorts = [];
	for (let i = 0; i < SEED_CONFIG.shorts; i++) {
		const creator = randomElement(seededData.users);
		const business = randomBoolean(0.4) ? randomElement(seededData.businesses) : null;

		shorts.push({
			id: faker.string.uuid(),
			creator_id: creator.id,
			business_id: business?.id || null,
			title: faker.lorem.sentence(),
			description: faker.lorem.paragraph(),
			video_url: faker.internet.url(),
			thumbnail_url: faker.image.url(),
			duration_seconds: faker.number.int({ min: 15, max: 60 }),
			view_count: faker.number.int({ min: 0, max: 10000 }),
			like_count: faker.number.int({ min: 0, max: 500 }),
			comment_count: faker.number.int({ min: 0, max: 50 }),
			share_count: faker.number.int({ min: 0, max: 20 }),
			tags: randomElements(["business", "tips", "tutorial", "behind-scenes"]),
			status: randomElement(["draft", "published"]),
			is_featured: randomBoolean(0.1),
		});
	}

	await supabase.from("shorts").insert(shorts);

	console.log(`✅ Seeded courses, posts, and shorts`);
}

/**
 * Seed Local Hubs
 */
async function seedLocalHubs() {
	console.log("🏠 Seeding local hubs...");

	const localHubsData = [
		{
			subdomain: "santacruz",
			name: "Santa Cruz Local Hub",
			description: "Discover the best local businesses in beautiful Santa Cruz, California. From beach-side restaurants to artisan shops, find everything you need in our coastal community.",
			tagline: "Your guide to Santa Cruz's best local businesses",
			location_city: "Santa Cruz",
			location_state: "CA",
			country: "US",
			latitude: 36.9741,
			longitude: -122.0308,
			radius_km: 25,
			primary_color: "#1e40af",
			secondary_color: "#3b82f6",
			meta_title: "Santa Cruz Local Business Directory",
			meta_description: "Find the best local businesses in Santa Cruz, CA. Reviews, photos, and contact info for restaurants, shops, services and more.",
			meta_keywords: ["santa cruz", "local business", "california", "restaurants", "shops"],
			featured_categories: ["restaurants", "retail", "services"],
			contact_email: "info@santacruz.localhub.com",
			social_links: {
				facebook: "https://facebook.com/santacruzlocal",
				instagram: "https://instagram.com/santacruzlocal",
			},
		},
		{
			subdomain: "raleigh",
			name: "Raleigh Business Directory",
			description: "Your comprehensive guide to local businesses in Raleigh, North Carolina. From tech startups to traditional Southern cuisine, discover what makes our city special.",
			tagline: "Connecting Raleigh's community with local business",
			location_city: "Raleigh",
			location_state: "NC",
			country: "US",
			latitude: 35.7796,
			longitude: -78.6382,
			radius_km: 30,
			primary_color: "hsl(var(--destructive))",
			secondary_color: "hsl(var(--destructive))",
			meta_title: "Raleigh Local Business Directory",
			meta_description: "Discover local businesses in Raleigh, NC. Find restaurants, services, shops and more with reviews and ratings.",
			meta_keywords: ["raleigh", "north carolina", "local business", "restaurants", "tech"],
			featured_categories: ["restaurants", "tech", "healthcare"],
			contact_email: "hello@raleigh.localhub.com",
		},
		{
			subdomain: "portland",
			name: "Portland Local Hub",
			description: "Explore Portland's unique local business scene. From food trucks to boutique shops, craft breweries to tech companies - find the best of Portland here.",
			tagline: "Keep Portland Local",
			location_city: "Portland",
			location_state: "OR",
			country: "US",
			latitude: 45.5152,
			longitude: -122.6784,
			radius_km: 35,
			primary_color: "hsl(var(--success))",
			secondary_color: "hsl(var(--success))",
			meta_title: "Portland Local Business Directory",
			meta_description: "Find unique local businesses in Portland, OR. From food carts to boutiques, discover what makes Portland special.",
			meta_keywords: ["portland", "oregon", "local business", "food trucks", "breweries"],
			featured_categories: ["food", "retail", "breweries"],
			contact_email: "info@portland.localhub.com",
		},
		{
			subdomain: "austin",
			name: "Austin Local Directory",
			description: "Keep Austin weird and local! Discover the vibrant local business scene in Austin, Texas. Music venues, BBQ joints, tech companies and more.",
			tagline: "Keep Austin Local",
			location_city: "Austin",
			location_state: "TX",
			country: "US",
			latitude: 30.2672,
			longitude: -97.7431,
			radius_km: 40,
			primary_color: "hsl(var(--muted-foreground))",
			secondary_color: "hsl(var(--muted-foreground))",
			meta_title: "Austin Local Business Directory",
			meta_description: "Discover local businesses in Austin, TX. Music venues, restaurants, tech companies and more in the Live Music Capital.",
			meta_keywords: ["austin", "texas", "local business", "music", "bbq", "tech"],
			featured_categories: ["music", "restaurants", "tech"],
			contact_email: "howdy@austin.localhub.com",
		},
		{
			subdomain: "denver",
			name: "Denver Local Hub",
			description: "Your guide to Denver's thriving local business community. From mountain gear shops to craft breweries, farm-to-table restaurants to outdoor adventure companies.",
			tagline: "Mile High, Local First",
			location_city: "Denver",
			location_state: "CO",
			country: "US",
			latitude: 39.7392,
			longitude: -104.9903,
			radius_km: 45,
			primary_color: "#ea580c",
			secondary_color: "#f97316",
			meta_title: "Denver Local Business Directory",
			meta_description: "Find local businesses in Denver, CO. Outdoor gear, breweries, restaurants and services in the Mile High City.",
			meta_keywords: ["denver", "colorado", "local business", "outdoor", "breweries", "mountain"],
			featured_categories: ["outdoor", "breweries", "restaurants"],
			contact_email: "info@denver.localhub.com",
		},
	];

	for (const hubData of localHubsData) {
		// Find a random business owner to be the hub owner
		const randomOwner = seededData.users[Math.floor(Math.random() * Math.min(20, seededData.users.length))];

		const { data, error } = await supabase
			.from("local_hubs")
			.insert({
				...hubData,
				owner_id: randomOwner.id,
				status: "active",
				total_businesses: Math.floor(Math.random() * 50) + 10,
				total_reviews: Math.floor(Math.random() * 200) + 25,
				monthly_views: Math.floor(Math.random() * 5000) + 500,
			})
			.select();

		if (error) {
			console.error("Error seeding local hub:", hubData.subdomain, error.message);
			continue;
		}

		seededData.localHubs = seededData.localHubs || [];
		seededData.localHubs.push(data[0]);

		// Add the owner as a manager
		await supabase.from("local_hub_managers").insert({
			local_hub_id: data[0].id,
			user_id: randomOwner.id,
			role: "owner",
		});

		// Associate some random businesses with this hub
		const cityBusinesses = seededData.businesses.filter((b) => b.city.toLowerCase().includes(hubData.location_city.toLowerCase()) || b.state.toLowerCase() === hubData.location_state.toLowerCase());

		const businessesToAssociate = cityBusinesses.length > 0 ? cityBusinesses.slice(0, Math.min(15, cityBusinesses.length)) : seededData.businesses.slice(0, 10);

		for (const business of businessesToAssociate) {
			await supabase.from("local_hub_businesses").insert({
				local_hub_id: data[0].id,
				business_id: business.id,
				status: "active",
				is_featured: Math.random() < 0.3,
				added_by: randomOwner.id,
				approved_by: randomOwner.id,
				approved_at: new Date().toISOString(),
			});
		}

		// Add sample analytics data for the past 30 days
		for (let i = 0; i < 30; i++) {
			const date = new Date();
			date.setDate(date.getDate() - i);

			await supabase.from("local_hub_analytics").insert({
				local_hub_id: data[0].id,
				date: date.toISOString().split("T")[0],
				page_views: Math.floor(Math.random() * 200) + 50,
				unique_visitors: Math.floor(Math.random() * 100) + 20,
				business_views: Math.floor(Math.random() * 150) + 30,
				search_queries: Math.floor(Math.random() * 50) + 10,
				contact_clicks: Math.floor(Math.random() * 25) + 5,
				referral_sources: {
					google: Math.floor(Math.random() * 50) + 20,
					direct: Math.floor(Math.random() * 30) + 10,
					social: Math.floor(Math.random() * 20) + 5,
				},
				popular_searches: ["restaurants", "coffee", "shopping", "services"],
			});
		}
	}

	// Add reserved subdomains
	const reservedSubdomains = [
		{ subdomain: "www", reason: "system" },
		{ subdomain: "api", reason: "system" },
		{ subdomain: "admin", reason: "system" },
		{ subdomain: "app", reason: "system" },
		{ subdomain: "mail", reason: "system" },
		{ subdomain: "blog", reason: "system" },
		{ subdomain: "support", reason: "system" },
		{ subdomain: "help", reason: "system" },
		{ subdomain: "docs", reason: "system" },
		{ subdomain: "status", reason: "system" },
		{ subdomain: "localhub", reason: "brand" },
		{ subdomain: "thorbis", reason: "brand" },
		{ subdomain: "test", reason: "system" },
		{ subdomain: "dev", reason: "system" },
		{ subdomain: "staging", reason: "system" },
	];

	for (const reserved of reservedSubdomains) {
		await supabase.from("reserved_subdomains").insert(reserved);
	}

	console.log(`   ✅ Seeded ${localHubsData.length} local hubs with analytics and business associations`);
}

/**
 * Seed Notifications
 */
async function seedNotifications() {
	console.log("🌱 Seeding notifications...");

	const notifications = [];
	const notificationTypes = ["new_review", "business_claimed", "job_application", "event_reminder", "course_enrollment", "payment_successful", "support_response"];

	for (let i = 0; i < 200; i++) {
		const user = randomElement(seededData.users);
		const type = randomElement(notificationTypes);

		notifications.push({
			id: faker.string.uuid(),
			user_id: user.id,
			type,
			title: faker.lorem.sentence(),
			message: faker.lorem.paragraph(),
			data: {
				action_url: faker.internet.url(),
				priority: randomElement(["low", "medium", "high"]),
			},
			read: randomBoolean(0.6),
			read_at: randomBoolean(0.6) ? faker.date.recent() : null,
		});
	}

	await supabase.from("notifications").insert(notifications);
	console.log(`✅ Seeded ${notifications.length} notifications`);
}

/**
 * Main seeding function
 */
async function seedDatabase() {
	console.log("🚀 Starting database seeding...\n");

	try {
		// Clear existing data first to prevent duplicates
		await clearExistingData();

		await seedUsers();
		await seedCategories();
		await seedBusinesses();
		await seedBusinessCategories();
		await seedBusinessPhotos();
		await seedReviews();
		await seedCompanies();
		await seedJobs();
		await seedJobApplications();
		await seedUserProfiles();
		await seedBlogCategories();
		await seedBlogPosts();
		await seedEvents();
		await seedAdditionalTables();
		await seedLocalHubs();
		await seedNotifications();

		console.log("\n🎉 Database seeding completed successfully!");
		console.log("📊 Summary:");
		console.log(`   • ${seededData.users.length} users`);
		console.log(`   • ${seededData.businesses.length} businesses`);
		console.log(`   • ${seededData.companies.length} companies`);
		console.log(`   • ${seededData.jobs.length} jobs`);
		console.log(`   • ${seededData.blogPosts.length} blog posts`);
		console.log(`   • ${seededData.events.length} events`);
		console.log(`   • ${seededData.courses.length} courses`);
		console.log(`   • ${seededData.localHubs?.length || 0} local hubs`);
		console.log("   • And much more!");
	} catch (error) {
		console.error("❌ Seeding failed:", error.message);
		console.error("   Make sure your schema is properly set up");
		process.exit(1);
	}
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase()
		.then(() => {
			console.log("\n✨ Ready to test your application with realistic data!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Failed to seed database:", error);
			process.exit(1);
		});
}

export { seedDatabase };

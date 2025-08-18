/**
 * Job Categories Data
 * Categories and subcategories for job postings
 * Extracted from large jobs create page for better organization
 */

export const jobCategories = ["Home & Garden", "Professional Services", "Automotive", "Health & Wellness", "Technology", "Education & Training", "Event Services", "Business Services", "Creative Services", "Legal Services"];

export const subCategories = {
	"Home & Garden": ["Plumbing", "Electrical", "HVAC", "Roofing", "Flooring", "Painting", "Landscaping", "Handyman", "Appliance Repair", "Cleaning Services", "Moving Services", "Pest Control", "Interior Design", "Garage Door Repair", "Fencing", "Concrete Work", "Pool Services", "Tree Services"],
	"Professional Services": ["Accounting", "Legal", "Real Estate", "Insurance", "Financial Planning", "Marketing", "Consulting", "Architecture", "Engineering", "Property Management"],
	Automotive: ["Auto Repair", "Oil Change", "Tire Services", "Auto Detailing", "Towing", "Auto Glass", "Transmission Repair", "Brake Repair"],
	"Health & Wellness": ["Medical", "Dental", "Veterinary", "Physical Therapy", "Massage Therapy", "Mental Health", "Nutrition", "Fitness Training", "Chiropractic"],
	Technology: ["Computer Repair", "IT Support", "Web Development", "App Development", "Cybersecurity", "Data Recovery", "Network Setup", "Software Training"],
	"Education & Training": ["Tutoring", "Music Lessons", "Language Learning", "Test Prep", "Professional Training", "Skill Development", "Academic Support"],
	"Event Services": ["Wedding Planning", "Catering", "Photography", "DJ Services", "Event Planning", "Party Rentals", "Floral Design", "Entertainment"],
	"Business Services": ["Graphic Design", "Content Writing", "Virtual Assistant", "Bookkeeping", "Social Media Management", "SEO Services", "Translation", "Data Entry"],
	"Creative Services": ["Video Production", "Audio Production", "Animation", "Logo Design", "Branding", "Illustration", "3D Modeling", "Voice Over"],
	"Legal Services": ["Personal Injury", "Family Law", "Criminal Defense", "Business Law", "Real Estate Law", "Immigration", "Estate Planning", "Contract Review"],
};

export const urgencyLevels = [
	{
		value: "low",
		label: "Low Priority",
		description: "Within 2-4 weeks",
		color: "bg-primary/10 text-primary dark:text-primary",
	},
	{
		value: "medium",
		label: "Medium Priority",
		description: "Within 1-2 weeks",
		color: "bg-muted-foreground/10 text-muted-foreground dark:text-muted-foreground",
	},
	{
		value: "high",
		label: "High Priority",
		description: "Within 2-7 days",
		color: "bg-muted-foreground/20 text-muted-foreground dark:text-muted-foreground",
	},
	{
		value: "urgent",
		label: "Urgent",
		description: "ASAP - Same day/Next day",
		color: "bg-destructive/10 text-destructive dark:text-destructive",
	},
];

export const budgetTypes = [
	{
		value: "fixed",
		label: "Fixed Price",
		description: "One-time project cost",
	},
	{
		value: "hourly",
		label: "Hourly Rate",
		description: "Cost per hour",
	},
	{
		value: "estimate",
		label: "Request Estimate",
		description: "Let contractors quote",
	},
	{
		value: "ongoing",
		label: "Ongoing Contract",
		description: "Monthly/recurring service",
	},
];

/**
 * Get subcategories for a specific main category
 * @param {string} category - Main category name
 * @returns {string[]} Array of subcategory names
 */
export const getSubcategoriesForCategory = (category) => {
	return subCategories[category] || [];
};

/**
 * Get urgency level by value
 * @param {string} value - Urgency level value
 * @returns {object|null} Urgency level object or null
 */
export const getUrgencyLevel = (value) => {
	return urgencyLevels.find((level) => level.value === value) || null;
};

/**
 * Get budget type by value
 * @param {string} value - Budget type value
 * @returns {object|null} Budget type object or null
 */
export const getBudgetType = (value) => {
	return budgetTypes.find((type) => type.value === value) || null;
};

/**
 * Validate job category selection
 * @param {string} category - Main category
 * @param {string} subCategory - Subcategory
 * @returns {object} Validation result
 */
export const validateCategorySelection = (category, subCategory) => {
	const errors = [];

	if (!category) {
		errors.push("Main category is required");
	} else if (!jobCategories.includes(category)) {
		errors.push("Invalid main category selected");
	}

	if (!subCategory) {
		errors.push("Specific service is required");
	} else if (category && !getSubcategoriesForCategory(category).includes(subCategory)) {
		errors.push("Invalid subcategory for selected main category");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

/**
 * Search categories by name or description
 * @param {string} searchTerm - Search term
 * @param {array} categories - Categories to search (from ALL_CATEGORIES)
 * @returns {array} Filtered categories
 */
export const searchCategories = (searchTerm, categories = []) => {
	if (!searchTerm) return categories;

	const term = searchTerm.toLowerCase();
	return categories.filter((cat) => cat.name.toLowerCase().includes(term) || cat.description.toLowerCase().includes(term));
};

/**
 * Group categories by parent for display
 * @param {array} categories - Categories array
 * @returns {object} Grouped categories
 */
export const groupCategoriesByParent = (categories = []) => {
	return categories.reduce((acc, cat) => {
		const parent = cat.parent || "Other";
		if (!acc[parent]) {
			acc[parent] = [];
		}
		acc[parent].push(cat);
		return acc;
	}, {});
};

/**
 * Get trending categories
 * @param {array} categories - Categories array
 * @returns {array} Trending categories only
 */
export const getTrendingCategories = (categories = []) => {
	return categories.filter((cat) => cat.trending);
};

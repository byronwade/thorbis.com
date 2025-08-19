/**
 * Partnership Constants and Configuration
 * Data definitions for business partnerships functionality
 */

export const PARTNERSHIP_TYPES = ["Supplier", "Distributor", "Service Provider", "Government", "Non-Profit", "Technology Partner", "Marketing Partner", "Financial Partner", "Insurance Partner", "Training Partner", "Certification Partner", "Strategic Alliance", "Joint Venture", "Franchise", "Referral Partner", "Other"];

export const PARTNERSHIP_STATUS = {
	PENDING: "pending",
	ACTIVE: "active",
	VERIFIED: "verified",
	REJECTED: "rejected",
	INACTIVE: "inactive",
};

export const VERIFICATION_STATUS = {
	NOT_STARTED: "not_started",
	IN_PROGRESS: "in_progress",
	PENDING: "pending",
	VERIFIED: "verified",
	REJECTED: "rejected",
};

export const STATUS_CONFIG = {
	[VERIFICATION_STATUS.VERIFIED]: {
		variant: "default",
		text: "Verified",
		icon: "CheckCircle",
		color: "text-success",
	},
	[VERIFICATION_STATUS.PENDING]: {
		variant: "secondary",
		text: "Pending",
		icon: "Clock",
		color: "text-primary",
	},
	[VERIFICATION_STATUS.REJECTED]: {
		variant: "destructive",
		text: "Rejected",
		icon: "XCircle",
		color: "text-destructive",
	},
	[VERIFICATION_STATUS.NOT_STARTED]: {
		variant: "outline",
		text: "Not Started",
		icon: "Circle",
		color: "text-muted-foreground",
	},
	[VERIFICATION_STATUS.IN_PROGRESS]: {
		variant: "secondary",
		text: "In Progress",
		icon: "Clock",
		color: "text-primary",
	},
};

export const DEFAULT_VERIFICATION_STEPS = [
	{
		id: "contact_verification",
		title: "Contact Verification",
		description: "Verify partner contact information",
		status: VERIFICATION_STATUS.NOT_STARTED,
		required: true,
	},
	{
		id: "document_verification",
		title: "Document Verification",
		description: "Upload partnership agreement or contract",
		status: VERIFICATION_STATUS.NOT_STARTED,
		required: true,
	},
	{
		id: "reference_check",
		title: "Reference Check",
		description: "Verify partnership references",
		status: VERIFICATION_STATUS.NOT_STARTED,
		required: false,
	},
];

export const SEARCH_CONFIG = {
	DEBOUNCE_DELAY: 300,
	MIN_SEARCH_LENGTH: 2,
	MAX_RESULTS: 10,
	SEARCH_DELAY: 500, // Simulated API delay
};

export const DOCUMENT_UPLOAD_CONFIG = {
	MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
	ALLOWED_TYPES: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/webp"],
	MAX_FILES: 5,
};

export const PARTNERSHIP_BENEFITS = ["Cost Reduction", "Market Access", "Technology Sharing", "Resource Sharing", "Risk Mitigation", "Brand Enhancement", "Customer Acquisition", "Geographic Expansion", "Product Development", "Operational Efficiency"];

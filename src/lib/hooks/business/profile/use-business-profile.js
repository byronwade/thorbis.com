/**
 * useBusinessProfile Hook
 * Manages business profile state, validation, and operations
 * Extracted from the main business profile page for better state management
 */

import { useState, useRef, useCallback } from "react";
import { toast } from "@components/ui/use-toast";
import logger from "@lib/utils/logger";

const initialProfileState = {
	// Basic Information
	name: "Wade's Plumbing & Septic",
	tagline: "Professional Plumbing & Septic Services",
	description: "Family-owned plumbing and septic service company serving the local community for over 15 years. We provide reliable, professional service with a focus on customer satisfaction.",
	logo: "/placeholder.svg",
	coverPhoto: "/placeholder.svg",
	category: "Plumbing",
	phone: "(555) 123-4567",
	email: "info@wadesplumbing.com",
	website: "https://wadesplumbing.com",
	address: "123 Main Street, Anytown, ST 12345",
	serviceAreas: ["Anytown", "Somewhere", "Elsewhere", "Downtown"],
	rating: 4.8,
	reviewCount: 127,
	employees: 12,
	yearEstablished: 2008,

	// Services
	services: [
		{
			id: 1,
			name: "Emergency Plumbing",
			description: "24/7 emergency plumbing services",
			price: "From $150",
			duration: "1-3 hours",
			category: "Emergency",
		},
		{
			id: 2,
			name: "Septic Tank Pumping",
			description: "Professional septic tank cleaning and maintenance",
			price: "$250",
			duration: "2-4 hours",
			category: "Maintenance",
		},
		{
			id: 3,
			name: "Pipe Repair",
			description: "Leak detection and pipe repair services",
			price: "From $100",
			duration: "1-2 hours",
			category: "Repair",
		},
		{
			id: 4,
			name: "Drain Cleaning",
			description: "Professional drain cleaning and unclogging",
			price: "$120",
			duration: "1 hour",
			category: "Maintenance",
		},
	],

	// Business Hours
	hours: {
		monday: { open: "08:00", close: "17:00", closed: false },
		tuesday: { open: "08:00", close: "17:00", closed: false },
		wednesday: { open: "08:00", close: "17:00", closed: false },
		thursday: { open: "08:00", close: "17:00", closed: false },
		friday: { open: "08:00", close: "17:00", closed: false },
		saturday: { open: "09:00", close: "15:00", closed: false },
		sunday: { open: "00:00", close: "00:00", closed: true },
	},

	// Team Members
	teamMembers: [
		{
			id: 1,
			name: "John Doe",
			role: "Master Plumber",
			bio: "20+ years experience in residential and commercial plumbing",
			image: "/placeholder.svg",
		},
		{
			id: 2,
			name: "Jane Smith",
			role: "Septic Specialist",
			bio: "Expert in septic system installation and maintenance",
			image: "/placeholder.svg",
		},
	],

	// Settings
	settings: {
		notifications: {
			email: true,
			sms: false,
			push: true,
			marketing: false,
		},
		privacy: {
			showPhone: true,
			showEmail: false,
			showAddress: true,
			publicProfile: true,
			allowReviews: true,
			showHours: true,
		},
	},

	// Media Gallery
	mediaGallery: [],

	// Other sections data
	verifications: [],
	partnerships: [],
	faqs: [],
	careers: [],
};

export const useBusinessProfile = () => {
	const [profile, setProfile] = useState(initialProfileState);
	const [activeSection, setActiveSection] = useState("overview");
	const [isEditing, setIsEditing] = useState(true);
	const [isClient, setIsClient] = useState(false);
	const [quickAddForm, setQuickAddForm] = useState({
		name: "",
		price: "",
		category: "General",
	});

	// Refs
	const fileInputRef = useRef(null);

	// Validation functions
	const validateProfile = useCallback((profileData) => {
		const errors = [];

		if (!profileData.name.trim()) {
			errors.push("Business name is required");
		}

		if (!profileData.phone.trim()) {
			errors.push("Phone number is required");
		}

		if (!profileData.email.trim()) {
			errors.push("Email address is required");
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
			errors.push("Invalid email address format");
		}

		if (!profileData.address.trim()) {
			errors.push("Business address is required");
		}

		return errors;
	}, []);

	// Save profile function
	const handleSaveProfile = useCallback(async () => {
		const startTime = performance.now();

		try {
			// Validate profile data
			const validationErrors = validateProfile(profile);
			if (validationErrors.length > 0) {
				toast({
					title: "Validation Error",
					description: validationErrors.join(", "),
					variant: "destructive",
				});
				return;
			}

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: "Profile Updated",
				description: "Your business profile has been successfully updated.",
			});

			const saveTime = performance.now() - startTime;
			logger.performance(`Profile save completed in ${saveTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error("Profile save failed:", error);
			toast({
				title: "Save Failed",
				description: "There was an error saving your profile. Please try again.",
				variant: "destructive",
			});
		}
	}, [profile, validateProfile]);

	// Section navigation
	const navigateToSection = useCallback((section) => {
		setActiveSection(section);

		// Log section navigation with robust error handling
		try {
			// More robust logger validation
			if (typeof logger === "object" && logger !== null && typeof logger.interaction === "function") {
				logger.interaction({
					type: "profile_section_navigation",
					section,
					timestamp: Date.now(),
				});
			} else if (typeof logger === "object" && logger !== null && typeof logger.analytics === "function") {
				// Fallback to analytics method if interaction method is not available
				logger.analytics({
					type: "profile_section_navigation",
					section,
					timestamp: Date.now(),
				});
			} else {
				console.log("👆 INTERACTION:", {
					type: "profile_section_navigation",
					section,
					timestamp: Date.now(),
				});
			}
		} catch (error) {
			// Robust error handling - always log the interaction somehow
			console.error("Logger error in useBusinessProfile:", error);
			console.log("👆 INTERACTION (fallback):", {
				type: "profile_section_navigation",
				section,
				timestamp: Date.now(),
				error: error.message,
			});
		}
	}, []);

	// Service management functions
	const addService = useCallback((serviceData) => {
		const newService = {
			id: Date.now(),
			...serviceData,
		};
		setProfile((prev) => ({
			...prev,
			services: [...prev.services, newService],
		}));
	}, []);

	const updateService = useCallback((serviceId, updates) => {
		setProfile((prev) => ({
			...prev,
			services: prev.services.map((service) => (service.id === serviceId ? { ...service, ...updates } : service)),
		}));
	}, []);

	const removeService = useCallback((serviceId) => {
		setProfile((prev) => ({
			...prev,
			services: prev.services.filter((service) => service.id !== serviceId),
		}));
	}, []);

	// Team member management functions
	const addTeamMember = useCallback(() => {
		const newMember = {
			id: Date.now(),
			name: "",
			role: "",
			bio: "",
			image: "/placeholder.svg",
		};
		setProfile((prev) => ({
			...prev,
			teamMembers: [...prev.teamMembers, newMember],
		}));
	}, []);

	const updateTeamMember = useCallback((memberId, field, value) => {
		setProfile((prev) => ({
			...prev,
			teamMembers: prev.teamMembers.map((member) => (member.id === memberId ? { ...member, [field]: value } : member)),
		}));
	}, []);

	const removeTeamMember = useCallback((memberId) => {
		setProfile((prev) => ({
			...prev,
			teamMembers: prev.teamMembers.filter((member) => member.id !== memberId),
		}));
	}, []);

	// File upload handling
	const handleFileUpload = useCallback((files, uploadType) => {
		if (!files || files.length === 0) return;

		// Handle different upload types
		switch (uploadType) {
			case "logo":
				// Handle logo upload
				const logoFile = files[0];
				const logoUrl = URL.createObjectURL(logoFile);
				setProfile((prev) => ({ ...prev, logo: logoUrl }));
				break;

			case "cover":
				// Handle cover photo upload
				const coverFile = files[0];
				const coverUrl = URL.createObjectURL(coverFile);
				setProfile((prev) => ({ ...prev, coverPhoto: coverUrl }));
				break;

			case "media":
				// Handle media gallery upload
				const mediaFiles = Array.from(files);
				const mediaUrls = mediaFiles.map((file) => ({
					url: URL.createObjectURL(file),
					caption: file.name,
					type: file.type,
				}));
				setProfile((prev) => ({
					...prev,
					mediaGallery: [...(prev.mediaGallery || []), ...mediaUrls],
				}));
				break;

			default:
				logger.warn(`Unknown upload type: ${uploadType}`);
		}
	}, []);

	return {
		// State
		profile,
		setProfile,
		activeSection,
		setActiveSection,
		isEditing,
		setIsEditing,
		isClient,
		setIsClient,
		quickAddForm,
		setQuickAddForm,

		// Refs
		fileInputRef,

		// Functions
		handleSaveProfile,
		navigateToSection,
		validateProfile,

		// Service management
		addService,
		updateService,
		removeService,

		// Team management
		addTeamMember,
		updateTeamMember,
		removeTeamMember,

		// File handling
		handleFileUpload,
	};
};

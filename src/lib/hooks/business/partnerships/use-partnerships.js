/**
 * usePartnerships Hook
 * Custom hook for managing partnership state and operations
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "@components/ui/use-toast";
import logger from "@lib/utils/logger";
import { useBusinessStore } from "@store/business";
import { createPartnership, validatePartnership, canStartVerification, generateVerificationId, validateDocumentUpload } from "@lib/business/partnerships";
import { SEARCH_CONFIG, DOCUMENT_UPLOAD_CONFIG, VERIFICATION_STATUS, PARTNERSHIP_STATUS } from "@lib/business/partnerships/constants";

export const usePartnerships = (profile, setProfile) => {
	// Search and UI state
	const [selectedPartnership, setSelectedPartnership] = useState(null);
	const [isAddingPartnership, setIsAddingPartnership] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [showNoResults, setShowNoResults] = useState(false);
	const [editingPartnership, setEditingPartnership] = useState(null);
	const [hoveredPartnership, setHoveredPartnership] = useState(null);
	const [showVerificationSteps, setShowVerificationSteps] = useState(null);

	// Refs
	const fileInputRef = useRef(null);
	const searchTimeoutRef = useRef(null);

	// Business store
	const { filteredBusinesses, initializeWithSupabaseData } = useBusinessStore();

	// Initialize mock data
	useEffect(() => {
		initializeWithSupabaseData();
	}, [initializeWithSupabaseData]);

	/**
	 * Debounced search function
	 */
	const debouncedSearch = useCallback(
		async (query) => {
			const startTime = performance.now();

			if (!query.trim() || query.length < SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
				setSearchResults([]);
				setShowNoResults(false);
				setHasSearched(false);
				return;
			}

			setIsSearching(true);
			setHasSearched(true);

			try {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, SEARCH_CONFIG.SEARCH_DELAY));

				// Search through mock businesses
				const results = filteredBusinesses.filter((business) => business.name.toLowerCase().includes(query.toLowerCase()) || business.description?.toLowerCase().includes(query.toLowerCase()) || business.categories?.some((cat) => cat.toLowerCase().includes(query.toLowerCase()))).slice(0, SEARCH_CONFIG.MAX_RESULTS);

				setSearchResults(results);
				setShowNoResults(results.length === 0);

				const searchTime = performance.now() - startTime;
				logger.performance(`Partnership business search completed in ${searchTime.toFixed(2)}ms`);
				logger.businessMetrics({
					type: "partnership_search",
					query,
					resultsCount: results.length,
					searchTime,
					timestamp: Date.now(),
				});
			} catch (error) {
				logger.error("Partnership search error:", error);
				setSearchResults([]);
				setShowNoResults(true);
				toast({
					title: "Search Error",
					description: "Failed to search businesses. Please try again.",
					variant: "destructive",
				});
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
		}, SEARCH_CONFIG.DEBOUNCE_DELAY);

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchQuery, debouncedSearch]);

	/**
	 * Handle business selection from search
	 */
	const handleBusinessSelect = useCallback(
		(business) => {
			try {
				const newPartnership = createPartnership(business);
				const validatedPartnership = validatePartnership(newPartnership);

				setProfile((prev) => ({
					...prev,
					partnerships: [...prev.partnerships, validatedPartnership],
				}));

				setIsAddingPartnership(false);
				setSearchQuery("");
				setSearchResults([]);
				setHasSearched(false);
				setShowNoResults(false);

				logger.businessMetrics({
					type: "partnership_added",
					partnershipName: business.name,
					partnershipType: newPartnership.type,
					timestamp: Date.now(),
				});

				toast({
					title: "Partnership Added",
					description: `${business.name} has been added as a partnership.`,
				});
			} catch (error) {
				logger.error("Failed to add partnership:", error);
				toast({
					title: "Error Adding Partnership",
					description: "Failed to add partnership. Please try again.",
					variant: "destructive",
				});
			}
		},
		[setProfile]
	);

	/**
	 * Add new partnership
	 */
	const addPartnership = useCallback(() => {
		setIsAddingPartnership(true);
		setSearchQuery("");
		setSearchResults([]);
		setHasSearched(false);
		setShowNoResults(false);
	}, []);

	/**
	 * Remove partnership
	 */
	const removePartnership = useCallback(
		(partnershipId) => {
			const partnership = profile.partnerships.find((p) => p.id === partnershipId);

			setProfile((prev) => ({
				...prev,
				partnerships: prev.partnerships.filter((partner) => partner.id !== partnershipId),
			}));

			logger.businessMetrics({
				type: "partnership_removed",
				partnershipId,
				partnershipName: partnership?.name,
				timestamp: Date.now(),
			});

			toast({
				title: "Partnership Removed",
				description: "The partnership has been removed from your profile.",
			});
		},
		[profile.partnerships, setProfile]
	);

	/**
	 * Update partnership field
	 */
	const updatePartnership = useCallback(
		(partnershipId, field, value) => {
			setProfile((prev) => ({
				...prev,
				partnerships: prev.partnerships.map((partner) => (partner.id === partnershipId ? { ...partner, [field]: value } : partner)),
			}));

			logger.businessMetrics({
				type: "partnership_updated",
				partnershipId,
				field,
				timestamp: Date.now(),
			});
		},
		[setProfile]
	);

	/**
	 * Start verification process
	 */
	const startVerification = useCallback(
		(partnership) => {
			if (!canStartVerification(partnership)) {
				toast({
					title: "Cannot Start Verification",
					description: "Please complete all required steps before starting verification.",
					variant: "destructive",
				});
				return;
			}

			setSelectedPartnership(partnership);

			// Update verification status
			updatePartnership(partnership.id, "verification", {
				...partnership.verification,
				status: VERIFICATION_STATUS.IN_PROGRESS,
				submittedDate: new Date().toISOString(),
			});

			logger.businessMetrics({
				type: "partnership_verification_started",
				partnershipId: partnership.id,
				partnershipName: partnership.name,
				timestamp: Date.now(),
			});

			toast({
				title: "Verification Started",
				description: `Verification process started for ${partnership.name}`,
			});
		},
		[updatePartnership]
	);

	/**
	 * Handle document upload
	 */
	const handleDocumentUpload = useCallback(
		(e) => {
			const files = Array.from(e.target.files);

			if (!selectedPartnership) {
				toast({
					title: "No Partnership Selected",
					description: "Please select a partnership before uploading documents.",
					variant: "destructive",
				});
				return;
			}

			// Validate files
			const validFiles = [];
			const errors = [];

			files.forEach((file) => {
				const validation = validateDocumentUpload(file, DOCUMENT_UPLOAD_CONFIG.MAX_FILE_SIZE, DOCUMENT_UPLOAD_CONFIG.ALLOWED_TYPES);

				if (validation.isValid) {
					validFiles.push(file);
				} else {
					errors.push(`${file.name}: ${validation.errors.join(", ")}`);
				}
			});

			if (errors.length > 0) {
				toast({
					title: "Upload Validation Failed",
					description: errors.join("\n"),
					variant: "destructive",
				});
				return;
			}

			if (validFiles.length === 0) {
				return;
			}

			// Create document objects
			const newDocuments = validFiles.map((file, index) => ({
				id: Date.now() + index,
				name: file.name,
				size: file.size,
				type: file.type,
				uploadDate: new Date().toISOString(),
				status: "pending",
			}));

			// Update partnership with new documents
			setProfile((prev) => ({
				...prev,
				partnerships: prev.partnerships.map((partner) =>
					partner.id === selectedPartnership.id
						? {
								...partner,
								verification: {
									...partner.verification,
									documents: [...(partner.verification?.documents || []), ...newDocuments],
								},
							}
						: partner
				),
			}));

			logger.businessMetrics({
				type: "partnership_documents_uploaded",
				partnershipId: selectedPartnership.id,
				documentCount: validFiles.length,
				totalSize: validFiles.reduce((total, file) => total + file.size, 0),
				timestamp: Date.now(),
			});

			toast({
				title: "Documents Uploaded",
				description: `${validFiles.length} document(s) uploaded successfully.`,
			});
		},
		[selectedPartnership, setProfile]
	);

	/**
	 * Complete verification
	 */
	const completeVerification = useCallback(() => {
		if (!selectedPartnership) return;

		const verificationId = generateVerificationId();

		setProfile((prev) => ({
			...prev,
			partnerships: prev.partnerships.map((partner) =>
				partner.id === selectedPartnership.id
					? {
							...partner,
							status: PARTNERSHIP_STATUS.VERIFIED,
							verification: {
								...partner.verification,
								status: VERIFICATION_STATUS.VERIFIED,
								verifiedDate: new Date().toISOString(),
								verificationId,
							},
						}
					: partner
			),
		}));

		logger.businessMetrics({
			type: "partnership_verification_completed",
			partnershipId: selectedPartnership.id,
			partnershipName: selectedPartnership.name,
			verificationId,
			timestamp: Date.now(),
		});

		setSelectedPartnership(null);
		toast({
			title: "Verification Complete",
			description: `${selectedPartnership.name} partnership has been verified successfully.`,
		});
	}, [selectedPartnership, setProfile]);

	/**
	 * Update verification step
	 */
	const updateVerificationStep = useCallback(
		(partnershipId, stepId, status) => {
			setProfile((prev) => ({
				...prev,
				partnerships: prev.partnerships.map((partner) =>
					partner.id === partnershipId
						? {
								...partner,
								verification: {
									...partner.verification,
									steps: partner.verification.steps.map((step) =>
										step.id === stepId
											? {
													...step,
													status,
													completedDate: status === VERIFICATION_STATUS.VERIFIED ? new Date().toISOString() : step.completedDate,
												}
											: step
									),
								},
							}
						: partner
				),
			}));

			logger.businessMetrics({
				type: "partnership_verification_step_updated",
				partnershipId,
				stepId,
				status,
				timestamp: Date.now(),
			});
		},
		[setProfile]
	);

	return {
		// State
		selectedPartnership,
		setSelectedPartnership,
		isAddingPartnership,
		setIsAddingPartnership,
		isSearching,
		searchQuery,
		setSearchQuery,
		searchResults,
		hasSearched,
		showNoResults,
		editingPartnership,
		setEditingPartnership,
		hoveredPartnership,
		setHoveredPartnership,
		showVerificationSteps,
		setShowVerificationSteps,

		// Refs
		fileInputRef,

		// Actions
		handleBusinessSelect,
		addPartnership,
		removePartnership,
		updatePartnership,
		startVerification,
		handleDocumentUpload,
		completeVerification,
		updateVerificationStep,
	};
};

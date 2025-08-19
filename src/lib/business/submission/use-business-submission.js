/**
 * useBusinessSubmission Hook
 * Manages business submission form state, validation, and operations
 * Extracted from BusinessSubmissionForm for better separation of concerns
 */

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@context/auth-context";
import { SecureStorage } from "@utils/secure-storage";
import logger from "@lib/utils/logger";
import { businessSubmissionSchema, basicInfoSchema, contactInfoSchema, businessDetailsSchema, ownerInfoSchema } from "@lib/data/business/submission/schema";
import { DAYS_OF_WEEK, COMMON_AMENITIES, PAYMENT_METHODS, AUTO_SAVE_CONFIG, UPLOAD_CONSTRAINTS } from "@lib/data/business/submission/constants";

export const useBusinessSubmission = () => {
	const { user } = useAuth();
	const router = useRouter();

	// Form state
	const [selectedAmenities, setSelectedAmenities] = useState([]);
	const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
	const [uploadedImages, setUploadedImages] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [progress, setProgress] = useState(0);

	// Form setup with validation
	const form = useForm({
		resolver: zodResolver(businessSubmissionSchema),
		mode: "onChange",
		defaultValues: {
			businessName: "",
			description: "",
			category: "",
			subcategory: "",
			address: "",
			city: "",
			state: "",
			zipCode: "",
			phone: "",
			email: "",
			website: "",
			yearEstablished: "",
			employeeCount: "",
			priceRange: "$$",
			hours: DAYS_OF_WEEK.map((day) => ({
				day,
				open: "09:00",
				close: "17:00",
				closed: false,
			})),
			specialties: [],
			amenities: [],
			paymentMethods: [],
			ownerName: user?.name || "",
			ownerEmail: user?.email || "",
			ownerPhone: "",
			businessLicenseNumber: "",
			taxId: "",
			legalConfirmation: false,
		},
	});

	const {
		handleSubmit,
		formState: { errors, isValid },
		watch,
		setValue,
		trigger,
	} = form;

	// Specialty fields array management
	const {
		fields: specialtyFields,
		append: appendSpecialty,
		remove: removeSpecialty,
	} = useFieldArray({
		control: form.control,
		name: "specialties",
	});

	// Watch for form changes for auto-save
	const watchedValues = watch();

	// Auto-save draft to secure storage
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (watchedValues.businessName || watchedValues.description) {
				SecureStorage.setItem(
					AUTO_SAVE_CONFIG.STORAGE_KEY,
					{
						...watchedValues,
						amenities: selectedAmenities,
						paymentMethods: selectedPaymentMethods,
					},
					{
						encrypt: true,
						expiry: AUTO_SAVE_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000,
					}
				);
			}
		}, AUTO_SAVE_CONFIG.DELAY_MS);

		return () => clearTimeout(timeoutId);
	}, [watchedValues, selectedAmenities, selectedPaymentMethods]);

	// Load draft on component mount
	useEffect(() => {
		const draft = SecureStorage.getItem(AUTO_SAVE_CONFIG.STORAGE_KEY);
		if (draft) {
			Object.keys(draft).forEach((key) => {
				if (draft[key] !== undefined && draft[key] !== "") {
					setValue(key, draft[key]);
				}
			});
			setSelectedAmenities(draft.amenities || []);
			setSelectedPaymentMethods(draft.paymentMethods || []);
		}
	}, [setValue]);

	// Image upload handling
	const handleImageUpload = useCallback((event) => {
		const files = Array.from(event.target.files);

		const validFiles = files.filter((file) => {
			if (file.size > UPLOAD_CONSTRAINTS.MAX_FILE_SIZE) {
				toast.error(`${file.name} is too large. Maximum size is 5MB.`);
				return false;
			}
			if (!UPLOAD_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
				toast.error(`${file.name} is not a supported image type.`);
				return false;
			}
			return true;
		});

		setUploadedImages((prev) => [...prev, ...validFiles].slice(0, UPLOAD_CONSTRAINTS.MAX_FILES));
	}, []);

	// Remove uploaded image
	const removeImage = useCallback((indexToRemove) => {
		setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
	}, []);

	// Amenity management
	const toggleAmenity = useCallback(
		(amenity) => {
			setSelectedAmenities((prev) => {
				const newAmenities = prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity];
				setValue("amenities", newAmenities);
				return newAmenities;
			});
		},
		[setValue]
	);

	// Payment method management
	const togglePaymentMethod = useCallback(
		(method) => {
			setSelectedPaymentMethods((prev) => {
				const newMethods = prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method];
				setValue("paymentMethods", newMethods);
				return newMethods;
			});
		},
		[setValue]
	);

	// Specialty management
	const addSpecialty = useCallback(() => {
		appendSpecialty({ name: "", description: "" });
	}, [appendSpecialty]);

	const removeSpecialtyItem = useCallback(
		(index) => {
			removeSpecialty(index);
		},
		[removeSpecialty]
	);

	// Section validation
	const validateSection = useCallback(
		async (sectionName) => {
			let schema;
			let fields;

			switch (sectionName) {
				case "basic":
					schema = basicInfoSchema;
					fields = ["businessName", "description", "category"];
					break;
				case "contact":
					schema = contactInfoSchema;
					fields = ["address", "city", "state", "zipCode", "phone", "email"];
					break;
				case "details":
					schema = businessDetailsSchema;
					fields = ["priceRange", "hours"];
					break;
				case "owner":
					schema = ownerInfoSchema;
					fields = ["ownerName", "ownerEmail", "legalConfirmation"];
					break;
				default:
					return true;
			}

			try {
				const currentValues = form.getValues();
				await schema.parseAsync(currentValues);
				return true;
			} catch (error) {
				// Trigger validation for specific fields to show errors
				await trigger(fields);
				return false;
			}
		},
		[form, trigger]
	);

	// Form submission
	const onSubmit = useCallback(
		async (data) => {
			const startTime = performance.now();
			setIsSubmitting(true);
			setProgress(10);

			try {
				// Log submission attempt
				logger.businessMetrics({
					type: "business_submission_attempt",
					businessName: data.businessName,
					category: data.category,
					timestamp: Date.now(),
				});

				setProgress(30);

				// Prepare form data
				const formData = new FormData();

				// Add text data
				Object.keys(data).forEach((key) => {
					if (key === "hours" || key === "specialties") {
						formData.append(key, JSON.stringify(data[key]));
					} else {
						formData.append(key, data[key]);
					}
				});

				// Add amenities and payment methods
				formData.append("amenities", JSON.stringify(selectedAmenities));
				formData.append("paymentMethods", JSON.stringify(selectedPaymentMethods));

				setProgress(50);

				// Add images
				uploadedImages.forEach((image, index) => {
					formData.append(`image_${index}`, image);
				});

				setProgress(70);

				// Submit to API
				const response = await fetch("/api/business/submit", {
					method: "POST",
					body: formData,
				});

				setProgress(90);

				if (!response.ok) {
					throw new Error(`Submission failed: ${response.statusText}`);
				}

				const result = await response.json();

				setProgress(100);

				// Clear draft on successful submission
				SecureStorage.removeItem(AUTO_SAVE_CONFIG.STORAGE_KEY);

				const submissionTime = performance.now() - startTime;
				logger.performance(`Business submission completed in ${submissionTime.toFixed(2)}ms`);

				// Log successful submission
				logger.businessMetrics({
					type: "business_submission_success",
					businessId: result.businessId,
					businessName: data.businessName,
					category: data.category,
					submissionTime,
					timestamp: Date.now(),
				});

				toast.success("Business submitted successfully! We'll review it and get back to you soon.");

				// Redirect to success page or dashboard
				router.push(`/dashboard/business/submission-success?id=${result.businessId}`);
			} catch (error) {
				logger.error("Business submission failed:", error);

				// Log failed submission
				logger.businessMetrics({
					type: "business_submission_error",
					businessName: data.businessName,
					category: data.category,
					error: error.message,
					timestamp: Date.now(),
				});

				toast.error(error.message || "Submission failed. Please try again.");
			} finally {
				setIsSubmitting(false);
				setProgress(0);
			}
		},
		[selectedAmenities, selectedPaymentMethods, uploadedImages, router]
	);

	// Progress calculation
	const calculateProgress = useCallback(() => {
		const values = form.getValues();
		let completed = 0;
		const total = 8; // Number of required sections

		if (values.businessName) completed++;
		if (values.description) completed++;
		if (values.category) completed++;
		if (values.address && values.city && values.state) completed++;
		if (values.phone && values.email) completed++;
		if (values.priceRange) completed++;
		if (values.ownerName && values.ownerEmail) completed++;
		if (values.legalConfirmation) completed++;

		return Math.round((completed / total) * 100);
	}, [form]);

	return {
		// Form state and methods
		form,
		handleSubmit: handleSubmit(onSubmit),
		errors,
		isValid,
		watch,
		setValue,

		// Specialty management
		specialtyFields,
		addSpecialty,
		removeSpecialtyItem,

		// File upload
		uploadedImages,
		handleImageUpload,
		removeImage,

		// Amenities and payment methods
		selectedAmenities,
		selectedPaymentMethods,
		toggleAmenity,
		togglePaymentMethod,

		// Submission state
		isSubmitting,
		progress: isSubmitting ? progress : calculateProgress(),

		// Validation
		validateSection,

		// Constants for components
		constants: {
			COMMON_AMENITIES,
			PAYMENT_METHODS,
			DAYS_OF_WEEK,
			UPLOAD_CONSTRAINTS,
		},
	};
};

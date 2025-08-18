"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, MapPin, Mic, X, Clock, TrendingUp, Star, Shield, CheckCircle, ArrowRight, ChevronDown, MicOff, Plus, Image, FileText, Camera, Upload, Send, Home, Heart, ShoppingBag } from "react-feather";
import { Bot, Sparkles, Loader2, Car, Utensils, Building2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@components/ui/dropdown-menu";
import LocationDropdown from "@components/shared/searchBox/location-dropdown";
import BusinessCard from "@components/shared/searchBox/business-card";
import UnifiedAIChat from "@components/shared/ai/unified-ai-chat";
import { useSearchStore } from "@store/search";
import { algoliaIndex } from "@lib/algolia-client";
import { useDragDrop } from "@hooks/use-drag-drop";
import ImageGrid from "./image-grid";

export default function HeroSection() {
	const { searchQuery, setSearchQuery, location, setLocation, recentSearches, popularSearches, addRecentSearch, loadRecentSearches } = useSearchStore();

	// Enhanced file upload state
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [uploadProgress, setUploadProgress] = useState({});
	const [uploadErrors, setUploadErrors] = useState({});

	const [autocompleteOpen, setAutocompleteOpen] = useState(false);
	const [businessSuggestions, setBusinessSuggestions] = useState([]);
	const [aiMode, setAiMode] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [recognition, setRecognition] = useState(null);
	const [loading, setLoading] = useState(false);

	// Enhanced search UX state (based on modern search UX best practices)
	const [searchIntent, setSearchIntent] = useState("explore"); // 'explore', 'specific', 'category'
	const [searchSuggestions, setSearchSuggestions] = useState([]);
	const [categorySuggestions, setCategorySuggestions] = useState([]);
	const [trendingSearches, setTrendingSearches] = useState([]);
	const [queryCorrection, setQueryCorrection] = useState(null);
	const [searchFocus, setSearchFocus] = useState(false);
	const [searchHistory, setSearchHistory] = useState([]);
	const [isVoiceSupported, setIsVoiceSupported] = useState(false);
	const [smartFilters, setSmartFilters] = useState({
		category: null,
		priceRange: null,
		rating: null,
		distance: null,
		openNow: false,
	});

	const searchRef = useRef(null);
	const inputRef = useRef(null);
	const fileInputRef = useRef(null);
	const aiChatRef = useRef(null);

	// Enhanced search data with rich context (following modern search UX patterns)
	const popularCategories = [
		{ name: "Restaurants", icon: Utensils, count: "12,450", query: "restaurants", avgRating: 4.3, trending: true },
		{ name: "Home Services", icon: Home, count: "8,230", query: "home services", avgRating: 4.5, trending: false },
		{ name: "Auto Repair", icon: Car, count: "3,450", query: "auto repair", avgRating: 4.2, trending: false },
		{ name: "Beauty & Spa", icon: Heart, count: "5,890", query: "beauty spa", avgRating: 4.6, trending: true },
		{ name: "Healthcare", icon: Building2, count: "4,320", query: "healthcare", avgRating: 4.4, trending: false },
		{ name: "Shopping", icon: ShoppingBag, count: "6,780", query: "shopping", avgRating: 4.1, trending: true },
	];

	// Smart search suggestions with rich previews
	const smartSearchSuggestions = [
		{
			type: "trending",
			title: "Best Coffee Shops",
			subtitle: "Trending in your area",
			count: "127 results",
			icon: Utensils,
			query: "coffee shops",
		},
		{
			type: "personalized",
			title: "Italian Restaurants",
			subtitle: "Based on your recent searches",
			count: "43 results",
			icon: Utensils,
			query: "italian restaurants",
		},
		{
			type: "location",
			title: "Nearby Services",
			subtitle: "Within 2 miles",
			count: "89 results",
			icon: MapPin,
			query: "services near me",
		},
	];

	// Query correction patterns (like Google's "Did you mean?")
	const queryCorrections = {
		resturant: "restaurant",
		plumer: "plumber",
		elecrtician: "electrician",
		vetrinarian: "veterinarian",
		pharamcy: "pharmacy",
	};

	// Trust indicators
	const trustStats = [
		{ value: "50K+", label: "Verified Businesses", icon: Shield },
		{ value: "2.3M+", label: "Customer Reviews", icon: Star },
		{ value: "99.8%", label: "Satisfaction Rate", icon: CheckCircle },
	];

	// Initialize voice search on component mount (moved before useEffect to fix hoisting issue)
	const initializeVoiceSearch = useCallback(() => {
		if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			const recognition = new SpeechRecognition();

			recognition.continuous = false;
			recognition.interimResults = false;
			recognition.lang = "en-US";

			recognition.onstart = () => {
				setIsListening(true);
			};

			recognition.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setSearchQuery(transcript);
				setIsListening(false);
				// Trigger autocomplete manually without depending on handleInputChange
				setAutocompleteOpen(true);
			};

			recognition.onerror = (event) => {
				console.error("Voice recognition error:", event.error);
				setIsListening(false);
			};

			recognition.onend = () => {
				setIsListening(false);
			};

			setRecognition(recognition);
			setIsVoiceSupported(true);
		}
	}, [setSearchQuery, setAutocompleteOpen]);

	// Load search history from localStorage (moved before useEffect)
	const loadSearchHistory = useCallback(() => {
		try {
			const history = localStorage.getItem("searchHistory");
			if (history) {
				setSearchHistory(JSON.parse(history).slice(0, 5)); // Last 5 searches
			}
		} catch (error) {
			console.error("Error loading search history:", error);
		}
	}, []);

	// Load trending searches (moved before useEffect)
	const loadTrendingSearches = useCallback(() => {
		setTrendingSearches(["Italian restaurants near me", "Best coffee shops", "Hair salons", "Auto repair shops", "Emergency plumbers"]);
	}, []);

	// Initialize enhanced search features
	useEffect(() => {
		loadRecentSearches();
		initializeVoiceSearch();
		loadSearchHistory();
		loadTrendingSearches();
	}, [loadRecentSearches, initializeVoiceSearch, loadSearchHistory, loadTrendingSearches]);

	// Initialize speech recognition
	useEffect(() => {
		if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			const rec = new SpeechRecognition();
			rec.continuous = false;
			rec.interimResults = false;
			rec.lang = "en-US";

			rec.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setSearchQuery(transcript);
				setIsListening(false);
				if (!aiMode) {
					setAutocompleteOpen(true);
					fetchBusinessSuggestions(transcript);
				}
			};

			rec.onerror = () => setIsListening(false);
			rec.onend = () => setIsListening(false);

			setRecognition(rec);
		}
	}, [setSearchQuery, aiMode]);

	// Click outside handler
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchRef.current && !searchRef.current.contains(event.target)) {
				setAutocompleteOpen(false);
				if (aiMode) setAiMode(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [aiMode]);

	// Fetch business suggestions from Algolia
	const fetchBusinessSuggestions = async (query) => {
		if (!query.trim()) return;
		try {
			const { hits } = await algoliaIndex.search(query, { hitsPerPage: 5 });
			setBusinessSuggestions(hits);
		} catch (error) {
			console.error("Error fetching business suggestions:", error);
		}
	};

	// Enhanced input handling with search intent detection and smart suggestions
	const handleInputChange = (e) => {
		const value = e.target.value;
		setSearchQuery(value);

		// Detect search intent based on query patterns
		detectSearchIntent(value);

		// Check for query corrections
		checkQueryCorrection(value);

		if (value.trim() && !aiMode) {
			setAutocompleteOpen(true);
			// Fetch both business suggestions and smart suggestions
			fetchBusinessSuggestions(value);
			generateSmartSuggestions(value);
		} else if (!value.trim()) {
			setAutocompleteOpen(false);
			setBusinessSuggestions([]);
			setSearchSuggestions([]);
			setQueryCorrection(null);
		}
	};

	// Detect user intent (specific business, category exploration, location-based)
	const detectSearchIntent = (query) => {
		const trimmedQuery = query.trim().toLowerCase();

		// Specific business patterns (contains business name indicators)
		if (trimmedQuery.includes("near me") || trimmedQuery.includes("in ") || trimmedQuery.includes("on ")) {
			setSearchIntent("location");
		}
		// Category exploration patterns
		else if (popularCategories.some((cat) => trimmedQuery.includes(cat.name.toLowerCase()))) {
			setSearchIntent("category");
		}
		// Specific business search (contains specific identifiers)
		else if (trimmedQuery.length > 15 || /\d/.test(trimmedQuery)) {
			setSearchIntent("specific");
		}
		// Default to exploration
		else {
			setSearchIntent("explore");
		}
	};

	// Check for query corrections (like Google's "Did you mean?")
	const checkQueryCorrection = (query) => {
		const words = query.toLowerCase().split(" ");
		for (const word of words) {
			if (queryCorrections[word]) {
				const correctedQuery = query.toLowerCase().replace(word, queryCorrections[word]);
				setQueryCorrection({
					original: query,
					suggested: correctedQuery,
					word: word,
					correction: queryCorrections[word],
				});
				return;
			}
		}
		setQueryCorrection(null);
	};

	// Generate smart suggestions based on query and context
	const generateSmartSuggestions = (query) => {
		const suggestions = [];
		const trimmedQuery = query.trim().toLowerCase();

		// Add trending suggestions if query matches
		smartSearchSuggestions.forEach((suggestion) => {
			if (suggestion.title.toLowerCase().includes(trimmedQuery) || suggestion.query.toLowerCase().includes(trimmedQuery)) {
				suggestions.push(suggestion);
			}
		});

		// Add category-based suggestions
		popularCategories.forEach((category) => {
			if (category.name.toLowerCase().includes(trimmedQuery)) {
				suggestions.push({
					type: "category",
					title: category.name,
					subtitle: `${category.count} businesses • ${category.avgRating}★ avg`,
					count: category.count,
					icon: category.icon,
					query: category.query,
					trending: category.trending,
				});
			}
		});

		setSearchSuggestions(suggestions.slice(0, 6)); // Limit to 6 suggestions
	};

	// Enhanced voice search with modern UX patterns
	const handleVoiceSearch = () => {
		if (!recognition) {
			initializeVoiceSearch();
			return;
		}

		if (isListening) {
			recognition.stop();
			setIsListening(false);
		} else {
			recognition.start();
			setIsListening(true);
		}
	};

	// Enhanced focus handling with modern UX patterns
	const handleSearchFocus = () => {
		setSearchFocus(true);
		setAutocompleteOpen(true);

		// Load search history and trending searches on focus
		if (!searchQuery.trim()) {
			loadSearchHistory();
			loadTrendingSearches();
		}
	};

	const handleSearchBlur = () => {
		// Delay blur to allow for suggestion clicks
		setTimeout(() => {
			setSearchFocus(false);
		}, 150);
	};

	// Save search to history
	const saveToSearchHistory = (query) => {
		try {
			let history = [];
			const stored = localStorage.getItem("searchHistory");
			if (stored) {
				history = JSON.parse(stored);
			}

			// Remove if already exists
			history = history.filter((item) => item !== query);
			// Add to beginning
			history.unshift(query);
			// Keep only last 10
			history = history.slice(0, 10);

			localStorage.setItem("searchHistory", JSON.stringify(history));
			setSearchHistory(history.slice(0, 5));
		} catch (error) {
			console.error("Error saving search history:", error);
		}
	};

	// Toggle AI mode
	const toggleAiMode = useCallback(
		(e) => {
			if (e) e.preventDefault();
			setAiMode((prev) => {
				const newAiMode = !prev;
				setAutocompleteOpen(newAiMode);
				setSearchQuery("");
				// Focus input after toggling without scrolling
				setTimeout(() => {
					if (inputRef.current) {
						inputRef.current.focus({ preventScroll: true });
					}
				}, 50);
				return newAiMode;
			});
		},
		[setSearchQuery, setAutocompleteOpen]
	);

	// Keyboard shortcut handler
	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				toggleAiMode();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [toggleAiMode]);

	// Enhanced search submission with history tracking
	const handleSearch = (e) => {
		e.preventDefault();

		if (aiMode && searchQuery.trim() && typeof window !== "undefined" && window.handleAIInput) {
			window.handleAIInput(searchQuery);
			setSearchQuery("");
			return;
		}

		if (searchQuery.trim()) {
			setLoading(true);
			const trimmedQuery = searchQuery.trim();

			// Save to both recent searches (store) and search history (localStorage)
			addRecentSearch(trimmedQuery);
			saveToSearchHistory(trimmedQuery);

			const queryString = new URLSearchParams({
				q: trimmedQuery,
				location: location.value || "",
			}).toString();
			window.location.href = `/search?${queryString}`;
		}
	};

	// Enhanced suggestion selection with search history
	const handleSuggestionSelect = (suggestion) => {
		const searchText = suggestion.text || suggestion.query || suggestion.name || suggestion;
		setSearchQuery(searchText);
		setAutocompleteOpen(false);

		// Save to both recent searches (store) and search history (localStorage)
		addRecentSearch(searchText);
		saveToSearchHistory(searchText);

		const queryString = new URLSearchParams({
			q: searchText,
			location: location.value || "",
		}).toString();
		window.location.href = `/search?${queryString}`;
	};

	// Enhanced file upload with validation and progress tracking
	const handleFileUpload = (files) => {
		const allowedTypes = ["image/", "application/pdf", "text/", "application/msword", "application/vnd.openxmlformats-officedocument"];
		const maxFileSize = 10 * 1024 * 1024; // 10MB
		const maxFiles = 5;

		// Check if we're at the file limit
		if (uploadedFiles.length + files.length > maxFiles) {
			setUploadErrors({ general: `Maximum ${maxFiles} files allowed` });
			return;
		}

		const validFiles = [];
		const errors = {};

		Array.from(files).forEach((file, index) => {
			const fileId = `${Date.now()}_${index}`;

			// Validate file type
			if (!allowedTypes.some((type) => file.type.startsWith(type))) {
				errors[fileId] = `${file.name}: Unsupported file type`;
				return;
			}

			// Validate file size
			if (file.size > maxFileSize) {
				errors[fileId] = `${file.name}: File too large (max 10MB)`;
				return;
			}

			// Add file with metadata
			validFiles.push({
				id: fileId,
				file,
				name: file.name,
				size: file.size,
				type: file.type,
				preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
				uploaded: false,
			});

			// Start upload progress simulation
			setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
			simulateUpload(fileId);
		});

		if (Object.keys(errors).length > 0) {
			setUploadErrors(errors);
			// Clear errors after 5 seconds
			setTimeout(() => setUploadErrors({}), 5000);
		}

		if (validFiles.length > 0) {
			setUploadedFiles((prev) => [...prev, ...validFiles]);

			// Auto-activate AI mode when files are uploaded
			if (!aiMode) {
				setAiMode(true);
				setAutocompleteOpen(true);
			}

			// Pass files to AI chat if available
			if (aiChatRef.current) {
				aiChatRef.current.handleFileUpload(validFiles.map((f) => f.file));
			}
		}
	};

	// Simulate upload progress
	const simulateUpload = (fileId) => {
		let progress = 0;
		const interval = setInterval(() => {
			progress += Math.random() * 30;
			if (progress >= 100) {
				progress = 100;
				clearInterval(interval);
				// Mark file as uploaded
				setUploadedFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, uploaded: true } : file)));
				// Remove progress tracking
				setUploadProgress((prev) => {
					const { [fileId]: _, ...rest } = prev;
					return rest;
				});
			}
			setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
		}, 100);
	};

	// Remove uploaded file
	const removeFile = (fileId) => {
		setUploadedFiles((prev) => {
			const updatedFiles = prev.filter((file) => file.id !== fileId);
			// Clean up preview URLs
			const fileToRemove = prev.find((file) => file.id === fileId);
			if (fileToRemove?.preview) {
				URL.revokeObjectURL(fileToRemove.preview);
			}
			return updatedFiles;
		});

		// Clean up progress and errors
		setUploadProgress((prev) => {
			const { [fileId]: _, ...rest } = prev;
			return rest;
		});
		setUploadErrors((prev) => {
			const { [fileId]: _, ...rest } = prev;
			return rest;
		});
	};

	// Initialize drag and drop functionality
	const { isDraggingOver, dragHandlers } = useDragDrop(
		(files) => {
			// Auto-activate AI mode when files are dragged over
			if (!aiMode) {
				setAiMode(true);
				setAutocompleteOpen(true);
			}
			handleFileUpload(files);
		},
		["image/", "text/", "application/"]
	);

	// Auto-activate AI mode when dragging over (even before drop)
	useEffect(() => {
		if (isDraggingOver && !aiMode) {
			setAiMode(true);
			setAutocompleteOpen(true);
		}
	}, [isDraggingOver, aiMode]);

	// Cleanup file previews on unmount
	useEffect(() => {
		return () => {
			uploadedFiles.forEach((file) => {
				if (file.preview) {
					URL.revokeObjectURL(file.preview);
				}
			});
		};
	}, [uploadedFiles]);

	const triggerFileUpload = () => {
		fileInputRef.current?.click();
	};

	const handleFileSelect = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			handleFileUpload(e.target.files);
		}
	};

	return (
		<section className="relative w-full min-h-screen overflow-hidden">
			{/* Enhanced layered background */}
			<div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black"></div>
			<div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 via-transparent to-purple-950/20"></div>

			{/* Animated geometric shapes */}
			<div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
			<div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

			<ImageGrid />

			<div className="relative z-10 px-6 lg:px-32 py-20 lg:py-32">
				<div className="max-w-8xl mx-auto space-y-20">
					{/* Enhanced Hero Content */}
					<div className="space-y-16">
						{/* Enhanced Badge */}
						<div className="flex justify-center animate-fade-in">
							<div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
								<Sparkles className="w-4 h-4 text-blue-400" />
								<span className="text-white font-medium">50,000+ Verified Businesses</span>
							</div>
						</div>

						{/* Enhanced Typography */}
						<div className="text-center space-y-8">
							<h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] animate-slide-up animation-delay-200">
								<span className="block text-white">Find the Best Local</span>
								<span className="block text-primary text-6xl md:text-7xl lg:text-8xl mt-2 font-extrabold relative">
									Businesses
									<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-blue-500 rounded-full scale-x-0 origin-center" style={{ animation: "scaleX 1s ease-out 1.5s forwards" }}></div>
								</span>
								<span className="block text-2xl md:text-3xl lg:text-4xl font-normal text-gray-400 mt-4">Near You</span>
							</h1>

							{/* Enhanced Subheading */}
							<p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-400">Read real reviews, compare prices, and book services instantly</p>
						</div>
					</div>

					{/* Advanced Search Interface with Modern UX */}
					<div className="relative max-w-4xl mx-auto mb-20" ref={searchRef}>
						{/* Search Intent Indicator */}
						{searchFocus && (
							<div className="absolute -top-8 left-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
								{searchIntent === "location" && "📍 Location-based search"}
								{searchIntent === "category" && "🏷️ Category exploration"}
								{searchIntent === "specific" && "🔍 Specific business search"}
								{searchIntent === "explore" && "✨ Discover businesses"}
							</div>
						)}

						<form
							className={`relative flex items-center w-full backdrop-blur-xl border-2 transition-all duration-300 ${
								searchFocus
									? "bg-white/95 dark:bg-neutral-900/95 border-blue-500 dark:border-blue-400 shadow-2xl shadow-blue-500/20 rounded-2xl scale-[1.02]"
									: aiMode
										? "bg-white/90 dark:bg-neutral-950/90 border-blue-500/60 dark:border-blue-400/60 shadow-xl shadow-blue-500/10 rounded-2xl"
										: isDraggingOver
											? "bg-white/95 dark:bg-neutral-950/95 border-blue-500 border-dashed shadow-xl shadow-blue-500/10 scale-[1.01] rounded-2xl"
											: "bg-white/80 dark:bg-neutral-950/80 border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white/95 dark:hover:bg-neutral-950/95 hover:border-neutral-300/80 dark:hover:border-neutral-700/80 rounded-2xl hover:shadow-xl hover:scale-[1.01]"
							}`}
							onSubmit={handleSearch}
							{...dragHandlers}
						>
							{/* Enhanced Drag Overlay */}
							{isDraggingOver && (
								<div className="absolute inset-0 bg-gradient-to-r from-blue-50/90 via-purple-50/90 to-blue-50/90 dark:from-blue-950/90 dark:via-purple-950/90 dark:to-blue-950/90 rounded-full pointer-events-none z-20 flex items-center justify-center backdrop-blur-sm border-2 border-dashed border-blue-400 dark:border-blue-500 animate-pulse">
									<div className="flex flex-col items-center space-y-3 text-center px-6">
										<div className="flex items-center space-x-2 animate-bounce">
											<Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
											<FileText className="w-5 h-5 text-blue-500 dark:text-blue-300" />
											<Image className="w-5 h-5 text-blue-500 dark:text-blue-300" alt="" />
										</div>
										<div className="text-blue-700 dark:text-blue-300">
											<p className="text-base font-semibold">Drop your files here</p>
											<p className="text-sm opacity-80">Images, PDFs, documents • Max 10MB each</p>
										</div>
									</div>
								</div>
							)}

							{/* Enhanced Search Icon with Loading State */}
							<div className="flex items-center pl-6 py-4">{loading ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <Search className={`w-5 h-5 transition-colors ${searchFocus ? "text-blue-500" : "text-neutral-400"}`} />}</div>

							{/* Enhanced Input Field with Modern UX */}
							<div className="flex-1 px-4 py-1">
								{/* Query Correction Banner */}
								{queryCorrection && (
									<div className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
										Did you mean:
										<button
											onClick={() => {
												setSearchQuery(queryCorrection.suggested);
												handleInputChange({ target: { value: queryCorrection.suggested } });
											}}
											className="ml-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
										>
											{queryCorrection.suggested}
										</button>
									</div>
								)}

								<input
									ref={inputRef}
									type="text"
									value={searchQuery}
									onChange={handleInputChange}
									onFocus={handleSearchFocus}
									onBlur={handleSearchBlur}
									placeholder={aiMode ? "Ask me anything about local businesses..." : searchIntent === "location" ? "Find businesses near you..." : searchIntent === "category" ? "Explore business categories..." : "Search restaurants, services, healthcare..."}
									className={`w-full bg-transparent text-lg outline-none border-0 py-3 text-foreground transition-all duration-200 ${aiMode ? "placeholder:text-blue-400/80 dark:placeholder:text-blue-500/80" : "placeholder:text-neutral-400/80 dark:placeholder:text-neutral-500/80"} ${searchFocus ? "text-lg" : "text-base"}`}
									disabled={loading}
								/>

								{/* Search Suggestions Count */}
								{searchQuery.trim() && searchSuggestions.length > 0 && <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{searchSuggestions.length} smart suggestions available</div>}
							</div>

							{/* Hidden file input */}
							<input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.txt,.rtf" className="hidden" />

							{/* Enhanced Right Actions with Modern Controls */}
							<div className="flex items-center space-x-3 pr-6 py-4">
								{/* Voice Search Button */}
								{isVoiceSupported && (
									<button type="button" onClick={handleVoiceSearch} className={`p-2.5 rounded-xl transition-all duration-200 ${isListening ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 animate-pulse shadow-lg" : "text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"}`} title={isListening ? "Listening... Click to stop" : "Voice search"}>
										{isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
									</button>
								)}

								{/* Smart Filters Indicator */}
								{Object.values(smartFilters).some((filter) => filter !== null && filter !== false) && (
									<div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-xs text-blue-700 dark:text-blue-300">
										<Shield className="w-3 h-3" />
										<span>Filtered</span>
									</div>
								)}

								{/* AI Toggle Button - Enhanced */}
								<button
									type="button"
									onClick={toggleAiMode}
									className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
										aiMode ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:from-blue-600 hover:to-purple-700" : "text-neutral-600 dark:text-neutral-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 border border-neutral-200 dark:border-neutral-700 hover:border-transparent hover:shadow-lg"
									}`}
									title="Toggle AI features (Ctrl+K)"
								>
									<Bot className="w-4 h-4" />
									<span className="hidden sm:inline">{aiMode ? "AI Active" : "Enable AI"}</span>
									{aiMode && <Sparkles className="w-3 h-3 animate-pulse" />}
								</button>

								{/* AI Tools Dropdown */}
								{aiMode && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200 border border-blue-200 dark:border-blue-700">
												<Plus className="w-4 h-4" />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-56 border-0 shadow-xl bg-white dark:bg-neutral-900 rounded-xl p-2">
											<DropdownMenuLabel className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 px-3 py-2">AI Tools</DropdownMenuLabel>
											<DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700 my-1" />
											<DropdownMenuItem onClick={triggerFileUpload} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer transition-colors border-0">
												<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50">
													<Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
												</div>
												<div className="flex flex-col">
													<span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Upload Files</span>
													<span className="text-xs text-neutral-500 dark:text-neutral-400">Images, PDFs, docs • Max 10MB</span>
												</div>
												{uploadedFiles.length > 0 && (
													<Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5">
														{uploadedFiles.length}
													</Badge>
												)}
											</DropdownMenuItem>

											{uploadedFiles.length > 0 && (
												<>
													<DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700 my-1" />
													<DropdownMenuItem
														onClick={() => {
															uploadedFiles.forEach((file) => {
																if (file.preview) URL.revokeObjectURL(file.preview);
															});
															setUploadedFiles([]);
															setUploadProgress({});
															setUploadErrors({});
														}}
														className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer transition-colors border-0"
													>
														<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50">
															<X className="w-4 h-4 text-red-600 dark:text-red-400" />
														</div>
														<div className="flex flex-col">
															<span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Clear All Files</span>
															<span className="text-xs text-neutral-500 dark:text-neutral-400">Remove all uploaded files</span>
														</div>
													</DropdownMenuItem>
												</>
											)}
											<DropdownMenuItem className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/50 cursor-pointer transition-colors border-0">
												<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50">
													<Camera className="w-4 h-4 text-green-600 dark:text-green-400" />
												</div>
												<div className="flex flex-col">
													<span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Take Photo</span>
													<span className="text-xs text-neutral-500 dark:text-neutral-400">Capture with camera</span>
												</div>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}

								{/* Location Dropdown */}
								<div className="relative">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200 border border-neutral-200 dark:border-neutral-700">
												<MapPin className="w-4 h-4" />
												<span className="hidden sm:inline max-w-20 truncate">{typeof location?.city === "string" && location.city ? location.city : typeof location?.value === "string" && location.value ? location.value : "Location"}</span>
												<ChevronDown className="w-3 h-3" />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-64 border-0 shadow-xl bg-white dark:bg-neutral-900 rounded-xl p-3">
											<DropdownMenuLabel className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 px-2 py-1 mb-2">Set Location</DropdownMenuLabel>
											<div className="space-y-3">
												<LocationDropdown size="full" className="w-full text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
											</div>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								{/* Enhanced Submit Button with Dynamic States */}
								<Button
									type="submit"
									className={`group px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
										loading
											? "bg-neutral-400 cursor-not-allowed"
											: aiMode
												? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-purple-500/40"
												: searchQuery.trim()
													? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-green-500/30 hover:shadow-blue-500/40"
													: "bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-blue-600 hover:to-purple-600 shadow-neutral-500/30 hover:shadow-blue-500/30"
									}`}
									disabled={loading}
								>
									<div className="flex items-center justify-center gap-2">
										{loading ? (
											<>
												<div className="w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin" />
												<span className="hidden sm:inline">Searching...</span>
											</>
										) : (
											<>
												{aiMode ? (
													<>
														<Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
														<span className="hidden sm:inline">Ask AI</span>
														<Sparkles className="w-3 h-3 animate-pulse ml-1" />
													</>
												) : searchQuery.trim() ? (
													<>
														<Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
														<span className="hidden sm:inline">Search Now</span>
														<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
													</>
												) : (
													<>
														<Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
														<span className="hidden sm:inline">Start Search</span>
													</>
												)}
											</>
										)}
									</div>
								</Button>
							</div>
						</form>

						{/* File Upload Preview Section */}
						{(uploadedFiles.length > 0 || Object.keys(uploadErrors).length > 0) && (
							<div className="mt-4 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
								{/* Upload Errors */}
								{Object.keys(uploadErrors).length > 0 && (
									<div className="mb-4">
										{Object.entries(uploadErrors).map(([key, error]) => (
											<div key={key} className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded-lg mb-2">
												<X className="w-4 h-4" />
												<span>{error}</span>
											</div>
										))}
									</div>
								)}

								{/* Uploaded Files */}
								{uploadedFiles.length > 0 && (
									<div className="space-y-3">
										<h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center">
											<Upload className="w-4 h-4 mr-2" />
											Uploaded Files ({uploadedFiles.length}/5)
										</h4>

										<div className="grid gap-3">
											{uploadedFiles.map((file) => {
												const progress = uploadProgress[file.id];
												const isUploading = progress !== undefined;

												return (
													<div key={file.id} className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
														{/* File Icon/Preview */}
														<div className="flex-shrink-0">
															{file.preview ? (
																<div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700">
																	<img src={file.preview} alt={`Preview of ${file.name}`} className="w-full h-full object-cover" />
																</div>
															) : (
																<div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">{file.type.includes("pdf") ? <FileText className="w-5 h-5 text-red-600 dark:text-red-400" /> : file.type.includes("image") ? <Image className="w-5 h-5 text-green-600 dark:text-green-400" alt="" /> : <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}</div>
															)}
														</div>

														{/* File Info */}
														<div className="flex-1 min-w-0">
															<p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
															<p className="text-xs text-neutral-500 dark:text-neutral-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

															{/* Progress Bar */}
															{isUploading && (
																<div className="mt-2">
																	<div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
																		<div className="bg-blue-600 h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
																	</div>
																	<p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Uploading... {Math.round(progress)}%</p>
																</div>
															)}
														</div>

														{/* Upload Status & Remove Button */}
														<div className="flex items-center space-x-2">
															{file.uploaded && (
																<div className="flex items-center text-green-600 dark:text-green-400">
																	<CheckCircle className="w-4 h-4" />
																</div>
															)}

															<button onClick={() => removeFile(file.id)} className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors" title="Remove file">
																<X className="w-4 h-4" />
															</button>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Enhanced Search Results Dropdown with Modern UX */}
					{autocompleteOpen && (
						<div className={`absolute z-50 w-full mt-4 overflow-hidden backdrop-blur-xl border-2 rounded-2xl transition-all duration-300 ${aiMode ? "bg-white/95 dark:bg-neutral-900/95 border-blue-500/30 shadow-2xl shadow-blue-500/20" : "bg-white/90 dark:bg-neutral-950/90 border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl shadow-neutral-900/10"}`}>
							{aiMode ? (
								<UnifiedAIChat
									ref={aiChatRef}
									isOpen={true}
									onClose={() => {
										setAiMode(false);
										setAutocompleteOpen(false);
									}}
									mode="dropdown"
									style={{ maxHeight: "450px" }}
								/>
							) : (
								<div className="max-h-[500px] overflow-y-auto">
									{/* Smart Suggestions Section */}
									{searchSuggestions.length > 0 && (
										<div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
											<h4 className="text-sm font-semibold mb-4 text-neutral-700 dark:text-neutral-300 flex items-center">
												<Sparkles className="w-4 h-4 mr-2 text-blue-500" />
												Smart Suggestions
											</h4>
											<div className="space-y-2">
												{searchSuggestions.map((suggestion, idx) => (
													<button key={idx} onClick={() => handleSuggestionSelect(suggestion.query)} className="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
														<div className="flex items-center space-x-3">
															<div className={`p-2 rounded-lg ${suggestion.type === "trending" ? "bg-orange-100 dark:bg-orange-900/50" : suggestion.type === "personalized" ? "bg-purple-100 dark:bg-purple-900/50" : suggestion.type === "location" ? "bg-green-100 dark:bg-green-900/50" : "bg-blue-100 dark:bg-blue-900/50"}`}>
																<suggestion.icon className={`w-4 h-4 ${suggestion.type === "trending" ? "text-orange-600 dark:text-orange-400" : suggestion.type === "personalized" ? "text-purple-600 dark:text-purple-400" : suggestion.type === "location" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`} />
															</div>
															<div className="flex-1">
																<p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
																	{suggestion.title}
																	{suggestion.trending && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">🔥 Trending</span>}
																</p>
																<p className="text-xs text-neutral-500 dark:text-neutral-400">{suggestion.subtitle}</p>
															</div>
														</div>
														<div className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">{suggestion.count}</div>
													</button>
												))}
											</div>
										</div>
									)}

									{/* Business Results */}
									{businessSuggestions.length > 0 && (
										<div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
											<h4 className="text-sm font-semibold mb-4 text-neutral-700 dark:text-neutral-300 flex items-center">
												<Star className="w-4 h-4 mr-2 text-yellow-500" />
												Business Results
												<span className="ml-2 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs text-neutral-600 dark:text-neutral-400">{businessSuggestions.length}</span>
											</h4>
											<div className="space-y-3">
												{businessSuggestions.slice(0, 4).map((business, idx) => (
													<BusinessCard key={idx} business={business} onClick={() => handleSuggestionSelect(business)} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-md" />
												))}
												{businessSuggestions.length > 4 && (
													<button
														onClick={() => {
															saveToSearchHistory(searchQuery);
															handleSearch();
														}}
														className="w-full p-3 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors text-sm font-medium"
													>
														View all {businessSuggestions.length} results →
													</button>
												)}
											</div>
										</div>
									)}

									{/* Enhanced Categories with Trending Indicators */}
									{!searchQuery && (
										<div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
											<h4 className="text-sm font-semibold mb-4 text-neutral-700 dark:text-neutral-300 flex items-center">
												<Search className="w-4 h-4 mr-2 text-neutral-500" />
												Popular Categories
											</h4>
											<div className="grid grid-cols-2 gap-3">
												{popularCategories.slice(0, 6).map((cat, idx) => {
													const IconComponent = cat.icon;
													return (
														<button key={idx} onClick={() => handleSuggestionSelect(cat.query)} className="group flex items-center gap-3 p-4 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 rounded-xl transition-all duration-200 text-left border border-neutral-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md">
															<div className="relative">
																<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 group-hover:scale-110 transition-transform">
																	<IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
																</div>
																{cat.trending && (
																	<div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
																		<div className="w-1 h-1 bg-white rounded-full"></div>
																	</div>
																)}
															</div>
															<div className="flex-1">
																<span className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{cat.name}</span>
																<div className="flex items-center space-x-2 mt-0.5">
																	<span className="text-xs text-neutral-500 dark:text-neutral-400">{cat.count}</span>
																	<span className="text-xs text-yellow-600 dark:text-yellow-400">★ {cat.avgRating}</span>
																</div>
															</div>
														</button>
													);
												})}
											</div>
										</div>
									)}

									{/* Search History */}
									{searchHistory.length > 0 && (
										<div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
											<h4 className="text-sm font-semibold mb-4 text-neutral-700 dark:text-neutral-300 flex items-center">
												<Clock className="w-4 h-4 mr-2 text-neutral-500" />
												Recent Searches
											</h4>
											<div className="space-y-2">
												{searchHistory.slice(0, 4).map((search, idx) => (
													<button
														key={idx}
														onClick={() => {
															setSearchQuery(search);
															handleSuggestionSelect(search);
														}}
														className="w-full text-left p-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors flex items-center justify-between group border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
													>
														<div className="flex items-center gap-3">
															<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
																<Clock className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
															</div>
															<span className="font-medium text-neutral-900 dark:text-neutral-100">{search}</span>
														</div>
														<ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
													</button>
												))}
											</div>
										</div>
									)}

									{/* Trending Searches */}
									{!searchQuery && trendingSearches.length > 0 && (
										<div className="p-6">
											<h4 className="text-sm font-semibold mb-4 text-neutral-700 dark:text-neutral-300 flex items-center">
												<TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
												Trending Now
											</h4>
											<div className="flex flex-wrap gap-2">
												{trendingSearches.slice(0, 6).map((search, idx) => (
													<button
														key={idx}
														onClick={() => {
															setSearchQuery(search);
															handleSuggestionSelect(search);
														}}
														className="inline-flex items-center px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/50 dark:hover:to-red-900/50 text-neutral-700 dark:text-neutral-300 hover:text-orange-700 dark:hover:text-orange-300 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-md"
													>
														<TrendingUp className="w-3 h-3 mr-1.5 text-orange-500" />
														{search}
													</button>
												))}
											</div>
										</div>
									)}

									{/* Trending Searches */}
									{popularSearches.length > 0 && (
										<div>
											<h4 className="text-xs font-semibold mb-3 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center">
												<TrendingUp className="w-3.5 h-3.5 mr-1.5" />
												Trending
											</h4>
											<div className="flex flex-wrap gap-2">
												{popularSearches.slice(0, 6).map((search, idx) => (
													<Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900 dark:hover:text-blue-200 transition-colors text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700" onClick={() => handleSuggestionSelect(search)}>
														{search}
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					)}

					{/* Enhanced Popular Categories */}
					<div className="relative mb-20">
						<h3 className="text-xl font-semibold text-white mb-8 text-center">Popular Categories</h3>

						{/* Staggered grid layout */}
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{popularCategories.map((category, index) => (
								<Link key={category.name} href={`/search?q=${encodeURIComponent(category.query)}`}>
									<div className={`group relative animate-fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
										{/* Card with enhanced hover state */}
										<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 hover:border-white/30 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
											{/* Icon with bounce effect */}
											<div className="mb-3 group-hover:animate-bounce flex items-center justify-center">
												<div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
													<category.icon className="w-6 h-6 text-white" />
												</div>
											</div>

											{/* Category name */}
											<h4 className="font-medium text-white text-sm mb-1">{category.name}</h4>

											{/* Count with accent color */}
											<p className="text-xs text-blue-400 font-semibold">{category.count}</p>

											{/* Hover indicator */}
											<div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/0 group-hover:ring-blue-400/50 transition-all duration-300"></div>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* Enhanced Trust Indicators */}
					<div className="grid grid-cols-3 gap-6 mb-16">
						{trustStats.map((stat, index) => {
							const Icon = stat.icon;
							return (
								<div key={index} className="text-center group animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
									<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
										<Icon className="w-8 h-8 text-primary mx-auto mb-3" />
										<div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
										<div className="text-sm text-gray-400">{stat.label}</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Call-to-Action Enhancement */}
					<div className="text-center">
						<div className="inline-flex items-center gap-4 animate-fade-in animation-delay-600">
							<Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
								Start Exploring
								<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
							</Button>

							<Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-semibold backdrop-blur-sm">
								Watch Demo
							</Button>
						</div>

						{/* Trust indicators below CTAs */}
						<p className="text-sm text-gray-400 mt-6">Join 2.3M+ happy customers • Free to use • No credit card required</p>
					</div>
				</div>
			</div>
		</section>
	);
}

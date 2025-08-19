/**
 * Business Profile Accessibility Enhancements
 * Implements WCAG 2.1 AA compliance for business profiles
 * Includes keyboard navigation, screen reader support, and mobile accessibility
 */

/**
 * ARIA labels and roles for business profile elements
 */
export const businessProfileAria = {
	// Main sections
	header: {
		role: "banner",
		"aria-label": "Business profile navigation",
	},
	main: {
		role: "main",
		"aria-label": "Business profile content",
	},
	footer: {
		role: "contentinfo",
		"aria-label": "Business contact information",
	},

	// Navigation elements
	backButton: {
		"aria-label": "Go back to previous page",
		role: "button",
	},
	shareButton: {
		"aria-label": "Share this business profile",
		role: "button",
	},
	saveButton: {
		"aria-label": "Save business to favorites",
		role: "button",
	},

	// Contact actions
	phoneButton: {
		"aria-label": "Call business phone number",
		role: "button",
	},
	emailButton: {
		"aria-label": "Send email to business",
		role: "button",
	},
	directionsButton: {
		"aria-label": "Get directions to business location",
		role: "button",
	},
	websiteButton: {
		"aria-label": "Visit business website in new tab",
		role: "button",
	},

	// Content sections
	businessOverview: {
		role: "region",
		"aria-labelledby": "business-overview-heading",
	},
	contactInfo: {
		role: "region",
		"aria-labelledby": "contact-info-heading",
	},
	businessHours: {
		role: "region",
		"aria-labelledby": "business-hours-heading",
	},
	reviews: {
		role: "region",
		"aria-labelledby": "reviews-heading",
	},

	// Interactive elements
	contactForm: {
		role: "form",
		"aria-labelledby": "contact-form-heading",
		"aria-describedby": "contact-form-description",
	},
	photoGallery: {
		role: "region",
		"aria-labelledby": "photo-gallery-heading",
	},

	// Status indicators
	verifiedBadge: {
		"aria-label": "Verified business",
		role: "img",
	},
	ratingDisplay: {
		"aria-label": (rating, count) => `Business rating: ${rating} out of 5 stars based on ${count} reviews`,
		role: "img",
	},
	hoursStatus: {
		"aria-label": (isOpen) => (isOpen ? "Currently open" : "Currently closed"),
		role: "status",
	},
};

/**
 * Keyboard navigation setup for business profile
 */
export function setupKeyboardNavigation() {
	// Skip to main content link
	const skipLink = document.createElement("a");
	skipLink.href = "#main-content";
	skipLink.textContent = "Skip to main content";
	skipLink.className = "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-primary text-white p-2";
	skipLink.setAttribute("aria-label", "Skip to main business information");

	document.body.insertBefore(skipLink, document.body.firstChild);

	// Enhanced keyboard navigation for interactive elements
	document.addEventListener("keydown", (e) => {
		// Escape key handling for modals and overlays
		if (e.key === "Escape") {
			const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
			if (activeModal) {
				activeModal.setAttribute("aria-hidden", "true");
				activeModal.style.display = "none";

				// Return focus to trigger element
				const trigger = document.querySelector("[data-modal-trigger]");
				if (trigger) trigger.focus();
			}
		}

		// Arrow key navigation for photo gallery
		if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
			const galleryImages = document.querySelectorAll("[data-gallery-image]");
			const focused = document.activeElement;
			const currentIndex = Array.from(galleryImages).indexOf(focused);

			if (currentIndex !== -1) {
				e.preventDefault();
				let nextIndex;

				if (e.key === "ArrowRight") {
					nextIndex = (currentIndex + 1) % galleryImages.length;
				} else {
					nextIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
				}

				galleryImages[nextIndex].focus();
			}
		}
	});
}

/**
 * Screen reader announcements for dynamic content
 */
export function announceToScreenReader(message, priority = "polite") {
	const announcement = document.createElement("div");
	announcement.setAttribute("aria-live", priority);
	announcement.setAttribute("aria-atomic", "true");
	announcement.className = "sr-only";
	announcement.textContent = message;

	document.body.appendChild(announcement);

	// Remove after announcement
	setTimeout(() => {
		document.body.removeChild(announcement);
	}, 1000);
}

/**
 * Focus management utilities
 */
export const focusManagement = {
	// Trap focus within a container (for modals)
	trapFocus(container) {
		const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
		const firstFocusable = focusableElements[0];
		const lastFocusable = focusableElements[focusableElements.length - 1];

		container.addEventListener("keydown", (e) => {
			if (e.key === "Tab") {
				if (e.shiftKey) {
					if (document.activeElement === firstFocusable) {
						e.preventDefault();
						lastFocusable.focus();
					}
				} else {
					if (document.activeElement === lastFocusable) {
						e.preventDefault();
						firstFocusable.focus();
					}
				}
			}
		});

		// Focus first element
		firstFocusable?.focus();
	},

	// Return focus to previously focused element
	returnFocus(previouslyFocused) {
		if (previouslyFocused && previouslyFocused.focus) {
			previouslyFocused.focus();
		}
	},

	// Set focus to main content
	focusMainContent() {
		const mainContent = document.getElementById("main-content");
		if (mainContent) {
			mainContent.setAttribute("tabindex", "-1");
			mainContent.focus();
		}
	},
};

/**
 * Mobile accessibility enhancements
 */
export function setupMobileAccessibility() {
	// Touch target size validation (minimum 44px)
	const validateTouchTargets = () => {
		const touchTargets = document.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"]');

		touchTargets.forEach((target) => {
			const rect = target.getBoundingClientRect();
			const size = Math.min(rect.width, rect.height);

			if (size < 44) {
				// Add accessible padding
				target.style.minWidth = "44px";
				target.style.minHeight = "44px";
				target.style.display = "inline-flex";
				target.style.alignItems = "center";
				target.style.justifyContent = "center";
			}
		});
	};

	// Reduce motion for users who prefer it
	const respectReducedMotion = () => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			document.documentElement.style.setProperty("--animation-duration", "0.01ms");
			document.documentElement.style.setProperty("--transition-duration", "0.01ms");
		}
	};

	// High contrast mode support
	const setupHighContrast = () => {
		if (window.matchMedia("(prefers-contrast: high)").matches) {
			document.documentElement.classList.add("high-contrast");
		}
	};

	// Orientation change handling
	const handleOrientationChange = () => {
		window.addEventListener("orientationchange", () => {
			// Recalculate layouts and focus management
			setTimeout(() => {
				validateTouchTargets();
				// Announce orientation change to screen readers
				announceToScreenReader("Screen orientation changed");
			}, 100);
		});
	};

	// Initialize mobile accessibility features
	validateTouchTargets();
	respectReducedMotion();
	setupHighContrast();
	handleOrientationChange();

	// Re-validate on resize
	window.addEventListener("resize", validateTouchTargets);
}

/**
 * Color contrast validation
 */
export function validateColorContrast() {
	// Check if current colors meet WCAG AA standards
	const checkContrast = (foreground, background) => {
		// This is a simplified check - in production, you'd use a proper contrast calculation
		const fgLum = getLuminance(foreground);
		const bgLum = getLuminance(background);
		const contrast = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

		return {
			ratio: contrast,
			passesAA: contrast >= 4.5,
			passesAAA: contrast >= 7.0,
		};
	};

	// Simplified luminance calculation
	const getLuminance = (color) => {
		// This would need a proper color parsing library in production
		// For now, return a mock value
		return 0.5;
	};

	return checkContrast;
}

/**
 * Initialize all accessibility features
 */
export function initializeBusinessProfileAccessibility(businessName) {
	// Set up keyboard navigation
	setupKeyboardNavigation();

	// Set up mobile accessibility
	setupMobileAccessibility();

	// Set page title for screen readers
	document.title = `${businessName} - Business Profile | Thorbis`;

	// Add landmark roles if missing
	const main = document.querySelector("main");
	if (main && !main.getAttribute("role")) {
		main.setAttribute("role", "main");
		main.setAttribute("id", "main-content");
		main.setAttribute("aria-label", `${businessName} business profile`);
	}

	// Announce page load to screen readers
	announceToScreenReader(`${businessName} business profile loaded`);

	// Set up focus indicators
	const style = document.createElement("style");
	style.textContent = `
		/* Enhanced focus indicators */
		*:focus {
			outline: 2px solid hsl(var(--primary));
			outline-offset: 2px;
		}
		
		/* Skip link styles */
		.sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}
		
		.sr-only:focus {
			position: static;
			width: auto;
			height: auto;
			padding: 0.5rem 1rem;
			margin: 0;
			overflow: visible;
			clip: auto;
			white-space: normal;
		}
		
		/* High contrast mode styles */
		.high-contrast {
			filter: contrast(150%);
		}
		
		/* Reduced motion styles */
		@media (prefers-reduced-motion: reduce) {
			* {
				animation-duration: 0.01ms !important;
				animation-iteration-count: 1 !important;
				transition-duration: 0.01ms !important;
			}
		}
	`;
	document.head.appendChild(style);
}

export default {
	businessProfileAria,
	setupKeyboardNavigation,
	announceToScreenReader,
	focusManagement,
	setupMobileAccessibility,
	initializeBusinessProfileAccessibility,
};

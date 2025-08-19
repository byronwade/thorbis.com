// lib/utils/accessibilityUtils.js - Accessibility utilities and helpers
import { logger } from "./logger.js";

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
	ENTER: "Enter",
	SPACE: " ",
	ESCAPE: "Escape",
	ARROW_UP: "ArrowUp",
	ARROW_DOWN: "ArrowDown",
	ARROW_LEFT: "ArrowLeft",
	ARROW_RIGHT: "ArrowRight",
	TAB: "Tab",
	HOME: "Home",
	END: "End",
	PAGE_UP: "PageUp",
	PAGE_DOWN: "PageDown",
};

// Focus management utilities
export const FocusManager = {
	// Focus trap for modals and overlays
	createFocusTrap(container) {
		const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		const handleTabKey = (e) => {
			if (e.key === KEYBOARD_KEYS.TAB) {
				if (e.shiftKey && document.activeElement === firstElement) {
					e.preventDefault();
					lastElement.focus();
				} else if (!e.shiftKey && document.activeElement === lastElement) {
					e.preventDefault();
					firstElement.focus();
				}
			}

			if (e.key === KEYBOARD_KEYS.ESCAPE) {
				// Allow escape to close modal
				const escapeEvent = new CustomEvent("modal-escape");
				container.dispatchEvent(escapeEvent);
			}
		};

		container.addEventListener("keydown", handleTabKey);

		// Focus first element when trap is created
		if (firstElement) {
			firstElement.focus();
		}

		return () => {
			container.removeEventListener("keydown", handleTabKey);
		};
	},

	// Restore focus to previous element
	restoreFocus(previousElement) {
		if (previousElement && typeof previousElement.focus === "function") {
			requestAnimationFrame(() => {
				previousElement.focus();
			});
		}
	},

	// Move focus to next/previous focusable element
	moveFocus(direction, container = document) {
		const focusableElements = Array.from(container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));

		const currentIndex = focusableElements.indexOf(document.activeElement);
		let nextIndex;

		if (direction === "next") {
			nextIndex = currentIndex + 1;
			if (nextIndex >= focusableElements.length) nextIndex = 0;
		} else {
			nextIndex = currentIndex - 1;
			if (nextIndex < 0) nextIndex = focusableElements.length - 1;
		}

		focusableElements[nextIndex]?.focus();
	},
};

// ARIA utilities
export const AriaUtils = {
	// Generate unique IDs for ARIA relationships
	generateId(prefix = "aria") {
		return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
	},

	// Set ARIA attributes safely
	setAriaAttributes(element, attributes) {
		if (!element) return;

		Object.entries(attributes).forEach(([key, value]) => {
			if (value !== null && value !== undefined) {
				element.setAttribute(`aria-${key}`, value.toString());
			}
		});
	},

	// Announce message to screen readers
	announceToScreenReader(message, priority = "polite") {
		if (typeof document === "undefined") return;

		const announcer = document.createElement("div");
		announcer.setAttribute("aria-live", priority);
		announcer.setAttribute("aria-atomic", "true");
		announcer.className = "sr-only";
		announcer.textContent = message;

		document.body.appendChild(announcer);

		// Remove after announcement
		setTimeout(() => {
			document.body.removeChild(announcer);
		}, 1000);
	},

	// Update aria-expanded for collapsible elements
	toggleExpanded(trigger, target) {
		const isExpanded = target.style.display !== "none";
		trigger.setAttribute("aria-expanded", (!isExpanded).toString());
		target.setAttribute("aria-hidden", isExpanded.toString());
	},
};

// Screen reader utilities
export const ScreenReaderUtils = {
	// Create screen reader only text
	createSROnlyText(text) {
		const span = document.createElement("span");
		span.className = "sr-only";
		span.textContent = text;
		return span;
	},

	// Add context for screen readers
	addSRContext(element, context) {
		if (!element) return;

		const contextElement = this.createSROnlyText(context);
		element.appendChild(contextElement);
	},

	// Describe element for screen readers
	describeElement(element, description) {
		if (!element) return;

		const descriptionId = AriaUtils.generateId("description");
		const descriptionElement = document.createElement("div");
		descriptionElement.id = descriptionId;
		descriptionElement.className = "sr-only";
		descriptionElement.textContent = description;

		element.setAttribute("aria-describedby", descriptionId);
		document.body.appendChild(descriptionElement);

		return descriptionId;
	},
};

// Color contrast utilities
export const ColorUtils = {
	// Calculate relative luminance
	getRelativeLuminance(r, g, b) {
		const rsRGB = r / 255;
		const gsRGB = g / 255;
		const bsRGB = b / 255;

		const rLum = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
		const gLum = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
		const bLum = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

		return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
	},

	// Calculate contrast ratio
	getContrastRatio(color1, color2) {
		const lum1 = this.getRelativeLuminance(...color1);
		const lum2 = this.getRelativeLuminance(...color2);

		const brightest = Math.max(lum1, lum2);
		const darkest = Math.min(lum1, lum2);

		return (brightest + 0.05) / (darkest + 0.05);
	},

	// Check if contrast meets WCAG standards
	meetsWCAGStandards(color1, color2, level = "AA") {
		const ratio = this.getContrastRatio(color1, color2);

		switch (level) {
			case "AAA":
				return ratio >= 7;
			case "AA":
				return ratio >= 4.5;
			case "AA_LARGE":
				return ratio >= 3;
			default:
				return false;
		}
	},
};

// Keyboard navigation helpers
export const KeyboardNavigation = {
	// Handle arrow key navigation for lists
	handleListNavigation(event, items, currentIndex, onSelect) {
		let newIndex = currentIndex;

		switch (event.key) {
			case KEYBOARD_KEYS.ARROW_DOWN:
				event.preventDefault();
				newIndex = currentIndex + 1;
				if (newIndex >= items.length) newIndex = 0;
				break;

			case KEYBOARD_KEYS.ARROW_UP:
				event.preventDefault();
				newIndex = currentIndex - 1;
				if (newIndex < 0) newIndex = items.length - 1;
				break;

			case KEYBOARD_KEYS.HOME:
				event.preventDefault();
				newIndex = 0;
				break;

			case KEYBOARD_KEYS.END:
				event.preventDefault();
				newIndex = items.length - 1;
				break;

			case KEYBOARD_KEYS.ENTER:
			case KEYBOARD_KEYS.SPACE:
				event.preventDefault();
				if (onSelect && items[currentIndex]) {
					onSelect(items[currentIndex], currentIndex);
				}
				return currentIndex;

			default:
				return currentIndex;
		}

		// Focus the new item
		if (items[newIndex] && items[newIndex].focus) {
			items[newIndex].focus();
		}

		return newIndex;
	},

	// Handle tab navigation
	handleTabNavigation(event, container, onEscape) {
		if (event.key === KEYBOARD_KEYS.TAB) {
			const focusableElements = container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		}

		if (event.key === KEYBOARD_KEYS.ESCAPE && onEscape) {
			onEscape();
		}
	},
};

// Accessibility testing utilities
export const A11yTesting = {
	// Check for common accessibility issues
	auditPage() {
		const issues = [];

		// Check for images without alt text
		const images = document.querySelectorAll("img:not([alt])");
		if (images.length > 0) {
			issues.push(`${images.length} images found without alt text`);
		}

		// Check for buttons without accessible names
		const buttons = document.querySelectorAll("button:not([aria-label]):not([aria-labelledby])");
		const buttonsWithoutText = Array.from(buttons).filter((btn) => !btn.textContent.trim());
		if (buttonsWithoutText.length > 0) {
			issues.push(`${buttonsWithoutText.length} buttons found without accessible names`);
		}

		// Check for form inputs without labels
		const inputs = document.querySelectorAll("input:not([aria-label]):not([aria-labelledby])");
		const inputsWithoutLabels = Array.from(inputs).filter((input) => {
			const id = input.getAttribute("id");
			return !id || !document.querySelector(`label[for="${id}"]`);
		});
		if (inputsWithoutLabels.length > 0) {
			issues.push(`${inputsWithoutLabels.length} form inputs found without labels`);
		}

		// Check for headings hierarchy
		const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
		let previousLevel = 0;
		let hasSkippedLevel = false;

		headings.forEach((heading) => {
			const level = parseInt(heading.tagName.charAt(1));
			if (level - previousLevel > 1) {
				hasSkippedLevel = true;
			}
			previousLevel = level;
		});

		if (hasSkippedLevel) {
			issues.push("Heading hierarchy issues detected (skipped heading levels)");
		}

		logger.debug("Accessibility audit results:", issues);
		return issues;
	},

	// Test color contrast
	testColorContrast() {
		const elements = document.querySelectorAll("*");
		const contrastIssues = [];

		elements.forEach((element) => {
			const styles = window.getComputedStyle(element);
			const color = styles.color;
			const backgroundColor = styles.backgroundColor;

			// Skip elements without text or transparent backgrounds
			if (!element.textContent.trim() || backgroundColor === "transparent") {
				return;
			}

			// Parse colors and check contrast (simplified)
			// In a real implementation, you'd want a more robust color parser
			if (color && backgroundColor && color !== backgroundColor) {
				// This would need a proper color parsing implementation
				logger.debug("Color contrast check needed for:", element);
			}
		});

		return contrastIssues;
	},
};

// Accessibility hooks for React components
export const useAccessibility = () => {
	return {
		generateId: AriaUtils.generateId,
		announceToScreenReader: AriaUtils.announceToScreenReader,
		createFocusTrap: FocusManager.createFocusTrap,
		handleListNavigation: KeyboardNavigation.handleListNavigation,

		// Common ARIA props generator
		getComboboxProps: (isExpanded, hasPopup = "listbox") => ({
			role: "combobox",
			"aria-expanded": isExpanded,
			"aria-haspopup": hasPopup,
			"aria-autocomplete": "list",
		}),

		getListboxProps: (labelId) => ({
			role: "listbox",
			"aria-labelledby": labelId,
		}),

		getOptionProps: (isSelected, isActive) => ({
			role: "option",
			"aria-selected": isSelected,
			...(isActive && { "aria-current": "true" }),
		}),
	};
};

export default {
	KEYBOARD_KEYS,
	FocusManager,
	AriaUtils,
	ScreenReaderUtils,
	ColorUtils,
	KeyboardNavigation,
	A11yTesting,
	useAccessibility,
};

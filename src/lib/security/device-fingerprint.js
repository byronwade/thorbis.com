// REQUIRED: Advanced Device Fingerprinting for Security
// Implements comprehensive device identification for fraud prevention

import logger from "@lib/utils/logger";

/**
 * Device Fingerprinting Utility
 * Creates unique device signatures for security and fraud prevention
 */
export class DeviceFingerprint {
	/**
	 * Generate comprehensive device fingerprint
	 */
	static async generate() {
		const startTime = performance.now();

		try {
			const fingerprint = {
				id: null,
				components: {},
				risk: {
					level: "low",
					factors: [],
					score: 0,
				},
				generated: Date.now(),
			};

			// Browser and engine detection
			fingerprint.components.userAgent = navigator.userAgent;
			fingerprint.components.language = navigator.language;
			fingerprint.components.languages = navigator.languages?.join(",") || "";
			fingerprint.components.platform = navigator.platform;
			fingerprint.components.cookieEnabled = navigator.cookieEnabled;
			fingerprint.components.doNotTrack = navigator.doNotTrack;

			// Screen and display information
			fingerprint.components.screen = {
				width: window.screen.width,
				height: window.screen.height,
				colorDepth: window.screen.colorDepth,
				pixelDepth: window.screen.pixelDepth,
				availWidth: window.screen.availWidth,
				availHeight: window.screen.availHeight,
			};

			// Viewport information
			fingerprint.components.viewport = {
				width: window.innerWidth,
				height: window.innerHeight,
				devicePixelRatio: window.devicePixelRatio || 1,
			};

			// Timezone and locale
			fingerprint.components.timezone = {
				offset: new Date().getTimezoneOffset(),
				zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			};

			// Hardware concurrency
			fingerprint.components.hardwareConcurrency = navigator.hardwareConcurrency;

			// Memory information (if available)
			if ("memory" in performance) {
				fingerprint.components.memory = {
					jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
					totalJSHeapSize: performance.memory.totalJSHeapSize,
					usedJSHeapSize: performance.memory.usedJSHeapSize,
				};
			}

			// Canvas fingerprinting (privacy-aware)
			fingerprint.components.canvas = await this.getCanvasFingerprint();

			// WebGL fingerprinting
			fingerprint.components.webgl = this.getWebGLFingerprint();

			// Audio context fingerprinting
			fingerprint.components.audio = await this.getAudioFingerprint();

			// Font detection (limited for privacy)
			fingerprint.components.fonts = this.getBasicFontInfo();

			// Storage capabilities
			fingerprint.components.storage = await this.getStorageCapabilities();

			// Network information (if available)
			if ("connection" in navigator) {
				fingerprint.components.connection = {
					effectiveType: navigator.connection.effectiveType,
					downlink: navigator.connection.downlink,
					rtt: navigator.connection.rtt,
				};
			}

			// Generate unique ID from components
			fingerprint.id = await this.generateFingerprintID(fingerprint.components);

			// Risk assessment
			fingerprint.risk = this.assessRisk(fingerprint.components);

			const duration = performance.now() - startTime;
			logger.performance(`Device fingerprint generated in ${duration.toFixed(2)}ms`);

			// Log for security monitoring (without sensitive data)
			logger.security({
				action: "device_fingerprint_generated",
				fingerprintId: fingerprint.id,
				riskLevel: fingerprint.risk.level,
				riskScore: fingerprint.risk.score,
				components: Object.keys(fingerprint.components).length,
				duration,
				timestamp: Date.now(),
			});

			return fingerprint;
		} catch (error) {
			logger.error("Failed to generate device fingerprint:", error);

			// Return basic fallback fingerprint
			return {
				id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				components: {
					userAgent: navigator.userAgent,
					language: navigator.language,
					screen: {
						width: window.screen.width,
						height: window.screen.height,
					},
				},
				risk: { level: "unknown", factors: ["fingerprint_generation_failed"], score: 50 },
				generated: Date.now(),
			};
		}
	}

	/**
	 * Generate canvas fingerprint (privacy-aware approach)
	 */
	static async getCanvasFingerprint() {
		try {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) return null;

			// Draw simple geometric patterns (not text for privacy)
			ctx.fillStyle = "hsl(var(--muted-foreground))";
			ctx.fillRect(0, 0, 100, 100);

			ctx.fillStyle = "hsl(var(--muted-foreground))";
			ctx.fillRect(10, 10, 80, 80);

			ctx.arc(50, 50, 30, 0, 2 * Math.PI);
			ctx.fill();

			return canvas.toDataURL().slice(-50); // Only last 50 chars for privacy
		} catch (error) {
			return null;
		}
	}

	/**
	 * Get WebGL fingerprint
	 */
	static getWebGLFingerprint() {
		try {
			const canvas = document.createElement("canvas");
			const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

			if (!gl) return null;

			return {
				vendor: gl.getParameter(gl.VENDOR),
				renderer: gl.getParameter(gl.RENDERER),
				version: gl.getParameter(gl.VERSION),
				shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
			};
		} catch (error) {
			return null;
		}
	}

	/**
	 * Get audio context fingerprint
	 */
	static async getAudioFingerprint() {
		try {
			if (!window.AudioContext && !window.webkitAudioContext) {
				return null;
			}

			const AudioContext = window.AudioContext || window.webkitAudioContext;
			const context = new AudioContext();

			const fingerprint = {
				sampleRate: context.sampleRate,
				state: context.state,
				maxChannelCount: context.destination.maxChannelCount,
				numberOfInputs: context.destination.numberOfInputs,
				numberOfOutputs: context.destination.numberOfOutputs,
			};

			// Clean up
			if (context.state !== "closed") {
				await context.close();
			}

			return fingerprint;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Get basic font information (privacy-aware)
	 */
	static getBasicFontInfo() {
		try {
			// Only check for standard system fonts to avoid privacy issues
			const standardFonts = ["Arial", "Times New Roman", "Courier New", "Helvetica", "Georgia"];
			const available = [];

			const testString = "mmmmmmmmmmlli";
			const testSize = "72px";
			const h = document.getElementsByTagName("body")[0];

			const s = document.createElement("span");
			s.style.fontSize = testSize;
			s.style.fontFamily = "monospace";
			s.innerHTML = testString;
			h.appendChild(s);
			const defaultWidth = s.offsetWidth;

			standardFonts.forEach((font) => {
				s.style.fontFamily = `${font}, monospace`;
				if (s.offsetWidth !== defaultWidth) {
					available.push(font);
				}
			});

			h.removeChild(s);
			return available.join(",");
		} catch (error) {
			return "";
		}
	}

	/**
	 * Get storage capabilities
	 */
	static async getStorageCapabilities() {
		const capabilities = {
			localStorage: false,
			sessionStorage: false,
			indexedDB: false,
			webSQL: false,
			quota: null,
		};

		try {
			// Test localStorage
			localStorage.setItem("test", "test");
			localStorage.removeItem("test");
			capabilities.localStorage = true;
		} catch (e) {
			capabilities.localStorage = false;
		}

		try {
			// Test sessionStorage
			sessionStorage.setItem("test", "test");
			sessionStorage.removeItem("test");
			capabilities.sessionStorage = true;
		} catch (e) {
			capabilities.sessionStorage = false;
		}

		// Test IndexedDB
		capabilities.indexedDB = !!window.indexedDB;

		// Test WebSQL (deprecated but might exist)
		capabilities.webSQL = !!window.openDatabase;

		// Get storage quota if available
		if ("storage" in navigator && "estimate" in navigator.storage) {
			try {
				const estimate = await navigator.storage.estimate();
				capabilities.quota = {
					usage: estimate.usage,
					quota: estimate.quota,
				};
			} catch (e) {
				// Quota estimation failed
			}
		}

		return capabilities;
	}

	/**
	 * Generate unique fingerprint ID
	 */
	static async generateFingerprintID(components) {
		try {
			// Create a deterministic hash from components
			const data = JSON.stringify(components, Object.keys(components).sort());
			const encoder = new TextEncoder();
			const dataBuffer = encoder.encode(data);

			// Use Web Crypto API for hashing
			const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

			// Return first 16 characters for brevity
			return hashHex.substring(0, 16);
		} catch (error) {
			// Fallback to simple hash
			let hash = 0;
			const str = JSON.stringify(components);
			for (let i = 0; i < str.length; i++) {
				const char = str.charCodeAt(i);
				hash = (hash << 5) - hash + char;
				hash = hash & hash; // Convert to 32-bit integer
			}
			return Math.abs(hash).toString(16);
		}
	}

	/**
	 * Assess risk based on fingerprint components
	 */
	static assessRisk(components) {
		const risk = {
			level: "low",
			factors: [],
			score: 0,
		};

		let score = 0;

		// Check for unusual configurations
		if (components.screen.width < 800 || components.screen.height < 600) {
			risk.factors.push("unusual_screen_resolution");
			score += 10;
		}

		if (!components.cookieEnabled) {
			risk.factors.push("cookies_disabled");
			score += 15;
		}

		if (components.doNotTrack === "1") {
			risk.factors.push("do_not_track_enabled");
			score += 5;
		}

		if (!components.canvas) {
			risk.factors.push("canvas_fingerprinting_blocked");
			score += 20;
		}

		if (!components.webgl) {
			risk.factors.push("webgl_disabled");
			score += 10;
		}

		if (components.languages === "") {
			risk.factors.push("no_languages_detected");
			score += 15;
		}

		// Check for automation indicators
		if (navigator.webdriver) {
			risk.factors.push("automation_detected");
			score += 50;
		}

		if (window.phantom || window._phantom || window.callPhantom) {
			risk.factors.push("phantomjs_detected");
			score += 50;
		}

		if (window.selenium || window._selenium || document.$cdc_asdjflasutopfhvcZLmcfl_) {
			risk.factors.push("selenium_detected");
			score += 50;
		}

		// Determine risk level
		if (score >= 50) {
			risk.level = "high";
		} else if (score >= 25) {
			risk.level = "medium";
		} else {
			risk.level = "low";
		}

		risk.score = Math.min(score, 100);

		return risk;
	}

	/**
	 * Compare two fingerprints for similarity
	 */
	static compareFingerprintsMatches(fp1, fp2) {
		if (!fp1 || !fp2 || !fp1.components || !fp2.components) {
			return { similarity: 0, matches: [] };
		}

		const matches = [];
		let totalChecks = 0;
		let positiveMatches = 0;

		// Compare key components
		const comparisons = [
			{ key: "userAgent", weight: 0.3 },
			{ key: "screen.width", weight: 0.2 },
			{ key: "screen.height", weight: 0.2 },
			{ key: "timezone.zone", weight: 0.1 },
			{ key: "language", weight: 0.1 },
			{ key: "canvas", weight: 0.1 },
		];

		comparisons.forEach(({ key, weight }) => {
			totalChecks++;
			const val1 = this.getNestedValue(fp1.components, key);
			const val2 = this.getNestedValue(fp2.components, key);

			if (val1 === val2) {
				matches.push(key);
				positiveMatches += weight;
			}
		});

		const similarity = totalChecks > 0 ? (positiveMatches / comparisons.reduce((sum, c) => sum + c.weight, 0)) * 100 : 0;

		return {
			similarity: Math.round(similarity),
			matches,
			identical: fp1.id === fp2.id,
		};
	}

	/**
	 * Get nested object value by dot notation
	 */
	static getNestedValue(obj, path) {
		return path.split(".").reduce((current, key) => current?.[key], obj);
	}

	/**
	 * Store fingerprint securely
	 */
	static storeFingerprint(fingerprint) {
		try {
			const stored = {
				id: fingerprint.id,
				risk: fingerprint.risk,
				generated: fingerprint.generated,
				// Don't store full components for privacy
				componentsHash: fingerprint.id,
			};

			sessionStorage.setItem("deviceFingerprint", JSON.stringify(stored));

			logger.debug("Device fingerprint stored", {
				id: fingerprint.id,
				riskLevel: fingerprint.risk.level,
			});
		} catch (error) {
			logger.error("Failed to store device fingerprint:", error);
		}
	}

	/**
	 * Retrieve stored fingerprint
	 */
	static getStoredFingerprint() {
		try {
			const stored = sessionStorage.getItem("deviceFingerprint");
			return stored ? JSON.parse(stored) : null;
		} catch (error) {
			logger.error("Failed to retrieve stored fingerprint:", error);
			return null;
		}
	}
}

export default DeviceFingerprint;

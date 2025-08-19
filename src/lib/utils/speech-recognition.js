/**
 * Speech Recognition Utility
 * Provides a consistent, performance-optimized interface for speech recognition across the app
 * Handles browser compatibility, error handling, and feature detection
 */

import logger from "./logger.js";

/**
 * Check if speech recognition is supported in the current browser
 * @returns {boolean} True if speech recognition is supported
 */
export const isSpeechRecognitionSupported = () => {
	if (typeof window === "undefined") return false;
	return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
};

/**
 * Cached result for performance (client-side only)
 */
let cachedSupport = null;

/**
 * Get cached speech recognition support status
 * @returns {boolean} True if speech recognition is supported
 */
export const getSpeechRecognitionSupport = () => {
	if (typeof window === "undefined") return false;

	if (cachedSupport === null) {
		cachedSupport = isSpeechRecognitionSupported();
	}

	return cachedSupport;
};

/**
 * Get the speech recognition constructor for the current browser
 * @returns {SpeechRecognition|null} The speech recognition constructor or null if not supported
 */
export const getSpeechRecognitionConstructor = () => {
	if (typeof window === "undefined") return null;
	return window.SpeechRecognition || window.webkitSpeechRecognition;
};

/**
 * Default configuration for speech recognition
 */
export const DEFAULT_SPEECH_CONFIG = {
	continuous: false,
	interimResults: false,
	lang: "en-US",
	maxAlternatives: 1,
};

/**
 * Speech Recognition Manager Class
 * Provides a high-level interface for speech recognition with error handling and performance monitoring
 */
export class SpeechRecognitionManager {
	constructor(config = {}) {
		this.config = { ...DEFAULT_SPEECH_CONFIG, ...config };
		this.recognition = null;
		this.isListening = false;
		this.callbacks = {
			onStart: null,
			onResult: null,
			onError: null,
			onEnd: null,
		};

		if (getSpeechRecognitionSupport()) {
			this.initialize();
		}
	}

	/**
	 * Initialize the speech recognition instance
	 * @private
	 */
	initialize() {
		const startTime = performance.now();

		try {
			const SpeechRecognition = getSpeechRecognitionConstructor();
			if (!SpeechRecognition) {
				throw new Error("Speech recognition constructor not available");
			}

			this.recognition = new SpeechRecognition();

			// Apply configuration
			Object.keys(this.config).forEach((key) => {
				if (key in this.recognition) {
					this.recognition[key] = this.config[key];
				}
			});

			// Set up event handlers
			this.setupEventHandlers();

			const initTime = performance.now() - startTime;
			logger.performance(`Speech recognition initialized in ${initTime.toFixed(2)}ms`);
		} catch (error) {
			logger.error("Failed to initialize speech recognition:", error);
			throw error;
		}
	}

	/**
	 * Set up event handlers for speech recognition
	 * @private
	 */
	setupEventHandlers() {
		if (!this.recognition) return;

		this.recognition.onstart = () => {
			this.isListening = true;
			if (this.callbacks.onStart) {
				this.callbacks.onStart();
			}
			logger.debug("Speech recognition started");
		};

		this.recognition.onresult = (event) => {
			const startTime = performance.now();

			try {
				const results = Array.from(event.results);
				const transcript = results.map((result) => result[0].transcript).join("");

				const confidence = results.length > 0 ? results[0][0].confidence : 0;

				if (this.callbacks.onResult) {
					this.callbacks.onResult({
						transcript: transcript.trim(),
						confidence,
						isFinal: event.results[event.results.length - 1].isFinal,
						results: results,
					});
				}

				const processingTime = performance.now() - startTime;
				logger.performance(`Speech recognition result processed in ${processingTime.toFixed(2)}ms`);

				// Log analytics for speech recognition usage
				logger.interaction({
					type: "speech_recognition_result",
					transcript: transcript.trim(),
					confidence,
					processingTime,
					timestamp: Date.now(),
				});
			} catch (error) {
				logger.error("Error processing speech recognition result:", error);
				this.handleError(error);
			}
		};

		this.recognition.onerror = (event) => {
			const error = {
				code: event.error,
				message: this.getErrorMessage(event.error),
				timestamp: Date.now(),
			};

			logger.error("Speech recognition error:", error);

			if (this.callbacks.onError) {
				this.callbacks.onError(error);
			}

			this.handleError(error);
		};

		this.recognition.onend = () => {
			this.isListening = false;
			if (this.callbacks.onEnd) {
				this.callbacks.onEnd();
			}
			logger.debug("Speech recognition ended");
		};
	}

	/**
	 * Start speech recognition
	 * @returns {Promise<void>}
	 */
	async start() {
		if (!getSpeechRecognitionSupport()) {
			throw new Error("Speech recognition is not supported in this browser");
		}

		if (!this.recognition) {
			throw new Error("Speech recognition not initialized");
		}

		if (this.isListening) {
			logger.warn("Speech recognition is already listening");
			return;
		}

		try {
			this.recognition.start();
			logger.debug("Speech recognition start requested");
		} catch (error) {
			logger.error("Failed to start speech recognition:", error);
			throw error;
		}
	}

	/**
	 * Stop speech recognition
	 */
	stop() {
		if (this.recognition && this.isListening) {
			this.recognition.stop();
			logger.debug("Speech recognition stop requested");
		}
	}

	/**
	 * Abort speech recognition
	 */
	abort() {
		if (this.recognition && this.isListening) {
			this.recognition.abort();
			logger.debug("Speech recognition aborted");
		}
	}

	/**
	 * Set callback functions
	 * @param {Object} callbacks - Object containing callback functions
	 */
	setCallbacks(callbacks) {
		this.callbacks = { ...this.callbacks, ...callbacks };
	}

	/**
	 * Get current listening state
	 * @returns {boolean}
	 */
	getIsListening() {
		return this.isListening;
	}

	/**
	 * Handle errors with appropriate user feedback
	 * @param {Object} error - Error object
	 * @private
	 */
	handleError(error) {
		// Automatic error recovery for certain error types
		if (error.code === "no-speech" || error.code === "audio-capture") {
			// These are often temporary issues, don't need special handling
			return;
		}

		if (error.code === "not-allowed") {
			// Permission denied - provide helpful message
			logger.warn("Microphone permission denied for speech recognition");
		}

		// Log error for analytics
		logger.businessMetrics({
			type: "speech_recognition_error",
			errorCode: error.code,
			errorMessage: error.message,
			timestamp: Date.now(),
		});
	}

	/**
	 * Get user-friendly error message
	 * @param {string} errorCode - Browser error code
	 * @returns {string} User-friendly error message
	 * @private
	 */
	getErrorMessage(errorCode) {
		const errorMessages = {
			"no-speech": "No speech detected. Please try speaking again.",
			aborted: "Speech recognition was cancelled.",
			"audio-capture": "Microphone access error. Please check your microphone permissions.",
			network: "Network error occurred. Please check your internet connection.",
			"not-allowed": "Microphone permission denied. Please allow microphone access in your browser settings.",
			"service-not-allowed": "Speech recognition service is not available.",
			"bad-grammar": "Speech recognition grammar error.",
			"language-not-supported": "Language not supported for speech recognition.",
		};

		return errorMessages[errorCode] || `Speech recognition error: ${errorCode}`;
	}

	/**
	 * Cleanup resources
	 */
	destroy() {
		if (this.recognition) {
			this.stop();
			this.recognition = null;
		}
		this.callbacks = {};
		logger.debug("Speech recognition manager destroyed");
	}
}

/**
 * Hook-like factory function for creating speech recognition manager
 * @param {Object} config - Configuration object
 * @returns {SpeechRecognitionManager}
 */
export const createSpeechRecognition = (config) => {
	return new SpeechRecognitionManager(config);
};

/**
 * Simple helper function for one-off speech recognition
 * @param {Object} options - Options object
 * @returns {Promise<string>} Resolved with transcript or rejected with error
 */
export const recognizeSpeech = (options = {}) => {
	return new Promise((resolve, reject) => {
		if (!getSpeechRecognitionSupport()) {
			reject(new Error("Speech recognition is not supported in this browser"));
			return;
		}

		const manager = createSpeechRecognition({
			continuous: false,
			interimResults: false,
			...options,
		});

		manager.setCallbacks({
			onResult: (result) => {
				if (result.isFinal) {
					resolve(result.transcript);
					manager.destroy();
				}
			},
			onError: (error) => {
				reject(error);
				manager.destroy();
			},
		});

		manager.start().catch(reject);

		// Auto-timeout after 10 seconds
		setTimeout(() => {
			manager.destroy();
			reject(new Error("Speech recognition timeout"));
		}, 10000);
	});
};

/**
 * Get browser compatibility information
 * @returns {Object} Browser compatibility info
 */
export const getBrowserCompatibility = () => {
	return {
		isSupported: getSpeechRecognitionSupport(),
		hasStandardAPI: typeof window !== "undefined" && "SpeechRecognition" in window,
		hasWebkitAPI: typeof window !== "undefined" && "webkitSpeechRecognition" in window,
		userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
		platform: typeof navigator !== "undefined" ? navigator.platform : "unknown",
	};
};

export default {
	isSpeechRecognitionSupported,
	getSpeechRecognitionSupport,
	getSpeechRecognitionConstructor,
	SpeechRecognitionManager,
	createSpeechRecognition,
	recognizeSpeech,
	getBrowserCompatibility,
	DEFAULT_SPEECH_CONFIG,
};

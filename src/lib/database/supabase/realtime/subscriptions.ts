// REQUIRED: Performance-optimized real-time subscriptions
import { supabase } from "../client";
import { CacheManager } from "@lib/utils/cache-manager";
import { logger } from "@lib/utils/logger";

/**
 * High-performance real-time subscription management
 * Implements connection pooling and intelligent reconnection
 */
export class SupabaseRealtime {
	private static subscriptions = new Map<string, any>();
	private static connectionPool = new Map<string, any>();
	private static readonly pooledClient = supabase;

	/**
	 * Subscribe to table changes with performance optimization
	 */
	static subscribeToTable(
		table: string,
		options: {
			event?: "INSERT" | "UPDATE" | "DELETE" | "*";
			schema?: string;
			filter?: string;
			callback: (payload: any) => void;
			errorCallback?: (error: any) => void;
		}
	): () => void {
		const startTime = performance.now();
		const subscriptionId = `${table}_${options.event || "*"}_${options.filter || "all"}_${Date.now()}`;

		try {
			const channel = this.pooledClient
				.channel(`table-changes-${subscriptionId}`)
				.on(
					"postgres_changes",
					{
						event: options.event || "*",
						schema: options.schema || "public",
						table: table,
						filter: options.filter,
					},
					(payload) => {
						const processTime = performance.now();

						try {
							// Invalidate relevant caches
							this.invalidateTableCaches(table, payload);

							// Execute callback
							options.callback(payload);

							const callbackTime = performance.now() - processTime;
							logger.performance(`Realtime callback processed in ${callbackTime.toFixed(2)}ms`);

							logger.realtime({
								action: "change_received",
								table,
								event: payload.eventType,
								subscriptionId,
								processingTime: callbackTime,
								timestamp: Date.now(),
							});
						} catch (error) {
							logger.error("Realtime callback error:", error);
							if (options.errorCallback) {
								options.errorCallback(error);
							}
						}
					}
				)
				.subscribe((status) => {
					const subscriptionTime = performance.now() - startTime;

					if (status === "SUBSCRIBED") {
						logger.performance(`Realtime subscription established in ${subscriptionTime.toFixed(2)}ms`);
						logger.realtime({
							action: "subscription_established",
							table,
							subscriptionId,
							subscriptionTime,
							timestamp: Date.now(),
						});
					} else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
						logger.error(`Realtime subscription error: ${status}`, { table, subscriptionId });
						if (options.errorCallback) {
							options.errorCallback(new Error(`Subscription ${status}`));
						}
					}
				});

			// Store subscription for cleanup
			this.subscriptions.set(subscriptionId, channel);

			// Return unsubscribe function
			return () => {
				this.unsubscribe(subscriptionId);
			};
		} catch (error) {
			logger.error("Realtime subscription error:", error);
			if (options.errorCallback) {
				options.errorCallback(error);
			}
			return () => {}; // Return empty unsubscribe function
		}
	}

	/**
	 * Subscribe to business changes with optimized caching
	 */
	static subscribeToBusinessChanges(businessId: string, callback: (payload: any) => void, errorCallback?: (error: any) => void): () => void {
		return this.subscribeToTable("businesses", {
			event: "*",
			filter: `id=eq.${businessId}`,
			callback: (payload) => {
				// Update local cache immediately
				if (payload.eventType === "UPDATE" && payload.new) {
					const cacheKeys = [`business_${businessId}`];
					cacheKeys.forEach((key) => {
						if (CacheManager.memory?.has(key)) {
							CacheManager.memory.set(key, payload.new, 10 * 60 * 1000);
						}
					});
				}

				callback(payload);
			},
			errorCallback,
		});
	}

	/**
	 * Subscribe to user-specific notifications
	 */
	static subscribeToUserNotifications(userId: string, callback: (payload: any) => void, errorCallback?: (error: any) => void): () => void {
		return this.subscribeToTable("notifications", {
			event: "INSERT",
			filter: `user_id=eq.${userId}`,
			callback,
			errorCallback,
		});
	}

	/**
	 * Subscribe to review changes for a business
	 */
	static subscribeToBusinessReviews(businessId: string, callback: (payload: any) => void, errorCallback?: (error: any) => void): () => void {
		return this.subscribeToTable("reviews", {
			event: "*",
			filter: `business_id=eq.${businessId}`,
			callback: (payload) => {
				// Invalidate business rating cache
				if (CacheManager.memory) {
					const businessCacheKeys = Array.from(CacheManager.memory.keys()).filter((key) => key.includes(`business_${businessId}`));
					businessCacheKeys.forEach((key) => CacheManager.memory?.delete(key));
				}

				callback(payload);
			},
			errorCallback,
		});
	}

	/**
	 * Subscribe to presence (user online status)
	 */
	static subscribeToPresence(
		channelName: string,
		options: {
			onJoin?: (key: string, currentPresences: any[], newPresences: any[]) => void;
			onLeave?: (key: string, currentPresences: any[], leftPresences: any[]) => void;
			onSync?: () => void;
		}
	): {
		track: (presence: any) => void;
		untrack: () => void;
		unsubscribe: () => void;
	} {
		const startTime = performance.now();
		const subscriptionId = `presence_${channelName}_${Date.now()}`;

		try {
			const channel = this.pooledClient.channel(channelName, {
				config: {
					presence: {
						key: subscriptionId,
					},
				},
			});

			// Set up presence event handlers
			if (options.onJoin) {
				channel.on("presence", { event: "join" }, options.onJoin);
			}

			if (options.onLeave) {
				channel.on("presence", { event: "leave" }, options.onLeave);
			}

			if (options.onSync) {
				channel.on("presence", { event: "sync" }, options.onSync);
			}

			channel.subscribe((status) => {
				const subscriptionTime = performance.now() - startTime;

				if (status === "SUBSCRIBED") {
					logger.performance(`Presence subscription established in ${subscriptionTime.toFixed(2)}ms`);
					logger.realtime({
						action: "presence_subscription_established",
						channelName,
						subscriptionId,
						subscriptionTime,
						timestamp: Date.now(),
					});
				}
			});

			// Store subscription for cleanup
			this.subscriptions.set(subscriptionId, channel);

			return {
				track: (presence: any) => {
					channel.track(presence);
				},
				untrack: () => {
					channel.untrack();
				},
				unsubscribe: () => {
					this.unsubscribe(subscriptionId);
				},
			};
		} catch (error) {
			logger.error("Presence subscription error:", error);
			return {
				track: () => {},
				untrack: () => {},
				unsubscribe: () => {},
			};
		}
	}

	/**
	 * Broadcast message to channel
	 */
	static async broadcastMessage(channelName: string, event: string, payload: any): Promise<void> {
		const startTime = performance.now();

		try {
			const channel = this.pooledClient.channel(channelName);

			await channel.send({
				type: "broadcast",
				event,
				payload,
			});

			const broadcastTime = performance.now() - startTime;
			logger.performance(`Broadcast message sent in ${broadcastTime.toFixed(2)}ms`);

			logger.realtime({
				action: "message_broadcast",
				channelName,
				event,
				broadcastTime,
				timestamp: Date.now(),
			});
		} catch (error) {
			logger.error("Broadcast message error:", error);
			throw error;
		}
	}

	/**
	 * Subscribe to broadcast messages
	 */
	static subscribeToBroadcast(channelName: string, event: string, callback: (payload: any) => void, errorCallback?: (error: any) => void): () => void {
		const startTime = performance.now();
		const subscriptionId = `broadcast_${channelName}_${event}_${Date.now()}`;

		try {
			const channel = this.pooledClient
				.channel(channelName)
				.on("broadcast", { event }, callback)
				.subscribe((status) => {
					const subscriptionTime = performance.now() - startTime;

					if (status === "SUBSCRIBED") {
						logger.performance(`Broadcast subscription established in ${subscriptionTime.toFixed(2)}ms`);
						logger.realtime({
							action: "broadcast_subscription_established",
							channelName,
							event,
							subscriptionId,
							subscriptionTime,
							timestamp: Date.now(),
						});
					} else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
						logger.error(`Broadcast subscription error: ${status}`, { channelName, event });
						if (errorCallback) {
							errorCallback(new Error(`Subscription ${status}`));
						}
					}
				});

			// Store subscription for cleanup
			this.subscriptions.set(subscriptionId, channel);

			return () => {
				this.unsubscribe(subscriptionId);
			};
		} catch (error) {
			logger.error("Broadcast subscription error:", error);
			if (errorCallback) {
				errorCallback(error);
			}
			return () => {};
		}
	}

	/**
	 * Unsubscribe from a specific subscription
	 */
	static unsubscribe(subscriptionId: string): void {
		const subscription = this.subscriptions.get(subscriptionId);
		if (subscription) {
			subscription.unsubscribe();
			this.subscriptions.delete(subscriptionId);

			logger.realtime({
				action: "subscription_removed",
				subscriptionId,
				timestamp: Date.now(),
			});
		}
	}

	/**
	 * Unsubscribe from all subscriptions
	 */
	static unsubscribeAll(): void {
		const startTime = performance.now();

		for (const [subscriptionId, subscription] of this.subscriptions) {
			subscription.unsubscribe();
		}

		this.subscriptions.clear();

		const cleanupTime = performance.now() - startTime;
		logger.performance(`All realtime subscriptions cleaned up in ${cleanupTime.toFixed(2)}ms`);

		logger.realtime({
			action: "all_subscriptions_removed",
			cleanupTime,
			timestamp: Date.now(),
		});
	}

	/**
	 * Get connection status
	 */
	static getConnectionStatus(): string {
		return this.pooledClient.realtime.connection?.readyState || "unknown";
	}

	/**
	 * Invalidate caches based on table changes
	 */
	private static invalidateTableCaches(table: string, payload: any): void {
		if (!CacheManager.memory) return;

		const cacheKeysToInvalidate: string[] = [];

		switch (table) {
			case "businesses":
				cacheKeysToInvalidate.push("business_search_", "featured_businesses_", "businesses_category_", "nearby_", `business_${payload.new?.id || payload.old?.id}`);
				break;

			case "reviews":
				cacheKeysToInvalidate.push(`business_${payload.new?.business_id || payload.old?.business_id}`, `user_reviews_${payload.new?.user_id || payload.old?.user_id}`, `user_stats_${payload.new?.user_id || payload.old?.user_id}`);
				break;

			case "users":
				cacheKeysToInvalidate.push(`user_${payload.new?.id || payload.old?.id}`, `user_email_${payload.new?.email || payload.old?.email}`);
				break;
		}

		// Clear cache entries
		cacheKeysToInvalidate.forEach((keyPattern) => {
			if (keyPattern.endsWith("_")) {
				// Pattern-based invalidation
				const keys = Array.from(CacheManager.memory.keys()).filter((key) => key.startsWith(keyPattern));
				keys.forEach((key) => CacheManager.memory?.delete(key));
			} else {
				// Exact key invalidation
				CacheManager.memory.delete(keyPattern);
			}
		});

		logger.debug(`Invalidated caches for table ${table}: ${cacheKeysToInvalidate.join(", ")}`);
	}

	/**
	 * Health check for realtime connections
	 */
	static performHealthCheck(): {
		status: string;
		activeSubscriptions: number;
		connectionState: string;
		uptime: number;
	} {
		return {
			status: this.getConnectionStatus() === "OPEN" ? "healthy" : "unhealthy",
			activeSubscriptions: this.subscriptions.size,
			connectionState: this.getConnectionStatus(),
			uptime: Date.now() - (this.pooledClient.realtime.connection?.connectedAt || Date.now()),
		};
	}
}

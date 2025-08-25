/**
 * Business Hours Queries for Supabase (Consolidated)
 */

import { supabase, Tables } from "../client";
import { CacheManager } from "@utils/cache-manager";
import logger from "@lib/utils/logger";

type BusinessHours = Tables<"business_hours">;
type SpecialHours = Tables<"special_hours">;

export interface WeeklyHours {
	monday: DayHours;
	tuesday: DayHours;
	wednesday: DayHours;
	thursday: DayHours;
	friday: DayHours;
	saturday: DayHours;
	sunday: DayHours;
}

export interface DayHours {
	isOpen: boolean;
	openTime: string; // HH:mm
	closeTime: string; // HH:mm
	breaks?: TimeSlot[];
}

export interface TimeSlot {
	start: string; // HH:mm
	end: string; // HH:mm
}

export interface SpecialHoursEvent {
	id?: string;
	date: string; // YYYY-MM-DD
	name: string;
	isClosed: boolean;
	openTime?: string;
	closeTime?: string;
	description?: string;
}

export class BusinessHoursQueries {
	private static readonly CACHE_TTL = 30 * 60 * 1000;
	private static readonly pooledClient = supabase;

	static async getBusinessHours(businessId: string): Promise<{
		weeklyHours: WeeklyHours;
		timezone: string;
		specialHours: SpecialHoursEvent[];
		performance: { queryTime: number; cacheHit: boolean };
	}> {
		const startTime = performance.now();
		const cacheKey = `business_hours_${businessId}`;

		const cached = CacheManager.memory.get(cacheKey);
		if (cached) {
			logger.performance(`Business hours cache hit: ${cacheKey}`);
			return { ...cached, performance: { queryTime: performance.now() - startTime, cacheHit: true } };
		}

		try {
			const { data: businessHours, error: hoursError } = await this.pooledClient.from("business_hours").select("*").eq("business_id", businessId).single();
			if (hoursError && hoursError.code !== "PGRST116") throw hoursError;

			const { data: specialHours, error: specialError } = await this.pooledClient.from("special_hours").select("*").eq("business_id", businessId).gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true });
			if (specialError) throw specialError;

			const weeklyHours: WeeklyHours = businessHours
				? {
						monday: this.formatDayHours(businessHours.monday_hours),
						tuesday: this.formatDayHours(businessHours.tuesday_hours),
						wednesday: this.formatDayHours(businessHours.wednesday_hours),
						thursday: this.formatDayHours(businessHours.thursday_hours),
						friday: this.formatDayHours(businessHours.friday_hours),
						saturday: this.formatDayHours(businessHours.saturday_hours),
						sunday: this.formatDayHours(businessHours.sunday_hours),
					}
				: this.getDefaultHours();

			const result = {
				weeklyHours,
				timezone: businessHours?.timezone || "America/New_York",
				specialHours: specialHours?.map(this.formatSpecialHours) || [],
			};

			CacheManager.memory.set(cacheKey, result, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Business hours query completed in ${queryTime.toFixed(2)}ms`);
			return { ...result, performance: { queryTime, cacheHit: false } };
		} catch (error) {
			logger.error("Business hours query error:", error);
			throw error;
		}
	}

	static async updateBusinessHours(businessId: string, weeklyHours: WeeklyHours, timezone: string = "America/New_York"): Promise<{ success: boolean; businessHours?: BusinessHours }> {
		const startTime = performance.now();
		try {
			const hoursData = {
				business_id: businessId,
				timezone,
				monday_hours: this.formatHoursForDB(weeklyHours.monday),
				tuesday_hours: this.formatHoursForDB(weeklyHours.tuesday),
				wednesday_hours: this.formatHoursForDB(weeklyHours.wednesday),
				thursday_hours: this.formatHoursForDB(weeklyHours.thursday),
				friday_hours: this.formatHoursForDB(weeklyHours.friday),
				saturday_hours: this.formatHoursForDB(weeklyHours.saturday),
				sunday_hours: this.formatHoursForDB(weeklyHours.sunday),
				updated_at: new Date().toISOString(),
			};

			const { data: businessHours, error } = await this.pooledClient.from("business_hours").upsert(hoursData, { onConflict: "business_id", returning: "representation" }).select().single();
			if (error) throw error;

			this.invalidateBusinessHoursCache(businessId);
			logger.performance(`Business hours update completed in ${(performance.now() - startTime).toFixed(2)}ms`);
			return { success: true, businessHours };
		} catch (error) {
			logger.error("Business hours update error:", error);
			return { success: false };
		}
	}

	static async updateSpecialHours(businessId: string, specialHoursEvent: SpecialHoursEvent): Promise<{ success: boolean; specialHours?: SpecialHours }> {
		const startTime = performance.now();
		try {
			const eventData = {
				business_id: businessId,
				date: specialHoursEvent.date,
				name: specialHoursEvent.name,
				is_closed: specialHoursEvent.isClosed,
				open_time: specialHoursEvent.openTime || null,
				close_time: specialHoursEvent.closeTime || null,
				description: specialHoursEvent.description || null,
				updated_at: new Date().toISOString(),
			};

			let query = this.pooledClient.from("special_hours");
			if (specialHoursEvent.id) {
				query = query.update(eventData).eq("id", specialHoursEvent.id).eq("business_id", businessId);
			} else {
				query = query.insert({ ...eventData, created_at: new Date().toISOString() });
			}

			const { data: specialHours, error } = await query.select().single();
			if (error) throw error;

			this.invalidateBusinessHoursCache(businessId);
			logger.performance(`Special hours update completed in ${(performance.now() - startTime).toFixed(2)}ms`);
			return { success: true, specialHours };
		} catch (error) {
			logger.error("Special hours update error:", error);
			return { success: false };
		}
	}

	static async deleteSpecialHours(businessId: string, specialHoursId: string): Promise<{ success: boolean }> {
		const startTime = performance.now();
		try {
			const { error } = await this.pooledClient.from("special_hours").delete().eq("id", specialHoursId).eq("business_id", businessId);
			if (error) throw error;

			this.invalidateBusinessHoursCache(businessId);
			logger.performance(`Special hours delete completed in ${(performance.now() - startTime).toFixed(2)}ms`);
			return { success: true };
		} catch (error) {
			logger.error("Special hours delete error:", error);
			return { success: false };
		}
	}

	private static formatDayHours(hoursJson: any): DayHours {
		if (!hoursJson || typeof hoursJson !== "object") {
			return { isOpen: false, openTime: "09:00", closeTime: "17:00" };
		}
		return { isOpen: Boolean(hoursJson.isOpen), openTime: hoursJson.openTime || "09:00", closeTime: hoursJson.closeTime || "17:00", breaks: hoursJson.breaks || [] };
	}

	private static formatHoursForDB(dayHours: DayHours): any {
		return { isOpen: dayHours.isOpen, openTime: dayHours.openTime, closeTime: dayHours.closeTime, breaks: dayHours.breaks || [] };
	}

	private static formatSpecialHours(specialHours: any): SpecialHoursEvent {
		return { id: specialHours.id, date: specialHours.date, name: specialHours.name, isClosed: specialHours.is_closed, openTime: specialHours.open_time, closeTime: specialHours.close_time, description: specialHours.description };
	}

	private static getDefaultHours(): WeeklyHours {
		const defaultWeekday: DayHours = { isOpen: true, openTime: "09:00", closeTime: "17:00" };
		const defaultWeekend: DayHours = { isOpen: false, openTime: "09:00", closeTime: "17:00" };
		return { monday: defaultWeekday, tuesday: defaultWeekday, wednesday: defaultWeekday, thursday: defaultWeekday, friday: defaultWeekday, saturday: defaultWeekend, sunday: defaultWeekend };
	}

	private static invalidateBusinessHoursCache(businessId: string): void {
		const patterns = [`business_hours_${businessId}`, `business_open_${businessId}`];
		patterns.forEach((p) => CacheManager.memory.invalidatePattern(p));
		logger.debug(`Invalidated business hours cache for business: ${businessId}`);
	}
}

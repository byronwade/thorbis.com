/**
 * useBusinessHours Hook
 * Custom hook for managing business operating hours
 * Extracted from large profile component for better organization
 */

"use client";

import { useState, useCallback } from "react";
import { toast } from "@components/ui/use-toast";

// Default business hours template
const defaultHours = {
	monday: { isOpen: true, open: "09:00", close: "17:00" },
	tuesday: { isOpen: true, open: "09:00", close: "17:00" },
	wednesday: { isOpen: true, open: "09:00", close: "17:00" },
	thursday: { isOpen: true, open: "09:00", close: "17:00" },
	friday: { isOpen: true, open: "09:00", close: "17:00" },
	saturday: { isOpen: false, open: "09:00", close: "17:00" },
	sunday: { isOpen: false, open: "09:00", close: "17:00" },
};

export const useBusinessHours = (initialHours = defaultHours) => {
	const [hours, setHours] = useState(initialHours);
	const [specialHours, setSpecialHours] = useState([]);
	const [holidays, setHolidays] = useState([]);

	// Update day open/close status
	const updateDayStatus = useCallback((day, isOpen) => {
		setHours(prev => ({
			...prev,
			[day]: { ...prev[day], isOpen },
		}));
	}, []);

	// Update day opening time
	const updateOpenTime = useCallback((day, openTime) => {
		setHours(prev => ({
			...prev,
			[day]: { ...prev[day], open: openTime },
		}));
	}, []);

	// Update day closing time
	const updateCloseTime = useCallback((day, closeTime) => {
		setHours(prev => ({
			...prev,
			[day]: { ...prev[day], close: closeTime },
		}));
	}, []);

	// Update entire day hours
	const updateDayHours = useCallback((day, dayHours) => {
		setHours(prev => ({
			...prev,
			[day]: dayHours,
		}));
	}, []);

	// Set same hours for multiple days
	const setSameHoursForDays = useCallback((days, hourSettings) => {
		setHours(prev => {
			const updated = { ...prev };
			days.forEach(day => {
				updated[day] = { ...updated[day], ...hourSettings };
			});
			return updated;
		});

		toast({
			title: "Hours Updated",
			description: `Hours updated for ${days.join(", ")}.`,
		});
	}, []);

	// Copy hours from one day to another
	const copyHours = useCallback((fromDay, toDay) => {
		setHours(prev => ({
			...prev,
			[toDay]: { ...prev[fromDay] },
		}));

		toast({
			title: "Hours Copied",
			description: `${fromDay} hours copied to ${toDay}.`,
		});
	}, []);

	// Set standard business hours (Mon-Fri 9-5)
	const setStandardHours = useCallback(() => {
		const standardHours = {
			monday: { isOpen: true, open: "09:00", close: "17:00" },
			tuesday: { isOpen: true, open: "09:00", close: "17:00" },
			wednesday: { isOpen: true, open: "09:00", close: "17:00" },
			thursday: { isOpen: true, open: "09:00", close: "17:00" },
			friday: { isOpen: true, open: "09:00", close: "17:00" },
			saturday: { isOpen: false, open: "09:00", close: "17:00" },
			sunday: { isOpen: false, open: "09:00", close: "17:00" },
		};

		setHours(standardHours);
		
		toast({
			title: "Standard Hours Set",
			description: "Business hours set to Monday-Friday 9AM-5PM.",
		});
	}, []);

	// Set 24/7 hours
	const set24Hours = useCallback(() => {
		const allDayHours = {
			monday: { isOpen: true, open: "00:00", close: "23:59" },
			tuesday: { isOpen: true, open: "00:00", close: "23:59" },
			wednesday: { isOpen: true, open: "00:00", close: "23:59" },
			thursday: { isOpen: true, open: "00:00", close: "23:59" },
			friday: { isOpen: true, open: "00:00", close: "23:59" },
			saturday: { isOpen: true, open: "00:00", close: "23:59" },
			sunday: { isOpen: true, open: "00:00", close: "23:59" },
		};

		setHours(allDayHours);
		
		toast({
			title: "24/7 Hours Set",
			description: "Business hours set to 24/7 operation.",
		});
	}, []);

	// Add special hours (for holidays, events, etc.)
	const addSpecialHours = useCallback((date, hourSettings, description = "") => {
		const newSpecialHour = {
			id: Date.now(),
			date,
			...hourSettings,
			description,
		};

		setSpecialHours(prev => [...prev, newSpecialHour]);
		
		toast({
			title: "Special Hours Added",
			description: `Special hours added for ${date}.`,
		});
	}, []);

	// Remove special hours
	const removeSpecialHours = useCallback((specialHourId) => {
		setSpecialHours(prev => prev.filter(sh => sh.id !== specialHourId));
		
		toast({
			title: "Special Hours Removed",
			description: "Special hours have been removed.",
		});
	}, []);

	// Add holiday
	const addHoliday = useCallback((date, name, description = "") => {
		const newHoliday = {
			id: Date.now(),
			date,
			name,
			description,
			isClosed: true,
		};

		setHolidays(prev => [...prev, newHoliday]);
		
		toast({
			title: "Holiday Added",
			description: `${name} added to holiday calendar.`,
		});
	}, []);

	// Remove holiday
	const removeHoliday = useCallback((holidayId) => {
		setHolidays(prev => prev.filter(h => h.id !== holidayId));
		
		toast({
			title: "Holiday Removed",
			description: "Holiday has been removed.",
		});
	}, []);

	// Validate hours
	const validateHours = useCallback(() => {
		const errors = [];
		
		Object.entries(hours).forEach(([day, dayHours]) => {
			if (dayHours.isOpen) {
				if (!dayHours.open || !dayHours.close) {
					errors.push(`${day}: Opening and closing times are required`);
				} else if (dayHours.open >= dayHours.close) {
					errors.push(`${day}: Opening time must be before closing time`);
				}
			}
		});

		return {
			isValid: errors.length === 0,
			errors,
		};
	}, [hours]);

	// Get current day status
	const getCurrentDayStatus = useCallback(() => {
		const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		const currentDay = dayNames[new Date().getDay()];
		
		return {
			day: currentDay,
			hours: hours[currentDay],
			isOpen: isCurrentlyOpen(),
		};
	}, [hours]);

	// Check if currently open
	const isCurrentlyOpen = useCallback(() => {
		const now = new Date();
		const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		const currentDay = dayNames[now.getDay()];
		const currentDayHours = hours[currentDay];
		
		if (!currentDayHours.isOpen) return false;
		
		const currentTime = now.getHours() * 60 + now.getMinutes();
		const [openHour, openMin] = currentDayHours.open.split(":").map(Number);
		const [closeHour, closeMin] = currentDayHours.close.split(":").map(Number);
		
		const openTime = openHour * 60 + openMin;
		const closeTime = closeHour * 60 + closeMin;
		
		return currentTime >= openTime && currentTime <= closeTime;
	}, [hours]);

	// Get next opening time
	const getNextOpeningTime = useCallback(() => {
		const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		const today = new Date().getDay();
		
		for (let i = 0; i < 7; i++) {
			const dayIndex = (today + i) % 7;
			const dayName = dayNames[dayIndex];
			const dayHours = hours[dayName];
			
			if (dayHours.isOpen) {
				const isToday = i === 0;
				const now = new Date();
				const currentTime = now.getHours() * 60 + now.getMinutes();
				const [openHour, openMin] = dayHours.open.split(":").map(Number);
				const openTime = openHour * 60 + openMin;
				
				if (!isToday || currentTime < openTime) {
					return {
						day: dayName,
						time: dayHours.open,
						isToday,
					};
				}
			}
		}
		
		return null;
	}, [hours]);

	// Get business hours summary
	const getHoursSummary = useCallback(() => {
		const openDays = Object.entries(hours).filter(([day, dayHours]) => dayHours.isOpen);
		const totalOpenDays = openDays.length;
		const closedDays = 7 - totalOpenDays;
		
		// Check if all open days have same hours
		const firstOpenDay = openDays[0];
		const hasSameHours = openDays.every(([day, dayHours]) => 
			dayHours.open === firstOpenDay[1].open && dayHours.close === firstOpenDay[1].close
		);
		
		return {
			totalOpenDays,
			closedDays,
			hasSameHours,
			is24_7: totalOpenDays === 7 && hasSameHours && 
					firstOpenDay[1].open === "00:00" && firstOpenDay[1].close === "23:59",
			isStandardBusiness: totalOpenDays === 5 && hasSameHours &&
					firstOpenDay[1].open === "09:00" && firstOpenDay[1].close === "17:00" &&
					!hours.saturday.isOpen && !hours.sunday.isOpen,
		};
	}, [hours]);

	// Format hours for display
	const formatHoursForDisplay = useCallback((time) => {
		const [hour, minute] = time.split(":").map(Number);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
	}, []);

	return {
		// State
		hours,
		specialHours,
		holidays,
		
		// Day Hours Actions
		updateDayStatus,
		updateOpenTime,
		updateCloseTime,
		updateDayHours,
		copyHours,
		
		// Bulk Actions
		setSameHoursForDays,
		setStandardHours,
		set24Hours,
		
		// Special Hours & Holidays
		addSpecialHours,
		removeSpecialHours,
		addHoliday,
		removeHoliday,
		
		// Validation & Status
		validateHours,
		getCurrentDayStatus,
		isCurrentlyOpen,
		getNextOpeningTime,
		
		// Utilities
		getHoursSummary,
		formatHoursForDisplay,
		
		// Computed Values
		currentStatus: getCurrentDayStatus(),
		summary: getHoursSummary(),
		isValid: validateHours().isValid,
	};
};
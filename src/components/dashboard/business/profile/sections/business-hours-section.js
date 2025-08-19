/**
 * BusinessHoursSection Component
 * Business profile operating hours management section
 * Extracted from large profile page for better organization
 */

"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { Badge } from "@components/ui/badge";
import { Clock, Copy, Zap, Sun, Moon } from "lucide-react";

// Import custom hook
import { useBusinessHours } from "@lib/hooks/business/profile/use-business-hours";

const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayLabels = {
	monday: "Monday",
	tuesday: "Tuesday", 
	wednesday: "Wednesday",
	thursday: "Thursday",
	friday: "Friday",
	saturday: "Saturday",
	sunday: "Sunday",
};

export const BusinessHoursSection = ({ 
	initialHours,
	onSave 
}) => {
	const {
		hours,
		updateDayStatus,
		updateOpenTime,
		updateCloseTime,
		copyHours,
		setStandardHours,
		set24Hours,
		validateHours,
		currentStatus,
		summary,
		formatHoursForDisplay,
		isCurrentlyOpen,
	} = useBusinessHours(initialHours);

	const handleSave = () => {
		const validation = validateHours();
		if (validation.isValid) {
			onSave?.(hours);
		}
	};

	return (
		<div className="space-y-6">
			{/* Hours Overview */}
			<Card suppressHydrationWarning>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Clock className="w-5 h-5" />
						<span>Business Hours</span>
						{isCurrentlyOpen() ? (
							<Badge className="bg-success/10 text-success">
								<Sun className="w-3 h-3 mr-1" />
								Open Now
							</Badge>
						) : (
							<Badge variant="secondary" className="bg-muted text-muted-foreground">
								<Moon className="w-3 h-3 mr-1" />
								Closed
							</Badge>
						)}
					</CardTitle>
					<CardDescription>
						Set your operating hours for each day of the week. This helps customers know when to reach you.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Quick Actions */}
					<div className="flex flex-wrap gap-2 mb-6">
						<Button 
							variant="outline" 
							size="sm" 
							onClick={setStandardHours}
							className="h-8"
						>
							<Clock className="w-3 h-3 mr-1" />
							Mon-Fri 9-5
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={set24Hours}
							className="h-8"
						>
							<Zap className="w-3 h-3 mr-1" />
							24/7
						</Button>
					</div>

					{/* Hours Grid */}
					<div className="space-y-3">
						{dayNames.map((day) => (
							<DayHoursRow
								key={day}
								day={day}
								dayLabel={dayLabels[day]}
								hours={hours[day]}
								onUpdateStatus={updateDayStatus}
								onUpdateOpenTime={updateOpenTime}
								onUpdateCloseTime={updateCloseTime}
								onCopyHours={copyHours}
								formatTime={formatHoursForDisplay}
								isToday={currentStatus.day === day}
							/>
						))}
					</div>
				</CardContent>

				<CardFooter className="border-t">
					<div className="flex justify-between items-center w-full">
						<div className="flex items-center space-x-4 text-sm text-muted-foreground">
							<span>{summary.totalOpenDays} days open</span>
							<span>{summary.closedDays} days closed</span>
							{summary.is24_7 && <Badge variant="outline">24/7</Badge>}
							{summary.isStandardBusiness && <Badge variant="outline">Standard Hours</Badge>}
						</div>
						<Button onClick={handleSave}>
							Save Hours
						</Button>
					</div>
				</CardFooter>
			</Card>

			{/* Current Status */}
			<Card>
				<CardContent className="pt-6">
					<div className="text-center">
						<div className="mb-2">
							{isCurrentlyOpen() ? (
								<div className="text-success">
									<Sun className="w-8 h-8 mx-auto mb-2" />
									<h3 className="text-lg font-semibold">Currently Open</h3>
									<p className="text-sm text-muted-foreground">
										Open until {formatHoursForDisplay(currentStatus.hours.close)} today
									</p>
								</div>
							) : (
								<div className="text-muted-foreground">
									<Moon className="w-8 h-8 mx-auto mb-2" />
									<h3 className="text-lg font-semibold">Currently Closed</h3>
									<p className="text-sm text-muted-foreground">
										{currentStatus.hours.isOpen 
											? `Opens at ${formatHoursForDisplay(currentStatus.hours.open)} today`
											: "Closed today"
										}
									</p>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

// Individual Day Hours Row Component
const DayHoursRow = ({ 
	day, 
	dayLabel, 
	hours, 
	onUpdateStatus, 
	onUpdateOpenTime, 
	onUpdateCloseTime,
	onCopyHours,
	formatTime,
	isToday 
}) => {
	return (
		<div className={`flex items-center p-3 space-x-4 rounded-lg border transition-colors ${
			isToday ? "border-primary/50 bg-primary/5" : "border-border"
		}`}>
			{/* Day Label */}
			<div className="w-24">
				<Label className={`font-medium capitalize ${isToday ? "text-primary" : ""}`}>
					{dayLabel}
					{isToday && <span className="ml-1 text-xs text-primary">(Today)</span>}
				</Label>
			</div>

			{/* Open/Closed Switch */}
			<Switch
				checked={hours.isOpen}
				onCheckedChange={(checked) => onUpdateStatus(day, checked)}
			/>

			{/* Time Inputs or Closed Status */}
			<div className="flex-1">
				{hours.isOpen ? (
					<div className="flex items-center space-x-2">
						<Input
							type="time"
							value={hours.open}
							onChange={(e) => onUpdateOpenTime(day, e.target.value)}
							className="w-32 h-8"
						/>
						<span className="text-muted-foreground text-sm">to</span>
						<Input
							type="time"
							value={hours.close}
							onChange={(e) => onUpdateCloseTime(day, e.target.value)}
							className="w-32 h-8"
						/>
						<span className="text-sm text-muted-foreground">
							({formatTime(hours.open)} - {formatTime(hours.close)})
						</span>
					</div>
				) : (
					<span className="text-muted-foreground">Closed</span>
				)}
			</div>

			{/* Copy Hours Action */}
			{hours.isOpen && (
				<div className="opacity-0 group-hover:opacity-100 transition-opacity">
					<Button 
						variant="ghost" 
						size="sm" 
						className="h-8 w-8 p-0"
						title={`Copy ${dayLabel} hours to other days`}
					>
						<Copy className="w-3 h-3" />
					</Button>
				</div>
			)}
		</div>
	);
};
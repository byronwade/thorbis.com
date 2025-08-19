/**
 * Budget & Schedule Section
 * Extracted from ads create/edit pages (678/804 lines)
 * Handles budget settings, duration, and campaign scheduling
 * Enterprise-level component with cost estimation and optimization
 */

"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Separator } from "@components/ui/separator";
import { Slider } from "@components/ui/slider";
import { CreditCard, Calendar, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle, Zap, Target } from "lucide-react";

// Budget recommendation helper
const getBudgetRecommendation = (businessType, location, competition = "medium") => {
	const baseBudgets = {
		plumbing: { min: 30, recommended: 75, max: 200 },
		electrical: { min: 25, recommended: 60, max: 150 },
		cleaning: { min: 20, recommended: 45, max: 120 },
		dental: { min: 50, recommended: 150, max: 500 },
		automotive: { min: 35, recommended: 80, max: 250 },
		hvac: { min: 40, recommended: 100, max: 300 },
		roofing: { min: 45, recommended: 120, max: 400 },
		lawn: { min: 15, recommended: 35, max: 100 },
	};

	const budget = baseBudgets[businessType] || baseBudgets.plumbing;

	// Adjust for competition
	const competitionMultiplier = { low: 0.8, medium: 1.0, high: 1.3 };
	const multiplier = competitionMultiplier[competition];

	return {
		min: Math.round(budget.min * multiplier),
		recommended: Math.round(budget.recommended * multiplier),
		max: Math.round(budget.max * multiplier),
	};
};

// Performance estimation component
const PerformanceEstimation = ({ budget, duration, keywords, location }) => {
	const estimation = useMemo(() => {
		// Mock calculation - in real app, this would use ML models or API
		const keywordCount = keywords?.split(",").length || 1;
		const dailyBudget = budget / duration;

		// Base metrics
		const avgCPC = 2.5 + Math.random() * 2; // $2.50 - $4.50
		const estimatedClicks = Math.round((budget / avgCPC) * 0.8);
		const estimatedImpressions = Math.round(estimatedClicks * (15 + Math.random() * 10));
		const estimatedCTR = ((estimatedClicks / estimatedImpressions) * 100).toFixed(2);

		return {
			impressions: estimatedImpressions,
			clicks: estimatedClicks,
			ctr: estimatedCTR,
			cpc: avgCPC.toFixed(2),
			dailyBudget: dailyBudget.toFixed(2),
		};
	}, [budget, duration, keywords]);

	return (
		<Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<TrendingUp className="w-5 h-5 text-success" />
					Performance Forecast
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center">
						<p className="text-2xl font-bold text-success">{estimation.impressions.toLocaleString()}</p>
						<p className="text-xs text-success/70">Estimated Impressions</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-primary">{estimation.clicks.toLocaleString()}</p>
						<p className="text-xs text-primary/70">Estimated Clicks</p>
					</div>
				</div>

				<Separator />

				<div className="space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Click-through rate:</span>
						<span className="font-medium">{estimation.ctr}%</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Avg. cost per click:</span>
						<span className="font-medium">${estimation.cpc}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Daily budget:</span>
						<span className="font-medium">${estimation.dailyBudget}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

// Budget recommendation component
const BudgetRecommendation = ({ businessType, currentBudget, onBudgetSelect }) => {
	const recommendation = getBudgetRecommendation(businessType);

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Target className="w-4 h-4 text-primary" />
				<span className="text-sm font-medium">Recommended Budgets</span>
			</div>

			<div className="grid grid-cols-3 gap-2">
				<div className={`p-3 rounded-lg border cursor-pointer transition-colors ${currentBudget <= recommendation.min ? "border-primary bg-blue-50" : "border-border hover:border-border"}`} onClick={() => onBudgetSelect(recommendation.min)}>
					<p className="text-sm font-medium">Starter</p>
					<p className="text-lg font-bold">${recommendation.min}</p>
					<p className="text-xs text-muted-foreground">Conservative</p>
				</div>

				<div className={`p-3 rounded-lg border cursor-pointer transition-colors ${currentBudget === recommendation.recommended ? "border-green-500 bg-green-50" : "border-border hover:border-border"}`} onClick={() => onBudgetSelect(recommendation.recommended)}>
					<p className="text-sm font-medium">Recommended</p>
					<p className="text-lg font-bold text-success">${recommendation.recommended}</p>
					<p className="text-xs text-muted-foreground">Best results</p>
				</div>

				<div className={`p-3 rounded-lg border cursor-pointer transition-colors ${currentBudget >= recommendation.max ? "border-purple-500 bg-purple-50" : "border-border hover:border-border"}`} onClick={() => onBudgetSelect(recommendation.max)}>
					<p className="text-sm font-medium">Aggressive</p>
					<p className="text-lg font-bold">${recommendation.max}</p>
					<p className="text-xs text-muted-foreground">Maximum reach</p>
				</div>
			</div>
		</div>
	);
};

// Days of week selector
const DaysSelector = ({ selectedDays, onDaysChange }) => {
	const days = [
		{ id: "monday", label: "Mon", full: "Monday" },
		{ id: "tuesday", label: "Tue", full: "Tuesday" },
		{ id: "wednesday", label: "Wed", full: "Wednesday" },
		{ id: "thursday", label: "Thu", full: "Thursday" },
		{ id: "friday", label: "Fri", full: "Friday" },
		{ id: "saturday", label: "Sat", full: "Saturday" },
		{ id: "sunday", label: "Sun", full: "Sunday" },
	];

	const toggleDay = (dayId) => {
		const updatedDays = selectedDays.includes(dayId) ? selectedDays.filter((d) => d !== dayId) : [...selectedDays, dayId];
		onDaysChange(updatedDays);
	};

	return (
		<div className="flex gap-1">
			{days.map((day) => (
				<button key={day.id} type="button" className={`px-3 py-2 text-sm rounded-md border transition-colors ${selectedDays.includes(day.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border"}`} onClick={() => toggleDay(day.id)} title={day.full}>
					{day.label}
				</button>
			))}
		</div>
	);
};

export const BudgetScheduleSection = ({
	// Data props
	budgetData,
	scheduleData,
	errors = {},
	businessType = "plumbing",
	keywords = "",
	location = "",

	// Event handlers
	onUpdateBudget,
	onUpdateSchedule,
	onValidation,

	// Configuration
	showPerformanceEstimation = true,
	showBudgetRecommendations = true,
	className = "",
}) => {
	const { budget, duration } = budgetData;
	const { startDate, endDate, timeOfDay, daysOfWeek } = scheduleData;

	// Handle budget updates
	const handleBudgetUpdate = (field, value) => {
		onUpdateBudget(field, value);

		if (onValidation) {
			onValidation(`budget.${field}`, value);
		}
	};

	// Handle schedule updates
	const handleScheduleUpdate = (field, value) => {
		onUpdateSchedule(field, value);

		if (onValidation) {
			onValidation(`schedule.${field}`, value);
		}
	};

	// Calculate total budget
	const totalBudget = budget * duration;

	// Check if section is complete
	const isSectionComplete = budget > 0 && duration > 0 && startDate && endDate;

	return (
		<div className={`space-y-6 ${className}`}>
			<Card className="bg-card/90 dark:bg-card/80 shadow-lg border border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="w-5 h-5 text-primary" />
						Budget & Schedule
						{isSectionComplete && <CheckCircle className="w-4 h-4 text-success" />}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Budget Settings */}
						<div className="space-y-4">
							<div>
								<Label htmlFor="budget" className="flex items-center gap-2">
									Daily Budget *
									<DollarSign className="w-4 h-4 text-muted-foreground" />
								</Label>
								<div className="space-y-2">
									<Input id="budget" type="number" placeholder="50" value={budget} onChange={(e) => handleBudgetUpdate("budget", parseInt(e.target.value) || 0)} className={errors.budget ? "border-red-500 focus:border-red-500" : ""} min="1" max="1000" />
									<Slider value={[budget]} onValueChange={([value]) => handleBudgetUpdate("budget", value)} max={500} min={10} step={5} className="w-full" />
								</div>
								{errors.budget && <p className="text-sm text-destructive mt-1">{errors.budget}</p>}
							</div>

							<div>
								<Label htmlFor="duration">Campaign Duration (days)</Label>
								<Select value={duration.toString()} onValueChange={(value) => handleBudgetUpdate("duration", parseInt(value))}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="7">1 week</SelectItem>
										<SelectItem value="14">2 weeks</SelectItem>
										<SelectItem value="30">1 month</SelectItem>
										<SelectItem value="60">2 months</SelectItem>
										<SelectItem value="90">3 months</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Total Budget Display */}
							<div className="p-4 bg-muted/30 rounded-lg">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Total Campaign Budget:</span>
									<span className="text-lg font-bold">${totalBudget}</span>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									${budget}/day × {duration} days
								</p>
							</div>

							{/* Budget Recommendations */}
							{showBudgetRecommendations && <BudgetRecommendation businessType={businessType} currentBudget={budget} onBudgetSelect={(recommendedBudget) => handleBudgetUpdate("budget", recommendedBudget)} />}
						</div>

						{/* Performance Estimation */}
						{showPerformanceEstimation && (
							<div>
								<PerformanceEstimation budget={totalBudget} duration={duration} keywords={keywords} location={location} />
							</div>
						)}
					</div>

					<Separator />

					{/* Schedule Settings */}
					<div className="space-y-4">
						<div className="flex items-center gap-2 mb-4">
							<Calendar className="w-5 h-5 text-muted-foreground" />
							<Label className="text-base font-medium">Campaign Schedule</Label>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Start Date */}
							<div>
								<Label htmlFor="startDate">Start Date</Label>
								<Input id="startDate" type="date" value={startDate} onChange={(e) => handleScheduleUpdate("startDate", e.target.value)} className={errors.startDate ? "border-red-500 focus:border-red-500" : ""} min={new Date().toISOString().split("T")[0]} />
								{errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate}</p>}
							</div>

							{/* End Date */}
							<div>
								<Label htmlFor="endDate">End Date</Label>
								<Input id="endDate" type="date" value={endDate} onChange={(e) => handleScheduleUpdate("endDate", e.target.value)} className={errors.endDate ? "border-red-500 focus:border-red-500" : ""} min={startDate || new Date().toISOString().split("T")[0]} />
								{errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate}</p>}
							</div>
						</div>

						{/* Time of Day */}
						<div>
							<Label htmlFor="timeOfDay" className="flex items-center gap-2">
								Time of Day
								<Clock className="w-4 h-4 text-muted-foreground" />
							</Label>
							<Select value={timeOfDay} onValueChange={(value) => handleScheduleUpdate("timeOfDay", value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All day (24/7)</SelectItem>
									<SelectItem value="business">Business hours (9 AM - 6 PM)</SelectItem>
									<SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
									<SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
									<SelectItem value="evening">Evening (6 PM - 11 PM)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Days of Week */}
						<div>
							<Label>Days of Week</Label>
							<DaysSelector selectedDays={daysOfWeek} onDaysChange={(days) => handleScheduleUpdate("daysOfWeek", days)} />
							<p className="text-xs text-muted-foreground mt-1">Select the days when your ads should run</p>
						</div>
					</div>

					{/* Validation Summary */}
					{Object.keys(errors).length > 0 && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>Please fix the errors above before continuing.</AlertDescription>
						</Alert>
					)}

					{/* Budget optimization tip */}
					<Alert>
						<Zap className="h-4 w-4" />
						<AlertDescription>
							<strong>Pro tip:</strong> Start with our recommended budget for optimal results, then adjust based on performance.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		</div>
	);
};

export default BudgetScheduleSection;

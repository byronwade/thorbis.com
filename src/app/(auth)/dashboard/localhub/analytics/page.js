"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Calendar } from "@components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { BarChart3, Users, Eye, DollarSign, Clock, MapPin, Download, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Star, Building2, Globe, Phone, Mail, MousePointer, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@utils";

const mockAnalytics = {
	overview: {
		totalVisitors: 15420,
		visitorGrowth: 12.5,
		pageViews: 48720,
		pageViewGrowth: 8.3,
		businessViews: 12650,
		businessViewGrowth: 15.2,
		revenue: 2340,
		revenueGrowth: 18.7,
	},
	topBusinesses: [
		{ name: "Wade's Plumbing & Septic", views: 1245, contacts: 89, category: "Home Services" },
		{ name: "Downtown Coffee Roasters", views: 982, contacts: 67, category: "Restaurants" },
		{ name: "Elite Dental Care", views: 756, contacts: 45, category: "Healthcare" },
		{ name: "Fresh Market Grocery", views: 623, contacts: 34, category: "Retail" },
		{ name: "Portland Auto Repair", views: 589, contacts: 41, category: "Automotive" },
	],
	categories: [
		{ name: "Restaurants", businesses: 45, views: 8950, growth: 12.3 },
		{ name: "Home Services", businesses: 32, views: 6780, growth: 18.5 },
		{ name: "Healthcare", businesses: 28, views: 5640, growth: 8.9 },
		{ name: "Retail", businesses: 25, views: 4320, growth: 15.2 },
		{ name: "Professional Services", businesses: 22, views: 3890, growth: 6.7 },
	],
	trafficSources: [
		{ source: "Google Search", visitors: 6850, percentage: 44.4 },
		{ source: "Direct", visitors: 3920, percentage: 25.4 },
		{ source: "Social Media", visitors: 2180, percentage: 14.1 },
		{ source: "Referrals", visitors: 1650, percentage: 10.7 },
		{ source: "Email", visitors: 820, percentage: 5.3 },
	],
	deviceBreakdown: [
		{ device: "Desktop", users: 7890, percentage: 51.2 },
		{ device: "Mobile", users: 6320, percentage: 41.0 },
		{ device: "Tablet", users: 1210, percentage: 7.8 },
	],
	recentActivity: [
		{ action: "Business View", business: "Wade's Plumbing", time: "2 minutes ago", location: "Portland, OR" },
		{ action: "Contact Request", business: "Downtown Coffee", time: "5 minutes ago", location: "Portland, OR" },
		{ action: "Direction Request", business: "Elite Dental", time: "8 minutes ago", location: "Beaverton, OR" },
		{ action: "Website Click", business: "Fresh Market", time: "12 minutes ago", location: "Lake Oswego, OR" },
		{ action: "Phone Call", business: "Portland Auto", time: "15 minutes ago", location: "Tigard, OR" },
	],
};

export default function Analytics() {
	const [dateRange, setDateRange] = useState("30days");
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	useEffect(() => {
		document.title = "Analytics Dashboard - LocalHub - Thorbis";
	}, []);

	const formatGrowth = (growth) => {
		const isPositive = growth > 0;
		const IconComponent = isPositive ? ArrowUpRight : ArrowDownRight;
		const colorClass = isPositive ? "text-success" : "text-destructive";

		return (
			<span className={`text-xs flex items-center ${colorClass}`}>
				<IconComponent className="w-3 h-3 mr-1" />
				{Math.abs(growth)}%
			</span>
		);
	};

	return (
		<div className="w-full px-4 py-16 space-y-8 lg:px-24">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-4xl font-bold">Analytics Dashboard</h1>
					<p className="mt-2 text-muted-foreground">Track your directory performance, visitor engagement, and business insights.</p>
				</div>
				<div className="flex items-center gap-3">
					<Select value={dateRange} onValueChange={setDateRange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7days">Last 7 days</SelectItem>
							<SelectItem value="30days">Last 30 days</SelectItem>
							<SelectItem value="90days">Last 90 days</SelectItem>
							<SelectItem value="1year">Last year</SelectItem>
						</SelectContent>
					</Select>
					<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
						</PopoverContent>
					</Popover>
					<Button variant="outline" size="sm">
						<Download className="w-4 h-4 mr-2" />
						Export Report
					</Button>
					<Button size="sm">
						<RefreshCw className="w-4 h-4 mr-2" />
						Refresh Data
					</Button>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
						<Users className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{mockAnalytics.overview.totalVisitors.toLocaleString()}</div>
						{formatGrowth(mockAnalytics.overview.visitorGrowth)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Page Views</CardTitle>
						<Eye className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{mockAnalytics.overview.pageViews.toLocaleString()}</div>
						{formatGrowth(mockAnalytics.overview.pageViewGrowth)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Business Views</CardTitle>
						<Building2 className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{mockAnalytics.overview.businessViews.toLocaleString()}</div>
						{formatGrowth(mockAnalytics.overview.businessViewGrowth)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
						<DollarSign className="w-4 h-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${mockAnalytics.overview.revenue.toLocaleString()}</div>
						{formatGrowth(mockAnalytics.overview.revenueGrowth)}
					</CardContent>
				</Card>
			</div>

			{/* Performance Analytics */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Traffic Sources */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<BarChart3 className="w-5 h-5 mr-2" />
							Traffic Sources
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{mockAnalytics.trafficSources.map((source, index) => (
								<div key={index} className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}></div>
										<span className="font-medium">{source.source}</span>
									</div>
									<div className="text-right">
										<div className="font-bold">{source.visitors.toLocaleString()}</div>
										<div className="text-xs text-muted-foreground">{source.percentage}%</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Device Breakdown */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<MousePointer className="w-5 h-5 mr-2" />
							Device Usage
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{mockAnalytics.deviceBreakdown.map((device, index) => (
								<div key={index} className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}></div>
										<span className="font-medium">{device.device}</span>
									</div>
									<div className="text-right">
										<div className="font-bold">{device.users.toLocaleString()}</div>
										<div className="text-xs text-muted-foreground">{device.percentage}%</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Real-Time Activity */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Clock className="w-5 h-5 mr-2" />
						Real-Time Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{mockAnalytics.recentActivity.map((activity, index) => (
							<div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
									<div>
										<div className="font-medium">{activity.action}</div>
										<div className="text-sm text-muted-foreground">{activity.business}</div>
									</div>
								</div>
								<div className="text-right text-sm text-muted-foreground">
									<div className="flex items-center">
										<MapPin className="w-3 h-3 mr-1" />
										{activity.location}
									</div>
									<div>{activity.time}</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Business Analytics */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Top Performing Businesses */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Star className="w-5 h-5 mr-2" />
							Top Performing Businesses
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{mockAnalytics.topBusinesses.map((business, index) => (
								<div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
									<div className="flex-1">
										<div className="font-semibold">{business.name}</div>
										<div className="text-sm text-muted-foreground">{business.category}</div>
									</div>
									<div className="text-right">
										<div className="font-bold">{business.views} views</div>
										<div className="text-sm text-success">{business.contacts} contacts</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Category Performance */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Building2 className="w-5 h-5 mr-2" />
							Category Performance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{mockAnalytics.categories.map((category, index) => (
								<div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
									<div className="flex-1">
										<div className="font-semibold">{category.name}</div>
										<div className="text-sm text-muted-foreground">{category.businesses} businesses</div>
									</div>
									<div className="text-right">
										<div className="font-bold">{category.views.toLocaleString()} views</div>
										{formatGrowth(category.growth)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Traffic Insights */}
			<Card>
				<CardHeader>
					<CardTitle>Traffic Insights</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="p-4 border border-border rounded-lg">
							<div className="text-2xl font-bold">3.2</div>
							<div className="text-sm text-muted-foreground">Avg. Pages per Session</div>
							{formatGrowth(5.7)}
						</div>
						<div className="p-4 border border-border rounded-lg">
							<div className="text-2xl font-bold">2:34</div>
							<div className="text-sm text-muted-foreground">Avg. Session Duration</div>
							{formatGrowth(12.3)}
						</div>
						<div className="p-4 border border-border rounded-lg">
							<div className="text-2xl font-bold">42.1%</div>
							<div className="text-sm text-muted-foreground">Bounce Rate</div>
							{formatGrowth(-8.9)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* User Engagement */}
			<Card>
				<CardHeader>
					<CardTitle>User Engagement</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-4">
						<div className="p-4 border border-border rounded-lg text-center">
							<Phone className="w-6 h-6 mx-auto mb-2 text-primary" />
							<div className="text-2xl font-bold">1,245</div>
							<div className="text-sm text-muted-foreground">Phone Calls</div>
						</div>
						<div className="p-4 border border-border rounded-lg text-center">
							<Mail className="w-6 h-6 mx-auto mb-2 text-success" />
							<div className="text-2xl font-bold">892</div>
							<div className="text-sm text-muted-foreground">Email Contacts</div>
						</div>
						<div className="p-4 border border-border rounded-lg text-center">
							<Globe className="w-6 h-6 mx-auto mb-2 text-purple-500" />
							<div className="text-2xl font-bold">2,156</div>
							<div className="text-sm text-muted-foreground">Website Visits</div>
						</div>
						<div className="p-4 border border-border rounded-lg text-center">
							<MapPin className="w-6 h-6 mx-auto mb-2 text-warning" />
							<div className="text-2xl font-bold">3,421</div>
							<div className="text-sm text-muted-foreground">Directions</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Revenue Analytics */}
			<Card>
				<CardHeader>
					<CardTitle>Revenue Analytics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="p-4 border border-border rounded-lg">
							<div className="text-2xl font-bold text-success">$1,872</div>
							<div className="text-sm text-muted-foreground">Your Monthly Share (80%)</div>
							{formatGrowth(18.7)}
						</div>
						<div className="p-4 border border-border rounded-lg">
							<div className="text-2xl font-bold">$468</div>
							<div className="text-sm text-muted-foreground">Platform Fee (20%)</div>
							{formatGrowth(18.7)}
						</div>
						<div className="p-4 border border-border rounded-lg">
							<div className="text-2xl font-bold">$52</div>
							<div className="text-sm text-muted-foreground">Avg. Revenue per Business</div>
							{formatGrowth(3.2)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

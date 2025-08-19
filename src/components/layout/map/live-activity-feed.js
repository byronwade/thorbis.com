"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Activity, Star, Clock, Eye, Heart, Share2, X, Zap } from "lucide-react";

const LiveActivityFeed = ({ isOpen, onClose }) => {
	const [activities, setActivities] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const feedRef = useRef(null);

	// Mock activity data generator
	const generateMockActivity = () => {
		const activityTypes = [
			{
				type: "review",
				icon: Star,
				color: "text-warning",
				bgColor: "bg-yellow-50 dark:bg-warning/20",
				templates: ["left a 5-star review for", "reviewed", "gave 4 stars to"],
			},
			{
				type: "view",
				icon: Eye,
				color: "text-primary",
				bgColor: "bg-blue-50 dark:bg-primary/20",
				templates: ["viewed", "checked out", "looked at"],
			},
			{
				type: "share",
				icon: Share2,
				color: "text-success",
				bgColor: "bg-green-50 dark:bg-success/20",
				templates: ["shared", "recommended"],
			},
			{
				type: "favorite",
				icon: Heart,
				color: "text-destructive",
				bgColor: "bg-red-50 dark:bg-destructive/20",
				templates: ["favorited", "saved"],
			},
		];

		const businesses = ["Joe's Pizza Palace", "Smith & Sons Plumbing", "Elite Hair Salon", "Downtown Auto Repair", "Green Thumb Landscaping", "City Dental Care"];

		const users = [
			{ name: "Sarah M.", avatar: null },
			{ name: "Mike R.", avatar: null },
			{ name: "Jennifer L.", avatar: null },
			{ name: "David K.", avatar: null },
			{ name: "Lisa P.", avatar: null },
			{ name: "Tom W.", avatar: null },
		];

		const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
		const business = businesses[Math.floor(Math.random() * businesses.length)];
		const user = users[Math.floor(Math.random() * users.length)];
		const template = activityType.templates[Math.floor(Math.random() * activityType.templates.length)];

		return {
			id: Date.now() + Math.random(),
			type: activityType.type,
			icon: activityType.icon,
			color: activityType.color,
			bgColor: activityType.bgColor,
			user: user,
			business: business,
			action: template,
			timestamp: new Date(),
			isNew: true,
		};
	};

	// Initialize with some mock activities
	useEffect(() => {
		const initialActivities = Array.from({ length: 8 }, () => ({
			...generateMockActivity(),
			isNew: false,
			timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
		}));
		setActivities(initialActivities);
	}, []);

	// Simulate real-time updates
	useEffect(() => {
		if (!isOpen) return;

		const interval = setInterval(() => {
			const newActivity = generateMockActivity();
			setActivities((prev) => [newActivity, ...prev.slice(0, 19)]); // Keep only 20 activities

			// Auto-scroll to top when new activity arrives
			if (feedRef.current) {
				feedRef.current.scrollTop = 0;
			}
		}, 3000 + Math.random() * 7000); // Random interval between 3-10 seconds

		return () => clearInterval(interval);
	}, [isOpen]);

	// Mark activities as read after a delay
	useEffect(() => {
		const timer = setTimeout(() => {
			setActivities((prev) => prev.map((activity) => ({ ...activity, isNew: false })));
		}, 2000);

		return () => clearTimeout(timer);
	}, [activities]);

	const formatTimeAgo = (timestamp) => {
		const now = new Date();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);

		if (minutes < 1) return "just now";
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return timestamp.toLocaleDateString();
	};

	if (!isOpen) return null;

	return (
		<Card className="fixed top-4 right-4 w-80 max-h-96 z-50 shadow-2xl border-2">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="relative">
							<Activity className="w-5 h-5 text-primary" />
							<div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse"></div>
						</div>
						<CardTitle className="text-lg">Live Activity</CardTitle>
					</div>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="w-4 h-4" />
					</Button>
				</div>
				<div className="flex items-center space-x-2 text-sm text-muted-foreground">
					<Zap className="w-4 h-4" />
					<span>Real-time updates</span>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="h-80" ref={feedRef}>
					<div className="space-y-3 p-4">
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							</div>
						) : activities.length > 0 ? (
							activities.map((activity) => {
								const Icon = activity.icon;
								return (
									<div key={activity.id} className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-500 ${activity.isNew ? "bg-primary/10 border border-primary/20 shadow-sm" : "hover:bg-gray-50 dark:hover:bg-card"}`}>
										<Avatar className="w-8 h-8">
											<AvatarImage src={activity.user.avatar} />
											<AvatarFallback className="text-xs">
												{activity.user.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2 mb-1">
												<span className="font-medium text-sm truncate">{activity.user.name}</span>
												<div className={`p-1 rounded-full ${activity.bgColor}`}>
													<Icon className={`w-3 h-3 ${activity.color}`} />
												</div>
											</div>
											<p className="text-sm text-muted-foreground dark:text-muted-foreground leading-tight">
												{activity.action} <span className="font-medium">{activity.business}</span>
											</p>
											<div className="flex items-center space-x-2 mt-2">
												<Clock className="w-3 h-3 text-muted-foreground" />
												<span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
												{activity.isNew && (
													<Badge variant="secondary" className="text-xs px-1 py-0">
														New
													</Badge>
												)}
											</div>
										</div>
									</div>
								);
							})
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
								<p className="text-sm">No recent activity</p>
							</div>
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
};

export default LiveActivityFeed;

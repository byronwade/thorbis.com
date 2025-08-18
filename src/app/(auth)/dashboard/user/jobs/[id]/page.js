"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
// Removed Tabs import - using buttons instead per user preference
import { ArrowLeft, Clock, Users, CheckCircle, Zap, Info, Pause, Play, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Label } from "@components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import Image from "next/image";

// Mock job data - in real app this would come from API based on job ID
const mockJob = {
	id: 1,
	title: "Kitchen Faucet Replacement",
	description: "Need to replace a leaky kitchen faucet. The current one is old and beyond repair. Kitchen is easily accessible and I have all necessary shut-off valves. Looking for someone who can complete this within the week.",
	category: "Plumbing",
	budget: "$150-250",
	location: "Downtown Sacramento, CA",
	posted: "2 hours ago",
	status: "active",
	urgency: "medium",
	contractorsNotified: 4,
	responses: 2,
	views: 12,
	boosted: true,
	boostType: "premium",
	boostStatus: "active",
	boostStartDate: "2024-01-15",
	boostEndDate: "2024-02-15",
	boostCost: 25,
	remainingDays: 12,
	boostPerformance: {
		views: 245,
		applications: 18,
		clicks: 89,
		ctr: 36.3,
		conversionRate: 20.2,
		reach: 1250,
		impressions: 1890,
		engagement: 156,
	},
	boostHistory: [
		{ date: "2024-01-15", action: "Boost started", cost: 25, views: 0 },
		{ date: "2024-01-20", action: "Performance update", views: 89 },
		{ date: "2024-01-25", action: "Performance update", views: 156 },
	],
	images: ["/placeholder.svg", "/placeholder.svg"],
	timeline: "This week",
	preferredContact: "phone",
	user: {
		name: "John Smith",
		avatar: "/placeholder.svg",
		rating: 4.8,
		reviewsCount: 12,
	},
};

// Mock contractor responses
const mockResponses = [
	{
		id: 1,
		contractor: {
			name: "Mike's Plumbing Services",
			avatar: "/placeholder.svg",
			rating: 4.9,
			reviewsCount: 127,
			verified: true,
			responseTime: "Usually responds within 2 hours",
			location: "Sacramento, CA",
		},
		quote: "$180",
		message: "Hi John! I can definitely help with your kitchen faucet replacement. I have over 15 years of experience and can complete this job today if needed. I'll bring all necessary tools and parts. The quote includes labor and a quality faucet. Let me know if you'd like to discuss!",
		availability: "Available today",
		submittedAt: "1 hour ago",
		photos: ["/placeholder.svg"],
		guarantees: ["2 year warranty", "Licensed & Insured", "Same day service"],
	},
	{
		id: 2,
		contractor: {
			name: "Sacramento Pro Plumbers",
			avatar: "/placeholder.svg",
			rating: 4.7,
			reviewsCount: 89,
			verified: true,
			responseTime: "Usually responds within 4 hours",
			location: "Sacramento, CA",
		},
		quote: "$210",
		message: "Hello! I'd be happy to replace your kitchen faucet. I'm available this week and can provide a high-quality Delta or Moen faucet. Quote includes removal of old faucet, installation of new one, and cleanup. All work guaranteed.",
		availability: "Available Wednesday-Friday",
		submittedAt: "45 minutes ago",
		photos: [],
		guarantees: ["1 year warranty", "Licensed & Bonded", "Clean up included"],
	},
];

const boostTypes = [
	{
		id: "standard",
		name: "Standard Boost",
		price: 15,
		description: "Reach 10-25 more professionals",
		features: ["30-day duration", "Basic analytics", "Standard placement"],
		contractors: "10-25",
		popular: false,
	},
	{
		id: "premium",
		name: "Premium Boost",
		price: 25,
		description: "Reach 25-50 more professionals",
		features: ["30-day duration", "Advanced analytics", "Priority placement", "Featured badge"],
		contractors: "25-50",
		popular: true,
	},
	{
		id: "maximum",
		name: "Maximum Boost",
		price: 50,
		description: "Reach 50+ professionals",
		features: ["30-day duration", "Full analytics", "Top placement", "Featured badge", "Priority support"],
		contractors: "50+",
		popular: false,
	},
];

export default function JobDetailPage({ params }) {
	const [showBoostDialog, setShowBoostDialog] = useState(false);
	const [showBoostUpgradeDialog, setShowBoostUpgradeDialog] = useState(false);
	const [editing, setEditing] = useState({});
	const [boostAction, setBoostAction] = useState(""); // "pause", "resume", "upgrade"
	const job = mockJob;
	const totalCost = job.boosted ? job.boostCost : 0;

	// Inline edit handlers
	const handleEdit = (field, value) => {
		setJob((prev) => ({ ...prev, [field]: value }));
	};
	const startEdit = (field) => setEditing({ ...editing, [field]: true });
	const stopEdit = (field) => setEditing({ ...editing, [field]: false });

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
			case "in-progress":
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
			case "completed":
				return "bg-muted text-muted-foreground border-border";
			default:
				return "bg-muted text-muted-foreground border-border";
		}
	};

	const getUrgencyColor = (urgency) => {
		switch (urgency) {
			case "high":
				return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
			case "medium":
				return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
			case "low":
				return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
			default:
				return "bg-muted text-muted-foreground border-border";
		}
	};

	const getBoostTypeColor = (type) => {
		switch (type) {
			case "standard":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "premium":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
			case "maximum":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const getBoostStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "completed":
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
			case "paused":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const handleBoostAction = (action) => {
		setBoostAction(action);
		if (action === "upgrade") {
			setShowBoostUpgradeDialog(true);
		} else {
			setShowBoostDialog(true);
		}
	};

	return (
		<div className="px-4 py-16 space-y-8 w-full lg:px-24">
			{/* Header */}
			<div className="flex gap-4 items-center">
				<Link href="/dashboard/user/jobs">
					<Button variant="outline" size="sm">
						<ArrowLeft className="mr-2 w-4 h-4" />
						Back to Jobs
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
					<p className="text-muted-foreground">View your posted job details</p>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Main Info */}
				<div className="space-y-6 lg:col-span-2">
					{/* Job Details */}
					<Card>
						<CardHeader>
							<CardTitle>Job Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Job Title</Label>
								<div className="mt-1 text-base font-medium text-foreground">{job.title}</div>
							</div>
							<div>
								<Label>Category</Label>
								<div className="mt-1 text-base font-medium text-foreground">{job.category}</div>
							</div>
							<div>
								<Label>Specific Service</Label>
								<div className="mt-1 text-base font-medium text-foreground">{job.subCategory || "-"}</div>
							</div>
							<div>
								<Label>Description</Label>
								<div className="mt-1 text-base whitespace-pre-line text-muted-foreground">{job.description}</div>
							</div>
						</CardContent>
					</Card>

					{/* Boost Management Section */}
					{job.boosted && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Zap className="w-5 h-5 text-yellow-600" />
									Boost Management
								</CardTitle>
								<CardDescription>Manage your job boost and track performance</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Boost Status */}
								<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-3">
										<Badge className={getBoostTypeColor(job.boostType)}>{job.boostType.charAt(0).toUpperCase() + job.boostType.slice(1)} Boost</Badge>
										<Badge className={getBoostStatusColor(job.boostStatus)}>{job.boostStatus.charAt(0).toUpperCase() + job.boostStatus.slice(1)}</Badge>
										{job.boostStatus === "active" && (
											<div className="flex items-center gap-1 text-sm text-muted-foreground">
												<Clock className="w-4 h-4" />
												{job.remainingDays} days left
											</div>
										)}
									</div>
									<div className="flex items-center gap-2">
										{job.boostStatus === "active" && (
											<>
												<Button variant="outline" size="sm" onClick={() => handleBoostAction("pause")}>
													<Pause className="w-4 h-4 mr-1" />
													Pause
												</Button>
												<Button variant="outline" size="sm" onClick={() => handleBoostAction("upgrade")}>
													<Plus className="w-4 h-4 mr-1" />
													Upgrade
												</Button>
											</>
										)}
										{job.boostStatus === "paused" && (
											<Button variant="outline" size="sm" onClick={() => handleBoostAction("resume")}>
												<Play className="w-4 h-4 mr-1" />
												Resume
											</Button>
										)}
									</div>
								</div>

								{/* Performance Metrics */}
								<div>
									<h4 className="font-semibold mb-4">Performance Metrics</h4>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="p-3 bg-muted/30 rounded-lg">
											<div className="text-sm text-muted-foreground">Views</div>
											<div className="text-2xl font-bold">{job.boostPerformance.views.toLocaleString()}</div>
										</div>
										<div className="p-3 bg-muted/30 rounded-lg">
											<div className="text-sm text-muted-foreground">Applications</div>
											<div className="text-2xl font-bold">{job.boostPerformance.applications}</div>
										</div>
										<div className="p-3 bg-muted/30 rounded-lg">
											<div className="text-sm text-muted-foreground">CTR</div>
											<div className="text-2xl font-bold">{job.boostPerformance.ctr}%</div>
										</div>
										<div className="p-3 bg-muted/30 rounded-lg">
											<div className="text-sm text-muted-foreground">Reach</div>
											<div className="text-2xl font-bold">{job.boostPerformance.reach.toLocaleString()}</div>
										</div>
									</div>
								</div>

								{/* Boost Timeline */}
								<div>
									<h4 className="font-semibold mb-4">Boost Timeline</h4>
									<div className="space-y-3">
										{job.boostHistory.map((entry, index) => (
											<div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
												<div className="w-2 h-2 bg-primary rounded-full"></div>
												<div className="flex-1">
													<div className="font-medium">{entry.action}</div>
													<div className="text-sm text-muted-foreground">
														{new Date(entry.date).toLocaleDateString()}
														{entry.views && ` • ${entry.views.toLocaleString()} views`}
														{entry.cost && ` • ${formatCurrency(entry.cost)}`}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Boost Details */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
									<div>
										<div className="text-sm text-muted-foreground">Boost Started</div>
										<div className="font-medium">{new Date(job.boostStartDate).toLocaleDateString()}</div>
									</div>
									<div>
										<div className="text-sm text-muted-foreground">Boost Ends</div>
										<div className="font-medium">{new Date(job.boostEndDate).toLocaleDateString()}</div>
									</div>
									<div>
										<div className="text-sm text-muted-foreground">Boost Cost</div>
										<div className="font-medium">{formatCurrency(job.boostCost)}</div>
									</div>
									<div>
										<div className="text-sm text-muted-foreground">Conversion Rate</div>
										<div className="font-medium">{job.boostPerformance.conversionRate}%</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Location */}
					<Card>
						<CardHeader>
							<CardTitle>Location</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>City, State</Label>
								<div className="mt-1 text-base font-medium text-foreground">{job.location}</div>
							</div>
							<div>
								<Label>Specific Address</Label>
								<div className="mt-1 text-base text-muted-foreground">{job.address || "-"}</div>
							</div>
						</CardContent>
					</Card>

					{/* Budget & Timeline */}
					<Card>
						<CardHeader>
							<CardTitle>Budget & Timeline</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Budget</Label>
								<div className="mt-1 text-base font-medium text-foreground">{job.budget}</div>
							</div>
							<div>
								<Label>Timeline</Label>
								<div className="mt-1 text-base font-medium text-foreground">{job.timeline}</div>
							</div>
							<div>
								<Label>Urgency Level</Label>
								<div className="mt-1 text-base font-medium capitalize text-foreground">{job.urgency}</div>
							</div>
						</CardContent>
					</Card>

					{/* Project Requirements */}
					<Card>
						<CardHeader>
							<CardTitle>Project Requirements</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Project Size</Label>
								<div className="mt-1 text-base font-medium capitalize text-foreground">{job.projectSize}</div>
							</div>
							<div>
								<Label>Experience Level</Label>
								<div className="mt-1 text-base font-medium capitalize text-foreground">{job.experienceLevel}</div>
							</div>
							<div className="space-y-2">
								<Label>Professional Requirements</Label>
								<div className="flex flex-col gap-1">
									<span>{job.licensedRequired ? "Licensed required" : null}</span>
									<span>{job.insuranceRequired ? "Insurance required" : null}</span>
									<span>{job.backgroundCheckRequired ? "Background check required" : null}</span>
								</div>
							</div>
							<div>
								<Label>Additional Requirements</Label>
								<ul className="mt-1 text-base list-disc list-inside text-muted-foreground">{job.requirements && job.requirements.length > 0 ? job.requirements.map((req, i) => <li key={i}>{req}</li>) : <li>-</li>}</ul>
							</div>
						</CardContent>
					</Card>

					{/* Photo Gallery */}
					<Card>
						<CardHeader>
							<CardTitle>Photo Gallery</CardTitle>
							<CardDescription>Photos you uploaded for this job</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
									{job.images && job.images.length > 0 ? (
										job.images.map((photo, index) => (
											<div key={index} className="relative group aspect-square">
												<Image src={photo} alt={`Project photo ${index + 1}`} width={400} height={400} className="object-cover w-full h-full rounded-lg" />
											</div>
										))
									) : (
										<span className="text-muted-foreground">No photos uploaded.</span>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Contact Preferences */}
					<Card>
						<CardHeader>
							<CardTitle>Contact Preferences</CardTitle>
						</CardHeader>
						<CardContent>
							<Label>How should professionals contact you?</Label>
							<div className="mt-2 text-base font-medium capitalize text-foreground">{job.preferredContact}</div>
							<p className="mt-2 text-xs text-muted-foreground">We never sell your data. Your contact information is only shared with the professional you connect with.</p>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar Info */}
				<div className="space-y-6">
					{/* How It Works */}
					<Card>
						<CardHeader>
							<CardTitle className="flex gap-2 items-center">
								<Info className="w-5 h-5" />
								How It Works
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex gap-3">
									<div className="flex justify-center items-center w-6 h-6 text-sm font-semibold rounded-full bg-primary/5 text-primary border border-primary/20">1</div>
									<div>
										<p className="text-sm font-medium">Job Posted</p>
										<p className="text-xs text-muted-foreground">Your job is sent to 3-6 closest professionals</p>
									</div>
								</div>
								<div className="flex gap-3">
									<div className="flex justify-center items-center w-6 h-6 text-sm font-semibold rounded-full bg-primary/5 text-primary border border-primary/20">2</div>
									<div>
										<p className="text-sm font-medium">Professionals Respond</p>
										<p className="text-xs text-muted-foreground">Receive quotes and proposals within 24-48 hours</p>
									</div>
								</div>
								<div className="flex gap-3">
									<div className="flex justify-center items-center w-6 h-6 text-sm font-semibold rounded-full bg-primary/5 text-primary border border-primary/20">3</div>
									<div>
										<p className="text-sm font-medium">Choose & Connect</p>
										<p className="text-xs text-muted-foreground">Compare options and hire the best professional</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Targeting Info */}
					<Card className="border-primary/20 bg-primary/5">
						<CardHeader>
							<CardTitle className="flex gap-2 items-center text-foreground">
								<Users className="w-5 h-5" />
								Professional Targeting
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3 text-sm text-muted-foreground">
								<p>
									• <strong>Standard posts</strong> reach the 3-6 closest, highest-rated professionals in your category
								</p>
								<p>• All professionals are pre-screened and verified</p>
								<p>• Location-based matching ensures local service</p>
								<p>• Category expertise matching for quality results</p>
							</div>
						</CardContent>
					</Card>

					{/* Boost Warning */}
					<Alert className="border-orange-500/20 bg-orange-500/5">
						<Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
						<AlertDescription className="text-orange-800 dark:text-orange-200">
							<strong>Boost Warning:</strong> Boosted jobs can generate 5-10x more responses. Be prepared for many contacts and have your availability ready to discuss your project.
						</AlertDescription>
					</Alert>

					{/* Pricing Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>Standard Job Post</span>
									<span className="font-semibold">FREE</span>
								</div>
								{job.boosted && (
									<div className="flex justify-between text-primary">
										<span>Boost</span>
										<span className="font-semibold">+{formatCurrency(totalCost)}</span>
									</div>
								)}
								<hr className="my-2" />
								<div className="flex justify-between text-lg font-semibold">
									<span>Total</span>
									<span>{formatCurrency(totalCost)}</span>
								</div>
								{totalCost > 0 && <p className="text-xs text-muted-foreground">Payment was processed when you posted the job.</p>}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Boost Action Dialogs */}
			<Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{boostAction === "pause" && "Pause Boost"}
							{boostAction === "resume" && "Resume Boost"}
						</DialogTitle>
						<DialogDescription>
							{boostAction === "pause" && "Pausing your boost will stop it from reaching new professionals. You can resume it anytime."}
							{boostAction === "resume" && "Resuming your boost will continue reaching professionals until the end date."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowBoostDialog(false)}>
							Cancel
						</Button>
						<Button onClick={() => setShowBoostDialog(false)}>{boostAction === "pause" ? "Pause Boost" : "Resume Boost"}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Boost Upgrade Dialog */}
			<Dialog open={showBoostUpgradeDialog} onOpenChange={setShowBoostUpgradeDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Upgrade Your Boost</DialogTitle>
						<DialogDescription>Upgrade to a higher boost level to reach more professionals and get better results.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						{boostTypes
							.filter((type) => type.id !== job.boostType)
							.map((type) => (
								<div key={type.id} className={`p-4 rounded-lg border-2 transition-colors ${type.popular ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}>
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-lg font-semibold">{type.name}</h3>
										<div className="text-right">
											<div className="text-2xl font-bold">${type.price}</div>
											<div className="text-sm text-muted-foreground">one-time</div>
										</div>
									</div>
									<p className="text-muted-foreground mb-3">{type.description}</p>
									<div className="space-y-2 mb-4">
										{type.features.map((feature, index) => (
											<div key={index} className="flex items-center gap-2 text-sm">
												<CheckCircle className="w-4 h-4 text-green-500" />
												{feature}
											</div>
										))}
									</div>
									<div className="text-center mb-4">
										<div className="text-sm text-muted-foreground">Reaches approximately</div>
										<div className="text-lg font-semibold text-primary">{type.contractors} professionals</div>
									</div>
									{type.popular && <Badge className="w-full justify-center mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Most Popular</Badge>}
									<Button className="w-full" variant={type.popular ? "default" : "outline"}>
										Upgrade to {type.name}
									</Button>
								</div>
							))}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowBoostUpgradeDialog(false)}>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Progress } from "@components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Star, TrendingUp, MessageSquare, CheckCircle, ThumbsUp, Flag, Reply, Send, Eye, MoreVertical, Search, Calendar, Clock, User, MapPin, Phone, Mail, ExternalLink, Download, RefreshCw, Settings } from "lucide-react";
import { toast } from "@components/ui/use-toast";

// Mock data for reviews
const mockReviews = [
	{
		id: "REV001",
		customer: {
			name: "Sarah Johnson",
			email: "sarah.j@email.com",
			phone: "(555) 123-4567",
			address: "123 Oak Street, Springfield, IL 62701",
			type: "residential",
		},
		rating: 5,
		title: "Excellent HVAC Service!",
		text: "The technician was very professional and explained everything clearly. My HVAC system is running perfectly now. Highly recommend their services!",
		service: "HVAC Maintenance",
		technician: "Mike Johnson",
		jobId: "JOB123",
		platform: "google",
		date: "2024-01-20",
		status: "published",
		response: null,
		helpful: 12,
		flagged: false,
		verified: true,
		source: "automatic",
		sentiment: "positive",
		tags: ["professional", "reliable", "quality"],
		photos: ["/api/placeholder/200/150"],
	},
	{
		id: "REV002",
		customer: {
			name: "John Smith",
			email: "john.smith@email.com",
			phone: "(555) 234-5678",
			address: "456 Pine Avenue, Downtown, CA 90210",
			type: "residential",
		},
		rating: 4,
		title: "Good plumbing repair",
		text: "Fixed my kitchen sink quickly, though I had to wait a bit longer than expected for the appointment. Overall satisfied with the work quality.",
		service: "Plumbing Repair",
		technician: "David Chen",
		jobId: "JOB124",
		platform: "yelp",
		date: "2024-01-18",
		status: "published",
		response: {
			text: "Thank you for your feedback, John! We're glad we could resolve your plumbing issue. We're working on improving our scheduling to reduce wait times. We appreciate your business!",
			author: "Business Owner",
			date: "2024-01-19",
		},
		helpful: 8,
		flagged: false,
		verified: true,
		source: "manual",
		sentiment: "positive",
		tags: ["quality", "punctuality"],
		photos: [],
	},
	{
		id: "REV003",
		customer: {
			name: "TechCorp Inc.",
			email: "facilities@techcorp.com",
			phone: "(555) 345-6789",
			address: "789 Business Blvd, Corporate, TX 75201",
			type: "commercial",
		},
		rating: 2,
		title: "Disappointed with electrical work",
		text: "The electrical work took much longer than quoted and there were some issues with the final installation. Had to call them back to fix problems.",
		service: "Electrical Installation",
		technician: "Robert Wilson",
		jobId: "JOB125",
		platform: "facebook",
		date: "2024-01-15",
		status: "published",
		response: {
			text: "We sincerely apologize for the issues with your electrical installation. This doesn't meet our usual standards. Our manager will contact you directly to resolve this matter and ensure complete satisfaction.",
			author: "Management Team",
			date: "2024-01-16",
		},
		helpful: 5,
		flagged: true,
		verified: true,
		source: "automatic",
		sentiment: "negative",
		tags: ["issues", "follow-up"],
		photos: [],
	},
	{
		id: "REV004",
		customer: {
			name: "Maria Garcia",
			email: "m.garcia@email.com",
			phone: "(555) 456-7890",
			address: "321 Elm Drive, Residential, FL 33101",
			type: "residential",
		},
		rating: 5,
		title: "Outstanding service plan!",
		text: "Been using their annual HVAC maintenance plan for 2 years now. Always prompt, professional, and thorough. My system has never run better!",
		service: "Annual Maintenance Plan",
		technician: "Sarah Davis",
		jobId: "JOB126",
		platform: "google",
		date: "2024-01-12",
		status: "published",
		response: {
			text: "Thank you so much, Maria! We're thrilled to hear about your positive experience with our maintenance plan. Your loyalty means everything to us!",
			author: "Customer Service",
			date: "2024-01-13",
		},
		helpful: 15,
		flagged: false,
		verified: true,
		source: "manual",
		sentiment: "positive",
		tags: ["loyalty", "maintenance", "professional"],
		photos: [],
	},
	{
		id: "REV005",
		customer: {
			name: "Alex Thompson",
			email: "alex.t@email.com",
			phone: "(555) 567-8901",
			address: "654 Maple Court, Suburban, NY 10001",
			type: "residential",
		},
		rating: 3,
		title: "Average service",
		text: "The work was done correctly but the technician seemed rushed. Communication could be better. Price was fair though.",
		service: "Drain Cleaning",
		technician: "Mike Johnson",
		jobId: "JOB127",
		platform: "yelp",
		date: "2024-01-10",
		status: "pending_response",
		response: null,
		helpful: 3,
		flagged: false,
		verified: true,
		source: "automatic",
		sentiment: "neutral",
		tags: ["communication", "pricing"],
		photos: [],
	},
	{
		id: "REV006",
		customer: {
			name: "Anonymous Customer",
			email: null,
			phone: null,
			address: "Location not provided",
			type: "unknown",
		},
		rating: 1,
		title: "Terrible experience",
		text: "They completely messed up my plumbing and refused to fix it properly. Avoid at all costs!",
		service: "Unknown",
		technician: null,
		jobId: null,
		platform: "google",
		date: "2024-01-08",
		status: "flagged",
		response: null,
		helpful: 1,
		flagged: true,
		verified: false,
		source: "external",
		sentiment: "negative",
		tags: ["unverified", "complaint"],
		photos: [],
	},
];

const platforms = {
	google: { name: "Google", color: "bg-primary/10 text-primary" },
	yelp: { name: "Yelp", color: "bg-destructive/10 text-destructive" },
	facebook: { name: "Facebook", color: "bg-indigo-100 text-indigo-800" },
	angie: { name: "Angie's List", color: "bg-success/10 text-success" },
	bbb: { name: "Better Business Bureau", color: "bg-purple-100 text-purple-800" },
};

const statusColors = {
	published: "bg-success/10 text-success",
	pending_response: "bg-warning/10 text-warning",
	flagged: "bg-destructive/10 text-destructive",
	draft: "bg-muted text-muted-foreground",
};

const sentimentColors = {
	positive: "bg-success/10 text-success",
	neutral: "bg-warning/10 text-warning",
	negative: "bg-destructive/10 text-destructive",
};

export default function ReviewsManagement() {
	const router = useRouter();
	const [reviews, setReviews] = useState(mockReviews);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRating, setSelectedRating] = useState("all");
	const [selectedPlatform, setSelectedPlatform] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedSentiment, setSelectedSentiment] = useState("all");
	const [sortBy, setSortBy] = useState("date");
	const [sortOrder, setSortOrder] = useState("desc");
	const [selectedReview, setSelectedReview] = useState(null);
	const [responseText, setResponseText] = useState("");
	const [responseDialogOpen, setResponseDialogOpen] = useState(false);

	// Filter and sort reviews
	const filteredReviews = reviews
		.filter((review) => {
			if (searchTerm && !review.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) && !review.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
			if (selectedRating !== "all" && review.rating !== parseInt(selectedRating)) return false;
			if (selectedPlatform !== "all" && review.platform !== selectedPlatform) return false;
			if (selectedStatus !== "all" && review.status !== selectedStatus) return false;
			if (selectedSentiment !== "all" && review.sentiment !== selectedSentiment) return false;
			return true;
		})
		.sort((a, b) => {
			const direction = sortOrder === "asc" ? 1 : -1;
			switch (sortBy) {
				case "rating":
					return direction * (a.rating - b.rating);
				case "date":
					return direction * (new Date(a.date) - new Date(b.date));
				case "helpful":
					return direction * (a.helpful - b.helpful);
				case "customer":
					return direction * a.customer.name.localeCompare(b.customer.name);
				default:
					return 0;
			}
		});

	// Calculate summary stats
	const stats = {
		total: reviews.length,
		averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
		pending: reviews.filter((r) => r.status === "pending_response").length,
		flagged: reviews.filter((r) => r.flagged).length,
		positive: reviews.filter((r) => r.sentiment === "positive").length,
		negative: reviews.filter((r) => r.sentiment === "negative").length,
		responseRate: (reviews.filter((r) => r.response).length / reviews.length) * 100,
	};

	const ratingDistribution = {
		5: reviews.filter((r) => r.rating === 5).length,
		4: reviews.filter((r) => r.rating === 4).length,
		3: reviews.filter((r) => r.rating === 3).length,
		2: reviews.filter((r) => r.rating === 2).length,
		1: reviews.filter((r) => r.rating === 1).length,
	};

	const handleResponse = (review) => {
		setSelectedReview(review);
		setResponseText("");
		setResponseDialogOpen(true);
	};

	const submitResponse = () => {
		if (!responseText.trim()) return;

		const updatedReviews = reviews.map((r) =>
			r.id === selectedReview.id
				? {
						...r,
						response: {
							text: responseText,
							author: "Business Owner",
							date: new Date().toISOString().split("T")[0],
						},
						status: "published",
					}
				: r
		);

		setReviews(updatedReviews);
		setResponseDialogOpen(false);
		setSelectedReview(null);
		setResponseText("");

		toast({
			title: "Response Posted",
			description: "Your response has been published successfully",
		});
	};

	const handleFlag = (reviewId) => {
		const updatedReviews = reviews.map((r) => (r.id === reviewId ? { ...r, flagged: !r.flagged, status: r.flagged ? "published" : "flagged" } : r));
		setReviews(updatedReviews);
	};

	const handleHelpful = (reviewId) => {
		const updatedReviews = reviews.map((r) => (r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
		setReviews(updatedReviews);
	};

	const renderStars = (rating, size = "w-4 h-4") => {
		return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`${size} ${i < rating ? "text-warning fill-current" : "text-muted-foreground/30"}`} />);
	};

	const formatDate = (date) => new Date(date).toLocaleDateString();

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Reviews Management</h1>
					<p className="text-muted-foreground">Monitor and respond to customer reviews across all platforms</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<Download className="w-4 h-4 mr-2" />
						Export Reviews
					</Button>
					<Button variant="outline">
						<RefreshCw className="w-4 h-4 mr-2" />
						Sync Platforms
					</Button>
					<Button>
						<Settings className="w-4 h-4 mr-2" />
						Review Settings
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Reviews</p>
								<p className="text-2xl font-bold">{stats.total}</p>
							</div>
							<MessageSquare className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Avg Rating</p>
								<div className="flex items-center gap-2">
									<p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
									<div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
								</div>
							</div>
							<Star className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Pending Response</p>
								<p className="text-2xl font-bold text-warning">{stats.pending}</p>
							</div>
							<Clock className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Flagged</p>
								<p className="text-2xl font-bold text-destructive">{stats.flagged}</p>
							</div>
							<Flag className="w-8 h-8 text-destructive" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Positive</p>
								<p className="text-2xl font-bold text-success">{stats.positive}</p>
								<div className="flex items-center gap-1">
									<TrendingUp className="w-3 h-3 text-success" />
									<span className="text-xs text-success">{((stats.positive / stats.total) * 100).toFixed(0)}%</span>
								</div>
							</div>
							<ThumbsUp className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Response Rate</p>
								<p className="text-2xl font-bold">{stats.responseRate.toFixed(0)}%</p>
							</div>
							<Reply className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Rating Distribution Sidebar */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Rating Distribution</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{Object.entries(ratingDistribution)
								.reverse()
								.map(([rating, count]) => (
									<div key={rating} className="flex items-center gap-3">
										<div className="flex items-center gap-1 w-16">
											<span className="text-sm font-medium">{rating}</span>
											<Star className="w-3 h-3 text-warning fill-current" />
										</div>
										<div className="flex-1">
											<Progress value={(count / stats.total) * 100} className="h-2" />
										</div>
										<span className="text-sm text-muted-foreground w-8">{count}</span>
									</div>
								))}
						</CardContent>
					</Card>

					<Card className="mt-4">
						<CardHeader>
							<CardTitle className="text-lg">Platform Breakdown</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{Object.entries(platforms).map(([key, platform]) => {
								const count = reviews.filter((r) => r.platform === key).length;
								return (
									<div key={key} className="flex justify-between items-center">
										<Badge className={platform.color}>{platform.name}</Badge>
										<span className="text-sm font-medium">{count}</span>
									</div>
								);
							})}
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<div className="lg:col-span-3">
					{/* Filters */}
					<Card className="mb-6">
						<CardContent className="p-4">
							<div className="flex flex-wrap gap-4 items-center">
								<div className="flex-1 min-w-[200px]">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input placeholder="Search reviews..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
									</div>
								</div>

								<Select value={selectedRating} onValueChange={setSelectedRating}>
									<SelectTrigger className="w-[120px]">
										<SelectValue placeholder="Rating" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Ratings</SelectItem>
										<SelectItem value="5">5 Stars</SelectItem>
										<SelectItem value="4">4 Stars</SelectItem>
										<SelectItem value="3">3 Stars</SelectItem>
										<SelectItem value="2">2 Stars</SelectItem>
										<SelectItem value="1">1 Star</SelectItem>
									</SelectContent>
								</Select>

								<Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
									<SelectTrigger className="w-[120px]">
										<SelectValue placeholder="Platform" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Platforms</SelectItem>
										{Object.entries(platforms).map(([key, platform]) => (
											<SelectItem key={key} value={key}>
												{platform.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Select value={selectedStatus} onValueChange={setSelectedStatus}>
									<SelectTrigger className="w-[150px]">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Statuses</SelectItem>
										<SelectItem value="published">Published</SelectItem>
										<SelectItem value="pending_response">Pending Response</SelectItem>
										<SelectItem value="flagged">Flagged</SelectItem>
									</SelectContent>
								</Select>

								<Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
									<SelectTrigger className="w-[120px]">
										<SelectValue placeholder="Sentiment" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="positive">Positive</SelectItem>
										<SelectItem value="neutral">Neutral</SelectItem>
										<SelectItem value="negative">Negative</SelectItem>
									</SelectContent>
								</Select>

								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger className="w-[120px]">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="date">Date</SelectItem>
										<SelectItem value="rating">Rating</SelectItem>
										<SelectItem value="helpful">Helpful</SelectItem>
										<SelectItem value="customer">Customer</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Reviews List */}
					<div className="space-y-4">
						{filteredReviews.map((review) => (
							<Card key={review.id} className={`hover:shadow-md transition-shadow ${review.flagged ? "border-red-200 bg-red-50" : ""}`}>
								<CardContent className="p-6">
									<div className="flex justify-between items-start mb-4">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="font-semibold">{review.customer.name}</h3>
												<Badge className={platforms[review.platform].color}>{platforms[review.platform].name}</Badge>
												<Badge className={statusColors[review.status]}>{review.status.replace("_", " ")}</Badge>
												<Badge className={sentimentColors[review.sentiment]}>{review.sentiment}</Badge>
												{review.verified && (
													<Badge variant="outline" className="text-success">
														<CheckCircle className="w-3 h-3 mr-1" />
														Verified
													</Badge>
												)}
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<Calendar className="w-3 h-3" />
													{formatDate(review.date)}
												</div>
												{review.service && (
													<div className="flex items-center gap-1">
														<Settings className="w-3 h-3" />
														{review.service}
													</div>
												)}
												{review.technician && (
													<div className="flex items-center gap-1">
														<User className="w-3 h-3" />
														{review.technician}
													</div>
												)}
											</div>
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => setSelectedReview(review)}>
													<Eye className="w-4 h-4 mr-2" />
													View Details
												</DropdownMenuItem>
												{!review.response && (
													<DropdownMenuItem onClick={() => handleResponse(review)}>
														<Reply className="w-4 h-4 mr-2" />
														Respond
													</DropdownMenuItem>
												)}
												<DropdownMenuItem onClick={() => handleFlag(review.id)}>
													<Flag className="w-4 h-4 mr-2" />
													{review.flagged ? "Unflag" : "Flag"}
												</DropdownMenuItem>
												<DropdownMenuItem>
													<ExternalLink className="w-4 h-4 mr-2" />
													View on Platform
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									{/* Rating and Title */}
									<div className="mb-3">
										<div className="flex items-center gap-2 mb-2">
											<div className="flex">{renderStars(review.rating)}</div>
											<span className="font-medium text-sm">{review.rating}/5</span>
										</div>
										{review.title && <h4 className="font-medium">{review.title}</h4>}
									</div>

									{/* Review Text */}
									<p className="text-sm text-muted-foreground mb-4">{review.text}</p>

									{/* Tags */}
									{review.tags.length > 0 && (
										<div className="flex flex-wrap gap-2 mb-4">
											{review.tags.map((tag, index) => (
												<Badge key={index} variant="outline" className="text-xs">
													{tag}
												</Badge>
											))}
										</div>
									)}

									{/* Response */}
									{review.response && (
										<div className="bg-blue-50 border border-primary/30 rounded-lg p-4 mb-4">
											<div className="flex items-center gap-2 mb-2">
												<Reply className="w-4 h-4 text-primary" />
												<span className="font-medium text-primary">Response from {review.response.author}</span>
												<span className="text-xs text-primary">{formatDate(review.response.date)}</span>
											</div>
											<p className="text-sm text-primary">{review.response.text}</p>
										</div>
									)}

									{/* Actions Bar */}
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-4">
											<Button variant="ghost" size="sm" onClick={() => handleHelpful(review.id)}>
												<ThumbsUp className="w-3 h-3 mr-1" />
												Helpful ({review.helpful})
											</Button>
											{review.customer.type !== "unknown" && (
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													<Phone className="w-3 h-3" />
													<span>{review.customer.phone}</span>
												</div>
											)}
										</div>

										<div className="flex gap-2">
											{!review.response && review.status !== "flagged" && (
												<Button size="sm" onClick={() => handleResponse(review)}>
													<Reply className="w-3 h-3 mr-1" />
													Respond
												</Button>
											)}
											{review.status === "pending_response" && (
												<Badge className="bg-warning/10 text-warning">
													<Clock className="w-3 h-3 mr-1" />
													Needs Response
												</Badge>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>

			{/* Review Details Dialog */}
			{selectedReview && !responseDialogOpen && (
				<Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-3">
								Review from {selectedReview.customer.name}
								<div className="flex items-center gap-2">
									<div className="flex">{renderStars(selectedReview.rating)}</div>
									<span>{selectedReview.rating}/5</span>
								</div>
							</DialogTitle>
							<DialogDescription>
								<div className="flex items-center gap-4">
									<Badge className={platforms[selectedReview.platform].color}>{platforms[selectedReview.platform].name}</Badge>
									<Badge className={statusColors[selectedReview.status]}>{selectedReview.status.replace("_", " ")}</Badge>
									<span>{formatDate(selectedReview.date)}</span>
								</div>
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="font-medium mb-2">Customer Information</h4>
									<div className="space-y-1 text-sm">
										<div className="flex items-center gap-2">
											<User className="w-3 h-3 text-muted-foreground" />
											<span>{selectedReview.customer.name}</span>
										</div>
										{selectedReview.customer.email && (
											<div className="flex items-center gap-2">
												<Mail className="w-3 h-3 text-muted-foreground" />
												<span>{selectedReview.customer.email}</span>
											</div>
										)}
										{selectedReview.customer.phone && (
											<div className="flex items-center gap-2">
												<Phone className="w-3 h-3 text-muted-foreground" />
												<span>{selectedReview.customer.phone}</span>
											</div>
										)}
										<div className="flex items-center gap-2">
											<MapPin className="w-3 h-3 text-muted-foreground" />
											<span>{selectedReview.customer.address}</span>
										</div>
									</div>
								</div>

								<div>
									<h4 className="font-medium mb-2">Service Details</h4>
									<div className="space-y-1 text-sm">
										{selectedReview.service && (
											<div>
												<span className="text-muted-foreground">Service:</span> {selectedReview.service}
											</div>
										)}
										{selectedReview.technician && (
											<div>
												<span className="text-muted-foreground">Technician:</span> {selectedReview.technician}
											</div>
										)}
										{selectedReview.jobId && (
											<div>
												<span className="text-muted-foreground">Job ID:</span> {selectedReview.jobId}
											</div>
										)}
										<div>
											<span className="text-muted-foreground">Verified:</span> {selectedReview.verified ? "Yes" : "No"}
										</div>
									</div>
								</div>
							</div>

							{selectedReview.title && (
								<div>
									<h4 className="font-medium mb-2">Review Title</h4>
									<p className="text-sm">{selectedReview.title}</p>
								</div>
							)}

							<div>
								<h4 className="font-medium mb-2">Review Content</h4>
								<p className="text-sm">{selectedReview.text}</p>
							</div>

							{selectedReview.tags.length > 0 && (
								<div>
									<h4 className="font-medium mb-2">Tags</h4>
									<div className="flex flex-wrap gap-2">
										{selectedReview.tags.map((tag, index) => (
											<Badge key={index} variant="outline">
												{tag}
											</Badge>
										))}
									</div>
								</div>
							)}

							{selectedReview.response && (
								<div>
									<h4 className="font-medium mb-2">Your Response</h4>
									<div className="bg-blue-50 border border-primary/30 rounded-lg p-4">
										<div className="flex items-center gap-2 mb-2">
											<span className="font-medium text-primary">{selectedReview.response.author}</span>
											<span className="text-xs text-primary">{formatDate(selectedReview.response.date)}</span>
										</div>
										<p className="text-sm text-primary">{selectedReview.response.text}</p>
									</div>
								</div>
							)}
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => setSelectedReview(null)}>
								Close
							</Button>
							{!selectedReview.response && (
								<Button
									onClick={() => {
										setResponseDialogOpen(true);
									}}
								>
									<Reply className="w-4 h-4 mr-2" />
									Respond
								</Button>
							)}
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Response Dialog */}
			<Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Respond to Review</DialogTitle>
						<DialogDescription>
							{selectedReview && (
								<div>
									<div className="flex items-center gap-2 mb-2">
										<div className="flex">{renderStars(selectedReview.rating)}</div>
										<span>
											{selectedReview.rating}/5 from {selectedReview.customer.name}
										</span>
									</div>
									<p className="text-sm italic">"{selectedReview.text}"</p>
								</div>
							)}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label htmlFor="response">Your Response</Label>
							<Textarea id="response" placeholder="Write your response to this review..." value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={4} />
						</div>

						<div className="text-sm text-muted-foreground">
							<p>Tips for responding to reviews:</p>
							<ul className="list-disc pl-5 mt-1">
								<li>Thank the customer for their feedback</li>
								<li>Address specific concerns mentioned</li>
								<li>Offer solutions or next steps</li>
								<li>Keep it professional and friendly</li>
							</ul>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={submitResponse} disabled={!responseText.trim()}>
							<Send className="w-4 h-4 mr-2" />
							Post Response
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

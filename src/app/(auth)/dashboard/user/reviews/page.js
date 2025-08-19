"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Search, Star, Calendar, MapPin, Edit, Trash2, ExternalLink, Shield, CheckCircle, Upload, Camera, Copy } from "react-feather";
import Image from "next/image";

export default function Reviews() {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterRating, setFilterRating] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");
	const [editingReview, setEditingReview] = useState(null);

	React.useEffect(() => {
		document.title = "My Reviews - User Dashboard - Thorbis";
	}, []);
	const [editForm, setEditForm] = useState({
		rating: 5,
		title: "",
		content: "",
		photos: [],
	});

	useEffect(() => {
		document.title = "My Reviews - User Dashboard - Thorbis";
	}, []);

	// Mock reviews data - in real app this would come from API
	const reviews = useMemo(
		() => [
			{
				id: 1,
				businessId: "biz_001",
				businessName: "Wade&apos;s Plumbing & Septic",
				businessLogo: "/placeholder.svg",
				rating: 5,
				title: "Excellent emergency plumbing service",
				content: "Called at 2 AM with a burst pipe emergency. They arrived within 30 minutes and fixed everything professionally. Fair pricing and very knowledgeable. Highly recommend!",
				photos: ["/placeholder.svg", "/placeholder.svg"],
				date: "2024-01-14T16:45:00Z",
				location: "Local",
				amount: "$150",
				status: "verified",
				blockchainHash: "0x1234567890abcdef1234567890abcdef12345678",
				blockchainTxId: "0xabc123def456...",
				verifiedAt: "2024-01-14T17:00:00Z",
				helpfulCount: 12,
				responseCount: 1,
				canEdit: true,
				canDelete: true,
			},
			{
				id: 2,
				businessId: "biz_002",
				businessName: "Sparkle Clean Pro",
				businessLogo: "/placeholder.svg",
				rating: 4,
				title: "Great cleaning service, very thorough",
				content: "They did an excellent job cleaning our office. Very professional team, arrived on time, and left everything spotless. Would definitely use again.",
				photos: ["/placeholder.svg"],
				date: "2024-01-09T13:45:00Z",
				location: "Local",
				amount: "$120",
				status: "verified",
				blockchainHash: "0x876543210fedcba9876543210fedcba9876543210",
				blockchainTxId: "0xdef456abc789...",
				verifiedAt: "2024-01-09T14:00:00Z",
				helpfulCount: 8,
				responseCount: 0,
				canEdit: true,
				canDelete: true,
			},
			{
				id: 3,
				businessId: "biz_003",
				businessName: "Sweet Treats Bakery",
				businessLogo: "/placeholder.svg",
				rating: 5,
				title: "Amazing wedding cake!",
				content: "Ordered our wedding cake from Sweet Treats and it was absolutely perfect! Not only did it look beautiful, but it tasted incredible. All our guests raved about it.",
				photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
				date: "2024-01-12T14:20:00Z",
				location: "Local",
				amount: "$300",
				status: "pending_verification",
				blockchainHash: null,
				blockchainTxId: null,
				verifiedAt: null,
				helpfulCount: 0,
				responseCount: 0,
				canEdit: true,
				canDelete: true,
			},
			{
				id: 4,
				businessId: "biz_004",
				businessName: "Tech Solutions Inc.",
				businessLogo: "/placeholder.svg",
				rating: 3,
				title: "Good work but communication could improve",
				content: "The technical work was solid and delivered on time. However, communication throughout the project was lacking. Would have appreciated more regular updates.",
				photos: [],
				date: "2024-01-05T10:30:00Z",
				location: "Remote",
				amount: "$800",
				status: "verified",
				blockchainHash: "0xfedcba0987654321fedcba0987654321fedcba09",
				blockchainTxId: "0x789abc123def...",
				verifiedAt: "2024-01-05T11:00:00Z",
				helpfulCount: 5,
				responseCount: 1,
				canEdit: false,
				canDelete: false,
			},
		],
		[]
	);

	const filteredReviews = useMemo(() => {
		return reviews.filter((review) => {
			const matchesSearch = review.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || review.title.toLowerCase().includes(searchTerm.toLowerCase()) || review.content.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesRating = filterRating === "all" || review.rating.toString() === filterRating;
			const matchesStatus = filterStatus === "all" || review.status === filterStatus;

			return matchesSearch && matchesRating && matchesStatus;
		});
	}, [reviews, searchTerm, filterRating, filterStatus]);

	const getStatusColor = (status) => {
		switch (status) {
			case "verified":
				return "bg-success/10 text-success dark:bg-success dark:text-success/90";
			case "pending_verification":
				return "bg-warning/10 text-warning dark:bg-warning dark:text-warning/90";
			case "failed_verification":
				return "bg-destructive/10 text-destructive dark:bg-destructive dark:text-destructive/90";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case "verified":
				return "Blockchain Verified";
			case "pending_verification":
				return "Pending Verification";
			case "failed_verification":
				return "Verification Failed";
			default:
				return status;
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		return date.toLocaleDateString();
	};

	const handleEditReview = (review) => {
		setEditingReview(review);
		setEditForm({
			rating: review.rating,
			title: review.title,
			content: review.content,
			photos: review.photos,
		});
	};

	const handleSaveEdit = () => {
		// In real app, this would update the review via API
		console.log("Saving edited review:", editForm);
		setEditingReview(null);
		setEditForm({ rating: 5, title: "", content: "", photos: [] });
	};

	const handleDeleteReview = (reviewId) => {
		// In real app, this would delete the review via API
		console.log("Deleting review:", reviewId);
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		// Could add toast notification here
	};

	return (
		<div className="w-full px-4 lg:px-24 py-16 space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between space-x-6">
				<div>
					<h1 className="text-4xl font-bold">My Reviews</h1>
					<p className="text-muted-foreground mt-2">Manage your blockchain-verified reviews</p>
				</div>
				<div className="flex items-center gap-x-3">
					<Link href="/dashboard/user/reviews/create" passHref>
						<Button size="sm">
							<Star className="w-4 h-4 mr-2" />
							Write a Review
						</Button>
					</Link>
					<Link href="/dashboard/user/activity" passHref>
						<Button variant="outline" size="sm">
							<Calendar className="w-4 h-4 mr-2" />
							View Activity
						</Button>
					</Link>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{reviews.length}</div>
						<p className="text-xs text-muted-foreground">All time reviews</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Verified Reviews</CardTitle>
						<Shield className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{reviews.filter((r) => r.status === "verified").length}</div>
						<p className="text-xs text-muted-foreground">Blockchain verified</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Rating</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}</div>
						<p className="text-xs text-muted-foreground">Out of 5 stars</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{reviews.reduce((acc, r) => acc + r.helpfulCount, 0)}</div>
						<p className="text-xs text-muted-foreground">Community helpful votes</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Filter Reviews</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input placeholder="Search reviews, businesses, or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
							</div>
						</div>
						<Select value={filterRating} onValueChange={setFilterRating}>
							<SelectTrigger className="w-full sm:w-[180px]">
								<SelectValue placeholder="Filter by rating" />
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
						<Select value={filterStatus} onValueChange={setFilterStatus}>
							<SelectTrigger className="w-full sm:w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="verified">Verified</SelectItem>
								<SelectItem value="pending_verification">Pending</SelectItem>
								<SelectItem value="failed_verification">Failed</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Reviews List */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Your Reviews</h2>
					<p className="text-sm text-muted-foreground">
						{filteredReviews.length} of {reviews.length} reviews
					</p>
				</div>

				{filteredReviews.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Search className="w-12 h-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">No reviews found</h3>
							<p className="text-muted-foreground text-center">Try adjusting your search or filters to find what you&apos;re looking for.</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{filteredReviews.map((review) => (
							<Card key={review.id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-start space-x-4">
										{/* Business Avatar */}
										<div className="flex-shrink-0">
											<Avatar className="w-12 h-12">
												<AvatarImage src={review.businessLogo} />
												<AvatarFallback>
													{review.businessName
														.split(" ")
														.map((word) => word[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
										</div>

										<div className="flex-1 min-w-0">
											{/* Header */}
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<div className="flex items-center space-x-2 mb-2">
														<h3 className="text-lg font-medium">{review.businessName}</h3>
														<Badge className={`text-xs ${getStatusColor(review.status)}`}>{getStatusLabel(review.status)}</Badge>
													</div>

													<div className="flex items-center space-x-4 text-sm text-muted-foreground">
														<div className="flex items-center space-x-1">
															<Calendar className="w-4 h-4" />
															<span>{formatDate(review.date)}</span>
														</div>
														<div className="flex items-center space-x-1">
															<MapPin className="w-4 h-4" />
															<span>{review.location}</span>
														</div>
														{review.amount && <span className="font-medium text-foreground">{review.amount}</span>}
													</div>
												</div>

												<div className="flex items-center space-x-2">
													{review.canEdit && (
														<Button variant="ghost" size="sm" onClick={() => handleEditReview(review)}>
															<Edit className="w-4 h-4" />
														</Button>
													)}
													{review.canDelete && (
														<Button variant="ghost" size="sm" onClick={() => handleDeleteReview(review.id)}>
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
													<Link href={`/biz/${review.businessId}`} passHref>
														<Button variant="ghost" size="sm">
															<ExternalLink className="w-4 h-4" />
														</Button>
													</Link>
												</div>
											</div>

											{/* Rating */}
											<div className="flex items-center space-x-2 mb-3">
												<div className="flex items-center space-x-1">
													{[1, 2, 3, 4, 5].map((star) => (
														<Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-muted-foreground text-muted-foreground" : "text-muted-foreground/30"}`} />
													))}
												</div>
												<span className="text-sm font-medium">{review.rating}/5</span>
											</div>

											{/* Review Content */}
											<div className="mb-4">
												<h4 className="font-medium mb-2">{review.title}</h4>
												<p className="text-muted-foreground">{review.content}</p>
											</div>

											{/* Photos */}
											{review.photos.length > 0 && (
												<div className="mb-4">
													<div className="flex items-center space-x-2 mb-2">
														<Camera className="w-4 h-4 text-muted-foreground" />
														<span className="text-sm text-muted-foreground">
															{review.photos.length} photo{review.photos.length !== 1 ? "s" : ""}
														</span>
													</div>
													<div className="flex space-x-2">
														{review.photos.map((photo, index) => (
															<div key={index} className="relative w-20 h-20 rounded-md bg-muted">
																<Image src={photo} alt={`Review photo ${index + 1}`} width={400} height={400} className="w-full h-full object-cover rounded-md" />
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		setEditForm({
																			...editForm,
																			photos: editForm.photos.filter((_, i) => i !== index),
																		})
																	}
																	className="absolute top-0 right-0 h-6 w-6 p-0 bg-destructive text-white hover:bg-destructive"
																>
																	×
																</Button>
															</div>
														))}
													</div>
												</div>
											)}

											{/* Blockchain Verification */}
											{review.blockchainHash && (
												<div className="mb-4 p-3 bg-green-50 dark:bg-success/20 rounded-md">
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-2">
															<Shield className="w-4 h-4 text-success dark:text-success" />
															<span className="text-sm font-medium text-success dark:text-success/90">Blockchain Verified</span>
														</div>
														<div className="flex items-center space-x-2">
															<Button variant="ghost" size="sm" onClick={() => copyToClipboard(review.blockchainHash)} className="h-6 px-2 text-xs">
																<Copy className="w-3 h-3 mr-1" />
																Hash
															</Button>
															<Button variant="ghost" size="sm" onClick={() => copyToClipboard(review.blockchainTxId)} className="h-6 px-2 text-xs">
																<Copy className="w-3 h-3 mr-1" />
																TxID
															</Button>
														</div>
													</div>
													<div className="mt-2 text-xs text-success dark:text-success font-mono">{review.blockchainHash}</div>
													<div className="text-xs text-muted-foreground">Verified on {formatDate(review.verifiedAt)}</div>
												</div>
											)}

											{/* Stats */}
											<div className="flex items-center justify-between text-sm text-muted-foreground">
												<div className="flex items-center space-x-4">
													<span>{review.helpfulCount} helpful</span>
													<span>
														{review.responseCount} response{review.responseCount !== 1 ? "s" : ""}
													</span>
												</div>
												<Link href={`/biz/${review.businessId}`} passHref>
													<Button variant="outline" size="sm">
														<ExternalLink className="w-4 h-4 mr-2" />
														View Business
													</Button>
												</Link>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Edit Review Dialog */}
			<Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Review</DialogTitle>
						<DialogDescription>Update your review for {editingReview?.businessName}. Changes will be re-verified on the blockchain.</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label htmlFor="rating">Rating</Label>
							<div className="flex items-center space-x-2 mt-2">
								{[1, 2, 3, 4, 5].map((star) => (
									<Button key={star} variant="ghost" size="sm" onClick={() => setEditForm({ ...editForm, rating: star })} className="p-1">
										<Star className={`w-6 h-6 ${star <= editForm.rating ? "fill-muted-foreground text-muted-foreground" : "text-muted-foreground/30"}`} />
									</Button>
								))}
							</div>
						</div>

						<div>
							<Label htmlFor="title">Review Title</Label>
							<Input id="title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Brief summary of your experience" />
						</div>

						<div>
							<Label htmlFor="content">Review Content</Label>
							<Textarea id="content" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} placeholder="Share your detailed experience..." rows={4} />
						</div>

						<div>
							<Label>Photos</Label>
							<div className="mt-2 flex space-x-2">
								{editForm.photos.map((photo, index) => (
									<div key={index} className="relative w-20 h-20 rounded-md bg-muted">
										<Image src={photo} alt={`Photo ${index + 1}`} width={400} height={400} className="w-full h-full object-cover rounded-md" />
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												setEditForm({
													...editForm,
													photos: editForm.photos.filter((_, i) => i !== index),
												})
											}
											className="absolute top-0 right-0 h-6 w-6 p-0 bg-destructive text-white hover:bg-destructive"
										>
											×
										</Button>
									</div>
								))}
								<Button variant="outline" size="sm" className="w-20 h-20">
									<Upload className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</div>

					<div className="flex justify-end space-x-2 mt-6">
						<Button variant="outline" onClick={() => setEditingReview(null)}>
							Cancel
						</Button>
						<Button onClick={handleSaveEdit}>Save Changes</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
 
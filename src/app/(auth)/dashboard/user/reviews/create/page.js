"use client";

import { useState } from "react";
import { Star, Building2, CheckCircle, Search, ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardHeader, CardContent } from "@components/ui/card";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { toast } from "sonner";
import BusinessSearch from "@features/auth/shared/business-search";
import Link from "next/link";
import { useAuthStore } from "@store/auth";

function ReviewForm({ business, onBack }) {
	const [rating, setRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { user } = useAuthStore();

	const name = user?.user_metadata?.full_name || user?.user_metadata?.first_name || "";
	const email = user?.email || "";

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (rating === 0) {
			toast.error("Please select a rating");
			return;
		}

		setIsSubmitting(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Review submitted:", {
				businessId: business.id,
				rating,
				comment,
				name,
				email,
			});

			setIsSubmitted(true);

			if (rating >= 4) {
				toast.success("Thank you! You can also share your review on other platforms.");
			} else {
				toast.success("Thank you for your feedback. We appreciate you helping us improve.");
			}
		} catch {
			toast.error("Failed to submit review. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<Card className="w-full max-w-2xl">
				<CardContent className="pt-6 text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 dark:bg-success">
						<CheckCircle className="h-8 w-8 text-success dark:text-success" />
					</div>
					<h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
					<p className="text-muted-foreground mb-6">Your feedback has been submitted successfully.</p>
					{rating >= 4 ? (
						<div className="space-y-4">
							<p className="text-sm">We&apos;re thrilled you had a great experience! Would you mind sharing your review on one of these platforms?</p>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
								<Button className="w-full" variant="outline">
									Share on Google
								</Button>
								<Button className="w-full" variant="outline">
									Share on Facebook
								</Button>
								<Button className="w-full" variant="outline">
									Share on Yelp
								</Button>
							</div>
						</div>
					) : (
						<p className="text-sm">We appreciate your honest feedback and will use it to improve our services.</p>
					)}
					<Button onClick={onBack} className="mt-6">
						Write another review
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-2xl relative">
			<CardHeader>
				<Button variant="ghost" size="sm" onClick={onBack} className="absolute top-4 left-4 h-8 px-2">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Search
				</Button>
				<div className="text-center pt-12">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
						<Building2 className="h-8 w-8 text-muted-foreground" />
					</div>
					<h1 className="text-2xl font-semibold">{business.name}</h1>
					<p className="mt-2 text-muted-foreground">We&apos;d love to hear about your experience</p>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<Label className="text-base font-medium">How would you rate your experience?</Label>
						<div className="mt-3 flex justify-center gap-1">
							{[1, 2, 3, 4, 5].map((star) => (
								<button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} className="p-1 transition-transform hover:scale-110">
									<Star className={`h-8 w-8 transition-colors ${star <= (hoveredRating || rating) ? "fill-yellow-400 text-warning" : "fill-muted text-muted-foreground"}`} />
								</button>
							))}
						</div>
					</div>

					<div>
						<Label htmlFor="comment">Tell us more (optional)</Label>
						<Textarea id="comment" placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="mt-2" />
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="name">Your Name</Label>
							<Input id="name" value={name} disabled className="mt-2" />
						</div>
						<div>
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} disabled className="mt-2" />
						</div>
					</div>

					<Button type="submit" className="w-full" disabled={isSubmitting || rating === 0}>
						{isSubmitting ? "Submitting..." : "Submit Review"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

export default function CreateReviewPage() {
	const [selectedBusiness, setSelectedBusiness] = useState(null);

	return (
		<div className="w-full px-4 py-8 sm:py-16 space-y-8 lg:px-24 flex items-start justify-center min-h-full">
			{selectedBusiness ? (
				<ReviewForm business={selectedBusiness} onBack={() => setSelectedBusiness(null)} />
			) : (
				<Card className="w-full max-w-2xl">
					<CardHeader>
						<div className="flex justify-start">
							<Link href="/dashboard/user/reviews">
								<Button variant="outline">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Reviews
								</Button>
							</Link>
						</div>
						<div className="text-center pt-4">
							<Search className="w-12 h-12 mx-auto text-muted-foreground" />
							<h1 className="text-3xl font-bold tracking-tight mt-4">Write a Review</h1>
							<p className="text-muted-foreground mt-2">Find a business to share your experience</p>
						</div>
					</CardHeader>
					<CardContent>
						<BusinessSearch onBusinessSelect={setSelectedBusiness} mode="review" />
					</CardContent>
				</Card>
			)}
		</div>
	);
}

import React from "react";

import { Card } from "@components/ui/card";
import { FaBuilding, FaStar, FaComment, FaImage, FaExclamationCircle } from "react-icons/fa";

export default function WhatAreYouReporting() {
	return (
		<div>
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left ">What are you reporting?</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">You can report businesses, reviews, posts, images, and other related issues.</p>
			<div className="mt-4 space-y-4">
				<Card className="relative flex flex-row px-8 py-4">
					<FaBuilding className="w-8 h-8 mr-4 text-muted-foreground dark:text-muted-foreground" />
					<div>
						<h3 className="text-lg font-semibold ">A Business</h3>
						<p className="text-sm text-muted-foreground">Report a business for Diamond Certified evaluation. Provide relevant business details and customer information.</p>
					</div>
				</Card>
				<Card className="relative flex flex-row px-8 py-4">
					<FaStar className="w-8 h-8 mr-4 text-muted-foreground dark:text-muted-foreground" />
					<div>
						<h3 className="text-lg font-semibold ">A Review</h3>
						<p className="text-sm text-muted-foreground">Report a review that you believe violates our guidelines. Provide specific details and examples.</p>
					</div>
				</Card>
				<Card className="relative flex flex-row px-8 py-4">
					<FaComment className="w-8 h-8 mr-4 text-muted-foreground dark:text-muted-foreground" />
					<div>
						<h3 className="text-lg font-semibold ">A Post</h3>
						<p className="text-sm text-muted-foreground">Report a post that you believe is inappropriate or violates our community guidelines.</p>
					</div>
				</Card>
				<Card className="relative flex flex-row px-8 py-4">
					<FaImage className="w-8 h-8 mr-4 text-muted-foreground dark:text-muted-foreground" />
					<div>
						<h3 className="text-lg font-semibold ">An Image</h3>
						<p className="text-sm text-muted-foreground">Report an image that you believe is inappropriate or violates our community guidelines.</p>
					</div>
				</Card>
				<Card className="relative flex flex-row px-8 py-4">
					<FaExclamationCircle className="w-8 h-8 mr-4 text-muted-foreground dark:text-muted-foreground" />
					<div>
						<h3 className="text-lg font-semibold ">Other</h3>
						<p className="text-sm text-muted-foreground">Report any other issues not covered by the above categories. Provide detailed information for our review.</p>
					</div>
				</Card>
			</div>
		</div>
	);
}

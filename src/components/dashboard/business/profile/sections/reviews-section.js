import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Star, Plus, CheckCircle } from "lucide-react";

export default function ReviewsSection({ profile, setProfile, isEditing }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Star className="w-5 h-5" />
					<span>Customer Reviews</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{profile.reviews.map((review, index) => (
						<div key={index} className="p-4 rounded-lg border border-border">
							<div className="flex justify-between items-center mb-2">
								<div className="flex items-center space-x-2">
									<span className="font-medium text-foreground">{review.author}</span>
									{review.verified && (
										<Badge variant="outline" className="text-xs">
											<CheckCircle className="mr-1 w-3 h-3" />
											Verified
										</Badge>
									)}
									<div className="flex items-center space-x-1">
										{Array.from({ length: review.rating }).map((_, i) => (
											<Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
										))}
									</div>
								</div>
								<span className="text-sm text-muted-foreground">{review.date}</span>
							</div>
							<h4 className="mb-1 font-medium text-foreground">{review.title}</h4>
							<p className="text-sm text-muted-foreground">{review.content}</p>
						</div>
					))}
					{isEditing && (
						<Button variant="outline" className="w-full">
							<Plus className="mr-2 w-4 h-4" />
							Add Review
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

import React from "react";

// StarIcon component for rendering stars with conditional styles
const StarIcon = ({ filled, half }) => (
	<svg className="w-4 h-4 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
		<defs>
			<linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stopColor="hsl(var(--warning))" />
				<stop offset="50%" stopColor="hsl(var(--warning))" />
				<stop offset="50%" stopColor="hsl(var(--card-foreground))" />
				<stop offset="100%" stopColor="hsl(var(--card-foreground))" />
			</linearGradient>
		</defs>
		<path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" fill={half ? "url(#starGradient)" : filled ? "hsl(var(--warning))" : "hsl(var(--card-foreground))"} />
	</svg>
);

const ReviewPost = ({ post }) => {
	const { rating = 0, content = "", date = "" } = post;

	const fullStars = Math.floor(rating);
	const halfStar = rating % 1 >= 0.5;
	const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

	return (
		<div className="px-4 leading-snug text-foreground dark:text-muted-foreground md:leading-normal">
			<div className="flex items-center mb-2">
				{/* Rating stars */}
				<div className="flex items-center">
					{/* Full stars */}
					{Array(fullStars)
						.fill()
						.map((_, index) => (
							<StarIcon key={index} filled={true} />
						))}
					{/* Half star */}
					{halfStar && <StarIcon half={true} />}
					{/* Empty stars */}
					{Array(emptyStars)
						.fill()
						.map((_, index) => (
							<StarIcon key={index} />
						))}
					<p className="text-sm font-medium text-muted-foreground ms-1 dark:text-muted-foreground">{rating.toFixed(1)}</p>
					<p className="text-sm font-medium text-muted-foreground ms-1 dark:text-muted-foreground">out of</p>
					<p className="text-sm font-medium text-muted-foreground ms-1 dark:text-muted-foreground">5</p>
				</div>
			</div>
			<p>{content}</p>
		</div>
	);
};

export default ReviewPost;

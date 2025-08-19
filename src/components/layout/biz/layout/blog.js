"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Posts data
const posts = [
	{
		id: 1,
		title: "Boost your conversion rate",
		href: "#",
		description: "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
		imageUrl: "/placeholder.svg",
		date: "Mar 16, 2020",
		datetime: "2020-03-16",
		category: { title: "Marketing", href: "#" },
		author: {
			name: "Michael Foster",
			role: "Co-Founder / CTO",
			href: "#",
			imageUrl: "/placeholder.svg",
		},
	},
	{
		id: 2,
		title: "Boost your conversion rate",
		href: "#",
		description: "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
		imageUrl: "/placeholder.svg",
		date: "Mar 16, 2020",
		datetime: "2020-03-16",
		category: { title: "Marketing", href: "#" },
		author: {
			name: "Michael Foster",
			role: "Co-Founder / CTO",
			href: "#",
			imageUrl: "/placeholder.svg",
		},
	},

	{
		id: 3,
		title: "Boost your conversion rate",
		href: "#",
		description: "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
		imageUrl: "/placeholder.svg",
		date: "Mar 16, 2020",
		datetime: "2020-03-16",
		category: { title: "Marketing", href: "#" },
		author: {
			name: "Michael Foster",
			role: "Co-Founder / CTO",
			href: "#",
			imageUrl: "/placeholder.svg",
		},
	},
	// Additional posts...
];

export function Blog() {
	const [visiblePosts, setVisiblePosts] = useState(6); // Number of posts initially visible

	const handleLoadMore = () => {
		setVisiblePosts((prevVisiblePosts) => prevVisiblePosts + 6); // Load 6 more posts
	};

	return (
		<section id="blog" className="py-4 dark:text-white">
			<div className="mb-6">
				<h2 className="mb-2 text-3xl font-bold md:text-4xl">Company Blog</h2>
				<p className="text-lg text-muted-foreground">Discover who we are and what we stand for.</p>
			</div>
			<div className="mt-6 space-y-8">
				{posts.slice(0, visiblePosts).map((post) => (
					<article key={post.id} className="relative flex flex-col gap-8 isolate lg:flex-row">
						<div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
							<Image alt="" src={post.imageUrl} width={1000} height={1000} className="absolute inset-0 object-cover w-full h-full rounded-md bg-neutral-800" objectFit="cover" />
							<div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
						</div>
						<div>
							<div className="flex items-center text-xs gap-x-4">
								<time dateTime={post.datetime} className="text-muted-foreground dark:text-muted-foreground">
									{post.date}
								</time>
								<Link href={post.category.href} className="relative z-10 rounded-full bg-primary px-3 py-1.5 font-medium text-white hover:bg-primary-light">
									{post.category.title}
								</Link>
							</div>
							<div className="relative max-w-xl group">
								<h3 className="mt-3 text-lg font-semibold leading-6 text-foreground dark:text-white group-hover:text-muted-foreground">
									<Link href={post.href}>
										<span className="absolute inset-0" />
										{post.title}
									</Link>
								</h3>
								<p className="mt-5 text-sm leading-6  text-muted-foreground">{post.description}</p>
							</div>
							<div className="flex pt-6">
								<div className="relative flex items-center gap-x-4">
									<Image alt="" src={post.author.imageUrl} width={40} height={40} className="w-10 h-10 rounded-full bg-neutral-800" />
									<div className="text-sm leading-6">
										<p className="font-semibold text-foreground dark:text-white">
											<Link href={post.author.href}>
												<span className="absolute inset-0" />
												{post.author.name}
											</Link>
										</p>
										<p className=" text-muted-foreground">{post.author.role}</p>
									</div>
								</div>
							</div>
						</div>
					</article>
				))}
			</div>
			{visiblePosts < posts.length && (
				<div className="flex justify-center mt-8">
					<button onClick={handleLoadMore} className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary">
						Load More
					</button>
				</div>
			)}
		</section>
	);
}


import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAllPosts, searchPosts, getPostsByCategory } from "@/lib/data/blog-posts";



// Generate metadata for SEO
export const revalidate = 3600; // ISR: refresh blog listing hourly

export async function generateMetadata() {
	return {
		title: "Blog - Thorbis",
		description: "Discover insights, tips, and stories about local business growth, technology, and community development.",
		keywords: "blog, local business, technology, community, insights, tips",
		openGraph: {
			title: "Blog - Thorbis",
			description: "Discover insights, tips, and stories about local business growth, technology, and community development.",
			type: "website",
			url: "https://thorbis.com/blog",
			images: ["https://thorbis.com/opengraph-image?title=Blog&description=Discover insights, tips, and stories about local business growth"],
		},
		twitter: {
			card: "summary_large_image",
			title: "Blog - Thorbis",
			description: "Discover insights, tips, and stories about local business growth, technology, and community development.",
			images: ["https://thorbis.com/twitter-image?title=Blog"],
		},
		alternates: {
			canonical: "https://thorbis.com/blog",
		},
	};
}

// Blog listing component
function BlogListing({ posts = [], total = 0, hasMore = false, currentPage = 1, searchParams = {} }) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: "Thorbis Blog",
		description: "Discover insights, tips, and stories about local business growth, technology, and community development.",
		url: "https://thorbis.com/blog",
		publisher: {
			"@type": "Organization",
			name: "Thorbis",
			logo: {
				"@type": "ImageObject",
				url: "https://thorbis.com/logos/ThorbisLogo.webp",
				width: 512,
				height: 512,
			},
		},
		blogPost: (posts || []).map((post) => ({
			"@type": "BlogPosting",
			headline: post.title,
			description: post.excerpt,
			image: post.featured_image,
			author: {
				"@type": "Person",
				name: post.author?.name || "Anonymous",
			},
			datePublished: post.published_at,
			url: `https://thorbis.com/blog/${post.slug}`,
		})),
	};

	const breadcrumbsLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Blog", item: "https://thorbis.com/blog" },
		],
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
			
			<main className="pt-8 pb-16 lg:pt-16 lg:pb-24">
				<div className="max-w-screen-xl px-4 mx-auto">
					{/* Header */}
					<div className="text-center mb-12">
						<h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">Blog</h1>
						<p className="max-w-2xl mx-auto text-xl text-muted-foreground">
							Discover insights, tips, and stories about local business growth, technology, and community development.
						</p>
					</div>

					{/* Search and Filters */}
					<div className="mb-8">
						<form method="GET" className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
							<div className="flex-1">
								<Input
									type="text"
									name="search"
									placeholder="Search articles..."
									defaultValue={searchParams.search || ""}
									className="w-full"
								/>
							</div>
							<Button type="submit" variant="outline">
								Search
							</Button>
						</form>
					</div>

					{/* Blog Posts Grid */}
					{posts && posts.length > 0 ? (
						<>
							<div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
								{(posts || []).map((post) => (
									<article key={post?.id || Math.random()} className="group">
										<Link href={`/blog/${post?.slug || '#'}'} className="block">
											{/* Featured Image */}
											{post?.featured_image ? (
												<div className="relative mb-4 overflow-hidden rounded-lg">
													<Image
														src={post.featured_image}
														alt={post?.title || 'Blog post`}
														width={640}
														height={384}
														className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
													/>
												</div>
											) : (
												<div className="mb-4 rounded-lg w-full h-48 bg-muted flex items-center justify-center">
													<span className="text-muted-foreground">No image</span>
												</div>
											)}

											{/* Content */}
											<div className="space-y-3">
												{/* Category and Tags */}
												<div className="flex items-center gap-2">
													{post?.category && (
														<Badge variant="secondary">{post.category.name}</Badge>
													)}
													{post.tags && Array.isArray(post.tags) &&
														post.tags.slice(0, 2).map((tag, index) => (
															<Badge key={index} variant="outline">
																{tag}
															</Badge>
														))}
												</div>

												{/* Title */}
												<h2 className="text-xl font-bold leading-tight group-hover:underline">
													{post?.title || "Untitled Article"}
												</h2>

												{/* Excerpt */}
												<p className="text-muted-foreground line-clamp-3">
													{post?.excerpt || "Read this article to learn more..."}
												</p>

												{/* Author and Meta */}
												<div className="flex items-center justify-between pt-2">
													<div className="flex items-center space-x-2">
														<Avatar className="w-6 h-6">
															<AvatarImage src={post?.author?.avatar_url} alt={post?.author?.name || "Anonymous"} />
															<AvatarFallback>{(post?.author?.name || "A").charAt(0)}</AvatarFallback>
														</Avatar>
														<span className="text-sm font-medium text-muted-foreground">
															{post?.author?.name || "Anonymous"}
														</span>
													</div>
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														{post?.reading_time && <span>{post.reading_time} min read</span>}
														{post?.view_count && <span>• {post.view_count} views</span>}
													</div>
												</div>

												{/* Date */}
												<time
													dateTime={post?.published_at}
													className="text-sm text-muted-foreground block"
												>
													{post?.published_at ? new Date(post.published_at).toLocaleDateString("en-US", {
														year: "numeric",
														month: "long",
														day: "numeric",
													}) : "No date"}
												</time>
											</div>
										</Link>
									</article>
								))}
							</div>

							{/* Pagination */}
							{hasMore && (
								<div className="mt-12 text-center">
									<Link href={`/blog?page=${currentPage + 1}${searchParams.search ? `&search=${searchParams.search}` : ""}`}>
										<Button variant="outline" size="lg">
											Load More Articles
										</Button>
									</Link>
								</div>
							)}
						</>
					) : (
						<div className="text-center py-12">
							<h3 className="text-xl font-semibold mb-2">No articles found</h3>
							<p className="text-muted-foreground">
								{searchParams.search
									? `No articles found matching "${searchParams.search}". Try a different search term.`
									: "No articles are currently available. Check back soon!"}
							</p>
						</div>
					)}
				</div>
			</main>

			{/* Newsletter Section */}
			<section className="py-16 bg-muted/20">
				<div className="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6">
					<div className="max-w-screen-md mx-auto sm:text-center">
						<h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
							Stay updated with our newsletter
						</h2>
						<p className="max-w-2xl mx-auto mb-8 text-muted-foreground md:mb-12 sm:text-xl">
							Get the latest insights, tips, and stories delivered to your inbox. No spam, just valuable content.
						</p>
						<form action="#">
							<div className="items-center max-w-screen-sm mx-auto mb-3 space-y-4 sm:flex sm:space-y-0 sm:gap-4">
								<div className="relative w-full">
									<label htmlFor="email" className="hidden mb-2 text-sm font-medium">
										Email address
									</label>
									<Input type="email" id="email" required placeholder="Enter your email" />
								</div>
								<div>
									<Button type="submit" className="w-full">
										Subscribe
									</Button>
								</div>
							</div>
							<div className="mx-auto max-w-screen-sm text-sm text-left text-muted-foreground">
								We care about the protection of your data.{" "}
								<Link href="/privacy" className="font-medium underline">
									Read our Privacy Policy
								</Link>
								.
							</div>
						</form>
					</div>
				</div>
			</section>
		</>
	);
}



// Main server component
export default async function BlogPage({ searchParams }) {
	const startTime = performance.now();
	
	// Parse search parameters
	const page = parseInt(searchParams.page) || 1;
	const search = searchParams.search || "";
	const category = searchParams.category || "";
	const limit = 12;
	const offset = (page - 1) * limit;

	try {
		// Get all posts from mock data
		let posts = getAllPosts();

		// Filter by category if provided
		if (category) {
			posts = getPostsByCategory(category);
		}

		// Filter by search term if provided
		if (search) {
			posts = searchPosts(search);
		}

		// Apply pagination
		const total = posts.length;
		const startIndex = offset;
		const endIndex = startIndex + limit;
		const paginatedPosts = posts.slice(startIndex, endIndex);
		const hasMore = endIndex < total;

		const duration = performance.now() - startTime;
		console.log('⚡ PERFORMANCE: Blog page data fetched in ${duration.toFixed(2)}ms');

		return (
			<BlogListing
				posts={paginatedPosts}
				total={total}
				hasMore={hasMore}
				currentPage={page}
				searchParams={searchParams}
			/>
		);
	} catch (error) {
		console.error("Error fetching blog posts: ', error);
		
		// Return empty state on error
		return (
			<BlogListing
				posts={[]}
				total={0}
				hasMore={false}
				currentPage={page}
				searchParams={searchParams}
			/>
		);
	}
}

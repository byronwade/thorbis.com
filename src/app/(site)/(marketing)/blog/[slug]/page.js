import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPostBySlug, getRelatedPosts } from "@/lib/data/blog-posts";

// Get blog post data from mock data
async function getBlogPostData(slug) {
	try {
		// Get the main post
		const post = getPostBySlug(slug);

		if (!post) {
			return null;
		}

		// Get related posts from the same category
		const relatedPostsFromCategory = post.category?.id ? getRelatedPosts(post.id, post.category.id, 4) : [];

		return {
			post,
			relatedPosts: relatedPostsFromCategory,
		};
	} catch (error) {
		console.error("Error fetching blog post data: ', error);
		return null;
	}
}

// Generate metadata for SEO
export const revalidate = 3600; // ISR: refresh blog pages hourly for freshness

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const data = await getBlogPostData(slug);

	if (!data?.post) {
		return {
			title: "Post Not Found",
			description: "The requested blog post could not be found.",
		};
	}

	const { post } = data;

	return {
		title: post.meta_title || post.title,
		description: post.meta_description || post.excerpt,
		keywords: post.tags ? post.tags.join(", ") : undefined,
		authors: [{ name: post.author?.name || "Anonymous" }],
		openGraph: {
			title: post.title,
			description: post.excerpt,
			type: "article",
			publishedTime: post.published_at,
			modifiedTime: post.updated_at,
			authors: [post.author?.name || "Anonymous"],
			images: post.featured_image ? [post.featured_image] : [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt || "")}`],
			url: `https://thorbis.com/blog/${post.slug}`,
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.excerpt,
			images: post.featured_image ? [post.featured_image] : [`https://thorbis.com/twitter-image?title=${encodeURIComponent(post.title)}`],
		},
		alternates: {
			canonical: `https://thorbis.com/blog/${post.slug}`,
		},
	};
}

// Blog post content component
function PostContent({ post, relatedPosts }) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.excerpt,
		image: post.featured_image,
		author: {
			"@type": "Person",
			name: post.author?.name || "Anonymous",
			url: post.author?.bio ? `https://thorbis.com/author/${post.author.id}` : undefined,
		},
		publisher: {
			"@type": "Organization",
			name: "Thorbis",
			logo: {
				"@type": "ImageObject",
				url: "https://thorbis.com/logos/ThorbisLogo.webp",
				width: 512,
				height: 512,
			},
			url: "https://thorbis.com",
		},
		datePublished: post.published_at,
		dateModified: post.updated_at,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://thorbis.com/blog/${post.slug}`,
		},
	};

	const breadcrumbsLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
			{ "@type": "ListItem", position: 2, name: "Blog", item: "https://thorbis.com/blog" },
			{ "@type": "ListItem", position: 3, name: post.title, item: `https://thorbis.com/blog/${post.slug}` },
		],
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
			<main className="pt-8 pb-16 lg:pt-16 lg:pb-24">
				<div className="flex justify-center max-w-screen-xl px-4 mx-auto">
					<article className="w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert">
						<header className="mb-4 lg:mb-6 not-format">
							{/* Featured Image */}
							{post.featured_image && (
								<div className="mb-6">
									<Image src={post.featured_image} alt={post.title} width={1200} height={630} className="w-full rounded-lg h-auto" priority />
								</div>
							)}

							{/* Category and Tags */}
							<div className="flex items-center gap-2 mb-4">
								{post.category && <Badge variant="secondary">{post.category.name}</Badge>}
								{post.tags &&
									post.tags.map((tag, index) => (
										<Badge key={index} variant="outline">
											{tag}
										</Badge>
									))}
							</div>

							<div className="flex items-center mb-6 not-italic">
								<div className="inline-flex items-center mr-3 text-sm">
									<Avatar className="w-16 h-16 mr-4">
										<AvatarImage src={post.author?.avatar_url} alt={post.author?.name || "Anonymous"} />
										<AvatarFallback>{(post.author?.name || "A").charAt(0)}</AvatarFallback>
									</Avatar>
									<div>
										<div className="text-xl font-bold">{post.author?.name || "Anonymous"}</div>
										{post.author?.bio && <p className="text-base text-muted-foreground">{post.author.bio}</p>}
										<div className="flex items-center gap-4 text-base text-muted-foreground">
											<time pubdate="true" dateTime={post.published_at} title={new Date(post.published_at).toLocaleDateString()}>
												{new Date(post.published_at).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</time>
											{post.reading_time && <span>• {post.reading_time} min read</span>}
											{post.view_count && <span>• {post.view_count} views</span>}
										</div>
									</div>
								</div>
							</div>
							<h1 className="mb-4 text-3xl font-extrabold leading-tight lg:mb-6 lg:text-4xl">{post.title}</h1>
							{post.excerpt && <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{post.excerpt}</p>}
						</header>

						<div className="prose prose-lg dark:prose-invert max-w-none">
							{/* Render the actual blog content */}
							<div dangerouslySetInnerHTML={{ __html: post.content }} />
						</div>
					</article>
				</div>
			</main>

			{relatedPosts && relatedPosts.length > 0 && (
				<aside aria-label="Related articles" className="py-8 lg:py-24 bg-muted/20">
					<div className="max-w-screen-xl px-4 mx-auto">
						<h2 className="mb-8 text-2xl font-bold">Related articles</h2>
						<div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
							{relatedPosts.map((article) => (
								<article key={article.slug} className="max-w-xs">
									<Link href={`/blog/${article.slug}`}>
										{article.featured_image ? (
											<Image src={article.featured_image} alt={article.title} width={640} height={384} className="mb-5 rounded-lg w-full h-48 object-cover" />
										) : (
											<div className="mb-5 rounded-lg w-full h-48 bg-muted flex items-center justify-center">
												<span className="text-muted-foreground">No image</span>
											</div>
										)}
									</Link>
									<h2 className="mb-2 text-xl font-bold leading-tight">
										<Link href={`/blog/${article.slug}`} className="hover:underline">
											{article.title}
										</Link>
									</h2>
									<p className="mb-4 text-muted-foreground">{article.excerpt ? (article.excerpt.length > 100 ? article.excerpt.substring(0, 100) + "..." : article.excerpt) : "Read this article to learn more..."}</p>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center space-x-2">
											{article.author?.avatar_url && <img className="rounded-full w-6 h-6" src={article.author.avatar_url} alt={`${article.author.name} profile'} />}
											<span className="text-sm font-medium text-muted-foreground">{article.author?.name || "Anonymous"}</span>
										</div>
										{article.reading_time && <span className="text-sm text-muted-foreground">{article.reading_time} min read</span>}
									</div>
									<Button asChild variant="link" className="p-0">
										<Link href={'/blog/${article.slug}'}>Read more</Link>
									</Button>
								</article>
							))}
						</div>
					</div>
				</aside>
			)}

			<section className="py-16">
				<div className="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6">
					<div className="max-w-screen-md mx-auto sm:text-center">
						<h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Sign up for our newsletter</h2>
						<p className="max-w-2xl mx-auto mb-8 text-muted-foreground md:mb-12 sm:text-xl">Stay up to date with the roadmap progress, announcements and exclusive discounts feel free to sign up with your email.</p>
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
							<div className="mx-auto max-w-screen-sm text-sm text-left text-muted-foreground newsletter-form-footer">
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
export default async function PostPage({ params }) {
	const { slug } = await params;
	const data = await getBlogPostData(slug);

	if (!data) {
		notFound();
	}

	const { post, relatedPosts } = data;

	return (
		<PostContent post={post} relatedPosts={relatedPosts} />
	);
}

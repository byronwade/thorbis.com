import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Search, Home, Building2, ArrowLeft, MapPin } from "lucide-react";

/**
 * Business Not Found Page
 * Shown when a business profile cannot be found
 */
export default function BusinessNotFound() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b bg-card/50">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
							<Building2 className="h-6 w-6" />
							<span className="text-xl font-bold">Thorbis</span>
						</Link>
						
						<div className="flex items-center space-x-4">
							<Link href="/search">
								<Button variant="outline" size="sm" className="hidden sm:flex items-center space-x-2">
									<Search className="h-4 w-4" />
									<span>Search Businesses</span>
								</Button>
							</Link>
							<Link href="/">
								<Button size="sm" className="flex items-center space-x-2">
									<Home className="h-4 w-4" />
									<span className="hidden sm:inline">Home</span>
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-2xl mx-auto text-center">
					{/* 404 Icon */}
					<div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
						<Building2 className="h-12 w-12 text-muted-foreground" />
					</div>

					{/* Error Message */}
					<div className="space-y-4 mb-8">
						<h1 className="text-4xl font-bold tracking-tight">Business Not Found</h1>
						<p className="text-xl text-muted-foreground">
							Sorry, we couldn&apos;t find the business you&apos;re looking for.
						</p>
						<p className="text-muted-foreground">
							The business may have been moved, removed, or the link might be incorrect.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
						<Link href="/search">
							<Button size="lg" className="w-full sm:w-auto flex items-center space-x-2">
								<Search className="h-5 w-5" />
								<span>Search for Businesses</span>
							</Button>
						</Link>
						<Link href="/">
							<Button variant="outline" size="lg" className="w-full sm:w-auto flex items-center space-x-2">
								<Home className="h-5 w-5" />
								<span>Back to Home</span>
							</Button>
						</Link>
					</div>

					{/* Helpful Suggestions */}
					<Card className="text-left">
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<MapPin className="h-5 w-5" />
								<span>What you can do instead:</span>
							</CardTitle>
							<CardDescription>
								Here are some ways to find what you&apos;re looking for
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<h3 className="font-semibold">Browse Categories</h3>
									<div className="flex flex-wrap gap-2">
										<Link href="/categories/restaurants">
											<Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
												Restaurants
											</Badge>
										</Link>
										<Link href="/categories/home-services">
											<Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
												Home Services
											</Badge>
										</Link>
										<Link href="/categories/health">
											<Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
												Healthcare
											</Badge>
										</Link>
										<Link href="/categories/automotive">
											<Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
												Automotive
											</Badge>
										</Link>
									</div>
								</div>
								
								<div className="space-y-2">
									<h3 className="font-semibold">Popular Searches</h3>
									<ul className="space-y-1 text-sm text-muted-foreground">
										<li><Link href="/search?q=plumber" className="hover:text-primary transition-colors">Plumbers near me</Link></li>
										<li><Link href="/search?q=restaurant" className="hover:text-primary transition-colors">Best restaurants</Link></li>
										<li><Link href="/search?q=mechanic" className="hover:text-primary transition-colors">Auto repair shops</Link></li>
										<li><Link href="/search?q=dentist" className="hover:text-primary transition-colors">Dentists nearby</Link></li>
									</ul>
								</div>
							</div>

							<div className="pt-4 border-t">
								<p className="text-sm text-muted-foreground">
									<strong>Business owner?</strong>{" "}
									<Link href="/business/add" className="text-primary hover:underline">
										Add your business to Thorbis
									</Link>{" "}
									to help customers find you.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Back Link */}
					<div className="mt-8">
						<Link href="/" className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
							<ArrowLeft className="h-4 w-4" />
							<span>Return to homepage</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

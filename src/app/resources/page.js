import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Newspaper, GraduationCap, Calendar, Search, Clock, User, MapPin, Star, ArrowRight, ExternalLink, Filter, Tag, Users, Award, Shield, TrendingUp, CheckCircle, BarChart3 } from "lucide-react";
import { generateStaticPageMetadata } from "@utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Resources Hub - Blog, Tools, Learning & Certification | Local Business Directory",
		description: "Comprehensive resources for business owners: insights, tools, certification programs, learning courses, and events. Everything you need to grow your business.",
		path: "/resources",
		keywords: ["business blog", "business tools", "certification programs", "learning resources", "business events", "education", "industry insights", "marketing tips", "growth strategies"],
	});
}

const featuredContent = [
	{
		type: "blog",
		title: "10 Digital Marketing Strategies That Actually Work for Local Businesses",
		excerpt: "Proven tactics to increase your online visibility and attract more customers without breaking the bank.",
		author: "Sarah Mitchell",
		date: "December 12, 2024",
		readTime: "8 min",
		category: "Marketing",
		image: "/api/placeholder/400/250",
		featured: true,
	},
	{
		type: "news",
		title: "Small Business Saturday Drives Record Local Shopping",
		excerpt: "Latest data shows 76% increase in local business visits compared to last year, signaling strong community support.",
		author: "Local Business News",
		date: "December 10, 2024",
		readTime: "5 min",
		category: "Industry News",
		image: "/api/placeholder/400/250",
	},
	{
		type: "learn",
		title: "Complete Guide to Local SEO for Beginners",
		excerpt: "Step-by-step tutorial on optimizing your business for local search results and Google My Business.",
		author: "Digital Marketing Team",
		date: "December 8, 2024",
		readTime: "15 min",
		category: "SEO",
		image: "/api/placeholder/400/250",
	},
];

const blogPosts = [
	{
		title: "How to Handle Negative Reviews Like a Pro",
		excerpt: "Turn challenging customer feedback into opportunities for growth and improved customer relationships.",
		author: "Emily Rodriguez",
		date: "December 11, 2024",
		readTime: "6 min",
		category: "Customer Service",
		tags: ["Reviews", "Customer Relations", "Reputation Management"],
	},
	{
		title: "The Psychology of Local Shopping: What Customers Really Want",
		excerpt: "Understanding customer behavior to create more compelling local business experiences.",
		author: "Dr. Michael Chen",
		date: "December 9, 2024",
		readTime: "10 min",
		category: "Psychology",
		tags: ["Customer Behavior", "Local Commerce", "Psychology"],
	},
	{
		title: "Social Media Calendar for Local Businesses: A Month-by-Month Guide",
		excerpt: "Ready-to-use social media content ideas organized by seasons and local events.",
		author: "Content Team",
		date: "December 7, 2024",
		readTime: "12 min",
		category: "Social Media",
		tags: ["Social Media", "Content Planning", "Marketing"],
	},
	{
		title: "Local Partnership Strategies That Drive Mutual Growth",
		excerpt: "How to identify, approach, and maintain beneficial partnerships with other local businesses.",
		author: "Business Development Team",
		date: "December 5, 2024",
		readTime: "8 min",
		category: "Partnerships",
		tags: ["Partnerships", "Networking", "Growth"],
	},
];

const newsArticles = [
	{
		title: "New Consumer Study Reveals Shift Toward Local Shopping",
		excerpt: "67% of consumers now prioritize local businesses over chains, driven by community values and personalized service.",
		source: "Industry Research",
		date: "December 11, 2024",
		category: "Market Research",
	},
	{
		title: "Federal Grant Program Launches for Small Business Digitization",
		excerpt: "$50M program helps small businesses adopt digital tools and improve online presence.",
		source: "Government News",
		date: "December 9, 2024",
		category: "Government",
	},
	{
		title: "Local Business Revenue Up 15% This Quarter",
		excerpt: "Economic data shows strong performance across retail, restaurants, and service businesses.",
		source: "Economic Report",
		date: "December 6, 2024",
		category: "Economics",
	},
	{
		title: "New Platform Tools Boost Business Owner Productivity by 40%",
		excerpt: "Latest feature updates show significant improvement in time management and customer engagement.",
		source: "Platform Update",
		date: "December 4, 2024",
		category: "Technology",
	},
];

const learningModules = [
	{
		title: "Local Business Marketing Fundamentals",
		description: "Complete 6-week course covering digital marketing basics for local businesses.",
		duration: "6 weeks",
		level: "Beginner",
		modules: 12,
		students: "2,847",
		rating: 4.8,
		topics: ["Digital Marketing", "SEO", "Social Media", "Email Marketing"],
	},
	{
		title: "Customer Service Excellence",
		description: "Advanced strategies for delivering exceptional customer experiences that build loyalty.",
		duration: "4 weeks",
		level: "Intermediate",
		modules: 8,
		students: "1,923",
		rating: 4.9,
		topics: ["Customer Service", "Communication", "Problem Solving", "Retention"],
	},
	{
		title: "Financial Management for Small Business",
		description: "Essential financial planning, budgeting, and growth strategies for business owners.",
		duration: "8 weeks",
		level: "Intermediate",
		modules: 16,
		students: "1,456",
		rating: 4.7,
		topics: ["Finance", "Budgeting", "Accounting", "Tax Planning"],
	},
	{
		title: "Restaurant Operations Mastery",
		description: "Specialized course for restaurant owners covering operations, staff management, and profitability.",
		duration: "5 weeks",
		level: "Advanced",
		modules: 10,
		students: "892",
		rating: 4.9,
		topics: ["Restaurant Management", "Staff Training", "Cost Control", "Menu Engineering"],
	},
];

const upcomingEvents = [
	{
		title: "Local Business Growth Summit 2024",
		description: "Two-day conference featuring industry leaders, networking opportunities, and practical workshops.",
		date: "January 15-16, 2025",
		time: "9:00 AM - 5:00 PM",
		location: "Austin Convention Center, TX",
		type: "Conference",
		price: "$299",
		attendees: "500+",
		speakers: ["Sarah Johnson", "Michael Chen", "Industry Experts"],
	},
	{
		title: "Digital Marketing Workshop",
		description: "Hands-on workshop covering social media, local SEO, and online advertising strategies.",
		date: "December 20, 2024",
		time: "2:00 PM - 5:00 PM",
		location: "Virtual Event",
		type: "Workshop",
		price: "Free",
		attendees: "200",
		speakers: ["Marketing Team"],
	},
	{
		title: "Restaurant Owner Roundtable",
		description: "Monthly discussion group for restaurant owners to share challenges and solutions.",
		date: "December 18, 2024",
		time: "6:00 PM - 8:00 PM",
		location: "Chicago, IL",
		type: "Networking",
		price: "$25",
		attendees: "50",
		speakers: ["Local Restaurant Owners"],
	},
	{
		title: "Small Business Finance Webinar",
		description: "Expert insights on funding options, cash flow management, and financial planning.",
		date: "December 22, 2024",
		time: "1:00 PM - 2:30 PM",
		location: "Virtual Event",
		type: "Webinar",
		price: "Free",
		attendees: "300+",
		speakers: ["Financial Advisors"],
	},
];

const categories = ["All", "Marketing", "Customer Service", "Finance", "Technology", "Operations", "Legal", "Growth", "Industry News", "Case Studies"];

const certificationPrograms = [
	{
		icon: Award,
		title: "Local Business Certification",
		description: "Official verification that builds customer trust",
		benefits: ["Verified badge on listing", "Higher search ranking", "Customer trust boost"],
		duration: "2-3 business days",
		requirements: ["Business license verification", "Address confirmation", "Phone verification"]
	},
	{
		icon: Shield,
		title: "Safety & Health Certification",
		description: "Show customers you prioritize safety",
		benefits: ["Safety badge display", "Health protocol verification", "Customer confidence"],
		duration: "1-2 weeks",
		requirements: ["Health permits", "Safety protocols", "Staff training documentation"]
	},
	{
		icon: Star,
		title: "Excellence Certification",
		description: "Premium recognition for outstanding businesses",
		benefits: ["Premium badge", "Featured placement", "Marketing materials"],
		duration: "2-4 weeks",
		requirements: ["4.5+ star rating", "50+ reviews", "Compliance history"]
	}
];

const businessTools = [
	{
		icon: BarChart3,
		title: "Analytics Dashboard",
		description: "Track your performance with detailed insights",
		features: ["Customer engagement metrics", "Search performance", "Review analytics", "Competitor insights"]
	},
	{
		icon: Users,
		title: "Customer Management",
		description: "Build relationships with your customers",
		features: ["Customer profiles", "Communication tools", "Loyalty programs", "Feedback management"]
	},
	{
		icon: TrendingUp,
		title: "Marketing Suite",
		description: "Promote your business effectively",
		features: ["Promotional campaigns", "Social media integration", "Email marketing", "Event promotion"]
	},
	{
		icon: Calendar,
		title: "Booking & Scheduling",
		description: "Manage appointments and reservations",
		features: ["Online booking", "Calendar integration", "Automated reminders", "Capacity management"]
	}
];

function ResourcesHero() {
	return (
		<div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
			<div className="container mx-auto px-4 text-center">
				<h1 className="text-4xl md:text-5xl font-bold mb-4">Resources Hub</h1>
				<p className="text-xl mb-8 max-w-3xl mx-auto">Everything you need to grow your local business: expert insights, business tools, certification programs, learning courses, and networking events.</p>
				<div className="max-w-md mx-auto relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
					<Input placeholder="Search resources..." className="pl-10 py-3 text-foreground" />
				</div>
			</div>
		</div>
	);
}

function FeaturedContent() {
	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold text-center mb-12">Featured Content</h2>
				<div className="grid lg:grid-cols-3 gap-8">
					{featuredContent.map((content, index) => (
						<Card key={index} className={`hover:shadow-lg transition-shadow ${content.featured ? "ring-2 ring-green-500" : ""}`}>
							<div className="aspect-video bg-muted rounded-t-lg"></div>
							<CardHeader>
								<div className="flex items-center justify-between mb-2">
									<Badge variant="secondary">
										{content.type === "blog" && <BookOpen className="h-3 w-3 mr-1" />}
										{content.type === "news" && <Newspaper className="h-3 w-3 mr-1" />}
										{content.type === "learn" && <GraduationCap className="h-3 w-3 mr-1" />}
										{content.category}
									</Badge>
									{content.featured && <Badge className="bg-success">Featured</Badge>}
								</div>
								<CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
								<CardDescription>{content.excerpt}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
									<div className="flex items-center space-x-2">
										<User className="h-4 w-4" />
										<span>{content.author}</span>
									</div>
									<div className="flex items-center space-x-4">
										<span className="flex items-center space-x-1">
											<Clock className="h-4 w-4" />
											<span>{content.readTime}</span>
										</span>
										<span>{content.date}</span>
									</div>
								</div>
								<Button className="w-full">
									Read More <ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

function ResourcesContent() {
	return (
		<section className="py-16 bg-muted/30">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto">
					<Tabs defaultValue="blog" className="w-full">
						<TabsList className="grid w-full grid-cols-6">
							<TabsTrigger value="blog">Blog</TabsTrigger>
							<TabsTrigger value="news">News</TabsTrigger>
							<TabsTrigger value="learn">Learning</TabsTrigger>
							<TabsTrigger value="events">Events</TabsTrigger>
							<TabsTrigger value="tools">Tools</TabsTrigger>
							<TabsTrigger value="certification">Certification</TabsTrigger>
						</TabsList>

						<TabsContent value="blog" className="mt-8">
							<div className="space-y-8">
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4">Business Blog</h3>
									<p className="text-muted-foreground max-w-2xl mx-auto">Expert insights, strategies, and tips to help your local business grow and succeed in today's competitive market.</p>
								</div>

								{/* Featured Blog Posts Preview */}
								<div className="grid lg:grid-cols-2 gap-6">
									{blogPosts.slice(0, 4).map((post, index) => (
										<Card key={index} className="hover:shadow-md transition-shadow">
											<CardHeader>
												<div className="flex items-center justify-between mb-2">
													<Badge variant="secondary">{post.category}</Badge>
													<span className="text-sm text-muted-foreground">{post.date}</span>
												</div>
												<CardTitle className="text-lg">{post.title}</CardTitle>
												<CardDescription>{post.excerpt}</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="flex items-center justify-between mb-4">
													<div className="flex items-center space-x-2 text-sm text-muted-foreground">
														<User className="h-4 w-4" />
														<span>{post.author}</span>
													</div>
													<div className="flex items-center space-x-1 text-sm text-muted-foreground">
														<Clock className="h-4 w-4" />
														<span>{post.readTime}</span>
													</div>
												</div>

												<div className="flex flex-wrap gap-2 mb-4">
													{post.tags.slice(0, 2).map((tag, tagIndex) => (
														<Badge key={tagIndex} variant="outline" className="text-xs">
															<Tag className="h-3 w-3 mr-1" />
															{tag}
														</Badge>
													))}
												</div>

												<Button variant="outline" className="w-full">
													Read Article <ArrowRight className="h-4 w-4 ml-2" />
												</Button>
											</CardContent>
										</Card>
									))}
								</div>

								<div className="text-center">
									<Button size="lg" asChild>
										<a href="/blog">View All Articles</a>
									</Button>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="news" className="mt-8">
							<div className="space-y-6">
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4">Industry News & Updates</h3>
									<p className="text-muted-foreground max-w-2xl mx-auto">Stay informed with the latest trends, policy changes, and market insights affecting local businesses.</p>
								</div>

								<div className="space-y-4">
									{newsArticles.map((article, index) => (
										<Card key={index} className="hover:shadow-md transition-shadow">
											<CardContent className="p-6">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center space-x-3 mb-2">
															<Badge variant="secondary">{article.category}</Badge>
															<span className="text-sm text-muted-foreground">{article.date}</span>
														</div>
														<h4 className="text-lg font-semibold mb-2">{article.title}</h4>
														<p className="text-muted-foreground mb-3">{article.excerpt}</p>
														<div className="flex items-center space-x-2 text-sm text-muted-foreground">
															<Newspaper className="h-4 w-4" />
															<span>{article.source}</span>
														</div>
													</div>
													<Button variant="outline" size="sm" className="ml-4">
														Read More <ExternalLink className="h-4 w-4 ml-2" />
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</TabsContent>

						<TabsContent value="learn" className="mt-8">
							<div className="space-y-8">
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4">Learning Center</h3>
									<p className="text-muted-foreground max-w-2xl mx-auto">Comprehensive courses and tutorials to help you master every aspect of running a successful local business.</p>
								</div>

								<div className="grid lg:grid-cols-2 gap-6">
									{learningModules.map((module, index) => (
										<Card key={index} className="hover:shadow-lg transition-shadow">
											<CardHeader>
												<div className="flex items-center justify-between mb-2">
													<Badge variant="secondary">{module.level}</Badge>
													<div className="flex items-center space-x-1">
														<Star className="h-4 w-4 text-warning fill-current" />
														<span className="text-sm font-medium">{module.rating}</span>
													</div>
												</div>
												<CardTitle className="text-lg">{module.title}</CardTitle>
												<CardDescription>{module.description}</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="grid grid-cols-3 gap-4 mb-4 text-center">
													<div>
														<div className="text-lg font-semibold text-primary">{module.duration}</div>
														<div className="text-xs text-muted-foreground">Duration</div>
													</div>
													<div>
														<div className="text-lg font-semibold text-primary">{module.modules}</div>
														<div className="text-xs text-muted-foreground">Modules</div>
													</div>
													<div>
														<div className="text-lg font-semibold text-primary">{module.students}</div>
														<div className="text-xs text-muted-foreground">Students</div>
													</div>
												</div>

												<div className="mb-4">
													<h4 className="text-sm font-semibold mb-2">Topics Covered:</h4>
													<div className="flex flex-wrap gap-1">
														{module.topics.map((topic, topicIndex) => (
															<Badge key={topicIndex} variant="outline" className="text-xs">
																{topic}
															</Badge>
														))}
													</div>
												</div>

												<Button className="w-full">
													Start Learning <GraduationCap className="h-4 w-4 ml-2" />
												</Button>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</TabsContent>

						<TabsContent value="events" className="mt-8">
							<div className="space-y-8">
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4">Upcoming Events</h3>
									<p className="text-muted-foreground max-w-2xl mx-auto">Connect with other business owners, learn from experts, and grow your network at our events and workshops.</p>
								</div>

								<div className="space-y-6">
									{upcomingEvents.map((event, index) => (
										<Card key={index} className="hover:shadow-lg transition-shadow">
											<CardContent className="p-6">
												<div className="grid lg:grid-cols-4 gap-6">
													<div className="lg:col-span-3">
														<div className="flex items-center space-x-3 mb-3">
															<Badge variant="secondary">{event.type}</Badge>
															<Badge variant="outline" className="text-success border-success">
																{event.price}
															</Badge>
														</div>
														<h4 className="text-xl font-semibold mb-2">{event.title}</h4>
														<p className="text-muted-foreground mb-4">{event.description}</p>

														<div className="grid md:grid-cols-2 gap-4 text-sm">
															<div className="flex items-center space-x-2">
																<Calendar className="h-4 w-4 text-primary" />
																<span>
																	<strong>{event.date}</strong> at {event.time}
																</span>
															</div>
															<div className="flex items-center space-x-2">
																<MapPin className="h-4 w-4 text-success" />
																<span>{event.location}</span>
															</div>
															<div className="flex items-center space-x-2">
																<Users className="h-4 w-4 text-muted-foreground" />
																<span>{event.attendees} attendees expected</span>
															</div>
															<div className="flex items-center space-x-2">
																<User className="h-4 w-4 text-warning" />
																<span>Speakers: {event.speakers.join(", ")}</span>
															</div>
														</div>
													</div>

													<div className="flex flex-col justify-center space-y-3">
														<Button className="w-full">Register Now</Button>
														<Button variant="outline" className="w-full">
															Learn More
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>

								<div className="text-center">
									<Button size="lg" variant="outline">
										View All Events <Calendar className="h-5 w-5 ml-2" />
									</Button>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="tools" className="mt-8">
							<div className="space-y-8">
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4">Business Management Tools</h3>
									<p className="text-muted-foreground max-w-2xl mx-auto">Comprehensive suite of tools to manage and grow your business online presence effectively.</p>
								</div>

								<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
									{businessTools.map((tool, index) => (
										<Card key={index} className="hover:shadow-md transition-shadow">
											<CardHeader className="text-center">
												<tool.icon className="h-12 w-12 text-primary mx-auto mb-3" />
												<CardTitle className="text-lg">{tool.title}</CardTitle>
												<CardDescription>{tool.description}</CardDescription>
											</CardHeader>
											<CardContent>
												<ul className="space-y-2">
													{tool.features.map((feature, i) => (
														<li key={i} className="flex items-center space-x-2 text-sm">
															<CheckCircle className="h-3 w-3 text-success" />
															<span>{feature}</span>
														</li>
													))}
												</ul>
											</CardContent>
										</Card>
									))}
								</div>

								<div className="text-center">
									<Button size="lg">Explore Business Tools</Button>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="certification" className="mt-8">
							<div className="space-y-8">
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4">Business Certification Programs</h3>
									<p className="text-muted-foreground max-w-2xl mx-auto">Build customer trust and stand out from competitors with our official certification programs.</p>
								</div>
								
								<div className="grid md:grid-cols-3 gap-8">
									{certificationPrograms.map((program, index) => (
										<Card key={index} className="hover:shadow-lg transition-shadow">
											<CardHeader>
												<div className="flex items-center space-x-3 mb-2">
													<program.icon className="h-8 w-8 text-success" />
													<CardTitle>{program.title}</CardTitle>
												</div>
												<CardDescription>{program.description}</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													<div>
														<h4 className="font-semibold mb-2">Benefits:</h4>
														<ul className="space-y-1">
															{program.benefits.map((benefit, i) => (
																<li key={i} className="flex items-center space-x-2 text-sm">
																	<CheckCircle className="h-4 w-4 text-success" />
																	<span>{benefit}</span>
																</li>
															))}
														</ul>
													</div>
													
													<div>
														<h4 className="font-semibold mb-2">Timeline:</h4>
														<Badge variant="outline">{program.duration}</Badge>
													</div>
													
													<Button className="w-full">
														Start Certification
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</section>
	);
}

export default function ResourcesPage() {
	return (
		<div className="min-h-screen">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Resources Hub",
						description: "Everything you need to grow your local business: expert insights, industry news, educational content, and networking events.",
						url: "/resources",
						mainEntity: {
							"@type": "ItemList",
							name: "Business Resources",
							itemListElement: [
								{
									"@type": "ListItem",
									position: 1,
									item: {
										"@type": "Article",
										name: "Business Blog",
										description: "Expert insights and strategies for local business growth",
									},
								},
								{
									"@type": "ListItem",
									position: 2,
									item: {
										"@type": "Course",
										name: "Business Learning Center",
										description: "Comprehensive courses for business skill development",
									},
								},
								{
									"@type": "ListItem",
									position: 3,
									item: {
										"@type": "Event",
										name: "Business Events",
										description: "Networking and learning opportunities for business owners",
									},
								},
							],
						},
					}),
				}}
			/>

			<ResourcesHero />
			<FeaturedContent />
			<ResourcesContent />
		</div>
	);
}

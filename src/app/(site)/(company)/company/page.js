
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Newspaper, TrendingUp, MapPin, Calendar, Award, Target, Heart, Globe, Download, ExternalLink, Mail, Briefcase } from "lucide-react";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Company Information - About Us, Careers, Press & Investors | Local Business Directory",
		description: "Learn about our company, mission, team, career opportunities, press releases, and investor information. Building stronger local communities through technology.",
		path: "/company",
		keywords: ["about us", "company information", "careers", "jobs", "press releases", "investor relations", "team", "mission", "local business platform"],
	});
}

const companyStats = [
	{ label: "Local Businesses", value: "50,000+", icon: Building },
	{ label: "Active Users", value: "2.5M+", icon: Users },
	{ label: "Cities Covered", value: "500+", icon: MapPin },
	{ label: "Years in Business", value: "8+", icon: Calendar },
];

const teamMembers = [
	{
		name: "Sarah Johnson",
		role: "CEO & Co-Founder",
		bio: "Former VP at Yelp with 15+ years in local business technology.",
		image: "/api/placeholder/150/150",
	},
	{
		name: "Michael Chen",
		role: "CTO & Co-Founder",
		bio: "Ex-Google engineer passionate about connecting communities through technology.",
		image: "/api/placeholder/150/150",
	},
	{
		name: "Emily Rodriguez",
		role: "VP of Product",
		bio: "Product leader focused on creating exceptional user experiences.",
		image: "/api/placeholder/150/150",
	},
	{
		name: "David Kim",
		role: "VP of Engineering",
		bio: "Tech veteran building scalable platforms for local business growth.",
		image: "/api/placeholder/150/150",
	},
];

const openPositions = [
	{
		title: "Senior Software Engineer",
		department: "Engineering",
		location: "Remote / San Francisco",
		type: "Full-time",
		description: "Join our engineering team to build the next generation of local business tools.",
	},
	{
		title: "Product Manager",
		department: "Product",
		location: "Remote / New York",
		type: "Full-time",
		description: "Lead product strategy for our business owner dashboard and analytics platform.",
	},
	{
		title: "Business Development Manager",
		department: "Sales",
		location: "Austin, TX",
		type: "Full-time",
		description: "Drive partnerships with local business organizations and chambers of commerce.",
	},
	{
		title: "Content Marketing Specialist",
		department: "Marketing",
		location: "Remote",
		type: "Full-time",
		description: "Create compelling content that helps local businesses succeed online.",
	},
];

const pressReleases = [
	{
		date: "December 10, 2024",
		title: "Platform Reaches 50,000 Local Business Milestone",
		summary: "Our directory now features over 50,000 verified local businesses across 500+ cities nationwide.",
		link: "#",
	},
	{
		date: "November 15, 2024",
		title: "New AI-Powered Business Insights Launch",
		summary: "Advanced analytics help business owners understand customer behavior and optimize their online presence.",
		link: "#",
	},
	{
		date: "October 22, 2024",
		title: "Partnership with National Chamber of Commerce",
		summary: "Strategic alliance to support small business digital transformation across America.",
		link: "#",
	},
	{
		date: "September 8, 2024",
		title: "Series B Funding Round Closes at $45M",
		summary: "Investment led by Sequoia Capital to accelerate platform expansion and feature development.",
		link: "#",
	},
];

const investors = [
	{
		name: "Sequoia Capital",
		type: "Lead Investor - Series B",
		description: "Backing innovative companies that transform industries",
	},
	{
		name: "Andreessen Horowitz",
		type: "Series A Lead",
		description: "Supporting entrepreneurs building the future of local commerce",
	},
	{
		name: "First Round Capital",
		type: "Seed Investor",
		description: "Early-stage investment in community-focused platforms",
	},
	{
		name: "Local Impact Fund",
		type: "Strategic Investor",
		description: "Mission-aligned investment in local business infrastructure",
	},
];

const companyValues = [
	{
		icon: Heart,
		title: "Community First",
		description: "We believe strong local communities create thriving economies and happier people.",
	},
	{
		icon: Target,
		title: "Customer Success",
		description: "Our success is measured by the success of the businesses and users on our platform.",
	},
	{
		icon: Globe,
		title: "Accessibility",
		description: "Everyone deserves access to local business discovery and promotion tools.",
	},
	{
		icon: Award,
		title: "Quality & Trust",
		description: "We maintain the highest standards for business verification and user safety.",
	},
];

function CompanyHero() {
	return (
		<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">Building Stronger Local Communities</h1>
					<p className="text-xl mb-8">We're on a mission to connect people with amazing local businesses and help entrepreneurs thrive in their communities.</p>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
						{companyStats.map((stat, index) => (
							<div key={index} className="text-center">
								<stat.icon className="h-8 w-8 mx-auto mb-2 opacity-80" />
								<div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
								<div className="text-sm opacity-80">{stat.label}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function CompanyContent() {
	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto">
					<Tabs defaultValue="about" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="about">About Us</TabsTrigger>
							<TabsTrigger value="careers">Careers</TabsTrigger>
							<TabsTrigger value="press">Press</TabsTrigger>
							<TabsTrigger value="investors">Investors</TabsTrigger>
						</TabsList>

						<TabsContent value="about" className="mt-8">
							<div className="space-y-12">
								{/* Mission & Story */}
								<div className="grid lg:grid-cols-2 gap-12">
									<div>
										<h2 className="text-3xl font-bold mb-6">Our Story</h2>
										<div className="space-y-4 text-muted-foreground">
											<p>Founded in 2016, our platform began with a simple observation: local businesses are the heart of thriving communities, but they often struggle to compete with larger chains in the digital space.</p>
											<p>What started as a weekend project to help a friend's restaurant get discovered online has grown into a comprehensive platform serving over 50,000 local businesses across 500+ cities.</p>
											<p>Today, we're proud to be the bridge between communities and the local businesses that make them special, from family restaurants to innovative startups.</p>
										</div>
									</div>

									<div>
										<h2 className="text-3xl font-bold mb-6">Our Mission</h2>
										<div className="bg-primary p-6 rounded-lg">
											<p className="text-lg text-primary font-medium mb-4">"To empower local businesses with the tools and visibility they need to thrive, while helping communities discover and support the amazing entrepreneurs in their neighborhoods."</p>
											<p className="text-primary">We believe that when local businesses succeed, entire communities benefit through job creation, economic growth, and stronger social connections.</p>
										</div>
									</div>
								</div>

								{/* Values */}
								<div>
									<h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
									<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
										{companyValues.map((value, index) => (
											<Card key={index} className="text-center hover:shadow-lg transition-shadow">
												<CardContent className="p-6">
													<value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
													<h3 className="font-semibold mb-2">{value.title}</h3>
													<p className="text-muted-foreground text-sm">{value.description}</p>
												</CardContent>
											</Card>
										))}
									</div>
								</div>

								{/* Team */}
								<div>
									<h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
									<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
										{teamMembers.map((member, index) => (
											<Card key={index} className="text-center hover:shadow-lg transition-shadow">
												<CardContent className="p-6">
													<div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
													<h3 className="font-semibold mb-1">{member.name}</h3>
													<p className="text-primary text-sm mb-3">{member.role}</p>
													<p className="text-muted-foreground text-sm">{member.bio}</p>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="careers" className="mt-8">
							<div className="space-y-12">
								{/* Careers Intro */}
								<div className="text-center">
									<h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
									<p className="text-muted-foreground max-w-2xl mx-auto mb-8">Help us build the future of local business discovery. We're looking for passionate people who believe in the power of community and want to make a real impact.</p>
									<div className="flex flex-wrap justify-center gap-4">
										<Button size="lg">
											View All Positions <Briefcase className="h-5 w-5 ml-2" />
										</Button>
										<Button size="lg" variant="outline">
											Company Culture <Heart className="h-5 w-5 ml-2" />
										</Button>
									</div>
								</div>

								{/* Benefits */}
								<div className="bg-muted/30 p-8 rounded-lg">
									<h3 className="text-xl font-semibold mb-6 text-center">Why Work With Us?</h3>
									<div className="grid md:grid-cols-3 gap-6">
										<div className="text-center">
											<Heart className="h-8 w-8 text-destructive mx-auto mb-3" />
											<h4 className="font-semibold mb-2">Impact & Purpose</h4>
											<p className="text-muted-foreground text-sm">Work on products that directly impact local communities and small business success.</p>
										</div>
										<div className="text-center">
											<Globe className="h-8 w-8 text-primary mx-auto mb-3" />
											<h4 className="font-semibold mb-2">Remote-First Culture</h4>
											<p className="text-muted-foreground text-sm">Flexible work arrangements with optional office access in major cities.</p>
										</div>
										<div className="text-center">
											<Award className="h-8 w-8 text-success mx-auto mb-3" />
											<h4 className="font-semibold mb-2">Growth & Learning</h4>
											<p className="text-muted-foreground text-sm">Continuous learning budget, conference attendance, and career development support.</p>
										</div>
									</div>
								</div>

								{/* Open Positions */}
								<div>
									<h3 className="text-2xl font-bold mb-8">Open Positions</h3>
									<div className="space-y-4">
										{openPositions.map((position, index) => (
											<Card key={index} className="hover:shadow-md transition-shadow">
												<CardContent className="p-6">
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<div className="flex items-center space-x-3 mb-2">
																<h4 className="text-lg font-semibold">{position.title}</h4>
																<Badge variant="secondary">{position.department}</Badge>
															</div>
															<div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
																<span className="flex items-center space-x-1">
																	<MapPin className="h-4 w-4" />
																	<span>{position.location}</span>
																</span>
																<span className="flex items-center space-x-1">
																	<Briefcase className="h-4 w-4" />
																	<span>{position.type}</span>
																</span>
															</div>
															<p className="text-muted-foreground">{position.description}</p>
														</div>
														<Button className="ml-4">Apply Now</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="press" className="mt-8">
							<div className="space-y-12">
								{/* Press Intro */}
								<div className="text-center">
									<h2 className="text-3xl font-bold mb-4">Press & Media</h2>
									<p className="text-muted-foreground max-w-2xl mx-auto mb-8">Stay updated with our latest announcements, company milestones, and industry insights.</p>
									<div className="flex flex-wrap justify-center gap-4">
										<Button size="lg">
											Download Press Kit <Download className="h-5 w-5 ml-2" />
										</Button>
										<Button size="lg" variant="outline">
											Media Contact <Mail className="h-5 w-5 ml-2" />
										</Button>
									</div>
								</div>

								{/* Press Releases */}
								<div>
									<h3 className="text-2xl font-bold mb-8">Recent Press Releases</h3>
									<div className="space-y-6">
										{pressReleases.map((release, index) => (
											<Card key={index} className="hover:shadow-md transition-shadow">
												<CardContent className="p-6">
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<div className="flex items-center space-x-3 mb-2">
																<Badge variant="outline">{release.date}</Badge>
															</div>
															<h4 className="text-lg font-semibold mb-2">{release.title}</h4>
															<p className="text-muted-foreground mb-3">{release.summary}</p>
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

								{/* Media Kit */}
								<div className="bg-muted/30 p-8 rounded-lg">
									<h3 className="text-xl font-semibold mb-6">Media Resources</h3>
									<div className="grid md:grid-cols-3 gap-6">
										<div className="text-center">
											<Download className="h-8 w-8 text-primary mx-auto mb-3" />
											<h4 className="font-semibold mb-2">Brand Assets</h4>
											<p className="text-muted-foreground text-sm mb-3">Logos, brand guidelines, and visual assets</p>
											<Button variant="outline" size="sm">
												Download
											</Button>
										</div>
										<div className="text-center">
											<Newspaper className="h-8 w-8 text-success mx-auto mb-3" />
											<h4 className="font-semibold mb-2">Fact Sheet</h4>
											<p className="text-muted-foreground text-sm mb-3">Company stats, timeline, and key information</p>
											<Button variant="outline" size="sm">
												Download
											</Button>
										</div>
										<div className="text-center">
											<Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
											<h4 className="font-semibold mb-2">Executive Bios</h4>
											<p className="text-muted-foreground text-sm mb-3">Leadership team backgrounds and photos</p>
											<Button variant="outline" size="sm">
												Download
											</Button>
										</div>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="investors" className="mt-8">
							<div className="space-y-12">
								{/* Investor Intro */}
								<div className="text-center">
									<h2 className="text-3xl font-bold mb-4">Investor Relations</h2>
									<p className="text-muted-foreground max-w-2xl mx-auto mb-8">Information for current and prospective investors about our business, growth, and financial performance.</p>
									<div className="flex flex-wrap justify-center gap-4">
										<Button size="lg">
											Latest Financials <TrendingUp className="h-5 w-5 ml-2" />
										</Button>
										<Button size="lg" variant="outline">
											Investor Contact <Mail className="h-5 w-5 ml-2" />
										</Button>
									</div>
								</div>

								{/* Key Metrics */}
								<div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg">
									<h3 className="text-xl font-semibold mb-6 text-center">Key Business Metrics</h3>
									<div className="grid md:grid-cols-4 gap-6 text-center">
										<div>
											<div className="text-3xl font-bold text-success">$45M</div>
											<div className="text-sm text-muted-foreground">Series B Funding</div>
										</div>
										<div>
											<div className="text-3xl font-bold text-primary">250%</div>
											<div className="text-sm text-muted-foreground">YoY Revenue Growth</div>
										</div>
										<div>
											<div className="text-3xl font-bold text-muted-foreground">50K+</div>
											<div className="text-sm text-muted-foreground">Business Partners</div>
										</div>
										<div>
											<div className="text-3xl font-bold text-warning">2.5M+</div>
											<div className="text-sm text-muted-foreground">Monthly Active Users</div>
										</div>
									</div>
								</div>

								{/* Investors */}
								<div>
									<h3 className="text-2xl font-bold mb-8">Our Investors</h3>
									<div className="grid md:grid-cols-2 gap-6">
										{investors.map((investor, index) => (
											<Card key={index} className="hover:shadow-md transition-shadow">
												<CardContent className="p-6">
													<div className="flex items-start space-x-4">
														<div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
														<div className="flex-1">
															<h4 className="font-semibold mb-1">{investor.name}</h4>
															<Badge variant="secondary" className="mb-2 text-xs">
																{investor.type}
															</Badge>
															<p className="text-muted-foreground text-sm">{investor.description}</p>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>

								{/* Investment Highlights */}
								<div className="bg-muted/30 p-8 rounded-lg">
									<h3 className="text-xl font-semibold mb-6">Investment Highlights</h3>
									<div className="grid md:grid-cols-2 gap-6">
										<div>
											<h4 className="font-semibold mb-3">Market Opportunity</h4>
											<ul className="space-y-2 text-muted-foreground">
												<li>• $150B+ local business advertising market</li>
												<li>• 33M+ small businesses in the US</li>
												<li>• Growing demand for local discovery tools</li>
												<li>• Post-pandemic shift to supporting local</li>
											</ul>
										</div>
										<div>
											<h4 className="font-semibold mb-3">Competitive Advantages</h4>
											<ul className="space-y-2 text-muted-foreground">
												<li>• Comprehensive business management suite</li>
												<li>• Strong network effects and local focus</li>
												<li>• Advanced AI-powered recommendations</li>
												<li>• Proven monetization through multiple streams</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</section>
	);
}

export default function CompanyPage() {
	return (
		<div className="min-h-screen">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Organization",
						name: "Local Business Directory",
						description: "Platform connecting people with local businesses and helping entrepreneurs thrive in their communities.",
						url: "/company",
						foundingDate: "2016",
						numberOfEmployees: "100+",
						industry: "Technology",
						address: {
							"@type": "PostalAddress",
							addressLocality: "San Francisco",
							addressRegion: "CA",
							addressCountry: "US",
						},
						sameAs: ["https://linkedin.com/company/localbusiness", "https://twitter.com/localbusiness"],
						founder: [
							{
								"@type": "Person",
								name: "Sarah Johnson",
							},
							{
								"@type": "Person",
								name: "Michael Chen",
							},
						],
					}),
				}}
			/>

			<CompanyHero />
			<CompanyContent />
		</div>
	);
}

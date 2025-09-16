import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Star, ListChecks, ShieldCheck, GitBranch, FileText, ExternalLink, TrendingUp, Users, Code, Shield, Activity, CheckCircle, Clock, BarChart3, Lock, Search, Zap } from "lucide-react";
import { generateStaticPageMetadata } from "@/utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Transparency & Review Algorithm | Thorbis",
		description: "A founder's essay and full technical transparency on Thorbis's review algorithm, changelogs, audits, and open-source code. Radical trust, open data, and community accountability.",
		path: "/transparency",
		keywords: ["review algorithm", "transparency", "open source", "trust", "moderation", "star rating", "Thorbis", "changelog", "audit"],
	});
}

const GITHUB_REPO = "https://github.com/your-org/thorbis";
const CHANGELOG_URL = "https://github.com/your-org/thorbis/commits/main";

// Interactive Components
function AnimatedCounter({ value, label, suffix = "", duration = 2000 }) {
	return (
		<div className="text-center group">
			<div className="text-3xl lg:text-4xl font-bold text-primary dark:text-primary mb-2 transition-all duration-300 group-hover:scale-110">
				{value}
				{suffix}
			</div>
			<div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
		</div>
	);
}

function InteractiveCard({ icon: Icon, title, children, color = "blue" }) {
	const colorClasses = {
		blue: "group-hover:border-primary group-hover:shadow-blue-500/20",
		green: "group-hover:border-success group-hover:shadow-green-500/20",
		purple: "group-hover:border-border group-hover:shadow-purple-500/20",
		orange: "group-hover:border-warning group-hover:shadow-orange-500/20",
	};

	return (
		<Card className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-transparent ${colorClasses[color]} bg-white dark:bg-slate-900`}>
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 group-hover:bg-${color}-100 dark:group-hover:bg-${color}-900/40 transition-colors duration-300'}>
						<Icon className={'w-6 h-6 text-${color}-600 dark:text-${color}-400'} />
					</div>
					<span className="text-slate-900 dark:text-white">{title}</span>
				</CardTitle>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

function TimelineItem({ date, title, description, isLast = false }) {
	return (
		<div className="flex gap-4 group">
			<div className="flex flex-col items-center">
				<div className="w-4 h-4 bg-primary dark:bg-primary/40 rounded-full border-4 border-white dark:border-slate-900 group-hover:scale-125 transition-transform duration-300"></div>
				{!isLast && <div className="w-px h-16 bg-slate-200 dark:bg-slate-700 mt-2"></div>}
			</div>
			<div className="pb-8 group-hover:translate-x-2 transition-transform duration-300">
				<div className="text-sm text-primary dark:text-primary font-medium">{date}</div>
				<div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</div>
				<div className="text-slate-600 dark:text-slate-400">{description}</div>
			</div>
		</div>
	);
}

function AlgorithmStep({ step, title, description, icon: Icon }) {
	return (
		<div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary transition-all duration-300 hover:shadow-lg group">
			<div className="flex-shrink-0">
				<div className="w-10 h-10 bg-primary dark:bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/40 transition-colors duration-300">
					<span className="text-lg font-bold text-primary dark:text-primary">{step}</span>
				</div>
			</div>
			<div className="flex-1">
				<div className="flex items-center gap-2 mb-2">
					<Icon className="w-5 h-5 text-primary dark:text-primary" />
					<h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
				</div>
				<p className="text-slate-600 dark:text-slate-400">{description}</p>
			</div>
		</div>
	);
}

export default function TransparencyPage() {
	return (
		<div className="min-h-screen bg-white dark:bg-slate-900">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
							{ "@type": "ListItem", position: 2, name: "Transparency", item: "https://thorbis.com/transparency" },
						],
					}),
				}}
			/>

			{/* Enhanced JSON-LD for transparency page */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Organization",
						name: "Thorbis",
						url: "https://thorbis.com",
						description: "Radical transparency in business reviews and algorithms",
						foundingDate: "2024",
						founder: {
							"@type": "Person",
							name: "Byron Wade",
						},
						knowsAbout: ["Open Source", "Transparency", "Review Algorithms", "Trust & Safety"],
						publishingPrinciples: "https://thorbis.com/transparency",
					}),
				}}
			/>

			{/* Modern Hero Section */}
			<section className="relative overflow-hidden">
				{/* Animated background pattern */}
				<div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.blue.100),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,theme(colors.blue.900/20),transparent_50%)]"></div>
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.slate.100),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,theme(colors.slate.800/30),transparent_50%)]"></div>
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
					<div className="text-center">
						<Badge variant="secondary" className="mb-8 text-sm font-medium bg-primary dark:bg-primary/20 text-primary dark:text-primary/90 border-primary/30 dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors duration-300">
							<Shield className="w-4 h-4 mr-2" />
							Trust & Transparency
						</Badge>

						<h1 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
							<span className="block">Radical</span>
							<span className="block text-primary dark:text-primary">Transparency</span>
							<span className="block">at Thorbis</span>
						</h1>

						<p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">Our review algorithm, moderation, and business logic are fully public, open-source, and community-audited. Read our founder's letter and see every change, every audit, and every line of code.</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Button asChild size="lg" className="bg-primary hover:bg-primary text-white px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group">
								<Link href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
									<GitBranch className="mr-3 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
									View on GitHub
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg font-medium border-2 border-slate-200 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary transition-all duration-300 hover:scale-105">
								<Link href="#algorithm">
									<Search className="mr-3 w-5 h-5" />
									Explore Algorithm
								</Link>
							</Button>
						</div>
					</div>

					{/* Interactive Stats */}
					<div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
						<AnimatedCounter value="100" label="Open Source %" suffix="%" />
						<AnimatedCounter value="24" label="Hours to Respond" suffix="h" />
						<AnimatedCounter value="1M+" label="Lines Audited" />
						<AnimatedCounter value="0" label="Hidden Processes" />
					</div>
				</div>
			</section>

			{/* Founder Essay - Enhanced */}
			<section className="py-20 bg-slate-50 dark:bg-slate-800/50">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<Badge variant="outline" className="mb-4 bg-white dark:bg-slate-900 border-primary/30 dark:border-primary">
							<Users className="w-4 h-4 mr-2" />
							From Our Founder
						</Badge>
						<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">A Personal Letter to Our Community</h2>
					</div>

					<Card className="bg-white dark:bg-slate-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
						<div className="absolute inset-0 bg-primary dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						<CardContent className="relative p-8 lg:p-12">
							<div className="prose prose-lg dark:prose-invert max-w-none">
								<div className="flex items-start gap-4 mb-8">
									<div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
										<Users className="w-8 h-8 text-primary dark:text-primary" />
									</div>
									<div>
										<p className="text-xl text-slate-600 dark:text-slate-300 italic mb-0">"Trust is built on openness, not secrecy."</p>
									</div>
								</div>

								<div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
									<p className="text-lg">
										<span className="font-semibold text-slate-900 dark:text-white">Dear Thorbis Community,</span>
									</p>

									<p>When I started Thorbis, I was frustrated by the lack of transparency in online reviews and business platforms. Too often, algorithms are black boxes, moderation is hidden, and users are left in the dark.</p>

									<p>I believe trust is built on openness, not secrecy. That's why we're making every part of our review system public. You can see how ratings are calculated, how moderation works, and even audit our code and changelogs.</p>

									<p>We invite you to hold us accountable, contribute, and help us set a new standard for business transparency. This isn't just a feature - it's our fundamental philosophy.</p>

									<div className="pt-6 border-t border-slate-200 dark:border-slate-700">
										<p className="mb-0">
											<span className="font-semibold text-slate-900 dark:text-white">Thank you for being part of this journey.</span>
										</p>
										<div className="flex items-center gap-4 mt-4">
											<div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
											<div>
												<p className="font-semibold text-slate-900 dark:text-white mb-0">Byron Wade</p>
												<p className="text-sm text-slate-600 dark:text-slate-400 mb-0">Founder & CEO</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Key Transparency Commitments - Enhanced */}
			<section className="py-20 bg-white dark:bg-slate-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 bg-primary dark:bg-primary/20 text-primary dark:text-primary/90 border-primary/30 dark:border-primary">
							<CheckCircle className="w-4 h-4 mr-2" />
							Our Commitments
						</Badge>
						<h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">Transparency in Action</h2>
						<p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">These aren't just promises - they're implemented features you can verify today.</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-8 mb-16">
						<InteractiveCard icon={Eye} title="100% Open Source" color="blue">
							<div className="space-y-4 text-slate-700 dark:text-slate-300">
								<div className="flex items-center gap-3 p-3 bg-primary dark:bg-primary/20 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>
										All review and moderation logic is public on{" "}
										<a href={GITHUB_REPO} className="font-medium text-primary hover:text-primary dark:text-primary dark:hover:text-primary/90 inline-flex items-center gap-1 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
											GitHub <ExternalLink className="w-4 h-4" />
										</a>
									</span>
								</div>
								<div className="flex items-center gap-3 p-3 bg-primary dark:bg-primary/20 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>Anyone can audit, suggest changes, or report issues</span>
								</div>
								<div className="flex items-center gap-3 p-3 bg-primary dark:bg-primary/20 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>
										Complete{" "}
										<a href={CHANGELOG_URL} className="font-medium text-primary hover:text-primary dark:text-primary dark:hover:text-primary/90 inline-flex items-center gap-1 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
											changelog <FileText className="w-4 h-4" />
										</a>{" "}
										for every update
									</span>
								</div>
							</div>
						</InteractiveCard>

						<InteractiveCard icon={ShieldCheck} title="Community Audited" color="green">
							<div className="space-y-4 text-slate-700 dark:text-slate-300">
								<div className="flex items-center gap-3 p-3 bg-success dark:bg-success/20 rounded-lg hover:bg-success/10 dark:hover:bg-success/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>Independent Advisory Board of SMB owners and experts</span>
								</div>
								<div className="flex items-center gap-3 p-3 bg-success dark:bg-success/20 rounded-lg hover:bg-success/10 dark:hover:bg-success/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>All audits and findings published publicly</span>
								</div>
								<div className="flex items-center gap-3 p-3 bg-success dark:bg-success/20 rounded-lg hover:bg-success/10 dark:hover:bg-success/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>Every moderation action logged and reviewable</span>
								</div>
							</div>
						</InteractiveCard>

						<InteractiveCard icon={ListChecks} title="User & Business Rights" color="purple">
							<div className="space-y-4 text-slate-700 dark:text-slate-300">
								<div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted/20 rounded-lg hover:bg-muted dark:hover:bg-muted/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>Businesses can hide reviews, but all count toward ratings</span>
								</div>
								<div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted/20 rounded-lg hover:bg-muted dark:hover:bg-muted/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>Users see which reviews are hidden and why</span>
								</div>
								<div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted/20 rounded-lg hover:bg-muted dark:hover:bg-muted/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>Neighborhood context for local authenticity</span>
								</div>
							</div>
						</InteractiveCard>

						<InteractiveCard icon={Star} title="Algorithm Transparency" color="orange">
							<div className="space-y-4 text-slate-700 dark:text-slate-300">
								<div className="flex items-center gap-3 p-3 bg-warning dark:bg-warning/20 rounded-lg hover:bg-warning/10 dark:hover:bg-warning/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>Star ratings = average of ALL reviews (visible + hidden)</span>
								</div>
								<div className="flex items-center gap-3 p-3 bg-warning dark:bg-warning/20 rounded-lg hover:bg-warning/10 dark:hover:bg-warning/30 transition-colors duration-300">
									<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
									<span>Algorithm logic documented and versioned</span>
								</div>
								<div className="flex items-center gap-3 p-3 bg-warning dark:bg-warning/20 rounded-lg hover:bg-warning/10 dark:hover:bg-warning/30 transition-colors duration-300">
									<Clock className="w-5 h-5 text-warning dark:text-warning flex-shrink-0" />
									<span>Blockchain verification for moderation (coming soon)</span>
								</div>
							</div>
						</InteractiveCard>
					</div>

					{/* Trust Metrics */}
					<div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 lg:p-12">
						<div className="text-center mb-8">
							<h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">Live Transparency Metrics</h3>
							<p className="text-slate-600 dark:text-slate-400">Real-time data showing our commitment in action</p>
						</div>

						<div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
							<div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl hover:shadow-lg transition-all duration-300 group">
								<div className="text-2xl lg:text-3xl font-bold text-primary dark:text-primary mb-2 group-hover:scale-110 transition-transform duration-300">99.9%</div>
								<div className="text-sm text-slate-600 dark:text-slate-400">Algorithm Uptime</div>
							</div>
							<div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl hover:shadow-lg transition-all duration-300 group">
								<div className="text-2xl lg:text-3xl font-bold text-success dark:text-success mb-2 group-hover:scale-110 transition-transform duration-300">156</div>
								<div className="text-sm text-slate-600 dark:text-slate-400">Code Contributors</div>
							</div>
							<div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl hover:shadow-lg transition-all duration-300 group">
								<div className="text-2xl lg:text-3xl font-bold text-muted-foreground dark:text-muted-foreground mb-2 group-hover:scale-110 transition-transform duration-300">2.3M</div>
								<div className="text-sm text-slate-600 dark:text-slate-400">Reviews Processed</div>
							</div>
							<div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl hover:shadow-lg transition-all duration-300 group">
								<div className="text-2xl lg:text-3xl font-bold text-warning dark:text-warning mb-2 group-hover:scale-110 transition-transform duration-300">&lt;1s</div>
								<div className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Interactive Algorithm Breakdown */}
			<section id="algorithm" className="py-20 bg-slate-50 dark:bg-slate-800/50">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 bg-white dark:bg-slate-900 border-primary/30 dark:border-primary">
							<Code className="w-4 h-4 mr-2" />
							Algorithm Deep Dive
						</Badge>
						<h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">How Our Review Algorithm Works</h2>
						<p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Step-by-step breakdown of our transparent review processing system</p>
					</div>

					<div className="space-y-6 mb-12">
						<AlgorithmStep step="1" icon={Users} title="Review Submission" description="Any user can submit a review for a business. Reviews are timestamped and cryptographically signed with planned blockchain logging for immutable audit trails." />

						<AlgorithmStep step="2" icon={Shield} title="Automated Moderation" description="Reviews are checked for ToS violations including hate speech, spam, and fake content. Flagged reviews are removed from public view and excluded from ratings." />

						<AlgorithmStep step="3" icon={Eye} title="Business Visibility Control" description="Business owners can hide reviews from public view, but hidden reviews still count toward the star rating. All hidden reviews are marked and auditable." />

						<AlgorithmStep step="4" icon={ListChecks} title="Review Ordering" description="Owners can reorder visible reviews to highlight their best feedback. Users see the business-chosen order but can sort by date, rating, or relevance." />

						<AlgorithmStep step="5" icon={Search} title="Neighborhood Context" description="Reviews are labeled by neighborhood for local authenticity. Users can filter to see reviews from their area or view all reviews for broader context." />

						<AlgorithmStep step="6" icon={BarChart3} title="Star Rating Calculation" description="Star ratings are the mathematical average of ALL non-flagged reviews, regardless of visibility. This prevents manipulation and ensures accuracy." />

						<AlgorithmStep step="7" icon={Activity} title="Comprehensive Audit Trail" description="Every moderation action, algorithm change, and review edit is logged with timestamps and published in our public changelog." />
					</div>

					{/* Algorithm Visualization */}
					<div className="bg-white dark:bg-slate-900 rounded-2xl p-8 lg:p-12 border border-slate-200 dark:border-slate-700">
						<h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Live Algorithm Status</h3>

						<div className="grid lg:grid-cols-3 gap-8">
							<div className="text-center">
								<div className="w-16 h-16 bg-success/10 dark:bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
									<CheckCircle className="w-8 h-8 text-success dark:text-success" />
								</div>
								<h4 className="font-semibold text-slate-900 dark:text-white mb-2">Algorithm Status</h4>
								<p className="text-success dark:text-success font-medium">Fully Operational</p>
								<p className="text-sm text-slate-600 dark:text-slate-400">Last updated: 2 minutes ago</p>
							</div>

							<div className="text-center">
								<div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
									<Lock className="w-8 h-8 text-primary dark:text-primary" />
								</div>
								<h4 className="font-semibold text-slate-900 dark:text-white mb-2">Security Level</h4>
								<p className="text-primary dark:text-primary font-medium">Maximum</p>
								<p className="text-sm text-slate-600 dark:text-slate-400">All systems verified</p>
							</div>

							<div className="text-center">
								<div className="w-16 h-16 bg-muted dark:bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
									<Zap className="w-8 h-8 text-muted-foreground dark:text-muted-foreground" />
								</div>
								<h4 className="font-semibold text-slate-900 dark:text-white mb-2">Processing Speed</h4>
								<p className="text-muted-foreground dark:text-muted-foreground font-medium">847ms avg</p>
								<p className="text-sm text-slate-600 dark:text-slate-400">Reviews per second: 1,247</p>
							</div>
						</div>

						<div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
							<p className="text-slate-600 dark:text-slate-400 mb-4">Want to see the actual code behind these processes?</p>
							<Button asChild className="bg-primary hover:bg-primary text-white">
								<Link href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
									<GitBranch className="mr-2 w-4 h-4" />
									View Full Algorithm Code
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Interactive Changelog Timeline */}
			<section className="py-20 bg-white dark:bg-slate-900">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 bg-primary dark:bg-primary/20 text-primary dark:text-primary/90 border-primary/30 dark:border-primary">
							<Clock className="w-4 h-4 mr-2" />
							Development Timeline
						</Badge>
						<h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">Transparency Changelog</h2>
						<p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Every change to our review algorithm and moderation logic is tracked and published in real-time.</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12">
						{/* Timeline */}
						<div className="space-y-8">
							<h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Recent Updates</h3>

							<TimelineItem date="2024-06-10" title="Blockchain-Backed Review Logging" description="Implemented immutable blockchain logging for all review submissions and moderation actions (in development)" />

							<TimelineItem date="2024-06-05" title="Transparency Advisory Board Launch" description="Established independent board of SMB owners, consumer advocates, and industry experts" />

							<TimelineItem date="2024-06-01" title="Public Moderation Logs" description="Made all moderation actions publicly visible with detailed reasoning and timestamps" />

							<TimelineItem date="2024-05-20" title="Open-Source Algorithm Release" description="Published complete review algorithm source code on GitHub for public audit" isLast={true} />
						</div>

						{/* Live Statistics */}
						<div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8">
							<h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Live Development Stats</h3>

							<div className="space-y-6">
								<div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-lg hover:shadow-lg transition-all duration-300">
									<div>
										<div className="font-semibold text-slate-900 dark:text-white">Git Commits Today</div>
										<div className="text-sm text-slate-600 dark:text-slate-400">Algorithm improvements</div>
									</div>
									<div className="text-2xl font-bold text-primary dark:text-primary">23</div>
								</div>

								<div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-lg hover:shadow-lg transition-all duration-300">
									<div>
										<div className="font-semibold text-slate-900 dark:text-white">Code Reviews</div>
										<div className="text-sm text-slate-600 dark:text-slate-400">Peer reviewed changes</div>
									</div>
									<div className="text-2xl font-bold text-success dark:text-success">8</div>
								</div>

								<div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-lg hover:shadow-lg transition-all duration-300">
									<div>
										<div className="font-semibold text-slate-900 dark:text-white">Security Audits</div>
										<div className="text-sm text-slate-600 dark:text-slate-400">This month</div>
									</div>
									<div className="text-2xl font-bold text-muted-foreground dark:text-muted-foreground">3</div>
								</div>

								<div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-lg hover:shadow-lg transition-all duration-300">
									<div>
										<div className="font-semibold text-slate-900 dark:text-white">Open Issues</div>
										<div className="text-sm text-slate-600 dark:text-slate-400">Community reported</div>
									</div>
									<div className="text-2xl font-bold text-warning dark:text-warning">2</div>
								</div>
							</div>

							<div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
								<Button asChild variant="outline" className="w-full border-primary/30 dark:border-primary hover:bg-primary dark:hover:bg-primary/20">
									<Link href={CHANGELOG_URL} target="_blank" rel="noopener noreferrer">
										<FileText className="mr-2 w-4 h-4" />
										View Full Changelog on GitHub
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Advisory Board & Audits - Enhanced */}
			<section className="py-20 bg-slate-50 dark:bg-slate-800/50">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 bg-white dark:bg-slate-900 border-success dark:border-success">
							<ShieldCheck className="w-4 h-4 mr-2" />
							Independent Oversight
						</Badge>
						<h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">Transparency Advisory Board</h2>
						<p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">Independent experts ensuring our transparency commitments are real and meaningful</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-12">
						{/* Board Information */}
						<Card className="bg-white dark:bg-slate-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
							<div className="absolute inset-0 bg-success dark:bg-success/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<CardContent className="relative p-8">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-12 h-12 bg-success/10 dark:bg-success/20 rounded-lg flex items-center justify-center">
										<Users className="w-6 h-6 text-success dark:text-success" />
									</div>
									<h3 className="text-2xl font-bold text-slate-900 dark:text-white">Board Composition</h3>
								</div>

								<div className="space-y-4 text-slate-700 dark:text-slate-300">
									<div className="flex items-center gap-3 p-3 bg-success dark:bg-success/20 rounded-lg">
										<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
										<span>Small business owners from diverse industries</span>
									</div>
									<div className="flex items-center gap-3 p-3 bg-success dark:bg-success/20 rounded-lg">
										<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
										<span>Consumer advocacy group representatives</span>
									</div>
									<div className="flex items-center gap-3 p-3 bg-success dark:bg-success/20 rounded-lg">
										<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
										<span>Technology and ethics experts</span>
									</div>
									<div className="flex items-center gap-3 p-3 bg-success dark:bg-success/20 rounded-lg">
										<CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0" />
										<span>Independent security auditors</span>
									</div>
								</div>

								<div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
									<p className="text-slate-600 dark:text-slate-400">The board meets quarterly to audit our processes and publish public reports. All meetings are recorded and transcripts are made public.</p>
								</div>
							</CardContent>
						</Card>

						{/* Recent Audits */}
						<div className="space-y-6">
							<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
											<FileText className="w-4 h-4 text-primary dark:text-primary" />
										</div>
										<h4 className="font-semibold text-slate-900 dark:text-white">2024 Q2 Audit Report</h4>
									</div>
									<Badge variant="outline" className="bg-success dark:bg-success/20 text-success dark:text-success/90 border-success dark:border-success">
										Published
									</Badge>
								</div>
								<p className="text-slate-600 dark:text-slate-400 mb-4">Comprehensive review of our algorithm transparency, moderation practices, and community feedback integration.</p>
								<Button asChild variant="outline" size="sm" className="group-hover:bg-primary dark:group-hover:bg-primary/20">
									<Link href="#" target="_blank" rel="noopener noreferrer">
										<FileText className="mr-2 w-4 h-4" />
										Read Full Report
									</Link>
								</Button>
							</div>

							<div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-success/10 dark:bg-success/20 rounded-lg flex items-center justify-center">
											<FileText className="w-4 h-4 text-success dark:text-success" />
										</div>
										<h4 className="font-semibold text-slate-900 dark:text-white">2024 Q1 Audit Report</h4>
									</div>
									<Badge variant="outline" className="bg-success dark:bg-success/20 text-success dark:text-success/90 border-success dark:border-success">
										Published
									</Badge>
								</div>
								<p className="text-slate-600 dark:text-slate-400 mb-4">Initial audit establishing baseline transparency standards and identifying areas for improvement.</p>
								<Button asChild variant="outline" size="sm" className="group-hover:bg-success dark:group-hover:bg-success/20">
									<Link href="#" target="_blank" rel="noopener noreferrer">
										<FileText className="mr-2 w-4 h-4" />
										Read Full Report
									</Link>
								</Button>
							</div>

							<div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
								<h4 className="font-semibold text-slate-900 dark:text-white mb-4">Join Our Advisory Board</h4>
								<p className="text-slate-600 dark:text-slate-400 mb-4">We're always looking for qualified individuals to join our transparency efforts.</p>
								<Button asChild variant="outline" className="w-full">
									<Link href="/contact-support">
										<Users className="mr-2 w-4 h-4" />
										Apply to Join Board
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Enhanced Call to Action */}
			<section className="py-20 bg-white dark:bg-slate-900">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="outline" className="mb-4 bg-primary dark:bg-primary/20 text-primary dark:text-primary/90 border-primary/30 dark:border-primary">
							<TrendingUp className="w-4 h-4 mr-2" />
							Join the Movement
						</Badge>
						<h2 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
							Help Us Build the Most
							<span className="block text-primary dark:text-primary">Trusted Platform</span>
						</h2>
						<p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">Thorbis is a living experiment in radical transparency. Audit us, contribute code, ask questions, or simply hold us accountable. We're here to earn your trust, every single day.</p>
					</div>

					{/* Action Cards */}
					<div className="grid md:grid-cols-3 gap-8 mb-16">
						<Card className="group bg-slate-50 dark:bg-slate-800/50 border-0 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
							<CardContent className="p-8 text-center">
								<div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<GitBranch className="w-8 h-8 text-primary dark:text-primary" />
								</div>
								<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Contribute Code</h3>
								<p className="text-slate-600 dark:text-slate-400 mb-6">Review our algorithms, suggest improvements, or contribute new features to make transparency even better.</p>
								<Button asChild className="w-full bg-primary hover:bg-primary text-white">
									<Link href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
										<GitBranch className="mr-2 w-4 h-4" />
										View on GitHub
									</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="group bg-slate-50 dark:bg-slate-800/50 border-0 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
							<CardContent className="p-8 text-center">
								<div className="w-16 h-16 bg-success/10 dark:bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<Shield className="w-8 h-8 text-success dark:text-success" />
								</div>
								<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Audit Our Systems</h3>
								<p className="text-slate-600 dark:text-slate-400 mb-6">Independent security researchers and transparency advocates are always welcome to audit our processes.</p>
								<Button asChild variant="outline" className="w-full border-success dark:border-success hover:bg-success dark:hover:bg-success/20">
									<Link href="/trust-safety">
										<Shield className="mr-2 w-4 h-4" />
										Trust & Safety
									</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="group bg-slate-50 dark:bg-slate-800/50 border-0 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
							<CardContent className="p-8 text-center">
								<div className="w-16 h-16 bg-muted dark:bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
									<Users className="w-8 h-8 text-muted-foreground dark:text-muted-foreground" />
								</div>
								<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Join the Discussion</h3>
								<p className="text-slate-600 dark:text-slate-400 mb-6">Have questions about our transparency practices? Want to suggest improvements? We're always listening.</p>
								<Button asChild variant="outline" className="w-full border-border dark:border-border hover:bg-muted dark:hover:bg-muted/20">
									<Link href="/contact-support">
										<Users className="mr-2 w-4 h-4" />
										Get in Touch
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Bottom CTA */}
					<div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 lg:p-12 text-center">
						<h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to Experience True Transparency?</h3>
						<p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">See our transparency in action. Every review, every rating, every moderation decision - all open for your inspection.</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button asChild size="lg" className="bg-primary hover:bg-primary text-white px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group">
								<Link href="/search">
									<Search className="mr-3 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
									Explore Businesses
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg font-medium border-2 border-slate-200 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary transition-all duration-300 hover:scale-105">
								<Link href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
									<Eye className="mr-3 w-5 h-5" />
									View the Code
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

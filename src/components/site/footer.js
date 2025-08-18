"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaDiscord, FaCertificate, FaAward, FaBriefcaseMedical, FaBookOpen, FaBuilding } from "react-icons/fa";
import { SiYelp, SiGoogle, SiTripadvisor, SiExpedia, SiThumbtack } from "react-icons/si";
import { MdVerifiedUser, MdGppGood, MdSecurity, MdRateReview, MdWork, MdCompare } from "react-icons/md";
import LanguageSelector from "@components/ui/language-selector";
import { useTranslation } from "@lib/i18n/enhanced-client";
import { Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
 

export default function Footer() {
	const pathname = usePathname();
	const { dictionary, isLoading } = useTranslation();

	// Check if the current route contains /search
	if (pathname.includes("/search")) {
		return null;
	}



	// Ensure consistent initial rendering to prevent hydration mismatches
	const footer =
		isLoading || !dictionary?.footer
			? {
					trademark: "Connecting local businesses with their communities.",
					mission: "Empowering small businesses through innovative technology and community-first approach.",
					trustTitle: "Trusted & Secure",
					compareTitle: "Compare Alternatives",
					compareDescription: "See how Thorbis compares to other business platforms",
					sections: {
						about: "About",
						support: "Support",
						business: "Business",
						legal: "Legal",
						resources: "Resources",
					},
                                        links: {
                                                aboutUs: "About Us",
                                                careers: "Careers",
                                                press: "Press",
                                                investorRelations: "Investor Relations",
                                                legal: "Legal",
                                                mobile: "Mobile App",
                                                developers: "Developers",
                                                contactSupport: "Contact Support",
                                                helpCenter: "Help Center",
                                                faq: "FAQ",
                                                businessForBusiness: "For Business",
                                                claimBusiness: "Claim Business",
                                                advertise: "Advertise",
                                                restaurantOwners: "Restaurant Owners",
                                                blog: "Blog",
                                                news: "News",
                                                events: "Events",
                                                caseStudies: "Case Studies",
                                                sitemap: "Sitemap",
                                                status: "Status",
                                                feedback: "Feedback",
                                        },
					copyright: "© 2024 Thorbis. All rights reserved.",
					madeWith: "Made with love for local businesses",
				}
			: dictionary.footer;

	return (
		<>
			<footer className="relative w-full bg-neutral-900 text-white border-t border-neutral-800" suppressHydrationWarning>
				{/* Main Footer Content */}
				<div className="px-4 py-16 lg:px-24">
					{/* Header Section with Brand + App CTAs */}
					<div className="flex flex-col lg:flex-row justify-between items-start mb-16">
						{/* Brand Section */}
						<div className="mb-8 lg:mb-0">
							<div className="flex items-center mb-4 space-x-4">
								<Image src="/logos/ThorbisLogo.webp" alt="Thorbis" width={60} height={60} className="w-auto h-12" />
								<h1 className="text-3xl font-bold text-white">Thorbis</h1>
							</div>
							<p className="max-w-md text-lg leading-relaxed text-slate-300 mb-4">{footer.trademark}</p>
							<p className="max-w-md text-base text-slate-400 mb-6">{footer.mission}</p>

							{/* Social Links */}
							<div className="flex space-x-3">
								<a href="https://twitter.com/localhub" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
									<Twitter className="w-5 h-5" />
								</a>
								<a href="https://facebook.com/localhub" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
									<Facebook className="w-5 h-5" />
								</a>
								<a href="https://instagram.com/localhub" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
									<Instagram className="w-5 h-5" />
								</a>
								<a href="https://linkedin.com/company/localhub" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
									<Linkedin className="w-5 h-5" />
								</a>
								<a href="https://youtube.com/localhub" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
									<Youtube className="w-5 h-5" />
								</a>
								<a href="#" className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
									<FaDiscord className="w-5 h-5" />
								</a>
							</div>
						</div>

						{/* App CTAs */}
						<div className="flex flex-col gap-3">
							<div className="text-sm font-medium text-slate-400 mb-2">Get the app</div>
							<div className="flex flex-col sm:flex-row gap-3">
								<Link href="/mobile" aria-label="Download on the App Store" className="inline-flex items-center gap-3 rounded-2xl border px-6 py-4 bg-neutral-800 border-neutral-700 hover:bg-neutral-700 transition-colors text-white min-w-[160px]">
									<FaApple className="w-7 h-7" />
									<div className="text-left">
										<div className="text-xs text-slate-400">Download on the</div>
										<div className="text-lg font-semibold">App Store</div>
									</div>
								</Link>
								<Link href="/mobile" aria-label="Get it on Google Play" className="inline-flex items-center gap-3 rounded-2xl border px-6 py-4 bg-neutral-800 border-emerald-400/30 hover:bg-neutral-700 transition-colors text-white min-w-[160px]">
									<FaGooglePlay className="w-7 h-7 text-emerald-400" />
									<div className="text-left">
										<div className="text-xs text-slate-400">Get it on</div>
										<div className="text-lg font-semibold">Google Play</div>
									</div>
								</Link>
							</div>
						</div>
					</div>

					{/* Trust Indicators - Simplified */}
					<div className="mb-16">
						<h3 className="text-xl font-bold text-white mb-6 text-center">{footer.trustTitle}</h3>
						<div className="flex flex-wrap justify-center gap-6">
							<div className="flex items-center gap-2 text-green-400">
								<MdVerifiedUser className="w-5 h-5" />
								<span className="text-sm font-medium">Privacy Shield</span>
							</div>
							<div className="flex items-center gap-2 text-blue-400">
								<FaCertificate className="w-5 h-5" />
								<span className="text-sm font-medium">ISO 27001</span>
							</div>
							<div className="flex items-center gap-2 text-purple-400">
								<FaAward className="w-5 h-5" />
								<span className="text-sm font-medium">SOC2</span>
							</div>
							<div className="flex items-center gap-2 text-orange-400">
								<MdGppGood className="w-5 h-5" />
								<span className="text-sm font-medium">CCPA</span>
							</div>
							<div className="flex items-center gap-2 text-indigo-400">
								<MdSecurity className="w-5 h-5" />
								<span className="text-sm font-medium">GDPR</span>
							</div>
							<div className="flex items-center gap-2 text-teal-400">
								<FaBriefcaseMedical className="w-5 h-5" />
								<span className="text-sm font-medium">HIPAA</span>
							</div>
						</div>
					</div>

					{/* Compare Alternatives - Visual Grid */}
					<div className="mb-16">
						<div className="mb-12 text-center">
							<h3 className="flex gap-3 justify-center items-center mb-4 text-2xl font-bold text-white">
								<MdCompare className="w-6 h-6 text-blue-300" />
								{footer.compareTitle}
							</h3>
							<p className="mx-auto max-w-2xl text-lg text-slate-300">{footer.compareDescription}</p>
						</div>
						<div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
							<Link href="/yelp-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-red-500/10 border border-neutral-700 hover:border-red-400/30 transition-all">
								<SiYelp className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs Yelp</span>
							</Link>
							<Link href="/google-business-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-blue-500/10 border border-neutral-700 hover:border-blue-400/30 transition-all">
								<SiGoogle className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs Google</span>
							</Link>
							<Link href="/tripadvisor-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-green-500/10 border border-neutral-700 hover:border-green-400/30 transition-all">
								<SiTripadvisor className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs TripAdvisor</span>
							</Link>
							<Link href="/angies-list-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-pink-500/10 border border-neutral-700 hover:border-pink-400/30 transition-all">
								<MdRateReview className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs Angie's List</span>
							</Link>
							<Link href="/booking-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-cyan-500/10 border border-neutral-700 hover:border-cyan-400/30 transition-all">
								<FaBuilding className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs Booking</span>
							</Link>
							<Link href="/expedia-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-orange-500/10 border border-neutral-700 hover:border-orange-400/30 transition-all">
								<SiExpedia className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs Expedia</span>
							</Link>
							<Link href="/yellow-pages-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-yellow-500/10 border border-neutral-700 hover:border-yellow-400/30 transition-all">
								<FaBookOpen className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs Yellow Pages</span>
							</Link>
							<Link href="/bark-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-emerald-500/10 border border-neutral-700 hover:border-emerald-400/30 transition-all">
								<MdWork className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs Bark</span>
							</Link>
							<Link href="/thumbtack-alternative" className="group flex flex-col items-center p-4 rounded-xl bg-neutral-800/50 hover:bg-purple-500/10 border border-neutral-700 hover:border-purple-400/30 transition-all">
								<SiThumbtack className="w-8 h-8 text-white mb-2" />
								<span className="text-xs font-medium text-center text-slate-300">vs Thumbtack</span>
							</Link>
						</div>
					</div>

					{/* Navigation Links - Clean Layout */}
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
						<div>
							<h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">{footer.sections.about}</h3>
							<div className="space-y-2">
                                                                <a href="/company" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                                                        {footer.links.aboutUs}
                                                                </a>
                                                                <a href="/jobs" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                                                        {footer.links.careers}
                                                                </a>
                                                                <a href="/company" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                                                        {footer.links.press}
                                                                </a>
                                                                <a href="/company" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                                                        {footer.links.investorRelations}
                                                                </a>
                                                                <a href="/legal" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                                                        {footer.links.legal}
                                                                </a>
                                                        </div>
                                                </div>

						<div>
							<h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">{footer.sections.support}</h3>
							<div className="space-y-2">
								<a href="/help" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.helpCenter}
								</a>
								<a href="/help" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.contactSupport}
								</a>
								<a href="/help" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.faq}
								</a>
								<a href="/developers" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.developers}
								</a>
								<button 
									onClick={() => {
										// Use the advanced VOIP system for call simulation
										console.log('📞 Launching Advanced VOIP Call Simulation...');
										
										// Import and use the VOIP integration
										if (typeof window !== 'undefined') {
											// Trigger VOIP integration
											const voipEvent = new CustomEvent('voip:simulate-call', {
												detail: {
													phoneNumber: '555-SUPPORT',
													customerName: 'Thorbis Support',
													company: 'Thorbis Communications',
													callType: 'support'
												}
											});
											window.dispatchEvent(voipEvent);
										}
									}}
									className="block text-sm text-slate-400 hover:text-white transition-colors text-left w-full"
								>
									📞 Advanced VOIP Demo
								</button>
							</div>
						</div>

						<div>
							<h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">{footer.sections.business}</h3>
							<div className="space-y-2">
								<a href="/pricing" className="block text-sm text-slate-400 hover:text-white transition-colors">
									Pricing
								</a>
								<a href="/business" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.businessForBusiness}
								</a>
								<a href="/claim-a-business" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.claimBusiness}
								</a>
								<a href="/advertise" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.advertise}
								</a>
								<a href="/restaurant-owners" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.restaurantOwners}
								</a>
							</div>
						</div>

                                                <div>
                                                        <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">{footer.sections.legal}</h3>
                                                        <div className="space-y-2">
                                                                <a href="/legal" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                                                        {footer.links.legal}
                                                                </a>
                                                        </div>
                                                </div>

						<div>
							<h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">{footer.sections.resources}</h3>
							<div className="space-y-2">
								<a href="/resources" className="block text-sm text-slate-400 hover:text-white transition-colors">
									Resources Hub
								</a>
								<a href="/blog" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.blog}
								</a>
								<a href="/resources#news" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.news}
								</a>
								<a href="/resources#events" className="block text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.events}
								</a>
								<a href="/partners" className="block text-sm text-slate-400 hover:text-white transition-colors">
									Partners
								</a>
							</div>
						</div>

						<div>
							<h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Industries</h3>
							<div className="space-y-2">
                                                                <a href="/discover#industries" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                                                        All Industries
                                                                </a>
								<a href="/field-management-software" className="block text-sm text-slate-400 hover:text-white transition-colors">
									Field Management
								</a>
								<a href="/construction-management-software" className="block text-sm text-slate-400 hover:text-white transition-colors">
									Construction
								</a>
								<a href="/retail-operations-platform" className="block text-sm text-slate-400 hover:text-white transition-colors">
									Retail
								</a>
								<a href="/healthcare-operations-platform" className="block text-sm text-slate-400 hover:text-white transition-colors">
									Healthcare
								</a>
							</div>
						</div>
					</div>



					{/* Bottom Section */}
					<div className="pt-8 border-t border-neutral-800">
						<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
							<div className="flex items-center gap-4 text-sm text-slate-400">
								<span>{footer.copyright}</span>
								<span>•</span>
								<span>{footer.madeWith}</span>
							</div>
							<div className="flex items-center gap-6">
								<a href="/sitemap" className="text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.sitemap}
								</a>
								<a href="/status" className="text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.status}
								</a>
								<a href="/feedback" className="text-sm text-slate-400 hover:text-white transition-colors">
									{footer.links.feedback}
								</a>
								<LanguageSelector />
							</div>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}


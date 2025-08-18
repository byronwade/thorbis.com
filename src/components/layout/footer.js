"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaDiscord, FaCertificate, FaAward, FaBriefcaseMedical, FaBookOpen, FaBuilding, FaGooglePlay } from "react-icons/fa";
import { SiYelp, SiGoogle, SiTripadvisor, SiExpedia, SiThumbtack } from "react-icons/si";
import { MdVerifiedUser, MdGppGood, MdSecurity, MdRateReview, MdWork, MdCompare, MdApple } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { Button } from "@components/ui/button";
import LanguageSelector from "@components/ui/language-selector";
import { useTranslation } from "@lib/i18n/enhanced-client";
import { Twitter, Facebook, Instagram, Linkedin, Youtube, ExternalLink, Smartphone } from "lucide-react";

export default function Footer() {
	const pathname = usePathname();
	const { dictionary, isLoading } = useTranslation();

	// Check if the current route contains /search
	if (pathname.includes("/search")) {
		return null;
	}

	// Always use the same structure, but provide fallback data to prevent hydration mismatches
	let footer;
	if (isLoading || !dictionary) {
		// Fallback footer data to match dictionary structure
		footer = {
			trademark: "Connecting local businesses with their communities.",
			mission: "Empowering small businesses through innovative technology and community-first approach.",
			trustTitle: "Trusted & Secure",
			compareTitle: "Compare Alternatives",
			compareDescription: "See how Thorbis compares to other business platforms",
			sections: {
				about: "Company",
				support: "Support",
				business: "Business",
				legal: "Legal",
			},
			links: {
				aboutUs: "About Us",
				careers: "Careers",
                                press: "Press",
                                investorRelations: "Investor Relations",
                                legal: "Legal",
                                transparency: "Transparency",
				helpCenter: "Help Center",
				contactSupport: "Contact Support",
				faq: "FAQ",
				mobile: "Mobile App",
				developers: "Developers",
				rss: "RSS",
				businessForBusiness: "For Business",
				claimBusiness: "Claim Business",
				advertise: "Advertise",
				restaurantOwners: "Restaurant Owners",
				tableManagement: "Table Management",
				businessOwnerLogin: "Business Owner Login",
				terms: "Terms of Service",
				privacy: "Privacy Policy",
				contentGuidelines: "Content Guidelines",
				communityGuidelines: "Community Guidelines",
				accessibility: "Accessibility",
				adChoices: "Ad Choices",
				sitemap: "Sitemap",
				status: "Status",
				feedback: "Feedback",
			},
			copyright: "© 2024 Thorbis. All rights reserved.",
			madeWith: "Made with love for local businesses",
		};
	} else {
		footer = dictionary.footer;
	}

	return (
		<>
			<footer className="relative w-full bg-neutral-950 text-white border-t border-neutral-800" suppressHydrationWarning>
				{/* Main Footer Content */}
				<div className="px-4 py-16 lg:px-24 max-w-screen-2xl mx-auto">
					{/* Header Section with Brand + App Downloads */}
					<div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
						{/* Brand Section */}
						<div className="flex-1 max-w-lg">
							<div className="flex items-center mb-6 space-x-4">
								<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={48} height={48} className="w-12 h-12 rounded-lg" priority={false} />
								<h2 className="text-2xl font-bold text-white">Thorbis</h2>
							</div>
							<p className="mb-4 text-lg leading-relaxed text-neutral-300">{footer.trademark}</p>
							<p className="mb-8 text-base text-neutral-400 leading-relaxed">{footer.mission}</p>

							{/* Social Links */}
							<div className="flex items-center gap-3 mb-8">
								{[
									{ href: "https://twitter.com/localhub", icon: Twitter, label: "Twitter" },
									{ href: "https://facebook.com/localhub", icon: Facebook, label: "Facebook" },
									{ href: "https://instagram.com/localhub", icon: Instagram, label: "Instagram" },
									{ href: "https://linkedin.com/company/localhub", icon: Linkedin, label: "LinkedIn" },
									{ href: "https://youtube.com/localhub", icon: Youtube, label: "YouTube" },
									{ href: "https://discord.gg/localhub", icon: FaDiscord, label: "Discord" },
								].map((social) => (
									<a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-200" aria-label={`Follow us on ${social.label}`}>
										<social.icon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
									</a>
								))}
							</div>

							{/* Language Selector */}
							<div className="mb-8">
								<LanguageSelector />
							</div>
						</div>

						{/* App Download Section */}
						<div className="flex-shrink-0">
							<div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 max-w-sm">
								<div className="flex items-center gap-3 mb-4">
									<Smartphone className="w-6 h-6 text-blue-400" />
									<h3 className="text-lg font-semibold text-white">Get the App</h3>
								</div>
								<p className="text-sm text-neutral-400 mb-6">Download our mobile app for the best experience on the go.</p>
								<div className="flex flex-col sm:flex-row gap-3">
									<Button variant="outline" size="sm" className="flex items-center gap-2 border-neutral-700 hover:border-neutral-600 bg-transparent" asChild>
										<a href="#" aria-label="Download on the App Store">
											<MdApple className="w-5 h-5" />
											<span className="text-xs">
												<div className="text-neutral-400">Download on the</div>
												<div className="font-semibold">App Store</div>
											</span>
										</a>
									</Button>
									<Button variant="outline" size="sm" className="flex items-center gap-2 border-neutral-700 hover:border-neutral-600 bg-transparent" asChild>
										<a href="#" aria-label="Get it on Google Play">
											<FaGooglePlay className="w-4 h-4" />
											<span className="text-xs">
												<div className="text-neutral-400">Get it on</div>
												<div className="font-semibold">Google Play</div>
											</span>
										</a>
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* Trust Badges Section */}
					<div className="mb-16">
						<div className="text-center mb-12">
							<h3 className="text-2xl font-bold text-white mb-4">{footer.trustTitle}</h3>
							<p className="text-neutral-400 max-w-2xl mx-auto">Your security and privacy are our top priorities. We maintain the highest standards of compliance and data protection.</p>
						</div>
						<TooltipProvider>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
								{[
									{
										name: "Privacy Shield",
										icon: MdVerifiedUser,
										color: "green",
										description: "Ensures your data is protected when transferred between the US and EU. We comply with strict privacy standards.",
									},
									{
										name: "ISO 27001",
										icon: FaCertificate,
										color: "blue",
										description: "International standard for information security management. We follow best practices to protect your data.",
									},
									{
										name: "SOC2",
										icon: FaAward,
										color: "purple",
										description: "Our systems are audited for security, availability, and confidentiality. Your data is handled with care.",
									},
									{
										name: "CCPA",
										icon: MdGppGood,
										color: "orange",
										description: "Gives California residents control over their personal information. We honor your privacy rights.",
									},
									{
										name: "GDPR",
										icon: MdSecurity,
										color: "indigo",
										description: "EU's data protection law. We are committed to transparency and user control over personal data.",
									},
									{
										name: "HIPAA",
										icon: FaBriefcaseMedical,
										color: "teal",
										description: "Protects your health information. We meet strict standards for medical data privacy and security.",
									},
								].map((badge, index) => (
									<Tooltip key={index}>
										<TooltipTrigger asChild>
											<div className="group relative flex flex-col items-center p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 cursor-pointer">
												<div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${badge.color}-500/10 border border-${badge.color}-500/20 mb-3 group-hover:bg-${badge.color}-500/20 transition-colors`}>
													<badge.icon className={`w-6 h-6 text-${badge.color}-400`} />
												</div>
												<span className="text-sm font-medium text-center text-white">{badge.name}</span>
											</div>
										</TooltipTrigger>
										<TooltipContent side="top" className="max-w-xs">
											<div className="p-3">
												<div className="font-semibold mb-1">{badge.name}</div>
												<div className="text-sm text-neutral-600">{badge.description}</div>
											</div>
										</TooltipContent>
									</Tooltip>
								))}
							</div>
						</TooltipProvider>
					</div>

					{/* Compare Alternatives Section */}
					<div className="mb-16">
						<div className="text-center mb-12">
							<div className="flex items-center justify-center gap-3 mb-4">
								<MdCompare className="w-6 h-6 text-blue-400" />
								<h3 className="text-2xl font-bold text-white">{footer.compareTitle}</h3>
							</div>
							<p className="text-neutral-400 max-w-2xl mx-auto">{footer.compareDescription}</p>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3">
							{[
								{ href: "/yelp-alternative", icon: SiYelp, name: "vs Yelp", color: "red" },
								{ href: "/google-business-alternative", icon: SiGoogle, name: "vs Google Business", color: "blue" },
								{ href: "/tripadvisor-alternative", icon: SiTripadvisor, name: "vs TripAdvisor", color: "green" },
								{ href: "/angies-list-alternative", icon: MdRateReview, name: "vs Angie's List", color: "pink" },
								{ href: "/booking-alternative", icon: FaBuilding, name: "vs Booking.com", color: "cyan" },
								{ href: "/expedia-alternative", icon: SiExpedia, name: "vs Expedia", color: "orange" },
								{ href: "/yellow-pages-alternative", icon: FaBookOpen, name: "vs Yellow Pages", color: "yellow" },
								{ href: "/bark-alternative", icon: MdWork, name: "vs Bark.com", color: "emerald" },
								{ href: "/thumbtack-alternative", icon: SiThumbtack, name: "vs Thumbtack", color: "purple" },
							].map((alternative, index) => (
								<Link key={index} href={alternative.href} className="group block min-h-[120px]" aria-label={`Compare Thorbis ${alternative.name}`}>
									<div className="flex flex-col items-center justify-between h-full p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-200">
										<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-neutral-800 border border-neutral-700 mb-3 group-hover:bg-neutral-700 transition-colors">
											<alternative.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
										</div>
										<span className="text-sm font-medium text-center text-white leading-tight">{alternative.name}</span>
										<ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-neutral-400 transition-colors mt-2" />
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* Navigation Links */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
						{/* Company */}
						<div>
							<h3 className="mb-6 text-lg font-semibold text-white">{footer.sections.about}</h3>
							<div className="space-y-3">
                                                                {[
                                                                        { href: "/company", label: footer.links.aboutUs },
                                                                        { href: "/jobs", label: footer.links.careers },
                                                                        { href: "/company", label: footer.links.press },
                                                                        { href: "/company", label: footer.links.investorRelations },
                                                                        { href: "/legal", label: footer.links.legal },
                                                                        { href: "/transparency", label: footer.links.transparency },
                                                                ].map((link, index) => (
                                                                        <a key={index} href={link.href} className="block text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                                                                                {link.label}
                                                                        </a>
                                                                ))}
							</div>
						</div>

						{/* Support */}
						<div>
							<h3 className="mb-6 text-lg font-semibold text-white">{footer.sections.support}</h3>
							<div className="space-y-3">
								{[
									{ href: "/help", label: footer.links.helpCenter },
									{ href: "/help", label: footer.links.contactSupport },
									{ href: "/help", label: footer.links.faq },
									{ href: "/developers", label: footer.links.developers },
									{ href: "/resources", label: "Resources" },
									{ href: "/partners", label: "Partners" },
								].map((link, index) => (
									<a key={index} href={link.href} className="block text-sm text-neutral-400 hover:text-white transition-colors duration-200">
										{link.label}
									</a>
								))}
							</div>
						</div>

						{/* Business */}
						<div>
							<h3 className="mb-6 text-lg font-semibold text-white">{footer.sections.business}</h3>
							<div className="space-y-3">
								{[
									{ href: "/business", label: footer.links.businessForBusiness },
									{ href: "/claim-a-business", label: footer.links.claimBusiness },
									{ href: "/advertise", label: footer.links.advertise },
									{ href: "/restaurant-owners", label: footer.links.restaurantOwners },
									{ href: "/table-management", label: footer.links.tableManagement },
									{ href: "/business-owner-login", label: footer.links.businessOwnerLogin },
								].map((link, index) => (
									<a key={index} href={link.href} className="block text-sm text-neutral-400 hover:text-white transition-colors duration-200">
										{link.label}
									</a>
								))}
							</div>
						</div>

                                                {/* Legal & Resources */}
                                                <div>
                                                        <h3 className="mb-6 text-lg font-semibold text-white">{footer.sections.legal}</h3>
                                                        <div className="space-y-3">
                                                                <a href="/legal" className="block text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                                                                        {footer.links.legal}
                                                                </a>
                                                        </div>
                                                </div>
                                        </div>

					{/* Industries Section */}
					<div className="mb-16">
						<h3 className="mb-6 text-lg font-semibold text-white">Industries We Serve</h3>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
							{[
								{ href: "/field-management-software", label: "Field Management" },
								{ href: "/construction-management-software", label: "Construction" },
								{ href: "/healthcare-operations-platform", label: "Healthcare" },
								{ href: "/retail-operations-platform", label: "Retail" },
								{ href: "/hospitality-operations-platform", label: "Hospitality" },
								{ href: "/automotive-shop-software", label: "Automotive" },
								{ href: "/property-management-platform", label: "Property Mgmt" },
								{ href: "/logistics-operations-platform", label: "Logistics" },
								{ href: "/agriculture-management-software", label: "Agriculture" },
								{ href: "/beauty-salon-software", label: "Beauty Salon" },
								{ href: "/fitness-studio-software", label: "Fitness" },
								{ href: "/real-estate-operations-platform", label: "Real Estate" },
							].map((industry, index) => (
								<a key={index} href={industry.href} className="block p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-center transition-all duration-200 group">
									<span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{industry.label}</span>
								</a>
							))}
						</div>
					</div>

					{/* Bottom Section */}
					<div className="pt-8 border-t border-neutral-800">
						<div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
							{/* Copyright */}
							<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-neutral-500">
								<span>{footer.copyright}</span>
								<span className="hidden sm:inline">•</span>
								<span>{footer.madeWith}</span>
							</div>

							{/* Bottom Links */}
							<div className="flex items-center gap-6">
								{[
									{ href: "/sitemap", label: footer.links.sitemap },
									{ href: "/status", label: footer.links.status },
									{ href: "/feedback", label: footer.links.feedback },
								].map((link, index) => (
									<a key={index} href={link.href} className="text-sm text-neutral-500 hover:text-white transition-colors duration-200">
										{link.label}
									</a>
								))}
							</div>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}



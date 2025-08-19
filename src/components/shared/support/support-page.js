"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/ui/accordion";
import { MessageCircle, BookOpen, Bot, Search, HelpCircle, Mail, Phone, Clock, CheckCircle, Info, MessageSquare, HeadphonesIcon } from "lucide-react";
import Chat from "@components/shared/chatBot/chat";

const supportCategories = [
	{ value: "technical", label: "Technical Issue", icon: "🔧" },
	{ value: "billing", label: "Billing & Payment", icon: "💳" },
	{ value: "account", label: "Account & Access", icon: "👤" },
	{ value: "feature", label: "Feature Request", icon: "💡" },
	{ value: "bug", label: "Bug Report", icon: "🐛" },
	{ value: "general", label: "General Inquiry", icon: "❓" },
	// LocalHub specific categories
	{ value: "directory", label: "Directory Setup", icon: "📁", userTypes: ["localhub"] },
	{ value: "customization", label: "Customization", icon: "🎨", userTypes: ["localhub"] },
	{ value: "domain", label: "Domain Issues", icon: "🌐", userTypes: ["localhub"] },
];

const knowledgeBaseArticles = [
	{
		id: 1,
		title: "Getting Started with Thorbis",
		category: "Getting Started",
		description: "Learn the basics of using Thorbis for your business",
		tags: ["beginner", "setup", "guide"],
		readTime: "5 min read",
	},
	{
		id: 2,
		title: "How to Claim Your Business",
		category: "Business Management",
		description: "Step-by-step guide to claiming and managing your business listing",
		tags: ["business", "claim", "verification"],
		readTime: "8 min read",
	},
	{
		id: 3,
		title: "Understanding Analytics & Reports",
		category: "Analytics",
		description: "Learn how to interpret your business analytics and reports",
		tags: ["analytics", "reports", "insights"],
		readTime: "10 min read",
	},
	{
		id: 4,
		title: "Managing Customer Reviews",
		category: "Reviews",
		description: "Best practices for managing and responding to customer reviews",
		tags: ["reviews", "customers", "engagement"],
		readTime: "6 min read",
	},
	{
		id: 5,
		title: "API Integration Guide",
		category: "Developers",
		description: "Complete guide to integrating Thorbis APIs into your applications",
		tags: ["api", "integration", "developers"],
		readTime: "15 min read",
	},
	{
		id: 6,
		title: "Billing & Subscription Management",
		category: "Billing",
		description: "Everything you need to know about billing and subscription options",
		tags: ["billing", "subscription", "payment"],
		readTime: "7 min read",
	},
	// LocalHub specific articles
	{
		id: 7,
		title: "Creating Your First LocalHub Directory",
		category: "LocalHub",
		description: "Step-by-step guide to creating and customizing your local business directory",
		tags: ["localhub", "directory", "setup"],
		readTime: "12 min read",
		userTypes: ["localhub"],
	},
	{
		id: 8,
		title: "Managing Directory Customizations",
		category: "LocalHub",
		description: "Learn how to customize your directory's appearance and functionality",
		tags: ["localhub", "customization", "design"],
		readTime: "8 min read",
		userTypes: ["localhub"],
	},
	{
		id: 9,
		title: "Domain Management for LocalHub",
		category: "LocalHub",
		description: "How to set up and manage custom domains for your directory",
		tags: ["localhub", "domains", "dns"],
		readTime: "10 min read",
		userTypes: ["localhub"],
	},
];

const faqs = [
	{
		question: "How do I claim my business on Thorbis?",
		answer: "To claim your business, visit your business listing page and click the 'Claim This Business' button. You'll need to verify your identity and provide business documentation.",
	},
	{
		question: "What are the subscription plans available?",
		answer: "We offer several subscription tiers: Free (basic listing), Pro ($29/month), and Enterprise (custom pricing). Each tier includes different features and benefits.",
	},
	{
		question: "How can I update my business information?",
		answer: "Once you've claimed your business, you can update information through your dashboard. Go to Business Profile > Edit Information to make changes.",
	},
	{
		question: "How do I respond to customer reviews?",
		answer: "In your dashboard, navigate to Reviews section. You can respond to reviews directly from there. We recommend responding to all reviews, both positive and negative.",
	},
	{
		question: "What payment methods do you accept?",
		answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans.",
	},
	{
		question: "How can I contact customer support?",
		answer: "You can contact us through this support page, email us at support@thorbis.com, or call us at 1-800-THORBIS during business hours.",
	},
	// LocalHub specific FAQs
	{
		question: "How do I create a LocalHub directory?",
		answer: "To create a LocalHub directory, go to your LocalHub dashboard and click 'Create Directory'. Follow the setup wizard to configure your directory settings and customization options.",
		userTypes: ["localhub"],
	},
	{
		question: "Can I use my own domain with LocalHub?",
		answer: "Yes! You can connect your custom domain to your LocalHub directory. Go to Domains in your LocalHub dashboard and follow the DNS configuration instructions.",
		userTypes: ["localhub"],
	},
	{
		question: "How do I customize my directory's appearance?",
		answer: "Use the Customization section in your LocalHub dashboard to modify colors, fonts, layout, and branding to match your brand identity.",
		userTypes: ["localhub"],
	},
];

const contactMethods = [
	{
		icon: Mail,
		title: "Email Support",
		description: "Get help via email",
		contact: "support@thorbis.com",
		responseTime: "Within 24 hours",
		available: "24/7",
	},
	{
		icon: Phone,
		title: "Phone Support",
		description: "Speak with our team",
		contact: "1-800-THORBIS",
		responseTime: "Immediate",
		available: "Mon-Fri, 9AM-6PM EST",
	},
	{
		icon: MessageCircle,
		title: "Live Chat",
		description: "Chat with AI assistant",
		contact: "Available now",
		responseTime: "Instant",
		available: "24/7",
	},
];

const supportSections = [
	{
		id: "ai-chat",
		label: "AI Assistant",
		icon: Bot,
		description: "Get instant help from our AI assistant",
	},
	{
		id: "knowledge-base",
		label: "Knowledge Base",
		icon: BookOpen,
		description: "Browse help articles and guides",
	},
	{
		id: "submit-ticket",
		label: "Submit Ticket",
		icon: MessageSquare,
		description: "Create a support ticket",
	},
	{
		id: "contact",
		label: "Contact Info",
		icon: HeadphonesIcon,
		description: "Direct contact methods",
	},
];

export default function SupportPage({ userType = "user" }) {
	const [activeSection, setActiveSection] = useState("ai-chat");
	const [searchQuery, setSearchQuery] = useState("");
	const [ticketForm, setTicketForm] = useState({
		category: "",
		subject: "",
		description: "",
		priority: "medium",
	});

	const filteredArticles = knowledgeBaseArticles.filter((article) => (article.userTypes ? article.userTypes.includes(userType) : true) && (article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.description.toLowerCase().includes(searchQuery.toLowerCase()) || article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))));

	const filteredFaqs = faqs.filter((faq) => (faq.userTypes ? faq.userTypes.includes(userType) : true));

	const filteredSupportCategories = supportCategories.filter((category) => (category.userTypes ? category.userTypes.includes(userType) : true));

	const handleTicketSubmit = (e) => {
		e.preventDefault();
		// Handle ticket submission logic here
		console.log("Submitting ticket:", ticketForm);
		// Reset form
		setTicketForm({
			category: "",
			subject: "",
			description: "",
			priority: "medium",
		});
	};

	const renderSection = () => {
		switch (activeSection) {
			case "ai-chat":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Bot className="w-5 h-5" />
									AI Support Assistant
								</CardTitle>
								<CardDescription>Get instant help from our AI assistant. Ask questions, get guidance, or troubleshoot issues.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[500px]">
									<Chat variant="Full" />
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "knowledge-base":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BookOpen className="w-5 h-5" />
									Knowledge Base
								</CardTitle>
								<CardDescription>Browse our comprehensive help articles and guides to find answers to common questions.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Search */}
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
									<Input placeholder="Search knowledge base..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
								</div>

								{/* Articles Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{filteredArticles.map((article) => (
										<Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
											<CardContent className="p-4">
												<div className="flex items-start justify-between mb-2">
													<Badge variant="outline" className="text-xs">
														{article.category}
													</Badge>
													<span className="text-xs text-muted-foreground">{article.readTime}</span>
												</div>
												<h3 className="font-semibold mb-2">{article.title}</h3>
												<p className="text-sm text-muted-foreground mb-3">{article.description}</p>
												<div className="flex flex-wrap gap-1">
													{article.tags.map((tag, index) => (
														<Badge key={index} variant="secondary" className="text-xs">
															{tag}
														</Badge>
													))}
												</div>
											</CardContent>
										</Card>
									))}
								</div>

								{/* FAQs */}
								<div className="mt-8">
									<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
										<HelpCircle className="w-5 h-5" />
										Frequently Asked Questions
									</h3>
									<Accordion type="single" collapsible className="space-y-2">
										{filteredFaqs.map((faq, index) => (
											<AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
												<AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
												<AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "submit-ticket":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MessageSquare className="w-5 h-5" />
									Submit Support Ticket
								</CardTitle>
								<CardDescription>Can&apos;t find what you&apos;re looking for? Submit a support ticket and we&apos;ll get back to you as soon as possible.</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleTicketSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">Category</label>
											<Select value={ticketForm.category} onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}>
												<SelectTrigger>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
												<SelectContent>
													{filteredSupportCategories.map((category) => (
														<SelectItem key={category.value} value={category.value}>
															<span className="flex items-center gap-2">
																<span>{category.icon}</span>
																{category.label}
															</span>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium">Priority</label>
											<Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="low">Low</SelectItem>
													<SelectItem value="medium">Medium</SelectItem>
													<SelectItem value="high">High</SelectItem>
													<SelectItem value="urgent">Urgent</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Subject</label>
										<Input placeholder="Brief description of your issue" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} required />
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Description</label>
										<Textarea placeholder="Please provide detailed information about your issue..." value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} rows={6} required />
									</div>

									<div className="flex items-center gap-4">
										<Button type="submit" className="flex items-center gap-2">
											<MessageSquare className="w-4 h-4" />
											Submit Ticket
										</Button>
										<Button type="button" variant="outline">
											Save Draft
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
				);

			case "contact":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<HeadphonesIcon className="w-5 h-5" />
									Contact Information
								</CardTitle>
								<CardDescription>Get in touch with our support team through various channels.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{contactMethods.map((method, index) => (
										<Card key={index} className="text-center">
											<CardContent className="pt-6">
												<method.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
												<h3 className="font-semibold mb-2">{method.title}</h3>
												<p className="text-sm text-muted-foreground mb-3">{method.description}</p>
												<p className="font-medium text-sm mb-1">{method.contact}</p>
												<p className="text-xs text-muted-foreground mb-2">Response: {method.responseTime}</p>
												<Badge variant="secondary" className="text-xs">
													{method.available}
												</Badge>
											</CardContent>
										</Card>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Additional Support Info */}
						<Card className="bg-muted/50">
							<CardContent className="pt-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
									<div>
										<CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
										<h3 className="font-semibold mb-1">Quick Response</h3>
										<p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
									</div>
									<div>
										<Info className="w-8 h-8 mx-auto mb-2 text-primary" />
										<h3 className="font-semibold mb-1">Expert Support</h3>
										<p className="text-sm text-muted-foreground">Our team of experts is here to help</p>
									</div>
									<div>
										<Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
										<h3 className="font-semibold mb-1">24/7 Availability</h3>
										<p className="text-sm text-muted-foreground">AI assistant available around the clock</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="w-full px-4 lg:px-24 py-16 space-y-8">
			<div className="grid w-full gap-2">
				<h1 className="text-4xl">Support Center</h1>
				<p className="text-muted-foreground">Get help with your {userType === "admin" ? "admin dashboard" : userType === "business" ? "business account" : userType === "localhub" ? "LocalHub directory" : "account"}. We&apos;re here to help you succeed.</p>
			</div>

			<div className="mx-auto grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
				<nav className="grid gap-4 text-sm text-muted-foreground">
					{supportSections.map((section) => {
						const Icon = section.icon;
						return (
							<button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-left ${activeSection === section.id ? "font-semibold text-primary bg-primary/5 border border-primary/20" : "hover:text-foreground hover:bg-muted"}`}>
								<Icon className="w-4 h-4" />
								<div className="flex flex-col items-start">
									<span>{section.label}</span>
									<span className="text-xs opacity-70">{section.description}</span>
								</div>
							</button>
						);
					})}
				</nav>

				<div className="grid gap-6">{renderSection()}</div>
			</div>
		</div>
	);
}

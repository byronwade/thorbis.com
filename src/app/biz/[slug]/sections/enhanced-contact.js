"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import { toast } from "@components/ui/use-toast";
import { Phone, Mail, MapPin, MessageSquare, Send, Clock, Globe, Navigation, Copy, Facebook, Twitter, Instagram, Linkedin, ExternalLink, Share2, Heart } from "lucide-react";
import { cn } from "@utils";

/**
 * Enhanced Contact Section with Modern Design and Interactive Features
 * Implements best practices for business profile engagement
 */
export default function EnhancedContact({ business }) {
	const [contactForm, setContactForm] = useState({
		name: "",
		email: "",
		phone: "",
		service: "",
		message: "",
		preferredContact: "email",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: "Message Sent!",
				description: "We'll get back to you within 24 hours.",
			});

			// Reset form
			setContactForm({
				name: "",
				email: "",
				phone: "",
				service: "",
				message: "",
				preferredContact: "email",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to send message. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Quick actions
	const quickActions = [
		{
			icon: Phone,
			label: "Call Now",
			action: () => business.phone && window.open(`tel:${business.phone}`),
			variant: "default",
			className: "bg-success hover:bg-success",
		},
		{
			icon: MessageSquare,
			label: "Text Message",
			action: () => business.phone && window.open(`sms:${business.phone}`),
			variant: "outline",
		},
		{
			icon: Mail,
			label: "Email",
			action: () => business.email && window.open(`mailto:${business.email}`),
			variant: "outline",
		},
		{
			icon: Navigation,
			label: "Directions",
			action: () => {
				const address = encodeURIComponent(business.address || business.name);
				window.open(`https://maps.google.com/maps?q=${address}`);
			},
			variant: "outline",
		},
	];

	// Social media links
	const socialLinks = [
		{ icon: Facebook, href: business.facebook, label: "Facebook" },
		{ icon: Instagram, href: business.instagram, label: "Instagram" },
		{ icon: Twitter, href: business.twitter, label: "Twitter" },
		{ icon: Linkedin, href: business.linkedin, label: "LinkedIn" },
	].filter((link) => link.href);

	// Copy contact info to clipboard
	const copyToClipboard = (text, label) => {
		navigator.clipboard.writeText(text).then(() => {
			toast({ title: `${label} copied to clipboard!` });
		});
	};

	// Share business profile
	const shareProfile = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: business.name,
					text: business.description,
					url: window.location.href,
				});
			} catch (error) {
				// Fallback to clipboard
				copyToClipboard(window.location.href, "Business link");
			}
		} else {
			copyToClipboard(window.location.href, "Business link");
		}
	};

	return (
		<section className="space-y-8">
			{/* Quick Actions Bar */}
			<Card className="border-0 shadow-sm">
				<CardContent className="p-6">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{quickActions.map((action, index) => (
							<Button key={index} variant={action.variant} size="lg" className={cn("flex flex-col items-center h-auto p-4 space-y-2", action.className)} onClick={action.action}>
								<action.icon className="w-5 h-5" />
								<span className="text-sm font-medium">{action.label}</span>
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Contact Form */}
				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center text-xl">
							<MessageSquare className="w-5 h-5 mr-2" />
							Send a Message
						</CardTitle>
						<CardDescription>Get a quote or ask questions about our services</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Input placeholder="Your Name *" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
								<Input type="email" placeholder="Email Address *" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Input type="tel" placeholder="Phone Number" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
								<Input placeholder="Service Needed" value={contactForm.service} onChange={(e) => setContactForm({ ...contactForm, service: e.target.value })} />
							</div>
							<Textarea placeholder="Tell us about your project or question..." rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required />
							<div className="flex items-center space-x-4">
								<span className="text-sm text-muted-foreground">Preferred contact method:</span>
								<div className="flex space-x-2">
									{["email", "phone", "text"].map((method) => (
										<Badge key={method} variant={contactForm.preferredContact === method ? "default" : "outline"} className="cursor-pointer" onClick={() => setContactForm({ ...contactForm, preferredContact: method })}>
											{method.charAt(0).toUpperCase() + method.slice(1)}
										</Badge>
									))}
								</div>
							</div>
							<Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
								{isSubmitting ? (
									<>Sending...</>
								) : (
									<>
										<Send className="w-4 h-4 mr-2" />
										Send Message
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Contact Information & Business Hours */}
				<div className="space-y-6">
					{/* Contact Info */}
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-xl">Contact Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Address */}
							<div className="flex items-start space-x-3">
								<MapPin className="w-5 h-5 text-muted-foreground mt-1" />
								<div className="flex-1">
									<p className="font-medium">{business.address || "Address not available"}</p>
									<p className="text-sm text-muted-foreground">{business.city && business.state ? `${business.city}, ${business.state}` : "Location"}</p>
									<Button
										variant="link"
										size="sm"
										className="p-0 h-auto text-primary"
										onClick={() => {
											const address = encodeURIComponent(business.address || business.name);
											window.open(`https://maps.google.com/maps?q=${address}`);
										}}
									>
										Get Directions <ExternalLink className="w-3 h-3 ml-1" />
									</Button>
								</div>
							</div>

							{/* Phone */}
							{business.phone && (
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<Phone className="w-5 h-5 text-muted-foreground" />
										<span className="font-medium">{business.phone}</span>
									</div>
									<Button variant="ghost" size="sm" onClick={() => copyToClipboard(business.phone, "Phone number")}>
										<Copy className="w-4 h-4" />
									</Button>
								</div>
							)}

							{/* Email */}
							{business.email && (
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<Mail className="w-5 h-5 text-muted-foreground" />
										<span className="font-medium">{business.email}</span>
									</div>
									<Button variant="ghost" size="sm" onClick={() => copyToClipboard(business.email, "Email address")}>
										<Copy className="w-4 h-4" />
									</Button>
								</div>
							)}

							{/* Website */}
							{business.website && (
								<div className="flex items-center space-x-3">
									<Globe className="w-5 h-5 text-muted-foreground" />
									<Button variant="link" className="p-0 h-auto font-medium text-primary" onClick={() => window.open(business.website, "_blank")}>
										Visit Website <ExternalLink className="w-3 h-3 ml-1" />
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Business Hours */}
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-xl flex items-center">
								<Clock className="w-5 h-5 mr-2" />
								Business Hours
							</CardTitle>
						</CardHeader>
						<CardContent>
							{business.business_hours?.length > 0 ? (
								<div className="space-y-2">
									{business.business_hours.map((hours, index) => (
										<div key={index} className="flex justify-between">
											<span className="capitalize font-medium">{hours.day_of_week}</span>
											<span className={hours.is_closed ? "text-destructive" : "text-success"}>{hours.is_closed ? "Closed" : `${hours.open_time} - ${hours.close_time}`}</span>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-4">
									<p className="text-muted-foreground">Hours not available</p>
									<p className="text-xs text-muted-foreground mt-1">Contact business for hours</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Social Media & Share */}
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-xl">Connect & Share</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Social Media Links */}
							{socialLinks.length > 0 && (
								<div>
									<p className="text-sm text-muted-foreground mb-3">Follow us on social media:</p>
									<div className="flex space-x-2">
										{socialLinks.map((social, index) => (
											<Button key={index} variant="outline" size="sm" className="p-2" onClick={() => window.open(social.href, "_blank")}>
												<social.icon className="w-4 h-4" />
											</Button>
										))}
									</div>
								</div>
							)}

							{/* Share Options */}
							<Separator />
							<div>
								<p className="text-sm text-muted-foreground mb-3">Share this business:</p>
								<div className="flex space-x-2">
									<Button variant="outline" size="sm" onClick={shareProfile}>
										<Share2 className="w-4 h-4 mr-2" />
										Share
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											// Save to favorites functionality
											toast({ title: "Added to favorites!" });
										}}
									>
										<Heart className="w-4 h-4 mr-2" />
										Save
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Emergency Contact Banner */}
			{business.emergency_services && (
				<Card className="border-2 border-red-200 bg-red-50">
					<CardContent className="p-6">
						<div className="flex items-center space-x-4">
							<div className="p-3 bg-destructive/10 rounded-full">
								<Phone className="w-6 h-6 text-destructive" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-destructive">Emergency Services Available</h3>
								<p className="text-destructive">24/7 emergency response for urgent situations</p>
							</div>
							<Button variant="default" className="bg-destructive hover:bg-destructive" onClick={() => business.phone && window.open(`tel:${business.phone}`)}>
								Call Now
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</section>
	);
}

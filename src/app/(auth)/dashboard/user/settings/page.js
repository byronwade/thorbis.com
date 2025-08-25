"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Copy, User, Shield, Bell, CreditCard, HelpCircle, Building2, Star, Users, MessageCircle, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { Badge } from "@components/ui/badge";

export default function Settings() {
	const [activeSection, setActiveSection] = useState("profile");

	useEffect(() => {
		document.title = "User Settings - Dashboard - Thorbis";
	}, []);

	const settingsSections = [
		{ id: "profile", label: "Profile", icon: User },
		{ id: "security", label: "Security", icon: Shield },
		{ id: "notifications", label: "Notifications", icon: Bell },
		{ id: "billing", label: "Billing", icon: CreditCard },
		{ id: "businesses", label: "My Businesses", icon: Building2 },
		{ id: "reviews", label: "Reviews", icon: Star },
		{ id: "referrals", label: "Referrals", icon: Users },
		{ id: "support", label: "Support", icon: HelpCircle },
	];

	const renderSection = () => {
		switch (activeSection) {
			case "profile":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>Update your personal information and profile details.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName">First Name</Label>
										<Input id="firstName" defaultValue="John" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="lastName">Last Name</Label>
										<Input id="lastName" defaultValue="Doe" />
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Input id="email" type="email" defaultValue="john.doe@example.com" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input id="phone" defaultValue="+1 (555) 123-4567" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="bio">Bio</Label>
									<Input id="bio" placeholder="Tell us about yourself..." />
								</div>
							</CardContent>
							<CardContent className="border-t pt-6">
								<Button>Save Changes</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Account Settings</CardTitle>
								<CardDescription>Manage your account preferences and settings.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Email Notifications</Label>
										<p className="text-sm text-muted-foreground">Receive email updates about your account.</p>
									</div>
									<Switch defaultChecked />
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Two-Factor Authentication</Label>
										<p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
									</div>
									<Switch />
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Public Profile</Label>
										<p className="text-sm text-muted-foreground">Allow others to see your profile information.</p>
									</div>
									<Switch defaultChecked />
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "security":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Password</CardTitle>
								<CardDescription>Update your password to keep your account secure.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="currentPassword">Current Password</Label>
									<Input id="currentPassword" type="password" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="newPassword">New Password</Label>
									<Input id="newPassword" type="password" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Confirm New Password</Label>
									<Input id="confirmPassword" type="password" />
								</div>
							</CardContent>
							<CardContent className="border-t pt-6">
								<Button>Update Password</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Two-Factor Authentication</CardTitle>
								<CardDescription>Add an extra layer of security to your account.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Enable 2FA</Label>
										<p className="text-sm text-muted-foreground">Use an authenticator app to generate codes.</p>
									</div>
									<Button variant="outline">Setup 2FA</Button>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Active Sessions</CardTitle>
								<CardDescription>Manage your active login sessions.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-success rounded-full"></div>
										<div>
											<p className="text-sm font-medium">Current Session</p>
											<p className="text-xs text-muted-foreground">Chrome on Mac • Active now</p>
										</div>
									</div>
									<Badge variant="secondary">Current</Badge>
								</div>
								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
										<div>
											<p className="text-sm font-medium">Mobile Session</p>
											<p className="text-xs text-muted-foreground">Safari on iPhone • 2 hours ago</p>
										</div>
									</div>
									<Button variant="outline" size="sm">
										Revoke
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "notifications":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Email Notifications</CardTitle>
								<CardDescription>Choose which emails you want to receive.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Job Applications</Label>
										<p className="text-sm text-muted-foreground">Get notified when someone applies to your job posts.</p>
									</div>
									<Switch defaultChecked />
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Review Responses</Label>
										<p className="text-sm text-muted-foreground">Receive notifications when businesses respond to your reviews.</p>
									</div>
									<Switch defaultChecked />
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Referral Bonuses</Label>
										<p className="text-sm text-muted-foreground">Get notified when you earn referral bonuses.</p>
									</div>
									<Switch defaultChecked />
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Platform Updates</Label>
										<p className="text-sm text-muted-foreground">Receive updates about new features and improvements.</p>
									</div>
									<Switch />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Push Notifications</CardTitle>
								<CardDescription>Manage your browser and mobile notifications.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Browser Notifications</Label>
										<p className="text-sm text-muted-foreground">Show notifications in your browser.</p>
									</div>
									<Switch defaultChecked />
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Sound Alerts</Label>
										<p className="text-sm text-muted-foreground">Play sounds for new notifications.</p>
									</div>
									<Switch />
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "billing":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Billing Information</CardTitle>
								<CardDescription>Manage your billing address and payment methods.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="billingAddress">Billing Address</Label>
									<Input id="billingAddress" placeholder="123 Main St" />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="billingCity">City</Label>
										<Input id="billingCity" placeholder="New York" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="billingState">State</Label>
										<Input id="billingState" placeholder="NY" />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="billingZip">ZIP Code</Label>
										<Input id="billingZip" placeholder="10001" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="billingCountry">Country</Label>
										<Input id="billingCountry" placeholder="United States" />
									</div>
								</div>
							</CardContent>
							<CardContent className="border-t pt-6">
								<Button>Update Billing Info</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Payment Methods</CardTitle>
								<CardDescription>Manage your saved payment methods.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center space-x-3">
										<CreditCard className="w-5 h-5" />
										<div>
											<p className="text-sm font-medium">•••• •••• •••• 4242</p>
											<p className="text-xs text-muted-foreground">Expires 12/25</p>
										</div>
									</div>
									<Badge variant="secondary">Default</Badge>
								</div>
								<Button variant="outline">Add Payment Method</Button>
							</CardContent>
						</Card>
					</div>
				);

			case "businesses":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>My Businesses</CardTitle>
								<CardDescription>Manage the businesses you own or have claimed.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center space-x-3">
										<Building2 className="w-5 h-5" />
										<div>
											<p className="text-sm font-medium">Wade&apos;s Plumbing</p>
											<p className="text-xs text-muted-foreground">Owner • Active</p>
										</div>
									</div>
									<Button variant="outline" size="sm">
										Manage
									</Button>
								</div>
								<Button variant="outline">Claim Another Business</Button>
							</CardContent>
						</Card>
					</div>
				);

			case "reviews":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Review Settings</CardTitle>
								<CardDescription>Manage your review preferences and settings.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Public Reviews</Label>
										<p className="text-sm text-muted-foreground">Allow others to see your reviews.</p>
									</div>
									<Switch defaultChecked />
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>Review Notifications</Label>
										<p className="text-sm text-muted-foreground">Get notified when businesses respond to your reviews.</p>
									</div>
									<Switch defaultChecked />
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "referrals":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Referral Program</CardTitle>
								<CardDescription>Invite friends and earn rewards.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="referralCode">Your Referral Code</Label>
									<div className="flex space-x-2">
										<Input id="referralCode" defaultValue="JOHN123" readOnly />
										<Button variant="outline" size="sm">
											<Copy className="w-4 h-4 mr-2" />
											Copy
										</Button>
									</div>
								</div>
								<div className="p-4 bg-muted rounded-lg">
									<p className="text-sm font-medium">Total Earnings: $45</p>
									<p className="text-xs text-muted-foreground">From 3 successful referrals</p>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "support":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Help & Support</CardTitle>
								<CardDescription>Get help with your account and platform usage.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-4">
									<Button variant="outline" className="justify-start" asChild>
										<Link href="/dashboard/user/support">
											<HelpCircle className="w-4 h-4 mr-2" />
											Support Center
										</Link>
									</Button>
									<Button variant="outline" className="justify-start" asChild>
										<Link href="/dashboard/user/support">
											<MessageCircle className="w-4 h-4 mr-2" />
											Submit Support Ticket
										</Link>
									</Button>
									<Button variant="outline" className="justify-start" asChild>
										<Link href="/dashboard/user/support">
											<BookOpen className="w-4 h-4 mr-2" />
											Knowledge Base
										</Link>
									</Button>
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
		<div className="w-full px-4 lg:px-24 py-16 space-y-8 bg-white dark:bg-neutral-900">
			<div className="grid w-full gap-2">
				<h1 className="text-4xl">Settings</h1>
				<p className="text-muted-foreground">Manage your account settings and preferences.</p>
			</div>

			<div className="grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
				<nav className="grid gap-4 text-sm text-muted-foreground">
					{settingsSections.map((section) => {
						const Icon = section.icon;
						return (
							<button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeSection === section.id ? "font-semibold text-primary bg-primary/5 border border-primary/20" : "hover:text-foreground hover:bg-muted"}`}>
								<Icon className="w-4 h-4" />
								<span>{section.label}</span>
							</button>
						);
					})}
				</nav>

				<div className="grid gap-6">{renderSection()}</div>
			</div>
		</div>
	);
}

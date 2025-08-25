"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Switch } from "@components/ui/switch";
import { Badge } from "@components/ui/badge";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Settings as SettingsIcon, Globe, Shield, Search, Zap, Copy, ExternalLink, Info, AlertTriangle, Check, Lock, Key, Users } from "lucide-react";
import { toast } from "@components/ui/use-toast";

export default function LocalHubSettings() {
	const [settings, setSettings] = useState({
		// General Settings
		directoryName: "Raleigh LocalHub",
		tagline: "Discover Local Businesses",
		description: "Find the best local businesses in Raleigh, NC. From restaurants to services, discover what your community has to offer.",
		contactEmail: "admin@raleigh.localhub.com",
		contactPhone: "(919) 555-0123",
		address: "123 Main St, Raleigh, NC 27601",

		// Domain Settings
		customDomain: "",
		subdomain: "raleigh",

		// SEO Settings
		metaTitle: "Raleigh LocalHub - Local Business Directory",
		metaDescription: "Find the best local businesses in Raleigh, NC. Discover restaurants, services, shops and more in your community.",
		keywords: "raleigh, local business, directory, restaurants, services, north carolina",

		// Feature Settings
		enableReviews: true,
		enableBookings: true,
		enablePhotos: true,
		showBusinessHours: true,
		allowBusinessClaims: true,
		requireApproval: false,
		enableSocialLogin: true,

		// Notification Settings
		emailNotifications: true,
		newBusinessAlerts: true,
		paymentAlerts: true,
		reviewAlerts: true,
	});

	const [activeSection, setActiveSection] = useState("general");

	const handleSettingChange = (key, value) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSaveSettings = () => {
		toast({
			title: "Settings Saved",
			description: "Your LocalHub settings have been updated successfully.",
		});
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		toast({
			title: "Copied",
			description: "Text copied to clipboard.",
		});
	};

	const dnsRecords = [
		{ type: "CNAME", name: "www", value: "raleigh.localhub.com" },
		{ type: "A", name: "@", value: "76.76.19.123" },
	];

	const navigationItems = [
		{ id: "general", label: "General", icon: SettingsIcon },
		{ id: "domain", label: "Domain", icon: Globe },
		{ id: "seo", label: "SEO", icon: Search },
		{ id: "features", label: "Features", icon: Zap },
		{ id: "security", label: "Security", icon: Shield },
	];

	return (
		<div className="w-full px-4 lg:px-24 py-16 space-y-8">
			<div className="grid w-full gap-2">
				<h1 className="text-4xl">Settings</h1>
				<p className="text-muted-foreground">Manage your LocalHub directory settings and preferences.</p>
			</div>

			<div className="grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
				{/* Sidebar Navigation */}
				<nav className="grid gap-4 text-sm text-muted-foreground">
					{navigationItems.map((item) => {
						const IconComponent = item.icon;
						return (
							<button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeSection === item.id ? "font-semibold text-primary bg-primary/5 border border-primary/20" : "hover:text-foreground hover:bg-muted"}`}>
								<IconComponent className="w-4 h-4" />
								<span>{item.label}</span>
							</button>
						);
					})}
				</nav>

				{/* Main Content */}
				<div className="grid gap-6">
					{/* General Settings */}
					{activeSection === "general" && (
						<>
							<Card>
								<CardHeader>
									<CardTitle>Directory Information</CardTitle>
									<CardDescription>Basic information about your LocalHub directory.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="directoryName">Directory Name</Label>
										<Input id="directoryName" value={settings.directoryName} onChange={(e) => handleSettingChange("directoryName", e.target.value)} />
									</div>
									<div>
										<Label htmlFor="tagline">Tagline</Label>
										<Input id="tagline" value={settings.tagline} onChange={(e) => handleSettingChange("tagline", e.target.value)} placeholder="A short description of your directory" />
									</div>
									<div>
										<Label htmlFor="description">Description</Label>
										<Textarea id="description" value={settings.description} onChange={(e) => handleSettingChange("description", e.target.value)} placeholder="Describe your local directory..." rows={3} />
									</div>
								</CardContent>
								<CardFooter className="px-6 py-4 border-t">
									<Button onClick={handleSaveSettings}>Save Changes</Button>
								</CardFooter>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Contact Information</CardTitle>
									<CardDescription>Contact details for your directory administration.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="contactEmail">Contact Email</Label>
										<Input id="contactEmail" type="email" value={settings.contactEmail} onChange={(e) => handleSettingChange("contactEmail", e.target.value)} />
									</div>
									<div>
										<Label htmlFor="contactPhone">Contact Phone</Label>
										<Input id="contactPhone" type="tel" value={settings.contactPhone} onChange={(e) => handleSettingChange("contactPhone", e.target.value)} />
									</div>
									<div>
										<Label htmlFor="address">Business Address</Label>
										<Input id="address" value={settings.address} onChange={(e) => handleSettingChange("address", e.target.value)} />
									</div>
								</CardContent>
								<CardFooter className="px-6 py-4 border-t">
									<Button onClick={handleSaveSettings}>Save Changes</Button>
								</CardFooter>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Notification Preferences</CardTitle>
									<CardDescription>Configure how you receive notifications about your directory.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Email Notifications</Label>
											<p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
										</div>
										<Switch checked={settings.emailNotifications} onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)} />
									</div>
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">New Business Alerts</Label>
											<p className="text-sm text-muted-foreground">Get notified when new businesses join</p>
										</div>
										<Switch checked={settings.newBusinessAlerts} onCheckedChange={(checked) => handleSettingChange("newBusinessAlerts", checked)} />
									</div>
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Payment Alerts</Label>
											<p className="text-sm text-muted-foreground">Receive notifications for payments and billing</p>
										</div>
										<Switch checked={settings.paymentAlerts} onCheckedChange={(checked) => handleSettingChange("paymentAlerts", checked)} />
									</div>
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Review Alerts</Label>
											<p className="text-sm text-muted-foreground">Get notified when businesses receive new reviews</p>
										</div>
										<Switch checked={settings.reviewAlerts} onCheckedChange={(checked) => handleSettingChange("reviewAlerts", checked)} />
									</div>
								</CardContent>
								<CardFooter className="px-6 py-4 border-t">
									<Button onClick={handleSaveSettings}>Save Changes</Button>
								</CardFooter>
							</Card>
						</>
					)}

					{/* Domain Settings */}
					{activeSection === "domain" && (
						<>
							<Card>
								<CardHeader>
									<CardTitle>Current Domain</CardTitle>
									<CardDescription>Your active LocalHub directory domain.</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between p-4 border border-border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center space-x-2">
												<h3 className="font-semibold">{settings.subdomain}.localhub.com</h3>
												<Badge className="bg-success/10 text-success border-green-200 text-xs">
													<Check className="w-3 h-3 mr-1" />
													Active
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">Your default LocalHub subdomain</p>
										</div>
										<Button variant="ghost" size="sm" onClick={() => window.open(`https://${settings.subdomain}.localhub.com`, "_blank")}>
											<ExternalLink className="w-4 h-4 mr-1" />
											Visit
										</Button>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Point Your Domain to LocalHub</CardTitle>
									<CardDescription>Connect your custom domain to your LocalHub directory.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<Alert>
										<Info className="h-4 w-4" />
										<AlertDescription>Already have a domain? Point it to your LocalHub directory by updating your DNS settings with the records below.</AlertDescription>
									</Alert>

									<div>
										<Label htmlFor="customDomain">Your Domain</Label>
										<Input id="customDomain" value={settings.customDomain} onChange={(e) => handleSettingChange("customDomain", e.target.value)} placeholder="yourdomain.com" />
										<p className="text-xs text-muted-foreground mt-1">Enter your domain without www or https://</p>
									</div>

									<div>
										<Label className="text-base font-medium">DNS Configuration</Label>
										<p className="text-sm text-muted-foreground mb-4">Add these DNS records to your domain provider:</p>

										<div className="space-y-3">
											{dnsRecords.map((record, index) => (
												<div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
													<div className="space-y-1">
														<div className="flex items-center space-x-2">
															<Badge variant="outline" className="text-xs">
																{record.type}
															</Badge>
															<span className="font-mono text-sm">{record.name}</span>
														</div>
														<p className="font-mono text-sm text-muted-foreground">{record.value}</p>
													</div>
													<Button variant="ghost" size="sm" onClick={() => copyToClipboard(record.value)}>
														<Copy className="w-4 h-4" />
													</Button>
												</div>
											))}
										</div>
									</div>

									<Alert>
										<AlertTriangle className="h-4 w-4" />
										<AlertDescription>DNS changes can take up to 24-48 hours to propagate worldwide. Contact support if you need help configuring your domain.</AlertDescription>
									</Alert>
								</CardContent>
								<CardFooter className="px-6 py-4 border-t">
									<div className="flex space-x-2">
										<Button onClick={handleSaveSettings}>Verify Domain</Button>
										<Button variant="outline">Contact Support</Button>
									</div>
								</CardFooter>
							</Card>
						</>
					)}

					{/* SEO Settings */}
					{activeSection === "seo" && (
						<>
							<Card>
								<CardHeader>
									<CardTitle>Search Engine Optimization</CardTitle>
									<CardDescription>Optimize your directory for search engines.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="metaTitle">Meta Title</Label>
										<Input id="metaTitle" value={settings.metaTitle} onChange={(e) => handleSettingChange("metaTitle", e.target.value)} />
										<p className="text-xs text-muted-foreground mt-1">Recommended: 50-60 characters</p>
									</div>
									<div>
										<Label htmlFor="metaDescription">Meta Description</Label>
										<Textarea id="metaDescription" value={settings.metaDescription} onChange={(e) => handleSettingChange("metaDescription", e.target.value)} rows={2} />
										<p className="text-xs text-muted-foreground mt-1">Recommended: 150-160 characters</p>
									</div>
									<div>
										<Label htmlFor="keywords">Keywords</Label>
										<Input id="keywords" value={settings.keywords} onChange={(e) => handleSettingChange("keywords", e.target.value)} placeholder="keyword1, keyword2, keyword3" />
										<p className="text-xs text-muted-foreground mt-1">Separate keywords with commas</p>
									</div>
								</CardContent>
								<CardFooter className="px-6 py-4 border-t">
									<Button onClick={handleSaveSettings}>Save Changes</Button>
								</CardFooter>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>SEO Preview</CardTitle>
									<CardDescription>Preview how your directory appears in search results.</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="p-4 border border-border rounded-lg bg-muted/50">
										<div className="space-y-1">
											<h3 className="text-lg font-medium text-primary hover:underline cursor-pointer">{settings.metaTitle}</h3>
											<p className="text-sm text-success">{settings.subdomain}.localhub.com</p>
											<p className="text-sm text-muted-foreground">{settings.metaDescription}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</>
					)}

					{/* Features Settings */}
					{activeSection === "features" && (
						<>
							<Card>
								<CardHeader>
									<CardTitle>Directory Features</CardTitle>
									<CardDescription>Configure what features are available in your directory.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Customer Reviews</Label>
											<p className="text-sm text-muted-foreground">Allow customers to leave reviews for businesses</p>
										</div>
										<Switch checked={settings.enableReviews} onCheckedChange={(checked) => handleSettingChange("enableReviews", checked)} />
									</div>
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Online Bookings</Label>
											<p className="text-sm text-muted-foreground">Enable appointment booking functionality</p>
										</div>
										<Switch checked={settings.enableBookings} onCheckedChange={(checked) => handleSettingChange("enableBookings", checked)} />
									</div>
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Photo Galleries</Label>
											<p className="text-sm text-muted-foreground">Allow businesses to upload photo galleries</p>
										</div>
										<Switch checked={settings.enablePhotos} onCheckedChange={(checked) => handleSettingChange("enablePhotos", checked)} />
									</div>
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Business Hours</Label>
											<p className="text-sm text-muted-foreground">Display business operating hours</p>
										</div>
										<Switch checked={settings.showBusinessHours} onCheckedChange={(checked) => handleSettingChange("showBusinessHours", checked)} />
									</div>
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Business Claims</Label>
											<p className="text-sm text-muted-foreground">Allow business owners to claim their listings</p>
										</div>
										<Switch checked={settings.allowBusinessClaims} onCheckedChange={(checked) => handleSettingChange("allowBusinessClaims", checked)} />
									</div>
								</CardContent>
								<CardFooter className="px-6 py-4 border-t">
									<Button onClick={handleSaveSettings}>Save Changes</Button>
								</CardFooter>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Business Management</CardTitle>
									<CardDescription>Control how businesses can join and interact with your directory.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Require Approval</Label>
											<p className="text-sm text-muted-foreground">Manually approve new business listings</p>
										</div>
										<Switch checked={settings.requireApproval} onCheckedChange={(checked) => handleSettingChange("requireApproval", checked)} />
									</div>
									<div className="flex items-center justify-between">
										<div>
											<Label className="text-base font-medium">Social Login</Label>
											<p className="text-sm text-muted-foreground">Allow businesses to sign up with Google/Facebook</p>
										</div>
										<Switch checked={settings.enableSocialLogin} onCheckedChange={(checked) => handleSettingChange("enableSocialLogin", checked)} />
									</div>
								</CardContent>
								<CardFooter className="px-6 py-4 border-t">
									<Button onClick={handleSaveSettings}>Save Changes</Button>
								</CardFooter>
							</Card>
						</>
					)}

					{/* Security Settings */}
					{activeSection === "security" && (
						<>
							<Card>
								<CardHeader>
									<CardTitle>Security & Privacy</CardTitle>
									<CardDescription>Security features and privacy settings for your directory.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<Alert>
										<Shield className="h-4 w-4" />
										<AlertDescription>Your LocalHub directory is protected with SSL encryption and regular security updates.</AlertDescription>
									</Alert>

									<div className="space-y-4">
										<div className="flex items-center justify-between p-4 border border-border rounded-lg">
											<div className="flex items-center space-x-3">
												<Lock className="w-5 h-5 text-success" />
												<div>
													<h4 className="font-medium">SSL Certificate</h4>
													<p className="text-sm text-muted-foreground">Automatically managed and renewed</p>
												</div>
											</div>
											<Badge className="bg-success/10 text-success border-green-200">Active</Badge>
										</div>

										<div className="flex items-center justify-between p-4 border border-border rounded-lg">
											<div className="flex items-center space-x-3">
												<Key className="w-5 h-5 text-primary" />
												<div>
													<h4 className="font-medium">Two-Factor Authentication</h4>
													<p className="text-sm text-muted-foreground">Add extra security to your account</p>
												</div>
											</div>
											<Button variant="outline" size="sm">
												Enable 2FA
											</Button>
										</div>

										<div className="flex items-center justify-between p-4 border border-border rounded-lg">
											<div className="flex items-center space-x-3">
												<Users className="w-5 h-5 text-purple-600" />
												<div>
													<h4 className="font-medium">Access Control</h4>
													<p className="text-sm text-muted-foreground">Manage who can access your directory</p>
												</div>
											</div>
											<Button variant="outline" size="sm">
												Manage Access
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Backup & Recovery</CardTitle>
									<CardDescription>Data backup and recovery options for your directory.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between p-4 border border-border rounded-lg">
										<div>
											<h4 className="font-medium">Automatic Backups</h4>
											<p className="text-sm text-muted-foreground">Daily backups of your directory data</p>
										</div>
										<Badge className="bg-primary/10 text-primary border-primary/30">Enabled</Badge>
									</div>

									<div className="flex items-center justify-between p-4 border border-border rounded-lg">
										<div>
											<h4 className="font-medium">Last Backup</h4>
											<p className="text-sm text-muted-foreground">March 15, 2024 at 3:00 AM</p>
										</div>
										<Button variant="outline" size="sm">
											Download Backup
										</Button>
									</div>
								</CardContent>
								<CardFooter className="px-6 py-4 border-t">
									<Button onClick={handleSaveSettings}>Configure Backups</Button>
								</CardFooter>
							</Card>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

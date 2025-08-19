"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Switch } from "@components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Palette, Upload, Type, Image as ImageIcon, Layout, Crown, Check, Home, IdCard, Layers, SlidersHorizontal } from "lucide-react";
import { toast } from "@components/ui/use-toast";
import Image from "next/image";

const colorSchemes = [
	{ name: "Ocean Blue", primary: "hsl(var(--primary))", secondary: "#06b6d4", accent: "#3b82f6" },
	{ name: "Forest Green", primary: "hsl(var(--muted-foreground))", secondary: "hsl(var(--muted-foreground))", accent: "hsl(var(--success))" },
	{ name: "Sunset Orange", primary: "hsl(var(--warning))", secondary: "#ea580c", accent: "hsl(var(--warning))" },
	{ name: "Royal Purple", primary: "hsl(var(--muted-foreground))", secondary: "hsl(var(--muted-foreground))", accent: "hsl(var(--muted-foreground))" },
	{ name: "Rose Pink", primary: "hsl(var(--muted-foreground))", secondary: "hsl(var(--muted-foreground))", accent: "hsl(var(--muted-foreground))" },
	{ name: "Custom", primary: "hsl(var(--primary))", secondary: "hsl(var(--primary))", accent: "hsl(var(--primary))" },
];

const layoutTemplates = [
	{
		id: "modern",
		name: "Modern Grid",
		description: "Clean grid layout with large business cards",
		preview: "/api/placeholder/300/200",
	},
	{
		id: "classic",
		name: "Classic List",
		description: "Traditional list view with detailed information",
		preview: "/api/placeholder/300/200",
	},
	{
		id: "compact",
		name: "Compact Tiles",
		description: "Space-efficient tile layout",
		preview: "/api/placeholder/300/200",
	},
];

const fontOptions = [
	{ name: "Inter", family: "Inter, sans-serif", weight: "300,400,500,600,700" },
	{ name: "Roboto", family: "Roboto, sans-serif", weight: "300,400,500,700" },
	{ name: "Open Sans", family: "Open Sans, sans-serif", weight: "300,400,600,700" },
	{ name: "Poppins", family: "Poppins, sans-serif", weight: "300,400,500,600,700" },
	{ name: "Lato", family: "Lato, sans-serif", weight: "300,400,700" },
];

const sidebarSections = [
	{ id: "appearance", label: "Appearance", icon: Palette },
	{ id: "branding", label: "Branding", icon: Crown },
	{ id: "homepage", label: "Homepage", icon: Home },
	{ id: "businessCards", label: "Business Cards", icon: IdCard },
	{ id: "directoryLayout", label: "Directory Layout", icon: Layers },
	{ id: "advanced", label: "Advanced", icon: SlidersHorizontal },
];

export default function Customization() {
	const [activeSection, setActiveSection] = useState("appearance");
	const [selectedColorScheme, setSelectedColorScheme] = useState("Ocean Blue");
	const [selectedLayout, setSelectedLayout] = useState("modern");
	const [selectedFont, setSelectedFont] = useState("Inter");
	const [settings, setSettings] = useState({
		siteName: "Portland LocalHub",
		tagline: "Discover Local Businesses",
		description: "Find the best local businesses in Portland. Discover restaurants, services, and more.",
		enableReviews: true,
		enableBookings: true,
		enablePhotos: true,
		showBusinessHours: true,
		allowBusinessClaims: true,
		homepageHeroTitle: "Welcome to Portland LocalHub!",
		homepageHeroSubtitle: "Your guide to the best local businesses.",
		homepageFeatured: "restaurants",
		cardShape: "rounded",
		cardShadow: true,
		cardShowLogo: true,
		cardShowRating: true,
		layoutType: "grid",
		customCSS: "",
		customJS: "",
		logoUrl: "",
		faviconUrl: "",
	});
	const [logoPreview, setLogoPreview] = useState("");
	const [faviconPreview, setFaviconPreview] = useState("");

	useEffect(() => {
		document.title = "Directory Customization - LocalHub - Thorbis";
	}, []);

	const handleLogoUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setLogoPreview(url);
			setSettings((prev) => ({ ...prev, logoUrl: url }));
		}
	};
	const handleFaviconUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setFaviconPreview(url);
			setSettings((prev) => ({ ...prev, faviconUrl: url }));
		}
	};

	const handleSaveSettings = () => {
		toast({
			title: "Settings Saved",
			description: "Your customization settings have been updated successfully.",
		});
	};

	return (
		<div className="w-full px-4 py-16 space-y-8 lg:px-24">
			<div className="grid w-full gap-2">
				<h1 className="text-4xl font-bold">Directory Customization</h1>
				<p className="mt-2 text-muted-foreground">Customize your directory&apos;s appearance, branding, and functionality to match your vision.</p>
			</div>
			<div className="mx-auto grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
				{/* Sidebar Navigation */}
				<nav className="grid gap-4 text-sm text-muted-foreground">
					{sidebarSections.map((item) => {
						const IconComponent = item.icon;
						return (
							<button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeSection === item.id ? "font-semibold text-primary bg-primary/5 border border-primary/20" : "hover:text-foreground hover:bg-muted"}`}>
								<IconComponent className="w-4 h-4" />
								<span>{item.label}</span>
							</button>
						);
					})}
				</nav>
				<div className="grid gap-6">
					{/* Appearance Section */}
					{activeSection === "appearance" && (
						<div className="space-y-6">
							{/* Color Schemes */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<Palette className="w-5 h-5 mr-2" />
										Color Scheme
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-3">
										{colorSchemes.map((scheme) => (
											<div key={scheme.name} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedColorScheme === scheme.name ? "border-primary" : "border-border"}`} onClick={() => setSelectedColorScheme(scheme.name)}>
												<div className="flex items-center space-x-3 mb-3">
													<div className="flex space-x-1">
														<div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.primary }}></div>
														<div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.secondary }}></div>
														<div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.accent }}></div>
													</div>
													{selectedColorScheme === scheme.name && <Check className="w-4 h-4 text-primary" />}
												</div>
												<h3 className="font-medium">{scheme.name}</h3>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Layout Templates */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<Layout className="w-5 h-5 mr-2" />
										Layout Template
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-3">
										{layoutTemplates.map((template) => (
											<div key={template.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedLayout === template.id ? "border-primary" : "border-border"}`} onClick={() => setSelectedLayout(template.id)}>
												<div className="aspect-video bg-muted rounded mb-3"></div>
												<div className="flex items-center justify-between">
													<div>
														<h3 className="font-medium">{template.name}</h3>
														<p className="text-sm text-muted-foreground">{template.description}</p>
													</div>
													{selectedLayout === template.id && <Check className="w-4 h-4 text-primary" />}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Typography */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<Type className="w-5 h-5 mr-2" />
										Typography
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<Label>Font Family</Label>
											<Select value={selectedFont} onValueChange={setSelectedFont}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{fontOptions.map((font) => (
														<SelectItem key={font.name} value={font.name}>
															<span style={{ fontFamily: font.family }}>{font.name}</span>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
					{/* Branding Section */}
					{activeSection === "branding" && (
						<div className="space-y-6">
							{/* Site Information */}
							<Card>
								<CardHeader>
									<CardTitle>Site Information</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="siteName">Site Name</Label>
										<Input id="siteName" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
									</div>
									<div>
										<Label htmlFor="tagline">Tagline</Label>
										<Input id="tagline" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
									</div>
									<div>
										<Label htmlFor="description">Site Description</Label>
										<Textarea id="description" value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} placeholder="Describe your local directory..." />
									</div>
								</CardContent>
							</Card>
							{/* Logo Upload */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<ImageIcon className="w-5 h-5 mr-2" />
										Logo & Images
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Site Logo</Label>
										<div className="flex items-center space-x-4 mt-2">
											{logoPreview || settings.logoUrl ? (
												<Image src={logoPreview || settings.logoUrl} alt="Logo Preview" width={64} height={64} className="w-16 h-16 rounded-lg border" />
											) : (
												<div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
													<Upload className="w-6 h-6 text-muted-foreground" />
												</div>
											)}
											<input type="file" accept="image/*" className="hidden" id="logo-upload" onChange={handleLogoUpload} />
											<Button variant="outline" size="sm" onClick={() => document.getElementById("logo-upload").click()}>
												<Upload className="w-4 h-4 mr-2" />
												Upload Logo
											</Button>
										</div>
									</div>
									<div>
										<Label>Favicon</Label>
										<div className="flex items-center space-x-4 mt-2">
											{faviconPreview || settings.faviconUrl ? (
												<Image src={faviconPreview || settings.faviconUrl} alt="Favicon Preview" width={32} height={32} className="w-8 h-8 rounded border" />
											) : (
												<div className="w-8 h-8 border-2 border-dashed border-border rounded flex items-center justify-center">
													<Upload className="w-4 h-4 text-muted-foreground" />
												</div>
											)}
											<input type="file" accept="image/*" className="hidden" id="favicon-upload" onChange={handleFaviconUpload} />
											<Button variant="outline" size="sm" onClick={() => document.getElementById("favicon-upload").click()}>
												<Upload className="w-4 h-4 mr-2" />
												Upload Favicon
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
					{/* Homepage Section */}
					{activeSection === "homepage" && (
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Hero Section</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="homepageHeroTitle">Hero Title</Label>
										<Input id="homepageHeroTitle" value={settings.homepageHeroTitle} onChange={(e) => setSettings({ ...settings, homepageHeroTitle: e.target.value })} />
									</div>
									<div>
										<Label htmlFor="homepageHeroSubtitle">Hero Subtitle</Label>
										<Input id="homepageHeroSubtitle" value={settings.homepageHeroSubtitle} onChange={(e) => setSettings({ ...settings, homepageHeroSubtitle: e.target.value })} />
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Featured Businesses</CardTitle>
								</CardHeader>
								<CardContent>
									<Label htmlFor="homepageFeatured">Featured Category</Label>
									<Select value={settings.homepageFeatured} onValueChange={(val) => setSettings({ ...settings, homepageFeatured: val })}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="restaurants">Restaurants</SelectItem>
											<SelectItem value="services">Services</SelectItem>
											<SelectItem value="shops">Shops</SelectItem>
											<SelectItem value="health">Health</SelectItem>
										</SelectContent>
									</Select>
								</CardContent>
							</Card>
						</div>
					)}
					{/* Business Cards Section */}
					{activeSection === "businessCards" && (
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Card Appearance</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="cardShape">Card Shape</Label>
										<Select value={settings.cardShape} onValueChange={(val) => setSettings({ ...settings, cardShape: val })}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="rounded">Rounded</SelectItem>
												<SelectItem value="square">Square</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="flex items-center justify-between">
										<Label>Card Shadow</Label>
										<Switch checked={settings.cardShadow} onCheckedChange={(checked) => setSettings({ ...settings, cardShadow: checked })} />
									</div>
									<div className="flex items-center justify-between">
										<Label>Show Logo</Label>
										<Switch checked={settings.cardShowLogo} onCheckedChange={(checked) => setSettings({ ...settings, cardShowLogo: checked })} />
									</div>
									<div className="flex items-center justify-between">
										<Label>Show Rating</Label>
										<Switch checked={settings.cardShowRating} onCheckedChange={(checked) => setSettings({ ...settings, cardShowRating: checked })} />
									</div>
								</CardContent>
							</Card>
						</div>
					)}
					{/* Directory Layout Section */}
					{activeSection === "directoryLayout" && (
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Layout Type</CardTitle>
								</CardHeader>
								<CardContent>
									<Label htmlFor="layoutType">Directory Layout</Label>
									<Select value={settings.layoutType} onValueChange={(val) => setSettings({ ...settings, layoutType: val })}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="grid">Grid</SelectItem>
											<SelectItem value="list">List</SelectItem>
											<SelectItem value="map">Map</SelectItem>
										</SelectContent>
									</Select>
								</CardContent>
							</Card>
						</div>
					)}
					{/* Advanced Section */}
					{activeSection === "advanced" && (
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Custom CSS</CardTitle>
								</CardHeader>
								<CardContent>
									<Textarea value={settings.customCSS} onChange={(e) => setSettings({ ...settings, customCSS: e.target.value })} placeholder="Add custom CSS here..." rows={6} />
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Custom JavaScript</CardTitle>
								</CardHeader>
								<CardContent>
									<Textarea value={settings.customJS} onChange={(e) => setSettings({ ...settings, customJS: e.target.value })} placeholder="Add custom JavaScript here..." rows={6} />
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

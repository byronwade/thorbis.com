/**
 * OverviewSection Component
 * Handles basic business information, contact details, and statistics
 * Extracted from the main business profile page for better modularity
 */

"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Building, Upload, Star, Camera } from "lucide-react";

const OverviewSection = ({ profile, setProfile, isEditing, handleSaveProfile, fileInputRef }) => {
	const handleImageUpload = (type) => {
		// Handle image upload logic
		if (fileInputRef.current) {
			fileInputRef.current.setAttribute("data-upload-type", type);
			fileInputRef.current.click();
		}
	};

	return (
		<>
			{/* Basic Information Card */}
			<Card suppressHydrationWarning>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Building className="w-5 h-5" />
						<span>Basic Information</span>
					</CardTitle>
					<CardDescription>Update your business name, description, and basic details.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Logo and Cover Photo Section */}
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{/* Logo Upload */}
						<div className="space-y-2">
							<Label>Business Logo</Label>
							<div className="flex items-center space-x-4">
								<Avatar className="w-16 h-16">
									<AvatarImage src={profile.logo} alt={profile.name} />
									<AvatarFallback>
										{profile.name
											.split(" ")
											.map((word) => word[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<Button variant="outline" size="sm" onClick={() => handleImageUpload("logo")}>
									<Camera className="w-4 h-4 mr-2" />
									Update Logo
								</Button>
							</div>
						</div>

						{/* Cover Photo Upload */}
						<div className="space-y-2">
							<Label>Cover Photo</Label>
							<div className="relative h-16 rounded-lg overflow-hidden bg-muted">
								{profile.coverPhoto ? <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-muted-foreground">No cover photo</div>}
								<Button variant="outline" size="sm" className="absolute bottom-2 right-2" onClick={() => handleImageUpload("cover")}>
									<Upload className="w-4 h-4 mr-1" />
									Update
								</Button>
							</div>
						</div>
					</div>

					{/* Business Name and Tagline */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="businessName">Business Name</Label>
							<Input id="businessName" value={profile.name} onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} suppressHydrationWarning />
						</div>
						<div>
							<Label htmlFor="tagline">Tagline</Label>
							<Input id="tagline" value={profile.tagline} onChange={(e) => setProfile((prev) => ({ ...prev, tagline: e.target.value }))} placeholder="Brief tagline for your business" suppressHydrationWarning />
						</div>
					</div>

					{/* Business Description */}
					<div>
						<Label htmlFor="description">Business Description</Label>
						<Textarea id="description" value={profile.description} onChange={(e) => setProfile((prev) => ({ ...prev, description: e.target.value }))} rows={4} placeholder="Describe your business, services, and what makes you unique..." suppressHydrationWarning />
					</div>

					{/* Category Selection */}
					<div>
						<Label htmlFor="category">Business Category</Label>
						<Select value={profile.category} onValueChange={(value) => setProfile((prev) => ({ ...prev, category: value }))}>
							<SelectTrigger>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Plumbing">Plumbing</SelectItem>
								<SelectItem value="Electrical">Electrical</SelectItem>
								<SelectItem value="HVAC">HVAC</SelectItem>
								<SelectItem value="Construction">Construction</SelectItem>
								<SelectItem value="Landscaping">Landscaping</SelectItem>
								<SelectItem value="Automotive">Automotive</SelectItem>
								<SelectItem value="Restaurant">Restaurant</SelectItem>
								<SelectItem value="Retail">Retail</SelectItem>
								<SelectItem value="Healthcare">Healthcare</SelectItem>
								<SelectItem value="Professional Services">Professional Services</SelectItem>
								<SelectItem value="Other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
				<CardFooter className="px-6 py-4 border-t">
					<Button onClick={handleSaveProfile}>Save Changes</Button>
				</CardFooter>
			</Card>

			{/* Contact Information Card */}
			<Card suppressHydrationWarning>
				<CardHeader>
					<CardTitle>Contact Information</CardTitle>
					<CardDescription>Your business contact details and location.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="phone">Phone Number</Label>
						<Input id="phone" type="tel" value={profile.phone} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} suppressHydrationWarning />
					</div>
					<div>
						<Label htmlFor="email">Email Address</Label>
						<Input id="email" type="email" value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} suppressHydrationWarning />
					</div>
					<div>
						<Label htmlFor="website">Website</Label>
						<Input id="website" type="url" value={profile.website} onChange={(e) => setProfile((prev) => ({ ...prev, website: e.target.value }))} suppressHydrationWarning />
					</div>
					<div>
						<Label htmlFor="address">Business Address</Label>
						<Input id="address" value={profile.address} onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))} suppressHydrationWarning />
					</div>
				</CardContent>
				<CardFooter className="px-6 py-4 border-t">
					<Button onClick={handleSaveProfile}>Save Changes</Button>
				</CardFooter>
			</Card>

			{/* Business Statistics Card */}
			<Card suppressHydrationWarning>
				<CardHeader>
					<CardTitle>Business Statistics</CardTitle>
					<CardDescription>Key information about your business.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="yearEstablished">Year Established</Label>
							<Input id="yearEstablished" type="number" value={profile.yearEstablished} onChange={(e) => setProfile((prev) => ({ ...prev, yearEstablished: parseInt(e.target.value) }))} suppressHydrationWarning />
						</div>
						<div>
							<Label htmlFor="employees">Number of Employees</Label>
							<Input id="employees" type="number" value={profile.employees} onChange={(e) => setProfile((prev) => ({ ...prev, employees: parseInt(e.target.value) }))} suppressHydrationWarning />
						</div>
					</div>
					<div className="flex justify-between items-center p-4 rounded-lg border border-border">
						<div className="flex items-center space-x-2">
							<Star className="w-5 h-5 text-warning" />
							<span className="font-medium">{profile.rating} Star Rating</span>
						</div>
						<Badge variant="secondary">{profile.reviewCount} Reviews</Badge>
					</div>
				</CardContent>
				<CardFooter className="px-6 py-4 border-t">
					<Button onClick={handleSaveProfile}>Save Changes</Button>
				</CardFooter>
			</Card>
		</>
	);
};

export default OverviewSection;

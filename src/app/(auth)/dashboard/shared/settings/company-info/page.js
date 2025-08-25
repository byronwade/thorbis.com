"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  Camera,
  Save,
  AlertCircle
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Badge } from "@components/ui/badge";

export default function CompanyInfoSettings() {
	const [formData, setFormData] = useState({
		companyName: "Tech Retail Store",
		legalName: "Tech Retail Store LLC",
		industry: "retail",
		description: "Leading provider of technology solutions and retail services.",
		website: "https://techretailstore.com",
		email: "contact@techretailstore.com",
		phone: "+1 (555) 123-4567",
		address: "123 Main Street",
		city: "Austin",
		state: "TX",
		zipCode: "78701",
		country: "United States",
		taxId: "12-3456789",
		businessLicense: "BL-2024-001"
	});

	const [hasChanges, setHasChanges] = useState(false);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		setHasChanges(true);
	};

	const handleSave = () => {
		// Save logic here
		console.log("Saving company info:", formData);
		setHasChanges(false);
	};

	const industries = [
		{ value: "retail", label: "Retail" },
		{ value: "technology", label: "Technology" },
		{ value: "healthcare", label: "Healthcare" },
		{ value: "finance", label: "Finance" },
		{ value: "manufacturing", label: "Manufacturing" },
		{ value: "services", label: "Services" },
		{ value: "other", label: "Other" }
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Company Information</h1>
				<p className="text-muted-foreground">
					Update your business details, contact information, and branding.
				</p>
			</div>

			{/* Company Logo & Branding */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Camera className="h-5 w-5" />
						<span>Company Logo & Branding</span>
					</CardTitle>
					<CardDescription>
						Upload your company logo and customize your brand appearance.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center space-x-4">
						<div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
							<Building2 className="h-8 w-8 text-primary" />
						</div>
						<div className="space-y-2">
							<Button variant="outline" size="sm">
								<Upload className="h-4 w-4 mr-2" />
								Upload Logo
							</Button>
							<p className="text-xs text-muted-foreground">
								Recommended: 200x200px, PNG or JPG
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Basic Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Building2 className="h-5 w-5" />
						<span>Basic Information</span>
					</CardTitle>
					<CardDescription>
						Core business details and identification information.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="companyName">Company Name *</Label>
							<Input
								id="companyName"
								value={formData.companyName}
								onChange={(e) => handleInputChange("companyName", e.target.value)}
								placeholder="Enter company name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="legalName">Legal Business Name</Label>
							<Input
								id="legalName"
								value={formData.legalName}
								onChange={(e) => handleInputChange("legalName", e.target.value)}
								placeholder="Enter legal business name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="industry">Industry</Label>
							<Select
								value={formData.industry}
								onValueChange={(value) => handleInputChange("industry", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select industry" />
								</SelectTrigger>
								<SelectContent>
									{industries.map((industry) => (
										<SelectItem key={industry.value} value={industry.value}>
											{industry.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="website">Website</Label>
							<div className="relative">
								<Globe className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
								<Input
									id="website"
									value={formData.website}
									onChange={(e) => handleInputChange("website", e.target.value)}
									placeholder="https://yourwebsite.com"
									className="pl-10"
								/>
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Business Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							placeholder="Describe your business..."
							rows={3}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Contact Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Phone className="h-5 w-5" />
						<span>Contact Information</span>
					</CardTitle>
					<CardDescription>
						Primary contact details for your business.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="email">Business Email *</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange("email", e.target.value)}
									placeholder="contact@company.com"
									className="pl-10"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<div className="relative">
								<Phone className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) => handleInputChange("phone", e.target.value)}
									placeholder="+1 (555) 123-4567"
									className="pl-10"
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Address Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<MapPin className="h-5 w-5" />
						<span>Business Address</span>
					</CardTitle>
					<CardDescription>
						Primary business location and mailing address.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="address">Street Address</Label>
						<Input
							id="address"
							value={formData.address}
							onChange={(e) => handleInputChange("address", e.target.value)}
							placeholder="123 Main Street"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="city">City</Label>
							<Input
								id="city"
								value={formData.city}
								onChange={(e) => handleInputChange("city", e.target.value)}
								placeholder="Austin"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="state">State/Province</Label>
							<Input
								id="state"
								value={formData.state}
								onChange={(e) => handleInputChange("state", e.target.value)}
								placeholder="TX"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="zipCode">ZIP/Postal Code</Label>
							<Input
								id="zipCode"
								value={formData.zipCode}
								onChange={(e) => handleInputChange("zipCode", e.target.value)}
								placeholder="78701"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="country">Country</Label>
						<Input
							id="country"
							value={formData.country}
							onChange={(e) => handleInputChange("country", e.target.value)}
							placeholder="United States"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Legal & Tax Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<AlertCircle className="h-5 w-5" />
						<span>Legal & Tax Information</span>
					</CardTitle>
					<CardDescription>
						Business registration and tax identification details.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="taxId">Tax ID / EIN</Label>
							<Input
								id="taxId"
								value={formData.taxId}
								onChange={(e) => handleInputChange("taxId", e.target.value)}
								placeholder="12-3456789"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="businessLicense">Business License</Label>
							<Input
								id="businessLicense"
								value={formData.businessLicense}
								onChange={(e) => handleInputChange("businessLicense", e.target.value)}
								placeholder="BL-2024-001"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Save Changes */}
			<div className="flex items-center justify-between pt-4 border-t">
				<div className="flex items-center space-x-2">
					{hasChanges && (
						<Badge variant="secondary" className="text-xs">
							<AlertCircle className="h-3 w-3 mr-1" />
							Unsaved changes
						</Badge>
					)}
				</div>
				<div className="flex space-x-2">
					<Button variant="outline" disabled={!hasChanges}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!hasChanges}>
						<Save className="h-4 w-4 mr-2" />
						Save Changes
					</Button>
				</div>
			</div>
		</div>
	);
}

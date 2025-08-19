"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import { Alert, AlertDescription } from "@components/ui/alert";
import { MapPin, ArrowLeft, AlertTriangle, Trash2, Clock, CheckCircle, XCircle, FileText, Shield, Lock, Phone, Mail, Globe, Building2 } from "lucide-react";

// Mock data for directories
const mockDirectories = [
	{
		id: "1",
		name: "Raleigh LocalHub",
		location: "Raleigh, NC",
		status: "active",
		businessCount: 127,
		monthlyRevenue: 1872,
		totalRevenue: 2340,
		domain: "raleigh.localhub.com",
		subdomain: "raleigh",
		address: "123 Main Street, Raleigh, NC 27601",
		phone: "(555) 123-4567",
		email: "contact@raleighlocalhub.com",
		description: "The premier business directory for Raleigh, NC. Connecting local customers with trusted businesses.",
		serviceRadius: 25,
		categories: ["Restaurants & Food", "Healthcare & Medical", "Professional Services", "Automotive", "Home & Garden"],
		yearEstablished: 2024,
		averageRating: 4.8,
		totalReviews: 342,
		activeSubscriptions: 45,
		lastActivity: "2 hours ago",
		primaryColor: "hsl(var(--primary))",
		logo: "/placeholder.svg",
		deletionRequested: null,
		deletionDate: null,
	},
	{
		id: "2",
		name: "Durham LocalHub",
		location: "Durham, NC",
		status: "active",
		businessCount: 89,
		monthlyRevenue: 1245,
		totalRevenue: 1556,
		domain: "durham.localhub.com",
		subdomain: "durham",
		address: "456 Oak Avenue, Durham, NC 27701",
		phone: "(555) 987-6543",
		email: "hello@durhamlocalhub.com",
		description: "Durham's growing business directory connecting the community with local services.",
		serviceRadius: 20,
		categories: ["Technology", "Education & Training", "Healthcare & Medical", "Professional Services"],
		yearEstablished: 2024,
		averageRating: 4.6,
		totalReviews: 187,
		activeSubscriptions: 32,
		lastActivity: "1 day ago",
		primaryColor: "hsl(var(--primary))",
		logo: "/placeholder.svg",
		deletionRequested: null,
		deletionDate: null,
	},
	{
		id: "3",
		name: "Charlotte LocalHub",
		location: "Charlotte, NC",
		status: "active",
		businessCount: 203,
		monthlyRevenue: 2890,
		totalRevenue: 3612,
		domain: "charlotte.localhub.com",
		subdomain: "charlotte",
		address: "789 Pine Street, Charlotte, NC 28202",
		phone: "(555) 456-7890",
		email: "info@charlottelocalhub.com",
		description: "Charlotte's comprehensive business directory serving the Queen City and surrounding areas.",
		serviceRadius: 35,
		categories: ["Financial Services", "Real Estate", "Professional Services", "Restaurants & Food", "Retail & Shopping", "Healthcare & Medical"],
		yearEstablished: 2024,
		averageRating: 4.9,
		totalReviews: 456,
		activeSubscriptions: 67,
		lastActivity: "30 minutes ago",
		primaryColor: "hsl(var(--muted-foreground))",
		logo: "/placeholder.svg",
		deletionRequested: null,
		deletionDate: null,
	},
];

const deletionSteps = [
	{
		id: 1,
		title: "Review Directory Information",
		description: "Confirm the directory details before deletion",
		status: "pending",
	},
	{
		id: 2,
		title: "Understand Data Deletion",
		description: "Review what will be permanently deleted",
		status: "pending",
	},
	{
		id: 3,
		title: "Confirm Deletion Request",
		description: "Submit your deletion request",
		status: "pending",
	},
	{
		id: 4,
		title: "30-Day Waiting Period",
		description: "Directory will be deleted after 30 days",
		status: "pending",
	},
];

const dataToBeDeleted = [
	{
		category: "Directory Profile",
		items: ["Directory name, description, and branding", "Logo, colors, and customization settings", "Domain and subdomain configuration", "Contact information and settings", "Service area and location data"],
	},
	{
		category: "Business Data",
		items: ["All business listings and profiles", "Business reviews and ratings", "Business contact information", "Business photos and media", "Business subscription records"],
	},
	{
		category: "User & Customer Data",
		items: ["Customer accounts and profiles", "User reviews and ratings", "Search history and preferences", "Subscription and billing records", "Communication history and messages"],
	},
	{
		category: "Analytics & Performance",
		items: ["Website traffic and analytics data", "Revenue and financial records", "Performance metrics and reports", "Search rankings and SEO data", "Advertisement performance data"],
	},
];

export default function DeleteDirectory({ params }) {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [showConfirmText, setShowConfirmText] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const [deletionRequested, setDeletionRequested] = useState(false);
	const [deletionDate, setDeletionDate] = useState(null);
	const [timeRemaining, setTimeRemaining] = useState(null);

	// Additional safety checks
	const [understandDataLoss, setUnderstandDataLoss] = useState(false);
	const [understandBusinessImpact, setUnderstandBusinessImpact] = useState(false);
	const [understandLegalImplications, setUnderstandLegalImplications] = useState(false);
	const [hasBackedUpData, setHasBackedUpData] = useState(false);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [adminPassword, setAdminPassword] = useState("");
	const [showPasswordField, setShowPasswordField] = useState(false);

	const directory = mockDirectories.find((d) => d.id === params.id);

	useEffect(() => {
		if (deletionDate) {
			const timer = setInterval(() => {
				const now = new Date().getTime();
				const deletionTime = new Date(deletionDate).getTime();
				const remaining = deletionTime - now;

				if (remaining <= 0) {
					setTimeRemaining(null);
					clearInterval(timer);
				} else {
					const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
					const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
					const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
					setTimeRemaining({ days, hours, minutes });
				}
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [deletionDate]);

	if (!directory) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-4xl mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-destructive">Directory Not Found</h1>
						<p className="text-muted-foreground mt-2">The directory you&apos;re looking for doesn&apos;t exist.</p>
						<Link href="/dashboard/localhub/directories" className="inline-flex items-center mt-4 text-primary hover:underline">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Directories
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const handleRequestDeletion = () => {
		// Final validation
		if (!understandDataLoss || !understandBusinessImpact || !understandLegalImplications || !hasBackedUpData || !isAuthorized) {
			alert("Please complete all required confirmations before proceeding.");
			return;
		}

		if (confirmText !== directory.name) {
			alert("Please type the exact directory name to confirm deletion.");
			return;
		}

		if (adminPassword !== "DELETE2024") {
			// In real app, this would be actual admin verification
			alert("Administrator password is required to proceed with deletion.");
			return;
		}

		const deletionDate = new Date();
		deletionDate.setDate(deletionDate.getDate() + 30);
		setDeletionDate(deletionDate.toISOString());
		setDeletionRequested(true);
		setCurrentStep(4);
	};

	const handleCancelDeletion = () => {
		setDeletionDate(null);
		setDeletionRequested(false);
		setCurrentStep(1);
	};

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<MapPin className="w-5 h-5" />
								<span>Review Directory Information</span>
							</CardTitle>
							<CardDescription>Please review the directory details below. This is the directory that will be permanently deleted.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center space-x-4 p-4 border rounded-lg">
								<div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
									<MapPin className="w-8 h-8 text-white" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold">{directory.name}</h3>
									<p className="text-muted-foreground">{directory.location}</p>
									<p className="text-sm text-muted-foreground">{directory.subdomain}.localhub.com</p>
								</div>
								<Badge variant="secondary">{directory.status}</Badge>
							</div>

							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<strong>Established:</strong> {directory.yearEstablished}
								</div>
								<div>
									<strong>Businesses:</strong> {directory.businessCount}
								</div>
								<div>
									<strong>Rating:</strong> {directory.averageRating} ⭐ ({directory.totalReviews} reviews)
								</div>
								<div>
									<strong>Monthly Revenue:</strong> ${directory.monthlyRevenue.toLocaleString()}
								</div>
								<div>
									<strong>Service Radius:</strong> {directory.serviceRadius} miles
								</div>
								<div>
									<strong>Active Subscriptions:</strong> {directory.activeSubscriptions}
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<Phone className="w-4 h-4 text-muted-foreground" />
									<span>{directory.phone}</span>
								</div>
								<div className="flex items-center space-x-2">
									<Mail className="w-4 h-4 text-muted-foreground" />
									<span>{directory.email}</span>
								</div>
								<div className="flex items-center space-x-2">
									<MapPin className="w-4 h-4 text-muted-foreground" />
									<span>{directory.address}</span>
								</div>
								<div className="flex items-center space-x-2">
									<Globe className="w-4 h-4 text-muted-foreground" />
									<span>{directory.domain}</span>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium">Categories ({directory.categories.length})</h4>
								<div className="flex flex-wrap gap-2">
									{directory.categories.map((category) => (
										<Badge key={category} variant="outline" className="text-xs">
											{category}
										</Badge>
									))}
								</div>
							</div>

							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<strong>Warning:</strong> This action will permanently delete this directory and all associated data, including {directory.businessCount} business listings. This process cannot be undone once the 30-day waiting period expires.
								</AlertDescription>
							</Alert>

							<div className="flex justify-end space-x-2">
								<Button variant="outline" asChild>
									<Link href="/dashboard/localhub/directories">Cancel</Link>
								</Button>
								<Button onClick={() => setCurrentStep(2)}>Continue to Next Step</Button>
							</div>
						</CardContent>
					</Card>
				);

			case 2:
				return (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Trash2 className="w-5 h-5" />
								<span>Data That Will Be Deleted</span>
							</CardTitle>
							<CardDescription>The following data will be permanently deleted and cannot be recovered.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{dataToBeDeleted.map((category, index) => (
								<div key={index} className="space-y-3">
									<h4 className="font-semibold text-foreground">{category.category}</h4>
									<ul className="space-y-2 ml-4">
										{category.items.map((item, itemIndex) => (
											<li key={itemIndex} className="flex items-start space-x-2">
												<XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
												<span className="text-sm text-muted-foreground">{item}</span>
											</li>
										))}
									</ul>
									{index < dataToBeDeleted.length - 1 && <Separator />}
								</div>
							))}

							<Alert className="border-red-200 bg-red-50 dark:bg-destructive dark:border-red-800">
								<AlertTriangle className="h-4 w-4 text-destructive" />
								<AlertDescription className="text-destructive dark:text-destructive/80">
									<strong>Important:</strong> Once deleted, this directory will no longer be accessible, all {directory.businessCount} business listings will be removed, and the domain {directory.domain} will become unavailable.
								</AlertDescription>
							</Alert>

							<div className="flex justify-end space-x-2">
								<Button variant="outline" onClick={() => setCurrentStep(1)}>
									Back
								</Button>
								<Button onClick={() => setCurrentStep(3)}>Continue to Confirmation</Button>
							</div>
						</CardContent>
					</Card>
				);

			case 3:
				return (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Shield className="w-5 h-5" />
								<span>Safety Confirmations</span>
							</CardTitle>
							<CardDescription>This is your final chance to cancel the deletion request.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<Alert className="border-red-200 bg-red-50 dark:bg-destructive dark:border-red-800">
								<AlertTriangle className="h-4 w-4 text-destructive" />
								<AlertDescription className="text-destructive dark:text-destructive/80">
									<strong>Final Warning:</strong> You are about to request the permanent deletion of &quot;{directory.name}&quot;. This action will initiate a 30-day waiting period, after which the directory and all its data will be permanently deleted.
								</AlertDescription>
							</Alert>

							<div className="space-y-4">
								<div className="bg-red-50 dark:bg-destructive/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
									<div className="flex items-start space-x-3">
										<AlertTriangle className="w-5 h-5 text-destructive dark:text-destructive mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<input type="checkbox" id="dataLoss" checked={understandDataLoss} onChange={(e) => setUnderstandDataLoss(e.target.checked)} className="rounded border-neutral-700" />
												<label htmlFor="dataLoss" className="font-medium text-destructive dark:text-destructive/70">
													I understand that ALL data will be permanently lost
												</label>
											</div>
											<p className="text-sm text-destructive dark:text-destructive/90">
												This includes {directory.businessCount} business listings, {directory.totalReviews} reviews, {directory.activeSubscriptions} subscriptions, and all directory data.
											</p>
										</div>
									</div>
								</div>

								<div className="bg-orange-50 dark:bg-warning/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
									<div className="flex items-start space-x-3">
										<Building2 className="w-5 h-5 text-warning dark:text-warning mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<input type="checkbox" id="businessImpact" checked={understandBusinessImpact} onChange={(e) => setUnderstandBusinessImpact(e.target.checked)} className="rounded border-neutral-700" />
												<label htmlFor="businessImpact" className="font-medium text-warning dark:text-warning/70">
													I understand the impact on businesses
												</label>
											</div>
											<p className="text-sm text-warning dark:text-warning/90">All {directory.businessCount} businesses listed in this directory will lose their online presence and customer reviews. This may significantly impact their business operations.</p>
										</div>
									</div>
								</div>

								<div className="bg-yellow-50 dark:bg-warning/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
									<div className="flex items-start space-x-3">
										<Shield className="w-5 h-5 text-warning dark:text-warning mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<input type="checkbox" id="legalImplications" checked={understandLegalImplications} onChange={(e) => setUnderstandLegalImplications(e.target.checked)} className="rounded border-neutral-700" />
												<label htmlFor="legalImplications" className="font-medium text-warning dark:text-warning/70">
													I understand legal and compliance implications
												</label>
											</div>
											<p className="text-sm text-warning dark:text-warning/90">Deleting directory data may have legal implications. Ensure you have proper authorization and have consulted with legal counsel if necessary.</p>
										</div>
									</div>
								</div>

								<div className="bg-blue-50 dark:bg-primary/20 border border-primary/30 dark:border-primary rounded-lg p-4">
									<div className="flex items-start space-x-3">
										<FileText className="w-5 h-5 text-primary dark:text-primary mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<input type="checkbox" id="backupData" checked={hasBackedUpData} onChange={(e) => setHasBackedUpData(e.target.checked)} className="rounded border-neutral-700" />
												<label htmlFor="backupData" className="font-medium text-primary dark:text-primary/70">
													I have backed up all important data
												</label>
											</div>
											<p className="text-sm text-primary dark:text-primary/90">I have exported and saved all business listings, customer data, reviews, analytics, and any other data I may need in the future.</p>
										</div>
									</div>
								</div>

								<div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
									<div className="flex items-start space-x-3">
										<Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<input type="checkbox" id="authorized" checked={isAuthorized} onChange={(e) => setIsAuthorized(e.target.checked)} className="rounded border-neutral-700" />
												<label htmlFor="authorized" className="font-medium text-purple-900 dark:text-purple-100">
													I have proper authorization to delete this directory
												</label>
											</div>
											<p className="text-sm text-purple-700 dark:text-purple-300">I am the directory owner or have explicit permission from the directory owner to perform this action.</p>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label htmlFor="confirmText" className="block text-sm font-medium mb-2">
										Type the directory name to confirm: <span className="font-bold">{directory.name}</span>
									</label>
									<input type="text" id="confirmText" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background" placeholder={`Type "${directory.name}" to confirm`} />
								</div>

								<div>
									<label htmlFor="adminPassword" className="block text-sm font-medium mb-2">
										Administrator Password
									</label>
									<input type="password" id="adminPassword" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background" placeholder="Enter admin password" />
									<p className="text-xs text-muted-foreground mt-1">Required for security verification</p>
								</div>
							</div>

							<div className="flex justify-end space-x-2">
								<Button variant="outline" onClick={() => setCurrentStep(2)}>
									Back
								</Button>
								<Button variant="destructive" disabled={!understandDataLoss || !understandBusinessImpact || !understandLegalImplications || !hasBackedUpData || !isAuthorized || confirmText !== directory.name || adminPassword !== "DELETE2024"} onClick={handleRequestDeletion}>
									<Trash2 className="w-4 h-4 mr-2" />
									Request Directory Deletion
								</Button>
							</div>
						</CardContent>
					</Card>
				);

			case 4:
				return (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Clock className="w-5 h-5" />
								<span>Deletion Request Submitted</span>
							</CardTitle>
							<CardDescription>Your deletion request has been submitted. The directory will be permanently deleted after 30 days.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="text-center py-8">
								<CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2">Deletion Request Confirmed</h3>
								<p className="text-muted-foreground mb-4">Your request to delete &quot;{directory.name}&quot; has been submitted successfully.</p>
							</div>

							{timeRemaining && (
								<div className="text-center p-6 border rounded-lg bg-muted/50">
									<h4 className="font-semibold mb-2">Time Remaining Until Deletion</h4>
									<div className="text-2xl font-bold text-destructive">
										{timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
									</div>
									<p className="text-sm text-muted-foreground mt-2">Directory will be deleted on {new Date(deletionDate).toLocaleDateString()}</p>
								</div>
							)}

							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<strong>What happens next:</strong>
									<ul className="mt-2 space-y-1">
										<li>• The directory will remain active for 30 days</li>
										<li>• You can cancel the deletion request at any time during this period</li>
										<li>• After 30 days, the directory and all data will be permanently deleted</li>
										<li>• You will receive email notifications at 7 days, 3 days, and 1 day before deletion</li>
										<li>• All {directory.businessCount} business listings will be notified of the upcoming deletion</li>
									</ul>
								</AlertDescription>
							</Alert>

							<div className="flex justify-center space-x-2">
								<Button variant="outline" onClick={handleCancelDeletion}>
									Cancel Deletion Request
								</Button>
								<Button asChild>
									<Link href="/dashboard/localhub/directories">Back to Directories</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link href="/dashboard/localhub/directories" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Directories
					</Link>
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-destructive/10 rounded-lg">
							<Trash2 className="w-6 h-6 text-destructive" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">Delete Directory</h1>
							<p className="text-muted-foreground">Permanently remove this directory from your account</p>
						</div>
					</div>
				</div>

				{/* Progress Steps */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						{deletionSteps.map((step, index) => (
							<div key={step.id} className="flex items-center">
								<div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{step.id}</div>
								<div className="ml-2 hidden sm:block">
									<p className={`text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
								</div>
								{index < deletionSteps.length - 1 && <div className={`w-12 h-0.5 mx-4 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />}
							</div>
						))}
					</div>
				</div>

				{/* Main Content */}
				{renderStep()}
			</div>
		</div>
	);
}

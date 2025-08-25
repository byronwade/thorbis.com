/**
 * BusinessProfile Component (Refactored)
 * Clean, modular implementation using extracted sections and hooks
 * Reduced from 2,221 lines to focused, maintainable architecture
 * Following enterprise-grade patterns for large-scale applications
 * Updated to match settings page design pattern
 */

"use client";

import React, { useEffect } from "react";
import { Building, DollarSign, Shield, Award, Clock, Image, Users, Handshake, Briefcase, FileText, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";

// Import modular sections
import { OverviewSection, ServicesSection, TeamSection, BusinessHoursSection, MediaSection, SettingsSection } from "@components/dashboard/business/profile/sections";

// Import existing sections that are already modular
import PartnershipsSection from "@components/dashboard/business/profile/sections/partnerships-section";
import CareersSection from "@components/dashboard/business/profile/sections/careers-section";
import FAQSection from "@components/dashboard/business/profile/sections/faq-section";

// Import custom hook
import { useBusinessProfile } from "@lib/hooks/business/profile/use-business-profile";

const BusinessProfile = () => {
	const {
		// State
		profile,
		setProfile,
		activeSection,
		setActiveSection,
		isEditing,
		setIsEditing,
		isClient,
		setIsClient,

		// Refs
		fileInputRef,

		// Functions
		handleSaveProfile,
		navigateToSection,
		handleFileUpload,
	} = useBusinessProfile();

	// Navigation items configuration
	const navigationItems = [
		{ id: "overview", label: "Overview", icon: Building },
		{ id: "services", label: "Services", icon: DollarSign },
		{ id: "verifications", label: "Verifications", icon: Shield },
		{ id: "elite", label: "Thorbis Elite", icon: Award },
		{ id: "hours", label: "Business Hours", icon: Clock },
		{ id: "media", label: "Media Gallery", icon: Image },
		{ id: "team", label: "Team", icon: Users },
		{ id: "partnerships", label: "Partnerships", icon: Handshake },
		{ id: "careers", label: "Careers", icon: Briefcase },
		{ id: "faq", label: "FAQ", icon: FileText },
		{ id: "settings", label: "Settings", icon: Settings },
	];

	// Set client-side flag and document title
	useEffect(() => {
		setIsClient(true);
		document.title = "Business Profile - Dashboard - Thorbis";
	}, [setIsClient]);

	// Handle file uploads
	useEffect(() => {
		const handleFileInputChange = (e) => {
			const files = e.target.files;
			const uploadType = e.target.getAttribute("data-upload-type");
			if (files && files.length > 0) {
				handleFileUpload(files, uploadType);
			}
		};

		const fileInput = fileInputRef.current;
		if (fileInput) {
			fileInput.addEventListener("change", handleFileInputChange);
			return () => fileInput.removeEventListener("change", handleFileInputChange);
		}
	}, [fileInputRef, handleFileUpload]);

	// Section rendering function
	const renderSection = () => {
		switch (activeSection) {
			case "overview":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Business Overview</CardTitle>
								<CardDescription>Manage your business profile and showcase your services.</CardDescription>
							</CardHeader>
							<CardContent>
								<OverviewSection profile={profile} setProfile={setProfile} isEditing={isEditing} handleSaveProfile={handleSaveProfile} fileInputRef={fileInputRef} />
							</CardContent>
						</Card>
					</div>
				);

			case "services":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Services</CardTitle>
								<CardDescription>Manage your business services and offerings.</CardDescription>
							</CardHeader>
							<CardContent>
								<ServicesSection profile={profile} setProfile={setProfile} isEditing={isEditing} />
							</CardContent>
						</Card>
					</div>
				);

			case "verifications":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Verifications</CardTitle>
								<CardDescription>Manage your business verifications and certifications.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<p className="text-muted-foreground">Verifications section coming soon...</p>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "elite":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Thorbis Elite</CardTitle>
								<CardDescription>Access exclusive features and premium benefits.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<p className="text-muted-foreground">Thorbis Elite section coming soon...</p>
								</div>
							</CardContent>
						</Card>
					</div>
				);

			case "hours":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Business Hours</CardTitle>
								<CardDescription>Set your business operating hours and availability.</CardDescription>
							</CardHeader>
							<CardContent>
								<BusinessHoursSection profile={profile} setProfile={setProfile} isEditing={isEditing} />
							</CardContent>
						</Card>
					</div>
				);

			case "media":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Media Gallery</CardTitle>
								<CardDescription>Manage your business photos and media content.</CardDescription>
							</CardHeader>
							<CardContent>
								<MediaSection profile={profile} setProfile={setProfile} handleSaveProfile={handleSaveProfile} fileInputRef={fileInputRef} />
							</CardContent>
						</Card>
					</div>
				);

			case "team":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Team</CardTitle>
								<CardDescription>Manage your team members and staff information.</CardDescription>
							</CardHeader>
							<CardContent>
								<TeamSection profile={profile} setProfile={setProfile} isEditing={isEditing} />
							</CardContent>
						</Card>
					</div>
				);

			case "partnerships":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Partnerships</CardTitle>
								<CardDescription>Manage your business partnerships and collaborations.</CardDescription>
							</CardHeader>
							<CardContent>
								<PartnershipsSection profile={profile} setProfile={setProfile} />
							</CardContent>
						</Card>
					</div>
				);

			case "careers":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Careers</CardTitle>
								<CardDescription>Manage job postings and career opportunities.</CardDescription>
							</CardHeader>
							<CardContent>
								<CareersSection profile={profile} setProfile={setProfile} isEditing={isEditing} />
							</CardContent>
						</Card>
					</div>
				);

			case "faq":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>FAQ</CardTitle>
								<CardDescription>Manage frequently asked questions and answers.</CardDescription>
							</CardHeader>
							<CardContent>
								<FAQSection profile={profile} setProfile={setProfile} isEditing={isEditing} />
							</CardContent>
						</Card>
					</div>
				);

			case "settings":
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Settings</CardTitle>
								<CardDescription>Configure your business profile settings and preferences.</CardDescription>
							</CardHeader>
							<CardContent>
								<SettingsSection profile={profile} setProfile={setProfile} handleSaveProfile={handleSaveProfile} />
							</CardContent>
						</Card>
					</div>
				);

			default:
				return (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Business Overview</CardTitle>
								<CardDescription>Manage your business profile and showcase your services.</CardDescription>
							</CardHeader>
							<CardContent>
								<OverviewSection profile={profile} setProfile={setProfile} isEditing={isEditing} handleSaveProfile={handleSaveProfile} fileInputRef={fileInputRef} />
							</CardContent>
						</Card>
					</div>
				);
		}
	};

	return (
		<div className="w-full px-4 lg:px-24 py-16 space-y-8 bg-white dark:bg-neutral-900">
			{/* Page Header */}
			<div className="grid w-full gap-2">
				<h1 className="text-4xl">Business Profile</h1>
				<p className="text-muted-foreground">Manage your business profile and showcase your services.</p>
			</div>

			{/* Main Content Grid */}
			<div className="grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
				{/* Sidebar Navigation */}
				<nav className="grid gap-4 text-sm text-muted-foreground">
					{navigationItems.map((item) => {
						const IconComponent = item.icon;
						return (
							<button 
								key={item.id} 
								onClick={() => navigateToSection(item.id)} 
								className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
									activeSection === item.id 
										? "font-semibold text-primary bg-primary/5 border border-primary/20" 
										: "hover:text-foreground hover:bg-muted"
								}`}
							>
								<IconComponent className="w-4 h-4" />
								<span>{item.label}</span>
							</button>
						);
					})}
				</nav>

				{/* Content Area */}
				<div className="grid gap-6">
					{isClient && renderSection()}
				</div>
			</div>

			{/* Hidden file input for uploads */}
			<input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" aria-hidden="true" />
		</div>
	);
};

export default BusinessProfile;

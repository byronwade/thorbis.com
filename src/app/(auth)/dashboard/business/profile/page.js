/**
 * BusinessProfile Component (Refactored)
 * Clean, modular implementation using extracted sections and hooks
 * Reduced from 2,221 lines to focused, maintainable architecture
 * Following enterprise-grade patterns for large-scale applications
 */

"use client";

import React, { useEffect } from "react";
import { Building, DollarSign, Shield, Award, Clock, Image, Users, Handshake, Briefcase, FileText, Settings } from "lucide-react";

// Import modular sections
import { OverviewSection, ServicesSection, TeamSection, BusinessHoursSection, MediaSection, SettingsSection } from "@components/dashboard/business/profile/sections";

// Import existing sections that are already modular
import PartnershipsSection from "./sections/partnerships-section";
import CareersSection from "./sections/careers-section";
import FAQSection from "./sections/faq-section";

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
				return <OverviewSection profile={profile} setProfile={setProfile} isEditing={isEditing} handleSaveProfile={handleSaveProfile} fileInputRef={fileInputRef} />;

			case "services":
				return <ServicesSection profile={profile} setProfile={setProfile} isEditing={isEditing} />;

			case "verifications":
				// TODO: Create VerificationsSection component
				return (
					<div className="text-center py-8">
						<p className="text-muted-foreground">Verifications section coming soon...</p>
					</div>
				);

			case "elite":
				// TODO: Create EliteSection component
				return (
					<div className="text-center py-8">
						<p className="text-muted-foreground">Thorbis Elite section coming soon...</p>
					</div>
				);

			case "hours":
				return <BusinessHoursSection profile={profile} setProfile={setProfile} isEditing={isEditing} />;

			case "media":
				return <MediaSection profile={profile} setProfile={setProfile} handleSaveProfile={handleSaveProfile} fileInputRef={fileInputRef} />;

			case "team":
				return <TeamSection profile={profile} setProfile={setProfile} isEditing={isEditing} />;

			case "partnerships":
				return <PartnershipsSection profile={profile} setProfile={setProfile} />;

			case "careers":
				return <CareersSection profile={profile} setProfile={setProfile} isEditing={isEditing} />;

			case "faq":
				return <FAQSection profile={profile} setProfile={setProfile} isEditing={isEditing} />;

			case "settings":
				return <SettingsSection profile={profile} setProfile={setProfile} handleSaveProfile={handleSaveProfile} />;

			default:
				return <OverviewSection profile={profile} setProfile={setProfile} isEditing={isEditing} handleSaveProfile={handleSaveProfile} fileInputRef={fileInputRef} />;
		}
	};

	return (
		<div className="px-4 py-16 space-y-8 w-full lg:px-24">
			{/* Page Header */}
			<div className="grid gap-2 w-full">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl">Business Profile</h1>
						<p className="text-muted-foreground">Manage your business profile and showcase your services.</p>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="mx-auto grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
				{/* Sidebar Navigation */}
				<nav className="grid gap-4 text-sm text-muted-foreground">
					{navigationItems.map((item) => {
						const IconComponent = item.icon;
						return (
							<button key={item.id} onClick={() => navigateToSection(item.id)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activeSection === item.id ? "font-semibold text-primary bg-primary/5 border border-primary/20" : "hover:text-foreground hover:bg-muted"}`}>
								<IconComponent className="w-4 h-4" />
								<span>{item.label}</span>
							</button>
						);
					})}
				</nav>

				{/* Content Area */}
				<div className="grid gap-6">{isClient && renderSection()}</div>
			</div>

			{/* Hidden file input for uploads */}
			<input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" aria-hidden="true" />
		</div>
	);
};

export default BusinessProfile;

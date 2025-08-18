"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BusinessForm } from "@features/auth";

const subscriptionTiers = [
	{
		value: "basic",
		name: "Basic",
		price: 49,
		features: ["Business listing with contact info", "Photo gallery (up to 10 photos)", "Basic business description", "Customer reviews", "Map integration"],
	},
	{
		value: "pro",
		name: "Pro",
		price: 79,
		features: ["Everything in Basic", "Unlimited photos", "Extended business description", "Business hours & services", "Special offers & promotions", "Priority listing placement"],
		popular: true,
	},
	{
		value: "premium",
		name: "Premium",
		price: 129,
		features: ["Everything in Pro", "Online booking integration", "Analytics dashboard", "Social media integration", "Custom branding options", "Featured directory placement"],
	},
];

const businessCategories = ["Restaurants & Food", "Health & Medical", "Home Services", "Retail & Shopping", "Professional Services", "Automotive", "Beauty & Wellness", "Education", "Entertainment", "Technology", "Real Estate", "Finance", "Legal"];

const businessHours = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function FormPage() {
	const params = useParams();
	const [formType, setFormType] = useState(null);

	// Handle Next.js 15 params as promises
	useEffect(() => {
		const loadParams = async () => {
			try {
				// In Next.js 15, params may be a promise
				const resolvedParams = await Promise.resolve(params);
				setFormType(resolvedParams.formId);
			} catch (error) {
				console.error("Error loading params:", error);
				// Fallback to direct access for backward compatibility
				setFormType(params?.formId || "add-a-business");
			}
		};

		loadParams();
	}, [params]);

	// Show loading state while params are being resolved
	if (!formType) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading form...</p>
				</div>
			</div>
		);
	}

		return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
		<BusinessForm formType={formType} />
	</div>
	);
}

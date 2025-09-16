"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// Simple BusinessForm component
const BusinessForm = ({ formType }) => (
	<div className="w-full max-w-2xl mx-auto p-6 bg-neutral-900 rounded-lg">
		<h1 className="text-2xl font-bold text-white mb-6">Business Form - {formType}</h1>
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-medium text-neutral-300 mb-2">Business Name</label>
				<input className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white" 
					   placeholder="Enter your business name" />
			</div>
			<div>
				<label className="block text-sm font-medium text-neutral-300 mb-2">Category</label>
				<select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white">
					<option value="">Select a category</option>
					{businessCategories.map(category => (
						<option key={category} value={category}>{category}</option>
					))}
				</select>
			</div>
			<div>
				<label className="block text-sm font-medium text-neutral-300 mb-2">Subscription Plan</label>
				<div className="grid gap-4 md:grid-cols-3">
					{subscriptionTiers.map(tier => (
						<div key={tier.value} className={`p-4 border rounded-lg ${tier.popular ? 'border-blue-500' : 'border-neutral-600'}'}>
							<h3 className="text-lg font-semibold text-white">{tier.name}</h3>
							<p className="text-2xl font-bold text-blue-400">${tier.price}/mo</p>
							<ul className="mt-4 space-y-2 text-sm text-neutral-400">
								{tier.features.map((feature, index) => (
									<li key={index}>• {feature}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</div>
	</div>
);

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

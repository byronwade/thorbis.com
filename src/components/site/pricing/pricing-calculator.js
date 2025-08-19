"use client";

import { useState, useMemo } from "react";
import { Calculator, Zap, DollarSign, TrendingUp } from "lucide-react";

export default function PricingCalculator() {
	const [usage, setUsage] = useState({
		invoices: 120,
		estimates: 60,
		aiTalkMinutes: 200,
		aiChatMessages: 500,
		addressLookups: 300,
		mapSearches: 200,
		fileUploads: 120,
		emailsSent: 800,
		textMessages: 600,
		webhooks: 1000,
		externalFetches: 400,
		aiInputTokens: 50000,
		aiOutputTokens: 50000
	});

	// API request multipliers (how many requests each activity uses)
	const multipliers = {
		invoices: 200,
		estimates: 150,
		aiTalkMinutes: 30,
		aiChatMessages: 5,
		addressLookups: 1,
		mapSearches: 10,
		fileUploads: 25,
		emailsSent: 5,
		textMessages: 2,
		webhooks: 1,
		externalFetches: 3
	};

	// Pricing rates
	const rates = {
		nonAiPerThousand: 15.00, // $15 per 1,000 non-AI requests
		aiInputPerThousand: 1.25, // $1.25 per 1,000 input tokens
		aiOutputPerThousand: 2.50, // $2.50 per 1,000 output tokens
		baseFee: 0 // No base fee in our model
	};

	const freeAllocation = 25000; // 25,000 free API requests per month

	const calculations = useMemo(() => {
		const breakdown = {};
		let totalRequests = 0;

		// Calculate non-AI API requests
		Object.keys(multipliers).forEach(key => {
			const requests = usage[key] * multipliers[key];
			breakdown[key] = requests;
			totalRequests += requests;
		});

		// Calculate costs
		const freeRequests = Math.min(totalRequests, freeAllocation);
		const billableRequests = Math.max(0, totalRequests - freeAllocation);
		const nonAiCost = (billableRequests / 1000) * rates.nonAiPerThousand;

		// AI token costs
		const aiInputCost = (usage.aiInputTokens / 1000) * rates.aiInputPerThousand;
		const aiOutputCost = (usage.aiOutputTokens / 1000) * rates.aiOutputPerThousand;
		const totalAiCost = aiInputCost + aiOutputCost;

		const totalCost = rates.baseFee + nonAiCost + totalAiCost;

		return {
			breakdown,
			totalRequests,
			freeRequests,
			billableRequests,
			nonAiCost,
			aiInputCost,
			aiOutputCost,
			totalAiCost,
			totalCost
		};
	}, [usage]);

	const handleInputChange = (field, value) => {
		setUsage(prev => ({
			...prev,
			[field]: parseInt(value) || 0
		}));
	};

	const usageFields = [
		{
			key: 'invoices',
			label: 'Invoices per month',
			description: 'Each invoice uses about 200 API requests',
			icon: '📄'
		},
		{
			key: 'estimates',
			label: 'Estimates per month',
			description: 'Each estimate uses about 150 API requests',
			icon: '📝'
		},
		{
			key: 'aiTalkMinutes',
			label: 'AI talk minutes per month',
			description: 'Each minute uses about 30 API requests',
			icon: '🎤'
		},
		{
			key: 'aiChatMessages',
			label: 'AI chat messages per month',
			description: 'Each message uses about 5 API requests',
			icon: '💬'
		},
		{
			key: 'addressLookups',
			label: 'Address lookups (geocodes)',
			description: 'About 1 request each',
			icon: '📍'
		},
		{
			key: 'mapSearches',
			label: 'Map searches',
			description: 'About 10 requests each',
			icon: '🗺️'
		},
		{
			key: 'fileUploads',
			label: 'File uploads',
			description: 'About 25 requests each',
			icon: '📎'
		},
		{
			key: 'emailsSent',
			label: 'Emails sent',
			description: 'About 5 requests each',
			icon: '✉️'
		},
		{
			key: 'textMessages',
			label: 'Text messages sent (SMS)',
			description: 'About 2 requests each',
			icon: '📱'
		},
		{
			key: 'webhooks',
			label: 'Webhooks (sent/received)',
			description: 'About 1 request each',
			icon: '🔗'
		},
		{
			key: 'externalFetches',
			label: 'External data fetches',
			description: 'About 3 requests each',
			icon: '🌐'
		}
	];

	const aiFields = [
		{
			key: 'aiInputTokens',
			label: 'AI input tokens (per month)',
			description: 'Your text sent to the AI. ($1.25 per 1,000 tokens)',
			icon: '🤖'
		},
		{
			key: 'aiOutputTokens',
			label: 'AI output tokens (per month)',
			description: "AI's words back to you. ($2.50 per 1,000 tokens)",
			icon: '💭'
		}
	];

	return (
		<div className="max-w-6xl mx-auto">
			<div className="bg-white dark:bg-neutral-800 rounded-2xl border p-8 shadow-sm">
				<div className="flex items-center gap-3 mb-8">
					<Calculator className="w-8 h-8 text-primary" />
					<div>
						<h3 className="text-2xl font-bold">Usage Cost Calculator</h3>
						<p className="text-muted-foreground">
							Adjust the values below to estimate your monthly costs based on expected usage.
						</p>
					</div>
				</div>

				<div className="grid lg:grid-cols-2 gap-8">
					{/* Input Fields */}
					<div className="space-y-6">
						<div>
							<h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
								<Zap className="w-5 h-5 text-primary" />
								Enter Your Monthly Activity
							</h4>
							<div className="space-y-4">
								{usageFields.map((field) => (
									<div key={field.key} className="space-y-2">
										<label className="flex items-center gap-2 text-sm font-medium">
											<span className="text-lg">{field.icon}</span>
											{field.label}
										</label>
										<input
											type="number"
											min="0"
											value={usage[field.key]}
											onChange={(e) => handleInputChange(field.key, e.target.value)}
											className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:border-neutral-600"
										/>
										<p className="text-xs text-muted-foreground">{field.description}</p>
									</div>
								))}
							</div>
						</div>

						<div>
							<h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
								<span className="text-lg">🤖</span>
								AI Usage
							</h4>
							<div className="space-y-4">
								{aiFields.map((field) => (
									<div key={field.key} className="space-y-2">
										<label className="flex items-center gap-2 text-sm font-medium">
											<span className="text-lg">{field.icon}</span>
											{field.label}
										</label>
										<input
											type="number"
											min="0"
											value={usage[field.key]}
											onChange={(e) => handleInputChange(field.key, e.target.value)}
											className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:border-neutral-600"
										/>
										<p className="text-xs text-muted-foreground">{field.description}</p>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Results */}
					<div className="space-y-6">
						<div>
							<h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
								<TrendingUp className="w-5 h-5 text-success" />
								Your Usage Breakdown
							</h4>
							<div className="space-y-3 text-sm">
								{Object.entries(calculations.breakdown).map(([key, requests]) => (
									<div key={key} className="flex justify-between items-center py-1">
										<span className="text-muted-foreground capitalize">
											{key.replace(/([A-Z])/g, ' $1').trim()}:
										</span>
										<span className="font-medium">{requests.toLocaleString()} requests</span>
									</div>
								))}
								<div className="border-t pt-2 mt-2">
									<div className="flex justify-between items-center font-semibold">
										<span>Total API Requests:</span>
										<span>{calculations.totalRequests.toLocaleString()}</span>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-blue-50 dark:bg-primary/20 rounded-lg p-6">
							<h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
								<DollarSign className="w-5 h-5 text-primary" />
								Cost Breakdown
							</h4>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Free allocation used:</span>
									<span className="font-medium">{calculations.freeRequests.toLocaleString()} requests</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Billable requests:</span>
									<span className="font-medium">{calculations.billableRequests.toLocaleString()} requests</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Non-AI API cost:</span>
									<span className="font-medium">${calculations.nonAiCost.toFixed(2)}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">AI input tokens:</span>
									<span className="font-medium">${calculations.aiInputCost.toFixed(2)}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">AI output tokens:</span>
									<span className="font-medium">${calculations.aiOutputCost.toFixed(2)}</span>
								</div>
								<div className="border-t pt-3 mt-3">
									<div className="flex justify-between items-center text-lg font-bold">
										<span>Total Monthly Cost:</span>
										<span className="text-primary">${calculations.totalCost.toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>

						{calculations.totalCost === 0 && (
							<div className="bg-green-50 dark:bg-success/20 rounded-lg p-4 text-center">
								<p className="text-success dark:text-success/90 font-medium">
									🎉 Your usage is within our free tier!
								</p>
								<p className="text-sm text-success dark:text-success mt-1">
									No charges for this level of usage.
								</p>
							</div>
						)}

						<div className="text-xs text-muted-foreground bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
							<p className="font-medium mb-2">Important Notes:</p>
							<ul className="space-y-1 list-disc list-inside">
								<li>These are example calculations — not final prices</li>
								<li>We'll publish clear pricing and free amounts before launch</li>
								<li>Includes 25,000 free API requests per month</li>
								<li>Volume discounts available for high usage</li>
								<li>All platform features included regardless of usage</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-8 pt-6 border-t text-center">
					<p className="text-sm text-muted-foreground mb-4">
						Ready to get started? All features are available immediately with your free account.
					</p>
					<div className="flex items-center justify-center gap-4">
						<a 
							href="/signup" 
							className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary transition-colors"
						>
							Start Free Account
						</a>
						<a 
							href="/contact" 
							className="inline-flex items-center rounded-lg border border-border px-6 py-3 font-semibold hover:bg-gray-50 transition-colors"
						>
							Contact Sales
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

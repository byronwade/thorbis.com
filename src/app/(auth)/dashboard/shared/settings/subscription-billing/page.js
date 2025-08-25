"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Crown,
  Calendar,
  Download,
  Receipt,
  AlertCircle,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  Settings,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";

export default function SubscriptionBillingSettings() {
	const currentPlan = {
		name: "Professional",
		price: 99,
		billing: "monthly",
		features: [
			"Up to 50 users",
			"Advanced analytics",
			"Priority support",
			"Custom integrations",
			"API access"
		],
		usage: {
			users: { current: 12, limit: 50 },
			storage: { current: 45, limit: 100 }, // GB
			apiCalls: { current: 8500, limit: 10000 }
		}
	};

	const plans = [
		{
			id: "starter",
			name: "Starter",
			price: 29,
			description: "Perfect for small businesses getting started",
			features: [
				"Up to 5 users",
				"Basic analytics",
				"Email support",
				"Standard integrations"
			],
			popular: false
		},
		{
			id: "professional",
			name: "Professional",
			price: 99,
			description: "Advanced features for growing businesses",
			features: [
				"Up to 50 users",
				"Advanced analytics",
				"Priority support",
				"Custom integrations",
				"API access"
			],
			popular: true
		},
		{
			id: "enterprise",
			name: "Enterprise",
			price: 299,
			description: "Complete solution for large organizations",
			features: [
				"Unlimited users",
				"Custom analytics",
				"24/7 phone support",
				"White-label options",
				"Dedicated account manager"
			],
			popular: false
		}
	];

	const paymentMethods = [
		{
			id: 1,
			type: "card",
			last4: "4242",
			brand: "Visa",
			expiry: "12/25",
			isDefault: true
		},
		{
			id: 2,
			type: "card",
			last4: "8888",
			brand: "Mastercard",
			expiry: "08/26",
			isDefault: false
		}
	];

	const invoices = [
		{
			id: "INV-2024-001",
			date: "2024-01-01",
			amount: 99.00,
			status: "paid",
			description: "Professional Plan - January 2024"
		},
		{
			id: "INV-2023-012",
			date: "2023-12-01",
			amount: 99.00,
			status: "paid",
			description: "Professional Plan - December 2023"
		},
		{
			id: "INV-2023-011",
			date: "2023-11-01",
			amount: 99.00,
			status: "paid",
			description: "Professional Plan - November 2023"
		}
	];

	const getUsagePercentage = (current, limit) => {
		return Math.round((current / limit) * 100);
	};

	const getUsageColor = (percentage) => {
		if (percentage >= 90) return "text-red-600";
		if (percentage >= 75) return "text-yellow-600";
		return "text-green-600";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Subscription & Billing</h1>
				<p className="text-muted-foreground">
					Manage your subscription plan, billing methods, and payment history.
				</p>
			</div>

			{/* Current Plan */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center space-x-2">
								<Crown className="h-5 w-5 text-yellow-600" />
								<span>Current Plan</span>
							</CardTitle>
							<CardDescription>
								Your active subscription and usage details.
							</CardDescription>
						</div>
						<Button>
							<ArrowUpRight className="h-4 w-4 mr-2" />
							Upgrade Plan
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
						<div>
							<h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
							<p className="text-sm text-muted-foreground">
								${currentPlan.price}/{currentPlan.billing}
							</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-muted-foreground">Next billing date</p>
							<p className="font-semibold">February 1, 2024</p>
						</div>
					</div>

					{/* Usage Statistics */}
					<div className="space-y-4">
						<h4 className="font-semibold">Usage Overview</h4>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Users</span>
									<span className={`text-sm ${getUsageColor(getUsagePercentage(currentPlan.usage.users.current, currentPlan.usage.users.limit))}`}>
										{currentPlan.usage.users.current} / {currentPlan.usage.users.limit}
									</span>
								</div>
								<Progress 
									value={getUsagePercentage(currentPlan.usage.users.current, currentPlan.usage.users.limit)} 
									className="h-2"
								/>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Storage (GB)</span>
									<span className={`text-sm ${getUsageColor(getUsagePercentage(currentPlan.usage.storage.current, currentPlan.usage.storage.limit))}`}>
										{currentPlan.usage.storage.current} / {currentPlan.usage.storage.limit}
									</span>
								</div>
								<Progress 
									value={getUsagePercentage(currentPlan.usage.storage.current, currentPlan.usage.storage.limit)} 
									className="h-2"
								/>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">API Calls</span>
									<span className={`text-sm ${getUsageColor(getUsagePercentage(currentPlan.usage.apiCalls.current, currentPlan.usage.apiCalls.limit))}`}>
										{currentPlan.usage.apiCalls.current.toLocaleString()} / {currentPlan.usage.apiCalls.limit.toLocaleString()}
									</span>
								</div>
								<Progress 
									value={getUsagePercentage(currentPlan.usage.apiCalls.current, currentPlan.usage.apiCalls.limit)} 
									className="h-2"
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Available Plans */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Star className="h-5 w-5" />
						<span>Available Plans</span>
					</CardTitle>
					<CardDescription>
						Choose the plan that best fits your business needs.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{plans.map((plan) => (
							<div 
								key={plan.id} 
								className={`relative p-6 border rounded-lg ${
									plan.id === "professional" ? "border-primary bg-primary/5" : ""
								}`}
							>
								{plan.popular && (
									<Badge className="absolute -top-2 left-4 bg-primary">
										Most Popular
									</Badge>
								)}
								<div className="space-y-4">
									<div>
										<h3 className="text-lg font-semibold">{plan.name}</h3>
										<p className="text-sm text-muted-foreground">{plan.description}</p>
									</div>
									<div className="flex items-baseline space-x-1">
										<span className="text-3xl font-bold">${plan.price}</span>
										<span className="text-sm text-muted-foreground">/month</span>
									</div>
									<ul className="space-y-2">
										{plan.features.map((feature, index) => (
											<li key={index} className="flex items-center space-x-2 text-sm">
												<CheckCircle className="h-4 w-4 text-green-600" />
												<span>{feature}</span>
											</li>
										))}
									</ul>
									<Button 
										className="w-full" 
										variant={plan.id === "professional" ? "default" : "outline"}
										disabled={plan.id === "professional"}
									>
										{plan.id === "professional" ? "Current Plan" : "Upgrade"}
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Payment Methods */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center space-x-2">
								<CreditCard className="h-5 w-5" />
								<span>Payment Methods</span>
							</CardTitle>
							<CardDescription>
								Manage your payment methods and billing information.
							</CardDescription>
						</div>
						<Button variant="outline">
							Add Payment Method
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{paymentMethods.map((method) => (
							<div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
										<CreditCard className="h-4 w-4 text-white" />
									</div>
									<div>
										<p className="font-medium">
											{method.brand} •••• {method.last4}
										</p>
										<p className="text-sm text-muted-foreground">
											Expires {method.expiry}
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									{method.isDefault && (
										<Badge variant="secondary">Default</Badge>
									)}
									<Button variant="ghost" size="sm">
										Edit
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Billing History */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center space-x-2">
								<Receipt className="h-5 w-5" />
								<span>Billing History</span>
							</CardTitle>
							<CardDescription>
								View and download your past invoices.
							</CardDescription>
						</div>
						<Button variant="outline">
							<Download className="h-4 w-4 mr-2" />
							Download All
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-12"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{invoices.map((invoice) => (
								<TableRow key={invoice.id}>
									<TableCell className="font-medium">{invoice.id}</TableCell>
									<TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
									<TableCell>{invoice.description}</TableCell>
									<TableCell>${invoice.amount.toFixed(2)}</TableCell>
									<TableCell>
										<Badge className="bg-green-100 text-green-800">
											<CheckCircle className="h-3 w-3 mr-1" />
											Paid
										</Badge>
									</TableCell>
									<TableCell>
										<Button variant="ghost" size="sm">
											<Download className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

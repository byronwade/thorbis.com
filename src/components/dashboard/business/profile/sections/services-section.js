/**
 * ServicesSection Component
 * Business profile services management section
 * Extracted from large profile page for better organization
 */

"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Wrench, Plus, Save, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

// Import data and hooks
import { useBusinessServices } from "@lib/hooks/business/profile/use-business-services";
import { getSuggestionsForCategory, serviceCategories } from "@lib/business/service-suggestions";

export const ServicesSection = ({ 
	initialServices = [], 
	businessCategory = null, 
	onSave,
	isClient = true 
}) => {
	const {
		services,
		quickAddForm,
		setQuickAddForm,
		addService,
		addServiceFromSuggestion,
		removeService,
		updateService,
		validateAllServices,
		stats,
		canAddService,
		isAtLimit,
	} = useBusinessServices(initialServices);

	const handleSave = () => {
		if (validateAllServices()) {
			onSave?.(services);
		}
	};

	const suggestions = businessCategory ? getSuggestionsForCategory(businessCategory) : [];

	if (!isClient) {
		return <div>Loading services...</div>;
	}

	return (
		<div className="space-y-6">
			{/* Services Overview & Quick Add */}
			<Card suppressHydrationWarning>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Wrench className="w-5 h-5" />
						<span>Services ({stats.total}/30)</span>
					</CardTitle>
					<CardDescription>Add and manage your business services</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Quick Add Service Form */}
					<div className="p-4 rounded-lg border bg-muted/20">
						<div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-3">
							<div className="space-y-1">
								<Label className="text-sm">Service Name</Label>
								<Input 
									placeholder="e.g., Emergency Plumbing" 
									value={quickAddForm.name} 
									onChange={(e) => setQuickAddForm(prev => ({ ...prev, name: e.target.value }))} 
								/>
							</div>
							<div className="space-y-1">
								<Label className="text-sm">Price (Optional)</Label>
								<Input 
									placeholder="e.g., $150" 
									value={quickAddForm.price} 
									onChange={(e) => setQuickAddForm(prev => ({ ...prev, price: e.target.value }))} 
								/>
							</div>
							<div className="space-y-1">
								<Label className="text-sm">Category</Label>
								<Select 
									value={quickAddForm.category} 
									onValueChange={(value) => setQuickAddForm(prev => ({ ...prev, category: value }))}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{serviceCategories.map((category) => (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex gap-2">
							<Button onClick={addService} disabled={isAtLimit}>
								<Plus className="mr-2 w-4 h-4" />
								Add Service
							</Button>
						</div>

						{/* Service Suggestions */}
						{businessCategory && suggestions.length > 0 && (
							<div className="pt-3 mt-3 border-t">
								<p className="mb-2 text-sm text-muted-foreground">
									Quick add for {businessCategory}:
								</p>
								<div className="flex flex-wrap gap-1">
									{suggestions.map((suggestion, index) => (
										<Button
											key={index}
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={() => addServiceFromSuggestion(suggestion)}
											disabled={isAtLimit}
										>
											+ {suggestion}
										</Button>
									))}
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Services List */}
			{services.length > 0 && (
				<Card suppressHydrationWarning>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<FileText className="w-5 h-5" />
							<span>Your Services</span>
						</CardTitle>
						<CardDescription>
							Edit your services below. Click and type to update any field.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							{services.map((service, index) => (
								<ServiceCard
									key={service.id}
									service={service}
									index={index}
									onUpdate={updateService}
									onRemove={removeService}
								/>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Empty State */}
			{services.length === 0 && (
				<ServiceEmptyState onAddService={addService} />
			)}

			{/* Add More Services */}
			{services.length > 0 && canAddService && (
				<Card suppressHydrationWarning className="border-2 border-dashed transition-colors border-primary/20 hover:border-primary/40">
					<CardContent className="py-8">
						<div className="space-y-3 text-center">
							<Button onClick={addService} variant="outline" size="lg" className="min-w-[200px]">
								<Plus className="mr-2 w-5 h-5" />
								Add Another Service
							</Button>
							<p className="text-sm text-muted-foreground">
								You can add up to {stats.remaining} more services
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Service Limit Reached */}
			{isAtLimit && (
				<Card suppressHydrationWarning className="bg-amber-50 border-amber-200 dark:border-amber-800 dark:bg-amber-950/30">
					<CardContent className="py-6">
						<div className="space-y-2 text-center">
							<div className="flex justify-center items-center space-x-2 text-amber-600 dark:text-amber-400">
								<AlertCircle className="w-5 h-5" />
								<span className="font-medium">Service limit reached</span>
							</div>
							<p className="text-sm text-amber-700 dark:text-amber-300">
								You've reached the maximum of 30 services. Remove a service to add a new one.
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Save Changes */}
			{services.length > 0 && (
				<Card suppressHydrationWarning className="bg-primary/5 border-primary/20">
					<CardContent className="py-4">
						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-3">
								<div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/20">
									<Save className="w-4 h-4 text-primary" />
								</div>
								<div>
									<p className="font-medium">Ready to save your services?</p>
									<p className="text-sm text-muted-foreground">
										Your changes will be visible to customers immediately
									</p>
								</div>
							</div>
							<Button onClick={handleSave} size="lg">
								<Save className="mr-2 w-4 h-4" />
								Save All Changes
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

// Individual Service Card Component
const ServiceCard = ({ service, index, onUpdate, onRemove }) => {
	const isComplete = service.name && service.category;

	return (
		<div className="p-4 rounded-lg border transition-all duration-200 group hover:border-primary/50 bg-muted/20">
			{/* Service Header */}
			<div className="flex justify-between items-start mb-3">
				<div className="flex flex-1 items-center space-x-2">
					<div className="flex justify-center items-center w-6 h-6 text-xs font-medium rounded-full bg-primary/5 text-primary border border-primary/20">
						{index + 1}
					</div>
					<Input 
						value={service.name} 
						onChange={(e) => onUpdate(service.id, "name", e.target.value)} 
						placeholder="Service name..." 
						className="p-0 h-auto font-medium bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60" 
					/>
				</div>
				<Button 
					variant="ghost" 
					size="sm" 
					onClick={() => onRemove(service.id)} 
					className="p-0 w-6 h-6 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
				>
					<X className="w-3 h-3" />
				</Button>
			</div>

			{/* Service Details */}
			<div className="space-y-3">
				<div className="grid grid-cols-2 gap-3">
					<div>
						<Label className="block mb-1 text-xs text-muted-foreground">Price (Optional)</Label>
						<Input 
							value={service.price} 
							onChange={(e) => onUpdate(service.id, "price", e.target.value)} 
							placeholder="$150" 
							className="h-8 text-sm" 
						/>
					</div>
					<div>
						<Label className="block mb-1 text-xs text-muted-foreground">Duration</Label>
						<Input 
							value={service.duration} 
							onChange={(e) => onUpdate(service.id, "duration", e.target.value)} 
							placeholder="2 hours" 
							className="h-8 text-sm" 
						/>
					</div>
				</div>

				<div>
					<Label className="block mb-1 text-xs text-muted-foreground">Category</Label>
					<Select 
						value={service.category} 
						onValueChange={(value) => onUpdate(service.id, "category", value)}
					>
						<SelectTrigger className="h-8 text-sm">
							<SelectValue placeholder="Select..." />
						</SelectTrigger>
						<SelectContent>
							{serviceCategories.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label className="block mb-1 text-xs text-muted-foreground">Description (Optional)</Label>
					<Textarea 
						value={service.description} 
						onChange={(e) => onUpdate(service.id, "description", e.target.value)} 
						placeholder="Brief description of this service..." 
						rows={2} 
						className="text-sm resize-none" 
					/>
				</div>
			</div>

			{/* Status Indicator */}
			<div className="flex justify-between items-center pt-2 mt-3 border-t border-border/30">
				<div className="flex items-center space-x-2">
					{isComplete ? (
						<Badge variant="secondary" className="text-xs text-success bg-success/10 dark:bg-success/30 dark:text-success/90">
							<CheckCircle className="mr-1 w-3 h-3" />
							Complete
						</Badge>
					) : (
						<Badge variant="secondary" className="text-xs text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
							<AlertCircle className="mr-1 w-3 h-3" />
							Incomplete
						</Badge>
					)}
				</div>
				<span className="text-xs text-muted-foreground">#{index + 1}</span>
			</div>
		</div>
	);
};

// Empty State Component
const ServiceEmptyState = ({ onAddService }) => (
	<Card suppressHydrationWarning>
		<CardContent className="py-12">
			<div className="space-y-4 text-center">
				<div className="flex justify-center items-center mx-auto w-16 h-16 rounded-full bg-primary/10">
					<Wrench className="w-8 h-8 text-primary" />
				</div>
				<div className="space-y-2">
					<h3 className="text-lg font-semibold">No services added yet</h3>
					<p className="mx-auto max-w-sm text-muted-foreground">
						Start showcasing your expertise by adding the services you offer. 
						This helps customers understand what you do and how you can help them.
					</p>
				</div>
				<div className="flex flex-col gap-3 justify-center items-center sm:flex-row">
					<Button onClick={onAddService} size="lg" className="min-w-[200px]">
						<Plus className="mr-2 w-5 h-5" />
						Add Your First Service
					</Button>
				</div>
				<div className="space-y-1 text-xs text-muted-foreground">
					<p>💡 <strong>Pro tip:</strong> Add 3-5 core services to start</p>
					<p>🎯 Include pricing to attract serious inquiries</p>
					<p>📝 Clear descriptions help customers choose the right service</p>
				</div>
			</div>
		</CardContent>
	</Card>
);
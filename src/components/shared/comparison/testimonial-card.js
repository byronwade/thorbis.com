import React from "react";
import { Card, CardContent } from "@components/ui/card";

/**
 * Reusable testimonial card component for comparison pages
 * @param {Object} props
 * @param {string} props.businessType - Type of business (e.g., "HVAC Contractor", "Boutique Hotel")
 * @param {Object} props.metric - The main metric to highlight
 * @param {string} props.metric.value - The metric value (e.g., "+234%", "$95K")
 * @param {string} props.metric.label - The metric description
 * @param {string} props.quote - The testimonial quote
 * @param {Object} props.customer - Customer information
 * @param {string} props.customer.name - Customer name
 * @param {string} props.customer.business - Business name
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {React.ComponentType} props.avatarIcon - Avatar icon component
 */
export function TestimonialCard({ businessType, metric, quote, customer, icon: Icon, avatarIcon: AvatarIcon }) {
	return (
		<Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
			<CardContent className="p-8">
				<div className="flex items-center gap-2 mb-4">
					<Icon className="w-5 h-5 text-primary" />
					<span className="text-sm font-medium text-primary">{businessType}</span>
				</div>
				<div className="mb-4">
					<div className="text-2xl font-bold text-success dark:text-success">{metric.value}</div>
					<div className="text-sm text-muted-foreground">{metric.label}</div>
				</div>
				<blockquote className="mb-4 text-sm text-muted-foreground">{quote}</blockquote>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
						<AvatarIcon className="w-5 h-5 text-primary" />
					</div>
					<div>
						<div className="font-semibold text-sm">{customer.name}</div>
						<div className="text-xs text-muted-foreground">{customer.business}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Container component for testimonial sections
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section subtitle/description
 * @param {React.ReactNode} props.children - TestimonialCard components
 * @param {string} props.className - Additional CSS classes
 */
export function TestimonialSection({ title, subtitle, children, className = "" }) {
	return (
		<section className={`px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 ${className}`}>
			<div className="mb-12 text-center">
				<h2 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
				<p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
			</div>
			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{children}</div>
		</section>
	);
}

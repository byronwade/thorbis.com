/**
 * BusinessDetailsSection Component
 * Handles business details (price range, hours, specialties, amenities, payment methods)
 * Extracted from BusinessSubmissionForm for better modularity
 */

"use client";

import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { Separator } from "@components/ui/separator";
import { Clock, Plus, X, DollarSign } from "lucide-react";
import { PRICE_RANGES, EMPLOYEE_COUNT_RANGES } from "@lib/data/business/submission/constants";

const BusinessDetailsSection = ({ form, selectedAmenities, selectedPaymentMethods, toggleAmenity, togglePaymentMethod, specialtyFields, addSpecialty, removeSpecialtyItem, constants }) => {
	const { COMMON_AMENITIES, PAYMENT_METHODS, DAYS_OF_WEEK } = constants;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					Business Details
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Basic Business Info */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<FormField
						control={form.control}
						name="yearEstablished"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Year Established</FormLabel>
								<FormControl>
									<Input {...field} type="number" placeholder="2020" min="1800" max={new Date().getFullYear()} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="employeeCount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Number of Employees</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select range" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{EMPLOYEE_COUNT_RANGES.map((range) => (
											<SelectItem key={range} value={range}>
												{range}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="priceRange"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Price Range *</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select price range" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{PRICE_RANGES.map((range) => (
											<SelectItem key={range.value} value={range.value}>
												{range.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Separator />

				{/* Business Hours */}
				<div>
					<h3 className="text-lg font-medium mb-4">Business Hours</h3>
					<div className="space-y-3">
						{DAYS_OF_WEEK.map((day, index) => (
							<FormField
								key={day}
								control={form.control}
								name={`hours.${index}`}
								render={({ field }) => (
									<div className="flex items-center space-x-4">
										<div className="w-24 text-sm font-medium">{day}</div>
										<div className="flex items-center space-x-2">
											<Switch checked={!field.value.closed} onCheckedChange={(checked) => field.onChange({ ...field.value, closed: !checked })} />
											<span className="text-sm text-muted-foreground">{field.value.closed ? "Closed" : "Open"}</span>
										</div>
										{!field.value.closed && (
											<>
												<Input type="time" value={field.value.open} onChange={(e) => field.onChange({ ...field.value, open: e.target.value })} className="w-32" />
												<span className="text-sm text-muted-foreground">to</span>
												<Input type="time" value={field.value.close} onChange={(e) => field.onChange({ ...field.value, close: e.target.value })} className="w-32" />
											</>
										)}
									</div>
								)}
							/>
						))}
					</div>
				</div>

				<Separator />

				{/* Specialties */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium">Specialties & Services</h3>
						<Button type="button" variant="outline" size="sm" onClick={addSpecialty}>
							<Plus className="h-4 w-4 mr-2" />
							Add Specialty
						</Button>
					</div>
					<div className="space-y-4">
						{specialtyFields.map((field, index) => (
							<div key={field.id} className="flex gap-4 items-start">
								<div className="flex-1 space-y-2">
									<FormField
										control={form.control}
										name={`specialties.${index}.name`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input {...field} placeholder="Specialty name" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`specialties.${index}.description`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Textarea {...field} placeholder="Brief description (optional)" rows={2} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<Button type="button" variant="ghost" size="sm" onClick={() => removeSpecialtyItem(index)} className="text-destructive hover:text-destructive">
									<X className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</div>

				<Separator />

				{/* Amenities */}
				<div>
					<h3 className="text-lg font-medium mb-4">Amenities</h3>
					<div className="flex flex-wrap gap-2">
						{COMMON_AMENITIES.map((amenity) => (
							<Badge key={amenity} variant={selectedAmenities.includes(amenity) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleAmenity(amenity)}>
								{amenity}
							</Badge>
						))}
					</div>
				</div>

				<Separator />

				{/* Payment Methods */}
				<div>
					<h3 className="text-lg font-medium mb-4">Accepted Payment Methods</h3>
					<div className="flex flex-wrap gap-2">
						{PAYMENT_METHODS.map((method) => (
							<Badge key={method} variant={selectedPaymentMethods.includes(method) ? "default" : "outline"} className="cursor-pointer" onClick={() => togglePaymentMethod(method)}>
								<DollarSign className="h-3 w-3 mr-1" />
								{method}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default BusinessDetailsSection;

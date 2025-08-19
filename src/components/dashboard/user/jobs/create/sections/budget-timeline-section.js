/**
 * BudgetTimelineSection Component
 * Job posting budget and timeline form section
 * Extracted from large jobs create page for better organization
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { DollarSign, Clock } from "lucide-react";
import { budgetTypes, urgencyLevels } from "@lib/jobs/categories";

export const BudgetTimelineSection = ({ formData, onInputChange, errors = {} }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<DollarSign className="w-5 h-5" />
					<span>Budget & Timeline</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Budget Type Selection */}
				<div>
					<Label>Budget Type</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
						{budgetTypes.map((type) => (
							<div key={type.value} className={`p-3 rounded-lg border cursor-pointer transition-colors ${formData.budgetType === type.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`} onClick={() => onInputChange("budgetType", type.value)}>
								<div className="text-sm font-medium">{type.label}</div>
								<div className="text-xs text-muted-foreground">{type.description}</div>
							</div>
						))}
					</div>
					{errors.budgetType && <p className="text-sm text-destructive mt-1">{errors.budgetType}</p>}
				</div>

				{/* Budget Amount Inputs */}
				{formData.budgetType !== "estimate" && (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{formData.budgetType === "fixed" ? (
							<div className="md:col-span-2">
								<Label htmlFor="budgetAmount">Project Budget</Label>
								<Input id="budgetAmount" placeholder="e.g., $500" value={formData.budgetAmount || ""} onChange={(e) => onInputChange("budgetAmount", e.target.value)} className={errors.budgetAmount ? "border-destructive" : ""} />
								{errors.budgetAmount && <p className="text-sm text-destructive mt-1">{errors.budgetAmount}</p>}
								<p className="mt-1 text-xs text-muted-foreground">Total amount you're willing to pay for this project</p>
							</div>
						) : (
							<>
								<div>
									<Label htmlFor="budgetMin">{formData.budgetType === "hourly" ? "Hourly Rate Min" : "Monthly Budget Min"}</Label>
									<Input id="budgetMin" placeholder={formData.budgetType === "hourly" ? "e.g., $25" : "e.g., $500"} value={formData.budgetMin || ""} onChange={(e) => onInputChange("budgetMin", e.target.value)} />
								</div>
								<div>
									<Label htmlFor="budgetMax">{formData.budgetType === "hourly" ? "Hourly Rate Max" : "Monthly Budget Max"}</Label>
									<Input id="budgetMax" placeholder={formData.budgetType === "hourly" ? "e.g., $50" : "e.g., $2000"} value={formData.budgetMax || ""} onChange={(e) => onInputChange("budgetMax", e.target.value)} />
								</div>
							</>
						)}
					</div>
				)}

				{/* Budget Estimate Message */}
				{formData.budgetType === "estimate" && (
					<div className="p-4 bg-blue-50 border border-primary/30 rounded-lg">
						<div className="flex items-start space-x-2">
							<DollarSign className="w-5 h-5 text-primary mt-0.5" />
							<div>
								<h4 className="text-sm font-medium text-primary">Request Estimates</h4>
								<p className="text-sm text-primary mt-1">Professionals will provide detailed quotes for your project. You can compare proposals and choose the best fit.</p>
							</div>
						</div>
					</div>
				)}

				{/* Timeline */}
				<div>
					<Label htmlFor="timeline">Project Timeline</Label>
					<Input id="timeline" placeholder="e.g., Start within 1 week, complete by end of month" value={formData.timeline || ""} onChange={(e) => onInputChange("timeline", e.target.value)} />
					<p className="mt-1 text-xs text-muted-foreground">When do you need this project to start and finish?</p>
				</div>

				{/* Urgency Level */}
				<div>
					<Label className="flex items-center space-x-2">
						<Clock className="w-4 h-4" />
						<span>Urgency Level</span>
					</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
						{urgencyLevels.map((level) => (
							<div key={level.value} className={`p-3 rounded-lg border cursor-pointer transition-colors ${formData.urgency === level.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`} onClick={() => onInputChange("urgency", level.value)}>
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${level.color.split(" ")[0]}`}></div>
									<div className="text-sm font-medium">{level.label}</div>
								</div>
								<div className="ml-4 text-xs text-muted-foreground">{level.description}</div>
							</div>
						))}
					</div>
					{errors.urgency && <p className="text-sm text-destructive mt-1">{errors.urgency}</p>}
				</div>
			</CardContent>
		</Card>
	);
};

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Step1 = ({ nextStep, formData, setFormData }) => (
	<Card>
		<CardHeader>
			<CardTitle>Job Details</CardTitle>
			<CardDescription>Tell us about the position.</CardDescription>
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="job-title">Job Title</Label>
				<Input id="job-title" placeholder="e.g. Senior Frontend Developer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="job-description">Job Description</Label>
				<Textarea id="job-description" placeholder="Describe the role, responsibilities, and qualifications." rows={8} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="job-type">Job Type</Label>
					<Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
						<SelectTrigger>
							<SelectValue placeholder="Select a job type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Full-time">Full-time</SelectItem>
							<SelectItem value="Part-time">Part-time</SelectItem>
							<SelectItem value="Contract">Contract</SelectItem>
							<SelectItem value="Internship">Internship</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="job-location">Location</Label>
					<Input id="job-location" placeholder="e.g. Springfield, IL" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
				</div>
			</div>
			<Button onClick={nextStep} className="w-full">
				Next: Company Info
			</Button>
		</CardContent>
	</Card>
);

const Step2 = ({ nextStep, prevStep, formData, setFormData }) => (
	<Card>
		<CardHeader>
			<CardTitle>Company Information</CardTitle>
			<CardDescription>Tell us about your company.</CardDescription>
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="company-name">Company Name</Label>
				<Input id="company-name" placeholder="e.g. Innovate Solutions" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="company-website">Company Website</Label>
				<Input id="company-website" placeholder="e.g. https://innovate.com" value={formData.companyWebsite} onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="company-logo">Company Logo URL</Label>
				<Input id="company-logo" placeholder="e.g. https://innovate.com/logo.png" value={formData.companyLogo} onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })} />
			</div>
			<div className="flex justify-between">
				<Button variant="outline" onClick={prevStep}>
					Back
				</Button>
				<Button onClick={nextStep}>Next: Review</Button>
			</div>
		</CardContent>
	</Card>
);

const Step3 = ({ prevStep, formData }) => (
	<Card>
		<CardHeader>
			<CardTitle>Preview Your Listing</CardTitle>
			<CardDescription>This is how your job post will appear to candidates.</CardDescription>
		</CardHeader>
		<CardContent>
			<div className="border rounded-lg p-6 space-y-4">
				<h2 className="text-2xl font-bold">{formData.title}</h2>
				<p className="font-semibold">{formData.companyName}</p>
				<p className="text-muted-foreground">{formData.location}</p>
				<p className="whitespace-pre-wrap">{formData.description}</p>
				<Badge>{formData.type}</Badge>
			</div>
			<div className="flex justify-between mt-6">
				<Button variant="outline" onClick={prevStep}>
					Back
				</Button>
				<Button>Post Job</Button>
			</div>
		</CardContent>
	</Card>
);

export default function PostJobPage() {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		type: "",
		location: "",
		companyName: "",
		companyWebsite: "",
		companyLogo: "",
	});

	const nextStep = () => setStep(step + 1);
	const prevStep = () => setStep(step - 1);

	const progress = (step / 3) * 100;

	return (
		<div className="max-w-2xl mx-auto">
			<Progress value={progress} className="mb-8" />
			{step === 1 && <Step1 nextStep={nextStep} formData={formData} setFormData={setFormData} />}
			{step === 2 && <Step2 nextStep={nextStep} prevStep={prevStep} formData={formData} setFormData={setFormData} />}
			{step === 3 && <Step3 prevStep={prevStep} formData={formData} />}
		</div>
	);
}

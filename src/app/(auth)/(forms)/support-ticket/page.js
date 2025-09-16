"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthForms } from "@/components/auth/auth-forms";

// Placeholder components for support ticket flow
const ActiveUser = () => <div className="text-white">User verified</div>;
const SupportInfo = () => (
	<div className="space-y-6">
		<h2 className="text-xl font-bold text-white">Support Request</h2>
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-neutral-300 mb-2">Issue Type</label>
				<select className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white">
					<option value="">Select an issue type</option>
					<option value="technical">Technical Issue</option>
					<option value="billing">Billing Question</option>
					<option value="account">Account Issue</option>
					<option value="other">Other</option>
				</select>
			</div>
			<div>
				<label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
				<textarea className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white" 
					rows="4" placeholder="Please describe your issue in detail"></textarea>
			</div>
		</div>
	</div>
);

const steps = [
	{ component: ActiveUser, name: "Active User" },
	{ component: SupportInfo, name: "Support Info" },
];

const AddBusiness = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const { user, loading } = useAuth();

	useEffect(() => {
		// Reset to the first step when the component mounts
		setCurrentStep(0);
	}, []);

	const nextStep = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const CurrentComponent = steps[currentStep].component;

	if (loading) {
		return (
			<div className="flex justify-center w-full">
				<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={200} height={100} className="w-[60px] h-[60px] animate-breathe" />
			</div>
		);
	}

	if (!user) {
		return <AuthForms mode="sign-in" onModeChange={() => {}} />;
	}

	if (!user.email_confirmed_at) {
		return (
			<div className="text-center text-white">
				<h2 className="text-xl font-bold mb-4">Please verify your email</h2>
				<p className="text-neutral-400">Check your email for a verification link.</p>
			</div>
		);
	}

	console.log(user);

	return (
		<>
			<CurrentComponent />
			{currentStep !== steps.findIndex((step) => step.name === "Business Submitted") && (
				<div className="flex justify-between mt-10">
					{currentStep !== steps.findIndex((step) => step.name === "Active User") && (
						<Button variant="outline" type="button" onClick={prevStep} className="mt-2 border-neutral-700 dark:border-neutral-800">
							<ArrowLeft className="w-4 h-4 mr-2" /> Back
						</Button>
					)}
					{currentStep !== steps.findIndex((step) => step.name === "Active User") && (
						<Button type="button" onClick={nextStep} className="mt-2">
							Next <ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					)}
					{currentStep === steps.findIndex((step) => step.name === "Active User") && (
						<div className="flex flex-row justify-between w-full mt-4">
							<Button type="submit" onClick={nextStep}>
								Confirm & Add Business <ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default AddBusiness;

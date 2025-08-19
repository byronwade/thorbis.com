"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { useToast } from "@components/ui/use-toast";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@components/ui/select";

const companyInfo = {
	name: "Acme Web Design",
};

export function AppointmentCard() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		control,
		trigger,
	} = useForm();
	const { toast } = useToast();
	const [step, setStep] = useState(1);

	const service = watch("service");

	async function nextStep() {
		const valid = await trigger();
		if (valid) {
			setStep(step + 1);
		}
	}

	function previousStep() {
		setStep(step - 1);
	}

	function onSubmit(data) {
		toast({
			title: "Appointment booked",
			description: `You have booked a ${data.service} appointment. ${companyInfo.name} will reach out to you to confirm the date and other details.`,
		});
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Book an Appointment</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{step === 1 && (
						<div>
							<label>Select a Service</label>
							<Controller
								name="service"
								control={control}
								rules={{ required: "You need to select a service type." }}
								render={({ field }) => (
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a service" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Services</SelectLabel>
												<SelectItem value="tattoo">Tattoo</SelectItem>
												<SelectItem value="consultation">Consultation</SelectItem>
												<SelectItem value="piercing">Piercing</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								)}
							/>
							{errors.service && <p className="text-destructive">{errors.service.message}</p>}
							<Button type="button" onClick={nextStep} className="w-full mt-4">
								Next
							</Button>
						</div>
					)}
					{step === 2 && (
						<div>
							<label>Description</label>
							<Textarea placeholder="Describe your request" {...register("description", { required: "Description is required." })} />
							{errors.description && <p className="text-destructive">{errors.description.message}</p>}
							<div className="flex justify-between mt-4">
								<Button type="button" onClick={previousStep} className="w-1/2 mr-2">
									Back
								</Button>
								<Button type="button" onClick={nextStep} className="w-1/2 ml-2">
									Next
								</Button>
							</div>
						</div>
					)}
					{step === 3 && (
						<div>
							<label>Budget</label>
							<Input type="number" placeholder="Your budget" {...register("budget", { required: "Budget is required." })} />
							{errors.budget && <p className="text-destructive">{errors.budget.message}</p>}
							<p className="mt-4">{companyInfo.name} will reach out to you to confirm and book the appointment date.</p>
							<div className="flex justify-between mt-4">
								<Button type="button" onClick={previousStep} className="w-1/2 mr-2">
									Back
								</Button>
								<Button type="submit" className="w-1/2 ml-2">
									Book Appointment
								</Button>
							</div>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}

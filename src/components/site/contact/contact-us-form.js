"use client";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea"; // Adjust import path as necessary
import { Button } from "@components/ui/button";
import { ArrowRight } from "react-feather";

const contactUsSchema = z.object({
	name: z.string().nonempty({ message: "Name is required" }),
	email: z.string().email({ message: "Invalid email address" }).nonempty({ message: "Email is required" }),
	phoneNumber: z.string().nonempty({ message: "Phone number is required" }),
	subject: z.string().nonempty({ message: "Subject is required" }),
	message: z.string().nonempty({ message: "Message is required" }),
});

export default function ContactUsForm() {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const formMethods = useForm({
		resolver: zodResolver(contactUsSchema),
		defaultValues: {
			name: "",
			email: "",
			phoneNumber: "",
			subject: "",
			message: "",
		},
	});

	const onSubmit = async (values) => {
		setLoading(true);
		setError("");
		setSuccess(false);
		try {
			// Replace with your contact us form submission logic
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async call
			setSuccess(true);
		} catch (err) {
			setError("Failed to submit the contact form. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left ">Contact Us</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">Complete the form below to get in touch with us.</p>
			<div className="flex flex-col mt-6">
				<FormProvider {...formMethods}>
					<Form {...formMethods}>
						<form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-10">
							<FormField
								control={formMethods.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Name <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input {...field} className="bg-background border border-border focus-within:border-primary focus:border-primary" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formMethods.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Email <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input {...field} type="email" className="bg-background border border-border focus-within:border-primary focus:border-primary" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formMethods.control}
								name="phoneNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Phone Number <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input {...field} className="bg-background border border-border focus-within:border-primary focus:border-primary" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formMethods.control}
								name="subject"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Subject <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input {...field} className="bg-background border border-border focus-within:border-primary focus:border-primary" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formMethods.control}
								name="message"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Message <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Textarea {...field} className="bg-background border border-border focus-within:border-primary focus:border-primary" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={loading}>
								{loading ? "Submitting..." : "Submit"} <ArrowRight className="w-4 h-4 ml-2" />
							</Button>
							{success && <p className="mt-2 text-sm leading-6 text-left text-success">Your message has been sent successfully.</p>}
							{error && <p className="mt-2 text-sm leading-6 text-left text-destructive">{error}</p>}
						</form>
					</Form>
				</FormProvider>
			</div>
		</>
	);
}

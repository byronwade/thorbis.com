import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Textarea } from "@components/ui/textarea"; // Adjust import path as necessary

const supportTicketSchema = z.object({
	category: z.string().nonempty({ message: "Please select a category" }),
	message: z.string().nonempty({ message: "Message is required" }),
});

export default function SupportTicket() {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const formMethods = useForm({
		resolver: zodResolver(supportTicketSchema),
		defaultValues: {
			category: "",
			message: "",
		},
	});

	const onSubmit = async (values) => {
		setLoading(true);
		setError("");
		setSuccess(false);
		try {
			// Replace with your support ticket submission logic
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async call
			setSuccess(true);
		} catch (err) {
			setError("Failed to submit the support ticket. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left ">Submit a Support Ticket</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">Complete the form below to submit your support request.</p>
			<div className="flex flex-col mt-6">
				<FormProvider {...formMethods}>
					<Form {...formMethods}>
						<form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-10">
							<FormField
								control={formMethods.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Category <span className="text-destructive">*</span>
										</FormLabel>
										<FormDescription>Select the category that best describes your issue.</FormDescription>
										<FormControl>
											<Select {...field}>
												<SelectTrigger>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="technical">Technical Issue</SelectItem>
													<SelectItem value="billing">Billing Issue</SelectItem>
													<SelectItem value="general">General Inquiry</SelectItem>
												</SelectContent>
											</Select>
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
										<FormDescription>Provide details about your issue or inquiry.</FormDescription>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{success && <p className="mt-2 text-sm leading-6 text-left text-success">Support ticket submitted successfully.</p>}
							{error && <p className="mt-2 text-sm leading-6 text-left text-destructive">{error}</p>}
						</form>
					</Form>
				</FormProvider>
			</div>
		</>
	);
}

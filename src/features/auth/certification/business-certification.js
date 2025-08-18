"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { useState } from "react";
import Image from "next/image";

const reportBusinessSchema = z.object({
	customerDetails: z.string().nonempty({ message: "Customer details are required" }),
	generalLiabilityInsurance: z.string().nonempty({ message: "General Liability Insurance details are required" }),
	workersComp: z.string().nonempty({ message: "Workers&apos; Compensation Insurance details are required" }),
});

export default function BusinessCertification() {
	const formMethods = useForm({
		resolver: zodResolver(reportBusinessSchema),
		defaultValues: {
			customerDetails: "",
			generalLiabilityInsurance: "",
			workersComp: "",
		},
	});

	const [loading, setLoading] = useState(false);

	const onSubmit = (values) => {
		setLoading(true);
		console.log(values);
		// Add your form submission logic here
		setLoading(false);
	};

	if (loading) {
		return (
			<div className="flex justify-center w-full">
				<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={100} height={100} className="w-[60px] h-[60px] animate-breathe" />
			</div>
		);
	}

	return (
		<>
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left ">Business Certification</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">Please fill out the form below to submit your business for Diamond Certified evaluation.</p>
			<div className="flex flex-col mt-6">
				<FormProvider {...formMethods}>
					<Form {...formMethods}>
						<form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-10">
							<FormField
								control={formMethods.control}
								name="customerDetails"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer Details</FormLabel>
										<FormDescription>
											Please upload a file containing at least 400 customer details for evaluation. Our team will reach out to all 400 customers and verify customer satisfaction. If you have any questions, please visit{" "}
											<a href="/thorbis-certifications" className="text-primary underline">
												this link
											</a>
											.
										</FormDescription>
										<FormControl>
											<Input {...field} type="file" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formMethods.control}
								name="generalLiabilityInsurance"
								render={({ field }) => (
									<FormItem>
										<FormLabel>General Liability Insurance</FormLabel>
										<FormDescription>Upload your General Liability Insurance document to verify coverage.</FormDescription>
										<FormControl>
											<Input {...field} type="file" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formMethods.control}
								name="workersComp"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Workers&apos; Compensation Insurance</FormLabel>
										<FormDescription>Upload your Workers&apos; Compensation Insurance document to ensure compliance.</FormDescription>
										<FormControl>
											<Input {...field} type="file" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</FormProvider>
			</div>
		</>
	);
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";

const resendSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

const EmailVerified = () => {
	const { user, loading } = useAuth();
	const [resendLoading, setResendLoading] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [resendError, setResendError] = useState("");
	console.log(user, userRoles);

	const formMethods = useForm({
		resolver: zodResolver(resendSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data) => {
		setResendLoading(true);
		setResendSuccess(false);
		setResendError("");

		try {
			const { error } = await supabase.auth.resend({
				type: "signup",
				email: data.email,
				options: {
					emailRedirectTo: `${window.location.origin}/verify-email`,
				},
			});

			if (error) {
				throw error;
			}

			setResendSuccess(true);
		} catch (error) {
			setResendError(error.message);
		} finally {
			setResendLoading(false);
		}
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
			{user?.email_confirmed_at ? (
				<>
					<h2 className="mb-1 text-2xl font-bold leading-9 text-left text-success dark:text-success">Email has been Verified</h2>
					<p className="text-sm leading-6 text-left text-muted-foreground">Your email has been verified and you now have access to your account.</p>
					<div className="flex flex-col mt-6">
						<div className="flex flex-col w-full space-y-4">
							<div className="flex flex-row w-full space-x-4">
								<Link href="/">
									<Button variant="outline" className="w-full">
										Write a review
									</Button>
								</Link>
								<Link href="/" className="w-full">
									<Button className="w-full">
										Post a job <ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
							</div>
							<Button variant="outline" className="w-full">
								Search for a company <ArrowRight className="w-4 h-4 ml-2" />
							</Button>
							{userRoles?.includes("business_user") && (
								<Button className="w-full">
									Go to business dashboard <ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							)}
						</div>
					</div>
					{!userRoles?.includes("business_user") && (
						<div className="flex flex-col mt-10">
							<div className="w-full my-20 border rounded-full dark:border-dark-800 border-dark-300" />
							<h2 className="mb-1 text-2xl font-bold leading-9 text-left ">Now add a business</h2>
							<p className="text-sm leading-6 text-left text-muted-foreground">
								If you own a company you can alternatively add it here, please note that you will have to <b>prove ownership</b> to claim otherwise you can add one anonymously.
							</p>
							<div className="flex flex-col mt-4 space-y-4">
								<Link href="/claim-a-business" passHref>
									<Button className="w-full">
										Claim a business <ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
								<Link href="/add-a-business" passHref>
									<Button variant="outline" className="w-full">
										Submit Business Anonymously <ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
							</div>
						</div>
					)}
				</>
			) : (
				<>
					<h2 className="mb-1 text-2xl font-bold leading-9 text-left text-destructive">Unable to Verify</h2>
					<p className="text-sm leading-6 text-left text-muted-foreground">We were unable to verify your account</p>
					<div className="flex flex-col mt-6">
						<FormProvider {...formMethods}>
							<Form {...formMethods}>
								<form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
									<FormField
										control={formMethods.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input {...field} type="email" placeholder="m@example.com" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button variant="outline" type="submit" disabled={resendLoading}>
										{resendLoading ? "Resending..." : "Resend Verification Email"}
									</Button>
								</form>
							</Form>
						</FormProvider>
					</div>
					{resendSuccess && <p className="mt-2 text-sm leading-6 text-left text-success">Verification email resent successfully.</p>}
					{resendError && <p className="mt-2 text-sm leading-6 text-left text-destructive">{resendError}</p>}

					<div className="flex flex-col mt-10">
						<div className="w-full my-20 border rounded-full dark:border-dark-800 border-dark-300" />
						<h2 className="mb-1 text-2xl font-bold leading-9 text-left ">Now add a business</h2>
						<p className="text-sm leading-6 text-left text-muted-foreground">You can still add a company anonymously if you wish.</p>
						<div className="flex flex-col mt-4 space-y-4">
							<Button variant="outline" className="w-full">
								Submit Business Anonymously <ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default EmailVerified;

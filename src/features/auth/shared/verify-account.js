"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";

import { BiLogoGmail } from "react-icons/bi";
import { FaYahoo } from "react-icons/fa";
import { SiAol } from "react-icons/si";

export default function VerifyAccount() {
	return (
		<div>
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left">Verify Account</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">An email has been sent to your email and will need to be confirmed before the account is avaliable to use.</p>
			<div className="flex flex-col mt-6">
				<div className="space-y-4">
					<p className="text-sm leading-6 text-left text-muted-foreground dark:text-muted-foreground">Click on one of the icons below to open your email provider:</p>
					<div className="flex flex-row space-x-4">
						<a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer">
							<Card className="p-4 transition-all hover:scale-110">
								<BiLogoGmail size={36} className="text-muted-foreground" />
							</Card>
						</a>
						<a href="https://mail.yahoo.com/" target="_blank" rel="noopener noreferrer">
							<Card className="p-4 transition-all hover:scale-110">
								<FaYahoo size={36} className="text-muted-foreground" />
							</Card>
						</a>
						<a href="https://mail.aol.com/" target="_blank" rel="noopener noreferrer">
							<Card className="p-4 transition-all hover:scale-110">
								<SiAol size={36} className="text-muted-foreground" />
							</Card>
						</a>
					</div>
				</div>
			</div>
			<div className="mt-6">
				<p className="text-sm leading-6 text-left text-muted-foreground">If you are unable to find the email to verify your account please head here to resend a link</p>
				<Link href="/email-verified" passHref legacyBehavio>
					<Button className="mt-4">Resend verification email</Button>
				</Link>
			</div>
		</div>
	);
}


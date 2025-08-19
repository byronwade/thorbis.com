// lib/templates/AccountActivation.js
import * as React from "react";
import { Html, Button, Head, Preview, Body, Container, Section, Text } from "@react-email/components";

const AccountActivation = ({ firstName, url }) => (
	<Html lang="en">
		<Head />
		<Preview>Activate Your Account</Preview>
		<Body style={{ fontFamily: "Arial, sans-serif", fontSize: "16px", color: "hsl(var(--foreground))" }}>
			<Container>
				<Section>
					<Text>Hi {firstName},</Text>
					<Text>Thank you for signing up for Thorbis! Please activate your account by clicking the button below:</Text>
					<Button href={url} style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", padding: "10px 20px", textDecoration: "none", borderRadius: "5px" }}>
						Activate Account
					</Button>
					<Text>If you did not sign up for this account, you can safely ignore this email.</Text>
				</Section>
			</Container>
		</Body>
	</Html>
);

export default AccountActivation;

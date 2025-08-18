"use client";
import { Shield } from "react-feather";
import UnifiedHeader from "@components/shared/unified-header";

export default function AuthFormsLayoutClient({ children }) {
	return (
		<div className="min-h-screen bg-background">
			{/* Unified Auth Header */}
			<UnifiedHeader
				dashboardType="auth"
				customTitle="Thorbis"
				backHref="/"
				showCompanySelector={false}
				showSearch={false}
				showCart={false}
			/>

			{/* Main Content Area - Clean and Spacious */}
			<main className="flex flex-col items-center justify-center flex-1 px-4 py-12 sm:py-16">
				{/* Simplified Welcome Section */}
				<div className="text-center mb-12">
					<h1 className="text-2xl sm:text-3xl font-medium text-foreground mb-3">
						Welcome back
					</h1>
					<p className="text-muted-foreground text-sm">
						Sign in to your account to continue
					</p>
				</div>

				{/* Clean Form Container */}
				<div className="w-full max-w-sm">
					{/* Banner will be rendered here by the LoginPage component */}
					<div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8">
						{children}
					</div>
				</div>

				{/* Minimal Trust Indicators */}
				<div className="mt-8 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
					<span className="flex items-center">
						<Shield className="w-3 h-3 mr-1" />
						Secure
					</span>
					<span>•</span>
					<span>Private</span>
					<span>•</span>
					<span>Fast</span>
				</div>
			</main>
		</div>
	);
}

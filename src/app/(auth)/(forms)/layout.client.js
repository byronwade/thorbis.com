"use client";
import { Shield } from "lucide-react";

export default function AuthFormsLayoutClient({ children }) {
	return (
		<div className="min-h-screen bg-neutral-900">
			{/* Simple Header */}
			<header className="border-b border-neutral-800">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<a href="/" className="text-xl font-bold text-white">Thorbis</a>
				</div>
			</header>

			{/* Main Content Area - Clean and Spacious */}
			<main className="flex flex-col items-center justify-center flex-1 px-4 py-12 sm:py-16">
				{/* Clean Form Container */}
				<div className="w-full max-w-7xl">
					{children}
				</div>

				{/* Minimal Trust Indicators */}
				<div className="mt-8 flex items-center justify-center space-x-4 text-xs text-neutral-500">
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

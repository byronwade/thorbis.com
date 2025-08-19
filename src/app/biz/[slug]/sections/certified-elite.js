import React from "react";
import { Award, Shield, CheckCircle } from "lucide-react";

export default function CertifiedElite({ business }) {
	return (
		<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
			<div className="mb-6 sm:mb-8 md:mb-12">
				<h2 className="flex items-center mb-3 text-2xl font-bold sm:text-3xl md:text-4xl text-foreground">
					<Award className="mr-3 w-6 h-6 sm:w-8 sm:h-8 sm:mr-4 text-primary" />
					Thorbis Certified Elite Business
				</h2>
				<div className="w-20 h-1 bg-gradient-to-r rounded-full sm:w-24 sm:h-1.5 from-primary to-primary/50"></div>
			</div>
			<div className="space-y-6 sm:space-y-8">
				<div className="isolate overflow-hidden relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl border shadow-2xl lg:rounded-3xl border-emerald-400/20">
					<svg viewBox="0 0 1024 1024" aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]">
						<circle r={512} cx={512} cy={512} fill="url(#cert-gradient)" fillOpacity="0.3" />
						<defs>
							<radialGradient id="cert-gradient">
								<stop stopColor="hsl(var(--muted-foreground))" />
								<stop offset={1} stopColor="hsl(var(--primary))" />
							</radialGradient>
						</defs>
					</svg>
					<div className="relative px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
							<div className="space-y-6">
								<div className="inline-flex items-center px-4 py-2 text-sm font-bold text-white rounded-full border backdrop-blur-sm bg-white/20 border-white/30">🏆 Elite Recognition</div>
								<div className="space-y-4">
									<h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">Certified Elite Business</h3>
									<p className="text-lg leading-relaxed text-white/90 sm:text-xl">
										This business has achieved our highest certification level - earned by fewer than <span className="font-bold text-warning/90">1 in 125,000 businesses</span>. Like a Michelin star for service excellence.
									</p>
								</div>
								<div className="flex gap-3 items-center p-4 rounded-xl border backdrop-blur-sm bg-white/10 border-white/20">
									<div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-emerald-400 rounded-full">
										<Shield className="w-5 h-5 text-emerald-900" />
									</div>
									<div>
										<div className="font-semibold text-white">Protected by Performance Guarantee</div>
										<div className="text-sm text-white/80">100% satisfaction backed by our elite standards</div>
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 lg:gap-6">
								<div className="p-4 text-center rounded-xl border backdrop-blur-sm bg-white/10 border-white/20 lg:p-6">
									<div className="text-2xl font-bold text-white lg:text-3xl">0.0008%</div>
									<div className="text-sm text-white/80">Acceptance Rate</div>
									<div className="mt-1 text-xs text-emerald-200">Rarer than Harvard</div>
								</div>
								<div className="p-4 text-center rounded-xl border backdrop-blur-sm bg-white/10 border-white/20 lg:p-6">
									<div className="text-2xl font-bold text-white lg:text-3xl">6-9</div>
									<div className="text-sm text-white/80">Month Process</div>
									<div className="mt-1 text-xs text-cyan-200">Rigorous vetting</div>
								</div>
								<div className="p-4 text-center rounded-xl border backdrop-blur-sm bg-white/10 border-white/20 lg:p-6">
									<div className="text-2xl font-bold text-white lg:text-3xl">400+</div>
									<div className="text-sm text-white/80">Customer Interviews</div>
									<div className="mt-1 text-xs text-teal-200">Independent verification</div>
								</div>
								<div className="p-4 text-center rounded-xl border backdrop-blur-sm bg-white/10 border-white/20 lg:p-6">
									<div className="text-2xl font-bold text-white lg:text-3xl">100%</div>
									<div className="text-sm text-white/80">Satisfaction</div>
									<div className="mt-1 text-xs text-warning/80">Performance guarantee</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div className="p-6 rounded-xl border bg-card border-border sm:p-8">
						<div className="flex items-start space-x-4">
							<div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-emerald-100 rounded-full dark:bg-emerald-900/30">
								<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div className="space-y-3">
								<h3 className="text-lg font-semibold text-foreground">What This Means for You</h3>
								<div className="space-y-2">
									{["Guaranteed highest quality workmanship", "Verified financial stability and licensing", "Independently confirmed customer satisfaction", "Ongoing performance monitoring", "Comprehensive performance guarantee", "Priority dispute resolution services"].map((benefit, index) => (
										<div key={index} className="flex items-start space-x-2">
											<CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-emerald-500 dark:text-emerald-400" />
											<span className="text-sm text-muted-foreground">{benefit}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className="p-6 rounded-xl border bg-card border-border sm:p-8">
						<div className="flex items-start space-x-4">
							<div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-primary/10 rounded-full dark:bg-primary/30">
								<Award className="w-5 h-5 text-primary dark:text-primary" />
							</div>
							<div className="space-y-3">
								<h3 className="text-lg font-semibold text-foreground">The Elite Vetting Process</h3>
								<div className="space-y-2">
									{["Comprehensive 400+ customer interviews", "Independent financial stability assessment", "Rigorous background and licensing verification", "Technical expertise evaluation", "On-site inspection and equipment review", "Ongoing annual re-certification requirements"].map((requirement, index) => (
										<div key={index} className="flex items-start space-x-2">
											<div className="flex flex-shrink-0 justify-center items-center mt-0.5 w-4 h-4 rounded-full bg-primary/20 dark:bg-primary/40/20">
												<div className="w-2 h-2 bg-primary rounded-full dark:bg-primary/40"></div>
											</div>
											<span className="text-sm text-muted-foreground">{requirement}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

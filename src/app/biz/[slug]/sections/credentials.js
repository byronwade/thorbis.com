import React from "react";
import { Badge } from "@components/ui/badge";
import { Shield, Verified, Award, CheckCircle } from "lucide-react";

export default function Credentials({ business }) {
	// Add defensive checks to prevent undefined errors
	if (!business) {
		return (
			<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
				<div className="mb-6 sm:mb-8 md:mb-12">
					<h2 className="flex items-center mb-3 text-2xl font-bold sm:text-3xl md:text-4xl text-foreground">
						<Shield className="w-6 h-6 mr-3 sm:w-8 sm:h-8 sm:mr-4 text-primary" />
						Credentials, Licensing & Recognition
					</h2>
					<div className="w-20 h-1 bg-gradient-to-r rounded-full sm:w-24 sm:h-1.5 from-primary to-primary/50"></div>
				</div>
				<div className="p-8 text-center text-muted-foreground">Business information is loading...</div>
			</section>
		);
	}

	return (
		<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
			<div className="mb-6 sm:mb-8 md:mb-12">
				<h2 className="flex items-center mb-3 text-2xl font-bold sm:text-3xl md:text-4xl text-foreground">
					<Shield className="w-6 h-6 mr-3 sm:w-8 sm:h-8 sm:mr-4 text-primary" />
					Credentials, Licensing & Recognition
				</h2>
				<div className="w-20 h-1 bg-gradient-to-r rounded-full sm:w-24 sm:h-1.5 from-primary to-primary/50"></div>
			</div>

			<div className="space-y-8">
				{/* Verified License */}
				{business?.license?.verified && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Certifications & Licenses</h3>
						<div className="p-6 border rounded-xl bg-card/30 border-border">
							<div className="flex items-start space-x-3">
								<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-primary/10">
									<Shield className="w-4 h-4 text-primary" />
								</div>
								<div className="space-y-2">
									<h4 className="flex items-center font-semibold text-foreground">
										Professional License
										<Badge variant="secondary" className="ml-2 text-primary bg-primary/10 border-primary/20">
											<Verified className="w-3 h-3 mr-1" />
											Verified
										</Badge>
									</h4>
									<div className="space-y-1 text-sm">
										<p className="text-muted-foreground">
											License Number: <span className="font-medium text-foreground">{business.license.number}</span>
										</p>
										<p className="text-muted-foreground">
											Issued: <span className="font-medium text-foreground">{business.license.issued}</span>
										</p>
										<p className="text-muted-foreground">
											Expires: <span className="font-medium text-foreground">{business.license.expires}</span>
										</p>
										<p className="text-muted-foreground">
											State: <span className="font-medium text-foreground">{business.license.state}</span>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Insurance */}
				{business.insurance && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Insurance & Bonding</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="p-4 border rounded-lg bg-card/30 border-border">
								<div className="flex items-start space-x-3">
									<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-success/10">
										<Shield className="w-4 h-4 text-success" />
									</div>
									<div className="space-y-1">
										<h4 className="font-medium text-foreground">General Liability Insurance</h4>
										<p className="text-sm text-muted-foreground">Coverage: ${business.insurance.generalLiability}</p>
										<p className="text-sm text-muted-foreground">Provider: {business.insurance.provider}</p>
									</div>
								</div>
							</div>
							<div className="p-4 border rounded-lg bg-card/30 border-border">
								<div className="flex items-start space-x-3">
									<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-primary/10">
										<Shield className="w-4 h-4 text-primary" />
									</div>
									<div className="space-y-1">
										<h4 className="font-medium text-foreground">Workers Compensation</h4>
										<p className="text-sm text-muted-foreground">Coverage: ${business.insurance.workersComp}</p>
										<p className="text-sm text-muted-foreground">Provider: {business.insurance.provider}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Certifications */}
				{business.certifications && business.certifications.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Professional Certifications</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{business.certifications.map((cert, index) => (
								<div key={index} className="p-4 border rounded-lg bg-card/30 border-border">
									<div className="flex items-start space-x-3">
										<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10">
											<Award className="w-4 h-4 text-purple-400" />
										</div>
										<div className="space-y-1">
											<h4 className="font-medium text-foreground">{cert.name}</h4>
											<p className="text-sm text-muted-foreground">Issued: {cert.issued}</p>
											{cert.expires && <p className="text-sm text-muted-foreground">Expires: {cert.expires}</p>}
											{cert.issuingBody && <p className="text-sm text-muted-foreground">By: {cert.issuingBody}</p>}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Awards & Recognition */}
				{business.awards && business.awards.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Awards & Recognition</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{business.awards.map((award, index) => (
								<div key={index} className="p-4 border rounded-lg bg-card/30 border-border">
									<div className="flex items-start space-x-3">
										<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-warning/10">
											<Award className="w-4 h-4 text-warning" />
										</div>
										<div className="space-y-1">
											<h4 className="font-medium text-foreground">{award.name}</h4>
											<p className="text-sm text-muted-foreground">{award.year}</p>
											{award.issuingBody && <p className="text-sm text-muted-foreground">By: {award.issuingBody}</p>}
											{award.description && <p className="text-sm text-muted-foreground">{award.description}</p>}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Professional Memberships */}
				{business.memberships && business.memberships.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Professional Memberships</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{business.memberships.map((membership, index) => (
								<div key={index} className="p-4 border rounded-lg bg-card/30 border-border">
									<div className="flex items-start space-x-3">
										<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10">
											<CheckCircle className="w-4 h-4 text-indigo-400" />
										</div>
										<div className="space-y-1">
											<h4 className="font-medium text-foreground">{membership.organization}</h4>
											<p className="text-sm text-muted-foreground">Member since: {membership.since}</p>
											{membership.role && <p className="text-sm text-muted-foreground">Role: {membership.role}</p>}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

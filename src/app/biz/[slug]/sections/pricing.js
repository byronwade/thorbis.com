import React from "react";
import { Badge } from "@components/ui/badge";
import { DollarSign, Calculator, CheckCircle, CreditCard } from "lucide-react";

export default function Pricing({ business }) {
	return (
		<section className="scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-32">
			<div className="mb-8">
				<h2 className="flex items-center mb-2 text-2xl font-bold text-foreground">
					<DollarSign className="w-6 h-6 mr-3 text-primary" />
					Service Information & Policies
				</h2>
				<div className="w-20 h-1 rounded-full bg-gradient-to-r from-primary to-primary/50"></div>
			</div>

			<div className="space-y-8">
				{/* Service Approach & Pricing Philosophy */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground">Service Approach & Pricing</h3>
					<div className="p-6 border rounded-lg bg-card/30 border-border">
						<div className="space-y-6">
							{/* Pricing Philosophy */}
							<div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
								<div className="flex items-start space-x-3">
									<Calculator className="flex-shrink-0 w-5 h-5 mt-1 text-primary" />
									<div>
										<h4 className="font-medium text-foreground">{business.pricing?.approach || "Custom Service Pricing"}</h4>
										<p className="mt-1 text-sm text-muted-foreground">{business.pricing?.description || "Each project is unique. Contact us for a personalized quote based on your specific needs and requirements."}</p>
									</div>
								</div>
							</div>

							{/* Service Rates */}
							{business.pricing?.hourlyRate && (
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="p-4 border rounded-lg bg-card/20 border-border">
										<div className="text-center">
											<p className="text-sm text-muted-foreground">Standard Rate</p>
											<p className="text-lg font-bold text-foreground">{business.pricing.hourlyRate}</p>
										</div>
									</div>
									{business.pricing?.emergencyRate && (
										<div className="p-4 border rounded-lg bg-red-50/50 border-red-200/50 dark:bg-destructive/20 dark:border-red-900/30">
											<div className="text-center">
												<p className="text-sm text-destructive dark:text-destructive">Emergency Rate</p>
												<p className="text-lg font-bold text-destructive dark:text-destructive/90">{business.pricing.emergencyRate}</p>
											</div>
										</div>
									)}
									{business.pricing?.minimumCharge && (
										<div className="p-4 border rounded-lg bg-card/20 border-border">
											<div className="text-center">
												<p className="text-sm text-muted-foreground">Minimum Charge</p>
												<p className="text-lg font-bold text-foreground">{business.pricing.minimumCharge}</p>
											</div>
										</div>
									)}
								</div>
							)}

							{/* Free Services */}
							{business.pricing?.freeServices && business.pricing.freeServices.length > 0 ? (
								<div>
									<h5 className="mb-3 font-medium text-foreground">Complimentary Services</h5>
									<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
										{business.pricing.freeServices.map((service, index) => (
											<div key={index} className="flex items-start p-3 space-x-3 border rounded-lg bg-success/20 border-success/30">
												<CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-success" />
												<div>
													<p className="text-sm font-medium text-foreground">{service.service}</p>
													<p className="text-xs text-muted-foreground">{service.description}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							) : (
								<div>
									<h5 className="mb-3 font-medium text-foreground">Complimentary Services</h5>
									<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
										<div className="flex items-start p-3 space-x-3 border rounded-lg bg-success/20 border-success/30">
											<CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-success" />
											<div>
												<p className="text-sm font-medium text-foreground">Initial Consultation</p>
												<p className="text-xs text-muted-foreground">No-obligation assessment</p>
											</div>
										</div>
										<div className="flex items-start p-3 space-x-3 border rounded-lg bg-success/20 border-success/30">
											<CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-success" />
											<div>
												<p className="text-sm font-medium text-foreground">Written Estimates</p>
												<p className="text-xs text-muted-foreground">Detailed project quotes</p>
											</div>
										</div>
										<div className="flex items-start p-3 space-x-3 border rounded-lg bg-success/20 border-success/30">
											<CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-success" />
											<div>
												<p className="text-sm font-medium text-foreground">Basic Diagnostics</p>
												<p className="text-xs text-muted-foreground">Problem identification</p>
											</div>
										</div>
										<div className="flex items-start p-3 space-x-3 border rounded-lg bg-success/20 border-success/30">
											<CheckCircle className="flex-shrink-0 mt-0.5 w-4 h-4 text-success" />
											<div>
												<p className="text-sm font-medium text-foreground">Follow-up Inspection</p>
												<p className="text-xs text-muted-foreground">30-day post-service check</p>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Available Discounts */}
							{business.pricing?.discounts && business.pricing.discounts.length > 0 ? (
								<div>
									<h5 className="mb-3 font-medium text-foreground">Available Discounts</h5>
									<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
										{business.pricing.discounts.map((discount, index) => (
											<div key={index} className="flex items-center p-3 space-x-3 border rounded-lg bg-primary/20 border-primary/30">
												<Badge variant="secondary" className="text-primary bg-primary/10 dark:text-primary/90 dark:bg-primary/50">
													{discount.amount}
												</Badge>
												<div className="flex-1">
													<p className="text-sm font-medium text-foreground">{discount.type}</p>
													<p className="text-xs text-muted-foreground">{discount.description}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							) : (
								<div>
									<h5 className="mb-3 font-medium text-foreground">Available Discounts</h5>
									<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
										<div className="flex items-center p-3 space-x-3 border rounded-lg bg-primary/20 border-primary/30">
											<Badge variant="secondary" className="text-primary bg-primary/10 dark:text-primary/90 dark:bg-primary/50">
												10%
											</Badge>
											<div className="flex-1">
												<p className="text-sm font-medium text-foreground">Senior Discount</p>
												<p className="text-xs text-muted-foreground">For customers 65+ years old</p>
											</div>
										</div>
										<div className="flex items-center p-3 space-x-3 border rounded-lg bg-primary/20 border-primary/30">
											<Badge variant="secondary" className="text-primary bg-primary/10 dark:text-primary/90 dark:bg-primary/50">
												15%
											</Badge>
											<div className="flex-1">
												<p className="text-sm font-medium text-foreground">Military Discount</p>
												<p className="text-xs text-muted-foreground">Active duty and veterans</p>
											</div>
										</div>
										<div className="flex items-center p-3 space-x-3 border rounded-lg bg-primary/20 border-primary/30">
											<Badge variant="secondary" className="text-primary bg-primary/10 dark:text-primary/90 dark:bg-primary/50">
												5%
											</Badge>
											<div className="flex-1">
												<p className="text-sm font-medium text-foreground">First-Time Customer</p>
												<p className="text-xs text-muted-foreground">New customers only</p>
											</div>
										</div>
										<div className="flex items-center p-3 space-x-3 border rounded-lg bg-primary/20 border-primary/30">
											<Badge variant="secondary" className="text-primary bg-primary/10 dark:text-primary/90 dark:bg-primary/50">
												10%
											</Badge>
											<div className="flex-1">
												<p className="text-sm font-medium text-foreground">Repeat Customer</p>
												<p className="text-xs text-muted-foreground">Return customers</p>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Payment Terms */}
							{business.pricing?.paymentTerms && (
								<div className="p-4 border rounded-lg bg-yellow-50/50 border-yellow-200/50 dark:bg-warning/20 dark:border-yellow-900/30">
									<h5 className="mb-2 font-medium text-foreground">Payment Terms</h5>
									<div className="space-y-1 text-sm text-muted-foreground">
										<p>• {business.pricing.paymentTerms.deposit}</p>
										<p>• {business.pricing.paymentTerms.completion}</p>
										<p>• {business.pricing.paymentTerms.largejobs}</p>
									</div>
								</div>
							)}

							{/* Financing Options */}
							{business.pricing?.financing?.available && (
								<div className="p-4 border rounded-lg bg-muted/20 border-border/30">
									<div className="flex items-start space-x-3">
										<CreditCard className="flex-shrink-0 w-5 h-5 mt-1 text-muted-foreground" />
										<div>
											<h5 className="font-medium text-foreground">Financing Available</h5>
											<div className="mt-2 space-y-1 text-sm text-muted-foreground">
												<p>• Provider: {business.pricing.financing.provider}</p>
												<p>• Minimum Amount: {business.pricing.financing.minAmount}</p>
												<p>• Terms: {business.pricing.financing.terms}</p>
												<p className="text-xs italic">• {business.pricing.financing.approval}</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Payment Methods */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground">Accepted Payment Methods</h3>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
						{business.paymentMethods && business.paymentMethods.length > 0
							? business.paymentMethods.map((method, index) => (
									<div key={index} className="flex items-start p-4 space-x-3 rounded-lg border bg-card/30 border-border">
										<CreditCard className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
										<div>
											<p className="text-sm font-medium text-foreground">{method.type}</p>
											<p className="text-xs text-muted-foreground">{method.description}</p>
										</div>
									</div>
							  ))
							: [
									{ type: "Cash", description: "Exact change preferred" },
									{ type: "Check", description: "Personal and business checks" },
									{ type: "Credit Cards", description: "Visa, MasterCard, American Express" },
									{ type: "Debit Cards", description: "All major debit cards accepted" },
									{ type: "Digital Payments", description: "Venmo, PayPal, Zelle" },
									{ type: "Financing", description: "Available through approved lenders" },
							  ].map((method, index) => (
									<div key={index} className="flex items-start p-4 space-x-3 rounded-lg border bg-card/30 border-border">
										<CreditCard className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
										<div>
											<p className="text-sm font-medium text-foreground">{method.type}</p>
											<p className="text-xs text-muted-foreground">{method.description}</p>
										</div>
									</div>
							  ))}
					</div>
				</div>
			</div>
		</section>
	);
}

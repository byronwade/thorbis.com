import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Alert, AlertDescription } from "@components/ui/alert";
import { CheckCircle, ExternalLink, Settings, Users, Globe, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import Link from "next/link";

export default function DirectorySuccess() {
	const { watch } = useFormContext();

	// Get form values to display in success message
	const directoryName = watch("directoryInfo.directoryName");
	const subdomain = watch("directoryCustomization.subdomain");
	const city = watch("directoryLocation.city");
	const state = watch("directoryLocation.state");
	const businessCategories = watch("directoryCustomization.businessCategories") || [];

	const directoryUrl = `https://${subdomain || "your-directory"}.localhub.com`;

	return (
		<>
			<div className="space-y-6 text-center">
				{/* Success Header */}
				<div className="space-y-4">
					<div className="flex justify-center">
											<div className="w-20 h-20 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center">
						<CheckCircle className="w-10 h-10 text-primary" />
					</div>
					</div>
					<div>
						<h2 className="text-3xl font-bold text-primary mb-2">🎉 Directory Created Successfully!</h2>
						<p className="text-lg text-muted-foreground">
							Your LocalHub directory <strong>{directoryName}</strong> is now live and ready for businesses to join.
						</p>
					</div>
				</div>

				{/* Directory Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-primary" />
							Directory Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
							<div>
								<h4 className="font-semibold mb-2">Directory Info</h4>
								<div className="space-y-1 text-sm text-muted-foreground">
									<p>
										<strong>Name:</strong> {directoryName}
									</p>
									<p>
										<strong>Location:</strong> {city}, {state}
									</p>
									<p>
										<strong>Categories:</strong> {businessCategories.length} selected
									</p>
								</div>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Live URL</h4>
								<div className="space-y-2">
									<div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
										<Globe className="w-4 h-4" />
										<code className="text-xs">{directoryUrl}</code>
									</div>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<a href={directoryUrl} target="_blank" rel="noopener noreferrer">
											<ExternalLink className="w-4 h-4 mr-2" />
											Visit Your Directory
										</a>
									</Button>
								</div>
							</div>
						</div>

						{/* Selected Categories Preview */}
						{businessCategories.length > 0 && (
							<div className="text-left">
								<h4 className="font-semibold mb-2">Active Categories</h4>
								<div className="flex flex-wrap gap-2">
									{businessCategories.slice(0, 6).map((category) => (
										<Badge key={category} variant="secondary">
											{category}
										</Badge>
									))}
									{businessCategories.length > 6 && <Badge variant="outline">+{businessCategories.length - 6} more</Badge>}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Next Steps */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ArrowRight className="w-5 h-5 text-primary" />
							What&apos;s Next?
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
							<div className="p-4 border rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<Users className="w-5 h-5 text-primary" />
									<h4 className="font-semibold">Invite Businesses</h4>
								</div>
								<p className="text-sm text-muted-foreground mb-3">Start reaching out to local businesses to join your directory.</p>
								<Button size="sm" variant="outline" className="w-full" asChild>
									<Link href="/dashboard/localhub/businesses">Manage Businesses</Link>
								</Button>
							</div>

							<div className="p-4 border rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<Settings className="w-5 h-5 text-primary" />
									<h4 className="font-semibold">Customize Further</h4>
								</div>
								<p className="text-sm text-muted-foreground mb-3">Fine-tune your directory&apos;s appearance and settings.</p>
								<Button size="sm" variant="outline" className="w-full" asChild>
									<Link href="/dashboard/localhub/customization">Customization</Link>
								</Button>
							</div>

							<div className="p-4 border rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<Globe className="w-5 h-5 text-primary" />
									<h4 className="font-semibold">Domain Setup</h4>
								</div>
								<p className="text-sm text-muted-foreground mb-3">Configure custom domain or manage your subdomain settings.</p>
								<Button size="sm" variant="outline" className="w-full" asChild>
									<Link href="/dashboard/localhub/domains">Domain Settings</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Success Tips */}
				<Alert className="text-left">
					<CheckCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>Pro Tips for Success:</strong>
						<ul className="mt-2 space-y-1 text-sm">
							<li>• Reach out to 10-15 local businesses to join your directory in the first week</li>
							<li>• Share your directory on social media and local community groups</li>
							<li>• Consider offering launch promotions for early business subscribers</li>
							<li>• Engage with your local business community and chambers of commerce</li>
						</ul>
					</AlertDescription>
				</Alert>

				{/* CTA Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
					<Button size="lg" asChild>
						<Link href="/dashboard/localhub">
							<ArrowRight className="w-4 h-4 mr-2" />
							Go to Dashboard
						</Link>
					</Button>
					<Button size="lg" variant="outline" asChild>
						<a href={directoryUrl} target="_blank" rel="noopener noreferrer">
							<ExternalLink className="w-4 h-4 mr-2" />
							View Live Directory
						</a>
					</Button>
				</div>
			</div>
		</>
	);
}

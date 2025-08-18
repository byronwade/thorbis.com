import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Shield, CheckCircle, Clock, XCircle, Download, Upload } from "lucide-react";

export default function VerificationsSection({ profile, setProfile, isEditing, setShowVerificationDialog, setSelectedVerification }) {
	const getVerificationIcon = (status) => {
		switch (status) {
			case "verified":
				return <CheckCircle className="w-5 h-5 text-green-500" />;
			case "pending":
				return <Clock className="w-5 h-5 text-yellow-500" />;
			default:
				return <XCircle className="w-5 h-5 text-red-500" />;
		}
	};

	const getVerificationStatus = (verification) => {
		switch (verification.status) {
			case "verified":
				return "Verified";
			case "pending":
				return "Pending Review";
			default:
				return "Not Submitted";
		}
	};

	const getVerificationColor = (verification) => {
		switch (verification.status) {
			case "verified":
				return "text-green-600";
			case "pending":
				return "text-yellow-600";
			default:
				return "text-red-600";
		}
	};

	const getVerificationBadgeVariant = (verification) => {
		switch (verification.status) {
			case "verified":
				return "default";
			case "pending":
				return "secondary";
			default:
				return "destructive";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Shield className="w-5 h-5" />
					<span>Verifications & Certifications</span>
				</CardTitle>
				<CardDescription>Verified credentials help build trust with customers</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{profile.verifications.map((verification, index) => (
						<div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
							<div className="flex items-center space-x-3">
								{getVerificationIcon(verification.status)}
								<div>
									<h4 className="font-medium text-foreground">{verification.title}</h4>
									<p className={`text-sm ${getVerificationColor(verification)}`}>
										{getVerificationStatus(verification)}
										{verification.verifiedDate && ` • ${verification.verifiedDate}`}
									</p>
									{verification.number && <p className="text-xs text-muted-foreground">#{verification.number}</p>}
								</div>
							</div>
							<div className="flex items-center space-x-2">
								{verification.status === "verified" ? (
									<>
										<Button size="sm" variant="outline">
											<Download className="w-4 h-4 mr-1" />
											View
										</Button>
										<Badge variant={getVerificationBadgeVariant(verification)} className="text-green-600">
											<CheckCircle className="w-3 h-3 mr-1" />
											Verified
										</Badge>
									</>
								) : (
									<Button
										size="sm"
										onClick={() => {
											setSelectedVerification({ index, verification });
											setShowVerificationDialog(true);
										}}
									>
										<Upload className="w-4 h-4 mr-1" />
										Upload Document
									</Button>
								)}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

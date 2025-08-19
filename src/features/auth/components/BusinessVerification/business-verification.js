import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Badge } from "@components/ui/badge";
import { CheckCircle, Upload, FileText, Shield, Building2, User, X, File } from "lucide-react";
import { useDragDrop } from "@hooks/use-drag-drop";

export default function BusinessVerification() {
	const { control, watch, setValue } = useFormContext();
	const fileInputRefs = useRef({});

	// Watch form values for validation feedback
	const ein = watch("businessVerification.ein");
	const registrationDocument = watch("businessVerification.registrationDocument");
	const businessLicense = watch("businessVerification.businessLicense");
	const proofOfOwnership = watch("businessVerification.proofOfOwnership");
	const ownerID = watch("businessVerification.ownerID");

	const handleFileSelect = (files, fieldName) => {
		setValue(`businessVerification.${fieldName}`, files);
	};

	const removeFile = (fieldName) => {
		setValue(`businessVerification.${fieldName}`, []);
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const FileUploadField = ({ fieldName, label, description, icon: Icon, required = true }) => {
		const files = watch(`businessVerification.${fieldName}`);
		const hasFiles = files && files.length > 0;

		// Initialize drag and drop for this field
		const { isDraggingOver, dragHandlers } = useDragDrop((files) => handleFileSelect(files, fieldName), ["image/", "application/pdf"]);

		return (
			<FormField
				control={control}
				name={`businessVerification.${fieldName}`}
				render={({ field, fieldState }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<Icon className="w-4 h-4" />
							{label} {required && <span className="text-destructive">*</span>}
						</FormLabel>
						<FormDescription>{description}</FormDescription>

						{!hasFiles ? (
							<Card className={`border-2 border-dashed transition-colors ${isDraggingOver ? "border-primary bg-blue-50/50 dark:bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"}`} {...dragHandlers}>
								<CardContent className="p-6">
									<div className="text-center space-y-3">
										<Upload className="w-8 h-8 mx-auto text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">
												{isDraggingOver ? (
													"Drop files here"
												) : (
													<>
														Drag and drop files here, or{" "}
														<Button variant="link" className="p-0 h-auto text-primary" onClick={() => fileInputRefs.current[fieldName]?.click()}>
															browse
														</Button>
													</>
												)}
											</p>
											<p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
										</div>
									</div>
								</CardContent>
							</Card>
						) : (
							<div className="space-y-2">
								{files.map((file, index) => (
									<div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
										<div className="flex items-center gap-3">
											<File className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium">{file.name}</p>
												<p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
											</div>
										</div>
										<Button variant="ghost" size="sm" onClick={() => removeFile(fieldName)} className="text-muted-foreground hover:text-destructive">
											<X className="w-4 h-4" />
										</Button>
									</div>
								))}
							</div>
						)}

						<input ref={(el) => (fileInputRefs.current[fieldName] = el)} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileSelect(Array.from(e.target.files), fieldName)} />
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	};

	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<h2 className="text-2xl font-bold text-foreground dark:text-white">Business Verification</h2>
				<p className="text-muted-foreground dark:text-muted-foreground">Please provide the following documents to verify your business. This helps us maintain the quality of our platform.</p>
			</div>

			<Alert>
				<Shield className="h-4 w-4" />
				<AlertDescription>All documents are encrypted and stored securely. We only use this information for verification purposes.</AlertDescription>
			</Alert>

			<div className="grid gap-6 md:grid-cols-2">
				<FormField
					control={control}
					name="businessVerification.ein"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								<Building2 className="w-4 h-4" />
								EIN (Employer Identification Number)
							</FormLabel>
							<FormDescription>Your 9-digit Employer Identification Number</FormDescription>
							<FormControl>
								<Input {...field} placeholder="12-3456789" className={fieldState.error ? "border-red-500" : ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FileUploadField fieldName="registrationDocument" label="Business Registration" description="Articles of incorporation, business license, or similar registration document" icon={FileText} />

				<FileUploadField fieldName="businessLicense" label="Business License" description="Current business license or permit" icon={FileText} />

				<FileUploadField fieldName="proofOfOwnership" label="Proof of Ownership" description="Document proving business ownership (e.g., operating agreement, partnership agreement)" icon={FileText} />

				<FileUploadField fieldName="ownerID" label="Owner Identification" description="Government-issued ID of the business owner" icon={User} />
			</div>

			<div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-primary/30 rounded-lg">
				<div className="flex items-center gap-3">
					<CheckCircle className="w-5 h-5 text-primary dark:text-primary" />
					<div>
						<p className="font-medium text-primary dark:text-primary/70">Verification Status</p>
						<p className="text-sm text-primary dark:text-primary/90">Documents will be reviewed within 2-3 business days</p>
					</div>
				</div>
				<Badge variant="secondary" className="bg-primary/10 dark:bg-primary text-primary dark:text-primary/80">
					Pending Review
				</Badge>
			</div>
		</div>
	);
}

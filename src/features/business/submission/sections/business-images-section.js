/**
 * BusinessImagesSection Component
 * Handles business image uploads and management
 * Extracted from BusinessSubmissionForm for better modularity
 */

"use client";

import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Upload, X, Camera, AlertCircle } from "lucide-react";

const BusinessImagesSection = ({ uploadedImages, handleImageUpload, removeImage, constants }) => {
	const fileInputRef = useRef(null);
	const { UPLOAD_CONSTRAINTS } = constants;

	const handleFileSelect = () => {
		fileInputRef.current?.click();
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Camera className="h-5 w-5" />
					Business Images
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Upload Area */}
				<div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-border transition-colors cursor-pointer" onClick={handleFileSelect}>
					<Upload className="mx-auto h-12 w-12 text-muted-foreground" />
					<h3 className="mt-4 text-lg font-medium">Upload Business Photos</h3>
					<p className="mt-2 text-sm text-muted-foreground">Drag and drop your images here, or click to browse</p>
					<Button variant="outline" className="mt-4" onClick={handleFileSelect}>
						<Upload className="h-4 w-4 mr-2" />
						Choose Files
					</Button>
				</div>

				{/* Hidden File Input */}
				<input ref={fileInputRef} type="file" accept={UPLOAD_CONSTRAINTS.ALLOWED_TYPES.join(",")} multiple onChange={handleImageUpload} className="hidden" />

				{/* Upload Guidelines */}
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Upload up to {UPLOAD_CONSTRAINTS.MAX_FILES} high-quality photos of your business. Supported formats: JPG, PNG, WebP. Maximum size: {formatFileSize(UPLOAD_CONSTRAINTS.MAX_FILE_SIZE)} per file.
					</AlertDescription>
				</Alert>

				{/* Uploaded Images Preview */}
				{uploadedImages.length > 0 && (
					<div>
						<h4 className="font-medium mb-3">
							Uploaded Images ({uploadedImages.length}/{UPLOAD_CONSTRAINTS.MAX_FILES})
						</h4>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{uploadedImages.map((image, index) => (
								<div key={index} className="relative group">
									<div className="aspect-square rounded-lg overflow-hidden bg-muted">
										<img src={URL.createObjectURL(image)} alt={`Business image ${index + 1}`} className="w-full h-full object-cover" />
									</div>

									{/* Image Info */}
									<div className="mt-2 text-xs text-muted-foreground">
										<p className="truncate">{image.name}</p>
										<p>{formatFileSize(image.size)}</p>
									</div>

									{/* Remove Button */}
									<Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Upload Tips */}
				<div className="bg-primary/10 rounded-lg p-4">
					<h4 className="font-medium text-primary mb-2">Photo Tips</h4>
					<ul className="text-sm text-primary/80 space-y-1">
						<li>• Include photos of your storefront, interior, and products/services</li>
						<li>• Use good lighting and avoid blurry images</li>
						<li>• Show your business at its best - clean and well-organized</li>
						<li>• Include team photos to add a personal touch</li>
						<li>• Make sure photos accurately represent your business</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
};

export default BusinessImagesSection;

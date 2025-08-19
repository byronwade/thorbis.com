"use client";
import React, { useState, useRef } from "react";
import { Camera, Video, XCircle } from "react-feather";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { useDragDrop } from "@hooks/use-drag-drop";

const AddPostForm = ({ onSubmit }) => {
	const [content, setContent] = useState("");
	const [images, setImages] = useState([]);
	const [video, setVideo] = useState(null);

	const imageInputRef = useRef(null);
	const videoInputRef = useRef(null);

	const handleChange = (event) => {
		setContent(event.target.value);
	};

	const handleImageUpload = (files) => {
		if (files.length > 6) {
			alert("You can only upload up to 6 images.");
			return;
		}
		const imagePreviews = files.map((file) => URL.createObjectURL(file));
		setImages(imagePreviews);
	};

	const handleVideoUpload = (files) => {
		const file = files[0];
		if (file) {
			setVideo(URL.createObjectURL(file));
		}
	};

	// Initialize drag and drop for images
	const { isDraggingOver: isDraggingImages, dragHandlers: imageDragHandlers } = useDragDrop(handleImageUpload, ["image/"]);

	// Initialize drag and drop for video
	const { isDraggingOver: isDraggingVideo, dragHandlers: videoDragHandlers } = useDragDrop(handleVideoUpload, ["video/"]);

	const handleSubmit = (event) => {
		event.preventDefault();
		if (content.trim() || images.length || video) {
			onSubmit({ content, images, video });
			setContent(""); // Clear the textarea after submission
			setImages([]); // Clear image previews
			setVideo(null); // Clear video preview
		}
	};

	const triggerImageUpload = () => {
		if (imageInputRef.current) {
			imageInputRef.current.click();
		}
	};

	const triggerVideoUpload = () => {
		if (videoInputRef.current) {
			videoInputRef.current.click();
		}
	};

	const removeImage = (index) => {
		setImages(images.filter((_, i) => i !== index));
	};

	const removeVideo = () => {
		setVideo(null);
	};

	return (
		<Card className="w-full p-4">
			<form onSubmit={handleSubmit}>
				<div className="flex items-start">
					<Image width={100} height={100} className="w-12 h-12 mr-3 rounded-full" src="/placeholder.svg" alt="User avatar" />
					<div className="w-full">
						<textarea
							className={`w-full h-32 p-2 border rounded-md resize-none dark:bg-muted dark:border-border dark:text-white transition-all duration-200 ${isDraggingImages || isDraggingVideo ? "border-dashed border-primary bg-blue-50/50 dark:bg-primary/10" : "border-border dark:border-border"}`}
							placeholder={isDraggingImages ? "Drop images here..." : isDraggingVideo ? "Drop video here..." : "What's on your mind?"}
							value={content}
							onChange={handleChange}
							{...imageDragHandlers}
							{...videoDragHandlers}
						/>

						{/* Image Previews */}
						{images.length > 0 && (
							<div className="mt-3 grid grid-cols-3 gap-2">
								{images.map((image, index) => (
									<div key={index} className="relative aspect-square">
										<Image src={image} alt={`Preview ${index + 1}`} width={400} height={400} className="w-full h-full object-cover rounded-md" />
										<button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive transition-colors">
											<XCircle className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						)}

						{/* Video Preview */}
						{video && (
							<div className="mt-3 relative">
								<video src={video} className="w-full max-h-64 object-cover rounded-md" controls />
								<button type="button" onClick={removeVideo} className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive transition-colors">
									<XCircle className="w-4 h-4" />
								</button>
							</div>
						)}

						<div className="flex items-center justify-between mt-2">
							<div className="flex items-center space-x-2">
								{/* Upload Images Button */}
								<Button className="flex items-center" onClick={triggerImageUpload}>
									<Camera className="w-4 h-4 mr-2" />
									Upload Images
								</Button>
								<input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(Array.from(e.target.files))} />

								{/* Upload Video Button */}
								<Button className="flex items-center" onClick={triggerVideoUpload}>
									<Video className="w-4 h-4 mr-2" />
									Upload Video
								</Button>
								<input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoUpload(Array.from(e.target.files))} />
							</div>
							{/* Post Button */}
							<Button type="submit" className="text-white bg-primary hover:bg-primary dark:bg-primary dark:hover:bg-primary">
								Post
							</Button>
						</div>
					</div>
				</div>
			</form>
		</Card>
	);
};

export default AddPostForm;

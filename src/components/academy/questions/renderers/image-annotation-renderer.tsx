"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, MapPin, Plus, Trash2 } from "lucide-react";
import { ImageAnnotationQuestion } from "@/types/questions";

interface Annotation {
	id: string;
	x: number;
	y: number;
	label: string;
}

interface ImageAnnotationRendererProps {
	question: ImageAnnotationQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: Annotation[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function ImageAnnotationRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: ImageAnnotationRendererProps) {
	const [userAnnotations, setUserAnnotations] = useState<Annotation[]>(userAnswer || []);
	const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
	const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
	const imageRef = useRef<HTMLImageElement>(null);

	const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
		if (!isAddingAnnotation || isAnswered || disabled || !imageRef.current) return;

		const rect = imageRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		const newAnnotation: Annotation = {
			id: `user-${Date.now()}`,
			x,
			y,
			label: `Annotation ${userAnnotations.length + 1}`,
		};

		setUserAnnotations([...userAnnotations, newAnnotation]);
		setIsAddingAnnotation(false);
	};

	const removeAnnotation = (annotationId: string) => {
		if (isAnswered || disabled) return;
		setUserAnnotations(userAnnotations.filter((ann) => ann.id !== annotationId));
		if (selectedAnnotation === annotationId) {
			setSelectedAnnotation(null);
		}
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		// Simple scoring based on proximity to expected annotations
		let score = 0;
		const threshold = 5; // 5% of image dimensions

		question.annotations.forEach((expectedAnnotation) => {
			const nearbyAnnotation = userAnnotations.find((userAnnotation) => {
				const distance = Math.sqrt(Math.pow(userAnnotation.x - expectedAnnotation.x, 2) + Math.pow(userAnnotation.y - expectedAnnotation.y, 2));
				return distance <= threshold;
			});

			if (nearbyAnnotation) {
				score++;
			}
		});

		const isCorrect = score >= question.annotations.length * 0.7; // 70% threshold

		onAnswer({
			value: userAnnotations,
			__isCorrect: isCorrect,
			score,
			maxScore: question.annotations.length,
		});
	};

	const getAnnotationDistance = (userAnnotation: Annotation, expectedAnnotation: (typeof question.annotations)[0]) => {
		return Math.sqrt(Math.pow(userAnnotation.x - expectedAnnotation.x, 2) + Math.pow(userAnnotation.y - expectedAnnotation.y, 2));
	};

	const findNearestExpectedAnnotation = (userAnnotation: Annotation) => {
		let nearest = null;
		let minDistance = Infinity;

		question.annotations.forEach((expectedAnnotation) => {
			const distance = getAnnotationDistance(userAnnotation, expectedAnnotation);
			if (distance < minDistance) {
				minDistance = distance;
				nearest = expectedAnnotation;
			}
		});

		return { annotation: nearest, distance: minDistance };
	};

	const isAnnotationCorrect = (userAnnotation: Annotation) => {
		const { distance } = findNearestExpectedAnnotation(userAnnotation);
		return distance <= 5; // 5% threshold
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="space-y-2">
						<p className="text-muted-foreground">Click on the image to add annotations where you identify the key features or components.</p>
						{question.userCanAddAnnotations && question.maxAnnotations && <p className="text-sm text-muted-foreground">Maximum annotations allowed: {question.maxAnnotations}</p>}
					</div>
				</CardContent>
			</Card>

			{/* Controls */}
			{!isAnswered && (
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Button variant={isAddingAnnotation ? "default" : "outline"} onClick={() => setIsAddingAnnotation(!isAddingAnnotation)} disabled={disabled || (question.maxAnnotations && userAnnotations.length >= question.maxAnnotations)}>
									<Plus className="w-4 h-4 mr-2" />
									Add Annotation
								</Button>

								<span className="text-sm text-muted-foreground">
									Annotations: {userAnnotations.length}
									{question.maxAnnotations && ` / ${question.maxAnnotations}`}
								</span>
							</div>

							{userAnnotations.length > 0 && (
								<Button onClick={handleSubmit} disabled={disabled}>
									Submit Annotations
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Image with Annotations */}
			<Card>
				<CardContent className="p-4">
					<div className="relative inline-block">
						<img ref={imageRef} src={question.image.src} alt={question.image.alt} className={`max-w-full h-auto rounded-lg ${isAddingAnnotation ? "cursor-crosshair" : "cursor-default"}`} onClick={handleImageClick} style={{ maxHeight: "600px" }} />

						{/* User Annotations */}
						{userAnnotations.map((annotation) => (
							<div
								key={annotation.id}
								className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${selectedAnnotation === annotation.id ? "scale-125" : "hover:scale-110"}`}
								style={{
									left: `${annotation.x}%`,
									top: `${annotation.y}%`,
								}}
								onClick={(e) => {
									e.stopPropagation();
									setSelectedAnnotation(selectedAnnotation === annotation.id ? null : annotation.id);
								}}
							>
								<div className={`relative ${showFeedback && isAnswered ? (isAnnotationCorrect(annotation) ? "text-success" : "text-destructive") : "text-primary"}`}>
									<MapPin className="w-6 h-6 drop-shadow-lg" />
									<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap">{annotation.label}</div>
								</div>
							</div>
						))}

						{/* Expected Annotations (shown in feedback) */}
						{showFeedback && isAnswered && (
							<>
								{question.annotations.map((annotation) => (
									<div
										key={annotation.id}
										className="absolute transform -translate-x-1/2 -translate-y-1/2"
										style={{
											left: `${annotation.x}%`,
											top: `${annotation.y}%`,
										}}
									>
										<div className="relative text-success">
											<div className="w-4 h-4 rounded-full bg-success border-2 border-white shadow-lg" />
											<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-success/10 px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap">{annotation.label}</div>
										</div>
									</div>
								))}
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Annotation List */}
			{userAnnotations.length > 0 && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3">Your Annotations</h3>
						<div className="space-y-2">
							{userAnnotations.map((annotation) => (
								<div key={annotation.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${selectedAnnotation === annotation.id ? "border-primary bg-blue-50" : showFeedback && isAnswered ? (isAnnotationCorrect(annotation) ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50") : "border-border"}`}>
									<div className="flex items-center space-x-3">
										<MapPin className={`w-4 h-4 ${selectedAnnotation === annotation.id ? "text-primary" : "text-muted-foreground"}`} />
										<span className="font-medium">{annotation.label}</span>
										<span className="text-sm text-muted-foreground">
											({annotation.x.toFixed(1)}%, {annotation.y.toFixed(1)}%)
										</span>
									</div>

									<div className="flex items-center space-x-2">
										{showFeedback && isAnswered && <div className="flex items-center space-x-1">{isAnnotationCorrect(annotation) ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}</div>}

										{!isAnswered && (
											<Button variant="outline" size="sm" onClick={() => removeAnnotation(annotation.id)} disabled={disabled}>
												<Trash2 className="w-4 h-4" />
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{(() => {
									let score = 0;
									question.annotations.forEach((expectedAnnotation) => {
										const nearbyAnnotation = userAnnotations.find((userAnnotation) => {
											const distance = getAnnotationDistance(userAnnotation, expectedAnnotation);
											return distance <= 5;
										});
										if (nearbyAnnotation) score++;
									});

									const isCorrect = score >= question.annotations.length * 0.7;
									return (
										<>
											{isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
											<span className={`font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>{isCorrect ? "Good Annotation Skills!" : "Some annotations need improvement"}</span>
											<span className="text-sm text-muted-foreground">
												({score} / {question.annotations.length} correct)
											</span>
										</>
									);
								})()}
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Expected Annotations List */}
							<div className="p-4 rounded-lg bg-green-50 border border-green-200">
								<p className="text-success font-medium">Expected Annotations:</p>
								<ul className="list-disc list-inside space-y-1 mt-2">
									{question.annotations.map((annotation) => (
										<li key={annotation.id} className="text-success">
											{annotation.label}
											{annotation.description && <span className="text-success"> - {annotation.description}</span>}
										</li>
									))}
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

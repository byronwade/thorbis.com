"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Eye, RotateCcw } from "lucide-react";
import { ImageComparisonQuestion } from "@/types/questions";

interface FoundDifference {
	id: string;
	x: number;
	y: number;
	imageId: string;
}

interface ImageComparisonRendererProps {
	question: ImageComparisonQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: FoundDifference[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function ImageComparisonRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: ImageComparisonRendererProps) {
	const [foundDifferences, setFoundDifferences] = useState<FoundDifference[]>(userAnswer || []);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const imageRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});

	const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, imageId: string) => {
		if (isAnswered || disabled) return;

		const imageElement = imageRefs.current[imageId];
		if (!imageElement) return;

		const rect = imageElement.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		// Check if click is near an actual difference
		const clickedDifference = question.differences.find((diff) => {
			if (diff.imageId !== imageId) return false;
			const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
			return distance <= diff.radius;
		});

		if (clickedDifference) {
			// Check if already found
			const alreadyFound = foundDifferences.some((found) => found.id === clickedDifference.id);

			if (!alreadyFound) {
				const newDifference: FoundDifference = {
					id: clickedDifference.id,
					x: clickedDifference.x,
					y: clickedDifference.y,
					imageId: clickedDifference.imageId,
				};

				setFoundDifferences([...foundDifferences, newDifference]);

				// Auto-submit if all differences found or max finds reached
				const newTotal = foundDifferences.length + 1;
				if (newTotal >= question.differences.length || (question.maxFinds && newTotal >= question.maxFinds)) {
					setTimeout(() => handleSubmit([...foundDifferences, newDifference]), 500);
				}
			}
		} else {
			// Wrong click - could add penalty or feedback here
			console.log("No difference at this location");
		}
	};

	const handleSubmit = (differencesToSubmit = foundDifferences) => {
		if (isAnswered || disabled) return;

		const score = differencesToSubmit.length;
		const maxScore = question.differences.length;
		const isCorrect = score >= maxScore * 0.7; // 70% threshold

		onAnswer({
			value: differencesToSubmit,
			__isCorrect: isCorrect,
			score,
			maxScore,
			timeElapsed,
		});
	};

	const resetGame = () => {
		if (isAnswered || disabled) return;
		setFoundDifferences([]);
		setTimeElapsed(0);
	};

	const getDifferenceStyle = (difference: (typeof question.differences)[0], isFound: boolean) => {
		if (!showFeedback && !isFound) return "hidden";

		return isFound ? "border-4 border-green-500 bg-success bg-opacity-20" : showFeedback && isAnswered ? "border-4 border-red-500 bg-destructive bg-opacity-20" : "hidden";
	};

	// Timer effect
	useEffect(() => {
		if (isAnswered || disabled) return;

		const timer = setInterval(() => {
			setTimeElapsed((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [isAnswered, disabled]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="space-y-6">
			{/* Instructions and Status */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">Find the differences between these images by clicking on them.</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>
									Found: {foundDifferences.length} / {question.differences.length}
								</span>
								<span>Time: {formatTime(timeElapsed)}</span>
								{question.maxFinds && <span>Max Finds: {question.maxFinds}</span>}
							</div>
						</div>

						{!isAnswered && (
							<div className="flex space-x-2">
								<Button variant="outline" size="sm" onClick={resetGame} disabled={disabled}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
								<Button onClick={() => handleSubmit()} disabled={disabled || foundDifferences.length === 0}>
									Submit ({foundDifferences.length})
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Images Side by Side */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{question.images.map((image, index) => (
					<Card key={image.id}>
						<CardContent className="p-4">
							<div className="relative inline-block">
								<img ref={(el) => (imageRefs.current[image.id] = el)} src={image.src} alt={image.alt} className="max-w-full h-auto rounded-lg cursor-crosshair" onClick={(e) => handleImageClick(e, image.id)} style={{ maxHeight: "500px" }} />

								{/* Difference Markers */}
								{question.differences
									.filter((diff) => diff.imageId === image.id)
									.map((difference) => {
										const isFound = foundDifferences.some((found) => found.id === difference.id);

										return (
											<div
												key={difference.id}
												className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${getDifferenceStyle(difference, isFound)}`}
												style={{
													left: `${difference.x}%`,
													top: `${difference.y}%`,
													width: `${difference.radius * 2}%`,
													height: `${difference.radius * 2}%`,
												}}
											/>
										);
									})}

								{/* Found Differences Overlay */}
								{foundDifferences
									.filter((found) => found.imageId === image.id)
									.map((found) => (
										<div
											key={found.id}
											className="absolute transform -translate-x-1/2 -translate-y-1/2"
											style={{
												left: `${found.x}%`,
												top: `${found.y}%`,
											}}
										>
											<div className="w-8 h-8 rounded-full bg-success border-2 border-white shadow-lg flex items-center justify-center">
												<CheckCircle className="w-5 h-5 text-white" />
											</div>
										</div>
									))}
							</div>

							<div className="mt-3 text-center">
								<p className="text-sm font-medium text-muted-foreground">Image {index + 1}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Progress Bar */}
			<Card>
				<CardContent className="p-4">
					<div className="space-y-2">
						<div className="flex justify-between items-center text-sm">
							<span>Progress</span>
							<span>
								{foundDifferences.length} / {question.differences.length}
							</span>
						</div>
						<div className="w-full bg-muted rounded-full h-2">
							<div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(foundDifferences.length / question.differences.length) * 100}%` }} />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Found Differences List */}
			{foundDifferences.length > 0 && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3 flex items-center">
							<Eye className="w-5 h-5 mr-2" />
							Found Differences
						</h3>
						<div className="space-y-2">
							{foundDifferences.map((found, index) => {
								const difference = question.differences.find((d) => d.id === found.id);
								return (
									<div key={found.id} className="flex items-center space-x-3 p-2 bg-green-50 border border-green-200 rounded-lg">
										<div className="w-6 h-6 rounded-full bg-success text-white text-xs flex items-center justify-center font-semibold">{index + 1}</div>
										<span className="text-success">{difference?.description || `Difference ${index + 1}`}</span>
										<span className="text-xs text-success">Image {question.images.findIndex((img) => img.id === found.imageId) + 1}</span>
									</div>
								);
							})}
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
									const score = foundDifferences.length;
									const maxScore = question.differences.length;
									const isCorrect = score >= maxScore * 0.7;
									return (
										<>
											{isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
											<span className={`font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>{isCorrect ? "Great observation skills!" : "Keep practicing your attention to detail"}</span>
											<span className="text-sm text-muted-foreground">
												({score} / {maxScore} found in {formatTime(timeElapsed)})
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

							{/* Show missed differences */}
							{foundDifferences.length < question.differences.length && (
								<div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
									<p className="text-warning font-medium">Missed Differences:</p>
									<ul className="list-disc list-inside space-y-1 mt-2">
										{question.differences
											.filter((diff) => !foundDifferences.some((found) => found.id === diff.id))
											.map((diff) => (
												<li key={diff.id} className="text-warning">
													{diff.description}
												</li>
											))}
									</ul>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Target, RotateCcw } from "lucide-react";
import { ImageHotspotQuestion } from "@/types/questions";

interface ImageHotspotRendererProps {
	question: ImageHotspotQuestion;
	onAnswer: (answer: string[]) => void;
	isAnswered: boolean;
	userAnswer?: string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

interface ClickPosition {
	x: number;
	y: number;
	hotspotId?: string;
}

export function ImageHotspotRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: ImageHotspotRendererProps) {
	const imageRef = useRef<HTMLImageElement>(null);
	const [selectedHotspots, setSelectedHotspots] = useState<string[]>(userAnswer || []);
	const [clickPositions, setClickPositions] = useState<ClickPosition[]>([]);

	const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
		if (disabled || isAnswered) return;

		if (!imageRef.current) return;

		const rect = imageRef.current.getBoundingClientRect();
		const scaleX = question.image.width / rect.width;
		const scaleY = question.image.height / rect.height;

		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		// Find if click is within any hotspot
		const clickedHotspot = question.hotspots.find((hotspot) => {
			const distance = Math.sqrt(Math.pow(x - hotspot.x, 2) + Math.pow(y - hotspot.y, 2));
			return distance <= hotspot.radius;
		});

		if (clickedHotspot) {
			let newSelectedHotspots: string[];

			if (selectedHotspots.includes(clickedHotspot.id)) {
				// Deselect if already selected
				newSelectedHotspots = selectedHotspots.filter((id) => id !== clickedHotspot.id);
			} else {
				// Select hotspot
				if (question.maxSelections && selectedHotspots.length >= question.maxSelections) {
					// Replace first selection if at max
					newSelectedHotspots = [...selectedHotspots.slice(1), clickedHotspot.id];
				} else {
					newSelectedHotspots = [...selectedHotspots, clickedHotspot.id];
				}
			}

			setSelectedHotspots(newSelectedHotspots);
			onAnswer(newSelectedHotspots);
		}

		// Add click position for visual feedback
		setClickPositions((prev) => [...prev.slice(-4), { x, y, hotspotId: clickedHotspot?.id }]);
	};

	const resetSelections = () => {
		setSelectedHotspots([]);
		setClickPositions([]);
		onAnswer([]);
	};

	const getHotspotStatus = (hotspot: any) => {
		if (!isAnswered) {
			return selectedHotspots.includes(hotspot.id) ? "selected" : "default";
		}

		const isSelected = selectedHotspots.includes(hotspot.id);
		const isCorrect = hotspot.isCorrect;

		if (isCorrect && isSelected) return "correct";
		if (isCorrect && !isSelected) return "missed";
		if (!isCorrect && isSelected) return "incorrect";
		return "default";
	};

	const getScore = () => {
		if (!isAnswered) return 0;
		const correctSelections = selectedHotspots.filter((id) => question.hotspots.find((h) => h.id === id)?.isCorrect).length;
		const incorrectSelections = selectedHotspots.filter((id) => !question.hotspots.find((h) => h.id === id)?.isCorrect).length;
		const totalCorrect = question.hotspots.filter((h) => h.isCorrect).length;

		// Calculate score: correct selections minus incorrect selections, minimum 0
		return Math.max(0, correctSelections - incorrectSelections);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Badge variant="secondary">Image Hotspot</Badge>
					<Badge variant="outline">{question.points} points</Badge>
					{question.difficulty && <Badge variant={question.difficulty === "easy" ? "default" : question.difficulty === "medium" ? "secondary" : "destructive"}>{question.difficulty}</Badge>}
				</div>
				<div className="flex items-center space-x-2">
					{isAnswered && (
						<Badge variant={getScore() > 0 ? "default" : "destructive"}>
							Score: {getScore()}/{question.hotspots.filter((h) => h.isCorrect).length}
						</Badge>
					)}
					{!isAnswered && (
						<Button variant="outline" size="sm" onClick={resetSelections} disabled={disabled || selectedHotspots.length === 0}>
							<RotateCcw className="h-4 w-4 mr-2" />
							Reset
						</Button>
					)}
				</div>
			</div>

			{/* Instructions */}
			<div className="p-4 bg-blue-50 border border-primary/30 rounded-lg">
				<p className="text-primary text-sm">
					Click on the correct areas in the image. {question.maxSelections ? `You can select up to ${question.maxSelections} area${question.maxSelections > 1 ? "s" : ""}.` : "You can select multiple areas."} {selectedHotspots.length > 0 && <span className="font-medium">Selected: {selectedHotspots.length}</span>}
				</p>
			</div>

			{/* Image with Hotspots */}
			<Card className="overflow-hidden">
				<CardContent className="p-0">
					<div className="relative inline-block">
						<img ref={imageRef} src={question.image.src} alt={question.image.alt} width={question.image.width} height={question.image.height} className="block max-w-full h-auto cursor-crosshair" onClick={handleImageClick} draggable={false} />

						{/* Hotspot Indicators */}
						{question.hotspots.map((hotspot) => {
							const status = getHotspotStatus(hotspot);
							const isVisible = isAnswered || selectedHotspots.includes(hotspot.id);

							if (!isVisible && !isAnswered) return null;

							return (
								<div
									key={hotspot.id}
									className={`absolute border-4 rounded-full flex items-center justify-center transition-all duration-200 ${status === "correct" ? "border-green-500 bg-success/20" : status === "incorrect" ? "border-red-500 bg-destructive/20" : status === "missed" ? "border-yellow-500 bg-warning/20" : status === "selected" ? "border-primary bg-primary/20" : "border-border bg-muted/20"}`}
									style={{
										left: (hotspot.x / question.image.width) * 100 + "%",
										top: (hotspot.y / question.image.height) * 100 + "%",
										width: (hotspot.radius * 2 * 100) / question.image.width + "%",
										height: (hotspot.radius * 2 * 100) / question.image.height + "%",
										transform: "translate(-50%, -50%)",
									}}
								>
									{status === "correct" && <CheckCircle className="h-4 w-4 text-success" />}
									{status === "incorrect" && <XCircle className="h-4 w-4 text-destructive" />}
									{status === "missed" && <Target className="h-4 w-4 text-warning" />}
									{status === "selected" && <div className="w-2 h-2 bg-primary rounded-full" />}
								</div>
							);
						})}

						{/* Recent Click Positions (for visual feedback) */}
						{!isAnswered &&
							clickPositions.map((pos, index) => (
								<div
									key={index}
									className="absolute w-3 h-3 bg-primary/40 rounded-full opacity-50 animate-ping pointer-events-none"
									style={{
										left: (pos.x / question.image.width) * 100 + "%",
										top: (pos.y / question.image.height) * 100 + "%",
										transform: "translate(-50%, -50%)",
										animationDuration: "1s",
										animationDelay: index * 0.1 + "s",
									}}
								/>
							))}
					</div>
				</CardContent>
			</Card>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<div className="space-y-3">
					{/* Individual Hotspot Feedback */}
					{selectedHotspots.map((hotspotId) => {
						const hotspot = question.hotspots.find((h) => h.id === hotspotId);
						if (!hotspot) return null;

						const isCorrect = hotspot.isCorrect;

						return (
							<Card key={hotspotId} className={`border-2 ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
								<CardContent className="p-4">
									<div className="flex items-start space-x-3">
										<div className="flex-shrink-0 mt-0.5">{isCorrect ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}</div>
										<div className="flex-1">
											<p className={`font-medium mb-1 ${isCorrect ? "text-success" : "text-destructive"}`}>Selected Area: {isCorrect ? "Correct!" : "Incorrect"}</p>
											<p className={`text-sm ${isCorrect ? "text-success" : "text-destructive"}`}>{hotspot.feedback}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}

					{/* Missed Correct Hotspots */}
					{question.hotspots
						.filter((hotspot) => hotspot.isCorrect && !selectedHotspots.includes(hotspot.id))
						.map((hotspot) => (
							<Card key={hotspot.id} className="border-2 border-yellow-200 bg-yellow-50">
								<CardContent className="p-4">
									<div className="flex items-start space-x-3">
										<div className="flex-shrink-0 mt-0.5">
											<Target className="h-5 w-5 text-warning" />
										</div>
										<div className="flex-1">
											<p className="font-medium text-warning mb-1">Missed Correct Area</p>
											<p className="text-sm text-warning">{hotspot.feedback}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}

					{/* Explanation */}
					<Card>
						<CardContent className="p-4">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0 mt-0.5">
									<Target className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="font-medium text-foreground mb-1">Explanation:</p>
									<p className="text-muted-foreground text-sm">{question.explanation}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Hints */}
			{!isAnswered && question.hints && question.hints.length > 0 && (
				<div className="mt-4">
					<details className="group">
						<summary className="cursor-pointer text-sm text-primary hover:text-primary font-medium">💡 Need a hint? Click here</summary>
						<Card className="mt-2">
							<CardContent className="p-3 bg-yellow-50">
								<p className="text-warning text-sm">{question.hints[0]}</p>
							</CardContent>
						</Card>
					</details>
				</div>
			)}
		</div>
	);
}

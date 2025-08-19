"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw, Eye, MousePointer, Layers } from "lucide-react";
import { Model3DInteractionQuestion } from "@/types/questions";

interface Model3DInteractionRendererProps {
	question: Model3DInteractionQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function Model3DInteractionRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: Model3DInteractionRendererProps) {
	const [selectedTargets, setSelectedTargets] = useState<string[]>(userAnswer || []);
	const [rotation, setRotation] = useState({ x: 0, y: 0 });
	const [viewMode, setViewMode] = useState<"front" | "side" | "top" | "isometric">("isometric");

	const handleTargetClick = (targetId: string) => {
		if (isAnswered || disabled) return;

		if (question.interactionType === "highlight") {
			// Toggle selection for highlight mode
			setSelectedTargets((prev) => (prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId]));
		} else {
			// Single selection for other modes
			setSelectedTargets([targetId]);
		}
	};

	const handleRotate = (direction: "left" | "right" | "up" | "down") => {
		if (isAnswered || disabled) return;

		setRotation((prev) => {
			const step = 15;
			switch (direction) {
				case "left":
					return { ...prev, y: prev.y - step };
				case "right":
					return { ...prev, y: prev.y + step };
				case "up":
					return { ...prev, x: prev.x - step };
				case "down":
					return { ...prev, x: prev.x + step };
				default:
					return prev;
			}
		});
	};

	const resetView = () => {
		setRotation({ x: 0, y: 0 });
		setViewMode("isometric");
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		// Check if all correct targets are selected
		const isCorrect = question.correctInteractions.every((correctId) => selectedTargets.includes(correctId)) && selectedTargets.every((selectedId) => question.correctInteractions.includes(selectedId));

		onAnswer({
			value: selectedTargets,
			__isCorrect: isCorrect,
		});
	};

	const getViewTransform = () => {
		const { x, y } = rotation;
		switch (viewMode) {
			case "front":
				return `rotateX(${x}deg) rotateY(${y}deg)`;
			case "side":
				return `rotateX(${x}deg) rotateY(${y + 90}deg)`;
			case "top":
				return `rotateX(${x + 90}deg) rotateY(${y}deg)`;
			case "isometric":
				return `rotateX(${x - 30}deg) rotateY(${y + 45}deg)`;
			default:
				return `rotateX(${x}deg) rotateY(${y}deg)`;
		}
	};

	const getTargetStyle = (targetId: string) => {
		const isSelected = selectedTargets.includes(targetId);
		const isCorrect = question.correctInteractions.includes(targetId);

		if (showFeedback && isAnswered) {
			if (isCorrect && isSelected) {
				return "border-green-500 bg-success/10 text-success";
			} else if (isCorrect && !isSelected) {
				return "border-orange-500 bg-warning/10 text-warning";
			} else if (!isCorrect && isSelected) {
				return "border-red-500 bg-destructive/10 text-destructive";
			}
		}

		if (isSelected) {
			return "border-primary bg-primary/10 text-primary";
		}

		return "border-border bg-white text-muted-foreground hover:border-border hover:bg-gray-50";
	};

	const getInteractionIcon = () => {
		switch (question.interactionType) {
			case "rotate":
				return <RotateCcw className="w-4 h-4" />;
			case "highlight":
				return <Eye className="w-4 h-4" />;
			case "assemble":
				return <Layers className="w-4 h-4" />;
			default:
				return <MousePointer className="w-4 h-4" />;
		}
	};

	const getInteractionDescription = () => {
		switch (question.interactionType) {
			case "rotate":
				return "Rotate the model to examine it from different angles, then select the correct components.";
			case "highlight":
				return "Click on the parts or components that match the requirements. You can select multiple parts.";
			case "assemble":
				return "Click on the parts in the correct assembly order.";
			default:
				return "Interact with the 3D model to answer the question.";
		}
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-start space-x-3">
						{getInteractionIcon()}
						<div>
							<p className="text-muted-foreground mb-2">{getInteractionDescription()}</p>
							<p className="text-sm text-muted-foreground">
								Selected: {selectedTargets.length} / {question.correctInteractions.length}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 3D Model Controls */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<span className="text-sm font-medium">View:</span>
							<div className="flex space-x-2">
								{(["front", "side", "top", "isometric"] as const).map((view) => (
									<Button key={view} variant={viewMode === view ? "default" : "outline"} size="sm" onClick={() => setViewMode(view)} disabled={isAnswered || disabled}>
										{view.charAt(0).toUpperCase() + view.slice(1)}
									</Button>
								))}
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<span className="text-sm font-medium">Rotate:</span>
							<div className="grid grid-cols-3 gap-1">
								<div></div>
								<Button variant="outline" size="sm" onClick={() => handleRotate("up")} disabled={isAnswered || disabled}>
									↑
								</Button>
								<div></div>
								<Button variant="outline" size="sm" onClick={() => handleRotate("left")} disabled={isAnswered || disabled}>
									←
								</Button>
								<Button variant="outline" size="sm" onClick={resetView} disabled={isAnswered || disabled}>
									⌂
								</Button>
								<Button variant="outline" size="sm" onClick={() => handleRotate("right")} disabled={isAnswered || disabled}>
									→
								</Button>
								<div></div>
								<Button variant="outline" size="sm" onClick={() => handleRotate("down")} disabled={isAnswered || disabled}>
									↓
								</Button>
								<div></div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 3D Model Viewer (Simulated) */}
			<Card>
				<CardContent className="p-4">
					<div className="relative w-full h-96 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden">
						{/* Simulated 3D Container */}
						<div
							className="absolute inset-4 transition-transform duration-300 ease-out"
							style={{
								transform: `perspective(800px) ${getViewTransform()}`,
								transformStyle: "preserve-3d",
							}}
						>
							{/* Model Placeholder - In a real implementation, this would be a 3D model */}
							<div className="relative w-full h-full">
								{/* Simulated 3D model using a placeholder image or shapes */}
								<div className="absolute inset-0 flex items-center justify-center">
									{question.modelSrc ? (
										<img src={question.modelSrc} alt="3D Model" className="max-w-full max-h-full object-contain opacity-80" />
									) : (
										<div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-2xl transform rotate-12">
											<div className="w-full h-full bg-gradient-to-tr from-transparent to-white opacity-30 rounded-lg"></div>
										</div>
									)}
								</div>

								{/* Target Points */}
								{question.targets.map((target, index) => {
									// Simulate 3D positioning with some basic calculations
									const baseX = 20 + (index % 3) * 30;
									const baseY = 20 + Math.floor(index / 3) * 30;
									const offsetX = Math.sin((rotation.y + index * 60) * (Math.PI / 180)) * 10;
									const offsetY = Math.cos((rotation.x + index * 60) * (Math.PI / 180)) * 10;

									return (
										<div
											key={target.id}
											className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${getTargetStyle(target.id)}`}
											style={{
												left: `${baseX + offsetX}%`,
												top: `${baseY + offsetY}%`,
												zIndex: 10 + index,
											}}
											onClick={() => handleTargetClick(target.id)}
										>
											<div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm shadow-lg">{index + 1}</div>
											<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs whitespace-nowrap">{target.name}</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Rotation indicator */}
						<div className="absolute top-4 right-4 text-xs text-muted-foreground bg-white bg-opacity-75 px-2 py-1 rounded">
							Rotation: X:{rotation.x}° Y:{rotation.y}°
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Target List */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Available Targets</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{question.targets.map((target, index) => (
							<div key={target.id} className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getTargetStyle(target.id)}`} onClick={() => handleTargetClick(target.id)}>
								<div className="flex items-center space-x-3">
									<div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center font-semibold text-sm">{index + 1}</div>
									<div>
										<p className="font-medium">{target.name}</p>
										<p className="text-sm opacity-75">{target.description}</p>
									</div>
									{selectedTargets.includes(target.id) && showFeedback && isAnswered && <div className="ml-auto">{question.correctInteractions.includes(target.id) ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}</div>}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Submit Button */}
			{!isAnswered && (
				<div className="flex justify-center">
					<Button onClick={handleSubmit} size="lg" disabled={disabled || selectedTargets.length === 0}>
						Submit Interaction
					</Button>
				</div>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{(() => {
									const isCorrect = question.correctInteractions.every((correctId) => selectedTargets.includes(correctId)) && selectedTargets.every((selectedId) => question.correctInteractions.includes(selectedId));
									return (
										<>
											{isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
											<span className={`font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>{isCorrect ? "Perfect 3D Interaction!" : "Some selections need correction"}</span>
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

							{/* Show correct interactions */}
							<div className="p-4 rounded-lg bg-green-50 border border-green-200">
								<p className="text-success font-medium">Correct Interactions:</p>
								<ul className="list-disc list-inside space-y-1 mt-2">
									{question.correctInteractions.map((targetId) => {
										const target = question.targets.find((t) => t.id === targetId);
										return (
											<li key={targetId} className="text-success">
												{target?.name} - {target?.description}
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

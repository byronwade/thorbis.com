"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Tag, RotateCcw } from "lucide-react";
import { DiagramLabelingQuestion } from "@/types/questions";

interface LabelPlacement {
	labelId: string;
	pointId: string;
}

interface DiagramLabelingRendererProps {
	question: DiagramLabelingQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: LabelPlacement[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function DiagramLabelingRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: DiagramLabelingRendererProps) {
	const [labelPlacements, setLabelPlacements] = useState<LabelPlacement[]>(userAnswer || []);
	const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
	const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
	const diagramRef = useRef<HTMLImageElement>(null);

	const handleLabelDragStart = (labelId: string) => {
		if (isAnswered || disabled) return;
		setDraggedLabel(labelId);
	};

	const handlePointClick = (pointId: string) => {
		if (isAnswered || disabled) return;

		if (selectedLabel) {
			// Place the selected label on this point
			const existingPlacement = labelPlacements.find((p) => p.pointId === pointId);
			const labelAlreadyPlaced = labelPlacements.find((p) => p.labelId === selectedLabel);

			let newPlacements = [...labelPlacements];

			// Remove existing label from this point
			if (existingPlacement) {
				newPlacements = newPlacements.filter((p) => p.pointId !== pointId);
			}

			// Remove this label from its previous location
			if (labelAlreadyPlaced) {
				newPlacements = newPlacements.filter((p) => p.labelId !== selectedLabel);
			}

			// Add new placement
			newPlacements.push({ labelId: selectedLabel, pointId });

			setLabelPlacements(newPlacements);
			setSelectedLabel(null);
		}
	};

	const handleLabelDrop = (e: React.DragEvent, pointId: string) => {
		e.preventDefault();
		if (!draggedLabel || isAnswered || disabled) return;

		const existingPlacement = labelPlacements.find((p) => p.pointId === pointId);
		const labelAlreadyPlaced = labelPlacements.find((p) => p.labelId === draggedLabel);

		let newPlacements = [...labelPlacements];

		// Remove existing label from this point
		if (existingPlacement) {
			newPlacements = newPlacements.filter((p) => p.pointId !== pointId);
		}

		// Remove this label from its previous location
		if (labelAlreadyPlaced) {
			newPlacements = newPlacements.filter((p) => p.labelId !== draggedLabel);
		}

		// Add new placement
		newPlacements.push({ labelId: draggedLabel, pointId });

		setLabelPlacements(newPlacements);
		setDraggedLabel(null);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const removeLabelFromPoint = (pointId: string) => {
		if (isAnswered || disabled) return;
		setLabelPlacements(labelPlacements.filter((p) => p.pointId !== pointId));
	};

	const resetLabeling = () => {
		if (isAnswered || disabled) return;
		setLabelPlacements([]);
		setSelectedLabel(null);
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		// Check if all labels are placed
		const allLabelsPlaced = question.labels.every((label) => labelPlacements.some((p) => p.labelId === label.id));

		if (!allLabelsPlaced) {
			alert("Please place all labels before submitting.");
			return;
		}

		// Check correctness
		const correctPlacements = question.labelPoints.filter((point) => {
			const placement = labelPlacements.find((p) => p.pointId === point.id);
			return placement && placement.labelId === point.correctLabelId;
		});

		const isCorrect = correctPlacements.length === question.labelPoints.length;

		onAnswer({
			value: labelPlacements,
			__isCorrect: isCorrect,
			score: correctPlacements.length,
			maxScore: question.labelPoints.length,
		});
	};

	const getLabelForPoint = (pointId: string) => {
		const placement = labelPlacements.find((p) => p.pointId === pointId);
		if (!placement) return null;
		return question.labels.find((label) => label.id === placement.labelId);
	};

	const getUnplacedLabels = () => {
		return question.labels.filter((label) => !labelPlacements.some((p) => p.labelId === label.id));
	};

	const isPointCorrect = (pointId: string) => {
		const point = question.labelPoints.find((p) => p.id === pointId);
		const placement = labelPlacements.find((p) => p.pointId === pointId);
		return point && placement && placement.labelId === point.correctLabelId;
	};

	const getPointStyle = (pointId: string) => {
		const hasLabel = getLabelForPoint(pointId);

		if (showFeedback && isAnswered && hasLabel) {
			return isPointCorrect(pointId) ? "border-green-500 bg-success/10 text-success" : "border-red-500 bg-destructive/10 text-destructive";
		}

		if (hasLabel) {
			return "border-primary bg-primary/10 text-primary";
		}

		return "border-border bg-white text-muted-foreground hover:border-border";
	};

	const getLabelStyle = (labelId: string) => {
		const isPlaced = labelPlacements.some((p) => p.labelId === labelId);
		const isSelected = selectedLabel === labelId;

		if (isPlaced) {
			return "opacity-50 cursor-not-allowed";
		}

		if (isSelected) {
			return "border-primary bg-primary/10 text-primary scale-105";
		}

		return "border-border bg-white text-muted-foreground hover:border-border hover:bg-gray-50 cursor-grab";
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="space-y-2">
						<p className="text-muted-foreground">Label the diagram by dragging labels to the correct points, or click on a label and then click on a point.</p>
						<div className="flex items-center space-x-4 text-sm text-muted-foreground">
							<span>
								Labeled: {labelPlacements.length} / {question.labels.length}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Available Labels */}
			{getUnplacedLabels().length > 0 && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3 flex items-center">
							<Tag className="w-5 h-5 mr-2" />
							Available Labels
						</h3>
						<div className="flex flex-wrap gap-3">
							{getUnplacedLabels().map((label) => (
								<div key={label.id} className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${getLabelStyle(label.id)}`} draggable={!isAnswered && !disabled} onDragStart={() => handleLabelDragStart(label.id)} onClick={() => setSelectedLabel(selectedLabel === label.id ? null : label.id)}>
									<span className="font-medium">{label.text}</span>
								</div>
							))}
						</div>
						{selectedLabel && <p className="text-sm text-primary mt-2">Selected: {question.labels.find((l) => l.id === selectedLabel)?.text}. Click on a point to place it.</p>}
					</CardContent>
				</Card>
			)}

			{/* Controls */}
			{!isAnswered && (
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<Button variant="outline" onClick={resetLabeling} disabled={disabled || labelPlacements.length === 0}>
								<RotateCcw className="w-4 h-4 mr-2" />
								Reset Labels
							</Button>

							<Button onClick={handleSubmit} disabled={disabled || labelPlacements.length !== question.labels.length}>
								Submit Labeling
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Diagram */}
			<Card>
				<CardContent className="p-4">
					<div className="relative inline-block">
						<img ref={diagramRef} src={question.diagram.src} alt="Diagram to label" className="max-w-full h-auto rounded-lg" style={{ maxHeight: "600px" }} />

						{/* Label Points */}
						{question.labelPoints.map((point) => {
							const placedLabel = getLabelForPoint(point.id);

							return (
								<div
									key={point.id}
									className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${getPointStyle(point.id)}`}
									style={{
										left: `${point.x}%`,
										top: `${point.y}%`,
									}}
									onClick={() => handlePointClick(point.id)}
									onDragOver={handleDragOver}
									onDrop={(e) => handleLabelDrop(e, point.id)}
								>
									<div className="min-w-8 h-8 rounded-lg border-2 flex items-center justify-center px-2 shadow-lg">{placedLabel ? <span className="text-xs font-medium text-center leading-tight">{placedLabel.text}</span> : <div className="w-2 h-2 rounded-full bg-current" />}</div>

									{/* Remove button for placed labels */}
									{placedLabel && !isAnswered && (
										<button
											className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full text-xs flex items-center justify-center hover:bg-destructive"
											onClick={(e) => {
												e.stopPropagation();
												removeLabelFromPoint(point.id);
											}}
										>
											×
										</button>
									)}

									{/* Feedback Icons */}
									{showFeedback && isAnswered && placedLabel && <div className="absolute -top-2 -right-2">{isPointCorrect(point.id) ? <CheckCircle className="w-5 h-5 text-success bg-white rounded-full" /> : <XCircle className="w-5 h-5 text-destructive bg-white rounded-full" />}</div>}
								</div>
							);
						})}

						{/* Show correct labels in feedback mode */}
						{showFeedback && isAnswered && (
							<>
								{question.labelPoints.map((point) => {
									const isCorrectlyLabeled = isPointCorrect(point.id);
									if (isCorrectlyLabeled) return null;

									const correctLabel = question.labels.find((label) => label.id === point.correctLabelId);

									return (
										<div
											key={`correct-${point.id}`}
											className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
											style={{
												left: `${point.x}%`,
												top: `${point.y + 8}%`, // Offset slightly below the point
											}}
										>
											<div className="bg-success/10 border-2 border-green-500 text-success px-2 py-1 rounded text-xs font-medium shadow-lg">Correct: {correctLabel?.text}</div>
										</div>
									);
								})}
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Placed Labels Summary */}
			{labelPlacements.length > 0 && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3">Placed Labels</h3>
						<div className="space-y-2">
							{labelPlacements.map((placement) => {
								const label = question.labels.find((l) => l.id === placement.labelId);
								const point = question.labelPoints.find((p) => p.id === placement.pointId);

								return (
									<div key={placement.pointId} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${showFeedback && isAnswered ? (isPointCorrect(placement.pointId) ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50") : "border-border"}`}>
										<div className="flex items-center space-x-3">
											<Tag className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">{label?.text}</span>
											<span className="text-sm text-muted-foreground">
												→ Point ({point?.x}%, {point?.y}%)
											</span>
										</div>

										{showFeedback && isAnswered && <div className="flex items-center space-x-2">{isPointCorrect(placement.pointId) ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}</div>}
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
									const correctCount = question.labelPoints.filter((point) => isPointCorrect(point.id)).length;
									const isCorrect = correctCount === question.labelPoints.length;
									return (
										<>
											{isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
											<span className={`font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>{isCorrect ? "Perfect Labeling!" : "Some labels need correction"}</span>
											<span className="text-sm text-muted-foreground">
												({correctCount} / {question.labelPoints.length} correct)
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

							{/* Show correct labeling */}
							<div className="p-4 rounded-lg bg-green-50 border border-green-200">
								<p className="text-success font-medium">Correct Labeling:</p>
								<ul className="list-disc list-inside space-y-1 mt-2">
									{question.labelPoints.map((point) => {
										const correctLabel = question.labels.find((label) => label.id === point.correctLabelId);
										return (
											<li key={point.id} className="text-success">
												{correctLabel?.text} → Position ({point.x}%, {point.y}%)
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

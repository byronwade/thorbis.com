"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { DragDropSequenceQuestion } from "@/types/questions";

interface DragDropSequenceRendererProps {
	question: DragDropSequenceQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function DragDropSequenceRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: DragDropSequenceRendererProps) {
	const [orderedItems, setOrderedItems] = useState<string[]>([]);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	// Initialize with shuffled items or user answer
	useEffect(() => {
		if (userAnswer) {
			setOrderedItems(userAnswer);
		} else {
			// Shuffle items initially
			const shuffled = [...question.items].sort(() => Math.random() - 0.5).map((item) => item.id);
			setOrderedItems(shuffled);
		}
	}, [question.items, userAnswer]);

	const getItemById = (id: string) => {
		return question.items.find((item) => item.id === id);
	};

	const handleDragStart = (index: number) => {
		if (isAnswered || disabled) return;
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();
		if (draggedIndex === null || isAnswered || disabled) return;

		const newOrder = [...orderedItems];
		const draggedItem = newOrder[draggedIndex];
		newOrder.splice(draggedIndex, 1);
		newOrder.splice(dropIndex, 0, draggedItem);

		setOrderedItems(newOrder);
		setDraggedIndex(null);
	};

	const moveUp = (index: number) => {
		if (index === 0 || isAnswered || disabled) return;
		const newOrder = [...orderedItems];
		[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
		setOrderedItems(newOrder);
	};

	const moveDown = (index: number) => {
		if (index === orderedItems.length - 1 || isAnswered || disabled) return;
		const newOrder = [...orderedItems];
		[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
		setOrderedItems(newOrder);
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		const isCorrect = JSON.stringify(orderedItems) === JSON.stringify(question.correctSequence);

		onAnswer({
			value: orderedItems,
			__isCorrect: isCorrect,
		});
	};

	const getItemStyle = (itemId: string, index: number) => {
		if (!showFeedback || !isAnswered) {
			return "border-border bg-white hover:border-border";
		}

		const correctIndex = question.correctSequence.indexOf(itemId);
		const isInCorrectPosition = correctIndex === index;

		if (isInCorrectPosition) {
			return "border-green-500 bg-green-50";
		} else {
			return "border-red-500 bg-red-50";
		}
	};

	const getSequenceTypeDescription = () => {
		switch (question.sequenceType) {
			case "chronological":
				return "Arrange the events in chronological order (earliest to latest).";
			case "procedural":
				return "Arrange the steps in the correct procedural order.";
			case "alphabetical":
				return "Arrange the items in alphabetical order.";
			case "numerical":
				return "Arrange the items in numerical order.";
			default:
				return "Arrange the items in the correct order.";
		}
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="space-y-2">
						<p className="text-muted-foreground">{getSequenceTypeDescription()}</p>
						<p className="text-sm text-muted-foreground">Drag and drop the items below to arrange them, or use the arrow buttons to move them up and down.</p>
					</div>
				</CardContent>
			</Card>

			{/* Item List */}
			<div className="space-y-3">
				{orderedItems.map((itemId, index) => {
					const item = getItemById(itemId);
					if (!item) return null;

					return (
						<Card key={`${itemId}-${index}`} className={`cursor-move transition-all duration-200 ${getItemStyle(itemId, index)}`} draggable={!isAnswered && !disabled} onDragStart={() => handleDragStart(index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
							<CardContent className="p-4">
								<div className="flex items-center space-x-4">
									{/* Position Number */}
									<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">{index + 1}</div>

									{/* Drag Handle */}
									<div className="flex-shrink-0">
										<GripVertical className="w-5 h-5 text-muted-foreground" />
									</div>

									{/* Item Content */}
									<div className="flex-1">
										{item.type === "image" && item.src ? (
											<div className="flex items-center space-x-3">
												<img src={item.src} alt={item.content} className="w-12 h-12 object-cover rounded-lg" />
												<span className="text-foreground font-medium">{item.content}</span>
											</div>
										) : (
											<p className="text-foreground font-medium">{item.content}</p>
										)}
									</div>

									{/* Movement Buttons */}
									{!isAnswered && !disabled && (
										<div className="flex flex-col space-y-1">
											<Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => moveUp(index)} disabled={index === 0}>
												<ArrowUp className="w-4 h-4" />
											</Button>
											<Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => moveDown(index)} disabled={index === orderedItems.length - 1}>
												<ArrowDown className="w-4 h-4" />
											</Button>
										</div>
									)}

									{/* Feedback Icons */}
									{showFeedback && isAnswered && <div className="flex-shrink-0">{question.correctSequence.indexOf(itemId) === index ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}</div>}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Submit Button */}
			{!isAnswered && (
				<div className="flex justify-center">
					<Button onClick={handleSubmit} size="lg" disabled={disabled}>
						Check Sequence
					</Button>
				</div>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{JSON.stringify(orderedItems) === JSON.stringify(question.correctSequence) ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${JSON.stringify(orderedItems) === JSON.stringify(question.correctSequence) ? "text-success" : "text-destructive"}`}>{JSON.stringify(orderedItems) === JSON.stringify(question.correctSequence) ? "Perfect Sequence!" : "Incorrect Sequence"}</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Show correct sequence if incorrect */}
							{JSON.stringify(orderedItems) !== JSON.stringify(question.correctSequence) && (
								<div className="p-4 rounded-lg bg-green-50 border border-green-200">
									<p className="text-success font-medium">Correct Sequence:</p>
									<ol className="list-decimal list-inside space-y-2 mt-2">
										{question.correctSequence.map((itemId, index) => {
											const item = getItemById(itemId);
											return (
												<li key={itemId} className="text-success flex items-center space-x-2">
													{item?.type === "image" && item.src ? (
														<div className="flex items-center space-x-2 ml-4">
															<img src={item.src} alt={item.content} className="w-8 h-8 object-cover rounded" />
															<span>{item.content}</span>
														</div>
													) : (
														<span className="ml-4">{item?.content}</span>
													)}
												</li>
											);
										})}
									</ol>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

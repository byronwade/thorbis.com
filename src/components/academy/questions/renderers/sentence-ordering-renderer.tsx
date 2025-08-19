"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { SentenceOrderingQuestion } from "@/types/questions";

interface SentenceOrderingRendererProps {
	question: SentenceOrderingQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function SentenceOrderingRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: SentenceOrderingRendererProps) {
	const [orderedSentences, setOrderedSentences] = useState<string[]>([]);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	// Initialize with shuffled sentences or user answer
	useEffect(() => {
		if (userAnswer) {
			setOrderedSentences(userAnswer);
		} else {
			// Shuffle sentences initially
			const shuffled = [...question.sentences].sort(() => Math.random() - 0.5).map((s) => s.id);
			setOrderedSentences(shuffled);
		}
	}, [question.sentences, userAnswer]);

	const getSentenceById = (id: string) => {
		return question.sentences.find((s) => s.id === id);
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

		const newOrder = [...orderedSentences];
		const draggedItem = newOrder[draggedIndex];
		newOrder.splice(draggedIndex, 1);
		newOrder.splice(dropIndex, 0, draggedItem);

		setOrderedSentences(newOrder);
		setDraggedIndex(null);
	};

	const moveUp = (index: number) => {
		if (index === 0 || isAnswered || disabled) return;
		const newOrder = [...orderedSentences];
		[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
		setOrderedSentences(newOrder);
	};

	const moveDown = (index: number) => {
		if (index === orderedSentences.length - 1 || isAnswered || disabled) return;
		const newOrder = [...orderedSentences];
		[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
		setOrderedSentences(newOrder);
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		const isCorrect = JSON.stringify(orderedSentences) === JSON.stringify(question.correctOrder);

		onAnswer({
			value: orderedSentences,
			__isCorrect: isCorrect,
		});
	};

	const getSentenceStyle = (sentenceId: string, index: number) => {
		if (!showFeedback || !isAnswered) {
			return "border-border bg-white hover:border-border";
		}

		const correctIndex = question.correctOrder.indexOf(sentenceId);
		const isInCorrectPosition = correctIndex === index;

		if (isInCorrectPosition) {
			return "border-green-500 bg-green-50";
		} else {
			return "border-red-500 bg-red-50";
		}
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<p className="text-muted-foreground">Drag and drop the sentences below to arrange them in the correct order, or use the arrow buttons to move them up and down.</p>
				</CardContent>
			</Card>

			{/* Sentence List */}
			<div className="space-y-3">
				{orderedSentences.map((sentenceId, index) => {
					const sentence = getSentenceById(sentenceId);
					if (!sentence) return null;

					return (
						<Card key={`${sentenceId}-${index}`} className={`cursor-move transition-all duration-200 ${getSentenceStyle(sentenceId, index)}`} draggable={!isAnswered && !disabled} onDragStart={() => handleDragStart(index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
							<CardContent className="p-4">
								<div className="flex items-center space-x-4">
									{/* Order Number */}
									<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">{index + 1}</div>

									{/* Drag Handle */}
									<div className="flex-shrink-0">
										<GripVertical className="w-5 h-5 text-muted-foreground" />
									</div>

									{/* Sentence Text */}
									<div className="flex-1">
										<p className="text-foreground">{sentence.text}</p>
									</div>

									{/* Movement Buttons */}
									{!isAnswered && !disabled && (
										<div className="flex flex-col space-y-1">
											<Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => moveUp(index)} disabled={index === 0}>
												<ArrowUp className="w-4 h-4" />
											</Button>
											<Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => moveDown(index)} disabled={index === orderedSentences.length - 1}>
												<ArrowDown className="w-4 h-4" />
											</Button>
										</div>
									)}

									{/* Feedback Icons */}
									{showFeedback && isAnswered && <div className="flex-shrink-0">{question.correctOrder.indexOf(sentenceId) === index ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}</div>}
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
						Check Order
					</Button>
				</div>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{JSON.stringify(orderedSentences) === JSON.stringify(question.correctOrder) ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${JSON.stringify(orderedSentences) === JSON.stringify(question.correctOrder) ? "text-success" : "text-destructive"}`}>{JSON.stringify(orderedSentences) === JSON.stringify(question.correctOrder) ? "Perfect Order!" : "Incorrect Order"}</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Show correct order if incorrect */}
							{JSON.stringify(orderedSentences) !== JSON.stringify(question.correctOrder) && (
								<div className="p-4 rounded-lg bg-green-50 border border-green-200">
									<p className="text-success font-medium">Correct Order:</p>
									<ol className="list-decimal list-inside space-y-1 mt-2">
										{question.correctOrder.map((sentenceId, index) => {
											const sentence = getSentenceById(sentenceId);
											return (
												<li key={sentenceId} className="text-success">
													{sentence?.text}
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

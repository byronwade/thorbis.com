"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, GripVertical, RotateCcw, Clock } from "lucide-react";
import { TimelineBuilderQuestion } from "@/types/questions";

interface TimelineBuilderRendererProps {
	question: TimelineBuilderQuestion;
	onAnswer: (answer: string[]) => void;
	isAnswered: boolean;
	userAnswer?: string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

interface TimelineEvent {
	id: string;
	title: string;
	description: string;
	originalIndex: number;
}

export function TimelineBuilderRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: TimelineBuilderRendererProps) {
	const [orderedEvents, setOrderedEvents] = useState<TimelineEvent[]>(() => {
		if (userAnswer) {
			// Restore user's order
			return userAnswer
				.map((eventId) => {
					const event = question.events.find((e) => e.id === eventId);
					const originalIndex = question.events.findIndex((e) => e.id === eventId);
					return event ? { ...event, originalIndex } : null;
				})
				.filter(Boolean) as TimelineEvent[];
		}
		// Start with shuffled order
		const eventsWithIndex = question.events.map((event, index) => ({ ...event, originalIndex: index }));
		return [...eventsWithIndex].sort(() => Math.random() - 0.5);
	});

	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	const handleDragStart = useCallback(
		(index: number) => {
			if (disabled || isAnswered) return;
			setDraggedIndex(index);
		},
		[disabled, isAnswered]
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent, index: number) => {
			e.preventDefault();
			if (draggedIndex === null || draggedIndex === index) return;

			const newEvents = [...orderedEvents];
			const draggedEvent = newEvents[draggedIndex];
			newEvents.splice(draggedIndex, 1);
			newEvents.splice(index, 0, draggedEvent);

			setOrderedEvents(newEvents);
			setDraggedIndex(index);
		},
		[draggedIndex, orderedEvents]
	);

	const handleDragEnd = useCallback(() => {
		setDraggedIndex(null);
		const newOrder = orderedEvents.map((event) => event.id);
		onAnswer(newOrder);
	}, [orderedEvents, onAnswer]);

	const moveEvent = (fromIndex: number, toIndex: number) => {
		if (disabled || isAnswered) return;

		const newEvents = [...orderedEvents];
		const [movedEvent] = newEvents.splice(fromIndex, 1);
		newEvents.splice(toIndex, 0, movedEvent);

		setOrderedEvents(newEvents);
		const newOrder = newEvents.map((event) => event.id);
		onAnswer(newOrder);
	};

	const resetOrder = () => {
		const shuffledEvents = [...question.events.map((event, index) => ({ ...event, originalIndex: index }))].sort(() => Math.random() - 0.5);
		setOrderedEvents(shuffledEvents);
		onAnswer([]);
	};

	const getEventStatus = (eventId: string, currentIndex: number) => {
		if (!isAnswered) return "default";

		const correctIndex = question.correctOrder.indexOf(eventId);
		const isCorrectPosition = correctIndex === currentIndex;

		return isCorrectPosition ? "correct" : "incorrect";
	};

	const getScore = () => {
		if (!isAnswered || !userAnswer) return 0;
		const correctPositions = userAnswer.filter((eventId, index) => question.correctOrder[index] === eventId).length;
		return correctPositions;
	};

	const isSequenceCorrect = () => {
		if (!isAnswered || !userAnswer) return false;
		return userAnswer.length === question.correctOrder.length && userAnswer.every((eventId, index) => question.correctOrder[index] === eventId);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Badge variant="secondary">Timeline Builder</Badge>
					<Badge variant="outline">{question.points} points</Badge>
					{question.difficulty && <Badge variant={question.difficulty === "easy" ? "default" : question.difficulty === "medium" ? "secondary" : "destructive"}>{question.difficulty}</Badge>}
				</div>
				<div className="flex items-center space-x-2">
					{isAnswered && (
						<Badge variant={isSequenceCorrect() ? "default" : "secondary"}>
							Score: {getScore()}/{question.correctOrder.length}
						</Badge>
					)}
					{!isAnswered && (
						<Button variant="outline" size="sm" onClick={resetOrder} disabled={disabled}>
							<RotateCcw className="h-4 w-4 mr-2" />
							Shuffle
						</Button>
					)}
				</div>
			</div>

			{/* Instructions */}
			<div className="p-4 bg-blue-50 border border-primary/30 rounded-lg">
				<p className="text-primary text-sm flex items-center">
					<Clock className="h-4 w-4 mr-2" />
					Drag the events to arrange them in the correct chronological order. The earliest event should be at the top.
				</p>
			</div>

			{/* Timeline Events */}
			<div className="space-y-3">
				{orderedEvents.map((event, index) => {
					const status = getEventStatus(event.id, index);
					const isDragging = draggedIndex === index;

					return (
						<Card
							key={event.id}
							className={`transition-all duration-200 ${isDragging ? "opacity-50 scale-105 z-50" : ""} ${status === "correct" ? "border-green-500 bg-green-50" : status === "incorrect" ? "border-red-500 bg-red-50" : "border-border hover:border-border"} ${!isAnswered && !disabled ? "cursor-move hover:shadow-md" : ""}`}
							draggable={!disabled && !isAnswered}
							onDragStart={() => handleDragStart(index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDragEnd={handleDragEnd}
						>
							<CardContent className="p-4">
								<div className="flex items-start space-x-4">
									{/* Drag Handle */}
									{!isAnswered && !disabled && (
										<div className="flex-shrink-0 mt-1">
											<GripVertical className="h-5 w-5 text-muted-foreground" />
										</div>
									)}

									{/* Sequence Number */}
									<div className="flex-shrink-0 mt-1">
										<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${status === "correct" ? "bg-success text-white" : status === "incorrect" ? "bg-destructive text-white" : "bg-muted text-muted-foreground"}`}>{index + 1}</div>
									</div>

									{/* Event Content */}
									<div className="flex-1">
										<h4 className="font-semibold text-foreground mb-1">{event.title}</h4>
										<p className="text-sm text-muted-foreground">{event.description}</p>
									</div>

									{/* Status Icon */}
									{isAnswered && <div className="flex-shrink-0 mt-1">{status === "correct" ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}</div>}

									{/* Move Buttons (Alternative to Drag) */}
									{!isAnswered && !disabled && (
										<div className="flex-shrink-0 flex flex-col space-y-1">
											<Button variant="outline" size="sm" onClick={() => moveEvent(index, Math.max(0, index - 1))} disabled={index === 0} className="h-6 w-6 p-0">
												↑
											</Button>
											<Button variant="outline" size="sm" onClick={() => moveEvent(index, Math.min(orderedEvents.length - 1, index + 1))} disabled={index === orderedEvents.length - 1} className="h-6 w-6 p-0">
												↓
											</Button>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<div className="space-y-3">
					{/* Overall Result */}
					<Card className={`border-2 ${isSequenceCorrect() ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
						<CardContent className="p-4">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0 mt-0.5">{isSequenceCorrect() ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}</div>
								<div className="flex-1">
									<p className={`font-medium mb-1 ${isSequenceCorrect() ? "text-success" : "text-destructive"}`}>{isSequenceCorrect() ? "Perfect Sequence!" : "Sequence Needs Work"}</p>
									<p className={`text-sm ${isSequenceCorrect() ? "text-success" : "text-destructive"}`}>
										You got {getScore()} out of {question.correctOrder.length} events in the correct position.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Correct Order Display */}
					<Card>
						<CardContent className="p-4">
							<h4 className="font-medium text-foreground mb-3">Correct Chronological Order:</h4>
							<div className="space-y-2">
								{question.correctOrder.map((eventId, index) => {
									const event = question.events.find((e) => e.id === eventId);
									if (!event) return null;

									return (
										<div key={eventId} className="flex items-start space-x-3 p-2 bg-green-50 border border-green-200 rounded">
											<div className="w-6 h-6 bg-success text-white rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</div>
											<div>
												<p className="font-medium text-success">{event.title}</p>
												<p className="text-sm text-success">{event.description}</p>
											</div>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* Explanation */}
					<Card>
						<CardContent className="p-4">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0 mt-0.5">
									<Clock className="h-5 w-5 text-primary" />
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

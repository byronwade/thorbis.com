"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Lightbulb, RotateCcw } from "lucide-react";

// Extended question type for word matching
interface WordMatchingQuestion {
	id: string;
	type: "word-matching";
	title: string;
	description?: string;
	points: number;
	difficulty: "easy" | "medium" | "hard";
	explanation: string;
	hints?: string[];
	leftColumn: { id: string; text: string }[];
	rightColumn: { id: string; text: string }[];
	correctMatches: { leftId: string; rightId: string }[];
}

interface WordMatchingRendererProps {
	question: WordMatchingQuestion;
	onAnswer: (answer: { leftId: string; rightId: string }[]) => void;
	isAnswered: boolean;
	userAnswer?: { leftId: string; rightId: string }[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function WordMatchingRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: WordMatchingRendererProps) {
	const [matches, setMatches] = useState<{ leftId: string; rightId: string }[]>(userAnswer || []);
	const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
	const [selectedRight, setSelectedRight] = useState<string | null>(null);

	const handleLeftClick = (leftId: string) => {
		if (disabled || isAnswered) return;

		if (selectedLeft === leftId) {
			setSelectedLeft(null);
		} else {
			setSelectedLeft(leftId);
			// If right item is selected, create match
			if (selectedRight) {
				createMatch(leftId, selectedRight);
			}
		}
	};

	const handleRightClick = (rightId: string) => {
		if (disabled || isAnswered) return;

		if (selectedRight === rightId) {
			setSelectedRight(null);
		} else {
			setSelectedRight(rightId);
			// If left item is selected, create match
			if (selectedLeft) {
				createMatch(selectedLeft, rightId);
			}
		}
	};

	const createMatch = (leftId: string, rightId: string) => {
		// Remove any existing matches for these items
		const newMatches = matches.filter((match) => match.leftId !== leftId && match.rightId !== rightId);
		newMatches.push({ leftId, rightId });

		setMatches(newMatches);
		setSelectedLeft(null);
		setSelectedRight(null);
		onAnswer(newMatches);
	};

	const removeMatch = (leftId: string, rightId: string) => {
		if (disabled || isAnswered) return;

		const newMatches = matches.filter((match) => !(match.leftId === leftId && match.rightId === rightId));
		setMatches(newMatches);
		onAnswer(newMatches);
	};

	const resetMatches = () => {
		setMatches([]);
		setSelectedLeft(null);
		setSelectedRight(null);
		onAnswer([]);
	};

	const getLeftItemStatus = (leftId: string) => {
		const match = matches.find((m) => m.leftId === leftId);
		if (!match) return selectedLeft === leftId ? "selected" : "unmatched";

		if (!isAnswered) return "matched";

		const correctMatch = question.correctMatches.find((cm) => cm.leftId === leftId);
		const isCorrect = correctMatch && correctMatch.rightId === match.rightId;
		return isCorrect ? "correct" : "incorrect";
	};

	const getRightItemStatus = (rightId: string) => {
		const match = matches.find((m) => m.rightId === rightId);
		if (!match) return selectedRight === rightId ? "selected" : "unmatched";

		if (!isAnswered) return "matched";

		const correctMatch = question.correctMatches.find((cm) => cm.rightId === rightId);
		const isCorrect = correctMatch && correctMatch.leftId === match.leftId;
		return isCorrect ? "correct" : "incorrect";
	};

	const getItemClasses = (status: string) => {
		switch (status) {
			case "selected":
				return "bg-primary/10 border-primary text-primary";
			case "matched":
				return "bg-muted border-border text-muted-foreground";
			case "correct":
				return "bg-success/10 border-green-500 text-success";
			case "incorrect":
				return "bg-destructive/10 border-red-500 text-destructive";
			default:
				return "bg-white border-border hover:border-border hover:bg-gray-50";
		}
	};

	const getScore = () => {
		if (!isAnswered) return 0;
		return matches.filter((match) => question.correctMatches.some((cm) => cm.leftId === match.leftId && cm.rightId === match.rightId)).length;
	};

	const drawConnectionLines = () => {
		if (matches.length === 0) return null;

		return (
			<svg className="absolute inset-0 pointer-events-none z-10" style={{ width: "100%", height: "100%" }}>
				{matches.map((match, index) => {
					const leftElement = document.querySelector(`[data-left-id="${match.leftId}"]`);
					const rightElement = document.querySelector(`[data-right-id="${match.rightId}"]`);

					if (!leftElement || !rightElement) return null;

					const leftRect = leftElement.getBoundingClientRect();
					const rightRect = rightElement.getBoundingClientRect();
					const containerRect = leftElement.closest(".word-matching-container")?.getBoundingClientRect();

					if (!containerRect) return null;

					const x1 = leftRect.right - containerRect.left;
					const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
					const x2 = rightRect.left - containerRect.left;
					const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;

					const status = getLeftItemStatus(match.leftId);
					const color = status === "correct" ? "hsl(var(--success))" : status === "incorrect" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))";

					return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeDasharray={status === "matched" ? "5,5" : "none"} opacity={0.8} />;
				})}
			</svg>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Badge variant="secondary">Word Matching</Badge>
					<Badge variant="outline">{question.points} points</Badge>
					{question.difficulty && <Badge variant={question.difficulty === "easy" ? "default" : question.difficulty === "medium" ? "secondary" : "destructive"}>{question.difficulty}</Badge>}
				</div>
				<div className="flex items-center space-x-2">
					{isAnswered && (
						<Badge variant={getScore() === question.correctMatches.length ? "default" : "secondary"}>
							Score: {getScore()}/{question.correctMatches.length}
						</Badge>
					)}
					{!isAnswered && (
						<Button variant="outline" size="sm" onClick={resetMatches} disabled={disabled || matches.length === 0}>
							<RotateCcw className="h-4 w-4 mr-2" />
							Reset
						</Button>
					)}
				</div>
			</div>

			{/* Instructions */}
			<div className="p-4 bg-blue-50 border border-primary/30 rounded-lg">
				<p className="text-primary text-sm">Click on items from both columns to match them. Click on a matched pair to unlink them. {matches.length > 0 && <span className="font-medium">Matched: {matches.length}</span>}</p>
			</div>

			{/* Matching Interface */}
			<Card>
				<CardContent className="p-6">
					<div className="word-matching-container relative">
						{drawConnectionLines()}
						<div className="grid grid-cols-2 gap-8">
							{/* Left Column */}
							<div className="space-y-3">
								<h4 className="font-semibold text-foreground text-center">Terms</h4>
								{question.leftColumn.map((item) => {
									const status = getLeftItemStatus(item.id);
									const match = matches.find((m) => m.leftId === item.id);

									return (
										<div key={item.id} data-left-id={item.id} className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${getItemClasses(status)} ${!isAnswered && !disabled ? "hover:shadow-md" : ""}`} onClick={() => (match ? removeMatch(match.leftId, match.rightId) : handleLeftClick(item.id))}>
											<span className="font-medium">{item.text}</span>
											{isAnswered && <div className="mt-2 flex justify-center">{status === "correct" ? <CheckCircle className="h-4 w-4 text-success" /> : status === "incorrect" ? <XCircle className="h-4 w-4 text-destructive" /> : null}</div>}
										</div>
									);
								})}
							</div>

							{/* Right Column */}
							<div className="space-y-3">
								<h4 className="font-semibold text-foreground text-center">Definitions</h4>
								{question.rightColumn.map((item) => {
									const status = getRightItemStatus(item.id);
									const match = matches.find((m) => m.rightId === item.id);

									return (
										<div key={item.id} data-right-id={item.id} className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${getItemClasses(status)} ${!isAnswered && !disabled ? "hover:shadow-md" : ""}`} onClick={() => (match ? removeMatch(match.leftId, match.rightId) : handleRightClick(item.id))}>
											<span className="text-sm">{item.text}</span>
											{isAnswered && <div className="mt-2 flex justify-center">{status === "correct" ? <CheckCircle className="h-4 w-4 text-success" /> : status === "incorrect" ? <XCircle className="h-4 w-4 text-destructive" /> : null}</div>}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<div className="space-y-3">
					{/* Correct Matches Display */}
					<Card>
						<CardContent className="p-4">
							<h4 className="font-medium text-foreground mb-3">Correct Matches:</h4>
							<div className="space-y-2">
								{question.correctMatches.map((correctMatch) => {
									const leftItem = question.leftColumn.find((item) => item.id === correctMatch.leftId);
									const rightItem = question.rightColumn.find((item) => item.id === correctMatch.rightId);
									const userMatch = matches.find((match) => match.leftId === correctMatch.leftId);
									const isCorrect = userMatch && userMatch.rightId === correctMatch.rightId;

									return (
										<div key={`${correctMatch.leftId}-${correctMatch.rightId}`} className={`flex items-center justify-between p-3 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
											<div className="flex items-center space-x-4">
												<span className="font-medium">{leftItem?.text}</span>
												<span className="text-muted-foreground">→</span>
												<span className="text-sm">{rightItem?.text}</span>
											</div>
											{isCorrect ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
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
									<Lightbulb className="h-5 w-5 text-primary" />
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

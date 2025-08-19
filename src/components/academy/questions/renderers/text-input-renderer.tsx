"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { TextInputQuestion } from "@/types/questions";

interface TextInputRendererProps {
	question: TextInputQuestion;
	onAnswer: (answer: string) => void;
	isAnswered: boolean;
	userAnswer?: string;
	showFeedback?: boolean;
	disabled?: boolean;
}

export function TextInputRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: TextInputRendererProps) {
	const [value, setValue] = useState<string>(userAnswer || "");
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		if (userAnswer !== undefined) {
			setValue(userAnswer);
			setSubmitted(true);
		}
	}, [userAnswer]);

	const handleSubmit = () => {
		if (value.trim()) {
			onAnswer(value.trim());
			setSubmitted(true);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !isAnswered && value.trim()) {
			handleSubmit();
		}
	};

	const isCorrect = () => {
		if (!isAnswered || !userAnswer) return false;

		const userAnswerTrimmed = question.validation.caseSensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase();

		const correctAnswer = question.validation.caseSensitive ? String(question.validation.correctAnswer).trim() : String(question.validation.correctAnswer).trim().toLowerCase();

		// Check exact match
		if (userAnswerTrimmed === correctAnswer) return true;

		// Check acceptable variations
		if (question.validation.acceptableVariations) {
			const variations = question.validation.acceptableVariations.map((v) => (question.validation.caseSensitive ? v.trim() : v.trim().toLowerCase()));
			return variations.includes(userAnswerTrimmed);
		}

		return false;
	};

	const getPartialCredit = () => {
		if (!question.validation.partialCredit || !userAnswer || isCorrect()) return 0;

		const userAnswerLower = userAnswer.toLowerCase().trim();
		const correctAnswerLower = String(question.validation.correctAnswer).toLowerCase().trim();

		// Simple similarity check based on character overlap
		const overlap = [...userAnswerLower].filter((char) => correctAnswerLower.includes(char)).length;
		const similarity = overlap / Math.max(userAnswerLower.length, correctAnswerLower.length);

		return similarity > 0.5 ? Math.round(similarity * 100) : 0;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Badge variant="secondary">Text Input</Badge>
					<Badge variant="outline">{question.points} points</Badge>
					{question.difficulty && <Badge variant={question.difficulty === "easy" ? "default" : question.difficulty === "medium" ? "secondary" : "destructive"}>{question.difficulty}</Badge>}
				</div>
				{isAnswered && (
					<div className="flex items-center space-x-2">
						{isCorrect() ? (
							<Badge variant="default" className="bg-success">
								<CheckCircle className="h-3 w-3 mr-1" />
								Correct
							</Badge>
						) : getPartialCredit() > 0 ? (
							<Badge variant="secondary">{getPartialCredit()}% Partial Credit</Badge>
						) : (
							<Badge variant="destructive">
								<XCircle className="h-3 w-3 mr-1" />
								Incorrect
							</Badge>
						)}
					</div>
				)}
			</div>

			{/* Input Section */}
			<Card>
				<CardContent className="p-6 space-y-4">
					<div className="space-y-3">
						<Input type="text" placeholder={question.placeholder || "Type your answer here..."} value={value} onChange={(e) => !isAnswered && setValue(e.target.value)} onKeyPress={handleKeyPress} disabled={disabled || isAnswered} maxLength={question.maxLength} className={`text-lg py-3 ${isAnswered ? (isCorrect() ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50") : "focus:border-primary"}`} />

						{/* Character count */}
						{question.maxLength && (
							<div className="flex justify-end">
								<span className={`text-xs ${value.length > question.maxLength * 0.9 ? "text-warning" : "text-muted-foreground"}`}>
									{value.length}/{question.maxLength}
								</span>
							</div>
						)}
					</div>

					{/* Submit Button */}
					{!isAnswered && (
						<div className="flex justify-center">
							<Button onClick={handleSubmit} disabled={disabled || !value.trim() || submitted} size="lg" className="px-8">
								Submit Answer
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<div className="space-y-3">
					{/* Answer Comparison */}
					<Card className={`border-2 ${isCorrect() ? "border-green-200 bg-green-50" : getPartialCredit() > 0 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}`}>
						<CardContent className="p-4">
							<div className="space-y-3">
								<div className="flex items-start space-x-3">
									<div className="flex-shrink-0 mt-0.5">
										{isCorrect() ? (
											<CheckCircle className="h-5 w-5 text-success" />
										) : getPartialCredit() > 0 ? (
											<div className="h-5 w-5 rounded-full bg-warning flex items-center justify-center">
												<span className="text-white text-xs font-bold">~</span>
											</div>
										) : (
											<XCircle className="h-5 w-5 text-destructive" />
										)}
									</div>
									<div className="flex-1">
										<p className={`font-medium mb-2 ${isCorrect() ? "text-success" : getPartialCredit() > 0 ? "text-warning" : "text-destructive"}`}>{isCorrect() ? "Correct Answer!" : getPartialCredit() > 0 ? "Partially Correct" : "Incorrect Answer"}</p>

										<div className="space-y-1 text-sm">
											<div>
												<span className="font-medium">Your answer: </span>
												<span className="bg-white px-2 py-1 rounded border">"{userAnswer}"</span>
											</div>
											<div>
												<span className="font-medium">Correct answer: </span>
												<span className="bg-success/10 px-2 py-1 rounded border border-green-200">"{question.validation.correctAnswer}"</span>
											</div>
											{question.validation.acceptableVariations && question.validation.acceptableVariations.length > 0 && (
												<div>
													<span className="font-medium">Also acceptable: </span>
													<div className="flex flex-wrap gap-1 mt-1">
														{question.validation.acceptableVariations.map((variation, index) => (
															<span key={index} className="bg-primary/10 px-2 py-1 rounded border border-primary/30 text-xs">
																"{variation}"
															</span>
														))}
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
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

			{/* Hints (if not answered yet) */}
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

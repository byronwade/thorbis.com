"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { TrueFalseQuestion } from "@/types/questions";

interface TrueFalseRendererProps {
	question: TrueFalseQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: boolean;
	showFeedback?: boolean;
	disabled?: boolean;
}

export function TrueFalseRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: TrueFalseRendererProps) {
	const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(userAnswer ?? null);

	const handleAnswerSelect = (answer: boolean) => {
		if (isAnswered || disabled) return;

		setSelectedAnswer(answer);
		const isCorrect = answer === question.correctAnswer;

		onAnswer({
			value: answer,
			__isCorrect: isCorrect,
		});
	};

	const getButtonStyle = (buttonValue: boolean) => {
		if (!isAnswered && selectedAnswer === buttonValue) {
			return "border-primary bg-blue-50 text-primary";
		}

		if (showFeedback && isAnswered) {
			if (buttonValue === question.correctAnswer) {
				return "border-green-500 bg-green-50 text-success";
			}
			if (selectedAnswer === buttonValue && buttonValue !== question.correctAnswer) {
				return "border-red-500 bg-red-50 text-destructive";
			}
		}

		return "border-border hover:border-border hover:bg-gray-50";
	};

	const getIcon = (buttonValue: boolean) => {
		if (showFeedback && isAnswered) {
			if (buttonValue === question.correctAnswer) {
				return <CheckCircle className="w-5 h-5" />;
			}
			if (selectedAnswer === buttonValue && buttonValue !== question.correctAnswer) {
				return <XCircle className="w-5 h-5" />;
			}
		}

		return buttonValue ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />;
	};

	return (
		<div className="space-y-6">
			{/* Statement */}
			<Card>
				<CardContent className="p-6">
					<p className="text-lg font-medium text-foreground leading-relaxed">{question.statement}</p>
				</CardContent>
			</Card>

			{/* True/False Buttons */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Button variant="outline" size="lg" className={`h-20 text-lg font-semibold transition-all duration-200 ${getButtonStyle(true)}`} onClick={() => handleAnswerSelect(true)} disabled={isAnswered || disabled}>
					<div className="flex items-center space-x-3">
						{getIcon(true)}
						<span>True</span>
					</div>
				</Button>

				<Button variant="outline" size="lg" className={`h-20 text-lg font-semibold transition-all duration-200 ${getButtonStyle(false)}`} onClick={() => handleAnswerSelect(false)} disabled={isAnswered || disabled}>
					<div className="flex items-center space-x-3">
						{getIcon(false)}
						<span>False</span>
					</div>
				</Button>
			</div>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{selectedAnswer === question.correctAnswer ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${selectedAnswer === question.correctAnswer ? "text-success" : "text-destructive"}`}>{selectedAnswer === question.correctAnswer ? "Correct!" : "Incorrect"}</span>
							</div>

							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-muted-foreground">{selectedAnswer === true ? question.trueExplanation : question.falseExplanation}</p>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Additional Information:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

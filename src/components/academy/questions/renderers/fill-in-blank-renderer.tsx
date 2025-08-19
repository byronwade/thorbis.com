"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Edit3 } from "lucide-react";
import { FillInBlankQuestion } from "@/types/questions";

interface FillInBlankRendererProps {
	question: FillInBlankQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function FillInBlankRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: FillInBlankRendererProps) {
	const [answers, setAnswers] = useState<string[]>(userAnswer || new Array(question.blanks.length).fill(""));

	const handleInputChange = (index: number, value: string) => {
		if (isAnswered || disabled) return;

		const newAnswers = [...answers];
		newAnswers[index] = value;
		setAnswers(newAnswers);
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		// Check if all blanks are filled
		const hasEmptyBlanks = answers.some((answer) => answer.trim() === "");
		if (hasEmptyBlanks) return;

		// Check correctness
		const results = question.blanks.map((blank, index) => {
			const userAnswer = answers[index].trim().toLowerCase();
			const isCorrect = blank.acceptableAnswers.some((acceptable) => acceptable.toLowerCase() === userAnswer);

			return {
				index,
				userAnswer: answers[index],
				correct: isCorrect,
				expectedAnswers: blank.acceptableAnswers,
			};
		});

		const allCorrect = results.every((result) => result.correct);

		onAnswer({
			value: answers,
			__isCorrect: allCorrect,
			results,
			score: results.filter((r) => r.correct).length,
			maxScore: question.blanks.length,
		});
	};

	const resetAnswers = () => {
		if (isAnswered || disabled) return;
		setAnswers(new Array(question.blanks.length).fill(""));
	};

	// Parse the text and identify blank positions
	const renderTextWithBlanks = () => {
		const parts = [];
		let lastIndex = 0;

		// Sort blanks by position to process them in order
		const sortedBlanks = [...question.blanks].sort((a, b) => a.position - b.position);

		sortedBlanks.forEach((blank, blankIndex) => {
			// Add text before the blank
			if (blank.position > lastIndex) {
				parts.push(
					<span key={`text-${blankIndex}`} className="text-foreground">
						{question.text.substring(lastIndex, blank.position)}
					</span>
				);
			}

			// Add the input field for the blank
			const inputValue = answers[question.blanks.indexOf(blank)] || "";
			const isCorrect = showFeedback && userAnswer && question.blanks[question.blanks.indexOf(blank)].acceptableAnswers.some((acceptable) => acceptable.toLowerCase() === userAnswer[question.blanks.indexOf(blank)]?.toLowerCase());
			const isIncorrect = showFeedback && userAnswer && !isCorrect && userAnswer[question.blanks.indexOf(blank)]?.trim();

			parts.push(
				<span key={`blank-${blankIndex}`} className="inline-block mx-1">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => handleInputChange(question.blanks.indexOf(blank), e.target.value)}
						disabled={disabled || isAnswered}
						placeholder={`Blank ${question.blanks.indexOf(blank) + 1}`}
						className={`px-2 py-1 border-b-2 focus:outline-none focus:border-primary bg-transparent text-center min-w-[100px] ${isCorrect ? "border-green-500 bg-green-50" : isIncorrect ? "border-red-500 bg-red-50" : "border-border"}`}
						style={{ width: `${Math.max(100, (inputValue.length + 5) * 8)}px` }}
					/>
					{showFeedback && isAnswered && <span className="ml-1">{isCorrect ? <CheckCircle className="w-4 h-4 text-success inline" /> : <XCircle className="w-4 h-4 text-destructive inline" />}</span>}
				</span>
			);

			lastIndex = blank.position + (blank.placeholder?.length || 0);
		});

		// Add remaining text after the last blank
		if (lastIndex < question.text.length) {
			parts.push(
				<span key="text-end" className="text-foreground">
					{question.text.substring(lastIndex)}
				</span>
			);
		}

		return parts;
	};

	const getBlankFeedback = (blankIndex: number) => {
		if (!showFeedback || !isAnswered || !userAnswer) return null;

		const blank = question.blanks[blankIndex];
		const userAnswerText = userAnswer[blankIndex]?.trim();
		const isCorrect = blank.acceptableAnswers.some((acceptable) => acceptable.toLowerCase() === userAnswerText?.toLowerCase());

		if (isCorrect) return null;

		return (
			<div className="mt-1 text-sm">
				<span className="text-destructive">Expected: </span>
				<span className="text-muted-foreground">{blank.acceptableAnswers.join(" or ")}</span>
				{blank.hint && (
					<div className="text-primary mt-1">
						<span className="font-medium">Hint: </span>
						{blank.hint}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center space-x-2 mb-2">
						<Edit3 className="w-5 h-5 text-primary" />
						<h3 className="text-lg font-semibold">Fill in the Blanks</h3>
					</div>
					<p className="text-muted-foreground mb-4">Complete the text by filling in the missing words or phrases.</p>
					<div className="flex items-center space-x-4 text-sm text-muted-foreground">
						<span>Blanks to fill: {question.blanks.length}</span>
						{question.caseSensitive && <span>Case sensitive</span>}
					</div>
				</CardContent>
			</Card>

			{/* Text with blanks */}
			<Card>
				<CardContent className="p-6">
					<div className="text-lg leading-relaxed">{renderTextWithBlanks()}</div>
				</CardContent>
			</Card>

			{/* Blank answers list */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Your Answers</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{question.blanks.map((blank, index) => (
							<div key={index} className="p-3 rounded-lg border bg-gray-50">
								<div className="flex items-center justify-between mb-2">
									<span className="font-medium">Blank {index + 1}</span>
									{showFeedback && isAnswered && userAnswer && <span>{question.blanks[index].acceptableAnswers.some((acceptable) => acceptable.toLowerCase() === userAnswer[index]?.toLowerCase()) ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}</span>}
								</div>
								<input type="text" value={answers[index] || ""} onChange={(e) => handleInputChange(index, e.target.value)} disabled={disabled || isAnswered} placeholder="Enter your answer..." className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-primary" />
								{getBlankFeedback(index)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Controls */}
			{!isAnswered && (
				<div className="flex justify-center space-x-4">
					<Button variant="outline" onClick={resetAnswers} disabled={disabled}>
						Reset
					</Button>
					<Button onClick={handleSubmit} disabled={disabled || answers.some((answer) => answer.trim() === "")}>
						Submit Answers
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
									const correctCount = question.blanks.filter((blank, index) => blank.acceptableAnswers.some((acceptable) => acceptable.toLowerCase() === userAnswer?.[index]?.toLowerCase())).length;
									const isAllCorrect = correctCount === question.blanks.length;

									return (
										<>
											{isAllCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
											<span className={`font-semibold ${isAllCorrect ? "text-success" : "text-destructive"}`}>{isAllCorrect ? "Perfect!" : "Some answers need correction"}</span>
											<span className="text-sm text-muted-foreground">
												({correctCount} / {question.blanks.length} correct)
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

							{/* Detailed results */}
							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Answer Review:</p>
								{question.blanks.map((blank, index) => {
									const userAnswerText = userAnswer?.[index]?.trim();
									const isCorrect = blank.acceptableAnswers.some((acceptable) => acceptable.toLowerCase() === userAnswerText?.toLowerCase());

									return (
										<div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
											<span className="text-muted-foreground">Blank {index + 1}:</span>
											<div className="flex items-center space-x-2">
												<span className={`font-medium ${isCorrect ? "text-success" : "text-destructive"}`}>{userAnswerText || "(empty)"}</span>
												{isCorrect ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

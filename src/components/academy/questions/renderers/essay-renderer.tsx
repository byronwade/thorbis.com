"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText } from "lucide-react";
import { EssayQuestion } from "@/types/questions";

interface EssayRendererProps {
	question: EssayQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: string;
	showFeedback?: boolean;
	disabled?: boolean;
}

export function EssayRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: EssayRendererProps) {
	const [essay, setEssay] = useState(userAnswer || "");
	const [wordCount, setWordCount] = useState(userAnswer ? userAnswer.split(/\s+/).filter((word) => word.length > 0).length : 0);

	const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const text = e.target.value;
		setEssay(text);

		// Count words
		const words = text.split(/\s+/).filter((word) => word.length > 0);
		setWordCount(words.length);
	};

	const handleSubmit = () => {
		if (isAnswered || disabled || essay.trim().length === 0) return;

		onAnswer({
			value: essay,
			__isCorrect: true, // Essays are manually graded
			wordCount,
		});
	};

	const getWordCountColor = () => {
		if (!question.minWords) return "text-muted-foreground";
		if (wordCount < question.minWords) return "text-destructive";
		if (question.maxWords && wordCount > question.maxWords) return "text-destructive";
		return "text-success";
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center space-x-2 mb-2">
						<FileText className="w-5 h-5 text-primary" />
						<h3 className="text-lg font-semibold">Essay Question</h3>
					</div>
					<p className="text-muted-foreground mb-4">{question.prompt}</p>
					<div className="flex items-center space-x-4 text-sm text-muted-foreground">
						{question.minWords && <span>Minimum: {question.minWords} words</span>}
						{question.maxWords && <span>Maximum: {question.maxWords} words</span>}
						{question.timeLimit && <span>Time limit: {Math.floor(question.timeLimit / 60)} minutes</span>}
					</div>
				</CardContent>
			</Card>

			{/* Essay Input */}
			<Card>
				<CardContent className="p-4">
					<textarea value={essay} onChange={handleEssayChange} disabled={disabled || isAnswered} placeholder="Begin writing your essay here..." className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-primary" />

					{/* Word count and status */}
					<div className="flex items-center justify-between mt-2">
						<span className={`text-sm font-medium ${getWordCountColor()}`}>
							Word count: {wordCount}
							{question.minWords && wordCount < question.minWords && ` (${question.minWords - wordCount} more needed)`}
							{question.maxWords && wordCount > question.maxWords && ` (${wordCount - question.maxWords} over limit)`}
						</span>

						{!isAnswered && (
							<Button onClick={handleSubmit} disabled={disabled || essay.trim().length === 0 || (question.minWords && wordCount < question.minWords)}>
								Submit Essay
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Rubric */}
			{question.rubric && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3">Grading Rubric</h3>
						<div className="space-y-3">
							{question.rubric.map((criterion, index) => (
								<div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
									<span className="font-medium">{criterion.criterion}</span>
									<span className="text-sm text-muted-foreground">Max: {criterion.maxPoints} points</span>
								</div>
							))}
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
								<CheckCircle className="w-5 h-5 text-primary" />
								<span className="font-semibold text-primary">Essay Submitted</span>
								<span className="text-sm text-muted-foreground">({wordCount} words)</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Essay Guidelines:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Submission Summary:</p>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>Word count: {wordCount}</li>
									<li>Length requirement: {question.minWords ? `${question.minWords}+ words` : "No minimum"}</li>
									<li>Status: Submitted for manual review</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

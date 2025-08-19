"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { MultipleChoiceQuestion } from "@/types/questions";

interface MultipleChoiceRendererProps {
	question: MultipleChoiceQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: string | string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function MultipleChoiceRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: MultipleChoiceRendererProps) {
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [shuffledOptions, setShuffledOptions] = useState(question.options);

	// Shuffle options if randomizeOrder is enabled
	useEffect(() => {
		if (question.randomizeOrder && !isAnswered) {
			const shuffled = [...question.options].sort(() => Math.random() - 0.5);
			setShuffledOptions(shuffled);
		}
	}, [question.randomizeOrder, question.options, isAnswered]);

	// Initialize selected options from user answer
	useEffect(() => {
		if (userAnswer) {
			setSelectedOptions(Array.isArray(userAnswer) ? userAnswer : [userAnswer]);
		}
	}, [userAnswer]);

	const handleOptionToggle = (optionId: string) => {
		if (disabled || isAnswered) return;

		let newSelection: string[];

		if (question.allowMultiple) {
			newSelection = selectedOptions.includes(optionId) ? selectedOptions.filter((id) => id !== optionId) : [...selectedOptions, optionId];
		} else {
			newSelection = [optionId];
		}

		setSelectedOptions(newSelection);
		onAnswer(question.allowMultiple ? newSelection : newSelection[0]);
	};

	const getOptionStatus = (option: any) => {
		const isSelected = selectedOptions.includes(option.id);
		const isCorrect = option.isCorrect;

		if (!isAnswered) {
			return {
				variant: isSelected ? "default" : "outline",
				className: isSelected ? "bg-primary text-white hover:bg-primary border-primary" : "hover:bg-gray-50 hover:border-border",
			};
		}

		// Show results
		if (isCorrect) {
			return {
				variant: "default",
				className: "bg-success text-white border-green-500",
			};
		}

		if (isSelected && !isCorrect) {
			return {
				variant: "destructive",
				className: "bg-destructive text-white border-red-500",
			};
		}

		return {
			variant: "outline",
			className: "opacity-60",
		};
	};

	const getIcon = (option: any) => {
		if (!isAnswered) return null;

		if (option.isCorrect) {
			return <CheckCircle className="h-5 w-5 text-success" />;
		}

		if (selectedOptions.includes(option.id) && !option.isCorrect) {
			return <XCircle className="h-5 w-5 text-destructive" />;
		}

		return null;
	};

	return (
		<div className="space-y-4">
			{/* Question metadata */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-2">
					<Badge variant="secondary">{question.allowMultiple ? "Multiple Select" : "Single Select"}</Badge>
					<Badge variant="outline">
						{question.points} {question.points === 1 ? "point" : "points"}
					</Badge>
					{question.difficulty && <Badge variant={question.difficulty === "easy" ? "default" : question.difficulty === "medium" ? "secondary" : "destructive"}>{question.difficulty}</Badge>}
				</div>
				{question.timeLimit && <Badge variant="outline">⏱️ {question.timeLimit}s</Badge>}
			</div>

			{/* Options */}
			<div className="space-y-3">
				{shuffledOptions.map((option, index) => {
					const status = getOptionStatus(option);
					const icon = getIcon(option);

					return (
						<Card key={`option-${index}-${option.id}`} className={`cursor-pointer transition-all duration-200 border-2 ${!isAnswered && !disabled ? "hover:shadow-md hover:-translate-y-1" : ""} ${status.className}`} onClick={() => handleOptionToggle(option.id)}>
							<CardContent className="p-4">
								<div className="flex items-start space-x-4">
									<div className="flex items-center space-x-3 flex-1">
										<span className="text-lg font-bold flex-shrink-0 text-muted-foreground">{String.fromCharCode(65 + index)}.</span>
										<span className="text-lg flex-1">{option.text}</span>
									</div>
									{icon && <div className="flex-shrink-0">{icon}</div>}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<div className="mt-6 space-y-3">
					{selectedOptions.map((selectedId) => {
						const selectedOption = question.options.find((opt) => opt.id === selectedId);
						if (!selectedOption?.explanation) return null;

						return (
							<div key={selectedId} className="p-4 bg-blue-50 border border-primary/30 rounded-lg">
								<div className="flex items-start space-x-3">
									<Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
									<div>
										<p className="font-medium text-primary mb-1">Option {selectedOption.text}:</p>
										<p className="text-primary text-sm">{selectedOption.explanation}</p>
									</div>
								</div>
							</div>
						);
					})}

					{/* General explanation */}
					<div className="p-4 bg-gray-50 border border-border rounded-lg">
						<div className="flex items-start space-x-3">
							<Lightbulb className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
							<div>
								<p className="font-medium text-foreground mb-1">Explanation:</p>
								<p className="text-muted-foreground text-sm">{question.explanation}</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Hints (if not answered yet) */}
			{!isAnswered && question.hints && question.hints.length > 0 && (
				<div className="mt-4">
					<details className="group">
						<summary className="cursor-pointer text-sm text-primary hover:text-primary font-medium">💡 Need a hint? Click here</summary>
						<div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
							<p className="text-warning text-sm">{question.hints[0]}</p>
						</div>
					</details>
				</div>
			)}
		</div>
	);
}

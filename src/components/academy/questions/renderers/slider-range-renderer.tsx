"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Target } from "lucide-react";
import { SliderRangeQuestion } from "@/types/questions";

interface SliderRangeRendererProps {
	question: SliderRangeQuestion;
	onAnswer: (answer: number) => void;
	isAnswered: boolean;
	userAnswer?: number;
	showFeedback?: boolean;
	disabled?: boolean;
}

export function SliderRangeRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: SliderRangeRendererProps) {
	const [value, setValue] = useState<number>(userAnswer || question.slider.min);
	const [inputValue, setInputValue] = useState<string>(String(userAnswer || question.slider.min));
	const [showInput, setShowInput] = useState(false);

	useEffect(() => {
		if (userAnswer !== undefined) {
			setValue(userAnswer);
			setInputValue(String(userAnswer));
		}
	}, [userAnswer]);

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseFloat(e.target.value);
		setValue(newValue);
		setInputValue(String(newValue));
		if (!isAnswered) {
			onAnswer(newValue);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputVal = e.target.value;
		setInputValue(inputVal);

		const numValue = parseFloat(inputVal);
		if (!isNaN(numValue) && numValue >= question.slider.min && numValue <= question.slider.max) {
			setValue(numValue);
			if (!isAnswered) {
				onAnswer(numValue);
			}
		}
	};

	const handleInputBlur = () => {
		const numValue = parseFloat(inputValue);
		if (isNaN(numValue)) {
			setInputValue(String(value));
		} else {
			const clampedValue = Math.max(question.slider.min, Math.min(question.slider.max, numValue));
			setValue(clampedValue);
			setInputValue(String(clampedValue));
			if (!isAnswered) {
				onAnswer(clampedValue);
			}
		}
	};

	const isCorrect = () => {
		if (!isAnswered || userAnswer === undefined) return false;
		return Math.abs(userAnswer - question.slider.correctValue) <= question.slider.tolerance;
	};

	const getAccuracyPercentage = () => {
		if (!isAnswered || userAnswer === undefined) return 0;
		const maxError = Math.max(Math.abs(question.slider.max - question.slider.correctValue), Math.abs(question.slider.min - question.slider.correctValue));
		const error = Math.abs(userAnswer - question.slider.correctValue);
		return Math.max(0, Math.round((1 - error / maxError) * 100));
	};

	const getSliderTrackBackground = () => {
		if (!isAnswered) return "";

		const correctValue = question.slider.correctValue;
		const tolerance = question.slider.tolerance;
		const min = question.slider.min;
		const max = question.slider.max;
		const range = max - min;

		const correctMin = Math.max(min, correctValue - tolerance);
		const correctMax = Math.min(max, correctValue + tolerance);

		const correctMinPercent = ((correctMin - min) / range) * 100;
		const correctMaxPercent = ((correctMax - min) / range) * 100;

		return `linear-gradient(to right, 
      hsl(var(--card-foreground)) 0%, 
      hsl(var(--card-foreground)) ${correctMinPercent}%, 
      hsl(var(--muted-foreground)) ${correctMinPercent}%, 
      hsl(var(--muted-foreground)) ${correctMaxPercent}%, 
      hsl(var(--card-foreground)) ${correctMaxPercent}%, 
      hsl(var(--card-foreground)) 100%)`;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Badge variant="secondary">Range Slider</Badge>
					<Badge variant="outline">{question.points} points</Badge>
					{question.difficulty && <Badge variant={question.difficulty === "easy" ? "default" : question.difficulty === "medium" ? "secondary" : "destructive"}>{question.difficulty}</Badge>}
				</div>
				{isAnswered && <Badge variant={isCorrect() ? "default" : "destructive"}>{isCorrect() ? "Correct" : "Incorrect"}</Badge>}
			</div>

			{/* Slider Container */}
			<Card>
				<CardContent className="p-6 space-y-6">
					{/* Current Value Display */}
					<div className="text-center">
						<div className="text-3xl font-bold text-primary mb-2">
							{value.toFixed(question.slider.step < 1 ? 1 : 0)} {question.slider.unit}
						</div>
						{isAnswered && (
							<div className="flex items-center justify-center space-x-2">
								{isCorrect() ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
								<span className={`text-sm font-medium ${isCorrect() ? "text-success" : "text-destructive"}`}>{getAccuracyPercentage()}% accurate</span>
							</div>
						)}
					</div>

					{/* Slider */}
					<div className="relative">
						<div className="flex justify-between text-sm text-muted-foreground mb-2">
							<span>
								{question.slider.min} {question.slider.unit}
							</span>
							<span>
								{question.slider.max} {question.slider.unit}
							</span>
						</div>

						<div className="relative">
							<input
								type="range"
								min={question.slider.min}
								max={question.slider.max}
								step={question.slider.step}
								value={value}
								onChange={handleSliderChange}
								disabled={disabled || isAnswered}
								className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer slider"
								style={{
									background: isAnswered ? getSliderTrackBackground() : "",
								}}
							/>

							{/* Target indicator (shown after answering) */}
							{isAnswered && (
								<div
									className="absolute top-0 h-3 w-1 bg-success rounded transform -translate-x-0.5"
									style={{
										left: `${((question.slider.correctValue - question.slider.min) / (question.slider.max - question.slider.min)) * 100}%`,
									}}
								>
									<div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
										<Target className="h-4 w-4 text-success" />
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Precise Input Toggle */}
					<div className="flex items-center justify-center space-x-4">
						<Button variant="outline" size="sm" onClick={() => setShowInput(!showInput)} disabled={disabled || isAnswered}>
							{showInput ? "Hide" : "Show"} Precise Input
						</Button>
					</div>

					{/* Precise Input */}
					{showInput && (
						<div className="flex items-center justify-center space-x-2">
							<Input type="number" min={question.slider.min} max={question.slider.max} step={question.slider.step} value={inputValue} onChange={handleInputChange} onBlur={handleInputBlur} disabled={disabled || isAnswered} className="w-32 text-center" placeholder="Enter value" />
							<span className="text-sm text-muted-foreground">{question.slider.unit}</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<div className="space-y-3">
					{/* Result Summary */}
					<Card className={`border-2 ${isCorrect() ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
						<CardContent className="p-4">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0 mt-0.5">{isCorrect() ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}</div>
								<div className="flex-1">
									<p className={`font-medium mb-1 ${isCorrect() ? "text-success" : "text-destructive"}`}>{isCorrect() ? "Correct Answer!" : "Incorrect Answer"}</p>
									<div className={`text-sm ${isCorrect() ? "text-success" : "text-destructive"}`}>
										<p>
											Your answer:{" "}
											<strong>
												{userAnswer} {question.slider.unit}
											</strong>
										</p>
										<p>
											Correct answer:{" "}
											<strong>
												{question.slider.correctValue} {question.slider.unit}
											</strong>
										</p>
										<p>
											Tolerance:{" "}
											<strong>
												±{question.slider.tolerance} {question.slider.unit}
											</strong>
										</p>
										{userAnswer !== undefined && (
											<p>
												Difference:{" "}
												<strong>
													{Math.abs(userAnswer - question.slider.correctValue).toFixed(2)} {question.slider.unit}
												</strong>
											</p>
										)}
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
									<Target className="h-5 w-5 text-primary" />
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

			{/* CSS for custom slider styling */}
			<style jsx>{`
				.slider::-webkit-slider-thumb {
					appearance: none;
					height: 20px;
					width: 20px;
					border-radius: 50%;
					background: hsl(var(--primary));
					cursor: pointer;
					border: 2px solid white;
					box-shadow: 0 2px 4px hsl(var(--foreground) / 0.2);
				}

				.slider::-moz-range-thumb {
					height: 20px;
					width: 20px;
					border-radius: 50%;
					background: hsl(var(--primary));
					cursor: pointer;
					border: 2px solid white;
					box-shadow: 0 2px 4px hsl(var(--foreground) / 0.2);
				}

				.slider:disabled::-webkit-slider-thumb {
					background: hsl(var(--muted-foreground));
					cursor: not-allowed;
				}

				.slider:disabled::-moz-range-thumb {
					background: hsl(var(--muted-foreground));
					cursor: not-allowed;
				}
			`}</style>
		</div>
	);
}

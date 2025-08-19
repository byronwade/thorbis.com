"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@features/auth";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@components/ui/dialog";
import { Check, X, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

// Import courses data
import { courses } from "@data/academy/courses";

// Import question renderers (we'll create a simple one for now)
import QuestionRenderer from "@components/academy/questions/question-renderer";

/**
 * Full-screen immersive learning interface
 * No main header - custom learning toolbar only
 */
export default function LearnPage() {
	return (
		<ProtectedRoute requireEmailVerification={true}>
			<LearnInterface />
		</ProtectedRoute>
	);
}

/**
 * UserAnswer object structure:
 * {
 *   questionId: string,
 *   answer: string | number,
 *   isCorrect: boolean
 * }
 */

function LearnInterface() {
	const params = useParams();
	const courseId = params.id;
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState([]);
	const [showExplanation, setShowExplanation] = useState(false);
	const [isAnswered, setIsAnswered] = useState(false);
	const [isCompleteOpen, setIsCompleteOpen] = useState(false);

	const course = courses.find((c) => c.id === courseId);

	// Mock questions data (flatten from chapters)
	const allQuestions = [
		{
			id: "q1",
			title: "What is the main function of a P-trap?",
			type: "multiple-choice",
			options: ["To increase water pressure", "To prevent sewer gases from entering the building", "To filter water", "To regulate water temperature"],
			correctAnswer: 1,
			explanation: "A P-trap holds water that creates a seal preventing sewer gases from entering the building through the drain.",
		},
		{
			id: "q2",
			title: "Which pipe material is most commonly used for water supply lines?",
			type: "multiple-choice",
			options: ["Cast iron", "PVC", "Copper", "Lead"],
			correctAnswer: 2,
			explanation: "Copper is the most common material for water supply lines due to its durability and resistance to corrosion.",
		},
		{
			id: "q3",
			title: "Is it safe to use chemical drain cleaners on all types of pipes?",
			type: "true-false",
			correctAnswer: "false",
			explanation: "Chemical drain cleaners can damage certain pipe materials, especially older pipes or those made of certain plastics.",
		},
	];

	const currentQuestion = allQuestions[currentQuestionIndex];
	const totalQuestions = allQuestions.length;
	const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

	// Check if current question is already answered
	useEffect(() => {
		if (currentQuestion) {
			const existingAnswer = userAnswers.find((a) => a.questionId === currentQuestion.id);
			setIsAnswered(!!existingAnswer);
			setShowExplanation(!!existingAnswer);
		}
	}, [currentQuestionIndex, userAnswers, currentQuestion]);

	const handlePrevious = useCallback(() => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
			setShowExplanation(false);
			setIsAnswered(false);
		}
	}, [currentQuestionIndex]);

	const handleNext = useCallback(() => {
		if (currentQuestionIndex < totalQuestions - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setShowExplanation(false);
			setIsAnswered(false);
		} else {
			// Course completed
			setIsCompleteOpen(true);
		}
	}, [currentQuestionIndex, totalQuestions]);

	const handleAnswer = (answer) => {
		if (!currentQuestion || isAnswered) return;

		let isCorrect = false;
		if (currentQuestion.correctAnswer !== undefined) {
			isCorrect = currentQuestion.correctAnswer === answer;
		}

		const newAnswer = {
			questionId: currentQuestion.id,
			answer,
			isCorrect,
		};

		setUserAnswers((prev) => [...prev.filter((a) => a.questionId !== currentQuestion.id), newAnswer]);
		setIsAnswered(true);
		setShowExplanation(true);
	};

	const getCurrentAnswer = () => {
		return userAnswers.find((a) => a.questionId === currentQuestion?.id);
	};

	const getCorrectAnswers = () => {
		return userAnswers.filter((a) => a.isCorrect).length;
	};

	const getScorePercentage = () => {
		if (userAnswers.length === 0) return 0;
		return Math.round((getCorrectAnswers() / userAnswers.length) * 100);
	};

	if (!course) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<p className="text-xl">Course not found</p>
					<Button asChild>
						<Link href="/dashboard/academy/courses">Back to Courses</Link>
					</Button>
				</div>
			</div>
		);
	}

	if (!currentQuestion) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<p className="text-xl">No questions available for this course.</p>
					<Button asChild>
						<Link href={`/dashboard/academy/courses/${courseId}`}>Back to Course</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Custom Toolbar - Full Screen Learning Interface */}
			<header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 md:px-6 py-3 md:py-4 shadow-sm">
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-4">
						<Button asChild variant="ghost" size="sm" className="hover:bg-accent">
							<Link href={`/dashboard/academy/courses/${courseId}`}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Exit
							</Link>
						</Button>
						<div className="h-6 w-px bg-border" />
						<span className="font-semibold text-foreground">{course.title}</span>
					</div>

					<div className="flex-1 flex items-center justify-center max-w-2xl space-x-4">
						<span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
							Question {currentQuestionIndex + 1} of {totalQuestions}
						</span>
						<div className="flex-1 flex flex-col space-y-1">
							<Progress value={progress} className="h-3" />
						</div>
						<span className="text-sm font-medium text-primary whitespace-nowrap">{Math.round(progress)}%</span>
					</div>

					<div className="flex items-center space-x-4">
						<div className="text-right">
							<div className="text-sm font-medium text-foreground">
								Score: {getCorrectAnswers()}/{userAnswers.length}
							</div>
							{userAnswers.length > 0 && <div className="text-xs text-muted-foreground">{getScorePercentage()}% correct</div>}
						</div>
					</div>
				</div>
			</header>

			{/* Main content */}
			<div className="flex-1 flex flex-col">
				<div className="flex-1 overflow-y-auto flex items-center justify-center p-4 md:p-8">
					<Card className="w-full max-w-4xl md:min-h-[400px]">
						<CardContent className="p-8">
							<div className="space-y-8 h-full flex flex-col">
								<div className="text-center">
									<div className="mb-6 space-y-2 text-center">
										<h1 className="text-2xl font-bold leading-relaxed">{currentQuestion.title || currentQuestion.question || "Untitled Question"}</h1>
										{currentQuestion.description && <p className="text-muted-foreground max-w-2xl mx-auto">{currentQuestion.description}</p>}
									</div>
								</div>

								<QuestionRenderer question={currentQuestion} onAnswer={handleAnswer} isAnswered={isAnswered} userAnswer={getCurrentAnswer()?.answer} showFeedback={showExplanation} />

								{showExplanation && (
									<Alert variant={getCurrentAnswer()?.isCorrect ? "default" : "destructive"}>
										{getCurrentAnswer()?.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
										<AlertTitle>{getCurrentAnswer()?.isCorrect ? "Correct!" : "Incorrect"}</AlertTitle>
										<AlertDescription>{currentQuestion.explanation}</AlertDescription>
									</Alert>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Navigation Bar */}
				<div className="sticky bottom-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border p-4 md:p-6 shadow-lg">
					<div className="flex justify-between items-center">
						<Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline" className="min-w-[100px] disabled:opacity-50">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Previous
						</Button>

						<div className="flex items-center space-x-2">
							{Array.from({ length: totalQuestions }, (_, i) => {
								const answered = userAnswers.find((a) => a.questionId === allQuestions[i]?.id);
								return (
									<div
										key={i}
										className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${i === currentQuestionIndex ? "bg-primary ring-2 ring-primary/50 ring-offset-1" : answered ? (answered.isCorrect ? "bg-success" : "bg-destructive") : "bg-muted hover:bg-muted-foreground/20"}`}
										onClick={() => {
											setCurrentQuestionIndex(i);
											setShowExplanation(false);
											setIsAnswered(false);
										}}
										title={`Question ${i + 1}${answered ? ` - ${answered.isCorrect ? "Correct" : "Incorrect"}` : ""}`}
									/>
								);
							})}
						</div>

						<Button onClick={handleNext} disabled={!isAnswered} className="min-w-[100px] disabled:opacity-50">
							{currentQuestionIndex === totalQuestions - 1 ? "Finish" : "Next"}
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Completion Dialog */}
			<Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader className="text-center space-y-4">
						<div className="mx-auto">
							<CheckCircle className="h-16 w-16 text-success" />
						</div>
						<DialogTitle className="text-2xl">Course Complete!</DialogTitle>
						<DialogDescription className="text-lg">Congratulations! You&apos;ve completed {course.title}</DialogDescription>
					</DialogHeader>
					<div className="space-y-6 text-center">
						<div className="space-y-2">
							<p className="text-2xl font-bold">Final Score: {getScorePercentage()}%</p>
							<p className="text-muted-foreground">
								{getCorrectAnswers()} correct out of {userAnswers.length} questions
							</p>
						</div>
						<div className="flex space-x-4 w-full">
							<Button asChild variant="outline" className="flex-1">
								<Link href={`/dashboard/academy/courses/${courseId}`}>Back to Course</Link>
							</Button>
							<Button asChild className="flex-1">
								<Link href="/dashboard/academy">Dashboard</Link>
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
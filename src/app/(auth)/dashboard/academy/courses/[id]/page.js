"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@features/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { BookOpen, Clock, Users, Play, CheckCircle, Lock, Trophy, Target, ChevronLeft, ChevronRight, Award, Zap, Brain, Lightbulb } from "lucide-react";
import Link from "next/link";

// Import courses data from shared location
import { courses } from "@data/academy/courses";

/**
 * Individual course overview page
 * Shows course details, progress, and chapter navigation
 */
export default function CourseDetailPage() {
	return (
		<ProtectedRoute requireEmailVerification={true}>
			<CourseDetailContent />
		</ProtectedRoute>
	);
}

function CourseDetailContent() {
	const params = useParams();
	const courseId = params.id;

	// Find the course
	const course = courses.find((c) => c.id === courseId);

	// Mock user progress
	const userProgress = {
		"plumbing-beginner": 30,
		"hvac-ce": 10,
		"electrical-master": 0,
	};

	const progress = userProgress[courseId] ?? 0;
	const isStarted = progress > 0;
	const isCompleted = progress === 100;

	// Mock chapters with progress
	const chapters = course?.chapters || [
		{ id: "chapter-1", title: "Introduction to Plumbing", duration: "15 min", completed: true, locked: false },
		{ id: "chapter-2", title: "Basic Tools and Equipment", duration: "20 min", completed: true, locked: false },
		{ id: "chapter-3", title: "Pipe Types and Materials", duration: "25 min", completed: false, locked: false, current: true },
		{ id: "chapter-4", title: "Basic Installation Techniques", duration: "30 min", completed: false, locked: false },
		{ id: "chapter-5", title: "Troubleshooting Common Issues", duration: "35 min", completed: false, locked: true },
		{ id: "chapter-6", title: "Advanced Repair Methods", duration: "40 min", completed: false, locked: true },
	];

	if (!course) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 lg:px-24 py-8">
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">Course not found</h3>
							<p className="text-muted-foreground mb-4">The course you&apos;re looking for doesn&apos;t exist.</p>
							<Button asChild>
								<Link href="/dashboard/academy/courses">
									<ChevronLeft className="w-4 h-4 mr-2" />
									Back to Courses
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const completedChapters = chapters.filter((c) => c.completed).length;
	const courseProgress = (completedChapters / chapters.length) * 100;

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 lg:px-24 py-8 space-y-8">
				{/* Breadcrumb */}
				<div className="flex items-center space-x-2 text-sm text-muted-foreground">
					<Link href="/dashboard/academy" className="hover:text-foreground">
						Academy
					</Link>
					<ChevronRight className="w-4 h-4" />
					<Link href="/dashboard/academy/courses" className="hover:text-foreground">
						Courses
					</Link>
					<ChevronRight className="w-4 h-4" />
					<span className="text-foreground">{course.title}</span>
				</div>

				{/* Course Header */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						<Card className="overflow-hidden">
							<div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
								<div className="absolute inset-0 bg-black/20" />
								<div className="absolute bottom-6 left-6 text-white">
									<div className="flex items-center space-x-2 mb-2">
										<Badge variant="secondary" className="bg-white/20 text-white border-0">
											{course.level}
										</Badge>
										<Badge variant="secondary" className="bg-white/20 text-white border-0">
											{course.category}
										</Badge>
										{isCompleted && (
											<Badge variant="secondary" className="bg-success/80 text-white border-0">
												<Trophy className="w-3 h-3 mr-1" />
												Completed
											</Badge>
										)}
									</div>
									<h1 className="text-3xl font-bold mb-2">{course.title}</h1>
									<p className="text-primary/70 text-lg">{course.description}</p>
								</div>
							</div>
							<CardContent className="p-6">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
									<div className="text-center">
										<BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
										<div className="text-sm font-medium">{chapters.length} Chapters</div>
										<div className="text-xs text-muted-foreground">Learn at your pace</div>
									</div>
									<div className="text-center">
										<Clock className="w-8 h-8 mx-auto mb-2 text-success" />
										<div className="text-sm font-medium">{course.duration || "Self-paced"}</div>
										<div className="text-xs text-muted-foreground">Estimated time</div>
									</div>
									<div className="text-center">
										<Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
										<div className="text-sm font-medium">2,450+</div>
										<div className="text-xs text-muted-foreground">Students enrolled</div>
									</div>
									<div className="text-center">
										<Award className="w-8 h-8 mx-auto mb-2 text-warning" />
										<div className="text-sm font-medium">Certificate</div>
										<div className="text-xs text-muted-foreground">Upon completion</div>
									</div>
								</div>

								{/* Progress Section */}
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold">Your Progress</h3>
										<span className="text-sm text-muted-foreground">
											{completedChapters} of {chapters.length} chapters
										</span>
									</div>
									<Progress value={courseProgress} className="h-3" />
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">{Math.round(courseProgress)}% Complete</span>
										{courseProgress > 0 && <span className="text-success font-medium">Keep it up! 🎉</span>}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions Sidebar */}
					<div className="space-y-6">
						{/* Start/Continue Learning */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Play className="w-5 h-5 text-primary" />
									{isStarted ? "Continue Learning" : "Start Learning"}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<Button asChild size="lg" className="w-full">
									<Link href={`/dashboard/academy/courses/${courseId}/learn`}>
										<Play className="w-4 h-4 mr-2" />
										{isStarted ? "Continue Course" : "Start Course"}
									</Link>
								</Button>
								{isStarted && (
									<Button asChild variant="outline" className="w-full">
										<Link href={`/dashboard/academy/courses/${courseId}/practice`}>
											<Target className="w-4 h-4 mr-2" />
											Practice Quiz
										</Link>
									</Button>
								)}
							</CardContent>
						</Card>

						{/* Learning Path */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lightbulb className="w-5 h-5 text-warning" />
									Learning Features
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-primary/20 rounded-lg">
									<Brain className="w-5 h-5 text-primary" />
									<div>
										<div className="font-medium text-sm">AI Tutor</div>
										<div className="text-xs text-muted-foreground">Get instant help</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-success/20 rounded-lg">
									<Target className="w-5 h-5 text-success" />
									<div>
										<div className="font-medium text-sm">Practice Tests</div>
										<div className="text-xs text-muted-foreground">Test your knowledge</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
									<Trophy className="w-5 h-5 text-purple-600" />
									<div>
										<div className="font-medium text-sm">Achievements</div>
										<div className="text-xs text-muted-foreground">Earn badges & XP</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Course Chapters */}
				<Card>
					<CardHeader>
						<CardTitle>Course Chapters</CardTitle>
						<CardDescription>Complete chapters in order to unlock the next lesson</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{chapters.map((chapter, index) => (
								<div key={chapter.id} className={`flex items-center p-4 border rounded-lg transition-all ${chapter.current ? "border-primary bg-blue-50 dark:bg-primary/20" : chapter.completed ? "border-green-200 bg-green-50 dark:bg-success/20" : chapter.locked ? "border-border bg-muted/50 opacity-60" : "border-border hover:bg-accent"}`}>
									<div className="flex items-center space-x-4 flex-1">
										<div className={`w-10 h-10 rounded-full flex items-center justify-center ${chapter.completed ? "bg-success text-white" : chapter.current ? "bg-primary text-white" : chapter.locked ? "bg-muted text-muted-foreground" : "bg-muted/80 text-muted-foreground"}`}>{chapter.completed ? <CheckCircle className="w-5 h-5" /> : chapter.locked ? <Lock className="w-5 h-5" /> : <span className="font-medium">{index + 1}</span>}</div>

										<div className="flex-1">
											<h4 className={`font-medium ${chapter.locked ? "text-muted-foreground" : ""}`}>{chapter.title}</h4>
											<div className="flex items-center space-x-4 text-sm text-muted-foreground">
												<span className="flex items-center">
													<Clock className="w-3 h-3 mr-1" />
													{chapter.duration}
												</span>
												{chapter.completed && (
													<span className="flex items-center text-success">
														<CheckCircle className="w-3 h-3 mr-1" />
														Completed
													</span>
												)}
												{chapter.current && (
													<span className="flex items-center text-primary">
														<Zap className="w-3 h-3 mr-1" />
														Current
													</span>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center space-x-2">
										{!chapter.locked && (
											<Button variant={chapter.current ? "default" : "outline"} size="sm" asChild>
												<Link href={`/dashboard/academy/courses/${courseId}/learn/${chapter.id}`}>{chapter.completed ? "Review" : "Learn"}</Link>
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
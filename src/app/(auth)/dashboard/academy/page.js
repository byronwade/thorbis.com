import React from "react";
import { ProtectedRoute } from "@features/auth";
import { DashboardStats, DashboardQuickActions } from "@components/dashboard/dashboard-layout";
import { PERMISSIONS } from "@lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { BookOpen, Clock, Play, Target } from "lucide-react";
import Link from "next/link";

// Import courses data from shared location
import { courses } from "@data/academy/courses";

/**
 * Academy dashboard page for learners
 * Shows learning progress and course management tools
 */
export default function AcademyDashboardPage() {
	return (
		<ProtectedRoute requireEmailVerification={true}>
			<AcademyDashboardContent />
		</ProtectedRoute>
	);
}

function AcademyDashboardContent() {
	const userProgress = {
		"plumbing-beginner": 30,
		"hvac-ce": 10,
		"electrical-master": 0,
	};

	const completedCourses = Object.values(userProgress).filter((progress) => progress === 100).length;
	const inProgressCourses = Object.values(userProgress).filter((progress) => progress > 0 && progress < 100).length;
	const totalCourses = courses.length;
	const averageProgress = Object.values(userProgress).reduce((acc, curr) => acc + curr, 0) / totalCourses;

	// Academy stats for the stats component
	const academyStats = [
		{
			title: "Total Courses",
			value: totalCourses.toString(),
			change: "+2 new this month",
			icon: "BookOpen",
		},
		{
			title: "Completed",
			value: completedCourses.toString(),
			change: `+${completedCourses} this week`,
			icon: "Trophy",
		},
		{
			title: "In Progress",
			value: inProgressCourses.toString(),
			change: "Currently studying",
			icon: "Clock",
		},
		{
			title: "Overall Progress",
			value: `${Math.round(averageProgress)}%`,
			change: "+5% from last week",
			icon: "TrendingUp",
		},
	];

	const quickActions = [
		{
			title: "Browse Courses",
			description: "Explore available courses",
			href: "/dashboard/academy/courses",
			icon: "BookOpen",
			permission: PERMISSIONS.PROFILE_READ,
		},
		{
			title: "Practice Tests",
			description: "Test your knowledge",
			href: "/dashboard/academy/practice",
			icon: "Target",
			permission: PERMISSIONS.PROFILE_READ,
		},
		{
			title: "View Progress",
			description: "Track your learning",
			href: "/dashboard/academy/progress",
			icon: "BarChart3",
			permission: PERMISSIONS.PROFILE_READ,
		},
		{
			title: "AI Tutor",
			description: "Get personalized help",
			href: "/dashboard/academy/ai-tutor",
			icon: "Brain",
			permission: PERMISSIONS.PROFILE_READ,
		},
	];

	// Mock recent courses
	const recentCourses = courses.slice(0, 3).map((course) => ({
		...course,
		progress: userProgress[course.id] ?? 0,
	}));

	return (
		<div className="min-h-screen bg-background">
			<div className="container px-4 py-8 mx-auto space-y-8 lg:px-24">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Learning Dashboard</h2>
					<p className="text-muted-foreground">Track your progress and continue your professional development.</p>
				</div>

				<DashboardStats stats={academyStats} />

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					{/* Course Progress */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex justify-between items-center">
									<span>Continue Learning</span>
									<Button size="sm" asChild>
										<Link href="/dashboard/academy/courses">
											<BookOpen className="mr-2 w-4 h-4" />
											Browse All
										</Link>
									</Button>
								</CardTitle>
								<CardDescription>Pick up where you left off in your courses</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{recentCourses.map((course) => {
									const isStarted = course.progress > 0;
									const isCompleted = course.progress === 100;

									return (
										<div key={course.id} className="flex justify-between items-center p-4 rounded-lg border border-border bg-card">
											<div className="flex items-center space-x-4">
												<div className="flex justify-center items-center w-12 h-12 font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">{course.title.charAt(0)}</div>
												<div>
													<div className="flex items-center space-x-2">
														<h3 className="font-semibold">{course.title}</h3>
														{isCompleted && (
															<Badge variant="default" className="text-xs">
																Completed
															</Badge>
														)}
														<Badge variant={isStarted ? "secondary" : "outline"} className="text-xs">
															{isStarted ? "In Progress" : "Not Started"}
														</Badge>
													</div>
													<div className="flex items-center space-x-4 text-sm text-muted-foreground">
														<span className="flex items-center">
															<BookOpen className="mr-1 w-3 h-3" />
															{course.chapters?.length || 5} chapters
														</span>
														<span className="flex items-center">
															<Clock className="mr-1 w-3 h-3" />
															{course.duration || "Self-paced"}
														</span>
													</div>
													<div className="flex items-center mt-1 space-x-4">
														<div className="flex items-center space-x-2">
															<Progress value={course.progress} className="w-24 h-2" />
															<span className="text-sm text-muted-foreground">{course.progress}%</span>
														</div>
													</div>
												</div>
											</div>
											<div className="flex items-center space-x-2">
												<Button variant="outline" size="sm" asChild>
													<Link href={`/dashboard/academy/courses/${course.id}`}>
														<Play className="mr-1 w-3 h-3" />
														{isStarted ? "Continue" : "Start"}
													</Link>
												</Button>
												{isStarted && (
													<Button variant="outline" size="sm" asChild>
														<Link href={`/dashboard/academy/courses/${course.id}/practice`}>
															<Target className="mr-1 w-3 h-3" />
															Practice
														</Link>
													</Button>
												)}
											</div>
										</div>
									);
								})}
							</CardContent>
						</Card>
					</div>

					{/* Quick actions */}
					<div>
						<DashboardQuickActions actions={quickActions} />

						{/* Recent activity */}
						<Card className="mt-6">
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-success rounded-full"></div>
										<div className="flex-1">
											<p className="text-sm">Completed &ldquo;Plumbing Tools Overview&rdquo;</p>
											<p className="text-xs text-muted-foreground">2 hours ago</p>
										</div>
									</div>
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<div className="flex-1">
											<p className="text-sm">Started &ldquo;HVAC Energy Efficiency&rdquo;</p>
											<p className="text-xs text-muted-foreground">1 day ago</p>
										</div>
									</div>
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 bg-warning rounded-full"></div>
										<div className="flex-1">
											<p className="text-sm">Earned &ldquo;7-Day Learning Streak&rdquo; badge</p>
											<p className="text-xs text-muted-foreground">3 days ago</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
"use client";

import React, { useState } from "react";
// import { ProtectedRoute } from "@features/auth";
import { DashboardStats } from "@components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { BookOpen, Clock, Users, Star, Search, Play, CheckCircle, Grid, List } from "lucide-react";

// Import courses data from shared location
import { courses } from "@data/academy/courses";

/**
 * Academy courses page for browsing all available courses
 * Shows course catalog with filtering and search
 */
export default function AcademyCoursesPage() {
	return <AcademyCoursesContent />;
}

function AcademyCoursesContent() {
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [levelFilter, setLevelFilter] = useState("all");
	const [viewMode, setViewMode] = useState("grid");

	const userProgress = {
		"plumbing-beginner": 30,
		"hvac-ce": 10,
		"electrical-master": 0,
	};

	// Filter courses based on search and filters
	const filteredCourses = courses.filter((course) => {
		const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
		const matchesLevel = levelFilter === "all" || course.level === levelFilter;

		return matchesSearch && matchesCategory && matchesLevel;
	});

	const getProgressIcon = (progress) => {
		if (progress === 100) return <CheckCircle className="w-5 h-5 text-success" />;
		if (progress > 0) return <Play className="w-5 h-5 text-primary" />;
		return <BookOpen className="w-5 h-5 text-muted-foreground" />;
	};

	// Course stats
	const courseStats = [
		{
			title: "Total Courses",
			value: courses.length.toString(),
			change: "+2 new this month",
			icon: "BookOpen",
		},
		{
			title: "Completed",
			value: Object.values(userProgress)
				.filter((p) => p === 100)
				.length.toString(),
			change: "Great progress!",
			icon: "Trophy",
		},
		{
			title: "In Progress",
			value: Object.values(userProgress)
				.filter((p) => p > 0 && p < 100)
				.length.toString(),
			change: "Keep it up!",
			icon: "Clock",
		},
		{
			title: "Available",
			value: (courses.length - Object.keys(userProgress).length).toString(),
			change: "Ready to start",
			icon: "Star",
		},
	];

	return (
		<div className="min-h-screen bg-background">
			<div className="w-full px-4 py-8 space-y-8 sm:px-6 lg:px-8">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Course Catalog</h2>
					<p className="text-muted-foreground">Discover courses to advance your contractor skills</p>
				</div>

				<DashboardStats stats={courseStats} />

				{/* Search and Filters */}
				<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
					<div className="flex flex-1 gap-4 items-center">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
						</div>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								<SelectItem value="plumbing">Plumbing</SelectItem>
								<SelectItem value="hvac">HVAC</SelectItem>
								<SelectItem value="electrical">Electrical</SelectItem>
							</SelectContent>
						</Select>
						<Select value={levelFilter} onValueChange={setLevelFilter}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Levels</SelectItem>
								<SelectItem value="Beginner">Beginner</SelectItem>
								<SelectItem value="Intermediate">Intermediate</SelectItem>
								<SelectItem value="Advanced">Advanced</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center gap-2">
						<Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
							<Grid className="w-4 h-4 mr-2" />
							Grid
						</Button>
						<Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
							<List className="w-4 h-4 mr-2" />
							List
						</Button>
					</div>
				</div>

				{/* Courses Grid/List */}
				{filteredCourses.length > 0 ? (
					<div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
						{filteredCourses.map((course) => {
							const progress = userProgress[course.id] ?? 0;
							const isStarted = progress > 0;
							const isCompleted = progress === 100;

							if (viewMode === "list") {
								return (
									<Card key={course.id} className="hover:shadow-lg transition-shadow">
										<CardContent className="p-6">
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-4">
													<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">{course.title.charAt(0)}</div>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-2">
															<h3 className="text-xl font-semibold">{course.title}</h3>
															<Badge variant={course.level === "Beginner" ? "secondary" : course.level === "Advanced" ? "default" : "outline"}>{course.level}</Badge>
															{isCompleted && <Star className="h-4 w-4 text-warning fill-current" />}
														</div>
														<p className="text-muted-foreground mb-2">{course.description}</p>
														<div className="flex items-center gap-4 text-sm text-muted-foreground">
															<span className="flex items-center gap-1">
																<BookOpen className="w-4 h-4" />
																{course.chapters?.length || 5} chapters
															</span>
															<span className="flex items-center gap-1">
																<Clock className="w-4 h-4" />
																{course.duration || "Self-paced"}
															</span>
															<span className="flex items-center gap-1">
																<Users className="w-4 h-4" />
																{course.level}
															</span>
														</div>
													</div>
												</div>
												<div className="flex items-center space-x-4">
													<div className="text-right min-w-[100px]">
														<div className="flex items-center justify-end gap-2 mb-1">
															{getProgressIcon(progress)}
															<span className="text-sm font-medium">{progress}%</span>
														</div>
														<Progress value={progress} className="w-24 h-2" />
													</div>
													<Button asChild size="sm">
														<a href={`/dashboard/academy/courses/${course.id}`}>{isStarted ? "Continue" : "Start Course"}</a>
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								);
							}

							return (
								<Card key={course.id} className="hover:shadow-lg transition-shadow">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div>
												<CardTitle className="text-lg">{course.title}</CardTitle>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant={course.level === "Beginner" ? "secondary" : course.level === "Advanced" ? "default" : "outline"}>{course.level}</Badge>
													{isCompleted && <Star className="h-4 w-4 text-warning fill-current" />}
												</div>
											</div>
											{getProgressIcon(progress)}
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription className="mb-4">{course.description}</CardDescription>
										<div className="space-y-3">
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<BookOpen className="w-4 h-4" />
													{course.chapters?.length || 5} chapters
												</span>
												<span className="flex items-center gap-1">
													<Clock className="w-4 h-4" />
													{course.duration || "Self-paced"}
												</span>
											</div>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Progress</span>
													<span>{progress}%</span>
												</div>
												<Progress value={progress} className="h-2" />
											</div>
											<Button asChild className="w-full">
												<a href={`/dashboard/academy/courses/${course.id}`}>
													<Play className="w-4 h-4 mr-2" />
													{isStarted ? "Continue Course" : "Start Course"}
												</a>
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				) : (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No courses found</h3>
							<p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
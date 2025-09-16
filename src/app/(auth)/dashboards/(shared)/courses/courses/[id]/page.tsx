"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle, 
  Lock,
  Trophy,
  Target,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const courseData: Record<string, unknown> = {
  "1": {
    id: 1,
    title: "Plumbing Fundamentals",
    description: "Master the basics of plumbing installation and repair with hands-on exercises and real-world scenarios.",
    category: "plumbing",
    difficulty: "Beginner",
    duration: "4 hours",
    lessons: 12,
    enrolled: 234,
    rating: 4.8,
    instructor: "Mike Rodriguez",
    progress: 25,
    xpReward: 500,
    modules: [
      {
        id: 1,
        title: "Introduction to Plumbing",
        lessons: [
          { id: 1, title: "What is Plumbing?", duration: "10 min", completed: true, type: "video" },
          { id: 2, title: "Tools of the Trade", duration: "15 min", completed: true, type: "interactive" },
          { id: 3, title: "Safety First Quiz", duration: "5 min", completed: true, type: "quiz", score: 95 }
        ]
      },
      {
        id: 2,
        title: "Pipe Basics",
        lessons: [
          { id: 4, title: "Types of Pipes", duration: "20 min", completed: false, type: "video" },
          { id: 5, title: "Measuring and Cutting", duration: "25 min", completed: false, type: "interactive" },
          { id: 6, title: "Pipe Materials Quiz", duration: "5 min", completed: false, type: "quiz" }
        ]
      },
      {
        id: 3,
        title: "Installation Techniques",
        lessons: [
          { id: 7, title: "Joining Copper Pipes", duration: "30 min", completed: false, type: "video", locked: true },
          { id: 8, title: "PVC Installation", duration: "25 min", completed: false, type: "interactive", locked: true },
          { id: 9, title: "Leak Testing", duration: "15 min", completed: false, type: "video", locked: true }
        ]
      },
      {
        id: 4,
        title: "Final Assessment",
        lessons: [
          { id: 10, title: "Practical Exercise", duration: "45 min", completed: false, type: "practical", locked: true },
          { id: 11, title: "Final Exam", duration: "20 min", completed: false, type: "exam", locked: true },
          { id: 12, title: "Certificate Award", duration: "5 min", completed: false, type: "completion", locked: true }
        ]
      }
    ]
  }
};

const getLessonIcon = (type: string, completed: boolean) => {
  const iconClass = completed ? "text-green-500" : "text-muted-foreground";
  
  switch (type) {
    case "video": return <Play className={`h-4 w-4 ${iconClass}`} />;
    case "interactive": return <Target className={`h-4 w-4 ${iconClass}`} />;
    case "quiz": return <BookOpen className={`h-4 w-4 ${iconClass}`} />;
    case "exam": return <Trophy className={`h-4 w-4 ${iconClass}`} />;
    case "practical": return <Star className={`h-4 w-4 ${iconClass}`} />;
    case "completion": return <CheckCircle className={`h-4 w-4 ${iconClass}`} />;
    default: return <BookOpen className={`h-4 w-4 ${iconClass}`} />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    default: return "bg-neutral-100 text-neutral-800";
  }
};

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const course = courseData[courseId];
  
  const [selectedLesson, setSelectedLesson] = useState<unknown>(null);

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  const completedLessons = course.modules.flatMap((m: unknown) => m.lessons).filter((l: unknown) => l.completed).length;
  const totalLessons = course.modules.flatMap((m: unknown) => m.lessons).length;
  const progressPercent = (completedLessons / totalLessons) * 100;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                    {course.difficulty}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{course.rating}</span>
                    <span className="text-sm text-muted-foreground">({course.enrolled} students)</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="font-semibold">{course.duration}</p>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="font-semibold">{course.lessons} lessons</p>
                    <p className="text-sm text-muted-foreground">Content</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="font-semibold">{course.xpReward} XP</p>
                    <p className="text-sm text-muted-foreground">Completion Reward</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{Math.round(progressPercent)}% Complete</span>
                  </div>
                  <Progress value={progressPercent} className="progress-glow" />
                  <p className="text-xs text-muted-foreground">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Instructor: <span className="font-medium">{course.instructor}</span>
                </p>

                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Play className="h-5 w-5 mr-2" />
                  Continue Learning
                </Button>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-semibold text-green-600">89%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Score</span>
                      <span className="font-semibold text-blue-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Est. Completion</span>
                      <span className="font-semibold text-purple-600">2 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Difficulty</span>
                      <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Achievements Available</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-sm">Course Completed</p>
                        <p className="text-xs text-muted-foreground">Finish all lessons</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm">Perfect Score</p>
                        <p className="text-xs text-muted-foreground">100% on final exam</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Speed Learner</p>
                        <p className="text-xs text-muted-foreground">Complete in 3 days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {course.modules.map((module: unknown, moduleIndex: number) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: moduleIndex * 0.1 }}
                >
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                        {module.id}
                      </span>
                      {module.title}
                    </h3>

                    <div className="space-y-2">
                      {module.lessons.map((lesson: unknown, lessonIndex: number) => (
                        <motion.div
                          key={lesson.id}
                          whileHover={!lesson.locked ? { scale: 1.01 } : Record<string, unknown>}
                        >
                          <div
                            className={'flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                              lesson.locked 
                                ? 'bg-muted/30 opacity-60' 
                                : lesson.completed
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : 'bg-card hover:bg-accent cursor-pointer'
              }'}
                            onClick={() => !lesson.locked && setSelectedLesson(lesson)}
                          >
                          <div className="flex items-center space-x-3">
                            {lesson.locked ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              getLessonIcon(lesson.type, lesson.completed)
                            )}
                            <div>
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {lesson.completed && lesson.score && (
                              <Badge variant="outline" className="text-xs">
                                {lesson.score}%
                              </Badge>
                            )}
                            {lesson.completed && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {!lesson.locked && !lesson.completed && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex justify-between">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Play className="h-4 w-4 mr-2" />
            Start Next Lesson
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { Clock, Users, Star, BookOpen, Play, CheckCircle, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Course } from "@/lib/course-data";
import Image from "next/image";

interface CourseCardProps {
  course: Course;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "Intermediate": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "Advanced": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    default: return "bg-slate-100 text-slate-700";
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "plumbing": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "retail": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "software": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    default: return "bg-slate-100 text-slate-700";
  }
};

const getCardHeight = (size: string) => {
  switch (size) {
    case "sm": return "h-64";
    case "lg": return "h-80";
    default: return "h-72";
  }
};

export function CourseCard({ course, size = "md", showProgress = true }: CourseCardProps) {
  const isCompleted = course.progress === 100;
  const isStarted = course.progress > 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`${getCardHeight(size)} overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group`}>
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-700 dark:via-blue-900/50 dark:to-indigo-900/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            <div className="absolute top-4 left-4 z-10">
              <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                {course.difficulty}
              </Badge>
            </div>

            <div className="absolute top-4 right-4 z-10 flex items-center space-x-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-3 w-3 text-amber-500 fill-current" />
              <span className="text-xs font-medium">{course.rating}</span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl opacity-30 text-slate-600 dark:text-slate-300">
                <BookOpen />
              </div>
            </div>

            {isStarted && (
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            )}
          </div>

          {isCompleted && (
            <motion.div
              className="absolute inset-0 bg-green-500/10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
          )}
        </div>

        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <Badge className={getCategoryColor(course.category)} variant="outline">
              {course.category}
            </Badge>
            <div className="flex items-center space-x-1 text-amber-500">
              <Award className="h-4 w-4" />
              <span className="text-xs font-medium">{course.xpReward} XP</span>
            </div>
          </div>

          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {course.description}
          </p>

          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{course.lessons}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{course.enrolled}</span>
                </div>
              </div>
            </div>

            {showProgress && isStarted && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Progress</span>
                  <span className="text-blue-600 font-semibold">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                by <span className="font-medium">{course.instructor}</span>
              </p>
              
              <Button 
                size="sm" 
                className={`${
                  isCompleted 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                } group-hover:scale-105 transition-transform`}
                asChild
              >
                <Link href={`/courses/${course.id}`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Review
                    </>
                  ) : isStarted ? (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
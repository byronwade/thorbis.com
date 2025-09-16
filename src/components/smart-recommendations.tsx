"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Users, Clock, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { allCourses, Course } from "@/lib/course-data";
import Link from "next/link";

interface RecommendationSection {
  title: string;
  description: string;
  icon: React.ElementType;
  courses: Course[];
  reason: string;
  color: string;
}

export function SmartRecommendations() {
  // Simulate AI-powered recommendations based on user data
  const recommendations: RecommendationSection[] = [
    {
      title: "Continue Your Journey",
      description: "Pick up where you left off",
      icon: BookOpen,
      courses: allCourses.filter(c => c.progress > 0 && c.progress < 100),
      reason: "You're making great progress on these courses",'
      color: "text-blue-500"
    },
    {
      title: "Recommended for You", 
      description: "Based on your learning path and interests",
      icon: Sparkles,
      courses: allCourses.filter(c => c.category === "plumbing" && c.progress === 0).slice(0, 3),
      reason: "Matches your plumbing specialization",
      color: "text-purple-500"
    },
    {
      title: "Trending Now",
      description: "Popular courses among your peers",
      icon: TrendingUp,
      courses: allCourses.sort((a, b) => b.enrolled - a.enrolled).slice(0, 3),
      reason: "High enrollment and ratings",
      color: "text-green-500"
    },
    {
      title: "Quick Wins",
      description: "Short courses you can complete today",
      icon: Clock,
      courses: allCourses.filter(c => {
        const duration = parseInt(c.duration);
        return duration <= 3;
      }).slice(0, 3),
      reason: "Perfect for busy schedules",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-8">
      {recommendations.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700`}>
                <section.icon className={'h-6 w-6 ${section.color}'} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href={'/courses?category=${section.title.toLowerCase().replace(/\s+/g, '-')}'}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Recommended
              </Badge>
              <span className="text-xs text-muted-foreground">{section.reason}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Personalized Learning Path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Your Personalized Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Foundation Level</h3>
                <div className="space-y-2">
                  {["Safety Protocols", "Basic Tools", "Pipe Fundamentals"].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Intermediate Level</h3>
                <div className="space-y-2">
                  {["Advanced Techniques", "System Design", "Troubleshooting"].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Expert Level</h3>
                <div className="space-y-2">
                  {["Commercial Systems", "Code Compliance", "Business Skills"].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.6 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Get Personalized Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
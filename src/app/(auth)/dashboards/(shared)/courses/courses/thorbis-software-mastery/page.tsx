"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Play,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Target,
  Brain,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Monitor,
  Smartphone,
  Calendar,
  MapPin,
  Settings,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const course = {
  id: "thorbis-software-mastery",
  title: "Thorbis Software Mastery",
  subtitle: "Master our platform through interactive simulations",
  description: "Learn to use Thorbis software effectively through hands-on simulations, real workflow scenarios, and step-by-step guided practice in a safe learning environment.",
  difficulty: "Beginner to Advanced",
  estimatedTime: "5-7 hours",
  rating: 4.9,
  enrolledStudents: 1543,
  completionRate: 92,
  instructor: {
    name: "Alex Chen",
    title: "Head of Training & Support",
    avatar: "AC",
    experience: "8+ years"
  },
  progress: 0,
  chapters: [
    {
      id: 1,
      title: "Dashboard Navigation & Setup",
      subtitle: "Master the command center of your business",
      lessons: 8,
      duration: "45 min",
      type: "interactive-tour",
      completed: false,
      locked: false,
      description: "Interactive walkthrough of the dashboard with clickable hotspots and guided practice sessions"
    },
    {
      id: 2,
      title: "Customer Management System",
      subtitle: "Build and maintain customer relationships",
      lessons: 12,
      duration: "70 min", 
      type: "simulation",
      completed: false,
      locked: true,
      description: "Simulate real customer interactions, data entry, and relationship management workflows"
    },
    {
      id: 3,
      title: "Scheduling & Dispatch System",
      subtitle: "Optimize routes and manage technician schedules",
      lessons: 15,
      duration: "85 min",
      type: "workflow",
      completed: false,
      locked: true,
      description: "Practice scheduling jobs, optimizing routes, and handling dispatch scenarios with real-time decision making"
    },
    {
      id: 4,
      title: "Mobile App Proficiency",
      subtitle: "Field operations and job management",
      lessons: 10,
      duration: "60 min",
      type: "mobile-sim",
      completed: false,
      locked: true,
      description: "Mobile app simulator with job completion workflows, photo uploads, and customer communication"
    },
    {
      id: 5,
      title: "Inventory & Materials Management", 
      subtitle: "Track parts, manage stock, and control costs",
      lessons: 11,
      duration: "65 min",
      type: "database",
      completed: false,
      locked: true,
      description: "Interactive inventory management with barcode scanning simulation and reorder point optimization"
    },
    {
      id: 6,
      title: "Reporting & Analytics",
      subtitle: "Make data-driven business decisions",
      lessons: 9,
      duration: "55 min",
      type: "analytics",
      completed: false,
      locked: true,
      description: "Build custom reports, analyze KPIs, and create actionable insights from business data"
    },
    {
      id: 7,
      title: "Advanced Integrations",
      subtitle: "Connect with QuickBooks, payment systems, and more",
      lessons: 7,
      duration: "40 min",
      type: "integration",
      completed: false,
      locked: true,
      description: "Step-by-step setup and troubleshooting of third-party integrations with hands-on practice"
    }
  ]
};

const learningFeatures = [
  {
    icon: Monitor,
    title: "Interactive Software Simulator",
    description: "Practice in a safe replica of the actual Thorbis interface without affecting real data"
  },
  {
    icon: Target,
    title: "Scenario-Based Training",
    description: "Learn through realistic business scenarios and customer interactions"
  },
  {
    icon: Smartphone,
    title: "Mobile App Practice",
    description: "Master the mobile app through guided field operation simulations"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your learning progress and identify areas for improvement"
  }
];

const softwareModules = [
  {
    title: "Dashboard Efficiency",
    value: "3x faster",
    subtitle: "Average navigation speed",
    icon: Monitor,
    color: "text-blue-600"
  },
  {
    title: "Data Entry Accuracy", 
    value: "99.2%",
    subtitle: "User accuracy rate",
    icon: Target,
    color: "text-green-600"
  },
  {
    title: "Mobile Completion",
    value: "87%",
    subtitle: "Jobs completed mobile-first",
    icon: Smartphone,
    color: "text-purple-600"
  },
  {
    title: "User Satisfaction",
    value: "4.9/5",
    subtitle: "Training effectiveness",
    icon: Star,
    color: "text-yellow-600"
  }
];

const getChapterIcon = (type: string) => {
  switch (type) {
    case 'interactive-tour': return Monitor;
    case 'simulation': return Users;
    case 'workflow': return Calendar;
    case 'mobile-sim': return Smartphone;
    case 'database': return Settings;
    case 'analytics': return BarChart3;
    case 'integration': return Zap;
    default: return BookOpen;
  }
};

const getChapterColor = (type: string) => {
  switch (type) {
    case 'interactive-tour': return 'from-blue-500 to-cyan-500';
    case 'simulation': return 'from-green-500 to-emerald-500';
    case 'workflow': return 'from-purple-500 to-violet-500';
    case 'mobile-sim': return 'from-orange-500 to-amber-500';
    case 'database': return 'from-red-500 to-rose-500';
    case 'analytics': return 'from-indigo-500 to-purple-500';
    case 'integration': return 'from-pink-500 to-rose-500';
    default: return 'from-slate-500 to-neutral-500';
  }
};

export default function ThorbissoftwareMasteryPage() {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 text-white">
          <div className="absolute inset-0 bg-neutral-950/20" />
          <div className="relative p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {course.difficulty}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {course.title}
                  </h1>
                  <p className="text-xl text-indigo-100">
                    {course.subtitle}
                  </p>
                </div>
                
                <p className="text-lg text-indigo-50 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating} ({course.enrolledStudents} students)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{course.completionRate}% completion rate</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-8"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Launch Simulator
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Take Quick Tour
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur rounded-xl" />
                  <Card className="relative bg-transparent border-white/20">
                    <CardHeader className="text-center pb-2">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold">{course.instructor.avatar}</span>
                      </div>
                      <CardTitle className="text-white">{course.instructor.name}</CardTitle>
                      <p className="text-indigo-100 text-sm">{course.instructor.title}</p>
                    </CardHeader>
                    <CardContent className="text-center pt-2">
                      <Badge variant="outline" className="border-white/30 text-white">
                        {course.instructor.experience}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Software Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Training Effectiveness</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {softwareModules.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <metric.icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                    <div className={'text-3xl font-bold mb-2 ${metric.color}'}>
                      {metric.value}
                    </div>
                    <h3 className="font-semibold mb-1">{metric.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {metric.subtitle}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Learning Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Hands-On Learning Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Course Chapters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Training Modules</h2>
            <Badge variant="outline" className="px-4 py-2">
              {course.chapters.length} Modules • {course.chapters.reduce((acc, ch) => acc + ch.lessons, 0)} Lessons
            </Badge>
          </div>

          <div className="space-y-4">
            {course.chapters.map((chapter, index) => {
              const ChapterIcon = getChapterIcon(chapter.type);
              const isSelected = selectedChapter === chapter.id;
              
              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setSelectedChapter(isSelected ? null : chapter.id)}
                >
                  <Card className={'cursor-pointer transition-all duration-200 hover:shadow-md ${
                    chapter.locked 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:scale-[1.02]'
                  } ${
                    isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : `
              }`}>'
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={'w-12 h-12 rounded-xl bg-gradient-to-br ${getChapterColor(chapter.type)} flex items-center justify-center flex-shrink-0'}>
                          <ChapterIcon className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                                Module {chapter.id}: {chapter.title}
                                {chapter.completed && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                {chapter.locked && (
                                  <div className="w-5 h-5 rounded-full bg-neutral-300 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-neutral-600 rounded-full" />
                                  </div>
                                )}
                              </h3>
                              <p className="text-muted-foreground mb-2">{chapter.subtitle}</p>
                            </div>
                            
                            <div className="text-right text-sm text-muted-foreground">
                              <div>{chapter.lessons} lessons</div>
                              <div>{chapter.duration}</div>
                            </div>
                          </div>

                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t pt-4 mt-4"
                            >
                              <div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {chapter.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="capitalize">
                                    {chapter.type.replace('-', ' ')}
                                  </Badge>
                                  <Button 
                                    asChild
                                    disabled={chapter.locked}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                  >
                                    <Link href={'/courses/thorbis-software-mastery/module-${chapter.id}'}>
                                      {chapter.completed ? 'Review' : 'Launch'} Module
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {!isSelected && (
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="capitalize">
                                {chapter.type.replace('-', ' ')}
                              </Badge>
                              {!chapter.locked && (
                                <Button size="sm" variant="ghost">
                                  View Details
                                  <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Course Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Your Software Mastery Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Training Completion</span>
                <span className="font-semibold">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">0</div>
                  <p className="text-sm text-muted-foreground">Modules Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <p className="text-sm text-muted-foreground">Simulations Passed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">0</div>
                  <p className="text-sm text-muted-foreground">Proficiency Score</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
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
  DollarSign,
  BarChart3,
  Calculator,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const course = {
  id: "business-fundamentals",
  title: "Running a Successful Service Business",
  subtitle: "Master business operations through real-world scenarios",
  description: "Learn essential business skills through interactive case studies, financial simulations, and strategic decision-making exercises designed for service industry professionals.",
  difficulty: "Intermediate",
  estimatedTime: "6-8 hours",
  rating: 4.8,
  enrolledStudents: 892,
  completionRate: 85,
  instructor: {
    name: "Emma Wilson",
    title: "Business Operations Director",
    avatar: "EW",
    experience: "12+ years"
  },
  progress: 0,
  chapters: [
    {
      id: 1,
      title: "Financial Fundamentals",
      subtitle: "Master cash flow, pricing, and profitability",
      lessons: 12,
      duration: "90 min",
      type: "calculation",
      completed: false,
      locked: false,
      description: "Interactive financial calculators and real business scenarios to understand profit margins, cash flow, and pricing strategies"
    },
    {
      id: 2,
      title: "Customer Acquisition & Retention",
      subtitle: "Build a loyal customer base",
      lessons: 10,
      duration: "75 min", 
      type: "scenario",
      completed: false,
      locked: true,
      description: "Role-playing exercises with difficult customers and strategic decision trees for building loyalty"
    },
    {
      id: 3,
      title: "Operations & Scheduling",
      subtitle: "Optimize efficiency and resource allocation",
      lessons: 14,
      duration: "95 min",
      type: "simulation",
      completed: false,
      locked: true,
      description: "Interactive scheduling simulations and resource optimization puzzles"
    },
    {
      id: 4,
      title: "Team Management & Growth",
      subtitle: "Scale your business with the right people",
      lessons: 11,
      duration: "80 min",
      type: "decision-tree",
      completed: false,
      locked: true,
      description: "Leadership scenarios and hiring decision simulations with outcome tracking"
    },
    {
      id: 5,
      title: "Marketing & Brand Building",
      subtitle: "Attract customers and build reputation",
      lessons: 9,
      duration: "65 min",
      type: "creative",
      completed: false,
      locked: true,
      description: "Campaign creation tools and brand positioning exercises with A/B testing simulations"
    },
    {
      id: 6,
      title: "Strategic Planning & Scaling",
      subtitle: "Plan for sustainable growth",
      lessons: 8,
      duration: "70 min",
      type: "strategy",
      completed: false,
      locked: true,
      description: "Business model canvas exercises and growth strategy simulations with market analysis"
    }
  ]
};

const learningFeatures = [
  {
    icon: Calculator,
    title: "Financial Calculators",
    description: "Interactive tools for pricing, cash flow analysis, and profitability modeling"
  },
  {
    icon: Users,
    title: "Scenario-Based Learning",
    description: "Real customer interactions and business situations with multiple outcomes"
  },
  {
    icon: BarChart3,
    title: "Business Simulations",
    description: "Run virtual businesses and see the impact of your decisions"
  },
  {
    icon: Target,
    title: "Strategic Decision Trees",
    description: "Navigate complex business decisions with guided analysis"
  }
];

const businessMetrics = [
  {
    title: "Average Revenue Increase",
    value: "23%",
    subtitle: "After completing course",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    title: "Customer Satisfaction",
    value: "4.7/5",
    subtitle: "Student business ratings",
    icon: Star,
    color: "text-yellow-600"
  },
  {
    title: "Business Efficiency",
    value: "+31%",
    subtitle: "Operational improvement",
    icon: TrendingUp,
    color: "text-blue-600"
  },
  {
    title: "Employee Retention",
    value: "89%",
    subtitle: "Team satisfaction rate",
    icon: Users,
    color: "text-purple-600"
  }
];

const getChapterIcon = (type: string) => {
  switch (type) {
    case 'calculation': return Calculator;
    case 'scenario': return Users;
    case 'simulation': return BarChart3;
    case 'decision-tree': return Target;
    case 'creative': return Zap;
    case 'strategy': return PieChart;
    default: return BookOpen;
  }
};

const getChapterColor = (type: string) => {
  switch (type) {
    case 'calculation': return 'from-green-500 to-emerald-500';
    case 'scenario': return 'from-blue-500 to-cyan-500';
    case 'simulation': return 'from-purple-500 to-violet-500';
    case 'decision-tree': return 'from-orange-500 to-amber-500';
    case 'creative': return 'from-pink-500 to-rose-500';
    case 'strategy': return 'from-indigo-500 to-purple-500';
    default: return 'from-slate-500 to-neutral-500';
  }
};

export default function BusinessFundamentalsPage() {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
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
                  <p className="text-xl text-green-100">
                    {course.subtitle}
                  </p>
                </div>
                
                <p className="text-lg text-green-50 leading-relaxed">
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
                    className="bg-white text-green-700 hover:bg-green-50 font-semibold px-8"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Learning
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    View Preview
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
                      <p className="text-green-100 text-sm">{course.instructor.title}</p>
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

      {/* Business Impact Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Real Business Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
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
          <h2 className="text-2xl font-bold mb-6 text-center">Interactive Learning Experience</h2>
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
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
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
            <h2 className="text-2xl font-bold">Course Chapters</h2>
            <Badge variant="outline" className="px-4 py-2">
              {course.chapters.length} Chapters • {course.chapters.reduce((acc, ch) => acc + ch.lessons, 0)} Lessons
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
                    isSelected ? 'ring-2 ring-green-500 shadow-lg' : `
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
                                Chapter {chapter.id}: {chapter.title}
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
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                  >
                                    <Link href={'/courses/business-fundamentals/chapter-${chapter.id}'}>
                                      {chapter.completed ? 'Review' : 'Start'} Chapter
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
              <TrendingUp className="h-5 w-5" />
              Your Business Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Course Completion</span>
                <span className="font-semibold">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <p className="text-sm text-muted-foreground">Chapters Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$0</div>
                  <p className="text-sm text-muted-foreground">Revenue Simulated</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <p className="text-sm text-muted-foreground">Scenarios Solved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
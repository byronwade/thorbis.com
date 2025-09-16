"use client";

import { motion } from "framer-motion";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  Play,
  Award,
  Briefcase,
  Monitor,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const onboardingPath = [
  {
    id: 1,
    title: "Welcome to Thorbis",
    description: "Learn about our company culture, mission, and values",
    duration: "30 min",
    modules: 4,
    completed: false,
    current: true,
    icon: UserCheck,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Industry Basics",
    description: "Understand the industry fundamentals for your role",
    duration: "45 min",
    modules: 6,
    completed: false,
    current: false,
    locked: true,
    icon: Briefcase,
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "Thorbis Software Training",
    description: "Master the tools you'll use every day",
    duration: "60 min",
    modules: 8,
    completed: false,
    current: false,
    locked: true,
    icon: Monitor,
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Certification & Assessment",
    description: "Complete your onboarding certification",
    duration: "30 min",
    modules: 3,
    completed: false,
    current: false,
    locked: true,
    icon: Award,
    color: "bg-yellow-500"
  }
];

const roleSpecificPaths = {
  plumber: {
    title: "Field Technician Path",
    description: "Specialized training for plumbing professionals",
    courses: [
      "Safety Protocols & OSHA Compliance",
      "Thorbis Mobile App Mastery",
      "Customer Communication Best Practices",
      "Work Order Management"
    ]
  },
  retail: {
    title: "Retail Associate Path",
    description: "Customer service and sales training",
    courses: [
      "Customer Service Excellence",
      "Point of Sale Systems",
      "Inventory Management",
      "Sales Techniques"
    ]
  },
  office: {
    title: "Office Staff Path", 
    description: "Administrative and support role training",
    courses: [
      "Thorbis Dashboard Overview",
      "Customer Relationship Management",
      "Scheduling & Dispatching",
      "Reporting & Analytics"
    ]
  }
};

const milestones = [
  {
    day: 1,
    title: "First Day Setup",
    description: "Account creation and basic orientation",
    completed: true,
    xpReward: 100
  },
  {
    day: 3,
    title: "Role Understanding",
    description: "Complete industry basics and role-specific training",
    completed: false,
    current: true,
    xpReward: 200
  },
  {
    day: 7,
    title: "Tool Proficiency",
    description: "Demonstrate competency with Thorbis software",
    completed: false,
    xpReward: 300
  },
  {
    day: 14,
    title: "Certification Ready",
    description: "Complete all training and pass final assessment",
    completed: false,
    xpReward: 500
  }
];

export default function OnboardingPage() {
  const currentRole = "plumber"; // This would come from user profile
  const roleData = roleSpecificPaths[currentRole as keyof typeof roleSpecificPaths];
  
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Welcome to Your Journey</h1>
          <p className="text-lg text-muted-foreground">
            Your personalized onboarding experience designed for your success
          </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="secondary" className="px-4 py-2">
            Day 2 of 14
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            {roleData.title}
          </Badge>
        </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.day}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={'game-card ${
              milestone.completed 
                ? 'ring-2 ring-green-200 bg-green-50/50 dark:bg-green-900/20' 
                : milestone.current 
                ? 'ring-2 ring-blue-200 bg-blue-50/50 dark:bg-blue-900/20'
                : 'opacity-60`
              }'}>'
              <CardContent className="p-6 text-center">
                <div className={'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  milestone.completed 
                    ? 'bg-green-500' 
                    : milestone.current 
                    ? 'bg-blue-500' 
                    : 'bg-muted`
              }'}>'
                  {milestone.completed ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <span className="text-white font-bold">Day {milestone.day}</span>
                  )}
                </div>
                <h3 className="font-semibold mb-2">{milestone.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                <div className="flex items-center justify-center space-x-1 text-sm">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span>{milestone.xpReward} XP</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {onboardingPath.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={'p-4 rounded-lg border-2 transition-all duration-200 ${
                    step.completed 
                      ? 'border-green-200 bg-green-50/50 dark:bg-green-900/20'
                      : step.current
                      ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/20'
                      : step.locked
                      ? 'border-muted bg-muted/30 opacity-60'
                      : 'border-border bg-card hover:bg-accent`
              }`}>'
                  <div className="flex items-center space-x-4">
                    <div className={'w-12 h-12 rounded-lg flex items-center justify-center text-white ${step.color}'}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{step.title}</h3>
                        <div className="flex items-center space-x-2">
                          {step.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {step.current && <Badge variant="secondary">Current</Badge>}
                          {step.locked && <Badge variant="outline">Locked</Badge>}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{step.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{step.modules} modules</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {step.current && (
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      )}
                      {!step.current && !step.locked && !step.completed && (
                        <Button variant="outline">Start</Button>
                      )}
                    </div>
                  </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">25%</div>
                <p className="text-sm text-muted-foreground">Overall Completion</p>
                <Progress value={25} className="mt-3 progress-glow" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Streak</span>
                  <span className="font-semibold">2 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>XP Earned</span>
                  <span className="font-semibold">100 / 1,100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Est. Completion</span>
                  <span className="font-semibold">12 days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{roleData.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{roleData.description}</p>
              <div className="space-y-2">
                {roleData.courses.map((course, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{course}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link href="/courses?category=onboarding">
                  View All Courses
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/support">
                  <Users className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/mentorship">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Find a Mentor
                </Link>
              </Button>
            </CardContent>
          </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
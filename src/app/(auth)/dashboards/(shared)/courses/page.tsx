"use client";

import { motion } from "framer-motion";
import { Trophy, Star, BookOpen, Target, Zap, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdvancedProgress } from "@/components/advanced-progress";
import { CourseCard } from "@/components/course-card";
import { allCourses } from "@/lib/course-data";
import Link from "next/link";
import { useEffect } from "react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  // Scroll to top on component mount to prevent auto-scroll issues
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const userProgress = {
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    streakDays: 7,
    coursesCompleted: 8,
    badgesEarned: 15
  };

  const recentCourses = allCourses.filter(course => course.progress > 0).slice(0, 3);

  const achievements = [
    { icon: Trophy, label: "Course Master", description: "Complete 10 courses" },
    { icon: Zap, label: "Speed Learner", description: "Finish 3 lessons in a day" },
    { icon: Target, label: "Perfectionist", description: "Score 100% on 5 quizzes" },
    { icon: Users, label: "Team Player", description: "Help 5 teammates" }
  ];

  const actions = (
    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
      <Link href="/courses">
        <BookOpen className="h-5 w-5 mr-2" />
        Explore All Courses
      </Link>
    </Button>
  )

  return (
    <DashboardPageLayout
      title="Welcome Back, Champion!"
      description="Ready to level up your skills today?"
      actions={actions}
    >
      <div className="space-y-8">

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <Card className="glass-card game-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">Level {userProgress.level}</div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <Progress 
                value={(userProgress.xp / userProgress.xpToNextLevel) * 100} 
                className="mt-2 progress-glow"
              />
              <p className="text-xs mt-1">{userProgress.xp}/{userProgress.xpToNextLevel} XP</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card game-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-yellow-500" />
                <span className="text-3xl font-bold ml-2">{userProgress.streakDays}</span>
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card game-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-green-500" />
                <span className="text-3xl font-bold ml-2">{userProgress.coursesCompleted}</span>
              </div>
              <p className="text-sm text-muted-foreground">Courses Done</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card game-card">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-purple-500" />
                <span className="text-3xl font-bold ml-2">{userProgress.badgesEarned}</span>
              </div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <CourseCard key={course.id} course={course} size="sm" />
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No courses in progress</p>
                  <Button className="mt-3" asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border"
                >
                  <achievement.icon className="h-6 w-6 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-sm">{achievement.label}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Advanced Progress Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <AdvancedProgress />
      </motion.div>

      </div>
    </DashboardPageLayout>
  );
}


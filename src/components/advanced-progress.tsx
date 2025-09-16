"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Award, 
  Flame,
  BarChart3,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer
} from "recharts";

const weeklyData = [
  { day: "Mon", xp: 120, lessons: 3 },
  { day: "Tue", xp: 180, lessons: 4 },
  { day: "Wed", xp: 90, lessons: 2 },
  { day: "Thu", xp: 240, lessons: 6 },
  { day: "Fri", xp: 160, lessons: 3 },
  { day: "Sat", xp: 200, lessons: 5 },
  { day: "Sun", xp: 140, lessons: 3 }
];

const skillData = [
  { name: "Plumbing", progress: 75, color: "#3B82F6" },
  { name: "Software", progress: 45, color: "#8B5CF6" },
  { name: "Safety", progress: 90, color: "#10B981" },
  { name: "Customer Service", progress: 60, color: "#F59E0B" }
];

interface AdvancedProgressProps {
  className?: string;
}

export function AdvancedProgress({ className }: AdvancedProgressProps) {
  const currentStreak = 7;
  const longestStreak = 12;
  const weeklyGoal = 1000;
  const weeklyProgress = 890;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-8 w-8 text-orange-500" />
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">{currentStreak}</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
              <p className="text-xs text-muted-foreground mt-1">Best: {longestStreak} days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-blue-500" />
                <Badge variant="outline">89%</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{weeklyProgress}</div>
              <p className="text-sm text-muted-foreground">Weekly XP</p>
              <Progress value={(weeklyProgress / weeklyGoal) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <Badge variant="secondary">+15%</Badge>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">26</div>
              <p className="text-sm text-muted-foreground">Lessons This Week</p>
              <p className="text-xs text-green-600 mt-1">Above average!</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-purple-500" />
                <Badge variant="secondary">Elite</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">12</div>
              <p className="text-sm text-muted-foreground">Rank This Week</p>
              <p className="text-xs text-purple-600 mt-1">Top 5%</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Activity Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#xpGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skill Development */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Skill Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillData.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{skill.name}</h4>
                    <span className="text-sm font-medium" style={{ color: skill.color }}>
                      {skill.progress}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={skill.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals & Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Goals & Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Weekly Goal</h4>
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">890 / 1000 XP</div>
                <Progress value={89} className="mb-2" />
                <p className="text-xs text-muted-foreground">2 more lessons to reach goal</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Next Milestone</h4>
                  <Award className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">Level 13</div>
                <Progress value={85} className="mb-2" />
                <p className="text-xs text-muted-foreground">550 XP to next level</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Study Streak</h4>
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-2">7 Days</div>
                <div className="flex space-x-1 mb-2">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < 7 ? 'bg-orange-500' : 'bg-muted'
                      }'}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
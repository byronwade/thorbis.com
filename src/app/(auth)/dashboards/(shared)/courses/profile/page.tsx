"use client";

import { motion } from "framer-motion";
import { User, Trophy, BookOpen, Clock, Star, Award, Target, Zap, Settings, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth-context';
import { useXP } from '@/contexts/xp-context';
import { BadgeGrid, BadgeDisplay, XPProgressBar, LevelBadge } from '@/components/badges/badge-display';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';

const userProfile = {
  name: "Alex Thompson",
  email: "alex.thompson@company.com",
  avatar: "AT",
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  totalXp: 15750,
  joinDate: "March 2024",
  coursesCompleted: 8,
  lessonsCompleted: 124,
  quizzesPassed: 45,
  streakDays: 7,
  totalStudyTime: "68 hours",
  industry: "Plumbing",
  role: "Field Technician"
};

const achievements = [
  { 
    id: 1, 
    name: "First Steps", 
    description: "Complete your first course", 
    icon: Target, 
    earned: true, 
    date: "March 15, 2024",
    rarity: "Common"
  },
  { 
    id: 2, 
    name: "Speed Runner", 
    description: "Complete 3 lessons in one day", 
    icon: Zap, 
    earned: true, 
    date: "April 2, 2024",
    rarity: "Uncommon"
  },
  { 
    id: 3, 
    name: "Perfect Score", 
    description: "Get 100% on 5 quizzes", 
    icon: Star, 
    earned: true, 
    date: "April 18, 2024",
    rarity: "Rare"
  },
  { 
    id: 4, 
    name: "Course Master", 
    description: "Complete 10 courses", 
    icon: BookOpen, 
    earned: false, 
    date: null,
    rarity: "Epic"
  },
  { 
    id: 5, 
    name: "Dedication", 
    description: "Maintain a 30-day streak", 
    icon: Award, 
    earned: false, 
    date: null,
    rarity: "Legendary"
  },
];

const recentActivity = [
  { type: "course_completed", title: "Pipe Installation Basics", date: "2 days ago" },
  { type: "quiz_passed", title: "Safety Protocols Quiz", date: "3 days ago", score: 95 },
  { type: "lesson_completed", title: "Copper Pipe Joining", date: "4 days ago" },
  { type: "badge_earned", title: "Safety Champion", date: "1 week ago" },
  { type: "level_up", title: "Reached Level 12", date: "1 week ago" },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "Common": return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200";
    case "Uncommon": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "Rare": return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "Epic": return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
    case "Legendary": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    default: return "bg-neutral-100 text-neutral-800";
  }
};

export default function Profile() {
  const { user, userProfile } = useAuth();
  const { userStats, loading, getXPForLevel, getXPToNextLevel, getLevelProgress } = useXP();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your userProfile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const levelProgress = getLevelProgress();
  const xpToNext = getXPToNextLevel();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Track your learning progress and achievements</p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {userProfile?.name?.split(' ').map(n => n[0]).join(') || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{userProfile?.name || 'User'}</h1>
                <p className="text-muted-foreground mb-4">{userProfile?.email}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {userProfile?.industry && <Badge variant="secondary">{userProfile.industry}</Badge>}
                  {userProfile?.role && <Badge variant="outline">{userProfile.role}</Badge>}
                  <Badge variant="outline">Member since {format(new Date(userProfile?.created_at || new Date()), 'MMMM yyyy')}</Badge>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                  <LevelBadge level={userStats?.level || 1} size="md" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">Level {userStats?.level || 1}</div>
                    <div className="text-sm text-muted-foreground">
                      {(userStats?.total_xp || 0).toLocaleString()} total XP
                    </div>
                  </div>
                </div>

                <XPProgressBar
                  currentXP={userStats?.total_xp || 0}
                  level={userStats?.level || 1}
                  getXPForLevel={getXPForLevel}
                  className="w-full md:w-96"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Current Level", value: userStats?.level || 1, icon: Target, color: "text-blue-600" },
          { label: "Total XP", value: (userStats?.total_xp || 0).toLocaleString(), icon: Zap, color: "text-yellow-600" },
          { label: "Badges Earned", value: userStats?.badges?.length || 0, icon: Trophy, color: "text-purple-600" },
          { label: "Current Streak", value: `${userStats?.streak_days || 0} days`, icon: Star, color: "text-orange-600" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-card game-card">
              <CardContent className="p-6 text-center">
                <stat.icon className={'h-8 w-8 mx-auto mb-2 ${stat.color}'} />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userStats?.badges && userStats.badges.length > 0 ? (
                    <BadgeGrid badges={userStats.badges.slice(0, 6)} maxDisplay={6} />
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-muted-foreground">No badges earned yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Complete courses and lessons to earn your first badge!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent XP Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userStats?.recent_transactions && userStats.recent_transactions.length > 0 ? (
                    <div className="space-y-3">
                      {userStats.recent_transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            <div>
                              <div className="font-medium text-sm">{transaction.reason}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            +{transaction.amount} XP
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-muted-foreground">No recent activity</p>
                      <p className="text-sm text-muted-foreground mt-1">Start learning to see your XP activity here!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Badges ({userStats?.badges?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {userStats?.badges && userStats.badges.length > 0 ? (
                <div className="space-y-4">
                  {userStats.badges.map((userBadge) => (
                    <BadgeDisplay
                      key={userBadge.id}
                      badge={userBadge}
                      showDetails={true}
                      showEarnedDate={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No badges yet</h3>
                  <p className="text-muted-foreground mb-6">Start completing courses and lessons to earn your first badges!</p>
                  <Button>
                    Browse Courses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>XP Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {userStats?.recent_transactions && userStats.recent_transactions.length > 0 ? (
                <div className="space-y-3">
                  {userStats.recent_transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className={'w-3 h-3 rounded-full mr-4 ${
                          transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
              }'} />'
                        <div>
                          <div className="font-medium">{transaction.reason}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), 'PPpp')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Source: {transaction.source_type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={'text-lg font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
              }'}>'
                          {transaction.amount > 0 ? '+' : '}{transaction.amount} XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">Your XP transactions will appear here as you learn and complete activities.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const leaderboardData = {
  weekly: [
    { id: 1, name: "Mike Johnson", avatar: "MJ", xp: 2850, level: 15, streak: 12, badge: "Plumbing Pro" },
    { id: 2, name: "Sarah Chen", avatar: "SC", xp: 2750, level: 14, streak: 8, badge: "Software Expert" },
    { id: 3, name: "Tom Rodriguez", avatar: "TR", xp: 2650, level: 13, streak: 15, badge: "Retail Champion" },
    { id: 4, name: "Lisa Park", avatar: "LP", xp: 2400, level: 12, streak: 6, badge: "Quick Learner" },
    { id: 5, name: "David Kim", avatar: "DK", xp: 2200, level: 11, streak: 9, badge: "Team Player" },
  ],
  monthly: [
    { id: 1, name: "Sarah Chen", avatar: "SC", xp: 8750, level: 18, streak: 28, badge: "Master Learner" },
    { id: 2, name: "Mike Johnson", avatar: "MJ", xp: 8250, level: 17, streak: 25, badge: "Consistency King" },
    { id: 3, name: "Tom Rodriguez", avatar: "TR", xp: 7650, level: 16, streak: 22, badge: "Course Crusher" },
    { id: 4, name: "Lisa Park", avatar: "LP", xp: 7400, level: 15, streak: 20, badge: "Knowledge Seeker" },
    { id: 5, name: "David Kim", avatar: "DK", xp: 7200, level: 14, streak: 18, badge: "Steady Climber" },
  ],
  allTime: [
    { id: 1, name: "Mike Johnson", avatar: "MJ", xp: 25850, level: 45, streak: 180, badge: "Legend" },
    { id: 2, name: "Sarah Chen", avatar: "SC", xp: 23750, level: 42, streak: 165, badge: "Grandmaster" },
    { id: 3, name: "Tom Rodriguez", avatar: "TR", xp: 21650, level: 38, streak: 145, badge: "Elite" },
    { id: 4, name: "Lisa Park", avatar: "LP", xp: 19400, level: 35, streak: 125, badge: "Expert" },
    { id: 5, name: "David Kim", avatar: "DK", xp: 18200, level: 33, streak: 110, badge: "Veteran" },
  ]
};

const getRankIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-neutral-400" />;
    case 3:
      return <Medal className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
  }
};

const getRankColor = (position: number) => {
  switch (position) {
    case 1:
      return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    case 2:
      return "bg-gradient-to-r from-neutral-300 to-neutral-500";
    case 3:
      return "bg-gradient-to-r from-amber-400 to-amber-600";
    default:
      return "bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600";
  }
};

export default function Leaderboard() {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Leaderboard</h1>
        <p className="text-lg text-muted-foreground">See how you stack up against other learners</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="allTime">All Time</TabsTrigger>
          </TabsList>

          {Object.entries(leaderboardData).map(([period, data]) => (
            <TabsContent key={period} value={period} className="space-y-4">
              {data.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`game-card ${index < 3 ? 'ring-2 ring-primary/20' : '
              }`}>`
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankColor(index + 1)}'}>
                            {getRankIcon(index + 1)}
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={'/avatars/${user.avatar}.jpg'} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {user.avatar}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <h3 className="text-lg font-semibold">{user.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>Level {user.level}</span>
                                <span>•</span>
                                <span>{user.xp.toLocaleString()} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="flex items-center space-x-1 text-orange-500">
                              <Star className="h-4 w-4" />
                              <span className="font-semibold">{user.streak}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Streak</p>
                          </div>

                          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/50 dark:to-pink-900/50 dark:text-purple-300">
                            {user.badge}
                          </Badge>

                          {index < 3 && (
                            <div className="flex items-center space-x-1 text-green-500">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-sm font-semibold">Rising</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <CardTitle>Your Rank</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-purple-600">#8</div>
            <p className="text-sm text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <CardTitle>Best Rank</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-amber-600">#3</div>
            <p className="text-sm text-muted-foreground">Personal best</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-green-600">+5</div>
            <p className="text-sm text-muted-foreground">Positions this week</p>
          </CardContent>
        </Card>
        </div>
      </motion.div>
    </div>
  );
}
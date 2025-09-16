"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Video, 
  BookOpen,
  Plus,
  Search,
  Clock,
  Star,
  UserPlus,
  Settings,
  Crown,
  Award,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";
import { useStudyGroups } from "@/hooks/use-study-groups";
import { useAuth } from "@/contexts/auth-context";
import { ChatInterface } from "@/components/study-groups/chat-interface";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const studyGroups = [
  {
    id: 1,
    name: "Plumbing Professionals",
    description: "Connect with fellow plumbers and share knowledge",
    members: 47,
    maxMembers: 50,
    category: "plumbing",
    isPublic: true,
    nextSession: "Today, 3:00 PM",
    currentCourse: "Advanced Pipe Systems",
    progress: 68,
    moderator: "Mike Rodriguez",
    isJoined: true,
    activity: "Active",
    lastMessage: "Great discussion on copper joining techniques!"
  },
  {
    id: 2,
    name: "Retail Excellence Group",
    description: "Master customer service and retail operations together",
    members: 23,
    maxMembers: 30,
    category: "retail",
    isPublic: true,
    nextSession: "Tomorrow, 2:00 PM",
    currentCourse: "Customer Service Excellence",
    progress: 45,
    moderator: "Emma Wilson",
    isJoined: false,
    activity: "Active",
    lastMessage: "Tips for handling difficult customers"
  },
  {
    id: 3,
    name: "Thorbis Software Masters",
    description: "Advanced users sharing tips and tricks",
    members: 12,
    maxMembers: 15,
    category: "software",
    isPublic: false,
    nextSession: "Friday, 10:00 AM",
    currentCourse: "Thorbis Dispatching Pro",
    progress: 72,
    moderator: "Alex Chen",
    isJoined: true,
    activity: "Very Active",
    lastMessage: "New feature demo this week!"
  },
  {
    id: 4,
    name: "New Hire Cohort - March 2024",
    description: "Get started together and build connections",
    members: 8,
    maxMembers: 20,
    category: "onboarding",
    isPublic: false,
    nextSession: "Monday, 9:00 AM",
    currentCourse: "New Employee Orientation",
    progress: 25,
    moderator: "HR Team",
    isJoined: true,
    activity: "Moderate",
    lastMessage: "Welcome everyone! Let's start strong 💪"
  }
];

const upcomingSessions = [
  {
    id: 1,
    title: "Pipe Installation Workshop",
    group: "Plumbing Professionals",
    time: "Today, 3:00 PM",
    duration: "1 hour",
    type: "Workshop",
    participants: 12,
    instructor: "Mike Rodriguez"
  },
  {
    id: 2,
    title: "Customer Service Role Play",
    group: "Retail Excellence Group",
    time: "Tomorrow, 2:00 PM",
    duration: "45 min",
    type: "Practice",
    participants: 8,
    instructor: "Emma Wilson"
  },
  {
    id: 3,
    title: "Q&A with Product Team",
    group: "Thorbis Software Masters",
    time: "Friday, 10:00 AM",
    duration: "30 min",
    type: "Q&A",
    participants: 10,
    instructor: "Product Team"
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "plumbing": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "retail": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "software": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "onboarding": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    default: return "bg-slate-100 text-slate-700";
  }
};

const getActivityColor = (activity: string) => {
  switch (activity) {
    case "Very Active": return "text-green-600";
    case "Active": return "text-blue-600";
    case "Moderate": return "text-yellow-600";
    default: return "text-muted-foreground";
  }
};

export default function StudyGroups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("my-groups");
  const [selectedChatGroup, setSelectedChatGroup] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  
  const { user } = useAuth();
  const { groups, loading, joinGroup, leaveGroup, createGroup } = useStudyGroups();
  
  const myGroups = groups.filter(group => group.isJoined);
  const availableGroups = groups.filter(group => !group.isJoined && group.is_public);
  
  const filteredGroups = (activeTab === "my-groups" ? myGroups : availableGroups).filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup(groupId);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Study Groups</h1>
          <p className="text-muted-foreground">Learn together, achieve more</p>
        </div>
        
        <Button 
          onClick={() => setShowCreateGroup(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Study Group
        </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-blue-600">{myGroups.length}</div>
            <p className="text-sm text-muted-foreground">My Groups</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-green-600">{upcomingSessions.length}</div>
            <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-purple-600">24</div>
            <p className="text-sm text-muted-foreground">New Messages</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-sm text-muted-foreground">Group Achievements</p>
          </CardContent>
        </Card>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
                  <TabsTrigger value="discover">Discover ({availableGroups.length})</TabsTrigger>
                </TabsList>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="my-groups" className="space-y-4">
                {filteredGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{group.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                              <div className="flex items-center space-x-4">
                                <Badge className={getCategoryColor(group.category)} variant="outline">
                                  {group.category}
                                </Badge>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>{group.memberCount}/{group.max_members}</span>
                                </div>
                                <Badge variant="secondary" className="text-green-600">
                                  Active
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedChatGroup(group.id)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Open Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                View Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Group Settings
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">Study Group</p>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Crown className="h-3 w-3" />
                                <span>Led by {group.moderator?.name}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-600">{group.memberCount} members</p>
                              <p className="text-xs text-muted-foreground">Active participants</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Created</p>
                              <div className="flex items-center space-x-1 text-sm text-green-600">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(group.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedChatGroup(group.id)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Chat
                              </Button>
                              <Button size="sm">
                                <Video className="h-4 w-4 mr-1" />
                                Join Session
                              </Button>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-blue-500">
                            <p className="text-sm italic">Click Chat to start conversation</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="discover" className="space-y-4">
                {availableGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                              <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{group.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                              
                              <div className="flex items-center space-x-4 mb-3">
                                <Badge className={getCategoryColor(group.category)} variant="outline">
                                  {group.category}
                                </Badge>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>{group.memberCount}/{group.max_members} members</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>New Group</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 text-sm text-green-600">
                                <Calendar className="h-3 w-3" />
                                <span>Created: {new Date(group.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            onClick={() => handleJoinGroup(group.id)}
                            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Join Group
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    className="p-4 rounded-lg border bg-card/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{session.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {session.type}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{session.group}</p>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{session.time} • {session.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{session.participants} attending</span>
                      </div>
                    </div>

                    <Button size="sm" className="w-full mt-3" variant="outline">
                      <Video className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  </motion.div>
                ))}
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
                  <Target className="h-5 w-5" />
                  Group Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border">
                  <Award className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-sm">Team Player</p>
                    <p className="text-xs text-muted-foreground">Help 10 group members</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">Study Buddy</p>
                    <p className="text-xs text-muted-foreground">Join 5 group sessions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm">Knowledge Sharer</p>
                    <p className="text-xs text-muted-foreground">Answer 20 questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Mike helped you with pipe joining",
                  "New discussion in Retail Excellence",
                  "Sarah shared a helpful resource",
                  "Group session starts in 2 hours"
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{activity}</span>
                  </div>
                ))}
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Chat Dialog */}
      <Dialog open={!!selectedChatGroup} onOpenChange={() => setSelectedChatGroup(null)}>
        <DialogContent className="max-w-4xl h-[600px] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>
              {selectedChatGroup && groups.find(g => g.id === selectedChatGroup)?.name} - Group Chat
            </DialogTitle>
          </DialogHeader>
          {selectedChatGroup && (
            <ChatInterface 
              groupId={selectedChatGroup}
              groupName={groups.find(g => g.id === selectedChatGroup)?.name || ''}
              members={(groups.find(g => g.id === selectedChatGroup)?.members || []) as any}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
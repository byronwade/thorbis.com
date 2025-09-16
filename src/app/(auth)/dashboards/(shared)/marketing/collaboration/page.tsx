"use client";

import { useState } from "react";
;
import { 
  Users,
  Plus,
  Search,
  Filter,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Trash2,
  Edit3,
  Eye,
  Copy,
  RefreshCw,
  Activity,
  TrendingUp,
  BarChart3,
  MessageSquare,
  FileText,
  Calendar,
  Sparkles,
  Target,
  Video,
  Phone,
  Mail,
  Share2,
  Bell,
  Hash,
  AtSign,
  Send,
  Paperclip,
  Image,
  Mic,
  MoreHorizontal,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  Crown,
  Star,
  Zap,
  GitBranch,
  Layers,
  Monitor,
  Smartphone,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "editor" | "viewer" | "contributor";
  department: string;
  status: "online" | "offline" | "busy" | "away";
  lastActive: string;
  permissions: string[];
  joinedAt: string;
  projectCount: number;
  tasksCompleted: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "on-hold" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  type: "campaign" | "content" | "design" | "strategy" | "analytics";
  progress: number;
  dueDate: string;
  createdAt: string;
  members: string[];
  tasks: ProjectTask[];
  files: ProjectFile[];
  messages: number;
  updates: ProjectUpdate[];
}

interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "done";
  assignee: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  labels: string[];
  comments: number;
  attachments: number;
}

interface ProjectFile {
  id: string;
  name: string;
  type: "image" | "document" | "video" | "design" | "other";
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  url: string;
}

interface ProjectUpdate {
  id: string;
  type: "comment" | "status-change" | "file-upload" | "task-complete" | "member-added";
  message: string;
  author: string;
  timestamp: string;
  data?: any;
}

interface ChatMessage {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  type: "text" | "file" | "image" | "system";
  reactions?: { emoji: string; users: string[]; }[];
  threadId?: string;
  edited?: boolean;
}

interface WorkspaceChannel {
  id: string;
  name: string;
  description: string;
  type: "public" | "private" | "direct";
  members: string[];
  unreadCount: number;
  lastMessage?: ChatMessage;
  createdAt: string;
  archived: boolean;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@company.com",
    role: "admin",
    department: "Marketing",
    status: "online",
    lastActive: "2024-01-23T11:45:00Z",
    permissions: ["all"],
    joinedAt: "2024-01-01T00:00:00Z",
    projectCount: 8,
    tasksCompleted: 145
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "michael@company.com",
    role: "editor",
    department: "Design",
    status: "busy",
    lastActive: "2024-01-23T10:30:00Z",
    permissions: ["create", "edit", "comment"],
    joinedAt: "2024-01-05T00:00:00Z",
    projectCount: 6,
    tasksCompleted: 89
  },
  {
    id: "3",
    name: "Emma Thompson",
    email: "emma@company.com",
    role: "contributor",
    department: "Content",
    status: "online",
    lastActive: "2024-01-23T11:20:00Z",
    permissions: ["edit", "comment"],
    joinedAt: "2024-01-10T00:00:00Z",
    projectCount: 4,
    tasksCompleted: 67
  },
  {
    id: "4",
    name: "David Kim",
    email: "david@company.com",
    role: "viewer",
    department: "Analytics",
    status: "away",
    lastActive: "2024-01-23T09:15:00Z",
    permissions: ["view", "comment"],
    joinedAt: "2024-01-15T00:00:00Z",
    projectCount: 3,
    tasksCompleted: 23
  },
  {
    id: "5",
    name: "Lisa Park",
    email: "lisa@company.com",
    role: "editor",
    department: "Strategy",
    status: "offline",
    lastActive: "2024-01-22T17:30:00Z",
    permissions: ["create", "edit", "comment"],
    joinedAt: "2024-01-08T00:00:00Z",
    projectCount: 5,
    tasksCompleted: 98
  }
];

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Q1 Product Launch Campaign",
    description: "Complete marketing campaign for new product launch including email, social, and paid advertising",
    status: "active",
    priority: "high",
    type: "campaign",
    progress: 75,
    dueDate: "2024-02-15T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    members: ["1", "2", "3"],
    tasks: [],
    files: [],
    messages: 48,
    updates: []
  },
  {
    id: "2",
    name: "Brand Guidelines Update",
    description: "Refresh and update company brand guidelines with new visual identity",
    status: "active",
    priority: "medium",
    type: "design",
    progress: 45,
    dueDate: "2024-02-28T00:00:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    members: ["1", "2", "5"],
    tasks: [],
    files: [],
    messages: 23,
    updates: []
  },
  {
    id: "3",
    name: "Content Calendar Q2",
    description: "Plan and create content calendar for Q2 including blog posts, social media, and newsletters",
    status: "active",
    priority: "medium",
    type: "content",
    progress: 30,
    dueDate: "2024-03-31T00:00:00Z",
    createdAt: "2024-01-15T00:00:00Z",
    members: ["1", "3", "4"],
    tasks: [],
    files: [],
    messages: 15,
    updates: []
  },
  {
    id: "4",
    name: "Website Analytics Audit",
    description: "Comprehensive audit of website analytics setup and reporting",
    status: "completed",
    priority: "low",
    type: "analytics",
    progress: 100,
    dueDate: "2024-01-31T00:00:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    members: ["1", "4", "5"],
    tasks: [],
    files: [],
    messages: 31,
    updates: []
  },
  {
    id: "5",
    name: "Social Media Strategy 2024",
    description: "Develop comprehensive social media strategy for the year",
    status: "on-hold",
    priority: "high",
    type: "strategy",
    progress: 20,
    dueDate: "2024-04-01T00:00:00Z",
    createdAt: "2024-01-08T00:00:00Z",
    members: ["1", "2", "3", "5"],
    tasks: [],
    files: [],
    messages: 12,
    updates: []
  }
];

const mockChannels: WorkspaceChannel[] = [
  {
    id: "1",
    name: "general",
    description: "General team discussions and announcements",
    type: "public",
    members: ["1", "2", "3", "4", "5"],
    unreadCount: 3,
    createdAt: "2024-01-01T00:00:00Z",
    archived: false,
    lastMessage: {
      id: "1",
      content: "Great work on the campaign launch everyone! 🚀",
      author: "1",
      timestamp: "2024-01-23T11:30:00Z",
      type: "text"
    }
  },
  {
    id: "2",
    name: "marketing-team",
    description: "Marketing team coordination and updates",
    type: "private",
    members: ["1", "2", "3"],
    unreadCount: 1,
    createdAt: "2024-01-01T00:00:00Z",
    archived: false,
    lastMessage: {
      id: "2",
      content: "Can we review the email templates before sending?",
      author: "3",
      timestamp: "2024-01-23T10:45:00Z",
      type: "text"
    }
  },
  {
    id: "3",
    name: "design-feedback",
    description: "Share and get feedback on design work",
    type: "public",
    members: ["1", "2", "3", "5"],
    unreadCount: 5,
    createdAt: "2024-01-05T00:00:00Z",
    archived: false,
    lastMessage: {
      id: "3",
      content: "New brand colors look amazing! ✨",
      author: "2",
      timestamp: "2024-01-23T09:20:00Z",
      type: "text"
    }
  },
  {
    id: "4",
    name: "analytics-reports",
    description: "Weekly analytics reports and insights",
    type: "public",
    members: ["1", "4", "5"],
    unreadCount: 0,
    createdAt: "2024-01-10T00:00:00Z",
    archived: false
  }
];

export default function CollaborationPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [channels, setChannels] = useState<WorkspaceChannel[]>(mockChannels);
  const [activeTab, setActiveTab] = useState<"workspace" | "projects" | "team" | "files">("workspace");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "busy": return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case "away": return <Clock className="h-3 w-3 text-yellow-600" />;
      case "offline": return <XCircle className="h-3 w-3 text-gray-600" />;
      case "active": return <Activity className="h-4 w-4 text-green-600" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "on-hold": return <Pause className="h-4 w-4 text-yellow-600" />;
      case "archived": return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-4 w-4 text-yellow-600" />;
      case "editor": return <Edit3 className="h-4 w-4 text-blue-600" />;
      case "contributor": return <UserCheck className="h-4 w-4 text-green-600" />;
      case "viewer": return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "medium": return "text-blue-600 bg-blue-100";
      case "low": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "campaign": return <Target className="h-4 w-4" />;
      case "content": return <FileText className="h-4 w-4" />;
      case "design": return <Layers className="h-4 w-4" />;
      case "strategy": return <GitBranch className="h-4 w-4" />;
      case "analytics": return <BarChart3 className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Collaboration</h1>
          <p className="text-muted-foreground">
            Real-time collaboration workspace for marketing teams.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Start Meeting
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "workspace" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("workspace")}
        >
          Workspace
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "projects" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "team" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }'}
          onClick={() => setActiveTab("team")}
        >
          Team
        </button>
        <button
          className={'px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "files" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }'}
          onClick={() => setActiveTab("files")}
        >
          Files
        </button>
      </div>

      {/* Workspace Tab */}
      {activeTab === "workspace" && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chat Channels */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Channels</CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-4">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {channel.type === "private" ? (
                          <Shield className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Hash className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{channel.name}</p>
                          {channel.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {channel.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                      {channel.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          {channel.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Online Team Members */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Team Status</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {teamMembers
                      .filter(member => member.status !== "offline")
                      .map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {member.name.split(' ').map(n => n[0]).join(')}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                              {getStatusIcon(member.status)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.status}</p>
                          </div>
                          {getRoleIcon(member.role)}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>general</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {mockChannels.find(c => c.id === "1")?.members.length} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {[
                    {
                      id: "1",
                      content: "Good morning everyone! Ready for the product launch today? 🚀",
                      author: "Sarah Chen",
                      timestamp: "9:15 AM",
                      reactions: [{ emoji: "🚀", users: ["2", "3"] }, { emoji: "👍", users: ["4"] }]
                    },
                    {
                      id: "2",
                      content: "The email campaign went out successfully. Open rates looking good so far!",
                      author: "Emma Thompson",
                      timestamp: "9:20 AM",
                      reactions: [{ emoji: "🎉", users: ["1", "2"] }]
                    },
                    {
                      id: "3",
                      content: "Just finished updating the landing page design. Live in 5 minutes.",
                      author: "Michael Rodriguez",
                      timestamp: "9:25 AM"
                    },
                    {
                      id: "4",
                      content: "Analytics dashboard shows traffic spike from social media. Great job team!",
                      author: "David Kim",
                      timestamp: "9:30 AM",
                      reactions: [{ emoji: "📈", users: ["1", "3", "5"] }]
                    }
                  ].map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">
                          {message.author.split(' ').map(n => n[0]).join(`)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.author}</span>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <p className="text-sm mb-2">{message.content}</p>
                        {message.reactions && (
                          <div className="flex gap-2">
                            {message.reactions.map((reaction, index) => (
                              <button
                                key={index}
                                className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs hover:bg-muted/80"
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border rounded-lg pr-20"
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        <Button size="sm" variant="ghost">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Types</option>
              <option value="campaign">Campaign</option>
              <option value="content">Content</option>
              <option value="design">Design</option>
              <option value="strategy">Strategy</option>
              <option value="analytics">Analytics</option>
            </select>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Project Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === "active").length}
                </div>
                <p className="text-xs text-green-600">
                  {projects.filter(p => p.status === "active").length} of {projects.length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-orange-600">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + p.messages, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total discussions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedProject(project)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(project.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{project.name}</h3>
                          {getStatusIcon(project.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            project.status === "active" 
                              ? "bg-green-100 text-green-700"
                              : project.status === "completed"
                                ? "bg-blue-100 text-blue-700"
                                : project.status === "on-hold"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}>
                            {project.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(project.priority)}'}>
                            {project.priority}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="capitalize">{project.type} Project</span>
                          <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                          <span>{project.members.length} members</span>
                          <span>{project.messages} messages</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: '${project.progress}%' }}
                      />
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 4).map((memberId) => {
                        const member = teamMembers.find(m => m.id === memberId);
                        if (!member) return null;
                        return (
                          <div
                            key={memberId}
                            className="w-8 h-8 bg-primary/10 rounded-full border-2 border-white flex items-center justify-center"
                            title={member.name}
                          >
                            <span className="text-xs font-medium">
                              {member.name.split(' ').map(n => n[0]).join(')}
                            </span>
                          </div>
                        );
                      })}
                      {project.members.length > 4 && (
                        <div className="w-8 h-8 bg-muted rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-medium">+{project.members.length - 4}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Manage team members and their permissions.
            </p>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          {/* Team Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all departments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online Now</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamMembers.filter(m => m.status === "online").length}
                </div>
                <p className="text-xs text-green-600">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(teamMembers.reduce((sum, m) => sum + m.projectCount, 0) / teamMembers.length)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per team member
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0)}
                </div>
                <p className="text-xs text-green-600">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Members List */}
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-medium">
                            {member.name.split(' ').map(n => n[0]).join(`)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                          {getStatusIcon(member.status)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{member.name}</h3>
                          {getRoleIcon(member.role)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            member.role === "admin" 
                              ? "bg-yellow-100 text-yellow-700"
                              : member.role === "editor"
                                ? "bg-blue-100 text-blue-700"
                                : member.role === "contributor"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                          }'}>
                            {member.role}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{member.email}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{member.department}</span>
                          <span>Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
                          <span className="capitalize">{member.status}</span>
                          <span>Last active: {new Date(member.lastActive).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{member.projectCount}</p>
                        <p className="text-xs text-muted-foreground">Projects</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{member.tasksCompleted}</p>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2 text-sm">Permissions</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.permissions.map((permission, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Files Tab */}
      {activeTab === "files" && (
        <>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Shared Files & Documents</h3>
            <p className="text-muted-foreground mb-4">
              Centralized file storage and version control for team collaboration.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>

          {/* File Categories */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: "Images", count: 245, icon: Image, color: "bg-blue-100 text-blue-700" },
              { name: "Documents", count: 89, icon: FileText, color: "bg-green-100 text-green-700" },
              { name: "Videos", count: 34, icon: Video, color: "bg-purple-100 text-purple-700" },
              { name: "Designs", count: 156, icon: Layers, color: "bg-orange-100 text-orange-700" }
            ].map((category) => (
              <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${category.color}'}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-2xl font-bold text-primary">{category.count}</p>
                  <p className="text-xs text-muted-foreground">files</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
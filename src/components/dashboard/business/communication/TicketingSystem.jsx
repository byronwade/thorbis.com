"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  MoreVertical,
  MessageSquare,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  StarOff,
  FileText,
  Download,
  Share,
  Archive,
  Trash2,
  Edit,
  Eye,
  Reply,
  Forward,
  Phone,
  Mail,
  Calendar,
  Settings,
  Users,
  TrendingUp,
  BarChart3,
  Bell,
  BellOff,
  Lock,
  Globe,
  Hash,
  ArrowUp,
  ArrowDown,
  Circle,
  Check,
  X,
  Info,
  HelpCircle,
  Bug,
  Lightbulb,
  Wrench,
  Shield,
  Zap,
  Target,
  Flag,
  Timer,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { cn } from '@utils';

// Sample data
const TICKETS = [
  {
    id: "TKT-001",
    title: "Website login not working",
    description: "Customer unable to access their account through the website login page",
    customer: {
      name: "John Smith",
      email: "john.smith@email.com",
      avatar: "/placeholder-user.jpg"
    },
    status: "open",
    priority: "high",
    category: "technical",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
    lastActivity: "2 hours ago",
    responseTime: "4 hours",
    isUrgent: true,
    isStarred: false,
    tags: ["login", "website", "urgent"],
    messages: [
      {
        id: 1,
        sender: "John Smith",
        message: "I can't log into my account. The page keeps showing an error.",
        timestamp: "2024-01-15T10:30:00Z",
        type: "customer"
      },
      {
        id: 2,
        sender: "Sarah Johnson",
        message: "I'm looking into this issue. Can you try clearing your browser cache?",
        timestamp: "2024-01-15T11:15:00Z",
        type: "agent"
      }
    ]
  },
  {
    id: "TKT-002",
    title: "Billing inquiry - incorrect charges",
    description: "Customer noticed unexpected charges on their monthly bill",
    customer: {
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      avatar: "/placeholder-user.jpg"
    },
    status: "in_progress",
    priority: "medium",
    category: "billing",
    assignedTo: "Mike Chen",
    createdAt: "2024-01-14T16:45:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
    lastActivity: "5 hours ago",
    responseTime: "2 hours",
    isUrgent: false,
    isStarred: true,
    tags: ["billing", "charges", "inquiry"],
    messages: [
      {
        id: 1,
        sender: "Maria Garcia",
        message: "I see charges on my bill that I don't recognize. Can you help?",
        timestamp: "2024-01-14T16:45:00Z",
        type: "customer"
      }
    ]
  },
  {
    id: "TKT-003",
    title: "Feature request - mobile app improvements",
    description: "Customer suggests adding dark mode and offline functionality to mobile app",
    customer: {
      name: "David Wilson",
      email: "david.wilson@email.com",
      avatar: "/placeholder-user.jpg"
    },
    status: "pending",
    priority: "low",
    category: "feature_request",
    assignedTo: "Lisa Park",
    createdAt: "2024-01-13T12:20:00Z",
    updatedAt: "2024-01-14T15:10:00Z",
    lastActivity: "1 day ago",
    responseTime: "3 hours",
    isUrgent: false,
    isStarred: false,
    tags: ["feature", "mobile", "app"],
    messages: [
      {
        id: 1,
        sender: "David Wilson",
        message: "Would love to see dark mode and offline features in the mobile app!",
        timestamp: "2024-01-13T12:20:00Z",
        type: "customer"
      }
    ]
  },
  {
    id: "TKT-004",
    title: "Service outage - payment processing",
    description: "Payment processing system is down, affecting all transactions",
    customer: {
      name: "Emily Brown",
      email: "emily.brown@email.com",
      avatar: "/placeholder-user.jpg"
    },
    status: "resolved",
    priority: "critical",
    category: "outage",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-12T08:15:00Z",
    updatedAt: "2024-01-12T11:45:00Z",
    lastActivity: "3 days ago",
    responseTime: "30 minutes",
    isUrgent: true,
    isStarred: true,
    tags: ["outage", "payment", "critical"],
    messages: [
      {
        id: 1,
        sender: "Emily Brown",
        message: "Can't process any payments. This is urgent!",
        timestamp: "2024-01-12T08:15:00Z",
        type: "customer"
      },
      {
        id: 2,
        sender: "Sarah Johnson",
        message: "Issue resolved. Payment processing is back online.",
        timestamp: "2024-01-12T11:45:00Z",
        type: "agent"
      }
    ]
  }
];

const CATEGORIES = [
  { id: "technical", name: "Technical", icon: Bug, color: "text-red-600" },
  { id: "billing", name: "Billing", icon: FileText, color: "text-blue-600" },
  { id: "feature_request", name: "Feature Request", icon: Lightbulb, color: "text-green-600" },
  { id: "outage", name: "Outage", icon: AlertCircle, color: "text-orange-600" },
  { id: "general", name: "General", icon: HelpCircle, color: "text-gray-600" }
];

const AGENTS = [
  { id: "sarah", name: "Sarah Johnson", avatar: "/placeholder-user.jpg", status: "online" },
  { id: "mike", name: "Mike Chen", avatar: "/placeholder-user.jpg", status: "busy" },
  { id: "lisa", name: "Lisa Park", avatar: "/placeholder-user.jpg", status: "away" }
];

export default function TicketingSystem() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const filteredTickets = useMemo(() => {
    return TICKETS.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "pending": return "bg-orange-500";
      case "resolved": return "bg-green-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low": return "text-green-600 bg-green-50 border-green-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : HelpCircle;
  };

  const getCategoryColor = (category) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.color : "text-gray-600";
  };

  const handleReply = () => {
    if (newMessage.trim() && selectedTicket) {
      // Add reply logic here
      setNewMessage("");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (selectedTicket) {
    return (
      <div className="flex h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
        {/* Ticket List */}
        <div className="w-96 border-r bg-muted/30">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Tickets</h2>
              <Button size="sm" onClick={() => setShowCreateTicket(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    selectedTicket?.id === ticket.id
                      ? "bg-background border shadow-sm"
                      : "hover:bg-background/50"
                  )}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">{ticket.customer.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {ticket.isUrgent && <AlertCircle className="h-3 w-3 text-red-500" />}
                      {ticket.isStarred && <Star className="h-3 w-3 text-yellow-500" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getPriorityColor(ticket.priority))}
                    >
                      {ticket.priority}
                    </Badge>
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(ticket.status))} />
                    <span className="text-xs text-muted-foreground">{ticket.lastActivity}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Ticket Details */}
        <div className="flex-1 flex flex-col">
          {/* Ticket Header */}
          <div className="flex-shrink-0 p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-semibold">{selectedTicket.title}</h1>
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor(selectedTicket.priority))}>
                    {selectedTicket.priority}
                  </Badge>
                  <div className={cn("w-3 h-3 rounded-full", getStatusColor(selectedTicket.status))} />
                </div>
                <p className="text-muted-foreground">{selectedTicket.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium">{selectedTicket.customer.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Assigned to:</span>
                <p className="font-medium">{selectedTicket.assignedTo}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium">{formatTime(selectedTicket.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Response time:</span>
                <p className="font-medium">{selectedTicket.responseTime}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {selectedTicket.messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                        {message.type === "agent" && (
                          <Badge variant="outline" className="text-xs">Agent</Badge>
                        )}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Reply Box */}
          <div className="flex-shrink-0 p-6 border-t">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Type your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleReply}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Ticketing System</h1>
            <p className="text-muted-foreground">Manage customer support tickets and inquiries</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => setShowCreateTicket(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("open")}>Open</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>Resolved</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Priority
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPriorityFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("critical")}>Critical</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("high")}>High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>Medium</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("low")}>Low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 pt-4">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <TabsContent value={activeTab} className="h-full">
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{ticket.title}</h3>
                          <Badge variant="outline" className={cn("text-xs", getPriorityColor(ticket.priority))}>
                            {ticket.priority}
                          </Badge>
                          {ticket.isUrgent && <AlertCircle className="h-4 w-4 text-red-500" />}
                          {ticket.isStarred && <Star className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>#{ticket.id}</span>
                          <span>•</span>
                          <span>{ticket.customer.name}</span>
                          <span>•</span>
                          <span>{ticket.lastActivity}</span>
                          <span>•</span>
                          <span>Response: {ticket.responseTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", getStatusColor(ticket.status))} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredTickets.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search criteria." : "Create your first support ticket to get started."}
                  </p>
                  <Button onClick={() => setShowCreateTicket(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

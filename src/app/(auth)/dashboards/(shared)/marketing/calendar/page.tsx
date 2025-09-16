"use client";

import { useState } from "react";
;
import { 
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Share2,
  Mail,
  Globe,
  FlaskConical,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  Eye,
  Play,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface CalendarEvent {
  id: string;
  title: string;
  type: "email" | "social" | "blog" | "campaign" | "experiment" | "meeting";
  status: "draft" | "scheduled" | "approved" | "rejected" | "published" | "sent";
  date: string;
  time?: string;
  description?: string;
  assignee?: string;
  approver?: string;
  platforms?: string[];
  audience?: string;
  color: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Summer Sale Email Campaign",
    type: "email",
    status: "scheduled",
    date: "2024-01-20",
    time: "10:00",
    description: "Launch email for summer sale promotion",
    assignee: "Sarah Wilson",
    approver: "Mike Johnson",
    audience: "All Subscribers",
    color: "bg-blue-500",
  },
  {
    id: "2",
    title: "Instagram Product Feature Post",
    type: "social",
    status: "approved",
    date: "2024-01-21",
    time: "14:30",
    description: "Showcase new AI features on Instagram",
    assignee: "John Doe",
    approver: "Sarah Wilson",
    platforms: ["instagram", "facebook"],
    color: "bg-pink-500",
  },
  {
    id: "3",
    title: "Weekly Newsletter",
    type: "email",
    status: "draft",
    date: "2024-01-22",
    time: "09:00",
    description: "Weekly roundup of company news and insights",
    assignee: "Jane Smith",
    audience: "Newsletter Subscribers",
    color: "bg-green-500",
  },
  {
    id: "4",
    title: "CTA Button A/B Test Launch",
    type: "experiment",
    status: "scheduled",
    date: "2024-01-23",
    time: "00:00",
    description: "Test different call-to-action button variations",
    assignee: "Mike Johnson",
    color: "bg-purple-500",
  },
  {
    id: "5",
    title: "Product Launch Blog Post",
    type: "blog",
    status: "approved",
    date: "2024-01-24",
    time: "08:00",
    description: "Announce new product features and benefits",
    assignee: "Sarah Wilson",
    approver: "John Doe",
    color: "bg-orange-500",
  },
  {
    id: "6",
    title: "LinkedIn Thought Leadership",
    type: "social",
    status: "rejected",
    date: "2024-01-25",
    time: "11:00",
    description: "Industry insights and trends discussion",
    assignee: "Jane Smith",
    approver: "Mike Johnson",
    platforms: ["linkedin"],
    color: "bg-red-500",
  },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<"month" | "week" | "agenda">("month");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Filter events
  const filteredEvents = events.filter(event => {
    const typeMatch = filterType === "all" || event.type === filterType;
    const statusMatch = filterStatus === "all" || event.status === filterStatus;
    return typeMatch && statusMatch;
  });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateString);
  };

  // Navigate months
  const goToPrevious = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "scheduled": return <Clock className="h-3 w-3 text-blue-600" />;
      case "published": 
      case "sent": return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "rejected": return <XCircle className="h-3 w-3 text-red-600" />;
      case "draft": return <Edit3 className="h-3 w-3 text-gray-600" />;
      default: return null;
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-3 w-3" />;
      case "social": return <Share2 className="h-3 w-3" />;
      case "blog": return <Globe className="h-3 w-3" />;
      case "experiment": return <FlaskConical className="h-3 w-3" />;
      case "campaign": return <Users className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (const i = 0; i < totalCells; i++) {
      const dayIndex = i - startingDayOfWeek + 1;
      const isCurrentMonth = dayIndex > 0 && dayIndex <= daysInMonth;
      const date = isCurrentMonth ? new Date(year, month, dayIndex) : null;
      const isToday = date && date.toDateString() === today.toDateString();
      const dayEvents = date ? getEventsForDate(date) : [];

      days.push(
        <div
          key={i}
          className={`min-h-24 border border-border p-2 ${
            !isCurrentMonth 
              ? "bg-muted/30" 
              : isToday 
                ? "bg-primary/5 border-primary" 
                : "bg-background hover:bg-muted/50"
          }`}
        >
          {isCurrentMonth && (
            <>
              <div className={`text-sm font-medium mb-1 ${
                isToday ? "text-primary" : "text-foreground"
              }'}>
                {dayIndex}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={'${event.color} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity'}
                  >
                    <div className="flex items-center gap-1">
                      {getTypeIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                    {event.time && (
                      <div className="text-xs opacity-90">{event.time}</div>
                    )}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Calendar</h1>
          <p className="text-muted-foreground">
            Plan, schedule, and approve all your marketing content in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="px-3 py-2 border rounded-md bg-background text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="social">Social</option>
              <option value="blog">Blog</option>
              <option value="experiment">Experiments</option>
              <option value="campaign">Campaigns</option>
            </select>
            
            <select
              className="px-3 py-2 border rounded-md bg-background text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewType === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("month")}
              className="rounded-r-none"
            >
              Month
            </Button>
            <Button
              variant={viewType === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("week")}
              className="rounded-none"
            >
              Week
            </Button>
            <Button
              variant={viewType === "agenda" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("agenda")}
              className="rounded-l-none"
            >
              Agenda
            </Button>
          </div>
        </div>
      </div>

      {viewType === "month" && (
        <Card>
          <CardContent className="p-0">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-4 text-center font-medium text-muted-foreground border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {renderCalendarDays()}
            </div>
          </CardContent>
        </Card>
      )}

      {viewType === "agenda" && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>All scheduled marketing activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={'w-12 h-12 rounded-lg ${event.color} flex items-center justify-center text-white'}>
                        {getTypeIcon(event.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{event.title}</h3>
                          {getStatusIcon(event.status)}
                          <span className="text-xs px-2 py-1 bg-muted rounded capitalize">
                            {event.status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          {event.time && ' at ${event.time}'}
                        </div>
                        {event.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {event.assignee && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Assigned to {event.assignee}
                            </div>
                          )}
                          {event.platforms && (
                            <div className="flex items-center gap-1">
                              <Share2 className="h-3 w-3" />
                              {event.platforms.join(", ")}
                            </div>
                          )}
                          {event.audience && (
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {event.audience}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {event.status === "draft" && (
                        <Button size="sm" variant="outline">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {event.status === "scheduled" && (
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Publish Now
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.filter(e => new Date(e.date).getMonth() === month).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Events scheduled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.filter(e => e.status === "draft").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Publish</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.filter(e => e.status === "approved" || e.status === "scheduled").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.filter(e => e.status === "published" || e.status === "sent").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Live content
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
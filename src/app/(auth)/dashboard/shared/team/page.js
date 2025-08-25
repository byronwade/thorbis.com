"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Progress } from "@components/ui/progress";
import {
  Users,
  UserPlus,
  UserCheck,
  Shield,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Eye,
  Crown,
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  Award,
  Target,
  Zap,
  Briefcase,
  GraduationCap,
  Heart,
  ShieldCheck,
  UserX,
  UserMinus,
  UserCog,
  UserEdit,
  UserSearch,
  UserSettings,
  UserShield,
  UserStar,
  UserTag,
  UserX2,
  Users2,
  Users3,
  Users4,
  Users5,
  Users6,
  Users7,
  Users8,
  Users9,
  Users10,
} from "lucide-react";

// Sample team data
const sampleTeamMembers = [
  {
    id: "tm-001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@company.com",
    phone: "(555) 123-4567",
    role: "Operations Manager",
    department: "Operations",
    hireDate: "2022-03-15",
    status: "active",
    hourlyRate: 28.50,
    avatar: "/placeholder-avatar.svg",
    permissions: ["view_dashboard", "manage_team", "view_reports", "edit_settings"],
    skills: ["Project Management", "Team Leadership", "Process Optimization"],
    certifications: ["PMP", "Six Sigma Green Belt"],
    performance: {
      rating: 4.8,
      efficiency: 95,
      customerSatisfaction: 4.9,
      projectsCompleted: 24
    },
    lastActive: "2 hours ago",
    location: "San Francisco, CA",
    emergencyContact: {
      name: "John Johnson",
      phone: "(555) 987-6543",
      relationship: "Spouse"
    }
  },
  {
    id: "tm-002",
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "m.rodriguez@company.com",
    phone: "(555) 234-5678",
    role: "Field Technician",
    department: "Field Services",
    hireDate: "2021-11-08",
    status: "active",
    hourlyRate: 24.75,
    avatar: "/placeholder-avatar.svg",
    permissions: ["view_dashboard", "view_jobs", "update_status"],
    skills: ["HVAC Repair", "Electrical Systems", "Customer Service"],
    certifications: ["HVAC Certification", "Electrical License"],
    performance: {
      rating: 4.6,
      efficiency: 88,
      customerSatisfaction: 4.7,
      projectsCompleted: 156
    },
    lastActive: "1 hour ago",
    location: "Los Angeles, CA",
    emergencyContact: {
      name: "Maria Rodriguez",
      phone: "(555) 876-5432",
      relationship: "Sister"
    }
  },
  {
    id: "tm-003",
    firstName: "Emily",
    lastName: "Chen",
    email: "emily.chen@company.com",
    phone: "(555) 345-6789",
    role: "Customer Success Manager",
    department: "Customer Service",
    hireDate: "2023-01-20",
    status: "active",
    hourlyRate: 26.00,
    avatar: "/placeholder-avatar.svg",
    permissions: ["view_dashboard", "manage_customers", "view_reports"],
    skills: ["Customer Relations", "Problem Solving", "Communication"],
    certifications: ["Customer Service Excellence"],
    performance: {
      rating: 4.9,
      efficiency: 92,
      customerSatisfaction: 4.8,
      projectsCompleted: 89
    },
    lastActive: "30 minutes ago",
    location: "Seattle, WA",
    emergencyContact: {
      name: "James Chen",
      phone: "(555) 765-4321",
      relationship: "Brother"
    }
  },
  {
    id: "tm-004",
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@company.com",
    phone: "(555) 456-7890",
    role: "Senior Technician",
    department: "Field Services",
    hireDate: "2020-08-12",
    status: "active",
    hourlyRate: 32.00,
    avatar: "/placeholder-avatar.svg",
    permissions: ["view_dashboard", "manage_jobs", "train_technicians", "view_reports"],
    skills: ["Advanced HVAC", "System Design", "Training", "Quality Control"],
    certifications: ["Master HVAC", "EPA Certification", "Trainer Certification"],
    performance: {
      rating: 4.7,
      efficiency: 96,
      customerSatisfaction: 4.9,
      projectsCompleted: 203
    },
    lastActive: "3 hours ago",
    location: "Chicago, IL",
    emergencyContact: {
      name: "Lisa Thompson",
      phone: "(555) 654-3210",
      relationship: "Wife"
    }
  },
  {
    id: "tm-005",
    firstName: "Jessica",
    lastName: "Williams",
    email: "jessica.williams@company.com",
    phone: "(555) 567-8901",
    role: "Dispatcher",
    department: "Operations",
    hireDate: "2022-06-03",
    status: "active",
    hourlyRate: 22.50,
    avatar: "/placeholder-avatar.svg",
    permissions: ["view_dashboard", "manage_schedule", "dispatch_jobs"],
    skills: ["Scheduling", "Communication", "Problem Solving"],
    certifications: ["Dispatch Certification"],
    performance: {
      rating: 4.5,
      efficiency: 90,
      customerSatisfaction: 4.6,
      projectsCompleted: 67
    },
    lastActive: "15 minutes ago",
    location: "Miami, FL",
    emergencyContact: {
      name: "Robert Williams",
      phone: "(555) 543-2109",
      relationship: "Father"
    }
  }
];

const roles = [
  { id: "owner", name: "Owner", level: 5, color: "bg-purple-100 text-purple-800" },
  { id: "admin", name: "Administrator", level: 4, color: "bg-red-100 text-red-800" },
  { id: "manager", name: "Manager", level: 3, color: "bg-blue-100 text-blue-800" },
  { id: "supervisor", name: "Supervisor", level: 2, color: "bg-green-100 text-green-800" },
  { id: "technician", name: "Technician", level: 1, color: "bg-gray-100 text-gray-800" },
  { id: "assistant", name: "Assistant", level: 0, color: "bg-yellow-100 text-yellow-800" }
];

const departments = [
  "Operations",
  "Field Services", 
  "Customer Service",
  "Sales",
  "Marketing",
  "Finance",
  "Human Resources",
  "IT"
];

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(sampleTeamMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("overview");
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");

  // Calculate team statistics
  const teamStats = useMemo(() => {
    const total = teamMembers.length;
    const active = teamMembers.filter(member => member.status === "active").length;
    const avgRating = teamMembers.reduce((sum, member) => sum + member.performance.rating, 0) / total;
    const avgEfficiency = teamMembers.reduce((sum, member) => sum + member.performance.efficiency, 0) / total;
    const totalProjects = teamMembers.reduce((sum, member) => sum + member.performance.projectsCompleted, 0);
    const avgHourlyRate = teamMembers.reduce((sum, member) => sum + member.hourlyRate, 0) / total;

    return {
      total,
      active,
      inactive: total - active,
      avgRating: avgRating.toFixed(1),
      avgEfficiency: Math.round(avgEfficiency),
      totalProjects,
      avgHourlyRate: avgHourlyRate.toFixed(2)
    };
  }, [teamMembers]);

  // Filter and sort team members
  const filteredTeamMembers = useMemo(() => {
    let filtered = [...teamMembers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(member => member.role.toLowerCase().includes(roleFilter.toLowerCase()));
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "hireDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === "performance.rating" || sortBy === "performance.efficiency") {
        aValue = a.performance[sortBy.split(".")[1]];
        bValue = b.performance[sortBy.split(".")[1]];
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [teamMembers, searchTerm, roleFilter, departmentFilter, statusFilter, sortBy, sortOrder]);

  const handleAddMember = () => {
    // This would open a modal or navigate to add member form
    console.log("Add new team member");
  };

  const handleEditMember = (memberId) => {
    // This would open edit form
    console.log("Edit member:", memberId);
  };

  const handleRemoveMember = (memberId) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const getRoleColor = (role) => {
    const roleData = roles.find(r => r.name.toLowerCase().includes(role.toLowerCase()));
    return roleData?.color || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members, roles, and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Team</p>
                <p className="text-2xl font-bold">{teamStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Members</p>
                <p className="text-2xl font-bold">{teamStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold">{teamStats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Projects</p>
                <p className="text-2xl font-bold">{teamStats.totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Team Performance
                </CardTitle>
                <CardDescription>Overall team performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Average Efficiency</span>
                    <span>{teamStats.avgEfficiency}%</span>
                  </div>
                  <Progress value={teamStats.avgEfficiency} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Customer Satisfaction</span>
                    <span>4.7/5.0</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Project Completion</span>
                    <span>98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Department Distribution
                </CardTitle>
                <CardDescription>Team members by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.map(dept => {
                    const count = teamMembers.filter(member => member.department === dept).length;
                    const percentage = (count / teamMembers.length) * 100;
                    return (
                      <div key={dept} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{dept}</span>
                          <span>{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest team member activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.slice(0, 5).map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.firstName} />
                      <AvatarFallback>
                        {member.firstName[0]}{member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active {member.lastActive}
                      </p>
                    </div>
                    <Badge variant="secondary" className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                    <Input
                      placeholder="Search team members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by dept" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <div className="grid gap-4">
            {filteredTeamMembers.map(member => (
              <Card key={member.id} className="group hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={member.avatar} alt={member.firstName} />
                        <AvatarFallback className="text-lg">
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">
                            {member.firstName} {member.lastName}
                          </h3>
                          <Badge variant={member.status === "active" ? "secondary" : "outline"}>
                            {member.status}
                          </Badge>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.department}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {member.email}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {member.phone}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {member.location}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Rating: {member.performance.rating}/5.0</span>
                          <span>Efficiency: {member.performance.efficiency}%</span>
                          <span>Projects: {member.performance.projectsCompleted}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => handleEditMember(member.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Role Definitions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Definitions
                </CardTitle>
                <CardDescription>Define roles and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Access level: {role.level}
                        </div>
                      </div>
                      <Badge className={role.color}>
                        {role.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Permission Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Permission Matrix
                </CardTitle>
                <CardDescription>Manage permissions for each role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "View Dashboard",
                    "Manage Team",
                    "View Reports", 
                    "Edit Settings",
                    "Manage Customers",
                    "Dispatch Jobs",
                    "Manage Schedule",
                    "View Analytics"
                  ].map(permission => (
                    <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">{permission}</span>
                      <div className="flex items-center space-x-2">
                        {roles.map(role => (
                          <Switch key={role.id} defaultChecked={role.level >= 3} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Team performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Performance charts would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Team Insights
                </CardTitle>
                <CardDescription>Key insights about your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="font-medium">Top Performer</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sarah Johnson has the highest customer satisfaction rating
                    </p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <span className="font-medium">Training Opportunity</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      2 team members could benefit from additional training
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

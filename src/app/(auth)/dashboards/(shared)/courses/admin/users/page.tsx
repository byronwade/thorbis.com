"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Clock,
  Award,
  BookOpen,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const users = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@company.com",
    role: "Plumber",
    department: "Field Operations",
    status: "active",
    enrolledCourses: 5,
    completedCourses: 3,
    totalXP: 1250,
    lastActive: "2024-01-15",
    joinDate: "2023-08-12",
    avatar: null,
    progress: 68,
    certifications: ["Basic Plumbing", "Safety Protocols"],
    phone: "+1 (555) 123-4567",
    manager: "Mike Rodriguez"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Customer Service",
    department: "Retail",
    status: "active",
    enrolledCourses: 4,
    completedCourses: 4,
    totalXP: 1890,
    lastActive: "2024-01-14",
    joinDate: "2023-06-20",
    avatar: null,
    progress: 95,
    certifications: ["Customer Service Excellence", "Communication Skills"],
    phone: "+1 (555) 234-5678",
    manager: "Emma Wilson"
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    email: "mike.rodriguez@company.com",
    role: "Team Lead",
    department: "Field Operations",
    status: "active",
    enrolledCourses: 8,
    completedCourses: 6,
    totalXP: 2450,
    lastActive: "2024-01-15",
    joinDate: "2022-03-15",
    avatar: null,
    progress: 82,
    certifications: ["Advanced Plumbing", "Leadership", "Safety Protocols"],
    phone: "+1 (555) 345-6789",
    manager: "Alex Chen"
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma.wilson@company.com",
    role: "Manager",
    department: "Retail",
    status: "active",
    enrolledCourses: 6,
    completedCourses: 5,
    totalXP: 2100,
    lastActive: "2024-01-13",
    joinDate: "2021-11-08",
    avatar: null,
    progress: 88,
    certifications: ["Management Fundamentals", "Customer Service Excellence"],
    phone: "+1 (555) 456-7890",
    manager: "Alex Chen"
  },
  {
    id: 5,
    name: "David Chen",
    email: "david.chen@company.com",
    role: "New Hire",
    department: "Onboarding",
    status: "pending",
    enrolledCourses: 2,
    completedCourses: 0,
    totalXP: 150,
    lastActive: "2024-01-10",
    joinDate: "2024-01-08",
    avatar: null,
    progress: 15,
    certifications: [],
    phone: "+1 (555) 567-8901",
    manager: "HR Team"
  }
];

const userStats = {
  totalUsers: 247,
  activeUsers: 234,
  newThisMonth: 12,
  pendingOnboarding: 8,
  completionRate: 76.5,
  avgXP: 1450
};

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'plumber': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'customer service': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'team lead': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'manager': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'new hire': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'inactive': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">User Management</h1>
            <p className="text-muted-foreground">Manage learners, track progress, and oversee user accounts</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Users
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </motion.div>

      {/* User Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-blue-500" />
                <Badge variant="secondary">Total</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-600">{userStats.totalUsers}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-8 w-8 text-green-500" />
                <Badge variant="secondary" className="text-green-600">Active</Badge>
              </div>
              <div className="text-2xl font-bold text-green-600">{userStats.activeUsers}</div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <UserPlus className="h-8 w-8 text-purple-500" />
                <Badge variant="secondary" className="text-green-600">+{userStats.newThisMonth}</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600">{userStats.newThisMonth}</div>
              <p className="text-sm text-muted-foreground">New This Month</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-orange-500" />
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-600">{userStats.pendingOnboarding}</div>
              <p className="text-sm text-muted-foreground">Pending Onboarding</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-amber-500" />
                <Badge variant="secondary">{userStats.completionRate}%</Badge>
              </div>
              <div className="text-2xl font-bold text-amber-600">{userStats.completionRate}%</div>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-8 w-8 text-emerald-500" />
                <Badge variant="secondary">XP</Badge>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{userStats.avgXP}</div>
              <p className="text-sm text-muted-foreground">Average XP</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name, email, or department..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="plumber">Plumber</SelectItem>
                <SelectItem value="customer">Customer Service</SelectItem>
                <SelectItem value="team">Team Lead</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="new">New Hire</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              </CardTitle>
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{selectedUsers.length} selected</Badge>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        className="rounded border-neutral-300"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join(')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)} variant="outline">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: '${user.progress}%' }}
                            />
                          </div>
                          <span className="text-sm">{user.progress}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.completedCourses}/{user.enrolledCourses} courses
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-amber-600">{user.totalXP}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)} variant="outline">
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastActive}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deactivate User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Phone,
  MoreHorizontal,
  Edit,
  Trash2,
  Crown,
  User,
  Settings,
  Eye,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";

export default function UsersRolesSettings() {
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");

	const users = [
		{
			id: 1,
			name: "John Smith",
			email: "john.smith@techretailstore.com",
			phone: "+1 (555) 123-4567",
			role: "owner",
			status: "active",
			lastActive: "2 hours ago",
			avatar: null
		},
		{
			id: 2,
			name: "Sarah Johnson",
			email: "sarah.johnson@techretailstore.com",
			phone: "+1 (555) 234-5678",
			role: "admin",
			status: "active",
			lastActive: "1 day ago",
			avatar: null
		},
		{
			id: 3,
			name: "Mike Davis",
			email: "mike.davis@techretailstore.com",
			phone: "+1 (555) 345-6789",
			role: "manager",
			status: "active",
			lastActive: "3 hours ago",
			avatar: null
		},
		{
			id: 4,
			name: "Lisa Wilson",
			email: "lisa.wilson@techretailstore.com",
			phone: "+1 (555) 456-7890",
			role: "employee",
			status: "inactive",
			lastActive: "1 week ago",
			avatar: null
		}
	];

	const roles = [
		{
			id: "owner",
			name: "Owner",
			description: "Full access to all features and settings",
			permissions: ["all"],
			color: "bg-purple-100 text-purple-800",
			icon: Crown
		},
		{
			id: "admin",
			name: "Administrator",
			description: "Manage users, settings, and most business operations",
			permissions: ["users", "settings", "reports", "billing"],
			color: "bg-red-100 text-red-800",
			icon: Shield
		},
		{
			id: "manager",
			name: "Manager",
			description: "Manage daily operations and team members",
			permissions: ["operations", "team", "reports"],
			color: "bg-blue-100 text-blue-800",
			icon: Settings
		},
		{
			id: "employee",
			name: "Employee",
			description: "Access to assigned tasks and basic features",
			permissions: ["tasks", "profile"],
			color: "bg-green-100 text-green-800",
			icon: User
		}
	];

	const getRoleInfo = (roleId) => {
		return roles.find(role => role.id === roleId) || roles[3];
	};

	const getStatusColor = (status) => {
		return status === "active" 
			? "bg-green-100 text-green-800" 
			: "bg-gray-100 text-gray-800";
	};

	const filteredUsers = users.filter(user => {
		const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = roleFilter === "all" || user.role === roleFilter;
		return matchesSearch && matchesRole;
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight">Users & Roles</h1>
					<p className="text-muted-foreground">
						Manage team members, permissions, and access levels.
					</p>
				</div>
				<Button>
					<UserPlus className="h-4 w-4 mr-2" />
					Invite User
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<Users className="h-5 w-5 text-blue-600" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Users</p>
								<p className="text-2xl font-bold">{users.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<Shield className="h-5 w-5 text-green-600" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Active Users</p>
								<p className="text-2xl font-bold">
									{users.filter(u => u.status === "active").length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<Crown className="h-5 w-5 text-purple-600" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Admins</p>
								<p className="text-2xl font-bold">
									{users.filter(u => u.role === "admin" || u.role === "owner").length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<User className="h-5 w-5 text-orange-600" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Employees</p>
								<p className="text-2xl font-bold">
									{users.filter(u => u.role === "employee" || u.role === "manager").length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Roles Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Shield className="h-5 w-5" />
						<span>Role Permissions</span>
					</CardTitle>
					<CardDescription>
						Overview of available roles and their permissions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{roles.map((role) => {
							const Icon = role.icon;
							return (
								<div key={role.id} className="p-4 border rounded-lg space-y-3">
									<div className="flex items-center space-x-2">
										<Icon className="h-5 w-5" />
										<h3 className="font-semibold">{role.name}</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										{role.description}
									</p>
									<div className="flex flex-wrap gap-1">
										{role.permissions.slice(0, 3).map((permission) => (
											<Badge key={permission} variant="outline" className="text-xs">
												{permission}
											</Badge>
										))}
										{role.permissions.length > 3 && (
											<Badge variant="outline" className="text-xs">
												+{role.permissions.length - 3}
											</Badge>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Users Management */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center space-x-2">
								<Users className="h-5 w-5" />
								<span>Team Members</span>
							</CardTitle>
							<CardDescription>
								Manage user accounts and permissions.
							</CardDescription>
						</div>
						<div className="flex items-center space-x-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
								<Input
									placeholder="Search users..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 w-64"
								/>
							</div>
							<Select value={roleFilter} onValueChange={setRoleFilter}>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Roles</SelectItem>
									{roles.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Last Active</TableHead>
								<TableHead className="w-12"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.map((user) => {
								const roleInfo = getRoleInfo(user.role);
								const RoleIcon = roleInfo.icon;
								return (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<Avatar className="h-8 w-8">
													<AvatarImage src={user.avatar} />
													<AvatarFallback>
														{user.name.split(' ').map(n => n[0]).join('')}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{user.name}</p>
													<p className="text-sm text-muted-foreground">{user.email}</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="flex items-center space-x-2 text-sm">
													<Mail className="h-3 w-3" />
													<span>{user.email}</span>
												</div>
												<div className="flex items-center space-x-2 text-sm text-muted-foreground">
													<Phone className="h-3 w-3" />
													<span>{user.phone}</span>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-2">
												<RoleIcon className="h-4 w-4" />
												<Badge className={roleInfo.color}>
													{roleInfo.name}
												</Badge>
											</div>
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(user.status)}>
												{user.status}
											</Badge>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{user.lastActive}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>
														<Eye className="h-4 w-4 mr-2" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Edit className="h-4 w-4 mr-2" />
														Edit User
													</DropdownMenuItem>
													<DropdownMenuItem className="text-red-600">
														<Trash2 className="h-4 w-4 mr-2" />
														Remove User
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

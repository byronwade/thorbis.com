"use client";

import React, { useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Filter,
  Download,
  Search,
  Eye,
  Lock,
  Unlock,
  UserX,
  Activity
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";

export default function SecurityLogsSettings() {
	const [searchTerm, setSearchTerm] = useState("");
	const [eventFilter, setEventFilter] = useState("all");
	const [timeFilter, setTimeFilter] = useState("7d");

	const securityEvents = [
		{
			id: 1,
			type: "login_success",
			user: "john.smith@techretailstore.com",
			timestamp: "2024-01-15T10:30:00Z",
			ipAddress: "192.168.1.100",
			location: "Austin, TX",
			device: "Chrome on Windows",
			details: "Successful login"
		},
		{
			id: 2,
			type: "login_failed",
			user: "unknown@example.com",
			timestamp: "2024-01-15T09:45:00Z",
			ipAddress: "203.0.113.42",
			location: "Unknown",
			device: "Firefox on Linux",
			details: "Failed login attempt - invalid credentials"
		},
		{
			id: 3,
			type: "password_change",
			user: "sarah.johnson@techretailstore.com",
			timestamp: "2024-01-14T16:20:00Z",
			ipAddress: "192.168.1.105",
			location: "Austin, TX",
			device: "Safari on macOS",
			details: "Password changed successfully"
		},
		{
			id: 4,
			type: "account_locked",
			user: "mike.davis@techretailstore.com",
			timestamp: "2024-01-14T14:15:00Z",
			ipAddress: "192.168.1.110",
			location: "Austin, TX",
			device: "Chrome on Windows",
			details: "Account locked due to multiple failed attempts"
		},
		{
			id: 5,
			type: "permission_change",
			user: "admin@techretailstore.com",
			timestamp: "2024-01-14T11:30:00Z",
			ipAddress: "192.168.1.101",
			location: "Austin, TX",
			device: "Chrome on Windows",
			details: "User permissions updated for lisa.wilson@techretailstore.com"
		},
		{
			id: 6,
			type: "data_export",
			user: "john.smith@techretailstore.com",
			timestamp: "2024-01-13T13:45:00Z",
			ipAddress: "192.168.1.100",
			location: "Austin, TX",
			device: "Chrome on Windows",
			details: "Customer data exported"
		}
	];

	const securityStats = {
		totalEvents: securityEvents.length,
		successfulLogins: securityEvents.filter(e => e.type === "login_success").length,
		failedAttempts: securityEvents.filter(e => e.type === "login_failed").length,
		suspiciousActivity: securityEvents.filter(e => e.type === "login_failed" || e.type === "account_locked").length
	};

	const getEventIcon = (type) => {
		switch (type) {
			case "login_success":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "login_failed":
				return <AlertTriangle className="h-4 w-4 text-red-600" />;
			case "password_change":
				return <Lock className="h-4 w-4 text-blue-600" />;
			case "account_locked":
				return <UserX className="h-4 w-4 text-red-600" />;
			case "permission_change":
				return <Shield className="h-4 w-4 text-purple-600" />;
			case "data_export":
				return <Download className="h-4 w-4 text-orange-600" />;
			default:
				return <Activity className="h-4 w-4 text-gray-600" />;
		}
	};

	const getEventBadge = (type) => {
		switch (type) {
			case "login_success":
				return <Badge className="bg-green-100 text-green-800">Success</Badge>;
			case "login_failed":
				return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
			case "password_change":
				return <Badge className="bg-blue-100 text-blue-800">Security</Badge>;
			case "account_locked":
				return <Badge className="bg-red-100 text-red-800">Locked</Badge>;
			case "permission_change":
				return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
			case "data_export":
				return <Badge className="bg-orange-100 text-orange-800">Export</Badge>;
			default:
				return <Badge className="bg-gray-100 text-gray-800">Other</Badge>;
		}
	};

	const getDeviceIcon = (device) => {
		if (device.includes("Windows") || device.includes("macOS") || device.includes("Linux")) {
			return <Monitor className="h-4 w-4" />;
		}
		if (device.includes("iPhone") || device.includes("Android")) {
			return <Smartphone className="h-4 w-4" />;
		}
		return <Globe className="h-4 w-4" />;
	};

	const formatTimestamp = (timestamp) => {
		return new Date(timestamp).toLocaleString();
	};

	const filteredEvents = securityEvents.filter(event => {
		const matchesSearch = event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 event.ipAddress.includes(searchTerm);
		const matchesEvent = eventFilter === "all" || event.type === eventFilter;
		return matchesSearch && matchesEvent;
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Security & Logs</h1>
				<p className="text-muted-foreground">
					Monitor security events, audit trails, and user activity across your organization.
				</p>
			</div>

			{/* Security Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<Activity className="h-5 w-5 text-blue-600" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Events</p>
								<p className="text-2xl font-bold">{securityStats.totalEvents}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<CheckCircle className="h-5 w-5 text-green-600" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Successful Logins</p>
								<p className="text-2xl font-bold">{securityStats.successfulLogins}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<AlertTriangle className="h-5 w-5 text-red-600" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Failed Attempts</p>
								<p className="text-2xl font-bold">{securityStats.failedAttempts}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<Shield className="h-5 w-5 text-orange-600" />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Suspicious Activity</p>
								<p className="text-2xl font-bold">{securityStats.suspiciousActivity}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Security Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Shield className="h-5 w-5" />
						<span>Security Settings</span>
					</CardTitle>
					<CardDescription>
						Configure security policies and access controls.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<h4 className="font-semibold">Authentication</h4>
							<div className="space-y-3">
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">Two-Factor Authentication</p>
										<p className="text-sm text-muted-foreground">Require 2FA for all users</p>
									</div>
									<Badge className="bg-green-100 text-green-800">Enabled</Badge>
								</div>
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">Password Requirements</p>
										<p className="text-sm text-muted-foreground">Strong password policy</p>
									</div>
									<Badge className="bg-green-100 text-green-800">Active</Badge>
								</div>
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">Session Timeout</p>
										<p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
									</div>
									<Badge className="bg-blue-100 text-blue-800">8 hours</Badge>
								</div>
							</div>
						</div>
						<div className="space-y-4">
							<h4 className="font-semibold">Access Control</h4>
							<div className="space-y-3">
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">IP Whitelist</p>
										<p className="text-sm text-muted-foreground">Restrict access by IP</p>
									</div>
									<Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
								</div>
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">Login Attempts</p>
										<p className="text-sm text-muted-foreground">Max failed attempts</p>
									</div>
									<Badge className="bg-blue-100 text-blue-800">5 attempts</Badge>
								</div>
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">Account Lockout</p>
										<p className="text-sm text-muted-foreground">Auto-lock duration</p>
									</div>
									<Badge className="bg-blue-100 text-blue-800">30 minutes</Badge>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Security Events Log */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center space-x-2">
								<Clock className="h-5 w-5" />
								<span>Security Events</span>
							</CardTitle>
							<CardDescription>
								Recent security events and audit trail.
							</CardDescription>
						</div>
						<div className="flex items-center space-x-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
								<Input
									placeholder="Search events..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 w-64"
								/>
							</div>
							<Select value={eventFilter} onValueChange={setEventFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Event Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Events</SelectItem>
									<SelectItem value="login_success">Successful Logins</SelectItem>
									<SelectItem value="login_failed">Failed Logins</SelectItem>
									<SelectItem value="password_change">Password Changes</SelectItem>
									<SelectItem value="account_locked">Account Locks</SelectItem>
									<SelectItem value="permission_change">Permission Changes</SelectItem>
									<SelectItem value="data_export">Data Exports</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline">
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Event</TableHead>
								<TableHead>User</TableHead>
								<TableHead>Time</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Device</TableHead>
								<TableHead>Details</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredEvents.map((event) => (
								<TableRow key={event.id}>
									<TableCell>
										<div className="flex items-center space-x-2">
											{getEventIcon(event.type)}
											{getEventBadge(event.type)}
										</div>
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">{event.user}</p>
											<p className="text-sm text-muted-foreground">{event.ipAddress}</p>
										</div>
									</TableCell>
									<TableCell className="text-sm">
										{formatTimestamp(event.timestamp)}
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											<MapPin className="h-3 w-3 text-muted-foreground" />
											<span className="text-sm">{event.location}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											{getDeviceIcon(event.device)}
											<span className="text-sm">{event.device}</span>
										</div>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{event.details}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}



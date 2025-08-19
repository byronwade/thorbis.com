"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Badge } from "@components/ui/badge";
import { Users, Clock, DollarSign, Download, CheckCircle, AlertCircle, TrendingUp, Plus, Calculator, CreditCard, User } from "lucide-react";

/**
 * Universal Payroll Module
 * Core payroll features available to all industries with customizations
 */
export default function PayrollModule() {
	const [activeTab, setActiveTab] = useState("overview");

	// Sample data - in real app, this would come from API
	const payrollData = {
		overview: {
			totalPayroll: 85000,
			totalEmployees: 12,
			totalHours: 1920,
			averageHourlyRate: 25.5,
			pendingApprovals: 3,
			upcomingPayroll: "2024-01-31",
		},
		employees: [
			{
				id: 1,
				name: "John Smith",
				role: "Senior Technician",
				hoursThisPeriod: 80,
				hourlyRate: 32.0,
				grossPay: 2560,
				status: "active",
				avatar: null,
			},
			{
				id: 2,
				name: "Sarah Johnson",
				role: "Project Manager",
				hoursThisPeriod: 80,
				hourlyRate: 35.0,
				grossPay: 2800,
				status: "active",
				avatar: null,
			},
			{
				id: 3,
				name: "Mike Wilson",
				role: "Junior Technician",
				hoursThisPeriod: 75,
				hourlyRate: 22.0,
				grossPay: 1650,
				status: "pending_approval",
				avatar: null,
			},
		],
		timeEntries: [
			{ id: 1, employee: "John Smith", date: "2024-01-15", clockIn: "08:00", clockOut: "17:00", hours: 8, status: "approved" },
			{ id: 2, employee: "Sarah Johnson", date: "2024-01-15", clockIn: "09:00", clockOut: "18:00", hours: 8, status: "approved" },
			{ id: 3, employee: "Mike Wilson", date: "2024-01-15", clockIn: "08:30", clockOut: "16:30", hours: 7.5, status: "pending" },
		],
		payrollRuns: [
			{ id: 1, period: "Jan 1-15, 2024", employees: 12, grossPay: 42500, netPay: 31875, status: "completed", runDate: "2024-01-16" },
			{ id: 2, period: "Dec 16-31, 2023", employees: 12, grossPay: 45000, netPay: 33750, status: "completed", runDate: "2024-01-01" },
			{ id: 3, period: "Dec 1-15, 2023", employees: 11, grossPay: 41250, netPay: 30938, status: "completed", runDate: "2023-12-16" },
		],
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatHours = (hours) => {
		return `${hours}h`;
	};

	return (
		<div className="container mx-auto space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Payroll & Time Tracking</h1>
					<p className="text-muted-foreground mt-1">Manage employee time, calculate payroll, and track labor costs</p>
				</div>
				<div className="flex space-x-2">
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export Payroll
					</Button>
					<Button size="sm">
						<Plus className="h-4 w-4 mr-2" />
						Run Payroll
					</Button>
				</div>
			</div>

			{/* Payroll Overview Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
						<DollarSign className="h-4 w-4 text-success" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-success">{formatCurrency(payrollData.overview.totalPayroll)}</div>
						<p className="text-xs text-muted-foreground">This month</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Employees</CardTitle>
						<Users className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-primary">{payrollData.overview.totalEmployees}</div>
						<p className="text-xs text-muted-foreground">Active employees</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Hours</CardTitle>
						<Clock className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-purple-600">{formatHours(payrollData.overview.totalHours)}</div>
						<p className="text-xs text-muted-foreground">This month</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg Hourly Rate</CardTitle>
						<Calculator className="h-4 w-4 text-warning" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-warning">{formatCurrency(payrollData.overview.averageHourlyRate)}</div>
						<p className="text-xs text-muted-foreground">Across all roles</p>
					</CardContent>
				</Card>
			</div>

			{/* Alert for pending items */}
			{payrollData.overview.pendingApprovals > 0 && (
				<Card className="border-orange-200 bg-orange-50 dark:bg-warning/20">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center space-x-3">
							<AlertCircle className="h-5 w-5 text-warning" />
							<div>
								<p className="font-medium text-warning dark:text-warning/70">{payrollData.overview.pendingApprovals} time entries need approval</p>
								<p className="text-sm text-warning dark:text-warning/90">Next payroll run: {payrollData.overview.upcomingPayroll}</p>
							</div>
						</div>
						<Button size="sm" variant="outline">
							Review Now
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="employees">Employees</TabsTrigger>
					<TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
					<TabsTrigger value="payroll-runs">Payroll Runs</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Recent Time Entries */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Time Entries</CardTitle>
								<CardDescription>Latest employee time submissions</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{payrollData.timeEntries.map((entry) => (
										<div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex items-center space-x-3">
												<div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
													<User className="h-4 w-4" />
												</div>
												<div>
													<p className="font-medium">{entry.employee}</p>
													<p className="text-sm text-muted-foreground">
														{entry.date} • {entry.clockIn} - {entry.clockOut}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium">{formatHours(entry.hours)}</p>
												<Badge variant={entry.status === "approved" ? "default" : "secondary"}>{entry.status}</Badge>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Labor Cost Chart Placeholder */}
						<Card>
							<CardHeader>
								<CardTitle>Labor Cost Trends</CardTitle>
								<CardDescription>Monthly labor cost analysis</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-64 flex items-center justify-center bg-muted rounded-lg">
									<div className="text-center">
										<TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<p className="text-muted-foreground">Labor cost chart coming soon</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="employees" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Employee Payroll Summary</CardTitle>
							<CardDescription>Current pay period breakdown</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{payrollData.employees.map((employee) => (
									<div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
										<div className="flex items-center space-x-4">
											<div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
												<User className="h-6 w-6" />
											</div>
											<div>
												<p className="font-medium text-lg">{employee.name}</p>
												<p className="text-sm text-muted-foreground">{employee.role}</p>
												<p className="text-sm text-muted-foreground">
													{formatHours(employee.hoursThisPeriod)} @ {formatCurrency(employee.hourlyRate)}/hr
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-xl font-semibold text-success">{formatCurrency(employee.grossPay)}</p>
											<Badge variant={employee.status === "active" ? "default" : "secondary"}>{employee.status.replace("_", " ")}</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="time-tracking" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Time Entry Management</CardTitle>
							<CardDescription>Review and approve employee time entries</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{payrollData.timeEntries.map((entry) => (
									<div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center space-x-4">
											<div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
												<Clock className="h-5 w-5" />
											</div>
											<div>
												<p className="font-medium">{entry.employee}</p>
												<p className="text-sm text-muted-foreground">
													{entry.date} • {entry.clockIn} - {entry.clockOut}
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-4">
											<div className="text-right">
												<p className="font-medium">{formatHours(entry.hours)}</p>
												<Badge variant={entry.status === "approved" ? "default" : "secondary"}>{entry.status}</Badge>
											</div>
											{entry.status === "pending" && (
												<div className="flex space-x-2">
													<Button size="sm" variant="outline">
														<CheckCircle className="h-4 w-4" />
													</Button>
													<Button size="sm" variant="outline">
														<AlertCircle className="h-4 w-4" />
													</Button>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="payroll-runs" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Payroll History</CardTitle>
							<CardDescription>Previous payroll runs and payments</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{payrollData.payrollRuns.map((run) => (
									<div key={run.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
										<div className="flex items-center space-x-4">
											<div className="h-10 w-10 bg-success/10 text-success rounded-full flex items-center justify-center">
												<CreditCard className="h-5 w-5" />
											</div>
											<div>
												<p className="font-medium">{run.period}</p>
												<p className="text-sm text-muted-foreground">
													{run.employees} employees • Run on {run.runDate}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium">Gross: {formatCurrency(run.grossPay)}</p>
											<p className="text-sm text-muted-foreground">Net: {formatCurrency(run.netPay)}</p>
											<Badge variant="default">{run.status}</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

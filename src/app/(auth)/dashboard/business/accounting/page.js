"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Badge } from "@components/ui/badge";
import { TrendingUp, FileText, Download, DollarSign, CreditCard, Receipt, PieChart, BarChart3, AlertCircle, CheckCircle, Clock, Plus } from "lucide-react";
import { cn } from "@lib/utils";

/**
 * Universal Accounting Module
 * Core accounting features available to all industries with customizations
 */
export default function AccountingModule() {
	const [activeTab, setActiveTab] = useState("overview");

	// Sample data - in real app, this would come from API
	const accountingData = {
		overview: {
			totalRevenue: 125000,
			totalExpenses: 85000,
			netIncome: 40000,
			outstandingInvoices: 15000,
			accountsReceivable: 25000,
			accountsPayable: 12000,
		},
		recentTransactions: [
			{ id: 1, date: "2024-01-15", description: "Invoice #1001", amount: 2500, type: "income", status: "paid" },
			{ id: 2, date: "2024-01-14", description: "Office Supplies", amount: -150, type: "expense", status: "pending" },
			{ id: 3, date: "2024-01-13", description: "Service Payment", amount: 1800, type: "income", status: "paid" },
			{ id: 4, date: "2024-01-12", description: "Vehicle Maintenance", amount: -350, type: "expense", status: "paid" },
		],
		accountsReceivable: [
			{ id: 1, customer: "ABC Corp", amount: 5000, dueDate: "2024-01-20", status: "overdue" },
			{ id: 2, customer: "XYZ Ltd", amount: 3500, dueDate: "2024-01-25", status: "due" },
			{ id: 3, customer: "Smith & Co", amount: 6500, dueDate: "2024-02-01", status: "pending" },
		],
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	return (
		<div className="container mx-auto space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Accounting</h1>
					<p className="text-muted-foreground mt-1">Manage your finances, track expenses, and monitor cash flow</p>
				</div>
				<div className="flex space-x-2">
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Button size="sm">
						<Plus className="h-4 w-4 mr-2" />
						New Transaction
					</Button>
				</div>
			</div>

			{/* Financial Overview Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<TrendingUp className="h-4 w-4 text-success" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-success">{formatCurrency(accountingData.overview.totalRevenue)}</div>
						<p className="text-xs text-muted-foreground">+12% from last month</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
						<BarChart3 className="h-4 w-4 text-destructive" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-destructive">{formatCurrency(accountingData.overview.totalExpenses)}</div>
						<p className="text-xs text-muted-foreground">+3% from last month</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Net Income</CardTitle>
						<DollarSign className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-primary">{formatCurrency(accountingData.overview.netIncome)}</div>
						<p className="text-xs text-muted-foreground">+15% from last month</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
						<Receipt className="h-4 w-4 text-warning" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-warning">{formatCurrency(accountingData.overview.outstandingInvoices)}</div>
						<p className="text-xs text-muted-foreground">3 invoices pending</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Accounts Receivable</CardTitle>
						<CreditCard className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-purple-600">{formatCurrency(accountingData.overview.accountsReceivable)}</div>
						<p className="text-xs text-muted-foreground">5 outstanding payments</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Accounts Payable</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-muted-foreground">{formatCurrency(accountingData.overview.accountsPayable)}</div>
						<p className="text-xs text-muted-foreground">2 bills due soon</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="transactions">Transactions</TabsTrigger>
					<TabsTrigger value="receivables">Receivables</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Recent Transactions */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Transactions</CardTitle>
								<CardDescription>Latest financial activity</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{accountingData.recentTransactions.map((transaction) => (
										<div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex items-center space-x-3">
												<div className={cn("h-8 w-8 rounded-full flex items-center justify-center", transaction.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
													{transaction.type === "income" ? <TrendingUp className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
												</div>
												<div>
													<p className="font-medium">{transaction.description}</p>
													<p className="text-sm text-muted-foreground">{transaction.date}</p>
												</div>
											</div>
											<div className="text-right">
												<p className={cn("font-medium", transaction.type === "income" ? "text-success" : "text-destructive")}>{formatCurrency(Math.abs(transaction.amount))}</p>
												<Badge variant={transaction.status === "paid" ? "default" : "secondary"}>{transaction.status}</Badge>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Cash Flow Chart Placeholder */}
						<Card>
							<CardHeader>
								<CardTitle>Cash Flow Trend</CardTitle>
								<CardDescription>Monthly income vs expenses</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-64 flex items-center justify-center bg-muted rounded-lg">
									<div className="text-center">
										<PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<p className="text-muted-foreground">Cash flow chart coming soon</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="transactions" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Transactions</CardTitle>
							<CardDescription>Complete transaction history</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{accountingData.recentTransactions.map((transaction) => (
									<div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
										<div className="flex items-center space-x-4">
											<div className={cn("h-10 w-10 rounded-full flex items-center justify-center", transaction.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
												{transaction.type === "income" ? <TrendingUp className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
											</div>
											<div>
												<p className="font-medium text-lg">{transaction.description}</p>
												<p className="text-sm text-muted-foreground">{transaction.date}</p>
											</div>
										</div>
										<div className="text-right">
											<p className={cn("text-xl font-semibold", transaction.type === "income" ? "text-success" : "text-destructive")}>
												{transaction.type === "income" ? "+" : "-"}
												{formatCurrency(Math.abs(transaction.amount))}
											</p>
											<Badge variant={transaction.status === "paid" ? "default" : "secondary"}>{transaction.status}</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="receivables" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Accounts Receivable</CardTitle>
							<CardDescription>Outstanding customer payments</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{accountingData.accountsReceivable.map((receivable) => (
									<div key={receivable.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center space-x-4">
											<div className={cn("h-10 w-10 rounded-full flex items-center justify-center", receivable.status === "overdue" ? "bg-destructive/10 text-destructive" : receivable.status === "due" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary")}>
												{receivable.status === "overdue" ? <AlertCircle className="h-5 w-5" /> : receivable.status === "due" ? <Clock className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
											</div>
											<div>
												<p className="font-medium text-lg">{receivable.customer}</p>
												<p className="text-sm text-muted-foreground">Due: {receivable.dueDate}</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-xl font-semibold">{formatCurrency(receivable.amount)}</p>
											<Badge variant={receivable.status === "overdue" ? "destructive" : receivable.status === "due" ? "secondary" : "default"}>{receivable.status}</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="reports" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center">
									<FileText className="h-5 w-5 mr-2" />
									Profit & Loss
								</CardTitle>
								<CardDescription>Income and expense summary</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" className="w-full">
									Generate Report
								</Button>
							</CardContent>
						</Card>

						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center">
									<BarChart3 className="h-5 w-5 mr-2" />
									Balance Sheet
								</CardTitle>
								<CardDescription>Assets, liabilities, and equity</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" className="w-full">
									Generate Report
								</Button>
							</CardContent>
						</Card>

						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center">
									<PieChart className="h-5 w-5 mr-2" />
									Cash Flow
								</CardTitle>
								<CardDescription>Money in and money out</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" className="w-full">
									Generate Report
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

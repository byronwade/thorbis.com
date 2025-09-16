"use client";

import React from "react";
;
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Play,
  Shield,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  Target,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {  } from '@/components/ui';


const aiInsights = [
  {
    type: "optimization",
    title: "Payroll Cost Optimization",
    description: "AI identified $2,400/month in potential savings through better time tracking",
    impact: "High",
    action: "Review recommendations",
    icon: Target,
  },
  {
    type: "compliance",
    title: "Tax Filing Reminder",
    description: "Quarterly tax filing due in 5 days. AI has prepared all documents",
    impact: "Critical",
    action: "Review & submit",
    icon: Shield,
  },
  {
    type: "efficiency",
    title: "Onboarding Automation",
    description: "AI can automate 87% of new hire paperwork based on similar roles",
    impact: "Medium",
    action: "Enable automation",
    icon: Brain,
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: "Run Payroll - Bi-weekly",
    dueDate: "Tomorrow",
    status: "ready",
    employees: 24,
    amount: "$48,250",
    automated: true,
  },
  {
    id: 2,
    title: "Review Time Off Requests",
    dueDate: "Today",
    status: "pending",
    employees: 3,
    automated: false,
  },
  {
    id: 3,
    title: "Benefits Enrollment Deadline",
    dueDate: "In 3 days",
    status: "in-progress",
    employees: 8,
    automated: true,
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Payroll processed",
    description: "Bi-weekly payroll for 24 employees",
    time: "2 hours ago",
    amount: "$48,250",
    status: "completed",
  },
  {
    id: 2,
    action: "New employee onboarded",
    description: "Sarah Johnson - Marketing Manager",
    time: "1 day ago",
    status: "completed",
  },
  {
    id: 3,
    action: "Tax filing submitted",
    description: "Q4 federal and state taxes",
    time: "3 days ago",
    status: "completed",
  },
];

export function PayrollDashboard() {
  return (
    <div className="relative flex-1 overflow-y-auto flex flex-col min-w-0 gap-6 pt-4 pb-32 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-white">Payroll Dashboard</h1>
          <p className="text-neutral-400">
            AI-powered payroll management with automated compliance monitoring
          </p>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <Brain className="mr-2 h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">AI Autopilot Active</span>
            </div>
            <div className="flex items-center px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
              <CheckCircle className="mr-2 h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">100% Compliant</span>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center text-xs text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">Annual Payroll</p>
              <p className="text-2xl font-bold text-white">$2.4M</p>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-center text-xs text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2 this month
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">Employees</p>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-center text-xs text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                All systems green
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">Compliance Score</p>
              <p className="text-2xl font-bold text-green-400">100%</p>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-800/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Brain className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-center text-xs text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                87% automated
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">AI Efficiency</p>
              <p className="text-2xl font-bold text-white">87%</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Play className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">Run Payroll</h3>
            <p className="text-neutral-400 text-sm">AI Autopilot Ready</p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">Add Employee</h3>
            <p className="text-neutral-400 text-sm">AI Onboarding</p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">Tax Filing</h3>
            <p className="text-neutral-400 text-sm">Auto-Generated</p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <Brain className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">AI Insights</h3>
            <p className="text-neutral-400 text-sm">3 New Alerts</p>
          </div>
        </div>

        {/* AI Insights and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 hover:bg-neutral-800/50 transition-all duration-200">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Brain className="w-4 h-4 text-blue-400" />
              </div>
              AI Insights & Recommendations
            </h2>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-neutral-800/30 hover:bg-neutral-700/30 transition-colors">
                  <div className={`p-2 rounded-full ${
                    insight.impact === "Critical" ? "bg-red-500/10" :
                    insight.impact === "High" ? "bg-yellow-500/10" :
                    "bg-blue-500/10"
                  }`}>
                    <insight.icon className={`h-4 w-4 ${
                      insight.impact === "Critical" ? "text-red-400" :
                      insight.impact === "High" ? "text-yellow-400" :
                      "text-blue-400"
                    }'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-white">{insight.title}</h4>
                      <span className={'px-2 py-0.5 text-xs font-medium rounded ${
                        insight.impact === "Critical" ? "bg-red-500/20 text-red-400" :
                        insight.impact === "High" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-blue-500/20 text-blue-400"
                      }'}>
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 mb-2">{insight.description}</p>
                    <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center">
                      {insight.action} <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 hover:bg-neutral-800/50 transition-all duration-200">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              Upcoming Tasks
            </h2>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-neutral-800/30">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-white">{task.title}</h4>
                    {task.automated && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded flex items-center">
                        <Zap className="mr-1 h-2 w-2" />
                        Auto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {task.dueDate}
                    </span>
                    {task.employees && (
                      <span className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {task.employees}
                      </span>
                    )}
                  </div>
                  {task.amount && (
                    <div className="font-semibold text-green-400 text-lg">
                      {task.amount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 hover:bg-neutral-800/50 transition-all duration-200">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-neutral-800/30 hover:bg-neutral-700/30 transition-colors">
                <div className="p-2 rounded-full bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white">{activity.action}</h4>
                  <p className="text-sm text-neutral-400">{activity.description}</p>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <div className="font-semibold text-green-400">{activity.amount}</div>
                  )}
                  <div className="text-xs text-neutral-400">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
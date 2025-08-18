"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Calendar, Clock, MapPin, Wrench, User } from "lucide-react";

/**
 * Field Service Jobs Widget
 * Displays upcoming and active field service jobs
 */
export default function FieldServiceJobsWidget() {
	// Mock data - replace with real API data
	const upcomingJobs = [
		{
			id: 1,
			title: "HVAC Maintenance",
			customer: "Johnson Residence",
			time: "10:00 AM",
			technician: "Mike Smith",
			status: "scheduled",
			priority: "medium",
			address: "123 Oak St"
		},
		{
			id: 2,
			title: "Plumbing Repair",
			customer: "Downtown Office",
			time: "2:00 PM", 
			technician: "Sarah Davis",
			status: "in_progress",
			priority: "high",
			address: "456 Main Ave"
		}
	];

	const getStatusColor = (status) => {
		switch (status) {
			case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
			case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
			case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200';
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case 'high': return 'text-red-600';
			case 'medium': return 'text-yellow-600';
			case 'low': return 'text-green-600';
			default: return 'text-gray-600';
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
							<Wrench className="h-4 w-4 text-blue-600" />
						</div>
						<div>
							<CardTitle className="text-sm">Field Service Jobs</CardTitle>
							<CardDescription className="text-xs">Today's schedule</CardDescription>
						</div>
					</div>
					<Button size="sm" variant="outline" className="text-xs h-7">
						View All
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0 space-y-3">
				{upcomingJobs.map((job) => (
					<div key={job.id} className="p-3 border rounded-lg space-y-2">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="flex items-center space-x-2 mb-1">
									<h4 className="font-medium text-sm">{job.title}</h4>
									<Badge className={`text-xs ${getStatusColor(job.status)}`}>
										{job.status.replace('_', ' ')}
									</Badge>
								</div>
								<div className="space-y-1 text-xs text-muted-foreground">
									<div className="flex items-center space-x-1">
										<User className="h-3 w-3" />
										<span>{job.customer}</span>
									</div>
									<div className="flex items-center space-x-1">
										<Clock className="h-3 w-3" />
										<span>{job.time}</span>
										<span className={`ml-2 font-medium ${getPriorityColor(job.priority)}`}>
											{job.priority}
										</span>
									</div>
									<div className="flex items-center space-x-1">
										<MapPin className="h-3 w-3" />
										<span>{job.address}</span>
									</div>
									<div className="flex items-center space-x-1">
										<Wrench className="h-3 w-3" />
										<span>{job.technician}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
				<Button size="sm" variant="outline" className="w-full mt-3">
					<Calendar className="h-3 w-3 mr-1" />
					Schedule New Job
				</Button>
			</CardContent>
		</Card>
	);
}

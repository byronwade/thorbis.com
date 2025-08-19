"use client";
import React from "react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, BarChart, Bar, RadialBarChart, RadialBar, Tooltip, Legend } from "recharts";

const usersConfig = {
	users: { label: "Users", color: "hsl(var(--primary))" },
};

const usersData = [
	{ month: "Jan", users: 1200000 },
	{ month: "Feb", users: 1380000 },
	{ month: "Mar", users: 1520000 },
	{ month: "Apr", users: 1710000 },
	{ month: "May", users: 1940000 },
	{ month: "Jun", users: 2100000 },
	{ month: "Jul", users: 2300000 },
];

const conversionConfig = {
	conversion: { label: "Booking Conversion", color: "hsl(var(--muted-foreground))" },
};

const conversionData = [
	{ segment: "Search", conversion: 8 },
	{ segment: "Views", conversion: 12 },
	{ segment: "Leads", conversion: 16 },
	{ segment: "Bookings", conversion: 18 },
];

const npsConfig = {
	nps: { label: "NPS", color: "hsl(var(--muted-foreground))" },
};

const npsData = [{ name: "NPS", nps: 61, fill: "hsl(var(--muted-foreground))" }];

export default function AnalyticsSection() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div className="rounded-xl border bg-background p-3" style={{ height: 260 }}>
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={usersData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="month" tickLine={false} axisLine={false} />
						<YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
						<Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
						<Tooltip />
						<Legend />
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<div className="grid grid-cols-1 gap-6">
				<div className="rounded-xl border bg-background p-3" style={{ height: 220 }}>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={conversionData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
							<CartesianGrid vertical={false} />
							<XAxis dataKey="segment" tickLine={false} axisLine={false} />
							<YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
							<Bar dataKey="conversion" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
							<Tooltip />
						</BarChart>
					</ResponsiveContainer>
				</div>

				<div className="rounded-xl border bg-background p-3" style={{ height: 220 }}>
					<ResponsiveContainer width="100%" height="100%">
						<RadialBarChart data={npsData} innerRadius={60} outerRadius={90} startAngle={90} endAngle={-270}>
							<RadialBar minAngle={15} background dataKey="nps" cornerRadius={8} fill="hsl(var(--muted-foreground))" />
							<Legend verticalAlign="top" />
						</RadialBarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}

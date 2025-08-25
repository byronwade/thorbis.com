"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Progress } from "@components/ui/progress";
import { Search, Settings, DollarSign, Clock, Copy, Edit, Archive, MoreVertical, TrendingUp } from "lucide-react";

const categories = ["HVAC", "Plumbing", "Electrical", "Inspection", "Multi-Service"];

const mockServices = [
	{ id: "SV001", name: "HVAC System Inspection", category: "HVAC", basePrice: 150, durationMin: 120, taxRate: 0.0, status: "active", popularity: 82, usage: 341, lastUpdated: "2025-01-28" },
	{ id: "SV002", name: "Filter Replacement", category: "HVAC", basePrice: 45, durationMin: 30, taxRate: 0.0, status: "active", popularity: 74, usage: 512, lastUpdated: "2025-01-30" },
	{ id: "SV003", name: "Drain Cleaning", category: "Plumbing", basePrice: 85, durationMin: 60, taxRate: 0.0, status: "active", popularity: 69, usage: 208, lastUpdated: "2025-01-22" },
	{ id: "SV004", name: "Water Heater Maintenance", category: "Plumbing", basePrice: 95, durationMin: 60, taxRate: 0.0, status: "active", popularity: 63, usage: 131, lastUpdated: "2025-01-27" },
	{ id: "SV005", name: "Electrical Safety Inspection", category: "Electrical", basePrice: 125, durationMin: 90, taxRate: 0.0, status: "active", popularity: 57, usage: 94, lastUpdated: "2025-01-25" },
	{ id: "SV006", name: "Panel Maintenance", category: "Electrical", basePrice: 80, durationMin: 45, taxRate: 0.0, status: "draft", popularity: 41, usage: 18, lastUpdated: "2025-01-15" },
];

const statusColors = {
	active: "bg-success/10 text-success",
	draft: "bg-muted text-muted-foreground",
	archived: "bg-destructive/10 text-destructive",
};

// metadata removed (client component)

export default function PricebookServicesPage() {
	const router = useRouter();
	const [services, setServices] = useState(mockServices);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("all");
	const [status, setStatus] = useState("all");
	const [sortBy, setSortBy] = useState("popularity");
	const [sortOrder, setSortOrder] = useState("desc");

	const filtered = useMemo(() => {
		return services
			.filter((s) => (category === "all" ? true : s.category === category))
			.filter((s) => (status === "all" ? true : s.status === status))
			.filter((s) => (search ? `${s.name} ${s.category}`.toLowerCase().includes(search.toLowerCase()) : true))
			.sort((a, b) => {
				const dir = sortOrder === "asc" ? 1 : -1;
				switch (sortBy) {
					case "name":
						return dir * a.name.localeCompare(b.name);
					case "price":
						return dir * (a.basePrice - b.basePrice);
					case "duration":
						return dir * (a.durationMin - b.durationMin);
					case "popularity":
						return dir * (a.popularity - b.popularity);
					case "usage":
						return dir * (a.usage - b.usage);
					default:
						return 0;
				}
			});
	}, [services, search, category, status, sortBy, sortOrder]);

	const duplicate = (service) => {
		const copy = { ...service, id: `SV${String(services.length + 1).padStart(3, "0")}`, name: `${service.name} (Copy)`, status: "draft", popularity: 0, usage: 0, lastUpdated: new Date().toISOString().split("T")[0] };
		setServices([copy, ...services]);
	};

	const archive = (id) => setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: "archived" } : s)));

	const totals = useMemo(() => {
		const count = filtered.length;
		const avgPrice = count ? filtered.reduce((sum, s) => sum + s.basePrice, 0) / count : 0;
		const avgDuration = count ? filtered.reduce((sum, s) => sum + s.durationMin, 0) / count : 0;
		const avgPopularity = count ? filtered.reduce((sum, s) => sum + s.popularity, 0) / count : 0;
		return { count, avgPrice, avgDuration, avgPopularity };
	}, [filtered]);

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Pricebook – Services</h1>
					<p className="text-muted-foreground">Manage your service catalog pricing and durations</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => router.push("/dashboard/business/pricebook/products")}>
						Products
					</Button>
					<Button variant="outline" onClick={() => router.push("/dashboard/business/pricebook/categories")}>
						Categories
					</Button>
					<Button onClick={() => router.push("/dashboard/business/pricebook/services/create")}>New Service</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Services</p>
								<p className="text-2xl font-bold">{totals.count}</p>
							</div>
							<Settings className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Avg Price</p>
								<p className="text-2xl font-bold">${totals.avgPrice.toFixed(0)}</p>
							</div>
							<DollarSign className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Avg Duration</p>
								<p className="text-2xl font-bold">{totals.avgDuration.toFixed(0)}m</p>
							</div>
							<Clock className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<p className="text-sm text-muted-foreground">Avg Popularity</p>
								<p className="text-2xl font-bold">{totals.avgPopularity.toFixed(0)}%</p>
							</div>
							<TrendingUp className="w-8 h-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="p-4">
					<div className="flex flex-wrap gap-3 items-center">
						<div className="relative flex-1 min-w-[220px]">
							<Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
							<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="pl-9" />
						</div>

						<Select value={category} onValueChange={setCategory}>
							<SelectTrigger className="w-[160px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories.map((c) => (
									<SelectItem key={c} value={c}>
										{c}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="w-[160px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="archived">Archived</SelectItem>
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-[160px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="popularity">Popularity</SelectItem>
								<SelectItem value="name">Name</SelectItem>
								<SelectItem value="price">Price</SelectItem>
								<SelectItem value="duration">Duration</SelectItem>
								<SelectItem value="usage">Usage</SelectItem>
							</SelectContent>
						</Select>

						<Select value={sortOrder} onValueChange={setSortOrder}>
							<SelectTrigger className="w-[140px]">
								<SelectValue placeholder="Order" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="asc">Ascending</SelectItem>
								<SelectItem value="desc">Descending</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-3">
				{filtered.map((s) => (
					<Card key={s.id} className="transition-shadow hover:shadow-sm">
						<CardContent className="p-4">
							<div className="flex gap-4 justify-between items-start">
								<div className="min-w-0">
									<div className="flex gap-2 items-center">
										<h3 className="font-semibold truncate">{s.name}</h3>
										<Badge variant="outline">{s.category}</Badge>
										<Badge className={statusColors[s.status]}>{s.status}</Badge>
									</div>
									<div className="grid grid-cols-2 gap-4 mt-2 text-sm md:grid-cols-4">
										<div>
											<span className="text-muted-foreground">Price</span>
											<p className="font-medium text-success">${s.basePrice}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Duration</span>
											<p className="font-medium">{s.durationMin} min</p>
										</div>
										<div>
											<span className="text-muted-foreground">Usage</span>
											<p className="font-medium">{s.usage}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Popularity</span>
											<div className="flex gap-2 items-center">
												<Progress value={s.popularity} className="w-20 h-2" />
												<span className="text-sm">{s.popularity}%</span>
											</div>
										</div>
									</div>
									<p className="mt-2 text-xs text-muted-foreground">Last updated {new Date(s.lastUpdated).toLocaleDateString()}</p>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreVertical className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => duplicate(s)}>
											<Copy className="mr-2 w-4 h-4" />
											Duplicate
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => router.push(`/dashboard/business/pricebook/services/${s.id}`)}>
											<Edit className="mr-2 w-4 h-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => archive(s.id)} className="text-destructive">
											<Archive className="mr-2 w-4 h-4" />
											Archive
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardContent>
					</Card>
				))}

				{filtered.length === 0 && (
					<Card>
						<CardContent className="p-8 text-center text-muted-foreground">No services match your filters</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Package, Barcode, TrendingUp, Warehouse, Search, MoreVertical, Edit, Copy, Archive } from "lucide-react";

const categories = ["Filters", "Thermostats", "Fittings", "Wiring", "Misc"];

const mockProducts = [
	{ id: "PRD001", sku: "FLT-20x25", name: "HVAC Filter 20x25", category: "Filters", price: 24.99, cost: 9.5, unit: "ea", stock: 128, reorder: 40, status: "active", lastUpdated: "2025-01-28" },
	{ id: "PRD002", sku: "THERM-SMART", name: "Smart Thermostat", category: "Thermostats", price: 189.0, cost: 122.0, unit: "ea", stock: 36, reorder: 10, status: "active", lastUpdated: "2025-01-30" },
	{ id: "PRD003", sku: "PIPE-FIT-1IN", name: "1in Pipe Fitting", category: "Fittings", price: 7.2, cost: 2.1, unit: "ea", stock: 520, reorder: 100, status: "active", lastUpdated: "2025-01-21" },
	{ id: "PRD004", sku: "WIRE-12GA-50FT", name: "12ga Copper Wire (50ft)", category: "Wiring", price: 45.0, cost: 22.0, unit: "roll", stock: 18, reorder: 8, status: "active", lastUpdated: "2025-01-26" },
	{ id: "PRD005", sku: "MISC-SEALANT", name: "Premium Sealant", category: "Misc", price: 12.5, cost: 4.0, unit: "tube", stock: 0, reorder: 24, status: "draft", lastUpdated: "2025-01-15" },
];

const stockStatus = (p) => (p.stock === 0 ? "out" : p.stock <= p.reorder ? "low" : "ok");
const stockColors = { ok: "bg-success/10 text-success", low: "bg-warning/10 text-warning", out: "bg-destructive/10 text-destructive" };
const statusColors = { active: "bg-success/10 text-success", draft: "bg-muted text-muted-foreground", archived: "bg-destructive/10 text-destructive" };

// metadata removed (client component)

export default function PricebookProductsPage() {
	const router = useRouter();
	const [products, setProducts] = useState(mockProducts);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("all");
	const [status, setStatus] = useState("all");
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState("asc");

	const filtered = useMemo(() => {
		return products
			.filter((p) => (category === "all" ? true : p.category === category))
			.filter((p) => (status === "all" ? true : p.status === status))
			.filter((p) => (search ? `${p.sku} ${p.name}`.toLowerCase().includes(search.toLowerCase()) : true))
			.sort((a, b) => {
				const dir = sortOrder === "asc" ? 1 : -1;
				switch (sortBy) {
					case "name":
						return dir * a.name.localeCompare(b.name);
					case "sku":
						return dir * a.sku.localeCompare(b.sku);
					case "price":
						return dir * (a.price - b.price);
					case "margin":
						return dir * ((a.price - a.cost) / Math.max(1, a.cost) - (b.price - b.cost) / Math.max(1, b.cost));
					case "stock":
						return dir * (a.stock - b.stock);
					default:
						return 0;
				}
			});
	}, [products, search, category, status, sortBy, sortOrder]);

	const duplicate = (prod) => {
		const copy = { ...prod, id: `PRD${String(products.length + 1).padStart(3, "0")}`, sku: `${prod.sku}-COPY`, name: `${prod.name} (Copy)`, status: "draft", stock: 0, lastUpdated: new Date().toISOString().split("T")[0] };
		setProducts([copy, ...products]);
	};
	const archive = (id) => setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "archived" } : p)));

	const totals = useMemo(() => {
		const count = filtered.length;
		const inventory = filtered.reduce((sum, p) => sum + p.stock, 0);
		const avgMargin = count ? filtered.reduce((sum, p) => sum + (p.price - p.cost) / Math.max(1, p.cost), 0) / count : 0;
		return { count, inventory, avgMargin };
	}, [filtered]);

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Pricebook – Products</h1>
					<p className="text-muted-foreground">Manage parts catalog, pricing, and stock</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => router.push("/dashboard/business/pricebook/services")}>
						Services
					</Button>
					<Button variant="outline" onClick={() => router.push("/dashboard/business/pricebook/categories")}>
						Categories
					</Button>
					<Button onClick={() => router.push("/dashboard/business/pricebook/products/create")}>New Product</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Products</p>
								<p className="text-2xl font-bold">{totals.count}</p>
							</div>
							<Package className="w-8 h-8 text-primary" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Stock</p>
								<p className="text-2xl font-bold">{totals.inventory}</p>
							</div>
							<Warehouse className="w-8 h-8 text-warning" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Avg Margin</p>
								<p className="text-2xl font-bold">{(totals.avgMargin * 100).toFixed(0)}%</p>
							</div>
							<TrendingUp className="w-8 h-8 text-success" />
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="p-4">
					<div className="flex flex-wrap gap-3 items-center">
						<div className="relative flex-1 min-w-[220px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
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
								<SelectItem value="name">Name</SelectItem>
								<SelectItem value="sku">SKU</SelectItem>
								<SelectItem value="price">Price</SelectItem>
								<SelectItem value="margin">Margin</SelectItem>
								<SelectItem value="stock">Stock</SelectItem>
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
				{filtered.map((p) => {
					const marginPct = ((p.price - p.cost) / Math.max(1, p.cost)) * 100;
					const s = stockStatus(p);
					return (
						<Card key={p.id} className="hover:shadow-sm transition-shadow">
							<CardContent className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
									<div className="md:col-span-2 min-w-0">
										<div className="flex items-center gap-2">
											<h3 className="font-semibold truncate">{p.name}</h3>
											<Badge variant="outline">{p.category}</Badge>
											<Badge className={statusColors[p.status]}>{p.status}</Badge>
										</div>
										<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
											<Barcode className="w-4 h-4" />
											{p.sku}
										</div>
										<p className="text-xs text-muted-foreground mt-2">Last updated {new Date(p.lastUpdated).toLocaleDateString()}</p>
									</div>

									<div>
										<span className="text-muted-foreground text-sm">Price</span>
										<p className="font-semibold text-success">${p.price.toFixed(2)}</p>
										<p className="text-xs text-muted-foreground">Cost ${p.cost.toFixed(2)}</p>
									</div>

									<div>
										<span className="text-muted-foreground text-sm">Margin</span>
										<p className="font-semibold">{marginPct.toFixed(0)}%</p>
									</div>

									<div>
										<span className="text-muted-foreground text-sm">Stock</span>
										<div className="flex items-center gap-2">
											<Badge className={stockColors[s]}>{s === "ok" ? "OK" : s === "low" ? "LOW" : "OUT"}</Badge>
											<span className="font-medium">{p.stock}</span>
										</div>
										<p className="text-xs text-muted-foreground">Reorder @ {p.reorder}</p>
									</div>

									<div className="justify-self-end">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreVertical className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => duplicate(p)}>
													<Copy className="w-4 h-4 mr-2" />
													Duplicate
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => router.push(`/dashboard/business/pricebook/products/${p.id}`)}>
													<Edit className="w-4 h-4 mr-2" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => archive(p.id)} className="text-destructive">
													<Archive className="w-4 h-4 mr-2" />
													Archive
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}

				{filtered.length === 0 && (
					<Card>
						<CardContent className="p-8 text-center text-muted-foreground">No products match your filters</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

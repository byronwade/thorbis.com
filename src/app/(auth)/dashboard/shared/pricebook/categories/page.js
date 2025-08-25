"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Plus, FolderTree, Search, Edit, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";

const mockCategories = [
	{ id: "CAT001", name: "HVAC", type: "service", items: 6, description: "Heating & Cooling Services" },
	{ id: "CAT002", name: "Plumbing", type: "service", items: 4, description: "Plumbing Services" },
	{ id: "CAT003", name: "Electrical", type: "service", items: 3, description: "Electrical Services" },
	{ id: "CAT004", name: "Filters", type: "product", items: 12, description: "Filters & Consumables" },
	{ id: "CAT005", name: "Thermostats", type: "product", items: 5, description: "Smart & Standard" },
];

const typeColors = { service: "bg-primary/10 text-primary", product: "bg-purple-100 text-purple-800" };

// metadata removed (client component)

export default function PricebookCategoriesPage() {
	const router = useRouter();
	const [categories, setCategories] = useState(mockCategories);
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		return categories.filter((c) => (search ? `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase()) : true)).sort((a, b) => a.name.localeCompare(b.name));
	}, [categories, search]);

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Pricebook – Categories</h1>
					<p className="text-muted-foreground">Organize and discover services and products</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => router.push("/dashboard/business/pricebook/services")}>
						Services
					</Button>
					<Button variant="outline" onClick={() => router.push("/dashboard/business/pricebook/products")}>
						Products
					</Button>
					<Button onClick={() => router.push("/dashboard/business/pricebook/categories/create")}>
						<Plus className="w-4 h-4 mr-2" />
						New Category
					</Button>
				</div>
			</div>

			<Card>
				<CardContent className="p-4">
					<div className="relative max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="pl-9" />
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filtered.map((c) => (
					<Card key={c.id} className="hover:shadow-sm transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between gap-3">
								<div>
									<CardTitle className="text-lg flex items-center gap-2">
										<FolderTree className="w-5 h-5" /> {c.name}
									</CardTitle>
									<div className="mt-2 flex items-center gap-2">
										<Badge className={typeColors[c.type]}>{c.type}</Badge>
										<Badge variant="outline">{c.items} items</Badge>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreVertical className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => router.push(`/dashboard/business/pricebook/categories/${c.id}`)}>
											<Edit className="w-4 h-4 mr-2" />
											Edit
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground min-h-[40px]">{c.description}</p>
						</CardContent>
					</Card>
				))}

				{filtered.length === 0 && (
					<Card>
						<CardContent className="p-8 text-center text-muted-foreground">No categories found</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

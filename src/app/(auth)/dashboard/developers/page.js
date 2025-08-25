"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Copy, KeyRound, RefreshCw, Download, TrendingUp, DollarSign, AlertCircle } from "lucide-react";

export default function DevelopersDashboard() {
	const [keys, setKeys] = useState([]);
	const [loading, setLoading] = useState(false);
	const [creating, setCreating] = useState(false);
	const primaryKey = useMemo(() => keys.find((k) => k.isPrimary) || keys[0], [keys]);

	useEffect(() => {
		const init = async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/developers/keys", { cache: "no-store" });
				const data = await res.json();
				setKeys(data.keys || []);
			} finally {
				setLoading(false);
			}
		};
		init();
	}, []);

	const createKey = async () => {
		setCreating(true);
		try {
			const res = await fetch("/api/developers/keys", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ label: "Primary Key" }),
			});
			const data = await res.json();
			setKeys((prev) => [data.key, ...prev]);
		} finally {
			setCreating(false);
		}
	};

	const revokeKey = async (id) => {
		await fetch(`/api/developers/keys/${id}`, { method: "DELETE" });
		setKeys((prev) => prev.filter((k) => k.id !== id));
	};

	const copyToClipboard = async (value) => {
		try {
			await navigator.clipboard.writeText(value);
		} catch {}
	};

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Developers Dashboard",
		description: "API key management, usage monitoring, and billing.",
	};

	return (
		<div className="w-full space-y-6">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Developers</h1>
					<p className="text-muted-foreground">Manage API keys, usage, and billing</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Download className="mr-2 w-4 h-4" /> Docs
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader className="flex flex-row justify-between items-center space-y-0">
							<div>
								<CardTitle>Primary API Key</CardTitle>
								<CardDescription>Use this key in your server-side requests</CardDescription>
							</div>
							<Badge variant="secondary">Production</Badge>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2 items-center">
								<KeyRound className="w-4 h-4" />
								<Input readOnly value={primaryKey ? primaryKey.masked : ""} placeholder={loading ? "Loading..." : "Click Generate to create a key"} />
								<Button variant="outline" size="sm" onClick={() => primaryKey && copyToClipboard(primaryKey.value || "")}>
									Copy
								</Button>
								<Button variant="outline" size="sm" onClick={createKey} disabled={creating}>
									<RefreshCw className="mr-2 w-4 h-4" /> {creating ? "Generating..." : primaryKey ? "Rotate" : "Generate"}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">Rotate keys regularly. Use separate keys per environment.</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Your API Keys</CardTitle>
							<CardDescription>Manage multiple keys for different projects</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{(keys || []).map((k) => (
								<div key={k.id} className="flex justify-between items-center p-3 rounded-lg border">
									<div className="space-y-1">
										<div className="flex gap-2 items-center">
											<span className="font-medium">{k.label || "API Key"}</span>
											{k.isPrimary && <Badge variant="secondary">Primary</Badge>}
										</div>
										<p className="text-xs text-muted-foreground">{k.masked}</p>
									</div>
									<div className="flex gap-2 items-center">
										<Button variant="outline" size="sm" onClick={() => copyToClipboard(k.value || "")}>
											<Copy className="mr-2 w-4 h-4" /> Copy
										</Button>
										<Button variant="outline" size="sm" onClick={() => revokeKey(k.id)}>
											Revoke
										</Button>
									</div>
								</div>
							))}
							{(keys || []).length === 0 && (
								<div className="p-6 text-center rounded-lg border">
									<p className="text-sm text-muted-foreground">No keys yet. Generate your first API key to get started.</p>
									<div className="mt-3">
										<Button onClick={createKey} disabled={creating}>
											{creating ? "Generating..." : "Generate API Key"}
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Usage Overview</CardTitle>
							<CardDescription>Requests and error rates (last 24h)</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">Requests</span>
								<span className="font-medium">12,480</span>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">Errors</span>
								<span className="font-medium">0.42%</span>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">P95 Latency</span>
								<span className="font-medium">312 ms</span>
							</div>
							<div className="flex gap-2 items-center text-xs text-muted-foreground">
								<AlertCircle className="w-3 h-3" /> Real charts coming soon
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Billing</CardTitle>
							<CardDescription>Current month estimate</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between items-center">
								<div className="flex gap-2 items-center text-sm text-muted-foreground">
									<DollarSign className="w-4 h-4" /> Estimated bill
								</div>
								<div className="text-lg font-semibold">$42.60</div>
							</div>
							<div className="flex justify-between items-center">
								<div className="flex gap-2 items-center text-sm text-muted-foreground">
									<TrendingUp className="w-4 h-4" /> Requests used
								</div>
								<div className="text-sm">12,480 / 100,000</div>
							</div>
							<Button variant="outline" className="mt-2 w-full">
								View Billing
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Developer Tools</CardTitle>
					<CardDescription>Keys, usage analytics, and webhooks</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="keys" className="space-y-4">
						<TabsList>
							<TabsTrigger value="keys">API Keys</TabsTrigger>
							<TabsTrigger value="usage">Usage</TabsTrigger>
							<TabsTrigger value="billing">Billing</TabsTrigger>
						</TabsList>
						<TabsContent value="keys">
							<p className="text-sm text-muted-foreground">Create and manage keys on the Keys page. Rotation recommended every 60–90 days.</p>
						</TabsContent>
						<TabsContent value="usage">
							<p className="text-sm text-muted-foreground">Real-time usage metrics by key will appear here.</p>
						</TabsContent>
						<TabsContent value="billing">
							<p className="text-sm text-muted-foreground">Transparent usage-based billing with downloadable invoices.</p>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}

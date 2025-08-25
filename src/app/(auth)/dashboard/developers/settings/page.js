"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";

export default function DeveloperSettings() {
	const [webhooks, setWebhooks] = useState({ enabled: false, url: "" });
	const [ipAllowlist, setIpAllowlist] = useState("");

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/developers/settings", { cache: "no-store" });
				const data = await res.json();
				setWebhooks(data.webhooks || { enabled: false, url: "" });
				setIpAllowlist((data.ipAllowlist || []).join(", "));
			} catch {}
		})();
	}, []);

	const save = async () => {
		await fetch("/api/developers/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ webhooks, ipAllowlist: ipAllowlist.split(",").map((s) => s.trim()).filter(Boolean) }),
		});
	};

	return (
		<div className="w-full space-y-6">
			<div className="grid w-full gap-2">
				<h1 className="text-3xl font-bold tracking-tight">Developer Settings</h1>
				<p className="text-muted-foreground">Security and integration configuration</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Webhooks</CardTitle>
					<CardDescription>Receive event callbacks to your server</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label>Enable Webhooks</Label>
						<Switch checked={webhooks.enabled} onCheckedChange={(v) => setWebhooks((prev) => ({ ...prev, enabled: v }))} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="wh-url">Webhook URL</Label>
						<Input id="wh-url" value={webhooks.url} onChange={(e) => setWebhooks((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://api.yourapp.com/webhooks" />
					</div>
				</CardContent>
				<CardFooter>
					<Button onClick={save}>Save</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>IP Allowlist</CardTitle>
					<CardDescription>Comma-separated list of allowed IPs or CIDRs</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<Input value={ipAllowlist} onChange={(e) => setIpAllowlist(e.target.value)} placeholder="203.0.113.5, 198.51.100.0/24" />
				</CardContent>
				<CardFooter>
					<Button variant="outline" onClick={save}>Save</Button>
				</CardFooter>
			</Card>
		</div>
	);
}



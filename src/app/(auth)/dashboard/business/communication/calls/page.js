"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Phone, PhoneCall, PhoneMissed, Search, MoreVertical, Clock, Calendar, PlayCircle, Voicemail, MessageSquare, ChevronRight } from "lucide-react";

const statusColors = {
	answered: "bg-success/10 text-success",
	missed: "bg-destructive/10 text-destructive",
	voicemail: "bg-warning/10 text-warning",
	outgoing: "bg-primary/10 text-primary",
};

const mockCalls = [
	{ id: "CALL001", type: "incoming", status: "answered", customer: "John Smith", number: "(555) 123-4567", durationSec: 420, time: "2025-02-01T10:05:00Z", notes: "Requested estimate follow-up" },
	{ id: "CALL002", type: "incoming", status: "missed", customer: "Sarah Johnson", number: "(555) 987-6543", durationSec: 0, time: "2025-02-01T09:40:00Z", notes: "Missed - left voicemail" },
	{ id: "CALL003", type: "outgoing", status: "voicemail", customer: "TechCorp Inc.", number: "(555) 111-2222", durationSec: 60, time: "2025-02-01T08:55:00Z", notes: "Left voicemail about scheduling" },
	{ id: "CALL004", type: "incoming", status: "answered", customer: "Michael Brown", number: "(555) 222-3333", durationSec: 180, time: "2025-01-31T16:20:00Z", notes: "Service plan billing question" },
	{ id: "CALL005", type: "outgoing", status: "outgoing", customer: "Sarah Miller", number: "(555) 444-5555", durationSec: 240, time: "2025-01-31T14:05:00Z", notes: "Follow-up on drain cleaning" },
];

// metadata removed (client component)

function formatDuration(seconds) {
	if (!seconds) return "0:00";
	const m = Math.floor(seconds / 60).toString();
	const s = String(seconds % 60).padStart(2, "0");
	return `${m}:${s}`;
}

export default function CallsPage() {
	const router = useRouter();
	const [calls, setCalls] = useState(mockCalls);
	const [search, setSearch] = useState("");
	const [type, setType] = useState("all");
	const [status, setStatus] = useState("all");

	const filtered = useMemo(() => {
		return calls
			.filter((c) => (type === "all" ? true : c.type === type))
			.filter((c) => (status === "all" ? true : c.status === status))
			.filter((c) => (search ? `${c.customer} ${c.number} ${c.notes}`.toLowerCase().includes(search.toLowerCase()) : true))
			.sort((a, b) => new Date(b.time) - new Date(a.time));
	}, [calls, type, status, search]);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Calls</h1>
					<p className="text-muted-foreground">VoIP activity, missed calls, voicemails, and callbacks</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => router.push("/dashboard/business/communication/inbox/compose")}>
						New Call
					</Button>
					<Button onClick={() => router.refresh?.()}>Refresh</Button>
				</div>
			</div>

			<Card>
				<CardContent className="p-4">
					<div className="flex flex-wrap gap-3 items-center">
						<div className="relative flex-1 min-w-[220px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search calls..." className="pl-9" />
						</div>

						<Select value={type} onValueChange={setType}>
							<SelectTrigger className="w-[160px]">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="incoming">Incoming</SelectItem>
								<SelectItem value="outgoing">Outgoing</SelectItem>
							</SelectContent>
						</Select>

						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="w-[160px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="answered">Answered</SelectItem>
								<SelectItem value="missed">Missed</SelectItem>
								<SelectItem value="voicemail">Voicemail</SelectItem>
								<SelectItem value="outgoing">Outgoing</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-2">
				{filtered.map((c) => (
					<Card key={c.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/business/communication/calls/${c.id}`)}>
						<CardContent className="p-4">
							<div className="flex items-start gap-4">
								<div className="mt-1">{c.status === "missed" ? <PhoneMissed className="w-5 h-5 text-destructive" /> : c.status === "voicemail" ? <Voicemail className="w-5 h-5 text-warning" /> : c.type === "outgoing" ? <PhoneCall className="w-5 h-5 text-primary" /> : <Phone className="w-5 h-5 text-success" />}</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold truncate">
													{c.customer} <span className="text-muted-foreground font-normal">{c.number}</span>
												</h3>
												<Badge className={statusColors[c.status]}>{c.status}</Badge>
											</div>
											<div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Calendar className="w-3 h-3" />
													{new Date(c.time).toLocaleString()}
												</span>
												<span className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{formatDuration(c.durationSec)}
												</span>
											</div>
											{c.notes && <p className="text-sm text-muted-foreground mt-2 truncate">{c.notes}</p>}
										</div>
										<div className="shrink-0">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreVertical className="w-4 h-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															router.push(`/dashboard/business/communication/calls/${c.id}`);
														}}
													>
														<PlayCircle className="w-4 h-4 mr-2" />
														Open Call
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															router.push(`/dashboard/business/communication/inbox/compose`);
														}}
													>
														<MessageSquare className="w-4 h-4 mr-2" />
														Send Message
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								</div>
								<ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
							</div>
						</CardContent>
					</Card>
				))}

				{filtered.length === 0 && (
					<Card>
						<CardContent className="p-8 text-center text-muted-foreground">No calls match your filters</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

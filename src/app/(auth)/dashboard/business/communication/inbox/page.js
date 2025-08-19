"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Separator } from "@components/ui/separator";
import { Mail, MessageSquare, Phone, Search, MoreVertical, Star, Flag, Reply, Archive, Send, User, Clock, Tag, ChevronRight } from "lucide-react";

// Basic JSON-LD for a generic mailbox listing
const jsonLd = {
	"@context": "https://schema.org",
	"@type": "ItemList",
	itemListElement: [],
};

const channelIcon = {
	email: Mail,
	sms: MessageSquare,
	call: Phone,
	chat: MessageSquare,
};

const statusColors = {
	unread: "bg-primary/10 text-primary",
	read: "bg-muted text-foreground",
	flagged: "bg-destructive/10 text-destructive",
	archived: "bg-success/10 text-success",
};

const mockThreads = [
	{
		id: "THR001",
		channel: "email",
		subject: "Estimate request for HVAC maintenance",
		preview: "Hi there, I'm interested in an estimate for spring HVAC tune-up...",
		customer: { name: "Sarah Johnson", type: "residential" },
		tags: ["estimate", "hvac"],
		status: "unread",
		lastActivity: "2025-02-01T09:35:00Z",
		messages: 3,
	},
	{
		id: "THR002",
		channel: "sms",
		subject: "Technician arrival window",
		preview: "This is Mike. I’m 15 minutes away from your address...",
		customer: { name: "TechCorp Inc.", type: "commercial" },
		tags: ["technician", "arrival"],
		status: "read",
		lastActivity: "2025-02-01T08:10:00Z",
		messages: 5,
	},
	{
		id: "THR003",
		channel: "chat",
		subject: "Service plan billing question",
		preview: "Can I switch from annual to monthly billing mid-cycle?",
		customer: { name: "Michael Brown", type: "residential" },
		tags: ["billing", "service-plan"],
		status: "flagged",
		lastActivity: "2025-01-31T17:45:00Z",
		messages: 2,
	},
	{
		id: "THR004",
		channel: "email",
		subject: "Drain cleaning follow-up",
		preview: "Thanks for the quick fix yesterday — one question about...",
		customer: { name: "Sarah Miller", type: "residential" },
		tags: ["follow-up", "plumbing"],
		status: "read",
		lastActivity: "2025-01-31T14:20:00Z",
		messages: 4,
	},
];

// metadata removed (client component)

export default function CommunicationInboxPage() {
	const router = useRouter();
	const [threads, setThreads] = useState(mockThreads);
	const [search, setSearch] = useState("");
	const [channel, setChannel] = useState("all");
	const [status, setStatus] = useState("all");

	const filtered = useMemo(() => {
		return threads
			.filter((t) => (channel === "all" ? true : t.channel === channel))
			.filter((t) => (status === "all" ? true : t.status === status))
			.filter((t) => (search ? [t.subject, t.preview, t.customer.name, ...(t.tags || [])].join(" ").toLowerCase().includes(search.toLowerCase()) : true))
			.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
	}, [threads, search, channel, status]);

	const onOpenThread = (id) => {
		router.push(`/dashboard/business/communication/inbox/${id}`);
	};

	const markAs = (id, newStatus) => {
		setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
	};

	return (
		<div className="p-6 space-y-6">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Inbox</h1>
					<p className="text-muted-foreground">Email, SMS, and chat in one place</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => router.push("/dashboard/business/communication/inbox/compose")}>
						Compose
					</Button>
					<Button onClick={() => router.refresh?.()}>Refresh</Button>
				</div>
			</div>

			<Card>
				<CardContent className="p-4">
					<div className="flex flex-wrap gap-3 items-center">
						<div className="relative flex-1 min-w-[220px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inbox..." className="pl-9" />
						</div>

						<Select value={channel} onValueChange={setChannel}>
							<SelectTrigger className="w-[160px]">
								<SelectValue placeholder="Channel" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Channels</SelectItem>
								<SelectItem value="email">Email</SelectItem>
								<SelectItem value="sms">SMS</SelectItem>
								<SelectItem value="chat">Chat</SelectItem>
								<SelectItem value="call">Call</SelectItem>
							</SelectContent>
						</Select>

						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="w-[160px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="unread">Unread</SelectItem>
								<SelectItem value="read">Read</SelectItem>
								<SelectItem value="flagged">Flagged</SelectItem>
								<SelectItem value="archived">Archived</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-2">
				{filtered.map((t) => {
					const Icon = channelIcon[t.channel] || MessageSquare;
					return (
						<Card key={t.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => onOpenThread(t.id)}>
							<CardContent className="p-4">
								<div className="flex items-start gap-4">
									<div className="mt-1">
										<Icon className="w-5 h-5 text-muted-foreground" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<h3 className="font-semibold truncate">{t.subject}</h3>
													<Badge className={statusColors[t.status]}>{t.status}</Badge>
												</div>
												<p className="text-sm text-muted-foreground truncate mt-0.5">{t.preview}</p>
												<div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
													<span className="flex items-center gap-1">
														<User className="w-3 h-3" />
														{t.customer.name}
													</span>
													<span className="flex items-center gap-1">
														<Clock className="w-3 h-3" />
														{new Date(t.lastActivity).toLocaleString()}
													</span>
													{t.tags?.map((tag) => (
														<span key={tag} className="inline-flex items-center gap-1">
															<Tag className="w-3 h-3" />
															{tag}
														</span>
													))}
												</div>
											</div>
											<div className="shrink-0">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreVertical className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														{t.status !== "unread" && (
															<DropdownMenuItem
																onClick={(e) => {
																	e.stopPropagation();
																	markAs(t.id, "unread");
																}}
															>
																<Star className="w-4 h-4 mr-2" />
																Mark Unread
															</DropdownMenuItem>
														)}
														{t.status !== "read" && (
															<DropdownMenuItem
																onClick={(e) => {
																	e.stopPropagation();
																	markAs(t.id, "read");
																}}
															>
																<Send className="w-4 h-4 mr-2" />
																Mark Read
															</DropdownMenuItem>
														)}
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																markAs(t.id, "flagged");
															}}
														>
															<Flag className="w-4 h-4 mr-2" />
															Flag
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																markAs(t.id, "archived");
															}}
														>
															<Archive className="w-4 h-4 mr-2" />
															Archive
														</DropdownMenuItem>
														<Separator />
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																router.push(`/dashboard/business/communication/inbox/${t.id}`);
															}}
														>
															<Reply className="w-4 h-4 mr-2" />
															Open
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
					);
				})}
				{filtered.length === 0 && (
					<Card>
						<CardContent className="p-8 text-center text-muted-foreground">No conversations match your filters</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

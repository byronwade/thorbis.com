"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup } from "@components/ui/dropdown-menu";
import EnhancedMobileMenu from "../shared/enhanced-mobile-menu";
import { Users, Bell, Menu, Settings } from "lucide-react";
import { Badge } from "@components/ui/badge";

// Mock data for current user
const currentUser = {
	id: "byron-wade",
	name: "Byron Wade",
	email: "byron@thorbis.com",
	avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&face",
};

const navItems = [
	{ href: "/network", text: "Home" },
	{ href: "/network/manage", text: "My Network" },
	{ href: "/network/messages", text: "Messaging" },
];

export function AppHeader() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	return (
		<div className="sticky top-0 z-[60] bg-card/95 backdrop-blur-md border-b border-border/50">
			<div className="flex items-center justify-between w-full gap-6 py-3 mx-auto px-4 lg:px-24">
				{/* Left Section - Logo and Business Info */}
				<div className="flex flex-row items-center w-full space-x-6">
					<Link href="/network" className="flex items-center space-x-3 text-xl font-bold group">
						<div className="relative">
							<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Network" width={50} height={50} className="w-12 h-12 transition-transform duration-200 group-hover:scale-105" />
							<div className="absolute inset-0 transition-opacity duration-200 rounded-full opacity-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:opacity-100" />
						</div>
						<div className="hidden sm:block">
							<h1 className="text-lg font-bold leading-none text-foreground">Network</h1>
							<p className="text-xs text-muted-foreground">Powered by Thorbis</p>
						</div>
					</Link>
				</div>

				{/* Right Section - Navigation */}
				<nav className="hidden space-x-1 lg:flex xl:space-x-2">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link key={item.text} href={item.href} passHref>
								<Button variant={isActive ? "default" : "ghost"} size="sm" className={`text-sm font-medium transition-colors ${isActive ? "bg-primary/5 text-primary border border-primary/20 hover:text-white" : "hover:text-white hover:bg-muted"}`}>
									{item.text}
								</Button>
							</Link>
						);
					})}
				</nav>

				{/* User Controls */}
				<div className="flex items-center space-x-2">
					<NotificationMenu />
					<UserMenu />

					{/* Mobile Menu */}
					<Button 
						variant="outline" 
						size="icon" 
						className="flex lg:hidden"
						onClick={() => setMobileMenuOpen(true)}
					>
						<Menu className="w-4 h-4" />
					</Button>
					
					<EnhancedMobileMenu
						isOpen={mobileMenuOpen}
						onClose={() => setMobileMenuOpen(false)}
						dashboardType="network"
						navigationItems={navItems.map(item => ({
							key: item.text.toLowerCase().replace(/\s+/g, '-'),
							text: item.text,
							href: item.href,
							icon: null
						}))}
						activeNavKey={navItems.find(item => pathname === item.href)?.text.toLowerCase().replace(/\s+/g, '-') || ""}
						config={{ title: "Network Menu" }}
						businessSubNavItems={{}}
					/>
				</div>
			</div>
		</div>
	);
}

const NotificationMenu = () => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="ghost" size="sm" className="relative p-2 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent">
				<Bell className="w-5 h-5" />
				<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive border-2 border-card rounded-full"></span>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" className="w-80 z-[80] bg-card/95 backdrop-blur-md border border-border/50">
			<div className="flex items-center justify-between p-3 border-b border-border/50">
				<h3 className="font-semibold text-foreground">Notifications</h3>
				<Badge variant="destructive" className="text-xs">
					2 new
				</Badge>
			</div>
			<div className="overflow-y-auto max-h-96">
				<DropdownMenuItem className="flex items-start p-4 space-x-3">
					<Avatar className="w-8 h-8 mt-1">
						<AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286de2" />
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="text-sm text-foreground">
							<span className="font-medium">Jessica Miller</span> sent you a connection request.
						</p>
						<p className="text-xs text-muted-foreground">2 minutes ago</p>
					</div>
				</DropdownMenuItem>
				<DropdownMenuItem className="flex items-start p-4 space-x-3">
					<Avatar className="w-8 h-8 mt-1">
						<AvatarImage src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3" />
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="text-sm text-foreground">
							<span className="font-medium">Mike Chen</span> liked your post.
						</p>
						<p className="text-xs text-muted-foreground">15 minutes ago</p>
					</div>
				</DropdownMenuItem>
			</div>
		</DropdownMenuContent>
	</DropdownMenu>
);

const UserMenu = () => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="outline" size="sm" className="p-0 border rounded-full shadow-sm h-9 w-9 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary">
				<Avatar className="w-8 h-8">
					<AvatarImage src={currentUser.avatar} />
					<AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
				</Avatar>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" className="w-56 z-[80] bg-card/95 backdrop-blur-md border border-border/50">
			<div className="flex items-center p-3 space-x-3 border-b border-border/50">
				<Avatar className="w-8 h-8">
					<AvatarImage src={currentUser.avatar} />
					<AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium truncate text-foreground">{currentUser.name}</p>
					<p className="text-xs truncate text-muted-foreground">{currentUser.email}</p>
				</div>
			</div>
			<DropdownMenuGroup>
				<DropdownMenuItem asChild>
					<Link href={`/profile/${currentUser.id}`}>
						<Users className="w-4 h-4 mr-2" />
						<span>Profile</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="#">
						<Settings className="w-4 h-4 mr-2" />
						<span>Settings</span>
					</Link>
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuItem className="text-destructive focus:text-destructive">
				<span>Logout</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

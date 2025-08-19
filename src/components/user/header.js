"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@components/ui/dropdown-menu";
import EnhancedMobileMenu from "../shared/enhanced-mobile-menu";
import { ChevronDown, Menu, Bell, Settings, Briefcase, CreditCard, HelpCircle, Users, Activity, Star } from "react-feather";
import { BarChart3, Building2, Plus } from "lucide-react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { RiComputerFill } from "react-icons/ri";
import { useTheme } from "next-themes";
import { useAuth } from "@context/auth-context";

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();
	const { setTheme, theme, resolvedTheme } = useTheme();
	const { user, userRoles, logout, getDisplayName, getAvatarUrl } = useAuth();
	const [primaryColor, setPrimaryColor] = useState("theme-default");

	// Helper function to get avatar with Vercel avatar API fallback (consistent with site header)
	const getAvatarWithFallback = () => {
		const avatarUrl = getAvatarUrl();
		if (avatarUrl) {
			return avatarUrl;
		}

		// Fallback to Vercel avatar API if no avatar is set (consistent with other components)
		if (user?.email) {
			const username = user.email.split("@")[0] || "user";
			return `https://vercel.com/api/www/avatar?u=${username}&s=64`;
		}

		return "/placeholder-avatar.svg";
	};

	const handleLogout = async () => {
		try {
			await logout();
			console.log("Logout successful");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handlePrimaryColorChange = (color) => {
		setPrimaryColor(color);
		document.documentElement.className = `${resolvedTheme} ${color}`;
	};

	const userNavItems = [
		{ href: "/dashboard/user", text: "Overview", icon: BarChart3 },
		{ href: "/dashboard/user/jobs", text: "Jobs", icon: Briefcase },
		{ href: "/dashboard/user/activity", text: "Activity", icon: Activity },
		{ href: "/dashboard/user/reviews", text: "Reviews", icon: Star },
		{ href: "/dashboard/user/referral", text: "Referral", icon: Users },
		{ href: "/dashboard/user/settings", text: "Settings", icon: Settings },
	];

	return (
		<div className="sticky top-0 z-[60] bg-neutral-950/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-900 dark:border-neutral-900">
			<div className="flex gap-6 justify-between items-center px-4 py-3 mx-auto w-full lg:px-24">
				{/* Left Section - Logo and User Info */}
				<div className="flex flex-row items-center space-x-6 w-full">
					<Link href="/" className="flex items-center space-x-3 text-xl font-bold group">
						<div className="relative">
							<Image src="/logos/ThorbisLogo.webp" alt="Thorbis User" width={50} height={50} className="w-12 h-12 transition-transform duration-200 group-hover:scale-105" />
							<div className="absolute inset-0 bg-gradient-to-r rounded-full opacity-0 transition-opacity duration-200 from-blue-500/20 to-purple-500/20 group-hover:opacity-100" />
						</div>
						<div className="hidden sm:block">
							<h1 className="text-lg font-bold leading-none text-foreground">Thorbis</h1>
							<p className="text-xs text-muted-foreground">User Dashboard</p>
						</div>
					</Link>

					{/* Add Business Dropdown */}
					<div className="hidden flex-row space-x-3 lg:flex">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="flex items-center space-x-2">
									<Plus className="w-4 h-4" />
									<span>Add New</span>
									<ChevronDown className="w-4 h-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56 z-[90] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
								<DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/claim-a-business">
										<Building2 className="mr-2 w-4 h-4" />
										<span>Claim a Business</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/add-a-business">
										<Plus className="mr-2 w-4 h-4" />
										<span>Add New Business</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/user/jobs/create">
										<Briefcase className="mr-2 w-4 h-4" />
										<span>Post a Job</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/user/reviews/create">
										<Star className="mr-2 w-4 h-4" />
										<span>Write a Review</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/dashboard/user/referral">
										<Users className="mr-2 w-4 h-4" />
										<span>Invite Friends</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Right Section - Navigation and User Menu */}
				<div className="hidden space-x-1 lg:flex xl:space-x-2">
					{userNavItems.map((item) => {
						const isActive = pathname === item.href || (item.href !== "/dashboard/user" && pathname.startsWith(item.href));
						return (
							<Link key={item.href} href={item.href} passHref>
								<Button variant={isActive ? "default" : "ghost"} size="sm" className={`text-sm font-medium transition-colors ${isActive ? "bg-primary/5 text-primary border border-primary/20 hover:text-white" : "hover:text-white hover:bg-muted"}`}>
									{item.text}
								</Button>
							</Link>
						);
					})}
				</div>

				{/* User Controls */}
				<div className="flex items-center space-x-2">
					{/* Notifications */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="relative p-2 w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-accent">
								<Bell className="w-5 h-5" />
								<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-border"></span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-80 z-[80] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
							<div className="flex justify-between items-center p-3 border-b border-border/50">
								<h3 className="font-semibold text-foreground">Notifications</h3>
								<Badge variant="secondary" className="text-xs">
									4 new
								</Badge>
							</div>
							<div className="overflow-y-auto max-h-96">
								<DropdownMenuItem className="flex items-start p-4 space-x-3">
									<div className="flex-shrink-0 mt-2 w-2 h-2 bg-primary rounded-full"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">New application received</p>
										<p className="mt-1 text-xs text-muted-foreground">John D. applied for your web design request</p>
										<p className="text-xs text-muted-foreground">10 minutes ago</p>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem className="flex items-start p-4 space-x-3">
									<div className="flex-shrink-0 mt-2 w-2 h-2 bg-success rounded-full"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">Job completed</p>
										<p className="mt-1 text-xs text-muted-foreground">Your plumbing repair has been completed</p>
										<p className="text-xs text-muted-foreground">2 hours ago</p>
									</div>
								</DropdownMenuItem>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* User Avatar Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="p-0 w-9 h-9 rounded-full border shadow-sm border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary">
								<Avatar className="w-8 h-8">
									<AvatarImage src={getAvatarWithFallback()} />
									<AvatarFallback>{getDisplayName()?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56 z-[80] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
							<div className="flex items-center p-3 space-x-3 border-b border-border/50">
								<Avatar className="w-8 h-8">
									<AvatarImage src={getAvatarWithFallback()} />
									<AvatarFallback>{getDisplayName()?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate text-foreground">{getDisplayName()}</p>
									<p className="text-xs truncate text-muted-foreground">{user?.email}</p>
								</div>
							</div>
							<DropdownMenuGroup>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/user/settings">
										<Settings className="mr-2 w-4 h-4" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/user/billing">
										<CreditCard className="mr-2 w-4 h-4" />
										<span>Billing</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/support">
										<HelpCircle className="mr-2 w-4 h-4" />
										<span>Support</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuLabel>Theme</DropdownMenuLabel>
								<DropdownMenuItem onClick={() => setTheme("light")}>
									<SunIcon className="mr-2 w-4 h-4 text-warning" />
									Light
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")}>
									<MoonIcon className="mr-2 w-4 h-4 text-primary" />
									Dark
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("system")}>
									<RiComputerFill className="mr-2 w-4 h-4 text-slate-500" />
									System
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
								<DropdownMenuRadioGroup value={primaryColor} onValueChange={handlePrimaryColorChange}>
									<DropdownMenuRadioItem value="theme-default">Default</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="theme-blue">Blue</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="theme-green">Green</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="theme-purple">Purple</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/">
									<span>Back to Main Site</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
								<span>Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

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
						dashboardType="user"
						navigationItems={userNavItems.map(item => ({
							key: item.text.toLowerCase().replace(/\s+/g, '-'),
							text: item.text,
							href: item.href,
							icon: item.icon
						}))}
						activeNavKey={userNavItems.find(item => pathname === item.href || (item.href !== "/dashboard/user" && pathname.startsWith(item.href)))?.text.toLowerCase().replace(/\s+/g, '-') || ""}
						config={{ title: "User Menu" }}
						businessSubNavItems={{}}
					/>
				</div>
			</div>
		</div>
	);
}


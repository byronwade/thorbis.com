"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@components/ui/sheet";
import { Bell, ChevronDown, Settings, Building2, Menu, CreditCard, HelpCircle, MapPin, Plus } from "lucide-react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { RiComputerFill } from "react-icons/ri";
import { useTheme } from "next-themes";
import { useAuthStore } from "@store/auth";

const navigation = [
	{ name: "Hub Dashboard", href: "/dashboard/localhub" },
	{ name: "Directory Businesses", href: "/dashboard/localhub/businesses" },
	{ name: "Community Analytics", href: "/dashboard/localhub/analytics" },
	{ name: "Hub Customization", href: "/dashboard/localhub/customization" },
	{ name: "Platform Settings", href: "/dashboard/localhub/settings" },
];

// Mock data for LocalHub directories
const mockDirectories = [
	{
		id: "1",
		name: "Raleigh LocalHub",
		location: "Raleigh, NC",
		status: "active",
		businessCount: 127,
		monthlyRevenue: 1872,
		totalRevenue: 2340,
		domain: "raleigh.localhub.com",
	},
	{
		id: "2",
		name: "Durham LocalHub",
		location: "Durham, NC",
		status: "active",
		businessCount: 89,
		monthlyRevenue: 1245,
		totalRevenue: 1556,
		domain: "durham.localhub.com",
	},
	{
		id: "3",
		name: "Charlotte LocalHub",
		location: "Charlotte, NC",
		status: "active",
		businessCount: 203,
		monthlyRevenue: 2890,
		totalRevenue: 3612,
		domain: "charlotte.localhub.com",
	},
];

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentDirectoryId, setCurrentDirectoryId] = useState("1"); // Default to first directory
	const pathname = usePathname();
	const { user, signOut } = useAuthStore();
	const { setTheme } = useTheme();
	const [primaryColor, setPrimaryColor] = useState("theme-default");

	const currentDirectory = mockDirectories.find((directory) => directory.id === currentDirectoryId) || mockDirectories[0];

	const handleLogout = async () => {
		try {
			await signOut();
			console.log("Logout successful");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handlePrimaryColorChange = (color) => {
		setPrimaryColor(color);
		document.documentElement.className = color;
	};

	return (
		<div className="sticky top-0 z-[60] bg-neutral-950/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-900 dark:border-neutral-900">
			<div className="flex gap-6 justify-between items-center px-4 py-3 mx-auto w-full lg:px-24">
				{/* Left Section - Logo and LocalHub Info */}
				<div className="flex flex-row items-center space-x-6 w-full">
					<Link href="/" className="flex items-center space-x-3 text-xl font-bold group">
						<div className="relative">
							<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Business Directory" width={50} height={50} className="w-12 h-12 transition-transform duration-200 group-hover:scale-105" />
							<div className="absolute inset-0 transition-opacity duration-200 rounded-full opacity-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 group-hover:opacity-100" />
						</div>
						<div className="hidden sm:block">
							<h1 className="text-lg font-bold leading-none text-foreground">Thorbis LocalHub</h1>
							<p className="text-xs text-muted-foreground">Community Directory Platform</p>
						</div>
					</Link>

					{/* Current Directory Dropdown */}
					<div className="hidden flex-row space-x-3 lg:flex">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<div className="flex items-center p-2 px-3 space-x-2 rounded-lg border backdrop-blur-sm transition-colors cursor-pointer bg-card/80 border-border/50 hover:bg-accent/50">
									<MapPin className="w-4 h-4 text-muted-foreground" />
									<div className="text-xs max-w-[200px]">
										<div className="font-medium truncate text-foreground">{currentDirectory.name}</div>
										<div className="truncate text-muted-foreground">
											{currentDirectory.businessCount} businesses • ${currentDirectory.monthlyRevenue.toLocaleString()} revenue
										</div>
									</div>
									<ChevronDown className="w-4 h-4 text-muted-foreground" />
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-80 z-[90] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
								<DropdownMenuLabel>Your LocalHub Directories</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{mockDirectories.map((directory) => (
									<DropdownMenuItem key={directory.id} onClick={() => setCurrentDirectoryId(directory.id)} className={`flex items-center space-x-3 p-3 ${directory.id === currentDirectoryId ? "bg-accent" : ""}`}>
										<div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-muted">
											<MapPin className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2">
												<span className="font-medium text-foreground">{directory.name}</span>
												<Badge variant="secondary" className="text-xs">
													{directory.status}
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground">{directory.location}</p>
											<p className="text-xs text-muted-foreground">
												{directory.businessCount} businesses • ${directory.monthlyRevenue.toLocaleString()}/mo
											</p>
										</div>
										{directory.id === currentDirectoryId && <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/dashboard/localhub/create-directory" className="flex items-center p-3 space-x-3">
										<div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-muted">
											<Plus className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1">
											<span className="font-medium text-foreground">Add New Directory</span>
											<p className="text-xs text-muted-foreground">Create a new LocalHub directory</p>
										</div>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/dashboard/localhub/directories" className="text-sm text-muted-foreground">
										Manage all directories
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				{/* Right Section - Navigation and User Menu */}
				<div className="hidden space-x-1 lg:flex xl:space-x-2">
					{navigation.map((item) => {
						const isActive = pathname === item.href || (item.href !== "/dashboard/localhub" && pathname.startsWith(item.href));
						return (
							<Link key={item.href} href={item.href} passHref>
								<Button variant={isActive ? "secondary" : "ghost"} size="sm" className="text-sm font-medium">
									{item.name}
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
								<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-neutral-800"></span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-80 z-[90] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
							<div className="flex justify-between items-center p-3 border-b border-neutral-800/50 dark:border-neutral-700/50">
								<span className="text-sm font-medium">Notifications</span>
								<Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
									Mark all as read
								</Button>
							</div>
							<div className="overflow-y-auto max-h-96">
								<DropdownMenuItem className="flex items-start p-4 space-x-3">
									<div className="flex-shrink-0 mt-2 w-2 h-2 bg-primary rounded-full"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">New business subscription</p>
										<p className="mt-1 text-xs text-muted-foreground">Wade&apos;s Plumbing started Pro subscription</p>
										<p className="text-xs text-muted-foreground">2 hours ago</p>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem className="flex items-start p-4 space-x-3">
									<div className="flex-shrink-0 mt-2 w-2 h-2 bg-primary rounded-full"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">Payment received</p>
										<p className="mt-1 text-xs text-muted-foreground">$79 payment from Downtown Coffee</p>
										<p className="text-xs text-muted-foreground">5 hours ago</p>
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
									<AvatarImage src={`https://vercel.com/api/www/avatar?u=${user?.email?.split("@")[0] || "localhub"}&s=64`} />
									<AvatarFallback>{user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "L"}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56 z-[80] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
							<div className="flex items-center p-3 space-x-3 border-b border-neutral-800/50 dark:border-neutral-700/50">
								<Avatar className="w-8 h-8">
									<AvatarImage src={`https://vercel.com/api/www/avatar?u=${user?.email?.split("@")[0] || "localhub"}&s=64`} />
									<AvatarFallback>{user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "L"}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate text-foreground">{user?.user_metadata?.first_name || user?.email?.split("@")[0] || "LocalHub"}</p>
									<p className="text-xs truncate text-muted-foreground">{user?.email}</p>
								</div>
							</div>
							<DropdownMenuGroup>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/localhub/settings">
										<Settings className="mr-2 w-4 h-4" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/localhub/billing">
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
									<SunIcon className="mr-2 w-4 h-4 text-muted-foreground" />
									Light
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")}>
									<MoonIcon className="mr-2 w-4 h-4 text-muted-foreground" />
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
								<Link href="/dashboard/business">
									<Building2 className="mr-2 w-4 h-4" />
									<span>Business Directory Portal</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/dashboard/user">
									<span>Personal Dashboard</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/">
									<span>Back to Directory</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
								<span>Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Mobile Menu */}
					<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon" className="flex lg:hidden">
								<Menu className="w-4 h-4" />
							</Button>
						</SheetTrigger>
						<SheetContent className="backdrop-blur-md bg-card/95">
							<SheetHeader>
								<SheetTitle>LocalHub Menu</SheetTitle>
							</SheetHeader>

							{/* Mobile Directory Switcher */}
							<div className="p-4 mt-6 border-b border-neutral-800/50 dark:border-neutral-700/50">
								<div className="flex items-center p-3 space-x-3 rounded-lg bg-accent/50">
									<div className="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg bg-muted">
										<MapPin className="w-5 h-5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-foreground">{currentDirectory.name}</p>
										<p className="text-sm text-muted-foreground">
											{currentDirectory.businessCount} businesses • ${currentDirectory.monthlyRevenue.toLocaleString()}/mo
										</p>
									</div>
								</div>

								<div className="mt-3 space-y-2">
									<p className="text-sm font-medium text-foreground">Switch Directory</p>
									{mockDirectories.map((directory) => (
										<button
											key={directory.id}
											onClick={() => {
												setCurrentDirectoryId(directory.id);
												setMobileMenuOpen(false);
											}}
											className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${directory.id === currentDirectoryId ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
										>
											<div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-muted">
												<MapPin className="w-4 h-4 text-white" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center space-x-2">
													<span className="font-medium">{directory.name}</span>
													<Badge variant="secondary" className="text-xs">
														{directory.status}
													</Badge>
												</div>
												<p className="text-xs opacity-80">{directory.location}</p>
												<p className="text-xs opacity-80">{directory.businessCount} businesses</p>
											</div>
											{directory.id === currentDirectoryId && <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>}
										</button>
									))}

									<Link href="/dashboard/localhub/create-directory" onClick={() => setMobileMenuOpen(false)} className="flex items-center p-3 space-x-3 w-full text-left rounded-lg transition-colors hover:bg-accent">
										<div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-muted">
											<Plus className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1">
											<span className="font-medium text-foreground">Add New Directory</span>
											<p className="text-xs text-muted-foreground">Create a new LocalHub directory</p>
										</div>
									</Link>
								</div>
							</div>

							<nav className="mt-6">
								<ul className="space-y-2">
									{navigation.map((item) => {
										const isActive = pathname === item.href || (item.href !== "/dashboard/localhub" && pathname.startsWith(item.href));
										return (
											<li key={item.href}>
												<Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
													<Button variant={isActive ? "default" : "ghost"} className={`w-full justify-start ${isActive ? "bg-primary/5 text-primary border border-primary/20 hover:text-white" : "hover:text-white"}`}>
														{item.name}
													</Button>
												</Link>
											</li>
										);
									})}
								</ul>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</div>
	);
}


"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from "@components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@components/ui/sheet";
import { ChevronDown, Menu, Bell, Settings, Briefcase, CreditCard, HelpCircle, User, Zap, Building2, Plus, Star } from "lucide-react";
import { BarChart3, Target } from "lucide-react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { RiComputerFill } from "react-icons/ri";
import { useTheme } from "next-themes";
import { useAuthStore } from "@store/auth";

// Mock data for companies
const mockCompanies = [
	{
		id: "1",
		name: "Wade's Plumbing & Septic",
		industry: "Plumbing Services",
		status: "active",
		subscription: "Pro",
		location: "Raleigh, NC",
	},
	{
		id: "2",
		name: "Downtown Coffee Co.",
		industry: "Food & Beverage",
		status: "active",
		subscription: "Basic",
		location: "Raleigh, NC",
	},
	{
		id: "3",
		name: "Elite Auto Repair",
		industry: "Automotive",
		status: "active",
		subscription: "Pro",
		location: "Durham, NC",
	},
];

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentCompanyId, setCurrentCompanyId] = useState("1"); // Default to first company
	const pathname = usePathname();
	const { setTheme, theme } = useTheme();
	const { user, userRoles, logout } = useAuthStore((state) => ({
		user: state.user,
		userRoles: state.userRoles,
		logout: state.logout,
	}));

	const currentCompany = mockCompanies.find((company) => company.id === currentCompanyId) || mockCompanies[0];

	const handleLogout = async () => {
		try {
			await logout();
			console.log("Logout successful");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const businessNavItems = [
		{ href: "/dashboard/business", text: "Overview", icon: BarChart3 },
		{ href: "/dashboard/business/profile", text: "Profile", icon: User },
		{ href: "/dashboard/business/reviews", text: "Reviews", icon: Star },
		{ href: "/dashboard/business/integrations", text: "Integrations", icon: Zap },
		{ href: "/dashboard/business/ads", text: "Ads", icon: Target },
		{ href: "/dashboard/business/jobs", text: "Jobs", icon: Briefcase },
	];

	return (
		<div className="sticky top-0 z-[60] bg-neutral-950/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-900 dark:border-neutral-900">
			<div className="flex items-center justify-between w-full gap-6 py-3 mx-auto px-4 lg:px-24">
				{/* Left Section - Logo and Business Info */}
				<div className="flex flex-row items-center w-full space-x-6">
					<Link href="/" className="flex items-center space-x-3 text-xl font-bold group">
						<div className="relative">
							<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Business" width={50} height={50} className="w-12 h-12 transition-transform duration-200 group-hover:scale-105" />
							<div className="absolute inset-0 transition-opacity duration-200 rounded-full opacity-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 group-hover:opacity-100" />
						</div>
						<div className="hidden sm:block">
							<h1 className="text-lg font-bold leading-none text-foreground">Thorbis Business</h1>
							<p className="text-xs text-muted-foreground">Business Dashboard</p>
						</div>
					</Link>

					{/* Current Company Dropdown */}
					<div className="hidden lg:flex flex-row space-x-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<div className="flex items-center p-2 px-3 space-x-2 transition-colors bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-accent/50 cursor-pointer">
									<Building2 className="w-4 h-4 text-muted-foreground" />
									<div className="text-xs max-w-[200px]">
										<div className="font-medium text-foreground truncate">{currentCompany.name}</div>
										<div className="text-muted-foreground truncate">
											{currentCompany.industry} • {currentCompany.subscription}
										</div>
									</div>
									<ChevronDown className="w-4 h-4 text-muted-foreground" />
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-72 z-[90] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
								<DropdownMenuLabel>Your Companies</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{mockCompanies.map((company) => (
									<DropdownMenuItem key={company.id} onClick={() => setCurrentCompanyId(company.id)} className={`flex items-center space-x-3 p-3 ${company.id === currentCompanyId ? "bg-accent" : ""}`}>
										<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
											<Building2 className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2">
												<span className="font-medium text-foreground">{company.name}</span>
												{company.subscription === "Pro" && (
													<Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
														Pro
													</Badge>
												)}
											</div>
											<p className="text-xs text-muted-foreground">{company.industry}</p>
											<p className="text-xs text-muted-foreground">{company.location}</p>
										</div>
										{company.id === currentCompanyId && <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/add-a-business" className="flex items-center space-x-3 p-3">
										<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
											<Plus className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1">
											<span className="font-medium text-foreground">Add New Company</span>
											<p className="text-xs text-muted-foreground">Create or claim a new business</p>
										</div>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/dashboard/business/companies" className="text-sm text-muted-foreground">
										Manage all companies
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				{/* Right Section - Navigation and User Menu */}
				<div className="hidden space-x-1 lg:flex xl:space-x-2">
					{businessNavItems.map((item) => {
						const isActive = pathname === item.href || (item.href !== "/dashboard/business" && pathname.startsWith(item.href));
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
							<Button variant="ghost" size="sm" className="relative p-2 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent">
								<Bell className="w-5 h-5" />
								<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary border-2 border-white dark:border-gray-800 rounded-full"></span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-80 z-[80] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
							<div className="flex items-center justify-between p-3 border-b border-border/50">
								<h3 className="font-semibold text-foreground">Business Notifications</h3>
								<Badge variant="secondary" className="text-xs">
									3 new
								</Badge>
							</div>
							<div className="overflow-y-auto max-h-96">
								<DropdownMenuItem className="flex items-start p-4 space-x-3">
									<div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary rounded-full"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">New job application</p>
										<p className="mt-1 text-xs text-muted-foreground">Someone applied for your plumbing job</p>
										<p className="text-xs text-muted-foreground">5 minutes ago</p>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem className="flex items-start p-4 space-x-3">
									<div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary rounded-full"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">Payment received</p>
										<p className="mt-1 text-xs text-muted-foreground">$500 payment for website project</p>
										<p className="text-xs text-muted-foreground">1 hour ago</p>
									</div>
								</DropdownMenuItem>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* User Avatar Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="p-0 border rounded-full shadow-sm h-9 w-9 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary">
								<Avatar className="w-8 h-8">
									<AvatarImage src={`https://vercel.com/api/www/avatar?u=${user?.email?.split("@")[0] || "business"}&s=64`} />
									<AvatarFallback>{user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "B"}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56 z-[80] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
							<div className="flex items-center p-3 space-x-3 border-b border-border/50">
								<Avatar className="w-8 h-8">
									<AvatarImage src={`https://vercel.com/api/www/avatar?u=${user?.email?.split("@")[0] || "business"}&s=64`} />
									<AvatarFallback>{user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "B"}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate text-foreground">{user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Business"}</p>
									<p className="text-xs truncate text-muted-foreground">{user?.email}</p>
								</div>
							</div>
							<DropdownMenuGroup>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/user">
										<span>Switch to User Account</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/business/billing">
										<CreditCard className="w-4 h-4 mr-2" />
										<span>Billing</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/business/settings">
										<Settings className="w-4 h-4 mr-2" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/business/support">
										<HelpCircle className="w-4 h-4 mr-2" />
										<span>Support</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => setTheme("light")}>
									<SunIcon className="w-4 h-4 mr-2 text-muted-foreground" />
									Light
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")}>
									<MoonIcon className="w-4 h-4 mr-2 text-muted-foreground" />
									Dark
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("system")}>
									<RiComputerFill className="w-4 h-4 mr-2 text-slate-500" />
									System
								</DropdownMenuItem>
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
					<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon" className="flex lg:hidden">
								<Menu className="w-4 h-4" />
							</Button>
						</SheetTrigger>
						<SheetContent className="bg-card/95 backdrop-blur-md">
							<SheetHeader>
								<SheetTitle>Business Menu</SheetTitle>
							</SheetHeader>

							{/* Mobile Company Switcher */}
							<div className="mt-6 p-4 border-b border-border/50">
								<div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
									<div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
										<Building2 className="w-5 h-5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-foreground">{currentCompany.name}</p>
										<p className="text-sm text-muted-foreground">
											{currentCompany.industry} • {currentCompany.subscription}
										</p>
									</div>
								</div>

								<div className="mt-3 space-y-2">
									<p className="text-sm font-medium text-foreground">Switch Company</p>
									{mockCompanies.map((company) => (
										<button
											key={company.id}
											onClick={() => {
												setCurrentCompanyId(company.id);
												setMobileMenuOpen(false);
											}}
											className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${company.id === currentCompanyId ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
										>
											<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
												<Building2 className="w-4 h-4 text-white" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center space-x-2">
													<span className="font-medium">{company.name}</span>
													{company.subscription === "Pro" && (
														<Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
															Pro
														</Badge>
													)}
												</div>
												<p className="text-xs opacity-80">{company.industry}</p>
											</div>
											{company.id === currentCompanyId && <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>}
										</button>
									))}

									<Link href="/add-a-business" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-accent transition-colors">
										<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
											<Plus className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1">
											<span className="font-medium text-foreground">Add New Company</span>
											<p className="text-xs text-muted-foreground">Create or claim a new business</p>
										</div>
									</Link>
								</div>
							</div>

							<nav className="mt-6">
								<ul className="space-y-2">
									{businessNavItems.map((item) => {
										const isActive = pathname === item.href || (item.href !== "/dashboard/business" && pathname.startsWith(item.href));
										return (
											<li key={item.href}>
												<Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
													<Button variant={isActive ? "default" : "ghost"} className={`w-full justify-start ${isActive ? "bg-primary/5 text-primary border border-primary/20" : ""}`}>
														{item.text}
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


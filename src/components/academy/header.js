"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Progress } from "@components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuGroup, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@components/ui/sheet";
import { 
  GraduationCap, 
  ChevronDown, 
  Plus, 
  Bell, 
  User, 
  Crown, 
  Settings, 
  HelpCircle, 
  Menu 
} from "lucide-react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import UnifiedHeader from "@components/shared/unified-header";

// Mock companies for academy (learning paths or specializations)
const mockLearningPaths = [
	{
		id: "1",
		name: "Plumbing Mastery Track",
		category: "Plumbing",
		status: "active",
		level: "Intermediate",
		progress: "65%",
	},
	{
		id: "2",
		name: "HVAC Certification Path",
		category: "HVAC",
		status: "active",
		level: "Beginner",
		progress: "30%",
	},
	{
		id: "3",
		name: "Electrical Fundamentals",
		category: "Electrical",
		status: "active",
		level: "Advanced",
		progress: "85%",
	},
];

export default function AcademyHeader() {
  return (
    <UnifiedHeader
      dashboardType="academy"
      showCompanySelector={false}
      showSearch={false}
      customTitle="Thorbis Academy"
      customSubtitle="Learning Dashboard"
    />
  );
}

// Legacy component - now using UnifiedHeader system
function LegacyAcademyHeader() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentPathId, setCurrentPathId] = useState("1"); // Default to first learning path
	const pathname = usePathname();
	const { setTheme, theme } = useTheme();
	const { user, userRoles, logout } = useAuthStore((state) => ({
		user: state.user,
		userRoles: state.userRoles,
		logout: state.logout,
	}));

	const currentPath = mockLearningPaths.find((path) => path.id === currentPathId) || mockLearningPaths[0];

	const handleLogout = async () => {
		try {
			await logout();
			console.log("Logout successful");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const academyNavItems = [
		{ href: "/dashboard/academy", text: "Overview" },
		{ href: "/dashboard/academy/courses", text: "Courses" },
		{ href: "/dashboard/academy/progress", text: "Progress" },
		{ href: "/dashboard/academy/practice", text: "Practice" },
		{ href: "/dashboard/academy/certifications", text: "Certificates" },
		{ href: "/dashboard/academy/ai-tutor", text: "AI Tutor" },
	];

	return (
		<div className="sticky top-[98px] z-[60] bg-background/95 backdrop-blur-md border-b border-border">
			<div className="flex items-center justify-between w-full gap-6 py-3 mx-auto px-4 lg:px-24">
				{/* Left Section - Logo and Academy Info */}
				<div className="flex flex-row items-center w-full space-x-6">
					<Link href="/" className="flex items-center space-x-3 text-xl font-bold group">
						<div className="relative">
							<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Academy" width={50} height={50} className="w-12 h-12 transition-transform duration-200 group-hover:scale-105" />
							<div className="absolute inset-0 transition-opacity duration-200 rounded-full opacity-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 group-hover:opacity-100" />
						</div>
						<div className="hidden sm:block">
							<h1 className="text-lg font-bold leading-none text-foreground">Thorbis Academy</h1>
							<p className="text-xs text-muted-foreground">Learning Dashboard</p>
						</div>
					</Link>

					{/* Current Learning Path Dropdown */}
					<div className="hidden lg:flex flex-row space-x-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<div className="flex items-center p-2 px-3 space-x-2 transition-colors bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-accent/50 cursor-pointer">
									<GraduationCap className="w-4 h-4 text-muted-foreground" />
									<div className="text-xs max-w-[200px]">
										<div className="font-medium text-foreground truncate">{currentPath.name}</div>
										<div className="text-muted-foreground truncate">
											{currentPath.category} • {currentPath.level}
										</div>
									</div>
									<ChevronDown className="w-4 h-4 text-muted-foreground" />
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-72 z-[90]">
								<DropdownMenuLabel>Your Learning Paths</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{mockLearningPaths.map((path) => (
									<DropdownMenuItem key={path.id} onClick={() => setCurrentPathId(path.id)} className={`flex items-center space-x-3 p-3 ${path.id === currentPathId ? "bg-accent" : ""}`}>
										<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
											<GraduationCap className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2">
												<span className="font-medium text-foreground">{path.name}</span>
												{path.level === "Advanced" && (
													<Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
														Advanced
													</Badge>
												)}
											</div>
											<p className="text-xs text-muted-foreground">{path.category}</p>
											<p className="text-xs text-muted-foreground">{path.progress} Complete</p>
										</div>
										{path.id === currentPathId && <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/dashboard/academy/courses" className="flex items-center space-x-3 p-3">
										<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
											<Plus className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1">
											<span className="font-medium text-foreground">Browse All Courses</span>
											<p className="text-xs text-muted-foreground">Explore our course catalog</p>
										</div>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/dashboard/academy/progress" className="text-sm text-muted-foreground">
										View detailed progress
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Right Section - Navigation and User Menu */}
				<div className="hidden space-x-1 lg:flex xl:space-x-2">
					{academyNavItems.map((item) => {
						const isActive = pathname === item.href || (item.href !== "/dashboard/academy" && pathname.startsWith(item.href));
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
								<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 border-2 border-background rounded-full"></span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-80 z-[80]">
							<div className="flex items-center justify-between p-3 border-b border-border/50">
								<h3 className="font-semibold text-foreground">Learning Notifications</h3>
								<Badge variant="secondary" className="text-xs">
									2 new
								</Badge>
							</div>
							<div className="overflow-y-auto max-h-96">
								<DropdownMenuItem className="flex items-start p-4 space-x-3">
									<div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">Course completed!</p>
										<p className="mt-1 text-xs text-muted-foreground">You finished &quot;Plumbing Basics&quot; - claim your certificate</p>
										<p className="text-xs text-muted-foreground">2 hours ago</p>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem className="flex items-start p-4 space-x-3">
									<div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground">New course available</p>
										<p className="mt-1 text-xs text-muted-foreground">Advanced HVAC Troubleshooting is now live</p>
										<p className="text-xs text-muted-foreground">1 day ago</p>
									</div>
								</DropdownMenuItem>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* User Avatar Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="p-0 border rounded-full shadow-sm h-9 w-9">
								<Avatar className="w-8 h-8">
									<AvatarImage src={`https://vercel.com/api/www/avatar?u=${user?.email?.split("@")[0] || "learner"}&s=64`} />
									<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">{user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "L"}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56 z-[80]">
							<div className="flex items-center p-3 space-x-3 border-b border-border/50">
								<Avatar className="w-8 h-8">
									<AvatarImage src={`https://vercel.com/api/www/avatar?u=${user?.email?.split("@")[0] || "learner"}&s=64`} />
									<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">{user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "L"}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate text-foreground">{user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Learner"}</p>
									<p className="text-xs truncate text-muted-foreground">{user?.email}</p>
									<div className="flex items-center mt-1 space-x-2">
										<Badge variant="outline" className="text-xs">
											{currentPath.level}
										</Badge>
										<span className="text-xs text-muted-foreground">{currentPath.progress}</span>
									</div>
								</div>
							</div>
							<DropdownMenuGroup>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/user">
										<User className="w-4 h-4 mr-2" />
										<span>Switch to User Dashboard</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/business">
										<Crown className="w-4 h-4 mr-2" />
										<span>Switch to Business</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/dashboard/academy/profile">
										<User className="w-4 h-4 mr-2" />
										<span>Learning Profile</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/academy/settings">
										<Settings className="w-4 h-4 mr-2" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/dashboard/academy/help">
										<HelpCircle className="w-4 h-4 mr-2" />
										<span>Help & Support</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => setTheme("light")}>
									<SunIcon className="w-4 h-4 mr-2 text-yellow-500" />
									Light
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")}>
									<MoonIcon className="w-4 h-4 mr-2 text-indigo-500" />
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
							<DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400">
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
						<SheetContent className="bg-background/95 backdrop-blur-md border-border">
							<SheetHeader>
								<SheetTitle>Academy Menu</SheetTitle>
							</SheetHeader>

							{/* Mobile Progress Display */}
							<div className="mt-6 p-4 border-b border-border">
								<div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
									<Avatar className="w-10 h-10">
										<AvatarImage src={`https://vercel.com/api/www/avatar?u=${user?.email?.split("@")[0] || "learner"}&s=64`} />
										<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">{user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "L"}</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-foreground">{currentPath.level} Level</p>
										<p className="text-sm text-muted-foreground">{currentPath.progress}</p>
										<div className="mt-2">
											<Progress value={parseInt(currentPath.progress)} className="h-2" />
										</div>
									</div>
								</div>
							</div>

							<nav className="mt-6">
								<ul className="space-y-2">
									{academyNavItems.map((item) => {
										const isActive = pathname === item.href || (item.href !== "/dashboard/academy" && pathname.startsWith(item.href));
										return (
											<li key={item.href}>
												<Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
													<Button variant={isActive ? "secondary" : "ghost"} className={`w-full justify-start ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}>
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

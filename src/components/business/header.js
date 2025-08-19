"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
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
  Building2, 
  ChevronDown, 
  Plus, 
  Search, 
  Star, 
  Bell, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Menu 
} from "lucide-react";
import { SunIcon, MoonIcon, DesktopIcon } from "@radix-ui/react-icons";
import UnifiedHeader from "@components/shared/unified-header";

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

export default function Header({ dashboardType = "business", ...props }) {
  return (
    <UnifiedHeader
      dashboardType={dashboardType}
      showCompanySelector={true}
      showSearch={false}
      customTitle="Thorbis Business"
      customSubtitle="Directory & Field Services Dashboard"
      {...props}
    />
  );
}

// Legacy component - now using UnifiedHeader system
function LegacyHeader({ dashboardType = "business" }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentCompanyId, setCurrentCompanyId] = useState("1"); // Default to first company
	const [pinnedRoutes, setPinnedRoutes] = useState([]);
	const [recentRoutes, setRecentRoutes] = useState([]);
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(-1);
	const [showToolbarResults, setShowToolbarResults] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const { setTheme, theme } = useTheme();
	const { user, userRoles, logout } = useAuthStore((state) => ({
		user: state.user,
		userRoles: state.userRoles,
		logout: state.logout,
	}));

	const currentCompany = mockCompanies.find((company) => company.id === currentCompanyId) || mockCompanies[0];

    // Dashboard-specific configuration (minimal, uniform)
    const dashboardConfig = {
        business: {
            title: "Thorbis Business",
            subtitle: "Dashboard",
            showCompanySelector: true
        },
        user: {
            title: "Thorbis",
            subtitle: "Dashboard",
            showCompanySelector: false
        },
        localhub: {
            title: "Thorbis LocalHub",
            subtitle: "Dashboard",
            showCompanySelector: false
        },
        developers: {
            title: "Thorbis Developers",
            subtitle: "Dashboard",
            showCompanySelector: false
        },
        gofor: {
            title: "Thorbis GoFor",
            subtitle: "Dashboard",
            showCompanySelector: true
        },
        admin: {
            title: "Thorbis Admin",
            subtitle: "Dashboard",
            showCompanySelector: false
        },
        academy: {
            title: "Thorbis Academy",
            subtitle: "Dashboard",
            showCompanySelector: false
        }
    };

	const config = dashboardConfig[dashboardType] || dashboardConfig.business;

	const handleLogout = async () => {
		try {
			await logout();
			console.log("Logout successful");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	// Persist pins/recents
	useEffect(() => {
		try {
			const pins = JSON.parse(localStorage.getItem("tb_pinned_routes") || "[]");
			const recents = JSON.parse(localStorage.getItem("tb_recent_routes") || "[]");
			setPinnedRoutes(pins);
			setRecentRoutes(recents);
		} catch {}
	}, []);

	const togglePin = (href) => {
		setPinnedRoutes((prev) => {
			const next = prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href];
			localStorage.setItem("tb_pinned_routes", JSON.stringify(next));
			return next;
		});
	};

	const recordRecent = (href) => {
		setRecentRoutes((prev) => {
			const without = prev.filter((h) => h !== href);
			const next = [href, ...without].slice(0, 8);
			localStorage.setItem("tb_recent_routes", JSON.stringify(next));
			return next;
		});
	};

    // Main navigation structure prioritized by: Directory > Field Management > Community
    const businessMainNavItems = [
		// Business Directory Functions (Primary)
		{ key: "profile", text: "Directory Profile", icon: User, href: "/dashboard/business/profile", description: "Business directory listing & profile" },
		{ key: "reviews", text: "Directory Reviews", icon: Star, href: "/dashboard/business/reviews", description: "Manage customer reviews & ratings" },
		{ key: "marketing", text: "Directory Marketing", icon: Target, href: "/dashboard/business/marketing", description: "Promote your directory listing" },
		{ key: "ads", text: "Directory Ads", icon: Zap, href: "/dashboard/business/ads", description: "Manage directory advertisements" },

		// Field Service Management (Secondary)
		{ key: "dashboard", text: "Field Dashboard", icon: BarChart3, href: "/dashboard/business", description: "Field service overview and insights" },
		{ key: "schedule", text: "Job Scheduling", icon: Calendar, href: "/dashboard/business/schedule", description: "Schedule and manage field jobs" },
		{ key: "jobs", text: "Field Jobs", icon: Briefcase, href: "/dashboard/business/jobs", description: "Track and manage field work" },
		{ key: "estimates", text: "Job Estimates", icon: FileText, href: "/dashboard/business/estimates", description: "Create field service estimates" },
		{ key: "invoices", text: "Job Invoicing", icon: Receipt, href: "/dashboard/business/invoices", description: "Bill for field services" },
		{ key: "customers", text: "Service Customers", icon: Users, href: "/dashboard/business/customers", description: "Manage field service clients" },
		{ key: "employees", text: "Field Team", icon: Users, href: "/dashboard/business/employees", description: "Manage field technicians" },

		// Business Operations
		{ key: "communication", text: "Communication", icon: MessageSquare, href: "/dashboard/business/communication", description: "Business communications hub" },
		{ key: "gofor", text: "GoFor Delivery", icon: Truck, href: "/dashboard/gofor", description: "On-demand delivery for parts & supplies" },
		{ key: "projects", text: "Projects", icon: Book, href: "/dashboard/business/projects", description: "Manage construction projects" },
		{ key: "pricebook", text: "Service Catalog", icon: Package, href: "/dashboard/business/pricebook", description: "Services and products pricing" },
		{ key: "service-plans", text: "Service Plans", icon: Wrench, href: "/dashboard/business/service-plans", description: "Maintenance plans & contracts" },
		{ key: "time-payroll", text: "Time & Payroll", icon: Clock, href: "/dashboard/business/time-payroll", description: "Team time tracking & payroll" },
		{ key: "performance", text: "Performance", icon: Activity, href: "/dashboard/business/performance", description: "Business performance metrics" },

		// Platform Management
		{ key: "companies", text: "Companies", icon: Building2, href: "/dashboard/business/companies", description: "Manage business entities" },
		{ key: "billing", text: "Platform Billing", icon: CreditCard, href: "/dashboard/business/billing", description: "Platform subscription & billing" },
		{ key: "analytics", text: "Business Analytics", icon: TrendingUp, href: "/dashboard/business/analytics", description: "Comprehensive business analytics" },
		{ key: "integrations", text: "Integrations", icon: Puzzle, href: "/dashboard/business/integrations", description: "Third-party tool integrations" },
		{ key: "automation", text: "Automation", icon: Bot, href: "/dashboard/business/automation", description: "AI-powered business automation" },
		{ key: "tools", text: "Business Tools", icon: Calculator, href: "/dashboard/business/tools", description: "Business calculation tools" },
		{ key: "settings", text: "Settings", icon: Sliders, href: "/dashboard/business/settings", description: "Business configuration" },
		{ key: "support", text: "Support", icon: HelpCircle, href: "/dashboard/business/support", description: "Help and support" },
    ];

    // Admin navigation (minimal, uniform)
    const adminMainNavItems = [
        { key: "overview", text: "Overview", icon: BarChart3, href: "/admin" },
        { key: "users", text: "Users", icon: Users, href: "/admin/users" },
        { key: "customers", text: "Customers", icon: Users, href: "/admin/customers" },
        { key: "billing", text: "Billing", icon: CreditCard, href: "/admin/billing" },
        { key: "reports", text: "Reports", icon: TrendingUp, href: "/admin/reports" },
        { key: "support", text: "Support", icon: HelpCircle, href: "/admin/support" },
        { key: "settings", text: "Settings", icon: Settings, href: "/admin/settings" },
    ];

    // Academy navigation (minimal, uniform)
    const academyMainNavItems = [
        { key: "overview", text: "Overview", icon: BarChart3, href: "/academy" },
        { key: "courses", text: "Courses", icon: Book, href: "/academy/courses" },
    ];

    // Choose nav items based on dashboard type
    const mainNavItems = useMemo(() => {
        if (dashboardType === "admin") return adminMainNavItems;
        if (dashboardType === "academy") return academyMainNavItems;
        return businessMainNavItems;
    }, [dashboardType]);

	// Sub-navigation items based on main selection
	const subNavItems = {
		dashboard: [
			{ text: "Overview", href: "/dashboard/business/dashboard/overview" },
			{ text: "Real-time Insights", href: "/dashboard/business/dashboard/real-time-insights" },
		],
		communication: [
			{ text: "Inbox", href: "/dashboard/business/communication/inbox" },
			{ text: "Calls", href: "/dashboard/business/communication/calls" },
			{ text: "Team Chat", href: "/dashboard/business/communication/team-chat" },
			{ text: "CSR Booking Console", href: "/dashboard/business/communication/csr-console" },
		],
		schedule: [
			{ text: "Calendar", href: "/dashboard/business/schedule/calendar" },
			{ text: "New Job", href: "/dashboard/business/schedule/new-job" },
			{ text: "Recurring Jobs", href: "/dashboard/business/schedule/recurring-jobs" },
			{ text: "Technician Availability", href: "/dashboard/business/schedule/technician-availability" },
			{ text: "Route Planner", href: "/dashboard/business/schedule/route-planner" },
			{ text: "Dispatch", href: "/dashboard/business/dispatch" },
			{ text: "Capacity Planning", href: "/dashboard/business/schedule/capacity-planning" },
			{ text: "Shifts", href: "/dashboard/business/schedule/shifts" },
			{ text: "Time Off Requests", href: "/dashboard/business/schedule/time-off-requests" },
		],
		estimates: [
			{ text: "List", href: "/dashboard/business/estimates/list" },
			{ text: "Create", href: "/dashboard/business/estimates/create" },
			{ text: "Approvals", href: "/dashboard/business/estimates/approvals" },
			{ text: "Follow-ups", href: "/dashboard/business/estimates/follow-ups" },
			{ text: "Templates", href: "/dashboard/business/estimates/templates" },
			{ text: "Proposals/Options", href: "/dashboard/business/estimates/proposals" },
		],
		jobs: [
			{ text: "List", href: "/dashboard/business/jobs/list" },
			{ text: "Details", href: "/dashboard/business/jobs/details" },
			{ text: "Photos & Checklists", href: "/dashboard/business/jobs/photos-checklists" },
			{ text: "Job Costs", href: "/dashboard/business/jobs/job-costs" },
			{ text: "Warranties", href: "/dashboard/business/jobs/warranties" },
			{ text: "Permits & Inspections", href: "/dashboard/business/jobs/permits-inspections" },
		],
		pricebook: [
			{ text: "Services", href: "/dashboard/business/pricebook/services" },
			{ text: "Products", href: "/dashboard/business/pricebook/products" },
			{ text: "Categories", href: "/dashboard/business/pricebook/categories" },
			{ text: "Bundles (Kits)", href: "/dashboard/business/pricebook/bundles" },
			{ text: "Versions", href: "/dashboard/business/pricebook/versions" },
		],
		invoices: [
			{ text: "List", href: "/dashboard/business/invoices/list" },
			{ text: "Create", href: "/dashboard/business/invoices/create" },
			{ text: "Payments", href: "/dashboard/business/invoices/payments" },
			{ text: "Financing", href: "/dashboard/business/invoices/financing" },
			{ text: "Accounting Sync", href: "/dashboard/business/invoices/accounting-sync" },
		],
		customers: [
			{ text: "List", href: "/dashboard/business/customers/list" },
			{ text: "Details", href: "/dashboard/business/customers/details" },
			{ text: "Service History", href: "/dashboard/business/customers/service-history" },
			{ text: "Portal Access", href: "/dashboard/business/customers/portal-access" },
			{ text: "Messages Log", href: "/dashboard/business/customers/messages-log" },
		],
		marketing: [
			{ text: "Online Booking", href: "/dashboard/business/marketing/online-booking" },
			{ text: "Campaigns", href: "/dashboard/business/marketing/campaigns" },
			{ text: "Ads & Leads", href: "/dashboard/business/marketing/ads-leads" },
			{ text: "Reviews", href: "/dashboard/business/marketing/reviews" },
			{ text: "Referrals & Promotions", href: "/dashboard/business/marketing/referrals-promotions" },
		],
		ads: [
			{ text: "Overview", href: "/dashboard/business/ads" },
			{ text: "Create", href: "/dashboard/business/ads/create" },
		],
		inventory: [
			{ text: "Stock List", href: "/dashboard/business/inventory/stock-list" },
			{ text: "Orders & Reorders", href: "/dashboard/business/inventory/orders-reorders" },
			{ text: "Parts Usage", href: "/dashboard/business/inventory/parts-usage" },
			{ text: "Equipment Profiles", href: "/dashboard/business/inventory/equipment-profiles" },
			{ text: "Alerts & Reports", href: "/dashboard/business/inventory/alerts-reports" },
			{ text: "Multi-location", href: "/dashboard/business/inventory/multi-location" },
			{ text: "Vendors", href: "/dashboard/business/inventory/vendors" },
			{ text: "Vendor Catalogs", href: "/dashboard/business/inventory/vendor-catalogs" },
			{ text: "Cycle Counts", href: "/dashboard/business/inventory/cycle-counts" },
			{ text: "Barcodes", href: "/dashboard/business/inventory/barcodes" },
			{ text: "Purchase Orders", href: "/dashboard/business/inventory/purchase-orders" },
			{ text: "Returns", href: "/dashboard/business/inventory/returns" },
			{ text: "Adjustments", href: "/dashboard/business/inventory/adjustments" },
			{ text: "Warranty Parts", href: "/dashboard/business/inventory/warranty-parts" },
			{ text: "Transfers", href: "/dashboard/business/inventory/transfers" },
			{ text: "Vendor Invoice Capture", href: "/dashboard/business/accounting/vendor-invoice-capture" },
		],
		analytics: [
			{ text: "Dashboard", href: "/dashboard/business/analytics/dashboard" },
			{ text: "Drill-down Reports", href: "/dashboard/business/analytics/drill-down-reports" },
			{ text: "Custom Report Builder", href: "/dashboard/business/analytics/custom-report-builder" },
			{ text: "Forecasting & Predictive", href: "/dashboard/business/analytics/forecasting-predictive" },
			{ text: "Job Profit Analysis", href: "/dashboard/business/analytics/job-profit-analysis" },
			{ text: "Marketing Attribution", href: "/dashboard/business/analytics/marketing-attribution" },
			{ text: "Geo Heatmaps", href: "/dashboard/business/analytics/geo-heatmaps" },
			{ text: "Scheduled Exports", href: "/dashboard/business/analytics/scheduled-exports" },
		],
		automation: [
			{ text: "Auto-scheduling AI", href: "/dashboard/business/automation/auto-scheduling-ai" },
			{ text: "Route Optimizer AI", href: "/dashboard/business/automation/route-optimizer-ai" },
			{ text: "Sales Suggestions AI", href: "/dashboard/business/automation/sales-suggestions-ai" },
			{ text: "Proactive Campaigns AI", href: "/dashboard/business/automation/proactive-campaigns-ai" },
			{ text: "Virtual Call Assistant", href: "/dashboard/business/automation/virtual-call-assistant" },
			{ text: "AI Performance Coach", href: "/dashboard/business/automation/ai-performance-coach" },
			{ text: "Workflow Automations", href: "/dashboard/business/automation/workflow-automations" },
			{ text: "Review Requests", href: "/dashboard/business/automation/review-requests" },
		],
		tools: [
			{ text: "Hourly Rate Calculator", href: "/dashboard/business/tools/hourly-rate-calculator" },
			{ text: "Commission Calculator", href: "/dashboard/business/tools/commission-calculator" },
			{ text: "Breakeven Analyzer", href: "/dashboard/business/tools/breakeven-analyzer" },
			{ text: "Job Profit Estimator", href: "/dashboard/business/tools/job-profit-estimator" },
			{ text: "Pricing Builder", href: "/dashboard/business/tools/pricing-builder" },
			{ text: "Marketing ROI", href: "/dashboard/business/tools/marketing-roi" },
			{ text: "Equipment ROI", href: "/dashboard/business/tools/equipment-roi" },
			{ text: "Service Agreement ROI", href: "/dashboard/business/tools/service-agreement-roi" },
			{ text: "Payment Estimator", href: "/dashboard/business/tools/payment-estimator" },
			{ text: "Labor Cost Analyzer", href: "/dashboard/business/tools/labor-cost-analyzer" },
			{ text: "Fuel Expense Estimator", href: "/dashboard/business/tools/fuel-expense-estimator" },
			{ text: "Custom KPI Builder", href: "/dashboard/business/tools/custom-kpi-builder" },
		],
		integrations: [
			{ text: "Overview", href: "/dashboard/business/integrations" },
			{ text: "QuickBooks", href: "/dashboard/business/integrations/quickbooks" },
			{ text: "Sage Intacct", href: "/dashboard/business/integrations/sage-intacct" },
			{ text: "Twilio Voice", href: "/dashboard/business/integrations/twilio-voice" },
			{ text: "Thorbis Ads", href: "/dashboard/business/integrations/thorbis-ads" },
			{ text: "Other APIs", href: "/dashboard/business/integrations/other-api" },
			{ text: "Payments Setup", href: "/dashboard/business/integrations/payments" },
			{ text: "Payment Surcharges", href: "/dashboard/business/integrations/payments/surcharges" },
		],
		settings: [
			{ text: "Company Info", href: "/dashboard/business/settings/company-info" },
			{ text: "Users & Roles", href: "/dashboard/business/settings/users-roles" },
			{ text: "Subscription & Billing", href: "/dashboard/business/settings/subscription-billing" },
			{ text: "Templates & Documents", href: "/dashboard/business/settings/templates-documents" },
			{ text: "Alerts & Workflow Rules", href: "/dashboard/business/settings/alerts-workflow-rules" },
			{ text: "Import & Export", href: "/dashboard/business/settings/import-export" },
			{ text: "Security Logs", href: "/dashboard/business/settings/security-logs" },
			{ text: "Support", href: "/dashboard/business/settings/support" },
			{ text: "Tax Zones", href: "/dashboard/business/settings/tax-zones" },
			{ text: "API Keys & Webhooks", href: "/dashboard/business/settings/api-keys-webhooks" },
		],
		employees: [
			{ text: "Staff List", href: "/dashboard/business/employees/staff-list" },
			{ text: "Vehicle Tracking", href: "/dashboard/business/employees/vehicle-tracking" },
			{ text: "Tracking History", href: "/dashboard/business/employees/vehicle-tracking/history" },
		],
		companies: [{ text: "Manage Companies", href: "/dashboard/business/companies" }],
		billing: [{ text: "Billing", href: "/dashboard/business/billing" }],
		reviews: [{ text: "Reviews", href: "/dashboard/business/reviews" }],
		"time-payroll": [
			{ text: "Timesheets", href: "/dashboard/business/time-payroll/timesheets" },
			{ text: "Approvals", href: "/dashboard/business/time-payroll/approvals" },
			{ text: "Runs", href: "/dashboard/business/time-payroll/runs" },
			{ text: "Commissions", href: "/dashboard/business/time-payroll/commissions" },
			{ text: "SPIFFs", href: "/dashboard/business/time-payroll/spiffs" },
		],
		projects: [
			{ text: "List", href: "/dashboard/business/projects/list" },
			{ text: "Budget vs Actual", href: "/dashboard/business/projects/budget-vs-actual" },
			{ text: "Change Orders", href: "/dashboard/business/projects/change-orders" },
			{ text: "Applications for Payment", href: "/dashboard/business/projects/applications-for-payment" },
		],
		performance: [
			{ text: "Scorecards", href: "/dashboard/business/performance/scorecards" },
			{ text: "Efficiency Reports", href: "/dashboard/business/performance/efficiency-reports" },
		],
	};

	// Category map for All Apps mega menu - Reorganized by Priority
	const NAV_CATEGORIES = {
		"Directory Management": ["profile", "reviews", "marketing", "ads"],
		"Field Services": ["dashboard", "schedule", "jobs", "estimates", "invoices", "customers", "employees"],
		"Business Operations": ["communication", "gofor", "projects", "service-plans", "pricebook", "time-payroll", "performance"],
		"Platform & Tools": ["companies", "billing", "analytics", "integrations", "automation", "tools", "settings"],
		"Support & Growth": ["support"],
	};

	// Flatten all links for search/pins
	const allLinks = useMemo(() => {
		const base = mainNavItems.map((i) => ({ text: i.text, href: i.href, icon: i.icon, group: "Top" }));
		const sub = Object.entries(subNavItems).flatMap(([key, items]) => {
			const parent = mainNavItems.find((i) => i.key === key);
			return (items || []).map((s) => ({ text: `${parent ? parent.text + ": " : ""}${s.text}`.trim(), href: s.href, icon: parent?.icon, group: parent?.text || key }));
		});
		return [...base, ...sub];
	}, [mainNavItems]);

	// Ensure unique hrefs (avoid duplicates like top-level vs "Overview")
	const uniqueLinks = useMemo(() => {
		const seen = new Set();
		const result = [];
		for (const link of allLinks) {
			if (seen.has(link.href)) continue;
			seen.add(link.href);
			result.push(link);
		}
		return result;
	}, [allLinks]);

	const filteredResults = useMemo(() => {
		if (!debouncedQuery) return [];
		const q = debouncedQuery.toLowerCase();
		return uniqueLinks.filter((l) => l.text.toLowerCase().includes(q)).slice(0, 8);
	}, [debouncedQuery, uniqueLinks]);

	// Debounce query for smooth filtering
	useEffect(() => {
		const id = setTimeout(() => setDebouncedQuery(query), 150);
		return () => clearTimeout(id);
	}, [query]);

	const handleSearchKeyDown = (e) => {
		if (filteredResults.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((prev) => (prev + 1) % filteredResults.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const target = filteredResults[Math.max(0, activeIndex)];
			if (target) {
				recordRecent(target.href);
				setQuery("");
				setActiveIndex(-1);
				setShowToolbarResults(false);
				router.push(target.href);
			}
		} else if (e.key === "Escape") {
			setShowToolbarResults(false);
			setQuery("");
			setActiveIndex(-1);
		}
	};

	// Determine active main section based on current path
    const activeMainSection = useMemo(() => {
        if (dashboardType !== "business") return null;
        const pathSegments = pathname.split("/");
        const businessSegmentIndex = pathSegments.indexOf("business");
        const mainSection = pathSegments[businessSegmentIndex + 1];

        if (!mainSection || mainSection === "business") {
            return "dashboard";
        }

        const sectionExists = businessMainNavItems.some((item) => item.key === mainSection);
        return sectionExists ? mainSection : "dashboard";
    }, [pathname, dashboardType]);

	// Get current sub-navigation items
    const currentSubNavItems = dashboardType === "business" ? subNavItems[activeMainSection] || [] : [];

	return (
		<>
			<div className="sticky top-0 z-[60] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
				{/* Main Header */}
				<div className="flex items-center justify-between w-full gap-6 py-3 px-4 md:px-6">
					{/* Left Section - Logo and Business Info */}
					<div className="flex flex-row items-center w-full space-x-6">
						<Link href="/" className="flex items-center space-x-3 text-xl font-bold group">
							<div className="relative">
								<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Business Directory" width={50} height={50} className="w-12 h-12 transition-transform duration-200 group-hover:scale-105" />
							</div>
							<div className="hidden sm:block">
								<h1 className="text-lg font-bold leading-none text-foreground">{config.title}</h1>
								<p className="text-xs text-muted-foreground">{config.subtitle}</p>
							</div>
						</Link>

						{/* Current Company Dropdown - Only show for business dashboards */}
						{config.showCompanySelector && (
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
												<div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-muted/60 border border-border/60">
													<Building2 className="w-4 h-4 text-foreground" />
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
											{company.id === currentCompanyId && <div className="flex-shrink-0 w-2 h-2 bg-success rounded-full"></div>}
										</DropdownMenuItem>
									))}
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link href="/add-a-business" className="flex items-center space-x-3 p-3">
												<div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-muted/60 border border-border/60">
													<Plus className="w-4 h-4 text-foreground" />
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
						)}
					</div>

					{/* Right Section - Main Navigation and User Menu */}
					<div className="flex items-center space-x-4">
						{/* Main Navigation (Desktop) */}
						<div className="hidden xl:flex items-center space-x-1">
							{mainNavItems.slice(0, 6).map((item) => {
								const isActive = activeMainSection === item.key;
								const IconComponent = item.icon;
								return (
									<Link key={item.key} href={item.href} passHref>
										<Button onClick={() => recordRecent(item.href)} variant={isActive ? "default" : "ghost"} size="sm" className={`text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" : "hover:text-white hover:bg-muted"}`}>
											<IconComponent className="w-4 h-4 mr-2" />
											{item.text}
										</Button>
									</Link>
								);
							})}

							{/* All Apps Mega Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="text-sm font-medium hover:text-white hover:bg-muted">
										All apps
										<ChevronDown className="w-4 h-4 ml-1" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="z-[90] bg-neutral-950/95 backdrop-blur-md border border-neutral-900 w-[1000px] p-4">
									{/* Search inside mega menu */}
									<div className="mb-3 flex items-center gap-2">
										<div className="relative flex-1">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleSearchKeyDown} onFocus={() => setShowToolbarResults(true)} placeholder="Search apps and pages…" className="pl-9 h-9 bg-background/80" />
										</div>
									</div>
									{debouncedQuery && (
										<div className="mb-4 grid gap-1">
											{filteredResults.length === 0 && <div className="text-sm text-muted-foreground px-1">No results</div>}
											{filteredResults.map((res, idx) => {
												const IconComp = res.icon || BarChart3;
												const pinned = pinnedRoutes.includes(res.href);
												return (
													<Link key={res.href} href={res.href} onClick={() => recordRecent(res.href)} className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 ${activeIndex === idx ? "bg-muted/50" : ""}`}>
														<div className="flex items-center gap-2 truncate">
															<IconComp className="w-4 h-4 text-muted-foreground" />
															<span className="text-sm truncate">{res.text}</span>
														</div>
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7"
															onClick={(e) => {
																e.preventDefault();
																togglePin(res.href);
															}}
														>
															<Star className={`w-4 h-4 ${pinned ? "text-warning fill-yellow-400" : "text-muted-foreground"}`} />
														</Button>
													</Link>
												);
											})}
										</div>
									)}

									{(pinnedRoutes.length > 0 || recentRoutes.length > 0) && (
										<div className="grid grid-cols-2 gap-4 mb-4">
											{pinnedRoutes.length > 0 && (
												<div>
													<p className="text-xs font-semibold text-muted-foreground mb-2">Pinned</p>
													<div className="grid grid-cols-2 gap-2">
														{pinnedRoutes.slice(0, 6).map((href) => {
															const meta = allLinks.find((l) => l.href === href);
															const IconComp = meta?.icon || BarChart3;
															return (
																<Link key={href} href={href} onClick={() => recordRecent(href)} className="flex items-center gap-2 p-2 rounded border border-border/50 hover:bg-muted/40">
																	<IconComp className="w-4 h-4" />
																	<span className="text-sm truncate">{meta?.text || href}</span>
																</Link>
															);
														})}
													</div>
												</div>
											)}
											{recentRoutes.length > 0 && (
												<div>
													<p className="text-xs font-semibold text-muted-foreground mb-2">Recent</p>
													<div className="grid grid-cols-2 gap-2">
														{recentRoutes.slice(0, 6).map((href) => {
															const meta = allLinks.find((l) => l.href === href);
															const IconComp = meta?.icon || BarChart3;
															return (
																<Link key={href} href={href} onClick={() => recordRecent(href)} className="flex items-center gap-2 p-2 rounded border border-border/50 hover:bg-muted/40">
																	<IconComp className="w-4 h-4" />
																	<span className="text-sm truncate">{meta?.text || href}</span>
																</Link>
															);
														})}
													</div>
												</div>
											)}
										</div>
									)}

									<div className="grid grid-cols-3 gap-6">
										{Object.entries(NAV_CATEGORIES).map(([category, keys]) => (
											<div key={`cat-${category}`}>
												<p className="text-xs font-semibold text-muted-foreground mb-2">{category}</p>
												<div className="grid gap-1">
													{uniqueLinks
														.filter((l) => keys.some((k) => l.href.includes(`/dashboard/business/${k.split(":")[0]}`)))
														.slice(0, 8)
														.map((link) => {
															const IconComp = link.icon || BarChart3;
															const pinned = pinnedRoutes.includes(link.href);
															return (
																<Link key={`cat-${category}-${link.href}`} href={link.href} onClick={() => recordRecent(link.href)} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50">
																	<div className="flex items-center gap-2 truncate">
																		<IconComp className="w-4 h-4 text-muted-foreground" />
																		<span className="text-sm truncate">{link.text}</span>
																	</div>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-7 w-7"
																		onClick={(e) => {
																			e.preventDefault();
																			togglePin(link.href);
																		}}
																	>
																		<Star className={`w-4 h-4 ${pinned ? "text-warning fill-yellow-400" : "text-muted-foreground"}`} />
																	</Button>
																</Link>
															);
														})}
												</div>
											</div>
										))}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Compact Navigation (Large screens but not XL) */}
						<div className="hidden lg:flex xl:hidden items-center space-x-1">
							{mainNavItems.slice(0, 4).map((item) => {
								const isActive = activeMainSection === item.key;
								const IconComponent = item.icon;
								return (
									<Link key={item.key} href={item.href} passHref>
										<Button onClick={() => recordRecent(item.href)} variant={isActive ? "default" : "ghost"} size="sm" className={`text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" : "hover:text-white hover:bg-muted"}`}>
											<IconComponent className="w-4 h-4" />
										</Button>
									</Link>
								);
							})}

							{/* More Menu for remaining items */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="text-sm font-medium hover:text-white hover:bg-muted">
										<Plus className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-64 z-[90] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
									{mainNavItems.slice(4).map((item) => {
										const IconComponent = item.icon;
										const isActive = activeMainSection === item.key;
										return (
											<DropdownMenuItem key={item.key} asChild>
												<Link href={item.href} className={`flex items-center space-x-3 p-3 ${isActive ? "bg-primary/10 text-primary" : ""}`}>
													<IconComponent className="w-4 h-4" />
													<div className="flex-1">
														<div className="font-medium">{item.text}</div>
														<div className="text-xs text-muted-foreground">{item.description}</div>
													</div>

													{/* Inline Search */}
													<div className="hidden lg:flex items-center">
														<div className="relative">
															<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
															<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="pl-9 h-9 w-52 focus:w-72 transition-all bg-background/80" />
															{query && (
																<div className="absolute mt-1 w-full max-w-[18rem] bg-neutral-950/95 border border-neutral-900 rounded-md shadow-md z-[95]">
																	<div className="py-1 max-h-72 overflow-auto">
																		{filteredResults.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>}
																		{filteredResults.map((res) => {
																			const IconComp = res.icon || BarChart3;
																			return (
																				<Link
																					key={res.href}
																					href={res.href}
																					onClick={() => {
																						recordRecent(res.href);
																						setQuery("");
																					}}
																					className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50"
																				>
																					<IconComp className="w-4 h-4 text-muted-foreground" />
																					<span className="truncate">{res.text}</span>
																				</Link>
																			);
																		})}
																	</div>
																</div>
															)}
														</div>
													</div>
												</Link>
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					{/* User Controls */}
					<div className="flex items-center space-x-2">
						{/* Notifications */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="relative p-2 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent">
									<Bell className="w-5 h-5" />
									<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary border-2 border-white dark:border-border rounded-full"></span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-80 z-[80] bg-neutral-950/95 backdrop-blur-md border border-neutral-900">
								<div className="flex items-center justify-between p-3 border-b border-border/50">
									<h3 className="font-semibold text-foreground">Directory & Business Updates</h3>
									<Badge variant="secondary" className="text-xs">
										3 new
									</Badge>
								</div>
								<div className="overflow-y-auto max-h-96">
									<DropdownMenuItem className="flex items-start p-4 space-x-3">
										<div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary rounded-full"></div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground">New directory review</p>
											<p className="mt-1 text-xs text-muted-foreground">Customer left a 5-star review on your listing</p>
											<p className="text-xs text-muted-foreground">5 minutes ago</p>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem className="flex items-start p-4 space-x-3">
										<div className="flex-shrink-0 w-2 h-2 mt-2 bg-success rounded-full"></div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground">Field job completed</p>
											<p className="mt-1 text-xs text-muted-foreground">Plumbing service job marked complete</p>
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
										<SunIcon className="w-4 h-4 mr-2 text-warning" />
										Light
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme("dark")}>
										<MoonIcon className="w-4 h-4 mr-2 text-indigo-500" />
										Dark
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme("system")}>
										<DesktopIcon className="w-4 h-4 mr-2 text-slate-500" />
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
							<SheetContent className="bg-card/95 backdrop-blur-md w-80">
								<SheetHeader>
									<SheetTitle>Business Directory Portal</SheetTitle>
								</SheetHeader>

								{/* Mobile Company Switcher - Only show for business dashboards */}
								{config.showCompanySelector && (
								<div className="mt-6 p-4 border-b border-border/50">
									<div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
											<div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-muted/60 border border-border/60">
												<Building2 className="w-5 h-5 text-foreground" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-foreground">{currentCompany.name}</p>
											<p className="text-sm text-muted-foreground">Directory Listing • {currentCompany.subscription}</p>
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
												<div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-muted/60 border border-border/60">
													<Building2 className="w-4 h-4 text-foreground" />
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center space-x-2">
														<span className="font-medium">{company.name}</span>
													{company.subscription === "Pro" && (
														<Badge variant="secondary" className="text-xs">
															Pro
														</Badge>
													)}
													</div>
													<p className="text-xs opacity-80">{company.industry}</p>
												</div>
												{company.id === currentCompanyId && <div className="flex-shrink-0 w-2 h-2 bg-success rounded-full"></div>}
											</button>
										))}

										<Link href="/add-a-business" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-accent transition-colors">
												<div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-muted/60 border border-border/60">
													<Plus className="w-4 h-4 text-foreground" />
											</div>
											<div className="flex-1">
												<span className="font-medium text-foreground">Add New Company</span>
												<p className="text-xs text-muted-foreground">Create or claim a new business</p>
											</div>
										</Link>
									</div>
								</div>
								)}

								{/* Mobile Main Navigation */}
								<nav className="mt-6">
									<ul className="space-y-2">
										{mainNavItems.map((item) => {
											const isActive = activeMainSection === item.key;
											const IconComponent = item.icon;
											return (
												<li key={item.key}>
													<Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
														<Button variant={isActive ? "default" : "ghost"} className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary border border-primary/20" : ""}`}>
															<IconComponent className="w-4 h-4 mr-2" />
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

			{/* Sub-Header Navigation */}
			{currentSubNavItems.length > 0 && (
					<div className="border-t border-neutral-900/50 bg-neutral-950/50 backdrop-blur-sm">
						<div className="px-4 md:px-6">
						{/* Desktop Sub-navigation */}
						<div className="hidden md:flex items-center py-3 space-x-1 overflow-x-auto">
							<div className="flex items-center space-x-1 min-w-0">
								{currentSubNavItems.map((item, index) => {
									const isActiveSubNav = pathname === item.href || pathname.startsWith(item.href + "/");
									return (
										<Link key={index} href={item.href} passHref>
											<Button variant={isActiveSubNav ? "secondary" : "ghost"} size="sm" className={`text-sm whitespace-nowrap transition-colors ${isActiveSubNav ? "bg-muted text-foreground hover:bg-muted/80" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
												{item.text}
											</Button>
										</Link>
									);
								})}
							</div>
						</div>

						{/* Mobile Sub-navigation - Horizontal Scroll */}
						<div className="flex md:hidden py-3 space-x-2 overflow-x-auto scrollbar-hide">
							{currentSubNavItems.map((item, index) => {
								const isActiveSubNav = pathname === item.href || pathname.startsWith(item.href + "/");
								return (
									<Link key={index} href={item.href} passHref>
										<Button variant={isActiveSubNav ? "secondary" : "ghost"} size="sm" className={`text-sm whitespace-nowrap flex-shrink-0 transition-colors ${isActiveSubNav ? "bg-muted text-foreground hover:bg-muted/80" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
											{item.text}
										</Button>
									</Link>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</>
	);
}


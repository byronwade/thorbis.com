"use client"
import {
  ChevronDown,
  GalleryVerticalEnd,
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  Archive,
  Trash2,
  Settings,
  Users2,
  ShoppingCart,
  CreditCard,
  LifeBuoy,
  UserCircle2,
  MessageSquareText,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePathname, useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

// Local types (to avoid cross-file imports)
type Scope = "company" | "personal"
type User = { id: string; name: string; role?: string; online?: boolean }

export function AppSidebar({
  scope = "company",
  onScopeChange = () => {},
  currentUserId = "",
  onCurrentUserChange = () => {},
  users = [],
  unreadCounts,
}: {
  scope?: Scope
  onScopeChange?: (s: Scope) => void
  currentUserId?: string
  onCurrentUserChange?: (id: string) => void
  users?: User[]
  unreadCounts?: { company: number; personal: number }
}) {
  const me = users.find((u) => u.id === currentUserId)
  const pathname = usePathname() || ""
  const router = useRouter()

  return (
    <TooltipProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          {/* Workspace switcher */}
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <GalleryVerticalEnd className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Acme Inc</span>
                      <span className="text-xs">Shared workspace</span>
                    </div>
                    <ChevronDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start">
                  <DropdownMenuItem>Acme Inc</DropdownMenuItem>
                  <DropdownMenuItem>Acme Wholesale</DropdownMenuItem>
                  <DropdownMenuItem>Sandbox</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Quick search */}
          <form className="pt-1">
            <SidebarInput placeholder="Search..." aria-label="Search sidebar" />
          </form>

          {/* Identity selector (view as) */}
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <UserCircle2 />
                    <span>{me ? `Viewing as ${me.name}` : "Choose user"}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                  {users.map((u) => (
                    <DropdownMenuItem key={u.id} onSelect={() => onCurrentUserChange(u.id)}>
                      {u.name} <span className="ml-auto text-xs text-muted-foreground">{u.role ?? ""}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Quick views (compact) */}
          <div className="px-2 pt-1">
            <div className="grid grid-cols-4 gap-1">
              {/* Company Inbox */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname === "/" && scope === "company" ? "secondary" : "outline"}
                    size="sm"
                    className="relative h-8 w-full justify-center"
                    onClick={() => {
                      onScopeChange("company")
                      router.push("/")
                    }}
                    aria-label={`Company Inbox${unreadCounts?.company ? `, ${unreadCounts.company} unread` : ""}`}
                  >
                    <Inbox className="h-4 w-4" />
                    {unreadCounts?.company ? (
                      <span
                        className="absolute -right-1 -top-1 min-w-4 rounded-full bg-emerald-500 px-1 text-[10px] font-medium text-white"
                        aria-hidden
                      >
                        {unreadCounts.company > 99 ? "99+" : unreadCounts.company}
                      </span>
                    ) : null}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  Company Inbox
                </TooltipContent>
              </Tooltip>

              {/* My Inbox */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname === "/" && scope === "personal" ? "secondary" : "outline"}
                    size="sm"
                    className="relative h-8 w-full justify-center"
                    onClick={() => {
                      onScopeChange("personal")
                      router.push("/")
                    }}
                    aria-label={`My Inbox${unreadCounts?.personal ? `, ${unreadCounts.personal} unread` : ""}`}
                  >
                    <Users2 className="h-4 w-4" />
                    {unreadCounts?.personal ? (
                      <span
                        className="absolute -right-1 -top-1 min-w-4 rounded-full bg-emerald-500 px-1 text-[10px] font-medium text-white"
                        aria-hidden
                      >
                        {unreadCounts.personal > 99 ? "99+" : unreadCounts.personal}
                      </span>
                    ) : null}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  My Inbox
                </TooltipContent>
              </Tooltip>

              {/* Conversations */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname.startsWith("/conversations") ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 w-full justify-center"
                    onClick={() => router.push("/conversations")}
                    aria-label="Conversations"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  Conversations
                </TooltipContent>
              </Tooltip>

              {/* Instant Messages */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname.startsWith("/chat") ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 w-full justify-center"
                    onClick={() => router.push("/chat")}
                    aria-label="Instant Messages"
                  >
                    <MessageSquareText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  Instant Messages
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Folders */}
          <SidebarGroup>
            <SidebarGroupLabel>Folders</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Star />
                      <span>Starred</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Clock />
                      <span>Snoozed</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Send />
                      <span>Sent</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <FileText />
                      <span>Drafts</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Archive />
                      <span>Archive</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Trash2 />
                      <span>Trash</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="mx-2 my-1" />

          {/* Labels */}
          <SidebarGroup>
            <SidebarGroupLabel>Labels</SidebarGroupLabel>
            <SidebarGroupAction title="Manage labels">
              <Settings className="h-4 w-4" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <ShoppingCart />
                      <span>Orders</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Users2 />
                      <span>Support</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <CreditCard />
                      <span>Billing</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="mx-2 my-1" />
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <LifeBuoy />
                    <span>Help & Support</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" align="start" side="top">
                  <DropdownMenuItem>Docs</DropdownMenuItem>
                  <DropdownMenuItem>Community</DropdownMenuItem>
                  <DropdownMenuItem>Contact support</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}

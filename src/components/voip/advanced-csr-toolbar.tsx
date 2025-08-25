"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  ChevronLeft,
  Search,
  Mic,
  MicOff,
  Pause,
  FileText,
  Forward,
  Siren,
  Plus,
  CreditCard,
  PhoneOff,
  Users,
  Settings,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  Target,
  Bell,
  Minimize2,
  Monitor,
  ChevronDown,
  Video,
  VideoOff,
  Share,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Menu,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AdvancedCSRToolbarProps {
  callId: string
  caller: {
    name: string
    company: string
    accountId: string
    number: string
  }
  callSeconds: number
  presence: Array<{ id: string; name: string; role: string }>
  onBack: () => void
  onHangup: () => void
  className?: string
}

interface CallState {
  muted: boolean
  hold: boolean
  recording: boolean
  speaker: boolean
  video: boolean
  sharing: boolean
}

interface SystemState {
  notifications: boolean
  focusMode: boolean
  compactView: boolean
  darkMode: boolean
  connectionQuality: "excellent" | "good" | "fair" | "poor"
  batteryLevel: number
  signalStrength: number
}

export function AdvancedCSRToolbar({
  callId,
  caller,
  callSeconds,
  presence,
  onBack,
  onHangup,
  className,
}: AdvancedCSRToolbarProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Call state
  const [callState, setCallState] = useState<CallState>({
    muted: false,
    hold: false,
    recording: false,
    speaker: true,
    video: false,
    sharing: false,
  })

  // System state
  const [systemState, setSystemState] = useState<SystemState>({
    notifications: true,
    focusMode: false,
    compactView: false,
    darkMode: true,
    connectionQuality: "excellent",
    batteryLevel: 85,
    signalStrength: 4,
  })

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "/":
            e.preventDefault()
            searchRef.current?.focus()
            break
          case "m":
            e.preventDefault()
            toggleCallState("muted")
            break
          case "h":
            e.preventDefault()
            toggleCallState("hold")
            break
          case "r":
            e.preventDefault()
            toggleCallState("recording")
            break
          case "f":
            e.preventDefault()
            setSystemState((prev) => ({ ...prev, focusMode: !prev.focusMode }))
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const toggleCallState = (key: keyof CallState) => {
    setCallState((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getConnectionIcon = () => {
    switch (systemState.connectionQuality) {
      case "excellent":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "good":
        return <Wifi className="h-4 w-4 text-blue-500" />
      case "fair":
        return <Wifi className="h-4 w-4 text-yellow-500" />
      case "poor":
        return <WifiOff className="h-4 w-4 text-red-500" />
    }
  }

  const getSignalBars = () => {
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "w-1 bg-current transition-opacity",
          i < systemState.signalStrength ? "opacity-100" : "opacity-30",
        )}
        style={{ height: `${(i + 1) * 3}px` }}
      />
    ))
  }

  return (
    <TooltipProvider>
      <div
        role="toolbar"
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80",
          "flex items-center px-2 py-1.5 md:py-1", // Slightly more padding on mobile
          "shadow-sm transition-all duration-200",
          className,
        )}
      >
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center w-full">
          {/* Left Section: Navigation & Context */}
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onBack} className="h-6 w-6 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to dashboard</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Call Context */}
            <div className="flex items-center text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-1"></div>
              <span className="font-medium">{caller.company}</span>
              <Badge variant="secondary" className="text-xs ml-1 px-1 py-0">
                {caller.accountId}
              </Badge>
              <div className="flex items-center ml-2 text-muted-foreground">
                <Clock className="h-3 w-3 mr-0.5" />
                <span className="font-mono text-xs">{formatDuration(callSeconds)}</span>
              </div>
              {presence.length > 0 && (
                <div className="flex items-center ml-2 text-muted-foreground">
                  <Users className="h-3 w-3 mr-0.5" />
                  <span className="text-xs">+{presence.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Center Section: Search & Quick Actions */}
          <div className="flex-1 mx-2">
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-6 pl-7 pr-12 text-xs bg-background/50"
              />
              <kbd className="absolute right-1 top-1/2 -translate-y-1/2 h-4 px-1 text-xs bg-muted rounded">⌘K</kbd>
            </div>
          </div>

          {/* Right Section: Call Controls & System */}
          <div className="flex items-center">
            {/* Primary Call Controls */}
            <div className="flex items-center border rounded px-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={callState.muted ? "default" : "ghost"}
                    size="sm"
                    onClick={() => toggleCallState("muted")}
                    className="h-5 w-5 p-0"
                  >
                    {callState.muted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{callState.muted ? "Unmute" : "Mute"} (⌘M)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={callState.hold ? "default" : "ghost"}
                    size="sm"
                    onClick={() => toggleCallState("hold")}
                    className="h-5 w-5 p-0"
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{callState.hold ? "Resume" : "Hold"} (⌘H)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={callState.recording ? "default" : "ghost"}
                    size="sm"
                    onClick={() => toggleCallState("recording")}
                    className="h-5 w-5 p-0"
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{callState.recording ? "Stop Recording" : "Start Recording"} (⌘R)</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Advanced Controls Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Settings className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Call Controls</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toggleCallState("video")}>
                  {callState.video ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  {callState.video ? "Stop Video" : "Start Video"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleCallState("sharing")}>
                  {callState.sharing ? <EyeOff className="h-4 w-4" /> : <Share className="h-4 w-4" />}
                  {callState.sharing ? "Stop Sharing" : "Share Screen"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="h-4 w-4" />
                  Transfer Call
                  <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="h-4 w-4" />
                  Add Participant
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>System</DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={systemState.notifications}
                  onCheckedChange={(checked) => setSystemState((prev) => ({ ...prev, notifications: checked }))}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={systemState.focusMode}
                  onCheckedChange={(checked) => setSystemState((prev) => ({ ...prev, focusMode: checked }))}
                >
                  <Target className="h-4 w-4" />
                  Focus Mode
                  <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={systemState.compactView}
                  onCheckedChange={(checked) => setSystemState((prev) => ({ ...prev, compactView: checked }))}
                >
                  <Minimize2 className="h-4 w-4" />
                  Compact View
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Monitor className="h-4 w-4" />
                    Display
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value="auto">
                      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Emergency Actions */}
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    onClick={() => toast({ title: "Escalated to supervisor" })}
                  >
                    <Siren className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Escalate Call</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="sm" onClick={onHangup} className="h-6 px-2 text-xs">
                    <PhoneOff className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline ml-1">End</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>End Call</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex md:hidden items-center justify-between w-full">
          {/* Left: Back button and basic call info */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-7 w-7 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="ml-2 flex items-center text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-1"></div>
              <span className="font-medium truncate max-w-[120px]">{caller.company}</span>
              <div className="flex items-center ml-2 text-muted-foreground">
                <Clock className="h-3 w-3 mr-0.5" />
                <span className="font-mono text-xs">{formatDuration(callSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Right: All controls in dropdown + end call */}
          <div className="flex items-center">
            {/* All Controls Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Call Controls</DropdownMenuLabel>

                {/* Primary call controls */}
                <DropdownMenuItem onClick={() => toggleCallState("muted")}>
                  {callState.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {callState.muted ? "Unmute" : "Mute"}
                  <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => toggleCallState("hold")}>
                  <Pause className="h-4 w-4" />
                  {callState.hold ? "Resume" : "Hold"}
                  <DropdownMenuShortcut>⌘H</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => toggleCallState("recording")}>
                  <FileText className="h-4 w-4" />
                  {callState.recording ? "Stop Recording" : "Start Recording"}
                  <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Advanced controls */}
                <DropdownMenuItem onClick={() => toggleCallState("video")}>
                  {callState.video ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  {callState.video ? "Stop Video" : "Start Video"}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => toggleCallState("sharing")}>
                  {callState.sharing ? <EyeOff className="h-4 w-4" /> : <Share className="h-4 w-4" />}
                  {callState.sharing ? "Stop Sharing" : "Share Screen"}
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Forward className="h-4 w-4" />
                  Transfer Call
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Users className="h-4 w-4" />
                  Add Participant
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Quick actions */}
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4" />
                  Send SMS
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Mail className="h-4 w-4" />
                  Send Email
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Calendar className="h-4 w-4" />
                  Schedule Follow-up
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Plus className="h-4 w-4" />
                  Create Ticket
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <CreditCard className="h-4 w-4" />
                  Take Payment
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Emergency actions */}
                <DropdownMenuItem
                  className="text-amber-600"
                  onClick={() => toast({ title: "Escalated to supervisor" })}
                >
                  <Siren className="h-4 w-4" />
                  Escalate Call
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* System settings */}
                <DropdownMenuLabel>Settings</DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                  checked={systemState.notifications}
                  onCheckedChange={(checked) => setSystemState((prev) => ({ ...prev, notifications: checked }))}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={systemState.focusMode}
                  onCheckedChange={(checked) => setSystemState((prev) => ({ ...prev, focusMode: checked }))}
                >
                  <Target className="h-4 w-4" />
                  Focus Mode
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* End Call Button - Always visible */}
            <Button variant="destructive" size="sm" onClick={onHangup} className="h-7 px-2 ml-1">
              <PhoneOff className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Focus Mode Overlay */}
      {systemState.focusMode && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 pointer-events-none">
          <div className="absolute top-4 right-4 pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSystemState((prev) => ({ ...prev, focusMode: false }))}
            >
              <Eye className="h-4 w-4 mr-1" />
              Exit Focus
            </Button>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}

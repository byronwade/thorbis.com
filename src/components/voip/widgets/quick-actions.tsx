"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  AlertTriangle,
  UserPlus,
  Clock,
  Copy,
  Send,
  RefreshCw,
} from "lucide-react"

export default function QuickActions() {
  const quickActions = [
    {
      id: "callback",
      label: "Schedule Callback",
      icon: <Phone className="h-4 w-4" />,
      color: "bg-blue-600 hover:bg-blue-700",
      shortcut: "Ctrl+B",
      tooltip: "Schedule a callback appointment for the customer at a convenient time",
    },
    {
      id: "email",
      label: "Send Email",
      icon: <Mail className="h-4 w-4" />,
      color: "bg-green-600 hover:bg-green-700",
      shortcut: "Ctrl+E",
      tooltip: "Send an email to the customer with service details or follow-up information",
    },
    {
      id: "sms",
      label: "Send SMS",
      icon: <MessageSquare className="h-4 w-4" />,
      color: "bg-purple-600 hover:bg-purple-700",
      shortcut: "Ctrl+S",
      tooltip: "Send a text message to the customer for quick updates or confirmations",
    },
    {
      id: "appointment",
      label: "Book Service",
      icon: <Calendar className="h-4 w-4" />,
      color: "bg-amber-600 hover:bg-amber-700",
      shortcut: "Ctrl+A",
      tooltip: "Schedule a service appointment with available technicians",
    },
    {
      id: "escalate",
      label: "Escalate",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "bg-red-600 hover:bg-red-700",
      shortcut: "Ctrl+X",
      tooltip: "Escalate this call to a supervisor or specialist for complex issues",
    },
    {
      id: "followup",
      label: "Follow-up",
      icon: <Clock className="h-4 w-4" />,
      color: "bg-indigo-600 hover:bg-indigo-700",
      shortcut: "Ctrl+F",
      tooltip: "Create a follow-up task to check on the customer after service completion",
    },
  ]

  const macros = [
    {
      id: "greeting",
      label: "Standard Greeting",
      text: "Thank you for calling! How can I help you today?",
      tooltip: "Professional greeting to start customer interactions",
    },
    {
      id: "hold",
      label: "Hold Message",
      text: "I need to check on that for you. Can you hold for just a moment?",
      tooltip: "Polite way to put customer on hold while researching their issue",
    },
    {
      id: "callback",
      label: "Callback Promise",
      text: "I will have someone call you back within 24 hours to resolve this.",
      tooltip: "Promise callback when issue requires additional time or expertise",
    },
    {
      id: "closing",
      label: "Call Closing",
      text: "Is there anything else I can help you with today?",
      tooltip: "Professional way to conclude the call and ensure customer satisfaction",
    },
  ]

  const systemActions = [
    {
      id: "refresh",
      label: "Refresh",
      icon: <RefreshCw className="h-3 w-3 mr-1" />,
      tooltip: "Refresh customer data and system information",
    },
    {
      id: "newlead",
      label: "New Lead",
      icon: <UserPlus className="h-3 w-3 mr-1" />,
      tooltip: "Create a new lead record for potential customer",
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: <Send className="h-3 w-3 mr-1" />,
      tooltip: "Transfer the call to another department or specialist",
    },
  ]

  const handleAction = (actionId: string) => {
    console.log(`Executing action: ${actionId}`)
    // Implement action logic here
  }

  const handleMacro = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could also auto-paste into active input field
  }

  return (
    <TooltipProvider>
      <div className="h-full p-2 space-y-3">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleAction(action.id)}
                  className={`${action.color} text-white h-12 flex flex-col items-center justify-center gap-1 relative group`}
                  size="sm"
                >
                  {action.icon}
                  <span className="text-xs font-medium">{action.label}</span>
                  <Badge className="absolute -top-1 -right-1 bg-neutral-800 text-neutral-300 text-xs px-1 py-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.shortcut}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p>{action.tooltip}</p>
                  <p className="text-xs text-neutral-400 mt-1">Shortcut: {action.shortcut}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Text Macros */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-neutral-200 flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Text Macros
          </div>

          <div className="space-y-1">
            {macros.map((macro) => (
              <Tooltip key={macro.id}>
                <TooltipTrigger asChild>
                  <div
                    className="p-2 rounded-md bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-800 transition-colors group cursor-pointer"
                    onClick={() => handleMacro(macro.text)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-200">{macro.label}</span>
                      <Copy className="h-3 w-3 text-neutral-500 group-hover:text-blue-400" />
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2">{macro.text}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <p>{macro.tooltip}</p>
                    <p className="text-xs text-neutral-400 mt-1">Click to copy to clipboard</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* System Actions */}
        <div className="grid grid-cols-3 gap-1">
          {systemActions.map((action) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 h-8 text-xs bg-transparent"
                  onClick={() => handleAction(action.id)}
                >
                  {action.icon}
                  {action.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

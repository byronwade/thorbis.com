"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from "@/components/ui/resizable"
import {
  Archive,
  ChevronDown,
  Forward,
  Mail,
  Reply,
  ReplyAll,
  Search,
  Star,
  Trash2,
  UserPlus,
  Loader2,
  Wrench,
  UserCheck,
  MoreHorizontal,
  RefreshCw,
  MessageSquare,
  Settings,
  Plus,
  Phone,
  Users,
  Calendar as CalendarIcon,
  Send,
  Tag,
  AlertTriangle,
  FileText,
  Bell,
  Filter
} from "lucide-react"

// Types for the email client
type User = { 
  id: string; 
  name: string; 
  role?: string; 
  online?: boolean; 
  color?: string 
}

type MailItem = {
  id: string
  fromName: string
  fromEmail: string
  subject: string
  preview: string
  date: string
  labels: string[]
  unread?: boolean
  starred?: boolean
  assignedTo?: string | null
  viewers?: string[]
  workOrderId?: string
  customerId?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  type?: 'email' | 'sms' | 'call' | 'voicemail'
}

const USERS: User[] = [
  { id: "u1", name: "Alex Rivera", role: "Support", online: true, color: "bg-emerald-500" },
  { id: "u2", name: "Bri Chen", role: "Ops", online: true, color: "bg-sky-500" },
  { id: "u3", name: "Casey Green", role: "Success", online: true, color: "bg-orange-500" },
  { id: "u4", name: "Dee Patel", role: "Billing", online: true, color: "bg-fuchsia-500" },
  { id: "u5", name: "Evan Stone", role: "Support", online: true, color: "bg-rose-500" },
  { id: "u6", name: "Finn Ortiz", role: "Support", online: true, color: "bg-amber-500" },
]

// Email data generator
const generateEmails = (count: number): MailItem[] => {
  const subjects = [
    "Service Appointment Confirmation",
    "Invoice Payment Reminder", 
    "Estimate Request Follow-up",
    "Customer Satisfaction Survey",
    "Emergency Service Call",
    "Maintenance Reminder",
    "Quote Approval Needed",
    "Work Order Completion",
    "Schedule Change Request",
    "Payment Received Confirmation"
  ]
  
  const customers = [
    "John Smith", "Sarah Johnson", "Mike Wilson", "Emily Davis", "Robert Brown",
    "Lisa Garcia", "David Miller", "Jennifer Martinez", "Christopher Lee", "Amanda Taylor"
  ]
  
  const domains = ["gmail.com", "outlook.com", "yahoo.com", "company.com", "business.net"]
  
  return Array.from({ length: count }, (_, i) => {
    const customer = customers[i % customers.length]
    const subject = subjects[i % subjects.length]
    const domain = domains[i % domains.length]
    const email = '${customer.toLowerCase().replace(' ', '.')}@${domain}`
    
    return {
      id: `mail-${i + 1}`,
      fromName: customer,
      fromEmail: email,
      subject: subject,
      preview: `Hi, I hope this email finds you well. I wanted to reach out regarding ${subject.toLowerCase()}. Please let me know if you have any questions.`,
      date: new Date(Date.now() - (i * 3600000)).toISOString(),
      labels: i % 3 === 0 ? ["customer"] : i % 4 === 0 ? ["urgent"] : ["general"],
      unread: i % 3 === 0,
      starred: i % 5 === 0,
      assignedTo: i % 4 === 0 ? USERS[i % USERS.length].id : null,
      viewers: [],
      workOrderId: i % 6 === 0 ? `WO-${i + 1000}' : undefined,
      customerId: 'CUST-${(i % 20) + 1}',
      priority: i % 10 === 0 ? 'urgent' : i % 7 === 0 ? 'high' : i % 5 === 0 ? 'low' : 'medium',
      type: i % 8 === 0 ? 'sms' : i % 12 === 0 ? 'call' : 'email'
    }
  })
}

// Email sidebar navigation
function EmailSidebar() {
  const [selectedFolder, setSelectedFolder] = useState("inbox")
  
  const folders = [
    { id: "inbox", name: "Inbox", icon: Mail, count: 28 },
    { id: "starred", name: "Starred", icon: Star, count: 3 },
    { id: "sent", name: "Sent", icon: Send, count: 0 },
    { id: "drafts", name: "Drafts", icon: FileText, count: 1 },
    { id: "archive", name: "Archive", icon: Archive, count: 0 },
    { id: "trash", name: "Trash", icon: Trash2, count: 0 },
  ]
  
  const labels = [
    { id: "customers", name: "Customers", color: "bg-blue-500", count: 12 },
    { id: "urgent", name: "Urgent", color: "bg-red-500", count: 3 },
    { id: "work-orders", name: "Work Orders", color: "bg-green-500", count: 8 },
    { id: "billing", name: "Billing", color: "bg-yellow-500", count: 5 },
    { id: "scheduling", name: "Scheduling", color: "bg-purple-500", count: 7 },
  ]
  
  return (
    <div className="w-60 border-r border-neutral-800 bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold text-neutral-100">Communications</h2>
        </div>
        <p className="text-xs text-neutral-400 mt-1">Unified messaging center</p>
      </div>
      
      {/* Compose Button */}
      <div className="p-4">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>
      
      {/* Folders */}
      <div className="px-4">
        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Folders</h3>
        <div className="space-y-1">
          {folders.map((folder) => {
            const Icon = folder.icon
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                  selectedFolder === folder.id
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-neutral-300 hover:bg-neutral-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <Badge variant="secondary" className="bg-neutral-700 text-neutral-300 text-xs">
                    {folder.count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Labels */}
      <div className="px-4 mt-6">
        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Labels</h3>
        <div className="space-y-1">
          {labels.map((label) => (
            <button
              key={label.id}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", label.color)} />
                <span>{label.name}</span>
              </div>
              <Badge variant="secondary" className="bg-neutral-700 text-neutral-300 text-xs">
                {label.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Quick Actions</h3>
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-neutral-300">
            <Phone className="h-4 w-4 mr-2" />
            New Call
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-neutral-300">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send SMS
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-neutral-300">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>
    </div>
  )
}

// Email list component
function EmailList({ emails, selectedEmail, onSelectEmail }: {
  emails: MailItem[]
  selectedEmail: string | null
  onSelectEmail: (id: string) => void
}) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(emails.map(e => e.id))
    }
    setSelectAll(!selectAll)
  }
  
  const handleSelectEmail = (emailId: string) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId))
    } else {
      setSelectedEmails([...selectedEmails, emailId])
    }
  }
  
  return (
    <div className="flex-1 flex flex-col bg-neutral-950">
      {/* Toolbar */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              className="border-neutral-600"
            />
            <Button variant="ghost" size="sm" className="text-neutral-400">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-400">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-400">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-neutral-400">
                  <Tag className="h-4 w-4 mr-1" />
                  Labels
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Customer</DropdownMenuItem>
                <DropdownMenuItem>Urgent</DropdownMenuItem>
                <DropdownMenuItem>Work Order</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-neutral-400">
              <Filter className="h-4 w-4" />
            </Button>
            <span className="text-sm text-neutral-400">
              {emails.length} conversations
            </span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input 
            placeholder="Search conversations..."
            className="pl-10 bg-neutral-900 border-neutral-700 text-neutral-100"
          />
        </div>
      </div>
      
      {/* Email List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-neutral-800">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => onSelectEmail(email.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-neutral-900",
                selectedEmail === email.id && "bg-neutral-900 border-r-2 border-blue-500",
                email.unread && "bg-neutral-925"
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={selectedEmails.includes(email.id)}
                  onCheckedChange={() => handleSelectEmail(email.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="border-neutral-600 mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "font-medium truncate",
                      email.unread ? "text-neutral-100" : "text-neutral-300"
                    )}>
                      {email.fromName}
                    </span>
                    {email.priority === 'urgent' && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    {email.workOrderId && (
                      <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                        {email.workOrderId}
                      </Badge>
                    )}
                    <div className="ml-auto text-xs text-neutral-500">
                      {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "text-sm mb-1 truncate",
                    email.unread ? "text-neutral-200" : "text-neutral-400"
                  )}>
                    {email.subject}
                  </div>
                  
                  <div className="text-sm text-neutral-500 truncate">
                    {email.preview}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {email.labels.map((label) => (
                      <Badge key={label} variant="secondary" className="text-xs bg-neutral-800 text-neutral-400">
                        {label}
                      </Badge>
                    ))}
                    {email.starred && (
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    )}
                    {email.assignedTo && (
                      <div className="ml-auto flex items-center gap-1">
                        <Users className="h-3 w-3 text-neutral-500" />
                        <span className="text-xs text-neutral-500">
                          {USERS.find(u => u.id === email.assignedTo)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// Email reader component
function EmailReader({ email }: { email: MailItem | null }) {
  if (!email) {
    return (
      <div className="flex-1 bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <Mail className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-400 mb-2">No message selected</h3>
          <p className="text-neutral-500">Choose a message from the list to read</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 bg-neutral-950 flex flex-col">
      {/* Email Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-neutral-100 mb-2">{email.subject}</h1>
            <div className="flex items-center gap-4 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {email.fromName.split(' ').map(n => n[0]).join(')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-neutral-300">{email.fromName}</div>
                  <div className="text-neutral-500">{email.fromEmail}</div>
                </div>
              </div>
              <div className="text-neutral-500">
                {new Date(email.date).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-neutral-400">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-400">
              <Reply className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-400">
              <Forward className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-400">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {email.workOrderId && (
            <Button variant="outline" size="sm" className="border-green-600 text-green-400">
              <Wrench className="h-4 w-4 mr-2" />
              View Work Order {email.workOrderId}
            </Button>
          )}
          <Button variant="outline" size="sm" className="border-blue-600 text-blue-400">
            <UserCheck className="h-4 w-4 mr-2" />
            View Customer
          </Button>
          <Button variant="outline" size="sm" className="border-purple-600 text-purple-400">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule Service
          </Button>
          {email.type === 'email' && (
            <Button variant="outline" size="sm" className="border-orange-600 text-orange-400">
              <Wrench className="h-4 w-4 mr-2" />
              Convert to Work Order
            </Button>
          )}
        </div>
      </div>
      
      {/* Email Content */}
      <div className="flex-1 p-6">
        <div className="prose prose-invert max-w-none">
          <p className="text-neutral-300 leading-relaxed">
            {email.preview}
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            Thank you for reaching out to us. We appreciate your business and want to ensure 
            you receive the best possible service. Our team will review your request and 
            respond within 24 hours.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            If this is an emergency, please call our 24/7 emergency line at (555) 123-4567.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            Best regards,<br />
            The Service Team
          </p>
        </div>
      </div>
      
      {/* Reply Box */}
      <div className="p-6 border-t border-neutral-800">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" className="border-neutral-700 text-neutral-300">
              <ReplyAll className="h-4 w-4 mr-2" />
              Reply All
            </Button>
            <Button variant="outline" className="border-neutral-700 text-neutral-300">
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Communications page component - no layout management, just content
export default function CommunicationsPage() {
  const [emails, setEmails] = useState<MailItem[]>([])
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Generate sample emails
    const sampleEmails = generateEmails(50)
    setEmails(sampleEmails)
    setLoading(false)
  }, [])
  
  const currentEmail = emails.find(e => e.id === selectedEmail) || null
  
  if (loading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
          <span className="text-neutral-400">Loading communications...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen bg-neutral-950 flex">
      {/* Email Sidebar */}
      <EmailSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="flex flex-1">
          <ResizablePanel defaultSize={40} minSize={30}>
            <EmailList 
              emails={emails}
              selectedEmail={selectedEmail}
              onSelectEmail={setSelectedEmail}
            />
          </ResizablePanel>
          <ResizableHandle className="w-px bg-neutral-800 hover:w-[2px] hover:bg-blue-500 transition-all" />
          <ResizablePanel defaultSize={60} minSize={40}>
            <EmailReader email={currentEmail} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
"use client"

import * as React from "react"
import { useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { 
  Mail, 
  MessageSquare, 
  Search, 
  Star, 
  Circle, 
  Archive, 
  Trash2, 
  Inbox,
  Send,
  FileText,
  Tag,
  Check,
  ArrowLeft,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip,
  Calendar,
  Clock,
  User,
  Mail as MailIcon,
  Save,
  ChevronDown,
  Smile
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data
const USERS = [
  { id: "u1", name: "Alex Rivera", role: "Support", online: true, color: "bg-emerald-500" },
  { id: "u2", name: "Bri Chen", role: "Ops", online: true, color: "bg-sky-500" },
  { id: "u3", name: "Casey Green", role: "Success", online: true, color: "bg-orange-500" },
  { id: "u4", name: "Dee Patel", role: "Billing", online: true, color: "bg-fuchsia-500" },
  { id: "u5", name: "Evan Stone", role: "Support", online: true, color: "bg-rose-500" },
]

const MAILS = [
  {
    id: "1",
    fromName: "Sarah Johnson",
    fromEmail: "sarah@acme.com",
    subject: "HVAC Maintenance Request",
    preview: "Hi there, I need to schedule maintenance for our HVAC system. Could you please let me know your available time slots for this week?",
    date: "2 hours ago",
    labels: ["Support", "HVAC"],
    unread: true,
    starred: false,
    assignedTo: null,
    viewers: ["u1", "u3"],
    body: `Hi there,

I hope this email finds you well. I'm reaching out regarding our HVAC system maintenance.

We've noticed some unusual sounds coming from our main HVAC unit and would like to schedule a maintenance appointment as soon as possible. Could you please let me know your available time slots for this week?

Some details about our system:
- Location: Main office building
- Unit type: Commercial HVAC system
- Last maintenance: 6 months ago

Please let me know what times work best for your team.

Best regards,
Sarah Johnson
Facilities Manager
ACME Corporation`
  },
  {
    id: "2",
    fromName: "Mike Chen",
    fromEmail: "mike@techcorp.com",
    subject: "Billing Inquiry - Invoice #12345",
    preview: "I have a question about the recent invoice. There seems to be a discrepancy in the charges. Can you please review and get back to me?",
    date: "4 hours ago",
    labels: ["Billing"],
    unread: true,
    starred: true,
    assignedTo: "u4",
    viewers: ["u4"],
    body: `Hello,

I hope you're having a great day. I'm writing regarding Invoice #12345 that we received last week.

Upon reviewing the invoice, I noticed there appears to be a discrepancy in the charges. Specifically, I believe there may be an error in the calculation of the service fees.

Could you please review the invoice and get back to me with clarification? I've attached a copy of the invoice for your reference.

Thank you for your attention to this matter.

Best regards,
Mike Chen
Finance Department
TechCorp Inc.`
  },
  {
    id: "3",
    fromName: "Lisa Rodriguez",
    fromEmail: "lisa@startup.io",
    subject: "New Service Quote Request",
    preview: "We're looking to upgrade our office systems and would like a quote for your services. What packages do you offer?",
    date: "1 day ago",
    labels: ["Lead", "Marketing"],
    unread: false,
    starred: false,
    assignedTo: "u2",
    viewers: ["u2"],
    body: `Hi there,

We're a growing startup and looking to upgrade our office systems. I came across your company and was impressed by your services.

We're specifically interested in:
- HVAC system installation
- Regular maintenance packages
- Emergency repair services

Could you please provide us with a detailed quote for your services? We'd also like to know what packages you offer and any special rates for new customers.

Our office is approximately 5,000 sq ft and we have about 25 employees.

Looking forward to hearing from you.

Best regards,
Lisa Rodriguez
Operations Manager
Startup.io`
  },
  {
    id: "4",
    fromName: "David Kim",
    fromEmail: "david@enterprise.com",
    subject: "Emergency Plumbing Issue",
    preview: "We have a major plumbing emergency in our building. Need immediate assistance. Please call as soon as possible.",
    date: "2 days ago",
    labels: ["Support", "Plumbing", "Priority"],
    unread: false,
    starred: true,
    assignedTo: "u1",
    viewers: ["u1"],
    body: `URGENT - Emergency Plumbing Issue

We have a major plumbing emergency in our building that requires immediate attention.

The issue:
- Water leak in the main lobby
- Ceiling tiles are falling
- Water is spreading to adjacent offices

This is affecting our daily operations and we need immediate assistance. Please call us as soon as possible at (555) 123-4567.

We're located at 123 Business Ave, Downtown.

Thank you for your urgent attention to this matter.

David Kim
Facilities Director
Enterprise Corp`
  },
  {
    id: "5",
    fromName: "Emma Wilson",
    fromEmail: "emma@retail.com",
    subject: "Follow-up on Previous Service",
    preview: "Just wanted to follow up on the service you provided last week. Everything is working great, thank you!",
    date: "3 days ago",
    labels: ["Follow-up"],
    unread: false,
    starred: false,
    assignedTo: null,
    viewers: ["u3"],
    body: `Hi there,

I just wanted to follow up on the excellent service you provided last week. Everything is working great and we couldn't be happier with the results.

The team was professional, efficient, and cleaned up after themselves perfectly. The new system is running smoothly and we've already noticed an improvement in our energy efficiency.

Thank you for your outstanding work and we'll definitely be using your services again in the future.

Best regards,
Emma Wilson
Store Manager
Retail Solutions Inc.`
  }
]

export default function EmailClient() {
  const [scope, setScope] = useState("company")
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState("list") // "list" or "reader"
  const [query, setQuery] = useState("")
  const [labelFilter, setLabelFilter] = useState(null)
  const [density, setDensity] = useState("compact")
  const [activeFolder, setActiveFolder] = useState("inbox")
  const [composerMode, setComposerMode] = useState(null) // null, "reply", or "forward"
  const [replyTo, setReplyTo] = useState("")
  const [replySubject, setReplySubject] = useState("")
  const [replyMessage, setReplyMessage] = useState("")

  const searchRef = useRef(null)

  // Filter emails based on current filters
  const filtered = useMemo(() => {
    let result = MAILS

    // Filter by scope (company vs personal)
    if (scope === "personal") {
      result = result.filter(mail => mail.assignedTo === "u1") // Current user
    }

    // Filter by folder
    if (activeFolder === "sent") {
      result = result.filter(mail => mail.fromEmail.includes("company.com"))
    } else if (activeFolder === "drafts") {
      result = result.filter(mail => mail.subject.includes("Draft"))
    } else if (activeFolder === "archive") {
      result = result.filter(mail => mail.labels.includes("Archive"))
    } else if (activeFolder === "trash") {
      result = result.filter(mail => mail.labels.includes("Trash"))
    }

    // Filter by search query
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(mail => 
        mail.subject.toLowerCase().includes(q) ||
        mail.fromName.toLowerCase().includes(q) ||
        mail.fromEmail.toLowerCase().includes(q) ||
        mail.preview.toLowerCase().includes(q)
      )
    }

    // Filter by label
    if (labelFilter) {
      result = result.filter(mail => mail.labels.includes(labelFilter))
    }

    return result
  }, [scope, activeFolder, query, labelFilter])

  const companyUnread = MAILS.filter(m => !m.assignedTo && m.unread).length
  const personalUnread = MAILS.filter(m => m.assignedTo === "u1" && m.unread).length

  const handleEmailClick = (mail) => {
    setSelected(mail)
    setView("reader")
  }

  const handleBackToList = () => {
    setView("list")
    setSelected(null)
    setComposerMode(null)
  }

  const handleReply = () => {
    setComposerMode("reply")
    setReplyTo(selected?.fromEmail || "")
    setReplySubject(`Re: ${selected?.subject || ""}`)
    setReplyMessage("")
  }

  const handleForward = () => {
    setComposerMode("forward")
    setReplyTo("")
    setReplySubject(`Fwd: ${selected?.subject || ""}`)
    setReplyMessage("")
  }

  const handleCancelCompose = () => {
    setComposerMode(null)
    setReplyTo("")
    setReplySubject("")
    setReplyMessage("")
  }

  const handleSendReply = () => {
    // Handle sending the reply/forward
    console.log("Sending:", { mode: composerMode, to: replyTo, subject: replySubject, message: replyMessage })
    handleCancelCompose()
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
      {/* Email Sidebar */}
      <div className="w-64 border-r bg-background flex flex-col min-h-0">
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Mail className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Email</span>
              <span className="truncate text-xs text-muted-foreground">Communication Center</span>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 min-h-0">
          {/* Compose Button */}
          <div className="p-2">
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/dashboard/business/communication/compose'}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>

          {/* Inbox Switcher */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Inbox
            </div>
            <Button
              variant={scope === "company" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setScope("company")}
            >
              <Inbox className="size-4 mr-2" />
              <span>Company Inbox</span>
              {companyUnread > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {companyUnread}
                </Badge>
              )}
            </Button>
            <Button
              variant={scope === "personal" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setScope("personal")}
            >
              <Mail className="size-4 mr-2" />
              <span>My Inbox</span>
              {personalUnread > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {personalUnread}
                </Badge>
              )}
            </Button>
          </div>

          {/* Folders */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Folders
            </div>
            <Button
              variant={activeFolder === "inbox" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveFolder("inbox")}
            >
              <Inbox className="size-4 mr-2" />
              <span>Inbox</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {filtered.length}
              </Badge>
            </Button>
            <Button
              variant={activeFolder === "sent" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveFolder("sent")}
            >
              <Send className="size-4 mr-2" />
              <span>Sent</span>
            </Button>
            <Button
              variant={activeFolder === "drafts" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveFolder("drafts")}
            >
              <FileText className="size-4 mr-2" />
              <span>Drafts</span>
            </Button>
            <Button
              variant={activeFolder === "archive" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveFolder("archive")}
            >
              <Archive className="size-4 mr-2" />
              <span>Archive</span>
            </Button>
            <Button
              variant={activeFolder === "trash" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setActiveFolder("trash")}
            >
              <Trash2 className="size-4 mr-2" />
              <span>Trash</span>
            </Button>
          </div>

          {/* Labels */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Labels
            </div>
            {["Support", "Billing", "Lead", "Marketing", "Priority", "HVAC", "Plumbing", "Follow-up"].map((label) => (
              <Button
                key={label}
                variant={labelFilter === label ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setLabelFilter(labelFilter === label ? null : label)}
              >
                <Tag className="size-4 mr-2" />
                <span>{label}</span>
                {labelFilter === label && <Check className="size-4 ml-auto" />}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {view === "list" ? (
          <>
            {/* List View Toolbar */}
            <div className="flex-shrink-0 flex w-full items-center gap-2 border-b bg-background p-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="text-sm font-semibold">
                  {scope === "company" ? "Company Inbox" : "My Inbox"} - {activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)}
                </div>
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {filtered.length} messages
                </Badge>
              </div>
              <div className="relative flex min-w-0 items-center">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  className="h-9 w-[260px] pl-8"
                  placeholder="Search emails"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Compact Email List */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-1">
                  {filtered.map((mail) => {
                    const isSelected = selected?.id === mail.id

                    return (
                      <div
                        key={mail.id}
                        className={cn(
                          "relative block w-full border-b border-border/50 text-left text-sm transition-colors hover:bg-muted/30",
                          isSelected ? "bg-primary/5 border-primary/20" : "",
                          mail.unread ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        )}
                      >
                        <button
                          onClick={() => handleEmailClick(mail)}
                          className="w-full text-left p-3 transition-colors"
                          aria-label={mail.unread ? "Unread email" : undefined}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="text-xs bg-muted">
                                {getInitials(mail.fromName)}
                              </AvatarFallback>
                            </Avatar>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Header Row */}
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={cn(
                                    "truncate text-sm",
                                    mail.unread ? "font-semibold text-foreground" : "font-medium text-foreground"
                                  )}>
                                    {mail.fromName}
                                  </span>
                                  {mail.starred && (
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                  )}
                                  {mail.unread && (
                                    <Circle className="h-3 w-3 fill-blue-500 text-blue-500 flex-shrink-0" />
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                  {mail.date}
                                </span>
                              </div>

                              {/* Subject */}
                              <div className="mb-1">
                                <span className={cn(
                                  "text-sm",
                                  mail.unread ? "font-semibold text-foreground" : "font-medium text-foreground"
                                )}>
                                  {mail.subject}
                                </span>
                              </div>

                              {/* Preview */}
                              <div className="mb-2">
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {mail.preview}
                                </span>
                              </div>

                              {/* Labels */}
                              {mail.labels.length > 0 && (
                                <div className="flex gap-1">
                                  {mail.labels.slice(0, 2).map((label) => (
                                    <Badge key={label} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                      {label}
                                    </Badge>
                                  ))}
                                  {mail.labels.length > 2 && (
                                    <span className="text-[10px] text-muted-foreground">+{mail.labels.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    )
                  })}
                  {filtered.length === 0 && (
                    <div className="p-8 text-center">
                      <MailIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No emails found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <>
            {/* Reader View Toolbar */}
            <div className="flex-shrink-0 flex w-full items-center gap-2 border-b bg-background p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
              
              <div className="flex-1" />
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" title="Reply" onClick={handleReply}>
                  <Reply className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Forward" onClick={handleForward}>
                  <Forward className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Archive">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      {selected?.starred ? "Remove star" : "Add star"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Tag className="h-4 w-4 mr-2" />
                      Add label
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Paperclip className="h-4 w-4 mr-2" />
                      Download attachments
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Email Reader */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Email Content */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full w-full">
                  <div className="p-6 max-w-4xl mx-auto">
                    {selected && (
                      <Card>
                        <CardHeader className="pb-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="text-lg">
                                {getInitials(selected.fromName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg mb-2">{selected.subject}</CardTitle>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{selected.fromName}</span>
                                  <span className="text-muted-foreground">&lt;{selected.fromEmail}&gt;</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{selected.date}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selected.starred && (
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              )}
                              {selected.unread && (
                                <Circle className="h-5 w-5 fill-blue-500 text-blue-500" />
                              )}
                            </div>
                          </div>
                          
                          {/* Labels */}
                          {selected.labels.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {selected.labels.map((label) => (
                                <Badge key={label} variant="secondary">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardHeader>
                        
                        <Separator />
                        
                        <CardContent className="pt-6">
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                              {selected.body}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Reply/Forward Composer - Only show when composerMode is set */}
              {composerMode && (
                <div className="flex-shrink-0 border-t bg-background">
                  <div className="p-4 max-w-4xl mx-auto">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {composerMode === "reply" ? "Reply" : "Forward"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Smile className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancelCompose}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* To Field */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">To:</label>
                            <Input 
                              placeholder="recipient@example.com" 
                              value={replyTo}
                              onChange={(e) => setReplyTo(e.target.value)}
                              className="w-full"
                            />
                          </div>

                          {/* Subject Field */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">Subject:</label>
                            <Input 
                              placeholder="Subject" 
                              value={replySubject}
                              onChange={(e) => setReplySubject(e.target.value)}
                              className="w-full"
                            />
                          </div>

                          {/* Message Body */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">Message:</label>
                            <textarea
                              placeholder={`Type your ${composerMode === "reply" ? "reply" : "forward message"} here...`}
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              className="w-full min-h-[200px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              rows={8}
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Paperclip className="h-4 w-4 mr-2" />
                                Attach Files
                              </Button>
                              <Button variant="outline" size="sm">
                                <Save className="h-4 w-4 mr-2" />
                                Save Draft
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancelCompose}>
                                Cancel
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Send +
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={handleSendReply}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Schedule Send
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Send & Archive
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button size="sm" onClick={handleSendReply}>
                                <Send className="h-4 w-4 mr-2" />
                                Send
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

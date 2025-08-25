"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { ScrollArea } from "@components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Sheet, SheetContent } from "@components/ui/sheet"
import { cn } from "@lib/utils"
import {
  Mail,
  Phone,
  Building,
  DollarSign,
  FileText,
  MessageSquare,
  ExternalLink,
  Edit,
  Plus,
  TrendingUp,
  Users,
  Briefcase,
  Star,
} from "lucide-react"
import type { Customer } from "@lib/unified/customers"

function getInitials(name: string) {
  const parts = name.split(" ")
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
    case "accepted":
    case "closed":
    case "completed":
      return "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20"
    case "sent":
    case "active":
    case "open":
      return "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20"
    case "overdue":
    case "declined":
    case "cancelled":
      return "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
    case "draft":
    case "pending":
    case "on-hold":
      return "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20"
    case "expired":
      return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
    default:
      return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
  }
}

function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
      return "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
    case "medium":
      return "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20"
    case "low":
      return "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
    default:
      return "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
  }
}

export function CustomerProfile({ customer, onClose }: { customer: Customer; onClose?: () => void }) {
  const [activeTab, setActiveTab] = React.useState("overview")

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-background/60 backdrop-blur p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold">{getInitials(customer.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold truncate">{customer.name}</h1>
              {customer.tags?.includes("VIP") && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  VIP
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {customer.org && (
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {customer.org}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {customer.sla && (
                <Badge variant="outline" className="text-xs">
                  {customer.sla}
                </Badge>
              )}
              {customer.plan && (
                <Badge variant="outline" className="text-xs">
                  {customer.plan}
                </Badge>
              )}
              {customer.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Customer since</div>
            <div className="font-medium">{customer.since ? formatDate(customer.since) : "—"}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5 mx-4 mt-4">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="interactions" className="text-xs">
            History
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs">
            Invoices
          </TabsTrigger>
          <TabsTrigger value="estimates" className="text-xs">
            Estimates
          </TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs">
            Contacts
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs text-muted-foreground">Balance Due</div>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(customer.balanceDue || 0)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs text-muted-foreground">Lifetime Value</div>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(customer.stats?.lifetimeValue || 0)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs text-muted-foreground">Open Invoices</div>
                      </div>
                      <div className="text-lg font-bold">{customer.openInvoices || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs text-muted-foreground">Total Tickets</div>
                      </div>
                      <div className="text-lg font-bold">{customer.stats?.tickets || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Industry</div>
                        <div className="text-sm">{customer.industry || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Payment Terms</div>
                        <div className="text-sm">{customer.paymentTerms || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Credit Limit</div>
                        <div className="text-sm">{formatCurrency(customer.creditLimit || 0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Tax Status</div>
                        <div className="text-sm">{customer.taxExempt ? "Tax Exempt" : "Taxable"}</div>
                      </div>
                    </div>
                    {customer.website && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Website</div>
                        <a
                          href={customer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {customer.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {customer.interactions?.slice(0, 3).map((interaction) => (
                        <div key={interaction.id} className="flex items-start gap-3 p-2 rounded-md bg-muted/30">
                          <div className="mt-1">
                            {interaction.type === "email" && <Mail className="h-4 w-4 text-muted-foreground" />}
                            {interaction.type === "phone" && <Phone className="h-4 w-4 text-muted-foreground" />}
                            {interaction.type === "chat" && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                            {interaction.type === "meeting" && <Users className="h-4 w-4 text-muted-foreground" />}
                            {interaction.type === "note" && <FileText className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-sm truncate">{interaction.subject}</div>
                              <Badge className={cn("text-xs", getPriorityColor(interaction.priority))}>
                                {interaction.priority}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">{interaction.summary}</div>
                            <div className="text-xs text-muted-foreground">
                              {interaction.date} • {interaction.userRole}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="interactions" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Interaction History</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Note
                  </Button>
                </div>
                <div className="space-y-3">
                  {customer.interactions?.map((interaction) => (
                    <Card key={interaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {interaction.type === "email" && <Mail className="h-5 w-5 text-blue-500" />}
                            {interaction.type === "phone" && <Phone className="h-5 w-5 text-green-500" />}
                            {interaction.type === "chat" && <MessageSquare className="h-5 w-5 text-purple-500" />}
                            {interaction.type === "meeting" && <Users className="h-5 w-5 text-orange-500" />}
                            {interaction.type === "note" && <FileText className="h-5 w-5 text-gray-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{interaction.subject}</h4>
                              <Badge className={cn("text-xs", getStatusColor(interaction.status))}>
                                {interaction.status}
                              </Badge>
                              <Badge className={cn("text-xs", getPriorityColor(interaction.priority))}>
                                {interaction.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{interaction.summary}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{interaction.date}</span>
                              <span>{interaction.userRole}</span>
                              <div className="flex gap-1">
                                {interaction.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="invoices" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Invoices</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Invoice
                  </Button>
                </div>
                <div className="space-y-3">
                  {customer.invoices?.map((invoice) => (
                    <Card key={invoice.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{invoice.number}</h4>
                            <Badge className={cn("text-xs", getStatusColor(invoice.status))}>{invoice.status}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(invoice.amount)}</div>
                            <div className="text-xs text-muted-foreground">Due {formatDate(invoice.dueDate)}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Issued: {formatDate(invoice.date)} • Terms: {invoice.paymentTerms}
                        </div>
                        <div className="space-y-1">
                          {invoice.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="truncate">{item.description}</span>
                              <span>{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                          {invoice.items.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{invoice.items.length - 2} more items</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="estimates" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Estimates</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Estimate
                  </Button>
                </div>
                <div className="space-y-3">
                  {customer.estimates?.map((estimate) => (
                    <Card key={estimate.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{estimate.number}</h4>
                            <Badge className={cn("text-xs", getStatusColor(estimate.status))}>{estimate.status}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(estimate.amount)}</div>
                            <div className="text-xs text-muted-foreground">
                              Expires {formatDate(estimate.expiryDate)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Created: {formatDate(estimate.date)} • Valid: {estimate.validityPeriod}
                        </div>
                        <div className="space-y-1">
                          {estimate.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="truncate">{item.description}</span>
                              <span>{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                          {estimate.items.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{estimate.items.length - 2} more items</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contacts" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Contacts</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </div>
                <div className="space-y-3">
                  {customer.contacts?.map((contact) => (
                    <Card key={contact.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-sm">{getInitials(contact.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{contact.name}</h4>
                              {contact.isPrimary && (
                                <Badge variant="secondary" className="text-xs">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {contact.role && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {contact.role} {contact.department && `• ${contact.department}`}
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Addresses */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Addresses</h3>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Address
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {customer.addresses?.map((address) => (
                      <Card key={address.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{address.label}</h4>
                                {address.isPrimary && (
                                  <Badge variant="secondary" className="text-xs">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <div>{address.line1}</div>
                                {address.line2 && <div>{address.line2}</div>}
                                <div>
                                  {address.city}, {address.state} {address.zipCode}
                                </div>
                                <div>{address.country}</div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export function CustomerProfileSheet({
  customer,
  open,
  onOpenChange,
}: {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!customer) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        <CustomerProfile customer={customer} onClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}

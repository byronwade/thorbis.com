"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { Card, CardContent } from "@components/ui/card"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Separator } from "@components/ui/separator"
import { cn } from "@lib/utils"
import { getCustomerById, getCustomerByEmail, inferCustomerByName } from "@lib/unified/customers"
import { FileText, FileSpreadsheet, User2, MessageSquare, Phone, Mail, Building, ExternalLink } from "lucide-react"
import { CustomerProfileSheet } from "./customer-profile"
import { MessagingClient } from "./messaging-client"
import { InvoiceEstimateManager } from "./invoice-estimate-manager"

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

export function CustomerHover({
  customerId,
  email,
  name,
  children,
  className,
}: {
  customerId?: string
  email?: string
  name?: string
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [messagingOpen, setMessagingOpen] = React.useState(false)
  const [invoiceOpen, setInvoiceOpen] = React.useState(false)

  const customer = getCustomerById(customerId) || getCustomerByEmail(email || null) || inferCustomerByName(name || null)

  // Keep the popover open while pointer is over content
  const triggerProps = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
  }
  const contentProps = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <span className={cn("inline-flex items-center", className)} {...triggerProps}>
            {children}
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-96 p-0" {...contentProps}>
          <Card className="border-0 shadow-none">
            <CardContent className="p-4">
              {customer ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm font-semibold">{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold">{customer.name}</div>
                      <div className="truncate text-sm text-muted-foreground">{customer.org || customer.email}</div>
                      {customer.sla && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {customer.sla}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Balance Due</div>
                      <div className="font-medium">{formatCurrency(customer.balanceDue || 0)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Lifetime Value</div>
                      <div className="font-medium">{formatCurrency(customer.stats?.lifetimeValue || 0)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Open Invoices</div>
                      <div className="font-medium">{customer.openInvoices || 0}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Total Tickets</div>
                      <div className="font-medium">{customer.stats?.tickets || 0}</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.org && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{customer.org}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {customer.tags && customer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {customer.tags.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{customer.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Recent Activity */}
                  {customer.interactions && customer.interactions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recent Activity</div>
                      <div className="space-y-1">
                        {customer.interactions.slice(0, 2).map((interaction) => (
                          <div key={interaction.id} className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {interaction.type === "email" && <Mail className="h-3 w-3" />}
                              {interaction.type === "phone" && <Phone className="h-3 w-3" />}
                              {interaction.type === "chat" && <MessageSquare className="h-3 w-3" />}
                              <span className="truncate">{interaction.subject}</span>
                            </div>
                            <div className="ml-4 text-muted-foreground/80">{interaction.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs bg-transparent"
                      onClick={() => {
                        setOpen(false)
                        setProfileOpen(true)
                      }}
                    >
                      <User2 className="h-3 w-3" />
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs bg-transparent"
                      onClick={() => {
                        setOpen(false)
                        setMessagingOpen(true)
                      }}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs bg-transparent"
                      onClick={() => {
                        setOpen(false)
                        setInvoiceOpen(true)
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      Invoices
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs bg-transparent"
                      onClick={() => {
                        setOpen(false)
                        setInvoiceOpen(true)
                      }}
                    >
                      <FileSpreadsheet className="h-3 w-3" />
                      Estimates
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-medium">No profile found</div>
                  <div className="text-xs text-muted-foreground">Connect CRM to enrich customer context.</div>
                  <Button variant="outline" size="sm" className="gap-2 text-xs bg-transparent">
                    <ExternalLink className="h-3 w-3" />
                    Create Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Customer Profile Sheet */}
      <CustomerProfileSheet customer={customer} open={profileOpen} onOpenChange={setProfileOpen} />

      {/* Messaging Client */}
      <MessagingClient open={messagingOpen} onOpenChange={setMessagingOpen} customerId={customer?.id} />

      {/* Invoice & Estimate Manager */}
      <InvoiceEstimateManager open={invoiceOpen} onOpenChange={setInvoiceOpen} customerId={customer?.id} />
    </>
  )
}

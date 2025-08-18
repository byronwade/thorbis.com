"use client"

import type React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Phone,
  Mail,
  MapPin,
  Users,
  Star,
  Tag,
  ExternalLink,
  MessageCircle,
  Copy,
  Wrench,
  CreditCard,
  FileText,
  Clock,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"

type QuickGlanceProfileProps = {
  avatarUrl?: string
  name: string
  company: string
  accountId: string
  rating?: number
  tags?: string[]
  presenceNames?: string[]
  creditAvailable?: number
  balanceDue?: number
  openEstimates?: number
  phone?: string
  email?: string
  address?: string
  prefChannel?: "sms" | "email"
  onSetChannel?: (c: "sms" | "email") => void
  onCopy?: (field: "phone" | "email" | "address") => void
  onOpenCustomer?: () => void
  actions?: React.ReactNode

  // Review gating
  reviewStars?: number
  reviewDate?: string | null

  // Maintenance plan
  maintenancePlan?: string | null
  onMaintenanceClick?: () => void
}

export default function QuickGlanceProfile({
  avatarUrl = "/diverse-avatars.png",
  name,
  company,
  accountId,
  rating,
  tags = [],
  presenceNames = [],
  creditAvailable,
  balanceDue,
  openEstimates,
  phone,
  email,
  address,
  prefChannel = "sms",
  onSetChannel,
  onCopy,
  onOpenCustomer,
  actions,
  reviewStars,
  reviewDate,
  maintenancePlan,
  onMaintenanceClick,
}: QuickGlanceProfileProps) {
  const fiveStar = typeof reviewStars === "number" && reviewStars >= 5

  const satisfactionScore = rating ? Math.round(rating * 20) : 0

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 bg-neutral-900 border-b border-neutral-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-blue-500/30 ring-2 ring-blue-500/10">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
                <AvatarFallback className="bg-blue-500 text-white font-semibold">
                  {company
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-neutral-900 animate-pulse" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h1 className="truncate text-xl font-bold tracking-tight text-neutral-100 cursor-help">
                      {company}
                    </h1>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">ACME Field Services</p>
                      <p className="text-sm">Commercial field service provider</p>
                      <p className="text-sm">Established: 2018 • Employees: 45</p>
                      <p className="text-sm">Primary Services: SmartGate systems, Solar installations</p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {typeof rating === "number" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-help"
                      >
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {rating.toFixed(1)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <p className="font-semibold">Customer Satisfaction Rating</p>
                        <p className="text-sm">Overall Rating: {rating.toFixed(1)}/5.0 stars</p>
                        <p className="text-sm">Satisfaction Score: {satisfactionScore}%</p>
                        <Progress value={satisfactionScore} className="w-24 h-2" />
                        <p className="text-xs text-neutral-400">Based on 23 reviews over 18 months</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs border-neutral-600 text-neutral-300 cursor-help"
                    >
                      {accountId}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">Account ID: {accountId}</p>
                      <p className="text-sm">Customer since: March 2022</p>
                      <p className="text-sm">Account Type: Commercial</p>
                      <p className="text-sm">Payment Terms: Net-60</p>
                      <p className="text-sm">Primary Contact: Jordan Pierce</p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {fiveStar && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-amber-500 text-white hover:bg-amber-600 transition-all duration-200 hover:scale-105">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        5-Star Customer
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Premium Customer Status</p>
                        <p className="text-sm">Consistently high satisfaction ratings</p>
                        <p className="text-sm">{reviewDate ? `Last review: ${reviewDate}` : "Recent 5-star review"}</p>
                        <p className="text-sm">Eligible for priority support and exclusive offers</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                {maintenancePlan && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onMaintenanceClick}
                        className="h-6 px-2 text-xs bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-all duration-200 hover:scale-105"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        {maintenancePlan}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Gold Plan Maintenance Coverage</p>
                        <p className="text-sm">Premium service package with priority support</p>
                        <p className="text-sm">• 2-4 hour response time guarantee</p>
                        <p className="text-sm">• Quarterly preventive maintenance included</p>
                        <p className="text-sm">• 24/7 emergency support hotline</p>
                        <p className="text-sm">• Parts and labor warranty coverage</p>
                        <p className="text-xs text-neutral-400">Contract expires: December 2024</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                {fiveStar && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <Shield className="h-3 w-3 mr-1" />
                    Priority
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium text-neutral-200 cursor-help">{name}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">Jordan Pierce</p>
                      <p className="text-sm">Primary Contact & Decision Maker</p>
                      <p className="text-sm">Title: Facilities Manager</p>
                      <p className="text-sm">Department: Operations</p>
                      <p className="text-sm">Preferred contact method: SMS first, then email</p>
                      <p className="text-sm">Best contact times: 8 AM - 5 PM PST</p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {presenceNames.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span>Also viewing: {presenceNames.join(", ")}</span>
                  </div>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-help">
                      <Clock className="h-3 w-3 mr-1" />
                      SLA 2–4h
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">Service Level Agreement</p>
                      <p className="text-sm">Response Time: 2-4 hours guaranteed</p>
                      <p className="text-sm">Current SLA utilization: 78% (within target)</p>
                      <p className="text-sm">Gold Plan includes priority escalation</p>
                      <p className="text-sm">Emergency after-hours support available</p>
                      <p className="text-xs text-neutral-400">SLA compliance: 94% over last 12 months</p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-300 border-green-500/30 cursor-help"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Fast Response
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">Fast Response Enabled</p>
                      <p className="text-sm">Priority routing for urgent issues</p>
                      <p className="text-sm">Average response time: 45 minutes</p>
                      <p className="text-sm">Dedicated technician pool available</p>
                      <p className="text-sm">Automatic escalation for critical issues</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={prefChannel === "sms" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetChannel?.("sms")}
                  className={cn(
                    "h-8 transition-all duration-200 hover:scale-105",
                    prefChannel === "sms"
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                      : "border-neutral-600 text-neutral-300 hover:bg-neutral-800",
                  )}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Text</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">SMS Communication</p>
                  <p className="text-sm">Send text messages to customer's mobile</p>
                  <p className="text-sm">Preferred method for quick updates and confirmations</p>
                  <p className="text-sm">Delivery confirmation and read receipts enabled</p>
                  <p className="text-xs text-neutral-400">Customer prefers SMS for urgent notifications</p>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={prefChannel === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSetChannel?.("email")}
                  disabled={!email}
                  className={cn(
                    "h-8 transition-all duration-200 hover:scale-105",
                    prefChannel === "email"
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                      : "border-neutral-600 text-neutral-300 hover:bg-neutral-800",
                  )}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Email</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">Email Communication</p>
                  <p className="text-sm">Send detailed information and documentation</p>
                  <p className="text-sm">Best for service reports, invoices, and formal communications</p>
                  <p className="text-sm">Automatic CC to facilities team when requested</p>
                  <p className="text-xs text-neutral-400">Customer checks email during business hours</p>
                </div>
              </TooltipContent>
            </Tooltip>

            {actions}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {phone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm backdrop-blur-sm transition-all duration-200 hover:bg-neutral-800 cursor-help">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <a className="hover:underline font-medium text-neutral-200" href={`tel:${phone}`}>
                    {phone}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy?.("phone")}
                    className="h-6 w-6 p-0 ml-1 hover:scale-110 transition-transform duration-200"
                    title="Copy phone"
                  >
                    <Copy className="h-3 w-3 text-neutral-400" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">Primary Phone: {phone}</p>
                  <p className="text-sm">Direct line to Jordan Pierce</p>
                  <p className="text-sm">Available: Monday-Friday 8 AM - 5 PM PST</p>
                  <p className="text-sm">Emergency after-hours: Press 1 for on-call service</p>
                  <p className="text-sm">Voicemail monitored every 2 hours during business days</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {email && (
            <div className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm backdrop-blur-sm transition-all duration-200 hover:bg-neutral-800">
              <Mail className="h-4 w-4 text-blue-400" />
              <a className="hover:underline font-medium text-neutral-200" href={`mailto:${email}`}>
                {email}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy?.("email")}
                className="h-6 w-6 p-0 ml-1 hover:scale-110 transition-transform duration-200"
                title="Copy email"
              >
                <Copy className="h-3 w-3 text-neutral-400" />
              </Button>
            </div>
          )}

          {address && (
            <div className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm backdrop-blur-sm transition-all duration-200 hover:bg-neutral-800">
              <MapPin className="h-4 w-4 text-blue-400" />
              <a
                className="hover:underline font-medium text-neutral-200"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer"
              >
                {address}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy?.("address")}
                className="h-6 w-6 p-0 ml-1 hover:scale-110 transition-transform duration-200"
                title="Copy address"
              >
                <Copy className="h-3 w-3 text-neutral-400" />
              </Button>
            </div>
          )}

          {tags.slice(0, 4).map((t) => (
            <Tooltip key={t}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-xs border-neutral-600 text-neutral-300 hover:bg-neutral-800 transition-colors cursor-help"
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {t}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {t === "Commercial" && (
                    <>
                      <p className="font-semibold">Commercial Account</p>
                      <p className="text-sm">Business-to-business customer</p>
                      <p className="text-sm">Volume pricing and extended payment terms</p>
                      <p className="text-sm">Dedicated account management</p>
                    </>
                  )}
                  {t === "Net-60" && (
                    <>
                      <p className="font-semibold">Net-60 Payment Terms</p>
                      <p className="text-sm">Payment due within 60 days of invoice</p>
                      <p className="text-sm">Extended terms for established customers</p>
                      <p className="text-sm">Current payment status: On time</p>
                    </>
                  )}
                  {t === "SmartGate" && (
                    <>
                      <p className="font-semibold">SmartGate Systems</p>
                      <p className="text-sm">Automated gate control and access management</p>
                      <p className="text-sm">18 devices installed across 5 locations</p>
                      <p className="text-sm">Firmware version 2.4.1 (latest)</p>
                    </>
                  )}
                  {t === "Solar" && (
                    <>
                      <p className="font-semibold">Solar Energy Systems</p>
                      <p className="text-sm">Renewable energy installations and maintenance</p>
                      <p className="text-sm">45kW system installed in 2023</p>
                      <p className="text-sm">Quarterly performance monitoring included</p>
                    </>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {typeof creditAvailable === "number" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-lg bg-green-500/20 border border-green-500/30 px-3 py-1.5 text-sm text-green-300 transition-all duration-200 hover:bg-green-500/30 cursor-help">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-semibold">
                      Credit:{" "}
                      {creditAvailable.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">Account Credit: $3,500</p>
                    <p className="text-sm">Available for future services and purchases</p>
                    <p className="text-sm">Source: Overpayment from last invoice</p>
                    <p className="text-sm">Can be applied to current balance or held for future use</p>
                    <p className="text-xs text-neutral-400">Credit expires: Never (permanent account credit)</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {typeof balanceDue === "number" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 cursor-help",
                      balanceDue > 0
                        ? "bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                        : "bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30",
                    )}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>
                      Due:{" "}
                      {balanceDue.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">Outstanding Balance: $8,001</p>
                    <p className="text-sm">Invoice #INV-2024-0892 - Due: January 15, 2025</p>
                    <p className="text-sm">Services: SmartGate maintenance and solar panel cleaning</p>
                    <p className="text-sm">Payment terms: Net-60 (within normal terms)</p>
                    <p className="text-sm">Available credit can offset: $3,500</p>
                    <p className="text-xs text-neutral-400">Payment reminder sent: January 1, 2025</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {typeof openEstimates === "number" && openEstimates > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-sm text-blue-300 transition-all duration-200 hover:bg-blue-500/30 cursor-help">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold">
                      {openEstimates} estimate{openEstimates === 1 ? "" : "s"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">Pending Estimate</p>
                    <p className="text-sm">EST-2024-1205: Solar panel expansion project</p>
                    <p className="text-sm">Estimated value: $12,500</p>
                    <p className="text-sm">Status: Awaiting customer approval</p>
                    <p className="text-sm">Valid until: February 15, 2025</p>
                    <p className="text-xs text-neutral-400">Follow-up scheduled: January 20, 2025</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {fiveStar && (
              <div className="flex items-center gap-1 rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 text-sm text-purple-300">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">High Value</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800 transition-all duration-200 hover:scale-105"
          >
            <Link
              href={`/voip/${encodeURIComponent(accountId)}`}
              onClick={(e) => {
                if (onOpenCustomer) {
                  e.preventDefault()
                  onOpenCustomer()
                }
              }}
            >
              Open Customer
              <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

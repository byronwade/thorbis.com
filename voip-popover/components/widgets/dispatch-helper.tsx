"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MapPin, Send, Users, Clock, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Tech = { name: string; lat: number; lng: number; status: "Available" | "En route" | "On site"; skills: string[] }

export default function DispatchHelper({
  site,
  roster,
  account,
}: {
  site: { lat: number; lng: number }
  roster: Tech[]
  account: string
}) {
  const [skillFilter, setSkillFilter] = useState<string>("")
  const [showAvailable, setShowAvailable] = useState<boolean>(false)
  const [when, setWhen] = useState<string>("")

  const list = useMemo(() => {
    const skills = skillFilter.trim().toLowerCase()
    return roster.filter((t) => {
      const matchesSkill = skills ? t.skills.some((s) => s.toLowerCase().includes(skills)) : true
      const matchesAvail = showAvailable ? t.status === "Available" : true
      return matchesSkill && matchesAvail
    })
  }, [roster, skillFilter, showAvailable])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-600 text-white"
      case "En route":
        return "bg-blue-600 text-white"
      case "On site":
        return "bg-orange-600 text-white"
      default:
        return "bg-neutral-600 text-white"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available":
        return <CheckCircle className="h-4 w-4" />
      case "En route":
        return <Clock className="h-4 w-4" />
      case "On site":
        return <MapPin className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Input
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill (e.g., SmartGate)"
              className="h-9 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400"
            />
          </div>
          <div className="flex items-center">
            <label className="flex select-none items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailable}
                onChange={(e) => setShowAvailable(e.target.checked)}
                className="h-4 w-4 accent-blue-600 rounded"
              />
              <span className="text-neutral-200">Show available only</span>
            </label>
          </div>
          <div>
            <Input
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              placeholder="When? (e.g., Today 2–4 PM)"
              className="h-9 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="space-y-3">
          {list.map((t) => (
            <div
              key={t.name}
              className={cn(
                "flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 p-4",
                "hover:bg-neutral-800/50 hover:border-blue-500/50 transition-colors duration-200",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(t.status)}
                    <span className="font-semibold text-white">{t.name}</span>
                  </div>
                  <Badge variant="secondary" className={cn("text-white text-xs", getStatusColor(t.status))}>
                    {t.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-neutral-600 text-neutral-200 hover:bg-neutral-800 bg-transparent"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Map
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View technician location on map and get directions</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        const msg = `Dispatch ${t.name} to ${account} ${when ? `— ${when}` : ""}`
                        navigator.clipboard?.writeText(msg)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Dispatch
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dispatch this technician to the customer location and copy details to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <div className="text-center py-8 text-neutral-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No technicians found matching your criteria</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

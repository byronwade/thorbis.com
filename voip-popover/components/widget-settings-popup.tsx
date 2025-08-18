"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Settings, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export type WidgetVisibility = {
  [key: string]: boolean
}

interface WidgetSettingsPopupProps {
  widgets: Array<{ id: string; title: string; description?: string }>
  visibility: WidgetVisibility
  onVisibilityChange: (visibility: WidgetVisibility) => void
}

export function WidgetSettingsPopup({ widgets, visibility, onVisibilityChange }: WidgetSettingsPopupProps) {
  const [open, setOpen] = useState(false)

  const toggleWidget = (widgetId: string) => {
    onVisibilityChange({
      ...visibility,
      [widgetId]: !visibility[widgetId],
    })
  }

  const toggleAll = (show: boolean) => {
    const newVisibility: WidgetVisibility = {}
    widgets.forEach((widget) => {
      newVisibility[widget.id] = show
    })
    onVisibilityChange(newVisibility)
  }

  const visibleCount = Object.values(visibility).filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-neutral-600 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
        >
          <Settings className="mr-2 h-4 w-4" />
          Widget Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-neutral-900 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-neutral-100">Widget Settings</DialogTitle>
          <p className="text-sm text-neutral-400">Toggle widgets on/off and customize your workspace</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800 border border-neutral-700">
            <div>
              <p className="text-sm font-medium text-neutral-200">Quick Actions</p>
              <p className="text-xs text-neutral-400">
                {visibleCount} of {widgets.length} widgets visible
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleAll(true)}
                className="h-8 px-3 text-xs border-neutral-600 hover:bg-neutral-700"
              >
                <Eye className="mr-1 h-3 w-3" />
                Show All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleAll(false)}
                className="h-8 px-3 text-xs border-neutral-600 hover:bg-neutral-700"
              >
                <EyeOff className="mr-1 h-3 w-3" />
                Hide All
              </Button>
            </div>
          </div>

          {/* Widget List */}
          <div className="space-y-2">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  visibility[widget.id] ? "bg-blue-950/20 border-blue-800/30" : "bg-neutral-800 border-neutral-700",
                )}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-200">{widget.title}</p>
                  {widget.description && <p className="text-xs text-neutral-400 mt-1">{widget.description}</p>}
                </div>
                <Switch
                  checked={visibility[widget.id] || false}
                  onCheckedChange={() => toggleWidget(widget.id)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

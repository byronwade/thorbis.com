"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Eye, Monitor, Maximize, Minimize, Sun, Moon, Contrast, Accessibility } from "lucide-react"
import { cn } from "@/lib/utils"

type Theme = "dark" | "light" | "auto" | "high-contrast"
type Density = "compact" | "comfortable" | "spacious"
type FontSize = "small" | "medium" | "large" | "extra-large"
type AnimationLevel = "none" | "reduced" | "normal" | "enhanced"

type AccessibilitySettings = {
  screenReader: boolean
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  keyboardNavigation: boolean
  voiceCommands: boolean
  colorBlindSupport: boolean
  focusIndicators: boolean
}

type UIPreferences = {
  theme: Theme
  density: Density
  fontSize: FontSize
  animationLevel: AnimationLevel
  showTooltips: boolean
  compactMode: boolean
  sidebarCollapsed: boolean
  panelLayout: "stacked" | "tabbed" | "floating"
  accessibility: AccessibilitySettings
}

type KeyboardShortcut = {
  id: string
  name: string
  description: string
  keys: string[]
  category: "call" | "navigation" | "data" | "accessibility"
  enabled: boolean
}

const defaultPreferences: UIPreferences = {
  theme: "dark",
  density: "comfortable",
  fontSize: "medium",
  animationLevel: "normal",
  showTooltips: true,
  compactMode: false,
  sidebarCollapsed: false,
  panelLayout: "stacked",
  accessibility: {
    screenReader: false,
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    keyboardNavigation: true,
    voiceCommands: false,
    colorBlindSupport: false,
    focusIndicators: true,
  },
}

const keyboardShortcuts: KeyboardShortcut[] = [
  {
    id: "answer-call",
    name: "Answer Call",
    description: "Answer incoming call",
    keys: ["Space"],
    category: "call",
    enabled: true,
  },
  {
    id: "end-call",
    name: "End Call",
    description: "End current call",
    keys: ["Escape"],
    category: "call",
    enabled: true,
  },
  {
    id: "toggle-mute",
    name: "Toggle Mute",
    description: "Mute/unmute microphone",
    keys: ["Ctrl", "M"],
    category: "call",
    enabled: true,
  },
  {
    id: "toggle-hold",
    name: "Toggle Hold",
    description: "Put call on hold/resume",
    keys: ["Ctrl", "H"],
    category: "call",
    enabled: true,
  },
  {
    id: "open-ai-panel",
    name: "Open AI Panel",
    description: "Toggle AI insights panel",
    keys: ["Ctrl", "I"],
    category: "navigation",
    enabled: true,
  },
  {
    id: "open-data-panel",
    name: "Open Data Panel",
    description: "Toggle data capture panel",
    keys: ["Ctrl", "D"],
    category: "data",
    enabled: true,
  },
  {
    id: "focus-search",
    name: "Focus Search",
    description: "Focus on search input",
    keys: ["Ctrl", "K"],
    category: "navigation",
    enabled: true,
  },
  {
    id: "toggle-high-contrast",
    name: "Toggle High Contrast",
    description: "Enable/disable high contrast mode",
    keys: ["Ctrl", "Alt", "H"],
    category: "accessibility",
    enabled: true,
  },
]

type AdvancedUIControlsProps = {
  onPreferencesChange?: (preferences: UIPreferences) => void
  className?: string
}

export default function AdvancedUIControls({ onPreferencesChange, className }: AdvancedUIControlsProps) {
  const [preferences, setPreferences] = useState<UIPreferences>(defaultPreferences)
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(keyboardShortcuts)
  const [activeTab, setActiveTab] = useState<"appearance" | "accessibility" | "shortcuts" | "layout">("appearance")
  const [previewMode, setPreviewMode] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("voip-ui-preferences")
      if (saved) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) })
      }
    } catch (error) {
      console.warn("Failed to load UI preferences:", error)
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("voip-ui-preferences", JSON.stringify(preferences))
      onPreferencesChange?.(preferences)
    } catch (error) {
      console.warn("Failed to save UI preferences:", error)
    }
  }, [preferences, onPreferencesChange])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", preferences.theme)
    root.setAttribute("data-density", preferences.density)
    root.setAttribute("data-font-size", preferences.fontSize)
    root.setAttribute("data-animation", preferences.animationLevel)

    if (preferences.accessibility.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    if (preferences.accessibility.reducedMotion) {
      root.classList.add("reduced-motion")
    } else {
      root.classList.remove("reduced-motion")
    }
  }, [preferences])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!preferences.accessibility.keyboardNavigation) return

      const activeShortcut = shortcuts.find((shortcut) => {
        if (!shortcut.enabled) return false

        const keys = shortcut.keys.map((key) => key.toLowerCase())
        const pressedKeys = []

        if (event.ctrlKey) pressedKeys.push("ctrl")
        if (event.altKey) pressedKeys.push("alt")
        if (event.shiftKey) pressedKeys.push("shift")
        if (event.metaKey) pressedKeys.push("meta")

        const mainKey = event.key.toLowerCase()
        if (mainKey !== "control" && mainKey !== "alt" && mainKey !== "shift" && mainKey !== "meta") {
          pressedKeys.push(mainKey === " " ? "space" : mainKey)
        }

        return keys.length === pressedKeys.length && keys.every((key) => pressedKeys.includes(key))
      })

      if (activeShortcut) {
        event.preventDefault()
        handleShortcutAction(activeShortcut.id)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, preferences.accessibility.keyboardNavigation])

  const handleShortcutAction = (shortcutId: string) => {
    // Emit custom events for shortcut actions
    const event = new CustomEvent("voip-shortcut", { detail: { shortcutId } })
    document.dispatchEvent(event)
  }

  const updatePreference = <K extends keyof UIPreferences>(key: K, value: UIPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const updateAccessibility = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setPreferences((prev) => ({
      ...prev,
      accessibility: { ...prev.accessibility, [key]: value },
    }))
  }

  const toggleShortcut = (shortcutId: string) => {
    setShortcuts((prev) => prev.map((s) => (s.id === shortcutId ? { ...s, enabled: !s.enabled } : s)))
  }

  const resetToDefaults = () => {
    setPreferences(defaultPreferences)
    setShortcuts(keyboardShortcuts)
  }

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case "light":
        return <Sun className="h-3 w-3" />
      case "dark":
        return <Moon className="h-3 w-3" />
      case "high-contrast":
        return <Contrast className="h-3 w-3" />
      default:
        return <Monitor className="h-3 w-3" />
    }
  }

  const getDensityIcon = (density: Density) => {
    switch (density) {
      case "compact":
        return <Minimize className="h-3 w-3" />
      case "spacious":
        return <Maximize className="h-3 w-3" />
      default:
        return <Monitor className="h-3 w-3" />
    }
  }

  return (
    <Card className={cn("bg-neutral-900 border-neutral-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-sm text-white">UI & Accessibility</CardTitle>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={previewMode ? "default" : "ghost"}
              onClick={() => setPreviewMode(!previewMode)}
              className="h-6 px-2 text-xs"
              title="Preview Mode"
            >
              <Eye className="h-3 w-3" />
            </Button>

            <Button size="sm" variant="ghost" onClick={resetToDefaults} className="h-6 px-2 text-xs" title="Reset">
              Reset
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-2">
          {(["appearance", "accessibility", "shortcuts", "layout"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors capitalize",
                activeTab === tab
                  ? "bg-orange-500 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-neutral-300 mb-2 block">Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["dark", "light", "auto", "high-contrast"] as Theme[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updatePreference("theme", theme)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded border text-xs transition-colors",
                      preferences.theme === theme
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600",
                    )}
                  >
                    {getThemeIcon(theme)}
                    <span className="capitalize">{theme.replace("-", " ")}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-neutral-300 mb-2 block">Density</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["compact", "comfortable", "spacious"] as Density[]).map((density) => (
                  <button
                    key={density}
                    onClick={() => updatePreference("density", density)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded border text-xs transition-colors",
                      preferences.density === density
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600",
                    )}
                  >
                    {getDensityIcon(density)}
                    <span className="capitalize">{density}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-neutral-300 mb-2 block">Font Size</Label>
              <Select
                value={preferences.fontSize}
                onValueChange={(value: FontSize) => updatePreference("fontSize", value)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-neutral-300 mb-2 block">Animation Level</Label>
              <Select
                value={preferences.animationLevel}
                onValueChange={(value: AnimationLevel) => updatePreference("animationLevel", value)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="reduced">Reduced</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Accessibility Tab */}
        {activeTab === "accessibility" && (
          <div className="space-y-4">
            <div className="space-y-3">
              {Object.entries(preferences.accessibility).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Accessibility className="h-3 w-3 text-blue-400" />
                    <Label className="text-xs text-neutral-300 capitalize">
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </Label>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updateAccessibility(key as keyof AccessibilitySettings, checked)}
                  />
                </div>
              ))}
            </div>

            <Separator className="bg-neutral-800" />

            <div>
              <Label className="text-xs font-medium text-neutral-300 mb-2 block">Screen Reader Announcements</Label>
              <div className="text-xs text-neutral-400 space-y-1">
                <div>• Call status changes</div>
                <div>• New messages and notifications</div>
                <div>• Form validation errors</div>
                <div>• Workflow step completions</div>
              </div>
            </div>
          </div>
        )}

        {/* Shortcuts Tab */}
        {activeTab === "shortcuts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-neutral-300">Keyboard Navigation</Label>
              <Switch
                checked={preferences.accessibility.keyboardNavigation}
                onCheckedChange={(checked) => updateAccessibility("keyboardNavigation", checked)}
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.id} className="flex items-center justify-between p-2 rounded bg-neutral-800/50">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white">{shortcut.name}</div>
                    <div className="text-xs text-neutral-400">{shortcut.description}</div>
                    <div className="flex gap-1 mt-1">
                      {shortcut.keys.map((key, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs bg-neutral-700 text-neutral-300 border-neutral-600"
                        >
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Switch checked={shortcut.enabled} onCheckedChange={() => toggleShortcut(shortcut.id)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === "layout" && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-neutral-300 mb-2 block">Panel Layout</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["stacked", "tabbed", "floating"] as const).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => updatePreference("panelLayout", layout)}
                    className={cn(
                      "p-2 rounded border text-xs transition-colors capitalize",
                      preferences.panelLayout === layout
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600",
                    )}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-300">Show Tooltips</Label>
                <Switch
                  checked={preferences.showTooltips}
                  onCheckedChange={(checked) => updatePreference("showTooltips", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-300">Compact Mode</Label>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => updatePreference("compactMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-300">Collapse Sidebar</Label>
                <Switch
                  checked={preferences.sidebarCollapsed}
                  onCheckedChange={(checked) => updatePreference("sidebarCollapsed", checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview Mode Indicator */}
        {previewMode && (
          <div className="mt-4 p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Eye className="h-3 w-3" />
              <span>Preview mode active - changes are applied in real-time</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

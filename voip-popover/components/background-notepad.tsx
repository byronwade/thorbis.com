"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, Trash2 } from "lucide-react"

interface BackgroundNotepadProps {
  storageKey: string
  className?: string
}

export function BackgroundNotepad({ storageKey, className }: BackgroundNotepadProps) {
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load notes from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`voip:notes:${storageKey}`)
        if (saved) {
          setNotes(saved)
        }
      } catch (error) {
        console.error("Failed to load notes:", error)
      }
    }
  }, [storageKey])

  // Auto-save notes
  useEffect(() => {
    if (notes && typeof window !== "undefined") {
      try {
        localStorage.setItem(`voip:notes:${storageKey}`, notes)
        setLastSaved(new Date())
      } catch (error) {
        console.error("Failed to save notes:", error)
      }
    }
  }, [notes, storageKey])

  const handleClick = (e: React.MouseEvent) => {
    // Only activate editing if clicking on empty space (not on widgets)
    if (e.target === e.currentTarget) {
      setIsEditing(true)
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  const clearNotes = () => {
    setNotes("")
    if (typeof window !== "undefined") {
      localStorage.removeItem(`voip:notes:${storageKey}`)
    }
    setLastSaved(null)
  }

  return (
    <div
      className={cn("absolute inset-0 min-h-full w-full", !isEditing && "cursor-text", className)}
      onClick={handleClick}
    >
      {/* Background pattern for visual feedback */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(156, 163, 175, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Notepad controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 px-3 py-2">
          <FileText className="h-4 w-4 text-neutral-400" />
          <span className="text-xs text-neutral-400">{notes ? `${notes.length} chars` : "Click to add notes"}</span>
          {lastSaved && <span className="text-xs text-neutral-500">• Saved {lastSaved.toLocaleTimeString()}</span>}
        </div>
        {notes && (
          <Button
            size="sm"
            variant="outline"
            onClick={clearNotes}
            className="h-8 w-8 p-0 border-neutral-700 bg-neutral-900/80 backdrop-blur-sm hover:bg-red-900/20 hover:border-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Notepad textarea */}
      {isEditing && (
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
          placeholder="Start typing your notes here... Press Escape to stop editing."
          className={cn(
            "absolute inset-0 w-full h-full resize-none border-none outline-none",
            "bg-transparent text-neutral-300 placeholder-neutral-600",
            "p-6 text-sm leading-relaxed font-mono",
            "selection:bg-blue-500/20",
          )}
          style={{ minHeight: "100%" }}
        />
      )}

      {/* Show existing notes when not editing */}
      {!isEditing && notes && (
        <div className="absolute inset-0 p-6 text-sm leading-relaxed font-mono text-neutral-400 whitespace-pre-wrap pointer-events-none">
          {notes}
        </div>
      )}

      {/* Hint text when no notes */}
      {!isEditing && !notes && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-neutral-600">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click anywhere to start taking notes</p>
            <p className="text-xs mt-1 opacity-75">Your notes are automatically saved</p>
          </div>
        </div>
      )}
    </div>
  )
}

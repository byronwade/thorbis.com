"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, X, GripVertical, User, Phone, MapPin, FileText } from "lucide-react"

interface StickyNote {
  id: string
  content: string
  x: number
  y: number
  width: number
  height: number
  color: string
  attachedTo?: string
  createdAt: Date
}

interface StickyNotesProps {
  storageKey: string
  className?: string
}

const NOTE_COLORS = [
  "bg-yellow-200 border-yellow-300 text-yellow-900",
  "bg-pink-200 border-pink-300 text-pink-900",
  "bg-blue-200 border-blue-300 text-blue-900",
  "bg-green-200 border-green-300 text-green-900",
  "bg-purple-200 border-purple-300 text-purple-900",
  "bg-orange-200 border-orange-300 text-orange-900",
]

const ATTACHMENT_POINTS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "location", label: "Location", icon: MapPin },
  { id: "general", label: "General", icon: FileText },
]

export function StickyNotes({ storageKey, className }: StickyNotesProps) {
  const [notes, setNotes] = useState<StickyNote[]>([])
  const [draggedNote, setDraggedNote] = useState<string | null>(null)
  const [resizingNote, setResizingNote] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`voip:sticky-notes:${storageKey}`)
        if (saved) {
          const parsedNotes = JSON.parse(saved).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
          }))
          setNotes(parsedNotes)
        }
      } catch (error) {
        console.error("Failed to load sticky notes:", error)
      }
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`voip:sticky-notes:${storageKey}`, JSON.stringify(notes))
      } catch (error) {
        console.error("Failed to save sticky notes:", error)
      }
    }
  }, [notes, storageKey])

  const createNote = (x: number, y: number) => {
    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      content: "",
      x: Math.max(0, x - 100),
      y: Math.max(0, y - 50),
      width: 200,
      height: 150,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      createdAt: new Date(),
    }
    setNotes((prev) => [...prev, newNote])
  }

  const updateNote = (id: string, updates: Partial<StickyNote>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates } : note)))
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const handleMouseDown = (e: React.MouseEvent, noteId: string, action: "drag" | "resize") => {
    e.preventDefault()
    e.stopPropagation()
    const note = notes.find((n) => n.id === noteId)
    if (!note || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()

    if (action === "drag") {
      setDraggedNote(noteId)
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - containerRect.left - note.x,
        y: e.clientY - containerRect.top - note.y,
      })
      setDragPosition({ x: note.x, y: note.y })
    } else {
      setResizingNote(noteId)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNote && containerRef.current) {
      const note = notes.find((n) => n.id === draggedNote)
      if (note) {
        const rect = containerRef.current.getBoundingClientRect()
        const newX = Math.max(0, Math.min(rect.width - note.width, e.clientX - rect.left - dragOffset.x))
        const newY = Math.max(0, Math.min(rect.height - note.height, e.clientY - rect.top - dragOffset.y))
        setDragPosition({ x: newX, y: newY })
      }
    }

    if (resizingNote && containerRef.current) {
      const note = notes.find((n) => n.id === resizingNote)
      if (note) {
        const rect = containerRef.current.getBoundingClientRect()
        const newWidth = Math.max(150, e.clientX - rect.left - note.x)
        const newHeight = Math.max(100, e.clientY - rect.top - note.y)
        updateNote(resizingNote, { width: newWidth, height: newHeight })
      }
    }
  }

  const handleMouseUp = () => {
    if (draggedNote) {
      updateNote(draggedNote, { x: dragPosition.x, y: dragPosition.y })
    }
    setDraggedNote(null)
    setResizingNote(null)
    setDragPosition({ x: 0, y: 0 })

    setTimeout(() => {
      setIsDragging(false)
    }, 100)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      createNote(e.clientX - rect.left, e.clientY - rect.top)
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 min-h-full w-full cursor-crosshair z-10", className)}
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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

      <div className="absolute top-4 right-4 z-[60] flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 px-3 py-2">
          <FileText className="h-4 w-4 text-neutral-400" />
          <span className="text-xs text-neutral-400">{notes.length} notes</span>
        </div>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            createNote(100, 100)
          }}
          className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {notes.map((note) => {
        const displayX = draggedNote === note.id ? dragPosition.x : note.x
        const displayY = draggedNote === note.id ? dragPosition.y : note.y

        return (
          <div
            key={note.id}
            className={cn(
              "absolute border-2 rounded-lg shadow-lg cursor-move select-none z-20",
              "transform rotate-1 hover:rotate-0 transition-transform duration-200",
              note.color,
              draggedNote === note.id && "rotate-0 shadow-2xl z-[70] scale-105",
              resizingNote === note.id && "z-[65]",
            )}
            style={{
              left: displayX,
              top: displayY,
              width: note.width,
              height: note.height,
              pointerEvents: draggedNote === note.id ? "none" : "auto",
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id, "drag")}
          >
            <div className="flex items-center justify-between p-2 border-b border-current/20">
              <div className="flex items-center gap-1">
                <GripVertical className="h-3 w-3 opacity-50" />
                <select
                  value={note.attachedTo || ""}
                  onChange={(e) => updateNote(note.id, { attachedTo: e.target.value || undefined })}
                  className="text-xs bg-transparent border-none outline-none cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <option value="">Attach to...</option>
                  {ATTACHMENT_POINTS.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  deleteNote(note.id)
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onMouseUp={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="h-5 w-5 p-0 hover:bg-red-500/20 cursor-pointer z-[80]"
              >
                <X className="h-3 w-3 pointer-events-none" />
              </Button>
            </div>

            <textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, { content: e.target.value })}
              placeholder="Type your note here..."
              className="w-full h-full p-2 bg-transparent border-none outline-none resize-none text-sm"
              style={{ height: note.height - 40 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />

            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100"
              onMouseDown={(e) => handleMouseDown(e, note.id, "resize")}
            >
              <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-current/50" />
            </div>

            {note.attachedTo && (
              <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                {(() => {
                  const point = ATTACHMENT_POINTS.find((p) => p.id === note.attachedTo)
                  const Icon = point?.icon || FileText
                  return <Icon className="h-2 w-2 text-white" />
                })()}
              </div>
            )}
          </div>
        )
      })}

      {notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-neutral-600">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click anywhere to create a sticky note</p>
            <p className="text-xs mt-1 opacity-75">Notes can be moved, resized, and attached to profile sections</p>
          </div>
        </div>
      )}
    </div>
  )
}

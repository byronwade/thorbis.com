"use client"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { X, Plus, Reply, UserPlus, MoreHorizontal } from "lucide-react"

export function FilterChipsBar({
  query,
  setQuery,
  filter,
  setFilter,
  assignFilter,
  setAssignFilter,
  labelFilter,
  setLabelFilter,
}: {
  query: string
  setQuery: (q: string) => void
  filter: string
  setFilter: (f: string) => void
  assignFilter: string
  setAssignFilter: (f: string) => void
  labelFilter: string | null
  setLabelFilter: (l: string | null) => void
}) {
  const hasFilters = query || filter !== "all" || assignFilter !== "all" || labelFilter

  if (!hasFilters) return null

  return (
    <div className="border-b bg-muted/30 px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Filters:</span>
        {query && (
          <Badge variant="secondary" className="gap-1 text-xs">
            Search: {query}
            <button onClick={() => setQuery("")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filter !== "all" && (
          <Badge variant="secondary" className="gap-1 text-xs">
            Status: {filter}
            <button onClick={() => setFilter("all")} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {assignFilter !== "all" && (
          <Badge variant="secondary" className="gap-1 text-xs">
            Assignment: {assignFilter === "assignedToMe" ? "Assigned to me" : "Unassigned"}
            <button
              onClick={() => setAssignFilter("all")}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {labelFilter && (
          <Badge variant="secondary" className="gap-1 text-xs">
            Label: {labelFilter}
            <button
              onClick={() => setLabelFilter(null)}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => {
            setQuery("")
            setFilter("all")
            setAssignFilter("all")
            setLabelFilter(null)
          }}
        >
          Clear all
        </Button>
      </div>
    </div>
  )
}

export function FloatingComposeFab({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden" size="icon">
      <Plus className="h-6 w-6" />
    </Button>
  )
}

export function ResultsCounter({ count }: { count: number }) {
  return (
    <div className="text-xs text-muted-foreground">
      {count} {count === 1 ? "result" : "results"}
    </div>
  )
}

export function ReaderMobileBar({
  onReply,
  onAssign,
  onMore,
}: {
  onReply: () => void
  onAssign: () => void
  onMore: () => void
}) {
  return (
    <div className="sticky bottom-0 border-t bg-background/80 backdrop-blur p-3 md:hidden">
      <div className="flex items-center justify-around">
        <Button variant="outline" size="sm" className="gap-2 flex-1 mx-1 bg-transparent" onClick={onReply}>
          <Reply className="h-4 w-4" />
          Reply
        </Button>
        <Button variant="outline" size="sm" className="gap-2 flex-1 mx-1 bg-transparent" onClick={onAssign}>
          <UserPlus className="h-4 w-4" />
          Assign
        </Button>
        <Button variant="outline" size="sm" className="gap-2 flex-1 mx-1 bg-transparent" onClick={onMore}>
          <MoreHorizontal className="h-4 w-4" />
          More
        </Button>
      </div>
    </div>
  )
}

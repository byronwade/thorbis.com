"use client"
import { Button } from "@components/ui/button"
import { Reply, UserPlus, MoreHorizontal } from "lucide-react"

interface ReaderMobileBarProps {
  onReply: () => void
  onAssign: () => void
  onMore: () => void
}

export function ReaderMobileBar({ onReply, onAssign, onMore }: ReaderMobileBarProps) {
  return (
    <div className="sticky bottom-0 border-t bg-background/80 backdrop-blur p-2 md:hidden">
      <div className="flex items-center justify-center gap-2">
        <Button variant="default" size="sm" className="flex-1 gap-2 min-h-[44px]" onClick={onReply}>
          <Reply className="h-4 w-4" />
          Reply
        </Button>
        <Button variant="outline" size="sm" className="gap-2 min-h-[44px] bg-transparent" onClick={onAssign}>
          <UserPlus className="h-4 w-4" />
          Assign
        </Button>
        <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] bg-transparent" onClick={onMore}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

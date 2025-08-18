"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, BookOpen, Zap, AlertCircle, ChevronRight, Star } from "lucide-react"

interface KnowledgeItem {
  id: string
  title: string
  category: string
  type: "faq" | "guide" | "troubleshoot"
  rating: number
  views: number
  content: string
}

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const knowledgeItems: KnowledgeItem[] = [
    {
      id: "1",
      title: "HVAC System Not Cooling Properly",
      category: "HVAC",
      type: "troubleshoot",
      rating: 4.8,
      views: 1247,
      content: "Check thermostat settings, air filter, and outdoor unit...",
    },
    {
      id: "2",
      title: "How to Schedule Emergency Service",
      category: "Scheduling",
      type: "guide",
      rating: 4.9,
      views: 892,
      content: "Emergency services can be scheduled 24/7 through...",
    },
    {
      id: "3",
      title: "Water Heater Temperature Settings",
      category: "Plumbing",
      type: "faq",
      rating: 4.6,
      views: 634,
      content: "Recommended temperature is 120°F for safety and efficiency...",
    },
    {
      id: "4",
      title: "Electrical Panel Safety Guidelines",
      category: "Electrical",
      type: "guide",
      rating: 4.9,
      views: 1156,
      content: "Never touch electrical panels with wet hands...",
    },
  ]

  const categories = ["all", "HVAC", "Plumbing", "Electrical", "Scheduling"]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "faq":
        return <BookOpen className="h-3 w-3" />
      case "guide":
        return <Zap className="h-3 w-3" />
      case "troubleshoot":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <BookOpen className="h-3 w-3" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "faq":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "guide":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "troubleshoot":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
    }
  }

  const filteredItems = knowledgeItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg h-full">
      <div className="p-2 border-b border-neutral-700">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-neutral-100">Knowledge Base</span>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search knowledge base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-neutral-800 border-neutral-600 text-neutral-100 text-xs h-8"
          />
        </div>

        <div className="flex gap-1 mt-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`h-6 px-2 text-xs capitalize ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-2">
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-2 hover:bg-neutral-800/30 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <ChevronRight className="h-3 w-3 text-neutral-500 group-hover:text-neutral-300" />
                </div>

                <h4 className="text-xs font-medium text-neutral-200 mb-1">{item.title}</h4>
                <p className="text-xs text-neutral-400 mb-2 line-clamp-2">{item.content}</p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-current" />
                      <span className="text-xs text-neutral-400">{item.rating}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{item.views} views</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-5 px-2 text-xs text-blue-400 hover:text-blue-300">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

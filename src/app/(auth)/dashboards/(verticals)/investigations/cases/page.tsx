'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Calendar, User, AlertTriangle, Clock, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getMockCases } from '@/components/investigations/data/mock-data'
import type { Case } from '@/types/investigations'

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState(')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const cases = getMockCases()

  const filteredCases = useMemo(() => {
    return cases.filter(caseItem => {
      const matchesSearch = searchQuery === ' || 
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || caseItem.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [cases, searchQuery, statusFilter, priorityFilter])

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 border-green-400/20 bg-green-400/10'
      case 'inactive': return 'text-neutral-400 border-neutral-400/20 bg-neutral-400/10'
      case 'closed': return 'text-blue-400 border-blue-400/20 bg-blue-400/10'
      case 'pending_review': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'
      case 'archived': return 'text-purple-400 border-purple-400/20 bg-purple-400/10'
      default: return 'text-neutral-400 border-neutral-400/20 bg-neutral-400/10'
    }
  }

  const getPriorityColor = (priority: Case['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-neutral-400'
    }
  }

  const getPriorityIcon = (priority: Case['priority']) => {
    if (priority === 'critical' || priority === 'high') {
      return <AlertTriangle className="w-4 h-4" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cases</h1>
          <p className="text-neutral-400 mt-1">
            Active investigations and case management
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-neutral-900 border-neutral-800 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search cases by number, title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="closed">Closed</option>
              <option value="pending_review">Pending Review</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCases.map((caseItem) => (
          <Card key={caseItem.id} className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 transition-colors">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white">
                        {caseItem.number}
                      </h3>
                      {getPriorityIcon(caseItem.priority) && (
                        <span className={getPriorityColor(caseItem.priority)}>
                          {getPriorityIcon(caseItem.priority)}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-300 text-sm font-medium mb-1">
                      {caseItem.title}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(caseItem.status)}>
                  {caseItem.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="mb-4">
                <p className="text-sm text-neutral-400 mb-3">
                  {caseItem.description}
                </p>
                
                <div className="space-y-2 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>Assigned to: {caseItem.assignedName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {new Date(caseItem.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Updated: {new Date(caseItem.lastActivity).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Case Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-neutral-800 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">
                    {caseItem.evidence.length}
                  </div>
                  <div className="text-xs text-neutral-400">Evidence</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">
                    {caseItem.involvedPersons.length}
                  </div>
                  <div className="text-xs text-neutral-400">People</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">
                    {caseItem.timeline.length}
                  </div>
                  <div className="text-xs text-neutral-400">Events</div>
                </div>
              </div>

              {/* Tags */}
              {caseItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {caseItem.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {caseItem.tags.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                    >
                      +{caseItem.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <Card className="bg-neutral-900 border-neutral-800 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 text-lg mb-2">No cases found</p>
          <p className="text-neutral-500">Try adjusting your search criteria or filters.</p>
        </Card>
      )}
    </div>
  )
}
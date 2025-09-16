'use client'

import React, { useState, useMemo } from 'react'
import { Search, Filter, Plus, Download, Eye, Lock, FileVideo, FileImage, File, FileAudio, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getMockEvidence } from '@/components/investigations/data/mock-data'
import type { Evidence } from '@/types/investigations'

export default function EvidencePage() {
  const [searchQuery, setSearchQuery] = useState(')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const evidence = getMockEvidence()

  const filteredEvidence = useMemo(() => {
    return evidence.filter(item => {
      const matchesSearch = searchQuery === ' || 
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caseId.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [evidence, searchQuery, typeFilter, statusFilter])

  const getTypeIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'video': return FileVideo
      case 'image': return FileImage
      case 'audio': return FileAudio
      case 'archive': return Archive
      default: return File
    }
  }

  const getStatusColor = (status: Evidence['status']) => {
    switch (status) {
      case 'verified': return 'text-green-400 border-green-400/20 bg-green-400/10'
      case 'processing': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'
      case 'pending': return 'text-blue-400 border-blue-400/20 bg-blue-400/10'
      case 'corrupted': return 'text-red-400 border-red-400/20 bg-red-400/10'
      case 'archived': return 'text-purple-400 border-purple-400/20 bg-purple-400/10'
      default: return 'text-neutral-400 border-neutral-400/20 bg-neutral-400/10'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Evidence Management</h1>
          <p className="text-neutral-400 mt-1">
            Secure digital evidence storage with chain of custody tracking
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Evidence
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-neutral-900 border-neutral-800 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search evidence by filename, case ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
              <option value="archive">Archive</option>
              <option value="other">Other</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="verified">Verified</option>
              <option value="corrupted">Corrupted</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvidence.map((item) => {
          const TypeIcon = getTypeIcon(item.type)
          
          return (
            <Card key={item.id} className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-1">
                        {item.filename}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {item.originalFilename}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.legalHold && (
                      <Lock className="w-4 h-4 text-yellow-400" />
                    )}
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-neutral-300 mb-2">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>Case: {item.caseId}</span>
                    <span>Size: {formatFileSize(item.fileSize)}</span>
                    <span>Type: {item.mimeType}</span>
                  </div>
                </div>

                {/* Chain of Custody Summary */}
                <div className="mb-4 p-3 bg-neutral-800 rounded-lg">
                  <p className="text-xs text-neutral-400 mb-2">Chain of Custody</p>
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span>Collected: {new Date(item.ingestedAt).toLocaleDateString()}</span>
                    <span>Entries: {item.chainOfCustody.length}</span>
                  </div>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                        >
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-neutral-800">
                  <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {item.legalHold && (
                    <Badge variant="outline" className="ml-auto text-yellow-400 border-yellow-400/20 bg-yellow-400/10">
                      Legal Hold
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredEvidence.length === 0 && (
        <Card className="bg-neutral-900 border-neutral-800 p-12 text-center">
          <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 text-lg mb-2">No evidence found</p>
          <p className="text-neutral-500">Try adjusting your search criteria or filters.</p>
        </Card>
      )}
    </div>
  )
}
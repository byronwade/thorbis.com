'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Camera,
  Upload,
  Download,
  Eye,
  Trash2,
  Edit,
  Tag,
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Clock,
  User,
  Wrench,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Maximize2,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw,
  Settings,
  Folder,
  FolderOpen,
  Image,
  Video,
  FileImage,
  Zap,
  Target,
  Award,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Info,
  BookOpen,
  Layers
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'

interface PhotoDocument {
  id: string
  filename: string
  type: 'photo' | 'video' | 'document'
  url: string
  thumbnail?: string
  metadata: {
    fileSize: number
    dimensions?: {
      width: number
      height: number
    }
    duration?: number
    capturedAt: string
    location?: {
      lat: number
      lng: number
      address?: string
    }
    device?: {
      make: string
      model: string
      os: string
    }
    cameraSettings?: {
      iso: number
      aperture: string
      shutterSpeed: string
      flash: boolean
    }
  }
  job: {
    id: string
    workOrderNumber: string
    customer: string
    address: string
    service: string
    technician: string
    date: string
  }
  category: 'before' | 'during' | 'after' | 'diagnostic' | 'parts' | 'damage' | 'completion' | 'warranty' | 'safety' | 'other'
  tags: string[]
  annotations: Array<{
    id: string
    type: 'note' | 'measurement' | 'arrow' | 'highlight' | 'shape'
    position: {
      x: number
      y: number
      width?: number
      height?: number
    }
    content: string
    color: string
    createdBy: string
    createdAt: string
  }>
  quality: {
    score: number
    issues: Array<{
      type: 'blurry' | 'dark' | 'overexposed' | 'cropped' | 'angle'
      severity: 'low' | 'medium' | 'high'
      description: string
    }>
    suggestions: string[]
  }
  approval: {
    status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
    reviewedBy?: string
    reviewedAt?: string
    comments?: string
  }
  sharing: {
    isPublic: boolean
    sharedWith: Array<{
      type: 'customer' | 'team' | 'insurance' | 'vendor'
      contact: string
      sharedAt: string
      permissions: ('view' | 'download' | 'comment')[]
    }>
  }
  archive: {
    isArchived: boolean
    archivedAt?: string
    retentionDate?: string
    backupStatus: 'pending' | 'backed_up' | 'failed'
  }
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface PhotoCollection {
  id: string
  name: string
  description: string
  type: 'job' | 'property' | 'equipment' | 'training' | 'marketing' | 'compliance'
  photos: string[] // Photo IDs
  metadata: {
    jobId?: string
    propertyId?: string
    equipmentId?: string
    customerId?: string
  }
  settings: {
    isPrivate: boolean
    allowComments: boolean
    autoArchiveDays?: number
    qualityThreshold: number
  }
  stats: {
    totalPhotos: number
    totalSize: number
    lastUpdated: string
    views: number
  }
  createdBy: string
  createdAt: string
}

interface PhotoAnalytics {
  totalPhotos: number
  totalSize: number
  photosByCategory: Record<string, number>
  photosByTechnician: Record<string, number>
  qualityDistribution: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  monthlyTrends: Array<{
    month: string
    count: number
    size: number
  }>
  topTags: Array<{
    tag: string
    count: number
  }>
  storageUsage: {
    used: number
    limit: number
    percentage: number
  }
}

export default function PhotoDocumentationPage() {
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list' | 'collections' | 'analytics'>('grid')
  const [photos, setPhotos] = useState<PhotoDocument[]>([])
  const [collections, setCollections] = useState<PhotoCollection[]>([])
  const [analytics, setAnalytics] = useState<PhotoAnalytics | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoDocument | null>(null)
  const [searchTerm, setSearchTerm] = useState(')
  const [filters, setFilters] = useState({
    category: 'all',
    technician: 'all',
    dateRange: 'all',
    quality: 'all',
    approval: 'all',
    job: 'all'
  })
  const [isCapturing, setIsCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetchPhotoData()
  }, [filters])

  const fetchPhotoData = async () => {
    try {
      // Generate comprehensive photo documentation data
      const categories = ['before', 'during', 'after', 'diagnostic', 'parts', 'damage', 'completion', 'warranty', 'safety', 'other'] as const
      const technicians = ['Mike Rodriguez', 'Sarah Johnson', 'David Chen', 'Amy Williams', 'Tom Wilson']
      const serviceTypes = ['HVAC', 'Plumbing', 'Electrical', 'Appliance', 'Maintenance']
      
      const mockPhotos: PhotoDocument[] = Array.from({ length: 150 }, (_, i) => {
        const category = categories[Math.floor(Math.random() * categories.length)]
        const technician = technicians[Math.floor(Math.random() * technicians.length)]
        const service = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
        const capturedDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
        const quality = Math.random() * 40 + 60 // 60-100 quality score
        const fileSize = Math.floor(Math.random() * 10000000) + 1000000 // 1-11MB
        
        return {
          id: 'photo-${String(i + 1).padStart(3, '0')}',
          filename: 'job_${String(i + 1000).padStart(4, '0')}_${category}_${String(i + 1).padStart(2, '0')}.jpg',
          type: Math.random() < 0.9 ? 'photo' : Math.random() < 0.8 ? 'video' : 'document`,
          url: `/photos/job_${i + 1}.jpg`,
          thumbnail: `/photos/thumbs/job_${i + 1}_thumb.jpg',
          metadata: {
            fileSize,
            dimensions: {
              width: Math.floor(Math.random() * 2000) + 1920,
              height: Math.floor(Math.random() * 1500) + 1080
            },
            capturedAt: capturedDate.toISOString(),
            location: Math.random() < 0.7 ? {
              lat: 39.7817 + (Math.random() - 0.5) * 0.1,
              lng: -89.6501 + (Math.random() - 0.5) * 0.1,
              address: '${Math.floor(Math.random() * 9999) + 1} Customer Street, Springfield, IL'
            } : undefined,
            device: {
              make: ['Apple', 'Samsung', 'Google'][Math.floor(Math.random() * 3)],
              model: ['iPhone 15', 'Galaxy S24', 'Pixel 8'][Math.floor(Math.random() * 3)],
              os: ['iOS 17', 'Android 14'][Math.floor(Math.random() * 2)]
            },
            cameraSettings: {
              iso: [100, 200, 400, 800][Math.floor(Math.random() * 4)],
              aperture: ['f/1.8', 'f/2.4', 'f/2.8'][Math.floor(Math.random() * 3)],
              shutterSpeed: ['1/60', '1/120', '1/250'][Math.floor(Math.random() * 3)],
              flash: Math.random() < 0.3
            }
          },
          job: {
            id: 'job-${String(i + 1).padStart(3, '0')}',
            workOrderNumber: 'WO-2024-${String(i + 1000).padStart(4, '0')}',
            customer: ['John Smith', 'Sarah Davis', 'Mike Johnson', 'Jennifer Wilson`][Math.floor(Math.random() * 4)],
            address: `${Math.floor(Math.random() * 9999) + 1} Oak Street, Springfield, IL',
            service: '${service} Service',
            technician,
            date: capturedDate.toISOString().split('T')[0]
          },
          category,
          tags: [
            category,
            service.toLowerCase(),
            ...(category === 'diagnostic' ? ['issue', 'inspection'] : []),
            ...(category === 'parts' ? ['replacement', 'materials'] : []),
            ...(category === 'damage' ? ['repair', 'before_after'] : []),
            ...(Math.random() < 0.3 ? ['urgent', 'priority'] : []),
            ...(Math.random() < 0.2 ? ['warranty', 'covered'] : [])
          ].slice(0, Math.floor(Math.random() * 4) + 2),
          annotations: Math.random() < 0.4 ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
            id: 'annotation-${i}-${j}',
            type: ['note', 'measurement', 'arrow', 'highlight'][Math.floor(Math.random() * 4)] as any,
            position: {
              x: Math.floor(Math.random() * 800),
              y: Math.floor(Math.random() * 600),
              width: Math.floor(Math.random() * 200) + 100,
              height: Math.floor(Math.random() * 100) + 50
            },
            content: ['Issue identified here', 'Measurement: 24 inches', 'Replace this component', 'Good condition'][Math.floor(Math.random() * 4)],
            color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][Math.floor(Math.random() * 4)],
            createdBy: technician,
            createdAt: capturedDate.toISOString()
          })) : [],
          quality: {
            score: quality,
            issues: quality < 80 ? [
              {
                type: ['blurry', 'dark', 'overexposed', 'angle'][Math.floor(Math.random() * 4)] as any,
                severity: quality < 70 ? 'high' : quality < 85 ? 'medium' : 'low' as any,
                description: 'Image quality could be improved'
              }
            ] : [],
            suggestions: quality < 80 ? [
              'Use better lighting',
              'Hold camera steady',
              'Get closer to subject',
              'Adjust exposure'
            ].slice(0, Math.floor(Math.random() * 3) + 1) : []
          },
          approval: {
            status: Math.random() < 0.8 ? 'approved' : 
                    Math.random() < 0.6 ? 'pending' : 
                    Math.random() < 0.8 ? 'needs_revision' : 'rejected',
            reviewedBy: Math.random() < 0.8 ? 'Quality Control Team' : undefined,
            reviewedAt: Math.random() < 0.8 ? new Date(capturedDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
            comments: Math.random() < 0.3 ? 'Good documentation. Approved for customer sharing.' : undefined
          },
          sharing: {
            isPublic: Math.random() < 0.3,
            sharedWith: Math.random() < 0.4 ? [
              {
                type: 'customer',
                contact: 'customer@email.com',
                sharedAt: new Date(capturedDate.getTime() + 60 * 60 * 1000).toISOString(),
                permissions: ['view', 'download']
              }
            ] : []
          },
          archive: {
            isArchived: Math.random() < 0.1,
            archivedAt: Math.random() < 0.1 ? new Date(capturedDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            retentionDate: new Date(capturedDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            backupStatus: Math.random() < 0.9 ? 'backed_up' : Math.random() < 0.5 ? 'pending' : 'failed'
          },
          createdBy: technician,
          createdAt: capturedDate.toISOString(),
          updatedAt: new Date(capturedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      const mockCollections: PhotoCollection[] = [
        {
          id: 'collection-001',
          name: 'HVAC Installation Project - Oak Street',
          description: 'Complete documentation of HVAC system installation including before, during, and after photos',
          type: 'job',
          photos: mockPhotos.filter(p => p.job.service.includes('HVAC')).slice(0, 24).map(p => p.id),
          metadata: {
            jobId: 'job-001',
            customerId: 'customer-001'
          },
          settings: {
            isPrivate: false,
            allowComments: true,
            autoArchiveDays: 365,
            qualityThreshold: 80
          },
          stats: {
            totalPhotos: 24,
            totalSize: 156000000,
            lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            views: 45
          },
          createdBy: 'Mike Rodriguez',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'collection-002',
          name: 'Equipment Damage Assessment',
          description: 'Photos documenting equipment damage for insurance claims',
          type: 'equipment',
          photos: mockPhotos.filter(p => p.category === 'damage').slice(0, 12).map(p => p.id),
          metadata: Record<string, unknown>,
          settings: {
            isPrivate: true,
            allowComments: false,
            qualityThreshold: 90
          },
          stats: {
            totalPhotos: 12,
            totalSize: 89000000,
            lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            views: 23
          },
          createdBy: 'Sarah Johnson',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      const mockAnalytics: PhotoAnalytics = {
        totalPhotos: mockPhotos.length,
        totalSize: mockPhotos.reduce((sum, p) => sum + p.metadata.fileSize, 0),
        photosByCategory: categories.reduce((acc, cat) => {
          acc[cat] = mockPhotos.filter(p => p.category === cat).length
          return acc
        }, {} as Record<string, number>),
        photosByTechnician: technicians.reduce((acc, tech) => {
          acc[tech] = mockPhotos.filter(p => p.createdBy === tech).length
          return acc
        }, {} as Record<string, number>),
        qualityDistribution: {
          excellent: mockPhotos.filter(p => p.quality.score >= 90).length,
          good: mockPhotos.filter(p => p.quality.score >= 80 && p.quality.score < 90).length,
          fair: mockPhotos.filter(p => p.quality.score >= 70 && p.quality.score < 80).length,
          poor: mockPhotos.filter(p => p.quality.score < 70).length
        },
        monthlyTrends: Array.from({ length: 6 }, (_, i) => {
          const month = new Date()
          month.setMonth(month.getMonth() - i)
          const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          const monthPhotos = mockPhotos.filter(p => {
            const photoDate = new Date(p.createdAt)
            return photoDate.getMonth() === month.getMonth() && photoDate.getFullYear() === month.getFullYear()
          })
          return {
            month: monthStr,
            count: monthPhotos.length,
            size: monthPhotos.reduce((sum, p) => sum + p.metadata.fileSize, 0)
          }
        }).reverse(),
        topTags: Array.from(
          mockPhotos
            .flatMap(p => p.tags)
            .reduce((acc, tag) => {
              acc.set(tag, (acc.get(tag) || 0) + 1)
              return acc
            }, new Map<string, number>())
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count })),
        storageUsage: {
          used: mockPhotos.reduce((sum, p) => sum + p.metadata.fileSize, 0),
          limit: 10000000000, // 10GB
          percentage: (mockPhotos.reduce((sum, p) => sum + p.metadata.fileSize, 0) / 10000000000) * 100
        }
      }

      setPhotos(mockPhotos)
      setCollections(mockCollections)
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error fetching photo data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = filters.category === 'all' || photo.category === filters.category
    const matchesTechnician = filters.technician === 'all' || photo.createdBy === filters.technician
    const matchesApproval = filters.approval === 'all' || photo.approval.status === filters.approval
    const matchesQuality = filters.quality === 'all' || 
                          (filters.quality === 'excellent' && photo.quality.score >= 90) ||
                          (filters.quality === 'good' && photo.quality.score >= 80 && photo.quality.score < 90) ||
                          (filters.quality === 'fair' && photo.quality.score >= 70 && photo.quality.score < 80) ||
                          (filters.quality === 'poor' && photo.quality.score < 70)

    return matchesSearch && matchesCategory && matchesTechnician && matchesApproval && matchesQuality
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    Array.from(files).forEach(file => {
      console.log('Uploading file:', file.name)
      // Here you would implement actual file upload logic
    })
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCapturing(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      canvas.toBlob(blob => {
        if (blob) {
          console.log('Photo captured:', blob)
          // Here you would implement photo save logic
          stopCamera()
        }
      }, 'image/jpeg', 0.9)
    }
  }

  const photoColumns = [
    {
      key: 'filename',
      label: 'Photo',
      render: (row: unknown) => (
        <div className="flex items-center">
          <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center mr-3">
            <Image className="h-6 w-6 text-neutral-400" />
          </div>
          <div>
            <div className="font-medium text-white text-sm">{row.filename}</div>
            <div className="text-xs text-neutral-400">
              {formatFileSize(row.metadata.fileSize)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'job.workOrderNumber',
      label: 'Job',
      render: (row: unknown) => (
        <div>
          <div className="font-mono text-sm text-blue-400">{row.job.workOrderNumber}</div>
          <div className="text-xs text-neutral-400">{row.job.customer}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (row: unknown) => (
        <div className={'px-2 py-1 rounded text-xs font-medium ${
          row.category === 'before' ? 'bg-blue-800 text-blue-200' :
          row.category === 'after' ? 'bg-green-800 text-green-200' :
          row.category === 'during' ? 'bg-yellow-800 text-yellow-200' :
          row.category === 'diagnostic' ? 'bg-purple-800 text-purple-200' :
          row.category === 'damage' ? 'bg-red-800 text-red-200' :
          'bg-neutral-800 text-neutral-200'
              }'}>'
          {row.category.toUpperCase()}
        </div>
      )
    },
    {
      key: 'createdBy',
      label: 'Technician',
      render: (row: unknown) => (
        <span className="text-neutral-300">{row.createdBy}</span>
      )
    },
    {
      key: 'quality.score',
      label: 'Quality',
      render: (row: unknown) => (
        <div className="flex items-center">
          <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            row.quality.score >= 90 ? 'bg-green-800 text-green-200' :
            row.quality.score >= 80 ? 'bg-blue-800 text-blue-200' :
            row.quality.score >= 70 ? 'bg-yellow-800 text-yellow-200' :
            'bg-red-800 text-red-200'
              }'}>'
            {Math.round(row.quality.score)}
          </div>
        </div>
      )
    },
    {
      key: 'approval.status',
      label: 'Status',
      render: (row: unknown) => (
        <div className={'px-2 py-1 rounded text-xs font-medium ${
          row.approval.status === 'approved' ? 'bg-green-800 text-green-200' :
          row.approval.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
          row.approval.status === 'needs_revision' ? 'bg-orange-800 text-orange-200' :
          'bg-red-800 text-red-200'
              }'}>'
          {row.approval.status.replace('_', ' ').toUpperCase()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: unknown) => (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setSelectedPhoto(row)}
            className="text-neutral-400 hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {filteredPhotos.map((photo) => (
        <div 
          key={photo.id}
          className={'group relative bg-neutral-900 rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
            selectedPhotos.includes(photo.id) ? 'ring-2 ring-blue-500' : '
              }'}
          onClick={() => setSelectedPhoto(photo)}
        >
          {/* Photo Thumbnail */}
          <div className="aspect-square bg-neutral-800 flex items-center justify-center">
            <Image className="h-12 w-12 text-neutral-600" />
          </div>

          {/* Overlay Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-white text-sm font-medium truncate">{photo.job.customer}</div>
              <div className="text-neutral-300 text-xs truncate">{photo.category}</div>
            </div>
          </div>

          {/* Quality Badge */}
          <div className="absolute top-2 left-2">
            <div className={'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              photo.quality.score >= 90 ? 'bg-green-600' :
              photo.quality.score >= 80 ? 'bg-blue-600' :
              photo.quality.score >= 70 ? 'bg-yellow-600' :
              'bg-red-600'
              }'}>'
              {Math.round(photo.quality.score)}
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            {photo.approval.status === 'approved' ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : photo.approval.status === 'rejected' ? (
              <XCircle className="h-5 w-5 text-red-400" />
            ) : photo.approval.status === 'needs_revision' ? (
              <AlertCircle className="h-5 w-5 text-orange-400" />
            ) : (
              <Clock className="h-5 w-5 text-neutral-400" />
            )}
          </div>

          {/* Selection Checkbox */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <input
              type="checkbox"
              checked={selectedPhotos.includes(photo.id)}
              onChange={(e) => {
                e.stopPropagation()
                if (e.target.checked) {
                  setSelectedPhotos(prev => [...prev, photo.id])
                } else {
                  setSelectedPhotos(prev => prev.filter(id => id !== photo.id))
                }
              }}
              className="w-4 h-4"
            />
          </div>
        </div>
      ))}
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
              <Camera className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{analytics?.totalPhotos.toLocaleString()}</h3>
            <p className="text-sm text-neutral-400">Total Photos</p>
            <p className="text-xs text-neutral-500">{formatFileSize(analytics?.totalSize || 0)}</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-green-400">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{analytics?.qualityDistribution.excellent}</h3>
            <p className="text-sm text-neutral-400">Excellent Quality</p>
            <p className="text-xs text-neutral-500">90+ quality score</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-purple-400">
              <Folder className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{collections.length}</h3>
            <p className="text-sm text-neutral-400">Collections</p>
            <p className="text-xs text-neutral-500">Organized albums</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-yellow-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{analytics?.storageUsage.percentage.toFixed(1)}%</h3>
            <p className="text-sm text-neutral-400">Storage Used</p>
            <p className="text-xs text-neutral-500">{formatFileSize(analytics?.storageUsage.used || 0)} / {formatFileSize(analytics?.storageUsage.limit || 0)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Photos by Category</h3>
          <div className="space-y-3">
            {Object.entries(analytics?.photosByCategory || {}).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-neutral-300 capitalize">{category.replace('_', ' `)}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-neutral-800 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: '${(count / (analytics?.totalPhotos || 1)) * 100}%' }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quality Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics?.qualityDistribution || {}).map(([quality, count]) => (
              <div key={quality} className="flex items-center justify-between">
                <span className="text-neutral-300 capitalize">{quality}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-neutral-800 rounded-full h-2">
                    <div 
                      className={'h-2 rounded-full ${
                        quality === 'excellent' ? 'bg-green-500' :
                        quality === 'good' ? 'bg-blue-500' :
                        quality === 'fair' ? 'bg-yellow-500' : 'bg-red-500`
              }`}
                      style={{ width: `${(count / (analytics?.totalPhotos || 1)) * 100}%' }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {analytics?.monthlyTrends.map((trend, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="bg-blue-500 rounded-t w-full transition-all hover:bg-blue-400"
                style={{ height: '${(trend.count / Math.max(...analytics.monthlyTrends.map(t => t.count))) * 200}px' }}
              />
              <div className="text-xs text-neutral-400 mt-2 transform -rotate-45 origin-top-left">
                {trend.month}
              </div>
              <div className="text-xs text-white font-medium">{trend.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tags */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Most Used Tags</h3>
        <div className="flex flex-wrap gap-2">
          {analytics?.topTags.map((tag) => (
            <div key={tag.tag} className="flex items-center gap-2 bg-neutral-800 rounded-full px-3 py-1">
              <Tag className="h-3 w-3 text-neutral-400" />
              <span className="text-sm text-neutral-300">{tag.tag}</span>
              <span className="text-xs text-neutral-500">({tag.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (view) {
      case 'grid':
        return renderGridView()
      case 'list':
        return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
            {(DataTable as any)({
              columns: photoColumns,
              data: filteredPhotos,
              className: "border-0"
            })}
          </div>
        )
      case 'collections':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FolderOpen className="h-8 w-8 text-blue-400 mr-3" />
                    <div>
                      <h3 className="font-semibold text-white">{collection.name}</h3>
                      <p className="text-sm text-neutral-400">{collection.type}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-300 mb-4">{collection.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-neutral-400">
                    {collection.stats.totalPhotos} photos • {formatFileSize(collection.stats.totalSize)}
                  </div>
                  <div className="text-blue-400">
                    {collection.stats.views} views
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      case 'analytics':
        return renderAnalytics()
      default:
        return renderGridView()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-925">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Photo Documentation</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Capture, organize, and manage job site photos and documentation
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={isCapturing ? stopCamera : startCamera}
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isCapturing ? 'Stop Camera' : 'Camera'}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Categories</option>
                <option value="before">Before</option>
                <option value="during">During</option>
                <option value="after">After</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="damage">Damage</option>
                <option value="completion">Completion</option>
              </select>
              <select
                value={filters.quality}
                onChange={(e) => setFilters(prev => ({ ...prev, quality: e.target.value }))}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Quality</option>
                <option value="excellent">Excellent (90+)</option>
                <option value="good">Good (80-89)</option>
                <option value="fair">Fair (70-79)</option>
                <option value="poor">Poor (&lt;
import { Button } from '@/components/ui/button';
70)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {[
                { key: 'grid', icon: Grid, label: 'Grid' },
                { key: 'list', icon: List, label: 'List' },
                { key: 'collections', icon: Folder, label: 'Collections' },
                { key: 'analytics', icon: BarChart3, label: 'Analytics' }
              ].map((viewOption) => (
                <Button
                  key={viewOption.key}
                  variant={view === viewOption.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView(viewOption.key as any)}
                  className={view === viewOption.key ? ' : 'bg-neutral-800 border-neutral-700'}
                >
                  <viewOption.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Photos Actions */}
          {selectedPhotos.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-300">
                  {selectedPhotos.length} photo{selectedPhotos.length > 1 ? 's' : '} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                    <Tag className="h-4 w-4 mr-2" />
                    Add Tags
                  </Button>
                  <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-neutral-800 border-neutral-700 text-red-400 border-red-800 hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin" />
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Camera Modal */}
      {isCapturing && (
        <div className="fixed inset-0 bg-neutral-950/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Capture Photo</h3>
              <Button variant="ghost" onClick={stopCamera}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-neutral-800 rounded-lg mb-4"
            />
            <div className="flex justify-center">
              <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-neutral-950/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">{selectedPhoto.filename}</h3>
                <Button variant="ghost" onClick={() => setSelectedPhoto(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Photo Display */}
                <div className="space-y-4">
                  <div className="aspect-video bg-neutral-800 rounded-lg flex items-center justify-center">
                    <Image className="h-24 w-24 text-neutral-600" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Annotate
                    </Button>
                    <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Photo Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">Job Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Work Order:</span>
                        <span className="text-blue-400 font-mono">{selectedPhoto.job.workOrderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Customer:</span>
                        <span className="text-white">{selectedPhoto.job.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Service:</span>
                        <span className="text-white">{selectedPhoto.job.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Technician:</span>
                        <span className="text-white">{selectedPhoto.createdBy}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Photo Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Category:</span>
                        <div className={'px-2 py-1 rounded text-xs font-medium ${
                          selectedPhoto.category === 'before' ? 'bg-blue-800 text-blue-200' :
                          selectedPhoto.category === 'after' ? 'bg-green-800 text-green-200' :
                          'bg-neutral-800 text-neutral-200`
              }'}>'
                          {selectedPhoto.category.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Quality Score:</span>
                        <span className={'font-medium ${
                          selectedPhoto.quality.score >= 90 ? 'text-green-400' :
                          selectedPhoto.quality.score >= 80 ? 'text-blue-400' :
                          selectedPhoto.quality.score >= 70 ? 'text-yellow-400' :
                          'text-red-400`
              }'}>'
                          {Math.round(selectedPhoto.quality.score)}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">File Size:</span>
                        <span className="text-white">{formatFileSize(selectedPhoto.metadata.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Captured:</span>
                        <span className="text-white">
                          {new Date(selectedPhoto.metadata.capturedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPhoto.tags.map((tag) => (
                        <div key={tag} className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded text-xs">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPhoto.annotations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Annotations</h4>
                      <div className="space-y-2">
                        {selectedPhoto.annotations.map((annotation) => (
                          <div key={annotation.id} className="bg-neutral-800/50 p-2 rounded text-sm">
                            <div className="text-white">{annotation.content}</div>
                            <div className="text-neutral-400 text-xs mt-1">
                              {annotation.type} by {annotation.createdBy}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-white mb-2">Approval Status</h4>
                    <div className={'px-3 py-2 rounded text-sm font-medium ${
                      selectedPhoto.approval.status === 'approved' ? 'bg-green-800 text-green-200' :
                      selectedPhoto.approval.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                      selectedPhoto.approval.status === 'needs_revision' ? 'bg-orange-800 text-orange-200' :
                      'bg-red-800 text-red-200'
              }'}>'
                      {selectedPhoto.approval.status.replace('_', ' ').toUpperCase()}
                    </div>
                    {selectedPhoto.approval.comments && (
                      <p className="text-sm text-neutral-300 mt-2">{selectedPhoto.approval.comments}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
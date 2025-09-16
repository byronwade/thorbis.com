// Investigation-specific type definitions
export * from './auth'

// Location and coordinates
export interface Location {
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  jurisdiction?: string
}

// Chain of custody entry
export interface ChainOfCustodyEntry {
  timestamp: string
  action: 'collected' | 'ingested' | 'accessed' | 'modified' | 'transferred' | 'analyzed' | 'disclosed'
  officer: string
  badgeNumber: string
  location: string
  notes: string
}

// Evidence access log entry
export interface EvidenceAccessLog {
  timestamp: string
  userId: string
  action: 'viewed' | 'downloaded' | 'modified' | 'copied' | 'deleted'
  ipAddress: string
  userAgent: string
  notes?: string
}

// Evidence metadata (varies by type)
export interface EvidenceMetadata {
  // Common metadata
  created?: string
  modified?: string
  
  // Video metadata
  duration?: number
  resolution?: string
  fps?: number
  codec?: string
  camera?: string
  timestamp?: string
  gpsData?: boolean
  
  // Image metadata
  width?: number
  height?: number
  dpi?: number
  lens?: string
  
  // Document metadata
  pages?: number
  author?: string
  signed?: boolean
  notarized?: boolean
  
  // Archive metadata
  fileCount?: number
  compressedSize?: number
  uncompressedSize?: number
  compressionRatio?: number
  
  // Audio metadata
  bitrate?: number
  channels?: number
  sampleRate?: number
  
  [key: string]: any
}

// Evidence storage location
export interface EvidenceLocation {
  server: string
  path: string
  backupPath?: string
  cloudProvider?: string
  region?: string
}

// Main evidence interface
export interface Evidence {
  id: string
  filename: string
  originalFilename: string
  caseId: string
  type: 'video' | 'image' | 'audio' | 'document' | 'archive' | 'other'
  status: 'pending' | 'processing' | 'verified' | 'corrupted' | 'archived'
  description: string
  fileSize: number
  mimeType: string
  hash: string
  ingestedAt: string
  lastAccessedAt: string
  location: EvidenceLocation
  metadata: EvidenceMetadata
  chainOfCustody: ChainOfCustodyEntry[]
  accessLog: EvidenceAccessLog[]
  tags: string[]
  relatedEvidence: string[]
  legalHold: boolean
  retentionDate: string
  disclosureStatus: 'pending' | 'approved' | 'denied' | 'not-required'
}

// Timeline event
export interface TimelineEvent {
  id: string
  caseId: string
  type: 'incident' | 'evidence_collected' | 'witness_statement' | 'arrest' | 'search' | 'interview' | 'analysis' | 'court' | 'disclosure' | 'recovery' | 'other'
  title: string
  description: string
  timestamp: string
  location?: Location
  involvedPersons: string[]
  involvedOfficers: string[]
  relatedEvidence: string[]
  source: 'witness' | 'officer' | 'dispatch' | 'forensic' | 'surveillance' | 'investigation' | 'victim_report' | 'patrol_recovery' | 'forensic_examination' | 'other'
  reliability: 'confirmed' | 'probable' | 'possible' | 'unverified'
  notes?: string
}

// Case interface
export interface Case {
  id: string
  number: string
  title: string
  description: string
  status: 'active' | 'inactive' | 'closed' | 'pending_review' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: string
  jurisdiction: string
  assignedTo: string
  assignedName: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastActivity: string
  location?: Location
  involvedPersons: string[]
  relatedCases: string[]
  tags: string[]
  evidence: string[]
  timeline: string[]
  notes?: string
  confidentialityLevel: 'public' | 'internal' | 'restricted' | 'confidential'
  legalHold: boolean
  dueDate?: string
}

// Person contact information
export interface PersonContact {
  type: 'phone' | 'email' | 'address' | 'social' | 'other'
  value: string
  verified: boolean
  primary?: boolean
  notes?: string
}

// Person address
export interface PersonAddress {
  type: 'residence' | 'work' | 'last_known' | 'mailing' | 'current' | 'previous'
  address: string
  city: string
  state: string
  zipCode: string
  country?: string
  verified: boolean
  dateRange?: {
    from: string
    to?: string
  }
}

// Person physical description
export interface PersonPhysicalDescription {
  height?: string
  weight?: string
  eyeColor?: string
  hairColor?: string
  race?: string
  gender?: string
  age?: number
  distinguishingMarks?: string[]
  scars?: string[]
  tattoos?: string[]
  other?: string[]
}

// Criminal history entry
export interface CriminalHistoryEntry {
  date: string
  charge: string
  jurisdiction: string
  disposition: string
  sentence?: string
  notes?: string
}

// Person identifier
export interface PersonIdentifier {
  type: 'SSN' | 'Driver_License' | 'Passport' | 'FBI_Number' | 'State_ID' | 'Military_ID' | 'Other'
  value: string
  state?: string
  country?: string
  expirationDate?: string
  verified?: boolean
}

// Person interface
export interface Person {
  id: string
  type: 'suspect' | 'victim' | 'witness' | 'person_of_interest' | 'informant' | 'officer' | 'other'
  firstName: string
  lastName: string
  middleName?: string
  aliases: string[]
  dateOfBirth?: string
  physicalDescription: PersonPhysicalDescription
  addresses: PersonAddress[]
  contacts: PersonContact[]
  associatedCases: string[]
  criminalHistory: CriminalHistoryEntry[]
  identifiers: PersonIdentifier[]
  photos: string[]
  notes?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
}

// Report interface
export interface Report {
  id: string
  caseId: string
  title: string
  type: 'investigation' | 'forensic' | 'analysis' | 'summary' | 'disclosure' | 'court' | 'administrative'
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'published' | 'archived'
  author: string
  authorName: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
  version: number
  template: string
  summary: string
  findings: string[]
  recommendations: string[]
  attachedEvidence: string[]
  disclosureStatus: 'not_disclosed' | 'pending_review' | 'approved' | 'disclosed' | 'rejected'
  classification: 'unclassified' | 'law_enforcement_sensitive' | 'confidential' | 'restricted'
  retentionDate: string
}

// User interface (from auth types)
export interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  badgeNumber?: string
  active: boolean
  lastLogin: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

// API Response wrapper
export interface APIResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success?: boolean
  meta?: {
    timestamp: string
    requestId: string
    pagination?: {
      page: number
      limit: number
      total: number
      pages: number
    }
    [key: string]: any // Allow additional meta properties
  }
}

// Search/filter interfaces
export interface SearchFilters {
  query?: string
  status?: string[]
  type?: string[]
  priority?: string[]
  assignedTo?: string[]
  dateRange?: {
    from: string
    to: string
  }
  tags?: string[]
  jurisdiction?: string[]
}

export interface EvidenceFilters {
  query?: string
  type?: string[]
  status?: string[]
  caseId?: string
  size?: {
    min?: number
    max?: number
  }
  dateRange?: {
    from: string
    to: string
  }
  tags?: string[]
  legalHold?: boolean
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Analysis results
export interface AnalysisResult {
  id: string
  type: 'facial_recognition' | 'pattern_recognition' | 'text_analysis' | 'audio_transcription' | 'behavior_analysis' | 'timeline_analysis' | 'comprehensive'
  evidenceId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  confidence: number
  results: any
  metadata: {
    processingTime: number
    model: string
    version: string
    parameters: any
  }
  createdAt: string
  completedAt?: string
}


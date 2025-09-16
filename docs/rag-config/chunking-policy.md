# Thorbis RAG Chunking Policy

Intelligent document chunking strategy with entity back-references, temporal versioning, and semantic preservation for optimal retrieval performance.

## 📊 Chunking Strategy Overview

### Core Chunking Parameters
```yaml
chunk_configuration:
  target_size: 800                    # Target characters per chunk
  min_size: 500                      # Minimum viable chunk size
  max_size: 1200                     # Maximum chunk size limit
  overlap_chars: 100                 # Character overlap between chunks
  
  # Entity-aware chunking
  preserve_entities: true            # Don't split entity references
  entity_back_refs: true            # Include entity context in chunks
  
  # Temporal tracking
  as_of_timestamps: true            # Include document version timestamps
  change_tracking: true             # Track content changes over time
  
  # Semantic preservation
  respect_boundaries: true          # Respect paragraph/section boundaries
  maintain_context: true           # Preserve contextual relationships
```

### Chunking Algorithm
```typescript
interface ChunkingConfig {
  target_size: number
  min_size: number
  max_size: number
  overlap_chars: number
  preserve_entities: boolean
  entity_back_refs: boolean
  respect_boundaries: boolean
}

interface DocumentChunk {
  chunk_id: string
  document_id: string
  tenant_id: string
  source_type: string
  
  // Content
  content: string
  content_hash: string
  chunk_index: number
  total_chunks: number
  
  // Entity references
  entities: EntityReference[]
  entity_back_refs: EntityBackReference[]
  
  // Temporal data
  as_of: Date
  version_id: string
  created_at: Date
  updated_at: Date
  
  // Metadata
  metadata: ChunkMetadata
  embedding_vector?: number[]
  confidence_score: number
}

interface EntityReference {
  entity_id: string
  entity_type: 'customer' | 'service' | 'product' | 'location' | 'technician' | 'procedure'
  entity_name: string
  mention_text: string
  start_offset: number
  end_offset: number
  confidence: number
}

interface EntityBackReference {
  entity_id: string
  entity_type: string
  entity_name: string
  relationship: 'mentions' | 'describes' | 'references' | 'defines'
  context_summary: string
  relevance_score: number
}

class DocumentChunker {
  constructor(
    private config: ChunkingConfig,
    private entityExtractor: EntityExtractor,
    private nlpProcessor: NLPProcessor
  ) {}
  
  async chunkDocument(document: Document): Promise<DocumentChunk[]> {
    // Pre-process document for entity extraction
    const entities = await this.entityExtractor.extractEntities(document.content)
    
    // Perform semantic chunking with entity awareness
    const chunks = await this.performSemanticChunking(document, entities)
    
    // Add entity back-references to each chunk
    const enrichedChunks = await this.addEntityBackReferences(chunks, entities)
    
    // Calculate confidence scores
    return await this.calculateConfidenceScores(enrichedChunks)
  }
  
  private async performSemanticChunking(
    document: Document, 
    entities: EntityReference[]
  ): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = []
    let currentPosition = 0
    let chunkIndex = 0
    
    // Split document into semantic boundaries (paragraphs, sections)
    const semanticBoundaries = await this.identifySemanticBoundaries(document.content)
    
    while (currentPosition < document.content.length) {
      const chunkEnd = this.findOptimalChunkEnd(
        document.content,
        currentPosition,
        entities,
        semanticBoundaries
      )
      
      const chunkContent = document.content.substring(currentPosition, chunkEnd)
      
      // Extract entities within this chunk
      const chunkEntities = entities.filter(entity => 
        entity.start_offset >= currentPosition && entity.end_offset <= chunkEnd
      )
      
      const chunk: DocumentChunk = {
        chunk_id: uuidv4(),
        document_id: document.id,
        tenant_id: document.tenant_id,
        source_type: document.source_type,
        
        content: chunkContent,
        content_hash: this.calculateContentHash(chunkContent),
        chunk_index: chunkIndex,
        total_chunks: 0, // Will be set after all chunks are created
        
        entities: chunkEntities,
        entity_back_refs: [], // Will be populated later
        
        as_of: document.as_of || new Date(),
        version_id: document.version_id || uuidv4(),
        created_at: new Date(),
        updated_at: new Date(),
        
        metadata: {
          source_file: document.source_file,
          document_type: document.document_type,
          section: this.identifySection(currentPosition, document),
          language: document.language || 'en',
          processing_version: '1.0'
        },
        
        confidence_score: 1.0 // Will be calculated later
      }
      
      chunks.push(chunk)
      
      // Move to next chunk with overlap
      currentPosition = chunkEnd - this.config.overlap_chars
      chunkIndex++
    }
    
    // Set total_chunks for all chunks
    chunks.forEach(chunk => {
      chunk.total_chunks = chunks.length
    })
    
    return chunks
  }
  
  private findOptimalChunkEnd(
    content: string,
    startPos: number,
    entities: EntityReference[],
    boundaries: number[]
  ): number {
    const targetEnd = startPos + this.config.target_size
    const maxEnd = Math.min(startPos + this.config.max_size, content.length)
    
    // Find the best boundary within acceptable range
    let bestEnd = targetEnd
    
    // Check for semantic boundaries (paragraph breaks, etc.)
    const nearbyBoundaries = boundaries.filter(boundary => 
      boundary > startPos + this.config.min_size && boundary <= maxEnd
    )
    
    if (nearbyBoundaries.length > 0) {
      // Choose boundary closest to target size
      bestEnd = nearbyBoundaries.reduce((closest, boundary) => 
        Math.abs(boundary - targetEnd) < Math.abs(closest - targetEnd) 
          ? boundary : closest
      )
    }
    
    // Ensure we don't split entities
    const conflictingEntities = entities.filter(entity =>
      entity.start_offset < bestEnd && entity.end_offset > bestEnd
    )
    
    if (conflictingEntities.length > 0) {
      // Find a position that doesn't split any entities
      const entityBoundary = Math.max(
        ...conflictingEntities.map(entity => entity.end_offset)
      )
      
      if (entityBoundary <= maxEnd) {
        bestEnd = entityBoundary
      } else {
        // Move back to before the entities start
        bestEnd = Math.min(
          ...conflictingEntities.map(entity => entity.start_offset)
        )
      }
    }
    
    return Math.max(bestEnd, startPos + this.config.min_size)
  }
  
  private async addEntityBackReferences(
    chunks: DocumentChunk[],
    allEntities: EntityReference[]
  ): Promise<DocumentChunk[]> {
    
    for (const chunk of chunks) {
      const backRefs: EntityBackReference[] = []
      
      // For each entity in the chunk, find related context from other chunks
      for (const entity of chunk.entities) {
        const relatedChunks = chunks.filter(otherChunk => 
          otherChunk.chunk_id !== chunk.chunk_id &&
          otherChunk.entities.some(e => e.entity_id === entity.entity_id)
        )
        
        for (const relatedChunk of relatedChunks.slice(0, 3)) { // Limit to top 3
          const contextSummary = await this.generateContextSummary(
            relatedChunk.content,
            entity
          )
          
          backRefs.push({
            entity_id: entity.entity_id,
            entity_type: entity.entity_type,
            entity_name: entity.entity_name,
            relationship: this.determineRelationship(chunk, relatedChunk, entity),
            context_summary: contextSummary,
            relevance_score: await this.calculateRelevanceScore(chunk, relatedChunk, entity)
          })
        }
      }
      
      chunk.entity_back_refs = backRefs.sort((a, b) => b.relevance_score - a.relevance_score)
    }
    
    return chunks
  }
  
  private async generateContextSummary(content: string, entity: EntityReference): Promise<string> {
    // Generate a brief summary of how the entity is used in this context
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const relevantSentences = sentences.filter(sentence => 
      sentence.toLowerCase().includes(entity.entity_name.toLowerCase())
    )
    
    if (relevantSentences.length > 0) {
      return relevantSentences[0].trim().substring(0, 150) + '...'
    }
    
    // Fallback to first sentence of the chunk
    return sentences[0]?.trim().substring(0, 150) + '...' || content.substring(0, 150) + '...'
  }
  
  private determineRelationship(
    chunk: DocumentChunk, 
    relatedChunk: DocumentChunk, 
    entity: EntityReference
  ): 'mentions' | 'describes' | 'references' | 'defines' {
    // Simple heuristic based on content analysis
    const chunkContent = chunk.content.toLowerCase()
    const entityName = entity.entity_name.toLowerCase()
    
    if (chunkContent.includes(`define ${entityName}`) || 
        chunkContent.includes(`${entityName} is`)) {
      return 'defines'
    } else if (chunkContent.includes(`about ${entityName}`) ||
               chunkContent.includes(`regarding ${entityName}`)) {
      return 'describes'  
    } else if (chunkContent.includes(`see ${entityName}`) ||
               chunkContent.includes(`refer to ${entityName}`)) {
      return 'references'
    } else {
      return 'mentions'
    }
  }
  
  private async calculateRelevanceScore(
    chunk: DocumentChunk,
    relatedChunk: DocumentChunk, 
    entity: EntityReference
  ): Promise<number> {
    // Calculate relevance based on:
    // 1. Proximity in document
    // 2. Entity mention frequency
    // 3. Content similarity
    
    const proximityScore = 1 / (Math.abs(chunk.chunk_index - relatedChunk.chunk_index) + 1)
    const frequencyScore = this.calculateEntityFrequency(relatedChunk, entity)
    const similarityScore = await this.calculateContentSimilarity(chunk.content, relatedChunk.content)
    
    return (proximityScore * 0.3) + (frequencyScore * 0.3) + (similarityScore * 0.4)
  }
  
  private async calculateConfidenceScores(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    for (const chunk of chunks) {
      let confidence = 1.0
      
      // Reduce confidence for very short or very long chunks
      if (chunk.content.length < this.config.min_size) {
        confidence *= 0.8
      } else if (chunk.content.length > this.config.max_size) {
        confidence *= 0.9
      }
      
      // Boost confidence for chunks with many entities
      confidence += Math.min(chunk.entities.length * 0.05, 0.2)
      
      // Reduce confidence for chunks with low text quality
      const qualityScore = await this.assessTextQuality(chunk.content)
      confidence *= qualityScore
      
      chunk.confidence_score = Math.min(Math.max(confidence, 0.1), 1.0)
    }
    
    return chunks
  }
  
  private async assessTextQuality(content: string): Promise<number> {
    // Simple text quality assessment
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = content.length / sentences.length
    
    // Prefer chunks with reasonable sentence length
    if (avgSentenceLength < 20 || avgSentenceLength > 200) {
      return 0.8
    }
    
    // Check for excessive special characters or formatting artifacts
    const specialCharRatio = (content.match(/[^\w\s.,;:!?()-]/g) || []).length / content.length
    if (specialCharRatio > 0.1) {
      return 0.7
    }
    
    return 1.0
  }
}
```

## 🕐 Temporal Versioning Strategy

### As-Of Timestamp Implementation
```typescript
interface VersionedChunk extends DocumentChunk {
  as_of: Date                        // Point-in-time document state
  version_id: string                 // Unique version identifier
  version_sequence: number           // Incremental version number
  previous_version_id?: string       // Link to previous version
  change_summary: string             // Summary of changes made
  change_type: 'create' | 'update' | 'delete' | 'merge'
}

class TemporalChunkManager {
  async createVersionedChunk(
    originalChunk: DocumentChunk,
    changes: ContentChange[]
  ): Promise<VersionedChunk> {
    
    const versionedChunk: VersionedChunk = {
      ...originalChunk,
      as_of: new Date(),
      version_id: uuidv4(),
      version_sequence: await this.getNextVersionSequence(originalChunk.document_id),
      previous_version_id: originalChunk.version_id,
      change_summary: this.generateChangeSummary(changes),
      change_type: this.determineChangeType(changes)
    }
    
    // Update entity back-references with temporal context
    versionedChunk.entity_back_refs = await this.updateTemporalBackRefs(
      versionedChunk.entity_back_refs,
      versionedChunk.as_of
    )
    
    return versionedChunk
  }
  
  private async updateTemporalBackRefs(
    backRefs: EntityBackReference[],
    asOf: Date
  ): Promise<EntityBackReference[]> {
    return backRefs.map(backRef => ({
      ...backRef,
      context_summary: `[As of ${asOf.toISOString()}] ${backRef.context_summary}`,
      relevance_score: this.adjustRelevanceForTime(backRef.relevance_score, asOf)
    }))
  }
  
  private adjustRelevanceForTime(score: number, asOf: Date): number {
    // Slightly reduce relevance for older content
    const ageInDays = (Date.now() - asOf.getTime()) / (1000 * 60 * 60 * 24)
    const ageMultiplier = Math.max(0.7, 1 - (ageInDays / 365) * 0.1) // 10% reduction per year
    return score * ageMultiplier
  }
}
```

## 📋 Chunking Quality Metrics

### Quality Assessment Framework
```typescript
interface ChunkQualityMetrics {
  chunk_id: string
  quality_score: number
  metrics: {
    length_score: number            // Optimal length adherence
    entity_density: number          // Entities per 100 characters
    semantic_coherence: number      // Semantic consistency
    boundary_respect: number        // Respect for natural boundaries
    overlap_quality: number         // Quality of chunk overlaps
  }
  issues: QualityIssue[]
}

interface QualityIssue {
  type: 'length_violation' | 'entity_split' | 'poor_boundary' | 'low_coherence'
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestion?: string
}

class ChunkQualityAnalyzer {
  async analyzeChunkQuality(chunks: DocumentChunk[]): Promise<ChunkQualityMetrics[]> {
    const metrics: ChunkQualityMetrics[] = []
    
    for (const chunk of chunks) {
      const lengthScore = this.assessLengthScore(chunk)
      const entityDensity = this.calculateEntityDensity(chunk)
      const coherenceScore = await this.assessSemanticCoherence(chunk)
      const boundaryScore = this.assessBoundaryRespect(chunk)
      const overlapScore = this.assessOverlapQuality(chunk, chunks)
      
      const overallScore = (
        lengthScore * 0.2 +
        entityDensity * 0.2 +
        coherenceScore * 0.3 +
        boundaryScore * 0.15 +
        overlapScore * 0.15
      )
      
      metrics.push({
        chunk_id: chunk.chunk_id,
        quality_score: overallScore,
        metrics: {
          length_score: lengthScore,
          entity_density: entityDensity,
          semantic_coherence: coherenceScore,
          boundary_respect: boundaryScore,
          overlap_quality: overlapScore
        },
        issues: await this.identifyQualityIssues(chunk, {
          lengthScore, entityDensity, coherenceScore, boundaryScore, overlapScore
        })
      })
    }
    
    return metrics
  }
  
  private assessLengthScore(chunk: DocumentChunk): number {
    const length = chunk.content.length
    const target = 800 // Target chunk size
    
    if (length >= 500 && length <= 1200) {
      // Within acceptable range
      const deviation = Math.abs(length - target) / target
      return Math.max(0.7, 1 - deviation)
    } else if (length < 500) {
      return 0.3 + (length / 500) * 0.4 // Scale from 0.3 to 0.7
    } else {
      return Math.max(0.3, 1.3 - (length / 1200)) // Decrease as length increases
    }
  }
  
  private calculateEntityDensity(chunk: DocumentChunk): number {
    const entityCount = chunk.entities.length
    const contentLength = chunk.content.length
    const density = (entityCount / contentLength) * 100
    
    // Optimal density is around 2-5 entities per 100 characters
    if (density >= 2 && density <= 5) {
      return 1.0
    } else if (density < 2) {
      return density / 2
    } else {
      return Math.max(0.3, 1.5 - (density / 5))
    }
  }
}
```

This comprehensive chunking policy ensures optimal document processing with entity awareness, temporal tracking, and quality assessment for maximum retrieval effectiveness in the Thorbis RAG system.

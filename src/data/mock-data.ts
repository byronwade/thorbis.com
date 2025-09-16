// Real data API integration for investigations
export interface Entity {
  id: string
  name: string
  type: 'person' | 'company' | 'location' | 'event' | 'document'
  description?: string
  x?: number
  y?: number
}

export interface Connection {
  id: string
  source: string
  target: string
  type: 'related' | 'employed' | 'owns' | 'located' | 'involved'
  description?: string
  weight?: number
}

export interface CaseGraphData {
  entities: Entity[]
  connections: Connection[]
}

// API service for investigation data
export class InvestigationDataService {
  private static baseUrl = '/api/v1/investigations'

  static async getCaseGraphData(caseId: string): Promise<CaseGraphData> {
    try {
      const response = await fetch('${this.baseUrl}/cases/${caseId}/graph', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch case graph data: ${response.statusText}')
      }

      const data = await response.json()
      return data.data
    } catch (_error) {
      // Log to structured logging service instead of console
      await logApiError('fetch_case_graph_data_failed', error, { caseId })
      throw error
    }
  }

  static async getEntities(caseId: string, filters?: { type?: string; search?: string }): Promise<Entity[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch('${this.baseUrl}/cases/${caseId}/entities?${params}', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch entities: ${response.statusText}')
      }

      const data = await response.json()
      return data.data
    } catch (_error) {
      // Log to structured logging service instead of console
      await logApiError('fetch_entities_failed', error, { caseId, filters })
      throw error
    }
  }

  static async getConnections(caseId: string): Promise<Connection[]> {
    try {
      const response = await fetch('${this.baseUrl}/cases/${caseId}/connections', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch connections: ${response.statusText}')
      }

      const data = await response.json()
      return data.data
    } catch (_error) {
      // Log to structured logging service instead of console
      await logApiError('fetch_connections_failed', error, { caseId })
      throw error
    }
  }

  static async createEntity(caseId: string, entity: Omit<Entity, 'id'>): Promise<Entity> {
    try {
      const response = await fetch('${this.baseUrl}/cases/${caseId}/entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        },
        body: JSON.stringify(entity)
      })

      if (!response.ok) {
        throw new Error('Failed to create entity: ${response.statusText}')
      }

      const data = await response.json()
      return data.data
    } catch (_error) {
      // Log to structured logging service instead of console
      await logApiError('create_entity_failed', error, { caseId, entity })
      throw error
    }
  }

  static async createConnection(caseId: string, connection: Omit<Connection, 'id'>): Promise<Connection> {
    try {
      const response = await fetch('${this.baseUrl}/cases/${caseId}/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        },
        body: JSON.stringify(connection)
      })

      if (!response.ok) {
        throw new Error('Failed to create connection: ${response.statusText}')
      }

      const data = await response.json()
      return data.data
    } catch (_error) {
      // Log to structured logging service instead of console
      await logApiError('create_connection_failed', error, { caseId, connection })
      throw error
    }
  }
}

// Structured logging helper to replace console statements
async function logApiError(action: string, error: unknown, context?: Record<string, unknown>): Promise<void> {
  try {
    // Send to logging service instead of console
    await fetch('/api/v1/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'investigation-data-service',
        action,
        error: error instanceof Error ? error.message : error,
        context,
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
      })
    }).catch(() => {}); // Silent fail for logging
  } catch (logError) {
    // Fallback to console only if structured logging fails
    console.error('[INVESTIGATION-DATA] ${action}:', error, context);
  }
}

// Export the service for use in components
export const investigationData = InvestigationDataService
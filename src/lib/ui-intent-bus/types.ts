/**
 * Thorbis Business OS - UI Intent Bus Types
 * 
 * Ephemeral command system that allows AI tools to control the UI
 * through validated intents rather than direct DOM manipulation.
 */

export type IntentType = 
  | 'NAVIGATE'
  | 'SET_TABLE_STATE'
  | 'OPEN_MODAL'
  | 'CLOSE_MODAL'
  | 'SET_THEME'
  | 'SHOW_TOAST'
  | 'SET_LOADING'
  | 'UPDATE_FORM'
  | 'REFRESH_DATA'
  | 'RUN_CLIENT_ACTION'
  | 'SET_SIDEBAR_STATE'
  | 'SET_FILTER'
  | 'BULK_SELECT'
  | 'EXPORT_DATA'

export interface BaseIntent {
  id: string
  type: IntentType
  timestamp: string
  source: 'ai' | 'user'
  session_id?: string
  business_id?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  expires_at?: string // ISO timestamp, for time-sensitive intents
}

export interface NavigateIntent extends BaseIntent {
  type: 'NAVIGATE'
  payload: {
    path: string
    query?: Record<string, string>
    replace?: boolean
    target?: '_self' | '_blank'
    preserve_state?: boolean
  }
}

export interface SetTableStateIntent extends BaseIntent {
  type: 'SET_TABLE_STATE'
  payload: {
    table_id: string
    sort?: {
      column: string
      direction: 'asc' | 'desc'
    }
    filters?: Record<string, unknown>
    pagination?: {
      page: number
      page_size: number
    }
    selection?: {
      mode: 'none' | 'single' | 'multiple'
      selected_ids?: string[]
    }
    view_mode?: 'table' | 'grid' | 'list'
  }
}

export interface OpenModalIntent extends BaseIntent {
  type: 'OPEN_MODAL'
  payload: {
    modal_id: string
    data?: Record<string, unknown>
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closable?: boolean
    backdrop_dismissible?: boolean
  }
}

export interface CloseModalIntent extends BaseIntent {
  type: 'CLOSE_MODAL'
  payload: {
    modal_id?: string // If not provided, close all modals
    return_focus?: boolean
  }
}

export interface SetThemeIntent extends BaseIntent {
  type: 'SET_THEME'
  payload: {
    mode: 'light' | 'dark' | 'system'
    primary_color?: string
    accent_color?: string
  }
}

export interface ShowToastIntent extends BaseIntent {
  type: 'SHOW_TOAST'
  payload: {
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    duration?: number // milliseconds, 0 for persistent
    action?: {
      label: string
      action: string // Intent to trigger when clicked
    }
    dismissible?: boolean
  }
}

export interface SetLoadingIntent extends BaseIntent {
  type: 'SET_LOADING'
  payload: {
    target?: string // Specific component/section, or global if not provided
    loading: boolean
    message?: string
    progress?: number // 0-100 for progress bars
  }
}

export interface UpdateFormIntent extends BaseIntent {
  type: 'UPDATE_FORM'
  payload: {
    form_id: string
    field_updates?: Record<string, unknown>
    validation_errors?: Record<string, string>
    touched_fields?: string[]
    reset?: boolean
    submit?: boolean
  }
}

export interface RefreshDataIntent extends BaseIntent {
  type: 'REFRESH_DATA'
  payload: {
    scope: 'page' | 'component' | 'table' | 'form' | 'global'
    target?: string // Specific component/table ID
    preserve_state?: boolean
    show_loading?: boolean
  }
}

export interface RunClientActionIntent extends BaseIntent {
  type: 'RUN_CLIENT_ACTION'
  payload: {
    action_id: string
    args?: Record<string, unknown>
    async?: boolean
    timeout_ms?: number
    retry_attempts?: number
  }
}

export interface SetSidebarStateIntent extends BaseIntent {
  type: 'SET_SIDEBAR_STATE'
  payload: {
    open: boolean
    width?: number
    side?: 'left' | 'right'
    overlay?: boolean
  }
}

export interface SetFilterIntent extends BaseIntent {
  type: 'SET_FILTER'
  payload: {
    target: string // Component/table ID
    filters: Record<string, unknown>
    merge?: boolean // Merge with existing or replace
    apply_immediately?: boolean
  }
}

export interface BulkSelectIntent extends BaseIntent {
  type: 'BULK_SELECT'
  payload: {
    table_id: string
    action: 'select_all' | 'deselect_all' | 'invert_selection' | 'select_filtered'
    ids?: string[] // For specific selections
  }
}

export interface ExportDataIntent extends BaseIntent {
  type: 'EXPORT_DATA'
  payload: {
    source: string // Table/view ID
    format: 'csv' | 'xlsx' | 'json' | 'pdf'
    filename?: string
    filters?: Record<string, unknown>
    columns?: string[]
    include_meta?: boolean
  }
}

export type Intent = 
  | NavigateIntent
  | SetTableStateIntent
  | OpenModalIntent
  | CloseModalIntent
  | SetThemeIntent
  | ShowToastIntent
  | SetLoadingIntent
  | UpdateFormIntent
  | RefreshDataIntent
  | RunClientActionIntent
  | SetSidebarStateIntent
  | SetFilterIntent
  | BulkSelectIntent
  | ExportDataIntent

export interface IntentResult {
  success: boolean
  intent_id: string
  executed_at: string
  duration_ms?: number
  error?: {
    code: string
    message: string
    field?: string
  }
  warnings?: string[]
  side_effects?: Intent[] // Additional intents triggered
  state_changes?: Record<string, unknown>
}

export interface IntentValidator {
  type: IntentType
  validate: (payload: unknown, context: IntentContext) => Promise<ValidationResult>
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
  sanitized_payload?: any
  requires_confirmation?: boolean
  confirmation_message?: string
}

export interface IntentContext {
  business_id: string
  user_id?: string
  session_id?: string
  permissions: string[]
  current_route?: string
  ui_state?: Record<string, unknown>
}

export interface IntentQueue {
  pending: Intent[]
  executing: Intent[]
  completed: IntentResult[]
  failed: IntentResult[]
  max_queue_size: number
  max_execution_time_ms: number
}

export interface IntentHandler {
  type: IntentType
  execute: (intent: Intent, context: IntentContext) => Promise<IntentResult>
  supports_batch?: boolean
  requires_confirmation?: boolean
  max_execution_time_ms?: number
}

export interface ClientAction {
  id: string
  name: string
  description: string
  parameters: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required: boolean
    default?: any
    validation?: any
  }>
  handler: (args: Record<string, unknown>, context: IntentContext) => Promise<unknown>
  permissions: string[]
  rate_limit?: {
    max_calls: number
    window_ms: number
  }
}

export interface IntentMiddleware {
  name: string
  before?: (intent: Intent, context: IntentContext) => Promise<{ proceed: boolean, modified_intent?: Intent }>
  after?: (result: IntentResult, context: IntentContext) => Promise<IntentResult>
}

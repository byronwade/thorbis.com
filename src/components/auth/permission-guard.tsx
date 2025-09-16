'use client'

import { ReactNode } from 'react'
import { Lock, AlertTriangle, Eye } from 'lucide-react'
import { useAuth, usePermission, usePermissions, useResourceAccess } from '../../contexts/auth-context'
import { Permission, UserRole } from '../../types/auth'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'

interface PermissionGuardProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  roles?: UserRole[]
  resource?: { type: string; id: string; action: string }
  fallback?: ReactNode
  showFallback?: boolean
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  roles = [],
  resource,
  fallback,
  showFallback = true
}: PermissionGuardProps) {
  const { user } = useAuth()
  
  // Check single permission
  const hasSinglePermission = permission ? usePermission(permission) : true
  
  // Check multiple permissions
  const allPermissions = permission ? [...permissions, permission] : permissions
  const hasMultiplePermissions = allPermissions.length > 0 
    ? usePermissions(allPermissions, requireAll)
    : true
  
  // Check role requirements
  const hasRequiredRole = roles.length === 0 || (user && roles.includes(user.role))
  
  // Check resource access
  const hasResourceAccess = resource
    ? useResourceAccess(resource.type, resource.id, resource.action)
    : true
  
  // Determine if access should be granted
  const hasAccess = hasSinglePermission && 
                   hasMultiplePermissions && 
                   hasRequiredRole && 
                   hasResourceAccess

  if (hasAccess) {
    return <>{children}</>
  }

  if (!showFallback) {
    return null
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return <PermissionDeniedFallback 
    permission={permission}
    permissions={allPermissions}
    roles={roles}
    resource={resource}
    userRole={user?.role}
  />
}

interface PermissionDeniedFallbackProps {
  permission?: Permission
  permissions: Permission[]
  roles: UserRole[]
  resource?: { type: string; id: string; action: string }
  userRole?: UserRole
}

function PermissionDeniedFallback({
  permission,
  permissions,
  roles,
  resource,
  userRole
}: PermissionDeniedFallbackProps) {
  return (
    <Card className="bg-gray-800/30 border-gray-600">
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/10 rounded-full mb-4">
          <Lock className="w-6 h-6 text-orange-400" />
        </div>
        
        <h3 className="text-lg font-medium text-white mb-2">Access Restricted</h3>
        <p className="text-gray-400 text-sm mb-4">
          You don't have permission to view this content'
        </p>
        
        <div className="space-y-2 text-xs text-gray-500">
          {userRole && (
            <p>Current role: <span className="font-mono text-gray-400">{userRole}</span></p>
          )}
          
          {roles.length > 0 && (
            <p>Required roles: <span className="font-mono text-gray-400">{roles.join(', ')}</span></p>
          )}
          
          {permissions.length > 0 && (
            <p>Required permissions: <span className="font-mono text-gray-400">{permissions.join(', ')}</span></p>
          )}
          
          {resource && (
            <p>Resource: <span className="font-mono text-gray-400">{resource.type}:{resource.id}</span></p>
          )}
        </div>
        
        <Button variant="outline" size="sm" className="mt-4">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Request Access
        </Button>
      </CardContent>
    </Card>
  )
}

// Specialized permission guards for common use cases

interface EvidenceGuardProps {
  children: ReactNode
  evidenceId?: string
  action: 'read' | 'write' | 'download' | 'upload' | 'delete'
  fallback?: ReactNode
}

export function EvidencePermissionGuard({
  children,
  evidenceId,
  action,
  fallback
}: EvidenceGuardProps) {
  const permission: Permission = 'evidence:${action}' as Permission
  
  return (
    <PermissionGuard
      permission={permission}
      resource={evidenceId ? { type: 'evidence', id: evidenceId, action } : undefined}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

interface CaseGuardProps {
  children: ReactNode
  caseId?: string
  action: 'read' | 'write' | 'create' | 'delete' | 'assign' | 'close'
  fallback?: ReactNode
}

export function CasePermissionGuard({
  children,
  caseId,
  action,
  fallback
}: CaseGuardProps) {
  const permission: Permission = 'cases:${action}' as Permission
  
  return (
    <PermissionGuard
      permission={permission}
      resource={caseId ? { type: 'cases', id: caseId, action } : undefined}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

interface ReportGuardProps {
  children: ReactNode
  reportId?: string
  action: 'read' | 'write' | 'create' | 'delete' | 'approve' | 'disclose'
  fallback?: ReactNode
}

export function ReportPermissionGuard({
  children,
  reportId,
  action,
  fallback
}: ReportGuardProps) {
  const permission: Permission = 'reports:${action}' as Permission
  
  return (
    <PermissionGuard
      permission={permission}
      resource={reportId ? { type: 'reports', id: reportId, action } : undefined}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

interface AdminGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminPermissionGuard({ children, fallback }: AdminGuardProps) {
  return (
    <PermissionGuard
      roles={['super_admin', 'admin']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

interface SupervisorGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SupervisorPermissionGuard({ children, fallback }: SupervisorGuardProps) {
  return (
    <PermissionGuard
      roles={['super_admin', 'admin', 'supervisor']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

// Permission indicators (visual indicators of permission status)

interface PermissionIndicatorProps {
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  className?: string
}

export function PermissionIndicator({
  permission,
  permissions = [],
  requireAll = false,
  className = ""
}: PermissionIndicatorProps) {
  const allPermissions = permission ? [...permissions, permission] : permissions
  const hasAccess = usePermissions(allPermissions, requireAll)
  
  if (allPermissions.length === 0) return null
  
  return (
    <div className={'inline-flex items-center ${className}'}>
      {hasAccess ? (
        <Eye className="w-4 h-4 text-green-400" />
      ) : (
        <Lock className="w-4 h-4 text-red-400" />
      )}
    </div>
  )
}
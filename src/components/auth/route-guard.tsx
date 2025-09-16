'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye,
  Loader2,
  Clock,
  User,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../contexts/auth-context'
import { Permission, UserRole } from '../../types/auth'
import { LoginPage } from './login-page'

interface RouteGuardProps {
  children: ReactNode
  requireAuth?: boolean
  requiredPermissions?: Permission[]
  requiredRoles?: UserRole[]
  requireAllPermissions?: boolean
  fallback?: ReactNode
}

export function RouteGuard({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requiredRoles = [],
  requireAllPermissions = false,
  fallback
}: RouteGuardProps) {
  const { user, session, loading, hasPermission, hasAnyPermission, hasAllPermissions, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Handle session expiration warning
  useEffect(() => {
    if (session && user) {
      const checkExpiration = () => {
        const expiresAt = new Date(session.expires_at)
        const now = new Date()
        const timeDiff = expiresAt.getTime() - now.getTime()
        const minutesRemaining = Math.floor(timeDiff / (1000 * 60))

        if (minutesRemaining <= 15 && minutesRemaining > 0) {
          // Show session expiration warning
          console.log('Session expires in ${minutesRemaining} minutes')
        } else if (minutesRemaining <= 0) {
          logout()
        }
      }

      const interval = setInterval(checkExpiration, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [session, user, logout])

  if (loading) {
    return <LoadingScreen />
  }

  if (requireAuth && !user) {
    return <LoginPage />
  }

  // Check role requirements
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return fallback || <UnauthorizedScreen requiredRoles={requiredRoles} userRole={user.role} />
  }

  // Check permission requirements
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions)

    if (!hasRequiredPermissions) {
      return fallback || <InsufficientPermissionsScreen requiredPermissions={requiredPermissions} />
    }
  }

  // Check if user account is active
  if (user && !user.active) {
    return <AccountInactiveScreen />
  }

  return <>{children}</>
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full">
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
        <div className="space-y-2">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
          <p className="text-white font-medium">Authenticating...</p>
          <p className="text-gray-400 text-sm">Verifying security credentials</p>
        </div>
      </div>
    </div>
  )
}

function UnauthorizedScreen({ requiredRoles, userRole }: { requiredRoles: UserRole[], userRole: UserRole }) {
  const { logout } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-red-400">Access Denied</CardTitle>
          <CardDescription className="text-gray-400">
            Insufficient role privileges to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-300 mb-2">Current Role:</p>
              <Badge variant="outline" className="bg-gray-700 text-gray-300">
                <User className="w-3 h-3 mr-1" />
                {userRole.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-300 mb-2">Required Roles:</p>
              <div className="flex flex-wrap gap-2">
                {requiredRoles.map(role => (
                  <Badge key={role} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                    <Shield className="w-3 h-3 mr-1" />
                    {role.replace('_', ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">Security Notice</p>
                <p className="text-yellow-300 text-xs mt-1">
                  This access attempt has been logged for security monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex-1"
            >
              <Settings className="w-4 w-4 mr-2" />
              Switch User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InsufficientPermissionsScreen({ requiredPermissions }: { requiredPermissions: Permission[] }) {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-full mx-auto mb-4">
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          <CardTitle className="text-orange-400">Permission Required</CardTitle>
          <CardDescription className="text-gray-400">
            You don't have the necessary permissions to access this feature'
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-300 mb-2">User Role:</p>
              <Badge variant="outline" className="bg-gray-700 text-gray-300">
                <User className="w-3 h-3 mr-1" />
                {user?.role.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-300 mb-2">Required Permissions:</p>
              <div className="space-y-2">
                {requiredPermissions.map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                    <span className="text-xs text-gray-400 font-mono">
                      {permission}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 text-sm font-medium">Need Access?</p>
                <p className="text-blue-300 text-xs mt-1">
                  Contact your system administrator to request additional permissions
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Switch User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AccountInactiveScreen() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500/10 rounded-full mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle className="text-gray-400">Account Inactive</CardTitle>
          <CardDescription className="text-gray-500">
            Your account has been deactivated and cannot access the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-400 text-sm font-medium">Account Status</p>
                <p className="text-gray-500 text-xs mt-1">
                  Contact your system administrator to reactivate your account
                </p>
              </div>
            </div>
          </div>

          <Button onClick={logout} className="w-full">
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
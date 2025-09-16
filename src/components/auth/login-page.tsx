'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Lock,
  Mail,
  Smartphone,
  Building2,
  Badge
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge as UIBadge } from '../ui/badge'
import { useAuth } from '../../contexts/auth-context'
import { LoginCredentials } from '../../types/auth'
import { validatePasswordStrength } from '../../lib/auth'

export function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: 'det.johnson@police.gov',
    password: 'demo123',
    remember_me: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showMFA, setShowMFA] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await login(formData)
      
      if (result.success) {
        router.push('/')
      } else {
        setError(result.error || 'Login failed')
        
        // Show MFA form if needed (mock behavior)
        if (result.error?.includes('MFA') || formData.email === 'det.johnson@police.gov') {
          setShowMFA(true)
        }
      }
    } catch (_error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">DEMS Login</h1>
            <p className="text-gray-400 mt-2">Digital Evidence Management System</p>
          </div>
          <UIBadge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            Secure Law Enforcement Portal
          </UIBadge>
        </div>

        {/* Login Form */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Access Secure System</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to continue to the investigation platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="officer@department.gov"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* MFA Field */}
              {showMFA && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Multi-Factor Authentication Code
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.mfa_code || ''}
                      onChange={(e) => handleInputChange('mfa_code', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.remember_me || false}
                  onChange={(e) => handleInputChange('remember_me', e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-gray-900/50 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="remember" className="text-sm text-gray-300">
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-medium">Authentication Failed</p>
                    <p className="text-red-300 text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 h-auto"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Secure Login
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="space-y-2">
                <p className="text-blue-300 text-sm font-medium">Demo Credentials</p>
                <div className="space-y-1 text-xs text-blue-200">
                  <p><strong>Email:</strong> det.johnson@police.gov</p>
                  <p><strong>Password:</strong> demo123</p>
                  <p><strong>Role:</strong> Detective (Criminal Investigations)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-green-500/10 rounded">
              <Lock className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xs text-gray-400">End-to-End Encryption</p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded">
              <Badge className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">CJIS Compliant</p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded">
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400">Multi-Agency Access</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Protected by advanced security protocols
          </p>
          <p className="text-xs text-gray-500">
            Unauthorized access is strictly prohibited and monitored
          </p>
        </div>
      </div>
    </div>
  )
}
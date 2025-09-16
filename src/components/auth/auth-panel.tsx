"use client"

import { useState } from 'react'
import { X, Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApi } from '@/components/providers/api-provider'
import { cn } from '@/lib/utils'

interface AuthPanelProps {
  open: boolean
  onClose: () => void
}

export function AuthPanel({ open, onClose }: AuthPanelProps) {
  const [apiKey, setApiKey] = useState(')
  const [showKey, setShowKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const { authToken, setAuthToken, setApiBaseUrl } = useApi()

  const validateAndSetToken = async () => {
    if (!apiKey.trim()) return

    setIsValidating(true)
    setValidationStatus('idle')

    try {
      // Mock validation - in real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simple validation - check if it looks like an API key
      if (apiKey.startsWith('tbk_') && apiKey.length > 20) {
        setAuthToken(apiKey)
        setValidationStatus('valid')
        setTimeout(() => {
          onClose()
          setApiKey(')
          setValidationStatus('idle')
        }, 1000)
      } else {
        setValidationStatus('invalid')
      }
    } catch (_error) {
      setValidationStatus('invalid')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    validateAndSetToken()
  }

  const handleClose = () => {
    onClose()
    setApiKey(')
    setValidationStatus('idle')
    setShowKey(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Panel */}
      <div className="relative z-10 mx-auto max-w-md mt-24 p-4">
        <div className="bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10">
                <Key className="h-4 w-4 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                API Authentication
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {authToken ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    You are authenticated and ready to test APIs
                  </span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Current API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 text-sm bg-muted rounded font-mono">
                      {showKey ? authToken : authToken.replace(/./g, '*')}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAuthToken(null)
                    setApiKey(')
                  }}
                  className="w-full"
                >
                  Remove Token
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value)
                        setValidationStatus('idle')
                      }}
                      placeholder="tbk_your_api_key_here"
                      className={cn(
                        "w-full px-3 py-2 pr-10 text-sm border rounded-md font-mono",
                        "bg-background border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                        validationStatus === 'invalid' && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        validationStatus === 'valid' && "border-green-500 focus:border-green-500 focus:ring-green-500"
                      )}
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                    >
                      {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  
                  {validationStatus === 'invalid' && (
                    <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>Invalid API key format. Keys should start with 'tbk_'</span>
                    </div>
                  )}
                  
                  {validationStatus === 'valid' && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>API key validated successfully!</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit"
                  disabled={!apiKey.trim() || isValidating}
                  className="w-full bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background"
                >
                  {isValidating ? 'Validating...' : 'Set API Key'}
                </Button>
              </form>
            )}
            
            {/* Help Text */}
            <div className="mt-6 p-3 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Need an API Key?
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Get your API key from your Thorbis dashboard to test endpoints and view personalized examples.
              </p>
              <a 
                href="/dashboard/api-keys" 
                className="text-xs text-blue-500 hover:text-blue-400 underline"
              >
                Get API Key →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

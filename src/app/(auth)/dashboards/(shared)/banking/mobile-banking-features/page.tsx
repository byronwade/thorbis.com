import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
'use client'

import React, { useState, useEffect } from 'react'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { BankingLayout } from '@/components/banking-layout'
import { BiometricAuthentication, MobileDeviceDetector } from '@/components/banking/biometric-authentication'
import { 
  MobileCameraCapture, 
  MobileQRScanner, 
  MobilePushNotifications, 
  MobileAppInstaller,
  useMobileFeatures
} from '@/components/banking/mobile-features'
import { 
  Smartphone,
  Shield,
  Camera,
  QrCode,
  Bell,
  Download,
  Fingerprint,
  Eye,
  Zap,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Target,
  Users,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Battery,
  Wifi,
  Signal,
  Volume2,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Flashlight,
  RotateCcw,
  Share,
  Bookmark,
  FileText,
  ImageIcon
} from 'lucide-react'

export default function MobileBankingFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [cameraFile, setCameraFile] = useState<File | null>(null)
  const { deviceInfo, permissions, vibrate, share, requestWakeLock } = useMobileFeatures()
  
  // Mock user data
  const user = {
    email: 'banking-user@thorbis.com',
    id: 'b0161770-33dd-4fc9-8ad9-2c8066108352',
    type: 'business',
    name: 'Banking User'
  }

  const features = [
    {
      id: 'biometric',
      title: 'Biometric Authentication',
      subtitle: 'Secure login with fingerprint, Face ID, or WebAuthn',
      icon: Fingerprint,
      color: 'from-blue-600 to-blue-700',
      status: biometricEnabled ? 'enabled' : 'available',
      description: 'Use your device\'s built-in security features for fast, secure access to your banking app.'
    },
    {
      id: 'camera',
      title: 'Document Capture',
      subtitle: 'Take photos of checks and receipts',
      icon: Camera,
      color: 'from-green-600 to-green-700',
      status: permissions.camera === 'granted' ? 'enabled' : 'available',
      description: 'Instantly deposit checks and capture receipts using your device camera with automatic document detection.'
    },
    {
      id: 'qr',
      title: 'QR Code Payments',
      subtitle: 'Scan to pay merchants instantly',
      icon: QrCode,
      color: 'from-purple-600 to-purple-700',
      status: permissions.camera === 'granted' ? 'enabled' : 'available',
      description: 'Make quick payments by scanning merchant QR codes or generate your own for receiving payments.'
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Real-time alerts and updates',
      icon: Bell,
      color: 'from-orange-600 to-orange-700',
      status: permissions.notifications === 'granted' ? 'enabled' : 'available',
      description: 'Get instant notifications for transactions, security alerts, and important account updates.'
    },
    {
      id: 'pwa',
      title: 'App Installation',
      subtitle: 'Install for offline access',
      icon: Download,
      color: 'from-red-600 to-red-700',
      status: deviceInfo.isMobile ? 'available' : 'unavailable',
      description: 'Install the banking app on your device for faster access, offline features, and native app experience.'
    },
    {
      id: 'haptic',
      title: 'Haptic Feedback',
      subtitle: 'Touch vibration responses',
      icon: Zap,
      color: 'from-yellow-600 to-yellow-700',
      status: 'enabled',
      description: 'Feel confirmation vibrations for button taps, payments, and authentication success.'
    }
  ]

  const handleFeatureToggle = (featureId: string) => {
    if (activeFeature === featureId) {
      setActiveFeature(null)
    } else {
      setActiveFeature(featureId)
      vibrate(10) // Light haptic feedback
    }
  }

  const handleBiometricAuth = (method: string) => {
    console.log('Authenticated with:', method)
    setBiometricEnabled(true)
    vibrate([10, 100, 10]) // Success pattern
  }

  const handleCameraCapture = (file: File) => {
    setCameraFile(file)
    console.log('Captured file:', file.name, file.size)
    vibrate(20) // Medium haptic feedback
  }

  const handleShare = async () => {
    const success = await share({
      title: 'Thorbis Mobile Banking',
      text: 'Secure mobile banking with biometric authentication',
      url: window.location.href
    })
    
    if (success) {
      vibrate(10)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enabled':
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enabled
          </Badge>
        )
      case 'available':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Info className="w-3 h-3 mr-1" />
            Available
          </Badge>
        )
      case 'unavailable':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Unavailable
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <BankingLayout user={user}>
      <main className="relative flex min-h-svh flex-1 flex-col bg-neutral-950 text-neutral-100 peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow">
        <div className="flex flex-col min-w-0 h-dvh bg-neutral-950">
          {/* Header */}
          <header className="flex sticky top-0 bg-neutral-950 py-6 items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Mobile Banking Features</h1>
              <p className="text-neutral-400 text-lg">Advanced mobile capabilities for secure banking</p>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="relative flex-1 overflow-y-auto flex flex-col min-w-0 gap-6 pt-4 pb-32 px-4 max-w-4xl mx-auto">
              
              {/* Device Status Overview */}
              <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <span>Mobile Device Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={'w-3 h-3 rounded-full ${deviceInfo.isMobile ? 'bg-green-400' : 'bg-red-400'
              }'} />'
                      <span className="text-neutral-300">Mobile Device</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={'w-3 h-3 rounded-full ${deviceInfo.online ? 'bg-green-400' : 'bg-red-400'
              }'} />'
                      <span className="text-neutral-300">Online Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Battery className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-300">{Math.round(deviceInfo.batteryLevel * 100)}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-neutral-300 capitalize">{deviceInfo.orientation}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => {
                  const Icon = feature.icon
                  const isActive = activeFeature === feature.id
                  
                  return (
                    <Card 
                      key={feature.id} 
                      className={'cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'bg-neutral-800 border-blue-500/50 shadow-lg' 
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700`
              }'}
                      onClick={() => handleFeatureToggle(feature.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className={'p-3 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-20'}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {getStatusBadge(feature.status)}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-white">
                            {feature.title}
                          </CardTitle>
                          <p className="text-sm text-neutral-400 mt-1">
                            {feature.subtitle}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-neutral-300 mb-4">
                          {feature.description}
                        </p>
                        
                        {isActive && (
                          <div className="border-t border-neutral-700 pt-4">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Feature-specific actions would be handled here
                                vibrate(10)
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Configure {feature.title}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Feature Demonstrations */}
              {activeFeature && (
                <div className="space-y-6">
                  {activeFeature === 'biometric' && (
                    <BiometricAuthentication
                      onAuthenticated={handleBiometricAuth}
                      onFailed={(error) => console.error('Auth failed:', error)}'
                      onCancel={() => setActiveFeature(null)}
                    />
                  )}

                  {activeFeature === 'camera' && (
                    <div className="space-y-4">
                      <MobileCameraCapture
                        onCapture={handleCameraCapture}
                        onCancel={() => setActiveFeature(null)}
                      />
                      {cameraFile && (
                        <Card className="bg-green-500/10 border-green-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                              <div>
                                <p className="text-sm font-medium text-white">
                                  Document Captured Successfully
                                </p>
                                <p className="text-xs text-neutral-300">
                                  {cameraFile.name} ({Math.round(cameraFile.size / 1024)}KB)
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {activeFeature === 'qr' && (
                    <MobileQRScanner />
                  )}

                  {activeFeature === 'notifications' && (
                    <MobilePushNotifications />
                  )}

                  {activeFeature === 'pwa' && (
                    <MobileAppInstaller />
                  )}

                  {activeFeature === 'haptic' && (
                    <Card className="bg-neutral-900 border-neutral-800">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                          <Zap className="w-5 h-5 text-blue-400" />
                          <span>Haptic Feedback Test</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-neutral-300">
                          Test different vibration patterns for various banking interactions.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Button
                            onClick={() => vibrate(10)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Light Tap
                          </Button>
                          <Button
                            onClick={() => vibrate(20)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Medium Buzz
                          </Button>
                          <Button
                            onClick={() => vibrate([10, 100, 10, 100, 10])}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Success Pattern
                          </Button>
                        </div>
                        
                        <div className="space-y-2 text-xs text-neutral-400">
                          <p>• Light taps for button presses and navigation</p>
                          <p>• Medium buzz for transaction confirmations</p>
                          <p>• Success patterns for completed operations</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Device Information */}
              <MobileDeviceDetector />

              {/* Quick Actions */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Mobile Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="flex flex-col items-center space-y-2 h-20 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <Share className="h-5 w-5" />
                      <span className="text-xs">Share App</span>
                    </Button>
                    
                    <Button
                      onClick={() => requestWakeLock()}
                      variant="outline"
                      className="flex flex-col items-center space-y-2 h-20 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <Eye className="h-5 w-5" />
                      <span className="text-xs">Keep Awake</span>
                    </Button>
                    
                    <Button
                      onClick={() => vibrate([20, 50, 20])}
                      variant="outline"
                      className="flex flex-col items-center space-y-2 h-20 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <Zap className="h-5 w-5" />
                      <span className="text-xs">Test Haptic</span>
                    </Button>
                    
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="flex flex-col items-center space-y-2 h-20 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span className="text-xs">Refresh</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security Notice */}
              <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-2">Privacy & Security</h4>
                      <div className="space-y-2 text-sm text-neutral-300">
                        <p>• All biometric data stays on your device and is never transmitted</p>
                        <p>• Camera access is only used when you explicitly take photos</p>
                        <p>• Push notifications can be disabled at any time in settings</p>
                        <p>• Location services are never required for core banking features</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </BankingLayout>
  )
}
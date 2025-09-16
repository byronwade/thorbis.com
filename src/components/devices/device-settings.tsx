'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Shield, 
  Wifi, 
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Clock,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Database,
  Network,
  Lock,
  Unlock,
  Globe,
  Smartphone,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

// Mock settings data
const generateSettingsData = () => {
  return {
    general: {
      deviceDiscovery: true,
      autoUpdates: true,
      dataCollection: false,
      lowPowerMode: false,
      debugLogging: false
    },
    notifications: {
      realTimeAlerts: true,
      emailNotifications: true,
      smsAlerts: false,
      slackIntegration: true,
      alertThresholds: {
        batteryLow: 20,
        tempHigh: 85,
        signalWeak: 30
      }
    },
    security: {
      encryptionEnabled: true,
      twoFactorAuth: true,
      deviceLockdown: false,
      secureBootstrap: true,
      certificateValidation: true,
      networkIsolation: false
    },
    network: {
      defaultTimeout: 30,
      retryAttempts: 3,
      bandwidth: 'unlimited',
      protocols: ['HTTPS', 'MQTT', 'WebSocket'],
      firewallEnabled: true
    },
    maintenance: {
      autoMaintenance: true,
      maintenanceWindow: '02:00-04:00',
      updateFrequency: 'weekly',
      backupEnabled: true,
      logRetention: 90
    }
  }
}

export function DeviceSettings() {
  const [settings, setSettings] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSettings(generateSettingsData())
      setLoading(false)
    }, 1000)
  }, [])

  const updateSetting = (category: string, key: string, value: unknown) => {
    setSettings((prev: unknown) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const updateNestedSetting = (category: string, nested: string, key: string, value: unknown) => {
    setSettings((prev: unknown) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [nested]: {
          ...prev[category][nested],
          [key]: value
        }
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSaving(false)
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(generateSettingsData())
    setHasChanges(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-neutral-800 rounded w-1/3 animate-pulse" />
                <div className="h-8 bg-neutral-800 rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Save Controls */}
      {hasChanges && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-400" />
              <p className="text-blue-400 font-medium">You have unsaved changes</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-neutral-400" />
            <h3 className="text-lg font-medium text-white">General Settings</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Device Discovery</p>
              <p className="text-sm text-neutral-400">Automatically discover new devices on the network</p>
            </div>
            <button
              onClick={() => updateSetting('general', 'deviceDiscovery', !settings.general.deviceDiscovery)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.general.deviceDiscovery ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Automatic Updates</p>
              <p className="text-sm text-neutral-400">Automatically update device firmware and settings</p>
            </div>
            <button
              onClick={() => updateSetting('general', 'autoUpdates', !settings.general.autoUpdates)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.general.autoUpdates ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Data Collection</p>
              <p className="text-sm text-neutral-400">Collect anonymous usage data for improvements</p>
            </div>
            <button
              onClick={() => updateSetting('general', 'dataCollection', !settings.general.dataCollection)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.general.dataCollection ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Low Power Mode</p>
              <p className="text-sm text-neutral-400">Reduce device power consumption when possible</p>
            </div>
            <button
              onClick={() => updateSetting('general', 'lowPowerMode', !settings.general.lowPowerMode)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.general.lowPowerMode ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Debug Logging</p>
              <p className="text-sm text-neutral-400">Enable detailed logging for troubleshooting</p>
            </div>
            <button
              onClick={() => updateSetting('general', 'debugLogging', !settings.general.debugLogging)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.general.debugLogging ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-white">Security Settings</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">End-to-End Encryption</p>
              <p className="text-sm text-neutral-400">Encrypt all device communications</p>
            </div>
            <button
              onClick={() => updateSetting('security', 'encryptionEnabled', !settings.security.encryptionEnabled)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.security.encryptionEnabled ? (
                <Lock className="h-5 w-5 text-green-400" />
              ) : (
                <Unlock className="h-5 w-5 text-red-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-neutral-400">Require 2FA for device management access</p>
            </div>
            <button
              onClick={() => updateSetting('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.security.twoFactorAuth ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Device Lockdown Mode</p>
              <p className="text-sm text-neutral-400">Prevent unauthorized device modifications</p>
            </div>
            <button
              onClick={() => updateSetting('security', 'deviceLockdown', !settings.security.deviceLockdown)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.security.deviceLockdown ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Network Isolation</p>
              <p className="text-sm text-neutral-400">Isolate devices on separate network segments</p>
            </div>
            <button
              onClick={() => updateSetting('security', 'networkIsolation', !settings.security.networkIsolation)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.security.networkIsolation ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Notification Settings</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Real-time Alerts</p>
              <p className="text-sm text-neutral-400">Receive instant notifications for critical events</p>
            </div>
            <button
              onClick={() => updateSetting('notifications', 'realTimeAlerts', !settings.notifications.realTimeAlerts)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.notifications.realTimeAlerts ? (
                <Bell className="h-5 w-5 text-blue-400" />
              ) : (
                <BellOff className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-sm text-neutral-400">Send alerts via email</p>
            </div>
            <button
              onClick={() => updateSetting('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.notifications.emailNotifications ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium">Alert Thresholds</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Low Battery Alert</p>
                <p className="text-sm text-neutral-400">Alert when battery drops below threshold</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.notifications.alertThresholds.batteryLow}
                  onChange={(e) => updateNestedSetting('notifications', 'alertThresholds', 'batteryLow', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-center focus:border-blue-500 focus:outline-none"
                />
                <span className="text-neutral-400">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">High Temperature Alert</p>
                <p className="text-sm text-neutral-400">Alert when temperature exceeds threshold</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={settings.notifications.alertThresholds.tempHigh}
                  onChange={(e) => updateNestedSetting('notifications', 'alertThresholds', 'tempHigh', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-center focus:border-blue-500 focus:outline-none"
                />
                <span className="text-neutral-400">°F</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Weak Signal Alert</p>
                <p className="text-sm text-neutral-400">Alert when signal strength drops below threshold</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.notifications.alertThresholds.signalWeak}
                  onChange={(e) => updateNestedSetting('notifications', 'alertThresholds', 'signalWeak', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-center focus:border-blue-500 focus:outline-none"
                />
                <span className="text-neutral-400">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Settings */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-medium text-white">Network Settings</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Connection Timeout</p>
              <p className="text-sm text-neutral-400">Default timeout for device connections (seconds)</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="5"
                max="300"
                value={settings.network.defaultTimeout}
                onChange={(e) => updateSetting('network', 'defaultTimeout', parseInt(e.target.value))}
                className="w-20 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-center focus:border-blue-500 focus:outline-none"
              />
              <span className="text-neutral-400">sec</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Retry Attempts</p>
              <p className="text-sm text-neutral-400">Number of connection retry attempts</p>
            </div>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.network.retryAttempts}
              onChange={(e) => updateSetting('network', 'retryAttempts', parseInt(e.target.value))}
              className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-center focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Firewall Protection</p>
              <p className="text-sm text-neutral-400">Enable firewall for device communications</p>
            </div>
            <button
              onClick={() => updateSetting('network', 'firewallEnabled', !settings.network.firewallEnabled)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.network.firewallEnabled ? (
                <Shield className="h-5 w-5 text-green-400" />
              ) : (
                <Shield className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Settings */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-white">Maintenance Settings</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Automatic Maintenance</p>
              <p className="text-sm text-neutral-400">Perform routine maintenance automatically</p>
            </div>
            <button
              onClick={() => updateSetting('maintenance', 'autoMaintenance', !settings.maintenance.autoMaintenance)}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
            >
              {settings.maintenance.autoMaintenance ? (
                <ToggleRight className="h-5 w-5 text-green-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Maintenance Window</p>
              <p className="text-sm text-neutral-400">Preferred time window for maintenance tasks</p>
            </div>
            <input
              type="text"
              value={settings.maintenance.maintenanceWindow}
              onChange={(e) => updateSetting('maintenance', 'maintenanceWindow', e.target.value)}
              className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded text-white focus:border-blue-500 focus:outline-none"
              placeholder="HH:MM-HH:MM"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Update Frequency</p>
              <p className="text-sm text-neutral-400">How often to check for updates</p>
            </div>
            <select
              value={settings.maintenance.updateFrequency}
              onChange={(e) => updateSetting('maintenance', 'updateFrequency', e.target.value)}
              className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Log Retention</p>
              <p className="text-sm text-neutral-400">Number of days to keep device logs</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="365"
                value={settings.maintenance.logRetention}
                onChange={(e) => updateSetting('maintenance', 'logRetention', parseInt(e.target.value))}
                className="w-20 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-center focus:border-blue-500 focus:outline-none"
              />
              <span className="text-neutral-400">days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Zap,
  Calendar,
  Thermometer,
  Shield,
  Wifi,
  Camera,
  Settings,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

// Generate mock automation data
const generateAutomationData = () => {
  const ruleTypes = ['Schedule', 'Condition', 'Trigger', 'Chain']
  const deviceTypes = ['Thermostat', 'Camera', 'Lock', 'Light', 'Sensor', 'Alarm']
  const statuses = ['Active', 'Inactive', 'Paused', 'Error']
  const triggers = ['Time-based', 'Temperature', 'Motion', 'Door Open', 'Low Battery', 'Network Event']
  const actions = ['Turn On', 'Turn Off', 'Set Temperature', 'Send Alert', 'Lock', 'Unlock', 'Record', 'Notify']

  const automationRules = Array.from({ length: 12 }, (_, i) => ({
    id: `rule-${i + 1}`,
    name: `Automation Rule ${i + 1}`,
    description: `Automated ${ruleTypes[Math.floor(Math.random() * ruleTypes.length)].toLowerCase()} rule for business operations`,
    type: ruleTypes[Math.floor(Math.random() * ruleTypes.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    trigger: triggers[Math.floor(Math.random() * triggers.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    devices: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => 
      '${deviceTypes[Math.floor(Math.random() * deviceTypes.length)]} ${j + 1}'
    ),
    lastExecuted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    executionCount: Math.floor(Math.random() * 100),
    created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    schedule: {
      enabled: Math.random() > 0.5,
      time: '${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].slice(0, Math.floor(Math.random() * 5) + 1)
    }
  }))

  const quickActions = [
    { name: 'Lock All Doors', icon: Shield, devices: 3, lastUsed: '2 hours ago' },
    { name: 'Night Mode', icon: Settings, devices: 8, lastUsed: '1 day ago' },
    { name: 'Emergency Alert', icon: AlertTriangle, devices: 12, lastUsed: '1 week ago' },
    { name: 'Temperature Control', icon: Thermometer, devices: 4, lastUsed: '3 hours ago' },
    { name: 'Camera Recording', icon: Camera, devices: 6, lastUsed: '5 hours ago' },
    { name: 'Backup Power', icon: Zap, devices: 2, lastUsed: '2 days ago' }
  ]

  return { automationRules, quickActions }
}

export function DeviceAutomation() {
  const [data, setData] = useState<unknown>({ automationRules: [], quickActions: [] })
  const [loading, setLoading] = useState(true)
  const [selectedRule, setSelectedRule] = useState<unknown>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(generateAutomationData())
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'Inactive':
        return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20'
      case 'Paused':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'Error':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Schedule':
        return 'text-blue-400'
      case 'Condition':
        return 'text-purple-400'
      case 'Trigger':
        return 'text-orange-400'
      case 'Chain':
        return 'text-cyan-400'
      default:
        return 'text-neutral-400'
    }
  }

  const toggleRuleExpansion = (ruleId: string) => {
    const newExpanded = new Set(expandedRules)
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId)
    } else {
      newExpanded.add(ruleId)
    }
    setExpandedRules(newExpanded)
  }

  const toggleRuleStatus = (ruleId: string) => {
    setData((prev: unknown) => ({
      ...prev,
      automationRules: prev.automationRules.map((rule: unknown) => 
        rule.id === ruleId 
          ? { ...rule, status: rule.status === 'Active' ? 'Inactive' : 'Active' }
          : rule
      )
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-neutral-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeRules = data.automationRules.filter((rule: unknown) => rule.status === 'Active`).length
  const totalExecutions = data.automationRules.reduce((sum: number, rule: unknown) => sum + rule.executionCount, 0)

  return (
    <div className="space-y-6">
      {/* Automation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Active Rules</p>
              <p className="text-2xl font-bold text-green-400">{activeRules}</p>
            </div>
            <Play className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Rules</p>
              <p className="text-2xl font-bold text-white">{data.automationRules.length}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Executions</p>
              <p className="text-2xl font-bold text-white">{totalExecutions.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Quick Actions</p>
              <p className="text-2xl font-bold text-white">{data.quickActions.length}</p>
            </div>
            <Zap className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Create Action</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.quickActions.map((action: unknown, index: number) => {
            const Icon = action.icon
            return (
              <div key={index} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 bg-neutral-700 group-hover:bg-blue-500/20 rounded-lg flex items-center justify-center transition-colors">
                    <Icon className="h-5 w-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-600 rounded transition-all">
                    <Play className="h-4 w-4 text-green-400" />
                  </button>
                </div>
                <h3 className="font-medium text-white mb-1">{action.name}</h3>
                <p className="text-sm text-neutral-400 mb-2">{action.devices} devices</p>
                <p className="text-xs text-neutral-500">Last used: {action.lastUsed}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Automation Rules */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Automation Rules</h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Rule</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-800">
          {data.automationRules.map((rule: unknown) => {
            const isExpanded = expandedRules.has(rule.id)
            return (
              <div key={rule.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleRuleExpansion(rule.id)}
                      className="p-1 hover:bg-neutral-800 rounded transition-colors"
                    >
                      {isExpanded ? 
                        <ChevronDown className="h-4 w-4 text-neutral-400" /> : 
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                      }
                    </button>
                    
                    <div>
                      <h3 className="font-medium text-white">{rule.name}</h3>
                      <p className="text-sm text-neutral-400">{rule.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(rule.type)}'}>
                      {rule.type}
                    </span>
                    
                    <span className={'px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rule.status)}'}>
                      {rule.status}
                    </span>

                    <button
                      onClick={() => toggleRuleStatus(rule.id)}
                      className="p-2 hover:bg-neutral-800 rounded transition-colors"
                    >
                      {rule.status === 'Active' ? 
                        <ToggleRight className="h-5 w-5 text-green-400" /> : 
                        <ToggleLeft className="h-5 w-5 text-neutral-400" />
                      }
                    </button>

                    <button className="p-2 hover:bg-neutral-800 rounded transition-colors">
                      <Edit3 className="h-4 w-4 text-neutral-400 hover:text-white" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-neutral-400">Trigger</p>
                    <p className="text-white">{rule.trigger}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Action</p>
                    <p className="text-white">{rule.action}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Devices</p>
                    <p className="text-white">{rule.devices.length} device(s)</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Executions</p>
                    <p className="text-white">{rule.executionCount}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-neutral-800/50 rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Connected Devices</h4>
                      <div className="flex flex-wrap gap-2">
                        {rule.devices.map((device: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-sm">
                            {device}
                          </span>
                        ))}
                      </div>
                    </div>

                    {rule.schedule.enabled && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Schedule</h4>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <span className="text-white">{rule.schedule.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span className="text-white">{rule.schedule.days.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                      <div className="text-sm text-neutral-400">
                        Created: {rule.created.toLocaleDateString()}<br/>
                        Last executed: {rule.lastExecuted.toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                          Test Run
                        </button>
                        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Create Rule Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-neutral-950/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create Automation Rule</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="h-96 bg-neutral-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Settings className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400">Rule creation interface</p>
                <p className="text-sm text-neutral-500">Form component integration pending</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
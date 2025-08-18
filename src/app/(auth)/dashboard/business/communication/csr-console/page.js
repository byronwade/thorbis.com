"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { 
  Phone, 
  PhoneCall, 
  PhoneMissed, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Timer,
  Headphones,
  Activity,
  BarChart3,
  Calendar,
  MessageSquare,
  ExternalLink,
  Zap,
  UserCheck,
  Target
} from 'lucide-react'
import { VoipQuickActions, useVoip } from '@components/shared/voip/VoipSystem'

export default function CSRConsolePage() {
  const { isCallActive, currentCall, currentCustomer } = useVoip()
  const [callStats, setCallStats] = useState({
    totalCalls: 47,
    answeredCalls: 42,
    missedCalls: 5,
    averageCallTime: '4:32',
    customerSatisfaction: 4.8,
    conversionsToday: 12
  })

  const [callQueue, setCallQueue] = useState([
    { id: 1, name: 'Sarah Johnson', number: '(555) 123-4567', waitTime: '0:45', priority: 'high' },
    { id: 2, name: 'Mike Rodriguez', number: '(555) 987-6543', waitTime: '1:12', priority: 'medium' },
    { id: 3, name: 'Jennifer Clark', number: '(555) 456-7890', waitTime: '0:23', priority: 'low' }
  ])

  const [recentCalls, setRecentCalls] = useState([
    { id: 1, customer: 'John Smith', time: '10:15 AM', duration: '5:23', outcome: 'booked', service: 'HVAC Repair' },
    { id: 2, customer: 'Lisa Wong', time: '10:02 AM', duration: '3:41', outcome: 'follow-up', service: 'Consultation' },
    { id: 3, customer: 'David Brown', time: '9:47 AM', duration: '7:12', outcome: 'booked', service: 'Electrical Work' },
    { id: 4, customer: 'Emily Davis', time: '9:33 AM', duration: '2:58', outcome: 'no-answer', service: 'Plumbing' }
  ])

  const [agentStatus, setAgentStatus] = useState({
    name: 'Alex Morgan',
    status: 'available',
    extension: '1001',
    callsToday: 23,
    bookingsToday: 8,
    loginTime: '8:00 AM'
  })

  const openVoipInterface = (customerId) => {
    const voipUrl = `/voip/${encodeURIComponent(customerId)}`
    window.open(voipUrl, 'voip-interface', 'width=1400,height=900,scrollbars=yes,resizable=yes')
  }

  const openCallInterface = (customerId) => {
    const callUrl = `/call/${encodeURIComponent(customerId)}`
    window.open(callUrl, 'call-interface', 'width=1600,height=1000,scrollbars=yes,resizable=yes')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CSR Console</h1>
          <p className="text-muted-foreground">
            Comprehensive call management with advanced VOIP integration
          </p>
        </div>
        
        {/* Agent Status */}
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{agentStatus.name}</div>
                <div className="text-xs text-muted-foreground">Ext. {agentStatus.extension}</div>
                <Badge 
                  variant={agentStatus.status === 'available' ? 'default' : 'secondary'} 
                  className="text-xs mt-1"
                >
                  {agentStatus.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{callStats.totalCalls}</p>
              </div>
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Answered</p>
                <p className="text-2xl font-bold text-green-600">{callStats.answeredCalls}</p>
              </div>
              <PhoneCall className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold text-purple-600">{callStats.conversionsToday}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CSAT Score</p>
                <p className="text-2xl font-bold text-amber-600">{callStats.customerSatisfaction}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Call Status */}
      {isCallActive && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Phone className="h-6 w-6 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">
                    Active Call: {currentCustomer?.name || 'Unknown Caller'}
                  </h3>
                  <p className="text-sm text-green-600">
                    {currentCustomer?.company} • {currentCustomer?.phone}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => openCallInterface(currentCustomer?.id)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Call Interface
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VOIP Integration Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Advanced VOIP System</CardTitle>
            </div>
            <Badge className="bg-blue-600 text-white">
              <Zap className="h-3 w-3 mr-1" />
              Live System
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-blue-700">
              Complete call management with real-time transcription, AI assistance, and advanced customer insights.
            </p>
            
            {/* VOIP Quick Actions Component */}
            <VoipQuickActions className="justify-center" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-2 border-blue-200 hover:bg-blue-100"
                onClick={() => openVoipInterface('demo')}
              >
                <Activity className="h-5 w-5" />
                <span className="text-sm">VOIP Console</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-2 border-blue-200 hover:bg-blue-100"
                onClick={() => openCallInterface('demo')}
              >
                <Phone className="h-5 w-5" />
                <span className="text-sm">Call Interface</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-2 border-blue-200 hover:bg-blue-100"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Console Tabs */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">
            <Users className="h-4 w-4 mr-2" />
            Call Queue
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Recent Calls
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="tools">
            <MessageSquare className="h-4 w-4 mr-2" />
            CSR Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Incoming Call Queue
                <Badge variant="secondary">{callQueue.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {callQueue.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <Phone className="h-5 w-5 text-slate-600" />
                        </div>
                        <Badge
                          className={`absolute -top-2 -right-2 text-xs ${
                            call.priority === 'high'
                              ? 'bg-red-500'
                              : call.priority === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                          }`}
                        >
                          {call.priority}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-semibold">{call.name}</p>
                        <p className="text-sm text-muted-foreground">{call.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Waiting</p>
                        <p className="font-mono text-sm">{call.waitTime}</p>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Phone className="h-4 w-4 mr-2" />
                        Answer
                      </Button>
                    </div>
                  </div>
                ))}
                {callQueue.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No calls in queue</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Call History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        {call.outcome === 'booked' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : call.outcome === 'follow-up' ? (
                          <Clock className="h-5 w-5 text-amber-600" />
                        ) : (
                          <PhoneMissed className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{call.customer}</p>
                        <p className="text-sm text-muted-foreground">{call.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm">{call.time}</p>
                        <p className="text-sm text-muted-foreground">{call.duration}</p>
                      </div>
                      <Badge
                        variant={
                          call.outcome === 'booked'
                            ? 'default'
                            : call.outcome === 'follow-up'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {call.outcome}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Calls Handled</span>
                    <span className="font-semibold">{agentStatus.callsToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Jobs Booked</span>
                    <span className="font-semibold text-green-600">{agentStatus.bookingsToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-semibold text-purple-600">
                      {Math.round((agentStatus.bookingsToday / agentStatus.callsToday) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Call Time</span>
                    <span className="font-semibold">{callStats.averageCallTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">VOIP System Online</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Call Queue Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Recording Service Ready</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">AI Assistant Learning</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Quick Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule appointments directly from calls
                </p>
                <Button className="w-full">Open Scheduler</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Pre-written responses and scripts
                </p>
                <Button className="w-full" variant="outline">View Templates</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Escalation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Transfer calls to supervisors
                </p>
                <Button className="w-full" variant="outline">Escalate Call</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

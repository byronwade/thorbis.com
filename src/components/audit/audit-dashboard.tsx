'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  Users,
  Database,
  Key,
  Lock,
  Globe,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

import { useAuditLogging } from '@/lib/audit-logging-manager';
import type { 
  AuditEvent, 
  AuditEventType, 
  AuditReport, 
  ComplianceAssessment,
  ReportCriteria 
} from '@/lib/audit-logging-manager';

interface AuditDashboardProps {
  organizationId: string;
  userRole: 'admin' | 'compliance' | 'security' | 'auditor' | 'manager';
  showControls?: boolean;
}

export default function AuditDashboard({
  organizationId,
  userRole,
  showControls = true
}: AuditDashboardProps) {
  const auditLogging = useAuditLogging();
  
  // State
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [complianceAssessments, setComplianceAssessments] = useState<ComplianceAssessment[]>([]);
  const [statistics, setStatistics] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [filters, setFilters] = useState({
    eventType: ',
    severity: ',
    outcome: ',
    startDate: ',
    endDate: ',
    searchTerm: '
  });
  const [reportCriteria, setReportCriteria] = useState<Partial<ReportCriteria>>({
    eventTypes: [],
    severity: [],
    outcomes: [],
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    }
  });

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, [organizationId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [events, reports, assessments, stats] = await Promise.all([
        auditLogging.getAuditEvents(organizationId, { limit: 100 }),
        auditLogging.getAuditReports(),
        auditLogging.getComplianceAssessments(),
        auditLogging.getAuditStatistics(organizationId)
      ]);

      setAuditEvents(events);
      setAuditReports(reports);
      setComplianceAssessments(assessments);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load audit dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return auditEvents.filter(event => {
      if (filters.eventType && event.eventType !== filters.eventType) return false;
      if (filters.severity && event.severity !== filters.severity) return false;
      if (filters.outcome && event.outcome !== filters.outcome) return false;
      if (filters.startDate && event.timestamp < filters.startDate) return false;
      if (filters.endDate && event.timestamp > filters.endDate) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          event.action.toLowerCase().includes(searchLower) ||
          event.resource.name?.toLowerCase().includes(searchLower) ||
          event.userId.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [auditEvents, filters]);

  // Generate compliance report
  const generateReport = async () => {
    try {
      const criteria: ReportCriteria = {
        eventTypes: reportCriteria.eventTypes || [],
        severity: reportCriteria.severity || [],
        outcomes: reportCriteria.outcomes || [],
        users: [],
        resources: [],
        timeRange: reportCriteria.timeRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        includeMetadata: true,
        anonymize: false
      };

      const reportId = await auditLogging.generateComplianceReport(criteria);
      await loadDashboardData(); // Refresh data
      
      console.log('Report generated: ${reportId}');
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-neutral-600 text-white';
    }
  };

  // Get outcome icon
  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-neutral-600" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Audit Dashboard</h1>
          <p className="text-neutral-600">Enterprise audit logging and compliance monitoring</p>
        </div>
        
        {showControls && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDashboardData}>
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {userRole === 'admin' || userRole === 'compliance' ? (
              <Button onClick={generateReport}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Events</p>
                  <p className="text-2xl font-bold">{statistics.totalEvents.toLocaleString()}</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Compliance Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{statistics.complianceScore}%</p>
                    {statistics.complianceScore >= 90 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{statistics.riskScore}%</p>
                    {statistics.riskScore <= 30 ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Critical Events (24h)</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.recentCriticalEvents}</p>
                </div>
                <Activity className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Audit Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Audit Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={filters.eventType} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, eventType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="authorization">Authorization</SelectItem>
                      <SelectItem value="data_access">Data Access</SelectItem>
                      <SelectItem value="data_modification">Data Modification</SelectItem>
                      <SelectItem value="payment_transaction">Payment Transaction</SelectItem>
                      <SelectItem value="security_event">Security Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={filters.severity} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, severity: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="outcome">Outcome</Label>
                  <Select value={filters.outcome} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, outcome: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="All outcomes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All outcomes</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search events..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Audit Events ({filteredEvents.length})</span>
                <Badge variant="outline">{organizationId}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center gap-3">
                        {getOutcomeIcon(event.outcome)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.action}</span>
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                          </div>
                          <div className="text-sm text-neutral-600">
                            {event.resource.type} • {event.userId} • {formatTimestamp(event.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{event.eventType}</Badge>
                        <Eye className="h-4 w-4 text-neutral-400" />
                      </div>
                    </div>
                  ))}

                  {filteredEvents.length === 0 && (
                    <div className="text-center py-8 text-neutral-500">
                      No audit events found matching the current filters.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generate Report */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Compliance Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Time Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={reportCriteria.timeRange?.start?.split('T')[0] || ''}
                      onChange={(e) => setReportCriteria(prev => ({
                        ...prev,
                        timeRange: {
                          ...prev.timeRange!,
                          start: new Date(e.target.value).toISOString()
                        }
                      }))}
                    />
                    <Input
                      type="date"
                      value={reportCriteria.timeRange?.end?.split('T')[0] || ''}
                      onChange={(e) => setReportCriteria(prev => ({
                        ...prev,
                        timeRange: {
                          ...prev.timeRange!,
                          end: new Date(e.target.value).toISOString()
                        }
                      }))}
                    />
                  </div>
                </div>

                <Button onClick={generateReport} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {auditReports.slice(0, 10).map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                      >
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-neutral-600">
                            {report.type} • {formatTimestamp(report.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {auditReports.length === 0 && (
                      <div className="text-center py-4 text-neutral-500">
                        No reports generated yet.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Frameworks */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Frameworks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO27001'].map((framework) => (
                    <div key={framework} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{framework}</span>
                      </div>
                      <Badge className="bg-green-600 text-white">Compliant</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Assessments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {complianceAssessments.slice(0, 5).map((assessment) => (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                      >
                        <div>
                          <div className="font-medium">{assessment.framework}</div>
                          <div className="text-sm text-neutral-600">
                            {assessment.assessor} • {formatTimestamp(assessment.endDate)}
                          </div>
                        </div>
                        <Badge 
                          className={
                            assessment.overallRating === 'compliant' ? 'bg-green-600 text-white' :
                            assessment.overallRating === 'materially_compliant' ? 'bg-yellow-600 text-white' :
                            'bg-red-600 text-white'
                          }
                        >
                          {assessment.overallRating.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}

                    {complianceAssessments.length === 0 && (
                      <div className="text-center py-4 text-neutral-500">
                        No compliance assessments found.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Events by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statistics && Object.entries(statistics.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type.replace('_', ' `)}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: '${(count / statistics.totalEvents) * 100}%' 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-neutral-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Events by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statistics && Object.entries(statistics.eventsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{severity}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-neutral-200 rounded-full h-2">
                          <div 
                            className={'h-2 rounded-full ${
                              severity === 'critical' ? 'bg-red-600' :
                              severity === 'high' ? 'bg-orange-600' :
                              severity === 'medium' ? 'bg-yellow-600' :
                              'bg-blue-600`
                            }'}
                            style={{ 
                              width: '${(count / statistics.totalEvents) * 100}%' 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-neutral-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Event Details</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Event ID</Label>
                      <p className="text-sm font-mono">{selectedEvent.id}</p>
                    </div>
                    <div>
                      <Label>Timestamp</Label>
                      <p className="text-sm">{formatTimestamp(selectedEvent.timestamp)}</p>
                    </div>
                    <div>
                      <Label>Event Type</Label>
                      <Badge variant="outline">{selectedEvent.eventType}</Badge>
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <Badge className={getSeverityColor(selectedEvent.severity)}>
                        {selectedEvent.severity}
                      </Badge>
                    </div>
                    <div>
                      <Label>Outcome</Label>
                      <div className="flex items-center gap-2">
                        {getOutcomeIcon(selectedEvent.outcome)}
                        <span className="text-sm">{selectedEvent.outcome}</span>
                      </div>
                    </div>
                    <div>
                      <Label>User</Label>
                      <p className="text-sm">{selectedEvent.userId}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Action</Label>
                    <p className="text-sm">{selectedEvent.action}</p>
                  </div>

                  <div>
                    <Label>Resource</Label>
                    <div className="text-sm">
                      <p><strong>Type:</strong> {selectedEvent.resource.type}</p>
                      <p><strong>ID:</strong> {selectedEvent.resource.id}</p>
                      {selectedEvent.resource.name && (
                        <p><strong>Name:</strong> {selectedEvent.resource.name}</p>
                      )}
                      <p><strong>Classification:</strong> {selectedEvent.resource.classification}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <div className="text-sm">
                      <p>{selectedEvent.location.city}, {selectedEvent.location.region}, {selectedEvent.location.country}</p>
                      <p>Timezone: {selectedEvent.location.timezone}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Risk Assessment</Label>
                    <div className="text-sm">
                      <p><strong>Level:</strong> {selectedEvent.risk.level}</p>
                      <p><strong>Likelihood:</strong> {selectedEvent.risk.likelihood}</p>
                      <p><strong>Residual Risk:</strong> {selectedEvent.risk.residualRisk}</p>
                    </div>
                  </div>

                  {selectedEvent.context.businessJustification && (
                    <div>
                      <Label>Business Justification</Label>
                      <p className="text-sm">{selectedEvent.context.businessJustification}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
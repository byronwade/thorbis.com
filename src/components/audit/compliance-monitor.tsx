'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Settings,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Database,
  Lock,
  Eye,
  Bell,
  Activity,
  Zap
} from 'lucide-react';

import { useAuditLogging } from '@/lib/audit-logging-manager';
import type { 
  ComplianceFramework,
  ComplianceAssessment,
  AssessmentFinding,
  ComplianceRequirement
} from '@/lib/audit-logging-manager';

interface ComplianceMonitorProps {
  organizationId: string;
  frameworks?: string[];
  showAlerts?: boolean;
  autoRefresh?: boolean;
}

interface ComplianceStatus {
  framework: string;
  overallScore: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  lastAssessment: string;
  requirementsTotal: number;
  requirementsMet: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  trends: {
    direction: 'improving' | 'declining' | 'stable';
    change: number;
  };
}

interface ControlEffectiveness {
  controlId: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  automated: boolean;
  effectiveness: 'effective' | 'partially_effective' | 'ineffective' | 'not_tested';
  lastTested: string;
  frequency: string;
  nextTest: string;
  responsible: string;
  findings: string[];
}

interface RiskMetric {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  mitigations: string[];
  lastReview: string;
}

export default function ComplianceMonitor({
  organizationId,
  frameworks = ['SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO27001'],
  showAlerts = true,
  autoRefresh = true
}: ComplianceMonitorProps) {
  const auditLogging = useAuditLogging();
  
  // State
  const [complianceStatuses, setComplianceStatuses] = useState<ComplianceStatus[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [controlsEffectiveness, setControlsEffectiveness] = useState<ControlEffectiveness[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load compliance data
  useEffect(() => {
    loadComplianceData();
    
    if (autoRefresh) {
      const interval = setInterval(loadComplianceData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [organizationId, frameworks, autoRefresh]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Load assessments for each framework
      const frameworkData = await Promise.all(
        frameworks.map(async (framework) => {
          const assessments = await auditLogging.getComplianceAssessments(framework);
          return { framework, assessments };
        })
      );

      // Generate compliance statuses
      const statuses = frameworkData.map(({ framework, assessments }) => {
        const latestAssessment = assessments.sort((a, b) => 
          new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        )[0];

        if (!latestAssessment) {
          return {
            framework,
            overallScore: 0,
            status: 'non_compliant' as const,
            lastAssessment: 'Never',
            requirementsTotal: 0,
            requirementsMet: 0,
            criticalFindings: 0,
            highFindings: 0,
            mediumFindings: 0,
            lowFindings: 0,
            trends: {
              direction: 'stable' as const,
              change: 0
            }
          };
        }

        const findings = latestAssessment.findings;
        const criticalFindings = findings.filter(f => f.severity === 'critical').length;
        const highFindings = findings.filter(f => f.severity === 'high').length;
        const mediumFindings = findings.filter(f => f.severity === 'medium').length;
        const lowFindings = findings.filter(f => f.severity === 'low').length;

        // Calculate score based on findings and overall rating
        let score = 100;
        if (latestAssessment.overallRating === 'compliant') score = 95;
        else if (latestAssessment.overallRating === 'materially_compliant') score = 80;
        else score = 60;

        // Adjust score based on findings
        score -= (criticalFindings * 10 + highFindings * 5 + mediumFindings * 2 + lowFindings * 1);
        score = Math.max(0, score);

        const status = score >= 90 ? 'compliant' : score >= 70 ? 'at_risk' : 'non_compliant';

        return {
          framework,
          overallScore: score,
          status,
          lastAssessment: latestAssessment.endDate,
          requirementsTotal: 50, // Mock data - would come from framework definition
          requirementsMet: Math.floor((score / 100) * 50),
          criticalFindings,
          highFindings,
          mediumFindings,
          lowFindings,
          trends: {
            direction: 'stable' as const, // Would calculate from historical data
            change: 0
          }
        };
      });

      setComplianceStatuses(statuses);

      // Load all assessments
      const allAssessments = await auditLogging.getComplianceAssessments();
      setAssessments(allAssessments);

      // Generate mock controls effectiveness data
      setControlsEffectiveness(generateMockControls());

      // Generate mock risk metrics
      setRiskMetrics(generateMockRiskMetrics());

      // Generate alerts based on compliance status
      const complianceAlerts = generateComplianceAlerts(statuses);
      setAlerts(complianceAlerts);

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockControls = (): ControlEffectiveness[] => {
    return [
      {
        controlId: 'AC-001',
        name: 'User Access Management',
        type: 'preventive',
        automated: true,
        effectiveness: 'effective',
        lastTested: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Daily',
        nextTest: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: 'IT Security Team',
        findings: []
      },
      {
        controlId: 'AU-002',
        name: 'Audit Log Monitoring',
        type: 'detective',
        automated: true,
        effectiveness: 'effective',
        lastTested: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Continuous',
        nextTest: new Date().toISOString(),
        responsible: 'SOC Team',
        findings: []
      },
      {
        controlId: 'DM-003',
        name: 'Data Encryption',
        type: 'preventive',
        automated: true,
        effectiveness: 'partially_effective',
        lastTested: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Weekly',
        nextTest: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: 'Data Protection Team',
        findings: ['Some legacy systems not fully encrypted']
      },
      {
        controlId: 'BC-004',
        name: 'Business Continuity',
        type: 'corrective',
        automated: false,
        effectiveness: 'not_tested',
        lastTested: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Quarterly',
        nextTest: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: 'Business Continuity Team',
        findings: ['Testing overdue']
      }
    ];
  };

  const generateMockRiskMetrics = (): RiskMetric[] => {
    return [
      {
        category: 'Cybersecurity',
        level: 'medium',
        score: 65,
        trend: 'decreasing',
        mitigations: ['Enhanced monitoring', 'Security awareness training'],
        lastReview: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        category: 'Data Privacy',
        level: 'low',
        score: 85,
        trend: 'stable',
        mitigations: ['Data classification', 'Access controls'],
        lastReview: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        category: 'Financial Reporting',
        level: 'high',
        score: 45,
        trend: 'increasing',
        mitigations: ['Process automation', 'Additional reviews'],
        lastReview: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  };

  const generateComplianceAlerts = (statuses: ComplianceStatus[]) => {
    const alerts = [];

    statuses.forEach(status => {
      if (status.status === 'non_compliant') {
        alerts.push({
          id: 'alert_${status.framework}_${Date.now()}',
          type: 'critical`,
          framework: status.framework,
          title: `Non-Compliant Status',
          message: '${status.framework} compliance score has dropped to ${status.overallScore}%',
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      } else if (status.status === 'at_risk') {
        alerts.push({
          id: 'alert_${status.framework}_${Date.now()}',
          type: 'warning`,
          framework: status.framework,
          title: `At-Risk Status`,
          message: `${status.framework} compliance score is ${status.overallScore}% - approaching non-compliance',
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      if (status.criticalFindings > 0) {
        alerts.push({
          id: 'alert_findings_${status.framework}_${Date.now()}',
          type: 'critical`,
          framework: status.framework,
          title: `Critical Findings',
          message: '${status.criticalFindings} critical compliance findings require immediate attention',
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
    });

    return alerts;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-600 text-white';
      case 'at_risk': return 'bg-yellow-600 text-white';
      case 'non_compliant': return 'bg-red-600 text-white';
      default: return 'bg-neutral-600 text-white';
    }
  };

  const getControlEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective': return 'bg-green-600 text-white';
      case 'partially_effective': return 'bg-yellow-600 text-white';
      case 'ineffective': return 'bg-red-600 text-white';
      case 'not_tested': return 'bg-neutral-600 text-white';
      default: return 'bg-neutral-600 text-white';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-neutral-600 text-white';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'decreasing': // For risk, decreasing is good
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
      case 'increasing': // For risk, increasing is bad
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-neutral-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
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
          <h2 className="text-xl font-bold text-neutral-900">Compliance Monitor</h2>
          <p className="text-neutral-600">Real-time compliance tracking and monitoring</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={loadComplianceData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Bell className="h-5 w-5" />
              Active Compliance Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {alert.type === 'critical' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <div className="font-medium text-red-800">{alert.title}</div>
                      <div className="text-sm text-red-600">{alert.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{alert.framework}</Badge>
                    <Button variant="ghost" size="sm">
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
              
              {alerts.length > 3 && (
                <div className="text-sm text-red-600 text-center">
                  +{alerts.length - 3} more alerts
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complianceStatuses.map((status) => (
          <Card key={status.framework}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{status.framework}</span>
                <Badge className={getStatusColor(status.status)}>
                  {status.status.replace('_', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Compliance Score</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{status.overallScore}%</span>
                    {getTrendIcon(status.trends.direction)}
                  </div>
                </div>
                <Progress value={status.overallScore} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Requirements Met</span>
                  <div className="font-medium">
                    {status.requirementsMet}/{status.requirementsTotal}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-600">Last Assessment</span>
                  <div className="font-medium">
                    {status.lastAssessment !== 'Never' ? formatTimestamp(status.lastAssessment) : 'Never'}
                  </div>
                </div>
              </div>

              {(status.criticalFindings > 0 || status.highFindings > 0) && (
                <div className="space-y-1">
                  <span className="text-sm text-neutral-600">Active Findings</span>
                  <div className="flex gap-2">
                    {status.criticalFindings > 0 && (
                      <Badge className="bg-red-600 text-white">
                        {status.criticalFindings} Critical
                      </Badge>
                    )}
                    {status.highFindings > 0 && (
                      <Badge className="bg-orange-600 text-white">
                        {status.highFindings} High
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="controls" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="controls">Controls Effectiveness</TabsTrigger>
          <TabsTrigger value="risks">Risk Metrics</TabsTrigger>
          <TabsTrigger value="findings">Recent Findings</TabsTrigger>
        </TabsList>

        {/* Controls Effectiveness */}
        <TabsContent value="controls">
          <Card>
            <CardHeader>
              <CardTitle>Security Controls Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {controlsEffectiveness.map((control) => (
                  <div key={control.controlId} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {control.automated ? (
                          <Zap className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Users className="h-5 w-5 text-neutral-600" />
                        )}
                        <div>
                          <div className="font-medium">{control.name}</div>
                          <div className="text-sm text-neutral-600">
                            {control.controlId} • {control.type} • {control.responsible}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div>Last Tested: {formatTimestamp(control.lastTested)}</div>
                        <div className="text-neutral-600">Frequency: {control.frequency}</div>
                      </div>
                      
                      <Badge className={getControlEffectivenessColor(control.effectiveness)}>
                        {control.effectiveness.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Metrics */}
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskMetrics.map((risk) => (
                  <div key={risk.category} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{risk.category}</div>
                        <div className="text-sm text-neutral-600">
                          Last Review: {formatTimestamp(risk.lastReview)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">Score: {risk.score}</span>
                          {getTrendIcon(risk.trend)}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {risk.mitigations.length} mitigations active
                        </div>
                      </div>
                      
                      <Badge className={getRiskLevelColor(risk.level)}>
                        {risk.level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Findings */}
        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessment Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {assessments
                    .flatMap(assessment => 
                      assessment.findings.map(finding => ({
                        ...finding,
                        framework: assessment.framework,
                        assessmentDate: assessment.endDate
                      }))
                    )
                    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())
                    .slice(0, 20)
                    .map((finding, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border border-neutral-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          {finding.severity === 'critical' ? (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          ) : finding.severity === 'high' ? (
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium">{finding.description}</div>
                            <div className="text-sm text-neutral-600 mt-1">
                              Framework: {finding.framework} • Due: {formatTimestamp(finding.dueDate)}
                            </div>
                            <div className="text-sm text-neutral-600">
                              Responsible: {finding.responsible}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskLevelColor(finding.severity)}>
                            {finding.severity}
                          </Badge>
                          <Badge variant="outline">{finding.status}</Badge>
                        </div>
                      </div>
                    ))}

                  {assessments.length === 0 && (
                    <div className="text-center py-8 text-neutral-500">
                      No assessment findings available.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
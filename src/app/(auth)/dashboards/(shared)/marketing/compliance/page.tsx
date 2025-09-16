"use client";

import { useState } from "react";
;
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Mail,
  Globe,
  FileText,
  Download,
  ExternalLink,
  Refresh,
  Settings,
  Eye,
  Lock,
  Scale,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  status: "pass" | "warning" | "fail" | "checking";
  category: "email" | "privacy" | "accessibility" | "security";
  lastChecked: string;
  details?: string[];
  actionRequired?: boolean;
}

const mockComplianceChecks: ComplianceCheck[] = [
  {
    id: "1",
    name: "GDPR Compliance",
    description: "Data protection and privacy compliance for EU users",
    status: "pass",
    category: "privacy",
    lastChecked: "2 hours ago",
    details: [
      "✓ Privacy policy updated",
      "✓ Cookie consent implemented",
      "✓ Data processing agreements in place",
      "✓ Right to erasure enabled",
    ],
  },
  {
    id: "2",
    name: "CAN-SPAM Compliance",
    description: "Email marketing compliance for US regulations",
    status: "warning",
    category: "email",
    lastChecked: "1 day ago",
    details: [
      "✓ Unsubscribe links included",
      "⚠ Physical address missing in 3 templates",
      "✓ Clear sender identification",
      "✓ Truthful subject lines",
    ],
    actionRequired: true,
  },
  {
    id: "3",
    name: "CASL Compliance",
    description: "Canadian Anti-Spam Legislation compliance",
    status: "pass",
    category: "email",
    lastChecked: "3 hours ago",
    details: [
      "✓ Express consent collected",
      "✓ Sender identification clear",
      "✓ Unsubscribe mechanism functional",
    ],
  },
  {
    id: "4",
    name: "Email Deliverability",
    description: "Technical setup for optimal email delivery",
    status: "warning",
    category: "email",
    lastChecked: "6 hours ago",
    details: [
      "✓ SPF record configured",
      "✓ DKIM signature active",
      "⚠ DMARC policy needs alignment",
      "✓ Domain reputation healthy",
    ],
    actionRequired: true,
  },
  {
    id: "5",
    name: "WCAG 2.1 AA Compliance",
    description: "Web accessibility standards compliance",
    status: "fail",
    category: "accessibility",
    lastChecked: "1 hour ago",
    details: [
      "✗ Color contrast issues on 5 pages",
      "✗ Missing alt text on 12 images",
      "✓ Keyboard navigation working",
      "⚠ Focus indicators need improvement",
    ],
    actionRequired: true,
  },
  {
    id: "6",
    name: "Data Security",
    description: "Security measures for customer data protection",
    status: "pass",
    category: "security",
    lastChecked: "30 minutes ago",
    details: [
      "✓ Data encryption at rest",
      "✓ SSL/TLS certificates valid",
      "✓ Access controls implemented",
      "✓ Regular security audits",
    ],
  },
];

export default function CompliancePage() {
  const [checks, setChecks] = useState<ComplianceCheck[]>(mockComplianceChecks);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isRunningFullAudit, setIsRunningFullAudit] = useState(false);

  const filteredChecks = checks.filter(check => 
    selectedCategory === "all" || check.category === selectedCategory
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "fail": return <XCircle className="h-5 w-5 text-red-600" />;
      case "checking": return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass": return "text-green-600 bg-green-100 border-green-200";
      case "warning": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "fail": return "text-red-600 bg-red-100 border-red-200";
      case "checking": return "text-blue-600 bg-blue-100 border-blue-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "email": return <Mail className="h-4 w-4" />;
      case "privacy": return <Lock className="h-4 w-4" />;
      case "accessibility": return <Users className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const runFullAudit = async () => {
    setIsRunningFullAudit(true);
    
    // Simulate audit process
    for (const i = 0; i < checks.length; i++) {
      setTimeout(() => {
        setChecks(prev => prev.map((check, index) => 
          index === i ? { ...check, status: "checking" as const } : check
        ));
      }, i * 500);
      
      setTimeout(() => {
        setChecks(prev => prev.map((check, index) => 
          index === i ? { 
            ...check, 
            status: Math.random() > 0.3 ? "pass" : Math.random() > 0.5 ? "warning" : "fail" as const,
            lastChecked: "Just now"
          } : check
        ));
      }, (i + 1) * 500);
    }

    setTimeout(() => {
      setIsRunningFullAudit(false);
    }, checks.length * 500 + 1000);
  };

  const passCount = checks.filter(c => c.status === "pass").length;
  const warningCount = checks.filter(c => c.status === "warning").length;
  const failCount = checks.filter(c => c.status === "fail").length;
  const overallScore = Math.round((passCount / checks.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Center</h1>
          <p className="text-muted-foreground">
            Monitor and maintain compliance across email marketing, privacy, and accessibility standards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={runFullAudit} disabled={isRunningFullAudit}>
            <Refresh className={'h-4 w-4 mr-2 ${isRunningFullAudit ? 'animate-spin' : '}'} />
            {isRunningFullAudit ? "Running Audit..." : "Run Full Audit"}
          </Button>
        </div>
      </div>

      {/* Compliance Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Compliance Score</CardTitle>
              <CardDescription>Overall compliance health across all categories</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{overallScore}%</div>
              <div className="text-sm text-muted-foreground">
                {passCount} passed • {warningCount} warnings • {failCount} failed
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-green-600">{passCount} Passed</div>
                <div className="text-sm text-muted-foreground">Fully compliant</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-yellow-600">{warningCount} Warnings</div>
                <div className="text-sm text-muted-foreground">Need attention</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-red-600">{failCount} Failed</div>
                <div className="text-sm text-muted-foreground">Require fixes</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-600">Legal Ready</div>
                <div className="text-sm text-muted-foreground">
                  {overallScore >= 80 ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter by category:</span>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All Categories
          </Button>
          <Button
            variant={selectedCategory === "email" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("email")}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            variant={selectedCategory === "privacy" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("privacy")}
          >
            <Lock className="h-4 w-4 mr-2" />
            Privacy
          </Button>
          <Button
            variant={selectedCategory === "accessibility" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("accessibility")}
          >
            <Users className="h-4 w-4 mr-2" />
            Accessibility
          </Button>
          <Button
            variant={selectedCategory === "security" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("security")}
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </Button>
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="space-y-4">
        {filteredChecks.map((check) => (
          <Card key={check.id} className={'${check.actionRequired ? 'border-l-4 border-l-orange-500' : '}'}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    {getCategoryIcon(check.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{check.name}</CardTitle>
                      {getStatusIcon(check.status)}
                      <span className={'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(check.status)}'}>
                        {check.status}
                      </span>
                    </div>
                    <CardDescription className="mt-1">{check.description}</CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Last checked: {check.lastChecked}</span>
                      <span className="capitalize">{check.category}</span>
                      {check.actionRequired && (
                        <span className="text-orange-600 font-medium">Action Required</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {check.details && (
              <CardContent>
                <div className="space-y-2">
                  {check.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {detail.startsWith('✓') && <CheckCircle className="h-3 w-3 text-green-600" />}
                      {detail.startsWith('⚠') && <AlertTriangle className="h-3 w-3 text-yellow-600" />}
                      {detail.startsWith('✗') && <XCircle className="h-3 w-3 text-red-600" />}
                      <span className={
                        detail.startsWith('✓') ? 'text-green-700' :
                        detail.startsWith('⚠') ? 'text-yellow-700' :
                        detail.startsWith('✗') ? 'text-red-700' : 'text-foreground'
                      }>
                        {detail.substring(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {check.actionRequired && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Action Required</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      This compliance check requires immediate attention to maintain legal compliance.
                    </p>
                    <Button size="sm" className="mt-2">
                      Fix Issues
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Resources</CardTitle>
          <CardDescription>Helpful links and documentation for maintaining compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Email Marketing Compliance</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" />
                  CAN-SPAM Act Guidelines
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" />
                  CASL Compliance Guide
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" />
                  Email Deliverability Best Practices
                </a>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Privacy & Security</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" />
                  GDPR Compliance Checklist
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" />
                  CCPA Requirements
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" />
                  Data Security Standards
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
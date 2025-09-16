# Incident Response Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Incident Response Team  
> **Review Schedule**: Quarterly  

## Overview

This comprehensive incident response guide provides standardized procedures for identifying, responding to, and resolving incidents across the Thorbis Business OS platform. It covers incident classification, response procedures, communication protocols, and post-incident analysis to ensure rapid recovery and continuous improvement.

## Incident Classification Framework

### Severity Levels
```typescript
interface IncidentSeverity {
  p1Critical: {
    description: 'Platform-wide outage or critical security breach',
    impact: 'All users unable to access core functionality',
    responseTime: '≤ 15 minutes',
    escalation: 'Immediate CTO and CEO notification',
    examples: [
      'Complete platform outage',
      'Database unavailable',
      'Security breach with data exposure',
      'Payment system failure',
      'Authentication system down'
    ],
    sla: {
      acknowledgeTime: '5 minutes',
      resolutionTime: '4 hours',
      updateFrequency: '15 minutes'
    }
  },
  p2High: {
    description: 'Significant feature degradation affecting multiple users',
    impact: 'Major functionality impaired, workarounds may exist',
    responseTime: '≤ 1 hour',
    escalation: 'Engineering lead notification',
    examples: [
      'API response times > 5 seconds',
      'Error rate > 10%',
      'Single-tenant database issues',
      'Third-party integration failures',
      'Performance degradation'
    ],
    sla: {
      acknowledgeTime: '30 minutes',
      resolutionTime: '24 hours',
      updateFrequency: '1 hour'
    }
  },
  p3Medium: {
    description: 'Limited functionality issues or minor performance problems',
    impact: 'Some users affected, functionality partially available',
    responseTime: '≤ 4 hours',
    escalation: 'During business hours only',
    examples: [
      'Single feature not working',
      'Cosmetic UI issues',
      'Slow report generation',
      'Email delivery delays',
      'Minor integration problems'
    ],
    sla: {
      acknowledgeTime: '2 hours',
      resolutionTime: '72 hours',
      updateFrequency: '4 hours'
    }
  },
  p4Low: {
    description: 'Minor issues with minimal user impact',
    impact: 'Individual users or edge cases affected',
    responseTime: '≤ 2 business days',
    escalation: 'No immediate escalation required',
    examples: [
      'Documentation errors',
      'Minor feature requests',
      'Edge case bugs',
      'Performance optimizations',
      'Cosmetic improvements'
    ],
    sla: {
      acknowledgeTime: '1 business day',
      resolutionTime: '1 week',
      updateFrequency: 'Daily'
    }
  }
}
```

### Incident Types
```typescript
interface IncidentTypes {
  availability: {
    description: 'Service outages and downtime',
    subTypes: ['complete_outage', 'partial_outage', 'degraded_performance'],
    primaryMetric: 'Uptime percentage',
    businessImpact: 'Revenue loss, customer satisfaction'
  },
  performance: {
    description: 'Response time and throughput issues',
    subTypes: ['slow_api', 'database_performance', 'frontend_slowness'],
    primaryMetric: 'Response time percentiles',
    businessImpact: 'User experience, conversion rates'
  },
  security: {
    description: 'Security breaches and vulnerabilities',
    subTypes: ['data_breach', 'unauthorized_access', 'ddos_attack'],
    primaryMetric: 'Time to containment',
    businessImpact: 'Data protection, legal compliance'
  },
  data: {
    description: 'Data loss or corruption issues',
    subTypes: ['data_loss', 'corruption', 'sync_issues'],
    primaryMetric: 'Data recovery percentage',
    businessImpact: 'Business continuity, customer trust'
  },
  integration: {
    description: 'Third-party service failures',
    subTypes: ['payment_gateway', 'email_service', 'sms_provider'],
    primaryMetric: 'Integration availability',
    businessImpact: 'Feature functionality, workflow completion'
  }
}
```

## Response Procedures

### Immediate Response Protocol (First 15 Minutes)
```typescript
interface ImmediateResponseProtocol {
  detection: {
    automaticAlerts: 'PagerDuty, monitoring systems, user reports',
    manualReporting: 'Support tickets, social media, direct communication',
    validation: 'Confirm incident scope and impact'
  },
  
  initialActions: {
    step1: {
      action: 'Acknowledge alert within 5 minutes',
      responsible: 'On-call engineer',
      tools: 'PagerDuty, Slack incident channel'
    },
    step2: {
      action: 'Create incident record and channel',
      responsible: 'Incident commander',
      tools: 'Incident management system, Slack'
    },
    step3: {
      action: 'Assess severity and impact',
      responsible: 'Incident commander',
      tools: 'Monitoring dashboards, user reports'
    },
    step4: {
      action: 'Activate response team',
      responsible: 'Incident commander',
      tools: 'Escalation procedures, contact lists'
    },
    step5: {
      action: 'Begin immediate mitigation',
      responsible: 'Technical lead',
      tools: 'Platform admin tools, rollback procedures'
    }
  }
}
```

### Incident Command Structure
```typescript
interface IncidentRoles {
  incidentCommander: {
    responsibilities: [
      'Overall incident coordination',
      'Communication with stakeholders',
      'Decision making for major changes',
      'Resource allocation and prioritization'
    ],
    authority: 'Full decision-making power during incident',
    rotation: 'Weekly rotation among senior engineers',
    backup: 'Secondary IC always on standby'
  },
  
  technicalLead: {
    responsibilities: [
      'Technical investigation and resolution',
      'Coordination of technical team',
      'Implementation of fixes',
      'Technical communication to IC'
    ],
    skills: 'Deep technical knowledge of affected systems',
    escalation: 'Can escalate to architect or CTO'
  },
  
  communicationLead: {
    responsibilities: [
      'External customer communication',
      'Status page updates',
      'Stakeholder notifications',
      'Media coordination if required'
    ],
    channels: ['Status page', 'Email', 'Social media', 'Support system']
  },
  
  customerLiaison: {
    responsibilities: [
      'Customer support coordination',
      'Escalated customer communication',
      'Impact assessment from customer perspective',
      'Customer feedback collection'
    ],
    tools: ['Support system', 'CRM', 'Communication platforms']
  }
}
```

### Technical Response Procedures
```bash
#!/bin/bash
# Incident Response Toolkit

# 1. Quick System Health Check
rapid_health_check() {
  echo "=== RAPID HEALTH CHECK ==="
  echo "Timestamp: $(date)"
  
  # Check main services
  echo "Checking primary endpoints..."
  endpoints=(
    "https://thorbis.com/api/health"
    "https://thorbis.com/api/hs/health" 
    "https://api.thorbis.com/health"
  )
  
  for endpoint in "${endpoints[@]}"; do
    response_time=$(curl -o /dev/null -s -w "%{time_total}" -m 10 "$endpoint")
    http_code=$(curl -o /dev/null -s -w "%{http_code}" -m 10 "$endpoint")
    
    if [ "$http_code" = "200" ]; then
      echo "✓ $endpoint: ${response_time}s (HTTP $http_code)"
    else
      echo "✗ $endpoint: FAILED (HTTP $http_code)"
    fi
  done
  
  # Database health
  echo "Checking database health..."
  db_status=$(supabase status --json 2>/dev/null | jq -r '.status // "unknown"')
  echo "Database status: $db_status"
  
  # Active connections
  active_connections=$(supabase exec sql --query "SELECT count(*) FROM pg_stat_activity WHERE state = 'active'" 2>/dev/null)
  echo "Active DB connections: $active_connections"
}

# 2. Performance Diagnostics
performance_diagnostics() {
  echo "=== PERFORMANCE DIAGNOSTICS ==="
  
  # API response time analysis
  echo "Analyzing API performance..."
  slow_endpoints=$(curl -s "https://api.datadog.com/api/v1/query" \
    -H "DD-API-KEY: $DD_API_KEY" \
    -H "DD-APPLICATION-KEY: $DD_APP_KEY" \
    -G -d "query=avg:trace.http.request.duration{service:thorbis-api} by {resource_name}" \
    -d "from=$(date -d '1 hour ago' +%s)" \
    -d "to=$(date +%s)" | \
    jq '.series[] | select(.pointlist[-1][1] > 1.0)')
  
  echo "Slow endpoints (>1s): $slow_endpoints"
  
  # Database slow queries
  echo "Checking for slow database queries..."
  slow_queries=$(supabase exec sql --query "
    SELECT query, mean_time, calls 
    FROM pg_stat_statements 
    WHERE mean_time > 1000 
    ORDER BY mean_time DESC 
    LIMIT 10
  " 2>/dev/null)
  
  echo "Slow queries: $slow_queries"
}

# 3. Error Analysis
error_analysis() {
  echo "=== ERROR ANALYSIS ==="
  
  # Recent error rates
  current_error_rate=$(curl -s "https://api.datadog.com/api/v1/query" \
    -H "DD-API-KEY: $DD_API_KEY" \
    -H "DD-APPLICATION-KEY: $DD_APP_KEY" \
    -G -d "query=sum:trace.http.request.errors{service:thorbis-api}.as_rate()" \
    -d "from=$(date -d '15 minutes ago' +%s)" \
    -d "to=$(date +%s)" | \
    jq '.series[0].pointlist[-1][1] // 0')
  
  echo "Current error rate: ${current_error_rate}%"
  
  # Top error patterns
  echo "Analyzing error patterns..."
  error_patterns=$(grep -c "ERROR\|FATAL" /var/log/application/*.log 2>/dev/null | head -10)
  echo "Error patterns: $error_patterns"
}

# 4. Emergency Rollback
emergency_rollback() {
  echo "=== EMERGENCY ROLLBACK ==="
  echo "WARNING: This will rollback to the previous deployment"
  read -p "Are you sure? (yes/no): " confirm
  
  if [ "$confirm" = "yes" ]; then
    echo "Initiating rollback..."
    
    # Rollback via Vercel
    vercel rollback --yes
    
    # Verify rollback
    sleep 30
    rapid_health_check
  else
    echo "Rollback cancelled"
  fi
}

# 5. Traffic Diversion
divert_traffic() {
  local percentage="$1"
  echo "=== TRAFFIC DIVERSION ==="
  echo "Diverting $percentage% of traffic to maintenance page"
  
  # Update Cloudflare rules via API
  curl -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/maintenance_mode" \
    -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"value\": \"on\"}"
  
  echo "Traffic diversion activated"
}
```

## Communication Protocols

### Internal Communication
```typescript
interface InternalCommunication {
  slackChannels: {
    primary: '#incident-response',
    security: '#security-incidents', 
    leadership: '#executive-alerts',
    engineering: '#engineering-incidents'
  },
  
  updateSchedule: {
    p1Critical: 'Every 15 minutes until resolution',
    p2High: 'Every hour until resolution',
    p3Medium: 'Every 4 hours during business hours',
    p4Low: 'Daily updates'
  },
  
  escalationChain: {
    level1: 'On-call engineer → Engineering lead',
    level2: 'Engineering lead → Engineering manager',
    level3: 'Engineering manager → CTO',
    level4: 'CTO → CEO (for critical incidents only)'
  },
  
  meetingProtocol: {
    warRoom: 'Immediate for P1 incidents',
    standups: '3x daily for P1/P2, daily for P3',
    postMortem: 'Scheduled within 48 hours of resolution'
  }
}
```

### External Communication
```typescript
interface ExternalCommunication {
  statusPage: {
    url: 'https://status.thorbis.com',
    updateFrequency: 'Real-time for incidents',
    components: [
      'Web Application',
      'API Services', 
      'Authentication',
      'Database',
      'File Storage',
      'Third-party Integrations'
    ]
  },
  
  customerNotification: {
    email: {
      triggers: 'P1 and P2 incidents affecting >10% users',
      template: 'Incident notification with ETA',
      frequency: 'Major updates only to avoid spam'
    },
    inApp: {
      banners: 'Real-time incident notifications',
      modals: 'Critical incidents only',
      degradedMode: 'Graceful degradation messaging'
    }
  },
  
  stakeholderUpdates: {
    investors: 'P1 incidents only via CEO',
    partners: 'Integration-affecting incidents',
    media: 'Public relations team for major incidents'
  }
}
```

### Communication Templates
```typescript
const incidentTemplates = {
  initialNotification: `
🚨 INCIDENT ALERT - P{severity}

**Incident ID**: {incidentId}
**Started**: {startTime}
**Impact**: {impactDescription}
**Affected Services**: {affectedServices}

**Current Status**: {currentStatus}
**Next Update**: {nextUpdateTime}

**Incident Commander**: {incidentCommander}
**Status Page**: https://status.thorbis.com

We are actively investigating and will provide updates every {updateFrequency}.
  `,
  
  progressUpdate: `
📋 INCIDENT UPDATE - {incidentId}

**Time**: {updateTime}
**Status**: {currentStatus}
**Progress**: {progressDescription}

**Actions Taken**:
- {action1}
- {action2}
- {action3}

**Next Steps**:
- {nextStep1}
- {nextStep2}

**ETA for Resolution**: {eta}
**Next Update**: {nextUpdateTime}
  `,
  
  resolutionNotification: `
✅ INCIDENT RESOLVED - {incidentId}

**Resolution Time**: {resolutionTime}
**Total Duration**: {totalDuration}
**Root Cause**: {rootCause}

**Resolution Summary**: {resolutionSummary}

**Preventive Measures**: {preventiveMeasures}

**Post-mortem**: Will be published within 48 hours at {postMortemUrl}

Thank you for your patience during this incident.
  `
};
```

## Investigation Procedures

### Root Cause Analysis Framework
```typescript
interface RootCauseAnalysis {
  methodology: 'Five Whys with Ishikawa Diagram',
  timelineReconstruction: {
    dataCollection: [
      'System logs and metrics',
      'Deployment history',
      'Configuration changes',
      'User actions and reports',
      'Third-party service status'
    ],
    analysis: [
      'Correlation analysis between events',
      'Performance trend analysis',
      'Error pattern identification',
      'Impact assessment across services'
    ]
  },
  
  categories: {
    technical: {
      code: 'Software bugs, logic errors',
      infrastructure: 'Hardware failures, network issues',
      configuration: 'Misconfiguration, settings errors',
      capacity: 'Resource exhaustion, scaling issues'
    },
    process: {
      deployment: 'Release management failures',
      monitoring: 'Insufficient alerting or monitoring',
      communication: 'Information sharing breakdowns',
      training: 'Knowledge gaps or skill deficits'
    },
    external: {
      vendors: 'Third-party service failures',
      dependencies: 'External dependency issues',
      attacks: 'Security incidents or DDoS',
      environmental: 'Data center or ISP issues'
    }
  }
}
```

### Forensic Data Collection
```bash
#!/bin/bash
# Incident Forensics Collection

collect_incident_data() {
  local incident_id="$1"
  local start_time="$2"
  local end_time="$3"
  
  echo "=== INCIDENT FORENSICS COLLECTION ==="
  echo "Incident ID: $incident_id"
  echo "Time Range: $start_time to $end_time"
  
  # Create evidence directory
  evidence_dir="/tmp/incident-$incident_id-$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$evidence_dir"
  
  # 1. System Metrics
  echo "Collecting system metrics..."
  curl -s "https://api.datadog.com/api/v1/query" \
    -H "DD-API-KEY: $DD_API_KEY" \
    -H "DD-APPLICATION-KEY: $DD_APP_KEY" \
    -G -d "query=avg:system.cpu.usage{*}" \
    -d "from=$start_time" \
    -d "to=$end_time" > "$evidence_dir/cpu_metrics.json"
  
  # 2. Application Logs
  echo "Collecting application logs..."
  grep -r "ERROR\|FATAL\|WARN" /var/log/application/ \
    --include="*.log" \
    --time-style=iso > "$evidence_dir/error_logs.txt"
  
  # 3. Database State
  echo "Collecting database state..."
  supabase exec sql --query "
    SELECT 
      schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del,
      last_vacuum, last_autovacuum, last_analyze
    FROM pg_stat_user_tables 
    ORDER BY n_tup_upd DESC
  " > "$evidence_dir/database_stats.txt"
  
  # 4. Network Traffic
  echo "Collecting network data..."
  ss -tuln > "$evidence_dir/network_connections.txt"
  
  # 5. Deployment History
  echo "Collecting deployment history..."
  vercel list --json > "$evidence_dir/deployment_history.json"
  
  # 6. Configuration Snapshots
  echo "Collecting configuration..."
  cp -r /etc/app-config "$evidence_dir/config_snapshot"
  
  # Create archive
  tar -czf "incident-$incident_id-evidence.tar.gz" -C "/tmp" "$(basename "$evidence_dir")"
  
  echo "Evidence collected: incident-$incident_id-evidence.tar.gz"
}
```

## Recovery Procedures

### Service Restoration
```typescript
interface RecoveryProcedures {
  immediateActions: {
    stopDamage: [
      'Isolate affected components',
      'Prevent data corruption spread',
      'Block malicious traffic if security incident',
      'Preserve evidence for investigation'
    ],
    restoreBasicFunction: [
      'Activate backup systems',
      'Implement emergency workarounds',
      'Route traffic to healthy instances',
      'Enable maintenance mode if necessary'
    ]
  },
  
  systematicRecovery: {
    dataRecovery: {
      assessment: 'Evaluate data integrity and completeness',
      restoration: 'Restore from most recent clean backup',
      validation: 'Verify restored data accuracy',
      reconciliation: 'Address any data gaps or conflicts'
    },
    serviceRecovery: {
      phased: 'Restore services in order of criticality',
      testing: 'Validate each service before proceeding',
      monitoring: 'Enhanced monitoring during recovery',
      rollback: 'Prepared to rollback if issues arise'
    }
  },
  
  validation: {
    functionalTesting: 'Verify all critical functions work',
    performanceTesting: 'Confirm performance meets standards',
    securityTesting: 'Validate security controls are effective',
    userAcceptance: 'Limited user validation before full restore'
  }
}
```

### Business Continuity
```typescript
interface BusinessContinuity {
  criticalFunctions: {
    authentication: {
      fallback: 'Backup authentication service',
      manual: 'Emergency access procedures',
      communication: 'User notification system'
    },
    payments: {
      fallback: 'Backup payment processor',
      manual: 'Manual payment recording',
      reconciliation: 'Post-incident payment reconciliation'
    },
    dataAccess: {
      readonly: 'Read-only mode during recovery',
      backup: 'Access to backed-up data',
      mobile: 'Mobile app offline capabilities'
    }
  },
  
  communicationPlan: {
    customers: 'Regular updates on restoration progress',
    employees: 'Internal status and workaround procedures', 
    partners: 'Integration status and alternative procedures',
    stakeholders: 'Business impact and recovery timeline'
  }
}
```

## Post-Incident Procedures

### Post-Mortem Process
```typescript
interface PostMortemProcess {
  timeline: {
    initial: 'Within 24 hours - incident timeline creation',
    investigation: 'Within 48 hours - root cause analysis',
    draft: 'Within 72 hours - post-mortem draft',
    review: 'Within 1 week - stakeholder review',
    publication: 'Within 2 weeks - public post-mortem if appropriate'
  },
  
  structure: {
    summary: 'High-level incident overview and impact',
    timeline: 'Detailed chronology of events',
    rootCause: 'Technical and process root causes',
    impact: 'Business and user impact assessment',
    response: 'Response effectiveness analysis',
    lessons: 'Key lessons learned',
    actions: 'Concrete action items with owners and timelines'
  },
  
  participants: {
    required: [
      'Incident commander',
      'Technical lead',
      'Engineering manager',
      'Product manager (if user-facing)'
    ],
    optional: [
      'Customer support representative',
      'Security team member',
      'Business stakeholder'
    ]
  }
}
```

### Action Item Tracking
```typescript
interface ActionItemTracking {
  categories: {
    immediate: {
      timeline: 'Within 1 week',
      purpose: 'Prevent recurrence of same issue',
      examples: ['Fix specific bug', 'Update configuration', 'Patch security vulnerability']
    },
    shortTerm: {
      timeline: 'Within 1 month', 
      purpose: 'Improve detection and response',
      examples: ['Add monitoring', 'Improve alerts', 'Update runbooks']
    },
    longTerm: {
      timeline: 'Within 1 quarter',
      purpose: 'Systemic improvements',
      examples: ['Architecture changes', 'Process improvements', 'Tool upgrades']
    }
  },
  
  tracking: {
    owner: 'Specific individual responsible',
    timeline: 'Specific due date',
    success: 'Measurable success criteria',
    status: 'Regular progress updates',
    validation: 'Completion verification process'
  }
}
```

This comprehensive incident response guide ensures rapid, coordinated, and effective response to any incidents affecting the Thorbis Business OS platform, minimizing impact and driving continuous improvement in system reliability and response capabilities.
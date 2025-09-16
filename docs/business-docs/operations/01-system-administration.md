# System Administration Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis DevOps Team  
> **Review Schedule**: Monthly  

## Overview

This comprehensive guide covers all system administration procedures for the Thorbis Business OS platform. It includes infrastructure management, user administration, system configuration, and operational procedures for maintaining a secure, scalable, and high-performance environment.

## Infrastructure Architecture

### Platform Stack Overview
```typescript
interface PlatformArchitecture {
  frontend: {
    framework: 'Next.js 15 with App Router',
    hosting: 'Vercel Edge Network',
    cdn: 'Cloudflare',
    domains: 'Cloudflare DNS',
    performance: 'NextFaster Optimization'
  },
  backend: {
    database: 'Supabase PostgreSQL',
    authentication: 'Supabase Auth',
    storage: 'Supabase Storage',
    functions: 'Supabase Edge Functions',
    realtime: 'Supabase Realtime'
  },
  monitoring: {
    apm: 'DataDog APM',
    errors: 'Sentry',
    logs: 'DataDog Logs',
    uptime: 'Custom Health Checks',
    performance: 'Real User Monitoring'
  },
  security: {
    waf: 'Cloudflare WAF',
    ssl: 'Cloudflare SSL',
    secrets: 'Vercel Environment Variables',
    scanning: 'Snyk Security',
    compliance: 'SOC 2 Framework'
  }
}
```

### Multi-Tenant Architecture
```typescript
interface TenantIsolation {
  database: {
    strategy: 'Row Level Security (RLS)',
    isolation: 'business_id column filtering',
    policies: 'Comprehensive RLS policies on all tables',
    encryption: 'AES-256 encryption at rest'
  },
  application: {
    routing: 'Subdomain-based tenant identification',
    sessions: 'Tenant-scoped JWT tokens',
    caching: 'Tenant-aware cache keys',
    storage: 'Tenant-isolated file storage'
  },
  monitoring: {
    metrics: 'Per-tenant performance metrics',
    alerts: 'Tenant-specific alert configurations',
    logs: 'Tenant-tagged log aggregation',
    billing: 'Usage tracking per tenant'
  }
}
```

## User Administration

### Role-Based Access Control Matrix
```typescript
interface RolePermissions {
  platformAdmin: {
    description: 'Full platform administration',
    permissions: [
      'system.admin',
      'tenant.create',
      'tenant.delete',
      'billing.manage',
      'platform.configure'
    ],
    restrictions: 'Limited to 2-3 users maximum'
  },
  tenantOwner: {
    description: 'Business owner with full tenant control',
    permissions: [
      'tenant.admin',
      'users.manage',
      'billing.view',
      'data.full',
      'integrations.manage'
    ],
    restrictions: '1 per business, transferable'
  },
  tenantManager: {
    description: 'Business manager with operational control',
    permissions: [
      'users.create',
      'users.edit',
      'data.read',
      'data.write',
      'reports.view'
    ],
    restrictions: 'Cannot modify billing or delete tenant'
  },
  tenantStaff: {
    description: 'Regular business user',
    permissions: [
      'data.read',
      'data.write.limited',
      'own.profile.edit'
    ],
    restrictions: 'Limited to assigned features and data'
  },
  tenantViewer: {
    description: 'Read-only access',
    permissions: [
      'data.read',
      'reports.view'
    ],
    restrictions: 'No write permissions'
  }
}
```

### User Provisioning Procedures
```bash
#!/bin/bash
# User Creation Script Template

# 1. Verify platform admin privileges
verify_admin_access() {
  echo "Verifying admin access..."
  supabase auth verify --role platform_admin
}

# 2. Create new tenant (business)
create_tenant() {
  local business_name="$1"
  local owner_email="$2"
  
  echo "Creating tenant: $business_name"
  
  # Generate secure business_id
  business_id=$(uuidgen)
  
  # Create business record
  supabase exec sql --query "
    INSERT INTO businesses (id, name, status, created_at)
    VALUES ('$business_id', '$business_name', 'active', NOW())
  "
  
  # Create owner user
  create_tenant_owner "$business_id" "$owner_email"
}

# 3. Create tenant owner
create_tenant_owner() {
  local business_id="$1"
  local owner_email="$2"
  
  echo "Creating tenant owner: $owner_email"
  
  # Create auth user
  supabase auth create-user \
    --email "$owner_email" \
    --password "$(generate_secure_password)" \
    --email-confirm
  
  # Create profile with owner role
  user_id=$(supabase auth get-user --email "$owner_email" --json | jq -r '.id')
  
  supabase exec sql --query "
    INSERT INTO user_profiles (id, business_id, email, role, status)
    VALUES ('$user_id', '$business_id', '$owner_email', 'owner', 'active')
  "
  
  # Send welcome email
  send_welcome_email "$owner_email" "$business_id"
}

# 4. Add team member
add_team_member() {
  local business_id="$1"
  local member_email="$2"
  local role="$3"
  
  # Validate role
  valid_roles=("manager" "staff" "viewer")
  if [[ ! " ${valid_roles[@]} " =~ " ${role} " ]]; then
    echo "Error: Invalid role '$role'"
    exit 1
  fi
  
  # Create user and assign to business
  supabase auth invite \
    --email "$member_email" \
    --business-id "$business_id" \
    --role "$role"
}
```

### User Deprovisioning
```typescript
interface DeProvisioningProcedure {
  immediate: {
    actions: [
      'Disable user authentication',
      'Revoke all API tokens',
      'Remove from all team access',
      'Backup user-specific data'
    ],
    timeline: 'Within 15 minutes of request'
  },
  scheduled: {
    after30Days: [
      'Archive user profile data',
      'Remove from active user counts',
      'Clear temporary files and caches'
    ],
    after90Days: [
      'Delete personal data (GDPR compliance)',
      'Remove from backup systems',
      'Final audit log entry'
    ]
  },
  dataHandling: {
    personalData: 'Immediate deletion or anonymization',
    businessData: 'Remains in tenant scope',
    auditLogs: 'Retained per compliance requirements',
    contributions: 'Attribution removed, content retained'
  }
}
```

## System Configuration

### Environment Management
```typescript
interface EnvironmentConfiguration {
  production: {
    domain: 'thorbis.com',
    database: 'Production Supabase Instance',
    monitoring: 'Full monitoring enabled',
    logging: 'WARN and ERROR levels',
    features: 'All features enabled',
    security: 'Maximum security policies'
  },
  staging: {
    domain: 'staging.thorbis.com',
    database: 'Staging Supabase Instance',
    monitoring: 'Essential monitoring only',
    logging: 'INFO, WARN, ERROR levels',
    features: 'Feature flags for testing',
    security: 'Production-like security'
  },
  development: {
    domain: 'localhost:3000',
    database: 'Local Supabase or Dev Instance',
    monitoring: 'Basic health checks',
    logging: 'ALL levels including DEBUG',
    features: 'All features plus experimental',
    security: 'Relaxed for development speed'
  }
}
```

### Database Administration
```sql
-- Database Maintenance Procedures

-- 1. Daily Health Check
DO $$
DECLARE
    db_size bigint;
    active_connections int;
    slow_queries int;
BEGIN
    -- Check database size
    SELECT pg_database_size(current_database()) INTO db_size;
    
    -- Check active connections
    SELECT count(*) FROM pg_stat_activity 
    WHERE state = 'active' INTO active_connections;
    
    -- Check for slow queries (>5 seconds)
    SELECT count(*) FROM pg_stat_activity 
    WHERE state = 'active' AND query_start < now() - interval '5 seconds'
    INTO slow_queries;
    
    -- Log results
    INSERT INTO system_health_logs (
        check_type, db_size, active_connections, slow_queries, checked_at
    ) VALUES (
        'daily_health', db_size, active_connections, slow_queries, NOW()
    );
    
    -- Alert if thresholds exceeded
    IF active_connections > 80 THEN
        PERFORM send_alert('High connection count: ' || active_connections);
    END IF;
    
    IF slow_queries > 5 THEN
        PERFORM send_alert('Multiple slow queries detected: ' || slow_queries);
    END IF;
END $$;

-- 2. Index Maintenance
-- Rebuild indexes that are heavily fragmented
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_tup_read > 1000000 AND idx_tup_fetch/idx_tup_read < 0.01
ORDER BY idx_tup_read DESC;

-- 3. Vacuum and Analyze Schedule
-- This should be run via pg_cron or external scheduler
SELECT cron.schedule('vacuum-analyze', '0 2 * * *', $$
    VACUUM (ANALYZE, VERBOSE) work_orders;
    VACUUM (ANALYZE, VERBOSE) invoices;
    VACUUM (ANALYZE, VERBOSE) customers;
    VACUUM (ANALYZE, VERBOSE) user_profiles;
$$);

-- 4. Backup Verification
-- Verify daily backups completed successfully
SELECT backup_date, backup_size, status, duration
FROM backup_logs
WHERE backup_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY backup_date DESC;
```

### Performance Monitoring Setup
```typescript
interface PerformanceMonitoring {
  webVitals: {
    lcp: {
      target: 1800,      // 1.8 seconds
      warning: 1500,     // Warning at 1.5s
      critical: 2500     // Critical at 2.5s
    },
    fid: {
      target: 100,       // 100ms
      warning: 80,       // Warning at 80ms
      critical: 300      // Critical at 300ms
    },
    cls: {
      target: 0.1,       // 0.1 cumulative layout shift
      warning: 0.05,     // Warning at 0.05
      critical: 0.25     // Critical at 0.25
    }
  },
  apiPerformance: {
    responseTime: {
      target: 300,       // 300ms (NextFaster doctrine)
      warning: 250,      // Warning at 250ms
      critical: 500      // Critical at 500ms
    },
    throughput: {
      target: 1000,      // 1000 req/sec
      warning: 800,      // Warning below 800
      critical: 500      // Critical below 500
    },
    errorRate: {
      target: 0.01,      // 1% error rate
      warning: 0.005,    // Warning at 0.5%
      critical: 0.05     // Critical at 5%
    }
  }
}
```

## Security Administration

### SSL/TLS Management
```bash
#!/bin/bash
# SSL Certificate Management

# 1. Check certificate expiration
check_ssl_expiration() {
  domains=("thorbis.com" "api.thorbis.com" "app.thorbis.com" "lom.thorbis.com")
  
  for domain in "${domains[@]}"; do
    expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    expiry_epoch=$(date -d "$expiry_date" +%s)
    current_epoch=$(date +%s)
    days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    echo "Domain: $domain"
    echo "Expires: $expiry_date"
    echo "Days until expiry: $days_until_expiry"
    
    # Alert if expiring within 30 days
    if [ "$days_until_expiry" -lt 30 ]; then
      send_alert "SSL certificate for $domain expires in $days_until_expiry days"
    fi
    
    echo "---"
  done
}

# 2. Update security headers (Cloudflare)
update_security_headers() {
  # Configure via Cloudflare API
  curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_header" \
    -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{
      "value": {
        "strict_transport_security": {
          "enabled": true,
          "max_age": 31536000,
          "include_subdomains": true,
          "preload": true
        },
        "content_type_options": {
          "enabled": true
        },
        "frame_options": {
          "enabled": true,
          "value": "DENY"
        },
        "referrer_policy": {
          "enabled": true,
          "value": "strict-origin-when-cross-origin"
        }
      }
    }'
}
```

### Access Control Management
```typescript
interface AccessControlProcedures {
  apiKeys: {
    creation: {
      process: 'Generate via Supabase dashboard or API',
      validation: 'Verify permissions and scope',
      distribution: 'Secure delivery to authorized personnel',
      documentation: 'Log creation with purpose and owner'
    },
    rotation: {
      frequency: '90 days for production keys',
      process: 'Generate new key, update clients, revoke old key',
      verification: 'Confirm all integrations updated',
      rollback: 'Emergency rollback procedures if issues arise'
    },
    revocation: {
      triggers: ['Security incident', 'Employee departure', 'Compromise suspected'],
      process: 'Immediate revocation via API or dashboard',
      verification: 'Confirm key no longer functional',
      impact: 'Assess and communicate impact to affected services'
    }
  },
  ipWhitelisting: {
    corporate: 'Office IP ranges automatically allowed',
    individual: 'Developer IP addresses for staging access',
    emergency: 'Temporary access procedures for emergencies',
    audit: 'Monthly review of all whitelisted addresses'
  }
}
```

## System Maintenance

### Scheduled Maintenance Windows
```typescript
interface MaintenanceSchedule {
  routine: {
    frequency: 'Weekly - Sunday 02:00-04:00 UTC',
    activities: [
      'Database maintenance (VACUUM, ANALYZE)',
      'Log rotation and archival',
      'Security updates (if any)',
      'Performance optimization',
      'Backup verification'
    ],
    communication: 'Advance notice via status page and email'
  },
  emergency: {
    triggers: [
      'Critical security vulnerabilities',
      'Platform provider maintenance',
      'Performance degradation requiring intervention'
    ],
    process: [
      'Immediate communication via all channels',
      'Impact assessment and timeline estimation',
      'Execute maintenance with real-time updates',
      'Post-maintenance verification and reporting'
    ]
  },
  planned: {
    frequency: 'Monthly - First Saturday 01:00-05:00 UTC',
    activities: [
      'Platform updates and feature deployments',
      'Infrastructure scaling and optimization',
      'Security policy updates',
      'Performance benchmarking',
      'Disaster recovery testing'
    ],
    planning: 'Minimum 72 hours advance notice'
  }
}
```

### Log Management
```bash
#!/bin/bash
# Log Management and Rotation

# 1. Application Log Analysis
analyze_application_logs() {
  echo "=== Application Log Analysis ==="
  
  # Check error rates
  error_count=$(grep -c "ERROR" /var/log/app/application.log)
  warning_count=$(grep -c "WARN" /var/log/app/application.log)
  
  echo "Errors in last 24h: $error_count"
  echo "Warnings in last 24h: $warning_count"
  
  # Top errors
  echo "Top 10 errors:"
  grep "ERROR" /var/log/app/application.log | \
    awk '{print $5}' | sort | uniq -c | sort -nr | head -10
  
  # Database connection issues
  db_connection_errors=$(grep -c "database connection" /var/log/app/application.log)
  if [ "$db_connection_errors" -gt 5 ]; then
    send_alert "Database connection issues detected: $db_connection_errors occurrences"
  fi
}

# 2. Performance Log Analysis
analyze_performance_logs() {
  echo "=== Performance Log Analysis ==="
  
  # Slow API endpoints
  echo "Slowest API endpoints (>500ms):"
  grep "response_time" /var/log/app/access.log | \
    awk '$8 > 500 {print $4, $8"ms"}' | \
    sort -k2 -nr | head -10
  
  # Memory usage trends
  echo "Memory usage trends:"
  grep "memory_usage" /var/log/app/system.log | \
    tail -24 | awk '{print $2, $4}'
}

# 3. Security Log Analysis
analyze_security_logs() {
  echo "=== Security Log Analysis ==="
  
  # Failed authentication attempts
  failed_auth=$(grep -c "authentication failed" /var/log/auth/security.log)
  echo "Failed authentication attempts: $failed_auth"
  
  # Suspicious activity patterns
  echo "Suspicious IP addresses (>10 failed attempts):"
  grep "authentication failed" /var/log/auth/security.log | \
    awk '{print $6}' | sort | uniq -c | \
    awk '$1 > 10 {print $2, $1 " attempts"}' | sort -k2 -nr
  
  # Rate limiting triggers
  rate_limit_hits=$(grep -c "rate limit exceeded" /var/log/app/access.log)
  echo "Rate limit hits: $rate_limit_hits"
}

# 4. Log Retention and Cleanup
cleanup_old_logs() {
  echo "=== Log Cleanup ==="
  
  # Archive logs older than 30 days
  find /var/log -name "*.log" -mtime +30 -exec gzip {} \;
  
  # Delete archived logs older than 90 days
  find /var/log -name "*.log.gz" -mtime +90 -delete
  
  # Clean up temporary log files
  find /tmp -name "*.log*" -mtime +7 -delete
  
  echo "Log cleanup completed"
}
```

## Capacity Planning

### Resource Monitoring
```typescript
interface CapacityMetrics {
  compute: {
    vercel: {
      functions: {
        current: 'Serverless auto-scaling',
        limits: 'Per plan limitations',
        monitoring: 'Execution time and memory usage',
        scaling: 'Automatic based on demand'
      },
      bandwidth: {
        current: 'TB per month usage',
        limits: 'Plan-based limits',
        monitoring: 'Real-time bandwidth monitoring',
        alerts: 'Usage approaching limits'
      }
    }
  },
  database: {
    supabase: {
      connections: {
        max: 100,           // Production plan limit
        current: 'Real-time monitoring',
        pooling: 'Connection pooling enabled',
        optimization: 'Query optimization ongoing'
      },
      storage: {
        data: 'Primary database storage',
        files: 'Supabase Storage usage',
        backups: 'Automated backup storage',
        growth: 'Monthly growth rate tracking'
      }
    }
  },
  network: {
    cloudflare: {
      requests: {
        current: 'Requests per month',
        caching: 'Cache hit ratio optimization',
        bandwidth: 'Edge network utilization',
        ddos: 'DDoS protection metrics'
      }
    }
  }
}
```

### Scaling Procedures
```bash
#!/bin/bash
# Scaling Procedures

# 1. Database Scaling Assessment
assess_database_scaling() {
  echo "=== Database Scaling Assessment ==="
  
  # Check connection utilization
  connection_usage=$(supabase metrics --query "
    SELECT count(*) * 100.0 / 100 as usage_percentage 
    FROM pg_stat_activity 
    WHERE state != 'idle'
  ")
  
  echo "Connection usage: ${connection_usage}%"
  
  if (( $(echo "$connection_usage > 80" | bc -l) )); then
    echo "WARNING: High connection usage detected"
    echo "Consider upgrading Supabase plan or optimizing connection pooling"
  fi
  
  # Check database size growth
  db_size=$(supabase metrics --query "SELECT pg_database_size(current_database())")
  echo "Current database size: $db_size bytes"
  
  # Check query performance
  slow_queries=$(supabase metrics --query "
    SELECT count(*) FROM pg_stat_statements 
    WHERE mean_time > 1000
  ")
  
  echo "Slow queries (>1s): $slow_queries"
}

# 2. Application Scaling
scale_application() {
  echo "=== Application Scaling ==="
  
  # Vercel automatically scales, but monitor usage
  vercel_usage=$(vercel inspect --json | jq '.usage')
  echo "Vercel usage: $vercel_usage"
  
  # Check for performance bottlenecks
  response_times=$(curl -s "https://api.thorbis.com/health" -w "%{time_total}")
  echo "API response time: ${response_times}s"
  
  if (( $(echo "$response_times > 0.5" | bc -l) )); then
    echo "WARNING: API response time high"
    echo "Consider optimizing queries or caching"
  fi
}

# 3. Storage Scaling
assess_storage_scaling() {
  echo "=== Storage Scaling Assessment ==="
  
  # Check Supabase Storage usage
  storage_usage=$(supabase storage ls --recursive | wc -l)
  echo "Number of stored files: $storage_usage"
  
  # Check storage size
  total_storage=$(supabase storage du --human-readable)
  echo "Total storage usage: $total_storage"
}
```

## Disaster Recovery

### Backup Verification Procedures
```bash
#!/bin/bash
# Backup Verification and Testing

# 1. Database Backup Verification
verify_database_backups() {
  echo "=== Database Backup Verification ==="
  
  # Check latest backup timestamp
  latest_backup=$(supabase backups list --limit 1 --json | jq -r '.[0].created_at')
  echo "Latest backup: $latest_backup"
  
  # Verify backup integrity
  backup_id=$(supabase backups list --limit 1 --json | jq -r '.[0].id')
  integrity_check=$(supabase backups verify --backup-id "$backup_id")
  
  if [ "$integrity_check" = "valid" ]; then
    echo "✓ Backup integrity verified"
  else
    echo "✗ Backup integrity check failed"
    send_alert "Database backup integrity check failed for backup $backup_id"
  fi
}

# 2. Application Backup Verification
verify_application_backups() {
  echo "=== Application Backup Verification ==="
  
  # Verify Git repository backups
  git_backup_date=$(git log --format="%ci" -1)
  echo "Latest code backup: $git_backup_date"
  
  # Verify configuration backups
  if [ -f "/backup/config/latest.tar.gz" ]; then
    config_backup_date=$(stat -c %y "/backup/config/latest.tar.gz")
    echo "Latest configuration backup: $config_backup_date"
  else
    echo "✗ Configuration backup not found"
    send_alert "Configuration backup file not found"
  fi
}

# 3. Disaster Recovery Testing
test_disaster_recovery() {
  echo "=== Disaster Recovery Testing ==="
  
  # Test database restore (to staging environment)
  echo "Testing database restore to staging..."
  staging_restore_result=$(supabase backups restore \
    --backup-id "$backup_id" \
    --target staging)
  
  if [ $? -eq 0 ]; then
    echo "✓ Database restore test successful"
  else
    echo "✗ Database restore test failed"
    send_alert "Disaster recovery test failed: database restore"
  fi
  
  # Verify restored data integrity
  echo "Verifying restored data integrity..."
  staging_row_count=$(supabase exec sql --env staging --query "
    SELECT 
      (SELECT count(*) FROM businesses) as businesses,
      (SELECT count(*) FROM user_profiles) as users,
      (SELECT count(*) FROM work_orders) as work_orders
  ")
  
  echo "Restored data counts: $staging_row_count"
}
```

## Troubleshooting Common Issues

### Performance Issues
```bash
#!/bin/bash
# Performance Issue Diagnostics

diagnose_performance_issues() {
  echo "=== Performance Diagnostics ==="
  
  # 1. Check API response times
  echo "Testing API endpoints..."
  endpoints=(
    "https://thorbis.com/api/health"
    "https://thorbis.com/api/hs/app/v1/work-orders"
    "https://thorbis.com/api/auth/session"
  )
  
  for endpoint in "${endpoints[@]}"; do
    response_time=$(curl -o /dev/null -s -w "%{time_total}" "$endpoint")
    echo "$endpoint: ${response_time}s"
    
    if (( $(echo "$response_time > 1.0" | bc -l) )); then
      echo "⚠️  Slow response detected for $endpoint"
    fi
  done
  
  # 2. Check database performance
  echo "Checking database performance..."
  long_running_queries=$(supabase exec sql --query "
    SELECT pid, now() - pg_stat_activity.query_start AS duration, query
    FROM pg_stat_activity
    WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
      AND state = 'active'
  ")
  
  if [ -n "$long_running_queries" ]; then
    echo "Long running queries detected:"
    echo "$long_running_queries"
  fi
  
  # 3. Check connection pool status
  active_connections=$(supabase exec sql --query "
    SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
  ")
  echo "Active database connections: $active_connections"
}
```

### Security Incidents
```bash
#!/bin/bash
# Security Incident Response

handle_security_incident() {
  incident_type="$1"
  severity="$2"
  
  echo "=== Security Incident Response ==="
  echo "Incident Type: $incident_type"
  echo "Severity: $severity"
  
  case "$severity" in
    "critical")
      # Immediate response for critical incidents
      echo "CRITICAL INCIDENT - Immediate action required"
      
      # Disable affected services if necessary
      if [ "$incident_type" = "data_breach" ]; then
        echo "Potential data breach - initiating lockdown procedures"
        # This would be implemented based on specific security policies
      fi
      
      # Notify security team immediately
      send_alert "CRITICAL SECURITY INCIDENT: $incident_type" "security"
      ;;
      
    "high")
      echo "HIGH SEVERITY INCIDENT - Response within 1 hour"
      send_alert "High severity security incident: $incident_type" "security"
      ;;
      
    "medium")
      echo "MEDIUM SEVERITY INCIDENT - Response within 4 hours"
      send_alert "Medium severity security incident: $incident_type" "ops"
      ;;
  esac
  
  # Log incident
  echo "$(date): $incident_type ($severity)" >> /var/log/security/incidents.log
}
```

## System Health Monitoring

### Automated Health Checks
```typescript
interface HealthCheckSystem {
  endpoints: {
    api: 'https://thorbis.com/api/health',
    database: 'Supabase health endpoint',
    storage: 'Supabase Storage health',
    auth: 'Authentication service health'
  },
  checks: {
    frequency: '30 seconds',
    timeout: '10 seconds',
    retries: 3,
    alertThreshold: '2 consecutive failures'
  },
  responses: {
    healthy: {
      status: 200,
      responseTime: '<300ms',
      content: 'Valid JSON response'
    },
    degraded: {
      status: 200,
      responseTime: '300-1000ms',
      action: 'Warning alert'
    },
    unhealthy: {
      status: '4xx/5xx',
      responseTime: '>1000ms or timeout',
      action: 'Critical alert and escalation'
    }
  }
}
```

This comprehensive system administration guide provides the foundation for maintaining a secure, scalable, and high-performance Thorbis Business OS platform. Regular review and updates ensure these procedures remain current with evolving infrastructure and security requirements.
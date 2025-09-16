# Maintenance Procedures Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Operations Team  
> **Review Schedule**: Monthly  

## Overview

This comprehensive guide outlines all maintenance procedures for the Thorbis Business OS platform, including scheduled maintenance, preventive maintenance, emergency maintenance, and system optimization procedures. These procedures ensure optimal performance, security, and reliability of the platform.

## Maintenance Classification

### Maintenance Types
```typescript
interface MaintenanceTypes {
  scheduled: {
    description: 'Planned maintenance during designated windows',
    frequency: 'Weekly routine, Monthly comprehensive',
    impact: 'Minimal to no user impact',
    communication: 'Advance notice via status page and email',
    examples: [
      'Database optimization',
      'Log rotation and cleanup',
      'Security updates',
      'Performance tuning',
      'Backup verification'
    ]
  },
  
  preventive: {
    description: 'Proactive maintenance to prevent issues',
    frequency: 'Continuous monitoring with scheduled interventions',
    impact: 'Background operations, no user impact',
    communication: 'Internal notifications only',
    examples: [
      'Disk space monitoring and cleanup',
      'Memory leak detection and resolution',
      'Cache optimization',
      'Connection pool management',
      'SSL certificate renewal'
    ]
  },
  
  corrective: {
    description: 'Maintenance to fix identified issues',
    frequency: 'As needed based on monitoring alerts',
    impact: 'Varies from no impact to brief service interruption',
    communication: 'User notification if service impact expected',
    examples: [
      'Bug fixes and patches',
      'Configuration corrections',
      'Performance issue resolution',
      'Security vulnerability patches',
      'Data consistency repairs'
    ]
  },
  
  emergency: {
    description: 'Urgent maintenance for critical issues',
    frequency: 'Rare, only for critical situations',
    impact: 'Potential service interruption',
    communication: 'Immediate notification via all channels',
    examples: [
      'Critical security patches',
      'Service restoration after outage',
      'Data corruption repair',
      'Infrastructure failure recovery',
      'Emergency capacity scaling'
    ]
  }
}
```

### Risk Assessment Matrix
```typescript
interface MaintenanceRiskAssessment {
  riskLevels: {
    low: {
      description: 'Routine maintenance with minimal risk',
      approval: 'Operations team approval sufficient',
      testing: 'Standard testing procedures',
      rollback: 'Standard rollback procedures available',
      examples: ['Log rotation', 'Cache clearing', 'Routine backups']
    },
    
    medium: {
      description: 'Maintenance with potential for minor service impact',
      approval: 'Engineering lead approval required',
      testing: 'Enhanced testing in staging environment',
      rollback: 'Tested rollback procedures required',
      examples: ['Database schema updates', 'Configuration changes', 'Third-party updates']
    },
    
    high: {
      description: 'Maintenance with significant risk of service impact',
      approval: 'Engineering manager and CTO approval required',
      testing: 'Comprehensive testing with user acceptance',
      rollback: 'Immediate rollback capability required',
      examples: ['Major version upgrades', 'Architecture changes', 'Security patches']
    },
    
    critical: {
      description: 'Maintenance affecting core platform functionality',
      approval: 'Executive approval and change board review',
      testing: 'Full regression testing and staged rollout',
      rollback: 'Automated rollback with monitoring alerts',
      examples: ['Database migrations', 'Authentication changes', 'Payment system updates']
    }
  }
}
```

## Scheduled Maintenance

### Maintenance Windows
```typescript
interface MaintenanceWindows {
  routine: {
    schedule: 'Every Sunday 02:00-04:00 UTC',
    duration: 'Maximum 2 hours',
    frequency: 'Weekly',
    activities: [
      'Database maintenance and optimization',
      'Log rotation and archival',
      'System health checks',
      'Security updates (low-risk)',
      'Performance optimization',
      'Backup verification'
    ],
    communication: {
      advance: '72 hours notice on status page',
      reminder: '24 hours email notification',
      realtime: 'Status page updates during maintenance'
    }
  },
  
  comprehensive: {
    schedule: 'First Saturday of month 01:00-05:00 UTC',
    duration: 'Maximum 4 hours',
    frequency: 'Monthly',
    activities: [
      'Platform updates and feature deployments',
      'Infrastructure scaling and optimization',
      'Comprehensive security patching',
      'Database performance analysis',
      'Disaster recovery testing',
      'Monitoring system updates'
    ],
    communication: {
      advance: '1 week notice with detailed impact assessment',
      reminder: '48 hours and 24 hours notifications',
      realtime: 'Live updates every 30 minutes'
    }
  },
  
  emergency: {
    schedule: 'As needed',
    duration: 'Variable based on issue severity',
    frequency: 'Rare, only for critical issues',
    activities: [
      'Critical security patches',
      'Service restoration procedures',
      'Emergency capacity scaling',
      'Data integrity repairs'
    ],
    communication: {
      immediate: 'All channels notification within 15 minutes',
      frequent: 'Updates every 15 minutes during maintenance',
      postMortem: 'Detailed analysis within 48 hours'
    }
  }
}
```

### Pre-Maintenance Procedures
```bash
#!/bin/bash
# Pre-Maintenance Checklist and Procedures

pre_maintenance_checklist() {
  echo "=== PRE-MAINTENANCE CHECKLIST ==="
  echo "Maintenance Date: $(date)"
  
  # 1. Verify maintenance window
  echo "✓ Confirming maintenance window..."
  current_time=$(date +%H%M)
  if [ "$current_time" -lt "0200" ] || [ "$current_time" -gt "0400" ]; then
    echo "WARNING: Outside scheduled maintenance window"
    read -p "Continue anyway? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
      echo "Maintenance cancelled"
      exit 1
    fi
  fi
  
  # 2. Check system health before maintenance
  echo "✓ Checking system health..."
  system_health=$(curl -s https://thorbis.com/api/health | jq -r '.status')
  if [ "$system_health" != "healthy" ]; then
    echo "WARNING: System not healthy before maintenance"
    echo "Current status: $system_health"
    read -p "Continue with maintenance? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
      echo "Maintenance postponed due to system health"
      exit 1
    fi
  fi
  
  # 3. Verify backups are current
  echo "✓ Verifying recent backups..."
  latest_backup=$(supabase backups list --limit 1 --json | jq -r '.[0].created_at')
  backup_age_hours=$(( ($(date +%s) - $(date -d "$latest_backup" +%s)) / 3600 ))
  
  if [ "$backup_age_hours" -gt 24 ]; then
    echo "WARNING: Latest backup is $backup_age_hours hours old"
    echo "Creating fresh backup before maintenance..."
    supabase backups create --description "Pre-maintenance backup"
    
    # Wait for backup to complete
    sleep 300
  fi
  
  # 4. Check active user sessions
  echo "✓ Checking active user sessions..."
  active_sessions=$(supabase exec sql --query "
    SELECT count(*) FROM auth.sessions 
    WHERE expires_at > NOW() 
    AND updated_at > NOW() - INTERVAL '15 minutes'
  " | tail -1)
  
  echo "Active sessions: $active_sessions"
  if [ "$active_sessions" -gt 10 ]; then
    echo "WARNING: High number of active sessions detected"
    echo "Consider postponing maintenance to avoid user disruption"
  fi
  
  # 5. Prepare rollback plan
  echo "✓ Preparing rollback procedures..."
  current_deployment=$(vercel inspect --json | jq -r '.deployments[0].uid')
  echo "Current deployment ID: $current_deployment"
  echo "Rollback command: vercel rollback $current_deployment"
  
  # 6. Update status page
  echo "✓ Updating status page..."
  curl -X POST "https://api.statuspage.io/v1/pages/$STATUS_PAGE_ID/incidents" \
    -H "Authorization: OAuth $STATUS_PAGE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "incident": {
        "name": "Scheduled Maintenance",
        "status": "investigating",
        "impact_override": "maintenance",
        "body": "Routine maintenance in progress. Expected completion: 04:00 UTC"
      }
    }'
  
  echo "Pre-maintenance checklist completed successfully"
}

# Maintenance preparation
prepare_maintenance_environment() {
  echo "=== MAINTENANCE ENVIRONMENT PREPARATION ==="
  
  # 1. Scale down non-essential services
  echo "Scaling down non-essential services..."
  # This would be implemented based on specific architecture
  
  # 2. Enable maintenance mode banners
  echo "Enabling maintenance mode notifications..."
  # Update feature flags or configuration for maintenance banners
  
  # 3. Prepare monitoring dashboards
  echo "Preparing maintenance monitoring dashboards..."
  # Set up specific dashboards for maintenance monitoring
  
  # 4. Notify teams
  echo "Notifying maintenance teams..."
  curl -X POST "https://hooks.slack.com/services/..." \
    -H 'Content-type: application/json' \
    --data '{
      "text": "🔧 Scheduled maintenance beginning now",
      "channel": "#operations",
      "username": "Maintenance Bot"
    }'
}
```

## Database Maintenance

### Routine Database Maintenance
```sql
-- Database Maintenance Procedures

-- 1. Database Health Check
DO $$
DECLARE
    db_size_gb numeric;
    connection_count int;
    slow_query_count int;
    fragmentation_ratio numeric;
BEGIN
    -- Check database size
    SELECT round(pg_database_size(current_database())::numeric / 1024 / 1024 / 1024, 2) 
    INTO db_size_gb;
    
    -- Check active connections
    SELECT count(*) FROM pg_stat_activity WHERE state = 'active' 
    INTO connection_count;
    
    -- Check for slow queries
    SELECT count(*) FROM pg_stat_statements 
    WHERE mean_time > 1000 
    INTO slow_query_count;
    
    -- Log maintenance start
    INSERT INTO maintenance_logs (
        type, status, metrics, started_at
    ) VALUES (
        'database_health_check', 'started', 
        jsonb_build_object(
            'db_size_gb', db_size_gb,
            'connections', connection_count,
            'slow_queries', slow_query_count
        ),
        NOW()
    );
    
    -- Raise warnings if thresholds exceeded
    IF connection_count > 70 THEN
        RAISE WARNING 'High connection count detected: %', connection_count;
    END IF;
    
    IF slow_query_count > 10 THEN
        RAISE WARNING 'Multiple slow queries detected: %', slow_query_count;
    END IF;
END $$;

-- 2. Table Maintenance and Optimization
DO $$
DECLARE
    table_record record;
    vacuum_start timestamp;
    vacuum_end timestamp;
BEGIN
    -- Vacuum and analyze high-traffic tables
    FOR table_record IN 
        SELECT schemaname, tablename, n_dead_tup
        FROM pg_stat_user_tables 
        WHERE n_dead_tup > 1000
        ORDER BY n_dead_tup DESC
    LOOP
        vacuum_start := clock_timestamp();
        
        EXECUTE format('VACUUM (ANALYZE, VERBOSE) %I.%I', 
                      table_record.schemaname, 
                      table_record.tablename);
        
        vacuum_end := clock_timestamp();
        
        INSERT INTO maintenance_logs (
            type, status, table_name, duration, completed_at
        ) VALUES (
            'vacuum_analyze', 'completed',
            table_record.schemaname || '.' || table_record.tablename,
            EXTRACT(EPOCH FROM (vacuum_end - vacuum_start)),
            vacuum_end
        );
    END LOOP;
END $$;

-- 3. Index Maintenance
DO $$
DECLARE
    index_record record;
    reindex_start timestamp;
    reindex_end timestamp;
BEGIN
    -- Reindex fragmented indexes
    FOR index_record IN
        SELECT schemaname, tablename, indexname,
               idx_tup_read, idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE idx_tup_read > 100000 
        AND (idx_tup_fetch::float / idx_tup_read::float) < 0.01
    LOOP
        reindex_start := clock_timestamp();
        
        EXECUTE format('REINDEX INDEX CONCURRENTLY %I.%I',
                      index_record.schemaname,
                      index_record.indexname);
        
        reindex_end := clock_timestamp();
        
        INSERT INTO maintenance_logs (
            type, status, table_name, index_name, duration, completed_at
        ) VALUES (
            'reindex', 'completed',
            index_record.schemaname || '.' || index_record.tablename,
            index_record.indexname,
            EXTRACT(EPOCH FROM (reindex_end - reindex_start)),
            reindex_end
        );
    END LOOP;
END $$;

-- 4. Statistics Update
DO $$
BEGIN
    -- Update query planner statistics
    ANALYZE;
    
    -- Update extension statistics if using extensions
    SELECT pg_stat_reset();
    
    INSERT INTO maintenance_logs (
        type, status, completed_at
    ) VALUES (
        'statistics_update', 'completed', NOW()
    );
END $$;

-- 5. Cleanup Old Data
DO $$
DECLARE
    cleanup_count int;
BEGIN
    -- Clean up old audit logs (keep 90 days)
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    INSERT INTO maintenance_logs (
        type, status, records_affected, completed_at
    ) VALUES (
        'audit_log_cleanup', 'completed', cleanup_count, NOW()
    );
    
    -- Clean up expired sessions
    DELETE FROM auth.sessions 
    WHERE expires_at < NOW();
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    INSERT INTO maintenance_logs (
        type, status, records_affected, completed_at
    ) VALUES (
        'session_cleanup', 'completed', cleanup_count, NOW()
    );
END $$;
```

### Database Performance Optimization
```sql
-- Performance Optimization Procedures

-- 1. Query Performance Analysis
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE (
    query_hash text,
    total_time numeric,
    mean_time numeric,
    calls bigint,
    rows_per_call numeric,
    cache_hit_ratio numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        left(query, 100) as query_hash,
        round(total_time::numeric, 2) as total_time,
        round(mean_time::numeric, 2) as mean_time,
        calls,
        round((total_rows::numeric / calls::numeric), 2) as rows_per_call,
        round(
            (shared_blks_hit::numeric / 
             NULLIF(shared_blks_hit + shared_blks_read, 0)) * 100, 
            2
        ) as cache_hit_ratio
    FROM pg_stat_statements
    WHERE calls > 10
    ORDER BY total_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 2. Connection Pool Optimization
CREATE OR REPLACE FUNCTION optimize_connection_pool()
RETURNS void AS $$
DECLARE
    active_connections int;
    idle_connections int;
    max_connections int;
BEGIN
    -- Get current connection stats
    SELECT count(*) FROM pg_stat_activity WHERE state = 'active' 
    INTO active_connections;
    
    SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'
    INTO idle_connections;
    
    SELECT setting::int FROM pg_settings WHERE name = 'max_connections'
    INTO max_connections;
    
    -- Log connection pool status
    INSERT INTO maintenance_logs (
        type, status, metrics, completed_at
    ) VALUES (
        'connection_pool_analysis', 'completed',
        jsonb_build_object(
            'active_connections', active_connections,
            'idle_connections', idle_connections,
            'max_connections', max_connections,
            'utilization_percent', 
            round((active_connections::numeric / max_connections::numeric) * 100, 2)
        ),
        NOW()
    );
    
    -- Terminate long-idle connections (>30 minutes)
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'idle'
    AND state_change < NOW() - INTERVAL '30 minutes'
    AND pid != pg_backend_pid();
    
END;
$$ LANGUAGE plpgsql;

-- 3. Cache Hit Ratio Analysis
CREATE OR REPLACE FUNCTION analyze_cache_performance()
RETURNS TABLE (
    cache_type text,
    hit_ratio numeric,
    recommendation text
) AS $$
BEGIN
    RETURN QUERY
    WITH cache_stats AS (
        SELECT 
            'Buffer Cache' as cache_type,
            round(
                (sum(heap_blks_hit)::numeric / 
                 NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)) * 100,
                2
            ) as hit_ratio
        FROM pg_statio_user_tables
        
        UNION ALL
        
        SELECT 
            'Index Cache' as cache_type,
            round(
                (sum(idx_blks_hit)::numeric / 
                 NULLIF(sum(idx_blks_hit) + sum(idx_blks_read), 0)) * 100,
                2
            ) as hit_ratio
        FROM pg_statio_user_indexes
    )
    SELECT 
        cs.cache_type,
        cs.hit_ratio,
        CASE 
            WHEN cs.hit_ratio > 95 THEN 'Excellent performance'
            WHEN cs.hit_ratio > 90 THEN 'Good performance'
            WHEN cs.hit_ratio > 80 THEN 'Consider increasing cache size'
            ELSE 'Poor performance - investigate immediately'
        END as recommendation
    FROM cache_stats cs;
END;
$$ LANGUAGE plpgsql;
```

## System Maintenance

### Log Management and Rotation
```bash
#!/bin/bash
# Log Management Procedures

log_maintenance() {
  echo "=== LOG MAINTENANCE PROCEDURES ==="
  
  # 1. Analyze current log usage
  echo "Analyzing log disk usage..."
  log_dirs=("/var/log" "/opt/app/logs" "/tmp/logs")
  
  for dir in "${log_dirs[@]}"; do
    if [ -d "$dir" ]; then
      usage=$(du -sh "$dir" | cut -f1)
      echo "Directory $dir: $usage"
      
      # Find large log files
      find "$dir" -name "*.log" -size +100M -exec ls -lh {} \; | head -10
    fi
  done
  
  # 2. Rotate application logs
  echo "Rotating application logs..."
  /usr/sbin/logrotate /etc/logrotate.d/thorbis-app
  
  # 3. Compress old logs
  echo "Compressing old log files..."
  find /var/log -name "*.log.*" -mtime +1 -not -name "*.gz" -exec gzip {} \;
  
  # 4. Clean up old compressed logs
  echo "Cleaning up old compressed logs..."
  find /var/log -name "*.log.*.gz" -mtime +30 -delete
  
  # 5. Archive logs to long-term storage
  echo "Archiving logs to S3..."
  aws s3 sync /var/log/archive/ s3://thorbis-log-archive/$(date +%Y/%m/%d)/ \
    --exclude "*" \
    --include "*.gz" \
    --storage-class GLACIER
  
  # 6. Clean up archived local files
  find /var/log/archive -name "*.gz" -mtime +7 -delete
  
  echo "Log maintenance completed"
}

# System cleanup procedures
system_cleanup() {
  echo "=== SYSTEM CLEANUP PROCEDURES ==="
  
  # 1. Clean temporary files
  echo "Cleaning temporary files..."
  find /tmp -type f -mtime +7 -delete
  find /var/tmp -type f -mtime +7 -delete
  
  # 2. Clean package cache
  echo "Cleaning package cache..."
  if command -v apt-get >/dev/null; then
    apt-get clean
    apt-get autoclean
  elif command -v yum >/dev/null; then
    yum clean all
  fi
  
  # 3. Clean Docker containers and images (if applicable)
  if command -v docker >/dev/null; then
    echo "Cleaning Docker resources..."
    docker system prune -f
    docker volume prune -f
  fi
  
  # 4. Check disk space
  echo "Checking disk space after cleanup..."
  df -h
  
  # Alert if disk usage still high
  disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
  if [ "$disk_usage" -gt 85 ]; then
    send_alert "High disk usage: ${disk_usage}% after cleanup"
  fi
}
```

### Security Maintenance
```bash
#!/bin/bash
# Security Maintenance Procedures

security_maintenance() {
  echo "=== SECURITY MAINTENANCE PROCEDURES ==="
  
  # 1. Update security patches
  echo "Checking for security updates..."
  if command -v apt-get >/dev/null; then
    apt-get update
    apt-get upgrade -s | grep -i security
  fi
  
  # 2. SSL certificate monitoring
  echo "Checking SSL certificates..."
  domains=("thorbis.com" "api.thorbis.com" "app.thorbis.com")
  
  for domain in "${domains[@]}"; do
    expiry_date=$(echo | openssl s_client -servername "$domain" \
      -connect "$domain:443" 2>/dev/null | \
      openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    
    expiry_epoch=$(date -d "$expiry_date" +%s)
    current_epoch=$(date +%s)
    days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    echo "$domain expires in $days_until_expiry days"
    
    if [ "$days_until_expiry" -lt 30 ]; then
      send_alert "SSL certificate for $domain expires in $days_until_expiry days"
    fi
  done
  
  # 3. Security scanning
  echo "Running security scans..."
  
  # Dependency vulnerability scan
  if command -v npm >/dev/null; then
    npm audit --audit-level moderate
  fi
  
  # Docker image scanning (if applicable)
  if command -v docker >/dev/null; then
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
      aquasec/trivy image thorbis-app:latest
  fi
  
  # 4. Access log analysis
  echo "Analyzing access logs for security events..."
  
  # Check for suspicious patterns
  suspicious_ips=$(grep -E "(40[1-4]|50[0-9])" /var/log/nginx/access.log | \
    awk '{print $1}' | sort | uniq -c | sort -nr | head -10)
  
  echo "Top IPs with 4xx/5xx responses:"
  echo "$suspicious_ips"
  
  # Check for brute force attempts
  brute_force_attempts=$(grep "authentication failed" /var/log/auth.log | \
    awk '{print $6}' | sort | uniq -c | awk '$1 > 10' | head -5)
  
  if [ -n "$brute_force_attempts" ]; then
    echo "Potential brute force attempts detected:"
    echo "$brute_force_attempts"
    send_alert "Brute force attempts detected"
  fi
}

# Firewall and access control maintenance
firewall_maintenance() {
  echo "=== FIREWALL MAINTENANCE ==="
  
  # 1. Review firewall rules
  echo "Current firewall status:"
  if command -v ufw >/dev/null; then
    ufw status verbose
  elif command -v iptables >/dev/null; then
    iptables -L -n -v
  fi
  
  # 2. Update IP whitelist/blacklist
  echo "Updating IP access lists..."
  
  # Remove expired temporary blocks
  # This would be implemented based on specific firewall solution
  
  # 3. Test critical access paths
  echo "Testing critical access paths..."
  critical_endpoints=(
    "https://thorbis.com/api/health"
    "https://api.thorbis.com/health"
  )
  
  for endpoint in "${endpoints[@]}"; do
    if curl -s --connect-timeout 10 "$endpoint" > /dev/null; then
      echo "✓ $endpoint accessible"
    else
      echo "✗ $endpoint not accessible"
      send_alert "Critical endpoint not accessible: $endpoint"
    fi
  done
}
```

## Performance Maintenance

### Performance Optimization Procedures
```typescript
interface PerformanceMaintenanceProcedures {
  cacheOptimization: {
    frequency: 'Daily',
    procedures: [
      'Cache hit ratio analysis',
      'Cache size optimization',
      'Stale cache cleanup',
      'Cache warming for critical data'
    ],
    tools: ['Redis CLI', 'Custom monitoring scripts', 'Performance dashboards']
  },
  
  databaseTuning: {
    frequency: 'Weekly',
    procedures: [
      'Query performance analysis',
      'Index usage evaluation',
      'Connection pool optimization',
      'Buffer cache tuning'
    ],
    tools: ['pg_stat_statements', 'Custom SQL scripts', 'Performance monitoring']
  },
  
  applicationOptimization: {
    frequency: 'Bi-weekly',
    procedures: [
      'Bundle size analysis',
      'Code splitting optimization',
      'Image optimization review',
      'CDN configuration tuning'
    ],
    tools: ['Webpack Bundle Analyzer', 'Lighthouse', 'NextFaster metrics']
  }
}
```

### Automated Performance Monitoring
```bash
#!/bin/bash
# Automated Performance Monitoring

performance_monitoring() {
  echo "=== PERFORMANCE MONITORING ==="
  
  # 1. API Response Time Analysis
  echo "Analyzing API response times..."
  
  endpoints=(
    "https://thorbis.com/api/health"
    "https://thorbis.com/api/hs/app/v1/work-orders"
    "https://thorbis.com/api/auth/session"
  )
  
  for endpoint in "${endpoints[@]}"; do
    response_time=$(curl -o /dev/null -s -w "%{time_total}" "$endpoint")
    http_code=$(curl -o /dev/null -s -w "%{http_code}" "$endpoint")
    
    echo "$endpoint: ${response_time}s (HTTP $http_code)"
    
    # Alert if response time exceeds NextFaster threshold
    if (( $(echo "$response_time > 0.3" | bc -l) )); then
      send_alert "Slow API response: $endpoint took ${response_time}s"
    fi
  done
  
  # 2. Database Performance Check
  echo "Checking database performance..."
  
  # Query response times
  db_response_time=$(supabase exec sql --query "
    SELECT round(mean_time, 2) as avg_response_time
    FROM pg_stat_statements 
    ORDER BY mean_time DESC 
    LIMIT 1
  " | tail -1)
  
  echo "Slowest query average time: ${db_response_time}ms"
  
  # Connection pool status
  active_connections=$(supabase exec sql --query "
    SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
  " | tail -1)
  
  echo "Active database connections: $active_connections"
  
  # 3. Cache Performance
  echo "Analyzing cache performance..."
  
  # This would integrate with your caching solution (Redis, etc.)
  # cache_hit_ratio=$(redis-cli info stats | grep keyspace_hits)
  # echo "Cache hit ratio: $cache_hit_ratio"
  
  # 4. Resource Utilization
  echo "Checking resource utilization..."
  
  # CPU and Memory usage
  cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
  memory_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100}')
  
  echo "CPU Usage: ${cpu_usage}%"
  echo "Memory Usage: ${memory_usage}%"
  
  # Alert on high resource usage
  if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    send_alert "High CPU usage: ${cpu_usage}%"
  fi
  
  if (( $(echo "$memory_usage > 85" | bc -l) )); then
    send_alert "High memory usage: ${memory_usage}%"
  fi
}
```

## Post-Maintenance Procedures

### Validation and Testing
```bash
#!/bin/bash
# Post-Maintenance Validation

post_maintenance_validation() {
  echo "=== POST-MAINTENANCE VALIDATION ==="
  
  # 1. System Health Check
  echo "Performing comprehensive health check..."
  
  # API endpoints
  endpoints=(
    "https://thorbis.com/api/health"
    "https://thorbis.com/api/hs/health"
    "https://api.thorbis.com/health"
  )
  
  failed_endpoints=0
  for endpoint in "${endpoints[@]}"; do
    if curl -s --connect-timeout 10 "$endpoint" | grep -q "healthy"; then
      echo "✓ $endpoint: healthy"
    else
      echo "✗ $endpoint: failed"
      ((failed_endpoints++))
    fi
  done
  
  if [ $failed_endpoints -gt 0 ]; then
    echo "ERROR: $failed_endpoints endpoints failed health check"
    return 1
  fi
  
  # 2. Database Connectivity
  echo "Testing database connectivity..."
  if supabase exec sql --query "SELECT 1" > /dev/null 2>&1; then
    echo "✓ Database: connected"
  else
    echo "✗ Database: connection failed"
    return 1
  fi
  
  # 3. Authentication System
  echo "Testing authentication system..."
  auth_response=$(curl -s -X POST "https://thorbis.com/api/auth/test" \
    -H "Content-Type: application/json" \
    -d '{"test": true}')
  
  if echo "$auth_response" | grep -q "success"; then
    echo "✓ Authentication: working"
  else
    echo "✗ Authentication: failed"
    return 1
  fi
  
  # 4. Performance Validation
  echo "Validating performance metrics..."
  
  # Check API response times
  avg_response_time=$(curl -o /dev/null -s -w "%{time_total}" "https://thorbis.com/api/health")
  
  if (( $(echo "$avg_response_time < 0.5" | bc -l) )); then
    echo "✓ Performance: response time ${avg_response_time}s"
  else
    echo "⚠ Performance: slow response time ${avg_response_time}s"
  fi
  
  # 5. Integration Testing
  echo "Testing critical integrations..."
  
  # Payment system
  payment_test=$(curl -s "https://api.stripe.com/v1/account" \
    -H "Authorization: Bearer $STRIPE_SECRET_KEY")
  
  if echo "$payment_test" | grep -q "id"; then
    echo "✓ Payment integration: working"
  else
    echo "✗ Payment integration: failed"
    return 1
  fi
  
  echo "All validation checks passed"
  return 0
}

# Maintenance completion procedures
complete_maintenance() {
  echo "=== MAINTENANCE COMPLETION ==="
  
  # 1. Update status page
  echo "Updating status page..."
  curl -X PATCH "https://api.statuspage.io/v1/pages/$STATUS_PAGE_ID/incidents/$INCIDENT_ID" \
    -H "Authorization: OAuth $STATUS_PAGE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "incident": {
        "status": "resolved",
        "body": "Scheduled maintenance completed successfully. All services operating normally."
      }
    }'
  
  # 2. Send completion notification
  echo "Sending completion notifications..."
  curl -X POST "https://hooks.slack.com/services/..." \
    -H 'Content-type: application/json' \
    --data '{
      "text": "✅ Scheduled maintenance completed successfully",
      "channel": "#operations",
      "username": "Maintenance Bot"
    }'
  
  # 3. Log maintenance completion
  echo "Logging maintenance completion..."
  supabase exec sql --query "
    INSERT INTO maintenance_logs (
      type, status, duration, completed_at, notes
    ) VALUES (
      'scheduled_maintenance', 'completed', 
      EXTRACT(EPOCH FROM (NOW() - '$MAINTENANCE_START_TIME')),
      NOW(),
      'Routine maintenance completed successfully'
    )
  "
  
  # 4. Generate maintenance report
  echo "Generating maintenance report..."
  cat > "/tmp/maintenance-report-$(date +%Y%m%d).txt" << EOF
Maintenance Report
Date: $(date)
Duration: $((SECONDS / 60)) minutes

Activities Completed:
- Database optimization and maintenance
- Log rotation and cleanup
- Security updates applied
- Performance optimization
- System health validation

Post-Maintenance Status:
- All services operational
- Performance metrics within normal range
- No issues detected

Next Scheduled Maintenance: $(date -d "next sunday 02:00" '+%Y-%m-%d %H:%M UTC')
EOF

  echo "Maintenance completed successfully"
}
```

This comprehensive maintenance procedures guide ensures systematic, safe, and effective maintenance of the Thorbis Business OS platform, minimizing downtime while maximizing system performance, security, and reliability.
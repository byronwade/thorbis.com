# Backup & Recovery Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Data Protection Team  
> **Review Schedule**: Monthly  

## Overview

This comprehensive guide covers all backup and recovery procedures for the Thorbis Business OS platform, implementing a robust data protection strategy that ensures business continuity, regulatory compliance, and rapid disaster recovery capabilities across all system components and data types.

## Backup Strategy Framework

### 3-2-1 Backup Strategy
```typescript
interface BackupStrategy {
  principle: '3-2-1 Rule Implementation',
  copies: {
    total: 3,           // At least 3 copies of critical data
    locations: 2,       // Stored on 2 different media types
    offsite: 1,         // 1 copy stored offsite/cloud
    testing: 'Monthly'  // Regular restore testing
  },
  
  implementation: {
    primary: {
      location: 'Supabase automated backups',
      frequency: 'Continuous (point-in-time recovery)',
      retention: '30 days full granularity',
      type: 'Hot backup with immediate availability'
    },
    secondary: {
      location: 'AWS S3 Cross-Region Replication',
      frequency: 'Daily synchronized snapshots',
      retention: '90 days detailed, 1 year summarized',
      type: 'Warm backup with 15-minute recovery'
    },
    tertiary: {
      location: 'AWS Glacier Deep Archive',
      frequency: 'Weekly full system snapshots',
      retention: '7 years for compliance',
      type: 'Cold backup with 12-hour recovery'
    }
  }
}
```

### Data Classification and Backup Priorities
```typescript
interface DataClassification {
  critical: {
    description: 'Data essential for business operations',
    rpo: 15,            // 15 minutes Recovery Point Objective
    rto: 1,             // 1 hour Recovery Time Objective
    frequency: 'Continuous',
    retention: '7 years',
    examples: [
      'Customer data and profiles',
      'Financial transactions and invoices',
      'Work orders and service records',
      'Authentication and authorization data'
    ]
  },
  
  important: {
    description: 'Data important for business efficiency',
    rpo: 240,           // 4 hours RPO
    rto: 4,             // 4 hours RTO
    frequency: 'Every 4 hours',
    retention: '3 years',
    examples: [
      'Application configurations',
      'User preferences and settings',
      'Integration configurations',
      'Performance metrics and logs'
    ]
  },
  
  standard: {
    description: 'Data useful but not critical',
    rpo: 1440,          // 24 hours RPO
    rto: 24,            // 24 hours RTO
    frequency: 'Daily',
    retention: '1 year',
    examples: [
      'Analytics and reporting data',
      'Cached content and derivatives',
      'Development and testing data',
      'Documentation and help content'
    ]
  },
  
  archival: {
    description: 'Historical data for compliance',
    rpo: 10080,         // 1 week RPO
    rto: 168,           // 1 week RTO
    frequency: 'Weekly',
    retention: '10 years',
    examples: [
      'Audit logs and compliance records',
      'Historical business analytics',
      'Deleted user data (privacy compliance)',
      'Legacy system migrations'
    ]
  }
}
```

## Database Backup Procedures

### Supabase Database Backup Configuration
```sql
-- Database Backup Configuration and Monitoring

-- 1. Backup Status Monitoring
CREATE OR REPLACE VIEW backup_monitoring AS
WITH backup_stats AS (
    SELECT 
        'supabase_automated' as backup_type,
        now() - interval '1 day' as last_backup_window_start,
        now() as last_backup_window_end,
        true as backup_exists,
        'automated' as backup_method
),
custom_backups AS (
    SELECT 
        backup_type,
        backup_date,
        backup_size,
        duration,
        status,
        error_message
    FROM backup_logs 
    WHERE backup_date >= now() - interval '7 days'
    ORDER BY backup_date DESC
)
SELECT * FROM backup_stats
UNION ALL
SELECT 
    backup_type || '_custom' as backup_type,
    backup_date as last_backup_window_start,
    backup_date + (duration * interval '1 second') as last_backup_window_end,
    (status = 'completed') as backup_exists,
    'manual' as backup_method
FROM custom_backups;

-- 2. Critical Data Validation
CREATE OR REPLACE FUNCTION validate_backup_integrity()
RETURNS TABLE (
    table_name text,
    row_count bigint,
    last_updated timestamp,
    data_integrity_score numeric,
    validation_status text
) AS $$
BEGIN
    RETURN QUERY
    WITH table_stats AS (
        SELECT 
            schemaname || '.' || tablename as table_name,
            n_tup_ins + n_tup_upd + n_tup_del as total_operations,
            greatest(last_vacuum, last_autovacuum, last_analyze, last_autoanalyze) as last_maintenance
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
    ),
    row_counts AS (
        SELECT 
            table_name,
            (xpath('/row/c/text()', 
                   query_to_xml('SELECT count(*) as c FROM ' || table_name, false, true, '')))[1]::text::bigint as row_count
        FROM table_stats
    ),
    validation_results AS (
        SELECT 
            ts.table_name,
            COALESCE(rc.row_count, 0) as row_count,
            ts.last_maintenance as last_updated,
            CASE 
                WHEN rc.row_count > 0 THEN 100.0
                ELSE 0.0
            END as data_integrity_score,
            CASE 
                WHEN rc.row_count > 0 THEN 'VALID'
                ELSE 'EMPTY_OR_ERROR'
            END as validation_status
        FROM table_stats ts
        LEFT JOIN row_counts rc ON ts.table_name = rc.table_name
    )
    SELECT * FROM validation_results
    ORDER BY data_integrity_score ASC, row_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Backup Verification Procedures
CREATE OR REPLACE FUNCTION verify_backup_completeness()
RETURNS jsonb AS $$
DECLARE
    verification_result jsonb;
    total_tables int;
    tables_with_data int;
    critical_tables_missing text[];
BEGIN
    -- Count total tables
    SELECT count(*) FROM information_schema.tables 
    WHERE table_schema = 'public' INTO total_tables;
    
    -- Count tables with data
    SELECT count(*) FROM pg_stat_user_tables 
    WHERE n_tup_ins + n_tup_upd > 0 INTO tables_with_data;
    
    -- Check critical tables
    WITH critical_tables AS (
        SELECT unnest(ARRAY[
            'businesses', 'user_profiles', 'customers', 
            'work_orders', 'invoices', 'payments'
        ]) as table_name
    ),
    missing_critical AS (
        SELECT array_agg(ct.table_name) as missing
        FROM critical_tables ct
        LEFT JOIN pg_stat_user_tables pst ON ct.table_name = pst.tablename
        WHERE pst.tablename IS NULL OR pst.n_tup_ins + pst.n_tup_upd = 0
    )
    SELECT missing FROM missing_critical INTO critical_tables_missing;
    
    verification_result := jsonb_build_object(
        'total_tables', total_tables,
        'tables_with_data', tables_with_data,
        'data_coverage_percent', round((tables_with_data::numeric / total_tables::numeric) * 100, 2),
        'critical_tables_missing', critical_tables_missing,
        'verification_timestamp', now(),
        'status', CASE 
            WHEN array_length(critical_tables_missing, 1) > 0 THEN 'CRITICAL_MISSING'
            WHEN tables_with_data::numeric / total_tables::numeric < 0.8 THEN 'LOW_COVERAGE'
            ELSE 'HEALTHY'
        END
    );
    
    -- Log verification result
    INSERT INTO backup_verification_logs (
        verification_date, result, status
    ) VALUES (
        now(), verification_result, verification_result->>'status'
    );
    
    RETURN verification_result;
END;
$$ LANGUAGE plpgsql;
```

### Custom Database Backup Scripts
```bash
#!/bin/bash
# Custom Database Backup Procedures

# Configuration
BACKUP_DIR="/var/backups/database"
S3_BUCKET="thorbis-database-backups"
RETENTION_DAYS=90
ENCRYPTION_KEY_FILE="/etc/backup/encryption.key"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Database backup with encryption
backup_database() {
  local backup_type="$1"
  local timestamp=$(date +%Y%m%d-%H%M%S)
  local backup_file="$BACKUP_DIR/thorbis-db-${backup_type}-${timestamp}.sql"
  local encrypted_file="${backup_file}.enc"
  
  echo "=== DATABASE BACKUP - $backup_type ==="
  echo "Starting backup at $(date)"
  
  # Create backup
  case "$backup_type" in
    "full")
      echo "Creating full database backup..."
      pg_dump "$DATABASE_URL" \
        --verbose \
        --format=custom \
        --compress=9 \
        --file="$backup_file"
      ;;
    "schema")
      echo "Creating schema-only backup..."
      pg_dump "$DATABASE_URL" \
        --verbose \
        --schema-only \
        --format=custom \
        --file="$backup_file"
      ;;
    "data")
      echo "Creating data-only backup..."
      pg_dump "$DATABASE_URL" \
        --verbose \
        --data-only \
        --format=custom \
        --compress=9 \
        --file="$backup_file"
      ;;
    *)
      echo "ERROR: Unknown backup type '$backup_type'"
      exit 1
      ;;
  esac
  
  # Check if backup was successful
  if [ $? -eq 0 ] && [ -f "$backup_file" ]; then
    echo "✓ Database backup completed successfully"
    
    # Get backup size
    backup_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    echo "Backup size: $(numfmt --to=iec $backup_size)"
    
    # Encrypt backup
    echo "Encrypting backup..."
    openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
      -in "$backup_file" \
      -out "$encrypted_file" \
      -pass file:"$ENCRYPTION_KEY_FILE"
    
    if [ $? -eq 0 ]; then
      echo "✓ Backup encrypted successfully"
      rm "$backup_file"  # Remove unencrypted version
    else
      echo "✗ Backup encryption failed"
      return 1
    fi
    
    # Upload to S3
    upload_backup_to_s3 "$encrypted_file" "$backup_type"
    
    # Log backup completion
    log_backup_completion "$backup_type" "$backup_size" "success"
    
  else
    echo "✗ Database backup failed"
    log_backup_completion "$backup_type" "0" "failed"
    return 1
  fi
}

# Upload backup to S3 with lifecycle management
upload_backup_to_s3() {
  local backup_file="$1"
  local backup_type="$2"
  local s3_key="database/${backup_type}/$(basename "$backup_file")"
  
  echo "Uploading backup to S3..."
  aws s3 cp "$backup_file" "s3://$S3_BUCKET/$s3_key" \
    --storage-class STANDARD_IA \
    --metadata backup-type="$backup_type",created="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  
  if [ $? -eq 0 ]; then
    echo "✓ Backup uploaded to S3: s3://$S3_BUCKET/$s3_key"
    
    # Set lifecycle policy for automatic archival
    aws s3api put-object-tagging \
      --bucket "$S3_BUCKET" \
      --key "$s3_key" \
      --tagging "TagSet=[{Key=AutoArchive,Value=true},{Key=RetentionDays,Value=$RETENTION_DAYS}]"
  else
    echo "✗ S3 upload failed"
    return 1
  fi
}

# Verify backup integrity
verify_backup() {
  local backup_file="$1"
  
  echo "=== BACKUP VERIFICATION ==="
  echo "Verifying backup: $(basename "$backup_file")"
  
  # Decrypt for verification
  local temp_file="/tmp/backup-verify-$$.sql"
  openssl enc -aes-256-cbc -d -pbkdf2 -iter 100000 \
    -in "$backup_file" \
    -out "$temp_file" \
    -pass file:"$ENCRYPTION_KEY_FILE"
  
  if [ $? -ne 0 ]; then
    echo "✗ Failed to decrypt backup for verification"
    return 1
  fi
  
  # Verify backup file integrity
  if pg_restore --list "$temp_file" > /dev/null 2>&1; then
    echo "✓ Backup file structure is valid"
    
    # Count objects in backup
    object_count=$(pg_restore --list "$temp_file" | wc -l)
    echo "Backup contains $object_count database objects"
    
    rm "$temp_file"
    return 0
  else
    echo "✗ Backup file is corrupted or invalid"
    rm "$temp_file"
    return 1
  fi
}

# Log backup operations
log_backup_completion() {
  local backup_type="$1"
  local backup_size="$2"
  local status="$3"
  local duration=$SECONDS
  
  # Log to database
  psql "$DATABASE_URL" -c "
    INSERT INTO backup_logs (
      backup_type, backup_size, duration, status, 
      backup_date, notes
    ) VALUES (
      '$backup_type', $backup_size, $duration, '$status',
      NOW(), 'Automated backup via script'
    );
  " > /dev/null 2>&1
  
  # Log to syslog
  logger -t "thorbis-backup" "Database backup $backup_type completed with status: $status (${duration}s, ${backup_size} bytes)"
}

# Cleanup old backups
cleanup_old_backups() {
  echo "=== BACKUP CLEANUP ==="
  
  # Remove local backups older than 7 days
  find "$BACKUP_DIR" -name "*.enc" -mtime +7 -delete
  
  # Remove old S3 backups (handled by lifecycle policy, but double-check)
  aws s3 ls "s3://$S3_BUCKET/database/" --recursive | \
    awk '$1 < "'$(date -d "$RETENTION_DAYS days ago" '+%Y-%m-%d')'" {print $4}' | \
    xargs -r -I {} aws s3 rm "s3://$S3_BUCKET/{}"
  
  echo "✓ Old backup cleanup completed"
}
```

## File Storage Backup Procedures

### Supabase Storage Backup
```bash
#!/bin/bash
# Supabase Storage Backup Procedures

STORAGE_BACKUP_DIR="/var/backups/storage"
SUPABASE_URL="$SUPABASE_URL"
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
S3_STORAGE_BUCKET="thorbis-storage-backups"

# Ensure storage backup directory exists
mkdir -p "$STORAGE_BACKUP_DIR"

# Backup all storage buckets
backup_storage() {
  echo "=== SUPABASE STORAGE BACKUP ==="
  local timestamp=$(date +%Y%m%d-%H%M%S)
  local backup_dir="$STORAGE_BACKUP_DIR/storage-backup-$timestamp"
  
  mkdir -p "$backup_dir"
  
  # Get list of storage buckets
  buckets=$(curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    "$SUPABASE_URL/storage/v1/bucket" | \
    jq -r '.[] | .name')
  
  for bucket in $buckets; do
    echo "Backing up bucket: $bucket"
    
    # Create bucket directory
    bucket_dir="$backup_dir/$bucket"
    mkdir -p "$bucket_dir"
    
    # Get list of files in bucket
    files=$(curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      "$SUPABASE_URL/storage/v1/object/list/$bucket" | \
      jq -r '.[] | select(.name != null) | .name')
    
    # Download each file
    file_count=0
    for file in $files; do
      echo "  Downloading: $file"
      
      curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/storage/v1/object/$bucket/$file" \
        -o "$bucket_dir/$file"
      
      if [ $? -eq 0 ]; then
        ((file_count++))
      else
        echo "  ✗ Failed to download: $file"
      fi
    done
    
    echo "  ✓ Downloaded $file_count files from $bucket"
  done
  
  # Create compressed archive
  echo "Creating compressed archive..."
  tar -czf "$backup_dir.tar.gz" -C "$STORAGE_BACKUP_DIR" "$(basename "$backup_dir")"
  
  if [ $? -eq 0 ]; then
    echo "✓ Storage backup archive created: $backup_dir.tar.gz"
    
    # Upload to S3
    aws s3 cp "$backup_dir.tar.gz" "s3://$S3_STORAGE_BUCKET/$(basename "$backup_dir.tar.gz")"
    
    # Cleanup local files
    rm -rf "$backup_dir"
    rm "$backup_dir.tar.gz"
    
    echo "✓ Storage backup completed and uploaded to S3"
  else
    echo "✗ Failed to create storage backup archive"
    return 1
  fi
}

# Incremental storage backup (only changed files)
incremental_storage_backup() {
  echo "=== INCREMENTAL STORAGE BACKUP ==="
  
  local last_backup_file="/var/lib/backup/last_storage_backup.timestamp"
  local timestamp=$(date +%Y%m%d-%H%M%S)
  local backup_dir="$STORAGE_BACKUP_DIR/incremental-$timestamp"
  
  # Get last backup timestamp
  if [ -f "$last_backup_file" ]; then
    last_backup=$(cat "$last_backup_file")
    echo "Last backup: $last_backup"
  else
    last_backup="1970-01-01T00:00:00Z"
    echo "No previous backup found, performing full backup"
  fi
  
  mkdir -p "$backup_dir"
  
  # Get list of buckets and check for modified files
  buckets=$(curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    "$SUPABASE_URL/storage/v1/bucket" | \
    jq -r '.[] | .name')
  
  total_files=0
  for bucket in $buckets; do
    echo "Checking bucket: $bucket"
    
    # Get files modified since last backup
    modified_files=$(curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      "$SUPABASE_URL/storage/v1/object/list/$bucket" | \
      jq -r --arg last_backup "$last_backup" \
      '.[] | select(.updated_at > $last_backup) | .name')
    
    if [ -n "$modified_files" ]; then
      bucket_dir="$backup_dir/$bucket"
      mkdir -p "$bucket_dir"
      
      file_count=0
      for file in $modified_files; do
        echo "  Backing up modified file: $file"
        
        curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
          "$SUPABASE_URL/storage/v1/object/$bucket/$file" \
          -o "$bucket_dir/$file"
        
        if [ $? -eq 0 ]; then
          ((file_count++))
          ((total_files++))
        fi
      done
      
      echo "  ✓ Backed up $file_count modified files from $bucket"
    else
      echo "  No modified files in $bucket"
    fi
  done
  
  if [ $total_files -gt 0 ]; then
    # Create archive and upload
    tar -czf "$backup_dir.tar.gz" -C "$STORAGE_BACKUP_DIR" "$(basename "$backup_dir")"
    aws s3 cp "$backup_dir.tar.gz" "s3://$S3_STORAGE_BUCKET/incremental/"
    
    # Cleanup
    rm -rf "$backup_dir"
    rm "$backup_dir.tar.gz"
    
    echo "✓ Incremental backup completed: $total_files files"
  else
    echo "No modified files found, skipping backup"
    rmdir "$backup_dir" 2>/dev/null
  fi
  
  # Update last backup timestamp
  date -u +%Y-%m-%dT%H:%M:%SZ > "$last_backup_file"
}
```

## Configuration and Code Backup

### Application Configuration Backup
```bash
#!/bin/bash
# Application Configuration Backup

CONFIG_BACKUP_DIR="/var/backups/config"
GIT_BACKUP_DIR="/var/backups/git"
S3_CONFIG_BUCKET="thorbis-config-backups"

# Ensure backup directories exist
mkdir -p "$CONFIG_BACKUP_DIR" "$GIT_BACKUP_DIR"

# Backup application configurations
backup_configurations() {
  echo "=== CONFIGURATION BACKUP ==="
  local timestamp=$(date +%Y%m%d-%H%M%S)
  local backup_file="$CONFIG_BACKUP_DIR/config-backup-$timestamp.tar.gz"
  
  # Configuration directories and files to backup
  config_paths=(
    "/etc/nginx"
    "/etc/ssl"
    "/etc/systemd/system"
    "/opt/app/config"
    "/var/lib/app/config"
    "$HOME/.env"
    "$HOME/.aws/config"
  )
  
  # Create list of existing paths
  existing_paths=()
  for path in "${config_paths[@]}"; do
    if [ -e "$path" ]; then
      existing_paths+=("$path")
    fi
  done
  
  if [ ${#existing_paths[@]} -gt 0 ]; then
    echo "Backing up configuration files..."
    tar -czf "$backup_file" "${existing_paths[@]}" 2>/dev/null
    
    if [ $? -eq 0 ]; then
      echo "✓ Configuration backup created: $backup_file"
      
      # Upload to S3
      aws s3 cp "$backup_file" "s3://$S3_CONFIG_BUCKET/config/"
      
      # Log backup
      backup_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
      echo "Backup size: $(numfmt --to=iec $backup_size)"
      
      return 0
    else
      echo "✗ Configuration backup failed"
      return 1
    fi
  else
    echo "No configuration paths found to backup"
    return 1
  fi
}

# Backup Git repositories
backup_git_repositories() {
  echo "=== GIT REPOSITORY BACKUP ==="
  local timestamp=$(date +%Y%m%d-%H%M%S)
  local backup_dir="$GIT_BACKUP_DIR/git-backup-$timestamp"
  
  mkdir -p "$backup_dir"
  
  # List of Git repositories to backup
  git_repos=(
    "/opt/thorbis-business-os"
    "/opt/deployment-scripts"
    "/etc/infrastructure-configs"
  )
  
  for repo_path in "${git_repos[@]}"; do
    if [ -d "$repo_path/.git" ]; then
      echo "Backing up Git repository: $repo_path"
      
      repo_name=$(basename "$repo_path")
      backup_repo_dir="$backup_dir/$repo_name"
      
      # Create bare repository backup
      git clone --bare "$repo_path" "$backup_repo_dir.git"
      
      if [ $? -eq 0 ]; then
        echo "  ✓ Repository backed up successfully"
        
        # Also backup current working directory
        tar -czf "$backup_repo_dir-working.tar.gz" \
          --exclude='.git' \
          --exclude='node_modules' \
          --exclude='.next' \
          -C "$(dirname "$repo_path")" \
          "$(basename "$repo_path")"
        
      else
        echo "  ✗ Repository backup failed"
      fi
    else
      echo "Repository not found or not a Git repository: $repo_path"
    fi
  done
  
  # Create combined archive
  if [ "$(ls -A "$backup_dir" 2>/dev/null)" ]; then
    tar -czf "$backup_dir.tar.gz" -C "$GIT_BACKUP_DIR" "$(basename "$backup_dir")"
    
    # Upload to S3
    aws s3 cp "$backup_dir.tar.gz" "s3://$S3_CONFIG_BUCKET/git/"
    
    # Cleanup local backup
    rm -rf "$backup_dir"
    rm "$backup_dir.tar.gz"
    
    echo "✓ Git repository backup completed and uploaded"
  else
    echo "No Git repositories found to backup"
    rmdir "$backup_dir"
  fi
}

# Backup environment variables and secrets
backup_environment_config() {
  echo "=== ENVIRONMENT CONFIGURATION BACKUP ==="
  local timestamp=$(date +%Y%m%d-%H%M%S)
  local backup_file="$CONFIG_BACKUP_DIR/env-backup-$timestamp.enc"
  
  # Create temporary file with environment configuration
  temp_env_file="/tmp/env-backup-$$.json"
  
  cat > "$temp_env_file" << EOF
{
  "backup_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": {
    "NODE_ENV": "$NODE_ENV",
    "NEXT_PUBLIC_SUPABASE_URL": "$NEXT_PUBLIC_SUPABASE_URL",
    "DATABASE_URL_STRUCTURE": "$(echo "$DATABASE_URL" | sed 's/:[^@]*@/:****@/')",
    "VERCEL_PROJECT_ID": "$VERCEL_PROJECT_ID",
    "DOMAIN_CONFIG": "$(echo "$DOMAIN_CONFIG" | head -c 50)..."
  },
  "services": {
    "supabase": {
      "url": "$NEXT_PUBLIC_SUPABASE_URL",
      "project_ref": "$(echo "$DATABASE_URL" | grep -o '[a-z]*\\.supabase' | cut -d. -f1)"
    },
    "vercel": {
      "project_id": "$VERCEL_PROJECT_ID",
      "team_id": "$VERCEL_TEAM_ID"
    }
  }
}
EOF
  
  # Encrypt environment backup
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in "$temp_env_file" \
    -out "$backup_file" \
    -pass file:"$ENCRYPTION_KEY_FILE"
  
  if [ $? -eq 0 ]; then
    echo "✓ Environment configuration backed up and encrypted"
    
    # Upload to S3
    aws s3 cp "$backup_file" "s3://$S3_CONFIG_BUCKET/environment/"
    
    # Cleanup
    rm "$temp_env_file"
    
    return 0
  else
    echo "✗ Environment configuration backup failed"
    rm "$temp_env_file"
    return 1
  fi
}
```

## Recovery Procedures

### Database Recovery
```bash
#!/bin/bash
# Database Recovery Procedures

# Point-in-time database recovery
recover_database_pit() {
  local recovery_time="$1"
  local target_db="$2"
  
  echo "=== POINT-IN-TIME DATABASE RECOVERY ==="
  echo "Recovery time: $recovery_time"
  echo "Target database: $target_db"
  
  # Validate recovery time format
  if ! date -d "$recovery_time" >/dev/null 2>&1; then
    echo "✗ Invalid recovery time format. Use: YYYY-MM-DD HH:MM:SS"
    return 1
  fi
  
  # Create recovery database if it doesn't exist
  createdb "$target_db" 2>/dev/null || true
  
  # Use Supabase CLI for point-in-time recovery
  echo "Initiating point-in-time recovery..."
  supabase db recovery \
    --timestamp "$recovery_time" \
    --target-db "$target_db" \
    --confirm
  
  if [ $? -eq 0 ]; then
    echo "✓ Point-in-time recovery completed successfully"
    
    # Verify recovered data
    verify_recovered_database "$target_db"
  else
    echo "✗ Point-in-time recovery failed"
    return 1
  fi
}

# Full database recovery from backup
recover_database_full() {
  local backup_file="$1"
  local target_db="$2"
  local recovery_mode="$3"  # 'replace' or 'merge'
  
  echo "=== FULL DATABASE RECOVERY ==="
  echo "Backup file: $backup_file"
  echo "Target database: $target_db"
  echo "Recovery mode: $recovery_mode"
  
  # Decrypt backup file
  local temp_backup="/tmp/recovery-backup-$$.sql"
  openssl enc -aes-256-cbc -d -pbkdf2 -iter 100000 \
    -in "$backup_file" \
    -out "$temp_backup" \
    -pass file:"$ENCRYPTION_KEY_FILE"
  
  if [ $? -ne 0 ]; then
    echo "✗ Failed to decrypt backup file"
    return 1
  fi
  
  # Verify backup integrity before restore
  if ! pg_restore --list "$temp_backup" >/dev/null 2>&1; then
    echo "✗ Backup file is corrupted or invalid"
    rm "$temp_backup"
    return 1
  fi
  
  # Handle different recovery modes
  case "$recovery_mode" in
    "replace")
      echo "Dropping existing database and recreating..."
      dropdb "$target_db" 2>/dev/null
      createdb "$target_db"
      ;;
    "merge")
      echo "Merging with existing database..."
      # Additional logic for conflict resolution would go here
      ;;
    *)
      echo "✗ Invalid recovery mode. Use 'replace' or 'merge'"
      rm "$temp_backup"
      return 1
      ;;
  esac
  
  # Perform restoration
  echo "Restoring database from backup..."
  pg_restore \
    --verbose \
    --clean \
    --if-exists \
    --dbname="$target_db" \
    --jobs=4 \
    "$temp_backup"
  
  if [ $? -eq 0 ]; then
    echo "✓ Database recovery completed successfully"
    
    # Verify recovered data
    verify_recovered_database "$target_db"
    
    # Update sequences and perform post-recovery tasks
    post_recovery_tasks "$target_db"
  else
    echo "✗ Database recovery failed"
    rm "$temp_backup"
    return 1
  fi
  
  # Cleanup
  rm "$temp_backup"
}

# Verify recovered database
verify_recovered_database() {
  local database="$1"
  
  echo "=== DATABASE RECOVERY VERIFICATION ==="
  
  # Check table counts
  echo "Verifying table structure and data..."
  
  table_counts=$(psql -d "$database" -t -c "
    SELECT 
      schemaname || '.' || tablename as table_name,
      n_tup_ins + n_tup_upd as total_rows
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY total_rows DESC;
  ")
  
  echo "Table row counts:"
  echo "$table_counts"
  
  # Verify critical tables have data
  critical_tables=("businesses" "user_profiles" "customers" "work_orders" "invoices")
  
  for table in "${critical_tables[@]}"; do
    row_count=$(psql -d "$database" -t -c "SELECT count(*) FROM $table;" 2>/dev/null)
    
    if [ "$row_count" -gt 0 ] 2>/dev/null; then
      echo "✓ $table: $row_count rows"
    else
      echo "⚠️  $table: No data or table missing"
    fi
  done
  
  # Check referential integrity
  echo "Checking referential integrity..."
  integrity_check=$(psql -d "$database" -t -c "
    SELECT conname, conrelid::regclass, confrelid::regclass
    FROM pg_constraint 
    WHERE contype = 'f' 
    AND NOT convalidated;
  ")
  
  if [ -z "$integrity_check" ]; then
    echo "✓ All foreign key constraints are valid"
  else
    echo "⚠️  Foreign key constraint violations found:"
    echo "$integrity_check"
  fi
}

# Post-recovery tasks
post_recovery_tasks() {
  local database="$1"
  
  echo "=== POST-RECOVERY TASKS ==="
  
  # Update sequences to current maximum values
  echo "Updating sequence values..."
  psql -d "$database" -c "
    DO \$\$
    DECLARE
      seq_sql text;
    BEGIN
      FOR seq_sql IN
        SELECT 'SELECT setval(''' || sequence_name || ''', COALESCE((SELECT MAX(' || column_name || ') FROM ' || table_name || '), 1), false);'
        FROM information_schema.columns 
        WHERE column_default LIKE 'nextval%'
        AND table_schema = 'public'
      LOOP
        EXECUTE seq_sql;
      END LOOP;
    END \$\$;
  "
  
  # Analyze tables for query optimizer
  echo "Analyzing tables for query optimizer..."
  psql -d "$database" -c "ANALYZE;"
  
  # Vacuum tables to reclaim space
  echo "Vacuuming tables..."
  psql -d "$database" -c "VACUUM;"
  
  echo "✓ Post-recovery tasks completed"
}
```

### Disaster Recovery Testing
```bash
#!/bin/bash
# Disaster Recovery Testing Procedures

# Full disaster recovery test
disaster_recovery_test() {
  echo "=== DISASTER RECOVERY TEST ==="
  local test_timestamp=$(date +%Y%m%d-%H%M%S)
  local test_db="disaster_test_$test_timestamp"
  local test_results_file="/var/log/dr-test-$test_timestamp.log"
  
  {
    echo "Disaster Recovery Test Started: $(date)"
    echo "Test Database: $test_db"
    echo "================================="
    
    # Step 1: Test database recovery
    echo "1. Testing database recovery..."
    latest_backup=$(aws s3 ls "s3://$S3_BUCKET/database/full/" | \
      sort | tail -1 | awk '{print $4}')
    
    if [ -n "$latest_backup" ]; then
      aws s3 cp "s3://$S3_BUCKET/database/full/$latest_backup" "/tmp/$latest_backup"
      recover_database_full "/tmp/$latest_backup" "$test_db" "replace"
      
      if [ $? -eq 0 ]; then
        echo "✓ Database recovery test passed"
      else
        echo "✗ Database recovery test failed"
      fi
    else
      echo "✗ No database backup found for testing"
    fi
    
    # Step 2: Test storage recovery
    echo "2. Testing storage recovery..."
    test_storage_recovery
    
    # Step 3: Test configuration recovery
    echo "3. Testing configuration recovery..."
    test_configuration_recovery
    
    # Step 4: Test application startup
    echo "4. Testing application startup..."
    test_application_startup "$test_db"
    
    # Step 5: Performance validation
    echo "5. Testing performance..."
    test_recovery_performance "$test_db"
    
    echo "================================="
    echo "Disaster Recovery Test Completed: $(date)"
    
  } | tee "$test_results_file"
  
  # Cleanup test database
  dropdb "$test_db" 2>/dev/null
  
  # Send test results
  send_dr_test_results "$test_results_file"
}

# Test storage recovery
test_storage_recovery() {
  local test_storage_dir="/tmp/storage-recovery-test"
  mkdir -p "$test_storage_dir"
  
  # Download latest storage backup
  latest_storage_backup=$(aws s3 ls "s3://$S3_STORAGE_BUCKET/" | \
    sort | tail -1 | awk '{print $4}')
  
  if [ -n "$latest_storage_backup" ]; then
    aws s3 cp "s3://$S3_STORAGE_BUCKET/$latest_storage_backup" \
      "$test_storage_dir/$latest_storage_backup"
    
    # Extract and verify
    tar -xzf "$test_storage_dir/$latest_storage_backup" \
      -C "$test_storage_dir"
    
    if [ $? -eq 0 ]; then
      # Count recovered files
      file_count=$(find "$test_storage_dir" -type f | wc -l)
      echo "✓ Storage recovery test passed: $file_count files recovered"
    else
      echo "✗ Storage recovery test failed"
    fi
  else
    echo "✗ No storage backup found for testing"
  fi
  
  # Cleanup
  rm -rf "$test_storage_dir"
}

# Test configuration recovery
test_configuration_recovery() {
  local test_config_dir="/tmp/config-recovery-test"
  mkdir -p "$test_config_dir"
  
  # Download latest configuration backup
  latest_config_backup=$(aws s3 ls "s3://$S3_CONFIG_BUCKET/config/" | \
    sort | tail -1 | awk '{print $4}')
  
  if [ -n "$latest_config_backup" ]; then
    aws s3 cp "s3://$S3_CONFIG_BUCKET/config/$latest_config_backup" \
      "$test_config_dir/$latest_config_backup"
    
    # Extract and verify
    tar -xzf "$test_config_dir/$latest_config_backup" \
      -C "$test_config_dir"
    
    if [ $? -eq 0 ]; then
      echo "✓ Configuration recovery test passed"
    else
      echo "✗ Configuration recovery test failed"
    fi
  else
    echo "✗ No configuration backup found for testing"
  fi
  
  # Cleanup
  rm -rf "$test_config_dir"
}

# Send disaster recovery test results
send_dr_test_results() {
  local results_file="$1"
  
  # Email results to operations team
  mail -s "Disaster Recovery Test Results - $(date +%Y-%m-%d)" \
    operations@thorbis.com < "$results_file"
  
  # Upload to S3 for archival
  aws s3 cp "$results_file" \
    "s3://$S3_BUCKET/disaster-recovery-tests/$(basename "$results_file")"
  
  # Send Slack notification
  if grep -q "✗" "$results_file"; then
    alert_type="warning"
    alert_message="⚠️ Disaster Recovery Test completed with failures"
  else
    alert_type="success"
    alert_message="✅ Disaster Recovery Test completed successfully"
  fi
  
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-type: application/json' \
    --data "{
      \"text\": \"$alert_message\",
      \"channel\": \"#operations\",
      \"attachments\": [{
        \"color\": \"$alert_type\",
        \"fields\": [{
          \"title\": \"Test Results\",
          \"value\": \"See detailed results in S3: disaster-recovery-tests/$(basename "$results_file")\",
          \"short\": false
        }]
      }]
    }"
}
```

This comprehensive backup and recovery guide ensures robust data protection and rapid disaster recovery capabilities for the Thorbis Business OS platform, meeting compliance requirements while maintaining business continuity.
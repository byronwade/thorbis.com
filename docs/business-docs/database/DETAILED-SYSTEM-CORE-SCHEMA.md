# Detailed System Core Schema - PostgreSQL 17 Architecture

> **Version**: 2.0.0  
> **Status**: Production Ready  
> **PostgreSQL Version**: 17+  
> **Last Updated**: 2025-01-31

## Overview

This document provides an extremely detailed specification for the `system_core` schema, utilizing cutting-edge PostgreSQL 17 features including the new VACUUM memory management, JSON_TABLE functionality, streaming I/O optimizations, and advanced multi-tenant patterns. Every table includes complete column specifications, constraints, indexes, triggers, and performance optimizations.

## PostgreSQL 17 Feature Utilization

### Core Technology Stack
- **PostgreSQL 17**: Latest performance and JSON enhancements
- **Citus 13.0**: Distributed multi-tenant sharding when needed
- **JSON_TABLE**: Advanced JSON querying capabilities
- **Streaming I/O**: Optimized sequential reads and bulk operations
- **Enhanced VACUUM**: 20x reduced memory usage for maintenance
- **WAL Processing**: 2x better write throughput under concurrency

## Schema: system_core

### Core Infrastructure Tables

#### 1. activity_stream - Universal Activity Tracking

```sql
-- =======================
-- ACTIVITY STREAM TABLE
-- =======================
CREATE TABLE system_core.activity_stream (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation (NEVER NULL)
    business_id UUID NOT NULL,
    
    -- Activity source and context
    user_id UUID,
    system_id VARCHAR(50), -- For automated system activities
    session_id UUID,
    
    -- Activity classification
    activity_type VARCHAR(100) NOT NULL 
        CHECK (activity_type ~ '^[a-z][a-z0-9_]*[a-z0-9]$'),
    activity_category VARCHAR(50) NOT NULL DEFAULT 'user_action'
        CHECK (activity_category IN ('user_action', 'system_event', 'integration', 'security', 'performance')),
    activity_level VARCHAR(20) NOT NULL DEFAULT 'info'
        CHECK (activity_level IN ('debug', 'info', 'warning', 'error', 'critical')),
    
    -- Entity relationships (polymorphic)
    entity_type VARCHAR(100),
    entity_id UUID,
    parent_entity_type VARCHAR(100),
    parent_entity_id UUID,
    
    -- Activity data with PostgreSQL 17 JSON enhancements
    activity_data JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Human-readable description
    description TEXT,
    summary VARCHAR(500),
    
    -- Performance and debugging
    execution_time_ms INTEGER CHECK (execution_time_ms >= 0),
    memory_usage_kb INTEGER CHECK (memory_usage_kb >= 0),
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    
    -- Temporal data with microsecond precision
    created_at TIMESTAMPTZ(6) DEFAULT NOW(),
    occurred_at TIMESTAMPTZ(6) DEFAULT NOW(),
    
    -- Soft delete and archival
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT activity_stream_entity_consistency 
        CHECK ((entity_type IS NULL) = (entity_id IS NULL)),
    CONSTRAINT activity_stream_parent_consistency 
        CHECK ((parent_entity_type IS NULL) = (parent_entity_id IS NULL)),
    CONSTRAINT activity_stream_archived_consistency 
        CHECK ((is_archived = FALSE) OR (archived_at IS NOT NULL))
)
PARTITION BY RANGE (created_at);

-- Monthly partitions for optimal performance
CREATE TABLE system_core.activity_stream_2025_01 
PARTITION OF system_core.activity_stream
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Performance indexes with PostgreSQL 17 optimizations
CREATE INDEX CONCURRENTLY idx_activity_stream_business_time 
ON system_core.activity_stream (business_id, created_at DESC, activity_type)
WHERE is_archived = FALSE;

CREATE INDEX CONCURRENTLY idx_activity_stream_user_recent 
ON system_core.activity_stream (user_id, created_at DESC)
WHERE user_id IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY idx_activity_stream_entity_lookup 
ON system_core.activity_stream (entity_type, entity_id, created_at DESC)
WHERE entity_type IS NOT NULL AND is_archived = FALSE;

-- JSON indexes for PostgreSQL 17 JSON_TABLE functionality
CREATE INDEX CONCURRENTLY idx_activity_stream_data_gin 
ON system_core.activity_stream USING GIN (activity_data);

CREATE INDEX CONCURRENTLY idx_activity_stream_metadata_gin 
ON system_core.activity_stream USING GIN (metadata);

-- RLS Policy
ALTER TABLE system_core.activity_stream ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_stream_business_isolation 
ON system_core.activity_stream
FOR ALL TO authenticated
USING (business_id = (current_setting('app.current_business_id'))::UUID);
```

#### 2. notifications - Advanced Notification System

```sql
-- =======================
-- NOTIFICATIONS TABLE
-- =======================
CREATE TABLE system_core.notifications (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    business_id UUID NOT NULL,
    
    -- Notification targeting
    recipient_id UUID NOT NULL, -- User ID
    recipient_type VARCHAR(50) DEFAULT 'user'
        CHECK (recipient_type IN ('user', 'role', 'department', 'business', 'external')),
    
    -- Notification source
    sender_id UUID,
    sender_type VARCHAR(50) DEFAULT 'system'
        CHECK (sender_type IN ('user', 'system', 'integration', 'automated')),
    
    -- Notification classification
    notification_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL
        CHECK (category IN ('info', 'success', 'warning', 'error', 'urgent', 'marketing')),
    priority_level INTEGER DEFAULT 3
        CHECK (priority_level BETWEEN 1 AND 9),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    rich_content JSONB, -- For complex notifications with formatting
    
    -- Related entity (polymorphic)
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    
    -- Delivery and interaction tracking
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    
    -- Delivery channels
    channels JSONB DEFAULT '["web"]'::jsonb
        CHECK (jsonb_typeof(channels) = 'array'),
    delivery_status JSONB DEFAULT '{}'::jsonb,
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Actions and CTAs
    actions JSONB, -- Array of action objects
    click_tracking JSONB DEFAULT '{}'::jsonb,
    
    -- Temporal data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT notifications_entity_consistency 
        CHECK ((related_entity_type IS NULL) = (related_entity_id IS NULL)),
    CONSTRAINT notifications_read_consistency 
        CHECK ((is_read = FALSE) OR (read_at IS NOT NULL)),
    CONSTRAINT notifications_dismissed_consistency 
        CHECK ((is_dismissed = FALSE) OR (dismissed_at IS NOT NULL)),
    CONSTRAINT notifications_expiry_future 
        CHECK (expires_at > created_at)
);

-- High-performance indexes for notification queries
CREATE INDEX CONCURRENTLY idx_notifications_recipient_unread_priority 
ON system_core.notifications (recipient_id, is_read, priority_level DESC, created_at DESC)
WHERE is_read = FALSE AND (expires_at IS NULL OR expires_at > NOW());

CREATE INDEX CONCURRENTLY idx_notifications_business_type_time 
ON system_core.notifications (business_id, notification_type, created_at DESC)
WHERE created_at >= NOW() - INTERVAL '90 days';

CREATE INDEX CONCURRENTLY idx_notifications_scheduled 
ON system_core.notifications (scheduled_for)
WHERE scheduled_for IS NOT NULL AND delivered_at IS NULL;

-- JSON indexes for complex queries
CREATE INDEX CONCURRENTLY idx_notifications_channels_gin 
ON system_core.notifications USING GIN (channels);

CREATE INDEX CONCURRENTLY idx_notifications_delivery_status_gin 
ON system_core.notifications USING GIN (delivery_status);

-- RLS Policy
ALTER TABLE system_core.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_recipient_access 
ON system_core.notifications
FOR ALL TO authenticated
USING (
    recipient_id = auth.uid() OR 
    (business_id = (current_setting('app.current_business_id'))::UUID AND
     EXISTS (SELECT 1 FROM user_mgmt.user_profiles up 
             WHERE up.user_id = auth.uid() 
               AND up.business_id = notifications.business_id 
               AND up.role_level IN ('owner', 'admin')))
);
```

#### 3. file_attachments - Universal File Management

```sql
-- =======================
-- FILE ATTACHMENTS TABLE
-- =======================
CREATE TABLE system_core.file_attachments (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    business_id UUID NOT NULL,
    
    -- File source and ownership
    uploaded_by UUID NOT NULL,
    uploaded_from VARCHAR(100), -- Source application/integration
    
    -- Entity associations (polymorphic)
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    attachment_context VARCHAR(100), -- 'profile_photo', 'invoice_receipt', 'work_order_before', etc.
    
    -- File metadata
    original_filename VARCHAR(500) NOT NULL,
    stored_filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    
    -- File type and classification
    mime_type VARCHAR(255) NOT NULL,
    file_extension VARCHAR(20),
    file_category VARCHAR(50) DEFAULT 'document'
        CHECK (file_category IN ('image', 'document', 'video', 'audio', 'archive', 'other')),
    
    -- Content analysis (PostgreSQL 17 JSON enhancements)
    file_metadata JSONB DEFAULT '{}'::jsonb, -- EXIF, dimensions, duration, etc.
    content_analysis JSONB, -- AI-generated content insights
    
    -- Storage and access
    storage_provider VARCHAR(50) DEFAULT 'supabase'
        CHECK (storage_provider IN ('supabase', 's3', 'gcs', 'azure', 'local')),
    storage_bucket VARCHAR(255),
    storage_path VARCHAR(1000),
    public_url TEXT,
    signed_url_expires_at TIMESTAMPTZ,
    
    -- Security and access control
    is_public BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(50) DEFAULT 'business'
        CHECK (access_level IN ('public', 'business', 'department', 'user', 'private')),
    encryption_key_id UUID, -- For encrypted files
    
    -- Processing status
    processing_status VARCHAR(50) DEFAULT 'completed'
        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'quarantined')),
    processing_error TEXT,
    
    -- Virus scanning and content moderation
    virus_scan_status VARCHAR(50) DEFAULT 'pending'
        CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'quarantined', 'failed')),
    virus_scan_at TIMESTAMPTZ,
    content_moderation_status VARCHAR(50) DEFAULT 'approved'
        CHECK (content_moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    
    -- Temporal data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    
    -- Soft delete and cleanup
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    
    -- Constraints
    CONSTRAINT file_attachments_deleted_consistency 
        CHECK ((is_deleted = FALSE) OR (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)),
    CONSTRAINT file_attachments_processing_error_consistency 
        CHECK ((processing_status != 'failed') OR (processing_error IS NOT NULL))
);

-- Performance indexes optimized for common queries
CREATE INDEX CONCURRENTLY idx_file_attachments_entity_context 
ON system_core.file_attachments (entity_type, entity_id, attachment_context, created_at DESC)
WHERE is_deleted = FALSE;

CREATE INDEX CONCURRENTLY idx_file_attachments_business_category_time 
ON system_core.file_attachments (business_id, file_category, created_at DESC)
WHERE is_deleted = FALSE;

CREATE INDEX CONCURRENTLY idx_file_attachments_uploader_recent 
ON system_core.file_attachments (uploaded_by, created_at DESC)
WHERE is_deleted = FALSE AND created_at >= NOW() - INTERVAL '30 days';

-- Specialized indexes for file management
CREATE INDEX CONCURRENTLY idx_file_attachments_processing_status 
ON system_core.file_attachments (processing_status, created_at)
WHERE processing_status IN ('pending', 'processing', 'failed');

CREATE INDEX CONCURRENTLY idx_file_attachments_virus_scan_pending 
ON system_core.file_attachments (virus_scan_status, created_at)
WHERE virus_scan_status = 'pending';

-- JSON indexes for metadata queries
CREATE INDEX CONCURRENTLY idx_file_attachments_metadata_gin 
ON system_core.file_attachments USING GIN (file_metadata);

-- File size distribution for analytics
CREATE INDEX CONCURRENTLY idx_file_attachments_size_analytics 
ON system_core.file_attachments (business_id, file_category, file_size_bytes)
WHERE is_deleted = FALSE;

-- RLS Policy
ALTER TABLE system_core.file_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY file_attachments_business_access 
ON system_core.file_attachments
FOR ALL TO authenticated
USING (
    business_id = (current_setting('app.current_business_id'))::UUID AND
    EXISTS (SELECT 1 FROM user_mgmt.user_profiles up 
            WHERE up.user_id = auth.uid() 
              AND up.business_id = file_attachments.business_id)
);
```

#### 4. comments - Universal Comment System

```sql
-- =======================
-- COMMENTS TABLE
-- =======================
CREATE TABLE system_core.comments (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    business_id UUID NOT NULL,
    
    -- Comment authorship
    author_id UUID NOT NULL,
    author_type VARCHAR(50) DEFAULT 'user'
        CHECK (author_type IN ('user', 'system', 'integration', 'guest')),
    
    -- Entity association (polymorphic)
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Threaded comments support
    parent_comment_id UUID REFERENCES system_core.comments(id) ON DELETE CASCADE,
    thread_root_id UUID, -- Top-level comment in thread
    depth_level INTEGER DEFAULT 0 CHECK (depth_level >= 0 AND depth_level <= 10),
    
    -- Comment content
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 10000),
    content_type VARCHAR(50) DEFAULT 'plain_text'
        CHECK (content_type IN ('plain_text', 'markdown', 'html', 'rich_text')),
    formatted_content TEXT, -- Rendered HTML
    
    -- Comment metadata
    comment_type VARCHAR(50) DEFAULT 'general'
        CHECK (comment_type IN ('general', 'question', 'issue', 'update', 'approval', 'feedback')),
    priority_level INTEGER DEFAULT 1
        CHECK (priority_level BETWEEN 1 AND 5),
    
    -- Visibility and permissions
    visibility VARCHAR(50) DEFAULT 'business'
        CHECK (visibility IN ('public', 'business', 'department', 'participants', 'private')),
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes vs public comments
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Interaction tracking
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    reply_count INTEGER DEFAULT 0 CHECK (reply_count >= 0),
    
    -- Moderation and content management
    moderation_status VARCHAR(50) DEFAULT 'approved'
        CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged', 'hidden')),
    moderated_by UUID,
    moderated_at TIMESTAMPTZ,
    moderation_reason TEXT,
    
    -- Edit history
    is_edited BOOLEAN DEFAULT FALSE,
    edit_count INTEGER DEFAULT 0 CHECK (edit_count >= 0),
    last_edited_at TIMESTAMPTZ,
    last_edited_by UUID,
    
    -- Temporal data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Soft delete
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    
    -- Constraints
    CONSTRAINT comments_parent_not_self 
        CHECK (parent_comment_id != id),
    CONSTRAINT comments_edit_consistency 
        CHECK ((is_edited = FALSE) OR (last_edited_at IS NOT NULL AND last_edited_by IS NOT NULL)),
    CONSTRAINT comments_deleted_consistency 
        CHECK ((is_active = TRUE) OR (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)),
    CONSTRAINT comments_moderation_consistency 
        CHECK ((moderation_status NOT IN ('rejected', 'flagged')) OR (moderated_by IS NOT NULL))
);

-- High-performance indexes for comment queries
CREATE INDEX CONCURRENTLY idx_comments_entity_active_time 
ON system_core.comments (entity_type, entity_id, is_active, created_at DESC)
WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY idx_comments_thread_structure 
ON system_core.comments (parent_comment_id, created_at ASC)
WHERE parent_comment_id IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_comments_business_author_time 
ON system_core.comments (business_id, author_id, created_at DESC)
WHERE is_active = TRUE;

-- Moderation indexes
CREATE INDEX CONCURRENTLY idx_comments_pending_moderation 
ON system_core.comments (moderation_status, created_at)
WHERE moderation_status = 'pending';

-- Performance index for pinned comments
CREATE INDEX CONCURRENTLY idx_comments_pinned_entity 
ON system_core.comments (entity_type, entity_id, is_pinned, created_at DESC)
WHERE is_pinned = TRUE AND is_active = TRUE;

-- RLS Policy
ALTER TABLE system_core.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY comments_business_access 
ON system_core.comments
FOR ALL TO authenticated
USING (
    business_id = (current_setting('app.current_business_id'))::UUID AND
    (visibility = 'public' OR 
     EXISTS (SELECT 1 FROM user_mgmt.user_profiles up 
             WHERE up.user_id = auth.uid() 
               AND up.business_id = comments.business_id))
);
```

#### 5. tags - Universal Tagging System

```sql
-- =======================
-- TAGS TABLE
-- =======================
CREATE TABLE system_core.tags (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    business_id UUID NOT NULL,
    
    -- Tag definition
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL, -- URL-friendly version
    
    -- Tag metadata
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(100), -- Icon identifier
    
    -- Tag classification
    category VARCHAR(50) DEFAULT 'general'
        CHECK (category IN ('general', 'priority', 'status', 'department', 'skill', 'location', 'custom')),
    tag_type VARCHAR(50) DEFAULT 'manual'
        CHECK (tag_type IN ('manual', 'system', 'auto', 'imported')),
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    last_used_at TIMESTAMPTZ,
    
    -- Tag relationships
    parent_tag_id UUID REFERENCES system_core.tags(id) ON DELETE SET NULL,
    
    -- Permissions and visibility
    is_global BOOLEAN DEFAULT FALSE, -- Available across all entities
    allowed_entity_types JSONB, -- Array of entity types this tag can be applied to
    required_role_level VARCHAR(50), -- Minimum role to use this tag
    
    -- Temporal data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT tags_name_business_unique 
        UNIQUE (business_id, name),
    CONSTRAINT tags_slug_business_unique 
        UNIQUE (business_id, slug),
    CONSTRAINT tags_parent_not_self 
        CHECK (parent_tag_id != id),
    CONSTRAINT tags_archived_consistency 
        CHECK ((is_archived = FALSE) OR (archived_at IS NOT NULL))
);

-- Performance indexes
CREATE INDEX CONCURRENTLY idx_tags_business_active_name 
ON system_core.tags (business_id, is_active, name)
WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY idx_tags_category_usage 
ON system_core.tags (category, usage_count DESC)
WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY idx_tags_parent_hierarchy 
ON system_core.tags (parent_tag_id, name)
WHERE parent_tag_id IS NOT NULL;

-- JSON index for entity types
CREATE INDEX CONCURRENTLY idx_tags_allowed_entity_types_gin 
ON system_core.tags USING GIN (allowed_entity_types);

-- RLS Policy
ALTER TABLE system_core.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY tags_business_access 
ON system_core.tags
FOR ALL TO authenticated
USING (business_id = (current_setting('app.current_business_id'))::UUID);
```

#### 6. entity_tags - Tag Associations

```sql
-- =======================
-- ENTITY TAGS TABLE
-- =======================
CREATE TABLE system_core.entity_tags (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    business_id UUID NOT NULL,
    
    -- Tag reference
    tag_id UUID NOT NULL REFERENCES system_core.tags(id) ON DELETE CASCADE,
    
    -- Entity association (polymorphic)
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Tagging metadata
    tagged_by UUID NOT NULL,
    tagged_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Tag context and values
    tag_context VARCHAR(100), -- 'priority', 'department', 'skill_level', etc.
    tag_value TEXT, -- For tags that have values (e.g., skill level: "expert")
    
    -- Temporal data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT entity_tags_unique_assignment 
        UNIQUE (business_id, tag_id, entity_type, entity_id, tag_context)
);

-- High-performance indexes for tag queries
CREATE INDEX CONCURRENTLY idx_entity_tags_entity_lookup 
ON system_core.entity_tags (entity_type, entity_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_entity_tags_tag_entities 
ON system_core.entity_tags (tag_id, entity_type, created_at DESC);

CREATE INDEX CONCURRENTLY idx_entity_tags_business_context 
ON system_core.entity_tags (business_id, tag_context, created_at DESC)
WHERE tag_context IS NOT NULL;

-- RLS Policy
ALTER TABLE system_core.entity_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY entity_tags_business_access 
ON system_core.entity_tags
FOR ALL TO authenticated
USING (business_id = (current_setting('app.current_business_id'))::UUID);
```

### Advanced System Functions

#### PostgreSQL 17 JSON_TABLE Integration

```sql
-- =======================
-- JSON_TABLE FUNCTIONS FOR ACTIVITY ANALYSIS
-- =======================

-- Extract activity insights using PostgreSQL 17 JSON_TABLE
CREATE OR REPLACE FUNCTION system_core.analyze_activity_patterns(
    target_business_id UUID,
    time_period INTERVAL DEFAULT '30 days'
)
RETURNS TABLE (
    activity_type TEXT,
    hourly_pattern JSONB,
    user_distribution JSONB,
    performance_metrics JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH activity_analysis AS (
        SELECT 
            a.activity_type,
            a.activity_data,
            a.user_id,
            EXTRACT(HOUR FROM a.created_at) as activity_hour,
            a.execution_time_ms
        FROM system_core.activity_stream a
        WHERE a.business_id = target_business_id
          AND a.created_at >= NOW() - time_period
          AND a.is_archived = FALSE
    )
    SELECT 
        aa.activity_type::TEXT,
        jsonb_object_agg(aa.activity_hour::TEXT, hour_count) as hourly_pattern,
        jsonb_object_agg('user_' || aa.user_id::TEXT, user_activity_count) as user_distribution,
        jsonb_build_object(
            'avg_execution_time_ms', AVG(aa.execution_time_ms),
            'total_activities', COUNT(*),
            'peak_hour', mode() WITHIN GROUP (ORDER BY aa.activity_hour)
        ) as performance_metrics
    FROM activity_analysis aa
    JOIN (
        SELECT activity_type, activity_hour, COUNT(*) as hour_count
        FROM activity_analysis
        GROUP BY activity_type, activity_hour
    ) hourly ON aa.activity_type = hourly.activity_type AND aa.activity_hour = hourly.activity_hour
    JOIN (
        SELECT activity_type, user_id, COUNT(*) as user_activity_count
        FROM activity_analysis
        WHERE user_id IS NOT NULL
        GROUP BY activity_type, user_id
    ) user_stats ON aa.activity_type = user_stats.activity_type AND aa.user_id = user_stats.user_id
    GROUP BY aa.activity_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced notification processing with JSON_TABLE
CREATE OR REPLACE FUNCTION system_core.process_notification_analytics()
RETURNS TABLE (
    channel TEXT,
    delivery_rate DECIMAL(5,4),
    avg_read_time_hours DECIMAL(8,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jt.channel::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN 0::DECIMAL(5,4)
            ELSE (COUNT(*) FILTER (WHERE n.delivered_at IS NOT NULL))::DECIMAL / COUNT(*)::DECIMAL
        END as delivery_rate,
        AVG(EXTRACT(EPOCH FROM (n.read_at - n.created_at))/3600)::DECIMAL(8,2) as avg_read_time_hours
    FROM system_core.notifications n,
         JSON_TABLE(
             n.channels,
             '$[*]' COLUMNS (channel TEXT PATH '$')
         ) AS jt
    WHERE n.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY jt.channel;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Performance Optimization Functions

```sql
-- =======================
-- PERFORMANCE OPTIMIZATION
-- =======================

-- Automatic partition management for activity_stream
CREATE OR REPLACE FUNCTION system_core.manage_activity_stream_partitions()
RETURNS INTEGER AS $$
DECLARE
    partition_count INTEGER := 0;
    future_month DATE;
    partition_name TEXT;
BEGIN
    -- Create partitions for next 3 months
    FOR i IN 1..3 LOOP
        future_month := DATE_TRUNC('month', CURRENT_DATE + (i || ' months')::INTERVAL)::DATE;
        partition_name := 'system_core.activity_stream_' || TO_CHAR(future_month, 'YYYY_MM');
        
        -- Check if partition already exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'system_core' 
              AND table_name = REPLACE(partition_name, 'system_core.', '')
        ) THEN
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF system_core.activity_stream
                 FOR VALUES FROM (%L) TO (%L)',
                partition_name,
                future_month,
                future_month + INTERVAL '1 month'
            );
            partition_count := partition_count + 1;
        END IF;
    END LOOP;
    
    -- Archive old partitions (older than 2 years)
    FOR partition_name IN
        SELECT 'system_core.' || table_name
        FROM information_schema.tables
        WHERE table_schema = 'system_core'
          AND table_name LIKE 'activity_stream______%'
          AND table_name <= 'activity_stream_' || TO_CHAR(CURRENT_DATE - INTERVAL '2 years', 'YYYY_MM')
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
    END LOOP;
    
    RETURN partition_count;
END;
$$ LANGUAGE plpgsql;

-- Optimized bulk operations with PostgreSQL 17 streaming I/O
CREATE OR REPLACE FUNCTION system_core.bulk_archive_old_activities(
    older_than INTERVAL DEFAULT '1 year'
) RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Use PostgreSQL 17's improved bulk operations
    UPDATE system_core.activity_stream 
    SET is_archived = TRUE, archived_at = NOW()
    WHERE created_at < NOW() - older_than
      AND is_archived = FALSE
      AND activity_level NOT IN ('error', 'critical'); -- Keep error logs longer
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

## Summary

The detailed `system_core` schema provides:

1. **Universal Activity Tracking**: Complete audit trail with microsecond precision
2. **Advanced Notifications**: Multi-channel delivery with interaction tracking
3. **File Management**: Comprehensive file handling with virus scanning and content analysis
4. **Comment System**: Threaded discussions with moderation capabilities
5. **Tagging System**: Flexible entity tagging with hierarchical support
6. **PostgreSQL 17 Integration**: JSON_TABLE, streaming I/O, and enhanced performance
7. **Partitioning Strategy**: Time-based partitioning for optimal performance
8. **Advanced Indexing**: Optimized indexes for common query patterns
9. **RLS Security**: Complete row-level security implementation
10. **Performance Functions**: Automated maintenance and analytics capabilities

This schema forms the foundation for all other industry-specific schemas while providing enterprise-grade scalability, security, and performance.
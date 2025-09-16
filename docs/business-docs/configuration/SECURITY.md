# Security Configuration Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Target Audience**: Security Engineers, System Administrators, DevOps Teams  

## Overview

This guide provides comprehensive security configuration for the Thorbis Business OS platform. Security is implemented through defense-in-depth principles with multiple layers of protection including network security, application security, data protection, and access controls.

## Security Architecture

### Defense in Depth Model
```typescript
interface SecurityLayers {
  perimeter: {
    waf: 'Web Application Firewall for HTTP/HTTPS traffic',
    ddos: 'DDoS protection and rate limiting',
    cdn: 'CDN-based security filtering',
    dns: 'DNS security and threat blocking'
  },
  
  network: {
    firewall: 'Network firewall and segmentation',
    vpn: 'VPN access for administrative functions',
    ssl: 'TLS encryption for all communications',
    monitoring: 'Network traffic monitoring and analysis'
  },
  
  application: {
    authentication: 'Multi-factor authentication and SSO',
    authorization: 'Role-based access control (RBAC)',
    input: 'Input validation and sanitization',
    output: 'Output encoding and CSRF protection'
  },
  
  data: {
    encryption: 'Encryption at rest and in transit',
    backup: 'Secure backup and recovery',
    classification: 'Data classification and handling',
    retention: 'Data retention and disposal policies'
  },
  
  monitoring: {
    siem: 'Security Information and Event Management',
    audit: 'Comprehensive audit logging',
    alerting: 'Real-time security alerting',
    forensics: 'Digital forensics capabilities'
  }
}
```

## Network Security Configuration

### Firewall Rules
```bash
#!/bin/bash
# Network firewall configuration

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# HTTP/HTTPS traffic
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# SSH access (restricted IP ranges)
iptables -A INPUT -p tcp -s 10.0.0.0/8 --dport 22 -j ACCEPT
iptables -A INPUT -p tcp -s 172.16.0.0/12 --dport 22 -j ACCEPT
iptables -A INPUT -p tcp -s 192.168.0.0/16 --dport 22 -j ACCEPT

# Database access (internal only)
iptables -A INPUT -p tcp -s 10.0.0.0/16 --dport 5432 -j ACCEPT

# Rate limiting for HTTP
iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT

# Log dropped packets
iptables -A INPUT -j LOG --log-prefix "DROPPED: " --log-level 4
iptables -A INPUT -j DROP

# Save rules
iptables-save > /etc/iptables/rules.v4
```

### SSL/TLS Configuration
```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name app.thorbis.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/thorbis.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thorbis.com/privkey.pem;

    # SSL protocol configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # SSL session configuration
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/thorbis.com/chain.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.thorbis.com wss://realtime.supabase.co; frame-ancestors 'none';" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
    }
    
    location /auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.thorbis.com;
    return 301 https://$server_name$request_uri;
}
```

## Application Security Configuration

### Authentication Configuration
```typescript
// Authentication service configuration
interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: '1h';
    refreshExpiresIn: '7d';
    issuer: 'thorbis-business-os';
    audience: 'thorbis-users';
    algorithm: 'HS256';
  };
  
  session: {
    secure: true;
    httpOnly: true;
    sameSite: 'strict';
    maxAge: 3600000; // 1 hour
    rolling: true;
  };
  
  mfa: {
    enabled: true;
    required: ['admin', 'financial'];
    methods: ['totp', 'sms', 'email'];
    backupCodes: true;
  };
  
  passwordPolicy: {
    minLength: 12;
    requireUppercase: true;
    requireLowercase: true;
    requireNumbers: true;
    requireSpecialChars: true;
    preventReuse: 5;
    maxAge: 7776000; // 90 days
  };
  
  lockout: {
    maxAttempts: 5;
    lockoutDuration: 1800000; // 30 minutes
    progressiveDelay: true;
  };
}

// Environment-specific configuration
const authConfig: AuthConfig = {
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'thorbis-business-os',
    audience: 'thorbis-users',
    algorithm: 'HS256'
  },
  // ... rest of configuration
};
```

### Input Validation and Sanitization
```typescript
// Input validation schemas using Zod
import { z } from 'zod';

// User input validation
export const userCreateSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .refine(email => !email.includes('<script'), 'Invalid characters in email'),
  
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password does not meet complexity requirements'),
  
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in first name'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in last name'),
  
  phone: z.string()
    .optional()
    .refine(phone => !phone || /^\+?[1-9]\d{1,14}$/.test(phone), 'Invalid phone number format'),
  
  role: z.enum(['admin', 'manager', 'employee', 'customer'], {
    errorMap: () => ({ message: 'Invalid role specified' })
  })
});

// SQL injection prevention
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"`;]/g, '') // Remove SQL injection characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

// XSS prevention
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
```

### CSRF Protection
```typescript
// CSRF protection middleware
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function csrfProtection(request: NextRequest) {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const cookieStore = cookies();
  const sessionCsrfToken = cookieStore.get('csrf-token')?.value;
  const headerCsrfToken = request.headers.get('x-csrf-token');
  const formCsrfToken = await getFormCsrfToken(request);

  const csrfToken = headerCsrfToken || formCsrfToken;

  if (!sessionCsrfToken || !csrfToken || sessionCsrfToken !== csrfToken) {
    return new NextResponse('CSRF token mismatch', { status: 403 });
  }

  return NextResponse.next();
}

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function getFormCsrfToken(request: NextRequest): Promise<string | null> {
  try {
    const formData = await request.formData();
    return formData.get('_csrf') as string;
  } catch {
    return null;
  }
}
```

## Access Control Configuration

### Role-Based Access Control (RBAC)
```sql
-- RBAC schema setup
CREATE SCHEMA IF NOT EXISTS rbac;

-- Roles table
CREATE TABLE rbac.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 0, -- Higher levels inherit lower level permissions
    industry TEXT, -- NULL for global roles
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions table
CREATE TABLE rbac.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    resource TEXT NOT NULL, -- API endpoint, table, feature
    action TEXT NOT NULL, -- create, read, update, delete, execute
    conditions JSONB DEFAULT '{}', -- Additional conditions (time, location, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE rbac.role_permissions (
    role_id UUID REFERENCES rbac.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES rbac.permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT TRUE,
    conditions JSONB DEFAULT '{}',
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES shared.users(id),
    PRIMARY KEY (role_id, permission_id)
);

-- User roles mapping
CREATE TABLE rbac.user_roles (
    user_id UUID REFERENCES shared.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES rbac.roles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES shared.tenants(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES shared.users(id),
    expires_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, role_id, tenant_id)
);

-- Enable RLS on all RBAC tables
ALTER TABLE rbac.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac.user_roles ENABLE ROW LEVEL SECURITY;

-- RBAC policies
CREATE POLICY "Tenant role isolation" ON rbac.roles
    USING (industry IS NULL OR industry = (auth.jwt() ->> 'industry'));

CREATE POLICY "User role access" ON rbac.user_roles
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

### Permission Check Functions
```sql
-- Function to check user permissions
CREATE OR REPLACE FUNCTION rbac.check_permission(
    p_user_id UUID,
    p_tenant_id UUID,
    p_resource TEXT,
    p_action TEXT,
    p_conditions JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
    role_rec RECORD;
    perm_rec RECORD;
BEGIN
    -- Check each role assigned to the user
    FOR role_rec IN 
        SELECT r.id, r.level
        FROM rbac.roles r
        JOIN rbac.user_roles ur ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id 
        AND ur.tenant_id = p_tenant_id
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        ORDER BY r.level DESC
    LOOP
        -- Check permissions for this role
        FOR perm_rec IN
            SELECT p.*, rp.granted, rp.conditions as role_conditions
            FROM rbac.permissions p
            JOIN rbac.role_permissions rp ON rp.permission_id = p.id
            WHERE rp.role_id = role_rec.id
            AND p.resource = p_resource
            AND p.action = p_action
            AND rp.granted = TRUE
        LOOP
            -- Check additional conditions
            IF rbac.check_conditions(perm_rec.conditions, p_conditions) 
               AND rbac.check_conditions(perm_rec.role_conditions, p_conditions) THEN
                has_permission := TRUE;
                EXIT;
            END IF;
        END LOOP;
        
        -- If permission found, exit
        IF has_permission THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check conditions
CREATE OR REPLACE FUNCTION rbac.check_conditions(
    required_conditions JSONB,
    provided_conditions JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    condition_key TEXT;
    required_value JSONB;
    provided_value JSONB;
BEGIN
    -- If no conditions required, allow
    IF required_conditions = '{}' OR required_conditions IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check each required condition
    FOR condition_key IN SELECT jsonb_object_keys(required_conditions) LOOP
        required_value := required_conditions -> condition_key;
        provided_value := provided_conditions -> condition_key;
        
        -- Handle different condition types
        CASE condition_key
            WHEN 'time_range' THEN
                IF NOT rbac.check_time_range(required_value, NOW()) THEN
                    RETURN FALSE;
                END IF;
            WHEN 'ip_range' THEN
                IF NOT rbac.check_ip_range(required_value, provided_value) THEN
                    RETURN FALSE;
                END IF;
            WHEN 'location' THEN
                IF NOT rbac.check_location(required_value, provided_value) THEN
                    RETURN FALSE;
                END IF;
            ELSE
                -- Direct value comparison
                IF required_value != provided_value THEN
                    RETURN FALSE;
                END IF;
        END CASE;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

## Data Protection Configuration

### Encryption Configuration
```typescript
// Encryption service configuration
import crypto from 'crypto';

interface EncryptionConfig {
  algorithm: 'aes-256-gcm';
  keyDerivation: {
    algorithm: 'pbkdf2';
    iterations: 100000;
    saltLength: 32;
    hashFunction: 'sha512';
  };
  fieldEncryption: {
    pii: string[];
    financial: string[];
    medical: string[];
  };
}

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 32;
  private readonly tagLength = 16;

  // Encrypt sensitive data
  encrypt(plaintext: string, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm: this.algorithm
    };
  }

  // Decrypt sensitive data
  decrypt(encryptedData: EncryptedData, key: Buffer): string {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const decipher = crypto.createDecipher(this.algorithm, key, iv);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Generate encryption key from password
  deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha512');
  }

  // Hash passwords
  hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(this.saltLength);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [saltHex, hashHex] = hash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const originalHash = Buffer.from(hashHex, 'hex');
    const derivedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return crypto.timingSafeEqual(originalHash, derivedHash);
  }
}

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  algorithm: string;
}
```

### Data Classification
```sql
-- Data classification schema
CREATE SCHEMA IF NOT EXISTS data_classification;

-- Classification levels
CREATE TYPE data_classification.sensitivity_level AS ENUM (
    'public',
    'internal',
    'confidential', 
    'restricted'
);

-- Data classification table
CREATE TABLE data_classification.classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    sensitivity_level data_classification.sensitivity_level NOT NULL,
    retention_period INTERVAL,
    encryption_required BOOLEAN DEFAULT FALSE,
    masking_rule TEXT,
    access_log_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(table_name, column_name)
);

-- Insert data classifications
INSERT INTO data_classification.classifications (table_name, column_name, sensitivity_level, encryption_required, masking_rule) VALUES
('shared.users', 'email', 'confidential', TRUE, 'email'),
('shared.users', 'phone', 'confidential', TRUE, 'phone'),
('shared.customers', 'email', 'confidential', TRUE, 'email'),
('shared.customers', 'phone', 'confidential', TRUE, 'phone'),
('shared.customers', 'address', 'confidential', TRUE, 'address'),
('shared.financial_records', 'account_number', 'restricted', TRUE, 'account'),
('shared.financial_records', 'routing_number', 'restricted', TRUE, 'routing'),
('shared.payment_methods', 'card_number', 'restricted', TRUE, 'credit_card');

-- Data masking function
CREATE OR REPLACE FUNCTION data_classification.mask_data(
    data_value TEXT,
    masking_rule TEXT,
    user_permission_level TEXT DEFAULT 'employee'
) RETURNS TEXT AS $$
BEGIN
    -- Admin users see unmasked data
    IF user_permission_level = 'admin' THEN
        RETURN data_value;
    END IF;
    
    -- Apply masking based on rule
    CASE masking_rule
        WHEN 'email' THEN
            RETURN CASE 
                WHEN user_permission_level IN ('manager', 'supervisor') THEN
                    REGEXP_REPLACE(data_value, '(.{1,3})[^@]*(@.*)', '\1****\2')
                ELSE
                    '***@' || SPLIT_PART(data_value, '@', 2)
            END;
        WHEN 'phone' THEN
            RETURN CASE
                WHEN user_permission_level IN ('manager', 'supervisor') THEN
                    REGEXP_REPLACE(data_value, '(.{3}).*(.{2})', '\1****\2')
                ELSE
                    '***-***-' || RIGHT(data_value, 4)
            END;
        WHEN 'credit_card' THEN
            RETURN '**** **** **** ' || RIGHT(data_value, 4);
        WHEN 'account' THEN
            RETURN '****' || RIGHT(data_value, 4);
        ELSE
            RETURN '***MASKED***';
    END CASE;
END;
$$ LANGUAGE plpgsql;
```

## Security Monitoring Configuration

### Audit Logging
```sql
-- Audit logging schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Audit log table
CREATE TABLE audit.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- login, logout, permission_change, data_access, etc.
    user_id UUID,
    tenant_id UUID,
    ip_address INET,
    user_agent TEXT,
    resource TEXT, -- What was accessed
    action TEXT, -- What action was performed
    result TEXT NOT NULL, -- success, failure, blocked
    risk_score INTEGER DEFAULT 0, -- 0-100 risk score
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_security_events_user_time ON audit.security_events(user_id, timestamp);
CREATE INDEX idx_security_events_tenant_time ON audit.security_events(tenant_id, timestamp);
CREATE INDEX idx_security_events_type_time ON audit.security_events(event_type, timestamp);
CREATE INDEX idx_security_events_risk ON audit.security_events(risk_score) WHERE risk_score > 50;

-- Audit logging function
CREATE OR REPLACE FUNCTION audit.log_security_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_resource TEXT DEFAULT NULL,
    p_action TEXT DEFAULT NULL,
    p_result TEXT DEFAULT 'success',
    p_details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
    risk_score INTEGER := 0;
BEGIN
    -- Calculate risk score
    risk_score := audit.calculate_risk_score(
        p_event_type, p_user_id, p_ip_address, p_details
    );
    
    -- Insert audit log
    INSERT INTO audit.security_events (
        event_type, user_id, tenant_id, ip_address, user_agent,
        resource, action, result, risk_score, details
    ) VALUES (
        p_event_type, p_user_id, p_tenant_id, p_ip_address, p_user_agent,
        p_resource, p_action, p_result, risk_score, p_details
    ) RETURNING id INTO event_id;
    
    -- Trigger alerts for high-risk events
    IF risk_score > 75 THEN
        PERFORM audit.trigger_security_alert(event_id, risk_score);
    END IF;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Risk scoring function
CREATE OR REPLACE FUNCTION audit.calculate_risk_score(
    event_type TEXT,
    user_id UUID,
    ip_address INET,
    details JSONB
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    recent_failures INTEGER;
    is_new_location BOOLEAN;
    is_privileged_user BOOLEAN;
BEGIN
    -- Base score by event type
    CASE event_type
        WHEN 'failed_login' THEN score := score + 20;
        WHEN 'admin_action' THEN score := score + 30;
        WHEN 'data_export' THEN score := score + 40;
        WHEN 'permission_escalation' THEN score := score + 50;
        WHEN 'suspicious_activity' THEN score := score + 60;
        ELSE score := score + 10;
    END CASE;
    
    -- Check for repeated failures
    SELECT COUNT(*) INTO recent_failures
    FROM audit.security_events
    WHERE user_id = calculate_risk_score.user_id
    AND event_type LIKE '%failed%'
    AND timestamp > NOW() - INTERVAL '1 hour';
    
    score := score + (recent_failures * 15);
    
    -- Check for new location
    SELECT NOT EXISTS(
        SELECT 1 FROM audit.security_events
        WHERE user_id = calculate_risk_score.user_id
        AND ip_address = calculate_risk_score.ip_address
        AND timestamp > NOW() - INTERVAL '30 days'
        AND result = 'success'
    ) INTO is_new_location;
    
    IF is_new_location THEN
        score := score + 25;
    END IF;
    
    -- Check if user has admin privileges
    SELECT EXISTS(
        SELECT 1 FROM rbac.user_roles ur
        JOIN rbac.roles r ON r.id = ur.role_id
        WHERE ur.user_id = calculate_risk_score.user_id
        AND r.name IN ('admin', 'super_admin')
    ) INTO is_privileged_user;
    
    IF is_privileged_user THEN
        score := score + 20;
    END IF;
    
    -- Cap at 100
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;
```

### Intrusion Detection
```bash
#!/bin/bash
# Intrusion detection monitoring script

# Configuration
LOG_FILE="/var/log/security-monitor.log"
ALERT_THRESHOLD=5
TIME_WINDOW=300  # 5 minutes

# Monitor failed login attempts
monitor_failed_logins() {
    local failed_logins=$(tail -n 1000 /var/log/auth.log | \
        grep "$(date '+%b %d %H:%M' -d '5 minutes ago')" | \
        grep "authentication failure" | wc -l)
    
    if [ $failed_logins -gt $ALERT_THRESHOLD ]; then
        echo "$(date): ALERT - $failed_logins failed login attempts in last 5 minutes" >> $LOG_FILE
        send_alert "High number of failed login attempts: $failed_logins"
    fi
}

# Monitor suspicious network activity
monitor_network_activity() {
    # Monitor for port scanning
    local port_scans=$(netstat -tuln | wc -l)
    local established_connections=$(netstat -tn | grep ESTABLISHED | wc -l)
    
    if [ $established_connections -gt 100 ]; then
        echo "$(date): ALERT - High number of established connections: $established_connections" >> $LOG_FILE
    fi
    
    # Monitor for unusual outbound connections
    local outbound_connections=$(netstat -tn | grep ':443\|:80\|:25\|:53' | wc -l)
    if [ $outbound_connections -gt 50 ]; then
        echo "$(date): WARNING - High outbound connection count: $outbound_connections" >> $LOG_FILE
    fi
}

# Monitor file system changes
monitor_file_changes() {
    # Monitor critical system files
    local critical_files=(
        "/etc/passwd"
        "/etc/shadow" 
        "/etc/sudoers"
        "/etc/ssh/sshd_config"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file.lastcheck" ]; then
            if ! cmp -s "$file" "$file.lastcheck"; then
                echo "$(date): ALERT - Critical file modified: $file" >> $LOG_FILE
                send_alert "Critical system file modified: $file"
            fi
        fi
        cp "$file" "$file.lastcheck" 2>/dev/null
    done
}

# Send security alerts
send_alert() {
    local message="$1"
    
    # Send email alert
    echo "$message" | mail -s "Security Alert - Thorbis Business OS" security@thorbis.com
    
    # Log to syslog
    logger -p auth.crit "SECURITY_ALERT: $message"
    
    # Send to SIEM
    curl -X POST https://siem.thorbis.com/api/alerts \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SIEM_API_KEY" \
        -d "{
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
            \"severity\": \"high\",
            \"message\": \"$message\",
            \"source\": \"$(hostname)\"
        }"
}

# Main monitoring loop
while true; do
    monitor_failed_logins
    monitor_network_activity
    monitor_file_changes
    sleep 60
done
```

## Incident Response Configuration

### Automated Response Rules
```sql
-- Incident response automation
CREATE TABLE audit.response_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name TEXT UNIQUE NOT NULL,
    trigger_conditions JSONB NOT NULL,
    response_actions JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert response rules
INSERT INTO audit.response_rules (rule_name, trigger_conditions, response_actions) VALUES
('Multiple Failed Logins', 
 '{"event_type": "failed_login", "count": 5, "time_window": "5 minutes"}',
 '{"actions": ["block_ip", "notify_admin", "require_mfa"]}'),

('Admin Access After Hours',
 '{"event_type": "admin_login", "time_range": {"start": "22:00", "end": "06:00"}}',
 '{"actions": ["notify_security_team", "require_additional_auth", "log_extended"]}'),

('Data Export Large Volume',
 '{"event_type": "data_export", "data_volume": "> 1GB"}',
 '{"actions": ["require_approval", "notify_data_protection_officer", "quarantine_export"]}');

-- Automated response function
CREATE OR REPLACE FUNCTION audit.execute_automated_response(
    event_id UUID
) RETURNS VOID AS $$
DECLARE
    event_rec audit.security_events;
    rule_rec audit.response_rules;
    response_action TEXT;
BEGIN
    -- Get the event details
    SELECT * INTO event_rec FROM audit.security_events WHERE id = event_id;
    
    -- Check each active response rule
    FOR rule_rec IN SELECT * FROM audit.response_rules WHERE enabled = TRUE LOOP
        -- Check if conditions match
        IF audit.check_rule_conditions(event_rec, rule_rec.trigger_conditions) THEN
            -- Execute each response action
            FOR response_action IN 
                SELECT jsonb_array_elements_text(rule_rec.response_actions -> 'actions')
            LOOP
                PERFORM audit.execute_response_action(response_action, event_rec);
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Response action executor
CREATE OR REPLACE FUNCTION audit.execute_response_action(
    action_type TEXT,
    event_data audit.security_events
) RETURNS VOID AS $$
BEGIN
    CASE action_type
        WHEN 'block_ip' THEN
            -- Add IP to blocklist
            INSERT INTO audit.ip_blocklist (ip_address, reason, blocked_until)
            VALUES (event_data.ip_address, 'Automated security response', NOW() + INTERVAL '1 hour');
            
        WHEN 'notify_admin' THEN
            -- Send notification to administrators
            INSERT INTO notifications.queue (recipient_type, recipient_id, subject, message)
            SELECT 'role', r.id, 'Security Alert', 
                   'Security event detected: ' || event_data.event_type
            FROM rbac.roles r WHERE r.name = 'admin';
            
        WHEN 'require_mfa' THEN
            -- Force MFA requirement for user
            UPDATE shared.users 
            SET settings = settings || '{"require_mfa_next_login": true}'::jsonb
            WHERE id = event_data.user_id;
            
        WHEN 'quarantine_export' THEN
            -- Quarantine data export
            UPDATE data_exports 
            SET status = 'quarantined', 
                quarantine_reason = 'Automated security response'
            WHERE created_by = event_data.user_id
            AND created_at >= event_data.timestamp - INTERVAL '5 minutes';
    END CASE;
END;
$$ LANGUAGE plpgsql;
```

## Compliance Configuration

### GDPR Compliance
```sql
-- GDPR compliance schema
CREATE SCHEMA IF NOT EXISTS gdpr;

-- Data subject rights tracking
CREATE TABLE gdpr.rights_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
    subject_email TEXT NOT NULL,
    subject_identifier UUID, -- Link to customer/user
    tenant_id UUID REFERENCES shared.tenants(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    request_details JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data processing activities
CREATE TABLE gdpr.processing_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    retention_period INTERVAL,
    data_subjects TEXT[] NOT NULL,
    recipients TEXT[],
    transfers_outside_eu BOOLEAN DEFAULT FALSE,
    security_measures TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consent management
CREATE TABLE gdpr.consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL,
    tenant_id UUID REFERENCES shared.tenants(id),
    purpose TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_method TEXT NOT NULL, -- website_form, email_confirmation, etc.
    consent_evidence JSONB DEFAULT '{}',
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data retention policies
CREATE TABLE gdpr.retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    retention_period INTERVAL NOT NULL,
    retention_basis TEXT NOT NULL,
    auto_delete BOOLEAN DEFAULT TRUE,
    notification_period INTERVAL DEFAULT '30 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Right to be forgotten implementation
CREATE OR REPLACE FUNCTION gdpr.process_erasure_request(
    request_id UUID
) RETURNS VOID AS $$
DECLARE
    request_rec gdpr.rights_requests;
    table_rec RECORD;
BEGIN
    -- Get request details
    SELECT * INTO request_rec FROM gdpr.rights_requests WHERE id = request_id;
    
    IF NOT FOUND OR request_rec.request_type != 'erasure' THEN
        RAISE EXCEPTION 'Invalid erasure request';
    END IF;
    
    -- Pseudonymize/delete data across all tables
    FOR table_rec IN 
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE column_name IN ('email', 'phone', 'first_name', 'last_name')
        AND table_schema IN ('shared', 'home_services', 'restaurants', 'automotive', 'retail')
    LOOP
        -- Pseudonymize rather than delete to maintain referential integrity
        EXECUTE format('
            UPDATE %I.%I SET %I = %L 
            WHERE %I = %L AND tenant_id = %L',
            table_rec.table_schema, table_rec.table_name, table_rec.column_name,
            'REDACTED_' || substr(md5(request_rec.subject_email || table_rec.column_name), 1, 8),
            'email', request_rec.subject_email, request_rec.tenant_id
        );
    END LOOP;
    
    -- Update request status
    UPDATE gdpr.rights_requests 
    SET status = 'completed', completed_at = NOW()
    WHERE id = request_id;
END;
$$ LANGUAGE plpgsql;
```

## Environment-Specific Security Configuration

### Development Environment Security
```yaml
# Development security configuration
security:
  authentication:
    jwt:
      secret: "dev-jwt-secret-key-change-in-production"
      expiresIn: "8h"  # Longer for development convenience
    
    session:
      secure: false    # Allow HTTP in development
      sameSite: "lax"  # More permissive for development
    
    mfa:
      enabled: false   # Disabled for development ease
  
  authorization:
    rbac:
      strictMode: false
      debugMode: true
  
  encryption:
    enabled: false     # Disabled for development data
  
  monitoring:
    auditLevel: "minimal"
    alerting: false
```

### Production Environment Security
```yaml
# Production security configuration
security:
  authentication:
    jwt:
      secret: "${JWT_SECRET}"  # From secure environment variable
      expiresIn: "1h"
      refreshExpiresIn: "7d"
    
    session:
      secure: true
      httpOnly: true
      sameSite: "strict"
    
    mfa:
      enabled: true
      required: ["admin", "financial", "manager"]
      methods: ["totp", "sms"]
  
  authorization:
    rbac:
      strictMode: true
      debugMode: false
      auditAllAccess: true
  
  encryption:
    enabled: true
    algorithm: "aes-256-gcm"
    keyRotationDays: 90
  
  monitoring:
    auditLevel: "comprehensive"
    alerting: true
    realTimeMonitoring: true
    siemIntegration: true
```

## Best Practices

### Security Implementation
- **Zero Trust Architecture**: Never trust, always verify
- **Principle of Least Privilege**: Minimum necessary access
- **Defense in Depth**: Multiple security layers
- **Security by Design**: Security built into architecture
- **Continuous Monitoring**: Real-time security monitoring

### Operational Security
- **Regular Updates**: Keep systems and dependencies updated
- **Security Training**: Regular security awareness training
- **Incident Response**: Tested incident response procedures
- **Backup and Recovery**: Secure backup and recovery procedures
- **Compliance**: Regular compliance assessments and audits

### Development Security
- **Secure Coding**: Follow secure coding practices
- **Code Reviews**: Security-focused code reviews
- **Dependency Scanning**: Regular dependency vulnerability scanning
- **SAST/DAST**: Static and dynamic application security testing
- **Penetration Testing**: Regular penetration testing

## Troubleshooting

### Common Security Issues
- **Authentication Failures**: JWT token issues, session problems
- **Authorization Errors**: RBAC policy conflicts, permission issues
- **Encryption Problems**: Key management, algorithm issues  
- **Audit Logging**: Missing logs, performance issues
- **Compliance Failures**: GDPR compliance, data retention issues

### Security Diagnostic Commands
```bash
# Security system diagnostics
diagnose_security_issues() {
  # Check authentication system
  check_auth_system() {
    curl -f https://app.thorbis.com/api/auth/health
    psql -c "SELECT COUNT(*) FROM shared.users WHERE last_login_at > NOW() - INTERVAL '24 hours';"
    check_jwt_token_validity
    verify_mfa_configuration
  }
  
  # Check authorization system  
  check_authz_system() {
    psql -c "SELECT COUNT(*) FROM rbac.user_roles WHERE expires_at > NOW() OR expires_at IS NULL;"
    validate_rbac_policies
    check_permission_inheritance
    audit_privileged_access
  }
  
  # Check encryption system
  check_encryption_system() {
    validate_ssl_certificates
    check_database_encryption
    verify_data_at_rest_encryption
    test_key_rotation_procedures
  }
}
```

---

*This security configuration guide ensures comprehensive protection for the Thorbis Business OS platform through multiple layers of security controls, monitoring, and compliance measures.*
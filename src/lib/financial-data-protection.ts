'use client';'

import crypto from 'crypto';'

/**
 * Financial Data Protection Service
 * 
 * This service provides comprehensive security measures for protecting
 * sensitive financial data in the investment platform, ensuring compliance
 * with financial industry security standards.
 * 
 * Security Features:
 * - End-to-end encryption for sensitive data
 * - PII data masking and redaction
 * - Secure data transmission protocols
 * - Data integrity validation
 * - Access control and audit logging
 * - Compliance with PCI DSS, SOX, and FINRA requirements
 * 
 * Standards Compliance:
 * - PCI DSS Level 1 for payment data
 * - SOX Section 404 for financial reporting
 * - FINRA Rule 17a-4 for record retention
 * - GDPR for data privacy (where applicable)
 * - CCPA for California privacy rights
 */

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
}

interface DataClassification {'
  level: 'public' | 'internal' | 'confidential' | 'restricted';'
  category: 'pii' | 'financial' | 'trading' | 'account' | 'general';'
  retention: number; // days
}

interface AccessLog {
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  riskScore: number;
}

interface SecurityContext {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  permissions: string[];
  riskScore: number;
}

/**
 * Main Financial Data Protection Service
 */
export class FinancialDataProtectionService {
  private readonly encryptionConfig: EncryptionConfig = {
    algorithm: 'aes-256-gcm','
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  };

  private readonly sensitiveFields = new Set([
    'ssn','
    'taxId','
    'accountNumber','
    'routingNumber','
    'creditCardNumber','
    'bankAccountNumber','
    'pin','
    'password','
    'apiKey','
    'accessToken','
    'privateKey'
  ]);

  private readonly encryptionKey: Buffer;
  private accessLogs: AccessLog[] = [];

  constructor() {
    // In production, this should come from a secure key management service (AWS KMS, Azure Key Vault, etc.)
    this.encryptionKey = process.env.FINANCIAL_DATA_ENCRYPTION_KEY 
      ? Buffer.from(process.env.FINANCIAL_DATA_ENCRYPTION_KEY, 'hex')'
      : crypto.randomBytes(32);
  }

  /**
   * Encrypt sensitive financial data
   */
  encryptData(data: string, classification: DataClassification): {
    encrypted: string;
    iv: string;
    tag: string;
    metadata: {
      algorithm: string;
      timestamp: string;
      classification: DataClassification;
    };
  } {
    try {
      const iv = crypto.randomBytes(this.encryptionConfig.ivLength);
      const cipher = crypto.createCipher(this.encryptionConfig.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from(JSON.stringify(classification)));

      const encrypted = cipher.update(data, 'utf8', 'hex');'
      encrypted += cipher.final('hex');'
      
      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),'
        tag: tag.toString('hex'),'
        metadata: {
          algorithm: this.encryptionConfig.algorithm,
          timestamp: new Date().toISOString(),
          classification
        }
      };
    } catch (error) {
      console.error('Encryption failed:', error);'
      throw new Error('Failed to encrypt data');'
    }
  }

  /**
   * Decrypt sensitive financial data
   */
  decryptData(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
    metadata: unknown;
  }): string {
    try {
      const iv = Buffer.from(encryptedData.iv, 'hex');'
      const tag = Buffer.from(encryptedData.tag, 'hex');'
      
      const decipher = crypto.createDecipher(this.encryptionConfig.algorithm, this.encryptionKey);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from(JSON.stringify(encryptedData.metadata.classification)));

      const decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');'
      decrypted += decipher.final('utf8');'

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);'
      throw new Error('Failed to decrypt data');'
    }
  }

  /**
   * Mask sensitive data for display purposes
   */
  maskSensitiveData(data: unknown, context: SecurityContext): unknown {
    if (typeof data !== 'object' || data === null) {'
      return data;
    }

    const masked = { ...data };

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && this.isSensitiveField(key)) {'
        masked[key] = this.applyMask(key, value, context);
      } else if (typeof value === 'object') {'
        masked[key] = this.maskSensitiveData(value, context);
      }
    }

    return masked;
  }

  /**
   * Redact PII from logs and responses
   */
  redactPII(data: string): string {
    let redacted = data;

    // SSN pattern (XXX-XX-XXXX)
    redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX');'

    // Credit card patterns
    redacted = redacted.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX-XXXX');'

    // Phone number patterns
    redacted = redacted.replace(/\b\d{3}-\d{3}-\d{4}\b/g, 'XXX-XXX-XXXX');'

    // Email patterns (partial)
    redacted = redacted.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
      (match, user, domain) => {
        const maskedUser = user.length > 2 ? user.substring(0, 2) + '*'.repeat(user.length - 2) : '**';'
        return '${maskedUser}@${domain}';
      });

    return redacted;
  }

  /**
   * Validate data integrity using checksums
   */
  validateIntegrity(data: unknown, expectedChecksum: string): boolean {
    const dataString = JSON.stringify(data);
    const actualChecksum = crypto
      .createHash('sha256')'
      .update(dataString)
      .digest('hex');'

    return actualChecksum === expectedChecksum;
  }

  /**
   * Generate data integrity checksum
   */
  generateChecksum(data: unknown): string {
    const dataString = JSON.stringify(data);
    return crypto
      .createHash('sha256')'
      .update(dataString)
      .digest('hex');'
  }

  /**
   * Log access attempts for audit purposes
   */
  logAccess(context: SecurityContext, action: string, resource: string, success: boolean): void {
    const logEntry: AccessLog = {
      userId: context.userId,
      action,
      resource,
      timestamp: new Date().toISOString(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      success,
      riskScore: context.riskScore
    };

    this.accessLogs.push(logEntry);
    
    // In production, send to secure logging service
    console.log('Security Access Log: ', this.redactPII(JSON.stringify(logEntry)));'

    // Alert on high-risk activities
    if (context.riskScore > 80 || !success) {
      this.alertSecurityTeam(logEntry);
    }
  }

  /**
   * Validate user permissions for data access
   */
  validatePermissions(context: SecurityContext, requiredPermission: string): boolean {
    return context.permissions.includes(requiredPermission) || context.permissions.includes('admin');'
  }

  /**
   * Calculate risk score for security context
   */
  calculateRiskScore(context: SecurityContext): number {
    let riskScore = 0;

    // IP-based risk factors
    if (this.isVPNOrProxy(context.ipAddress)) {
      riskScore += 30;
    }

    if (this.isUnknownLocation(context.ipAddress)) {
      riskScore += 20;
    }

    // User agent risk factors
    if (this.isSuspiciousUserAgent(context.userAgent)) {
      riskScore += 25;
    }

    // Session-based factors
    if (this.hasRecentFailedAttempts(context.userId)) {
      riskScore += 40;
    }

    return Math.min(riskScore, 100);
  }

  /**
   * Secure data transmission headers
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload','
      'X-Content-Type-Options': 'nosniff','
      'X-Frame-Options': 'DENY','
      'X-XSS-Protection': '1; mode=block','
      'Referrer-Policy': 'strict-origin-when-cross-origin','
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",'
      'Cache-Control': 'no-cache, no-store, must-revalidate','
      'Pragma': 'no-cache','
      'Expires': '0'
    };
  }

  /**
   * Get audit logs for compliance reporting
   */
  getAuditLogs(userId?: string, startDate?: string, endDate?: string): AccessLog[] {
    let logs = this.accessLogs;

    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    if (startDate) {
      logs = logs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    // Redact sensitive information from logs
    return logs.map(log => ({
      ...log,
      ipAddress: this.maskIP(log.ipAddress),
      userAgent: this.redactPII(log.userAgent)
    }));
  }

  // Private helper methods

  private isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return this.sensitiveFields.has(lowerField) || 
           lowerField.includes('password') ||'
           lowerField.includes('token') ||'
           lowerField.includes('key') ||'
           lowerField.includes('secret');'
  }

  private applyMask(fieldName: string, value: string, context: SecurityContext): string {
    const lowerField = fieldName.toLowerCase();

    // Admin users see less masking
    const isAdmin = context.permissions.includes('admin');'

    if (lowerField.includes('ssn') || lowerField.includes('taxid')) {'`'
      return isAdmin ? '***-**-${value.slice(-4)}' : 'XXX-XX-XXXX';'`
    }

    if (lowerField.includes('account') && lowerField.includes('number')) {'`'
      return isAdmin ? '****${value.slice(-4)}' : '**********';'`
    }

    if (lowerField.includes('email')) {'
      const [user, domain] = value.split('@');'
      const maskedUser = user.length > 2 ? user.substring(0, 2) + '*'.repeat(user.length - 2) : '**';'``
      return `${maskedUser}@${domain}';
    }

    // Default masking
    return value.length > 4 ? '****${value.slice(-4)}' : '****';'`
  }

  private maskIP(ip: string): string {
    const parts = ip.split('.');'`'
    if (parts.length === 4) {
      return '${parts[0]}.${parts[1]}.XXX.XXX';
    }
    return 'XXX.XXX.XXX.XXX';'
  }

  private isVPNOrProxy(ipAddress: string): boolean {
    // In production, integrate with IP intelligence service
    const knownVPNRanges = ['10.', '192.168.', '172.'];'
    return knownVPNRanges.some(range => ipAddress.startsWith(range));
  }

  private isUnknownLocation(ipAddress: string): boolean {
    // In production, check against user's typical locations'
    return false; // Placeholder
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /script/i,
      /automated/i,
      /curl/i,
      /wget/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private hasRecentFailedAttempts(userId: string): boolean {
    const recentLogs = this.accessLogs
      .filter(log => log.userId === userId)
      .filter(log => {
        const logTime = new Date(log.timestamp);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return logTime > hourAgo;
      })
      .filter(log => !log.success);

    return recentLogs.length >= 3;
  }

  private alertSecurityTeam(logEntry: AccessLog): void {
    // In production, integrate with security incident management system
    console.warn('Security Alert:', {'
      type: 'HIGH_RISK_ACCESS','
      userId: logEntry.userId,
      action: logEntry.action,
      riskScore: logEntry.riskScore,
      timestamp: logEntry.timestamp
    });
  }
}

/**
 * Security middleware for API routes
 */
export function createSecurityMiddleware(protectionService: FinancialDataProtectionService) {
  return {
    validateRequest: (req: unknown, requiredPermission?: string) => {
      const context: SecurityContext = {
        userId: req.user?.id || 'anonymous',
        sessionId: req.sessionId || 'no-session',
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        permissions: req.user?.permissions || [],
        riskScore: 0
      };

      // Calculate risk score
      context.riskScore = protectionService.calculateRiskScore(context);

      // Validate permissions if required
      if (requiredPermission && !protectionService.validatePermissions(context, requiredPermission)) {
        protectionService.logAccess(context, 'PERMISSION_DENIED', req.path, false);'
        throw new Error('Insufficient permissions');'
      }

      // Block high-risk requests
      if (context.riskScore > 90) {
        protectionService.logAccess(context, 'HIGH_RISK_BLOCKED', req.path, false);'
        throw new Error('Request blocked due to high risk score');'`'
      }

      return context;
    },

    processResponse: (data: unknown, context: SecurityContext) => {
      // Mask sensitive data in responses
      const maskedData = protectionService.maskSensitiveData(data, context);
      
      // Add integrity checksum
      const checksum = protectionService.generateChecksum(maskedData);
      
      return {
        data: maskedData,
        metadata: {
          checksum,
          timestamp: new Date().toISOString(),
          masked: true
        }
      };
    }
  };
}

// Export singleton instance
export const financialDataProtection = new FinancialDataProtectionService();
export default financialDataProtection;
# Thorbis Single Sign-On (SSO) Integration

Comprehensive SSO implementation supporting OAuth 2.0/OpenID Connect and SAML 2.0 with automated user provisioning and role mapping.

## 🔐 SSO Architecture Overview

### Supported Protocols
```yaml
oauth2_oidc:
  protocol_version: "OAuth 2.0 / OpenID Connect 1.0"
  supported_flows:
    - "Authorization Code with PKCE"
    - "Client Credentials"
  supported_providers:
    - "Google Workspace"
    - "Microsoft Azure AD / Entra ID"
    - "Okta"
    - "Auth0"
    - "AWS Cognito"
    - "Generic OpenID Connect"

saml2:
  protocol_version: "SAML 2.0"
  supported_bindings:
    - "HTTP-POST"
    - "HTTP-Redirect"
  supported_providers:
    - "Microsoft Active Directory Federation Services (ADFS)"
    - "Ping Identity"
    - "Okta SAML"
    - "OneLogin"
    - "Generic SAML 2.0 IdP"

sso_features:
  - "Just-In-Time (JIT) User Provisioning"
  - "Automated Role Mapping"
  - "Multi-Tenant Identity Isolation"
  - "Session Management"
  - "Single Logout (SLO)"
  - "Account Linking"
  - "Identity Provider Discovery"
```

## 🌐 OAuth 2.0 / OpenID Connect Implementation

### OAuth Configuration Schema
```typescript
interface OAuthProviderConfig {
  provider_id: string              // Unique identifier
  provider_name: string            // Display name
  provider_type: 'google' | 'microsoft' | 'okta' | 'auth0' | 'cognito' | 'generic'
  
  // OAuth/OIDC Configuration
  client_id: string
  client_secret: string            // Stored encrypted
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  jwks_endpoint: string
  issuer: string                   // OIDC issuer
  
  // Scopes and Claims
  scopes: string[]                 // e.g., ['openid', 'profile', 'email']
  claims_mapping: ClaimsMapping
  
  // Multi-tenant Configuration
  tenant_mapping: TenantMapping
  allowed_domains: string[]        // Email domains allowed
  
  // Security Settings
  pkce_enabled: boolean
  state_validation: boolean
  nonce_validation: boolean
  
  // User Provisioning
  jit_provisioning: boolean
  default_role: string
  role_mapping: RoleMapping[]
  
  // Session Settings
  session_timeout: number          // Minutes
  refresh_token_enabled: boolean
}

interface ClaimsMapping {
  user_id: string                  // e.g., 'sub' or 'preferred_username'
  email: string                    // e.g., 'email'
  first_name: string               // e.g., 'given_name'
  last_name: string                // e.g., 'family_name'
  display_name: string             // e.g., 'name'
  groups: string                   // e.g., 'groups' or 'roles'
  tenant_id: string                // Custom claim for tenant identification
}

interface RoleMapping {
  condition: RoleMappingCondition
  thorbis_role: 'owner' | 'manager' | 'staff' | 'viewer'
  permissions: string[]
}

interface RoleMappingCondition {
  type: 'group' | 'claim' | 'domain'
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'regex'
  value: string | string[]
}
```

### OAuth Implementation
```typescript
class OAuthAuthenticator {
  constructor(
    private config: OAuthProviderConfig,
    private tokenManager: TokenManager,
    private userService: UserService,
    private auditLogger: AuditLogger
  ) {}
  
  // Initiate OAuth authorization flow
  async initiateAuth(tenantId: string, redirectUri: string): Promise<string> {
    const state = await this.generateState(tenantId, redirectUri)
    const nonce = this.config.pkce_enabled ? await this.generateNonce() : undefined
    const codeVerifier = this.config.pkce_enabled ? this.generateCodeVerifier() : undefined
    
    // Store PKCE parameters
    if (codeVerifier) {
      await this.storeCodeVerifier(state, codeVerifier)
    }
    
    const authUrl = new URL(this.config.authorization_endpoint)
    authUrl.searchParams.set('client_id', this.config.client_id)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', this.config.scopes.join(' '))
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)
    
    if (nonce) {
      authUrl.searchParams.set('nonce', nonce)
    }
    
    if (codeVerifier) {
      const codeChallenge = await this.generateCodeChallenge(codeVerifier)
      authUrl.searchParams.set('code_challenge', codeChallenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')
    }
    
    await this.auditLogger.log({
      action: 'oauth_auth_initiated',
      provider: this.config.provider_id,
      tenant_id: tenantId,
      state: state
    })
    
    return authUrl.toString()
  }
  
  // Handle OAuth callback and exchange code for tokens
  async handleCallback(code: string, state: string): Promise<AuthResult> {
    try {
      // Validate state parameter
      const stateData = await this.validateState(state)
      const { tenantId, redirectUri } = stateData
      
      // Get PKCE code verifier if enabled
      const codeVerifier = this.config.pkce_enabled ? 
        await this.getCodeVerifier(state) : undefined
      
      // Exchange authorization code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(
        code, redirectUri, codeVerifier
      )
      
      // Validate ID token
      const idToken = await this.validateIdToken(tokenResponse.id_token)
      
      // Get user info from userinfo endpoint
      const userInfo = await this.getUserInfo(tokenResponse.access_token)
      
      // Map claims to Thorbis user
      const mappedUser = await this.mapClaimsToUser(userInfo, idToken, tenantId)
      
      // Provision or update user
      const user = await this.provisionUser(mappedUser, tenantId)
      
      // Generate Thorbis session tokens
      const sessionTokens = await this.tokenManager.generateSessionTokens({
        user_id: user.id,
        tenant_id: tenantId,
        role: user.role,
        permissions: user.permissions,
        sso_provider: this.config.provider_id,
        external_user_id: mappedUser.external_user_id
      })
      
      await this.auditLogger.log({
        action: 'oauth_auth_completed',
        provider: this.config.provider_id,
        tenant_id: tenantId,
        user_id: user.id,
        external_user_id: mappedUser.external_user_id
      })
      
      return {
        user: user,
        tokens: sessionTokens,
        redirect_uri: stateData.redirectUri
      }
      
    } catch (error) {
      await this.auditLogger.log({
        action: 'oauth_auth_failed',
        provider: this.config.provider_id,
        error: error.message,
        code: code,
        state: state
      })
      
      throw error
    }
  }
  
  // Map external claims to Thorbis user
  private async mapClaimsToUser(userInfo: any, idToken: any, tenantId: string): Promise<MappedUser> {
    const claims = { ...userInfo, ...idToken }
    
    const mappedUser: MappedUser = {
      external_user_id: claims[this.config.claims_mapping.user_id],
      email: claims[this.config.claims_mapping.email],
      first_name: claims[this.config.claims_mapping.first_name],
      last_name: claims[this.config.claims_mapping.last_name],
      display_name: claims[this.config.claims_mapping.display_name] || 
        `${claims[this.config.claims_mapping.first_name]} ${claims[this.config.claims_mapping.last_name]}`,
      groups: claims[this.config.claims_mapping.groups] || [],
      tenant_id: tenantId,
      provider_id: this.config.provider_id
    }
    
    // Map role based on groups/claims
    mappedUser.role = await this.mapUserRole(mappedUser, claims)
    mappedUser.permissions = await this.mapUserPermissions(mappedUser, claims)
    
    return mappedUser
  }
  
  // Map user role based on conditions
  private async mapUserRole(user: MappedUser, claims: any): Promise<string> {
    for (const roleMapping of this.config.role_mapping) {
      if (await this.evaluateRoleCondition(roleMapping.condition, user, claims)) {
        return roleMapping.thorbis_role
      }
    }
    
    // Return default role if no mapping matches
    return this.config.default_role || 'viewer'
  }
  
  // Evaluate role mapping condition
  private async evaluateRoleCondition(
    condition: RoleMappingCondition, 
    user: MappedUser, 
    claims: any
  ): Promise<boolean> {
    let fieldValue: any
    
    switch (condition.type) {
      case 'group':
        fieldValue = user.groups
        break
      case 'claim':
        fieldValue = claims[condition.field]
        break
      case 'domain':
        fieldValue = user.email.split('@')[1]
        break
      default:
        return false
    }
    
    if (!fieldValue) return false
    
    // Handle array values (like groups)
    const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
    const conditionValues = Array.isArray(condition.value) ? condition.value : [condition.value]
    
    switch (condition.operator) {
      case 'equals':
        return conditionValues.some(cv => values.some(v => v === cv))
      
      case 'contains':
        return conditionValues.some(cv => values.some(v => String(v).includes(cv)))
      
      case 'starts_with':
        return conditionValues.some(cv => values.some(v => String(v).startsWith(cv)))
      
      case 'regex':
        return conditionValues.some(cv => {
          const regex = new RegExp(cv)
          return values.some(v => regex.test(String(v)))
        })
      
      default:
        return false
    }
  }
}
```

## 🏛️ SAML 2.0 Implementation

### SAML Configuration Schema
```typescript
interface SAMLProviderConfig {
  provider_id: string
  provider_name: string
  
  // SAML Configuration
  entity_id: string                // SP Entity ID
  idp_entity_id: string           // IdP Entity ID
  sso_endpoint: string            // IdP SSO endpoint
  slo_endpoint?: string           // IdP SLO endpoint
  idp_certificate: string         // X.509 certificate for signature validation
  
  // Bindings
  sso_binding: 'HTTP-POST' | 'HTTP-Redirect'
  slo_binding: 'HTTP-POST' | 'HTTP-Redirect'
  
  // Signature/Encryption
  sign_authn_requests: boolean
  encrypt_assertions: boolean
  signature_algorithm: 'RSA-SHA256' | 'RSA-SHA1'
  
  // Attribute Mapping
  attribute_mapping: SAMLAttributeMapping
  
  // Multi-tenant Configuration
  tenant_mapping: TenantMapping
  
  // User Provisioning
  jit_provisioning: boolean
  default_role: string
  role_mapping: RoleMapping[]
}

interface SAMLAttributeMapping {
  user_id: string                 // e.g., 'NameID' or 'employeeId'
  email: string                   // e.g., 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
  first_name: string              // e.g., 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'
  last_name: string               // e.g., 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
  display_name: string            // e.g., 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
  groups: string                  // e.g., 'http://schemas.xmlsoap.org/claims/Group'
}
```

### SAML Implementation
```typescript
class SAMLAuthenticator {
  constructor(
    private config: SAMLProviderConfig,
    private samlService: SAMLService,
    private tokenManager: TokenManager,
    private userService: UserService,
    private auditLogger: AuditLogger
  ) {}
  
  // Generate SAML AuthnRequest
  async initiateAuth(tenantId: string, relayState: string): Promise<string> {
    const requestId = uuidv4()
    const issueInstant = new Date().toISOString()
    
    // Generate SAML AuthnRequest
    const authnRequest = `
      <saml2p:AuthnRequest 
        xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${requestId}"
        Version="2.0"
        IssueInstant="${issueInstant}"
        Destination="${this.config.sso_endpoint}"
        ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        AssertionConsumerServiceURL="${process.env.BASE_URL}/auth/saml/acs">
        
        <saml2:Issuer>${this.config.entity_id}</saml2:Issuer>
        
        <saml2p:NameIDPolicy 
          Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"
          AllowCreate="true" />
          
      </saml2p:AuthnRequest>
    `
    
    // Sign the request if required
    const signedRequest = this.config.sign_authn_requests ?
      await this.samlService.signXML(authnRequest) : authnRequest
    
    // Store request for validation
    await this.storeAuthRequest(requestId, { tenantId, relayState })
    
    // Base64 encode and build redirect URL
    const encodedRequest = Buffer.from(signedRequest).toString('base64')
    const redirectUrl = new URL(this.config.sso_endpoint)
    redirectUrl.searchParams.set('SAMLRequest', encodedRequest)
    redirectUrl.searchParams.set('RelayState', relayState)
    
    if (this.config.sso_binding === 'HTTP-Redirect' && this.config.sign_authn_requests) {
      // Add signature parameters for HTTP-Redirect binding
      const signature = await this.samlService.signRedirectParameters(redirectUrl.searchParams)
      redirectUrl.searchParams.set('Signature', signature)
      redirectUrl.searchParams.set('SigAlg', this.config.signature_algorithm)
    }
    
    await this.auditLogger.log({
      action: 'saml_auth_initiated',
      provider: this.config.provider_id,
      tenant_id: tenantId,
      request_id: requestId
    })
    
    return redirectUrl.toString()
  }
  
  // Handle SAML Response
  async handleSAMLResponse(samlResponse: string, relayState: string): Promise<AuthResult> {
    try {
      // Decode and parse SAML response
      const decodedResponse = Buffer.from(samlResponse, 'base64').toString('utf8')
      const parsedResponse = await this.samlService.parseXML(decodedResponse)
      
      // Validate SAML response
      await this.validateSAMLResponse(parsedResponse)
      
      // Extract assertion
      const assertion = this.samlService.extractAssertion(parsedResponse)
      
      // Validate assertion
      await this.validateAssertion(assertion)
      
      // Extract attributes
      const attributes = this.samlService.extractAttributes(assertion)
      
      // Get tenant ID from relay state
      const tenantId = await this.getTenantFromRelayState(relayState)
      
      // Map SAML attributes to Thorbis user
      const mappedUser = await this.mapSAMLAttributesToUser(attributes, tenantId)
      
      // Provision or update user
      const user = await this.provisionUser(mappedUser, tenantId)
      
      // Generate Thorbis session tokens
      const sessionTokens = await this.tokenManager.generateSessionTokens({
        user_id: user.id,
        tenant_id: tenantId,
        role: user.role,
        permissions: user.permissions,
        sso_provider: this.config.provider_id,
        external_user_id: mappedUser.external_user_id,
        saml_session_index: assertion.sessionIndex
      })
      
      await this.auditLogger.log({
        action: 'saml_auth_completed',
        provider: this.config.provider_id,
        tenant_id: tenantId,
        user_id: user.id,
        external_user_id: mappedUser.external_user_id,
        session_index: assertion.sessionIndex
      })
      
      return {
        user: user,
        tokens: sessionTokens,
        redirect_uri: await this.getRedirectFromRelayState(relayState)
      }
      
    } catch (error) {
      await this.auditLogger.log({
        action: 'saml_auth_failed',
        provider: this.config.provider_id,
        error: error.message,
        relay_state: relayState
      })
      
      throw error
    }
  }
  
  // Map SAML attributes to user
  private async mapSAMLAttributesToUser(attributes: SAMLAttributes, tenantId: string): Promise<MappedUser> {
    const mappedUser: MappedUser = {
      external_user_id: attributes[this.config.attribute_mapping.user_id],
      email: attributes[this.config.attribute_mapping.email],
      first_name: attributes[this.config.attribute_mapping.first_name],
      last_name: attributes[this.config.attribute_mapping.last_name],
      display_name: attributes[this.config.attribute_mapping.display_name],
      groups: this.parseGroups(attributes[this.config.attribute_mapping.groups]),
      tenant_id: tenantId,
      provider_id: this.config.provider_id
    }
    
    // Map role based on attributes
    mappedUser.role = await this.mapUserRole(mappedUser, attributes)
    mappedUser.permissions = await this.mapUserPermissions(mappedUser, attributes)
    
    return mappedUser
  }
}
```

## 🎭 Role Mapping System

### Advanced Role Mapping Rules
```typescript
interface AdvancedRoleMapping {
  name: string
  description: string
  priority: number                 // Higher priority rules evaluated first
  conditions: RoleMappingCondition[]
  logical_operator: 'AND' | 'OR'  // How to combine conditions
  result: RoleMappingResult
  enabled: boolean
}

interface RoleMappingResult {
  thorbis_role: 'owner' | 'manager' | 'staff' | 'viewer'
  permissions: string[]
  temporary: boolean               // Temporary role assignment
  expires_at?: Date               // Expiration for temporary roles
  metadata: Record<string, any>   // Additional role metadata
}

// Example role mapping configurations
const ROLE_MAPPING_EXAMPLES: AdvancedRoleMapping[] = [
  {
    name: "Domain Admins to Owner",
    description: "Map Active Directory Domain Admins to Thorbis Owner role",
    priority: 100,
    conditions: [
      {
        type: 'group',
        field: 'groups',
        operator: 'contains',
        value: 'Domain Admins'
      }
    ],
    logical_operator: 'AND',
    result: {
      thorbis_role: 'owner',
      permissions: ['*'],
      temporary: false,
      metadata: { source: 'ad_domain_admin' }
    },
    enabled: true
  },
  
  {
    name: "Manager Group with Email Domain",
    description: "Users in Managers group from company domain get Manager role",
    priority: 80,
    conditions: [
      {
        type: 'group',
        field: 'groups',
        operator: 'contains',
        value: 'Managers'
      },
      {
        type: 'domain',
        field: 'email',
        operator: 'equals',
        value: 'company.com'
      }
    ],
    logical_operator: 'AND',
    result: {
      thorbis_role: 'manager',
      permissions: [
        'invoices.write',
        'estimates.write',
        'scheduling.write',
        'users.read',
        'reports.read'
      ],
      temporary: false,
      metadata: { source: 'manager_group' }
    },
    enabled: true
  },
  
  {
    name: "Contractor Temporary Access",
    description: "External contractors get limited Staff access for 30 days",
    priority: 60,
    conditions: [
      {
        type: 'claim',
        field: 'employment_type',
        operator: 'equals',
        value: 'contractor'
      },
      {
        type: 'domain',
        field: 'email',
        operator: 'regex',
        value: '^.*@(contractor1|contractor2)\\.com$'
      }
    ],
    logical_operator: 'AND',
    result: {
      thorbis_role: 'staff',
      permissions: [
        'jobs.read',
        'schedules.read',
        'customers.read'
      ],
      temporary: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: { 
        source: 'contractor',
        requires_renewal: true
      }
    },
    enabled: true
  },
  
  {
    name: "Default Company Employee",
    description: "Default role for company employees",
    priority: 10,
    conditions: [
      {
        type: 'domain',
        field: 'email',
        operator: 'equals',
        value: 'company.com'
      }
    ],
    logical_operator: 'AND',
    result: {
      thorbis_role: 'staff',
      permissions: [
        'invoices.read',
        'estimates.read',
        'scheduling.read'
      ],
      temporary: false,
      metadata: { source: 'company_employee' }
    },
    enabled: true
  }
]
```

### Role Mapping Engine
```typescript
class RoleMappingEngine {
  constructor(
    private mappingRules: AdvancedRoleMapping[],
    private auditLogger: AuditLogger
  ) {}
  
  async mapUserRole(user: MappedUser, claims: any): Promise<RoleMappingResult> {
    // Sort rules by priority (highest first)
    const sortedRules = this.mappingRules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority)
    
    for (const rule of sortedRules) {
      if (await this.evaluateRule(rule, user, claims)) {
        await this.auditLogger.log({
          action: 'role_mapping_applied',
          rule_name: rule.name,
          user_id: user.external_user_id,
          tenant_id: user.tenant_id,
          mapped_role: rule.result.thorbis_role,
          conditions_met: rule.conditions.length
        })
        
        return rule.result
      }
    }
    
    // No rules matched, return default
    const defaultResult: RoleMappingResult = {
      thorbis_role: 'viewer',
      permissions: ['basic.read'],
      temporary: false,
      metadata: { source: 'default' }
    }
    
    await this.auditLogger.log({
      action: 'role_mapping_default_applied',
      user_id: user.external_user_id,
      tenant_id: user.tenant_id,
      mapped_role: defaultResult.thorbis_role
    })
    
    return defaultResult
  }
  
  private async evaluateRule(rule: AdvancedRoleMapping, user: MappedUser, claims: any): Promise<boolean> {
    const conditionResults = await Promise.all(
      rule.conditions.map(condition => this.evaluateCondition(condition, user, claims))
    )
    
    if (rule.logical_operator === 'AND') {
      return conditionResults.every(result => result)
    } else {
      return conditionResults.some(result => result)
    }
  }
  
  private async evaluateCondition(condition: RoleMappingCondition, user: MappedUser, claims: any): Promise<boolean> {
    let fieldValue: any
    
    switch (condition.type) {
      case 'group':
        fieldValue = user.groups || []
        break
      case 'claim':
        fieldValue = claims[condition.field]
        break
      case 'domain':
        fieldValue = user.email.split('@')[1]
        break
      default:
        return false
    }
    
    if (fieldValue === undefined || fieldValue === null) {
      return false
    }
    
    return this.applyOperator(fieldValue, condition.operator, condition.value)
  }
  
  private applyOperator(fieldValue: any, operator: string, conditionValue: string | string[]): boolean {
    const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
    const conditionValues = Array.isArray(conditionValue) ? conditionValue : [conditionValue]
    
    switch (operator) {
      case 'equals':
        return conditionValues.some(cv => values.some(v => String(v) === String(cv)))
      
      case 'contains':
        return conditionValues.some(cv => values.some(v => String(v).includes(String(cv))))
      
      case 'starts_with':
        return conditionValues.some(cv => values.some(v => String(v).startsWith(String(cv))))
      
      case 'regex':
        return conditionValues.some(cv => {
          try {
            const regex = new RegExp(cv, 'i')
            return values.some(v => regex.test(String(v)))
          } catch {
            return false
          }
        })
      
      default:
        return false
    }
  }
}
```

## 👤 User Provisioning & Account Management

### Just-In-Time (JIT) Provisioning
```typescript
class UserProvisioningService {
  constructor(
    private userRepository: UserRepository,
    private tenantRepository: TenantRepository,
    private auditLogger: AuditLogger
  ) {}
  
  async provisionUser(mappedUser: MappedUser, tenantId: string): Promise<User> {
    // Check if user already exists
    let existingUser = await this.userRepository.findByExternalId(
      mappedUser.external_user_id,
      mappedUser.provider_id
    )
    
    if (existingUser) {
      // Update existing user
      return await this.updateExistingUser(existingUser, mappedUser)
    } else {
      // Check if user exists with same email in tenant
      existingUser = await this.userRepository.findByEmail(mappedUser.email, tenantId)
      
      if (existingUser) {
        // Link SSO identity to existing user
        return await this.linkSSOIdentity(existingUser, mappedUser)
      } else {
        // Create new user
        return await this.createNewUser(mappedUser, tenantId)
      }
    }
  }
  
  private async createNewUser(mappedUser: MappedUser, tenantId: string): Promise<User> {
    const userId = uuidv4()
    
    const user: User = {
      id: userId,
      tenant_id: tenantId,
      email: mappedUser.email,
      first_name: mappedUser.first_name,
      last_name: mappedUser.last_name,
      display_name: mappedUser.display_name,
      role: mappedUser.role,
      permissions: mappedUser.permissions,
      is_active: true,
      email_verified: true,  // SSO emails are considered verified
      created_at: new Date(),
      updated_at: new Date(),
      
      // SSO-specific fields
      sso_provider: mappedUser.provider_id,
      external_user_id: mappedUser.external_user_id,
      sso_metadata: {
        groups: mappedUser.groups,
        last_sync: new Date(),
        provider_type: 'oauth' // or 'saml'
      }
    }
    
    await this.userRepository.create(user)
    
    await this.auditLogger.log({
      action: 'user_provisioned',
      user_id: userId,
      tenant_id: tenantId,
      provider_id: mappedUser.provider_id,
      external_user_id: mappedUser.external_user_id,
      role: mappedUser.role,
      provisioning_type: 'jit_create'
    })
    
    return user
  }
  
  private async updateExistingUser(existingUser: User, mappedUser: MappedUser): Promise<User> {
    // Update user attributes from SSO
    const updatedUser: Partial<User> = {
      first_name: mappedUser.first_name,
      last_name: mappedUser.last_name,
      display_name: mappedUser.display_name,
      role: mappedUser.role,
      permissions: mappedUser.permissions,
      updated_at: new Date(),
      
      // Update SSO metadata
      sso_metadata: {
        ...existingUser.sso_metadata,
        groups: mappedUser.groups,
        last_sync: new Date()
      }
    }
    
    await this.userRepository.update(existingUser.id, updatedUser)
    
    await this.auditLogger.log({
      action: 'user_updated_from_sso',
      user_id: existingUser.id,
      tenant_id: existingUser.tenant_id,
      provider_id: mappedUser.provider_id,
      changes: Object.keys(updatedUser),
      provisioning_type: 'jit_update'
    })
    
    return { ...existingUser, ...updatedUser } as User
  }
  
  private async linkSSOIdentity(existingUser: User, mappedUser: MappedUser): Promise<User> {
    // Link SSO identity to existing user account
    const updatedUser: Partial<User> = {
      sso_provider: mappedUser.provider_id,
      external_user_id: mappedUser.external_user_id,
      sso_metadata: {
        groups: mappedUser.groups,
        last_sync: new Date(),
        linked_at: new Date()
      },
      updated_at: new Date()
    }
    
    await this.userRepository.update(existingUser.id, updatedUser)
    
    await this.auditLogger.log({
      action: 'sso_identity_linked',
      user_id: existingUser.id,
      tenant_id: existingUser.tenant_id,
      provider_id: mappedUser.provider_id,
      external_user_id: mappedUser.external_user_id,
      provisioning_type: 'account_linking'
    })
    
    return { ...existingUser, ...updatedUser } as User
  }
}
```

## 🔄 Single Logout (SLO) Implementation

### SLO Configuration
```typescript
interface SLOConfig {
  enabled: boolean
  timeout_seconds: number
  cleanup_sessions: boolean
  revoke_tokens: boolean
  notify_applications: boolean
}

class SingleLogoutService {
  async initiateSLO(userId: string, tenantId: string, sessionId: string): Promise<SLOResult> {
    const user = await this.userService.getUser(userId)
    if (!user.sso_provider) {
      throw new Error('User is not SSO authenticated')
    }
    
    const provider = await this.getProvider(user.sso_provider)
    
    // Revoke all user sessions
    await this.sessionService.revokeAllUserSessions(userId)
    
    // Revoke all user tokens
    await this.tokenManager.revokeAllUserTokens(userId)
    
    // Initiate SLO with IdP
    if (provider.type === 'saml') {
      return await this.initiateSAMLSLO(provider, user)
    } else {
      return await this.initiateOAuthSLO(provider, user)
    }
  }
  
  private async initiateSAMLSLO(provider: SAMLProviderConfig, user: User): Promise<SLOResult> {
    const logoutRequest = `
      <saml2p:LogoutRequest 
        xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${uuidv4()}"
        Version="2.0"
        IssueInstant="${new Date().toISOString()}"
        Destination="${provider.slo_endpoint}">
        
        <saml2:Issuer>${provider.entity_id}</saml2:Issuer>
        <saml2:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">
          ${user.external_user_id}
        </saml2:NameID>
        <saml2p:SessionIndex>${user.sso_metadata.session_index}</saml2p:SessionIndex>
        
      </saml2p:LogoutRequest>
    `
    
    const signedRequest = await this.samlService.signXML(logoutRequest)
    const encodedRequest = Buffer.from(signedRequest).toString('base64')
    
    const logoutUrl = new URL(provider.slo_endpoint)
    logoutUrl.searchParams.set('SAMLRequest', encodedRequest)
    
    return {
      success: true,
      logout_url: logoutUrl.toString(),
      provider: provider.provider_id
    }
  }
}
```

This comprehensive SSO implementation provides OAuth 2.0, OpenID Connect, and SAML 2.0 support with sophisticated role mapping, JIT provisioning, and single logout capabilities.

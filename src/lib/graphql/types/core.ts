/**
 * GraphQL Type Definitions for Core Management Entities
 * Defines types for tenants, users, roles, and permissions
 */

export const coreTypeDefs = `
  # Core Management Types

  # Tenant Management
  type Tenant implements Node & Timestamped {
    id: ID!
    name: String!
    slug: String!
    industry: Industry!
    status: TenantStatus!
    domain: String
    contact_email: String
    contact_phone: String
    settings: JSON
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    # Computed fields
    userCount: Int!
    
    # Relationships
    users(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): UserConnection!
  }

  type TenantConnection {
    edges: [TenantEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TenantEdge {
    cursor: String!
    node: Tenant!
  }

  enum Industry {
    HOME_SERVICES
    RESTAURANT
    AUTOMOTIVE
    RETAIL
    BANKING
    HEALTHCARE
    EDUCATION
    TECHNOLOGY
  }

  enum TenantStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    PENDING_SETUP
  }

  input TenantInput {
    name: String!
    slug: String!
    industry: Industry!
    domain: String
    contact_email: String
    contact_phone: String
    settings: JSON
    metadata: JSON
  }

  input TenantUpdateInput {
    name: String
    slug: String
    industry: Industry
    status: TenantStatus
    domain: String
    contact_email: String
    contact_phone: String
    settings: JSON
    metadata: JSON
  }

  # User Management
  type User implements Node & Timestamped {
    id: ID!
    email: String!
    username: String
    firstName: String!
    lastName: String!
    fullName: String!
    phone: String
    avatarUrl: String
    status: UserStatus!
    isSystemUser: Boolean!
    isSuperAdmin: Boolean!
    mfaEnabled: Boolean!
    lastLoginAt: DateTime
    loginCount: Int!
    failedLoginAttempts: Int!
    lockedUntil: DateTime
    currentTenantId: ID
    defaultTenantId: ID
    timezone: String!
    locale: String!
    themePreference: ThemePreference!
    profileData: JSON
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    # Relationships
    currentTenant: Tenant
    defaultTenant: Tenant
    activeRoles: [UserRole!]!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    cursor: String!
    node: User!
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    PENDING_VERIFICATION
  }

  enum ThemePreference {
    LIGHT
    DARK
    SYSTEM
  }

  input UserInput {
    email: String!
    username: String
    password: String
    firstName: String!
    lastName: String!
    phone: String
    avatarUrl: String
    currentTenantId: ID
    defaultTenantId: ID
    timezone: String
    locale: String
    themePreference: ThemePreference
    profileData: JSON
    metadata: JSON
  }

  input UserUpdateInput {
    email: String
    username: String
    firstName: String
    lastName: String
    phone: String
    avatarUrl: String
    status: UserStatus
    currentTenantId: ID
    defaultTenantId: ID
    timezone: String
    locale: String
    themePreference: ThemePreference
    profileData: JSON
    metadata: JSON
  }

  # Role Management
  type Role implements Node & Timestamped {
    id: ID!
    name: String!
    displayName: String!
    description: String
    permissions: [String!]!
    roleType: RoleType!
    isSystemRole: Boolean!
    isTenantSpecific: Boolean!
    tenantId: ID
    parentRoleId: ID
    inheritedPermissions: [String!]!
    roleConfig: JSON
    metadata: JSON
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Computed fields
    userCount: Int!
    
    # Relationships
    tenant: Tenant
    parentRole: Role
    childRoles: [Role!]!
    assignedUsers(
      pagination: PaginationInput
    ): UserRoleConnection!
  }

  type RoleConnection {
    edges: [RoleEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type RoleEdge {
    cursor: String!
    node: Role!
  }

  enum RoleType {
    SYSTEM
    ADMIN
    MANAGER
    USER
  }

  input RoleInput {
    name: String!
    displayName: String!
    description: String
    permissions: [String!]
    roleType: RoleType
    isTenantSpecific: Boolean
    tenantId: ID
    parentRoleId: ID
    roleConfig: JSON
    metadata: JSON
  }

  input RoleUpdateInput {
    name: String
    displayName: String
    description: String
    permissions: [String!]
    roleType: RoleType
    tenantId: ID
    parentRoleId: ID
    roleConfig: JSON
    metadata: JSON
  }

  # User Role Assignment
  type UserRole implements Node {
    id: ID!
    userId: ID!
    roleId: ID!
    tenantId: ID
    assignedBy: ID
    assignedAt: DateTime!
    expiresAt: DateTime
    assignmentReason: String
    assignmentContext: JSON
    isActive: Boolean!
    revokedAt: DateTime
    revokedBy: ID
    revokedReason: String
    
    # Relationships
    user: User!
    role: Role!
    tenant: Tenant
  }

  type UserRoleConnection {
    edges: [UserRoleEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserRoleEdge {
    cursor: String!
    node: UserRole!
  }

  # Permission Management
  type Permission implements Node {
    id: ID!
    name: String!
    displayName: String!
    description: String
    permissionType: PermissionType!
    resourceType: String
    resourceIdentifier: String
    tenantId: ID
    industry: Industry
    conditions: JSON
    isActive: Boolean!
    createdAt: DateTime!
    
    # Relationships
    tenant: Tenant
  }

  type PermissionConnection {
    edges: [PermissionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PermissionEdge {
    cursor: String!
    node: Permission!
  }

  enum PermissionType {
    CREATE
    READ
    UPDATE
    DELETE
    ADMIN
    CUSTOM
  }

  input PermissionInput {
    name: String!
    displayName: String!
    description: String
    permissionType: PermissionType!
    resourceType: String
    resourceIdentifier: String
    tenantId: ID
    industry: Industry
    conditions: JSON
  }

  input PermissionUpdateInput {
    name: String
    displayName: String
    description: String
    permissionType: PermissionType
    resourceType: String
    resourceIdentifier: String
    tenantId: ID
    industry: Industry
    conditions: JSON
  }

  # Extended Query Type for Core Management
  extend type Query {
    # Tenant Queries
    tenant(id: ID!): Tenant
    tenants(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): TenantConnection! @cacheControl(maxAge: 300)

    # User Queries
    user(id: ID!): User
    users(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): UserConnection! @cacheControl(maxAge: 60)

    # Role Queries
    role(id: ID!): Role
    roles(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): RoleConnection! @cacheControl(maxAge: 300)

    # Permission Queries
    permission(id: ID!): Permission
    permissions(
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): PermissionConnection! @cacheControl(maxAge: 600)

    # User Role Queries
    userRoles(
      userId: ID
      roleId: ID
      tenantId: ID
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): UserRoleConnection! @cacheControl(maxAge: 60)
  }

  # Extended Mutation Type for Core Management
  extend type Mutation {
    # Tenant Mutations
    createTenant(input: TenantInput!): Tenant!
    updateTenant(id: ID!, input: TenantUpdateInput!): Tenant!
    deleteTenant(id: ID!): Boolean!
    restoreTenant(id: ID!): Tenant!

    # User Mutations
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserUpdateInput!): User!
    deleteUser(id: ID!): Boolean!
    restoreUser(id: ID!): User!
    changeUserPassword(id: ID!, currentPassword: String!, newPassword: String!): Boolean!
    resetUserPassword(id: ID!, newPassword: String!): Boolean!

    # Role Mutations
    createRole(input: RoleInput!): Role!
    updateRole(id: ID!, input: RoleUpdateInput!): Role!
    deleteRole(id: ID!): Boolean!
    restoreRole(id: ID!): Role!

    # Role Assignment Mutations
    assignRole(
      userId: ID!
      roleId: ID!
      tenantId: ID
      expiresAt: DateTime
      assignmentReason: String
    ): UserRole!
    
    unassignRole(
      userId: ID!
      roleId: ID!
      tenantId: ID
      revokedReason: String
    ): Boolean!

    # Permission Mutations
    createPermission(input: PermissionInput!): Permission!
    updatePermission(id: ID!, input: PermissionUpdateInput!): Permission!
    deletePermission(id: ID!): Boolean!
    restorePermission(id: ID!): Permission!

    # Bulk Operations
    bulkAssignRoles(
      userIds: [ID!]!
      roleId: ID!
      tenantId: ID
      expiresAt: DateTime
      assignmentReason: String
    ): [UserRole!]!

    bulkUnassignRoles(
      userIds: [ID!]!
      roleId: ID!
      tenantId: ID
      revokedReason: String
    ): Boolean!

    # Tenant Management Operations
    transferUserToTenant(
      userId: ID!
      fromTenantId: ID!
      toTenantId: ID!
      transferRoles: Boolean = false
    ): User!
  }

  # Subscription Type for Real-time Updates
  extend type Subscription {
    # Real-time updates for core entities
    tenantUpdates(tenantId: ID): Tenant!
    userUpdates(userId: ID, tenantId: ID): User!
    roleUpdates(roleId: ID, tenantId: ID): Role!
    userRoleUpdates(userId: ID, tenantId: ID): UserRole!
    
    # System-wide updates
    systemUserActivity: UserActivityEvent!
    roleAssignmentChanges(tenantId: ID): RoleAssignmentEvent!
  }

  # Event Types for Subscriptions
  type UserActivityEvent {
    userId: ID!
    event: UserActivityType!
    timestamp: DateTime!
    metadata: JSON
  }

  enum UserActivityType {
    LOGIN
    LOGOUT
    PASSWORD_CHANGE
    PROFILE_UPDATE
    ROLE_ASSIGNED
    ROLE_UNASSIGNED
    TENANT_SWITCH
  }

  type RoleAssignmentEvent {
    userId: ID!
    roleId: ID!
    tenantId: ID
    event: RoleAssignmentEventType!
    timestamp: DateTime!
    assignedBy: ID
    metadata: JSON
  }

  enum RoleAssignmentEventType {
    ASSIGNED
    UNASSIGNED
    EXPIRED
    REVOKED
    REACTIVATED
  }
`;

export default coreTypeDefs;
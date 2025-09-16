/**
 * GraphQL Resolvers for Core Management Entities
 * Provides GraphQL access to tenants, users, roles, and permissions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DATABASE_URL || ';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GraphQLContext {
  businessId?: string;
  userId?: string;
  permissions: string[];
  isAuthenticated: boolean;
  request: any;
}

interface PaginationInput {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
}

interface FilterInput {
  field: string;
  operator: string;
  value?: string;
  values?: string[];
}

interface SortInput {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Helper function to build pagination
function buildPagination(pagination?: PaginationInput) {
  const limit = pagination?.first || pagination?.last || 20;
  const offset = 0; // For cursor-based pagination, this would be more complex
  return { limit: Math.min(limit, 100), offset };
}

// Helper function to build filters
function applyFilters(query: unknown, filters?: FilterInput[]) {
  if (!filters) return query;
  
  filters.forEach(filter => {
    switch (filter.operator) {
      case 'EQUALS':
        query = query.eq(filter.field, filter.value);
        break;
      case 'NOT_EQUALS':
        query = query.neq(filter.field, filter.value);
        break;
      case 'CONTAINS':
        query = query.ilike(filter.field, '%${filter.value}%');
        break;
      case 'IN':
        query = query.in(filter.field, filter.values || []);
        break;
      case 'IS_NULL':
        query = query.is(filter.field, null);
        break;
      case 'IS_NOT_NULL':
        query = query.not(filter.field, 'is', null);
        break;
    }
  });
  
  return query;
}

// Helper function to build sorting
function applySorting(query: unknown, sorts?: SortInput[]) {
  if (!sorts || sorts.length === 0) {
    return query.order('created_at', { ascending: false });
  }
  
  sorts.forEach((sort, index) => {
    const ascending = sort.direction === 'ASC';
    if (index === 0) {
      query = query.order(sort.field, { ascending });
    } else {
      query = query.order(sort.field, { ascending });
    }
  });
  
  return query;
}

// Helper function to create connection response
function createConnection(data: unknown[], totalCount: number, hasNextPage: boolean = false, hasPreviousPage: boolean = false) {
  return {
    edges: data.map((item, index) => ({
      cursor: Buffer.from('${item.id}:${index}').toString('base64'),
      node: item
    })),
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: data.length > 0 ? Buffer.from('${data[0].id}:0').toString('base64') : null,
      endCursor: data.length > 0 ? Buffer.from('${data[data.length - 1].id}:${data.length - 1}').toString('base64') : null
    },
    totalCount
  };
}

export const coreResolvers = {
  Query: {
    // Tenant Queries
    tenant: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('tenant_mgmt.tenants')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw new Error('Failed to fetch tenant: ${error.message}');
      return data;
    },

    tenants: async (_: unknown, { pagination, filters, sorts }: {
      pagination?: PaginationInput;
      filters?: FilterInput[];
      sorts?: SortInput[];
    }, context: GraphQLContext) => {
      const { limit, offset } = buildPagination(pagination);
      
      let query = supabase
        .from('tenant_mgmt.tenants')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .range(offset, offset + limit - 1);

      query = applyFilters(query, filters);
      query = applySorting(query, sorts);

      const { data, error, count } = await query;

      if (error) throw new Error('Failed to fetch tenants: ${error.message}');
      
      return createConnection(data || [], count || 0, false, false);
    },

    // User Queries
    user: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.users')
        .select('
          *,
          current_tenant:current_tenant_id(name, slug, industry),
          user_roles(
            id,
            assigned_at,
            expires_at,
            is_active,
            role:role_id(name, display_name, role_type, permissions),
            tenant:tenant_id(name, slug)
          )
        ')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw new Error('Failed to fetch user: ${error.message}');
      
      // Remove sensitive data
      const { password_hash, mfa_secret, backup_codes, ...sanitizedData } = data;
      return sanitizedData;
    },

    users: async (_: unknown, { pagination, filters, sorts }: {
      pagination?: PaginationInput;
      filters?: FilterInput[];
      sorts?: SortInput[];
    }, context: GraphQLContext) => {
      const { limit, offset } = buildPagination(pagination);
      
      let query = supabase
        .from('user_mgmt.users')
        .select('
          *,
          current_tenant:current_tenant_id(name, slug, industry)
        ', { count: 'exact' })
        .is('deleted_at', null)
        .range(offset, offset + limit - 1);

      query = applyFilters(query, filters);
      query = applySorting(query, sorts);

      const { data, error, count } = await query;

      if (error) throw new Error('Failed to fetch users: ${error.message}');
      
      // Remove sensitive data from all users
      const sanitizedData = data?.map(user => {
        const { password_hash, mfa_secret, backup_codes, ...sanitizedUser } = user;
        return sanitizedUser;
      }) || [];

      return createConnection(sanitizedData, count || 0, false, false);
    },

    // Role Queries
    role: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.roles')
        .select('
          *,
          tenant:tenant_id(name, slug, industry),
          parent_role:parent_role_id(name, display_name),
          user_roles(
            id,
            assigned_at,
            expires_at,
            is_active,
            user:user_id(id, email, first_name, last_name, status),
            tenant:tenant_id(name, slug)
          )
        ')
        .eq('id', id)
        .single();

      if (error) throw new Error('Failed to fetch role: ${error.message}');
      return data;
    },

    roles: async (_: unknown, { pagination, filters, sorts }: {
      pagination?: PaginationInput;
      filters?: FilterInput[];
      sorts?: SortInput[];
    }, context: GraphQLContext) => {
      const { limit, offset } = buildPagination(pagination);
      
      let query = supabase
        .from('user_mgmt.roles')
        .select('
          *,
          tenant:tenant_id(name, slug, industry),
          parent_role:parent_role_id(name, display_name)
        ', { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1);

      query = applyFilters(query, filters);
      query = applySorting(query, sorts);

      const { data, error, count } = await query;

      if (error) throw new Error('Failed to fetch roles: ${error.message}');
      
      return createConnection(data || [], count || 0, false, false);
    },

    // Permission Queries
    permission: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.permissions')
        .select('
          *,
          tenant:tenant_id(name, slug, industry)
        ')
        .eq('id', id)
        .single();

      if (error) throw new Error('Failed to fetch permission: ${error.message}');
      return data;
    },

    permissions: async (_: unknown, { pagination, filters, sorts }: {
      pagination?: PaginationInput;
      filters?: FilterInput[];
      sorts?: SortInput[];
    }, context: GraphQLContext) => {
      const { limit, offset } = buildPagination(pagination);
      
      let query = supabase
        .from('user_mgmt.permissions')
        .select('
          *,
          tenant:tenant_id(name, slug, industry)
        ', { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1);

      query = applyFilters(query, filters);
      query = applySorting(query, sorts);

      const { data, error, count } = await query;

      if (error) throw new Error('Failed to fetch permissions: ${error.message}');
      
      return createConnection(data || [], count || 0, false, false);
    }
  },

  Mutation: {
    // Tenant Mutations
    createTenant: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('tenant_mgmt.tenants')
        .insert([{
          ...input,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw new Error('Failed to create tenant: ${error.message}');
      return data;
    },

    updateTenant: async (_: unknown, { id, input }: { id: string; input: any }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('tenant_mgmt.tenants')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) throw new Error('Failed to update tenant: ${error.message}');
      return data;
    },

    deleteTenant: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { error } = await supabase
        .from('tenant_mgmt.tenants')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null);

      if (error) throw new Error('Failed to delete tenant: ${error.message}');
      return true;
    },

    // User Mutations
    createUser: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      // Hash password if provided
      const userToCreate = { ...input };
      if (input.password) {
        const bcrypt = require('bcryptjs');
        userToCreate.password_hash = await bcrypt.hash(input.password, 12);
        delete userToCreate.password;
      }

      userToCreate.status = 'PENDING_VERIFICATION';
      userToCreate.created_at = new Date().toISOString();
      userToCreate.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('user_mgmt.users`)
        .insert([userToCreate])
        .select(`
          *,
          current_tenant:current_tenant_id(name, slug, industry)
        ')
        .single();

      if (error) throw new Error('Failed to create user: ${error.message}');
      
      // Remove sensitive data
      const { password_hash, mfa_secret, backup_codes, ...sanitizedData } = data;
      return sanitizedData;
    },

    updateUser: async (_: unknown, { id, input }: { id: string; input: any }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.users')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at`, null)
        .select(`
          *,
          current_tenant:current_tenant_id(name, slug, industry)
        ')
        .single();

      if (error) throw new Error('Failed to update user: ${error.message}');
      
      // Remove sensitive data
      const { password_hash, mfa_secret, backup_codes, ...sanitizedData } = data;
      return sanitizedData;
    },

    deleteUser: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { error } = await supabase
        .from('user_mgmt.users')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null);

      if (error) throw new Error('Failed to delete user: ${error.message}');
      return true;
    },

    // Role Mutations
    createRole: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.roles')
        .insert([{
          ...input,
          permissions: input.permissions || [],
          role_type: input.role_type || 'USER`,
          is_system_role: input.is_system_role || false,
          is_tenant_specific: input.is_tenant_specific !== false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          tenant:tenant_id(name, slug, industry),
          parent_role:parent_role_id(name, display_name)
        ')
        .single();

      if (error) throw new Error('Failed to create role: ${error.message}');
      return data;
    },

    updateRole: async (_: unknown, { id, input }: { id: string; input: any }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.roles')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id`, id)
        .select(`
          *,
          tenant:tenant_id(name, slug, industry),
          parent_role:parent_role_id(name, display_name)
        ')
        .single();

      if (error) throw new Error('Failed to update role: ${error.message}');
      return data;
    },

    deleteRole: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { error } = await supabase
        .from('user_mgmt.roles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw new Error('Failed to delete role: ${error.message}');
      return true;
    },

    // Role Assignment Mutations
    assignRole: async (_: unknown, { userId, roleId, tenantId, expiresAt, assignmentReason }: {
      userId: string;
      roleId: string;
      tenantId?: string;
      expiresAt?: string;
      assignmentReason?: string;
    }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.user_roles')
        .insert([{
          user_id: userId,
          role_id: roleId,
          tenant_id: tenantId,
          expires_at: expiresAt,
          assignment_reason: assignmentReason || 'Assigned via GraphQL API`,
          is_active: true,
          assigned_at: new Date().toISOString()
        }])
        .select(`
          *,
          user:user_id(email, first_name, last_name),
          role:role_id(name, display_name),
          tenant:tenant_id(name, slug)
        ')
        .single();

      if (error) throw new Error('Failed to assign role: ${error.message}');
      return data;
    },

    unassignRole: async (_: unknown, { userId, roleId, tenantId, revokedReason }: {
      userId: string;
      roleId: string;
      tenantId?: string;
      revokedReason?: string;
    }, context: GraphQLContext) => {
      let query = supabase
        .from('user_mgmt.user_roles')
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_reason: revokedReason || 'Unassigned via GraphQL API'
        })
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .eq('is_active', true);

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { error } = await query;

      if (error) throw new Error('Failed to unassign role: ${error.message}');
      return true;
    },

    // Permission Mutations
    createPermission: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.permissions`)
        .insert([{
          ...input,
          conditions: input.conditions || {},
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          tenant:tenant_id(name, slug, industry)
        ')
        .single();

      if (error) throw new Error('Failed to create permission: ${error.message}');
      return data;
    },

    updatePermission: async (_: unknown, { id, input }: { id: string; input: any }, context: GraphQLContext) => {
      const { data, error } = await supabase
        .from('user_mgmt.permissions')
        .update(input)
        .eq('id`, id)
        .select(`
          *,
          tenant:tenant_id(name, slug, industry)
        ')
        .single();

      if (error) throw new Error('Failed to update permission: ${error.message}');
      return data;
    },

    deletePermission: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { error } = await supabase
        .from('user_mgmt.permissions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw new Error('Failed to delete permission: ${error.message}');
      return true;
    }
  },

  // Field Resolvers
  Tenant: {
    userCount: async (parent: unknown) => {
      const { count } = await supabase
        .from('user_mgmt.users')
        .select('*', { count: 'exact', head: true })
        .eq('current_tenant_id', parent.id)
        .is('deleted_at', null);
      
      return count || 0;
    },

    users: async (parent: unknown, { pagination, filters, sorts }: {
      pagination?: PaginationInput;
      filters?: FilterInput[];
      sorts?: SortInput[];
    }) => {
      const { limit, offset } = buildPagination(pagination);
      
      let query = supabase
        .from('user_mgmt.users')
        .select('*', { count: 'exact' })
        .eq('current_tenant_id', parent.id)
        .is('deleted_at`, null)
        .range(offset, offset + limit - 1);

      query = applyFilters(query, filters);
      query = applySorting(query, sorts);

      const { data, error, count } = await query;

      if (error) throw new Error(`Failed to fetch tenant users: ${error.message}');
      
      // Remove sensitive data
      const sanitizedData = data?.map(user => {
        const { password_hash, mfa_secret, backup_codes, ...sanitizedUser } = user;
        return sanitizedUser;
      }) || [];

      return createConnection(sanitizedData, count || 0, false, false);
    }
  },

  User: {
    fullName: (parent: unknown) => '${parent.first_name} ${parent.last_name}'.trim(),
    
    activeRoles: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('user_mgmt.user_roles')
        .select('
          id,
          assigned_at,
          expires_at,
          role:role_id(name, display_name, role_type, permissions),
          tenant:tenant_id(name, slug)
        ')
        .eq('user_id', parent.id)
        .eq('is_active`, true)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}');

      if (error) throw new Error('Failed to fetch user roles: ${error.message}');
      return data || [];
    }
  },

  Role: {
    userCount: async (parent: unknown) => {
      const { count } = await supabase
        .from('user_mgmt.user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', parent.id)
        .eq('is_active', true);
      
      return count || 0;
    },

    assignedUsers: async (parent: unknown, { pagination }: { pagination?: PaginationInput }) => {
      const { limit, offset } = buildPagination(pagination);
      
      const { data, error, count } = await supabase
        .from('user_mgmt.user_roles')
        .select('
          id,
          assigned_at,
          expires_at,
          is_active,
          user:user_id(id, email, first_name, last_name, status),
          tenant:tenant_id(name, slug)
        ', { count: 'exact' })
        .eq('role_id', parent.id)
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('assigned_at', { ascending: false });

      if (error) throw new Error('Failed to fetch role assignments: ${error.message}');
      
      return createConnection(data || [], count || 0, false, false);
    }
  }
};
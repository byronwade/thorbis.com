'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServer, logAuditEvent } from '@/lib/supabase';
import { headers } from 'next/headers';

// =============================================================================
// AUTHENTICATION SERVER ACTIONS
// =============================================================================

interface SignInFormData {
  email: string;
  password: string;
}

interface SignUpFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  redirectTo?: string;
  signupType?: 'trial' | 'paid' | 'demo';
}

interface ResetPasswordFormData {
  email: string;
}

// Sign in action
export async function signInAction(formData: SignInFormData) {
  const { email, password } = formData;

  if (!email || !password) {
    return {
      error: 'Email and password are required',
    };
  }

  // Check for demo credentials
  if (email.toLowerCase() === 'demo@thorbis.com' && password === 'demo123') {
    // Create a demo session cookie
    const demoSession = {
      user: {
        id: 'd3e4f5a6-b7c8-9012-3456-789012345678',
        email: 'demo@thorbis.com',
        user_metadata: {
          firstName: 'Demo',
          lastName: 'User'
        }
      },
      expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      demo_mode: true
    };
    
    // Set demo session cookie using Next.js cookies
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    cookieStore.set('mock-session', encodeURIComponent(JSON.stringify(demoSession)), {
      expires: new Date(Date.now() + (24 * 60 * 60 * 1000)), // 24 hours
      httpOnly: false, // Allow client-side access for demo purposes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return {
      success: true,
      demo: true,
      message: 'Welcome to the Thorbis demo!'
    };
  }

  // Check if Supabase URL is reachable (development fallback)
  if (process.env.NODE_ENV === 'development') {
    try {
      const testResponse = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      }).catch(() => null);
      
      if (!testResponse) {
        console.warn('Supabase instance not reachable, falling back to demo mode');
        
        // Create fallback demo session
        const demoSession = {
          user: {
            id: 'dev-fallback-user-id',
            email: email,
            user_metadata: {
              firstName: 'Development',
              lastName: 'User'
            }
          },
          expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          demo_mode: true,
          fallback_mode: true
        };
        
        // Set demo session cookie
        const { cookies } = await import('next/headers');
        const cookieStore = cookies();
        cookieStore.set('mock-session', encodeURIComponent(JSON.stringify(demoSession)), {
          expires: new Date(Date.now() + (24 * 60 * 60 * 1000)), // 24 hours
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        return {
          success: true,
          demo: true,
          message: 'Development mode - Supabase not available, using demo session'
        };
      }
    } catch (error) {
      console.warn('Supabase health check failed, falling back to demo mode');
      
      // Create fallback demo session for catch block
      const demoSession = {
        user: {
          id: 'dev-error-fallback-user-id',
          email: email,
          user_metadata: {
            firstName: 'Development',
            lastName: 'User'
          }
        },
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        demo_mode: true,
        fallback_mode: true
      };
      
      // Set demo session cookie
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      cookieStore.set('mock-session', encodeURIComponent(JSON.stringify(demoSession)), {
        expires: new Date(Date.now() + (24 * 60 * 60 * 1000)), // 24 hours
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return {
        success: true,
        demo: true,
        message: 'Development mode - Supabase not available, using demo session'
      };
    }
  }

  const supabase = createSupabaseServer();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    if (data.user) {
      // Get user's IP for audit logging
      const headersList = headers();
      const userAgent = headersList.get('user-agent') || ';
      const forwarded = headersList.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

      // Log successful sign-in
      try {
        await logAuditEvent({
          organization_id: ', // We'll update this when we have organization context
          user_id: data.user.id,
          action: 'user.signed_in',
          resource_type: 'auth',
          metadata: {
            email: data.user.email,
            provider: 'email',
          },
          ip_address: ip,
          user_agent: userAgent,
        });
      } catch (auditError) {
        console.error('Failed to log sign-in audit event:', auditError);
        // Don't fail the sign-in if audit logging fails
      }
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Sign-in error:', error);
    return {
      error: 'An unexpected error occurred during sign-in',
    };
  }
}

// Sign up action
export async function signUpAction(formData: SignUpFormData) {
  const supabase = createSupabaseServer();
  
  const { email, password, firstName, lastName, redirectTo, signupType = 'trial' } = formData;

  if (!email || !password) {
    return {
      error: 'Email and password are required',
    };
  }

  if (password.length < 8) {
    return {
      error: 'Password must be at least 8 characters long',
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          signup_type: signupType,
        },
        emailRedirectTo: redirectTo || '${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback',
      },
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    if (data.user) {
      // Get user's IP for audit logging
      const headersList = headers();
      const userAgent = headersList.get('user-agent') || ';
      const forwarded = headersList.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

      // Log successful sign-up
      try {
        await logAuditEvent({
          organization_id: ', // We'll update this when user joins an organization
          user_id: data.user.id,
          action: 'user.signed_up',
          resource_type: 'auth',
          metadata: {
            email: data.user.email,
            provider: 'email',
            confirmed: data.user.email_confirmed_at !== null,
          },
          ip_address: ip,
          user_agent: userAgent,
        });
      } catch (auditError) {
        console.error('Failed to log sign-up audit event:', auditError);
        // Don't fail the sign-up if audit logging fails
      }
    }

    return {
      success: true,
      user: data.user,
      needsConfirmation: !data.user?.email_confirmed_at,
    };
  } catch (error) {
    console.error('Sign-up error:', error);
    return {
      error: 'An unexpected error occurred during sign-up',
    };
  }
}

// Sign out action
export async function signOutAction() {
  const supabase = createSupabaseServer();

  try {
    // Get current user for audit logging
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: error.message,
      };
    }

    if (user) {
      // Get user's IP for audit logging
      const headersList = headers();
      const userAgent = headersList.get('user-agent') || ';
      const forwarded = headersList.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

      // Log successful sign-out
      try {
        await logAuditEvent({
          organization_id: ', // We'll update this when we have organization context
          user_id: user.id,
          action: 'user.signed_out',
          resource_type: 'auth',
          metadata: {
            email: user.email,
          },
          ip_address: ip,
          user_agent: userAgent,
        });
      } catch (auditError) {
        console.error('Failed to log sign-out audit event:', auditError);
        // Don't fail the sign-out if audit logging fails
      }
    }

    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Sign-out error:', error);
    return {
      error: 'An unexpected error occurred during sign-out',
    };
  }
}

// Reset password action
export async function resetPasswordAction(formData: ResetPasswordFormData) {
  const supabase = createSupabaseServer();
  
  const { email } = formData;

  if (!email) {
    return {
      error: 'Email is required',
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: '${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password',
      }
    );

    if (error) {
      return {
        error: error.message,
      };
    }

    // Get user's IP for audit logging
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || ';
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

    // Log password reset request
    try {
      await logAuditEvent({
        organization_id: ',
        user_id: null, // We don't have user ID for password resets
        action: 'user.password_reset_requested',
        resource_type: 'auth',
        metadata: {
          email,
        },
        ip_address: ip,
        user_agent: userAgent,
      });
    } catch (auditError) {
      console.error('Failed to log password reset audit event:', auditError);
      // Don't fail the password reset if audit logging fails
    }

    return {
      success: true,
      message: 'Check your email for password reset instructions',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      error: 'An unexpected error occurred during password reset',
    };
  }
}

// Update password action (for after reset)
export async function updatePasswordAction(password: string) {
  const supabase = createSupabaseServer();

  if (!password || password.length < 8) {
    return {
      error: 'Password must be at least 8 characters long',
    };
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    if (data.user) {
      // Get user's IP for audit logging
      const headersList = headers();
      const userAgent = headersList.get('user-agent') || ';
      const forwarded = headersList.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

      // Log password update
      try {
        await logAuditEvent({
          organization_id: ', // We'll update this when we have organization context
          user_id: data.user.id,
          action: 'user.password_updated',
          resource_type: 'auth',
          metadata: {
            email: data.user.email,
          },
          ip_address: ip,
          user_agent: userAgent,
        });
      } catch (auditError) {
        console.error('Failed to log password update audit event:', auditError);
        // Don't fail the password update if audit logging fails
      }
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      error: 'An unexpected error occurred during password update',
    };
  }
}

// =============================================================================
// ORGANIZATION MANAGEMENT ACTIONS
// =============================================================================

interface CreateOrganizationFormData {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  website?: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'edu' | 'payroll' | 'ai';
  timezone: string;
  currency: string;
}

// Create organization action
export async function createOrganizationAction(formData: CreateOrganizationFormData) {
  const supabase = createSupabaseServer();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return {
      error: 'You must be authenticated to create an organization',
    };
  }

  const { name, slug, email, phone, website, industry, timezone, currency } = formData;

  if (!name || !slug || !email || !industry) {
    return {
      error: 'Name, slug, email, and industry are required',
    };
  }

  try {
    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        email: email.toLowerCase().trim(),
        phone,
        website,
        industry,
        timezone,
        currency,
        settings: {
          onboarding_completed: false,
        },
      })
      .select()
      .single();

    if (orgError) {
      return {
        error: orgError.message,
      };
    }

    // Add user as owner
    const { error: membershipError } = await supabase
      .from('organization_memberships')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner',
        permissions: ['all'],
        status: 'active',
      });

    if (membershipError) {
      // Try to cleanup the organization if membership creation fails
      await supabase.from('organizations').delete().eq('id', organization.id);
      return {
        error: 'Failed to create organization membership',
      };
    }

    // Get user's IP for audit logging
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || ';
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

    // Log organization creation
    try {
      await logAuditEvent({
        organization_id: organization.id,
        user_id: user.id,
        action: 'organization.created',
        resource_type: 'organization',
        resource_id: organization.id,
        new_values: {
          name: organization.name,
          slug: organization.slug,
          industry: organization.industry,
        },
        metadata: {
          user_role: 'owner',
        },
        ip_address: ip,
        user_agent: userAgent,
      });
    } catch (auditError) {
      console.error('Failed to log organization creation audit event:', auditError);
      // Don't fail organization creation if audit logging fails
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
      organization,
    };
  } catch (error) {
    console.error('Organization creation error:', error);
    return {
      error: 'An unexpected error occurred while creating the organization',
    };
  }
}

// Switch organization action (for business switcher)
export async function switchOrganizationAction(organizationId: string) {
  const supabase = createSupabaseServer();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return {
      error: 'You must be authenticated to switch organizations',
    };
  }

  try {
    // Verify user has access to the organization
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return {
        error: 'You do not have access to this organization',
      };
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .eq('is_active', true)
      .single();

    if (orgError || !organization) {
      return {
        error: 'Organization not found or inactive',
      };
    }

    // Get user's IP for audit logging
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || ';
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

    // Log organization switch
    try {
      await logAuditEvent({
        organization_id: organizationId,
        user_id: user.id,
        action: 'user.organization_switched',
        resource_type: 'organization',
        resource_id: organizationId,
        metadata: {
          organization_name: organization.name,
          user_role: membership.role,
        },
        ip_address: ip,
        user_agent: userAgent,
      });
    } catch (auditError) {
      console.error('Failed to log organization switch audit event:', auditError);
      // Don't fail the switch if audit logging fails
    }

    return {
      success: true,
      organization,
      membership,
    };
  } catch (error) {
    console.error('Organization switch error:', error);
    return {
      error: 'An unexpected error occurred while switching organizations',
    };
  }
}
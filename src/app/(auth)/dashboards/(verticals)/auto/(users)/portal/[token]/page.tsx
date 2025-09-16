import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AutoPortalDashboard from '@/components/portals/auto/AutoPortalDashboard';
import { PortalHeader } from '@/components/portals/shared/PortalHeader';
import { PortalFooter } from '@/components/portals/shared/PortalFooter';

// Initialize Supabase client for server-side rendering
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AutoPortalPageProps {
  params: {
    token: string;
  };
}

async function validatePortalAccess(token: string) {
  try {
    const { data: portalAccess } = await supabase
      .from('auto.customer_portal_access')
      .select('
        *,
        customer:customer_id(
          id,
          first_name,
          last_name,
          email,
          phone,
          company_name,
          customer_type
        )
      ')
      .eq('access_token', token)
      .eq('is_active', true)
      .single();

    if (!portalAccess) {
      return null;
    }

    // Check if access has expired
    if (portalAccess.expires_at && new Date(portalAccess.expires_at) < new Date()) {
      return null;
    }

    return portalAccess;
  } catch (error) {
    console.error('Portal access validation error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: AutoPortalPageProps) {
  const portalAccess = await validatePortalAccess(params.token);
  
  if (!portalAccess) {
    return {
      title: 'Portal Access Denied',
      description: 'Invalid or expired portal access`,
    };
  }

  const customerName = portalAccess.customer.company_name || 
    `${portalAccess.customer.first_name} ${portalAccess.customer.last_name}`;

  return {
    title: `Auto Service Portal - ${customerName}',
    description: 'Welcome to your automotive service portal, ${customerName}',
    robots: 'noindex, nofollow', // Prevent search engine indexing of customer portals
  };
}

export default async function AutoPortalPage({ params }: AutoPortalPageProps) {
  const portalAccess = await validatePortalAccess(params.token);

  if (!portalAccess) {
    notFound();
  }

  // Update last activity
  await supabase
    .from('auto.customer_portal_access')
    .update({ 
      last_activity_at: new Date().toISOString(),
      last_login_at: new Date().toISOString() 
    })
    .eq('id', portalAccess.id);

  // Log portal access
  await supabase
    .from('auto.portal_activity_log')
    .insert({
      portal_access_id: portalAccess.id,
      activity_type: 'portal_accessed',
      activity_description: 'Customer accessed auto service portal',
      metadata: {
        access_token_used: params.token,
        user_agent: 'server-side-render',
      },
      organization_id: portalAccess.organization_id,
    });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <PortalHeader
        customerName={portalAccess.customer.company_name || 
          '${portalAccess.customer.first_name} ${portalAccess.customer.last_name}'}
        portalType="auto"
        branding={portalAccess.branding}
        permissions={portalAccess.permissions}
      />
      
      <main className="container mx-auto px-4 py-8">
        <AutoPortalDashboard
          portalAccess={portalAccess}
          customer={portalAccess.customer}
          accessToken={params.token}
        />
      </main>

      <PortalFooter
        portalType="auto"
        branding={portalAccess.branding}
        organizationId={portalAccess.organization_id}
      />
    </div>
  );
}
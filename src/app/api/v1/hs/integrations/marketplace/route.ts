import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Integration marketplace query schema
const MarketplaceQuerySchema = z.object({
  category: z.enum([
    'all',
    'accounting',
    'payment',
    'crm',
    'marketing',
    'inventory',
    'calendar',
    'communication',
    'mapping',
    'weather',
    'background_check',
    'insurance',
    'parts_supplier',
    'dispatch',
    'mobile_app',
    'iot_device',
    'webhook'
  ]).default('all'),
  search: z.string().optional(),
  featured: z.boolean().optional(),
  installed: z.boolean().optional(),
  sort: z.enum(['name', 'popularity', 'rating', 'created_at', 'updated_at']).default('popularity'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Integration installation schema
const InstallationSchema = z.object({
  integration_template_id: z.string().uuid(),
  display_name: z.string().min(1).max(255).optional(),
  configuration: z.record(z.any()).optional(),
  auto_enable: z.boolean().default(false),
});

// Helper function to get user's organization
async function getUserOrganization(userId: string) {
  const { data: membership } = await supabase
    .from('user_mgmt.organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  return membership?.organization_id;
}

// Helper function to get integration marketplace data
async function getMarketplaceIntegrations() {
  // This would typically come from a database table or external service
  // For now, we'll return a comprehensive list of available integrations
  return [
    // Accounting Integrations
    {
      id: 'quickbooks-online',
      name: 'QuickBooks Online',
      provider: 'Intuit',
      category: 'accounting',
      description: 'Sync customers, invoices, and payments with QuickBooks Online',
      long_description: 'Connect your home services business with QuickBooks Online to automatically sync customer information, invoices, payments, and financial data. Eliminate duplicate data entry and keep your books up to date in real-time.',
      features: [
        'Automatic customer sync',
        'Invoice and payment integration',
        'Real-time financial reporting',
        'Tax preparation support',
        'Multi-location support'
      ],
      pricing: {
        type: 'subscription',
        monthly_cost: 29.99,
        setup_fee: 0,
        free_trial_days: 30,
      },
      rating: 4.8,
      total_ratings: 1234,
      installs: 15000,
      featured: true,
      logo_url: 'https://example.com/logos/quickbooks.png',
      screenshots: [
        'https://example.com/screenshots/qb-dashboard.png',
        'https://example.com/screenshots/qb-sync.png'
      ],
      configuration_fields: [
        {
          key: 'company_id',
          label: 'Company ID',
          type: 'text',
          required: true,
          description: 'Your QuickBooks Company ID'
        },
        {
          key: 'sync_frequency',
          label: 'Sync Frequency',
          type: 'select',
          options: [
            { value: 'real_time', label: 'Real-time' },
            { value: 'hourly', label: 'Every hour' },
            { value: 'daily', label: 'Daily' }
          ],
          default: 'hourly'
        }
      ],
      requirements: [
        'QuickBooks Online subscription',
        'Admin access to QuickBooks account',
        'Thorbis Pro plan or higher'
      ],
      supported_data_types: ['customers', 'invoices', 'payments', 'items', 'vendors'],
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },

    // Payment Processing
    {
      id: 'stripe-payments',
      name: 'Stripe',
      provider: 'Stripe, Inc.',
      category: 'payment',
      description: 'Accept online payments and process credit card transactions',
      long_description: 'Accept payments from customers using Stripe\'s secure payment processing. Support for credit cards, ACH, Apple Pay, Google Pay and more payment methods.',
      features: [
        'Credit card processing',
        'ACH bank transfers',
        'Apple Pay & Google Pay',
        'Recurring billing',
        'Fraud protection',
        'PCI compliance'
      ],
      pricing: {
        type: 'per_transaction',
        percentage: 2.9,
        fixed_fee: 0.30,
        monthly_cost: 0,
      },
      rating: 4.9,
      total_ratings: 2847,
      installs: 25000,
      featured: true,
      logo_url: 'https://example.com/logos/stripe.png',
      screenshots: [
        'https://example.com/screenshots/stripe-dashboard.png',
        'https://example.com/screenshots/stripe-checkout.png'
      ],
      configuration_fields: [
        {
          key: 'publishable_key',
          label: 'Publishable Key',
          type: 'text',
          required: true,
          description: 'Your Stripe publishable key'
        },
        {
          key: 'secret_key',
          label: 'Secret Key',
          type: 'password',
          required: true,
          description: 'Your Stripe secret key'
        },
        {
          key: 'webhook_endpoint',
          label: 'Webhook Endpoint',
          type: 'text',
          required: false,
          description: 'Webhook endpoint for payment notifications'
        }
      ],
      requirements: [
        'Stripe account',
        'Business verification completed',
        'SSL certificate on your domain'
      ],
      supported_data_types: ['payments', 'customers', 'subscriptions'],
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-11-25T00:00:00Z',
    },

    // CRM Integration
    {
      id: 'salesforce-crm',
      name: 'Salesforce',
      provider: 'Salesforce.com',
      category: 'crm',
      description: 'Sync customer data and sales opportunities with Salesforce',
      long_description: 'Connect with Salesforce to sync customer information, track sales opportunities, and manage your customer relationships across both platforms.',
      features: [
        'Customer data sync',
        'Lead management',
        'Opportunity tracking',
        'Activity logging',
        'Custom field mapping'
      ],
      pricing: {
        type: 'subscription',
        monthly_cost: 49.99,
        setup_fee: 99.00,
        free_trial_days: 14,
      },
      rating: 4.6,
      total_ratings: 892,
      installs: 8500,
      featured: false,
      logo_url: 'https://example.com/logos/salesforce.png',
      screenshots: [
        'https://example.com/screenshots/sf-integration.png'
      ],
      configuration_fields: [
        {
          key: 'instance_url',
          label: 'Salesforce Instance URL',
          type: 'url',
          required: true,
          description: 'Your Salesforce instance URL'
        },
        {
          key: 'api_version',
          label: 'API Version',
          type: 'select',
          options: [
            { value: '58.0', label: 'v58.0 (Latest)' },
            { value: '57.0', label: 'v57.0' },
            { value: '56.0', label: 'v56.0' }
          ],
          default: '58.0'
        }
      ],
      requirements: [
        'Salesforce Professional edition or higher',
        'API access enabled',
        'Connected App configured'
      ],
      supported_data_types: ['customers', 'leads', 'opportunities', 'activities'],
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-11-20T00:00:00Z',
    },

    // Marketing Automation
    {
      id: 'mailchimp-marketing',
      name: 'Mailchimp',
      provider: 'The Rocket Science Group',
      category: 'marketing',
      description: 'Email marketing and customer communication campaigns',
      long_description: 'Automate your email marketing with Mailchimp integration. Send targeted campaigns, track customer engagement, and grow your business with professional email marketing.',
      features: [
        'Email campaign automation',
        'Customer segmentation',
        'Performance analytics',
        'A/B testing',
        'Landing pages'
      ],
      pricing: {
        type: 'subscription',
        monthly_cost: 19.99,
        setup_fee: 0,
        free_trial_days: 30,
      },
      rating: 4.4,
      total_ratings: 567,
      installs: 12000,
      featured: true,
      logo_url: 'https://example.com/logos/mailchimp.png',
      screenshots: [
        'https://example.com/screenshots/mailchimp-campaigns.png'
      ],
      configuration_fields: [
        {
          key: 'api_key',
          label: 'API Key',
          type: 'password',
          required: true,
          description: 'Your Mailchimp API key'
        },
        {
          key: 'default_list_id',
          label: 'Default List ID',
          type: 'text',
          required: true,
          description: 'Default audience list ID for new subscribers'
        }
      ],
      requirements: [
        'Mailchimp account',
        'Audience list created',
        'API key generated'
      ],
      supported_data_types: ['customers', 'campaigns', 'subscribers'],
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-11-15T00:00:00Z',
    },

    // Google Maps Integration
    {
      id: 'google-maps',
      name: 'Google Maps',
      provider: 'Google',
      category: 'mapping',
      description: 'Route optimization and location services',
      long_description: 'Optimize technician routes, calculate travel times, and provide accurate location services using Google Maps integration.',
      features: [
        'Route optimization',
        'Real-time traffic data',
        'Geocoding services',
        'Distance calculations',
        'Street view integration'
      ],
      pricing: {
        type: 'pay_per_use',
        cost_per_1000_calls: 5.00,
        monthly_free_quota: 40000,
      },
      rating: 4.7,
      total_ratings: 1456,
      installs: 18000,
      featured: true,
      logo_url: 'https://example.com/logos/google-maps.png',
      screenshots: [
        'https://example.com/screenshots/maps-routing.png'
      ],
      configuration_fields: [
        {
          key: 'api_key',
          label: 'Google Maps API Key',
          type: 'password',
          required: true,
          description: 'Your Google Maps API key with required permissions'
        },
        {
          key: 'default_region',
          label: 'Default Region',
          type: 'text',
          required: false,
          description: 'Default region for geocoding (e.g., US, CA, GB)'
        }
      ],
      requirements: [
        'Google Cloud Console account',
        'Maps JavaScript API enabled',
        'Places API enabled',
        'Directions API enabled'
      ],
      supported_data_types: ['locations', 'routes', 'places'],
      created_at: '2024-01-25T00:00:00Z',
      updated_at: '2024-11-30T00:00:00Z',
    },

    // Inventory Management
    {
      id: 'parts-unlimited',
      name: 'Parts Unlimited',
      provider: 'Parts Unlimited Corp',
      category: 'parts_supplier',
      description: 'HVAC and plumbing parts ordering and inventory management',
      long_description: 'Connect with Parts Unlimited to streamline parts ordering, track inventory levels, and get real-time pricing for HVAC and plumbing supplies.',
      features: [
        'Real-time parts availability',
        'Automated ordering',
        'Pricing updates',
        'Order tracking',
        'Catalog integration'
      ],
      pricing: {
        type: 'subscription',
        monthly_cost: 39.99,
        setup_fee: 50.00,
        free_trial_days: 14,
      },
      rating: 4.3,
      total_ratings: 234,
      installs: 5500,
      featured: false,
      logo_url: 'https://example.com/logos/parts-unlimited.png',
      screenshots: [
        'https://example.com/screenshots/parts-catalog.png'
      ],
      configuration_fields: [
        {
          key: 'dealer_id',
          label: 'Dealer ID',
          type: 'text',
          required: true,
          description: 'Your Parts Unlimited dealer ID'
        },
        {
          key: 'branch_location',
          label: 'Branch Location',
          type: 'select',
          options: [
            { value: 'main', label: 'Main Branch' },
            { value: 'north', label: 'North Branch' },
            { value: 'south', label: 'South Branch' }
          ],
          required: true
        }
      ],
      requirements: [
        'Active Parts Unlimited dealer account',
        'Credit account established',
        'API access approved'
      ],
      supported_data_types: ['inventory', 'orders', 'pricing'],
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-11-10T00:00:00Z',
    },

    // Weather Service
    {
      id: 'weather-api',
      name: 'WeatherAPI',
      provider: 'WeatherAPI.com',
      category: 'weather',
      description: 'Real-time weather data for service scheduling',
      long_description: 'Get accurate weather forecasts to help schedule outdoor work, notify customers of weather delays, and optimize your service operations.',
      features: [
        'Current conditions',
        '14-day forecasts',
        'Weather alerts',
        'Historical data',
        'Air quality index'
      ],
      pricing: {
        type: 'subscription',
        monthly_cost: 9.99,
        setup_fee: 0,
        free_tier_available: true,
      },
      rating: 4.5,
      total_ratings: 445,
      installs: 9800,
      featured: false,
      logo_url: 'https://example.com/logos/weather-api.png',
      screenshots: [
        'https://example.com/screenshots/weather-dashboard.png'
      ],
      configuration_fields: [
        {
          key: 'api_key',
          label: 'API Key',
          type: 'password',
          required: true,
          description: 'Your WeatherAPI key'
        },
        {
          key: 'default_location',
          label: 'Default Location',
          type: 'text',
          required: false,
          description: 'Default location for weather data (e.g., "New York, NY")'
        }
      ],
      requirements: [
        'WeatherAPI account',
        'Valid API key'
      ],
      supported_data_types: ['weather', 'forecasts', 'alerts'],
      created_at: '2024-02-15T00:00:00Z',
      updated_at: '2024-11-05T00:00:00Z',
    }
  ];
}

// Helper function to filter and sort integrations
function filterAndSortIntegrations(integrations: unknown[], query: unknown) {
  let filtered = integrations;

  // Filter by category
  if (query.category !== 'all') {
    filtered = filtered.filter(integration => integration.category === query.category);
  }

  // Filter by search term
  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    filtered = filtered.filter(integration => 
      integration.name.toLowerCase().includes(searchTerm) ||
      integration.description.toLowerCase().includes(searchTerm) ||
      integration.provider.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by featured
  if (query.featured !== undefined) {
    filtered = filtered.filter(integration => integration.featured === query.featured);
  }

  // Sort integrations
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (query.sort) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'popularity':
        aValue = a.installs;
        bValue = b.installs;
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      default:
        return 0;
    }

    if (query.order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return filtered;
}

// GET /api/v1/hs/integrations/marketplace - Browse integration marketplace
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = MarketplaceQuerySchema.parse(Object.fromEntries(searchParams));

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Get marketplace integrations
    const allIntegrations = await getMarketplaceIntegrations();
    
    // Get installed integrations for this organization
    const { data: installedIntegrations } = await supabase
      .from('hs.integrations')
      .select('provider_name, integration_type, status')
      .eq('organization_id', organizationId);

    const installedMap = new Map();
    installedIntegrations?.forEach(integration => {
      const key = `${integration.provider_name}-${integration.integration_type}`;
      installedMap.set(key, integration.status);
    });

    // Filter integrations based on installation status
    let filteredIntegrations = allIntegrations;
    if (query.installed !== undefined) {
      if (query.installed) {
        filteredIntegrations = allIntegrations.filter(integration => {
          const key = `${integration.provider}-${integration.category}`;
          return installedMap.has(key);
        });
      } else {
        filteredIntegrations = allIntegrations.filter(integration => {
          const key = `${integration.provider}-${integration.category}';
          return !installedMap.has(key);
        });
      }
    }

    // Apply filters and sorting
    const processedIntegrations = filterAndSortIntegrations(filteredIntegrations, query);

    // Add installation status to each integration
    const integrationsWithStatus = processedIntegrations.map(integration => {
      const key = '${integration.provider}-${integration.category}';
      const installationStatus = installedMap.get(key);
      
      return {
        ...integration,
        installation_status: installationStatus ? {
          installed: true,
          status: installationStatus,
        } : {
          installed: false,
          status: null,
        },
      };
    });

    // Apply pagination
    const paginatedIntegrations = integrationsWithStatus.slice(
      query.offset,
      query.offset + query.limit
    );

    // Get categories and their counts
    const categoryStats = allIntegrations.reduce((acc, integration) => {
      acc[integration.category] = (acc[integration.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      integrations: paginatedIntegrations,
      pagination: {
        total: integrationsWithStatus.length,
        offset: query.offset,
        limit: query.limit,
        has_more: query.offset + query.limit < integrationsWithStatus.length,
      },
      categories: Object.entries(categoryStats).map(([name, count]) => ({
        name,
        count,
        display_name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      })),
      summary: {
        total_available: allIntegrations.length,
        total_installed: installedMap.size,
        featured_count: allIntegrations.filter(i => i.featured).length,
        average_rating: allIntegrations.reduce((sum, i) => sum + i.rating, 0) / allIntegrations.length,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/integrations/marketplace error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/hs/integrations/marketplace - Install integration from marketplace
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const installationData = InstallationSchema.parse(body);

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Get marketplace integrations
    const allIntegrations = await getMarketplaceIntegrations();
    const marketplaceIntegration = allIntegrations.find(integration => 
      integration.id === installationData.integration_template_id
    );

    if (!marketplaceIntegration) {
      return NextResponse.json(
        { error: 'Integration template not found in marketplace' },
        { status: 404 }
      );
    }

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from('hs.integrations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('provider_name', marketplaceIntegration.provider)
      .eq('integration_type', marketplaceIntegration.category)
      .single();

    if (existingIntegration) {
      return NextResponse.json(
        { error: 'Integration already installed' },
        { status: 409 }
      );
    }

    // Prepare integration configuration
    const integrationConfig = {
      ...(installationData.configuration || {}),
      // Add default configuration from marketplace template
      ...marketplaceIntegration.configuration_fields?.reduce((acc, field) => {
        if (field.default && !installationData.configuration?.[field.key]) {
          acc[field.key] = field.default;
        }
        return acc;
      }, {} as any),
    };

    // Create integration record
    const { data: integration, error } = await supabase
      .from('hs.integrations')
      .insert({
        integration_type: marketplaceIntegration.category,
        provider_name: marketplaceIntegration.provider,
        display_name: installationData.display_name || marketplaceIntegration.name,
        description: marketplaceIntegration.description,
        config: integrationConfig,
        status: installationData.auto_enable ? 'active' : 'pending',
        enabled: installationData.auto_enable,
        marketplace_id: marketplaceIntegration.id,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to install integration' },
        { status: 500 }
      );
    }

    // Log installation activity
    await supabase
      .from('hs.integration_activity_log')
      .insert({
        integration_id: integration.id,
        activity_type: 'integration_installed`,
        activity_description: `Integration installed from marketplace: ${marketplaceIntegration.name}`,
        metadata: {
          marketplace_id: marketplaceIntegration.id,
          template_name: marketplaceIntegration.name,
          auto_enabled: installationData.auto_enable,
        },
        organization_id: organizationId,
        created_by: user.id,
      });

    // Return integration details without sensitive config
    const sanitizedIntegration = {
      ...integration,
      config: undefined, // Don't expose configuration details
    };

    return NextResponse.json({
      integration: sanitizedIntegration,
      marketplace_template: {
        id: marketplaceIntegration.id,
        name: marketplaceIntegration.name,
        provider: marketplaceIntegration.provider,
        category: marketplaceIntegration.category,
      },
      message: '${marketplaceIntegration.name} installed successfully',
      next_steps: [
        'Configure integration settings',
        'Test connection',
        installationData.auto_enable ? 'Integration is active' : 'Enable integration when ready',
      ],
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/integrations/marketplace error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid installation request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
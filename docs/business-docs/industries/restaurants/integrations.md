# Restaurant Integrations Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Audience**: Technical teams, restaurant managers, integration specialists  

## Overview

This comprehensive integration guide covers all third-party systems and external services that can be integrated with the Thorbis Restaurant Management System. It provides detailed setup instructions, API configurations, and best practices for maintaining seamless data flow between the restaurant operations and external platforms.

## Table of Contents

1. [Payment Processing Integrations](#payment-processing-integrations)
2. [Food Delivery Platform Integrations](#food-delivery-platform-integrations)
3. [Reservation System Integrations](#reservation-system-integrations)
4. [Accounting and Financial Integrations](#accounting-and-financial-integrations)
5. [Inventory and Supplier Integrations](#inventory-and-supplier-integrations)
6. [Marketing and Customer Engagement](#marketing-and-customer-engagement)
7. [Kitchen Equipment Integrations](#kitchen-equipment-integrations)
8. [Analytics and Business Intelligence](#analytics-and-business-intelligence)
9. [Compliance and Reporting Systems](#compliance-and-reporting-systems)
10. [Integration Monitoring and Maintenance](#integration-monitoring-and-maintenance)

## Payment Processing Integrations

### Stripe Payment Processing
```typescript
interface StripeIntegration {
  configuration: {
    environment: 'live' | 'test',
    publishableKey: 'pk_live_...' | 'pk_test_...',
    secretKey: 'sk_live_...' | 'sk_test_...',
    webhookSecret: 'whsec_...',
    terminalLocationId: 'tml_...'
  },
  
  features: {
    cardPresent: 'EMV chip and contactless payments',
    digitalWallets: 'Apple Pay, Google Pay, Samsung Pay',
    onlinePayments: 'Online ordering and delivery payments',
    subscriptions: 'Recurring billing for loyalty programs',
    connect: 'Multi-location payment splitting'
  },
  
  webhookEvents: [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'charge.dispute.created',
    'terminal.reader.action_failed',
    'invoice.payment_succeeded'
  ]
}
```

#### Stripe Terminal Setup
```bash
# Stripe Terminal Configuration for Restaurant
setup_stripe_terminal() {
  echo "Setting up Stripe Terminal integration..."
  
  # Create location for restaurant
  create_terminal_location() {
    curl -X POST "https://api.stripe.com/v1/terminal/locations" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
      -d "display_name=$RESTAURANT_NAME" \
      -d "address[line1]=$RESTAURANT_ADDRESS" \
      -d "address[city]=$RESTAURANT_CITY" \
      -d "address[state]=$RESTAURANT_STATE" \
      -d "address[postal_code]=$RESTAURANT_ZIP" \
      -d "address[country]=US"
  }
  
  # Register payment terminals
  register_terminals() {
    # Front counter terminal
    curl -X POST "https://api.stripe.com/v1/terminal/readers" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
      -d "registration_code=$READER_REGISTRATION_CODE" \
      -d "label=Front Counter POS" \
      -d "location=$TERMINAL_LOCATION_ID"
    
    # Table service terminals
    for i in {1..4}; do
      curl -X POST "https://api.stripe.com/v1/terminal/readers" \
        -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
        -d "registration_code=${READER_CODE_$i}" \
        -d "label=Server Station $i" \
        -d "location=$TERMINAL_LOCATION_ID"
    done
  }
  
  # Configure webhook endpoints
  setup_webhooks() {
    curl -X POST "https://api.stripe.com/v1/webhook_endpoints" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
      -d "url=https://api.thorbis.com/webhooks/stripe" \
      -d "enabled_events[]=payment_intent.succeeded" \
      -d "enabled_events[]=payment_intent.payment_failed" \
      -d "enabled_events[]=terminal.reader.action_failed"
  }
  
  create_terminal_location
  register_terminals
  setup_webhooks
}
```

### Square Payment Integration
```typescript
interface SquareIntegration {
  configuration: {
    applicationId: string,
    accessToken: string,
    locationId: string,
    environment: 'sandbox' | 'production'
  },
  
  capabilities: {
    inPersonPayments: 'Square Terminal and readers',
    onlinePayments: 'Web-based payment processing',
    invoicing: 'Digital invoice generation and payment',
    recurringPayments: 'Subscription and recurring billing',
    customerDirectory: 'Customer management and profiles'
  }
}
```

## Food Delivery Platform Integrations

### Uber Eats Integration
```typescript
interface UberEatsIntegration {
  apiConfiguration: {
    baseUrl: 'https://api.uber.com',
    clientId: string,
    clientSecret: string,
    storeId: string,
    scope: ['eats.store', 'eats.orders', 'eats.menu']
  },
  
  menuSynchronization: {
    endpoint: '/v2/eats/stores/{store-id}/menus',
    syncFrequency: 'Real-time with webhook triggers',
    itemMapping: 'Automatic SKU and price synchronization',
    modifierSupport: 'Custom modifications and add-ons',
    availabilityControl: 'Real-time item availability updates'
  },
  
  orderManagement: {
    inboundOrders: 'Webhook-based order receipt',
    statusUpdates: 'Real-time preparation and delivery updates',
    cancellationHandling: 'Automated cancellation processing',
    refundProcessing: 'Integration with payment systems'
  }
}
```

#### Uber Eats Setup Configuration
```bash
# Uber Eats Integration Setup
setup_uber_eats() {
  echo "Configuring Uber Eats integration..."
  
  # Configure OAuth authentication
  setup_uber_oauth() {
    # Exchange authorization code for access token
    curl -X POST "https://login.uber.com/oauth/v2/token" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "grant_type=authorization_code" \
      -d "code=$AUTHORIZATION_CODE" \
      -d "client_id=$UBER_CLIENT_ID" \
      -d "client_secret=$UBER_CLIENT_SECRET" \
      -d "redirect_uri=$REDIRECT_URI"
  }
  
  # Sync menu with Uber Eats
  sync_menu_to_uber() {
    # Create menu structure
    curl -X POST "https://api.uber.com/v2/eats/stores/$STORE_ID/menus" \
      -H "Authorization: Bearer $UBER_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "menus": [{
          "title": {"translations": {"en-US": "Main Menu"}},
          "subtitle": {"translations": {"en-US": "Our signature dishes"}},
          "menu_sections": [
            {
              "title": {"translations": {"en-US": "Appetizers"}},
              "items": [
                {
                  "title": {"translations": {"en-US": "Caesar Salad"}},
                  "description": {"translations": {"en-US": "Fresh romaine, parmesan, croutons"}},
                  "price": 1299,
                  "external_id": "item_caesar_salad"
                }
              ]
            }
          ]
        }]
      }'
  }
  
  # Configure webhooks for order notifications
  setup_uber_webhooks() {
    curl -X POST "https://api.uber.com/v2/eats/stores/$STORE_ID/webhook" \
      -H "Authorization: Bearer $UBER_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "url": "https://api.thorbis.com/webhooks/uber-eats",
        "events": ["order.created", "order.cancelled", "order.delivered"]
      }'
  }
  
  setup_uber_oauth
  sync_menu_to_uber
  setup_uber_webhooks
}
```

### DoorDash Integration
```typescript
interface DoorDashIntegration {
  apiConfiguration: {
    baseUrl: 'https://openapi.doordash.com',
    developerId: string,
    keyId: string,
    signingSecret: string,
    storeId: string
  },
  
  orderProcessing: {
    webhookEndpoint: '/webhooks/doordash',
    supportedEvents: [
      'order_created',
      'order_confirmed',
      'order_cancelled',
      'delivery_status_update'
    ],
    responseTimeRequirement: 'Must acknowledge within 30 seconds'
  }
}
```

### Grubhub Integration
```bash
# Grubhub API Integration Setup
setup_grubhub_integration() {
  echo "Setting up Grubhub integration..."
  
  # Configure API credentials
  configure_grubhub_api() {
    # Store API credentials securely
    supabase exec sql --query "
      INSERT INTO integration_settings (business_id, provider, settings, created_at)
      VALUES ('$BUSINESS_ID', 'grubhub', jsonb_build_object(
        'client_id', '$GRUBHUB_CLIENT_ID',
        'client_secret', '$GRUBHUB_CLIENT_SECRET',
        'restaurant_id', '$GRUBHUB_RESTAURANT_ID',
        'webhook_url', 'https://api.thorbis.com/webhooks/grubhub',
        'menu_sync_enabled', true,
        'inventory_sync_enabled', true
      ), NOW())
      ON CONFLICT (business_id, provider) DO UPDATE SET
        settings = EXCLUDED.settings,
        updated_at = NOW();
    "
  }
  
  # Set up order processing webhook
  setup_grubhub_webhook() {
    curl -X POST "$GRUBHUB_API_BASE/webhooks" \
      -H "Authorization: Bearer $GRUBHUB_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "url": "https://api.thorbis.com/webhooks/grubhub",
        "events": ["order.placed", "order.cancelled", "order.updated"],
        "restaurant_id": "'$GRUBHUB_RESTAURANT_ID'"
      }'
  }
  
  configure_grubhub_api
  setup_grubhub_webhook
}
```

## Reservation System Integrations

### OpenTable Integration
```typescript
interface OpenTableIntegration {
  configuration: {
    restaurantId: string,
    apiKey: string,
    environment: 'sandbox' | 'production',
    baseUrl: 'https://platform.opentable.com'
  },
  
  reservationSync: {
    inboundReservations: 'Real-time reservation notifications',
    availabilityUpdates: 'Table availability synchronization',
    customerData: 'Guest information and preferences',
    waitlistIntegration: 'Seamless waitlist to table conversion'
  },
  
  tableManagement: {
    realTimeUpdates: 'Live table status synchronization',
    partySeating: 'Automatic party size optimization',
    specialRequests: 'Dietary and seating preference handling',
    noShowTracking: 'No-show and cancellation management'
  }
}
```

### Resy Integration
```bash
# Resy Reservation System Integration
setup_resy_integration() {
  echo "Configuring Resy integration..."
  
  # Configure reservation synchronization
  setup_resy_sync() {
    # Create webhook endpoint for Resy notifications
    curl -X POST "https://api.resy.com/3/venue/$RESY_VENUE_ID/webhook" \
      -H "Authorization: ResyAPI api_key=\"$RESY_API_KEY\"" \
      -H "Content-Type: application/json" \
      -d '{
        "url": "https://api.thorbis.com/webhooks/resy",
        "events": ["reservation.created", "reservation.modified", "reservation.cancelled"]
      }'
  }
  
  # Sync table availability
  sync_table_availability() {
    # Update Resy with current table availability
    current_date=$(date -u +"%Y-%m-%d")
    
    curl -X POST "https://api.resy.com/3/venue/$RESY_VENUE_ID/availability" \
      -H "Authorization: ResyAPI api_key=\"$RESY_API_KEY\"" \
      -H "Content-Type: application/json" \
      -d '{
        "date": "'$current_date'",
        "availability": [
          {"time": "17:00", "party_size": 2, "tables_available": 8},
          {"time": "18:00", "party_size": 2, "tables_available": 12},
          {"time": "19:00", "party_size": 2, "tables_available": 6}
        ]
      }'
  }
  
  setup_resy_sync
  sync_table_availability
}
```

## Accounting and Financial Integrations

### QuickBooks Integration
```typescript
interface QuickBooksIntegration {
  configuration: {
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    companyId: string,
    environment: 'sandbox' | 'production'
  },
  
  syncCapabilities: {
    salesData: 'Daily sales summary and transaction details',
    customerData: 'Customer profiles and contact information',
    inventoryItems: 'Menu items and inventory synchronization',
    accountsReceivable: 'Outstanding customer balances',
    taxReporting: 'Sales tax collection and remittance',
    payrollIntegration: 'Staff hours and payroll data'
  },
  
  automatedWorkflows: {
    dailySalesSync: 'Automatic end-of-day sales journal entries',
    customerInvoicing: 'Automated invoice generation for corporate accounts',
    expenseTracking: 'Vendor invoice processing and approval',
    financialReporting: 'Automated P&L and cash flow statements'
  }
}
```

#### QuickBooks Setup Process
```bash
# QuickBooks Integration Configuration
setup_quickbooks_integration() {
  echo "Setting up QuickBooks integration..."
  
  # OAuth 2.0 authentication flow
  authenticate_quickbooks() {
    # Redirect user to QuickBooks authorization
    auth_url="https://appcenter.intuit.com/connect/oauth2"
    auth_params="client_id=$QB_CLIENT_ID&scope=com.intuit.quickbooks.accounting&redirect_uri=$QB_REDIRECT_URI&response_type=code"
    
    echo "Please visit: $auth_url?$auth_params"
    echo "Enter authorization code:"
    read -r auth_code
    
    # Exchange code for access token
    curl -X POST "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -H "Authorization: Basic $(echo -n $QB_CLIENT_ID:$QB_CLIENT_SECRET | base64)" \
      -d "grant_type=authorization_code&code=$auth_code&redirect_uri=$QB_REDIRECT_URI"
  }
  
  # Set up chart of accounts for restaurant
  setup_restaurant_accounts() {
    # Create restaurant-specific accounts
    curl -X POST "$QB_BASE_URL/v3/company/$QB_COMPANY_ID/account" \
      -H "Authorization: Bearer $QB_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "FullyQualifiedName": "Food Sales",
        "Name": "Food Sales", 
        "AccountType": "Income",
        "AccountSubType": "SalesOfProductIncome"
      }'
    
    curl -X POST "$QB_BASE_URL/v3/company/$QB_COMPANY_ID/account" \
      -H "Authorization: Bearer $QB_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "FullyQualifiedName": "Beverage Sales",
        "Name": "Beverage Sales",
        "AccountType": "Income", 
        "AccountSubType": "SalesOfProductIncome"
      }'
  }
  
  # Configure automated daily sync
  setup_automated_sync() {
    # Create cron job for daily sales sync
    echo "0 1 * * * /usr/local/bin/sync_sales_to_quickbooks.sh" | crontab -
  }
  
  authenticate_quickbooks
  setup_restaurant_accounts
  setup_automated_sync
}
```

### Xero Integration
```typescript
interface XeroIntegration {
  configuration: {
    clientId: string,
    clientSecret: string,
    tenantId: string,
    scopes: ['accounting.transactions', 'accounting.contacts', 'accounting.reports.read']
  },
  
  dataSynchronization: {
    salesTransactions: 'Real-time sales data synchronization',
    bankReconciliation: 'Automated bank feed matching',
    invoiceManagement: 'Customer invoice generation and tracking',
    purchaseOrders: 'Supplier purchase order management',
    stockTracking: 'Inventory valuation and cost tracking'
  }
}
```

## Inventory and Supplier Integrations

### Sysco Integration
```typescript
interface SyscoIntegration {
  configuration: {
    customerId: string,
    apiKey: string,
    facilityCode: string,
    environment: 'production'
  },
  
  orderingCapabilities: {
    productCatalog: 'Access to full Sysco product catalog',
    pricingAccess: 'Customer-specific pricing and contracts',
    orderPlacement: 'Automated order generation based on inventory levels',
    orderTracking: 'Real-time order status and delivery tracking',
    invoiceProcessing: 'Electronic invoice receipt and processing'
  },
  
  inventoryIntegration: {
    catalogSync: 'Automatic product catalog synchronization',
    priceUpdates: 'Real-time pricing updates',
    availabilityCheck: 'Product availability verification',
    substituteRecommendations: 'Alternative product suggestions'
  }
}
```

#### Sysco Integration Setup
```bash
# Sysco Supplier Integration
setup_sysco_integration() {
  echo "Setting up Sysco supplier integration..."
  
  # Configure Sysco API credentials
  configure_sysco_api() {
    supabase exec sql --query "
      INSERT INTO supplier_integrations (business_id, supplier_name, settings, created_at)
      VALUES ('$BUSINESS_ID', 'sysco', jsonb_build_object(
        'customer_id', '$SYSCO_CUSTOMER_ID',
        'api_key', '$SYSCO_API_KEY',
        'facility_code', '$SYSCO_FACILITY_CODE',
        'default_delivery_address', '$RESTAURANT_ADDRESS',
        'order_cutoff_time', '14:00',
        'preferred_delivery_window', 'morning',
        'auto_ordering_enabled', true
      ), NOW())
      ON CONFLICT (business_id, supplier_name) DO UPDATE SET
        settings = EXCLUDED.settings,
        updated_at = NOW();
    "
  }
  
  # Set up automated ordering based on par levels
  setup_automated_ordering() {
    # Create stored procedure for automatic order generation
    supabase exec sql --query "
      CREATE OR REPLACE FUNCTION generate_sysco_order()
      RETURNS JSON AS \$\$
      DECLARE
        order_items JSON;
      BEGIN
        SELECT json_agg(
          json_build_object(
            'product_id', si.sysco_product_id,
            'quantity', ii.reorder_quantity,
            'unit', ii.unit_of_measure
          )
        ) INTO order_items
        FROM inventory_items ii
        JOIN supplier_items si ON ii.id = si.inventory_item_id
        WHERE ii.business_id = '$BUSINESS_ID'
        AND ii.current_quantity <= ii.reorder_point
        AND si.supplier_name = 'sysco';
        
        RETURN order_items;
      END;
      \$\$ LANGUAGE plpgsql;
    "
  }
  
  # Configure delivery scheduling
  setup_delivery_schedule() {
    # Set up preferred delivery times
    curl -X POST "$SYSCO_API_BASE/delivery-schedule" \
      -H "Authorization: Bearer $SYSCO_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "customer_id": "'$SYSCO_CUSTOMER_ID'",
        "delivery_preferences": {
          "monday": {"preferred_time": "08:00-10:00", "alternate_time": "10:00-12:00"},
          "wednesday": {"preferred_time": "08:00-10:00", "alternate_time": "10:00-12:00"},
          "friday": {"preferred_time": "08:00-10:00", "alternate_time": "10:00-12:00"}
        },
        "special_instructions": "Deliver to rear loading dock. Ring bell for receiving."
      }'
  }
  
  configure_sysco_api
  setup_automated_ordering
  setup_delivery_schedule
}
```

### US Foods Integration
```bash
# US Foods Integration Setup
setup_usfoods_integration() {
  echo "Configuring US Foods integration..."
  
  # Set up EDI connection for orders and invoices
  setup_edi_connection() {
    # Configure EDI parameters
    supabase exec sql --query "
      INSERT INTO edi_connections (business_id, supplier, connection_type, settings, created_at)
      VALUES ('$BUSINESS_ID', 'us_foods', 'SFTP', jsonb_build_object(
        'host', 'edi.usfoods.com',
        'username', '$USFOODS_EDI_USERNAME',
        'password', '$USFOODS_EDI_PASSWORD',
        'customer_number', '$USFOODS_CUSTOMER_NUMBER',
        'order_path', '/outbound/orders/',
        'invoice_path', '/inbound/invoices/',
        'catalog_path', '/inbound/catalog/'
      ), NOW());
    "
  }
  
  # Set up automated catalog updates
  setup_catalog_sync() {
    # Create script for daily catalog synchronization
    cat > /usr/local/bin/sync_usfoods_catalog.sh << 'EOF'
#!/bin/bash
# US Foods catalog synchronization
sftp $USFOODS_EDI_USERNAME@edi.usfoods.com << 'SFTP_EOF'
cd /inbound/catalog/
get catalog_update_*.csv /tmp/
quit
SFTP_EOF

# Process catalog updates
python3 /opt/thorbis/scripts/process_usfoods_catalog.py /tmp/catalog_update_*.csv
EOF
    
    chmod +x /usr/local/bin/sync_usfoods_catalog.sh
    echo "0 2 * * * /usr/local/bin/sync_usfoods_catalog.sh" | crontab -
  }
  
  setup_edi_connection
  setup_catalog_sync
}
```

## Marketing and Customer Engagement

### Mailchimp Integration
```typescript
interface MailchimpIntegration {
  configuration: {
    apiKey: string,
    dataCenter: string,
    listId: string,
    serverPrefix: string
  },
  
  customerSegmentation: {
    frequentDiners: 'Customers with 10+ visits in 90 days',
    newCustomers: 'First-time diners in last 30 days',
    lapsedCustomers: 'No visits in 6+ months',
    highValueCustomers: 'Top 20% by spend',
    birthdayClub: 'Customers with upcoming birthdays'
  },
  
  campaignTypes: {
    welcomeSeries: 'New customer onboarding emails',
    loyaltyRewards: 'Points balance and reward notifications',
    eventPromotions: 'Special event and holiday campaigns',
    menuUpdates: 'New menu item announcements',
    winbackCampaigns: 'Re-engagement for inactive customers'
  }
}
```

#### Mailchimp Customer Sync
```bash
# Mailchimp Customer Synchronization
setup_mailchimp_sync() {
  echo "Setting up Mailchimp customer synchronization..."
  
  # Create customer segments in Mailchimp
  create_customer_segments() {
    # Frequent diners segment
    curl -X POST "https://$MC_DATA_CENTER.api.mailchimp.com/3.0/lists/$MC_LIST_ID/segments" \
      -H "Authorization: Bearer $MC_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Frequent Diners",
        "static_segment": [],
        "options": {
          "match": "any",
          "conditions": [{
            "condition_type": "TextMerge",
            "field": "VISITS_90_DAYS",
            "op": "greater",
            "value": "10"
          }]
        }
      }'
  }
  
  # Sync customer data to Mailchimp
  sync_customers_to_mailchimp() {
    # Extract customer data for sync
    supabase exec sql --query "
      SELECT 
        email_address,
        first_name,
        last_name,
        phone_number,
        total_visits,
        total_spent,
        last_visit_date,
        birth_date,
        CASE WHEN total_visits >= 10 THEN 'VIP' ELSE 'Regular' END as customer_tier
      FROM customers 
      WHERE business_id = '$BUSINESS_ID'
      AND email_address IS NOT NULL
      AND marketing_consent = true
    " --csv > /tmp/customer_export.csv
    
    # Process and upload to Mailchimp
    python3 << 'EOF'
import csv
import requests
import json

MC_API_KEY = os.environ['MC_API_KEY']
MC_DATA_CENTER = os.environ['MC_DATA_CENTER'] 
MC_LIST_ID = os.environ['MC_LIST_ID']

with open('/tmp/customer_export.csv', 'r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        member_data = {
            "email_address": row['email_address'],
            "status": "subscribed",
            "merge_fields": {
                "FNAME": row['first_name'],
                "LNAME": row['last_name'],
                "PHONE": row['phone_number'],
                "VISITS": row['total_visits'],
                "TOTAL_SPENT": row['total_spent'],
                "LAST_VISIT": row['last_visit_date'],
                "BIRTHDAY": row['birth_date'],
                "TIER": row['customer_tier']
            }
        }
        
        response = requests.put(
            f"https://{MC_DATA_CENTER}.api.mailchimp.com/3.0/lists/{MC_LIST_ID}/members/{row['email_address']}",
            headers={"Authorization": f"Bearer {MC_API_KEY}"},
            json=member_data
        )
EOF
  }
  
  create_customer_segments
  sync_customers_to_mailchimp
}
```

### SMS Marketing Integration (Twilio)
```typescript
interface TwilioSMSIntegration {
  configuration: {
    accountSid: string,
    authToken: string,
    phoneNumber: string,
    messagingServiceSid: string
  },
  
  automatedCampaigns: {
    orderConfirmations: 'SMS confirmation for takeout/delivery orders',
    promotionalOffers: 'Limited-time offers and specials',
    reservationReminders: '24-hour reservation confirmations',
    loyaltyUpdates: 'Points earned and rewards available',
    waitlistNotifications: 'Table ready notifications'
  },
  
  complianceFeatures: {
    optInManagement: 'TCPA-compliant opt-in tracking',
    optOutProcessing: 'Automatic STOP keyword processing',
    consentRecords: 'Detailed consent audit trail',
    messageRateLimit: 'Configurable sending rate limits'
  }
}
```

## Kitchen Equipment Integrations

### Kitchen Display System Integration
```typescript
interface KitchenDisplayIntegration {
  supportedSystems: {
    redElephant: 'Red Elephant Kitchen Display Systems',
    freshTechnologies: 'Fresh KDS Solutions',
    kioskBuddy: 'KioskBuddy Kitchen Displays',
    customBuilt: 'Custom kitchen display implementations'
  },
  
  integrationMethods: {
    apiIntegration: 'RESTful API for real-time order transmission',
    webSocketStreaming: 'Live order updates and status changes',
    emailIntegration: 'Email-based order delivery for legacy systems',
    printFallback: 'Backup ticket printing for system failures'
  },
  
  orderDataMapping: {
    orderNumber: 'Unique order identifier',
    timestamp: 'Order received time',
    items: 'Menu items with quantities and modifications',
    specialInstructions: 'Customer dietary restrictions and requests',
    kitchenNotes: 'Internal preparation notes',
    timingRequirements: 'Rush orders and delivery deadlines'
  }
}
```

#### KDS Integration Setup
```bash
# Kitchen Display System Integration
setup_kds_integration() {
  echo "Setting up Kitchen Display System integration..."
  
  # Configure KDS endpoints
  configure_kds_endpoints() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS kds_endpoints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        endpoint_name VARCHAR(255) NOT NULL,
        endpoint_url TEXT NOT NULL,
        api_key TEXT,
        station_mapping JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      INSERT INTO kds_endpoints (business_id, endpoint_name, endpoint_url, station_mapping)
      VALUES (
        '$BUSINESS_ID',
        'Hot Line Display',
        'http://192.168.1.100:8080/api/orders',
        jsonb_build_object(
          'grill', 'GRILL_STATION',
          'fryer', 'FRY_STATION', 
          'saute', 'SAUTE_STATION',
          'expedite', 'EXPO_STATION'
        )
      );
    "
  }
  
  # Set up real-time order transmission
  setup_order_transmission() {
    # Create order webhook for KDS
    curl -X POST "$KDS_API_URL/webhook" \
      -H "Authorization: Bearer $KDS_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "webhook_url": "https://api.thorbis.com/webhooks/kds-status",
        "events": ["order_started", "order_completed", "order_cancelled"],
        "signature_secret": "'$KDS_WEBHOOK_SECRET'"
      }'
  }
  
  # Configure order formatting for KDS
  setup_order_formatting() {
    supabase exec function create format_order_for_kds << 'EOF'
CREATE OR REPLACE FUNCTION format_order_for_kds(order_id UUID)
RETURNS JSON AS $$
DECLARE
  order_data JSON;
  formatted_order JSON;
BEGIN
  -- Get order details
  SELECT json_build_object(
    'order_number', order_number,
    'table_number', COALESCE(rt.table_number, 'TAKEOUT'),
    'timestamp', ordered_at,
    'items', order_items,
    'special_instructions', special_instructions,
    'allergies', allergies
  ) INTO order_data
  FROM restaurant_orders ro
  LEFT JOIN table_sessions ts ON ro.table_session_id = ts.id
  LEFT JOIN restaurant_tables rt ON ts.table_id = rt.id
  WHERE ro.id = order_id;
  
  -- Format for KDS consumption
  SELECT json_build_object(
    'order_id', order_data->>'order_number',
    'table', order_data->>'table_number',
    'timestamp', order_data->>'timestamp',
    'items', order_data->'items',
    'notes', COALESCE(order_data->>'special_instructions', '') ||
             CASE WHEN order_data->>'allergies' IS NOT NULL 
                  THEN E'\nALLERGIES: ' || order_data->>'allergies'
                  ELSE '' END
  ) INTO formatted_order;
  
  RETURN formatted_order;
END;
$$ LANGUAGE plpgsql;
EOF
  }
  
  configure_kds_endpoints
  setup_order_transmission
  setup_order_formatting
}
```

### Inventory Management Equipment
```bash
# Smart Scale and Inventory Equipment Integration
setup_inventory_equipment() {
  echo "Setting up inventory management equipment..."
  
  # Configure smart scales
  setup_smart_scales() {
    # Cardinal Scale Manufacturing integration
    supabase exec sql --query "
      INSERT INTO equipment_integrations (business_id, equipment_type, settings, created_at)
      VALUES ('$BUSINESS_ID', 'smart_scale', jsonb_build_object(
        'manufacturer', 'Cardinal Scale',
        'model', 'DIGI DC-788',
        'ip_address', '192.168.1.50',
        'port', 4001,
        'units', 'pounds',
        'precision', 0.01,
        'auto_tare', true
      ), NOW());
    "
    
    # Set up scale data collection
    python3 << 'EOF'
import socket
import json
import psycopg2

def read_scale_data():
    scale_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    scale_socket.connect(('192.168.1.50', 4001))
    
    while True:
        data = scale_socket.recv(1024).decode('utf-8')
        weight = float(data.strip())
        
        # Log weight reading to database
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        cur.execute("""
          INSERT INTO inventory_readings (business_id, equipment_id, reading_type, value, timestamp)
          VALUES (%s, %s, 'weight', %s, NOW())
        """, (business_id, 'smart_scale_01', weight))
        conn.commit()
        conn.close()
        
        time.sleep(5)

read_scale_data()
EOF
  }
  
  # Configure temperature monitoring
  setup_temperature_monitoring() {
    # SensoScientific wireless temperature sensors
    curl -X POST "https://api.sensoscientific.com/webhook" \
      -H "Authorization: Bearer $SENSOSCIENTIFIC_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "webhook_url": "https://api.thorbis.com/webhooks/temperature",
        "events": ["temperature_alert", "temperature_reading"],
        "locations": ["walk_in_cooler", "walk_in_freezer", "prep_cooler"]
      }'
  }
  
  setup_smart_scales
  setup_temperature_monitoring
}
```

## Analytics and Business Intelligence

### Google Analytics Integration
```typescript
interface GoogleAnalyticsIntegration {
  configuration: {
    propertyId: string,
    measurementId: string,
    apiSecret: string,
    streamId: string
  },
  
  customEvents: {
    orderCompleted: {
      eventName: 'order_completed',
      parameters: ['order_value', 'item_count', 'customer_type', 'payment_method']
    },
    menuItemViewed: {
      eventName: 'menu_item_viewed',
      parameters: ['item_name', 'category', 'price', 'availability']
    },
    reservationMade: {
      eventName: 'reservation_made',
      parameters: ['party_size', 'reservation_time', 'table_type']
    }
  },
  
  ecommerceTracking: {
    purchaseEvents: 'Track completed orders as purchases',
    itemDetails: 'Individual menu items with categories',
    revenueTracking: 'Daily, weekly, monthly revenue analysis',
    customerLifetimeValue: 'CLV calculation and segmentation'
  }
}
```

### Business Intelligence Dashboard
```bash
# Business Intelligence Integration Setup
setup_bi_integration() {
  echo "Setting up business intelligence integrations..."
  
  # Configure Tableau integration
  setup_tableau_integration() {
    # Create Tableau data extracts
    supabase exec sql --query "
      CREATE VIEW tableau_sales_summary AS
      SELECT 
        DATE(ordered_at) as order_date,
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(DISTINCT customer_id) as unique_customers,
        SUM(CASE WHEN order_type = 'dine_in' THEN total_amount ELSE 0 END) as dine_in_revenue,
        SUM(CASE WHEN order_type = 'takeout' THEN total_amount ELSE 0 END) as takeout_revenue,
        SUM(CASE WHEN order_type = 'delivery' THEN total_amount ELSE 0 END) as delivery_revenue
      FROM restaurant_orders
      WHERE business_id = '$BUSINESS_ID'
      GROUP BY DATE(ordered_at)
      ORDER BY order_date DESC;
    "
  }
  
  # Configure Power BI integration  
  setup_powerbi_integration() {
    # Create Power BI streaming dataset
    curl -X POST "https://api.powerbi.com/v1.0/myorg/groups/$POWERBI_WORKSPACE_ID/datasets" \
      -H "Authorization: Bearer $POWERBI_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Restaurant Operations Dashboard",
        "defaultMode": "Streaming",
        "tables": [{
          "name": "SalesData",
          "columns": [
            {"name": "timestamp", "dataType": "DateTime"},
            {"name": "order_value", "dataType": "Double"},
            {"name": "order_type", "dataType": "String"},
            {"name": "customer_type", "dataType": "String"},
            {"name": "server_name", "dataType": "String"}
          ]
        }]
      }'
  }
  
  setup_tableau_integration
  setup_powerbi_integration
}
```

## Compliance and Reporting Systems

### Health Department Compliance
```typescript
interface HealthDepartmentCompliance {
  temperatureLogging: {
    requirements: 'Automated temperature logging every 15 minutes',
    equipment: 'Calibrated digital thermometers with data logging',
    alerts: 'Immediate alerts for temperature excursions',
    reporting: 'Monthly temperature log submissions'
  },
  
  foodSafetyTracking: {
    certificationManagement: 'Staff food safety certification tracking',
    inspectionPreparation: 'Health inspection readiness checklists',
    correctedActions: 'Documentation of corrective actions taken',
    trainingRecords: 'Food safety training completion records'
  },
  
  hackingCompliance: {
    hazardAnalysis: 'Critical control point identification',
    monitoringProcedures: 'CCP monitoring and verification',
    recordKeeping: 'HACCP plan documentation and updates',
    validation: 'Annual HACCP plan review and validation'
  }
}
```

### Labor Law Compliance
```bash
# Labor Law Compliance Integration
setup_labor_compliance() {
  echo "Setting up labor law compliance tracking..."
  
  # Configure wage and hour tracking
  setup_wage_hour_tracking() {
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS labor_compliance_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        employee_id UUID NOT NULL REFERENCES user_profiles(id),
        
        -- Time tracking
        clock_in_time TIMESTAMPTZ,
        clock_out_time TIMESTAMPTZ,
        break_start_time TIMESTAMPTZ,
        break_end_time TIMESTAMPTZ,
        
        -- Wage information
        hourly_rate DECIMAL(10,2),
        regular_hours DECIMAL(5,2),
        overtime_hours DECIMAL(5,2),
        total_wages DECIMAL(10,2),
        
        -- Compliance tracking
        meal_break_provided BOOLEAN DEFAULT false,
        rest_break_provided BOOLEAN DEFAULT false,
        
        shift_date DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_labor_compliance_employee_date 
      ON labor_compliance_log(employee_id, shift_date);
    "
  }
  
  # Set up break requirement monitoring
  setup_break_monitoring() {
    # Create function to check break compliance
    supabase exec function create check_break_compliance << 'EOF'
CREATE OR REPLACE FUNCTION check_break_compliance()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if meal break is required (> 5 hours)
  IF EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600 > 5 THEN
    IF NEW.meal_break_provided = false THEN
      INSERT INTO compliance_violations (
        business_id, employee_id, violation_type, violation_date, description
      ) VALUES (
        NEW.business_id, NEW.employee_id, 'meal_break_violation', NEW.shift_date,
        'Employee worked more than 5 hours without meal break'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
EOF
    
    # Create trigger for break compliance checking
    supabase exec sql --query "
      CREATE TRIGGER trigger_check_break_compliance
        AFTER INSERT OR UPDATE ON labor_compliance_log
        FOR EACH ROW EXECUTE FUNCTION check_break_compliance();
    "
  }
  
  setup_wage_hour_tracking
  setup_break_monitoring
}
```

## Integration Monitoring and Maintenance

### Monitoring Dashboard
```typescript
interface IntegrationMonitoring {
  healthChecks: {
    frequency: 'Every 5 minutes for critical integrations',
    metrics: ['response_time', 'error_rate', 'throughput', 'availability'],
    alertThresholds: {
      responseTime: '> 5 seconds',
      errorRate: '> 5%',
      availability: '< 99%'
    }
  },
  
  logAggregation: {
    centralizedLogging: 'All integration logs in centralized system',
    logRetention: '90 days for operational logs, 7 years for compliance',
    searchAndAnalytics: 'Full-text search and pattern analysis',
    alerting: 'Real-time alerts for critical errors'
  },
  
  performanceMetrics: {
    apiLatency: 'Average response time per integration',
    throughput: 'Requests per minute by integration',
    errorRate: 'Error percentage by integration and time period',
    dataAccuracy: 'Data synchronization accuracy metrics'
  }
}
```

### Automated Testing and Validation
```bash
# Integration Testing and Validation
setup_integration_testing() {
  echo "Setting up automated integration testing..."
  
  # Create integration test suite
  create_test_suite() {
    cat > /opt/thorbis/tests/integration_tests.py << 'EOF'
#!/usr/bin/env python3
import requests
import json
import os
from datetime import datetime

class IntegrationTester:
    def __init__(self):
        self.results = {}
        
    def test_stripe_connection(self):
        """Test Stripe payment processing integration"""
        try:
            response = requests.get(
                "https://api.stripe.com/v1/payment_intents",
                headers={"Authorization": f"Bearer {os.environ['STRIPE_SECRET_KEY']}"},
                params={"limit": 1}
            )
            self.results['stripe'] = {
                'status': 'pass' if response.status_code == 200 else 'fail',
                'response_time': response.elapsed.total_seconds(),
                'timestamp': datetime.now()
            }
        except Exception as e:
            self.results['stripe'] = {'status': 'fail', 'error': str(e)}
    
    def test_uber_eats_connection(self):
        """Test Uber Eats API connection"""
        try:
            response = requests.get(
                f"https://api.uber.com/v2/eats/stores/{os.environ['UBER_STORE_ID']}",
                headers={"Authorization": f"Bearer {os.environ['UBER_ACCESS_TOKEN']}"}
            )
            self.results['uber_eats'] = {
                'status': 'pass' if response.status_code == 200 else 'fail',
                'response_time': response.elapsed.total_seconds(),
                'timestamp': datetime.now()
            }
        except Exception as e:
            self.results['uber_eats'] = {'status': 'fail', 'error': str(e)}
    
    def test_quickbooks_connection(self):
        """Test QuickBooks API connection"""
        try:
            response = requests.get(
                f"{os.environ['QB_BASE_URL']}/v3/company/{os.environ['QB_COMPANY_ID']}/companyinfo/{os.environ['QB_COMPANY_ID']}",
                headers={"Authorization": f"Bearer {os.environ['QB_ACCESS_TOKEN']}"}
            )
            self.results['quickbooks'] = {
                'status': 'pass' if response.status_code == 200 else 'fail',
                'response_time': response.elapsed.total_seconds(),
                'timestamp': datetime.now()
            }
        except Exception as e:
            self.results['quickbooks'] = {'status': 'fail', 'error': str(e)}
    
    def run_all_tests(self):
        """Run all integration tests"""
        self.test_stripe_connection()
        self.test_uber_eats_connection()
        self.test_quickbooks_connection()
        
        return self.results

if __name__ == "__main__":
    tester = IntegrationTester()
    results = tester.run_all_tests()
    
    # Log results
    with open('/var/log/integration_test_results.json', 'a') as f:
        json.dump(results, f, default=str)
        f.write('\n')
    
    # Alert on failures
    failed_tests = [name for name, result in results.items() if result['status'] == 'fail']
    if failed_tests:
        print(f"ALERT: Integration tests failed: {', '.join(failed_tests)}")
        exit(1)
    else:
        print("All integration tests passed")
        exit(0)
EOF
    
    chmod +x /opt/thorbis/tests/integration_tests.py
  }
  
  # Set up automated testing schedule
  setup_test_schedule() {
    # Run integration tests every hour
    echo "0 * * * * /opt/thorbis/tests/integration_tests.py" | crontab -
  }
  
  create_test_suite
  setup_test_schedule
}

# Webhook validation and security
setup_webhook_security() {
  echo "Setting up webhook security validation..."
  
  # Create webhook signature verification
  cat > /opt/thorbis/security/webhook_validator.py << 'EOF'
import hmac
import hashlib
import json

def validate_stripe_webhook(payload, signature, secret):
    """Validate Stripe webhook signature"""
    expected_sig = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_sig}", signature)

def validate_uber_webhook(payload, signature, secret):
    """Validate Uber Eats webhook signature"""
    expected_sig = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_sig, signature)

def validate_doordash_webhook(payload, signature, secret):
    """Validate DoorDash webhook signature"""
    expected_sig = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha1
    ).hexdigest()
    
    return hmac.compare_digest(expected_sig, signature)
EOF
}
```

---

*This Restaurant Integrations Guide provides comprehensive setup and configuration instructions for all major third-party integrations essential for restaurant operations. Regular updates ensure compatibility with evolving APIs and industry standards.*
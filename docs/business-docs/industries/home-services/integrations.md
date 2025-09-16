# Home Services Integration Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Integration Team  
> **Review Schedule**: Quarterly  

## Overview

This comprehensive integration guide covers all third-party system integrations specifically designed for home services businesses. These integrations streamline operations, eliminate duplicate data entry, and provide seamless workflows between the Thorbis Business OS platform and essential business tools.

## Integration Architecture

### Integration Categories
```typescript
interface HomeServicesIntegrations {
  accounting: {
    primary: ['QuickBooks Online', 'Xero', 'QuickBooks Desktop'],
    specialized: ['ServiceTitan Accounting', 'Jonas Construction Software'],
    features: ['Invoice sync', 'Payment tracking', 'Expense management', 'Tax reporting']
  },
  
  communication: {
    sms: ['Twilio', 'MessageBird', 'Plivo'],
    email: ['SendGrid', 'Mailchimp', 'Constant Contact'],
    voice: ['Twilio Voice', 'RingCentral', 'Vonage'],
    features: ['Automated notifications', 'Marketing campaigns', 'Customer surveys']
  },
  
  fieldService: {
    gps: ['Google Maps', 'Waze', 'HERE Maps'],
    routing: ['Route4Me', 'OptimoRoute', 'WorkWave'],
    diagnostics: ['Fieldpiece', 'Testo', 'UEi Test Instruments'],
    features: ['Route optimization', 'Equipment diagnostics', 'Real-time tracking']
  },
  
  paymentProcessing: {
    primary: ['Stripe', 'Square', 'PayPal'],
    specialized: ['ServiceMonster Payments', 'Housecall Pro Payments'],
    features: ['Mobile payments', 'Recurring billing', 'Financing options']
  }
}
```

## Accounting System Integrations

### QuickBooks Online Integration
```typescript
interface QuickBooksIntegration {
  authentication: {
    oauthSetup: {
      redirectUrl: 'https://app.thorbis.com/integrations/quickbooks/callback',
      scopes: ['com.intuit.quickbooks.accounting'],
      refreshTokenHandling: 'Automatic token refresh with 24/7 monitoring'
    }
  },
  
  dataSync: {
    customers: {
      direction: 'bidirectional',
      frequency: 'real-time',
      fields: ['name', 'email', 'phone', 'address', 'payment_terms'],
      conflicts: 'Last modified wins with audit trail'
    },
    
    items: {
      direction: 'Thorbis to QuickBooks',
      frequency: 'daily',
      types: ['Service Items', 'Inventory Items', 'Non-Inventory Items'],
      categories: 'Auto-map service categories to QB income accounts'
    },
    
    invoices: {
      direction: 'Thorbis to QuickBooks',
      frequency: 'immediate',
      status: 'Sync payment status updates back to Thorbis',
      customFields: 'Work order number, technician, completion date'
    },
    
    payments: {
      direction: 'bidirectional',
      frequency: 'real-time',
      methods: ['Check', 'Credit Card', 'Cash', 'Bank Transfer'],
      reconciliation: 'Automatic bank reconciliation support'
    }
  }
}
```

### QuickBooks Integration Setup
```bash
#!/bin/bash
# QuickBooks Online Integration Configuration

setup_quickbooks_integration() {
  echo "=== QUICKBOOKS ONLINE INTEGRATION SETUP ==="
  
  # Create QuickBooks configuration
  configure_qb_connection() {
    echo "Configuring QuickBooks connection..."
    
    # Test QuickBooks API connectivity
    qb_test_response=$(curl -s -X GET \
      "https://sandbox-quickbooks.api.intuit.com/v3/company/$QB_COMPANY_ID/companyinfo/$QB_COMPANY_ID" \
      -H "Authorization: Bearer $QB_ACCESS_TOKEN" \
      -H "Accept: application/json")
    
    if echo "$qb_test_response" | grep -q "CompanyInfo"; then
      echo "✅ QuickBooks API connection successful"
    else
      echo "❌ QuickBooks API connection failed"
      return 1
    fi
    
    # Configure sync settings in database
    supabase exec sql --query "
      INSERT INTO integration_settings (business_id, integration_type, settings, created_at)
      VALUES ('$BUSINESS_ID', 'quickbooks', jsonb_build_object(
        'company_id', '$QB_COMPANY_ID',
        'environment', '$QB_ENVIRONMENT',
        'sync_customers', true,
        'sync_items', true,
        'sync_invoices', true,
        'sync_payments', true,
        'auto_create_customers', true,
        'default_terms', 'Net 30',
        'income_account', 'Service Revenue',
        'expense_account', 'Cost of Goods Sold'
      ), NOW())
      ON CONFLICT (business_id, integration_type) DO UPDATE SET
        settings = EXCLUDED.settings,
        updated_at = NOW();
    "
  }
  
  # Set up chart of accounts mapping
  setup_accounts_mapping() {
    echo "Setting up chart of accounts mapping..."
    
    # Create account mappings for home services
    supabase exec sql --query "
      INSERT INTO quickbooks_account_mappings (business_id, thorbis_category, qb_account_id, qb_account_name, created_at)
      VALUES 
      ('$BUSINESS_ID', 'HVAC Service Revenue', '$QB_HVAC_INCOME_ACCOUNT', 'HVAC Service Income', NOW()),
      ('$BUSINESS_ID', 'Plumbing Service Revenue', '$QB_PLUMBING_INCOME_ACCOUNT', 'Plumbing Service Income', NOW()),
      ('$BUSINESS_ID', 'Electrical Service Revenue', '$QB_ELECTRICAL_INCOME_ACCOUNT', 'Electrical Service Income', NOW()),
      ('$BUSINESS_ID', 'Parts and Materials', '$QB_PARTS_EXPENSE_ACCOUNT', 'Parts and Materials Expense', NOW()),
      ('$BUSINESS_ID', 'Subcontractor Costs', '$QB_SUBCONTRACTOR_ACCOUNT', 'Subcontractor Expense', NOW())
      ON CONFLICT (business_id, thorbis_category) DO UPDATE SET
        qb_account_id = EXCLUDED.qb_account_id,
        qb_account_name = EXCLUDED.qb_account_name;
    "
  }
  
  # Configure automatic sync schedules
  setup_sync_schedules() {
    echo "Configuring synchronization schedules..."
    
    # Customer sync - bidirectional, every 15 minutes
    curl -X POST "https://api.thorbis.com/internal/sync/schedule" \
      -H "Authorization: Bearer $INTERNAL_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "business_id": "'$BUSINESS_ID'",
        "integration": "quickbooks",
        "sync_type": "customers",
        "frequency": "*/15 * * * *",
        "direction": "bidirectional"
      }'
    
    # Invoice sync - Thorbis to QB, immediate
    curl -X POST "https://api.thorbis.com/internal/sync/schedule" \
      -H "Authorization: Bearer $INTERNAL_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "business_id": "'$BUSINESS_ID'",
        "integration": "quickbooks", 
        "sync_type": "invoices",
        "frequency": "immediate",
        "direction": "thorbis_to_qb"
      }'
    
    # Payment sync - bidirectional, every 5 minutes
    curl -X POST "https://api.thorbis.com/internal/sync/schedule" \
      -H "Authorization: Bearer $INTERNAL_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "business_id": "'$BUSINESS_ID'",
        "integration": "quickbooks",
        "sync_type": "payments", 
        "frequency": "*/5 * * * *",
        "direction": "bidirectional"
      }'
  }
  
  configure_qb_connection
  setup_accounts_mapping
  setup_sync_schedules
  
  echo "✅ QuickBooks Online integration setup completed"
}
```

### Xero Integration
```typescript
interface XeroIntegration {
  authentication: {
    oauthSetup: {
      redirectUrl: 'https://app.thorbis.com/integrations/xero/callback',
      scopes: ['accounting.transactions', 'accounting.contacts', 'accounting.settings'],
      tokenStorage: 'Encrypted storage with automatic refresh'
    }
  },
  
  dataMapping: {
    customers: {
      xeroContactType: 'Customer',
      fieldMapping: {
        'name': 'Name',
        'email': 'EmailAddress',
        'phone': 'Phones[0].PhoneNumber',
        'address': 'Addresses[0]'
      }
    },
    
    invoices: {
      xeroType: 'ACCREC',  // Accounts Receivable
      lineItems: 'Map work order items to Xero line items',
      taxHandling: 'Use Xero tax rates and calculations',
      customFields: 'Work order reference in invoice reference field'
    },
    
    trackingCategories: {
      serviceType: 'Create tracking category for HVAC/Plumbing/Electrical',
      technician: 'Track revenue by technician',
      region: 'Track revenue by service area'
    }
  }
}
```

## Communication Integrations

### Twilio SMS Integration
```typescript
interface TwilioSMSIntegration {
  configuration: {
    webhooks: {
      incomingSMS: 'https://api.thorbis.com/webhooks/twilio/sms',
      statusUpdates: 'https://api.thorbis.com/webhooks/twilio/status',
      voiceCallback: 'https://api.thorbis.com/webhooks/twilio/voice'
    },
    
    phoneNumbers: {
      mainBusiness: 'Primary business line for customer communications',
      emergency: 'Dedicated emergency line with 24/7 monitoring',
      technicians: 'Individual numbers for technician direct contact'
    }
  },
  
  messageTemplates: {
    appointmentConfirmation: {
      trigger: 'Work order scheduled',
      timing: '24 hours before appointment',
      template: 'Hi {customer_name}! Confirming your {service_type} appointment tomorrow at {appointment_time}. Your technician {technician_name} will call 30 minutes before arrival. Questions? Reply here!'
    },
    
    technicianEnroute: {
      trigger: 'Technician checks in',
      timing: 'When technician starts driving to location',
      template: '{technician_name} is on the way! ETA: {eta}. Track live: {tracking_link}. Call/text {technician_phone} directly with questions.'
    },
    
    serviceComplete: {
      trigger: 'Work order completed',
      timing: 'Immediately after completion',
      template: 'Service complete! {technician_name} finished your {service_type}. Total: {invoice_total}. Rate your experience: {survey_link}. Need help? Reply here!'
    },
    
    emergencyResponse: {
      trigger: 'Emergency work order created',
      timing: 'Within 2 minutes of creation',
      template: 'EMERGENCY SERVICE: We received your urgent {service_type} request. {technician_name} will arrive within {eta}. Emergency contact: {emergency_phone}'
    }
  }
}
```

### Twilio SMS Setup
```bash
#!/bin/bash
# Twilio SMS Integration Setup

setup_twilio_sms() {
  echo "=== TWILIO SMS INTEGRATION SETUP ==="
  
  # Verify Twilio credentials
  verify_twilio_connection() {
    echo "Verifying Twilio connection..."
    
    twilio_account_info=$(curl -s -X GET \
      "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json" \
      -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN")
    
    if echo "$twilio_account_info" | grep -q "friendly_name"; then
      echo "✅ Twilio connection verified"
    else
      echo "❌ Twilio connection failed"
      return 1
    fi
  }
  
  # Configure webhook endpoints
  setup_webhooks() {
    echo "Setting up Twilio webhooks..."
    
    # Configure phone number webhooks
    curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/IncomingPhoneNumbers/$TWILIO_PHONE_SID.json" \
      --data-urlencode "SmsUrl=https://api.thorbis.com/webhooks/twilio/sms" \
      --data-urlencode "SmsMethod=POST" \
      --data-urlencode "VoiceUrl=https://api.thorbis.com/webhooks/twilio/voice" \
      --data-urlencode "VoiceMethod=POST" \
      -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
    
    if [ $? -eq 0 ]; then
      echo "✅ Webhooks configured successfully"
    else
      echo "❌ Webhook configuration failed"
      return 1
    fi
  }
  
  # Create message templates in database
  setup_message_templates() {
    echo "Creating SMS message templates..."
    
    supabase exec sql --query "
      INSERT INTO sms_templates (business_id, template_name, trigger_event, message_content, variables, created_at)
      VALUES 
      ('$BUSINESS_ID', 'appointment_confirmation', 'work_order_scheduled', 
       'Hi {customer_name}! Confirming your {service_type} appointment on {appointment_date} at {appointment_time}. {technician_name} will call 30 min before arrival. Questions? Reply here!',
       ARRAY['customer_name', 'service_type', 'appointment_date', 'appointment_time', 'technician_name'], NOW()),
       
      ('$BUSINESS_ID', 'technician_enroute', 'technician_enroute',
       '{technician_name} is on the way! ETA: {eta}. Track live: {tracking_link}. Call/text {technician_phone} with questions.',
       ARRAY['technician_name', 'eta', 'tracking_link', 'technician_phone'], NOW()),
       
      ('$BUSINESS_ID', 'service_complete', 'work_order_completed',
       'Service complete! Total: {invoice_total}. Rate your experience: {survey_link}. Need help? Reply here!',
       ARRAY['invoice_total', 'survey_link'], NOW()),
       
      ('$BUSINESS_ID', 'payment_reminder', 'invoice_overdue',
       'Friendly reminder: Your invoice #{invoice_number} for {invoice_total} is past due. Pay online: {payment_link} or call {business_phone}.',
       ARRAY['invoice_number', 'invoice_total', 'payment_link', 'business_phone'], NOW())
      ON CONFLICT (business_id, template_name) DO UPDATE SET
        message_content = EXCLUDED.message_content,
        variables = EXCLUDED.variables;
    "
  }
  
  # Test SMS functionality
  test_sms_functionality() {
    echo "Testing SMS functionality..."
    
    test_response=$(curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
      --data-urlencode "From=$TWILIO_PHONE" \
      --data-urlencode "Body=Thorbis SMS integration test - setup successful!" \
      --data-urlencode "To=$TEST_PHONE_NUMBER" \
      -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN")
    
    if echo "$test_response" | grep -q "queued\|sent"; then
      echo "✅ SMS test message sent successfully"
    else
      echo "❌ SMS test failed"
      return 1
    fi
  }
  
  verify_twilio_connection
  setup_webhooks
  setup_message_templates
  test_sms_functionality
  
  echo "✅ Twilio SMS integration setup completed"
}
```

## Field Service Integrations

### GPS and Routing Integration
```typescript
interface GPSRoutingIntegration {
  googleMaps: {
    services: ['Geocoding', 'Directions', 'Distance Matrix', 'Places'],
    features: {
      realTimeTracking: 'Live technician location tracking',
      routeOptimization: 'Multi-stop route optimization',
      trafficIntegration: 'Real-time traffic data and rerouting',
      placeDetails: 'Customer location verification and details'
    }
  },
  
  routeOptimization: {
    algorithms: ['Traveling Salesman Problem (TSP)', 'Vehicle Routing Problem (VRP)'],
    constraints: [
      'Technician skills and certifications',
      'Equipment and parts availability', 
      'Customer time windows',
      'Traffic and drive times',
      'Emergency service priorities'
    ],
    realTimeAdjustments: 'Dynamic rerouting for new emergencies and cancellations'
  }
}
```

### Diagnostic Equipment Integration
```typescript
interface DiagnosticEquipmentIntegration {
  fieldpiece: {
    devices: ['Smart Probes', 'Digital Manifolds', 'Combustion Analyzers'],
    dataTypes: ['Temperature', 'Pressure', 'Electrical', 'Gas Analysis'],
    integration: {
      bluetoothConnection: 'Direct device pairing with mobile app',
      dataCapture: 'Automatic reading capture and photo overlay',
      reportGeneration: 'Integrated diagnostic reports in work orders',
      historicalTracking: 'Equipment performance trend analysis'
    }
  },
  
  testo: {
    devices: ['Smart Probes', 'Flue Gas Analyzers', 'Thermal Cameras'],
    features: {
      cloudSync: 'Automatic data sync to Testo Cloud',
      reporting: 'Professional PDF reports with readings',
      compliance: 'Regulatory compliance documentation',
      maintenance: 'Equipment maintenance scheduling'
    }
  }
}
```

## Payment Processing Integrations

### Stripe Integration
```typescript
interface StripeIntegration {
  paymentMethods: {
    cards: {
      types: ['Visa', 'Mastercard', 'American Express', 'Discover'],
      processing: 'Real-time authorization and capture',
      security: 'PCI DSS compliant tokenization',
      disputes: 'Automatic dispute management and documentation'
    },
    
    ach: {
      verification: 'Micro-deposit or instant verification',
      processing: '3-5 business day settlement',
      fees: 'Lower fees for larger transactions',
      returns: 'Automated return handling and notifications'
    },
    
    wallets: {
      types: ['Apple Pay', 'Google Pay', 'Samsung Pay'],
      integration: 'Native mobile wallet integration',
      security: 'Biometric authentication support',
      convenience: 'One-tap payment experience'
    }
  },
  
  recurringBilling: {
    maintenanceAgreements: 'Automated billing for service contracts',
    subscriptions: 'Monthly/quarterly maintenance subscriptions',
    usage: 'Usage-based billing for commercial accounts',
    prorations: 'Automatic prorations for plan changes'
  }
}
```

### Stripe Payment Setup
```bash
#!/bin/bash
# Stripe Payment Integration Setup

setup_stripe_integration() {
  echo "=== STRIPE INTEGRATION SETUP ==="
  
  # Verify Stripe API connection
  verify_stripe_connection() {
    echo "Verifying Stripe connection..."
    
    stripe_account=$(curl -s -X GET "https://api.stripe.com/v1/account" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY")
    
    if echo "$stripe_account" | grep -q "charges_enabled"; then
      echo "✅ Stripe connection verified"
    else
      echo "❌ Stripe connection failed"
      return 1
    fi
  }
  
  # Configure webhook endpoints
  setup_stripe_webhooks() {
    echo "Setting up Stripe webhooks..."
    
    webhook_response=$(curl -s -X POST "https://api.stripe.com/v1/webhook_endpoints" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
      -d "url=https://api.thorbis.com/webhooks/stripe" \
      -d "enabled_events[]=payment_intent.succeeded" \
      -d "enabled_events[]=payment_intent.payment_failed" \
      -d "enabled_events[]=invoice.payment_succeeded" \
      -d "enabled_events[]=customer.subscription.updated")
    
    webhook_id=$(echo "$webhook_response" | jq -r '.id')
    if [ "$webhook_id" != "null" ]; then
      echo "✅ Stripe webhooks configured: $webhook_id"
      
      # Store webhook secret for verification
      webhook_secret=$(echo "$webhook_response" | jq -r '.secret')
      supabase exec sql --query "
        UPDATE integration_settings SET
          settings = settings || jsonb_build_object('webhook_secret', '$webhook_secret')
        WHERE business_id = '$BUSINESS_ID' AND integration_type = 'stripe';
      "
    else
      echo "❌ Webhook setup failed"
      return 1
    fi
  }
  
  # Configure payment methods and settings
  configure_payment_settings() {
    echo "Configuring payment settings..."
    
    supabase exec sql --query "
      INSERT INTO payment_settings (business_id, provider, settings, created_at)
      VALUES ('$BUSINESS_ID', 'stripe', jsonb_build_object(
        'publishable_key', '$STRIPE_PUBLISHABLE_KEY',
        'currency', 'usd',
        'automatic_payment_methods', true,
        'capture_method', 'automatic',
        'payment_method_types', ARRAY['card', 'us_bank_account'],
        'statement_descriptor', 'SERVICE CALL',
        'receipt_email', true,
        'save_payment_method', true
      ), NOW())
      ON CONFLICT (business_id, provider) DO UPDATE SET
        settings = EXCLUDED.settings,
        updated_at = NOW();
    "
  }
  
  # Test payment functionality
  test_payment_processing() {
    echo "Testing payment processing..."
    
    # Create test payment intent
    test_payment=$(curl -s -X POST "https://api.stripe.com/v1/payment_intents" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
      -d "amount=100" \
      -d "currency=usd" \
      -d "payment_method_types[]=card" \
      -d "description=Thorbis integration test")
    
    payment_intent_id=$(echo "$test_payment" | jq -r '.id')
    if [ "$payment_intent_id" != "null" ]; then
      echo "✅ Test payment intent created: $payment_intent_id"
      
      # Cancel the test payment intent
      curl -s -X POST "https://api.stripe.com/v1/payment_intents/$payment_intent_id/cancel" \
        -H "Authorization: Bearer $STRIPE_SECRET_KEY" > /dev/null
    else
      echo "❌ Payment processing test failed"
      return 1
    fi
  }
  
  verify_stripe_connection
  setup_stripe_webhooks  
  configure_payment_settings
  test_payment_processing
  
  echo "✅ Stripe integration setup completed"
}
```

## Specialized Home Services Integrations

### HVAC Equipment Integration
```typescript
interface HVACEquipmentIntegration {
  manufacturers: {
    carrier: {
      api: 'Carrier Connect API',
      features: ['Equipment registration', 'Warranty lookup', 'Service history'],
      authentication: 'OAuth 2.0 with dealer credentials'
    },
    
    trane: {
      api: 'Trane Connect API',
      features: ['Product information', 'Installation manuals', 'Parts lookup'],
      authentication: 'API key with dealer verification'
    },
    
    rheem: {
      api: 'Rheem Pro Partner API', 
      features: ['Warranty registration', 'Service bulletins', 'Training resources'],
      authentication: 'Partner portal credentials'
    }
  },
  
  diagnosticData: {
    dataTypes: ['Refrigerant pressures', 'Temperature readings', 'Electrical measurements'],
    standards: ['AHRI ratings', 'Energy Star compliance', 'EPA refrigerant regulations'],
    reporting: 'Automated diagnostic reports with recommendations'
  }
}
```

### Plumbing Supplier Integration
```typescript
interface PlumbingSupplierIntegration {
  suppliers: {
    ferguson: {
      api: 'Ferguson Enterprise API',
      features: ['Real-time inventory', 'Pricing', 'Order placement', 'Delivery tracking'],
      catalog: 'Complete plumbing fixtures and parts catalog'
    },
    
    supplyHouse: {
      api: 'SupplyHouse.com API',
      features: ['Product search', 'Availability check', 'Bulk pricing'],
      specialization: 'HVAC and plumbing supplies'
    },
    
    localsuppliers: {
      integration: 'Custom API or EDI integration',
      features: ['Account-specific pricing', 'Local delivery', 'Emergency stock'],
      benefits: 'Support local business relationships'
    }
  }
}
```

## Integration Monitoring and Maintenance

### Health Monitoring
```sql
-- Integration Health Monitoring Functions
CREATE OR REPLACE FUNCTION monitor_integration_health(
    integration_name VARCHAR DEFAULT NULL
) RETURNS TABLE (
    integration VARCHAR,
    status VARCHAR,
    last_sync TIMESTAMPTZ,
    error_count INTEGER,
    success_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH integration_stats AS (
        SELECT 
            il.integration_type,
            COUNT(*) as total_logs,
            COUNT(*) FILTER (WHERE il.status = 'success') as success_count,
            COUNT(*) FILTER (WHERE il.status = 'error') as error_count,
            MAX(il.created_at) as last_activity
        FROM integration_logs il
        WHERE (integration_name IS NULL OR il.integration_type = integration_name)
        AND il.created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY il.integration_type
    )
    SELECT 
        ist.integration_type,
        CASE 
            WHEN ist.last_activity < NOW() - INTERVAL '1 hour' THEN 'stale'
            WHEN ist.error_count > 10 THEN 'degraded'
            WHEN ist.success_count::decimal / ist.total_logs > 0.95 THEN 'healthy'
            ELSE 'warning'
        END as status,
        ist.last_activity,
        ist.error_count,
        ROUND(ist.success_count::decimal / ist.total_logs * 100, 2) as success_rate
    FROM integration_stats ist
    ORDER BY ist.integration_type;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_integration_report(
    business_id UUID,
    report_period INTERVAL DEFAULT '7 days'
) RETURNS JSONB AS $$
DECLARE
    report JSONB;
BEGIN
    WITH integration_summary AS (
        SELECT 
            il.integration_type,
            COUNT(*) as total_operations,
            COUNT(*) FILTER (WHERE il.status = 'success') as successful_operations,
            COUNT(*) FILTER (WHERE il.status = 'error') as failed_operations,
            AVG(il.execution_time) as avg_execution_time,
            array_agg(DISTINCT il.error_message) FILTER (WHERE il.error_message IS NOT NULL) as error_messages
        FROM integration_logs il
        WHERE il.business_id = generate_integration_report.business_id
        AND il.created_at >= NOW() - report_period
        GROUP BY il.integration_type
    )
    SELECT jsonb_build_object(
        'report_period', report_period,
        'generated_at', NOW(),
        'integrations', jsonb_agg(
            jsonb_build_object(
                'integration', integration_type,
                'total_operations', total_operations,
                'success_rate', ROUND(successful_operations::decimal / total_operations * 100, 2),
                'average_execution_time', ROUND(avg_execution_time::numeric, 2),
                'error_messages', error_messages
            )
        )
    ) INTO report
    FROM integration_summary;
    
    RETURN report;
END;
$$ LANGUAGE plpgsql;
```

### Automated Integration Maintenance
```bash
#!/bin/bash
# Automated Integration Maintenance

maintain_integrations() {
  echo "=== INTEGRATION MAINTENANCE ==="
  
  # Check integration health
  check_integration_health() {
    echo "Checking integration health..."
    
    # Get list of configured integrations
    integrations=$(supabase exec sql --query "
      SELECT DISTINCT integration_type FROM integration_settings 
      WHERE business_id = '$BUSINESS_ID'
    " --csv | tail -n +2)
    
    while IFS= read -r integration; do
      echo "Checking $integration..."
      
      # Check last successful sync
      last_sync=$(supabase exec sql --query "
        SELECT MAX(created_at) FROM integration_logs 
        WHERE integration_type = '$integration' 
        AND status = 'success' 
        AND business_id = '$BUSINESS_ID'
      " --csv | tail -1)
      
      # Calculate hours since last sync
      if [ -n "$last_sync" ] && [ "$last_sync" != "" ]; then
        hours_since_sync=$(date -d "$last_sync" +'%s')
        current_time=$(date +'%s')
        hours_diff=$(( (current_time - hours_since_sync) / 3600 ))
        
        echo "  Last successful sync: $hours_diff hours ago"
        
        if [ $hours_diff -gt 24 ]; then
          echo "  ⚠️  Warning: $integration hasn't synced in $hours_diff hours"
          send_integration_alert "$integration" "No sync in $hours_diff hours"
        fi
      else
        echo "  ❌ No successful sync found for $integration"
        send_integration_alert "$integration" "No successful sync found"
      fi
    done <<< "$integrations"
  }
  
  # Refresh authentication tokens
  refresh_auth_tokens() {
    echo "Refreshing authentication tokens..."
    
    # QuickBooks token refresh
    if [ -n "$QB_REFRESH_TOKEN" ]; then
      qb_refresh_response=$(curl -s -X POST "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer" \
        -H "Authorization: Basic $(echo -n "$QB_CLIENT_ID:$QB_CLIENT_SECRET" | base64)" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=refresh_token&refresh_token=$QB_REFRESH_TOKEN")
      
      if echo "$qb_refresh_response" | grep -q "access_token"; then
        new_access_token=$(echo "$qb_refresh_response" | jq -r '.access_token')
        new_refresh_token=$(echo "$qb_refresh_response" | jq -r '.refresh_token')
        
        # Update stored tokens
        supabase exec sql --query "
          UPDATE integration_settings SET
            settings = settings || jsonb_build_object(
              'access_token', '$new_access_token',
              'refresh_token', '$new_refresh_token',
              'token_refreshed_at', NOW()
            )
          WHERE business_id = '$BUSINESS_ID' AND integration_type = 'quickbooks';
        "
        
        echo "✅ QuickBooks tokens refreshed successfully"
      else
        echo "❌ QuickBooks token refresh failed"
      fi
    fi
    
    # Add other token refresh logic for Xero, Stripe, etc.
  }
  
  # Clean up old logs
  cleanup_old_logs() {
    echo "Cleaning up old integration logs..."
    
    # Delete logs older than 90 days
    deleted_count=$(supabase exec sql --query "
      DELETE FROM integration_logs 
      WHERE created_at < NOW() - INTERVAL '90 days'
      AND business_id = '$BUSINESS_ID'
    " --csv | tail -1)
    
    echo "Cleaned up $deleted_count old log entries"
  }
  
  check_integration_health
  refresh_auth_tokens
  cleanup_old_logs
  
  echo "✅ Integration maintenance completed"
}

send_integration_alert() {
  local integration="$1"
  local message="$2"
  
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-type: application/json' \
    --data "{
      \"text\": \"⚠️ Integration Alert: $integration - $message\",
      \"channel\": \"#integrations\"
    }"
}
```

This comprehensive integration guide provides all the necessary information and tools to successfully implement and maintain third-party system integrations for home services businesses using the Thorbis Business OS platform.
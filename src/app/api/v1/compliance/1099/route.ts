/**
 * 1099 Compliance Reporting API
 * Generate 1099 forms for contractor payments and compliance reporting
 * 
 * Features: 1099-NEC, 1099-MISC, 1099-K reporting, electronic filing, recipient management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// 1099 Form generation request schema
const Form1099GenerationSchema = z.object({
  organization_id: z.string().uuid(),
  tax_year: z.number().int().min(2020).max(new Date().getFullYear()),
  form_type: z.enum(['1099-NEC', '1099-MISC', '1099-K']),
  filters: z.object({
    recipient_ids: z.array(z.string().uuid()).optional(),
    minimum_amount_cents: z.number().int().min(0).optional(),
    date_range: z.object({
      start_date: z.string(),
      end_date: z.string()
    }).optional(),
    include_corrections: z.boolean().default(false)
  }).optional(),
  options: z.object({
    format: z.enum(['pdf', 'json', 'xml']).default('json'),
    include_recipient_details: z.boolean().default(true),
    electronic_filing: z.boolean().default(false),
    correction_sequence: z.number().int().min(0).optional()
  }).optional()
});

const RecipientRegistrationSchema = z.object({
  organization_id: z.string().uuid(),
  recipient_info: z.object({
    type: z.enum(['individual', 'business']),
    name: z.string().min(1),
    business_name: z.string().optional(),
    tin: z.string().regex(/^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$/), // EIN or SSN format
    tin_type: z.enum(['EIN', 'SSN', 'ITIN']),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string().default('US')
    }),
    backup_withholding: z.boolean().default(false),
    exemption_code: z.string().optional()
  })
});

// GET /api/v1/compliance/1099 - List 1099 recipients and forms
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const taxYear = searchParams.get('tax_year');
    const formType = searchParams.get('form_type');
    const status = searchParams.get('status');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id parameter is required' },
        { status: 400 }
      );
    }

    // Fetch 1099 recipients and payment data
    const recipientsQuery = supabase
      .from('compliance_1099_recipients')
      .select('
        id,
        organization_id,
        recipient_info,
        status,
        created_at,
        updated_at,
        payment_summaries:compliance_1099_payment_summaries(
          tax_year,
          form_type,
          total_payments_cents,
          payments_count,
          withholding_cents,
          created_at
        )
      ')
      .eq('organization_id', organizationId);

    if (status) {
      recipientsQuery.eq('status', status);
    }

    const { data: recipients, error } = await recipientsQuery.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch 1099 recipients' },
        { status: 500 }
      );
    }

    // Calculate current year payment thresholds
    const currentYear = new Date().getFullYear();
    const thresholds = {
      '1099-NEC': 60000, // $600 in cents
      '1099-MISC': 60000, // $600 in cents  
      '1099-K': 2000000  // $20,000 in cents (simplified)
    };

    // Transform data for response
    const transformedRecipients = recipients?.map(recipient => ({
      ...recipient,
      display_info: {
        recipient_name: recipient.recipient_info.name,
        business_name: recipient.recipient_info.business_name,
        tin_masked: maskTIN(recipient.recipient_info.tin),
        address_summary: formatAddressSummary(recipient.recipient_info.address),
        requires_1099: checkRequires1099(recipient.payment_summaries, thresholds)
      },
      payment_summaries: recipient.payment_summaries?.map((summary: unknown) => ({
        ...summary,
        display_info: {
          total_payments_formatted: formatCurrency(summary.total_payments_cents),
          withholding_formatted: formatCurrency(summary.withholding_cents || 0),
          requires_filing: summary.total_payments_cents >= thresholds[summary.form_type as keyof typeof thresholds]
        }
      })) || []
    })) || [];

    return NextResponse.json({
      data: transformedRecipients,
      meta: {
        organization_id: organizationId,
        total_recipients: transformedRecipients.length,
        requiring_1099: transformedRecipients.filter(r => r.display_info.requires_1099).length,
        tax_year: taxYear || currentYear.toString(),
        filing_thresholds: Object.entries(thresholds).map(([form, amount]) => ({
          form_type: form,
          threshold_cents: amount,
          threshold_formatted: formatCurrency(amount)
        }))
      }
    });

  } catch (error) {
    console.error('1099 compliance API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve 1099 compliance data' },
      { status: 500 }
    );
  }
}

// POST /api/v1/compliance/1099 - Generate 1099 forms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = Form1099GenerationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid 1099 generation request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, tax_year, form_type, filters = {}, options = {} } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Verify organization exists and get business details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('
        id,
        name,
        business_address,
        tax_id,
        industry,
        settings
      ')
      .eq('id', organization_id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Generate 1099 forms based on payment data
    const forms = await generate1099Forms({
      organization,
      tax_year,
      form_type,
      filters,
      options
    });

    // Store generation record for audit trail
    const { data: generationRecord } = await supabase
      .from('compliance_1099_generations')
      .insert({
        organization_id,
        tax_year,
        form_type,
        filters,
        forms_generated: forms.length,
        total_payments_cents: forms.reduce((sum, form) => sum + form.payment_amount_cents, 0),
        generated_by: 'api', // In real app, use authenticated user ID
        generated_at: new Date().toISOString(),
        status: options.electronic_filing ? 'pending_filing' : 'generated'
      })
      .select('id')
      .single();

    return NextResponse.json({
      data: {
        generation_id: generationRecord?.id,
        tax_year,
        form_type,
        forms_generated: forms.length,
        total_payment_amount_cents: forms.reduce((sum, form) => sum + form.payment_amount_cents, 0),
        forms: options.format === 'json' ? forms : undefined,
        filing_deadline: getFilingDeadline(tax_year),
        electronic_filing: options.electronic_filing,
        download_urls: options.format === 'pdf' ? forms.map(form => form.pdf_url) : undefined
      },
      meta: {
        generated_at: new Date().toISOString(),
        organization: {
          name: organization.name,
          tax_id: organization.tax_id
        },
        compliance_notes: getComplianceNotes(form_type, tax_year)
      }
    }, { status: 201 });

  } catch (error) {
    console.error('1099 generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate 1099 forms' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/compliance/1099/recipients - Register or update 1099 recipient
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = RecipientRegistrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid recipient registration', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { organization_id, recipient_info } = validationResult.data;
    const supabase = createRouteHandlerClient({ cookies });

    // Check if recipient already exists based on TIN
    const { data: existingRecipient } = await supabase
      .from('compliance_1099_recipients')
      .select('id, recipient_info')
      .eq('organization_id', organization_id)
      .eq('recipient_info->tin', recipient_info.tin)
      .single();

    let recipientRecord;

    if (existingRecipient) {
      // Update existing recipient
      const { data: updatedRecipient, error: updateError } = await supabase
        .from('compliance_1099_recipients')
        .update({
          recipient_info,
          updated_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', existingRecipient.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update recipient' },
          { status: 500 }
        );
      }

      recipientRecord = updatedRecipient;
    } else {
      // Create new recipient
      const { data: newRecipient, error: insertError } = await supabase
        .from('compliance_1099_recipients')
        .insert({
          organization_id,
          recipient_info,
          status: 'active'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to register recipient' },
          { status: 500 }
        );
      }

      recipientRecord = newRecipient;
    }

    return NextResponse.json({
      data: {
        ...recipientRecord,
        display_info: {
          recipient_name: recipient_info.name,
          business_name: recipient_info.business_name,
          tin_masked: maskTIN(recipient_info.tin),
          address_summary: formatAddressSummary(recipient_info.address)
        }
      },
      message: existingRecipient ? 'Recipient updated successfully' : 'Recipient registered successfully'
    });

  } catch (error) {
    console.error('Recipient registration error:', error);
    return NextResponse.json(
      { error: 'Failed to process recipient registration' },
      { status: 500 }
    );
  }
}

// Helper Functions
async function generate1099Forms(params: unknown) {
  const { organization, tax_year, form_type, filters, options } = params;
  
  // Mock 1099 form generation - in production, this would:
  // 1. Query payment data from the database
  // 2. Filter based on thresholds and criteria
  // 3. Generate actual PDF forms
  // 4. Handle electronic filing if requested
  
  const mockForms = [];
  const recipients = [
    {
      id: 'recipient_001',
      name: 'John Doe Contracting',
      tin: '12-3456789',
      address: '123 Contractor St, Los Angeles, CA 90210'
    },
    {
      id: 'recipient_002', 
      name: 'Jane Smith Services',
      tin: '987-65-4321',
      address: '456 Service Ave, San Francisco, CA 94102'
    }
  ];

  for (const recipient of recipients) {
    const paymentAmount = Math.floor(Math.random() * 50000) + 60000; // $600+ in cents
    
    mockForms.push({
      form_id: '${form_type}_${tax_year}_${recipient.id}',
      recipient_id: recipient.id,
      recipient_name: recipient.name,
      recipient_tin: recipient.tin,
      recipient_address: recipient.address,
      payer_name: organization.name,
      payer_tin: organization.tax_id,
      payer_address: formatBusinessAddress(organization.business_address),
      tax_year,
      form_type,
      payment_amount_cents: paymentAmount,
      payment_amount_formatted: formatCurrency(paymentAmount),
      withholding_cents: 0,
      box_assignments: getBoxAssignments(form_type, paymentAmount),
      filing_deadline: getFilingDeadline(tax_year),
      correction_sequence: options.correction_sequence || 0,
      pdf_url: options.format === 'pdf' ? '/api/v1/compliance/1099/${form_type}_${tax_year}_${recipient.id}.pdf' : undefined
    });
  }

  return mockForms;
}

function getBoxAssignments(formType: string, amountCents: number) {
  const assignments: { [key: string]: any } = {
    '1099-NEC': {
      box_1: amountCents, // Nonemployee compensation
      box_4: 0, // Federal income tax withheld
      box_5: 0, // State tax withheld
      box_6: 0, // State income
      box_7: ' // Payer state number
    },
    '1099-MISC': {
      box_1: amountCents, // Rents
      box_2: 0, // Royalties  
      box_3: 0, // Other income
      box_4: 0, // Federal income tax withheld
      box_5: 0, // Fishing boat proceeds
      box_6: 0, // Medical and health care payments
      box_7: 0, // Nonemployee compensation (pre-2020)
      box_8: 0, // Substitute payments in lieu of dividends
      box_9: 0, // Payer made direct sales
      box_10: 0, // Crop insurance proceeds
      box_11: 0, // State tax withheld
      box_12: 0, // State income
      box_13: ' // Payer state number
    },
    '1099-K`: {
      box_1a: amountCents, // Gross amount of payment card transactions
      box_1b: 0, // Card not present transactions
      box_2: 0, // Merchant category code
      box_3: 0, // Number of payment transactions
      box_4: 0, // Federal income tax withheld
      box_5a: 0, // January
      box_5b: 0, // February
      // ... monthly breakdowns would continue
    }
  };

  return assignments[formType] || {};
}

function getFilingDeadline(taxYear: number): string {
  // 1099 forms are due by January 31st of the following year to recipients
  // and by February 28th (or March 31st if filing electronically) to IRS
  const filingYear = taxYear + 1;
  return `${filingYear}-01-31`; // Recipient deadline
}

function getComplianceNotes(formType: string, taxYear: number): string[] {
  const notes = [
    `${formType} forms must be furnished to recipients by January 31, ${taxYear + 1}',
    'File with IRS by February 28, ${taxYear + 1} (March 31 if filing electronically)',
    'Backup withholding may apply if recipient has not provided valid TIN',
    'Corrections can be filed using corrected forms with appropriate sequence numbers'
  ];

  if (formType === '1099-NEC') {
    notes.push('Report payments of $600 or more made to non-employees');
  } else if (formType === '1099-MISC') {
    notes.push('Report various types of miscellaneous income payments');
  } else if (formType === '1099-K') {
    notes.push('Report payment card and third-party network transactions');
  }

  return notes;
}

function maskTIN(tin: string): string {
  if (tin.includes('-')) {
    const parts = tin.split('-`);
    if (parts.length === 2) {
      // EIN format: XX-XXXXXXX -> XX-XXXX789
      return `${parts[0]}-XXXX${parts[1].slice(-3)}`;
    } else if (parts.length === 3) {
      // SSN format: XXX-XX-XXXX -> XXX-XX-X234
      return '${parts[0]}-${parts[1]}-X${parts[2].slice(-3)}';
    }
  }
  return 'XXX-XX-' + tin.slice(-4);
}

function formatAddressSummary(address: unknown): string {
  return `${address.city}, ${address.state} ${address.postal_code}';
}

function formatBusinessAddress(address: unknown): string {
  return '${address.street}, ${address.city}, ${address.state} ${address.postal_code}';
}

function checkRequires1099(paymentSummaries: unknown[], thresholds: unknown): boolean {
  if (!paymentSummaries || paymentSummaries.length === 0) return false;
  
  return paymentSummaries.some((summary: unknown) => {
    const threshold = thresholds[summary.form_type];
    return summary.total_payments_cents >= threshold;
  });
}

function formatCurrency(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(cents / 100);
}
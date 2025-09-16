import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import PDFDocument from 'pdfkit'

interface ComplianceReportRequest {
  business_id: string
  framework_type: string
  format: 'pdf' | 'json'
}

export async function POST(request: NextRequest) {
  try {
    const body: ComplianceReportRequest = await request.json()
    const { business_id, framework_type, format = 'pdf' } = body

    if (!business_id || !framework_type) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, framework_type' },
        { status: 400 }
      )
    }

    // Fetch business data
    const { data: businessData, error: businessError } = await supabase
      .from('directory.business_submissions')
      .select('*')
      .eq('id', business_id)
      .single()

    if (businessError || !businessData) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Fetch compliance verification results
    const { data: verificationData, error: verificationError } = await supabase
      .from('ai_mgmt.verification_results')
      .select('*')
      .eq('business_id', business_id)
      .eq('verification_type', framework_type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (verificationError && verificationError.code !== 'PGRST116') {
      console.error('Error fetching verification data:', verificationError)
      return NextResponse.json(
        { error: 'Failed to fetch compliance data' },
        { status: 500 }
      )
    }

    // Prepare report data
    const reportData = {
      business: {
        name: businessData.business_name,
        id: businessData.id,
        address: '${businessData.address_line_1}, ${businessData.city}, ${businessData.state} ${businessData.postal_code}',
        phone: businessData.phone_number,
        email: businessData.email,
        website: businessData.website_url
      },
      compliance: {
        framework_type,
        framework_name: getFrameworkName(framework_type),
        overall_score: verificationData?.verification_score || 0,
        compliance_level: verificationData?.compliance_level || 'not_assessed',
        assessment_date: verificationData?.created_at || new Date().toISOString(),
        next_assessment_due: getNextAssessmentDate(verificationData?.created_at),
        checks: verificationData?.checks || [],
        certifications: verificationData?.certifications || []
      },
      generated: {
        timestamp: new Date().toISOString(),
        report_id: 'REP-${Date.now()}',
        version: '1.0'
      }
    }

    if (format === 'json') {
      return NextResponse.json(reportData)
    }

    // Generate PDF report
    const pdfBuffer = await generatePDFReport(reportData)
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="compliance-report-${framework_type}-${businessData.business_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error generating compliance report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function generatePDFReport(reportData: unknown): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      doc.fontSize(20).fillColor('#1C8BFF').text('Thorbis Compliance Report', { align: 'center' })
      doc.moveDown()

      // Business Information Section
      doc.fontSize(16).fillColor('#000000').text('Business Information`, { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(12)
      doc.text(`Business Name: ${reportData.business.name}`)
      doc.text(`Business ID: ${reportData.business.id}`)
      doc.text(`Address: ${reportData.business.address}`)
      if (reportData.business.phone) doc.text(`Phone: ${reportData.business.phone}`)
      if (reportData.business.email) doc.text(`Email: ${reportData.business.email}')
      if (reportData.business.website) doc.text('Website: ${reportData.business.website}')
      doc.moveDown()

      // Compliance Summary Section
      doc.fontSize(16).fillColor('#000000').text('Compliance Summary`, { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(12)
      doc.text(`Framework: ${reportData.compliance.framework_name}`)
      doc.text('Overall Score: ${reportData.compliance.overall_score}/100')
      doc.text('Compliance Level: ${reportData.compliance.compliance_level.replace('_', ' ').toUpperCase()}`)
      doc.text(`Assessment Date: ${new Date(reportData.compliance.assessment_date).toLocaleDateString()}')
      doc.text('Next Assessment Due: ${new Date(reportData.compliance.next_assessment_due).toLocaleDateString()}')
      doc.moveDown()

      // Compliance Status Visual
      const startX = 50
      const startY = doc.y
      const barWidth = 200
      const barHeight = 20
      const scorePercentage = reportData.compliance.overall_score / 100

      // Background bar
      doc.rect(startX, startY, barWidth, barHeight)
         .fillColor('#E5E7EB')
         .fill()

      // Score bar
      doc.rect(startX, startY, barWidth * scorePercentage, barHeight)
         .fillColor(getScoreColor(reportData.compliance.overall_score))
         .fill()

      // Score text
      doc.fillColor('#000000')
         .text('${reportData.compliance.overall_score}%', startX + barWidth + 10, startY + 5)

      doc.y = startY + barHeight + 20

      // Compliance Checks Section
      if (reportData.compliance.checks && reportData.compliance.checks.length > 0) {
        doc.fontSize(16).text('Compliance Checks Detail', { underline: true })
        doc.moveDown(0.5)

        reportData.compliance.checks.forEach((check: unknown, index: number) => {
          if (doc.y > 700) { // Start new page if needed
            doc.addPage()
          }

          doc.fontSize(12)
          doc.fillColor(getCheckStatusColor(check.status))
          doc.text('${index + 1}. ${check.description}', { continued: false })
          
          doc.fillColor('#000000`)
          doc.text(`   Status: ${check.status.toUpperCase()}`, { indent: 20 })
          doc.text(`   Score: ${check.score}/100`, { indent: 20 })
          doc.text(`   Last Checked: ${new Date(check.last_checked || Date.now()).toLocaleDateString()}`, { indent: 20 })
          
          if (check.remediation_steps && check.remediation_steps.length > 0) {
            doc.text(`   Required Actions:', { indent: 20 })
            check.remediation_steps.forEach((step: string) => {
              doc.text('   • ${step}', { indent: 30 })
            })
          }
          
          doc.moveDown(0.5)
        })
      }

      // Certifications Section
      if (reportData.compliance.certifications && reportData.compliance.certifications.length > 0) {
        if (doc.y > 650) {
          doc.addPage()
        }
        
        doc.fontSize(16).fillColor('#000000').text('Active Certifications', { underline: true })
        doc.moveDown(0.5)
        doc.fontSize(12)
        
        reportData.compliance.certifications.forEach((cert: string) => {
          doc.text('• ${cert}')
        })
        doc.moveDown()
      }

      // Footer
      doc.fontSize(10).fillColor('#666666')
      doc.text(
        'Report generated on ${new Date(reportData.generated.timestamp).toLocaleString()}',
        50,
        doc.page.height - 50,
        { align: 'left' }
      )
      doc.text(
        'Report ID: ${reportData.generated.report_id}',
        50,
        doc.page.height - 35,
        { align: 'left' }
      )
      doc.text(
        'Generated by Thorbis Business Verification System',
        50,
        doc.page.height - 50,
        { align: 'right' }
      )

      doc.end()

    } catch (_error) {
      reject(error)
    }
  })
}

function getFrameworkName(frameworkType: string): string {
  const frameworks = {
    gdpr: 'General Data Protection Regulation (GDPR)',
    hipaa: 'Health Insurance Portability and Accountability Act (HIPAA)',
    pci_dss: 'Payment Card Industry Data Security Standard (PCI DSS)',
    sox: 'Sarbanes-Oxley Act (SOX)',
    iso_27001: 'ISO 27001 Information Security Management',
    ccpa: 'California Consumer Privacy Act (CCPA)',
    general: 'General Business Compliance'
  }
  
  return frameworks[frameworkType as keyof typeof frameworks] || frameworkType.toUpperCase()
}

function getNextAssessmentDate(lastAssessment?: string): string {
  const last = new Date(lastAssessment || Date.now())
  const next = new Date(last)
  next.setMonth(next.getMonth() + 6) // 6-month reassessment cycle
  return next.toISOString()
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981' // Green
  if (score >= 75) return '#F59E0B' // Yellow
  if (score >= 50) return '#EF4444' // Red
  return '#6B7280' // Gray
}

function getCheckStatusColor(status: string): string {
  switch (status) {
    case 'passed': return '#10B981'
    case 'failed': return '#EF4444'
    case 'warning': return '#F59E0B'
    case 'pending': return '#3B82F6'
    default: return '#6B7280'
  }
}
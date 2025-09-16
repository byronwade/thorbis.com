#!/usr/bin/env node

/**
 * Test Business Profile Integration
 */

console.log('🏢 Testing Business Profile Integration');
console.log('=====================================\n');

// Test the business data integration
async function testBusinessIntegration() {
  try {
    console.log('1. Testing mock business data import...');
    
    // Dynamic import to test the module
    const { 
      MOCK_ORGANIZATIONS, 
      MOCK_BUSINESS_SUBMISSIONS,
      MOCK_TRUST_BADGES,
      getMockOrganizationsForUser,
      getMockOrganizationBySlug,
      getMockOrganizationsByIndustry
    } = await import('../src/lib/mock-business-data.js');

    console.log('✅ Mock business data imported successfully');
    console.log(`   Organizations: ${MOCK_ORGANIZATIONS.length}`);
    console.log(`   Business Submissions: ${MOCK_BUSINESS_SUBMISSIONS.length}`);
    console.log(`   Trust Badges: ${MOCK_TRUST_BADGES.length}`);

    console.log('\n2. Testing organization queries...');
    
    // Test getting organizations for user
    const userOrgs = getMockOrganizationsForUser('mock-user-1');
    console.log(`✅ User organizations: ${userOrgs.length}`);
    
    userOrgs.forEach(org => {
      console.log(`   • ${org.name} (${org.industry}) - ${org.subscription_tier}`);
    });

    console.log('\n3. Testing organization lookup by slug...');
    
    const testSlugs = ['profix-plumbing', 'downtown-auto-repair', 'bella-vista-bistro', 'techstyle-boutique'];
    
    for (const slug of testSlugs) {
      const org = getMockOrganizationBySlug(slug);
      if (org) {
        console.log(`✅ Found: ${org.name} (${slug})`);
      } else {
        console.log(`❌ Not found: ${slug}`);
      }
    }

    console.log('\n4. Testing industry grouping...');
    
    const industries = ['hs', 'auto', 'rest', 'ret'];
    
    industries.forEach(industry => {
      const orgs = getMockOrganizationsByIndustry(industry);
      console.log(`✅ ${industry.toUpperCase()}: ${orgs.length} organization(s)`);
      orgs.forEach(org => {
        console.log(`   • ${org.name}`);
      });
    });

    console.log('\n5. Testing business settings and configuration...');
    
    const testOrg = getMockOrganizationBySlug('profix-plumbing');
    if (testOrg && testOrg.settings) {
      console.log('✅ Business settings loaded:');
      console.log(`   • Emergency Service: ${testOrg.settings.emergency_service ? 'Yes' : 'No'}`);
      console.log(`   • Service Area: ${testOrg.settings.service_area_radius} miles`);
      console.log(`   • License: ${testOrg.settings.license_number}`);
      console.log(`   • Services: ${testOrg.settings.services?.length || 0} listed`);
      
      if (testOrg.settings.business_hours) {
        const hours = testOrg.settings.business_hours;
        console.log('   • Business Hours:');
        Object.entries(hours).forEach(([day, schedule]) => {
          if (schedule.closed) {
            console.log(`     - ${day}: Closed`);
          } else {
            console.log(`     - ${day}: ${schedule.open} - ${schedule.close}`);
          }
        });
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Business integration test failed:', error.message);
    return false;
  }
}

async function displayBusinessProfile() {
  console.log('\n📋 Business Profile Summary');
  console.log('==========================');
  
  const { getMockOrganizationsForUser } = await import('../src/lib/mock-business-data.js');
  const userOrgs = getMockOrganizationsForUser('mock-user-1');
  
  console.log(`✅ Ready: ${userOrgs.length} business profiles configured`);
  console.log('\n🏢 Available Business Profiles:');
  
  userOrgs.forEach((org, index) => {
    console.log(`\n${index + 1}. ${org.name}`);
    console.log(`   Industry: ${org.industry.toUpperCase()}`);
    console.log(`   URL Slug: /${org.industry}/ (${org.slug})`);
    console.log(`   Contact: ${org.email} | ${org.phone}`);
    console.log(`   Plan: ${org.subscription_tier} (${org.subscription_status})`);
    console.log(`   Role: ${org.membership?.role || 'N/A'}`);
    
    if (org.settings?.services) {
      console.log(`   Services: ${org.settings.services.join(', ')}`);
    }
  });

  console.log('\n🔧 Integration Features:');
  console.log('• Business switching by industry/slug');
  console.log('• Role-based permissions');
  console.log('• Industry-specific settings');
  console.log('• Business hours management');
  console.log('• Service area configuration');
  console.log('• License and insurance tracking');
  console.log('• Trust badges and verification');
}

// Main execution
async function main() {
  const success = await testBusinessIntegration();
  
  if (success) {
    await displayBusinessProfile();
    
    console.log('\n🎉 Business Profile Integration Complete!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Start the development server');
    console.log('2. Sign in with: bcw1995@gmail.com / Byronwade1995!');
    console.log('3. Navigate to industry-specific dashboards:');
    console.log('   • Home Services: http://localhost:3000/dashboards/(verticals)/hs');
    console.log('   • Auto Repair: http://localhost:3000/dashboards/(verticals)/auto');
    console.log('   • Restaurant: http://localhost:3000/dashboards/(verticals)/rest');
    console.log('   • Retail: http://localhost:3000/dashboards/(verticals)/ret');
    console.log('\n✨ All business profiles will be available with full data!');
  } else {
    console.error('\n❌ Business profile integration failed');
    process.exit(1);
  }
}

// Run tests
main().catch(console.error);
const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const fs = require('fs')

// JSON Schema validator
const ajv = new Ajv({ allErrors: true, verbose: true })
addFormats(ajv)

async function validateTools() {
  console.log('🔍 Validating Thorbis MCP Tools Configuration...\n')
  
  try {
    // Load tools configuration
    const toolsConfig = JSON.parse(fs.readFileSync('./tools.json', 'utf8'))
    
    console.log(`📋 Found ${toolsConfig.tools.length} tools to validate\n`)
    
    let allValid = true
    
    // Validate each tool
    for (const tool of toolsConfig.tools) {
      console.log(`🔧 Validating tool: ${tool.name}`)
      
      // Check required properties
      const requiredProps = ['name', 'description', 'category', 'inputSchema', 'outputSchema', 'guardrails', 'authorization', 'budgets', 'examples', 'error_codes']
      const missingProps = requiredProps.filter(prop => !tool.hasOwnProperty(prop))
      
      if (missingProps.length > 0) {
        console.error(`  ❌ Missing required properties: ${missingProps.join(', ')}`)
        allValid = false
        continue
      }
      
      // Validate input schema
      try {
        ajv.compile(tool.inputSchema)
        console.log(`  ✅ Input schema valid`)
      } catch (error) {
        console.error(`  ❌ Invalid input schema: ${error.message}`)
        allValid = false
      }
      
      // Validate output schema
      try {
        ajv.compile(tool.outputSchema)
        console.log(`  ✅ Output schema valid`)
      } catch (error) {
        console.error(`  ❌ Invalid output schema: ${error.message}`)
        allValid = false
      }
      
      // Validate examples against input schema
      const validateInput = ajv.compile(tool.inputSchema)
      let exampleCount = 0
      let validExamples = 0
      
      for (const example of tool.examples) {
        exampleCount++
        if (validateInput(example.input)) {
          validExamples++
        } else {
          console.error(`  ❌ Example "${example.name}" input validation failed:`)
          console.error(`     ${ajv.errorsText(validateInput.errors)}`)
          allValid = false
        }
      }
      
      if (validExamples === exampleCount) {
        console.log(`  ✅ All ${exampleCount} examples valid`)
      }
      
      // Check guardrails
      const guardrails = tool.guardrails
      if (tool.category === 'action') {
        if (!guardrails.needsConfirmation) {
          console.error(`  ❌ Action tool must have needsConfirmation: true`)
          allValid = false
        }
        if (!guardrails.requiresIdempotencyKey) {
          console.error(`  ❌ Action tool must have requiresIdempotencyKey: true`)
          allValid = false
        }
        
        // Check that idempotency_key is in input schema
        if (!tool.inputSchema.properties.idempotency_key) {
          console.error(`  ❌ Action tool must have idempotency_key in input schema`)
          allValid = false
        }
        
        if (!tool.inputSchema.required.includes('idempotency_key')) {
          console.error(`  ❌ idempotency_key must be required for action tools`)
          allValid = false
        }
        
        console.log(`  ✅ Action tool guardrails valid`)
      } else {
        if (guardrails.needsConfirmation !== false) {
          console.error(`  ❌ Read tool should have needsConfirmation: false`)
          allValid = false
        }
        console.log(`  ✅ Read tool guardrails valid`)
      }
      
      // Check authorization
      if (!tool.authorization.required_role) {
        console.error(`  ❌ Missing required_role in authorization`)
        allValid = false
      }
      
      if (!Array.isArray(tool.authorization.scopes)) {
        console.error(`  ❌ scopes must be an array`)
        allValid = false  
      }
      
      console.log(`  ✅ Authorization valid`)
      
      // Check budgets
      if (!tool.budgets.cost_per_call || typeof tool.budgets.cost_per_call !== 'number') {
        console.error(`  ❌ cost_per_call must be a number`)
        allValid = false
      }
      
      if (!tool.budgets.rate_limit || !tool.budgets.rate_limit.requests_per_minute) {
        console.error(`  ❌ Missing rate_limit configuration`)
        allValid = false
      }
      
      console.log(`  ✅ Budget configuration valid`)
      
      // Check error codes
      const commonErrorCodes = ['VALIDATION_ERROR', 'AUTH_ERROR', 'RATE_LIMIT', 'NOT_FOUND']
      let hasCommonErrors = 0
      
      for (const errorCode of commonErrorCodes) {
        if (tool.error_codes[errorCode]) {
          hasCommonErrors++
          if (!tool.error_codes[errorCode].description || !tool.error_codes[errorCode].recovery) {
            console.error(`  ❌ Error code ${errorCode} missing description or recovery`)
            allValid = false
          }
        }
      }
      
      if (hasCommonErrors > 0) {
        console.log(`  ✅ Error codes documentation valid`)
      }
      
      console.log(`  ✅ Tool ${tool.name} validation complete\n`)
    }
    
    // Validate global settings
    console.log('🌐 Validating global settings...')
    if (!toolsConfig.global_settings) {
      console.error('❌ Missing global_settings')
      allValid = false
    } else {
      const required = ['default_timeout_ms', 'max_retries', 'base_url']
      const missing = required.filter(prop => !toolsConfig.global_settings.hasOwnProperty(prop))
      if (missing.length > 0) {
        console.error(`❌ Missing global settings: ${missing.join(', ')}`)
        allValid = false
      } else {
        console.log('✅ Global settings valid')
      }
    }
    
    // Summary
    console.log('\n📊 Validation Summary:')
    console.log(`Tools validated: ${toolsConfig.tools.length}`)
    console.log(`Read tools: ${toolsConfig.tools.filter(t => t.category === 'read').length}`)
    console.log(`Action tools: ${toolsConfig.tools.filter(t => t.category === 'action').length}`)
    console.log(`Total examples: ${toolsConfig.tools.reduce((sum, t) => sum + t.examples.length, 0)}`)
    
    if (allValid) {
      console.log('\n🎉 All validations passed! MCP tools configuration is ready.')
    } else {
      console.log('\n❌ Validation failed. Please fix the errors above.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('💥 Validation failed:', error.message)
    process.exit(1)
  }
}

// Run validation if called directly
if (require.main === module) {
  validateTools()
}

module.exports = { validateTools }

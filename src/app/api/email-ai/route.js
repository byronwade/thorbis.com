import { NextResponse } from "next/server"

// Mock AI functions for demo purposes
// In a real implementation, you would integrate with OpenAI, Claude, or similar AI services

export async function POST(req) {
  try {
    const body = await req.json()
    const { type } = body

    // Mock delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    switch (type) {
      case "summarize":
        return handleSummarize(body)
      case "suggest":
        return handleSuggest(body)
      case "tasks":
        return handleTasks(body)
      case "rewrite":
        return handleRewrite(body)
      case "summarizeInbox":
        return handleSummarizeInbox(body)
      case "smartFilter":
        return handleSmartFilter(body)
      case "classifyLabels":
        return handleClassifyLabels(body)
      case "suggestAssignee":
        return handleSuggestAssignee(body)
      case "assistant":
        return handleAssistant(body)
      default:
        return NextResponse.json(
          { error: "Unsupported AI operation type" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("AI API Error:", error)
    return NextResponse.json(
      { error: error.message || "AI request failed" },
      { status: 500 }
    )
  }
}

function handleSummarize({ subject, from, body: emailBody }) {
  // Mock email summarization
  const summaries = [
    "• Customer requesting HVAC maintenance service\n• Urgent timing due to equipment issues\n• Suggest scheduling technician visit within 24 hours",
    "• Payment confirmation for recent invoice\n• Customer account updated successfully\n• No further action required",
    "• New business inquiry for plumbing services\n• Commercial property needs assessment\n• Recommend scheduling site visit and providing quote",
    "• Follow-up on previous service request\n• Customer satisfaction survey response\n• Review feedback and implement improvements",
  ]
  
  const summary = summaries[Math.floor(Math.random() * summaries.length)]
  return NextResponse.json({ summary })
}

function handleSuggest({ body: emailBody }) {
  // Mock reply suggestions based on common business scenarios
  const suggestions = [
    [
      "Thank you for reaching out! I'll connect you with our service team right away to schedule your maintenance.",
      "We can schedule your HVAC maintenance for this week. What days and times work best for you?",
      "I've reviewed your request and will have our technician contact you within 2 hours to arrange the service."
    ],
    [
      "Thanks for your payment! Your invoice has been processed and your account is up to date.",
      "Payment received successfully. You'll receive an updated statement within 24 hours.",
      "Thank you for the prompt payment. Is there anything else I can help you with today?"
    ],
    [
      "Thank you for your interest in our services! I'd be happy to schedule a consultation to discuss your needs.",
      "We'd love to help with your project. Can we schedule a time to visit the property and provide a detailed quote?",
      "I've forwarded your inquiry to our commercial services team. They'll contact you within 24 hours."
    ]
  ]
  
  const randomSuggestions = suggestions[Math.floor(Math.random() * suggestions.length)]
  return NextResponse.json({ suggestions: randomSuggestions })
}

function handleTasks({ body: emailBody }) {
  // Mock task extraction
  const taskSets = [
    [
      "Schedule HVAC maintenance appointment",
      "Assign technician for service call", 
      "Send confirmation email to customer",
      "Update service schedule in system"
    ],
    [
      "Update customer payment status",
      "Generate updated account statement",
      "File payment confirmation",
      "Send receipt to customer"
    ],
    [
      "Schedule property assessment",
      "Prepare service quote",
      "Contact customer for availability",
      "Follow up within 48 hours"
    ]
  ]
  
  const tasks = taskSets[Math.floor(Math.random() * taskSets.length)]
  return NextResponse.json({ tasks })
}

function handleRewrite({ style, text: input }) {
  // Mock text rewriting based on style
  let rewritten = input
  
  switch (style) {
    case "shorten":
      // Simulate shortening
      rewritten = input.split(". ").slice(0, Math.max(1, Math.floor(input.split(". ").length / 2))).join(". ") + "."
      break
    case "friendly":
      // Add friendly tone
      rewritten = input
        .replace(/^/, "Hi there! ")
        .replace(/\.$/, ". Thanks so much!")
        .replace(/can you/gi, "could you please")
      break
    case "polish":
      // Add professional polish
      rewritten = input
        .replace(/^/, "I hope this message finds you well. ")
        .replace(/\.$/, ". Please let me know if you have any questions.")
      break
  }
  
  return NextResponse.json({ text: rewritten })
}

function handleSummarizeInbox({ threads }) {
  // Mock inbox summary
  const summaries = [
    "• 3 urgent customer service requests requiring immediate attention\n• 2 payment confirmations processed successfully\n• 1 new business inquiry for commercial services\n• Recommended: prioritize urgent requests, follow up on business inquiry within 24 hours",
    "• Multiple HVAC maintenance requests scheduled for this week\n• Several billing inquiries resolved\n• New lead generation from website contact form\n• Suggested: ensure adequate technician coverage, prepare standard service quotes",
    "• Emergency plumbing calls prioritized and assigned\n• Regular maintenance appointments confirmed\n• Follow-up communications sent to satisfied customers\n• Next steps: review emergency response times, schedule routine inspections"
  ]
  
  const summary = summaries[Math.floor(Math.random() * summaries.length)]
  return NextResponse.json({ summary })
}

function handleSmartFilter({ query }) {
  // Parse natural language into structured filters
  const q = query.toLowerCase()
  
  let filter = "all"
  let assignFilter = "all" 
  let labelFilter = null
  let searchQuery = query

  // Determine filter type
  if (q.includes("unread")) filter = "unread"
  if (q.includes("starred") || q.includes("star")) filter = "starred"
  
  // Determine assignment filter
  if (q.includes("assigned to me") || q.includes("my")) assignFilter = "assignedToMe"
  if (q.includes("unassigned")) assignFilter = "unassigned"
  
  // Determine label filter
  const labelMatches = q.match(/\b(support|billing|hvac|plumbing|emergency|lead|quote|commercial|residential|maintenance|repair|installation)\b/i)
  if (labelMatches) {
    labelFilter = labelMatches[0].charAt(0).toUpperCase() + labelMatches[0].slice(1)
  }
  
  // Clean up search query
  searchQuery = query
    .replace(/\b(unread|starred|star|assigned to me|my|unassigned|support|billing|hvac|plumbing|emergency|lead|quote|commercial|residential|maintenance|repair|installation)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()

  return NextResponse.json({
    filter,
    assignFilter, 
    labelFilter,
    query: searchQuery
  })
}

function handleClassifyLabels({ subject, preview, allowed }) {
  // Mock label classification
  const text = `${subject} ${preview}`.toLowerCase()
  const labels = []
  
  // Simple keyword matching for demo
  if (text.includes("urgent") || text.includes("emergency")) labels.push("Priority")
  if (text.includes("hvac") || text.includes("heating") || text.includes("cooling")) labels.push("HVAC") 
  if (text.includes("plumbing") || text.includes("pipe") || text.includes("water")) labels.push("Plumbing")
  if (text.includes("billing") || text.includes("payment") || text.includes("invoice")) labels.push("Billing")
  if (text.includes("support") || text.includes("help")) labels.push("Support")
  if (text.includes("quote") || text.includes("estimate")) labels.push("Quote")
  if (text.includes("maintenance") || text.includes("service")) labels.push("Maintenance")
  
  // Filter to only allowed labels
  const filteredLabels = labels.filter(l => allowed.includes(l))
  
  return NextResponse.json({ 
    labels: filteredLabels.slice(0, 3) // Max 3 labels
  })
}

function handleSuggestAssignee({ subject, preview, users }) {
  // Mock assignee suggestion based on content
  const text = `${subject} ${preview}`.toLowerCase()
  
  let suggestedUserId = null
  
  // Simple routing logic for demo
  if (text.includes("billing") || text.includes("payment") || text.includes("invoice")) {
    // Assign billing issues to billing team
    const billingUser = users.find(u => u.role?.toLowerCase().includes("billing"))
    suggestedUserId = billingUser?.id || null
  } else if (text.includes("hvac") || text.includes("plumbing") || text.includes("maintenance")) {
    // Assign technical issues to support team
    const supportUser = users.find(u => u.role?.toLowerCase().includes("support"))
    suggestedUserId = supportUser?.id || null
  } else if (text.includes("quote") || text.includes("estimate") || text.includes("commercial")) {
    // Assign sales inquiries to success team
    const successUser = users.find(u => u.role?.toLowerCase().includes("success"))
    suggestedUserId = successUser?.id || null
  }
  
  return NextResponse.json({ userId: suggestedUserId })
}

function handleAssistant({ prompt }) {
  // Mock AI assistant responses
  const responses = [
    "I can help you manage your email workflow more efficiently. Would you like me to prioritize urgent messages or help draft responses?",
    "Based on your recent emails, I notice several customer service requests. I recommend addressing the HVAC maintenance requests first as they appear time-sensitive.",
    "I can help you automate responses to common inquiries. Would you like me to create templates for scheduling appointments or billing questions?",
    "Your inbox shows a good mix of customer communications. I suggest setting up rules to automatically label and route similar messages in the future.",
    "I see you have several follow-up tasks. Would you like me to help prioritize them based on urgency and customer impact?"
  ]
  
  const response = responses[Math.floor(Math.random() * responses.length)]
  return NextResponse.json({ text: response })
}

# Thorbis RAG Example Retrieval

Demonstration of intelligent retrieval with temporal context (as_of timestamps) and entity cross-references in real query scenarios.

## 🔍 Example Query: HVAC Installation Pricing and Procedures

This realistic query/response example demonstrates the full RAG pipeline in action:

### Input Query
```json
{
  "query_id": "q_20240115_143022_001",
  "query_text": "What's the current pricing for residential HVAC installation and what safety procedures should I follow?",
  "tenant_id": "tenant_elite_hvac",
  "user_context": {
    "user_id": "usr_technician_mike",
    "user_role": "technician", 
    "current_business_type": "field_services",
    "active_services": ["HVAC Installation", "HVAC Repair"],
    "location": "Metro Area"
  },
  "retrieval_options": {
    "max_results": 5,
    "enable_reranking": true,
    "include_entity_context": true,
    "min_relevance_score": 0.75
  },
  "timestamp": "2024-01-15T14:30:22Z"
}
```

### Retrieval Results with Temporal Context

Full RetrievalResult with comprehensive SearchResult data:

```json
{
  "query_id": "q_20240115_143022_001",
  "results": [
    // SearchResult entries below
  ],
  "total_candidates": 47,
  "search_time_ms": 234,
  "rerank_time_ms": 89,
  "cache_hit": false
}
```

#### Result 1: Current Pricing Information
```json
{
  "chunk_id": "chunk_hvac_pricing_2024_001",
  "document_id": "pricebook_elite_2024_q1",
  "source_type": "pricebook",
  "title": "Residential HVAC Installation - Q1 2024 Pricing",
  "relevance_score": 0.94,
  "keyword_score": 0.89,
  "vector_score": 0.92,
  "rerank_score": 0.96,
  
  "content": "Residential HVAC Installation pricing effective January 1, 2024:\n\nStandard Installation (up to 3-ton unit):\n- Base labor: $2,400\n- Equipment markup: 35%\n- Typical total: $4,200-$5,800\n\nComplex Installation (3+ ton, ductwork modifications):\n- Base labor: $3,200\n- Additional complexity fee: $800-1,500\n- Typical total: $6,500-$9,200\n\nUrgency premiums:\n- Same day: +50%\n- Next day: +25%\n- Weekend: +40%",
  
  "as_of": "2024-01-01T00:00:00Z",
  "confidence_score": 0.97,
  "age_score": 0.93,
  
  "entities": [
    {
      "entity_id": "svc_hvac_install",
      "entity_name": "HVAC Installation",
      "entity_type": "service",
      "mention_text": "Residential HVAC Installation",
      "confidence": 0.98
    },
    {
      "entity_id": "pricing_2024_q1",
      "entity_name": "Q1 2024 Pricing",
      "entity_type": "pricing_period",
      "mention_text": "effective January 1, 2024",
      "confidence": 0.95
    }
  ],
  
  "entity_back_refs": [
    {
      "entity_id": "svc_hvac_install",
      "entity_name": "HVAC Installation", 
      "relationship": "describes",
      "context_summary": "[As of 2024-01-01T00:00:00Z] Standard residential HVAC installation includes system sizing, ductwork assessment, and equipment placement with comprehensive testing protocols...",
      "relevance_score": 0.94
    },
    {
      "entity_id": "equip_carrier_24acc6",
      "entity_name": "Carrier 24ACC6 Heat Pump",
      "relationship": "references",
      "context_summary": "[As of 2023-12-15T10:30:00Z] Carrier 24ACC6 is our most popular 3-ton heat pump unit for residential installations, featuring high efficiency ratings and 10-year warranty...",
      "relevance_score": 0.87
    }
  ],
  
  "source_metadata": {
    "approved_by": "manager_sarah",
    "approval_date": "2023-12-28T16:45:00Z",
    "version": "2024.1.0",
    "next_review": "2024-04-01T00:00:00Z"
  }
}
```

#### Result 2: Safety Procedures
```json
{
  "chunk_id": "chunk_sop_hvac_safety_003", 
  "document_id": "sop_hvac_safety_comprehensive",
  "source_type": "standard_operating_procedure",
  "title": "SOP-HVAC-003: Residential Installation Safety Protocol",
  "relevance_score": 0.92,
  "keyword_score": 0.85,
  "vector_score": 0.94,
  "rerank_score": 0.93,
  
  "content": "HVAC Installation Safety Protocol - Residential\n\nPre-Installation Safety Checklist:\n1. Verify electrical power disconnection\n2. Test for gas leaks in existing lines\n3. Inspect structural integrity of installation area\n4. Confirm proper ventilation and clearances\n\nRequired PPE:\n- Safety glasses with side shields\n- Hard hat in basement/crawl space work\n- Steel-toed boots\n- Work gloves (cut-resistant Level 2)\n- Respiratory protection when handling refrigerants\n\nCritical Safety Steps:\n- Never work on live electrical systems\n- Use lockout/tagout procedures on all power sources\n- Maintain 3-foot clearance around equipment\n- Test refrigerant lines for leaks before system startup",
  
  "as_of": "2023-11-15T09:00:00Z",
  "confidence_score": 0.95,
  "age_score": 0.89,
  
  "entities": [
    {
      "entity_id": "sop_hvac_003",
      "entity_name": "SOP-HVAC-003",
      "entity_type": "procedure",
      "mention_text": "SOP-HVAC-003: Residential Installation Safety Protocol",
      "confidence": 0.99
    },
    {
      "entity_id": "ppe_requirements",
      "entity_name": "Personal Protective Equipment",
      "entity_type": "safety_requirement",
      "mention_text": "Required PPE",
      "confidence": 0.94
    }
  ],
  
  "entity_back_refs": [
    {
      "entity_id": "cert_epa608",
      "entity_name": "EPA 608 Certification", 
      "relationship": "requires",
      "context_summary": "[As of 2023-10-01T00:00:00Z] All technicians performing refrigerant handling must maintain current EPA 608 certification with annual refresher training...",
      "relevance_score": 0.91
    },
    {
      "entity_id": "tool_refrigerant_detector",
      "entity_name": "Electronic Refrigerant Detector",
      "relationship": "mentions",
      "context_summary": "[As of 2023-11-01T14:20:00Z] Inficon TEK-Mate refrigerant detector is required equipment for all installation and service calls, with monthly calibration checks...",
      "relevance_score": 0.78
    }
  ]
}
```

#### Result 3: Equipment Specifications with Temporal Updates
```json
{
  "chunk_id": "chunk_carrier_24acc6_specs_2024",
  "document_id": "equipment_catalog_carrier_2024",
  "source_type": "services_catalog",
  "title": "Carrier 24ACC6 Heat Pump - 2024 Specifications",
  "relevance_score": 0.88,
  "keyword_score": 0.82,
  "vector_score": 0.90,
  "rerank_score": 0.89,
  
  "content": "Carrier 24ACC6 3-Ton Heat Pump System\n\nUpdated Specifications (Effective January 2024):\n- Cooling Capacity: 36,000 BTU/hr\n- Heating Capacity: 38,000 BTU/hr (at 47°F)\n- SEER Rating: 16.0 (updated from 15.5)\n- HSPF Rating: 9.5\n- Sound Level: 69 dB\n- Refrigerant: R-410A\n- Warranty: 10 years parts, 5 years labor\n\nInstallation Requirements:\n- Minimum clearances: 24\" sides, 60\" service access\n- Electrical: 240V, 30A circuit\n- Refrigerant line set: 3/8\" liquid, 7/8\" suction\n- Recommended installation time: 6-8 hours\n\nCost Information:\n- Wholesale cost: $3,200 (updated Jan 2024)\n- Suggested retail: $4,320 (35% markup)\n- Installation labor: 6 hours @ $400/hr = $2,400",
  
  "as_of": "2024-01-08T11:15:00Z",
  "confidence_score": 0.96,
  "age_score": 0.98,
  
  "entities": [
    {
      "entity_id": "equip_carrier_24acc6",
      "entity_name": "Carrier 24ACC6 Heat Pump",
      "entity_type": "product",
      "mention_text": "Carrier 24ACC6 3-Ton Heat Pump System",
      "confidence": 0.99
    },
    {
      "entity_id": "spec_seer_16",
      "entity_name": "SEER 16.0 Rating",
      "entity_type": "efficiency_rating", 
      "mention_text": "SEER Rating: 16.0 (updated from 15.5)",
      "confidence": 0.97
    }
  ],
  
  "entity_back_refs": [
    {
      "entity_id": "cert_energy_star",
      "entity_name": "Energy Star Certification",
      "relationship": "qualifies_for",
      "context_summary": "[As of 2024-01-01T00:00:00Z] Units with SEER 16.0+ qualify for Energy Star certification and federal tax credits up to $2,000...",
      "relevance_score": 0.85
    },
    {
      "entity_id": "warranty_carrier_10yr",
      "entity_name": "Carrier 10-Year Warranty",
      "relationship": "includes",
      "context_summary": "[As of 2023-12-01T00:00:00Z] Carrier extended warranty covers compressor and heat exchanger with registration within 90 days of installation...",
      "relevance_score": 0.82
    }
  ]
}
```

### AI-Generated Response with Entity Links and Temporal Context

This response demonstrates how entity_links provide seamless navigation between related information:

```markdown
Based on the most current information available in our system, here's what you need to know about residential HVAC installation pricing and safety procedures:

## Current Pricing (As of January 1, 2024)

For **residential HVAC installation**, our Q1 2024 pricing structure is:

**Standard Installation (up to 3-ton unit):**
- Base labor: $2,400
- Equipment markup: 35% 
- **Typical total range: $4,200-$5,800**

**Complex Installation (3+ ton, ductwork modifications):**
- Base labor: $3,200
- Complexity fee: $800-$1,500 additional
- **Typical total range: $6,500-$9,200**

*Note: These prices are effective as of January 1, 2024, and include urgency premiums for rush jobs (same-day +50%, next-day +25%, weekend +40%).*

### Popular Equipment Example
The **[Carrier 24ACC6 Heat Pump](entity:equip_carrier_24acc6)** is our most recommended 3-ton unit:
- Updated wholesale cost: $3,200 (as of January 8, 2024)
- Retail price: $4,320 (35% markup)
- **New improved SEER rating: 16.0** (upgraded from 15.5 in 2024)
- Qualifies for **[Energy Star tax credits](entity:cert_energy_star)** up to $2,000

## Essential Safety Procedures

Following **[SOP-HVAC-003](entity:sop_hvac_003)** (last updated November 15, 2023), here are the critical safety requirements:

### Pre-Installation Safety Checklist:
1. ✅ Verify electrical power disconnection
2. ✅ Test for gas leaks in existing lines  
3. ✅ Inspect structural integrity of installation area
4. ✅ Confirm proper ventilation and clearances

### Required PPE:
- Safety glasses with side shields
- Hard hat (basement/crawl space work)
- Steel-toed boots
- Cut-resistant work gloves (Level 2)
- Respiratory protection for refrigerant handling

### Critical Safety Rules:
- **Never work on live electrical systems**
- Use lockout/tagout procedures on all power sources
- Maintain 3-foot clearance around equipment
- Test refrigerant lines for leaks before startup

### Certification Requirements:
All technicians must maintain current **[EPA 608 Certification](entity:cert_epa608)** for refrigerant handling, with annual refresher training required.

---

**Data Freshness Note:** This information combines our most recent pricing data (effective January 1, 2024), current safety protocols (updated November 15, 2023), and latest equipment specifications (updated January 8, 2024). All linked entities provide additional context and cross-references to related procedures, certifications, and equipment details.

**Next scheduled pricing review:** April 1, 2024
```

### Retrieval Analytics for This Query

```json
{
  "query_analytics": {
    "query_id": "q_20240115_143022_001",
    "processing_time_ms": 234,
    "results_returned": 3,
    "results_filtered": 12,
    "total_candidates": 47,
    
    "search_breakdown": {
      "keyword_matches": 23,
      "vector_matches": 31, 
      "hybrid_fusion_applied": true,
      "reranking_applied": true,
      "rerank_time_ms": 89
    },
    
    "relevance_metrics": {
      "average_relevance": 0.913,
      "min_relevance": 0.88,
      "max_relevance": 0.94,
      "relevance_distribution": [0.94, 0.92, 0.88]
    },
    
    "temporal_analysis": {
      "freshest_result": "2024-01-08T11:15:00Z",
      "oldest_result": "2023-11-15T09:00:00Z",
      "average_age_days": 28,
      "temporal_relevance_boost": 0.05
    },
    
    "entity_context": {
      "entities_identified": 8,
      "cross_references_included": 6,
      "entity_relevance_boost": 0.12,
      "back_references_resolved": 6
    },
    
    "cache_status": {
      "cache_hit": false,
      "cached_result": true,
      "cache_key": "hvac_pricing_safety_elite_tech",
      "cache_ttl_hours": 2
    }
  }
}
```

## 🔄 Follow-up Query Example: "What about warranty coverage?"

### Contextual Follow-up Response
```json
{
  "follow_up_query": {
    "query_text": "What about warranty coverage?",
    "context_from_previous": [
      "entity:equip_carrier_24acc6",
      "entity:warranty_carrier_10yr", 
      "entity:svc_hvac_install"
    ],
    "inferred_intent": "warranty_information_for_hvac_installation"
  }
}
```

### Enhanced Response with Entity Context
```markdown
## Warranty Coverage for HVAC Installation

Based on your previous query about the **[Carrier 24ACC6 Heat Pump](entity:equip_carrier_24acc6)**, here's the complete warranty information:

### Equipment Warranty (As of December 1, 2023)
The **[Carrier 10-Year Warranty](entity:warranty_carrier_10yr)** includes:
- **Parts coverage:** 10 years (compressor and heat exchanger)
- **Labor coverage:** 5 years
- **Registration requirement:** Must register within 90 days of installation

### Installation Warranty
Our **[HVAC Installation Service](entity:svc_hvac_install)** includes:
- **Workmanship guarantee:** 1 year on all installation labor
- **System startup guarantee:** 30 days performance assurance
- **Emergency callback:** No charge for installation-related issues within 30 days

### Energy Star Benefits
Since this unit qualifies for **[Energy Star certification](entity:cert_energy_star)** with its 16.0 SEER rating:
- Federal tax credit: Up to $2,000 (as of January 1, 2024)
- Extended manufacturer warranty options available
- Utility rebate eligibility (varies by location)

*Information current as of our warranty terms updated December 1, 2023.*
```

This example demonstrates how the Thorbis RAG system provides contextually relevant responses with precise temporal information (as_of timestamps) and rich entity cross-references that enable users to explore related information seamlessly.

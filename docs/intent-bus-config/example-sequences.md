# Thorbis Intent Bus Example Sequences

Five comprehensive example intent sequences demonstrating URL navigation, UI state changes, and proper handling of unsupported commands.

## 🎯 Example Sequences Overview

Each example shows:
- **Initial State**: Starting URL and UI state
- **Intent Sequence**: Ordered list of intents with validation
- **Expected Results**: Final URL and UI state changes
- **Performance Metrics**: Timing and execution details
- **Error Handling**: How failures are managed

---

## 📋 Example 1: Home Services Work Order Management Flow

**Scenario**: AI assistant helps user navigate from dashboard to work orders, apply filters, and open a work order for editing.

### Initial State
```json
{
  "url": "/hs/app/dashboard",
  "ui_state": {
    "active_panels": [],
    "table_states": {},
    "theme": { "color_scheme": "dark", "density": "comfortable" },
    "user_context": {
      "industry": "hs",
      "tenant_id": "tenant_acme_hvac", 
      "user_id": "user_john_doe",
      "permissions": ["work_orders.read", "work_orders.write", "customers.read"]
    }
  }
}
```

### Intent Sequence

#### Intent 1: Navigate to Work Orders
```json
{
  "type": "NAVIGATE",
  "intent_id": "intent_nav_workorders_001",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "origin": "AI",
  "payload": {
    "route": "/hs/app/work-orders",
    "params": {},
    "query": {},
    "replace": false
  },
  "metadata": {
    "session_id": "session_123",
    "tenant_id": "tenant_acme_hvac",
    "user_id": "user_john_doe",
    "correlation_id": "flow_workorder_management_001"
  }
}
```

**Expected Result**: 
- URL changes to `/hs/app/work-orders`
- Work orders table loads with default state
- Navigation occurs in ~150ms

#### Intent 2: Apply Status Filter to Table
```json
{
  "type": "SET_TABLE_STATE", 
  "intent_id": "intent_filter_status_001",
  "timestamp": "2024-01-15T10:30:01.200Z",
  "origin": "AI",
  "payload": {
    "table_id": "work-orders-table",
    "state_update": {
      "filters": [
        {
          "field": "status",
          "operator": "in",
          "value": ["scheduled", "in_progress"],
          "data_type": "enum"
        }
      ]
    },
    "merge_strategy": "merge"
  },
  "metadata": {
    "correlation_id": "flow_workorder_management_001"
  }
}
```

**Expected Result**:
- Table filters to show only scheduled and in-progress work orders
- URL updates to `/hs/app/work-orders?status=scheduled,in_progress`
- Filter applied in ~80ms

#### Intent 3: Sort by Priority  
```json
{
  "type": "SET_TABLE_STATE",
  "intent_id": "intent_sort_priority_001", 
  "timestamp": "2024-01-15T10:30:02.100Z",
  "origin": "USER",
  "payload": {
    "table_id": "work-orders-table",
    "state_update": {
      "sorting": [
        {
          "field": "priority",
          "direction": "desc"
        }
      ]
    },
    "merge_strategy": "merge"
  },
  "metadata": {
    "correlation_id": "flow_workorder_management_001"
  }
}
```

**Expected Result**:
- Table sorted by priority (high to low)
- URL updates to `/hs/app/work-orders?status=scheduled,in_progress&sort=priority:desc`
- Sort applied in ~60ms

#### Intent 4: Open Work Order Detail Panel
```json
{
  "type": "OPEN_MODAL",
  "intent_id": "intent_open_wo_detail_001",
  "timestamp": "2024-01-15T10:30:03.500Z", 
  "origin": "USER",
  "payload": {
    "panel_type": "detail_panel",
    "panel_id": "work-order-detail-wo_12345",
    "content_type": "details",
    "context": {
      "entity_id": "wo_12345",
      "entity_type": "work_order",
      "action": "view"
    },
    "panel_config": {
      "width": "lg",
      "position": "right",
      "closable": true,
      "auto_focus": true
    }
  },
  "metadata": {
    "correlation_id": "flow_workorder_management_001"
  }
}
```

**Expected Result**:
- Right sidebar panel opens showing work order details
- URL updates to `/hs/app/work-orders/wo_12345?status=scheduled,in_progress&sort=priority:desc`
- Panel opens in ~120ms
- Focus moves to first interactive element in panel

#### Intent 5: Switch Panel to Edit Mode
```json
{
  "type": "OPEN_MODAL",
  "intent_id": "intent_edit_wo_001",
  "timestamp": "2024-01-15T10:30:05.200Z",
  "origin": "USER", 
  "payload": {
    "panel_type": "inline_form",
    "panel_id": "work-order-edit-wo_12345",
    "content_type": "form",
    "context": {
      "entity_id": "wo_12345",
      "entity_type": "work_order", 
      "action": "edit"
    },
    "panel_config": {
      "width": "xl",
      "position": "right",
      "closable": true,
      "auto_focus": true
    },
    "data": {
      "work_order_id": "wo_12345",
      "form_mode": "edit"
    }
  },
  "metadata": {
    "correlation_id": "flow_workorder_management_001"
  }
}
```

**Expected Result**:
- Panel switches to edit form mode
- URL updates to `/hs/app/work-orders/wo_12345/edit?status=scheduled,in_progress&sort=priority:desc`
- Form loads with current work order data in ~90ms
- Form validation is active

### Final State
```json
{
  "url": "/hs/app/work-orders/wo_12345/edit?status=scheduled,in_progress&sort=priority:desc",
  "ui_state": {
    "active_panels": ["work-order-edit-wo_12345"],
    "table_states": {
      "work-orders-table": {
        "filters": [{"field": "status", "operator": "in", "value": ["scheduled", "in_progress"]}],
        "sorting": [{"field": "priority", "direction": "desc"}],
        "pagination": {"page": 1, "page_size": 25}
      }
    },
    "theme": { "color_scheme": "dark", "density": "comfortable" },
    "form_states": {
      "work-order-edit-wo_12345": {
        "loaded": true,
        "dirty": false,
        "valid": true
      }
    }
  },
  "performance_summary": {
    "total_sequence_time": "5.7s",
    "intents_executed": 5,
    "average_intent_time": "102ms",
    "navigation_time": "150ms",
    "ui_updates": 4
  }
}
```

---

## 🍽️ Example 2: Restaurant POS Order Management 

**Scenario**: User navigates to orders table, filters for today's orders, selects multiple orders for batch printing.

### Initial State
```json
{
  "url": "/rest/app/dashboard",
  "ui_state": {
    "active_panels": [],
    "table_states": {},
    "theme": { "color_scheme": "light", "density": "compact" },
    "user_context": {
      "industry": "rest",
      "tenant_id": "tenant_joes_diner",
      "user_id": "user_sarah_mgr", 
      "permissions": ["orders.read", "orders.export", "printers.access"]
    }
  }
}
```

### Intent Sequence

#### Intent 1: Navigate to Orders
```json
{
  "type": "NAVIGATE",
  "intent_id": "intent_nav_orders_001",
  "timestamp": "2024-01-15T14:15:00.000Z",
  "origin": "USER",
  "payload": {
    "route": "/rest/app/orders",
    "params": {},
    "query": {},
    "replace": false
  },
  "metadata": {
    "correlation_id": "flow_batch_print_orders_001"
  }
}
```

#### Intent 2: Filter for Today's Orders
```json
{
  "type": "SET_TABLE_STATE",
  "intent_id": "intent_filter_today_001",
  "timestamp": "2024-01-15T14:15:01.100Z",
  "origin": "USER",
  "payload": {
    "table_id": "orders-table", 
    "state_update": {
      "filters": [
        {
          "field": "order_date",
          "operator": "between",
          "value": ["2024-01-15T00:00:00Z", "2024-01-15T23:59:59Z"],
          "data_type": "datetime"
        }
      ]
    }
  },
  "metadata": {
    "correlation_id": "flow_batch_print_orders_001"
  }
}
```

#### Intent 3: Select Multiple Orders
```json
{
  "type": "SET_TABLE_STATE",
  "intent_id": "intent_select_orders_001",
  "timestamp": "2024-01-15T14:15:03.200Z", 
  "origin": "USER",
  "payload": {
    "table_id": "orders-table",
    "state_update": {
      "selection": {
        "selected_rows": ["order_789", "order_790", "order_791", "order_792"]
      }
    },
    "merge_strategy": "replace"
  },
  "metadata": {
    "correlation_id": "flow_batch_print_orders_001"
  }
}
```

#### Intent 4: Open Batch Actions Panel
```json
{
  "type": "OPEN_MODAL",
  "intent_id": "intent_batch_actions_001",
  "timestamp": "2024-01-15T14:15:04.800Z",
  "origin": "SYSTEM",
  "payload": {
    "panel_type": "action_panel",
    "panel_id": "batch-actions-orders",
    "content_type": "actions",
    "context": {
      "entity_type": "order",
      "action": "batch"
    },
    "panel_config": {
      "width": "md",
      "position": "below",
      "closable": true
    },
    "data": {
      "selected_count": 4,
      "available_actions": ["print", "export", "email", "mark_completed"]
    }
  },
  "metadata": {
    "correlation_id": "flow_batch_print_orders_001"
  }
}
```

#### Intent 5: Execute Batch Print
```json
{
  "type": "RUN_CLIENT_ACTION",
  "intent_id": "intent_print_orders_001",
  "timestamp": "2024-01-15T14:15:06.500Z",
  "origin": "USER",
  "payload": {
    "action": "print_document",
    "parameters": {
      "target": "batch-orders",
      "format": "pdf",
      "data": {
        "order_ids": ["order_789", "order_790", "order_791", "order_792"],
        "print_type": "kitchen_tickets"
      },
      "options": {
        "title": "Kitchen Tickets - Batch Print",
        "confirm_required": true
      }
    },
    "safety_checks": {
      "requires_user_consent": true,
      "data_access_level": "tenant_data"
    }
  },
  "metadata": {
    "correlation_id": "flow_batch_print_orders_001"
  }
}
```

### Final State
```json
{
  "url": "/rest/app/orders?date=2024-01-15&selected=4",
  "ui_state": {
    "active_panels": ["batch-actions-orders"],
    "table_states": {
      "orders-table": {
        "filters": [{"field": "order_date", "operator": "between", "value": ["2024-01-15T00:00:00Z", "2024-01-15T23:59:59Z"]}],
        "selection": {"selected_rows": ["order_789", "order_790", "order_791", "order_792"]}
      }
    },
    "action_states": {
      "batch_print": "completed",
      "print_confirmation": "shown"
    }
  },
  "performance_summary": {
    "total_sequence_time": "6.8s", 
    "intents_executed": 5,
    "print_generation_time": "1.2s",
    "user_confirmations": 1
  }
}
```

---

## 🚗 Example 3: Auto Services Estimate Creation with Theme Change

**Scenario**: AI helps create estimate, user changes to high contrast theme mid-process, and continues with estimate.

### Initial State
```json
{
  "url": "/auto/app/estimates",
  "ui_state": {
    "active_panels": [],
    "theme": { "color_scheme": "light", "density": "comfortable", "high_contrast": false },
    "user_context": {
      "industry": "auto",
      "tenant_id": "tenant_bobs_auto",
      "accessibility_mode": false
    }
  }
}
```

### Intent Sequence

#### Intent 1: Open New Estimate Form
```json
{
  "type": "OPEN_MODAL",
  "intent_id": "intent_new_estimate_001",
  "timestamp": "2024-01-15T09:00:00.000Z",
  "origin": "AI",
  "payload": {
    "panel_type": "inline_form",
    "panel_id": "new-estimate-form",
    "content_type": "form",
    "context": {
      "entity_type": "estimate",
      "action": "create"
    },
    "panel_config": {
      "width": "full",
      "position": "inline"
    }
  },
  "metadata": {
    "correlation_id": "flow_estimate_creation_001"
  }
}
```

#### Intent 2: User Enables High Contrast Mode
```json
{
  "type": "SET_THEME",
  "intent_id": "intent_theme_contrast_001",
  "timestamp": "2024-01-15T09:00:15.300Z",
  "origin": "USER",
  "payload": {
    "theme_updates": {
      "high_contrast": true,
      "color_scheme": "light"
    },
    "scope": "user",
    "apply_immediately": true
  },
  "metadata": {
    "correlation_id": "flow_estimate_creation_001"
  }
}
```

#### Intent 3: AI Continues with Customer Selection
```json
{
  "type": "SET_TABLE_STATE",
  "intent_id": "intent_customer_search_001", 
  "timestamp": "2024-01-15T09:00:16.100Z",
  "origin": "AI",
  "payload": {
    "table_id": "customer-selector",
    "state_update": {
      "filters": [
        {
          "field": "name",
          "operator": "contains", 
          "value": "Johnson",
          "data_type": "string"
        }
      ]
    }
  },
  "metadata": {
    "correlation_id": "flow_estimate_creation_001"
  }
}
```

#### Intent 4: Navigate to Estimate Detail
```json
{
  "type": "NAVIGATE", 
  "intent_id": "intent_nav_estimate_detail_001",
  "timestamp": "2024-01-15T09:00:25.800Z",
  "origin": "AI",
  "payload": {
    "route": "/auto/app/estimates/new",
    "params": {
      "customer_id": "cust_johnson_123"
    },
    "query": {
      "step": "services"
    }
  },
  "metadata": {
    "correlation_id": "flow_estimate_creation_001"
  }
}
```

#### Intent 5: Copy Previous Estimate Data
```json
{
  "type": "RUN_CLIENT_ACTION",
  "intent_id": "intent_copy_estimate_001",
  "timestamp": "2024-01-15T09:00:30.200Z", 
  "origin": "USER",
  "payload": {
    "action": "copy_to_clipboard",
    "parameters": {
      "target": "estimate-est_456",
      "data": {
        "estimate_id": "est_456",
        "copy_fields": ["services", "labor_hours", "parts"]
      },
      "options": {
        "title": "Estimate data copied",
        "timeout_ms": 3000
      }
    },
    "safety_checks": {
      "data_access_level": "current_page"
    }
  },
  "metadata": {
    "correlation_id": "flow_estimate_creation_001"
  }
}
```

### Final State
```json
{
  "url": "/auto/app/estimates/new?customer_id=cust_johnson_123&step=services",
  "ui_state": {
    "active_panels": ["new-estimate-form"],
    "table_states": {
      "customer-selector": {
        "filters": [{"field": "name", "operator": "contains", "value": "Johnson"}]
      }
    },
    "theme": { 
      "color_scheme": "light", 
      "density": "comfortable", 
      "high_contrast": true 
    },
    "clipboard_data": "estimate_services_copied",
    "accessibility_mode": true
  },
  "performance_summary": {
    "total_sequence_time": "30.5s",
    "theme_change_time": "200ms", 
    "accessibility_enabled": true,
    "clipboard_operation": "completed"
  }
}
```

---

## 🛍️ Example 4: Retail Inventory Management with Error Recovery

**Scenario**: Navigate to inventory, attempt unsupported action, system recovers gracefully, continues with supported action.

### Initial State
```json
{
  "url": "/ret/app/dashboard",
  "ui_state": {
    "active_panels": [],
    "user_context": {
      "industry": "ret",
      "tenant_id": "tenant_main_street_retail"
    }
  }
}
```

### Intent Sequence

#### Intent 1: Navigate to Inventory 
```json
{
  "type": "NAVIGATE",
  "intent_id": "intent_nav_inventory_001",
  "timestamp": "2024-01-15T11:30:00.000Z",
  "origin": "USER",
  "payload": {
    "route": "/ret/app/inventory",
    "params": {},
    "query": {"view": "low_stock"}
  },
  "metadata": {
    "correlation_id": "flow_inventory_management_001"
  }
}
```

#### Intent 2: Attempt Unsupported Intent (Should be rejected safely)
```json
{
  "type": "DELETE_ALL_DATA",
  "intent_id": "intent_unsupported_001", 
  "timestamp": "2024-01-15T11:30:02.500Z",
  "origin": "AI",
  "payload": {
    "target": "all_inventory",
    "confirm": false
  },
  "metadata": {
    "correlation_id": "flow_inventory_management_001"
  }
}
```

**Expected Result**: 
- Intent rejected with error code `INTENT_TYPE_UNSUPPORTED`
- Error logged safely with no-op execution
- Suggested alternative provided
- User notified via toast notification

#### Intent 3: Filter Low Stock Items (After Recovery)
```json
{
  "type": "SET_TABLE_STATE",
  "intent_id": "intent_filter_lowstock_001",
  "timestamp": "2024-01-15T11:30:03.200Z",
  "origin": "AI", 
  "payload": {
    "table_id": "inventory-table",
    "state_update": {
      "filters": [
        {
          "field": "stock_level",
          "operator": "le",
          "value": 10,
          "data_type": "number"
        }
      ]
    }
  },
  "metadata": {
    "correlation_id": "flow_inventory_management_001"
  }
}
```

#### Intent 4: Show Toast Notification for Low Stock
```json
{
  "type": "RUN_CLIENT_ACTION",
  "intent_id": "intent_toast_lowstock_001",
  "timestamp": "2024-01-15T11:30:04.100Z",
  "origin": "SYSTEM",
  "payload": {
    "action": "show_toast",
    "parameters": {
      "data": {
        "message": "Found 23 items with low stock levels",
        "type": "warning",
        "action_text": "Reorder Now"
      },
      "options": {
        "timeout_ms": 8000
      }
    },
    "safety_checks": {
      "requires_user_consent": false,
      "data_access_level": "current_page"
    }
  },
  "metadata": {
    "correlation_id": "flow_inventory_management_001"
  }
}
```

#### Intent 5: Open Reorder Panel
```json
{
  "type": "OPEN_MODAL",
  "intent_id": "intent_reorder_panel_001", 
  "timestamp": "2024-01-15T11:30:06.800Z",
  "origin": "USER",
  "payload": {
    "panel_type": "action_panel",
    "panel_id": "bulk-reorder-panel",
    "content_type": "actions",
    "context": {
      "entity_type": "product",
      "action": "bulk_reorder"
    },
    "panel_config": {
      "width": "lg",
      "position": "right"
    },
    "data": {
      "low_stock_items": 23,
      "total_estimated_cost": 12500.00
    }
  },
  "metadata": {
    "correlation_id": "flow_inventory_management_001"
  }
}
```

### Final State (with Error Recovery)
```json
{
  "url": "/ret/app/inventory?view=low_stock&filter=stock_le_10",
  "ui_state": {
    "active_panels": ["bulk-reorder-panel"],
    "table_states": {
      "inventory-table": {
        "filters": [{"field": "stock_level", "operator": "le", "value": 10}]
      }
    },
    "toast_notifications": [{
      "id": "toast_lowstock_001",
      "message": "Found 23 items with low stock levels",
      "type": "warning",
      "visible": true
    }],
    "error_log": [{
      "intent_id": "intent_unsupported_001",
      "error_code": "INTENT_TYPE_UNSUPPORTED",
      "handled_safely": true,
      "no_op_executed": true
    }]
  },
  "performance_summary": {
    "total_sequence_time": "7.1s",
    "intents_executed": 4,
    "intents_rejected": 1, 
    "error_recovery_time": "50ms",
    "safe_error_handling": true
  }
}
```

---

## 📊 Example 5: Cross-Intent Performance Monitoring Flow

**Scenario**: System monitors performance across multiple intent types, detects slow execution, and optimizes automatically.

### Initial State
```json
{
  "url": "/hs/app/work-orders",
  "ui_state": {
    "performance_monitoring": "enabled",
    "user_context": {
      "industry": "hs", 
      "tenant_id": "tenant_performance_test"
    }
  }
}
```

### Intent Sequence

#### Intent 1: Apply Complex Multi-Filter (Performance Test)
```json
{
  "type": "SET_TABLE_STATE",
  "intent_id": "intent_complex_filter_001",
  "timestamp": "2024-01-15T16:00:00.000Z",
  "origin": "AI",
  "payload": {
    "table_id": "work-orders-table",
    "state_update": {
      "filters": [
        {
          "field": "created_date",
          "operator": "between", 
          "value": ["2024-01-01T00:00:00Z", "2024-01-15T23:59:59Z"],
          "data_type": "datetime"
        },
        {
          "field": "status",
          "operator": "in",
          "value": ["scheduled", "in_progress", "on_hold"],
          "data_type": "enum"
        },
        {
          "field": "priority",
          "operator": "ge",
          "value": 3,
          "data_type": "number"
        },
        {
          "field": "technician_name",
          "operator": "contains",
          "value": "Smith",
          "data_type": "string"
        }
      ],
      "sorting": [
        {"field": "priority", "direction": "desc"},
        {"field": "created_date", "direction": "asc"}
      ]
    }
  },
  "metadata": {
    "correlation_id": "flow_performance_monitoring_001"
  }
}
```

**Performance Metrics**:
- Execution time: 850ms (slower than 500ms threshold)
- DOM mutations: 156
- State updates: 8
- Memory allocated: 2.3MB

#### Intent 2: System Detects Slow Performance
```json
{
  "type": "RUN_CLIENT_ACTION",
  "intent_id": "intent_perf_alert_001",
  "timestamp": "2024-01-15T16:00:01.200Z", 
  "origin": "SYSTEM",
  "payload": {
    "action": "show_toast",
    "parameters": {
      "data": {
        "message": "Performance alert: Table filter taking longer than expected",
        "type": "info",
        "action_text": "Optimize"
      },
      "options": {
        "timeout_ms": 5000
      }
    }
  },
  "metadata": {
    "correlation_id": "flow_performance_monitoring_001"
  }
}
```

#### Intent 3: Clear Cache to Improve Performance
```json
{
  "type": "RUN_CLIENT_ACTION",
  "intent_id": "intent_clear_cache_001",
  "timestamp": "2024-01-15T16:00:02.800Z",
  "origin": "SYSTEM", 
  "payload": {
    "action": "clear_cache",
    "parameters": {
      "target": "table-data-cache",
      "data": {
        "cache_types": ["query_results", "filter_state", "sort_indexes"]
      },
      "options": {
        "confirm_required": false
      }
    },
    "safety_checks": {
      "requires_user_consent": false,
      "data_access_level": "current_page"
    }
  },
  "metadata": {
    "correlation_id": "flow_performance_monitoring_001"
  }
}
```

#### Intent 4: Refresh Data with Optimized Query
```json
{
  "type": "RUN_CLIENT_ACTION",
  "intent_id": "intent_refresh_optimized_001",
  "timestamp": "2024-01-15T16:00:03.500Z",
  "origin": "SYSTEM",
  "payload": {
    "action": "refresh_data", 
    "parameters": {
      "target": "work-orders-table",
      "data": {
        "use_optimized_query": true,
        "batch_size": 25,
        "preload_related": false
      },
      "options": {
        "show_loading": true,
        "timeout_ms": 10000
      }
    },
    "safety_checks": {
      "data_access_level": "tenant_data"
    }
  },
  "metadata": {
    "correlation_id": "flow_performance_monitoring_001"
  }
}
```

#### Intent 5: Performance Improvement Confirmation
```json
{
  "type": "RUN_CLIENT_ACTION", 
  "intent_id": "intent_perf_improved_001",
  "timestamp": "2024-01-15T16:00:05.100Z",
  "origin": "SYSTEM",
  "payload": {
    "action": "show_toast",
    "parameters": {
      "data": {
        "message": "Performance optimized: 65% faster response time",
        "type": "success"
      },
      "options": {
        "timeout_ms": 4000
      }
    }
  },
  "metadata": {
    "correlation_id": "flow_performance_monitoring_001"
  }
}
```

### Final State (Performance Optimized)
```json
{
  "url": "/hs/app/work-orders?filters=complex&optimized=true", 
  "ui_state": {
    "table_states": {
      "work-orders-table": {
        "filters": [
          {"field": "created_date", "operator": "between", "value": ["2024-01-01T00:00:00Z", "2024-01-15T23:59:59Z"]},
          {"field": "status", "operator": "in", "value": ["scheduled", "in_progress", "on_hold"]},
          {"field": "priority", "operator": "ge", "value": 3},
          {"field": "technician_name", "operator": "contains", "value": "Smith"}
        ],
        "sorting": [
          {"field": "priority", "direction": "desc"},
          {"field": "created_date", "direction": "asc"}
        ],
        "performance_optimized": true
      }
    },
    "performance_monitoring": {
      "initial_execution_time": "850ms",
      "optimized_execution_time": "295ms", 
      "improvement_percentage": 65,
      "cache_cleared": true,
      "query_optimized": true
    }
  },
  "performance_summary": {
    "total_sequence_time": "5.4s",
    "performance_improvements": {
      "cache_clear_time": "120ms",
      "query_optimization": "65% faster",
      "memory_usage_reduced": "40%"
    },
    "system_optimization": "successful"
  }
}
```

---

## ❌ Unsupported Command Handling Examples

### Example: Unsupported Intent Type
```json
{
  "type": "HACK_SYSTEM", 
  "intent_id": "intent_malicious_001",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "origin": "AI",
  "payload": {
    "target": "database",
    "action": "delete_all"
  }
}
```

**Response**:
```json
{
  "error": {
    "code": "INTENT_TYPE_UNSUPPORTED",
    "message": "Intent type 'HACK_SYSTEM' is not supported or recognized",
    "details": {
      "supported_types": ["NAVIGATE", "SET_TABLE_STATE", "OPEN_MODAL", "SET_THEME", "RUN_CLIENT_ACTION"],
      "suggested_alternative": null
    }
  },
  "handled_safely": true,
  "logged": true,
  "no_op_executed": true
}
```

### Example: AI Attempting Dangerous Action
```json
{
  "type": "RUN_CLIENT_ACTION",
  "intent_id": "intent_dangerous_001", 
  "origin": "AI",
  "payload": {
    "action": "open_external_link",
    "parameters": {
      "options": {
        "url": "https://malicious-site.example.com"
      }
    },
    "safety_checks": {
      "requires_user_consent": false
    }
  }
}
```

**Response**:
```json
{
  "error": {
    "code": "AI_EXTERNAL_LINK_CONSENT_REQUIRED",
    "message": "AI-initiated external links require user consent",
    "details": {
      "required_consent": true,
      "safety_violation": "external_link_without_consent"
    }
  },
  "handled_safely": true,
  "logged": true,
  "recovery_suggestion": "Request user confirmation before opening external links"
}
```

---

## 📊 Summary Performance Metrics

| Example | Total Time | Intents | Avg/Intent | Errors | Recovery |
|---------|------------|---------|------------|---------|-----------|
| Work Order Management | 5.7s | 5 | 102ms | 0 | N/A |
| Restaurant Batch Print | 6.8s | 5 | 136ms | 0 | N/A |
| Auto Estimate + Theme | 30.5s | 5 | 610ms | 0 | N/A |
| Retail Error Recovery | 7.1s | 4 | 178ms | 1 | 50ms |
| Performance Monitoring | 5.4s | 5 | 108ms | 0 | N/A |

**Overall System Performance**:
- **Average Intent Execution**: 127ms
- **Error Rate**: 4% (1 unsupported intent out of 25)
- **Recovery Time**: 50ms average
- **Safe Error Handling**: 100% (all errors handled safely with no-op)
- **User Experience Impact**: Minimal (errors are transparent to user)

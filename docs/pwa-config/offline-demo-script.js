#!/usr/bin/env node

/**
 * Thorbis PWA Offline Demo Script
 * 
 * Demonstrates complete offline POS order processing with later sync.
 * This script can be run in a browser environment to showcase PWA capabilities.
 */

class ThorbisPWAOfflineDemo {
  constructor() {
    this.isOnline = navigator.onLine
    this.offlineOrders = []
    this.syncResults = []
    this.demoSteps = []
    this.currentStep = 0
    
    this.setupUI()
    this.bindEvents()
  }
  
  setupUI() {
    // Create demo UI container
    const demoContainer = document.createElement('div')
    demoContainer.id = 'thorbis-offline-demo'
    demoContainer.innerHTML = `
      <div class="demo-container">
        <header class="demo-header">
          <h1>🏪 Thorbis PWA Offline Demo</h1>
          <div class="connection-status" id="connection-status">
            <span class="status-indicator ${this.isOnline ? 'online' : 'offline'}"></span>
            <span class="status-text">${this.isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </header>
        
        <div class="demo-content">
          <div class="demo-controls">
            <button id="start-demo" class="btn-primary">Start Offline Demo</button>
            <button id="reset-demo" class="btn-secondary">Reset Demo</button>
          </div>
          
          <div class="demo-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="step-indicator" id="step-indicator">Ready to start</div>
          </div>
          
          <div class="demo-output">
            <div class="output-section">
              <h3>📋 Demo Steps</h3>
              <div class="steps-container" id="steps-container"></div>
            </div>
            
            <div class="output-section">
              <h3>🛒 Order Details</h3>
              <div class="order-container" id="order-container">
                <p class="placeholder">No orders yet</p>
              </div>
            </div>
            
            <div class="output-section">
              <h3>🔄 Sync Results</h3>
              <div class="sync-container" id="sync-container">
                <p class="placeholder">No sync activity yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    // Add demo styles
    const styles = document.createElement('style')
    styles.textContent = `
      .demo-container {
        max-width: 1200px;
        margin: 20px auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      
      .demo-header {
        background: #1C8BFF;
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .connection-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
      
      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      
      .status-indicator.online {
        background: #18B26B;
        box-shadow: 0 0 8px rgba(24, 178, 107, 0.5);
      }
      
      .status-indicator.offline {
        background: #E5484D;
        box-shadow: 0 0 8px rgba(229, 72, 77, 0.5);
      }
      
      .demo-content {
        padding: 24px;
      }
      
      .demo-controls {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }
      
      .btn-primary {
        background: #1C8BFF;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .btn-primary:hover {
        background: #0B84FF;
      }
      
      .btn-secondary {
        background: #F3F4F6;
        color: #374151;
        border: 1px solid #D1D5DB;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-secondary:hover {
        background: #E5E7EB;
        border-color: #9CA3AF;
      }
      
      .demo-progress {
        margin-bottom: 32px;
      }
      
      .progress-bar {
        width: 100%;
        height: 8px;
        background: #E5E7EB;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 12px;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #1C8BFF, #0B84FF);
        width: 0%;
        transition: width 0.3s ease;
      }
      
      .step-indicator {
        font-weight: 500;
        color: #374151;
      }
      
      .demo-output {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 24px;
      }
      
      .output-section {
        background: #F9FAFB;
        border-radius: 8px;
        padding: 20px;
      }
      
      .output-section h3 {
        margin: 0 0 16px 0;
        color: #111827;
        font-size: 16px;
      }
      
      .placeholder {
        color: #6B7280;
        font-style: italic;
        margin: 0;
      }
      
      .step-item {
        padding: 12px;
        margin-bottom: 8px;
        border-radius: 6px;
        background: white;
        border-left: 4px solid #E5E7EB;
        transition: all 0.2s;
      }
      
      .step-item.active {
        border-left-color: #1C8BFF;
        background: #EBF3FF;
      }
      
      .step-item.completed {
        border-left-color: #18B26B;
        background: #ECFDF3;
      }
      
      .order-card {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid #E5E7EB;
      }
      
      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      
      .order-id {
        font-weight: 600;
        color: #111827;
      }
      
      .order-status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .status-offline {
        background: #FEF3C7;
        color: #92400E;
      }
      
      .status-synced {
        background: #ECFDF3;
        color: #14532D;
      }
      
      .order-items {
        margin-bottom: 12px;
      }
      
      .order-item {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        color: #6B7280;
      }
      
      .order-total {
        font-weight: 600;
        color: #111827;
        padding-top: 8px;
        border-top: 1px solid #E5E7EB;
        display: flex;
        justify-content: space-between;
      }
      
      .sync-item {
        background: white;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        border-left: 4px solid #E5E7EB;
      }
      
      .sync-success {
        border-left-color: #18B26B;
        background: #ECFDF3;
      }
      
      .sync-error {
        border-left-color: #E5484D;
        background: #FEF2F2;
      }
      
      @media (max-width: 768px) {
        .demo-output {
          grid-template-columns: 1fr;
        }
      }
    `
    
    document.head.appendChild(styles)
    document.body.appendChild(demoContainer)
  }
  
  bindEvents() {
    document.getElementById('start-demo').addEventListener('click', () => {
      this.startDemo()
    })
    
    document.getElementById('reset-demo').addEventListener('click', () => {
      this.resetDemo()
    })
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.updateConnectionStatus()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.updateConnectionStatus()
    })
  }
  
  async startDemo() {
    this.resetDemo()
    
    const steps = [
      { name: 'Simulating offline mode', action: () => this.simulateOfflineMode() },
      { name: 'Creating offline POS order', action: () => this.createOfflineOrder() },
      { name: 'Processing offline payment', action: () => this.processOfflinePayment() },
      { name: 'Generating offline receipt', action: () => this.generateOfflineReceipt() },
      { name: 'Simulating return to online', action: () => this.simulateOnlineMode() },
      { name: 'Syncing offline orders', action: () => this.syncOfflineOrders() },
      { name: 'Demo completed', action: () => this.completeDemo() }
    ]
    
    this.demoSteps = steps
    this.currentStep = 0
    
    this.renderSteps()
    
    // Execute steps sequentially with delays
    for (let i = 0; i < steps.length; i++) {
      this.currentStep = i
      this.updateProgress()
      this.updateStepIndicator(steps[i].name)
      this.markStepActive(i)
      
      try {
        await steps[i].action()
        this.markStepCompleted(i)
        
        // Delay between steps for better UX
        if (i < steps.length - 1) {
          await this.delay(1500)
        }
      } catch (error) {
        console.error(`Step ${i + 1} failed:`, error)
        this.markStepError(i)
        break
      }
    }
  }
  
  resetDemo() {
    this.offlineOrders = []
    this.syncResults = []
    this.currentStep = 0
    this.demoSteps = []
    
    document.getElementById('steps-container').innerHTML = ''
    document.getElementById('order-container').innerHTML = '<p class="placeholder">No orders yet</p>'
    document.getElementById('sync-container').innerHTML = '<p class="placeholder">No sync activity yet</p>'
    
    this.updateProgress()
    this.updateStepIndicator('Ready to start')
  }
  
  async simulateOfflineMode() {
    console.log('🔴 Simulating offline mode...')
    
    // Simulate network failure
    this.isOnline = false
    this.updateConnectionStatus()
    
    // Show offline notification
    this.showNotification('📡 Network connection lost - Operating in offline mode', 'warning')
    
    await this.delay(1000)
  }
  
  async createOfflineOrder() {
    console.log('🛒 Creating offline POS order...')
    
    const order = {
      id: `offline_${Date.now()}`,
      items: [
        { id: 'burger-classic', name: 'Classic Burger', price: 12.99, quantity: 2 },
        { id: 'fries-large', name: 'Large Fries', price: 4.99, quantity: 2 },
        { id: 'soda-cola', name: 'Cola', price: 2.99, quantity: 2 }
      ],
      subtotal: 41.96,
      tax: 3.36,
      total: 45.32,
      paymentMethod: 'card',
      customerId: 'walk-in',
      timestamp: new Date().toISOString(),
      tableNumber: 7,
      serverName: 'Demo Server',
      status: 'completed_offline',
      needsSync: true
    }
    
    // Store order in "IndexedDB" (simulated with memory)
    this.offlineOrders.push(order)
    
    // Update UI
    this.renderOrders()
    
    this.showNotification('✅ Order created offline and stored locally', 'success')
    
    await this.delay(1000)
  }
  
  async processOfflinePayment() {
    console.log('💳 Processing offline payment...')
    
    const lastOrder = this.offlineOrders[this.offlineOrders.length - 1]
    
    if (lastOrder) {
      // Simulate payment processing
      const paymentResult = {
        transactionId: `offline_txn_${Date.now()}`,
        status: 'pending_sync',
        amount: lastOrder.total,
        method: lastOrder.paymentMethod,
        timestamp: new Date().toISOString(),
        needsOnlineVerification: true
      }
      
      lastOrder.paymentTransaction = paymentResult
      
      this.renderOrders()
      this.showNotification('💳 Payment processed offline - Verification pending', 'info')
    }
    
    await this.delay(1000)
  }
  
  async generateOfflineReceipt() {
    console.log('🧾 Generating offline receipt...')
    
    const lastOrder = this.offlineOrders[this.offlineOrders.length - 1]
    
    if (lastOrder) {
      // Simulate receipt generation
      const receiptData = {
        orderNumber: lastOrder.id,
        date: new Date(lastOrder.timestamp).toLocaleDateString(),
        time: new Date(lastOrder.timestamp).toLocaleTimeString(),
        items: lastOrder.items,
        subtotal: lastOrder.subtotal,
        tax: lastOrder.tax,
        total: lastOrder.total,
        paymentMethod: lastOrder.paymentMethod,
        offlineMode: true,
        syncStatus: 'pending'
      }
      
      lastOrder.receipt = receiptData
      
      this.renderOrders()
      this.showNotification('🧾 Receipt generated and stored offline', 'success')
    }
    
    await this.delay(1000)
  }
  
  async simulateOnlineMode() {
    console.log('🟢 Simulating return to online mode...')
    
    await this.delay(2000)
    
    this.isOnline = true
    this.updateConnectionStatus()
    
    this.showNotification('📡 Network connection restored - Starting sync', 'success')
    
    await this.delay(1000)
  }
  
  async syncOfflineOrders() {
    console.log('🔄 Syncing offline orders...')
    
    for (const order of this.offlineOrders) {
      if (!order.needsSync) continue
      
      try {
        // Simulate API call delay
        await this.delay(800)
        
        // Mock successful sync
        const syncResult = {
          offlineId: order.id,
          onlineId: `online_${Date.now()}`,
          status: 'synced',
          timestamp: new Date().toISOString(),
          serverResponse: {
            message: 'Order synced successfully',
            confirmationNumber: `CONF${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          }
        }
        
        // Update order status
        order.needsSync = false
        order.syncStatus = 'synced'
        order.onlineId = syncResult.onlineId
        order.confirmationNumber = syncResult.serverResponse.confirmationNumber
        
        this.syncResults.push(syncResult)
        
        this.renderOrders()
        this.renderSyncResults()
        
        this.showNotification(`✅ Order ${order.id} synced successfully`, 'success')
        
      } catch (error) {
        const syncError = {
          offlineId: order.id,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString(),
          retryCount: 1
        }
        
        this.syncResults.push(syncError)
        this.renderSyncResults()
        
        this.showNotification(`❌ Failed to sync order ${order.id}`, 'error')
      }
    }
  }
  
  async completeDemo() {
    console.log('🏁 Demo completed successfully!')
    
    this.showNotification('🎉 PWA Offline Demo completed successfully!', 'success')
    
    // Show summary
    const totalOrders = this.offlineOrders.length
    const syncedOrders = this.offlineOrders.filter(order => !order.needsSync).length
    
    setTimeout(() => {
      alert(`Demo Summary:\n\n✅ ${totalOrders} orders created offline\n✅ ${syncedOrders} orders synced successfully\n✅ Full offline-to-online flow demonstrated\n\nThe PWA maintained full functionality while offline and seamlessly synchronized data when connectivity was restored.`)
    }, 1000)
  }
  
  renderSteps() {
    const container = document.getElementById('steps-container')
    container.innerHTML = this.demoSteps.map((step, index) => `
      <div class="step-item" id="step-${index}">
        <span class="step-number">${index + 1}.</span>
        <span class="step-name">${step.name}</span>
      </div>
    `).join('')
  }
  
  renderOrders() {
    const container = document.getElementById('order-container')
    
    if (this.offlineOrders.length === 0) {
      container.innerHTML = '<p class="placeholder">No orders yet</p>'
      return
    }
    
    container.innerHTML = this.offlineOrders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">${order.id}</span>
          <span class="order-status ${order.syncStatus === 'synced' ? 'status-synced' : 'status-offline'}">
            ${order.syncStatus === 'synced' ? 'Synced' : 'Pending Sync'}
          </span>
        </div>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <span>${item.quantity}x ${item.name}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-total">
          <span>Total:</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
        ${order.confirmationNumber ? `
          <div class="confirmation">
            <small>Confirmation: ${order.confirmationNumber}</small>
          </div>
        ` : ''}
      </div>
    `).join('')
  }
  
  renderSyncResults() {
    const container = document.getElementById('sync-container')
    
    if (this.syncResults.length === 0) {
      container.innerHTML = '<p class="placeholder">No sync activity yet</p>'
      return
    }
    
    container.innerHTML = this.syncResults.map(result => `
      <div class="sync-item ${result.status === 'synced' ? 'sync-success' : 'sync-error'}">
        <div><strong>${result.status === 'synced' ? '✅' : '❌'} ${result.offlineId}</strong></div>
        <div>${result.status === 'synced' ? `Synced as ${result.onlineId}` : `Failed: ${result.error}`}</div>
        <small>${new Date(result.timestamp).toLocaleTimeString()}</small>
      </div>
    `).join('')
  }
  
  updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status')
    const indicator = statusElement.querySelector('.status-indicator')
    const text = statusElement.querySelector('.status-text')
    
    if (this.isOnline) {
      indicator.className = 'status-indicator online'
      text.textContent = 'Online'
    } else {
      indicator.className = 'status-indicator offline'
      text.textContent = 'Offline'
    }
  }
  
  updateProgress() {
    const progressFill = document.getElementById('progress-fill')
    const progress = this.demoSteps.length > 0 ? (this.currentStep / this.demoSteps.length) * 100 : 0
    progressFill.style.width = `${progress}%`
  }
  
  updateStepIndicator(text) {
    document.getElementById('step-indicator').textContent = text
  }
  
  markStepActive(index) {
    const stepElement = document.getElementById(`step-${index}`)
    if (stepElement) {
      stepElement.className = 'step-item active'
    }
  }
  
  markStepCompleted(index) {
    const stepElement = document.getElementById(`step-${index}`)
    if (stepElement) {
      stepElement.className = 'step-item completed'
    }
  }
  
  markStepError(index) {
    const stepElement = document.getElementById(`step-${index}`)
    if (stepElement) {
      stepElement.className = 'step-item error'
    }
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    
    // Add notification styles if not already added
    if (!document.getElementById('notification-styles')) {
      const styles = document.createElement('style')
      styles.id = 'notification-styles'
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }
        
        .notification-success { background: #18B26B; }
        .notification-error { background: #E5484D; }
        .notification-warning { background: #E5A400; }
        .notification-info { background: #1C8BFF; }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `
      document.head.appendChild(styles)
    }
    
    document.body.appendChild(notification)
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Initialize demo when DOM is loaded
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.thorbisPWADemo = new ThorbisPWAOfflineDemo()
    })
  } else {
    window.thorbisPWADemo = new ThorbisPWAOfflineDemo()
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThorbisPWAOfflineDemo
}

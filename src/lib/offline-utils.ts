// Offline utilities for Thorbis Business OS
// Provides interface between React components and service worker

export interface OfflinePayment {
  id?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerId?: string;
  organizationId: string;
  metadata?: Record<string, unknown>;
  timestamp?: number;
  synced?: boolean;
  offline?: boolean;
}

export interface OfflineData {
  id?: string;
  organizationId: string;
  timestamp?: number;
  synced?: boolean;
  [key: string]: any;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingSync: number;
  lastSync?: number;
  syncing: boolean;
}

class OfflineManager {
  private serviceWorker: ServiceWorker | null = null;
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    pendingSync: 0,
    syncing: false
  };
  private listeners: Array<(status: SyncStatus) => void> = [];

  constructor() {
    this.init();
    this.setupNetworkListeners();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        this.serviceWorker = registration.active;
        await this.updatePendingCount();
      } catch (error) {
        console.error('Service Worker not available:', error);
      }
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });
  }

  private async sendMessage(type: string, data?: any): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.serviceWorker) {
        reject(new Error('Service Worker not available'));
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      this.serviceWorker.postMessage(
        { type, data },
        [messageChannel.port2]
      );
    });
  }

  // Payment Methods
  async processPayment(payment: OfflinePayment): Promise<{ success: boolean; offline?: boolean; id?: string }> {
    if (this.syncStatus.isOnline) {
      try {
        const response = await fetch('/api/v1/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment)
        });

        if (response.ok) {
          const result = await response.json();
          return { success: true, id: result.id };
        }
      } catch (error) {
        console.log('Payment failed online, storing offline');
      }
    }

    // Store offline
    const result = await this.sendMessage('STORE_OFFLINE_PAYMENT', payment);
    await this.updatePendingCount();
    this.notifyListeners();
    return result;
  }

  async getOfflinePayments(): Promise<OfflinePayment[]> {
    return this.sendMessage('GET_OFFLINE_DATA', { 
      store: 'payments',
      filters: { synced: false }
    });
  }

  // Data Storage Methods
  async storeOfflineData(store: string, data: OfflineData): Promise<OfflineData> {
    const result = await this.sendMessage('STORE_OFFLINE_DATA', { store, payload: data });
    await this.updatePendingCount();
    this.notifyListeners();
    return result;
  }

  async getOfflineData(store: string, filters: Record<string, unknown> = {}): Promise<OfflineData[]> {
    return this.sendMessage('GET_OFFLINE_DATA', { store, filters });
  }

  // Customer Management
  async storeCustomer(customer: unknown): Promise<unknown> {
    return this.storeOfflineData('customers', customer);
  }

  async getOfflineCustomers(): Promise<any[]> {
    return this.getOfflineData('customers', { synced: false });
  }

  // Inventory Management
  async updateInventory(item: unknown): Promise<unknown> {
    return this.storeOfflineData('inventory', item);
  }

  async getOfflineInventory(): Promise<any[]> {
    return this.getOfflineData('inventory', { synced: false });
  }

  // Work Order Management
  async createWorkOrder(workOrder: unknown): Promise<unknown> {
    return this.storeOfflineData('work-orders', workOrder);
  }

  async getOfflineWorkOrders(): Promise<any[]> {
    return this.getOfflineData('work-orders', { synced: false });
  }

  // Document Management
  async storeDocument(document: unknown): Promise<unknown> {
    return this.storeOfflineData('documents', document);
  }

  async getOfflineDocuments(): Promise<any[]> {
    return this.getOfflineData('documents', { synced: false });
  }

  // Photo Management
  async storePhoto(photo: unknown): Promise<unknown> {
    return this.storeOfflineData('photos', photo);
  }

  async getOfflinePhotos(): Promise<any[]> {
    return this.getOfflineData('photos', { synced: false });
  }

  // Analytics
  async trackEvent(event: unknown): Promise<unknown> {
    return this.storeOfflineData('analytics', event);
  }

  async getOfflineAnalytics(): Promise<any[]> {
    return this.getOfflineData('analytics', { synced: false });
  }

  // Sync Management
  async triggerSync(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    this.syncStatus.syncing = true;
    this.notifyListeners();

    try {
      await this.sendMessage('FORCE_SYNC');
      this.syncStatus.lastSync = Date.now();
      await this.updatePendingCount();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncStatus.syncing = false;
      this.notifyListeners();
    }
  }

  async clearOfflineData(): Promise<void> {
    await this.sendMessage('CLEAR_CACHE');
    this.syncStatus.pendingSync = 0;
    this.notifyListeners();
  }

  private async updatePendingCount(): Promise<void> {
    try {
      const stores = ['payments', 'customers', 'inventory', 'work-orders', 'analytics', 'documents', 'photos'];
      const totalPending = 0;

      for (const store of stores) {
        const data = await this.getOfflineData(store, { synced: false });
        totalPending += data.length;
      }

      this.syncStatus.pendingSync = totalPending;
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }

  // Status and Listeners
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getSyncStatus()));
  }

  // Utility Methods
  isOnline(): boolean {
    return this.syncStatus.isOnline;
  }

  hasPendingSync(): boolean {
    return this.syncStatus.pendingSync > 0;
  }

  isSyncing(): boolean {
    return this.syncStatus.syncing;
  }
}

// Mobile Check Capture Utilities
export class MobileCheckCapture {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
  }

  async captureCheck(videoElement: HTMLVideoElement): Promise<{
    image: string;
    processedData?: any;
  }> {
    // Set canvas size to match video
    this.canvas.width = videoElement.videoWidth;
    this.canvas.height = videoElement.videoHeight;

    // Draw video frame to canvas
    this.context.drawImage(videoElement, 0, 0);

    // Get image data
    const imageData = this.canvas.toDataURL('image/jpeg', 0.8);

    // Process check image (basic OCR simulation)
    const processedData = await this.processCheckImage(imageData);

    return {
      image: imageData,
      processedData
    };
  }

  private async processCheckImage(imageData: string): Promise<unknown> {
    // Simulate OCR processing
    // In a real implementation, this would use a service like Onfido or Jumio
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      routingNumber: '123456789',
      accountNumber: '987654321',
      checkNumber: '1001',
      amount: 0,
      confidence: 0.85,
      timestamp: Date.now()
    };
  }

  async startCamera(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      return stream;
    } catch (error) {
      console.error('Failed to start camera:', error);
      throw new Error('Camera access denied or unavailable');
    }
  }

  stopCamera(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
  }
}

// GPS and Location Utilities
export class LocationManager {
  private watchId: number | null = null;
  private currentPosition: GeolocationPosition | null = null;

  async getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = position;
          resolve(position);
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  startLocationTracking(callback: (position: GeolocationPosition) => void): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = position;
        callback(position);
      },
      (error) => console.error('Location tracking error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000
      }
    );
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getLastKnownPosition(): GeolocationPosition | null {
    return this.currentPosition;
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Signature Capture Utilities
export class SignatureCapture {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.context.strokeStyle = '#000';
    this.context.lineWidth = 2;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.draw(touch.clientX - rect.left, touch.clientY - rect.top);
    });

    this.canvas.addEventListener('touchend', () => {
      this.stopDrawing();
    });

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.startDrawing(e.clientX - rect.left, e.clientY - rect.top);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.draw(e.clientX - rect.left, e.clientY - rect.top);
    });

    this.canvas.addEventListener('mouseup', () => {
      this.stopDrawing();
    });
  }

  private startDrawing(x: number, y: number): void {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
  }

  private draw(x: number, y: number): void {
    if (!this.isDrawing) return;

    this.context.beginPath();
    this.context.moveTo(this.lastX, this.lastY);
    this.context.lineTo(x, y);
    this.context.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  private stopDrawing(): void {
    this.isDrawing = false;
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getSignatureData(): string {
    return this.canvas.toDataURL('image/png');
  }

  isEmpty(): boolean {
    const blank = document.createElement('canvas');
    blank.width = this.canvas.width;
    blank.height = this.canvas.height;
    return this.canvas.toDataURL() === blank.toDataURL();
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();
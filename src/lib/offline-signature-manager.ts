// Offline signature capture and electronic forms manager
// Provides comprehensive signature capture, form generation, and validation capabilities

import { EventEmitter } from 'events';

export interface SignatureData {
  id: string;
  formId: string;
  organizationId: string;
  userId: string;
  customerData: CustomerSignatureData;
  signatureDataURL: string;
  signatureVector?: string; // SVG path data for vector signatures
  metadata: SignatureMetadata;
  formData?: FormSubmissionData;
  validation: SignatureValidation;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  device: DeviceInfo;
  quality: SignatureQuality;
  status: 'pending' | 'validated' | 'submitted' | 'failed';
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSignatureData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customerId?: string;
  title?: string;
  company?: string;
  witnessName?: string;
  witnessSignature?: string;
}

export interface SignatureMetadata {
  purpose: 'approval' | 'completion' | 'authorization' | 'receipt' | 'contract' | 'custom';
  documentType: string;
  documentId?: string;
  workOrderId?: string;
  appointmentId?: string;
  description?: string;
  legalText?: string;
  requiresWitness: boolean;
  expiresAt?: Date;
  version: string;
}

export interface SignatureValidation {
  isValid: boolean;
  biometricScore?: number;
  pressurePoints?: number[];
  velocityData?: number[];
  accelerationData?: number[];
  timestamp?: number[];
  errors: string[];
  warnings: string[];
  confidence: number;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenSize: { width: number; height: number };
  devicePixelRatio: number;
  touchSupport: boolean;
  penSupport?: boolean;
  orientation: 'portrait' | 'landscape';
}

export interface SignatureQuality {
  strokeCount: number;
  totalLength: number;
  averagePressure?: number;
  timeToComplete: number;
  complexity: 'low' | 'medium' | 'high';
  clarity: number; // 0-100
  legibility: number; // 0-100
}

export interface ElectronicForm {
  id: string;
  name: string;
  title: string;
  description?: string;
  version: string;
  organizationId: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'general';
  category: string;
  fields: FormField[];
  signatureFields: SignatureField[];
  settings: FormSettings;
  validation: FormValidation;
  templates: FormTemplate[];
  styling: FormStyling;
  workflow: FormWorkflow;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'time' | 'datetime' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'currency' | 'percentage';
  required: boolean;
  validation?: FieldValidation;
  options?: FormFieldOption[];
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  conditionalLogic?: ConditionalLogic;
  layout: FieldLayout;
  order: number;
}

export interface SignatureField {
  id: string;
  name: string;
  label: string;
  required: boolean;
  purpose: SignatureMetadata['purpose'];
  requiresWitness: boolean;
  legalText?: string;
  position: { x: number; y: number; width: number; height: number };
  signerType: 'customer' | 'technician' | 'manager' | 'witness' | 'other';
  order: number;
}

export interface FormSettings {
  allowPartialSave: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
  requireGPS: boolean;
  requirePhoto: boolean;
  allowOfflineSubmission: boolean;
  emailConfirmation: boolean;
  smsConfirmation: boolean;
  printEnabled: boolean;
  pdfGeneration: boolean;
  encryption: boolean;
  retention: {
    period: number; // days
    deleteAfter: boolean;
  };
}

export interface FormValidation {
  rules: ValidationRule[];
  customValidators: CustomValidator[];
  crossFieldValidation: CrossFieldValidation[];
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  industry: string;
  category: string;
  prefilledData: Record<string, unknown>;
  isDefault: boolean;
}

export interface FormStyling {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  layout: 'single-column' | 'two-column' | 'responsive';
  spacing: number;
  borderRadius: number;
  customCSS?: string;
}

export interface FormWorkflow {
  steps: WorkflowStep[];
  approvals: ApprovalStep[];
  notifications: NotificationRule[];
  integrations: Integration[];
}

export interface FormSubmissionData {
  id: string;
  formId: string;
  organizationId: string;
  submittedBy: string;
  fieldData: Record<string, unknown>;
  signatures: SignatureData[];
  attachments: string[]; // File IDs
  metadata: SubmissionMetadata;
  validation: FormValidation;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'processing' | 'completed';
  workflow: {
    currentStep: string;
    completedSteps: string[];
    approvals: ApprovalRecord[];
  };
  submittedAt: Date;
  completedAt?: Date;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
}

// Supporting interfaces
interface FormFieldOption {
  value: any;
  label: string;
  disabled?: boolean;
}

interface FieldValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
  errorMessage?: string;
}

interface ConditionalLogic {
  dependsOn: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

interface FieldLayout {
  width: 'full' | 'half' | 'third' | 'quarter';
  breakAfter: boolean;
  className?: string;
}

interface ValidationRule {
  field: string;
  type: 'required' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

interface CustomValidator {
  name: string;
  function: string; // JavaScript function as string
}

interface CrossFieldValidation {
  fields: string[];
  validator: string;
  message: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'integration' | 'custom';
  config: Record<string, unknown>;
  order: number;
}

interface ApprovalStep {
  id: string;
  name: string;
  approvers: string[];
  required: boolean;
  timeout?: number; // minutes
}

interface NotificationRule {
  id: string;
  trigger: 'submission' | 'approval' | 'rejection' | 'timeout';
  recipients: string[];
  template: string;
  method: 'email' | 'sms' | 'push';
}

interface Integration {
  id: string;
  type: 'webhook' | 'api' | 'database' | 'file_export';
  config: Record<string, unknown>;
  trigger: string;
}

interface SubmissionMetadata {
  ip: string;
  userAgent: string;
  duration: number; // seconds to complete
  revisions: number;
  source: 'web' | 'mobile' | 'tablet' | 'kiosk';
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface ApprovalRecord {
  stepId: string;
  approver: string;
  decision: 'approved' | 'rejected';
  comment?: string;
  timestamp: Date;
}

export class OfflineSignatureManager extends EventEmitter {
  private static instance: OfflineSignatureManager | null = null;
  private dbName = 'offline_signatures';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private constructor() {
    super();
    this.initializeDB();
  }

  static getInstance(): OfflineSignatureManager {
    if (!OfflineSignatureManager.instance) {
      OfflineSignatureManager.instance = new OfflineSignatureManager();
    }
    return OfflineSignatureManager.instance;
  }

  // Database initialization
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open signature database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Signatures store
        if (!db.objectStoreNames.contains('signatures')) {
          const signaturesStore = db.createObjectStore('signatures', { keyPath: 'id' });
          signaturesStore.createIndex('formId', 'formId', { unique: false });
          signaturesStore.createIndex('organizationId', 'organizationId', { unique: false });
          signaturesStore.createIndex('userId', 'userId', { unique: false });
          signaturesStore.createIndex('status', 'status', { unique: false });
          signaturesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          signaturesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Forms store
        if (!db.objectStoreNames.contains('forms')) {
          const formsStore = db.createObjectStore('forms', { keyPath: 'id' });
          formsStore.createIndex('organizationId', 'organizationId', { unique: false });
          formsStore.createIndex('industry', 'industry', { unique: false });
          formsStore.createIndex('category', 'category', { unique: false });
          formsStore.createIndex('isActive', 'isActive', { unique: false });
        }

        // Form submissions store
        if (!db.objectStoreNames.contains('submissions')) {
          const submissionsStore = db.createObjectStore('submissions', { keyPath: 'id' });
          submissionsStore.createIndex('formId', 'formId', { unique: false });
          submissionsStore.createIndex('organizationId', 'organizationId', { unique: false });
          submissionsStore.createIndex('submittedBy', 'submittedBy', { unique: false });
          submissionsStore.createIndex('status', 'status', { unique: false });
          submissionsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          submissionsStore.createIndex('submittedAt', 'submittedAt', { unique: false });
        }

        // Form templates store
        if (!db.objectStoreNames.contains('templates')) {
          const templatesStore = db.createObjectStore('templates', { keyPath: 'id' });
          templatesStore.createIndex('industry', 'industry', { unique: false });
          templatesStore.createIndex('category', 'category', { unique: false });
          templatesStore.createIndex('isDefault', 'isDefault', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Signature capture methods
  async captureSignature(options: {
    formId: string;
    organizationId: string;
    userId: string;
    customerData: CustomerSignatureData;
    metadata: SignatureMetadata;
    canvas: HTMLCanvasElement;
    requireGPS?: boolean;
  }): Promise<string> {
    try {
      const signatureId = 'sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';

      // Get signature data from canvas
      const signatureDataURL = options.canvas.toDataURL('image/png');
      
      // Extract vector data if possible (requires signature pad library)
      const signatureVector = this.extractVectorData(options.canvas);

      // Get device info
      const device = this.getDeviceInfo();

      // Get location if required
      let location: SignatureData['location'];
      if (options.requireGPS || options.metadata.purpose === 'authorization') {
        location = await this.getCurrentLocation();
      }

      // Analyze signature quality
      const quality = await this.analyzeSignatureQuality(options.canvas);

      // Validate signature
      const validation = await this.validateSignature(signatureDataURL, options.metadata);

      const signatureData: SignatureData = {
        id: signatureId,
        formId: options.formId,
        organizationId: options.organizationId,
        userId: options.userId,
        customerData: options.customerData,
        signatureDataURL,
        signatureVector,
        metadata: options.metadata,
        validation,
        timestamp: new Date(),
        location,
        device,
        quality,
        status: validation.isValid ? 'validated' : 'pending',
        syncStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.storeSignature(signatureData);
      
      this.emit('signature_captured', { 
        signatureId, 
        formId: options.formId,
        metadata: options.metadata 
      });

      return signatureId;
    } catch (error) {
      console.error('Failed to capture signature:', error);
      throw new Error('Signature capture failed');
    }
  }

  private extractVectorData(canvas: HTMLCanvasElement): string {
    // Mock implementation - would use signature pad library
    // to extract SVG path data for vector signatures
    return 'M 0 0 L 100 100'; // Placeholder SVG path
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
      penSupport: 'onpointerdown' in window,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    };
  }

  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  private async analyzeSignatureQuality(canvas: HTMLCanvasElement): Promise<SignatureQuality> {
    // Mock implementation - would analyze signature complexity, clarity, etc.
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
    
    let strokeCount = 0;
    let totalLength = 0;
    let complexity: 'low' | 'medium' | 'high' = 'medium';
    
    // Simple analysis based on non-white pixels
    if (imageData) {
      const pixelCount = 0;
      for (const i = 0; i < imageData.data.length; i += 4) {
        const alpha = imageData.data[i + 3];
        if (alpha > 0) pixelCount++;
      }
      
      strokeCount = Math.floor(pixelCount / 100); // Rough estimate
      totalLength = pixelCount * 0.1; // Rough estimate
      
      if (pixelCount < 1000) complexity = 'low';
      else if (pixelCount > 5000) complexity = 'high';
    }

    return {
      strokeCount,
      totalLength,
      timeToComplete: 0, // Would be tracked during capture
      complexity,
      clarity: Math.random() * 40 + 60, // Mock score 60-100
      legibility: Math.random() * 30 + 70 // Mock score 70-100
    };
  }

  private async validateSignature(signatureDataURL: string, metadata: SignatureMetadata): Promise<SignatureValidation> {
    // Mock validation - would use ML/AI for real validation
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation checks
    if (signatureDataURL.length < 1000) {
      errors.push('Signature appears too simple');
    }
    
    if (metadata.requiresWitness && !metadata.purpose.includes('witness')) {
      warnings.push('Witness signature may be required');
    }

    const isValid = errors.length === 0;
    const confidence = isValid ? Math.random() * 20 + 80 : Math.random() * 60 + 20;

    return {
      isValid,
      biometricScore: Math.random() * 100,
      errors,
      warnings,
      confidence
    };
  }

  // Form management methods
  async createForm(formData: Omit<ElectronicForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const formId = 'form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
      
      const form: ElectronicForm = {
        ...formData,
        id: formId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.storeForm(form);
      
      this.emit('form_created', { formId, form });

      return formId;
    } catch (error) {
      console.error('Failed to create form:', error);
      throw new Error('Form creation failed');
    }
  }

  async updateForm(formId: string, updates: Partial<ElectronicForm>): Promise<void> {
    try {
      const form = await this.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      const updatedForm = {
        ...form,
        ...updates,
        updatedAt: new Date()
      };

      await this.storeForm(updatedForm);
      
      this.emit('form_updated', { formId, updates });
    } catch (error) {
      console.error('Failed to update form:', error);
      throw new Error('Form update failed');
    }
  }

  async submitForm(options: {
    formId: string;
    organizationId: string;
    submittedBy: string;
    fieldData: Record<string, unknown>;
    signatures: string[]; // Signature IDs
    attachments?: string[]; // File IDs
  }): Promise<string> {
    try {
      const submissionId = 'sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
      
      const form = await this.getForm(options.formId);
      if (!form) {
        throw new Error('Form not found');
      }

      // Validate form data
      const validation = await this.validateFormSubmission(form, options.fieldData, options.signatures);

      // Get signatures data
      const signatures = await Promise.all(
        options.signatures.map(sigId => this.getSignature(sigId))
      );

      const submission: FormSubmissionData = {
        id: submissionId,
        formId: options.formId,
        organizationId: options.organizationId,
        submittedBy: options.submittedBy,
        fieldData: options.fieldData,
        signatures: signatures.filter(sig => sig !== null) as SignatureData[],
        attachments: options.attachments || [],
        metadata: {
          ip: '127.0.0.1', // Would get real IP
          userAgent: navigator.userAgent,
          duration: 0, // Would track actual duration
          revisions: 0,
          source: 'web' // Would detect actual source
        },
        validation,
        status: validation.isValid ? 'submitted' : 'draft',
        workflow: {
          currentStep: form.workflow.steps[0]?.id || 'completed',
          completedSteps: [],
          approvals: []
        },
        submittedAt: new Date(),
        syncStatus: 'pending'
      };

      await this.storeSubmission(submission);
      
      this.emit('form_submitted', { submissionId, formId: options.formId });

      return submissionId;
    } catch (error) {
      console.error('Failed to submit form:', error);
      throw new Error('Form submission failed');
    }
  }

  private async validateFormSubmission(
    form: ElectronicForm,
    fieldData: Record<string, unknown>,
    signatureIds: string[]
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && (!fieldData[field.name] || fieldData[field.name] === `)) {
        errors.push(`${field.label} is required`);
      }

      // Field-specific validation
      if (fieldData[field.name] && field.validation) {
        const value = fieldData[field.name];
        
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
        }
        
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors.push(`${field.label} must be no more than ${field.validation.maxLength} characters`);
        }
        
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
          errors.push(field.validation.errorMessage || `${field.label} format is invalid');
        }
      }
    }

    // Validate required signatures
    for (const sigField of form.signatureFields) {
      if (sigField.required && !signatureIds.find(id => id.includes(sigField.name))) {
        errors.push('${sigField.label} signature is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Storage methods
  private async storeSignature(signature: SignatureData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['signatures'], 'readwrite');
      const store = transaction.objectStore('signatures');
      const request = store.put(signature);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store signature'));
    });
  }

  private async storeForm(form: ElectronicForm): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');
      const request = store.put(form);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store form'));
    });
  }

  private async storeSubmission(submission: FormSubmissionData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['submissions'], 'readwrite');
      const store = transaction.objectStore('submissions');
      const request = store.put(submission);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store submission'));
    });
  }

  // Retrieval methods
  async getSignature(signatureId: string): Promise<SignatureData | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['signatures'], 'readonly');
      const store = transaction.objectStore('signatures');
      const request = store.get(signatureId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to get signature'));
    });
  }

  async getForm(formId: string): Promise<ElectronicForm | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readonly');
      const store = transaction.objectStore('forms');
      const request = store.get(formId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to get form'));
    });
  }

  async getSubmission(submissionId: string): Promise<FormSubmissionData | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['submissions'], 'readonly');
      const store = transaction.objectStore('submissions');
      const request = store.get(submissionId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to get submission'));
    });
  }

  // List methods
  async getSignaturesByForm(formId: string, organizationId?: string): Promise<SignatureData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['signatures'], 'readonly');
      const store = transaction.objectStore('signatures');
      const index = store.index('formId');
      const request = index.getAll(formId);

      request.onsuccess = () => {
        const signatures = request.result;
        if (organizationId) {
          resolve(signatures.filter(sig => sig.organizationId === organizationId));
        } else {
          resolve(signatures);
        }
      };
      request.onerror = () => reject(new Error('Failed to get signatures'));
    });
  }

  async getForms(organizationId: string, industry?: string): Promise<ElectronicForm[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readonly');
      const store = transaction.objectStore('forms');
      const index = store.index('organizationId');
      const request = index.getAll(organizationId);

      request.onsuccess = () => {
        let forms = request.result;
        if (industry) {
          forms = forms.filter(form => form.industry === industry);
        }
        resolve(forms.filter(form => form.isActive));
      };
      request.onerror = () => reject(new Error('Failed to get forms'));
    });
  }

  async getSubmissions(formId?: string, organizationId?: string): Promise<FormSubmissionData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['submissions'], 'readonly');
      const store = transaction.objectStore('submissions');
      
      let request: IDBRequest;
      if (formId) {
        const index = store.index('formId');
        request = index.getAll(formId);
      } else if (organizationId) {
        const index = store.index('organizationId');
        request = index.getAll(organizationId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => reject(new Error('Failed to get submissions'));
    });
  }

  // Sync methods
  async getPendingSyncSignatures(): Promise<SignatureData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['signatures'], 'readonly');
      const store = transaction.objectStore('signatures');
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => reject(new Error('Failed to get pending signatures'));
    });
  }

  async getPendingSyncSubmissions(): Promise<FormSubmissionData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['submissions'], 'readonly');
      const store = transaction.objectStore('submissions');
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => reject(new Error('Failed to get pending submissions'));
    });
  }

  async updateSyncStatus(type: 'signature' | 'submission', id: string, status: 'pending' | 'syncing' | 'synced' | 'failed'): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const storeName = type === 'signature' ? 'signatures' : 'submissions';

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.syncStatus = status;
          item.updatedAt = new Date();
          
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error('Failed to update sync status`));
        } else {
          reject(new Error(`${type} not found'));
        }
      };
      getRequest.onerror = () => reject(new Error('Failed to get ${type}'));
    });
  }

  // Statistics and monitoring
  async getStatistics(organizationId?: string): Promise<{
    totalSignatures: number;
    totalForms: number;
    totalSubmissions: number;
    pendingSignatures: number;
    pendingSubmissions: number;
    validatedSignatures: number;
    completedSubmissions: number;
    averageSignatureQuality: number;
    mostUsedForms: { formId: string; name: string; count: number }[];
  }> {
    try {
      const signatures = organizationId 
        ? (await this.getAllSignatures()).filter(sig => sig.organizationId === organizationId)
        : await this.getAllSignatures();
      
      const submissions = organizationId
        ? (await this.getSubmissions(undefined, organizationId))
        : await this.getSubmissions();
      
      const forms = organizationId
        ? await this.getForms(organizationId)
        : await this.getAllForms();

      const pendingSignatures = signatures.filter(sig => sig.syncStatus === 'pending').length;
      const pendingSubmissions = submissions.filter(sub => sub.syncStatus === 'pending').length;
      const validatedSignatures = signatures.filter(sig => sig.status === 'validated').length;
      const completedSubmissions = submissions.filter(sub => sub.status === 'completed').length;

      const totalQuality = signatures.reduce((sum, sig) => sum + (sig.quality.clarity + sig.quality.legibility) / 2, 0);
      const averageSignatureQuality = signatures.length > 0 ? totalQuality / signatures.length : 0;

      // Most used forms
      const formUsage = submissions.reduce((acc, sub) => {
        acc[sub.formId] = (acc[sub.formId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedForms = Object.entries(formUsage)
        .map(([formId, count]) => {
          const form = forms.find(f => f.id === formId);
          return { formId, name: form?.name || 'Unknown', count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSignatures: signatures.length,
        totalForms: forms.length,
        totalSubmissions: submissions.length,
        pendingSignatures,
        pendingSubmissions,
        validatedSignatures,
        completedSubmissions,
        averageSignatureQuality,
        mostUsedForms
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw new Error('Statistics retrieval failed');
    }
  }

  private async getAllSignatures(): Promise<SignatureData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['signatures'], 'readonly');
      const store = transaction.objectStore('signatures');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all signatures'));
    });
  }

  private async getAllForms(): Promise<ElectronicForm[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readonly');
      const store = transaction.objectStore('forms');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all forms'));
    });
  }

  // Cleanup methods
  async deleteSignature(signatureId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['signatures'], 'readwrite');
      const store = transaction.objectStore('signatures');
      const request = store.delete(signatureId);

      request.onsuccess = () => {
        this.emit('signature_deleted', { signatureId });
        resolve();
      };
      request.onerror = () => reject(new Error('Failed to delete signature'));
    });
  }

  async deleteForm(formId: string): Promise<void> {
    // Mark as inactive instead of deleting to preserve data integrity
    await this.updateForm(formId, { isActive: false, updatedAt: new Date() });
    this.emit('form_deleted', { formId });
  }

  async clearOldData(olderThanDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const deletedCount = 0;

      // Clear old signatures
      const signatures = await this.getAllSignatures();
      for (const signature of signatures) {
        if (signature.createdAt < cutoffDate && signature.syncStatus === 'synced') {
          await this.deleteSignature(signature.id);
          deletedCount++;
        }
      }

      this.emit('data_cleared', { deletedCount, cutoffDate });
      return deletedCount;
    } catch (error) {
      console.error('Failed to clear old data:', error);
      throw new Error('Data cleanup failed');
    }
  }
}

// React hook for signature management
export function useOfflineSignature() {
  const manager = OfflineSignatureManager.getInstance();
  
  return {
    captureSignature: manager.captureSignature.bind(manager),
    createForm: manager.createForm.bind(manager),
    updateForm: manager.updateForm.bind(manager),
    submitForm: manager.submitForm.bind(manager),
    getSignature: manager.getSignature.bind(manager),
    getForm: manager.getForm.bind(manager),
    getSubmission: manager.getSubmission.bind(manager),
    getSignaturesByForm: manager.getSignaturesByForm.bind(manager),
    getForms: manager.getForms.bind(manager),
    getSubmissions: manager.getSubmissions.bind(manager),
    getPendingSyncSignatures: manager.getPendingSyncSignatures.bind(manager),
    getPendingSyncSubmissions: manager.getPendingSyncSubmissions.bind(manager),
    updateSyncStatus: manager.updateSyncStatus.bind(manager),
    getStatistics: manager.getStatistics.bind(manager),
    deleteSignature: manager.deleteSignature.bind(manager),
    deleteForm: manager.deleteForm.bind(manager),
    clearOldData: manager.clearOldData.bind(manager),
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}

// Factory function for testing
export function createOfflineSignatureManager(): OfflineSignatureManager {
  return OfflineSignatureManager.getInstance();
}
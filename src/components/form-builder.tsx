'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  Copy,
  Move,
  Settings,
  FileText,
  PenTool,
  Grid,
  Layout,
  Type,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Image,
  Upload,
  CheckSquare,
  Circle,
  List,
  AlignLeft,
  Hash,
  MapPin,
  User,
  Building,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';

import { useOfflineSignature } from '@/lib/offline-signature-manager';
import type { 
  ElectronicForm,
  FormField,
  SignatureField,
  FormSettings,
  FormStyling,
  FormValidation
} from '@/lib/offline-signature-manager';

interface FormBuilderProps {
  organizationId: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'general';
  initialForm?: ElectronicForm;
  onSave?: (form: ElectronicForm) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

interface DraggedField {
  type: FormField['type'] | 'signature';
  data?: Partial<FormField | SignatureField>;
}

const FIELD_TYPES = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'time', label: 'Time', icon: Clock },
  { type: 'datetime', label: 'Date & Time', icon: Calendar },
  { type: 'currency', label: 'Currency', icon: DollarSign },
  { type: 'percentage', label: 'Percentage', icon: Percent },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'multiselect', label: 'Multi-Select', icon: List },
  { type: 'radio', label: 'Radio Buttons', icon: Circle },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { type: 'file', label: 'File Upload', icon: Upload },
  { type: 'signature', label: 'Signature', icon: PenTool }
] as const;

const INDUSTRY_TEMPLATES = {
  hs: [
    { name: 'Work Order Completion Form', fields: ['customer_info', 'work_details', 'completion_notes', 'customer_signature'] },
    { name: 'Service Agreement', fields: ['customer_info', 'service_details', 'terms', 'signatures'] },
    { name: 'Estimate Form', fields: ['customer_info', 'scope_of_work', 'materials', 'pricing', 'customer_signature'] }
  ],
  rest: [
    { name: 'Customer Feedback Form', fields: ['customer_info', 'dining_experience', 'food_quality', 'service_rating'] },
    { name: 'Catering Order Form', fields: ['customer_info', 'event_details', 'menu_selection', 'pricing', 'deposit'] },
    { name: 'Reservation Confirmation', fields: ['customer_info', 'reservation_details', 'special_requests'] }
  ],
  auto: [
    { name: 'Vehicle Inspection Form', fields: ['customer_info', 'vehicle_details', 'inspection_results', 'recommendations'] },
    { name: 'Repair Authorization', fields: ['customer_info', 'vehicle_info', 'repair_details', 'cost_estimate', 'authorization'] },
    { name: 'Pickup Form', fields: ['customer_info', 'vehicle_info', 'work_completed', 'final_inspection', 'customer_signature'] }
  ],
  ret: [
    { name: 'Customer Information Form', fields: ['personal_info', 'preferences', 'contact_details'] },
    { name: 'Return/Exchange Form', fields: ['customer_info', 'item_details', 'reason', 'preferred_resolution'] },
    { name: 'Special Order Form', fields: ['customer_info', 'item_specifications', 'delivery_details', 'payment_info'] }
  ],
  general: [
    { name: 'Contact Form', fields: ['name', 'email', 'phone', 'message'] },
    { name: 'Registration Form', fields: ['personal_info', 'account_details', 'preferences'] },
    { name: 'Survey Form', fields: ['demographics', 'questions', 'feedback'] }
  ]
};

export default function FormBuilder({
  organizationId,
  industry,
  initialForm,
  onSave,
  onCancel,
  readOnly = false
}: FormBuilderProps) {
  const [form, setForm] = useState<Partial<ElectronicForm>>({
    name: ',
    title: ',
    description: ',
    version: '1.0',
    organizationId,
    industry,
    category: ',
    fields: [],
    signatureFields: [],
    settings: {
      allowPartialSave: true,
      autoSave: false,
      autoSaveInterval: 30000,
      requireGPS: false,
      requirePhoto: false,
      allowOfflineSubmission: true,
      emailConfirmation: false,
      smsConfirmation: false,
      printEnabled: true,
      pdfGeneration: true,
      encryption: false,
      retention: {
        period: 365,
        deleteAfter: false
      }
    },
    validation: {
      rules: [],
      customValidators: [],
      crossFieldValidation: []
    },
    templates: [],
    styling: {
      theme: 'light',
      primaryColor: '#1C8BFF',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Inter',
      fontSize: 14,
      layout: 'single-column',
      spacing: 16,
      borderRadius: 8
    },
    workflow: {
      steps: [],
      approvals: [],
      notifications: [],
      integrations: []
    },
    isActive: true,
    ...initialForm
  });

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<DraggedField | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signatureManager = useOfflineSignature();

  const generateFieldId = () => 'field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';

  const addField = (type: FormField['type'] | 'signature', afterIndex?: number) => {
    const fieldId = generateFieldId();
    
    if (type === 'signature') {
      const signatureField: SignatureField = {
        id: fieldId,
        name: 'signature_${form.signatureFields?.length || 0 + 1}',
        label: 'Signature',
        required: true,
        purpose: 'approval',
        requiresWitness: false,
        position: { x: 0, y: 0, width: 400, height: 150 },
        signerType: 'customer',
        order: (form.signatureFields?.length || 0) + 1
      };

      setForm(prev => ({
        ...prev,
        signatureFields: [...(prev.signatureFields || []), signatureField]
      }));
    } else {
      const newField: FormField = {
        id: fieldId,
        name: 'field_${(form.fields?.length || 0) + 1}',
        label: getDefaultLabel(type),
        type,
        required: false,
        layout: { width: 'full', breakAfter: false },
        order: (form.fields?.length || 0) + 1
      };

      // Add type-specific defaults
      if (type === 'select' || type === 'multiselect' || type === 'radio' || type === 'checkbox') {
        newField.options = [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ];
      }

      const insertIndex = afterIndex !== undefined ? afterIndex + 1 : form.fields?.length || 0;
      const updatedFields = [...(form.fields || [])];
      updatedFields.splice(insertIndex, 0, newField);

      setForm(prev => ({
        ...prev,
        fields: updatedFields
      }));
    }

    setSelectedField(fieldId);
  };

  const getDefaultLabel = (type: FormField['type']): string => {
    const labels = {
      text: 'Text Field',
      email: 'Email Address',
      phone: 'Phone Number',
      number: 'Number',
      date: 'Date',
      time: 'Time',
      datetime: 'Date & Time',
      currency: 'Amount',
      percentage: 'Percentage',
      textarea: 'Description',
      select: 'Select Option',
      multiselect: 'Select Multiple',
      radio: 'Choose One',
      checkbox: 'Select All That Apply',
      file: 'Upload File'
    };
    return labels[type] || 'Field';
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields?.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const updateSignatureField = (fieldId: string, updates: Partial<SignatureField>) => {
    setForm(prev => ({
      ...prev,
      signatureFields: prev.signatureFields?.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields?.filter(field => field.id !== fieldId),
      signatureFields: prev.signatureFields?.filter(field => field.id !== fieldId)
    }));
    
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    setForm(prev => {
      const fields = [...(prev.fields || [])];
      const index = fields.findIndex(f => f.id === fieldId);
      
      if (index === -1) return prev;
      
      const newIndex = direction === 'up` ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= fields.length) return prev;
      
      [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
      
      return { ...prev, fields };
    });
  };

  const duplicateField = (fieldId: string) => {
    const field = form.fields?.find(f => f.id === fieldId);
    if (!field) return;

    const newField = {
      ...field,
      id: generateFieldId(),
      name: `${field.name}_copy',
      label: '${field.label} (Copy)'
    };

    const index = form.fields?.findIndex(f => f.id === fieldId) || 0;
    const updatedFields = [...(form.fields || [])];
    updatedFields.splice(index + 1, 0, newField);

    setForm(prev => ({
      ...prev,
      fields: updatedFields
    }));
  };

  const loadTemplate = (templateName: string) => {
    const templates = INDUSTRY_TEMPLATES[industry];
    const template = templates.find(t => t.name === templateName);
    
    if (!template) return;

    // Clear existing fields
    setForm(prev => ({
      ...prev,
      name: templateName,
      title: templateName,
      fields: [],
      signatureFields: []
    }));

    // Add template fields
    template.fields.forEach((fieldType, index) => {
      setTimeout(() => {
        if (fieldType === 'customer_signature' || fieldType === 'signatures' || fieldType === 'authorization') {
          addField('signature');
        } else {
          addField('text');
        }
      }, index * 100);
    });
  };

  const saveForm = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!form.name?.trim()) {
        setError('Form name is required');
        return;
      }

      if (!form.title?.trim()) {
        setError('Form title is required');
        return;
      }

      if (!form.fields?.length && !form.signatureFields?.length) {
        setError('Form must have at least one field');
        return;
      }

      const formData = {
        ...form,
        createdAt: form.createdAt || new Date(),
        updatedAt: new Date()
      } as ElectronicForm;

      if (initialForm?.id) {
        await signatureManager.updateForm(initialForm.id, formData);
        setSuccess('Form updated successfully');
      } else {
        const formId = await signatureManager.createForm(formData);
        setSuccess('Form created successfully');
        setForm(prev => ({ ...prev, id: formId }));
      }

      onSave?.(formData);
    } catch (error) {
      console.error('Failed to save form:', error);
      setError('Failed to save form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (fieldType: FormField['type'] | 'signature') => {
    setDraggedField({ type: fieldType });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, afterIndex?: number) => {
    e.preventDefault();
    
    if (draggedField) {
      addField(draggedField.type, afterIndex);
      setDraggedField(null);
    }
  };

  const renderFieldIcon = (type: FormField['type'] | 'signature') => {
    const iconMap = {
      text: Type,
      email: Mail,
      phone: Phone,
      number: Hash,
      date: Calendar,
      time: Clock,
      datetime: Calendar,
      currency: DollarSign,
      percentage: Percent,
      textarea: AlignLeft,
      select: List,
      multiselect: List,
      radio: Circle,
      checkbox: CheckSquare,
      file: Upload,
      signature: PenTool
    };

    const IconComponent = iconMap[type];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Type className="h-4 w-4" />;
  };

  const renderFieldEditor = () => {
    if (!selectedField) return null;

    const field = form.fields?.find(f => f.id === selectedField);
    const signatureField = form.signatureFields?.find(f => f.id === selectedField);

    if (signatureField) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Signature Field Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={signatureField.label}
                onChange={(e) => updateSignatureField(selectedField, { label: e.target.value })}
                placeholder="Signature label"
              />
            </div>

            <div>
              <Label>Purpose</Label>
              <Select
                value={signatureField.purpose}
                onValueChange={(value: unknown) => updateSignatureField(selectedField, { purpose: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                  <SelectItem value="authorization">Authorization</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Signer Type</Label>
              <Select
                value={signatureField.signerType}
                onValueChange={(value: unknown) => updateSignatureField(selectedField, { signerType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="witness">Witness</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={signatureField.required}
                onCheckedChange={(checked) => updateSignatureField(selectedField, { required: checked })}
              />
              <Label htmlFor="required">Required</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="witness"
                checked={signatureField.requiresWitness}
                onCheckedChange={(checked) => updateSignatureField(selectedField, { requiresWitness: checked })}
              />
              <Label htmlFor="witness">Requires Witness</Label>
            </div>

            <div>
              <Label>Legal Text (Optional)</Label>
              <Textarea
                value={signatureField.legalText || ''}
                onChange={(e) => updateSignatureField(selectedField, { legalText: e.target.value })}
                placeholder="Legal disclaimer or terms"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!field) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {renderFieldIcon(field.type)}
            Field Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Field Name</Label>
            <Input
              value={field.name}
              onChange={(e) => updateField(selectedField, { name: e.target.value })}
              placeholder="field_name"
            />
          </div>

          <div>
            <Label>Label</Label>
            <Input
              value={field.label}
              onChange={(e) => updateField(selectedField, { label: e.target.value })}
              placeholder="Field label"
            />
          </div>

          <div>
            <Label>Placeholder</Label>
            <Input
              value={field.placeholder || ''}
              onChange={(e) => updateField(selectedField, { placeholder: e.target.value })}
              placeholder="Enter placeholder text"
            />
          </div>

          <div>
            <Label>Help Text</Label>
            <Input
              value={field.helpText || ''}
              onChange={(e) => updateField(selectedField, { helpText: e.target.value })}
              placeholder="Help text for users"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={field.required}
              onCheckedChange={(checked) => updateField(selectedField, { required: checked })}
            />
            <Label htmlFor="required">Required Field</Label>
          </div>

          <div>
            <Label>Width</Label>
            <Select
              value={field.layout.width}
              onValueChange={(value: unknown) => updateField(selectedField, { 
                layout: { ...field.layout, width: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="half">Half Width</SelectItem>
                <SelectItem value="third">One Third</SelectItem>
                <SelectItem value="quarter">One Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options for select fields */}
          {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio' || field.type === 'checkbox') && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option.value}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = { ...option, value: e.target.value };
                        updateField(selectedField, { options: newOptions });
                      }}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Input
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = { ...option, label: e.target.value };
                        updateField(selectedField, { options: newOptions });
                      }}
                      placeholder="Label"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = field.options?.filter((_, i) => i !== index);
                        updateField(selectedField, { options: newOptions });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(field.options || []), { value: ', label: ' }];
                    updateField(selectedField, { options: newOptions });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Validation settings */}
          <div className="pt-4 border-t">
            <Label className="text-base font-medium">Validation</Label>
            
            {(field.type === 'text' || field.type === 'textarea') && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-sm">Min Length</Label>
                  <Input
                    type="number"
                    value={field.validation?.minLength || ''}
                    onChange={(e) => updateField(selectedField, {
                      validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined }
                    })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Max Length</Label>
                  <Input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) => updateField(selectedField, {
                      validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined }
                    })}
                  />
                </div>
              </div>
            )}

            {field.type === 'number' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-sm">Minimum</Label>
                  <Input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => updateField(selectedField, {
                      validation: { ...field.validation, min: parseFloat(e.target.value) || undefined }
                    })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Maximum</Label>
                  <Input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => updateField(selectedField, {
                      validation: { ...field.validation, max: parseFloat(e.target.value) || undefined }
                    })}
                  />
                </div>
              </div>
            )}

            <div className="mt-2">
              <Label className="text-sm">Pattern (Regex)</Label>
              <Input
                value={field.validation?.pattern || ''}
                onChange={(e) => updateField(selectedField, {
                  validation: { ...field.validation, pattern: e.target.value }
                })}
                placeholder="^[A-Za-z0-9]+$"
              />
            </div>

            <div className="mt-2">
              <Label className="text-sm">Error Message</Label>
              <Input
                value={field.validation?.errorMessage || ''}
                onChange={(e) => updateField(selectedField, {
                  validation: { ...field.validation, errorMessage: e.target.value }
                })}
                placeholder="Custom error message"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Form Builder</h1>
          <p className="text-neutral-600">
            Create and customize electronic forms for {industry.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={saveForm}
            disabled={loading || readOnly}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Form
          </Button>
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form Settings */}
        <div className="w-80 border-r border-neutral-200 p-6 bg-neutral-50 overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-medium text-neutral-900 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <Label>Form Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter form name"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label>Form Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter form title"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter form description"
                    rows={3}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Enter category"
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Templates */}
            {!initialForm && (
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Templates</h3>
                <div className="space-y-2">
                  {INDUSTRY_TEMPLATES[industry].map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => loadTemplate(template.name)}
                      disabled={readOnly}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Field Types */}
            <div>
              <h3 className="font-medium text-neutral-900 mb-3">Field Types</h3>
              <div className="grid grid-cols-1 gap-2">
                {FIELD_TYPES.map((fieldType) => (
                  <Button
                    key={fieldType.type}
                    variant="outline"
                    className="w-full justify-start"
                    draggable={!readOnly}
                    onDragStart={() => handleDragStart(fieldType.type)}
                    onClick={() => !readOnly && addField(fieldType.type)}
                    disabled={readOnly}
                  >
                    {renderFieldIcon(fieldType.type)}
                    <span className="ml-2">{fieldType.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Form Settings */}
            <div>
              <h3 className="font-medium text-neutral-900 mb-3">Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowPartialSave"
                    checked={form.settings?.allowPartialSave || false}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, allowPartialSave: checked }
                    }))}
                    disabled={readOnly}
                  />
                  <Label htmlFor="allowPartialSave" className="text-sm">Allow Partial Save</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireGPS"
                    checked={form.settings?.requireGPS || false}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, requireGPS: checked }
                    }))}
                    disabled={readOnly}
                  />
                  <Label htmlFor="requireGPS" className="text-sm">Require GPS Location</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowOffline"
                    checked={form.settings?.allowOfflineSubmission || false}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, allowOfflineSubmission: checked }
                    }))}
                    disabled={readOnly}
                  />
                  <Label htmlFor="allowOffline" className="text-sm">Allow Offline Submission</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailConfirmation"
                    checked={form.settings?.emailConfirmation || false}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, emailConfirmation: checked }
                    }))}
                    disabled={readOnly}
                  />
                  <Label htmlFor="emailConfirmation" className="text-sm">Email Confirmation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pdfGeneration"
                    checked={form.settings?.pdfGeneration || false}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, pdfGeneration: checked }
                    }))}
                    disabled={readOnly}
                  />
                  <Label htmlFor="pdfGeneration" className="text-sm">PDF Generation</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Form Builder */}
        <div className="flex-1 flex flex-col">
          {/* Form Preview/Builder */}
          <div 
            className="flex-1 p-6 overflow-y-auto bg-white"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e)}
          >
            <div className="max-w-4xl mx-auto">
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {form.title || 'Untitled Form'}
                </h2>
                {form.description && (
                  <p className="text-neutral-600 mt-2">{form.description}</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {form.fields?.map((field, index) => (
                  <div
                    key={field.id}
                    className={'group relative p-4 border-2 rounded-lg transition-colors ${
                      selectedField === field.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }'}
                    onClick={() => setSelectedField(field.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {/* Field Controls */}
                    {!previewMode && !readOnly && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(field.id, 'up');
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(field.id, 'down');
                            }}
                            disabled={index === (form.fields?.length || 0) - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateField(field.id);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(field.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Field Label */}
                    <Label className="flex items-center gap-2 mb-2">
                      {renderFieldIcon(field.type)}
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>

                    {/* Field Input */}
                    <div className={'
                      ${field.layout.width === 'half' ? 'w-1/2' : '}
                      ${field.layout.width === 'third' ? 'w-1/3' : '}
                      ${field.layout.width === 'quarter' ? 'w-1/4' : '}
                    '}>
                      {field.type === 'textarea' ? (
                        <Textarea
                          placeholder={field.placeholder}
                          disabled
                          rows={3}
                        />
                      ) : field.type === 'select' ? (
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || 'Select option'} />
                          </SelectTrigger>
                        </Select>
                      ) : field.type === 'radio' ? (
                        <div className="space-y-2">
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <input type="radio" disabled />
                              <Label>{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      ) : field.type === 'checkbox' ? (
                        <div className="space-y-2">
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <input type="checkbox" disabled />
                              <Label>{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      ) : field.type === 'file' ? (
                        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                          <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                          <p className="text-neutral-600">Upload files here</p>
                        </div>
                      ) : (
                        <Input
                          type={field.type === 'currency' ? 'number' : field.type}
                          placeholder={field.placeholder}
                          disabled
                        />
                      )}
                    </div>

                    {/* Help Text */}
                    {field.helpText && (
                      <p className="text-sm text-neutral-500 mt-1">{field.helpText}</p>
                    )}
                  </div>
                ))}

                {/* Signature Fields */}
                {form.signatureFields?.map((field, index) => (
                  <div
                    key={field.id}
                    className={'group relative p-4 border-2 rounded-lg transition-colors ${
                      selectedField === field.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }'}
                    onClick={() => setSelectedField(field.id)}
                  >
                    {/* Field Controls */}
                    {!previewMode && !readOnly && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteField(field.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <Label className="flex items-center gap-2 mb-2">
                      <PenTool className="h-4 w-4" />
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>

                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 bg-neutral-50">
                      <div className="text-center">
                        <PenTool className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                        <p className="text-neutral-600">Signature Area</p>
                        <p className="text-sm text-neutral-500">
                          {field.purpose} signature for {field.signerType}
                        </p>
                      </div>
                    </div>

                    {field.legalText && (
                      <p className="text-xs text-neutral-600 mt-2 italic">{field.legalText}</p>
                    )}
                  </div>
                ))}

                {/* Empty State */}
                {(!form.fields?.length && !form.signatureFields?.length) && (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-600 mb-2">No fields added yet</h3>
                    <p className="text-neutral-500 mb-4">
                      Drag field types from the left panel or click to add fields
                    </p>
                    {!readOnly && (
                      <Button onClick={() => addField('text')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Field
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Field Editor */}
        {selectedField && !previewMode && (
          <div className="w-80 border-l border-neutral-200 p-6 bg-neutral-50 overflow-y-auto">
            {renderFieldEditor()}
          </div>
        )}
      </div>
    </div>
  );
}
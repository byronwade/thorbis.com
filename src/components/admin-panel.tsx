'use client'

import { useState } from 'react'
import { 
  Upload, 
  Download, 
  Copy, 
  Trash2, 
  Edit, 
  Settings,
  FileText,
  Database,
  RotateCcw,
  Check,
  X,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PricebookService, PricebookCategory } from '@/types/pricebook'

interface AdminPanelProps {
  selectedServices: PricebookService[]
  categories: PricebookCategory[]
  onBulkUpdate: (services: PricebookService[], updates: Partial<PricebookService>) => void
  onBulkDelete: (serviceIds: string[]) => void
  onExportServices: (services: PricebookService[], format: 'csv' | 'json' | 'pdf') => void
  onImportServices: (file: File) => void
  onClose: () => void
}

export function AdminPanel({
  selectedServices,
  categories,
  onBulkUpdate,
  onBulkDelete,
  onExportServices,
  onImportServices,
  onClose
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'bulk' | 'import' | 'export' | 'settings'>('bulk')
  const [bulkUpdates, setBulkUpdates] = useState<Partial<PricebookService>>({})
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleBulkUpdate = () => {
    onBulkUpdate(selectedServices, bulkUpdates)
    setBulkUpdates({})
  }

  const handleExport = () => {
    onExportServices(selectedServices, exportFormat)
  }

  const handleImport = () => {
    if (importFile) {
      onImportServices(importFile)
      setImportFile(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Price Book Administration
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedServices.length} service{selectedServices.length !== 1 ? 's' : '} selected
            </p>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex space-x-0">
            {[
              { id: 'bulk', label: 'Bulk Operations', icon: Edit },
              { id: 'import', label: 'Import', icon: Upload },
              { id: 'export', label: 'Export', icon: Download },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={'px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }'}
                >
                  <Icon className="h-4 w-4 mr-2 inline" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6">
          {activeTab === 'bulk' && (
            <BulkOperationsTab
              selectedServices={selectedServices}
              categories={categories}
              bulkUpdates={bulkUpdates}
              onUpdateBulkUpdates={setBulkUpdates}
              onApplyUpdates={handleBulkUpdate}
              onDelete={() => setShowDeleteConfirm(true)}
              showDeleteConfirm={showDeleteConfirm}
              onCancelDelete={() => setShowDeleteConfirm(false)}
              onConfirmDelete={() => {
                onBulkDelete(selectedServices.map(s => s.id))
                setShowDeleteConfirm(false)
              }}
            />
          )}

          {activeTab === 'import' && (
            <ImportTab
              importFile={importFile}
              onFileChange={handleFileChange}
              onImport={handleImport}
            />
          )}

          {activeTab === 'export' && (
            <ExportTab
              selectedServices={selectedServices}
              exportFormat={exportFormat}
              onFormatChange={setExportFormat}
              onExport={handleExport}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </div>
      </div>
    </div>
  )
}

// Bulk Operations Tab
function BulkOperationsTab({
  selectedServices,
  categories,
  bulkUpdates,
  onUpdateBulkUpdates,
  onApplyUpdates,
  onDelete,
  showDeleteConfirm,
  onCancelDelete,
  onConfirmDelete
}: {
  selectedServices: PricebookService[]
  categories: PricebookCategory[]
  bulkUpdates: Partial<PricebookService>
  onUpdateBulkUpdates: (updates: Partial<PricebookService>) => void
  onApplyUpdates: () => void
  onDelete: () => void
  showDeleteConfirm: boolean
  onCancelDelete: () => void
  onConfirmDelete: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Selected Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div>
                <div className="font-medium text-sm">{service.name}</div>
                <div className="text-xs text-neutral-500">${service.pricing.basePrice}</div>
              </div>
              <Badge variant={service.active ? 'default' : 'secondary'}>
                {service.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Bulk Updates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <Label htmlFor="bulk-category">Category</Label>
            <Select
              value={bulkUpdates.categoryId || ''}
              onValueChange={(value) => onUpdateBulkUpdates({ ...bulkUpdates, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Type */}
          <div>
            <Label htmlFor="bulk-service-type">Service Type</Label>
            <Select
              value={bulkUpdates.serviceType || ''}
              onValueChange={(value) => onUpdateBulkUpdates({ ...bulkUpdates, serviceType: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Labor Rate */}
          <div>
            <Label htmlFor="bulk-labor-rate">Labor Rate ($/hr)</Label>
            <Input
              id="bulk-labor-rate"
              type="number"
              placeholder="85"
              value={bulkUpdates.pricing?.laborRate || ''}
              onChange={(e) => onUpdateBulkUpdates({
                ...bulkUpdates,
                pricing: {
                  ...bulkUpdates.pricing,
                  laborRate: parseFloat(e.target.value) || 0
                }
              })}
            />
          </div>

          {/* Markup Percentage */}
          <div>
            <Label htmlFor="bulk-markup">Markup (%)</Label>
            <Input
              id="bulk-markup"
              type="number"
              placeholder="25"
              value={bulkUpdates.pricing?.markup || ''}
              onChange={(e) => onUpdateBulkUpdates({
                ...bulkUpdates,
                pricing: {
                  ...bulkUpdates.pricing,
                  markup: parseFloat(e.target.value) || 0
                }
              })}
            />
          </div>
        </div>

        {/* Status toggles */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bulk-active"
              checked={bulkUpdates.active === true}
              onCheckedChange={(checked) => 
                onUpdateBulkUpdates({ ...bulkUpdates, active: checked as boolean })
              }
            />
            <Label htmlFor="bulk-active">Mark as Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bulk-featured"
              checked={bulkUpdates.featured === true}
              onCheckedChange={(checked) => 
                onUpdateBulkUpdates({ ...bulkUpdates, featured: checked as boolean })
              }
            />
            <Label htmlFor="bulk-featured">Mark as Featured</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {!showDeleteConfirm ? (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">
                Delete {selectedServices.length} service{selectedServices.length !== 1 ? 's' : '}?
              </span>
              <Button size="sm" variant="destructive" onClick={onConfirmDelete}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button onClick={onApplyUpdates}>
            <Check className="h-4 w-4 mr-2" />
            Apply Updates
          </Button>
        </div>
      </div>
    </div>
  )
}

// Import Tab
function ImportTab({
  importFile,
  onFileChange,
  onImport
}: {
  importFile: File | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImport: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Import Services</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Import services from CSV, JSON, or Excel files. Existing services with matching IDs will be updated.
        </p>
      </div>

      {/* File upload */}
      <div>
        <Label htmlFor="import-file">Select File</Label>
        <div className="mt-2">
          <input
            id="import-file"
            type="file"
            accept=".csv,.json,.xlsx,.xls"
            onChange={onFileChange}
            className="block w-full text-sm text-neutral-500 dark:text-neutral-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-300
              dark:hover:file:bg-blue-800"
          />
        </div>
        {importFile && (
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
            Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {/* Format info */}
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
        <h4 className="font-medium mb-2">Supported Formats</h4>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <li>• CSV: Comma-separated values with headers</li>
          <li>• JSON: Array of service objects</li>
          <li>• Excel: XLSX/XLS spreadsheet files</li>
        </ul>
      </div>

      {/* Required fields */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Required Fields</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
          <div>• name</div>
          <div>• description</div>
          <div>• categoryId</div>
          <div>• basePrice</div>
          <div>• laborRate</div>
          <div>• estimatedHours</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Download Template
        </Button>
        <Button onClick={onImport} disabled={!importFile}>
          <Upload className="h-4 w-4 mr-2" />
          Import Services
        </Button>
      </div>
    </div>
  )
}

// Export Tab
function ExportTab({
  selectedServices,
  exportFormat,
  onFormatChange,
  onExport
}: {
  selectedServices: PricebookService[]
  exportFormat: 'csv' | 'json' | 'pdf'
  onFormatChange: (format: 'csv' | 'json' | 'pdf') => void
  onExport: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Export Services</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Export {selectedServices.length} selected service{selectedServices.length !== 1 ? 's' : '} 
          to your preferred format.
        </p>
      </div>

      {/* Format selection */}
      <div>
        <Label>Export Format</Label>
        <div className="mt-2 space-y-2">
          {[
            { value: 'csv', label: 'CSV (Spreadsheet)', desc: 'Compatible with Excel, Google Sheets' },
            { value: 'json', label: 'JSON (Data)', desc: 'For developers and system integration' },
            { value: 'pdf', label: 'PDF (Report)', desc: 'Formatted price book for printing' }
          ].map((format) => (
            <label key={format.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="export-format"
                value={format.value}
                checked={exportFormat === format.value}
                onChange={(e) => onFormatChange(e.target.value as any)}
                className="text-blue-600"
              />
              <div>
                <div className="font-medium">{format.label}</div>
                <div className="text-sm text-neutral-500">{format.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Export options */}
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
        <h4 className="font-medium mb-3">Export Options</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="export-pricing" defaultChecked />
            <Label htmlFor="export-pricing">Include pricing information</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="export-materials" defaultChecked />
            <Label htmlFor="export-materials">Include materials list</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="export-images" />
            <Label htmlFor="export-images">Include image URLs</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="export-analytics" />
            <Label htmlFor="export-analytics">Include usage analytics</Label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : '}
        </Button>
      </div>
    </div>
  )
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Book Settings</h3>
      </div>

      {/* General settings */}
      <div className="space-y-4">
        <h4 className="font-medium">General</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="default-markup">Default Markup (%)</Label>
            <Input id="default-markup" type="number" placeholder="25" />
          </div>
          <div>
            <Label htmlFor="default-labor-rate">Default Labor Rate ($/hr)</Label>
            <Input id="default-labor-rate" type="number" placeholder="85" />
          </div>
        </div>
      </div>

      {/* Display settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Display</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="show-cost-breakdown" defaultChecked />
            <Label htmlFor="show-cost-breakdown">Show cost breakdown to customers</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="show-material-details" defaultChecked />
            <Label htmlFor="show-material-details">Show material details</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="require-approval" />
            <Label htmlFor="require-approval">Require approval for custom pricing</Label>
          </div>
        </div>
      </div>

      {/* Data management */}
      <div className="space-y-4">
        <h4 className="font-medium">Data Management</h4>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Backup Data
          </Button>
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  )
}
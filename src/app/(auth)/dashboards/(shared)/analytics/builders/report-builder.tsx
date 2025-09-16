"use client";

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Settings2, 
  Plus, 
  Trash2, 
  GripVertical,
  Eye,
  Save,
  Download,
  Upload,
  Copy,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  Activity,
  Clock,
  Zap,
  Brain,
  Sparkles,
  Layout,
  Image
} from 'lucide-react';

export interface ReportSection {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text' | 'image';
  title: string;
  description?: string;
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'candlestick';
    dataSource?: string;
    metrics?: string[];
    filters?: Record<string, unknown>;
    styling?: {
      width: 'full' | 'half' | 'third' | 'quarter';
      height: 'small' | 'medium' | 'large';
      color?: string;
    };
    content?: string;
    imageUrl?: string;
  };
  position: {
    row: number;
    column: number;
    width: number;
    height: number;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'financial' | 'marketing' | 'custom';
  sections: ReportSection[];
  settings: {
    layout: 'grid' | 'flow';
    columns: number;
    backgroundColor: string;
    headerColor: string;
    includeHeader: boolean;
    includeFooter: boolean;
    includeTimestamp: boolean;
    refreshInterval?: number;
  };
}

export interface ReportBuilderProps {
  onSave: (report: ReportTemplate) => void;
  onPreview: (report: ReportTemplate) => Promise<void>;
  onExport: (report: ReportTemplate, format: 'pdf' | 'png' | 'json') => void;
  availableDataSources: Array<{
    id: string;
    name: string;
    fields: Array<{
      name: string;
      type: 'string' | 'number' | 'date' | 'boolean';
      description?: string;
    }>;
  }>;
  templates?: ReportTemplate[];
  className?: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'executive-dashboard',
    name: 'Executive Dashboard',
    description: 'High-level KPIs and business metrics for leadership',
    category: 'executive',
    sections: [
      {
        id: 'revenue-metric',
        type: 'metric',
        title: 'Total Revenue',
        config: {
          dataSource: 'analytics',
          metrics: ['revenue'],
          styling: { width: 'quarter', height: 'small', color: '#10b981' }
        },
        position: { row: 0, column: 0, width: 3, height: 2 }
      },
      {
        id: 'users-metric',
        type: 'metric',
        title: 'Active Users',
        config: {
          dataSource: 'analytics',
          metrics: ['users'],
          styling: { width: 'quarter', height: 'small', color: '#3b82f6' }
        },
        position: { row: 0, column: 3, width: 3, height: 2 }
      },
      {
        id: 'revenue-chart',
        type: 'chart',
        title: 'Revenue Trend',
        config: {
          chartType: 'line',
          dataSource: 'analytics',
          metrics: ['revenue'],
          styling: { width: 'half', height: 'medium' }
        },
        position: { row: 2, column: 0, width: 6, height: 4 }
      }
    ],
    settings: {
      layout: 'grid',
      columns: 12,
      backgroundColor: '#ffffff',
      headerColor: '#1C8BFF',
      includeHeader: true,
      includeFooter: true,
      includeTimestamp: true,
      refreshInterval: 300
    }
  },
  {
    id: 'financial-report',
    name: 'Financial Performance',
    description: 'Comprehensive financial analysis and trends',
    category: 'financial',
    sections: [
      {
        id: 'profit-loss',
        type: 'chart',
        title: 'Profit & Loss',
        config: {
          chartType: 'bar',
          dataSource: 'financial',
          metrics: ['profit', 'loss'],
          styling: { width: 'full', height: 'large' }
        },
        position: { row: 0, column: 0, width: 12, height: 6 }
      }
    ],
    settings: {
      layout: 'flow',
      columns: 12,
      backgroundColor: '#ffffff',
      headerColor: '#059669',
      includeHeader: true,
      includeFooter: true,
      includeTimestamp: true
    }
  }
];

const SECTION_TYPES = [
  { value: 'metric', label: 'Metric Card', icon: Target, description: 'Display key performance indicators' },
  { value: 'chart', label: 'Chart', icon: BarChart3, description: 'Visual data representation' },
  { value: 'table', label: 'Data Table', icon: Layout, description: 'Tabular data display' },
  { value: 'text', label: 'Text Block', icon: FileText, description: 'Custom text content' },
  { value: 'image', label: 'Image', icon: Image, description: 'Static or dynamic images' },
];

const CHART_TYPES = [
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'area', label: 'Area Chart', icon: LineChart },
  { value: 'candlestick', label: 'Candlestick', icon: Activity },
];

export function ReportBuilder({
  onSave,
  onPreview,
  onExport,
  availableDataSources,
  templates = REPORT_TEMPLATES,
  className = "",
}: ReportBuilderProps) {
  const [currentReport, setCurrentReport] = useState<ReportTemplate>({
    id: `report-${Date.now()}`,
    name: 'Untitled Report',
    description: '',
    category: 'custom',
    sections: [],
    settings: {
      layout: 'grid',
      columns: 12,
      backgroundColor: '#ffffff',
      headerColor: '#1C8BFF',
      includeHeader: true,
      includeFooter: true,
      includeTimestamp: true,
    }
  });
  
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('design');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const dragRef = useRef<HTMLDivElement>(null);

  const addSection = (type: ReportSection['type`]) => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}',
      type,
      title: 'New ${type.charAt(0).toUpperCase() + type.slice(1)}',
      config: {
        styling: {
          width: 'half',
          height: 'medium`,
        }
      },
      position: {
        row: currentReport.sections.length,
        column: 0,
        width: 6,
        height: 4
      }
    };

    setCurrentReport(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));

    setSelectedSection(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    setCurrentReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId: string) => {
    setCurrentReport(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
    
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const duplicateSection = (sectionId: string) => {
    const section = currentReport.sections.find(s => s.id === sectionId);
    if (!section) return;

    const duplicatedSection: ReportSection = {
      ...section,
      id: `section-${Date.now()}`,
      title: `${section.title} (Copy)`,
      position: {
        ...section.position,
        row: section.position.row + 1
      }
    };

    setCurrentReport(prev => ({
      ...prev,
      sections: [...prev.sections, duplicatedSection]
    }));
  };

  const loadTemplate = (template: ReportTemplate) => {
    setCurrentReport({
      ...template,
      id: `report-${Date.now()}`,
      name: `${template.name} (Copy)'
    });
    setShowTemplates(false);
  };

  const handleSave = () => {
    onSave(currentReport);
  };

  const handlePreview = async () => {
    setIsPreviewMode(true);
    try {
      await onPreview(currentReport);
    } finally {
      setIsPreviewMode(false);
    }
  };

  const selectedSectionData = currentReport.sections.find(s => s.id === selectedSection);

  return (
    <div className={'report-builder ${className} grid grid-cols-1 lg:grid-cols-4 gap-6 h-full'}>
      {/* Toolbar */}
      <div className="lg:col-span-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-500" />
                <div>
                  <CardTitle>Report Builder</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create custom analytics reports with drag-and-drop components
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button variant="outline" size="sm" onClick={handlePreview} disabled={isPreviewMode}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" onClick={() => onExport(currentReport, 'pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Left Panel - Components & Settings */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-4 mt-4">
            {/* Add Components */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SECTION_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => addSection(type.value as ReportSection['type'])}
                  >
                    <type.icon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Section Properties */}
            {selectedSectionData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Section Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={selectedSectionData.title}
                      onChange={(e) => updateSection(selectedSection!, { title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={selectedSectionData.description || ''}
                      onChange={(e) => updateSection(selectedSection!, { description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {selectedSectionData.type === 'chart' && (
                    <div className="space-y-2">
                      <Label>Chart Type</Label>
                      <Select
                        value={selectedSectionData.config.chartType || 'line'}
                        onValueChange={(value) => updateSection(selectedSection!, {
                          config: { ...selectedSectionData.config, chartType: value as any }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHART_TYPES.map((chart) => (
                            <SelectItem key={chart.value} value={chart.value}>
                              <div className="flex items-center gap-2">
                                <chart.icon className="h-4 w-4" />
                                {chart.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Data Source</Label>
                    <Select
                      value={selectedSectionData.config.dataSource || ''}
                      onValueChange={(value) => updateSection(selectedSection!, {
                        config: { ...selectedSectionData.config, dataSource: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDataSources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Width</Label>
                      <Select
                        value={selectedSectionData.config.styling?.width || 'half'}
                        onValueChange={(value) => updateSection(selectedSection!, {
                          config: {
                            ...selectedSectionData.config,
                            styling: { ...selectedSectionData.config.styling, width: value as any }
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quarter">Quarter</SelectItem>
                          <SelectItem value="third">Third</SelectItem>
                          <SelectItem value="half">Half</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Height</Label>
                      <Select
                        value={selectedSectionData.config.styling?.height || 'medium'}
                        onValueChange={(value) => updateSection(selectedSection!, {
                          config: {
                            ...selectedSectionData.config,
                            styling: { ...selectedSectionData.config.styling, height: value as any }
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateSection(selectedSection!)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSection(selectedSection!)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Report Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    value={currentReport.name}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={currentReport.description}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Include Header</Label>
                    <Switch
                      checked={currentReport.settings.includeHeader}
                      onCheckedChange={(checked) => setCurrentReport(prev => ({
                        ...prev,
                        settings: { ...prev.settings, includeHeader: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Footer</Label>
                    <Switch
                      checked={currentReport.settings.includeFooter}
                      onCheckedChange={(checked) => setCurrentReport(prev => ({
                        ...prev,
                        settings: { ...prev.settings, includeFooter: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Timestamp</Label>
                    <Switch
                      checked={currentReport.settings.includeTimestamp}
                      onCheckedChange={(checked) => setCurrentReport(prev => ({
                        ...prev,
                        settings: { ...prev.settings, includeTimestamp: checked }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Refresh Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={currentReport.settings.refreshInterval || '`}
                    onChange={(e) => setCurrentReport(prev => ({
                      ...prev,
                      settings: { ...prev.settings, refreshInterval: parseInt(e.target.value) || undefined }
                    }))}
                    placeholder="Auto-refresh disabled"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Center Panel - Report Canvas */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Report Canvas</CardTitle>
              <Badge variant="outline">{currentReport.sections.length} sections</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-full">
            <div 
              ref={dragRef}
              className="grid grid-cols-12 gap-2 min-h-96 bg-muted/30 rounded-lg p-4"
              style={{ backgroundColor: currentReport.settings.backgroundColor }}
            >
              {currentReport.sections.length === 0 ? (
                <div className="col-span-12 flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Add components from the left panel to start building your report</p>
                  </div>
                </div>
              ) : (
                currentReport.sections.map((section) => (
                  <div
                    key={section.id}
                    className={'bg-card rounded border-2 transition-all cursor-pointer ${
                      selectedSection === section.id ? 'border-blue-500 shadow-sm' : 'border-muted hover:border-muted-foreground/50`
                    }`}
                    style={{
                      gridColumn: `span ${section.position.width}',
                      gridRow: 'span ${Math.max(1, section.position.height / 2)}',
                    }}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="p-3 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {section.type === 'chart' && <BarChart3 className="h-4 w-4" />}
                          {section.type === 'metric' && <Target className="h-4 w-4" />}
                          {section.type === 'table' && <Layout className="h-4 w-4" />}
                          {section.type === 'text' && <FileText className="h-4 w-4" />}
                          {section.type === 'image' && <Image className="h-4 w-4" />}
                          <span className="text-sm font-medium">{section.title}</span>
                        </div>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground">
                        {section.type === 'chart' && '${section.config.chartType || 'line'} chart'}
                        {section.type === 'metric' && 'KPI Display'}
                        {section.type === 'table' && 'Data Table'}
                        {section.type === 'text' && 'Text Content'}
                        {section.type === 'image' && 'Image Placeholder'}
                      </div>
                      
                      {section.description && (
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Section List */}
      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Section List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentReport.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={'p-2 rounded border cursor-pointer transition-colors ${
                    selectedSection === section.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                  }'}
                  onClick={() => setSelectedSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm font-medium truncate">{section.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {section.type}
                    </Badge>
                  </div>
                  {section.config.dataSource && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Source: {section.config.dataSource}
                    </div>
                  )}
                </div>
              ))}
              
              {currentReport.sections.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No sections added yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-card rounded-lg border shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Report Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with a pre-built template and customize to your needs
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setShowTemplates(false)}>
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {template.sections.length} sections
                      </span>
                      <Button size="sm">Use Template</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
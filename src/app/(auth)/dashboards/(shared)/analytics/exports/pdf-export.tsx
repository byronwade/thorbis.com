"use client";

import { useState, useRef } from 'react';
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
  Download, 
  FileText, 
  Image, 
  Settings2, 
  Calendar,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Palette,
  Layout,
  FileImage,
  Loader2
} from 'lucide-react';

export interface PDFExportOptions {
  filename: string;
  title: string;
  description?: string;
  includeHeader: boolean;
  includeFooter: boolean;
  includeLogo: boolean;
  includeTimestamp: boolean;
  includeMetadata: boolean;
  orientation: 'portrait' | 'landscape';
  paperSize: 'letter' | 'a4' | 'legal' | 'tabloid';
  margin: number;
  quality: number;
  scale: number;
  backgroundColor: string;
  headerInfo: {
    companyName: string;
    reportTitle: string;
    generatedBy: string;
    contactInfo: string;
  };
  footerInfo: {
    pageNumbers: boolean;
    disclaimer: string;
    website: string;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export interface PDFExportProps {
  targetElementId?: string;
  targetElement?: HTMLElement;
  charts?: Array<{
    id: string;
    title: string;
    element: HTMLElement;
    description?: string;
  }>;
  onExportStart?: () => void;
  onExportComplete?: (filename: string) => void;
  onExportError?: (error: Error) => void;
  defaultOptions?: Partial<PDFExportOptions>;
  className?: string;
}

const DEFAULT_OPTIONS: PDFExportOptions = {
  filename: 'analytics-report-${new Date().getTime()}',
  title: 'Analytics Report',
  description: 'Generated analytics report with charts and insights',
  includeHeader: true,
  includeFooter: true,
  includeLogo: true,
  includeTimestamp: true,
  includeMetadata: true,
  orientation: 'landscape',
  paperSize: 'letter',
  margin: 0.5,
  quality: 0.95,
  scale: 2,
  backgroundColor: '#ffffff',
  headerInfo: {
    companyName: 'Thorbis Analytics',
    reportTitle: 'Business Intelligence Report',
    generatedBy: 'Analytics Dashboard',
    contactInfo: 'analytics@thorbis.com',
  },
  footerInfo: {
    pageNumbers: true,
    disclaimer: 'Confidential - This report contains proprietary business information',
    website: 'analytics.thorbis.com',
  },
  branding: {
    logoUrl: ',
    primaryColor: '#1C8BFF',
    secondaryColor: '#6366f1',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

const PAPER_SIZES = [
  { value: 'letter', label: 'Letter (8.5" x 11")', dimensions: '8.5" × 11"' },
  { value: 'a4', label: 'A4 (210mm x 297mm)', dimensions: '210mm × 297mm' },
  { value: 'legal', label: 'Legal (8.5" x 14")', dimensions: '8.5" × 14"' },
  { value: 'tabloid', label: 'Tabloid (11" x 17")', dimensions: '11" × 17"' },
];

const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

export function PDFExport({
  targetElementId,
  targetElement,
  charts = [],
  onExportStart,
  onExportComplete,
  onExportError,
  defaultOptions = {},
  className = "",
}: PDFExportProps) {
  const [options, setOptions] = useState<PDFExportOptions>({
    ...DEFAULT_OPTIONS,
    ...defaultOptions,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('general');
  
  const previewRef = useRef<HTMLDivElement>(null);

  const updateOptions = (updates: Partial<PDFExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  };

  const generatePDFContent = () => {
    const content = document.createElement('div');
    content.style.cssText = '
      font-family: ${options.branding.fontFamily};
      background-color: ${options.backgroundColor};
      color: #333333;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    ';

    // Add header
    if (options.includeHeader) {
      const header = document.createElement('div');
      header.style.cssText = '
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid ${options.branding.primaryColor};
        padding-bottom: 20px;
        margin-bottom: 30px;
      ';

      const logoSection = document.createElement('div');
      logoSection.style.cssText = 'display: flex; align-items: center; gap: 15px;';

      if (options.includeLogo && options.branding.logoUrl) {
        const logo = document.createElement('img');
        logo.src = options.branding.logoUrl;
        logo.style.cssText = 'height: 50px; width: auto;';
        logoSection.appendChild(logo);
      }

      const companyInfo = document.createElement('div');
      companyInfo.innerHTML = '
        <h1 style="margin: 0; color: ${options.branding.primaryColor}; font-size: 28px; font-weight: bold;">
          ${options.headerInfo.companyName}
        </h1>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          ${options.headerInfo.contactInfo}
        </p>
      ';
      logoSection.appendChild(companyInfo);

      const reportInfo = document.createElement('div');
      reportInfo.style.cssText = 'text-align: right;`;
      reportInfo.innerHTML = '
        <h2 style="margin: 0; color: #333; font-size: 24px; font-weight: 600;">
          ${options.title}
        </h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          Generated by ${options.headerInfo.generatedBy}
        </p>
        ${options.includeTimestamp ? '
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
            ${new Date().toLocaleString()}
          </p>
        ' : '}
      ';

      header.appendChild(logoSection);
      header.appendChild(reportInfo);
      content.appendChild(header);
    }

    // Add description
    if (options.description) {
      const description = document.createElement('div`);
      description.style.cssText = `
        background-color: ${options.branding.secondaryColor}20;
        border-left: 4px solid ${options.branding.secondaryColor};
        padding: 15px;
        margin-bottom: 30px;
        border-radius: 4px;
      ';
      description.innerHTML = '
        <p style="margin: 0; color: #555; font-size: 16px; line-height: 1.5;">
          ${options.description}
        </p>
      ';
      content.appendChild(description);
    }

    // Add charts
    if (charts.length > 0) {
      charts.forEach((chart, index) => {
        const chartSection = document.createElement('div');
        chartSection.style.cssText = '
          margin-bottom: 40px;
          page-break-inside: avoid;
        ';

        const chartTitle = document.createElement('h3');
        chartTitle.style.cssText = '
          color: ${options.branding.primaryColor};
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 10px 0;
        ';
        chartTitle.textContent = chart.title;
        chartSection.appendChild(chartTitle);

        if (chart.description) {
          const chartDesc = document.createElement('p`);
          chartDesc.style.cssText = `
            color: #666;
            font-size: 14px;
            margin: 0 0 15px 0;
            line-height: 1.4;
          ';
          chartDesc.textContent = chart.description;
          chartSection.appendChild(chartDesc);
        }

        // Clone and append the chart element
        const chartClone = chart.element.cloneNode(true) as HTMLElement;
        chartClone.style.cssText = '
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #ffffff;
          overflow: hidden;
        ';
        chartSection.appendChild(chartClone);

        content.appendChild(chartSection);
      });
    } else if (targetElement) {
      // Add target element
      const elementClone = targetElement.cloneNode(true) as HTMLElement;
      content.appendChild(elementClone);
    } else if (targetElementId) {
      // Add element by ID
      const element = document.getElementById(targetElementId);
      if (element) {
        const elementClone = element.cloneNode(true) as HTMLElement;
        content.appendChild(elementClone);
      }
    }

    // Add metadata
    if (options.includeMetadata) {
      const metadata = document.createElement('div`);
      metadata.style.cssText = '
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        color: #888;
        font-size: 12px;
      ';
      metadata.innerHTML = '
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
          <div>
            <strong>Report Details:</strong><br>
            Generated: ${new Date().toLocaleString()}<br>
            Format: PDF Export<br>
            Version: 1.0
          </div>
          <div>
            <strong>System Info:</strong><br>
            User Agent: ${navigator.userAgent.split(' ')[0]}<br>
            Resolution: ${window.screen.width}x${window.screen.height}<br>
            Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
        </div>
      ';
      content.appendChild(metadata);
    }

    // Add footer
    if (options.includeFooter) {
      const footer = document.createElement('div`);
      footer.style.cssText = '
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid ${options.branding.primaryColor};
        text-align: center;
        color: #666;
        font-size: 12px;
      ';

      footer.innerHTML = '
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: left;">
            ${options.footerInfo.disclaimer}
          </div>
          <div style="text-align: right;">
            ${options.footerInfo.website}<br>
            ${options.footerInfo.pageNumbers ? 'Page 1 of 1' : '}
          </div>
        </div>
      ';
      content.appendChild(footer);
    }

    return content;
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportProgress(0);
    onExportStart?.();

    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      setExportProgress(20);

      // Generate PDF content
      const content = generatePDFContent();
      
      setExportProgress(40);

      // PDF generation options
      const pdfOptions = {
        margin: options.margin,
        filename: '${options.filename}.pdf',
        image: { 
          type: 'jpeg', 
          quality: options.quality 
        },
        html2canvas: { 
          scale: options.scale,
          backgroundColor: options.backgroundColor,
          logging: false,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
        },
        jsPDF: { 
          unit: 'in', 
          format: options.paperSize, 
          orientation: options.orientation,
          compress: true,
        },
      };

      setExportProgress(60);

      // Generate and save PDF
      await html2pdf()
        .set(pdfOptions)
        .from(content)
        .toPdf()
        .get('pdf')
        .then((pdf: unknown) => {
          setExportProgress(80);
          
          // Add page numbers if enabled
          if (options.footerInfo.pageNumbers) {
            const pageCount = pdf.internal.getNumberOfPages();
            for (const i = 1; i <= pageCount; i++) {
              pdf.setPage(i);
              pdf.setFontSize(10);
              pdf.setTextColor(150);
              pdf.text(
                'Page ${i} of ${pageCount}', 
                pdf.internal.pageSize.width - 1, 
                pdf.internal.pageSize.height - 0.5
              );
            }
          }
          
          setExportProgress(90);
          return pdf;
        })
        .save();

      setExportProgress(100);
      onExportComplete?.(options.filename);
      
    } catch (error) {
      console.error('PDF Export failed:', error);
      onExportError?.(error as Error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generatePreview = () => {
    if (!previewRef.current) return;
    
    previewRef.current.innerHTML = `;
    const content = generatePDFContent();
    content.style.cssText += `
      transform: scale(0.3);
      transform-origin: top left;
      width: 333%;
      height: 333%;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    ';
    previewRef.current.appendChild(content);
  };

  return (
    <div className={'pdf-export ${className} grid grid-cols-1 lg:grid-cols-3 gap-6'}>
      {/* Configuration Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PDF Export Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Filename</Label>
                    <Input
                      value={options.filename}
                      onChange={(e) => updateOptions({ filename: e.target.value })}
                      placeholder="Enter filename (without .pdf)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Report Title</Label>
                    <Input
                      value={options.title}
                      onChange={(e) => updateOptions({ title: e.target.value })}
                      placeholder="Enter report title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={options.description || ''}
                    onChange={(e) => updateOptions({ description: e.target.value })}
                    placeholder="Enter report description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Paper Size</Label>
                    <Select 
                      value={options.paperSize} 
                      onValueChange={(value) => updateOptions({ paperSize: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAPER_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            <div>
                              <div>{size.label}</div>
                              <div className="text-xs text-muted-foreground">{size.dimensions}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Orientation</Label>
                    <Select 
                      value={options.orientation} 
                      onValueChange={(value) => updateOptions({ orientation: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Margin (inches)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={options.margin}
                      onChange={(e) => updateOptions({ margin: parseFloat(e.target.value) || 0.5 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quality (0-1)</Label>
                    <Input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="1"
                      value={options.quality}
                      onChange={(e) => updateOptions({ quality: parseFloat(e.target.value) || 0.95 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Scale (1-4)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="1"
                      max="4"
                      value={options.scale}
                      onChange={(e) => updateOptions({ scale: parseFloat(e.target.value) || 2 })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Include Header</Label>
                    <Switch
                      checked={options.includeHeader}
                      onCheckedChange={(checked) => updateOptions({ includeHeader: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Footer</Label>
                    <Switch
                      checked={options.includeFooter}
                      onCheckedChange={(checked) => updateOptions({ includeFooter: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Timestamp</Label>
                    <Switch
                      checked={options.includeTimestamp}
                      onCheckedChange={(checked) => updateOptions({ includeTimestamp: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Metadata</Label>
                    <Switch
                      checked={options.includeMetadata}
                      onCheckedChange={(checked) => updateOptions({ includeMetadata: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Page Numbers</Label>
                    <Switch
                      checked={options.footerInfo.pageNumbers}
                      onCheckedChange={(checked) => updateOptions({ 
                        footerInfo: { ...options.footerInfo, pageNumbers: checked }
                      })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="branding" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={options.headerInfo.companyName}
                    onChange={(e) => updateOptions({ 
                      headerInfo: { ...options.headerInfo, companyName: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={options.branding.logoUrl || ''}
                    onChange={(e) => updateOptions({ 
                      branding: { ...options.branding, logoUrl: e.target.value }
                    })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={options.branding.primaryColor}
                        onChange={(e) => updateOptions({ 
                          branding: { ...options.branding, primaryColor: e.target.value }
                        })}
                        className="w-16"
                      />
                      <Input
                        value={options.branding.primaryColor}
                        onChange={(e) => updateOptions({ 
                          branding: { ...options.branding, primaryColor: e.target.value }
                        })}
                        placeholder="#1C8BFF"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={options.branding.secondaryColor}
                        onChange={(e) => updateOptions({ 
                          branding: { ...options.branding, secondaryColor: e.target.value }
                        })}
                        className="w-16"
                      />
                      <Input
                        value={options.branding.secondaryColor}
                        onChange={(e) => updateOptions({ 
                          branding: { ...options.branding, secondaryColor: e.target.value }
                        })}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select 
                    value={options.branding.fontFamily} 
                    onValueChange={(value) => updateOptions({ 
                      branding: { ...options.branding, fontFamily: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Contact Information</Label>
                  <Input
                    value={options.headerInfo.contactInfo}
                    onChange={(e) => updateOptions({ 
                      headerInfo: { ...options.headerInfo, contactInfo: e.target.value }
                    })}
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={options.footerInfo.website}
                    onChange={(e) => updateOptions({ 
                      footerInfo: { ...options.footerInfo, website: e.target.value }
                    })}
                    placeholder="www.company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Disclaimer</Label>
                  <Textarea
                    value={options.footerInfo.disclaimer}
                    onChange={(e) => updateOptions({ 
                      footerInfo: { ...options.footerInfo, disclaimer: e.target.value }
                    })}
                    placeholder="Enter legal disclaimer text"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Generated By</Label>
                  <Input
                    value={options.headerInfo.generatedBy}
                    onChange={(e) => updateOptions({ 
                      headerInfo: { ...options.headerInfo, generatedBy: e.target.value }
                    })}
                    placeholder="Analytics Dashboard"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Preview & Export Panel */}
      <div className="space-y-6">
        {/* Export Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={generatePreview} 
                variant="outline" 
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Generate Preview
              </Button>
              
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>

            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: '${exportProgress}%' }}
                  />
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <FileImage className="h-3 w-3" />
                <span>Format: PDF ({options.paperSize.toUpperCase()})</span>
              </div>
              <div className="flex items-center gap-2">
                <Layout className="h-3 w-3" />
                <span>Orientation: {options.orientation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings2 className="h-3 w-3" />
                <span>Quality: {Math.round(options.quality * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={previewRef}
              className="min-h-64 bg-muted/30 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground"
            >
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click "Generate Preview" to see PDF layout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
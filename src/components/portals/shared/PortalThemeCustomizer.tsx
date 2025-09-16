/**
 * Portal Theme Customizer
 * Admin interface for customizing portal themes and branding
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Palette,
  Type,
  Image,
  Layout,
  Settings,
  Eye,
  Save,
  RotateCcw,
  Download,
  Upload,
  Copy,
  Monitor,
  Moon,
  Sun,
  Contrast,
  Smartphone,
  Tablet,
  Laptop,
  Info
} from 'lucide-react';
import { usePortalTheme, PortalBranding } from './PortalThemeProvider';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(' ', '-')}>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 p-1 border rounded"
          />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigator.clipboard.writeText(value)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

interface PreviewFrameProps {
  device: 'desktop' | 'tablet' | 'mobile';
  theme: any;
}

function PreviewFrame({ device, theme }: PreviewFrameProps) {
  const getFrameStyles = () => {
    switch (device) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '1200px', height: '800px' };
    }
  };

  const frameStyles = getFrameStyles();

  return (
    <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center gap-2 mb-3">
        {device === 'desktop' && <Laptop className="h-4 w-4" />}
        {device === 'tablet' && <Tablet className="h-4 w-4" />}
        {device === 'mobile' && <Smartphone className="h-4 w-4" />}
        <span className="text-sm font-medium capitalize">{device} Preview</span>
      </div>
      
      <div 
        className="border rounded overflow-hidden shadow-lg bg-white mx-auto"
        style={frameStyles}
      >
        <iframe
          src="/portal/preview"
          className="w-full h-full"
          title={'${device} preview'}
        />
      </div>
    </div>
  );
}

interface PortalThemeCustomizerProps {
  portalType: 'restaurant' | 'auto' | 'retail' | 'hs';
  organizationId: string;
  onSave?: (branding: PortalBranding) => void;
  onPreview?: (branding: PortalBranding) => void;
}

export function PortalThemeCustomizer({
  portalType,
  organizationId,
  onSave,
  onPreview,
}: PortalThemeCustomizerProps) {
  const { branding, updateBranding, resetTheme, toggleDarkMode, toggleHighContrast } = usePortalTheme();
  const [activeTab, setActiveTab] = useState('colors');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleColorChange = (property: keyof PortalBranding) => (value: string) => {
    updateBranding({ [property]: value });
    onPreview?.(branding);
  };

  const handleInputChange = (property: keyof PortalBranding) => (value: string | boolean) => {
    updateBranding({ [property]: value });
    onPreview?.(branding);
  };

  const handleSave = () => {
    onSave?.(branding);
  };

  const handleReset = () => {
    resetTheme();
  };

  const exportTheme = () => {
    const themeData = {
      portal_type: portalType,
      organization_id: organizationId,
      branding,
      exported_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '${portalType}-portal-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);
        if (themeData.branding) {
          updateBranding(themeData.branding);
        }
      } catch (error) {
        console.error('Failed to import theme:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Customization Panel */}
      <div className="xl:col-span-2 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Portal Theme Customizer
            </CardTitle>
            <CardDescription>
              Customize the appearance and branding of your {portalType} customer portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button variant="outline" onClick={exportTheme}>
                <Download className="h-4 w-4 mr-2" />
                Export Theme
              </Button>
              <div>
                <Input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                  id="import-theme"
                />
                <Button variant="outline" asChild>
                  <Label htmlFor="import-theme" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Theme
                  </Label>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customization Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Color Scheme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ColorPicker
                      label="Primary Color"
                      value={branding.primary_color || '#3B82F6'}
                      onChange={handleColorChange('primary_color')}
                      description="Main brand color used for buttons and highlights"
                    />
                    <ColorPicker
                      label="Secondary Color"
                      value={branding.secondary_color || '#6B7280'}
                      onChange={handleColorChange('secondary_color')}
                      description="Secondary brand color for accents"
                    />
                    <ColorPicker
                      label="Accent Color"
                      value={branding.accent_color || '#F59E0B'}
                      onChange={handleColorChange('accent_color')}
                      description="Accent color for special elements"
                    />
                    <ColorPicker
                      label="Background Color"
                      value={branding.background_color || '#FFFFFF'}
                      onChange={handleColorChange('background_color')}
                      description="Main background color"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span className="font-medium">Use Industry Colors</span>
                  </div>
                  <Switch
                    checked={branding.industry_colors || false}
                    onCheckedChange={handleInputChange('industry_colors')}
                  />
                </div>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Typography</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="font-family">Primary Font Family</Label>
                      <Select
                        value={branding.font_family || 'inter'}
                        onValueChange={handleInputChange('font_family')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="open-sans">Open Sans</SelectItem>
                          <SelectItem value="lato">Lato</SelectItem>
                          <SelectItem value="montserrat">Montserrat</SelectItem>
                          <SelectItem value="poppins">Poppins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="heading-font">Heading Font Family</Label>
                      <Select
                        value={branding.heading_font || 'inter'}
                        onValueChange={handleInputChange('heading_font')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="playfair">Playfair Display</SelectItem>
                          <SelectItem value="merriweather">Merriweather</SelectItem>
                          <SelectItem value="source-serif">Source Serif Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="font-size">Base Font Size</Label>
                      <Select
                        value={branding.font_size_base || '16px'}
                        onValueChange={handleInputChange('font_size_base')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14px">14px (Small)</SelectItem>
                          <SelectItem value="16px">16px (Default)</SelectItem>
                          <SelectItem value="18px">18px (Large)</SelectItem>
                          <SelectItem value="20px">20px (Extra Large)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Branding Tab */}
              <TabsContent value="branding" className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Brand Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={branding.company_name || ''}
                        onChange={(e) => handleInputChange('company_name')(e.target.value)}
                        placeholder="Enter your company name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company-tagline">Company Tagline</Label>
                      <Input
                        id="company-tagline"
                        value={branding.company_tagline || ''}
                        onChange={(e) => handleInputChange('company_tagline')(e.target.value)}
                        placeholder="Your company tagline"
                      />
                    </div>

                    <div>
                      <Label htmlFor="welcome-message">Welcome Message</Label>
                      <Textarea
                        id="welcome-message"
                        value={branding.welcome_message || ''}
                        onChange={(e) => handleInputChange('welcome_message')(e.target.value)}
                        placeholder="Welcome message for customers"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="logo-url">Logo URL</Label>
                      <Input
                        id="logo-url"
                        value={branding.logo_url || ''}
                        onChange={(e) => handleInputChange('logo_url')(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span className="font-medium">Show Logo</span>
                      </div>
                      <Switch
                        checked={branding.show_logo || false}
                        onCheckedChange={handleInputChange('show_logo')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Layout Options</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="layout-style">Layout Style</Label>
                      <Select
                        value={branding.layout_style || 'default'}
                        onValueChange={handleInputChange('layout_style')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="header-style">Header Style</Label>
                      <Select
                        value={branding.header_style || 'standard'}
                        onValueChange={handleInputChange('header_style')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="branded">Branded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sidebar-style">Sidebar Style</Label>
                      <Select
                        value={branding.sidebar_style || 'full'}
                        onValueChange={handleInputChange('sidebar_style')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Sidebar</SelectItem>
                          <SelectItem value="icons">Icons Only</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
                  
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Advanced Customization</AlertTitle>
                    <AlertDescription>
                      These settings provide deeper customization but require technical knowledge.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-css">Custom CSS</Label>
                      <Textarea
                        id="custom-css"
                        value={branding.custom_css || ''}
                        onChange={(e) => handleInputChange('custom_css')(e.target.value)}
                        placeholder="/* Custom CSS styles */
.portal-custom {
  /* Your styles here */
}"
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="page-title-template">Page Title Template</Label>
                      <Input
                        id="page-title-template"
                        value={branding.page_title_template || ''}
                        onChange={(e) => handleInputChange('page_title_template')(e.target.value)}
                        placeholder="{company_name} - Customer Portal"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use {'{company_name}'} as a placeholder for your company name
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="font-medium">Show "Powered by Thorbis"</span>
                      </div>
                      <Switch
                        checked={branding.show_powered_by !== false}
                        onCheckedChange={handleInputChange('show_powered_by')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <CardDescription>
              See how your portal will look to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Device Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Laptop className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleDarkMode}>
                <Moon className="h-4 w-4 mr-1" />
                Dark Mode
              </Button>
              <Button variant="outline" size="sm" onClick={toggleHighContrast}>
                <Contrast className="h-4 w-4 mr-1" />
                High Contrast
              </Button>
            </div>

            {/* Mini Preview */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
              <div className="text-sm font-medium mb-2">Color Preview</div>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: branding.primary_color }}
                  title="Primary Color"
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: branding.secondary_color }}
                  title="Secondary Color"
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: branding.accent_color }}
                  title="Accent Color"
                />
              </div>
            </div>

            {/* Theme Summary */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Current Configuration</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Portal Type: <Badge variant="outline">{portalType}</Badge></div>
                <div>Layout: <Badge variant="outline">{branding.layout_style || 'default'}</Badge></div>
                <div>Header: <Badge variant="outline">{branding.header_style || 'standard'}</Badge></div>
                <div>Font: <Badge variant="outline">{branding.font_family || 'inter'}</Badge></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Open Full Preview
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy Preview Link
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Generate CSS File
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
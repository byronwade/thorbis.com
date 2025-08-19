'use client';

/**
 * Website Editor - Drag-and-drop editor for building websites
 * Styled with Thorbis design system
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout,
  Type,
  Image as ImageIcon,
  Palette,
  Eye,
  Save,
  Undo,
  Redo,
  Copy,
  Trash2,
  Move,
  Monitor,
  Smartphone,
  Tablet,
  Layers,
  Grid3X3
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { Separator } from '@components/ui/separator';


import { useToast } from '@components/ui/use-toast';

import { cn } from '@utils';
import logger from "@lib/utils/logger";

// Default section templates
const SECTION_TEMPLATES = {
  hero: {
    type: 'hero',
    name: 'Hero Section',
    icon: Layout,
    html: `
      <section class="hero-section bg-primary text-primary-foreground">
        <div class="container mx-auto px-4 py-16 text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-4">Welcome to Our Business</h1>
          <p class="text-xl mb-8">We provide exceptional services for your success</p>
          <button class="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </section>
    `
  },
  text: {
    type: 'text',
    name: 'Text Block',
    icon: Type,
    html: `
      <section class="text-section bg-background text-foreground">
        <div class="container mx-auto px-4 py-12">
          <h2 class="text-3xl font-bold mb-6">Section Title</h2>
          <p class="text-lg leading-relaxed">
            Your content goes here. This is a flexible text section that you can customize 
            with different typography, colors, and layout options.
          </p>
        </div>
      </section>
    `
  },
  image: {
    type: 'image',
    name: 'Image Block',
    icon: ImageIcon,
    html: `
      <section class="image-section bg-background">
        <div class="container mx-auto px-4 py-12">
          <div class="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <ImageIcon class="w-16 h-16 text-muted-foreground" />
          </div>
        </div>
      </section>
    `
  },
  gallery: {
    type: 'gallery',
    name: 'Image Gallery',
    icon: Grid3X3,
    html: `
      <section class="gallery-section bg-muted/50">
        <div class="container mx-auto px-4 py-12">
          <h2 class="text-3xl font-bold text-center mb-8">Gallery</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="aspect-square bg-muted rounded-lg"></div>
            <div class="aspect-square bg-muted rounded-lg"></div>
            <div class="aspect-square bg-muted rounded-lg"></div>
          </div>
        </div>
      </section>
    `
  },
  contact: {
    type: 'contact',
    name: 'Contact Form',
    icon: Layout,
    html: `
      <section class="contact-section bg-background">
        <div class="container mx-auto px-4 py-12">
          <h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2>
          <div class="max-w-md mx-auto space-y-4">
            <input type="text" placeholder="Your Name" class="w-full px-4 py-2 border rounded-lg" />
            <input type="email" placeholder="Your Email" class="w-full px-4 py-2 border rounded-lg" />
            <textarea placeholder="Your Message" rows="4" class="w-full px-4 py-2 border rounded-lg"></textarea>
            <button class="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </div>
        </div>
      </section>
    `
  }
};

/**
 * Website Editor Component with Drag-and-Drop
 */
export default function WebsiteEditor({ websiteId, onSave, onClose }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const editorRef = useRef(null);
  const { toast } = useToast();

  // Initialize editor with website data
  useEffect(() => {
    loadWebsiteData();
  }, [websiteId]);

  // Track changes for undo/redo
  useEffect(() => {
    if (sections.length > 0) {
      saveToHistory();
    }
  }, [sections]);

  const loadWebsiteData = async () => {
    try {
      // Mock loading website data
      const mockSections = [
        { 
          id: 'hero-1', 
          type: 'hero',
          html: SECTION_TEMPLATES.hero.html,
          styles: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            padding: '4rem 0'
          }
        },
        { 
          id: 'text-1', 
          type: 'text',
          html: SECTION_TEMPLATES.text.html,
          styles: {
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            padding: '3rem 0'
          }
        }
      ];
      
      setSections(mockSections);
      
    } catch (error) {
      logger.error('Failed to load website data:', error);
      toast({
        title: "Load Error",
        description: "Failed to load website data.",
        variant: "destructive",
      });
    }
  };

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(sections)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Limit history to 50 entries
    if (newHistory.length > 50) {
      setHistory(newHistory.slice(-50));
      setHistoryIndex(49);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const addSection = (templateKey) => {
    const template = SECTION_TEMPLATES[templateKey];
    if (!template) return;

    const newSection = {
      id: `${templateKey}-${Date.now()}`,
      type: templateKey,
      html: template.html,
      styles: {
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        padding: '3rem 0'
      }
    };

    setSections([...sections, newSection]);
    setHasUnsavedChanges(true);
  };

  const deleteSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
    setSelectedSection(null);
    setHasUnsavedChanges(true);
  };

  const duplicateSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newSection = {
      ...section,
      id: `${section.type}-${Date.now()}`
    };

    const index = sections.findIndex(s => s.id === sectionId);
    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
    setHasUnsavedChanges(true);
  };

  const updateSectionStyle = (sectionId, property, value) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            styles: { 
              ...section.styles, 
              [property]: value 
            } 
          }
        : section
    ));
    setHasUnsavedChanges(true);
  };

  const moveSection = (fromIndex, toIndex) => {
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    setSections(newSections);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      toast({
        title: "Saved",
        description: "Website changes saved successfully!",
      });
      
      if (onSave) {
        onSave({ sections });
      }
      
    } catch (error) {
      logger.error('Failed to save website:', error);
      toast({
        title: "Save Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e, sectionId, index) => {
    setDraggedItem({ id: sectionId, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem.index !== dropIndex) {
      moveSection(draggedItem.index, dropIndex);
    }
    
    setDraggedItem(null);
    setDropTarget(null);
  };

  const getDevicePreviewClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  const renderStylePanel = () => {
    if (!selectedSection) return null;

    const section = sections.find(s => s.id === selectedSection);
    if (!section) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Section Styles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Background Color */}
          <div>
            <Label className="text-xs">Background Color</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                type="color"
                value={section.styles.backgroundColor?.replace('hsl(var(--', '#').replace('))', '') || 'hsl(var(--background))'}
                onChange={(e) => updateSectionStyle(section.id, 'backgroundColor', e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={section.styles.backgroundColor || ''}
                onChange={(e) => updateSectionStyle(section.id, 'backgroundColor', e.target.value)}
                className="flex-1 text-xs"
                placeholder="CSS color value"
              />
            </div>
          </div>

          {/* Text Color */}
          <div>
            <Label className="text-xs">Text Color</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                type="color"
                value={section.styles.color?.replace('hsl(var(--', '#').replace('))', '') || 'hsl(var(--background))'}
                onChange={(e) => updateSectionStyle(section.id, 'color', e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={section.styles.color || ''}
                onChange={(e) => updateSectionStyle(section.id, 'color', e.target.value)}
                className="flex-1 text-xs"
                placeholder="CSS color value"
              />
            </div>
          </div>

          {/* Padding */}
          <div>
            <Label className="text-xs">Padding</Label>
            <Select 
              value={section.styles.padding || '3rem 0'} 
              onValueChange={(value) => updateSectionStyle(section.id, 'padding', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1rem 0">Small</SelectItem>
                <SelectItem value="2rem 0">Medium</SelectItem>
                <SelectItem value="3rem 0">Large</SelectItem>
                <SelectItem value="4rem 0">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom CSS */}
          <div>
            <Label className="text-xs">Custom CSS</Label>
            <Textarea
              value={section.styles.customCSS || ''}
              onChange={(e) => updateSectionStyle(section.id, 'customCSS', e.target.value)}
              className="mt-1 text-xs font-mono"
              rows={3}
              placeholder="Add custom CSS..."
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              ← Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-1">
              <Button
                variant={deviceMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={deviceMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceMode('tablet')}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={deviceMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasUnsavedChanges}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Components */}
        <div className="w-64 border-r bg-muted/10 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Add Sections</h3>
            <div className="space-y-2">
              {Object.entries(SECTION_TEMPLATES).map(([key, template]) => {
                const IconComponent = template.icon;
                return (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => addSection(key)}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {template.name}
                  </Button>
                );
              })}
            </div>

            <Separator className="my-6" />

            {/* Layers Panel */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Layers
              </h3>
              <div className="space-y-1">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedSection === section.id && "bg-muted"
                    )}
                    onClick={() => setSelectedSection(section.id)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-center text-sm">
                      <Move className="w-3 h-3 mr-2 text-muted-foreground" />
                      {SECTION_TEMPLATES[section.type]?.name || 'Section'}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSection(section.id);
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-auto bg-muted/5">
          <div className="p-8">
            <div className={cn("transition-all duration-300", getDevicePreviewClass())}>
              <div 
                ref={editorRef}
                className="bg-background rounded-lg shadow-lg overflow-hidden min-h-screen"
              >
                {sections.length === 0 ? (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Layout className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg font-medium">Start Building</p>
                      <p className="text-sm">Add your first section to get started</p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {sections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "group relative cursor-pointer",
                          selectedSection === section.id && "ring-2 ring-primary ring-offset-2",
                          dropTarget === index && "ring-2 ring-blue-500 ring-offset-2"
                        )}
                        style={section.styles}
                        onClick={() => setSelectedSection(section.id)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        {/* Section Content */}
                        <div 
                          dangerouslySetInnerHTML={{ __html: section.html }}
                          className="pointer-events-none"
                        />
                        
                        {/* Hover Overlay */}
                        <div className={cn(
                          "absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity",
                          selectedSection === section.id && "opacity-100"
                        )}>
                          <div className="absolute top-2 right-2 flex items-center space-x-1">
                            <Badge variant="secondary" className="text-xs">
                              {SECTION_TEMPLATES[section.type]?.name}
                            </Badge>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSection(section.id);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSection(section.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-muted/10 overflow-y-auto">
          <div className="p-4">
            <Tabs defaultValue="styles" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="styles">Styles</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="styles" className="mt-4">
                {selectedSection ? (
                  renderStylePanel()
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Palette className="w-8 h-8 mx-auto mb-2" />
                    <p>Select a section to edit styles</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="content" className="mt-4">
                <div className="text-center text-muted-foreground py-8">
                  <Type className="w-8 h-8 mx-auto mb-2" />
                  <p>Content editing coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Page Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Page Title</Label>
                      <Input 
                        className="mt-1" 
                        placeholder="Enter page title"
                        defaultValue="Untitled Page"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Meta Description</Label>
                      <Textarea 
                        className="mt-1" 
                        placeholder="Enter meta description"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">SEO Optimized</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Mobile Responsive</Label>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

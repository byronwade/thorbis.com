'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  TrendingUp,
  Mail,
  MessageCircle,
  Phone,
  FileText,
  Save,
  X,
  MoreHorizontal,
  Star,
  StarOff,
  Tag,
  Clock,
  Users
} from 'lucide-react';

import { useOfflineCommunication } from '@/lib/offline-communication-manager';
import type { CommunicationTemplate } from '@/lib/offline-communication-manager';

interface CommunicationTemplatesProps {
  organizationId?: string;
  onTemplateSelect?: (template: CommunicationTemplate) => void;
  mode?: 'manage' | 'select';
}

export default function CommunicationTemplates({
  organizationId = 'default',
  onTemplateSelect,
  mode = 'manage'
}: CommunicationTemplatesProps) {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<CommunicationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState(');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('templates');
  
  // Form data
  const [formData, setFormData] = useState({
    name: ',
    type: 'message' as 'message' | 'email' | 'sms',
    subject: ',
    content: ',
    category: ',
    variables: [] as string[],
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const communicationManager = useOfflineCommunication();

  useEffect(() => {
    loadTemplates();
  }, [organizationId]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, typeFilter, categoryFilter]);

  const loadTemplates = async () => {
    try {
      const templatesData = await communicationManager.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setError('Failed to load templates');
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(template => template.type === typeFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }

    // Sort by usage count (most used first)
    filtered.sort((a, b) => b.usageCount - a.usageCount);

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      setError('Name and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const templateId = await communicationManager.createTemplate({
        name: formData.name,
        type: formData.type,
        subject: formData.subject || undefined,
        content: formData.content,
        variables: formData.variables,
        category: formData.category || 'general',
        organizationId
      });

      await loadTemplates();
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    setError(null);

    try {
      await communicationManager.updateTemplate(selectedTemplate.id, {
        name: formData.name,
        type: formData.type,
        subject: formData.subject || undefined,
        content: formData.content,
        variables: formData.variables,
        category: formData.category,
        isActive: formData.isActive
      });

      await loadTemplates();
      setIsEditing(false);
      setSelectedTemplate(null);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await communicationManager.deleteTemplate(templateId);
      await loadTemplates();
      
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setIsEditing(false);
        resetForm();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete template');
    }
  };

  const handleEditTemplate = (template: CommunicationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject || ',
      content: template.content,
      category: template.category,
      variables: template.variables,
      isActive: template.isActive
    });
    setIsEditing(true);
    setShowCreateForm(false);
  };

  const handleDuplicateTemplate = async (template: CommunicationTemplate) => {
    setFormData({
      name: '${template.name} (Copy)',
      type: template.type,
      subject: template.subject || ',
      content: template.content,
      category: template.category,
      variables: template.variables,
      isActive: true
    });
    setShowCreateForm(true);
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const resetForm = () => {
    setFormData({
      name: ',
      type: 'message',
      subject: ',
      content: ',
      category: ',
      variables: [],
      isActive: true
    });
    setError(null);
  };

  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      variables: extractVariables(content)
    }));
  };

  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'message': return <MessageCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sms': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'message': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Communication Templates</h2>
          <p className="text-neutral-400">Create and manage reusable message templates</p>
        </div>
        
        {mode === 'manage' && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-neutral-800 border-neutral-700">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="message">Message</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredTemplates.length === 0 ? (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-8 text-center">
                    <Zap className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-400 mb-2">No templates found</p>
                    <p className="text-neutral-500 text-sm">Create your first template to get started</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTemplates.map((template) => (
                  <Card key={template.id} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-white">{template.name}</h3>
                            <Badge variant="outline" className={getTemplateTypeColor(template.type)}>
                              {getTemplateTypeIcon(template.type)}
                              <span className="ml-1 capitalize">{template.type}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {template.category}
                            </Badge>
                            {!template.isActive && (
                              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
                            {template.content.substring(0, 120)}...
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Used {template.usageCount} times
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Updated {template.updatedAt.toLocaleDateString()}
                            </div>
                            {template.variables.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {template.variables.length} variables
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1 ml-4">
                          {mode === 'select' && (
                            <Button
                              size="sm"
                              onClick={() => onTemplateSelect?.(template)}
                            >
                              Select
                            </Button>
                          )}
                          
                          {mode === 'manage' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTemplate(template)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateTemplate(template)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Template Details/Form Sidebar */}
            <div className="space-y-4">
              {(showCreateForm || isEditing) && (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                      {isEditing ? 'Edit Template' : 'New Template'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-neutral-400">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Template name"
                        className="bg-neutral-800 border-neutral-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-neutral-400">Type</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="bg-neutral-800 border-neutral-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="message">Message</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-neutral-400">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="e.g., welcome, follow-up"
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                    </div>

                    {formData.type === 'email' && (
                      <div>
                        <Label htmlFor="subject" className="text-neutral-400">Subject</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Email subject"
                          className="bg-neutral-800 border-neutral-700"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="content" className="text-neutral-400">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Template content... Use {{variable}} for dynamic content"
                        className="bg-neutral-800 border-neutral-700"
                        rows={6}
                      />
                      <p className="text-neutral-500 text-xs mt-1">
                        Use {'{{variable}}'} syntax for dynamic content
                      </p>
                    </div>

                    {formData.variables.length > 0 && (
                      <div>
                        <Label className="text-neutral-400">Variables Found</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.variables.map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label className="text-neutral-400">Active</Label>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={isEditing ? handleUpdateTemplate : handleCreateTemplate}
                        disabled={loading || !formData.name.trim() || !formData.content.trim()}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setIsEditing(false);
                          setSelectedTemplate(null);
                          resetForm();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedTemplate && !isEditing && (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Template Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-white">{selectedTemplate.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getTemplateTypeColor(selectedTemplate.type)}>
                          {getTemplateTypeIcon(selectedTemplate.type)}
                          <span className="ml-1 capitalize">{selectedTemplate.type}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selectedTemplate.category}
                        </Badge>
                      </div>
                    </div>

                    {selectedTemplate.subject && (
                      <div>
                        <Label className="text-neutral-400">Subject</Label>
                        <p className="text-white text-sm">{selectedTemplate.subject}</p>
                      </div>
                    )}

                    <div>
                      <Label className="text-neutral-400">Content</Label>
                      <div className="bg-neutral-800 rounded-lg p-3 text-sm text-white whitespace-pre-wrap">
                        {selectedTemplate.content}
                      </div>
                    </div>

                    {selectedTemplate.variables.length > 0 && (
                      <div>
                        <Label className="text-neutral-400">Variables</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTemplate.variables.map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>Used {selectedTemplate.usageCount} times</p>
                      <p>Created {selectedTemplate.createdAt.toLocaleDateString()}</p>
                      <p>Last updated {selectedTemplate.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-sm">Total Templates</p>
                    <p className="text-2xl font-bold text-white">{templates.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-sm">Active Templates</p>
                    <p className="text-2xl font-bold text-white">
                      {templates.filter(t => t.isActive).length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-sm">Total Usage</p>
                    <p className="text-2xl font-bold text-white">
                      {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Most Used Templates */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Most Used Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates
                  .sort((a, b) => b.usageCount - a.usageCount)
                  .slice(0, 5)
                  .map((template, index) => (
                    <div key={template.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{template.name}</h4>
                        <p className="text-neutral-400 text-sm">{template.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{template.usageCount}</p>
                        <p className="text-neutral-400 text-xs">uses</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => {
              const categoryTemplates = templates.filter(t => t.category === category);
              const totalUsage = categoryTemplates.reduce((sum, t) => sum + t.usageCount, 0);
              
              return (
                <Card key={category} className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white capitalize">{category}</h3>
                      <Badge variant="outline">{categoryTemplates.length}</Badge>
                    </div>
                    <p className="text-neutral-400 text-sm">
                      {totalUsage} total uses
                    </p>
                    <div className="mt-3 flex justify-between text-xs text-neutral-500">
                      <span>{categoryTemplates.filter(t => t.isActive).length} active</span>
                      <span>{categoryTemplates.filter(t => !t.isActive).length} inactive</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
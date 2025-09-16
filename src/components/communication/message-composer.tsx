'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Send,
  Paperclip,
  Image,
  File,
  Mic,
  Video,
  Calendar,
  MapPin,
  User,
  Smile,
  AtSign,
  Hash,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  Quote,
  Code,
  X,
  Upload,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  RotateCcw,
  Save,
  FileText,
  Camera,
  Zap
} from 'lucide-react';

import { useOfflineCommunication } from '@/lib/offline-communication-manager';
import type { 
  MessageType,
  CommunicationTemplate,
  MessageAttachment 
} from '@/lib/offline-communication-manager';

interface MessageComposerProps {
  conversationId: string;
  recipientName?: string;
  onSend?: (messageId: string) => void;
  onCancel?: () => void;
  initialContent?: string;
  mode?: 'message' | 'email' | 'sms';
  showTemplates?: boolean;
  allowAttachments?: boolean;
  maxAttachments?: number;
  maxFileSize?: number; // in bytes
}

export default function MessageComposer({
  conversationId,
  recipientName,
  onSend,
  onCancel,
  initialContent = ',
  mode = 'message',
  showTemplates = true,
  allowAttachments = true,
  maxAttachments = 10,
  maxFileSize = 10 * 1024 * 1024 // 10MB
}: MessageComposerProps) {
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [content, setContent] = useState(initialContent);
  const [subject, setSubject] = useState(');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<Map<string, string>>(new Map());
  const [mentions, setMentions] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [requireReadReceipt, setRequireReadReceipt] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  
  // Templates
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  
  // UI states
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [loading, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const communicationManager = useOfflineCommunication();

  useEffect(() => {
    if (showTemplates) {
      loadTemplates();
    }
  }, [mode, showTemplates]);

  useEffect(() => {
    if (selectedTemplate) {
      applyTemplate(selectedTemplate);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const templatesData = await communicationManager.getTemplates(mode);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const applyTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setContent(template.content);
    if (template.subject) {
      setSubject(template.subject);
    }

    // Set up template variables
    const variables: Record<string, string> = {};
    template.variables.forEach(variable => {
      variables[variable] = ';
    });
    setTemplateVariables(variables);
  };

  const processTemplate = (templateContent: string): string => {
    let processedContent = templateContent;
    
    Object.entries(templateVariables).forEach(([variable, value]) => {
      const placeholder = '{{${variable}}}';
      processedContent = processedContent.replace(new RegExp(placeholder, 'g`), value || placeholder);
    });

    return processedContent;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file count
    if (attachments.length + files.length > maxAttachments) {
      setError(`Maximum ${maxAttachments} attachments allowed');
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      setError('Files must be smaller than ${Math.round(maxFileSize / (1024 * 1024))}MB');
      return;
    }

    // Add files and generate previews
    const newAttachments = [...attachments, ...files];
    setAttachments(newAttachments);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachmentPreviews(prev => new Map(prev.set(file.name, e.target?.result as string)));
        };
        reader.readAsDataURL(file);
      }
    });

    setError(null);
  };

  const removeAttachment = (fileName: string) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
    setAttachmentPreviews(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileName);
      return newMap;
    });
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recordingRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], 'voice-message-${Date.now()}.wav', { type: 'audio/wav' });
        setAttachments(prev => [...prev, file]);
        setMessageType('audio');
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Could not access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (recordingRef.current && recordingRef.current.state === 'recording') {
      recordingRef.current.stop();
      setIsRecording(false);
    }
  };

  const insertAtCursor = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      // Move cursor to end of inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + text.length, start + text.length);
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setContent(prev => prev + text);
    }
  };

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) {
      setError('Please enter a message or attach a file');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const finalContent = selectedTemplate ? processTemplate(content) : content;
      
      const messageId = await communicationManager.sendMessage({
        conversationId,
        type: messageType,
        content: finalContent,
        attachments: attachments.length > 0 ? attachments : undefined,
        mentions: mentions.length > 0 ? mentions : undefined
      });

      // Reset form
      setContent(');
      setSubject(');
      setAttachments([]);
      setAttachmentPreviews(new Map());
      setMentions([]);
      setSelectedTemplate(');
      setTemplateVariables({});
      
      onSend?.(messageId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = () => {
    // Implementation would save draft to local storage
    const draft = {
      conversationId,
      content,
      subject,
      attachments: attachments.map(f => f.name), // Would need to store actual files
      messageType,
      timestamp: new Date()
    };
    
    localStorage.setItem('draft_${conversationId}', JSON.stringify(draft));
  };

  const getAttachmentIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (file.type.startsWith('audio/')) return <Mic className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getMessageTypeColor = (type: MessageType) => {
    switch (type) {
      case 'text': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'image': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'audio': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'video': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'file': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'location': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            {mode === 'email' && <Send className="h-5 w-5" />}
            {mode === 'sms' && <Send className="h-5 w-5" />}
            {mode === 'message' && <Send className="h-5 w-5" />}
            Compose {mode === 'email' ? 'Email' : mode === 'sms' ? 'SMS' : 'Message'}
            {recipientName && <span className="text-neutral-400">to {recipientName}</span>}
          </CardTitle>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-neutral-800 border-neutral-700">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            {showTemplates && <TabsTrigger value="templates">Templates</TabsTrigger>}
            {isExpanded && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            {/* Subject Line (for email mode) */}
            {mode === 'email' && (
              <div>
                <Label htmlFor="subject" className="text-neutral-400">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>
            )}

            {/* Message Type Selector */}
            <div className="flex items-center gap-2">
              <Label className="text-neutral-400">Type:</Label>
              <div className="flex gap-1">
                {(['text', 'image', 'audio', 'video', 'file', 'location'] as MessageType[]).map(type => (
                  <Button
                    key={type}
                    variant={messageType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMessageType(type)}
                    className={messageType === type ? getMessageTypeColor(type) : '}
                  >
                    {type === 'text' && <FileText className="h-4 w-4" />}
                    {type === 'image' && <Image className="h-4 w-4" />}
                    {type === 'audio' && <Mic className="h-4 w-4" />}
                    {type === 'video' && <Video className="h-4 w-4" />}
                    {type === 'file' && <File className="h-4 w-4" />}
                    {type === 'location' && <MapPin className="h-4 w-4" />}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-neutral-400">Message</Label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => insertAtCursor('**Bold**')}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertAtCursor('_Italic_')}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertAtCursor('[Link](url)')}>
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertAtCursor('`Code'')}>
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowMentions(!showMentions)}>
                    <AtSign className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Textarea
                ref={textareaRef}
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Type your ${mode}...'}
                className="bg-neutral-800 border-neutral-700 min-h-[120px]"
                rows={isExpanded ? 8 : 4}
              />
              
              {selectedTemplate && Object.keys(templateVariables).length > 0 && (
                <div className="space-y-2 p-3 bg-neutral-800 rounded-lg">
                  <p className="text-neutral-400 text-sm">Template Variables:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(templateVariables).map(([variable, value]) => (
                      <div key={variable}>
                        <Label className="text-neutral-400 text-xs">{variable}</Label>
                        <Input
                          value={value}
                          onChange={(e) => setTemplateVariables(prev => ({
                            ...prev,
                            [variable]: e.target.value
                          }))}
                          placeholder={'Enter ${variable}'}
                          className="bg-neutral-900 border-neutral-700 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attachments */}
            {allowAttachments && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-neutral-400">Attachments</Label>
                  <Badge variant="outline" className="text-xs">
                    {attachments.length}/{maxAttachments}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={attachments.length >= maxAttachments}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isRecording) {
                        stopVoiceRecording();
                      } else {
                        startVoiceRecording();
                      }
                    }}
                    className={isRecording ? 'bg-red-500/20 text-red-400' : '}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    {isRecording ? 'Stop Recording' : 'Voice Message'}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {attachments.map((file) => (
                      <div key={file.name} className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
                        {getAttachmentIcon(file)}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{file.name}</p>
                          <p className="text-neutral-400 text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {attachmentPreviews.has(file.name) && (
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(file.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <span>{content.length} characters</span>
                {attachments.length > 0 && (
                  <span>{attachments.length} attachment{attachments.length !== 1 ? 's' : '}</span>
                )}
                {isScheduled && scheduledTime && (
                  <span>Scheduled for {new Date(scheduledTime).toLocaleString()}</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSend}
                  disabled={loading || (!content.trim() && attachments.length === 0)}
                >
                  {loading ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : isScheduled ? (
                    <Calendar className="h-4 w-4 mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Sending...' : isScheduled ? 'Schedule' : 'Send'}
                </Button>
              </div>
            </div>
          </TabsContent>

          {showTemplates && (
            <TabsContent value="templates" className="space-y-4">
              <div>
                <Label className="text-neutral-400">Select Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTemplate && (
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <h4 className="text-white font-medium mb-2">
                    {templates.find(t => t.id === selectedTemplate)?.name}
                  </h4>
                  <p className="text-neutral-400 text-sm">
                    {templates.find(t => t.id === selectedTemplate)?.content.substring(0, 150)}...
                  </p>
                </div>
              )}
            </TabsContent>
          )}

          {isExpanded && (
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-400">Priority</Label>
                  <Select value={priority} onValueChange={(value: unknown) => setPriority(value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-neutral-400">Schedule Delivery</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => {
                      setScheduledTime(e.target.value);
                      setIsScheduled(!!e.target.value);
                    }}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-neutral-400">Request read receipt</Label>
                  <Switch
                    checked={requireReadReceipt}
                    onCheckedChange={setRequireReadReceipt}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-neutral-400">Encrypt message</Label>
                  <Switch
                    checked={isEncrypted}
                    onCheckedChange={setIsEncrypted}
                  />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
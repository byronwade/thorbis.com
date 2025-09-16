'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload,
  X,
  FileText,
  Image,
  Video,
  Music,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';

import { useOfflineDocuments } from '@/lib/offline-document-manager';
import type { DocumentCategory } from '@/lib/offline-document-manager';

interface DocumentUploadWidgetProps {
  onUploadComplete?: (documentIds: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  relatedEntityId?: string;
  relatedEntityType?: string;
  defaultCategory?: DocumentCategory;
  compact?: boolean;
  showProgress?: boolean;
  allowMultiple?: boolean;
  className?: string;
}

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  category: DocumentCategory;
  tags: string[];
  description: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  documentId?: string;
}

export default function DocumentUploadWidget({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  acceptedTypes = ['*/*'],
  relatedEntityId,
  relatedEntityType,
  defaultCategory = 'document',
  compact = false,
  showProgress = true,
  allowMultiple = true,
  className = ''
}: DocumentUploadWidgetProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentManager = useOfflineDocuments();

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const inferCategory = (file: File): DocumentCategory => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.startsWith('image/')) return 'photo';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type === 'application/pdf') {
      if (name.includes('invoice')) return 'invoice';
      if (name.includes('estimate')) return 'estimate';
      if (name.includes('receipt')) return 'receipt';
      if (name.includes('contract')) return 'contract';
      return 'document';
    }
    return defaultCategory;
  };

  const generatePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFilesSelected = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check file count limits
    if (uploadFiles.length + fileArray.length > maxFiles) {
      onUploadError?.('Maximum ${maxFiles} files allowed');
      return;
    }

    // Check file types if specified
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*/*')) {
      const invalidFiles = fileArray.filter(file => 
        !acceptedTypes.some(type => 
          type === file.type || 
          (type.endsWith('/*') && file.type.startsWith(type.replace('/*', '/')))
        )
      );
      
      if (invalidFiles.length > 0) {
        onUploadError?.('File type not allowed: ${invalidFiles.map(f => f.name).join(', ')}');
        return;
      }
    }

    // Create upload file objects
    const newUploadFiles: UploadFile[] = await Promise.all(
      fileArray.map(async (file) => ({
        id: 'upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
        file,
        preview: await generatePreview(file),
        category: inferCategory(file),
        tags: [],
        description: ',
        status: 'pending' as const,
        progress: 0
      }))
    );

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [uploadFiles.length, maxFiles, acceptedTypes, onUploadError, defaultCategory]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelected(e.target.files);
      e.target.value = ';
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }, [handleFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const updateUploadFile = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<string> => {
    updateUploadFile(uploadFile.id, { status: 'uploading', progress: 0 });

    try {
      const documentId = await documentManager.uploadDocument(uploadFile.file, {
        category: uploadFile.category,
        tags: uploadFile.tags,
        description: uploadFile.description || 'Uploaded ${uploadFile.file.name}',
        relatedEntityId,
        relatedEntityType,
        isPublic: false
      });

      updateUploadFile(uploadFile.id, { 
        status: 'completed', 
        progress: 100, 
        documentId 
      });

      return documentId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      updateUploadFile(uploadFile.id, { 
        status: 'error', 
        error: errorMessage 
      });
      throw error;
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = uploadFiles.filter(file => file.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      const documentIds: string[] = [];
      
      for (const uploadFile of pendingFiles) {
        try {
          const documentId = await uploadSingleFile(uploadFile);
          documentIds.push(documentId);
        } catch (error) {
          console.error('Failed to upload ${uploadFile.file.name}:', error);
        }
      }

      if (documentIds.length > 0) {
        onUploadComplete?.(documentIds);
      }

      // Remove completed files after a delay
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(file => file.status !== 'completed'));
      }, 2000);

    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearAll = () => {
    setUploadFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (compact) {
    return (
      <div className={'space-y-2 ${className}'}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={'border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
            ${dragOver 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-neutral-700 hover:border-neutral-600'
            }'}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 text-neutral-500 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">
            Drop files or click to browse
          </p>
        </div>

        {uploadFiles.length > 0 && (
          <div className="space-y-2">
            {uploadFiles.map(uploadFile => (
              <div key={uploadFile.id} className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-neutral-400">{formatFileSize(uploadFile.file.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {uploadFile.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {uploadFile.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {uploadFile.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadFile(uploadFile.id)}
                    disabled={uploadFile.status === 'uploading'}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleUploadAll}
                disabled={isUploading || !uploadFiles.some(f => f.status === 'pending')}
              >
                {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                Upload All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearAll}
                disabled={isUploading}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={acceptedTypes.join(',`)}
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>
    );
  }

  return (
    <div className={'space-y-4 ${className}'}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragOver 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-neutral-700 hover:border-neutral-600'
          }'}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
        <p className="text-lg text-white mb-2">Drop files here to upload</p>
        <p className="text-neutral-400 mb-4">or click to browse</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Choose Files
        </Button>
        
        {acceptedTypes.length > 0 && !acceptedTypes.includes('*/*') && (
          <p className="text-xs text-neutral-500 mt-2">
            Accepted: {acceptedTypes.join(', ')}
          </p>
        )}
      </div>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Files to Upload ({uploadFiles.length})</h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleUploadAll}
                  disabled={isUploading || !uploadFiles.some(f => f.status === 'pending`)}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {uploadFiles.map(uploadFile => {
                const Icon = getFileIcon(uploadFile.file);
                
                return (
                  <div key={uploadFile.id} className="border border-neutral-700 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {uploadFile.preview ? (
                          <img 
                            src={uploadFile.preview} 
                            alt={uploadFile.file.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center">
                            <Icon className="h-8 w-8 text-neutral-400" />
                          </div>
                        )}
                      </div>

                      {/* File Details */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h4 className="text-white font-medium truncate">{uploadFile.file.name}</h4>
                          <p className="text-sm text-neutral-400">
                            {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                          </p>
                        </div>

                        {/* File Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`category-${uploadFile.id}`} className="text-sm text-neutral-400">
                              Category
                            </Label>
                            <Select 
                              value={uploadFile.category} 
                              onValueChange={(value) => updateUploadFile(uploadFile.id, { category: value as DocumentCategory })}
                            >
                              <SelectTrigger className="bg-neutral-800 border-neutral-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="document">Document</SelectItem>
                                <SelectItem value="photo">Photo</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                                <SelectItem value="invoice">Invoice</SelectItem>
                                <SelectItem value="estimate">Estimate</SelectItem>
                                <SelectItem value="receipt">Receipt</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="form">Form</SelectItem>
                                <SelectItem value="signature">Signature</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`tags-${uploadFile.id}'} className="text-sm text-neutral-400">
                              Tags (comma separated)
                            </Label>
                            <Input
                              id={'tags-${uploadFile.id}'}
                              value={uploadFile.tags.join(', ')}
                              onChange={(e) => updateUploadFile(uploadFile.id, { 
                                tags: e.target.value.split(',`).map(tag => tag.trim()).filter(Boolean)
                              })}
                              placeholder="urgent, customer, project..."
                              className="bg-neutral-800 border-neutral-700"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`description-${uploadFile.id}'} className="text-sm text-neutral-400">
                            Description
                          </Label>
                          <Textarea
                            id={'description-${uploadFile.id}'}
                            value={uploadFile.description}
                            onChange={(e) => updateUploadFile(uploadFile.id, { description: e.target.value })}
                            placeholder="Brief description of the document..."
                            className="bg-neutral-800 border-neutral-700"
                            rows={2}
                          />
                        </div>

                        {/* Upload Progress */}
                        {showProgress && uploadFile.status === 'uploading' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-400">Uploading...</span>
                              <span className="text-white">{Math.round(uploadFile.progress)}%</span>
                            </div>
                            <Progress value={uploadFile.progress} className="h-2" />
                          </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {uploadFile.status === 'pending' && (
                              <Badge variant="outline">Ready to upload</Badge>
                            )}
                            {uploadFile.status === 'uploading' && (
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Uploading
                              </Badge>
                            )}
                            {uploadFile.status === 'completed' && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                            {uploadFile.status === 'error' && (
                              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Error
                              </Badge>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadFile(uploadFile.id)}
                            disabled={uploadFile.status === 'uploading'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {uploadFile.error && (
                          <p className="text-sm text-red-400">{uploadFile.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple={allowMultiple}
        accept={acceptedTypes.join(',')}
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
'use client'

import { useState } from 'react'
import { Upload, X, Plus, Image as ImageIcon, Camera, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImageManagerProps {
  primaryImage: string
  galleryImages: string[]
  onChange: (images: { primaryImage: string; galleryImages: string[] }) => void
}

// Mock stock images for services
const stockImages = {
  plumbing: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1620401537439-98e94c004b0d?w=800&h=600&fit=crop&crop=center'
  ],
  electrical: [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1582139329769-9d0c6e6c3739?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center'
  ],
  hvac: [
    'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1620401537439-98e94c004b0d?w=800&h=600&fit=crop&crop=center'
  ]
}

export function ImageManager({ primaryImage, galleryImages, onChange }: ImageManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [urlInput, setUrlInput] = useState(')
  const [activeTab, setActiveTab] = useState('upload')

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingFile(true)
    try {
      // In a real app, this would upload to a CDN/storage service
      const file = files[0]
      const imageUrl = URL.createObjectURL(file)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addImage(imageUrl)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploadingFile(false)
    }
  }

  const addImage = (imageUrl: string) => {
    if (!primaryImage) {
      onChange({
        primaryImage: imageUrl,
        galleryImages
      })
    } else {
      onChange({
        primaryImage,
        galleryImages: [...galleryImages, imageUrl]
      })
    }
    setShowAddDialog(false)
    setUrlInput(')
  }

  const removeImage = (imageUrl: string) => {
    if (imageUrl === primaryImage) {
      // If removing primary image, promote first gallery image
      const newGallery = galleryImages.filter(img => img !== imageUrl)
      onChange({
        primaryImage: newGallery[0] || ',
        galleryImages: newGallery.slice(1)
      })
    } else {
      onChange({
        primaryImage,
        galleryImages: galleryImages.filter(img => img !== imageUrl)
      })
    }
  }

  const setPrimaryImage = (imageUrl: string) => {
    if (imageUrl === primaryImage) return

    const newGallery = galleryImages.filter(img => img !== imageUrl)
    if (primaryImage) {
      newGallery.unshift(primaryImage)
    }

    onChange({
      primaryImage: imageUrl,
      galleryImages: newGallery
    })
  }

  const allImages = primaryImage ? [primaryImage, ...galleryImages] : galleryImages

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-white">Service Images</h2>
            <p className="text-sm text-neutral-400">Add photos to showcase this service</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 border-neutral-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Add Service Image</DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-neutral-900 border border-neutral-800 w-full">
                  <TabsTrigger value="upload" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Image URL
                  </TabsTrigger>
                  <TabsTrigger value="stock" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Stock Images
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                    <div className="text-white font-medium mb-2">Upload Service Photo</div>
                    <div className="text-sm text-neutral-400 mb-4">
                      Drag and drop or click to select files
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        disabled={uploadingFile}
                      >
                        {uploadingFile ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </label>
                  </div>
                  <div className="text-xs text-neutral-500 text-center">
                    Supported formats: JPG, PNG, WebP • Max size: 5MB
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-neutral-300">Image URL</Label>
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1 bg-neutral-900 border-neutral-700 text-white"
                    />
                  </div>
                  {urlInput && (
                    <div className="bg-neutral-900 rounded-lg p-4">
                      <div className="text-sm font-medium text-neutral-300 mb-2">Preview</div>
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="w-32 h-24 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => addImage(urlInput)}
                    disabled={!urlInput}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Image
                  </Button>
                </TabsContent>

                <TabsContent value="stock" className="space-y-4">
                  <div className="space-y-4">
                    {Object.entries(stockImages).map(([category, images]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-white mb-2 capitalize">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {images.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative group cursor-pointer rounded-lg overflow-hidden"
                              onClick={() => addImage(imageUrl)}
                            >
                              <img
                                src={imageUrl}
                                alt={`${category} ${index + 1}'}
                                className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Plus className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Primary Image */}
      {primaryImage && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-base font-medium text-white mb-4">Primary Image</h3>
          <div className="relative inline-block">
            <img
              src={primaryImage}
              alt="Primary service image"
              className="w-48 h-36 object-cover rounded-lg"
            />
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              Primary
            </div>
            <button
              onClick={() => removeImage(primaryImage)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Gallery Images */}
      {galleryImages.length > 0 && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-base font-medium text-white mb-4">Gallery Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={'Gallery image ${index + 1}'}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 rounded-lg" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-1">
                  <button
                    onClick={() => setPrimaryImage(imageUrl)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs"
                    title="Set as primary"
                  >
                    <ImageIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeImage(imageUrl)}
                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allImages.length === 0 && (
        <div className="text-center py-12 bg-neutral-950 border border-neutral-800 rounded-lg">
          <ImageIcon className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Images Added</h3>
          <p className="text-neutral-400 mb-4">Add photos to help customers visualize this service</p>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Image
          </Button>
        </div>
      )}

      {/* Image Tips */}
      <div className="bg-neutral-900 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2">Image Guidelines</h4>
        <ul className="text-xs text-neutral-400 space-y-1">
          <li>• Use high-quality images that clearly show the service being performed</li>
          <li>• The primary image appears in listings and should be the most representative</li>
          <li>• Include before/after photos when applicable</li>
          <li>• Recommended size: 800x600 pixels or larger</li>
          <li>• Avoid images with watermarks or excessive branding</li>
        </ul>
      </div>
    </div>
  )
}
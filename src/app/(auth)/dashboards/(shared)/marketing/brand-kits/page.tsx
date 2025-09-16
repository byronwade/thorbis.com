"use client";

import { useState } from "react";
;
import { 
  Palette,
  Plus,
  Download,
  Upload,
  Copy,
  Edit3,
  Trash2,
  Image,
  Type,
  FileText,
  Share2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Star,
  Folder,
  Search,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface BrandColor {
  name: string;
  hex: string;
  usage: string;
}

interface BrandFont {
  name: string;
  family: string;
  usage: "heading" | "body" | "accent";
  weights: string[];
}

interface BrandAsset {
  id: string;
  name: string;
  type: "logo" | "icon" | "pattern" | "image";
  url: string;
  variations: string[];
  description?: string;
}

interface BrandKit {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  colors: BrandColor[];
  fonts: BrandFont[];
  assets: BrandAsset[];
  guidelines: {
    voice: string;
    tone: string;
    messaging: string[];
  };
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

const mockBrandKits: BrandKit[] = [
  {
    id: "1",
    name: "Thorbis Primary Brand",
    description: "Main brand guidelines for all Thorbis marketing materials",
    isDefault: true,
    colors: [
      { name: "Primary Blue", hex: "#1C8BFF", usage: "Primary CTAs, links, brand elements" },
      { name: "Dark Neutral", hex: "#0A0A0A", usage: "Text, headers, dark backgrounds" },
      { name: "Light Neutral", hex: "#FFFFFF", usage: "Backgrounds, cards, light text" },
      { name: "Success Green", hex: "#10B981", usage: "Success states, positive actions" },
      { name: "Warning Orange", hex: "#F59E0B", usage: "Warnings, attention states" },
      { name: "Error Red", hex: "#EF4444", usage: "Errors, destructive actions" },
    ],
    fonts: [
      {
        name: "Inter",
        family: "Inter, sans-serif",
        usage: "heading",
        weights: ["400", "500", "600", "700"],
      },
      {
        name: "Inter",
        family: "Inter, sans-serif", 
        usage: "body",
        weights: ["400", "500"],
      },
    ],
    assets: [
      {
        id: "logo-1",
        name: "Thorbis Logo",
        type: "logo",
        url: "/images/ThorbisLogo.webp",
        variations: ["full-color", "white", "black", "icon-only"],
        description: "Primary logo for all brand applications",
      },
      {
        id: "icon-1", 
        name: "Thorbis Icon",
        type: "icon",
        url: "/images/ThorbisIcon.svg",
        variations: ["16x16", "32x32", "64x64", "128x128"],
        description: "Standalone icon for app interfaces",
      },
    ],
    guidelines: {
      voice: "Professional, approachable, and innovative",
      tone: "Confident yet friendly, technical but accessible",
      messaging: [
        "Simplify complex business operations",
        "Empower teams to focus on growth",
        "Technology that works for you",
        "Built for modern businesses",
      ],
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    usageCount: 245,
  },
  {
    id: "2",
    name: "Holiday Campaign 2024",
    description: "Special brand guidelines for holiday marketing campaigns",
    isDefault: false,
    colors: [
      { name: "Holiday Red", hex: "#DC2626", usage: "Holiday themed elements" },
      { name: "Forest Green", hex: "#059669", usage: "Seasonal accents" },
      { name: "Gold Accent", hex: "#D97706", usage: "Premium highlights" },
      { name: "Snow White", hex: "#FAFAFA", usage: "Clean backgrounds" },
    ],
    fonts: [
      {
        name: "Playfair Display",
        family: "Playfair Display, serif",
        usage: "heading",
        weights: ["400", "600", "700"],
      },
      {
        name: "Inter",
        family: "Inter, sans-serif",
        usage: "body", 
        weights: ["400", "500"],
      },
    ],
    assets: [
      {
        id: "holiday-logo",
        name: "Holiday Logo Variant",
        type: "logo",
        url: "/images/holiday-logo.svg",
        variations: ["with-snow", "with-lights", "minimal"],
        description: "Seasonal logo variation for holiday campaigns",
      },
    ],
    guidelines: {
      voice: "Warm, celebratory, and generous",
      tone: "Joyful and inclusive, emphasizing connection and gratitude",
      messaging: [
        "Celebrate success together",
        "Gift your business the tools it deserves", 
        "Make this season more productive",
        "Start the new year strong",
      ],
    },
    createdAt: "2024-11-01T00:00:00Z",
    updatedAt: "2024-12-15T14:20:00Z",
    usageCount: 45,
  },
];

export default function BrandKitsPage() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>(mockBrandKits);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKit, setSelectedKit] = useState<BrandKit | null>(null);

  const filteredKits = brandKits.filter(kit =>
    kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kit.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Kits</h1>
          <p className="text-muted-foreground">
            Manage your brand guidelines, colors, fonts, and assets in one centralized location.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Kit
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Brand Kit
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search brand kits..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Brand Kits Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredKits.map((kit) => (
          <Card key={kit.id} className={'hover:shadow-lg transition-shadow ${kit.isDefault ? 'ring-2 ring-primary' : '
              }'}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{kit.name}</CardTitle>
                    {kit.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <CardDescription className="mt-1">{kit.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Color Palette Preview */}
              <div>
                <h4 className="text-sm font-medium mb-2">Colors</h4>
                <div className="flex gap-2 flex-wrap">
                  {kit.colors.slice(0, 6).map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-background shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.hex }}
                      title={'${color.name}: ${color.hex}'}
                      onClick={() => copyToClipboard(color.hex)}
                    />
                  ))}
                  {kit.colors.length > 6 && (
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                      +{kit.colors.length - 6}
                    </div>
                  )}
                </div>
              </div>

              {/* Typography Preview */}
              <div>
                <h4 className="text-sm font-medium mb-2">Typography</h4>
                <div className="space-y-1">
                  {kit.fonts.map((font, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{font.name}</span>
                      <span className="text-muted-foreground ml-2">({font.usage})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assets Preview */}
              <div>
                <h4 className="text-sm font-medium mb-2">Assets</h4>
                <div className="flex gap-2">
                  {kit.assets.slice(0, 3).map((asset) => (
                    <div key={asset.id} className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                      {asset.type === "logo" && <Image className="h-6 w-6 text-muted-foreground" />}
                      {asset.type === "icon" && <Star className="h-6 w-6 text-muted-foreground" />}
                      {asset.type === "pattern" && <Folder className="h-6 w-6 text-muted-foreground" />}
                    </div>
                  ))}
                  {kit.assets.length > 3 && (
                    <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                      +{kit.assets.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Used {kit.usageCount} times</span>
                <span>Updated {new Date(kit.updatedAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" onClick={() => setSelectedKit(kit)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Brand Kit Detail Modal/Panel */}
      {selectedKit && (
        <div className="fixed inset-0 bg-neutral-950/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedKit.name}</h2>
                  <p className="text-muted-foreground">{selectedKit.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedKit(null)}>
                    ×
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Brand Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedKit.colors.map((color, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-background shadow-sm cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => copyToClipboard(color.hex)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{color.name}</div>
                            <div className="text-sm text-muted-foreground">{color.hex}</div>
                            <div className="text-xs text-muted-foreground mt-1">{color.usage}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(color.hex)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Typography */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Typography
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedKit.fonts.map((font, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{font.name}</div>
                            <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                              {font.usage}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {font.family}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Weights: {font.weights.join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Assets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Brand Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedKit.assets.map((asset) => (
                        <div key={asset.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{asset.type}</div>
                            {asset.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {asset.description}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              Variations: {asset.variations.join(", ")}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Brand Guidelines */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Brand Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Voice</h4>
                        <p className="text-sm text-muted-foreground">{selectedKit.guidelines.voice}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Tone</h4>
                        <p className="text-sm text-muted-foreground">{selectedKit.guidelines.tone}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Key Messages</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedKit.guidelines.messaging.map((message, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredKits.length === 0 && (
        <div className="text-center py-12">
          <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No brand kits found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? "Try adjusting your search terms"
              : "Create your first brand kit to get started"}
          </p>
          {!searchQuery && (
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Brand Kit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useRef } from "react";
;
import { 
  Save,
  Eye,
  Undo,
  Redo,
  Plus,
  Type,
  Image,
  Video,
  Layout,
  Palette,
  Settings,
  Smartphone,
  Tablet,
  Monitor,
  Code,
  Download
} from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent
} from '@/components/ui/card';


interface Block {
  id: string;
  type: "text" | "image" | "video" | "button" | "form" | "spacer";
  content: any;
  style: any;
}

interface SiteBuilderProps {
  params: { id: string };
}

export default function SiteBuilder({ params }: SiteBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "1",
      type: "text",
      content: {
        text: "Welcome to Your Website",
        tag: "h1",
      },
      style: {
        fontSize: "3rem",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "2rem",
      },
    },
    {
      id: "2", 
      type: "text",
      content: {
        text: "Create something amazing with our drag-and-drop builder.",
        tag: "p",
      },
      style: {
        fontSize: "1.25rem",
        textAlign: "center",
        color: "#666",
        marginBottom: "3rem",
      },
    },
  ]);

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const blockTypes = [
    { type: "text", icon: Type, label: "Text" },
    { type: "image", icon: Image, label: "Image" },
    { type: "video", icon: Video, label: "Video" },
    { type: "button", icon: Plus, label: "Button" },
    { type: "form", icon: Layout, label: "Form" },
    { type: "spacer", icon: Layout, label: "Spacer" },
  ];

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type: Block["type"]) => {
    switch (type) {
      case "text":
        return { text: "Your text here", tag: "p" };
      case "image":
        return { src: "", alt: "Image", width: 400, height: 300 };
      case "video":
        return { src: "", autoplay: false, controls: true };
      case "button":
        return { text: "Click me", link: "#", style: "primary" };
      case "form":
        return { fields: ["email"], submitText: "Submit" };
      case "spacer":
        return { height: 50 };
      default:
        return {};
    }
  };

  const getDefaultStyle = (type: Block["type"]) => {
    const baseStyle = {
      marginBottom: "1rem",
      padding: "1rem",
    };

    switch (type) {
      case "text":
        return { ...baseStyle, fontSize: "1rem", color: "#000" };
      case "button":
        return { ...baseStyle, backgroundColor: "#007bff", color: "#fff", borderRadius: "0.5rem" };
      default:
        return baseStyle;
    }
  };

  const updateBlockContent = (id: string, content: unknown) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content: { ...block.content, ...content } } : block
    ));
  };

  const updateBlockStyle = (id: string, style: unknown) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, style: { ...block.style, ...style } } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlock(null);
  };

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlock === block.id;
    const className = 'relative group cursor-pointer transition-all ${
      isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
    } ${!isPreviewMode ? "hover:ring-1 hover:ring-gray-300" : ""}';

    const content = (() => {
      switch (block.type) {
        case "text":
          const Tag = block.content.tag as keyof JSX.IntrinsicElements;
          return (
            <Tag style={block.style}>
              {block.content.text}
            </Tag>
          );
        case "image":
          return (
            <div 
              style={{ 
                ...block.style, 
                width: block.content.width, 
                height: block.content.height,
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {block.content.src ? (
                <img src={block.content.src} alt={block.content.alt} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Image className="h-8 w-8 text-gray-400" />
              )}
            </div>
          );
        case "video":
          return (
            <div style={block.style}>
              {block.content.src ? (
                <video 
                  src={block.content.src} 
                  controls={block.content.controls}
                  autoPlay={block.content.autoplay}
                  style={{ width: "100%" }}
                />
              ) : (
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          );
        case "button":
          return (
            <div style={block.style}>
              <button 
                style={{
                  backgroundColor: block.style.backgroundColor,
                  color: block.style.color,
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: block.style.borderRadius,
                  cursor: "pointer",
                }}
              >
                {block.content.text}
              </button>
            </div>
          );
        case "spacer":
          return (
            <div 
              style={{ 
                height: block.content.height,
                backgroundColor: isSelected ? "#f0f8ff" : "transparent",
                border: isSelected ? "2px dashed #ccc" : "none",
              }}
            />
          );
        default:
          return <div>Unsupported block type</div>;
      }
    })();

    return (
      <div
        key={block.id}
        className={className}
        onClick={() => !isPreviewMode && setSelectedBlock(block.id)}
      >
        {content}
        {!isPreviewMode && isSelected && (
          <div className="absolute -top-8 right-0 flex gap-1">
            <Button size="sm" variant="destructive" onClick={() => deleteBlock(block.id)}>
              ×
            </Button>
          </div>
        )}
      </div>
    );
  };

  const getCanvasWidth = () => {
    switch (viewMode) {
      case "mobile": return "375px";
      case "tablet": return "768px"; 
      case "desktop": return "100%";
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      {!isPreviewMode && (
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {blockTypes.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(type)}
                  className="flex flex-col h-16 text-xs"
                >
                  <Icon className="h-4 w-4 mb-1" />
                  {label}
                </Button>
              ))}
            </div>

            {selectedBlock && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Properties</h4>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {/* Block-specific property controls would go here */}
                    <div>
                      <label className="text-sm font-medium">Content</label>
                      <textarea 
                        className="w-full mt-1 p-2 border rounded text-sm" 
                        rows={3}
                        placeholder="Edit content..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Styling</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <input type="color" className="w-full h-8" />
                        <select className="p-1 border rounded text-sm">
                          <option>Left</option>
                          <option>Center</option>
                          <option>Right</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-gray-300 mx-2" />
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded">
              <Button 
                variant={viewMode === "desktop" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "tablet" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "mobile" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100">
          <div className="mx-auto" style={{ width: getCanvasWidth() }}>
            <div
              ref={canvasRef}
              className="bg-white min-h-screen shadow-lg"
              style={{ 
                maxWidth: "100%",
                transition: "width 0.3s ease"
              }}
            >
              <div className="p-8">
                {blocks.map(renderBlock)}
                
                {!isPreviewMode && blocks.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <Layout className="mx-auto h-12 w-12 mb-4" />
                    <p>Start by adding elements from the sidebar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
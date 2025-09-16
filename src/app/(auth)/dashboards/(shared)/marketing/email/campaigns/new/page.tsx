"use client";

import { useState } from "react";
;
import { 
  ArrowLeft,
  Save,
  Send,
  Eye,
  Users,
  Settings,
  Image,
  Type,
  Layout,
  Link as LinkIcon,
  Code,
  Palette,
  Smartphone,
  Monitor,
  Calendar,
  TestTube,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface EmailBlock {
  id: string;
  type: "header" | "text" | "image" | "button" | "divider" | "social" | "footer";
  content: any;
  styles: any;
}

export default function NewEmailCampaign() {
  const [step, setStep] = useState<"setup" | "design" | "recipients" | "review">("setup");
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [fromName, setFromName] = useState("Thorbis Team");
  const [fromEmail, setFromEmail] = useState("hello@thorbis.com");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedAudience, setSelectedAudience] = useState<string>("");
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const templates = [
    {
      id: "newsletter",
      name: "Newsletter",
      description: "Perfect for regular updates and news",
      thumbnail: "/templates/newsletter.jpg",
      category: "Newsletter"
    },
    {
      id: "promotional",
      name: "Promotional",
      description: "Great for sales and special offers",
      thumbnail: "/templates/promotional.jpg",
      category: "Marketing"
    },
    {
      id: "welcome",
      name: "Welcome Email",
      description: "Onboard new subscribers",
      thumbnail: "/templates/welcome.jpg",
      category: "Transactional"
    },
    {
      id: "product",
      name: "Product Announcement",
      description: "Showcase new products or features",
      thumbnail: "/templates/product.jpg",
      category: "Marketing"
    },
  ];

  const audiences = [
    {
      id: "all",
      name: "All Subscribers",
      count: 15420,
      description: "Everyone on your mailing list"
    },
    {
      id: "customers",
      name: "Customers",
      count: 8930,
      description: "People who have made a purchase"
    },
    {
      id: "prospects",
      name: "Prospects", 
      count: 6490,
      description: "Leads who haven't purchased yet"
    },
    {
      id: "vip",
      name: "VIP Customers",
      count: 1250,
      description: "Your most valuable customers"
    },
  ];

  const blockTypes = [
    { type: "header", icon: Type, label: "Header" },
    { type: "text", icon: Type, label: "Text" },
    { type: "image", icon: Image, label: "Image" },
    { type: "button", icon: LinkIcon, label: "Button" },
    { type: "divider", icon: Layout, label: "Divider" },
    { type: "social", icon: LinkIcon, label: "Social" },
  ];

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type: EmailBlock["type"]) => {
    switch (type) {
      case "header":
        return { text: "Your Header Here", level: "h1" };
      case "text":
        return { text: "Your content goes here..." };
      case "image":
        return { src: "", alt: "Image", width: "100%" };
      case "button":
        return { text: "Click Here", url: "#", style: "primary" };
      case "divider":
        return { style: "solid" };
      case "social":
        return { platforms: ["facebook", "twitter", "instagram"] };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: EmailBlock["type"]) => {
    return {
      padding: "16px",
      margin: "8px 0",
      textAlign: "left",
      backgroundColor: "transparent",
      color: "#000000",
    };
  };

  const renderStep = () => {
    switch (step) {
      case "setup":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Set up the basic information for your email campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="Internal name for your campaign"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">From Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">From Email</label>
                    <input
                      type="email"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Subject Line</label>
                  <input
                    type="text"
                    placeholder="What's this email about?"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Preheader Text (Optional)</label>
                  <input
                    type="text"
                    placeholder="Preview text that appears after the subject line"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This text appears in the inbox preview. Keep it under 90 characters.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Choose a Template</CardTitle>
                <CardDescription>Start with a professional template or build from scratch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      selectedTemplate === "blank" 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/25 hover:border-primary"
                    }`}
                    onClick={() => setSelectedTemplate("blank")}
                  >
                    <Layout className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium">Start from Scratch</h4>
                    <p className="text-sm text-muted-foreground">Build your own custom design</p>
                  </div>
                  
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary"
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="aspect-[4/3] bg-muted rounded-t-md flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "design":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Add Content</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Palette className="h-4 w-4 mr-2" />
                    Design
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Options
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Email Preview</h3>
                <div className="flex items-center gap-2">
                  <div className="flex border rounded">
                    <Button
                      variant={previewMode === "desktop" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("desktop")}
                      className="rounded-r-none"
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === "mobile" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("mobile")}
                      className="rounded-l-none"
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${
                previewMode === "mobile" ? "max-w-sm" : "max-w-2xl"
              }`}>
                <div className="bg-gray-100 px-4 py-3 text-sm">
                  <div className="font-medium">{subject || "Subject Line"}</div>
                  <div className="text-muted-foreground">{fromName} &lt;{fromEmail}&gt;</div>
                  {preheader && <div className="text-xs text-muted-foreground mt-1">{preheader}</div>}
                </div>
                
                <div className="p-6 min-h-96">
                  {blocks.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Layout className="h-12 w-12 mx-auto mb-4" />
                      <p>Start by adding content blocks from the sidebar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blocks.map((block) => (
                        <div key={block.id} className="border rounded p-3 bg-gray-50">
                          <div className="text-sm font-medium capitalize">{block.type} Block</div>
                          <div className="text-xs text-muted-foreground">Click to edit content</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Select a block to edit its properties
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "recipients":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Audience</CardTitle>
                <CardDescription>Select who will receive this email campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {audiences.map((audience) => (
                    <div
                      key={audience.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAudience === audience.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-primary"
                      }`}
                      onClick={() => setSelectedAudience(audience.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedAudience === audience.id 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground"
                        }`}>
                          {selectedAudience === audience.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{audience.name}</h4>
                          <p className="text-sm text-muted-foreground">{audience.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{audience.count.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">subscribers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sending Options</CardTitle>
                <CardDescription>Choose when to send your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sendTime" value="now" className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Send Now</div>
                      <div className="text-sm text-muted-foreground">Send immediately after review</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="sendTime" value="schedule" className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Schedule</div>
                      <div className="text-sm text-muted-foreground">Send at a specific date and time</div>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
                <CardDescription>Review your campaign before sending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Campaign Name:</span>
                    <div>{campaignName || "Untitled Campaign"}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Template:</span>
                    <div>{selectedTemplate || "None selected"}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Subject Line:</span>
                    <div>{subject || "No subject"}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Recipients:</span>
                    <div>
                      {selectedAudience ? 
                        audiences.find(a => a.id === selectedAudience)?.count.toLocaleString() : 
                        "No audience selected"
                      } subscribers
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pre-send Checklist</CardTitle>
                <CardDescription>Make sure everything is ready</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Subject line added</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">From address configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Send test email recommended</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Audience selected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <TestTube className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
              <Button className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            </div>
          </div>
        );
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case "setup": return 1;
      case "design": return 2;
      case "recipients": return 3;
      case "review": return 4;
    }
  };

  const canProceed = () => {
    switch (step) {
      case "setup": return campaignName && subject && selectedTemplate;
      case "design": return true;
      case "recipients": return selectedAudience;
      case "review": return true;
      default: return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/email">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Email
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Email Campaign</h1>
            <p className="text-muted-foreground">
              Build and send professional email campaigns to your audience.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {["Setup", "Design", "Recipients", "Review"].map((stepName, index) => {
          const stepNumber = index + 1;
          const isActive = getStepNumber() === stepNumber;
          const isCompleted = getStepNumber() > stepNumber;
          
          return (
            <div key={stepName} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                isCompleted 
                  ? "bg-green-600 text-white" 
                  : isActive 
                    ? "bg-primary text-white" 
                    : "bg-muted text-muted-foreground"
              }'}>
                {isCompleted ? "✓" : stepNumber}
              </div>
              <span className={'font-medium ${isActive ? "text-primary" : "text-muted-foreground"}'}>
                {stepName}
              </span>
              {index < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-96">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={() => {
            const steps = ["setup", "design", "recipients", "review"];
            const currentIndex = steps.indexOf(step);
            if (currentIndex > 0) {
              setStep(steps[currentIndex - 1] as any);
            }
          }}
          disabled={step === "setup"}
        >
          Previous
        </Button>
        
        <Button 
          onClick={() => {
            const steps = ["setup", "design", "recipients", "review"];
            const currentIndex = steps.indexOf(step);
            if (currentIndex < steps.length - 1) {
              setStep(steps[currentIndex + 1] as any);
            }
          }}
          disabled={!canProceed() || step === "review"}
        >
          {step === "review" ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
;
import { 
  Send,
  Clock,
  Image,
  Video,
  AtSign,
  Hash,
  Link as LinkIcon,
  Calendar,
  Plus,
  X,
  ChevronDown,
  Save,
  Eye,
  Smile,
  MapPin,
  Target,
  Repeat2,
  ArrowLeft,
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


interface PlatformConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  charLimit: number;
  supportsImages: boolean;
  supportsVideos: boolean;
  supportsLinks: boolean;
  supportsHashtags: boolean;
  selected: boolean;
}

const platformConfigs: PlatformConfig[] = [
  {
    id: "instagram",
    name: "Instagram",
    color: "bg-pink-500",
    icon: "📸",
    charLimit: 2200,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: false,
    supportsHashtags: true,
    selected: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "bg-blue-600",
    icon: "👥",
    charLimit: 63206,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: true,
    supportsHashtags: true,
    selected: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "bg-blue-700",
    icon: "💼",
    charLimit: 3000,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: true,
    supportsHashtags: true,
    selected: false,
  },
  {
    id: "twitter",
    name: "Twitter/X",
    color: "bg-neutral-950",
    icon: "🐦",
    charLimit: 280,
    supportsImages: true,
    supportsVideos: true,
    supportsLinks: true,
    supportsHashtags: true,
    selected: false,
  },
];

export default function SocialCompose() {
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState(platformConfigs);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [attachedMedia, setAttachedMedia] = useState<{ type: "image" | "video"; url: string; name: string }[]>([]);
  const [publishType, setPublishType] = useState<"now" | "schedule" | "draft">("now");

  const selectedPlatforms = platforms.filter(p => p.selected);
  const maxCharLimit = Math.min(...selectedPlatforms.map(p => p.charLimit));
  const currentCharCount = content.length;
  const isOverLimit = currentCharCount > maxCharLimit;

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => prev.map(p => 
      p.id === platformId ? { ...p, selected: !p.selected } : p
    ));
  };

  const addMedia = (type: "image" | "video") => {
    // In a real app, this would open a file picker
    const mockMedia = {
      type,
      url: `/mock-${type}.jpg`,
      name: `Mock ${type}`,
    };
    setAttachedMedia(prev => [...prev, mockMedia]);
  };

  const removeMedia = (index: number) => {
    setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const insertHashtag = () => {
    setContent(prev => prev + "#");
  };

  const insertMention = () => {
    setContent(prev => prev + "@");
  };

  const handlePublish = () => {
    if (publishType === "now") {
      // Publish immediately
      console.log("Publishing now:", { content, platforms: selectedPlatforms, media: attachedMedia });
    } else if (publishType === "schedule") {
      // Schedule for later
      console.log("Scheduling:", { content, platforms: selectedPlatforms, scheduledDate, scheduledTime, media: attachedMedia });
    } else {
      // Save as draft
      console.log("Saving as draft:", { content, platforms: selectedPlatforms, media: attachedMedia });
    }
  };

  const getCharCountColor = () => {
    const percentage = currentCharCount / maxCharLimit;
    if (percentage > 1) return "text-red-600";
    if (percentage > 0.8) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/social">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Social
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compose Post</h1>
            <p className="text-muted-foreground">
              Create and schedule posts across multiple social platforms.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Platforms</CardTitle>
              <CardDescription>Choose where to publish this post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      platform.selected 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-muted-foreground"
                    }`}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white font-semibold`}>
                      {platform.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{platform.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {platform.charLimit.toLocaleString()} char limit
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      platform.selected 
                        ? "border-primary bg-primary text-white" 
                        : "border-muted-foreground"
                    }`}>
                      {platform.selected && "✓"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Composer */}
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>
                Write your post content
                {selectedPlatforms.length > 0 && (
                  <span className="ml-2">
                    • Max {maxCharLimit.toLocaleString()} characters
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <textarea
                  placeholder="What`s happening?"
                  className={`w-full min-h-32 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
                    isOverLimit ? "border-red-300" : ""
                  }`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className={`text-sm ${getCharCountColor()}'}>
                    {currentCharCount} / {maxCharLimit}
                  </span>
                </div>
              </div>

              {/* Writing Tools */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={insertHashtag}
                >
                  <Hash className="h-4 w-4 mr-1" />
                  Hashtag
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={insertMention}
                >
                  <AtSign className="h-4 w-4 mr-1" />
                  Mention
                </Button>
                <Button variant="outline" size="sm">
                  <Smile className="h-4 w-4 mr-1" />
                  Emoji
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Media Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Add images or videos to your post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {attachedMedia.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {attachedMedia.map((media, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        {media.type === "image" ? (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <Video className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => addMedia("image")}
                  disabled={!selectedPlatforms.some(p => p.supportsImages)}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => addMedia("video")}
                  disabled={!selectedPlatforms.some(p => p.supportsVideos)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>Choose when to publish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="publishType"
                    value="now"
                    checked={publishType === "now"}
                    onChange={(e) => setPublishType(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Publish Now</div>
                    <div className="text-sm text-muted-foreground">Post immediately</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="publishType"
                    value="schedule"
                    checked={publishType === "schedule"}
                    onChange={(e) => setPublishType(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Schedule</div>
                    <div className="text-sm text-muted-foreground">Post at a specific time</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="publishType"
                    value="draft"
                    checked={publishType === "draft"}
                    onChange={(e) => setPublishType(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Save as Draft</div>
                    <div className="text-sm text-muted-foreground">Save for later</div>
                  </div>
                </label>
              </div>

              {publishType === "schedule" && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <input
                      type="date"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <input
                      type="time"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button 
                className="w-full mt-4" 
                onClick={handlePublish}
                disabled={selectedPlatforms.length === 0 || !content.trim() || isOverLimit}
              >
                {publishType === "now" && (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publish Now
                  </>
                )}
                {publishType === "schedule" && (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Post
                  </>
                )}
                {publishType === "draft" && (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Platform Previews */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>See how your post will look</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPlatforms.map((platform) => (
                <div key={platform.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={'w-6 h-6 rounded ${platform.color} flex items-center justify-center text-white text-xs'}>
                      {platform.icon}
                    </div>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted rounded p-2">
                    {content.slice(0, platform.charLimit) || "Your post content will appear here..."}
                    {content.length > platform.charLimit && "..."}
                  </div>
                  {attachedMedia.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {attachedMedia.length} media file{attachedMedia.length > 1 ? 's' : '} attached'
                    </div>
                  )}
                </div>
              ))}
              
              {selectedPlatforms.length === 0 && (
                <div className="text-center text-muted-foreground">
                  Select platforms to see previews
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Use hashtags to increase discoverability</p>
              <p>• Tag relevant people and brands</p>
              <p>• Post when your audience is most active</p>
              <p>• Include a call-to-action</p>
              <p>• Keep it authentic and engaging</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
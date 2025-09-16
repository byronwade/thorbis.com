"use client";

import { useState } from "react";
;
import { 
  Plus,
  Send,
  Calendar,
  Image,
  Video,
  Link as LinkIcon,
  Hash,
  AtSign,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
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


interface SocialPost {
  id: string;
  content: string;
  platforms: ("instagram" | "facebook" | "linkedin" | "twitter")[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledFor?: string;
  publishedAt?: string;
  media?: { type: "image" | "video"; url: string }[];
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

const mockPosts: SocialPost[] = [
  {
    id: "1",
    content: "🚀 Exciting news! We're launching our new AI-powered business automation tools. Transform your workflow and boost productivity like never before! #AI #BusinessAutomation #Innovation",
    platforms: ["instagram", "linkedin", "twitter"],
    status: "published",
    publishedAt: "2 hours ago",
    media: [{ type: "image", url: "/images/ai-tools.jpg" }],
    engagement: {
      views: 2400,
      likes: 148,
      comments: 23,
      shares: 12,
    },
  },
  {
    id: "2",
    content: "Join us this Friday for an exclusive webinar on 'The Future of Customer Experience'. Industry experts will share insights on building meaningful connections. Register now! 🎯",
    platforms: ["linkedin", "facebook"],
    status: "scheduled",
    scheduledFor: "Tomorrow at 9:00 AM",
  },
  {
    id: "3",
    content: "Behind the scenes: Our team working hard to deliver the best solutions for your business needs. We're passionate about what we do! 💪 #TeamWork #Dedication",
    platforms: ["instagram", "facebook"],
    status: "draft",
    media: [{ type: "image", url: "/images/team-work.jpg" }],
  },
  {
    id: "4",
    content: "Quick tip: Use our new dashboard analytics to track your business performance in real-time. Data-driven decisions lead to better outcomes! 📊",
    platforms: ["twitter", "linkedin"],
    status: "failed",
    scheduledFor: "1 hour ago",
  },
];

const socialPlatforms = [
  { id: "instagram", name: "Instagram", color: "bg-pink-500", icon: "📸" },
  { id: "facebook", name: "Facebook", color: "bg-blue-600", icon: "👥" },
  { id: "linkedin", name: "LinkedIn", color: "bg-blue-700", icon: "💼" },
  { id: "twitter", name: "Twitter/X", color: "bg-neutral-950", icon: "🐦" },
];

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>(mockPosts);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredPosts = posts.filter(post => 
    selectedStatus === "all" || post.status === selectedStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled": return <Clock className="h-4 w-4 text-blue-600" />;
      case "draft": return <Edit3 className="h-4 w-4 text-gray-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-green-600 bg-green-100 border-green-200";
      case "scheduled": return "text-blue-600 bg-blue-100 border-blue-200";
      case "draft": return "text-gray-600 bg-gray-100 border-gray-200";
      case "failed": return "text-red-600 bg-red-100 border-red-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = socialPlatforms.find(sp => sp.id === platform);
    return p?.icon || "📱";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage posts across all your social platforms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/social/schedule">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/social/compose">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts This Week</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +15% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,241</div>
            <p className="text-xs text-muted-foreground">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Next: Tomorrow 9 AM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              All platforms active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your social media accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {socialPlatforms.map((platform) => (
              <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white font-semibold`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{platform.name}</h4>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts Filter */}
      <div className="flex items-center gap-4">
        <select
          className="px-3 py-2 border rounded-md bg-background"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">All Posts</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Drafts</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(post.status)}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}'}>
                    {post.status}
                  </span>
                  {post.scheduledFor && (
                    <span className="text-sm text-muted-foreground">
                      {post.status === "scheduled" ? "Scheduled for" : "Was scheduled for"} {post.scheduledFor}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="text-sm text-muted-foreground">
                      Published {post.publishedAt}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Post Content */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed">{post.content}</p>
                {post.media && post.media.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {post.media.map((item, index) => (
                      <div key={index} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.type === "image" ? (
                          <Image className="h-6 w-6 text-gray-400" />
                        ) : (
                          <Video className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Platforms */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Platforms:</span>
                <div className="flex gap-2">
                  {post.platforms.map((platform) => (
                    <div key={platform} className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                      <span>{getPlatformIcon(platform)}</span>
                      <span className="capitalize">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Metrics */}
              {post.engagement && (
                <div className="flex items-center gap-6 pt-2 border-t">
                  {post.engagement.views && (
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{post.engagement.views.toLocaleString()}</span>
                    </div>
                  )}
                  {post.engagement.likes && (
                    <div className="flex items-center gap-1 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{post.engagement.likes}</span>
                    </div>
                  )}
                  {post.engagement.comments && (
                    <div className="flex items-center gap-1 text-sm">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span>{post.engagement.comments}</span>
                    </div>
                  )}
                  {post.engagement.shares && (
                    <div className="flex items-center gap-1 text-sm">
                      <Share className="h-4 w-4 text-green-500" />
                      <span>{post.engagement.shares}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <Send className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
          <p className="text-muted-foreground">
            {selectedStatus !== "all" 
              ? 'No ${selectedStatus} posts to show'
              : "Create your first social media post to get started"}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/social/compose">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
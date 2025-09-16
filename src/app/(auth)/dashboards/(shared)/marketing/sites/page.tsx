"use client";

import { useState } from "react";
;
import { 
  Globe, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit3,
  Settings,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Trash2,
  Star
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


interface Site {
  id: string;
  name: string;
  domain: string;
  status: "live" | "draft" | "archived";
  template: string;
  lastModified: string;
  views: number;
  thumbnail: string;
  isFavorite?: boolean;
}

const mockSites: Site[] = [
  {
    id: "1",
    name: "Thorbis Home Services",
    domain: "thorbis.com",
    status: "live",
    template: "Business Pro",
    lastModified: "2 hours ago",
    views: 15420,
    thumbnail: "/images/site-thumb-1.jpg",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Summer Campaign Landing",
    domain: "summer.thorbis.com",
    status: "live",
    template: "Campaign Landing",
    lastModified: "1 day ago", 
    views: 3280,
    thumbnail: "/images/site-thumb-2.jpg",
  },
  {
    id: "3",
    name: "Product Launch Site",
    domain: "launch.thorbis.com",
    status: "draft",
    template: "Product Showcase",
    lastModified: "3 days ago",
    views: 0,
    thumbnail: "/images/site-thumb-3.jpg",
  },
];

export default function SitesPage() {
  const [sites] = useState<Site[]>(mockSites);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSites = sites.filter((site) => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         site.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "text-green-600 bg-green-100 border-green-200";
      case "draft": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "archived": return "text-gray-600 bg-gray-100 border-gray-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground">
            Build and manage your marketing websites with drag-and-drop simplicity.
          </p>
        </div>
        <Button asChild>
          <Link href="/sites/builder/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Site
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search sites..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="px-3 py-2 border rounded-md bg-background"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Sites</option>
            <option value="live">Live</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-muted-foreground/25 hover:border-primary">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Start from Scratch</CardTitle>
            <CardDescription>
              Build a completely custom site with our drag-and-drop builder
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Use Template</CardTitle>
            <CardDescription>
              Choose from our collection of professional templates
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Copy className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Clone Existing</CardTitle>
            <CardDescription>
              Duplicate an existing site and modify it
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Sites Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSites.map((site) => (
          <Card key={site.id} className="group hover:shadow-lg transition-all">
            <div className="relative">
              {/* Thumbnail */}
              <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Globe className="h-12 w-12 text-gray-400" />
                </div>
                {site.isFavorite && (
                  <div className="absolute top-2 left-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-2 left-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(site.status)}'}>
                  {site.status}
                </span>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{site.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {site.domain}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Template:</span>
                  <span>{site.template}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last modified:</span>
                  <span>{site.lastModified}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Views:</span>
                  <span>{site.views.toLocaleString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    asChild
                  >
                    <Link href={'/sites/builder/${site.id}'}>
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No sites found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Get started by creating your first site"}
          </p>
          {(!searchQuery && statusFilter === "all") && (
            <Button className="mt-4" asChild>
              <Link href="/sites/builder/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Site
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
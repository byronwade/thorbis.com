"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Skeleton } from "@components/ui/skeleton";
import { 
  Search,
  Star,
  Download,
  ExternalLink,
  Zap,
  Building2,
  Truck,
  CreditCard,
  BarChart3,
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  Wrench
} from "lucide-react";

/**
 * IntegrationMarketplace - Browse and install business integrations
 * Displays available integrations with filtering and search capabilities
 */
export default function IntegrationMarketplace() {
  const [integrations, setIntegrations] = useState([]);
  const [filteredIntegrations, setFilteredIntegrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock integration data - replace with actual API call
  const mockIntegrations = [
    {
      id: "quickbooks",
      name: "QuickBooks Online",
      description: "Sync your financial data and automate accounting workflows",
      category: "accounting",
      icon: CreditCard,
      rating: 4.8,
      downloads: "10,000+",
      price: "Free",
      status: "available",
      features: ["Financial sync", "Automated invoicing", "Tax reporting", "Real-time data"],
      developer: "Intuit"
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Email marketing automation and customer engagement",
      category: "marketing",
      icon: Mail,
      rating: 4.6,
      downloads: "8,500+",
      price: "Free",
      status: "available",
      features: ["Email campaigns", "Audience segmentation", "Analytics", "Automation"],
      developer: "Mailchimp"
    },
    {
      id: "fleet-pro",
      name: "Fleet Management Pro",
      description: "Advanced vehicle tracking and fleet optimization",
      category: "operations",
      icon: Truck,
      rating: 4.9,
      downloads: "5,200+",
      price: "$29/month",
      status: "installed",
      features: ["GPS tracking", "Route optimization", "Maintenance alerts", "Driver analytics"],
      developer: "FleetTech"
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Comprehensive web analytics and business insights",
      category: "analytics",
      icon: BarChart3,
      rating: 4.7,
      downloads: "15,000+",
      price: "Free",
      status: "available",
      features: ["Traffic analysis", "Conversion tracking", "Custom reports", "Real-time data"],
      developer: "Google"
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Automated appointment scheduling and booking",
      category: "scheduling",
      icon: Calendar,
      rating: 4.5,
      downloads: "7,800+",
      price: "Free tier",
      status: "available",
      features: ["Online booking", "Calendar sync", "Automated reminders", "Custom availability"],
      developer: "Calendly"
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      description: "Customer relationship management and sales automation",
      category: "crm",
      icon: Users,
      rating: 4.4,
      downloads: "12,300+",
      price: "Free tier",
      status: "available",
      features: ["Contact management", "Deal tracking", "Email templates", "Sales pipeline"],
      developer: "HubSpot"
    },
    {
      id: "field-service",
      name: "Field Service Pro",
      description: "Complete field service management solution",
      category: "operations",
      icon: Wrench,
      rating: 4.8,
      downloads: "3,400+",
      price: "$39/month",
      status: "available",
      features: ["Work order management", "Technician scheduling", "Parts inventory", "Customer portal"],
      developer: "FieldTech"
    },
    {
      id: "website-builder",
      name: "Website Builder",
      description: "Create professional websites with drag-and-drop builder",
      category: "web",
      icon: Globe,
      rating: 4.3,
      downloads: "6,700+",
      price: "$19/month",
      status: "available",
      features: ["Drag-and-drop editor", "Mobile responsive", "SEO optimization", "Custom domains"],
      developer: "WebBuilder Inc"
    }
  ];

  const categories = [
    { id: "all", label: "All Categories", count: mockIntegrations.length },
    { id: "accounting", label: "Accounting & Finance", count: mockIntegrations.filter(i => i.category === "accounting").length },
    { id: "marketing", label: "Marketing", count: mockIntegrations.filter(i => i.category === "marketing").length },
    { id: "operations", label: "Operations", count: mockIntegrations.filter(i => i.category === "operations").length },
    { id: "analytics", label: "Analytics", count: mockIntegrations.filter(i => i.category === "analytics").length },
    { id: "scheduling", label: "Scheduling", count: mockIntegrations.filter(i => i.category === "scheduling").length },
    { id: "crm", label: "CRM & Sales", count: mockIntegrations.filter(i => i.category === "crm").length },
    { id: "web", label: "Web & Design", count: mockIntegrations.filter(i => i.category === "web").length }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIntegrations(mockIntegrations);
      setFilteredIntegrations(mockIntegrations);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = integrations;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(integration => integration.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.features.some(feature => 
          feature.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredIntegrations(filtered);
  }, [integrations, selectedCategory, searchTerm]);

  const handleInstall = async (integrationId) => {
    console.log(`Installing integration: ${integrationId}`);
    // Simulate installation
    setIntegrations(prev => 
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: "installing" }
          : integration
      )
    );

    // Simulate async installation
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration =>
          integration.id === integrationId
            ? { ...integration, status: "installed" }
            : integration
        )
      );
    }, 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "installed":
        return <Badge variant="default" className="bg-success">Installed</Badge>;
      case "installing":
        return <Badge variant="outline" className="animate-pulse">Installing...</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  };

  const getStatusButton = (integration) => {
    switch (integration.status) {
      case "installed":
        return (
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Configure
          </Button>
        );
      case "installing":
        return (
          <Button disabled size="sm" className="w-full">
            Installing...
          </Button>
        );
      default:
        return (
          <Button 
            onClick={() => handleInstall(integration.id)}
            size="sm" 
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Search Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Category Skeleton */}
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>

        {/* Integration Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.label}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredIntegrations.length} integration{filteredIntegrations.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map(integration => {
          const IconComponent = integration.icon;
          
          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">by {integration.developer}</p>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">
                  {integration.description}
                </CardDescription>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-warning" />
                    <span>{integration.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{integration.downloads}</span>
                  </div>
                  <div className="font-medium text-foreground">
                    {integration.price}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {integration.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{integration.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {getStatusButton(integration)}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No integrations found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or category filters
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

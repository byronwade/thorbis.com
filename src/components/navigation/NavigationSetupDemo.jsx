/**
 * Navigation Setup Demo
 * Interactive demo for business owners to configure their smart navigation
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@components/ui/tabs";
import {
  Settings,
  Wrench,
  Users,
  BarChart3,
  Calendar,
  Receipt,
  MessageSquare,
  Truck,
  Crown,
  CheckCircle2,
  Lightbulb,
  Zap,
  Target,
  Play
} from "lucide-react";

import { SmartNavigationResolver, NavigationUtils } from "@/lib/navigation/resolver";
import { INDUSTRY_PRESETS, USER_ROLES } from "@/config/navigation/industry-presets";

export default function NavigationSetupDemo() {
  const [selectedIndustry, setSelectedIndustry] = useState("field-service");
  const [selectedRole, setSelectedRole] = useState("OWNER");
  const [navigation, setNavigation] = useState(null);
  const [resolver, setResolver] = useState(null);
  
  const demoBusinessId = "demo_business_001";
  const demoUserId = "demo_user_001";

  // Initialize resolver when industry changes
  useEffect(() => {
    const newResolver = new SmartNavigationResolver(demoBusinessId);
    
    // Set up demo business with selected industry
    newResolver.updateBusinessConfig({
      industryPreset: selectedIndustry,
      enabledModules: INDUSTRY_PRESETS[selectedIndustry].modules,
      pinnedModules: {},
      smartRecommendations: true
    });
    
    setResolver(newResolver);
  }, [selectedIndustry, demoBusinessId]);

  // Load navigation when resolver or role changes
  useEffect(() => {
    if (resolver) {
      loadNavigation();
    }
  }, [resolver, selectedRole]);

  const loadNavigation = async () => {
    if (!resolver) return;
    
    try {
      const resolved = resolver.resolveNavigation(demoUserId, selectedRole, {
        maxHeaderItems: 7,
        includeUsageStats: true
      });
      setNavigation(resolved);
    } catch (error) {
      console.error("Failed to load navigation:", error);
    }
  };

  const handleTogglePin = async (moduleId, currentlyPinned) => {
    if (!resolver) return;
    
    try {
      await resolver.toggleModulePin(selectedRole, moduleId, !currentlyPinned);
      await loadNavigation();
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const industryOptions = NavigationUtils.getIndustryOptions();
  const roleOptions = NavigationUtils.getRoleOptions();
  const selectedIndustryData = INDUSTRY_PRESETS[selectedIndustry];
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Smart Navigation Setup</h1>
            <p className="text-muted-foreground">
              Configure your business navigation with intelligent defaults
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="outline" className="text-sm">
            <Lightbulb className="w-4 h-4 mr-2" />
            Industry Presets
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Zap className="w-4 h-4 mr-2" />
            Usage Tracking
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Target className="w-4 h-4 mr-2" />
            Role-Based
          </Badge>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Business Type
            </CardTitle>
            <CardDescription>
              Select your industry to get smart navigation defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-3">
                      <option.icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.moduleCount} modules
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedIndustryData && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">{selectedIndustryData.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedIndustryData.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedIndustryData.pinnedModules.slice(0, 6).map((moduleId) => (
                    <Badge key={moduleId} variant="secondary" className="text-xs">
                      {moduleId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Role
            </CardTitle>
            <CardDescription>
              See how navigation changes based on user permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{option.label}</span>
                      {option.canManageNavigation && (
                        <Crown className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{USER_ROLES[selectedRole]?.label}</span>
                <Badge variant="secondary">
                  Level {USER_ROLES[selectedRole]?.level}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {USER_ROLES[selectedRole]?.canManageNavigation && (
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                    Can Customize
                  </div>
                )}
                {USER_ROLES[selectedRole]?.canAccessAllModules && (
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                    Full Access
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Preview */}
      {navigation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Navigation Preview
            </CardTitle>
            <CardDescription>
              Live preview of your smart navigation system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="header" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="header">Header Navigation</TabsTrigger>
                <TabsTrigger value="launcher">App Launcher</TabsTrigger>
                <TabsTrigger value="stats">Usage Stats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="header" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Primary Navigation Bar</h3>
                  <Badge variant="outline">
                    {navigation.header.length} / 7 items
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {navigation.header.map((module, index) => (
                    <NavigationModuleCard
                      key={module.id}
                      module={module}
                      index={index + 1}
                      canCustomize={navigation.config.canManageNavigation}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="launcher" className="space-y-6">
                {Object.entries(navigation.appLauncher).map(([category, modules]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{category}</h3>
                      <Badge variant="secondary">{modules.length} modules</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modules.map((module) => (
                        <NavigationModuleCard
                          key={module.id}
                          module={module}
                          isInLauncher={true}
                          canCustomize={navigation.config.canManageNavigation}
                          onTogglePin={handleTogglePin}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {navigation.stats.totalModules}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Available Modules
                      </div>
                    </div>
                    
                    <div className="p-6 bg-green-500/5 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {navigation.stats.headerItems}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quick Access
                      </div>
                    </div>
                    
                    <div className="p-6 bg-blue-500/5 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {navigation.stats.appLauncherItems}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        In App Launcher
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>✅ Industry preset: <strong>{selectedIndustryData?.name}</strong></p>
                    <p>✅ Role-based filtering: <strong>{USER_ROLES[selectedRole]?.label}</strong></p>
                    <p>✅ Smart recommendations: <strong>Enabled</strong></p>
                    <p>✅ Usage tracking: <strong>Active</strong></p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Ready to Get Started?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your smart navigation system is configured and ready to adapt to your team's workflow. 
            The system will learn from usage patterns and provide intelligent recommendations.
          </p>
          <Button size="lg" className="mt-4">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Apply Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Navigation Module Card Component
 */
function NavigationModuleCard({ 
  module, 
  index, 
  isInLauncher = false, 
  canCustomize, 
  onTogglePin 
}) {
  const Icon = module.icon;
  
  const reasonLabels = {
    'pinned': 'Pinned',
    'frequently-used': 'Popular',
    'industry-default': 'Recommended', 
    'core-module': 'Core'
  };
  
  const reasonColors = {
    'pinned': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'frequently-used': 'bg-green-500/10 text-green-600 border-green-500/20',
    'industry-default': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'core-module': 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  };
  
  return (
    <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card">
      <div className="flex items-start space-x-3">
        {!isInLauncher && (
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
            {index}
          </div>
        )}
        
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{module.label}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {module.description}
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            {module.reason && (
              <Badge 
                variant="outline" 
                className={`text-xs ${reasonColors[module.reason] || 'bg-gray-500/10 text-gray-600'}`}
              >
                {reasonLabels[module.reason] || module.reason}
              </Badge>
            )}
            
            {module.usage && module.usage.recentAccesses > 0 && (
              <Badge variant="secondary" className="text-xs">
                {module.usage.recentAccesses} uses
              </Badge>
            )}
          </div>
          
          {canCustomize && (
            <div className="mt-3">
              <Button
                size="sm"
                variant={module.isPinned ? "default" : "outline"}
                onClick={() => onTogglePin(module.id, module.isPinned)}
                className="text-xs h-7"
              >
                {module.isPinned ? "Pinned" : "Pin to Header"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

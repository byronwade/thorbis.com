/**
 * Location Preferences Component
 * Allows users to customize their location settings and manage saved locations
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Switch } from '@components/ui/switch';
import { Slider } from '@components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import {
  Settings,
  MapPin,
  Star,
  Home,
  Building2,
  Heart,
  Trash2,
  Edit,
  Plus,
  Navigation,
  Globe,
  Clock,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useLocationStore, locationUtils } from '@lib/location/enhanced-location-service';
import { cn } from '@lib/utils';
import logger from '@lib/utils/logger';
import { toast } from 'sonner';

const LocationPreferences = ({ trigger, className = "" }) => {
  const {
    recentLocations,
    favoriteLocations,
    savedAddresses,
    preferences,
    updatePreferences,
    addToFavorites,
    removeFromFavorites,
    saveAddress,
    clearAllLocationData
  } = useLocationStore();

  // Component state
  const [isOpen, setIsOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressType, setNewAddressType] = useState('custom');

  // Handle preference updates
  const handlePreferenceUpdate = (key, value) => {
    updatePreferences({ [key]: value });
    toast.success('Preferences updated');
    
    logger.interaction({
      type: 'location_preference_updated',
      preference: key,
      value
    });
  };

  // Handle save address
  const handleSaveAddress = (location) => {
    if (!newAddressLabel.trim()) {
      toast.error('Please enter a label for this address');
      return;
    }

    saveAddress(location, newAddressLabel.trim(), newAddressType);
    setNewAddressLabel('');
    setNewAddressType('custom');
    toast.success('Address saved successfully');
  };

  // Handle remove favorite
  const handleRemoveFavorite = (location) => {
    removeFromFavorites(location);
    toast.success('Removed from favorites');
  };

  // Handle clear all data
  const handleClearAllData = () => {
    clearAllLocationData();
    toast.success('All location data cleared');
    setIsOpen(false);
  };

  // Format location display
  const formatLocationDisplay = (location) => {
    return locationUtils.formatLocationDisplay(location, { showFull: false });
  };

  // Get location type icon
  const getLocationTypeIcon = (type) => {
    switch (type) {
      case 'home':
        		return <Home className="w-4 h-4 text-primary" />;
      case 'work':
        		return <Building2 className="w-4 h-4 text-primary" />;
      case 'favorite':
        		return <Star className="w-4 h-4 text-muted-foreground" />;
      default:
        return <MapPin className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Render location item
  const LocationItem = ({ location, type = 'favorite', onRemove, onEdit }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border dark:border-border bg-gray-50 dark:bg-card">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {getLocationTypeIcon(type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground dark:text-white truncate">
            {location.customName || location.shortName || 'Unknown Location'}
          </p>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
            {formatLocationDisplay(location)}
          </p>
          {location.addedAt && (
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Added {new Date(location.addedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-1 flex-shrink-0">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => onEdit(location)}
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            					className="w-8 h-8 p-0 text-destructive hover:text-destructive/80"
            onClick={() => onRemove(location)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <Settings className="w-4 h-4 mr-2" />
            Location Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Location Preferences</span>
          </DialogTitle>
          <DialogDescription>
            Manage your location settings, saved addresses, and favorites
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preferences" className="flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="preferences">Settings</TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites 
              {favoriteLocations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {favoriteLocations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="addresses">
              Saved
              {savedAddresses.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {savedAddresses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-96 mt-4">
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoDetect">Auto-detect location</Label>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Automatically detect your current location when possible
                      </p>
                    </div>
                    <Switch
                      id="autoDetect"
                      checked={preferences.autoDetectLocation}
                      onCheckedChange={(checked) => 
                        handlePreferenceUpdate('autoDetectLocation', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="mapPreview">Show map preview</Label>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Display mini maps when selecting locations
                      </p>
                    </div>
                    <Switch
                      id="mapPreview"
                      checked={preferences.showMapPreview}
                      onCheckedChange={(checked) => 
                        handlePreferenceUpdate('showMapPreview', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="saveHistory">Save search history</Label>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                        Remember your recent location searches
                      </p>
                    </div>
                    <Switch
                      id="saveHistory"
                      checked={preferences.saveSearchHistory}
                      onCheckedChange={(checked) => 
                        handlePreferenceUpdate('saveSearchHistory', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Default search radius</Label>
                    <div className="px-2">
                      <Slider
                        value={[preferences.defaultRadius]}
                        onValueChange={([value]) => 
                          handlePreferenceUpdate('defaultRadius', value)
                        }
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {preferences.defaultRadius} km radius for nearby searches
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-4">
              {favoriteLocations.length > 0 ? (
                <div className="space-y-3">
                  {favoriteLocations.map((location, index) => (
                    <LocationItem
                      key={index}
                      location={location}
                      type="favorite"
                      onRemove={handleRemoveFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground dark:text-muted-foreground mb-4" />
                  <p className="text-muted-foreground dark:text-muted-foreground">No favorite locations yet</p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                    Add locations to favorites from search results
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Saved Addresses Tab */}
            <TabsContent value="addresses" className="space-y-4">
              {savedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {savedAddresses.map((address, index) => (
                    <LocationItem
                      key={index}
                      location={address}
                      type={address.type}
                      onEdit={setEditingAddress}
                      onRemove={(addr) => {
                        // Remove saved address logic here
                        toast.success('Address removed');
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 mx-auto text-muted-foreground dark:text-muted-foreground mb-4" />
                  <p className="text-muted-foreground dark:text-muted-foreground">No saved addresses</p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                    Save frequently used addresses for quick access
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Privacy & Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Location data</Label>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {recentLocations.length} recent locations stored locally
                        </p>
                      </div>
                      <Badge variant="outline">Local only</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Favorites & saved addresses</Label>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {favoriteLocations.length + savedAddresses.length} saved locations
                        </p>
                      </div>
                      <Badge variant="outline">Local only</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border dark:border-border">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All Location Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear all location data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all your recent locations, favorites, 
                            and saved addresses. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleClearAllData}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Clear All Data
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPreferences;

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';

import { useOfflineAppointments } from '@/lib/offline-appointment-manager';
import type { 
  TimeSlot,
  AvailabilityRequest,
  AppointmentLocation 
} from '@/lib/offline-appointment-manager';

interface AppointmentAvailabilityProps {
  onSlotSelected?: (slot: TimeSlot) => void;
  selectedDate?: Date;
  preSelectedDuration?: number;
  preSelectedStaff?: string[];
}

export default function AppointmentAvailability({
  onSlotSelected,
  selectedDate = new Date(),
  preSelectedDuration = 60,
  preSelectedStaff = []
}: AppointmentAvailabilityProps) {
  const [availabilityRequest, setAvailabilityRequest] = useState<AvailabilityRequest>({
    date: selectedDate,
    duration: preSelectedDuration,
    staffMembers: preSelectedStaff,
    location: 'office' as AppointmentLocation
  });

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableStaff] = useState(['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson']);

  const appointmentManager = useOfflineAppointments();

  useEffect(() => {
    loadAvailableSlots();
  }, [availabilityRequest]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    setError(null);

    try {
      const slots = await appointmentManager.getAvailableTimeSlots(availabilityRequest);
      setAvailableSlots(slots);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = (field: keyof AvailabilityRequest, value: unknown) => {
    setAvailabilityRequest(prev => ({
      ...prev,
      [field]: value
    }));
    setSelectedSlot(null);
  };

  const handleStaffToggle = (staff: string) => {
    const currentStaff = availabilityRequest.staffMembers || [];
    const newStaff = currentStaff.includes(staff)
      ? currentStaff.filter(s => s !== staff)
      : [...currentStaff, staff];
    
    handleRequestChange('staffMembers', newStaff);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSlotSelected?.(slot);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getSlotStatusIcon = (slot: TimeSlot) => {
    if (slot.available) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getSlotStatusColor = (slot: TimeSlot) => {
    if (slot.available) {
      return 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30';
    } else {
      return 'bg-red-500/20 text-red-400 border-red-500/30 cursor-not-allowed';
    }
  };

  const getLocationIcon = (location: AppointmentLocation) => {
    switch (location) {
      case 'office': return '🏢';
      case 'on_site': return '🏠';
      case 'virtual': return '💻';
      case 'customer_location': return '📍';
      case 'third_party': return '🏢';
      default: return '📍';
    }
  };

  const availableSlotsCount = availableSlots.filter(slot => slot.available).length;
  const unavailableSlotsCount = availableSlots.filter(slot => !slot.available).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Check Availability</h2>
          <p className="text-neutral-400">Find available appointment slots</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={loadAvailableSlots} 
          disabled={loading}
        >
          <RefreshCw className={'h-4 w-4 mr-2 ${loading ? 'animate-spin' : '}'} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Criteria */}
        <div className="space-y-6">
          {/* Date and Duration */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date" className="text-neutral-400">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={availabilityRequest.date.toISOString().split('T')[0]}
                  onChange={(e) => handleRequestChange('date', new Date(e.target.value))}
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-neutral-400">Duration (minutes)</Label>
                <Select 
                  value={availabilityRequest.duration.toString()} 
                  onValueChange={(value) => handleRequestChange('duration', parseInt(value))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={availabilityRequest.location} 
                onValueChange={(value) => handleRequestChange('location', value)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">{getLocationIcon('office')} Office</SelectItem>
                  <SelectItem value="on_site">{getLocationIcon('on_site')} On-site</SelectItem>
                  <SelectItem value="virtual">{getLocationIcon('virtual')} Virtual</SelectItem>
                  <SelectItem value="customer_location">{getLocationIcon('customer_location')} Customer Location</SelectItem>
                  <SelectItem value="third_party">{getLocationIcon('third_party')} Third Party</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Staff Selection */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableStaff.map(staff => (
                  <div 
                    key={staff} 
                    className={'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      availabilityRequest.staffMembers?.includes(staff) 
                        ? 'bg-blue-500/20 border border-blue-500/30' 
                        : 'bg-neutral-800 hover:bg-neutral-700'
                    }'}
                    onClick={() => handleStaffToggle(staff)}
                  >
                    <span className="text-white text-sm">{staff}</span>
                    {availabilityRequest.staffMembers?.includes(staff) && (
                      <CheckCircle className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                ))}
              </div>
              
              {(!availabilityRequest.staffMembers || availabilityRequest.staffMembers.length === 0) && (
                <p className="text-neutral-400 text-sm text-center py-2">
                  Select staff members to check availability
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Availability Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Available Slots:</span>
                <span className="text-green-400 font-medium">{availableSlotsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Unavailable:</span>
                <span className="text-red-400 font-medium">{unavailableSlotsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Slots:</span>
                <span className="text-white font-medium">{availableSlots.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Slots */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Time Slots
                <Badge variant="outline" className="ml-auto">
                  {availabilityRequest.date.toLocaleDateString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">No time slots found</p>
                  <p className="text-neutral-500 text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSlots.map((slot, index) => (
                    <Card
                      key={index}
                      className={'cursor-pointer transition-all ${
                        slot.available 
                          ? selectedSlot === slot
                            ? 'bg-blue-500/30 border-blue-500/50'
                            : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                          : 'bg-neutral-800/50 border-neutral-700 cursor-not-allowed opacity-60'
                      }'}
                      onClick={() => slot.available && handleSlotSelect(slot)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSlotStatusIcon(slot)}
                            <span className="text-white text-sm font-medium">
                              {formatTime(slot.start)} - {formatTime(slot.end)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          {slot.staffMember && (
                            <div className="flex items-center gap-1 text-neutral-400">
                              <User className="h-3 w-3" />
                              <span>{slot.staffMember}</span>
                            </div>
                          )}
                          
                          {slot.location && (
                            <div className="flex items-center gap-1 text-neutral-400">
                              <MapPin className="h-3 w-3" />
                              <span>{slot.location}</span>
                            </div>
                          )}
                          
                          {!slot.available && slot.reason && (
                            <div className="flex items-center gap-1 text-red-400">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{slot.reason}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Slot Info */}
          {selectedSlot && (
            <Card className="bg-neutral-900 border-neutral-800 mt-4">
              <CardHeader>
                <CardTitle className="text-white text-base">Selected Time Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <span className="text-white">
                      {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className="text-white">
                      {availabilityRequest.date.toLocaleDateString()}
                    </span>
                  </div>
                  
                  {selectedSlot.staffMember && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-neutral-400" />
                      <span className="text-white">{selectedSlot.staffMember}</span>
                    </div>
                  )}
                  
                  {selectedSlot.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-neutral-400" />
                      <span className="text-white">{selectedSlot.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
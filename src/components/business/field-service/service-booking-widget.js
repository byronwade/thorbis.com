'use client';

import { useState } from 'react';
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Calendar } from "@components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Calendar as CalendarIcon, MapPin, Phone, Star, CheckCircle, Shield } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@utils";

/**
 * ServiceBookingWidget - Unified booking component for Thorbis platform
 * Enables customers to book services directly from business profiles
 * Integrates with business scheduling and field service management
 */
export default function ServiceBookingWidget({ 
  business,
  onBookingRequest,
  availableSlots = [],
  className 
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [bookingStep, setBookingStep] = useState('service'); // service, schedule, details, confirm
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceTypes = [
    { value: 'consultation', label: 'Free Consultation', price: 'Free', duration: '30 min' },
    { value: 'estimate', label: 'On-site Estimate', price: '$50', duration: '45 min' },
    { value: 'repair', label: 'Repair Service', price: 'Variable', duration: '1-3 hours' },
    { value: 'installation', label: 'Installation', price: 'Quote Required', duration: '2-6 hours' },
    { value: 'maintenance', label: 'Maintenance Visit', price: '$120/hr', duration: '1-2 hours' },
    { value: 'emergency', label: '24/7 Emergency Service', price: '$150/hr', duration: 'ASAP' }
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
    '4:00 PM', '5:00 PM'
  ];

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    
    try {
      const bookingData = {
        businessId: business.id,
        serviceType,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        description,
        customerInfo,
        estimatedDuration: serviceTypes.find(s => s.value === serviceType)?.duration,
        estimatedPrice: serviceTypes.find(s => s.value === serviceType)?.price
      };

      await onBookingRequest(bookingData);
      setBookingStep('confirm');
    } catch (error) {
      console.error('Booking submission failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderServiceSelection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Service Type</h3>
        <div className="grid gap-3">
          {serviceTypes.map((service) => (
            <Card 
              key={service.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                serviceType === service.value && "ring-2 ring-primary"
              )}
              onClick={() => setServiceType(service.value)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{service.label}</h4>
                    <p className="text-sm text-muted-foreground">{service.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{service.price}</p>
                    {service.value === 'emergency' && (
                      <Badge variant="destructive" className="text-xs">24/7</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Button 
        className="w-full" 
        onClick={() => setBookingStep('schedule')}
        disabled={!serviceType}
      >
        Continue to Scheduling
      </Button>
    </div>
  );

  const renderScheduleSelection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Choose Date & Time</h3>
        
        {/* Date Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Preferred Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                  date < new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Available Times</label>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTime(time)}
                className="text-sm"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setBookingStep('service')}
        >
          Back
        </Button>
        <Button 
          className="flex-1" 
          onClick={() => setBookingStep('details')}
          disabled={!selectedDate || !selectedTime}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderCustomerDetails = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Your Information</h3>
        
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full Name *</label>
            <Input
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Phone *</label>
              <Input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <Input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Service Address *</label>
            <Input
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Street address where service is needed"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Service Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need help with..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setBookingStep('schedule')}
        >
          Back
        </Button>
        <Button 
          className="flex-1" 
          onClick={handleSubmitBooking}
          disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.email || !customerInfo.address || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Book Service'}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="w-16 h-16 text-success mx-auto" />
      <div>
        <h3 className="text-lg font-semibold">Booking Request Submitted!</h3>
        <p className="text-muted-foreground">
          {business.name} will contact you within 2 hours to confirm your appointment.
        </p>
      </div>
      
      <Card className="text-left">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Service:</span>
            <span className="text-sm font-medium">
              {serviceTypes.find(s => s.value === serviceType)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Date:</span>
            <span className="text-sm font-medium">
              {selectedDate ? format(selectedDate, "PPP") : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Time:</span>
            <span className="text-sm font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Contact:</span>
            <span className="text-sm font-medium">{customerInfo.phone}</span>
          </div>
        </CardContent>
      </Card>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          setBookingStep('service');
          setSelectedDate(null);
          setSelectedTime('');
          setServiceType('');
          setDescription('');
          setCustomerInfo({ name: '', phone: '', email: '', address: '' });
        }}
      >
        Book Another Service
      </Button>
    </div>
  );

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Book Service</CardTitle>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-warning" />
            <span className="text-sm font-medium">{business.rating}</span>
          </div>
        </div>
        
        {/* Business Info */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{business.city}, {business.state}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{business.phone}</span>
          </div>
          {business.verified && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Shield className="w-4 h-4" />
              <span>Verified Business</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {bookingStep === 'service' && renderServiceSelection()}
        {bookingStep === 'schedule' && renderScheduleSelection()}
        {bookingStep === 'details' && renderCustomerDetails()}
        {bookingStep === 'confirm' && renderConfirmation()}
      </CardContent>
    </Card>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell,
  Plus,
  Minus,
  Edit,
  Trash2,
  Send,
  Clock,
  Mail,
  Phone,
  Smartphone,
  Calendar,
  User,
  Users,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

import type { 
  AppointmentMetadata,
  AppointmentReminder
} from '@/lib/offline-appointment-manager';

interface AppointmentRemindersProps {
  appointment: AppointmentMetadata;
  onUpdate: (reminders: AppointmentReminder[]) => void;
  readOnly?: boolean;
}

export default function AppointmentReminders({
  appointment,
  onUpdate,
  readOnly = false
}: AppointmentRemindersProps) {
  const [reminders, setReminders] = useState<AppointmentReminder[]>(appointment.reminders || []);
  const [isEditing, setIsEditing] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<AppointmentReminder>>({
    type: 'email',
    minutesBefore: 60,
    recipientType: 'customer',
    message: '
  });

  useEffect(() => {
    setReminders(appointment.reminders || []);
  }, [appointment.reminders]);

  const handleAddReminder = () => {
    if (!newReminder.type || !newReminder.minutesBefore || !newReminder.recipientType) return;

    const reminder: AppointmentReminder = {
      id: 'reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      type: newReminder.type as 'email' | 'sms' | 'push' | 'calendar',
      minutesBefore: newReminder.minutesBefore,
      sent: false,
      recipientType: newReminder.recipientType as 'customer' | 'staff' | 'both',
      message: newReminder.message || getDefaultMessage(newReminder.type as any, appointment)
    };

    const updatedReminders = [...reminders, reminder];
    setReminders(updatedReminders);
    onUpdate(updatedReminders);

    // Reset form
    setNewReminder({
      type: 'email',
      minutesBefore: 60,
      recipientType: 'customer',
      message: '
    });
  };

  const handleUpdateReminder = (id: string, updates: Partial<AppointmentReminder>) => {
    const updatedReminders = reminders.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    );
    setReminders(updatedReminders);
    onUpdate(updatedReminders);
  };

  const handleDeleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    onUpdate(updatedReminders);
  };

  const handleTestReminder = async (reminder: AppointmentReminder) => {
    // Implementation would send a test reminder
    console.log('Sending test reminder:', reminder);
    // For now, just mark as sent temporarily
    handleUpdateReminder(reminder.id, { sent: true, sentAt: new Date() });
    
    // Reset after 3 seconds
    setTimeout(() => {
      handleUpdateReminder(reminder.id, { sent: false, sentAt: undefined });
    }, 3000);
  };

  const getDefaultMessage = (type: 'email' | 'sms' | 'push' | 'calendar', appointment: AppointmentMetadata): string => {
    const appointmentTime = appointment.startTime.toLocaleString();
    const customerName = appointment.customerName;
    
    switch (type) {
      case 'email':
        return 'Hi ${customerName}, this is a reminder that you have an appointment scheduled for ${appointmentTime}. Please arrive 10 minutes early. If you need to reschedule, please contact us as soon as possible.';
      case 'sms':
        return 'Reminder: Appointment on ${appointmentTime}. Please arrive 10 minutes early. Reply CANCEL to reschedule.';
      case 'push':
        return 'Upcoming appointment: ${appointment.title} at ${appointmentTime}';
      case 'calendar`:
        return `Appointment: ${appointment.title}';
      default:
        return 'Reminder: ${appointment.title} scheduled for ${appointmentTime}';
    }
  };

  const getReminderTypeIcon = (type: AppointmentReminder['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getReminderTypeColor = (type: AppointmentReminder['type']) => {
    switch (type) {
      case 'email': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sms': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'push': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'calendar': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getRecipientIcon = (recipientType: AppointmentReminder['recipientType']) => {
    switch (recipientType) {
      case 'customer': return <User className="h-4 w-4" />;
      case 'staff': return <Users className="h-4 w-4" />;
      case 'both': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatTimeBefore = (minutes: number): string => {
    if (minutes < 60) {
      return '${minutes} minute${minutes !== 1 ? 's' : '} before';
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return '${hours} hour${hours !== 1 ? 's' : '} before';
    } else {
      const days = Math.floor(minutes / 1440);
      return '${days} day${days !== 1 ? 's' : '} before';
    }
  };

  const getScheduledTime = (reminder: AppointmentReminder): Date => {
    return new Date(appointment.startTime.getTime() - reminder.minutesBefore * 60000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Appointment Reminders</h3>
          <p className="text-neutral-400">Manage automated reminders for this appointment</p>
        </div>
        
        {!readOnly && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Done' : 'Edit'}
            </Button>
          </div>
        )}
      </div>

      {/* Existing Reminders */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Reminders
            <Badge variant="outline" className="ml-auto">
              {reminders.length} reminder{reminders.length !== 1 ? 's' : '}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">No reminders configured</p>
              <p className="text-neutral-500 text-sm">Add reminders to notify participants</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <Card key={reminder.id} className="bg-neutral-800 border-neutral-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Reminder Type and Status */}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getReminderTypeColor(reminder.type)}>
                            {getReminderTypeIcon(reminder.type)}
                            <span className="ml-1 capitalize">{reminder.type}</span>
                          </Badge>
                          
                          <Badge variant="outline" className="text-xs">
                            {getRecipientIcon(reminder.recipientType)}
                            <span className="ml-1 capitalize">{reminder.recipientType}</span>
                          </Badge>
                          
                          {reminder.sent && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sent
                            </Badge>
                          )}
                        </div>

                        {/* Timing */}
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeBefore(reminder.minutesBefore)}</span>
                          </div>
                          <div>
                            Scheduled: {getScheduledTime(reminder).toLocaleString()}
                          </div>
                        </div>

                        {/* Message Preview */}
                        {reminder.message && (
                          <div className="bg-neutral-900 rounded-lg p-3">
                            <p className="text-neutral-300 text-sm line-clamp-2">
                              {reminder.message}
                            </p>
                          </div>
                        )}

                        {/* Sent Info */}
                        {reminder.sent && reminder.sentAt && (
                          <div className="text-xs text-green-400">
                            Sent on {reminder.sentAt.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!readOnly && (
                        <div className="flex gap-1 ml-4">
                          {!reminder.sent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestReminder(reminder)}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {isEditing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReminder(reminder.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
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

      {/* Add New Reminder */}
      {!readOnly && isEditing && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Reminder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Reminder Type */}
              <div>
                <Label htmlFor="reminderType" className="text-neutral-400">Type</Label>
                <Select 
                  value={newReminder.type} 
                  onValueChange={(value) => setNewReminder(prev => ({ 
                    ...prev, 
                    type: value as any,
                    message: value ? getDefaultMessage(value as any, appointment) : '
                  }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="push">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Push
                      </div>
                    </SelectItem>
                    <SelectItem value="calendar">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Calendar
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Before */}
              <div>
                <Label htmlFor="minutesBefore" className="text-neutral-400">Send Before</Label>
                <Select 
                  value={newReminder.minutesBefore?.toString()} 
                  onValueChange={(value) => setNewReminder(prev => ({ ...prev, minutesBefore: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                    <SelectItem value="1440">1 day</SelectItem>
                    <SelectItem value="2880">2 days</SelectItem>
                    <SelectItem value="4320">3 days</SelectItem>
                    <SelectItem value="10080">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient */}
              <div>
                <Label htmlFor="recipientType" className="text-neutral-400">Recipient</Label>
                <Select 
                  value={newReminder.recipientType} 
                  onValueChange={(value) => setNewReminder(prev => ({ ...prev, recipientType: value as any }))}
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </div>
                    </SelectItem>
                    <SelectItem value="staff">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Staff
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Both
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <Label htmlFor="message" className="text-neutral-400">Message</Label>
              <Textarea
                id="message"
                value={newReminder.message || ''}
                onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Custom reminder message..."
                className="bg-neutral-800 border-neutral-700"
                rows={3}
              />
              <p className="text-neutral-500 text-xs mt-1">
                Leave empty to use default message for {newReminder.type} reminders
              </p>
            </div>

            {/* Scheduled Time Preview */}
            {newReminder.minutesBefore && (
              <div className="bg-neutral-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-400">Will be sent:</span>
                  <span className="text-white">
                    {new Date(appointment.startTime.getTime() - newReminder.minutesBefore * 60000).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Add Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleAddReminder}
                disabled={!newReminder.type || !newReminder.minutesBefore || !newReminder.recipientType}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Reminder Suggestions */}
      {!readOnly && isEditing && reminders.length === 0 && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Suggested Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'email', minutes: 1440, recipient: 'customer', label: '1 day before (Email)' },
                { type: 'sms', minutes: 60, recipient: 'customer', label: '1 hour before (SMS)' },
                { type: 'push', minutes: 15, recipient: 'customer', label: '15 minutes before (Push)' },
                { type: 'email', minutes: 240, recipient: 'staff', label: '4 hours before (Staff Email)' }
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => {
                    setNewReminder({
                      type: suggestion.type as any,
                      minutesBefore: suggestion.minutes,
                      recipientType: suggestion.recipient as any,
                      message: getDefaultMessage(suggestion.type as any, appointment)
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getReminderTypeIcon(suggestion.type as any)}
                    <span>{suggestion.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
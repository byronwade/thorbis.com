"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useVoipGlobal } from '@context/voip-global-context';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Users, MessageSquare, Settings, BarChart3, 
  Clock, PhoneCall, Headphones, UserCheck,
  Shield, Zap, Brain, Play, Pause, X, Minimize2,
  ClipboardList, History, Copy, ChevronUp,
  Calendar, DollarSign, FileText, Wrench
} from 'lucide-react';
import { useToast } from '@hooks/use-toast';

// Utility functions
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatCurrency(n) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

// Quick Actions Widget
function QuickActionsWidget({ onAction }) {
  const actions = [
    { id: 'schedule', label: 'Schedule Callback', icon: Calendar, color: 'blue' },
    { id: 'ticket', label: 'Create Ticket', icon: FileText, color: 'green' },
    { id: 'quote', label: 'Generate Quote', icon: DollarSign, color: 'purple' },
    { id: 'dispatch', label: 'Dispatch Tech', icon: Wrench, color: 'orange' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto py-3 px-2 flex flex-col items-center space-y-1"
                onClick={() => onAction?.(action.id)}
              >
                <Icon className={`w-5 h-5 text-${action.color}-600`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Intake Form
function CustomerIntakeForm({ callData, onUpdate }) {
  const [formData, setFormData] = useState({
    name: callData?.name || '',
    company: callData?.company || '',
    phone: callData?.number || '',
    email: '',
    issue: '',
    priority: 'medium',
    notes: ''
  });

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate?.(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="issue">Issue Description</Label>
          <Textarea
            id="issue"
            value={formData.issue}
            onChange={(e) => handleChange('issue', e.target.value)}
            placeholder="Describe the customer's issue or request..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional notes or context..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Live Transcript Component
function LiveTranscript() {
  const [transcript, setTranscript] = useState([]);
  const [streamText, setStreamText] = useState('');
  const transcriptRef = useRef(null);
  const { toast } = useToast();

  // Demo transcript simulation
  const demoLines = useMemo(() => [
    "Thanks for picking up — SmartGate shows error 0x2F.",
    "This is Mr. Clark — we tried rebooting from the panel but no change.",
    "No recent wiring changes; last service was last week.",
    "We need this open by 2 PM shift change. Reach me at +1 (415) 555-0117.",
    "Site A12 access code is 0407. Also Mrs. Daniela may be onsite.",
  ], []);

  useEffect(() => {
    let i = 0, j = 0;
    let ti = null, to = null;
    
    function typeNext() {
      const text = demoLines[i % demoLines.length];
      j = 0;
      setStreamText('');
      ti = setInterval(() => {
        j++;
        setStreamText(text.slice(0, j));
        if (j >= text.length) {
          clearInterval(ti);
          setTranscript(prev => [...prev, text]);
          setStreamText('');
          i++;
          to = setTimeout(typeNext, 2000);
        }
      }, 50);
    }
    
    typeNext();
    return () => {
      ti && clearInterval(ti);
      to && clearTimeout(to);
    };
  }, [demoLines]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, streamText]);

  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript.join('\n'));
      toast({ title: 'Copied', description: 'Transcript copied to clipboard' });
    } catch (error) {
      console.error('Failed to copy transcript:', error);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Live Transcript
          </CardTitle>
          <Button variant="outline" size="sm" onClick={copyTranscript}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={transcriptRef}
          className="h-64 overflow-y-auto rounded-md border bg-muted/50 p-4 text-sm"
        >
          {transcript.length === 0 && streamText.length === 0 ? (
            <div className="text-muted-foreground">Live transcript will appear here...</div>
          ) : (
            <div className="space-y-2">
              {transcript.map((line, i) => (
                <div key={i} className="leading-relaxed">
                  • {line}
                </div>
              ))}
              {streamText.length > 0 && (
                <div className="leading-relaxed">
                  • {streamText}
                  <span className="ml-1 inline-block h-4 w-[2px] bg-primary animate-pulse" />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main VoIP Global Overlay Component
export default function VoipGlobalOverlay() {
  const { 
    showCallIntake, 
    callData, 
    callDuration, 
    isCallActive,
    endCall, 
    closeCallIntake 
  } = useVoipGlobal();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('intake');
  const [customerData, setCustomerData] = useState({});
  const [showEndCallDialog, setShowEndCallDialog] = useState(false);
  const [callControls, setCallControls] = useState({
    muted: false,
    speaker: true,
    recording: false,
    hold: false
  });

  const handleQuickAction = useCallback((actionId) => {
    toast({ 
      title: 'Action Triggered', 
      description: `${actionId} action has been initiated` 
    });
  }, [toast]);

  const handleEndCall = useCallback(() => {
    setShowEndCallDialog(false);
    endCall();
    toast({ 
      title: 'Call Ended', 
      description: 'Call has been successfully ended' 
    });
  }, [endCall, toast]);

  const toggleCallControl = useCallback((control) => {
    setCallControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
    
    const messages = {
      muted: prev => prev.muted ? 'Microphone unmuted' : 'Microphone muted',
      speaker: prev => prev.speaker ? 'Speaker off' : 'Speaker on',
      recording: prev => prev.recording ? 'Recording stopped' : 'Recording started',
      hold: prev => prev.hold ? 'Call resumed' : 'Call on hold'
    };
    
    toast({ title: messages[control](callControls) });
  }, [callControls, toast]);

  if (!showCallIntake || !callData) {
    return null;
  }

  return (
    <Dialog open={showCallIntake} onOpenChange={() => {}}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 gap-0">
        {/* Header with call controls */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={callData.avatarUrl} />
              <AvatarFallback>{callData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{callData.name}</h3>
              <p className="text-sm text-muted-foreground">{callData.company}</p>
            </div>
            <Badge variant="outline" className="text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              {formatDuration(callDuration)}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {/* Call Controls */}
            <Button
              variant={callControls.muted ? "destructive" : "outline"}
              size="sm"
              onClick={() => toggleCallControl('muted')}
            >
              {callControls.muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button
              variant={callControls.speaker ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCallControl('speaker')}
            >
              {callControls.speaker ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            
            <Button
              variant={callControls.recording ? "destructive" : "outline"}
              size="sm"
              onClick={() => toggleCallControl('recording')}
            >
              {callControls.recording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant={callControls.hold ? "secondary" : "outline"}
              size="sm"
              onClick={() => toggleCallControl('hold')}
            >
              <Clock className="w-4 h-4" />
            </Button>

            {/* Window Controls */}
            <Button variant="outline" size="sm" onClick={closeCallIntake}>
              <Minimize2 className="w-4 h-4" />
            </Button>
            
            <Button variant="destructive" size="sm" onClick={() => setShowEndCallDialog(true)}>
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
              <TabsTrigger value="intake">Customer Intake</TabsTrigger>
              <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
              <TabsTrigger value="history">Customer History</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden p-4">
              <TabsContent value="intake" className="h-full m-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <CustomerIntakeForm 
                    callData={callData} 
                    onUpdate={setCustomerData}
                  />
                  <LiveTranscript />
                </div>
              </TabsContent>

              <TabsContent value="transcript" className="h-full m-0">
                <LiveTranscript />
              </TabsContent>

              <TabsContent value="actions" className="h-full m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <QuickActionsWidget onAction={handleQuickAction} />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Call Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Call Quality</span>
                        <Badge variant="outline" className="text-green-600">Excellent</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Sentiment</span>
                        <Badge variant="outline" className="text-blue-600">Positive</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Keywords</span>
                        <span className="text-sm">Emergency, Repair</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Team Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">3 agents available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">2 supervisors online</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">1 specialist ready</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history" className="h-full m-0">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Customer History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-blue-500 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Previous Service Call</h4>
                            <p className="text-sm text-muted-foreground">SmartGate maintenance completed</p>
                          </div>
                          <span className="text-xs text-muted-foreground">2 weeks ago</span>
                        </div>
                      </div>
                      
                      <div className="border-l-2 border-green-500 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Payment Received</h4>
                            <p className="text-sm text-muted-foreground">{formatCurrency(1250)} for Invoice #INV-2024-001</p>
                          </div>
                          <span className="text-xs text-muted-foreground">3 weeks ago</span>
                        </div>
                      </div>
                      
                      <div className="border-l-2 border-purple-500 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Account Created</h4>
                            <p className="text-sm text-muted-foreground">Gold maintenance plan activated</p>
                          </div>
                          <span className="text-xs text-muted-foreground">6 months ago</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* End Call Confirmation Dialog */}
        <Dialog open={showEndCallDialog} onOpenChange={setShowEndCallDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End Call?</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to end the call with {callData.name}? 
              Any unsaved information will be lost.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEndCallDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleEndCall}>
                End Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

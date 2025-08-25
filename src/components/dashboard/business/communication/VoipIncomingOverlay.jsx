"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Pause, Play, Users, Brain, Circle, Heart, 
  UserPlus, MessageSquare, FileText, Settings,
  Shield, Zap, BarChart3, Clock, Send
} from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Progress } from "@components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function VoipIncomingOverlay({ 
  open = false, 
  onOpenChange = () => {},
  onAnswer = () => {},
  onDecline = () => {}
}) {
  const [controls, setControls] = useState({
    muted: false,
    speakerOn: false,
    recording: false,
    onHold: false,
    volume: 75,
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [callQuality, setCallQuality] = useState(85);
  const [networkLatency, setNetworkLatency] = useState(45);
  const [aiInsights, setAiInsights] = useState([]);
  const [contextualHints, setContextualHints] = useState("");

  const [showFeaturePanel, setShowFeaturePanel] = useState(false);
  const [activeFeature, setActiveFeature] = useState("intelligence");
  
  const [visible, setVisible] = useState(true);
  const [callState, setCallState] = useState("ringing");
  const [caller, setCaller] = useState({
    id: "12345",
    name: "Jordan Pierce",
    company: "ACME Field Services",
    phone: "+1 (415) 555-0117",
    avatar: "/caller-avatar.png",
    priority: "high",
    customerSince: "2019",
    lastCall: "2 weeks ago",
    satisfaction: 4.8
  });
  
  const [ringSeconds, setRingSeconds] = useState(0);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callNotes, setCallNotes] = useState("");

  // Mock transfer options
  const transferOptions = [
    { id: "dept-sales", name: "Sales Department", type: "department", available: true },
    { id: "dept-support", name: "Technical Support", type: "department", available: true },
    { id: "agent-john", name: "John Smith", type: "agent", status: "available", extension: "1234" },
    { id: "agent-sarah", name: "Sarah Johnson", type: "agent", status: "available", extension: "1235" },
  ];

  // Simulate call quality fluctuation
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setCallQuality((prev) => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setNetworkLatency((prev) => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 10)));
    }, 2000);

    return () => clearInterval(interval);
  }, [open]);

  // Ring timer
  useEffect(() => {
    if (callState === "ringing" && open) {
      const interval = setInterval(() => {
        setRingSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState, open]);

  // Call timer
  useEffect(() => {
    if (callState === "connected") {
      const interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  // Generate AI insights
  useEffect(() => {
    if (callState === "connected" && aiInsights.length === 0) {
      setTimeout(() => {
        setAiInsights([
          "Customer has high satisfaction score (4.8/5)",
          "Previous issue: Plumbing repair completed successfully", 
          "Recommended: Follow up on warranty coverage",
          "Priority customer - expedite requests"
        ]);
        setContextualHints("Customer calling about follow-up service. Last job was emergency plumbing repair.");
      }, 3000);
    }
  }, [callState, aiInsights.length]);

  const handleAnswer = () => {
    setIsAnimating(true);
    setCallState("connected");
    setRingSeconds(0);
    onAnswer();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDecline = () => {
    setVisible(false);
    setTimeout(() => {
      onDecline();
      resetCallState();
    }, 300);
  };

  const handleEndCall = () => {
    setVisible(false);
    setTimeout(() => {
      onOpenChange();
      resetCallState();
    }, 300);
  };

  const resetCallState = () => {
    setCallState("ringing");
    setCallSeconds(0);
    setRingSeconds(0);
    setAiInsights([]);
    setContextualHints("");
    setCallNotes("");
    setVisible(true);
  };

  const toggleControl = (control) => {
    setControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={cn(
        "fixed inset-4 lg:inset-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300",
        visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
        isAnimating && "animate-pulse"
      )}>
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                callState === "ringing" ? "bg-yellow-500" : 
                callState === "connected" ? "bg-green-500" : "bg-gray-400"
              )} />
              <span className="font-semibold text-lg">
                {callState === "ringing" ? "Incoming Call" : 
                 callState === "connected" ? "Connected" : "Call"}
              </span>
            </div>
            {callState === "connected" && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {formatDuration(callSeconds)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {callState === "connected" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeaturePanel(!showFeaturePanel)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Circle className={cn("w-2 h-2", callQuality > 80 ? "fill-green-500 text-green-500" : "fill-yellow-500 text-yellow-500")} />
                  <span>{callQuality}%</span>
                </div>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleDecline}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          {/* Main Call Interface */}
          <div className="flex-1 flex flex-col">
            {callState === "ringing" ? (
              /* Incoming Call View */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={caller.avatar} alt={caller.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {caller.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <h2 className="text-3xl font-bold mb-2">{caller.name}</h2>
                <p className="text-xl text-muted-foreground mb-1">{caller.company}</p>
                <p className="text-lg text-muted-foreground mb-6">{caller.phone}</p>

                {/* Caller Info Cards */}
                <div className="flex flex-wrap gap-3 mb-8 justify-center">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {caller.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Customer since {caller.customerSince}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    ⭐ {caller.satisfaction}/5.0
                  </Badge>
                </div>

                <div className="text-muted-foreground mb-8">
                  Ringing for {formatDuration(ringSeconds)}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-6">
                  <Button
                    onClick={handleDecline}
                    size="lg"
                    variant="destructive"
                    className="w-16 h-16 rounded-full p-0"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    onClick={handleAnswer}
                    size="lg"
                    className="w-16 h-16 rounded-full p-0 bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Connected Call View */
              <div className="flex-1 flex flex-col">
                {/* Caller Info Bar */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={caller.avatar} alt={caller.name} />
                      <AvatarFallback>{caller.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{caller.name}</h3>
                      <p className="text-sm text-muted-foreground">{caller.company} • {caller.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-mono text-lg font-semibold">{formatDuration(callSeconds)}</div>
                      <div className="text-xs text-muted-foreground">Call duration</div>
                    </div>
                    <Badge variant={caller.priority === "high" ? "destructive" : "secondary"}>
                      {caller.priority} priority
                    </Badge>
                  </div>
                </div>

                {/* AI Insights Panel */}
                {aiInsights.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-b">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">AI Insights</h4>
                        {contextualHints && (
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3 font-medium">
                            💡 {contextualHints}
                          </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {aiInsights.map((insight, index) => (
                            <div key={index} className="text-xs text-blue-700 dark:text-blue-300 bg-white/50 dark:bg-white/10 rounded px-2 py-1">
                              • {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Call Notes Area */}
                <div className="flex-1 p-6">
                  <div className="h-full">
                    <Label htmlFor="call-notes" className="text-sm font-medium">Call Notes</Label>
                    <Textarea
                      id="call-notes"
                      placeholder="Take notes during the call..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      className="mt-2 h-full resize-none"
                    />
                  </div>
                </div>

                {/* Call Controls Bar */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-center space-x-4">
                    {/* Mute Button */}
                    <Button
                      variant={controls.muted ? "destructive" : "outline"}
                      size="lg"
                      onClick={() => toggleControl('muted')}
                      className="w-12 h-12 rounded-full p-0"
                    >
                      {controls.muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>

                    {/* Speaker Button */}
                    <Button
                      variant={controls.speakerOn ? "default" : "outline"}
                      size="lg"
                      onClick={() => toggleControl('speakerOn')}
                      className="w-12 h-12 rounded-full p-0"
                    >
                      {controls.speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>

                    {/* Hold Button */}
                    <Button
                      variant={controls.onHold ? "secondary" : "outline"}
                      size="lg"
                      onClick={() => toggleControl('onHold')}
                      className="w-12 h-12 rounded-full p-0"
                    >
                      {controls.onHold ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>

                    {/* Record Button */}
                    <Button
                      variant={controls.recording ? "destructive" : "outline"}
                      size="lg"
                      onClick={() => toggleControl('recording')}
                      className="w-12 h-12 rounded-full p-0"
                    >
                      <Circle className={cn("w-5 h-5", controls.recording && "fill-current")} />
                    </Button>

                    {/* Transfer Button */}
                    <Button variant="outline" size="lg" className="px-4">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Transfer
                    </Button>

                    {/* End Call Button */}
                    <Button
                      onClick={handleEndCall}
                      variant="destructive"
                      size="lg"
                      className="w-12 h-12 rounded-full p-0 ml-8"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Circle className={cn("w-2 h-2", callQuality > 80 ? "fill-green-500 text-green-500" : "fill-yellow-500 text-yellow-500")} />
                      <span>Quality: {callQuality}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Circle className={cn("w-2 h-2", networkLatency < 50 ? "fill-green-500 text-green-500" : "fill-yellow-500 text-yellow-500")} />
                      <span>Latency: {networkLatency}ms</span>
                    </div>
                    {controls.recording && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <Circle className="w-2 h-2 fill-current animate-pulse" />
                        <span>Recording</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Features Side Panel */}
          {showFeaturePanel && callState === "connected" && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <Tabs value={activeFeature} onValueChange={setActiveFeature} className="h-full">
                <TabsList className="grid w-full grid-cols-3 m-4">
                  <TabsTrigger value="intelligence" className="text-xs">AI</TabsTrigger>
                  <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
                  <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
                </TabsList>
                
                <div className="p-4 h-[calc(100%-80px)] overflow-y-auto">
                  <TabsContent value="intelligence" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          Customer Intelligence
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Satisfaction Score</span>
                            <span className="font-semibold">{caller.satisfaction}/5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Customer Since</span>
                            <span>{caller.customerSince}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Contact</span>
                            <span>{caller.lastCall}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-xs">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                            <div className="font-medium">Emergency Plumbing Repair</div>
                            <div className="text-muted-foreground">Completed 2 weeks ago</div>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                            <div className="font-medium">Initial Consultation</div>
                            <div className="text-muted-foreground">3 months ago</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="team" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Available Agents
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {transferOptions.filter(opt => opt.type === "agent").map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                            <div>
                              <div className="font-medium">{agent.name}</div>
                              <div className="text-muted-foreground">Ext. {agent.extension}</div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {agent.status}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Departments</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {transferOptions.filter(opt => opt.type === "department").map((dept) => (
                          <div key={dept.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                            <span>{dept.name}</span>
                            <Badge variant={dept.available ? "secondary" : "outline"} className="text-xs">
                              {dept.available ? "Available" : "Busy"}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="data" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                          <Send className="w-3 h-3 mr-2" />
                          Send Follow-up Email
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                          <Clock className="w-3 h-3 mr-2" />
                          Schedule Callback
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                          <FileText className="w-3 h-3 mr-2" />
                          Create Ticket
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Call Analytics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Call Quality</span>
                            <span>{callQuality}%</span>
                          </div>
                          <Progress value={callQuality} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Network Latency</span>
                            <span>{networkLatency}ms</span>
                          </div>
                          <Progress value={100 - networkLatency} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
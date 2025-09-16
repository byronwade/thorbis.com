"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Monitor,
  MousePointer,
  Eye,
  Target,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Bell,
  Search,
  Plus,
  Home,
  MapPin,
  DollarSign,
  Clock,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface LearningStep {
  id: number;
  type: 'tour' | 'interaction' | 'challenge' | 'validation';
  title: string;
  instruction: string;
  target?: string;
  expectedAction?: string;
  feedback?: {
    success: string;
    error: string;
  };
  tooltip?: {
    position: { x: number; y: number };
    content: string;
  };
}

const learningSteps: LearningStep[] = [
  {
    id: 1,
    type: 'tour',
    title: 'Welcome to Your Dashboard',
    instruction: 'This is your command center. From here, you can access all aspects of your business operations.',
    target: 'dashboard-overview',
    feedback: {
      success: 'Great! You\'re now familiar with the dashboard layout.',
      error: 'Let\'s take another look at the dashboard overview.'
    }
  },
  {
    id: 2,
    type: 'interaction',
    title: 'Navigation Basics',
    instruction: 'Click on "Customers" in the sidebar to view your customer management area.',
    target: 'customers-nav',
    expectedAction: 'click',
    feedback: {
      success: 'Perfect! You\'ve accessed the customer management section.',
      error: 'Try clicking on "Customers" in the left sidebar.'
    }
  },
  {
    id: 3,
    type: 'interaction',
    title: 'Quick Search',
    instruction: 'Use the search bar at the top to find customer "John Smith".',
    target: 'search-bar',
    expectedAction: 'type:john smith',
    feedback: {
      success: 'Excellent! Quick search is one of the most powerful features.',
      error: 'Type "john smith" in the search bar at the top of the screen.'
    }
  },
  {
    id: 4,
    type: 'challenge',
    title: 'Schedule a New Job',
    instruction: 'Click the "+" button and schedule a service call for tomorrow at 2 PM.',
    target: 'new-job-button',
    expectedAction: 'click',
    feedback: {
      success: 'Great job! You\'ve created a new service appointment.',
      error: 'Look for the "+" button to create a new job.'
    }
  },
  {
    id: 5,
    type: 'validation',
    title: 'Dashboard Mastery Check',
    instruction: 'Navigate to the Reports section and find this month\'s revenue.',
    target: 'reports-nav',
    expectedAction: 'click',
    feedback: {
      success: 'Outstanding! You\'ve mastered the basic navigation.',
      error: 'Click on "Reports" in the sidebar to view revenue data.'
    }
  }
];

const DashboardSimulator = ({ currentStep, onStepComplete }: { 
  currentStep: number; 
  onStepComplete: (stepId: number) => void;
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchValue, setSearchValue] = useState(');
  const [highlightTarget, setHighlightTarget] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const step = learningSteps[currentStep];

  useEffect(() => {
    if (step?.target) {
      setHighlightTarget(step.target);
      setShowTooltip(true);
    }
  }, [step]);

  const handleInteraction = (target: string, action: string, value?: string) => {
    const currentStepData = learningSteps[currentStep];
    
    if (currentStepData.target === target) {
      if (currentStepData.expectedAction) {
        const expectedParts = currentStepData.expectedAction.split(':');
        const expectedAction = expectedParts[0];
        const expectedValue = expectedParts[1]?.toLowerCase();
        
        if (action === expectedAction) {
          if (expectedValue && value?.toLowerCase().includes(expectedValue)) {
            onStepComplete(currentStepData.id);
          } else if (!expectedValue) {
            onStepComplete(currentStepData.id);
          }
        }
      } else {
        onStepComplete(currentStepData.id);
      }
    }
    
    // Handle UI changes based on interactions
    switch (target) {
      case 'customers-nav':
        setActiveSection('customers');
        break;
      case 'reports-nav':
        setActiveSection('reports');
        break;
      case 'search-bar':
        setSearchValue(value || ');
        break;
    }
  };

  return (
    <div className="relative">
      {/* Simulated Dashboard Interface */}
      <Card className="overflow-hidden bg-gradient-to-br from-slate-50 to-neutral-100 dark:from-slate-900 dark:to-neutral-800 min-h-[600px]">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Thorbis Dashboard</h1>
              <Badge variant="outline">Demo Mode</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers, jobs, or locations..."
                  className={'w-64 pl-9 ${highlightTarget === 'search-bar' ? 'ring-2 ring-blue-500 animate-pulse' : '
              }'}
                  value={searchValue}
                  onChange={(e) => handleInteraction('search-bar', 'type', e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-neutral-800 border-r p-4 space-y-2">
            <Button
              variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
              className={'w-full justify-start ${highlightTarget === 'dashboard-overview' ? 'ring-2 ring-blue-500 animate-pulse' : '
              }'}
              onClick={() => handleInteraction('dashboard-overview', 'click')}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <Button
              variant={activeSection === 'customers' ? 'default' : 'ghost'}
              className={'w-full justify-start ${highlightTarget === 'customers-nav' ? 'ring-2 ring-blue-500 animate-pulse' : '
              }'}
              onClick={() => handleInteraction('customers-nav', 'click')}
            >
              <Users className="h-4 w-4 mr-2" />
              Customers
            </Button>
            
            <Button
              variant={activeSection === 'schedule' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('schedule')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            
            <Button
              variant={activeSection === 'reports' ? 'default' : 'ghost'}
              className={'w-full justify-start ${highlightTarget === 'reports-nav' ? 'ring-2 ring-blue-500 animate-pulse' : '
              }'}
              onClick={() => handleInteraction('reports-nav', 'click')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
                  <Button
                    className={'${highlightTarget === 'new-job-button' ? 'ring-2 ring-blue-500 animate-pulse' : '
              }'}
                    onClick={() => handleInteraction('new-job-button', 'click')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Job
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">$12,450</div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">147</div>
                      <p className="text-sm text-muted-foreground">Active Jobs</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">892</div>
                      <p className="text-sm text-muted-foreground">Customers</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">23</div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Job #1247 completed by Mike R.</span>
                        <Badge variant="outline" className="ml-auto">Just now</Badge>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">New appointment scheduled for tomorrow</span>
                        <Badge variant="outline" className="ml-auto">5 min ago</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'customers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Customer Management</h2>
                <div className="space-y-4">
                  {searchValue.toLowerCase().includes('john smith') && (
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">John Smith</h3>
                            <p className="text-sm text-muted-foreground">123 Oak Street, Springfield</p>
                            <p className="text-sm text-muted-foreground">Phone: (555) 123-4567</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Sarah Johnson</h3>
                          <p className="text-sm text-muted-foreground">456 Elm Avenue, Springfield</p>
                          <p className="text-sm text-muted-foreground">Phone: (555) 987-6543</p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">$12,450</div>
                      <p className="text-muted-foreground">+15% vs last month</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Interactive Tooltip */}
      {showTooltip && step?.tooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-xs z-50"
          style={{
            left: step.tooltip.position.x,
            top: step.tooltip.position.y
          }}
        >
          <div className="text-sm font-medium mb-1">{step.title}</div>
          <div className="text-xs">{step.tooltip.content}</div>
          <div className="absolute bottom-0 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600 transform translate-y-full"></div>
        </motion.div>
      )}
    </div>
  );
};

export default function Module1Page() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(');

  const progress = ((completedSteps.length) / learningSteps.length) * 100;

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
      const step = learningSteps.find(s => s.id === stepId);
      setFeedbackMessage(step?.feedback?.success || 'Great job!');
      setShowFeedback(true);
      
      setTimeout(() => {
        setShowFeedback(false);
        if (currentStep < learningSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, 2000);
    }
  };

  const nextStep = () => {
    if (currentStep < learningSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowFeedback(false);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowFeedback(false);
    }
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setShowFeedback(false);
  };

  const currentStepData = learningSteps[currentStep];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href="/courses/thorbis-software-mastery">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          
          <Badge variant="outline" className="px-4 py-2">
            Module 1: Dashboard Navigation & Setup
          </Badge>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {learningSteps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>

      {/* Current Step Instructions */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
                <p className="text-muted-foreground mb-4">{currentStepData.instruction}</p>
                
                {currentStepData.type === 'interaction' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <MousePointer className="h-4 w-4" />
                    <span>Interactive step - follow the instruction below</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dashboard Simulator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <DashboardSimulator 
          currentStep={currentStep}
          onStepComplete={handleStepComplete}
        />
      </motion.div>

      {/* Feedback */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 max-w-sm"
        >
          <Card className="bg-green-50 border-green-200 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {feedbackMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Step
        </Button>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={resetSimulation}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex items-center gap-2">
            {learningSteps.map((_, index) => (
              <div
                key={index}
                className={'w-3 h-3 rounded-full ${
                  completedSteps.includes(index + 1) 
                    ? 'bg-green-500' 
                    : index === currentStep 
                    ? 'bg-indigo-600' 
                    : 'bg-neutral-200'
              }'}
              />
            ))}
          </div>
        </div>

        {currentStep === learningSteps.length - 1 ? (
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Link href="/courses/thorbis-software-mastery">
              Complete Module
              <CheckCircle className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Next Step
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
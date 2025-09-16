"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Target,
  Lightbulb,
  RefreshCcw,
  Award,
  Clock,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface InteractiveExerciseProps {
  type: 'drag-drop' | 'simulation' | 'puzzle' | 'code' | 'diagram';
  content: any;
  onComplete: (score: number) => void;
  onProgress?: (progress: number) => void;
}

interface DragDropItem {
  id: string;
  content: string;
  category?: string;
  image?: string;
}

interface DropZone {
  id: string;
  label: string;
  accepts: string[];
  correctItems: string[];
}

// Drag and Drop Exercise Component
function DragDropExercise({ content, onComplete, onProgress }: any) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<Record<string, string[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string>("");

  const items: DragDropItem[] = content.items || [];
  const zones: DropZone[] = content.dropZones || [];

  useEffect(() => {
    calculateProgress();
  }, [dropZones]);

  const calculateProgress = () => {
    const totalItems = items.length;
    const placedItems = Object.values(dropZones).flat().length;
    const progress = (placedItems / totalItems) * 100;
    onProgress?.(progress);
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (zoneId: string, event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedItem) return;

    // Remove item from any existing zone
    const newDropZones = { ...dropZones };
    Object.keys(newDropZones).forEach(key => {
      newDropZones[key] = newDropZones[key].filter(id => id !== draggedItem);
    });

    // Add item to new zone
    if (!newDropZones[zoneId]) {
      newDropZones[zoneId] = [];
    }
    newDropZones[zoneId].push(draggedItem);

    setDropZones(newDropZones);
    setDraggedItem(null);

    // Check if all items are placed
    const totalPlaced = Object.values(newDropZones).flat().length;
    if (totalPlaced === items.length) {
      checkAnswer();
    }
  };

  const checkAnswer = () => {
    setAttempts(prev => prev + 1);
    const correctPlacements = 0;
    const totalPlacements = 0;

    zones.forEach(zone => {
      const placedItems = dropZones[zone.id] || [];
      totalPlacements += placedItems.length;
      
      placedItems.forEach(itemId => {
        if (zone.correctItems.includes(itemId)) {
          correctPlacements++;
        }
      });
    });

    const finalScore = Math.round((correctPlacements / totalPlacements) * 100);
    setScore(finalScore);

    if (finalScore >= 80) {
      setFeedback("Excellent work! All items correctly placed.");
      setIsComplete(true);
      onComplete(finalScore);
    } else if (finalScore >= 60) {
      setFeedback("Good effort! A few items need adjusting.");
    } else {
      setFeedback("Try again! Review the relationships between items.");
    }
  };

  const resetExercise = () => {
    setDropZones({});
    setIsComplete(false);
    setScore(0);
    setFeedback("");
    onProgress?.(0);
  };

  const getUnplacedItems = () => {
    const placedIds = Object.values(dropZones).flat();
    return items.filter(item => !placedIds.includes(item.id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              {content.title}
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                Attempt {attempts + 1}
              </Badge>
              {score > 0 && (
                <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
                  {score}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{content.instructions}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Items Pool */}
            <div className="space-y-4">
              <h3 className="font-semibold">Items to Drag</h3>
              <div className="grid grid-cols-1 gap-3">
                {getUnplacedItems().map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragEnd={handleDragEnd}
                    className={'p-4 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all ${
                      draggedItem === item.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                        : 'border-neutral-300 hover:border-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-800`
              }'}'
                    whileHover={{ scale: 1.02 }}
                    whileDrag={{ scale: 1.05, rotate: 2 }}
                  >
                    <div className="flex items-center space-x-3">
                      {item.image && (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{item.image}</span>
                        </div>
                      )}
                      <span className="font-medium">{item.content}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Drop Zones */}
            <div className="space-y-4">
              <h3 className="font-semibold">Drop Zones</h3>
              <div className="space-y-4">
                {zones.map((zone, index) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(zone.id, e)}
                    className={'min-h-[80px] p-4 rounded-lg border-2 border-dashed transition-all ${
                      draggedItem 
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-neutral-300`
              }'}'
                  >
                    <h4 className="font-medium mb-2">{zone.label}</h4>
                    <div className="space-y-2">
                      {(dropZones[zone.id] || []).map(itemId => {
                        const item = items.find(i => i.id === itemId);
                        const isCorrect = zone.correctItems.includes(itemId);
                        
                        return (
                          <motion.div
                            key={itemId}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={'p-2 rounded border flex items-center justify-between ${
                              isComplete
                                ? isCorrect 
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-neutral-200 bg-white dark:bg-neutral-800`
              }'}'
                          >
                            <span className="text-sm">{item?.content}</span>
                            {isComplete && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                              >
                                {isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={'mt-6 p-4 rounded-lg border ${
                  score >= 80 
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                    : score >= 60
                    ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-red-200 bg-red-50 dark:bg-red-900/20'
              }'}'
              >
                <div className="flex items-start space-x-2">
                  {score >= 80 ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : score >= 60 ? (
                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{feedback}</p>
                    {!isComplete && score > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Score: {score}% - {score >= 80 ? 'Excellent!' : score >= 60 ? 'Keep trying!' : 'Review and try again.'}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={resetExercise}
              disabled={Object.keys(dropZones).length === 0}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            {isComplete && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center space-x-2"
              >
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">+{Math.round(score / 2)} XP</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simulation Exercise Component
function SimulationExercise({ content, onComplete }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userActions, setUserActions] = useState<string[]>([]);
  const [simulationState, setSimulationState] = useState(content.initialState || {});

  // This would contain the actual simulation logic
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          {content.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🔧</div>
            <p className="text-lg font-medium">Interactive Simulation</p>
            <p className="text-muted-foreground">Hands-on practice scenario</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InteractiveExercise({ 
  type, 
  content, 
  onComplete, 
  onProgress 
}: InteractiveExerciseProps) {
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return '${mins}:${secs.toString().padStart(2, '0')}';
  };

  const renderExercise = () => {
    switch (type) {
      case 'drag-drop':
        return (
          <DragDropExercise 
            content={content} 
            onComplete={onComplete} 
            onProgress={onProgress} 
          />
        );
      case 'simulation':
        return (
          <SimulationExercise 
            content={content} 
            onComplete={onComplete} 
          />
        );
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold mb-2">Exercise Type: {type}</h3>
              <p className="text-muted-foreground">This exercise type is under development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          {formatTime(timeSpent)}
        </Badge>
        <Badge variant="secondary" className="capitalize">
          {type.replace('-', ' ')} Exercise
        </Badge>
      </div>

      {renderExercise()}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Play,
  Pause,
  BookOpen,
  Target
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";

interface LessonProgressTrackerProps {
  lessonId: string;
  lessonTitle: string;
  estimatedDuration?: number;
  onProgressChange?: (percentage: number) => void;
  onComplete?: (xpEarned: number) => void;
  autoTrackTime?: boolean;
}

export function LessonProgressTracker({
  lessonId,
  lessonTitle,
  estimatedDuration = 0,
  onProgressChange,
  onComplete,
  autoTrackTime = true
}: LessonProgressTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  
  const { user } = useAuth();
  const {
    progress,
    loading,
    error,
    saving,
    markAsCompleted,
    setProgressPercentage,
    updateTimeSpent,
    isCompleted,
    progressPercentage,
    timeSpent,
  } = useLessonProgress(lessonId);

  // Auto-track progress when component is active
  useEffect(() => {
    if (!autoTrackTime) return;

    let interval: NodeJS.Timeout;

    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        updateTimeSpent();
        
        // Auto-increment progress based on time spent vs estimated duration
        if (estimatedDuration > 0 && timeSpent > 0) {
          const timeBasedProgress = Math.min((timeSpent / estimatedDuration) * 100, 95);
          if (timeBasedProgress > progressPercentage) {
            setProgressPercentage(timeBasedProgress);
            onProgressChange?.(timeBasedProgress);
          }
        }
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isCompleted, timeSpent, progressPercentage, estimatedDuration]);

  const handleMarkComplete = async () => {
    try {
      const result = await markAsCompleted({
        manualCompletion: true,
        completedAt: new Date().toISOString()
      });

      if (result) {
        setShowCompletionAnimation(true);
        
        toast({
          title: `Lesson completed! +${result.xpEarned} XP earned`,
          description: `You've successfully completed "${lessonTitle}"''
        });

        onComplete?.(result.xpEarned);

        // Hide animation after 3 seconds
        setTimeout(() => setShowCompletionAnimation(false), 3000);
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to mark lesson as complete',
        variant: 'destructive`
      });
    }
  };

  const handleProgressUpdate = (percentage: number) => {
    setProgressPercentage(percentage);
    onProgressChange?.(percentage);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return '${hours}h ${remainingMinutes}m';
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20">
        <CardContent className="p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card relative overflow-hidden">
        <CardContent className="p-6">
          {/* Completion Animation */}
          <AnimatePresence>
            {showCompletionAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-green-500/90 to-blue-500/90 flex items-center justify-center z-10"
              >
                <div className="text-center text-white">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Award className="h-16 w-16 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Lesson Completed!</h3>
                  <p className="text-sm opacity-90">Great job completing this lesson</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={'p-2 rounded-lg ${isCompleted 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }'}>'
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <BookOpen className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Lesson Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {saving && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}

                {!isCompleted && (
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setIsActive(!isActive)}
                  >
                    {isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span>Time Spent</span>
                </div>
                <div className="font-semibold">{formatTime(timeSpent)}</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                  <Target className="h-3 w-3" />
                  <span>Estimated</span>
                </div>
                <div className="font-semibold">
                  {estimatedDuration > 0 ? formatTime(estimatedDuration) : '--'}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Status</span>
                </div>
                <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                  {isCompleted ? "Complete" : "Active"}
                </Badge>
              </div>
            </div>

            {/* Manual Progress Controls */}
            {!isCompleted && (
              <div className="space-y-3 pt-4 border-t">
                <label className="text-sm font-medium">Manual Progress</label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressPercentage}
                      onChange={(e) => handleProgressUpdate(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>

                {progressPercentage >= 100 && (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
              </div>
            )}

            {/* Completed State */}
            {isCompleted && progress?.completed_at && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Completed on {new Date(progress.completed_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Session Indicator */}
      {isActive && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className="glass-card border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Study session active - progress is being tracked
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
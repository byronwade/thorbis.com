"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  Clock,
  BookOpen,
  Award,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  SkipForward
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { getCourseById } from "@/lib/course-data";

const lessonContent: Record<string, unknown> = {
  "1-1": {
    id: 1,
    title: "What is Plumbing?",
    type: "video",
    duration: 600, // 10 minutes in seconds
    content: {
      videoUrl: "/lessons/plumbing-intro.mp4",
      transcript: "Welcome to plumbing fundamentals. In this lesson, we'll explore the basic concepts...",
      keyPoints: [
        "Plumbing is the system of pipes, valves, and fixtures",
        "Water supply and waste removal are core functions", 
        "Safety is paramount in all plumbing work"
      ]
    },
    quiz: {
      question: "What are the two main functions of a plumbing system?",
      options: [
        "Water heating and cooling",
        "Water supply and waste removal", 
        "Pipe installation and repair",
        "Pressure regulation and flow control"
      ],
      correct: 1,
      explanation: "The two main functions are bringing clean water in (supply) and taking waste water out (drainage)."
    }
  },
  "1-2": {
    id: 2,
    title: "Tools of the Trade",
    type: "interactive",
    duration: 900, // 15 minutes
    content: {
      interactiveType: "drag-drop",
      scenario: "Match each tool to its primary use",
      tools: [
        { name: "Pipe Wrench", use: "Gripping and turning pipes", image: "/tools/pipe-wrench.svg" },
        { name: "Hacksaw", use: "Cutting pipes", image: "/tools/hacksaw.svg" },
        { name: "Plunger", use: "Clearing blockages", image: "/tools/plunger.svg" },
        { name: "Level", use: "Ensuring proper slope", image: "/tools/level.svg" }
      ]
    }
  },
  "1-3": {
    id: 3,
    title: "Safety Protocols Quiz",
    type: "quiz",
    duration: 300, // 5 minutes
    content: {
      questions: [
        {
          question: "What should you always wear when working with pipes?",
          options: ["Gloves only", "Safety glasses and gloves", "Hard hat only", "Steel-toe boots only"],
          correct: 1,
          explanation: "Always wear both safety glasses to protect your eyes and gloves to protect your hands."
        },
        {
          question: "Before starting any plumbing work, you should:",
          options: ["Turn off the main water supply", "Check the weather", "Call your supervisor", "Clean your tools"],
          correct: 0,
          explanation: "Always turn off the main water supply to prevent flooding and water damage."
        },
        {
          question: "Which gas requires special ventilation when soldering?",
          options: ["Oxygen", "Propane fumes", "Carbon dioxide", "Nitrogen"],
          correct: 1,
          explanation: "Propane fumes are heavier than air and can accumulate, requiring proper ventilation."
        }
      ]
    }
  }
};

interface LessonPlayerProps {
  lessonData: any;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function VideoPlayer({ content, onComplete }: { content: any; onComplete: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const duration = 600; // 10 minutes
  const progress = (currentTime / duration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            setIsPlaying(false);
            onComplete();
          }
          return newTime;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, playbackSpeed, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return '${mins}:${secs.toString().padStart(2, '0')}';
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
          <div className="text-center text-white">
            <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Video Content: {content.transcript.substring(0, 50)}...</p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1">
              <Progress value={progress} className="h-1" />
            </div>
            
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsMuted(!isMuted)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Key Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {content.keyPoints.map((point: string, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function InteractiveExercise({ content, onComplete }: { content: any; onComplete: () => void }) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleDragStart = (toolName: string) => {
    setDraggedItem(toolName);
  };

  const handleDrop = (use: string) => {
    if (draggedItem) {
      setMatches(prev => ({ ...prev, [draggedItem]: use }));
      setDraggedItem(null);
      
      // Check if all tools are matched
      const newMatches = { ...matches, [draggedItem]: use };
      if (Object.keys(newMatches).length === content.tools.length) {
        setIsComplete(true);
        setTimeout(() => onComplete(), 1000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            {content.scenario}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold mb-4">Tools</h3>
              {content.tools.map((tool: unknown, index: number) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileDrag={{ scale: 1.05, rotate: 5 }}
                >
                  <div 
                    className={'p-4 border-2 border-dashed rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                      matches[tool.name] ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-300 hover:border-blue-400'
              }'}
                    draggable
                    onDragStart={() => handleDragStart(tool.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{tool.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold mb-4">Uses</h3>
              {content.tools.map((tool: unknown, index: number) => (
                <motion.div
                  key={tool.use}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <div
                    className={'p-4 border-2 border-dashed rounded-lg min-h-[4rem] flex items-center transition-all ${
                      Object.values(matches).includes(tool.use) 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-slate-300 hover:border-purple-400'
              }'}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(tool.use)}
                  >
                    <span className="text-sm">{tool.use}</span>
                    {Object.values(matches).includes(tool.use) && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Excellent work! All tools matched correctly.</span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuizPlayer({ content, onComplete }: { content: any; onComplete: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const questions = content.questions || [content];
  const question = questions[currentQuestion];

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);

    if (optionIndex === question.correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setShowExplanation(false);
      } else {
        setIsComplete(true);
        onComplete();
      }
    }, 2000);
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center space-y-6">
        <Card className="glass-card">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-lg text-muted-foreground mb-4">
              You scored {score} out of {questions.length} questions
            </p>
            
            <div className="text-4xl font-bold mb-4">
              <span className={percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-yellow-600" : "text-red-600"}>
                {percentage}%
              </span>
            </div>

            {percentage >= 80 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Excellent work!</span>
                </div>
              </motion.div>
            )}

            <Badge variant="secondary" className="px-4 py-2">
              +50 XP Earned
            </Badge>
          </CardContent>
        </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="w-32" />
        </div>
        <div className="text-sm text-muted-foreground">
          {score} correct so far
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option: string, index: number) => {
                const isSelected = selectedAnswers[currentQuestion] === index;
                const isCorrect = index === question.correct;
                const showResult = showExplanation && isSelected;

                return (
                  <motion.div
                    key={index}
                    whileHover={!showExplanation ? { scale: 1.01 } : Record<string, unknown>}
                    whileTap={!showExplanation ? { scale: 0.99 } : Record<string, unknown>}
                  >
                    <button
                      className={'w-full p-4 text-left border-2 rounded-lg transition-all ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                      } ${showExplanation ? 'cursor-default' : 'cursor-pointer'
              }'}
                      onClick={() => !showExplanation && handleAnswer(index)}
                      disabled={showExplanation}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </motion.div>
                      )}
                    </div>
                    </button>
                  </motion.div>
                );
              })}

              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Explanation</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function LessonPlayer() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  
  const course = getCourseById(courseId);
  const lesson = lessonContent[lessonId];
  
  const [isComplete, setIsComplete] = useState(false);
  const [showControls, setShowControls] = useState(true);

  if (!course || !lesson) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <p className="text-muted-foreground">The lesson you're looking for doesn't exist.</p>
      </div>
    );
  }

  const handleComplete = () => {
    setIsComplete(true);
  };

  const handleNext = () => {
    // Navigate to next lesson logic
    router.push('/courses/${courseId}');
  };

  const handlePrevious = () => {
    router.back();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="capitalize">
              {lesson.type}
            </Badge>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{Math.ceil(lesson.duration / 60)} min</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        <p className="text-muted-foreground">Part of: {course.title}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {lesson.type === "video" && (
              <VideoPlayer content={lesson.content} onComplete={handleComplete} />
            )}
            
            {lesson.type === "interactive" && (
              <InteractiveExercise content={lesson.content} onComplete={handleComplete} />
            )}
            
            {lesson.type === "quiz" && (
              <QuizPlayer content={lesson.content} onComplete={handleComplete} />
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lesson Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {isComplete ? "100%" : "0%"}
                  </div>
                  <Progress value={isComplete ? 100 : 0} className="progress-glow" />
                </div>
                
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="text-center space-y-2">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-green-600">Lesson Complete!</p>
                    <Badge variant="secondary">+25 XP</Badge>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Up Next</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-1">Tools of the Trade</h4>
                  <p className="text-xs text-muted-foreground">Interactive • 15 min</p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleNext}
                  disabled={!isComplete}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next Lesson
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart Lesson
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Take Notes
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
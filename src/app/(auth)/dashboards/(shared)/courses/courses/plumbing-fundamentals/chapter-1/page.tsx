"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
  Lightbulb,
  Eye,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Target,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";

interface Question {
  id: number;
  type: 'multiple-choice' | 'interactive' | 'slider' | 'visual';
  title: string;
  content: string;
  explanation?: string;
  options?: string[];
  correctAnswer?: number | number[];
  interactive?: {
    component: string;
    props: any;
  };
  hint?: string;
}

const questions: Question[] = [
  {
    id: 1,
    type: 'multiple-choice',
    title: 'Water Pressure Basics',
    content: 'A residential home has water coming from the street at 60 PSI. If you install a pressure reducer to bring it down to 40 PSI, what happens to the flow rate through a 1/2" pipe?',
    options: [
      'Flow rate increases significantly',
      'Flow rate decreases proportionally',
      'Flow rate stays roughly the same',
      'Flow rate becomes unpredictable'
    ],
    correctAnswer: 1,
    explanation: 'Lower pressure means less force pushing water through the pipe, so flow rate decreases. However, the relationship isn\'t perfectly linear due to pipe friction and other factors.',
    hint: 'Think about how pressure relates to the force pushing water through the pipe.'
  },
  {
    id: 2,
    type: 'interactive',
    title: 'Pipe Pressure Simulator',
    content: 'Use the slider to adjust water pressure and observe how it affects flow rate through different pipe sizes.',
    interactive: {
      component: 'PressureSimulator',
      props: {
        minPressure: 20,
        maxPressure: 80,
        pipeSizes: ['1/2"', '3/4"', '1"']
      }
    },
    explanation: 'Notice how larger pipes can handle more flow at the same pressure, and how doubling pressure doesn\'t double flow rate due to turbulence and friction.'
  },
  {
    id: 3,
    type: 'visual',
    title: 'Pressure Drop Visualization',
    content: 'Look at this pipe system. Where do you expect the highest pressure drop?',
    options: [
      'At the 90-degree elbow',
      'In the long straight section',
      'At the pipe diameter change',
      'At the valve'
    ],
    correctAnswer: 2,
    explanation: 'Sudden changes in pipe diameter create turbulence and significant pressure drops. The 3/4" to 1/2" reduction forces water to speed up, creating friction losses.',
    hint: 'Look for places where the water flow changes direction or speed dramatically.'
  },
  {
    id: 4,
    type: 'slider',
    title: 'Optimal Flow Rate',
    content: 'A kitchen faucet needs 2.2 GPM for comfortable use. Adjust the pressure to achieve this flow rate through a 1/2" supply line.',
    interactive: {
      component: 'FlowRateAdjuster',
      props: {
        targetFlowRate: 2.2,
        pipeSize: '1/2"',
        tolerance: 0.2
      }
    },
    explanation: 'For a 1/2" pipe, you typically need around 35-45 PSI to achieve 2.2 GPM, depending on the length and number of fittings in the line.'
  }
];

// Interactive Components
const PressureSimulator = ({ minPressure, maxPressure, pipeSizes }: any) => {
  const [pressure, setPressure] = useState([50]);
  const [selectedPipe, setSelectedPipe] = useState('1/2"');
  
  const calculateFlowRate = (psi: number, pipeSize: string) => {
    const sizeFactor = pipeSize === '1/2"' ? 1 : pipeSize === '3/4"' ? 1.8 : 3.2;
    return Math.round((Math.sqrt(psi / 10) * sizeFactor) * 10) / 10;
  };

  const flowRate = calculateFlowRate(pressure[0], selectedPipe);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-4">Controls</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Water Pressure: {pressure[0]} PSI</label>
              <Slider
                value={pressure}
                onValueChange={(value: number[]) => setPressure(value)}
                min={minPressure}
                max={maxPressure}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Pipe Size</label>
              <div className="flex gap-2">
                {pipeSizes.map((size: string) => (
                  <Button
                    key={size}
                    variant={selectedPipe === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPipe(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Results</h4>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {flowRate} GPM
              </div>
              <p className="text-sm text-muted-foreground">Flow Rate</p>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pressure:</span>
                <span className="font-medium">{pressure[0]} PSI</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pipe Size:</span>
                <span className="font-medium">{selectedPipe}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <span className={'font-medium ${
                  flowRate < 1.5 ? 'text-red-600' : 
                  flowRate < 2.5 ? 'text-yellow-600' : 
                  'text-green-600'
              }'}>'
                  {flowRate < 1.5 ? 'Low Flow' : 
                   flowRate < 2.5 ? 'Adequate' : 
                   'High Flow'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlowRateAdjuster = ({ targetFlowRate, pipeSize, tolerance }: any) => {
  const [pressure, setPressure] = useState([30]);
  const currentFlow = Math.round((Math.sqrt(pressure[0] / 10) * 1) * 10) / 10;
  const isCorrect = Math.abs(currentFlow - targetFlowRate) <= tolerance;

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border">
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground">Target: {targetFlowRate} GPM</div>
          <div className={'text-3xl font-bold ${isCorrect ? 'text-green-600' : 'text-blue-600'
              }'}>'
            {currentFlow} GPM
          </div>
          {isCorrect && (
            <div className="flex items-center justify-center gap-2 text-green-600 mt-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Perfect!</span>
            </div>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Adjust Pressure: {pressure[0]} PSI</label>
          <Slider
            value={pressure}
            onValueChange={(value: number[]) => setPressure(value)}
            min={15}
            max={60}
            step={1}
            className="w-full"
          />
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Flow:</span>
              <span className="font-medium ml-2">{currentFlow} GPM</span>
            </div>
            <div>
              <span className="text-muted-foreground">Difference:</span>
              <span className={'font-medium ml-2 ${
                isCorrect ? 'text-green-600' : 'text-orange-600'
              }'}>'
                {Math.abs(currentFlow - targetFlowRate).toFixed(1)} GPM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Chapter1Page() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = answers[question.id] !== undefined;
  const isCorrect = question.correctAnswer !== undefined && 
                   answers[question.id] === question.correctAnswer;

  const handleAnswer = (answer: unknown) => {
    setAnswers({ ...answers, [question.id]: answer });
    if (question.type === 'multiple-choice' || question.type === 'visual') {
      setTimeout(() => setShowExplanation(true), 500);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
      setShowHint(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
      setShowHint(false);
    }
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
      case 'visual':
        return (
          <div className="space-y-4">
            {question.options?.map((option, index) => (
              <motion.button
                key={index}
                className={'w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[question.id] === index
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20'
              }'}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {answers[question.id] === index && (
                    <div className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {isCorrect ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            {question.interactive?.component === 'PressureSimulator' && (
              <PressureSimulator {...question.interactive.props} />
            )}
            <Button
              onClick={() => {
                handleAnswer(true);
                setShowExplanation(true);
              }}
              className="w-full"
              disabled={isAnswered}
            >
              {isAnswered ? 'Completed' : 'Mark as Complete'}
            </Button>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-4">
            {question.interactive?.component === 'FlowRateAdjuster' && (
              <FlowRateAdjuster {...question.interactive.props} />
            )}
            <Button
              onClick={() => {
                handleAnswer(true);
                setShowExplanation(true);
              }}
              className="w-full"
              disabled={isAnswered}
            >
              {isAnswered ? 'Completed' : 'Continue'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href="/courses/plumbing-fundamentals">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          
          <Badge variant="outline" className="px-4 py-2">
            Chapter 1: Understanding Water Pressure
          </Badge>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardTitle className="flex items-center gap-3">
              <div className={'w-10 h-10 rounded-lg bg-gradient-to-br ${
                question.type === 'interactive' ? 'from-blue-500 to-cyan-500' :
                question.type === 'visual' ? 'from-green-500 to-emerald-500' :
                question.type === 'slider' ? 'from-purple-500 to-violet-500' :
                'from-orange-500 to-amber-500'} flex items-center justify-center'}>
                {question.type === 'interactive' ? <Target className="h-5 w-5 text-white" /> :
                 question.type === 'visual' ? <Eye className="h-5 w-5 text-white" /> :
                 question.type === 'slider' ? <Zap className="h-5 w-5 text-white" /> :
                 <CheckCircle className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h2 className="text-xl">{question.title}</h2>
                <Badge variant="outline" className="mt-1 capitalize">
                  {question.type.replace('-', ' ')}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">{question.content}</p>
              
              {renderQuestion()}

              {/* Hint */}
              {question.hint && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                </div>
              )}

              {showHint && question.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{question.hint}</p>
                  </div>
                </motion.div>
              )}

              {/* Explanation */}
              {showExplanation && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200"
                >
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Explanation
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200">
                    {question.explanation}
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={'w-3 h-3 rounded-full ${
                index === currentQuestion 
                  ? 'bg-blue-600' 
                  : index < currentQuestion 
                  ? 'bg-green-500' 
                  : 'bg-neutral-200'
              }'}
            />
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Link href="/courses/plumbing-fundamentals">
              Complete Chapter
              <CheckCircle className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button
            onClick={nextQuestion}
            disabled={!isAnswered && question.type !== 'interactive'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
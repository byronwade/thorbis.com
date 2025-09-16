"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Clock,
  Award,
  RefreshCcw,
  AlertCircle,
  Target,
  Brain,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'fill-blank' | 'short-answer' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer?: string | string[] | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit?: number;
  hint?: string;
}

interface QuizSystemProps {
  questions: QuizQuestion[];
  title: string;
  passingScore: number;
  timeLimit?: number;
  allowRetries?: boolean;
  showHints?: boolean;
  onComplete: (score: number, results: unknown) => void;
}

export function QuizSystem({
  questions,
  title,
  passingScore,
  timeLimit,
  allowRetries = true,
  showHints = true,
  onComplete
}: QuizSystemProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<unknown>(null);

  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    if (!quizStarted || !timeLimit || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLimit, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return '${mins}:${secs.toString().padStart(2, '0')}';
  };

  const handleAnswerChange = (questionId: string, answer: unknown) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowHint(false);
    }
  };

  const handleSubmitQuiz = () => {
    const quizResults = calculateResults();
    setResults(quizResults);
    setShowResults(true);
    onComplete(quizResults.score, quizResults);
  };

  const calculateResults = () => {
    const totalPoints = 0;
    const earnedPoints = 0;
    const questionResults: unknown[] = [];

    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);
      
      if (isCorrect) {
        earnedPoints += question.points;
      }

      questionResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      });
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    
    return {
      score,
      totalPoints,
      earnedPoints,
      passed: score >= passingScore,
      questionResults,
      timeSpent: timeLimit ? timeLimit - timeRemaining : undefined
    };
  };

  const checkAnswer = (question: QuizQuestion, userAnswer: unknown): boolean => {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return userAnswer === question.correctAnswer;
      
      case 'multiple-select':
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
        const correctAnswerArray = question.correctAnswer as string[];
        return userAnswer.length === correctAnswerArray.length &&
               userAnswer.every((ans: string) => correctAnswerArray.includes(ans));
      
      case 'fill-blank':
      case 'short-answer':
        const correct = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        return correct.some(ans => 
          userAnswer.toLowerCase().trim() === ans?.toString().toLowerCase().trim()
        );
      
      default:
        return false;
    }
  };

  const renderQuestion = (question: QuizQuestion) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple-choice`:
        return (
          <RadioGroup 
            value={userAnswer || ""} 
            onValueChange={(value: string) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}'} />
                <Label htmlFor={'${question.id}-${index}'}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple-select`:
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}'}
                  checked={Array.isArray(userAnswer) && userAnswer.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                    if (checked) {
                      handleAnswerChange(question.id, [...currentAnswers, option]);
                    } else {
                      handleAnswerChange(question.id, currentAnswers.filter((ans: string) => ans !== option));
                    }
                  }}
                />
                <Label htmlFor={'${question.id}-${index}'}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'true-false`:
        return (
          <RadioGroup 
            value={userAnswer || ""} 
            onValueChange={(value: string) => handleAnswerChange(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`}>True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-false'} />
              <Label htmlFor={'${question.id}-false'}>False</Label>
            </div>
          </RadioGroup>
        );

      case 'fill-blank':
        return (
          <Input
            value={userAnswer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="max-w-md"
          />
        );

      case 'short-answer':
        return (
          <Textarea
            value={userAnswer || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="min-h-[100px]"
          />
        );

      default:
        return <div>Question type not supported yet</div>;
    }
  };

  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{passingScore}%</div>
              <div className="text-sm text-muted-foreground">Passing Score</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {timeLimit ? formatTime(timeLimit) : "∞"}
              </div>
              <div className="text-sm text-muted-foreground">Time Limit</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Instructions:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Read each question carefully</li>
              <li>• You can navigate between questions freely</li>
              {showHints && <li>• Use hints if you get stuck</li>}
              {allowRetries && <li>• You can retake this quiz if needed</li>}
              <li>• Make sure to submit before time runs out</li>
            </ul>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => setQuizStarted(true)}
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Results Summary */}
        <Card>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              {results.passed ? (
                <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              ) : (
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2">
              {results.passed ? "Congratulations!" : "Keep Trying!"}
            </h2>
            
            <div className="text-5xl font-bold mb-4">
              <span className={results.passed ? "text-green-600" : "text-red-600"}>
                {results.score}%
              </span>
            </div>

            <p className="text-muted-foreground mb-6">
              You scored {results.earnedPoints} out of {results.totalPoints} points
            </p>

            {results.passed && (
              <Badge className="px-6 py-2 text-lg">
                +{Math.round(results.score / 2)} XP Earned
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Question by Question Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.questionResults.map((result: unknown, index: number) => (
              <motion.div
                key={result.questionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={'p-4 rounded-lg border ${
                  result.isCorrect 
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:bg-red-900/20'
              }'}'
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    {result.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <Badge variant="outline">
                      {result.points} pts
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm mb-3">{result.question}</p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Your Answer:</strong> {
                      Array.isArray(result.userAnswer) 
                        ? result.userAnswer.join(', ') 
                        : result.userAnswer || 'No answer'
                    }
                  </div>
                  {!result.isCorrect && (
                    <div>
                      <strong>Correct Answer:</strong> {
                        Array.isArray(result.correctAnswer) 
                          ? result.correctAnswer.join(', ') 
                          : result.correctAnswer
                      }
                    </div>
                  )}
                  <div className="flex items-start space-x-2 mt-2">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{result.explanation}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {allowRetries && !results.passed && (
            <Button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
                setQuizStarted(false);
                setTimeRemaining(timeLimit || 0);
              }}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentQuestion];
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                Question {currentQuestion + 1} of {totalQuestions}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {currentQ.difficulty}
              </Badge>
              <Badge variant="outline">
                {currentQ.points} points
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {timeLimit && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className={'font-mono ${timeRemaining < 300 ? 'text-red-500' : '
              }'}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestion(currentQ)}

              {/* Hint */}
              {showHints && currentQ.hint && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                  
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm">{currentQ.hint}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {currentQuestion === totalQuestions - 1 ? (
                <Button onClick={handleSubmitQuiz}>
                  <Target className="h-4 w-4 mr-2" />
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
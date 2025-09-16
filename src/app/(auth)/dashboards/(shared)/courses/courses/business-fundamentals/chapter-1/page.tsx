"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";

interface Question {
  id: number;
  type: 'calculator' | 'scenario' | 'multiple-choice' | 'analysis';
  title: string;
  content: string;
  explanation?: string;
  options?: string[];
  correctAnswer?: number | number[];
  calculator?: {
    type: string;
    fields: unknown[];
    formula: string;
  };
  scenario?: {
    context: string;
    challenge: string;
    options: { label: string; outcome: string; impact: number }[];
  };
  hint?: string;
}

const questions: Question[] = [
  {
    id: 1,
    type: 'calculator',
    title: 'Pricing Your Services',
    content: 'Use the calculator below to determine the minimum hourly rate you need to charge to be profitable.',
    calculator: {
      type: 'hourly-rate',
      fields: [
        { name: 'monthlyExpenses', label: 'Monthly Business Expenses', type: 'currency', default: 5000 },
        { name: 'desiredProfit', label: 'Desired Monthly Profit', type: 'currency', default: 3000 },
        { name: 'workingHours', label: 'Billable Hours per Month', type: 'number', default: 120 },
        { name: 'materials', label: 'Avg Materials Cost per Job (%)', type: 'percentage', default: 15 }
      ],
      formula: 'hourlyRate = (monthlyExpenses + desiredProfit) / (workingHours * (1 - materials/100))'
    },
    explanation: 'Your hourly rate must cover expenses, provide profit, and account for material costs. Many service businesses fail because they undercharge and don\'t account for all costs.',
    hint: 'Don\'t forget to include your salary as a business expense!'
  },
  {
    id: 2,
    type: 'scenario',
    title: 'Customer Payment Terms',
    content: 'You\'ve just completed a $2,500 plumbing job for a commercial client. They want to pay in 60 days instead of your standard 30 days.',
    scenario: {
      context: 'Commercial Client Payment Decision',
      challenge: 'A good client wants extended payment terms. Your cash flow is tight this month, but they\'re worth $15,000+ annually.',
      options: [
        {
          label: 'Accept 60-day terms to keep the client happy',
          outcome: 'Client satisfaction increases, but cash flow stress continues',
          impact: -2
        },
        {
          label: 'Offer 45-day terms as a compromise',
          outcome: 'Moderate solution - client accepts, slight cash flow improvement',
          impact: 0
        },
        {
          label: 'Insist on 30-day terms with 2% early payment discount',
          outcome: 'Faster payment, but reduced profit margin',
          impact: 1
        },
        {
          label: 'Request 50% upfront, balance in 30 days',
          outcome: 'Improved cash flow, but client may be resistant',
          impact: 2
        }
      ]
    },
    explanation: 'Cash flow is the lifeblood of service businesses. The best solution balances client relationships with financial health. Option 4 provides the best cash flow while maintaining professionalism.',
    hint: 'Consider offering value in exchange for better payment terms.'
  },
  {
    id: 3,
    type: 'multiple-choice',
    title: 'Break-Even Analysis',
    content: 'Your monthly fixed costs are $8,000. You charge $75/hour and have $15/hour in variable costs. How many hours do you need to work monthly to break even?',
    options: [
      '107 hours',
      '133 hours', 
      '160 hours',
      '200 hours'
    ],
    correctAnswer: 1,
    explanation: 'Break-even = Fixed Costs ÷ (Hourly Rate - Variable Costs) = $8,000 ÷ ($75 - $15) = $8,000 ÷ $60 = 133.3 hours. Understanding your break-even point is crucial for setting realistic goals.',
    hint: 'Subtract variable costs from your hourly rate first, then divide fixed costs by that number.'
  },
  {
    id: 4,
    type: 'calculator',
    title: 'Cash Flow Forecasting',
    content: 'Predict your cash position for the next 3 months to avoid cash flow problems.',
    calculator: {
      type: 'cash-flow',
      fields: [
        { name: 'startingCash', label: 'Current Cash Balance', type: 'currency', default: 15000 },
        { name: 'monthlyRevenue', label: 'Expected Monthly Revenue', type: 'currency', default: 12000 },
        { name: 'monthlyExpenses', label: 'Monthly Operating Expenses', type: 'currency', default: 8000 },
        { name: 'payroll', label: 'Monthly Payroll', type: 'currency', default: 3000 },
        { name: 'collections', label: 'Collection Rate (%)', type: 'percentage', default: 85 }
      ],
      formula: 'cashFlow = startingCash + (monthlyRevenue * collections/100 - monthlyExpenses - payroll) * months'
    },
    explanation: 'Cash flow forecasting helps you anticipate problems before they happen. Notice how collection rates significantly impact your actual cash position.',
    hint: 'Not all invoiced revenue becomes cash immediately - factor in your collection rate.'
  }
];

// Calculator Components
const HourlyRateCalculator = ({ fields }: any) => {
  const [values, setValues] = useState<{ [key: string]: number }>({
    monthlyExpenses: 5000,
    desiredProfit: 3000,
    workingHours: 120,
    materials: 15
  });

  const updateValue = (field: string, value: number) => {
    setValues({ ...values, [field]: value });
  };

  const calculateRate = () => {
    const { monthlyExpenses, desiredProfit, workingHours, materials } = values;
    const totalNeeded = monthlyExpenses + desiredProfit;
    const materialFactor = 1 - (materials / 100);
    const hourlyRate = totalNeeded / (workingHours * materialFactor);
    return Math.round(hourlyRate * 100) / 100;
  };

  const hourlyRate = calculateRate();
  const annualRevenue = hourlyRate * values.workingHours * 12;
  const profitMargin = (values.desiredProfit / (values.monthlyExpenses + values.desiredProfit)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className="font-semibold">Business Parameters</h4>
        
        <div className="space-y-4">
          <div>
            <Label>Monthly Business Expenses</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={values.monthlyExpenses}
                onChange={(e) => updateValue('monthlyExpenses', parseFloat(e.target.value) || 0)}
                className="pl-8"
              />
            </div>
          </div>

          <div>
            <Label>Desired Monthly Profit</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={values.desiredProfit}
                onChange={(e) => updateValue('desiredProfit', parseFloat(e.target.value) || 0)}
                className="pl-8"
              />
            </div>
          </div>

          <div>
            <Label>Billable Hours per Month: {values.workingHours}</Label>
            <Slider
              value={[values.workingHours]}
              onValueChange={(value: number[]) => updateValue('workingHours', value[0])}
              min={80}
              max={200}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Materials Cost (%): {values.materials}%</Label>
            <Slider
              value={[values.materials]}
              onValueChange={(value: number[]) => updateValue('materials', value[0])}
              min={0}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Results</h4>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${hourlyRate}
            </div>
            <p className="text-sm text-muted-foreground">Minimum Hourly Rate</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="font-semibold text-blue-600">
                ${Math.round(annualRevenue).toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">Annual Revenue</p>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="font-semibold text-purple-600">
                {Math.round(profitMargin)}%
              </div>
              <p className="text-muted-foreground text-xs">Profit Margin</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Recommendation:</p>
                <p className="text-blue-800 dark:text-blue-200">
                  {hourlyRate < 50 ? 'Consider reducing expenses or increasing efficiency' :
                   hourlyRate > 100 ? 'Ensure your market can support this rate' :
                   'This rate appears competitive for most markets'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CashFlowCalculator = ({ fields }: any) => {
  const [values, setValues] = useState<{ [key: string]: number }>({
    startingCash: 15000,
    monthlyRevenue: 12000,
    monthlyExpenses: 8000,
    payroll: 3000,
    collections: 85
  });

  const updateValue = (field: string, value: number) => {
    setValues({ ...values, [field]: value });
  };

  const calculateCashFlow = (month: number) => {
    const { startingCash, monthlyRevenue, monthlyExpenses, payroll, collections } = values;
    const monthlyNetCash = (monthlyRevenue * collections / 100) - monthlyExpenses - payroll;
    return startingCash + (monthlyNetCash * month);
  };

  const month1 = calculateCashFlow(1);
  const month2 = calculateCashFlow(2);
  const month3 = calculateCashFlow(3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className="font-semibold">Cash Flow Inputs</h4>
        
        <div className="space-y-4">
          {Object.entries(values).map(([key, value]) => {
            const field = fields.find((f: unknown) => f.name === key);
            return (
              <div key={key}>
                <Label>{field?.label}</Label>
                <div className="relative">
                  {field?.type === 'currency' && (
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => updateValue(key, parseFloat(e.target.value) || 0)}
                    className={field?.type === 'currency' ? 'pl-8' : '}
                  />
                  {field?.type === 'percentage' && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">3-Month Forecast</h4>
        
        <div className="space-y-4">
          {[
            { month: 1, value: month1, label: 'Month 1' },
            { month: 2, value: month2, label: 'Month 2' },
            { month: 3, value: month3, label: 'Month 3' }
          ].map(({ month, value, label }) => (
            <div key={month} className={'p-4 rounded-lg border ${
              value < 5000 ? 'bg-red-50 border-red-200 dark:bg-red-950/20' :
              value < 10000 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20' :
              'bg-green-50 border-green-200 dark:bg-green-950/20`
              }'}>'
              <div className="flex items-center justify-between">
                <span className="font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  <span className={'text-lg font-bold ${
                    value < 5000 ? 'text-red-600' :
                    value < 10000 ? 'text-yellow-600' :
                    'text-green-600'
              }'}>'
                    ${Math.round(value).toLocaleString()}
                  </span>
                  {value < 5000 ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Cash Flow Alert:</p>
              <p className="text-blue-800 dark:text-blue-200">
                {Math.min(month1, month2, month3) < 5000 ? 
                  'Warning: Cash flow may become critically low. Consider a line of credit or factoring receivables.' :
                  'Cash flow looks healthy. Consider investing excess cash in business growth.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessScenario = ({ scenario }: any) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setTimeout(() => setShowOutcome(true), 500);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
        <h4 className="font-semibold mb-2">{scenario.context}</h4>
        <p className="text-sm text-muted-foreground">{scenario.challenge}</p>
      </div>

      <div className="space-y-3">
        {scenario.options.map((option: unknown, index: number) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
            className={'w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedOption === index
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20'
              }'}
            onClick={() => handleOptionSelect(index)}
            disabled={selectedOption !== null}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option.label}</span>
              {selectedOption === index && (
                <div className={'px-2 py-1 rounded text-xs font-medium ${
                  option.impact >= 2 ? 'bg-green-100 text-green-800' :
                  option.impact >= 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
              }'}>
                  {option.impact >= 2 ? 'Excellent' :
                   option.impact >= 0 ? 'Good' : 'Poor'}
                </div>
              )}
            </div>
          </button>
          </motion.div>
        ))}
      </div>

      {showOutcome && selectedOption !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className={'p-4 rounded-lg border ${
            scenario.options[selectedOption].impact >= 2 
              ? 'bg-green-50 border-green-200 dark:bg-green-950/20' 
              : scenario.options[selectedOption].impact >= 0
              ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20'
              : 'bg-red-50 border-red-200 dark:bg-red-950/20'
              }'}>'
          <h4 className="font-medium mb-2">Outcome:</h4>
          <p className="text-sm">{scenario.options[selectedOption].outcome}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function BusinessChapter1Page() {
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
    if (question.type === 'multiple-choice') {
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
      case 'calculator':
        return (
          <div className="space-y-4">
            {question.calculator?.type === 'hourly-rate' && (
              <HourlyRateCalculator fields={question.calculator.fields} />
            )}
            {question.calculator?.type === 'cash-flow' && (
              <CashFlowCalculator fields={question.calculator.fields} />
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

      case 'scenario':
        return (
          <div className="space-y-4">
            <BusinessScenario scenario={question.scenario} />
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

      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                className={'w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[question.id] === index
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20'
              }'}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {answers[question.id] === index && (
                    <div className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {isCorrect ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </div>
                  )}
                </div>
              </button>
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href="/courses/business-fundamentals">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          
          <Badge variant="outline" className="px-4 py-2">
            Chapter 1: Financial Fundamentals
          </Badge>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Lesson {currentQuestion + 1} of {questions.length}</span>
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
          <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardTitle className="flex items-center gap-3">
              <div className={'w-10 h-10 rounded-lg bg-gradient-to-br ${
                question.type === 'calculator' ? 'from-green-500 to-emerald-500' :
                question.type === 'scenario' ? 'from-blue-500 to-cyan-500' :
                question.type === 'multiple-choice' ? 'from-purple-500 to-violet-500' :
                'from-orange-500 to-amber-500'} flex items-center justify-center'}>
                {question.type === 'calculator' ? <Calculator className="h-5 w-5 text-white" /> :
                 question.type === 'scenario' ? <Target className="h-5 w-5 text-white" /> :
                 question.type === 'multiple-choice' ? <CheckCircle className="h-5 w-5 text-white" /> :
                 <DollarSign className="h-5 w-5 text-white" />}
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
                  className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200"
                >
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Key Insights
                  </h4>
                  <p className="text-green-800 dark:text-green-200">
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
                  ? 'bg-green-600' 
                  : index < currentQuestion 
                  ? 'bg-emerald-500' 
                  : 'bg-neutral-200'
              }'}
            />
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Link href="/courses/business-fundamentals">
              Complete Chapter
              <CheckCircle className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button
            onClick={nextQuestion}
            disabled={!isAnswered}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
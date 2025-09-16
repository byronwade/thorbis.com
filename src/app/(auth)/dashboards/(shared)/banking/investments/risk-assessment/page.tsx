'use client'

"use client";

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';

import { Textarea } from '@/components/ui/textarea';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  PieChart,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Briefcase,
  Calculator,
  Award,
  FileText,
  ArrowRight,
  ArrowLeft,
  Info,
  Lightbulb
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';


/**
 * Risk Assessment & Investment Profile Setup Page
 * 
 * Features:
 * - Comprehensive risk tolerance questionnaire
 * - Investment experience assessment
 * - Financial situation analysis
 * - Goal-based investment planning
 * - Risk capacity vs. risk tolerance evaluation
 * - Personalized asset allocation recommendations
 * - Investment strategy suggestions
 * - Regulatory compliance (suitability rules)
 * - Profile updates and monitoring
 * - Educational content and guidance
 * 
 * Integration:
 * - Regulatory compliance frameworks
 * - Modern portfolio theory calculations
 * - Behavioral finance insights
 * - Risk management algorithms
 */
export default function RiskAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [riskProfile, setRiskProfile] = useState<unknown>(null);
  const [showResults, setShowResults] = useState(false);

  const totalSteps = 6;

  // Risk assessment questions
  const questions = {
    1: {
      title: "Investment Experience",
      subtitle: "Tell us about your investment background",
      questions: [
        {
          id: "experience_years",
          text: "How long have you been investing?",
          type: "select",
          options: [
            { value: "none", label: "No experience" },
            { value: "1-2", label: "1-2 years" },
            { value: "3-5", label: "3-5 years" },
            { value: "6-10", label: "6-10 years" },
            { value: "10+", label: "More than 10 years" }
          ]
        },
        {
          id: "investment_types",
          text: "Which investment types have you used?",
          type: "multiselect",
          options: [
            { value: "stocks", label: "Individual Stocks" },
            { value: "bonds", label: "Bonds" },
            { value: "etfs", label: "ETFs/Index Funds" },
            { value: "mutual_funds", label: "Mutual Funds" },
            { value: "options", label: "Options" },
            { value: "crypto", label: "Cryptocurrency" },
            { value: "real_estate", label: "Real Estate" }
          ]
        },
        {
          id: "knowledge_level",
          text: "How would you rate your investment knowledge?",
          type: "select",
          options: [
            { value: "beginner", label: "Beginner - Limited knowledge" },
            { value: "intermediate", label: "Intermediate - Some knowledge" },
            { value: "advanced", label: "Advanced - Extensive knowledge" },
            { value: "expert", label: "Expert - Professional level" }
          ]
        }
      ]
    },
    2: {
      title: "Financial Situation",
      subtitle: "Help us understand your financial circumstances",
      questions: [
        {
          id: "annual_income",
          text: "What is your annual household income?",
          type: "select",
          options: [
            { value: "0-50k", label: "Under $50,000" },
            { value: "50k-100k", label: "$50,000 - $100,000" },
            { value: "100k-200k", label: "$100,000 - $200,000" },
            { value: "200k-500k", label: "$200,000 - $500,000" },
            { value: "500k+", label: "Over $500,000" }
          ]
        },
        {
          id: "net_worth",
          text: "What is your estimated net worth?",
          type: "select",
          options: [
            { value: "0-100k", label: "Under $100,000" },
            { value: "100k-500k", label: "$100,000 - $500,000" },
            { value: "500k-1m", label: "$500,000 - $1,000,000" },
            { value: "1m-5m", label: "$1,000,000 - $5,000,000" },
            { value: "5m+", label: "Over $5,000,000" }
          ]
        },
        {
          id: "emergency_fund",
          text: "Do you have an emergency fund covering 3-6 months of expenses?",
          type: "select",
          options: [
            { value: "yes", label: "Yes, I have adequate emergency savings" },
            { value: "partial", label: "I have some emergency savings but not enough" },
            { value: "no", label: "No, I don't have emergency savings" }'
          ]
        }
      ]
    },
    3: {
      title: "Investment Goals",
      subtitle: "What are you investing for?",
      questions: [
        {
          id: "primary_goal",
          text: "What is your primary investment goal?",
          type: "select",
          options: [
            { value: "retirement", label: "Retirement planning" },
            { value: "wealth_building", label: "Long-term wealth building" },
            { value: "income", label: "Generate current income" },
            { value: "major_purchase", label: "Save for a major purchase" },
            { value: "education", label: "Education funding" },
            { value: "preservation", label: "Wealth preservation" }
          ]
        },
        {
          id: "time_horizon",
          text: "When do you expect to need this money?",
          type: "select",
          options: [
            { value: "1-3", label: "1-3 years" },
            { value: "3-5", label: "3-5 years" },
            { value: "5-10", label: "5-10 years" },
            { value: "10-20", label: "10-20 years" },
            { value: "20+", label: "More than 20 years" }
          ]
        },
        {
          id: "investment_amount",
          text: "How much do you plan to invest initially?",
          type: "select",
          options: [
            { value: "1k-5k", label: "$1,000 - $5,000" },
            { value: "5k-25k", label: "$5,000 - $25,000" },
            { value: "25k-100k", label: "$25,000 - $100,000" },
            { value: "100k-500k", label: "$100,000 - $500,000" },
            { value: "500k+", label: "More than $500,000" }
          ]
        }
      ]
    },
    4: {
      title: "Risk Tolerance",
      subtitle: "How comfortable are you with investment risk?",
      questions: [
        {
          id: "market_decline",
          text: "If your portfolio lost 20% in value over 6 months, you would: ',"
          type: "select",
          options: [
            { value: "panic_sell", label: "Sell everything immediately" },
            { value: "sell_some", label: "Sell some investments to reduce risk" },
            { value: "hold", label: "Hold and wait for recovery" },
            { value: "buy_more", label: "Buy more at lower prices" }
          ]
        },
        {
          id: "volatility_comfort",
          text: "How comfortable are you with portfolio volatility?",
          type: "select",
          options: [
            { value: "very_low", label: "I prefer very stable, low-risk investments" },
            { value: "low", label: "I can accept small fluctuations for slightly higher returns" },
            { value: "moderate", label: "I can accept moderate ups and downs for good long-term returns" },
            { value: "high", label: "I'm comfortable with high volatility for potentially higher returns" }'
          ]
        },
        {
          id: "loss_reaction",
          text: "What would concern you most about investing?",
          type: "select",
          options: [
            { value: "losing_money", label: "Losing money" },
            { value: "missing_gains", label: "Missing out on potential gains" },
            { value: "complexity", label: "Not understanding my investments" },
            { value: "market_timing", label: "Buying or selling at the wrong time" }
          ]
        }
      ]
    },
    5: {
      title: "Investment Preferences",
      subtitle: "Tell us about your investment preferences",
      questions: [
        {
          id: "investment_style",
          text: "Which investment approach appeals to you most?",
          type: "select",
          options: [
            { value: "passive", label: "Passive - Buy and hold broad market funds" },
            { value: "active", label: "Active - Pick individual stocks and time the market" },
            { value: "balanced", label: "Balanced - Mix of passive and active strategies" },
            { value: "robo", label: "Automated - Let algorithms manage my portfolio" }
          ]
        },
        {
          id: "esg_preference",
          text: "Are you interested in ESG (Environmental, Social, Governance) investing?",
          type: "select",
          options: [
            { value: "very_important", label: "Very important - Primary consideration" },
            { value: "somewhat", label: "Somewhat important - Nice to have" },
            { value: "not_important", label: "Not important - Focus on returns only" },
            { value: "avoid", label: "I prefer to avoid ESG-focused investments" }
          ]
        },
        {
          id: "international_exposure",
          text: "How much international exposure do you want?",
          type: "select",
          options: [
            { value: "none", label: "None - US investments only" },
            { value: "low", label: "Low - 10-20% international" },
            { value: "moderate", label: "Moderate - 20-40% international" },
            { value: "high", label: "High - 40%+ international" }
          ]
        }
      ]
    },
    6: {
      title: "Final Considerations",
      subtitle: "A few final questions to complete your profile",
      questions: [
        {
          id: "rebalancing",
          text: "How often would you like to rebalance your portfolio?",
          type: "select",
          options: [
            { value: "automatic", label: "Automatic - Let the system handle it" },
            { value: "quarterly", label: "Quarterly" },
            { value: "annually", label: "Annually" },
            { value: "manual", label: "I'll rebalance manually when needed" }'
          ]
        },
        {
          id: "tax_considerations",
          text: "How important are tax considerations in your investment strategy?",
          type: "select",
          options: [
            { value: "very_important", label: "Very important - Tax efficiency is a priority" },
            { value: "important", label: "Important - Consider but don't prioritize over returns" },'
            { value: "not_important", label: "Not important - Focus on pre-tax returns" }
          ]
        },
        {
          id: "additional_notes",
          text: "Any additional information about your investment goals or preferences?",
          type: "textarea",
          optional: true
        }
      ]
    }
  };

  // Calculate risk profile based on answers
  const calculateRiskProfile = () => {
    const riskScore = 0;
    
    // Experience scoring
    const experience = answers.experience_years;
    if (experience === "none") riskScore += 1;
    else if (experience === "1-2") riskScore += 2;
    else if (experience === "3-5") riskScore += 3;
    else if (experience === "6-10") riskScore += 4;
    else if (experience === "10+") riskScore += 5;

    // Risk tolerance scoring
    const marketDecline = answers.market_decline;
    if (marketDecline === "panic_sell") riskScore += 1;
    else if (marketDecline === "sell_some") riskScore += 2;
    else if (marketDecline === "hold") riskScore += 4;
    else if (marketDecline === "buy_more") riskScore += 5;

    const volatility = answers.volatility_comfort;
    if (volatility === "very_low") riskScore += 1;
    else if (volatility === "low") riskScore += 2;
    else if (volatility === "moderate") riskScore += 4;
    else if (volatility === "high") riskScore += 5;

    // Time horizon scoring
    const timeHorizon = answers.time_horizon;
    if (timeHorizon === "1-3") riskScore += 1;
    else if (timeHorizon === "3-5") riskScore += 2;
    else if (timeHorizon === "5-10") riskScore += 3;
    else if (timeHorizon === "10-20") riskScore += 4;
    else if (timeHorizon === "20+") riskScore += 5;

    // Determine risk category
    let category, description, allocation;
    if (riskScore <= 6) {
      category = "Conservative";
      description = "Focus on capital preservation with minimal volatility";
      allocation = { stocks: 20, bonds: 70, cash: 10 };
    } else if (riskScore <= 10) {
      category = "Moderate Conservative";
      description = "Balanced approach favoring stability with some growth";
      allocation = { stocks: 40, bonds: 55, cash: 5 };
    } else if (riskScore <= 14) {
      category = "Moderate";
      description = "Balanced mix of growth and stability";
      allocation = { stocks: 60, bonds: 35, cash: 5 };
    } else if (riskScore <= 18) {
      category = "Moderate Aggressive";
      description = "Growth-focused with moderate risk tolerance";
      allocation = { stocks: 80, bonds: 20, cash: 0 };
    } else {
      category = "Aggressive";
      description = "Maximum growth potential with high risk tolerance";
      allocation = { stocks: 95, bonds: 5, cash: 0 };
    }

    return {
      score: riskScore,
      category,
      description,
      allocation,
      recommendations: generateRecommendations(category, answers)
    };
  };

  const generateRecommendations = (category: string, answers: unknown) => {
    const recommendations = [];
    
    if (category === "Conservative") {
      recommendations.push("High-grade corporate bonds and Treasury securities");
      recommendations.push("Dividend-focused equity ETFs");
      recommendations.push("Money market funds for liquidity");
    } else if (category === "Moderate") {
      recommendations.push("Broad market index funds (S&P 500, Total Market)");
      recommendations.push("International developed market ETFs");
      recommendations.push("Investment-grade bond funds");
    } else if (category === "Aggressive") {
      recommendations.push("Growth-focused equity funds");
      recommendations.push("Small-cap and emerging market exposure");
      recommendations.push("Technology and innovation sector funds");
    }

    if (answers.esg_preference === "very_important") {
      recommendations.push("ESG-focused funds and sustainable investing options");
    }

    return recommendations;
  };

  const handleAnswer = (questionId: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      const profile = calculateRiskProfile();
      setRiskProfile(profile);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // In real implementation, this would save the risk profile
    console.log('Saving risk profile:', riskProfile);
    // Redirect to dashboard or next step
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Your Investment Profile</h1>
            <p className="text-neutral-400">
              Based on your responses, we've created a personalized investment profile'
            </p>
          </div>

          {/* Risk Profile Card */}
          <Card className="bg-neutral-900 border-neutral-800 p-8 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{riskProfile.category}</h2>
              <p className="text-neutral-400">{riskProfile.description}</p>
              <div className="mt-4">
                <Badge 
                  variant="secondary" 
                  className={'text-lg px-4 py-2 ${
                    riskProfile.category.includes('Conservative') ? 'bg-green-500/20 text-green-400' :
                    riskProfile.category.includes('Moderate') ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
              }'}
                >
                  Risk Score: {riskProfile.score}/20
                </Badge>
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Recommended Asset Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <PieChart className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-white">Stocks</h4>
                  <p className="text-2xl font-bold text-blue-500">{riskProfile.allocation.stocks}%</p>
                  <p className="text-xs text-neutral-400">Growth potential</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-white">Bonds</h4>
                  <p className="text-2xl font-bold text-green-500">{riskProfile.allocation.bonds}%</p>
                  <p className="text-xs text-neutral-400">Stability & income</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-white">Cash</h4>
                  <p className="text-2xl font-bold text-yellow-500">{riskProfile.allocation.cash}%</p>
                  <p className="text-xs text-neutral-400">Liquidity & safety</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Investment Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskProfile.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-center p-3 bg-neutral-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <p className="text-sm text-white">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-x-4">
            <Button 
              variant="outline" 
              className="border-neutral-700 text-white hover:bg-neutral-800"
              onClick={() => setShowResults(false)}
            >
              Retake Assessment
            </Button>
            <Button 
              className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white"
              onClick={handleComplete}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Profile Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestions = questions[currentStep as keyof typeof questions];
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Investment Risk Assessment</h1>
          <p className="text-neutral-400">
            Help us understand your investment goals and risk tolerance to create a personalized portfolio
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="bg-neutral-900 border-neutral-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-neutral-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-neutral-800" />
        </Card>

        {/* Question Card */}
        <Card className="bg-neutral-900 border-neutral-800 p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {currentStep === 1 && <Briefcase className="w-6 h-6 text-[#1C8BFF]" />}
              {currentStep === 2 && <DollarSign className="w-6 h-6 text-[#1C8BFF]" />}
              {currentStep === 3 && <Target className="w-6 h-6 text-[#1C8BFF]" />}
              {currentStep === 4 && <Shield className="w-6 h-6 text-[#1C8BFF]" />}
              {currentStep === 5 && <Activity className="w-6 h-6 text-[#1C8BFF]" />}
              {currentStep === 6 && <FileText className="w-6 h-6 text-[#1C8BFF]" />}
              
              <div>
                <h2 className="text-xl font-bold text-white">{currentQuestions.title}</h2>
                <p className="text-neutral-400">{currentQuestions.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {currentQuestions.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <label className="text-sm font-medium text-white block">
                  {question.text}
                  {question.optional && <span className="text-neutral-400"> (Optional)</span>}
                </label>
                
                {question.type === 'select' && (
                  <Select 
                    value={answers[question.id] || ""} 
                    onValueChange={(value) => handleAnswer(question.id, value)}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {question.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {question.type === 'multiselect' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options?.map((option) => (
                      <div 
                        key={option.value}
                        className={'p-3 rounded-lg border cursor-pointer transition-colors ${
                          (answers[question.id] || []).includes(option.value)
                            ? 'bg-[#1C8BFF]/20 border-[#1C8BFF]'
                            : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
              }'}
                        onClick={() => {
                          const current = answers[question.id] || [];
                          const updated = current.includes(option.value)
                            ? current.filter((v: string) => v !== option.value)
                            : [...current, option.value];
                          handleAnswer(question.id, updated);
                        }}
                      >
                        <span className="text-sm text-white">{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'textarea' && (
                  <Textarea
                    placeholder="Your thoughts..."
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white min-h-[100px]"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="border-neutral-700 text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white"
              disabled={currentQuestions.questions.some(q => 
                !q.optional && (!answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0))
              )}
            >
              {currentStep === totalSteps ? (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Complete Assessment
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Information Card */}
        <Card className="bg-blue-500/10 border-blue-500/20 p-4 mt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-400 mb-1">Why We Ask These Questions</h3>
              <p className="text-sm text-blue-300">
                This assessment helps us understand your financial situation, investment goals, and risk tolerance 
                to provide personalized investment recommendations that align with your needs and preferences.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
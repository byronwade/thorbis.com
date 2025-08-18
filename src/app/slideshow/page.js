"use client";
import { useState, useEffect } from "react"
import {
  Play,
  Pause,
  Users,
  CheckCircle,
  PieChart,
  CreditCard,
  DollarSign,
} from "lucide-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Pre‑launch honest slideshow content (the version we were working on)
const slides = [
  {
    id: 1,
    type: "hero",
    title: "Thorbis (Pre‑Launch)",
    subtitle: "The Operating System for Modern Business — in development",
    description:
      "We're building an all‑in‑one platform to unify customer acquisition, operations, and analytics. We have 0 customers today and are sharing our plans transparently.",
    stats: {
      stage: "Pre‑launch",
      customers: "0 (building)",
      waitlist: "Open",
      eta: "Beta Q4 2025"
    }
  },
  {
    id: 13,
    type: "pricing-simple",
    title: "Simple Pricing",
    subtitle: "Easy to understand. Start free. Pay as you grow.",
    plans: [
      {
        label: "Software (Flat $50/month)",
        icon: CreditCard,
        points: [
          "All core features",
          "Light data use included",
          "Cancel anytime"
        ],
        note: "Flat software fee. Taxes and usage may apply."
      },
      {
        label: "Free to Start",
        icon: CheckCircle,
        points: [
          "Try features",
          "No credit card",
          "Cancel anytime"
        ]
      },
      {
        label: "Ads (Pay per Click)",
        icon: DollarSign,
        points: [
          "Only when someone clicks",
          "You set the budget",
          "Example: ~$2 per click (varies)"
        ],
        note: "Examples only — pricing will be confirmed before launch."
      },
      {
        label: "Data use (Pay as you go)",
        icon: PieChart,
        points: [
          "Light use: included",
          "This means app data requests (not phone calls)",
          "AI features: pay for tokens used",
          "Example (market today): $0.0025 per 1,000 input tokens, $0.01 per 1,000 output tokens",
          "Non‑AI data: Standard $10 / 1,000 requests, Pro $20 / 1,000 (examples)"
        ],
        note: "Examples only (based on posted market rates) — we’ll publish final rates and free amounts."
      },
      {
        label: "LocalHub (Small Share)",
        icon: Users,
        points: [
          "When your hub earns, we keep a small piece",
          "Example: if hub earns $200, we may keep $50 (25%)",
          "We’ll confirm exact % before launch"
        ],
        note: "Illustration only — share may change."
      }
    ],
    footer: "Plain English. No tricks. We’ll publish clear pricing before launch."
  },
  {
    id: 14,
    type: "pricing-calculator",
    title: "Example Cost Calculator",
    subtitle: "Use simple numbers to see an estimate (examples only)",
    notes: [
      "These are examples — not final prices.",
      "We’ll publish clear pricing and free amounts before launch.",
      "Computer requests = app data requests (not phone calls)."
    ],
    baseMonthlyFee: 50,
    exampleRatePerThousand: 10.0,
    exampleRateRange: "e.g., $10.00 per 1,000 computer requests (Standard example)",
    assumptions: {
      requestsPerInvoice: 200,
      requestsPerEstimate: 150,
      requestsPerAICallMinute: 30,
      requestsPerAIMessage: 5,
      requestsPerGeocode: 1,
      requestsPerMapSearch: 10,
      requestsPerFileUpload: 25,
      requestsPerEmail: 5,
      requestsPerSms: 2,
      requestsPerWebhook: 1,
      requestsPerExternalFetch: 3
    }
  }
];

export default function ThorbisSlideshowApp() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case "ArrowRight":
        case " ":
          event.preventDefault()
          nextSlide()
          break
        case "ArrowLeft":
          event.preventDefault()
          prevSlide()
          break
        case "Enter":
          event.preventDefault()
          togglePlayback()
          break
        case "Home":
          event.preventDefault()
          goToSlide(0)
          break
        case "End":
          event.preventDefault()
          goToSlide(slides.length - 1)
          break
        case "Escape":
          event.preventDefault()
          setIsPlaying(false)
          break
        default:
          const num = Number.parseInt(event.key)
          if (num >= 1 && num <= 9) {
            event.preventDefault()
            goToSlide(num - 1)
          } else if (num === 0) {
            event.preventDefault()
            goToSlide(9)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide])

  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextSlide()
            return 0
          }
          return prev + 1
        })
      }, 150) // 15 second slides for more content
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSlide])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setProgress(0)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const slide = slides[currentSlide]

  const renderSlideContent = () => {
    switch (slide.type) {
      case "title":
        return (
          <div className="text-center space-y-3 md:space-y-6 lg:space-y-8">
            <div className="space-y-2 md:space-y-3 lg:space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-1 md:mb-2 lg:mb-4 tracking-tight leading-tight">
                {slide.title}
              </h1>
              <h2 className="text-lg md:text-2xl lg:text-3xl text-slate-400 font-normal tracking-wide">
                {slide.subtitle}
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
                {slide.description}
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-sm md:text-base lg:text-lg text-slate-400 leading-relaxed font-light">
                {slide.details}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Slide content not found</h1>
          </div>
        );
    }
  }

  return (
    <div
      className="h-screen w-screen bg-slate-950 text-white overflow-hidden fixed inset-0"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}>
      {/* Content */}
      <div className="relative z-10 h-full w-full flex flex-col">
        {/* Header - Minimalistic */}
        <header className="px-3 md:px-4 py-2 flex justify-between items-center flex-shrink-0">
          <div className="text-slate-500 text-xs md:text-sm font-mono">
            {currentSlide + 1}/{slides.length}
          </div>
          <button onClick={togglePlayback} className="text-slate-500 hover:text-white transition-colors p-1" aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="w-3 h-3 md:w-4 md:h-4" /> : <Play className="w-3 h-3 md:w-4 md:h-4" />}
          </button>
        </header>
        {isPlaying && (
          <div className="px-3 md:px-4 pb-1 flex-shrink-0">
            <div className="w-full bg-slate-900 rounded-full h-0.5">
              				<div className="bg-primary h-0.5 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8 lg:py-12">
              {renderSlideContent()}
            </div>
          </div>
        </div>
        {/* Navigation - Minimalistic */}
        <footer className="p-2 md:p-4 flex-shrink-0">
          <div className="flex justify-center items-center gap-2 md:gap-4">
            <button onClick={prevSlide} className="text-slate-500 hover:text-white transition-colors p-1 md:p-2" aria-label="Previous slide">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="flex gap-1 overflow-x-auto max-w-xs md:max-w-none">
              {slides.map((_, index) => (
                <button key={index} onClick={() => goToSlide(index)} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors flex-shrink-0 ${index === currentSlide ? "bg-primary" : "bg-slate-700 hover:bg-slate-600"}`} aria-label={`Go to slide ${index + 1}`} />
              ))}
            </div>
            <button onClick={nextSlide} className="text-slate-500 hover:text-white transition-colors p-1 md:p-2" aria-label="Next slide">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

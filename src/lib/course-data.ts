export interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'interactive' | 'quiz' | 'exam' | 'practical' | 'completion';
  score?: number;
  locked?: boolean;
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: 'plumbing' | 'retail' | 'software';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner to Advanced';
  duration: string;
  lessons: number;
  enrolled: number;
  rating: number;
  instructor: string;
  progress: number;
  xpReward: number;
  modules: Module[];
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
}

export const plumbingCourses: Course[] = [
  {
    id: 1,
    title: "Plumbing Fundamentals",
    description: "Master the basics of plumbing installation and repair with hands-on exercises and real-world scenarios.",
    category: "plumbing",
    difficulty: "Beginner",
    duration: "4 hours",
    lessons: 12,
    enrolled: 234,
    rating: 4.8,
    instructor: "Mike Rodriguez",
    progress: 25,
    xpReward: 500,
    tags: ["pipes", "installation", "safety"],
    modules: [
      {
        id: 1,
        title: "Introduction to Plumbing",
        lessons: [
          { id: 1, title: "What is Plumbing?", duration: "10 min", completed: true, type: "video" },
          { id: 2, title: "Tools of the Trade", duration: "15 min", completed: true, type: "interactive" },
          { id: 3, title: "Safety Protocols Quiz", duration: "5 min", completed: true, type: "quiz", score: 95 }
        ]
      },
      {
        id: 2,
        title: "Pipe Systems",
        lessons: [
          { id: 4, title: "Types of Pipes", duration: "20 min", completed: false, type: "video" },
          { id: 5, title: "Measuring and Cutting", duration: "25 min", completed: false, type: "interactive" },
          { id: 6, title: "Pipe Materials Quiz", duration: "5 min", completed: false, type: "quiz" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Advanced Pipe Systems",
    description: "Complex plumbing systems, commercial installations, and troubleshooting techniques for experienced plumbers.",
    category: "plumbing",
    difficulty: "Advanced",
    duration: "6 hours",
    lessons: 18,
    enrolled: 156,
    rating: 4.9,
    instructor: "Sarah Johnson",
    progress: 0,
    xpReward: 750,
    tags: ["systems", "troubleshooting", "commercial"],
    modules: [
      {
        id: 1,
        title: "Commercial Systems",
        lessons: [
          { id: 1, title: "Large Scale Installations", duration: "30 min", completed: false, type: "video" },
          { id: 2, title: "Pressure Systems", duration: "25 min", completed: false, type: "interactive" },
          { id: 3, title: "Code Compliance", duration: "20 min", completed: false, type: "video" }
        ]
      }
    ]
  }
];

export const retailCourses: Course[] = [
  {
    id: 4,
    title: "Customer Service Excellence",
    description: "Deliver outstanding customer service in retail environments with proven techniques and real scenarios.",
    category: "retail",
    difficulty: "Intermediate",
    duration: "3 hours",
    lessons: 10,
    enrolled: 445,
    rating: 4.6,
    instructor: "Emma Wilson",
    progress: 0,
    xpReward: 400,
    tags: ["communication", "service", "retail"],
    modules: [
      {
        id: 1,
        title: "Customer Communication",
        lessons: [
          { id: 1, title: "Active Listening Skills", duration: "15 min", completed: false, type: "video" },
          { id: 2, title: "Handling Difficult Customers", duration: "20 min", completed: false, type: "interactive" },
          { id: 3, title: "Communication Quiz", duration: "10 min", completed: false, type: "quiz" }
        ]
      },
      {
        id: 2,
        title: "Problem Resolution",
        lessons: [
          { id: 4, title: "Return & Exchange Policies", duration: "15 min", completed: false, type: "video" },
          { id: 5, title: "Complaint Handling", duration: "25 min", completed: false, type: "interactive" },
          { id: 6, title: "De-escalation Techniques", duration: "20 min", completed: false, type: "video" }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Point of Sale Mastery",
    description: "Master POS systems, transaction processing, and retail technology for efficient customer service.",
    category: "retail",
    difficulty: "Beginner",
    duration: "2.5 hours",
    lessons: 9,
    enrolled: 389,
    rating: 4.5,
    instructor: "David Kim",
    progress: 0,
    xpReward: 350,
    tags: ["pos", "transactions", "systems"],
    modules: [
      {
        id: 1,
        title: "POS Basics",
        lessons: [
          { id: 1, title: "System Overview", duration: "15 min", completed: false, type: "video" },
          { id: 2, title: "Processing Transactions", duration: "20 min", completed: false, type: "interactive" },
          { id: 3, title: "Payment Methods", duration: "15 min", completed: false, type: "video" }
        ]
      }
    ]
  }
];

export const softwareCourses: Course[] = [
  {
    id: 3,
    title: "Thorbis Work Orders 101",
    description: "Learn to navigate and manage work orders in Thorbis software with step-by-step tutorials.",
    category: "software",
    difficulty: "Beginner",
    duration: "2 hours",
    lessons: 8,
    enrolled: 567,
    rating: 4.7,
    instructor: "Alex Chen",
    progress: 45,
    xpReward: 300,
    tags: ["software", "workflow", "management"],
    modules: [
      {
        id: 1,
        title: "Getting Started",
        lessons: [
          { id: 1, title: "Thorbis Dashboard Overview", duration: "10 min", completed: true, type: "video" },
          { id: 2, title: "Navigation Basics", duration: "15 min", completed: true, type: "interactive" },
          { id: 3, title: "Creating Work Orders", duration: "20 min", completed: false, type: "video" }
        ]
      },
      {
        id: 2,
        title: "Work Order Management",
        lessons: [
          { id: 4, title: "Scheduling & Dispatch", duration: "25 min", completed: false, type: "interactive" },
          { id: 5, title: "Customer Communication", duration: "15 min", completed: false, type: "video" },
          { id: 6, title: "Completing Work Orders", duration: "20 min", completed: false, type: "interactive" }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Thorbis Dispatching Pro",
    description: "Advanced dispatching features, optimization strategies, and workflow management for power users.",
    category: "software",
    difficulty: "Advanced",
    duration: "5 hours",
    lessons: 15,
    enrolled: 234,
    rating: 4.8,
    instructor: "Lisa Park",
    progress: 0,
    xpReward: 600,
    tags: ["dispatching", "optimization", "advanced"],
    modules: [
      {
        id: 1,
        title: "Advanced Features",
        lessons: [
          { id: 1, title: "Route Optimization", duration: "30 min", completed: false, type: "video" },
          { id: 2, title: "Resource Management", duration: "25 min", completed: false, type: "interactive" },
          { id: 3, title: "Performance Analytics", duration: "20 min", completed: false, type: "video" }
        ]
      }
    ]
  }
];

export const onboardingCourses: Course[] = [
  {
    id: 7,
    title: "New Employee Orientation",
    description: "Complete onboarding program covering company culture, policies, and getting started with our tools.",
    category: "software",
    difficulty: "Beginner",
    duration: "3 hours",
    lessons: 12,
    enrolled: 1234,
    rating: 4.9,
    instructor: "HR Team",
    progress: 0,
    xpReward: 400,
    tags: ["onboarding", "orientation", "company"],
    modules: [
      {
        id: 1,
        title: "Welcome to Thorbis",
        lessons: [
          { id: 1, title: "Company History & Mission", duration: "15 min", completed: false, type: "video" },
          { id: 2, title: "Our Values", duration: "10 min", completed: false, type: "interactive" },
          { id: 3, title: "Team Structure", duration: "20 min", completed: false, type: "video" }
        ]
      },
      {
        id: 2,
        title: "Getting Started",
        lessons: [
          { id: 4, title: "Account Setup", duration: "15 min", completed: false, type: "interactive" },
          { id: 5, title: "Basic Navigation", duration: "20 min", completed: false, type: "video" },
          { id: 6, title: "First Day Checklist", duration: "10 min", completed: false, type: "quiz" }
        ]
      }
    ]
  }
];

export const allCourses: Course[] = [
  // Brilliant-style Interactive Courses
  {
    id: 101,
    title: "Plumbing Fundamentals",
    description: "Master plumbing basics through interactive problem-solving and visual simulations",
    category: 'plumbing' as const,
    difficulty: 'Beginner' as const,
    duration: "4-6 hours",
    lessons: 41,
    enrolled: 1247,
    rating: 4.9,
    instructor: "Mike Rodriguez",
    progress: 0,
    xpReward: 850,
    tags: ["fundamentals", "interactive", "brilliant-style", "water-pressure", "pipes"],
    featured: true,
    modules: [
      {
        id: 1,
        title: "Understanding Water Pressure",
        lessons: [
          { id: 1, title: "Pressure Basics", duration: "8 min", completed: false, type: 'interactive' },
          { id: 2, title: "Flow Rate Calculations", duration: "12 min", completed: false, type: 'interactive' },
          { id: 3, title: "Pipe Sizing", duration: "10 min", completed: false, type: 'interactive' },
          { id: 4, title: "Pressure Drop Analysis", duration: "15 min", completed: false, type: 'quiz' }
        ]
      }
    ]
  },
  {
    id: 102,
    title: "Running a Successful Service Business",
    description: "Learn business skills through real-world scenarios, financial calculators, and strategic decision-making",
    category: 'software' as const,
    difficulty: 'Intermediate' as const,
    duration: "6-8 hours",
    lessons: 66,
    enrolled: 892,
    rating: 4.8,
    instructor: "Emma Wilson",
    progress: 0,
    xpReward: 1200,
    tags: ["business", "finance", "scenarios", "calculations", "management"],
    featured: true,
    isNew: true,
    modules: [
      {
        id: 1,
        title: "Financial Fundamentals",
        lessons: [
          { id: 1, title: "Pricing Calculator", duration: "20 min", completed: false, type: 'interactive' },
          { id: 2, title: "Cash Flow Forecasting", duration: "18 min", completed: false, type: 'interactive' },
          { id: 3, title: "Break-Even Analysis", duration: "15 min", completed: false, type: 'quiz' }
        ]
      }
    ]
  },
  {
    id: 103,
    title: "Thorbis Software Mastery",
    description: "Master our platform through hands-on simulations and interactive guided practice",
    category: 'software' as const,
    difficulty: 'Beginner' as const,
    duration: "5-7 hours",
    lessons: 72,
    enrolled: 1543,
    rating: 4.9,
    instructor: "Alex Chen",
    progress: 0,
    xpReward: 1000,
    tags: ["software", "thorbis", "simulator", "hands-on", "dashboard", "mobile"],
    featured: true,
    modules: [
      {
        id: 1,
        title: "Dashboard Navigation & Setup",
        lessons: [
          { id: 1, title: "Dashboard Tour", duration: "10 min", completed: false, type: 'interactive' },
          { id: 2, title: "Navigation Basics", duration: "8 min", completed: false, type: 'interactive' },
          { id: 3, title: "Quick Search", duration: "6 min", completed: false, type: 'interactive' },
          { id: 4, title: "Mastery Check", duration: "10 min", completed: false, type: 'quiz' }
        ]
      }
    ]
  },
  ...plumbingCourses,
  ...retailCourses,
  ...softwareCourses,
  ...onboardingCourses
];

export const getCourseById = (id: string): Course | undefined => {
  return allCourses.find(course => course.id.toString() === id);
};

export const getCoursesByCategory = (category: string): Course[] => {
  if (category === 'all') return allCourses;
  if (category === 'onboarding') return onboardingCourses;
  return allCourses.filter(course => course.category === category);
};
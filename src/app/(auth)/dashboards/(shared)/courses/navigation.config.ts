/**
 * Courses Navigation Configuration
 * 
 * Defines the navigation structure for the Learning Management System.
 * This is a shared feature available across all industries.
 */

import {
  BookOpen,
  Users,
  Trophy,
  BarChart3,
  Settings,
  Calendar,
  MessageSquare,
  Star,
  Clock,
  Award,
  Target,
  Briefcase,
  Home,
  Smartphone,
  Monitor
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  isNew?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export interface NavigationSection {
  title?: string
  items: NavigationItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface SidebarConfig {
  defaultOpen?: boolean
  showToggleIcon?: boolean
  collapsible?: boolean
  variant?: 'sidebar' | 'floating' | 'inset'
  width?: string
  position?: 'left' | 'right'
}

export const coursesNavigationConfig = {
  appName: 'Learning Management',
  industry: 'courses' as const,
  primaryColor: '#1C8BFF',
  icon: BookOpen,
  
  // Main dashboard route for courses
  dashboardHref: '/dashboards/courses',
  
  // Sidebar configuration
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '300px',  // Standard width for course navigation
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration
  header: {
    title: 'Learning Management',
    subtitle: 'Training, certification, and skill development',
    actions: [
      {
        label: 'Schedule Learning',
        href: '/dashboards/courses/schedule',
        icon: 'Calendar'
      },
      {
        label: 'Study Groups',
        href: '/dashboards/courses/study-groups',
        icon: 'Users'
      },
      {
        label: 'Achievements',
        href: '/dashboards/courses/achievements',
        icon: 'Trophy'
      }
    ]
  },

  // Courses-specific navigation sections - standardized structure
  sections: [
    {
      title: 'Learning Overview',
      defaultExpanded: true,
      collapsible: true,
      items: [
        { 
          name: 'Courses Overview', 
          href: '/dashboards/courses', 
          icon: BookOpen, 
          description: 'All courses and learning progress' 
        },
        { 
          name: 'My Learning', 
          href: '/dashboards/courses/my-learning', 
          icon: Target, 
          description: 'Your enrolled courses and progress',
          badge: '3'
        },
        { 
          name: 'Certificates', 
          href: '/dashboards/courses/certificates', 
          icon: Award, 
          description: 'Earned certifications and badges' 
        }
      ]
    },
    {
      title: 'Training Programs',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Business Fundamentals', 
          href: '/dashboards/courses/business-fundamentals', 
          icon: Briefcase, 
          description: 'Core business skills and knowledge' 
        },
        { 
          name: 'Thorbis Software Mastery', 
          href: '/dashboards/courses/thorbis-software-mastery', 
          icon: Monitor, 
          description: 'Platform training and best practices',
          isNew: true
        },
        { 
          name: 'Industry Specific', 
          href: '/dashboards/courses/industry-specific', 
          icon: Star, 
          description: 'Specialized training by industry' 
        }
      ]
    },
    {
      title: 'Community & Progress',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Study Groups', 
          href: '/dashboards/courses/study-groups', 
          icon: Users, 
          description: 'Collaborative learning groups' 
        },
        { 
          name: 'Leaderboard', 
          href: '/dashboards/courses/leaderboard', 
          icon: Trophy, 
          description: 'Learning achievements and rankings' 
        },
        { 
          name: 'Progress Reports', 
          href: '/dashboards/courses/reports', 
          icon: BarChart3, 
          description: 'Learning analytics and insights' 
        }
      ]
    }
  ] as NavigationSection[]
}

export type CoursesNavigationConfig = typeof coursesNavigationConfig
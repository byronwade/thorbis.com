"use client"

import { cn } from "@/lib/utils"

interface Vehicle3DIconProps {
  type: "sedan" | "suv" | "van" | "coupe" | "bus" | "truck"
  status: "active" | "idle" | "maintenance" | "offline"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  animate?: boolean
}

export function Vehicle3DIcon({ type, status, size = "md", className, animate = false }: Vehicle3DIconProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  const getStatusColors = (status: string) => {
    switch (status) {
      case "active":
        return {
          primary: "#b8860b", // Gold
          secondary: "#ffd700", // Lighter gold
          accent: "#8b5cf6", // Violet
          shadow: "rgba(184, 134, 11, 0.4)",
        }
      case "idle":
        return {
          primary: "#8b5cf6", // Violet
          secondary: "#a78bfa", // Lighter violet
          accent: "#b8860b", // Gold
          shadow: "rgba(139, 92, 246, 0.4)",
        }
      case "maintenance":
        return {
          primary: "#ef4444", // Red
          secondary: "#f87171", // Lighter red
          accent: "#b8860b", // Gold
          shadow: "rgba(239, 68, 68, 0.4)",
        }
      case "offline":
        return {
          primary: "#6b7280", // Gray
          secondary: "#9ca3af", // Lighter gray
          accent: "#4b5563", // Darker gray
          shadow: "rgba(107, 114, 128, 0.4)",
        }
      default:
        return {
          primary: "#b8860b",
          secondary: "#ffd700",
          accent: "#8b5cf6",
          shadow: "rgba(184, 134, 11, 0.4)",
        }
    }
  }

  const colors = getStatusColors(status)

  const SedanIcon = () => (
    <svg viewBox="0 0 100 60" className={cn(sizeClasses[size], className, animate && "vehicle-pulse")}>
      <defs>
        <linearGradient id={`sedan-gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
        <filter id={`sedan-shadow-${status}`}>
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor={colors.shadow} />
        </filter>
      </defs>

      {/* Car body */}
      <path
        d="M15 35 L20 25 L25 20 L75 20 L80 25 L85 35 L85 45 L80 50 L20 50 L15 45 Z"
        fill={`url(#sedan-gradient-${status})`}
        filter={`url(#sedan-shadow-${status})`}
      />

      {/* Windshield */}
      <path
        d="M25 25 L30 22 L70 22 L75 25 L70 30 L30 30 Z"
        fill="rgba(255,255,255,0.3)"
        stroke={colors.accent}
        strokeWidth="1"
      />

      {/* Wheels */}
      <circle cx="25" cy="45" r="8" fill={colors.accent} filter={`url(#sedan-shadow-${status})`} />
      <circle cx="75" cy="45" r="8" fill={colors.accent} filter={`url(#sedan-shadow-${status})`} />
      <circle cx="25" cy="45" r="5" fill={colors.primary} />
      <circle cx="75" cy="45" r="5" fill={colors.primary} />

      {/* Luxury details */}
      <rect x="30" y="32" width="40" height="2" fill={colors.accent} opacity="0.8" />
      <rect x="35" y="36" width="30" height="1" fill={colors.secondary} opacity="0.6" />
    </svg>
  )

  const SUVIcon = () => (
    <svg viewBox="0 0 100 70" className={cn(sizeClasses[size], className, animate && "vehicle-pulse")}>
      <defs>
        <linearGradient id={`suv-gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
        <filter id={`suv-shadow-${status}`}>
          <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor={colors.shadow} />
        </filter>
      </defs>

      {/* SUV body - taller and more robust */}
      <path
        d="M15 40 L18 25 L22 15 L78 15 L82 25 L85 40 L85 55 L80 60 L20 60 L15 55 Z"
        fill={`url(#suv-gradient-${status})`}
        filter={`url(#suv-shadow-${status})`}
      />

      {/* Windshield */}
      <path
        d="M22 25 L26 18 L74 18 L78 25 L74 35 L26 35 Z"
        fill="rgba(255,255,255,0.3)"
        stroke={colors.accent}
        strokeWidth="1.5"
      />

      {/* Wheels - larger for SUV */}
      <circle cx="25" cy="55" r="10" fill={colors.accent} filter={`url(#suv-shadow-${status})`} />
      <circle cx="75" cy="55" r="10" fill={colors.accent} filter={`url(#suv-shadow-${status})`} />
      <circle cx="25" cy="55" r="6" fill={colors.primary} />
      <circle cx="75" cy="55" r="6" fill={colors.primary} />

      {/* Luxury grille */}
      <rect x="30" y="38" width="40" height="3" fill={colors.accent} opacity="0.9" />
      <rect x="32" y="42" width="36" height="2" fill={colors.secondary} opacity="0.7" />
      <rect x="34" y="45" width="32" height="1" fill={colors.accent} opacity="0.5" />
    </svg>
  )

  const VanIcon = () => (
    <svg viewBox="0 0 110 70" className={cn(sizeClasses[size], className, animate && "vehicle-pulse")}>
      <defs>
        <linearGradient id={`van-gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
        <filter id={`van-shadow-${status}`}>
          <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor={colors.shadow} />
        </filter>
      </defs>

      {/* Van body - longer and boxier */}
      <path
        d="M10 40 L12 20 L15 12 L95 12 L98 20 L100 40 L100 55 L95 62 L15 62 L10 55 Z"
        fill={`url(#van-gradient-${status})`}
        filter={`url(#van-shadow-${status})`}
      />

      {/* Front windshield */}
      <path
        d="M15 25 L18 15 L35 15 L32 25 L28 32 L18 32 Z"
        fill="rgba(255,255,255,0.3)"
        stroke={colors.accent}
        strokeWidth="1.5"
      />

      {/* Side windows */}
      <rect x="40" y="18" width="50" height="12" fill="rgba(255,255,255,0.2)" stroke={colors.accent} strokeWidth="1" />

      {/* Wheels */}
      <circle cx="25" cy="55" r="9" fill={colors.accent} filter={`url(#van-shadow-${status})`} />
      <circle cx="85" cy="55" r="9" fill={colors.accent} filter={`url(#van-shadow-${status})`} />
      <circle cx="25" cy="55" r="5" fill={colors.primary} />
      <circle cx="85" cy="55" r="5" fill={colors.primary} />

      {/* Luxury details */}
      <rect x="20" y="35" width="70" height="2" fill={colors.accent} opacity="0.8" />
      <rect x="25" y="38" width="60" height="1" fill={colors.secondary} opacity="0.6" />
    </svg>
  )

  const CoupeIcon = () => (
    <svg viewBox="0 0 100 55" className={cn(sizeClasses[size], className, animate && "vehicle-pulse")}>
      <defs>
        <linearGradient id={`coupe-gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
        <filter id={`coupe-shadow-${status}`}>
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor={colors.shadow} />
        </filter>
      </defs>

      {/* Coupe body - sleek and low */}
      <path
        d="M15 32 L22 22 L28 18 L72 18 L78 22 L85 32 L85 42 L80 47 L20 47 L15 42 Z"
        fill={`url(#coupe-gradient-${status})`}
        filter={`url(#coupe-shadow-${status})`}
      />

      {/* Sleek windshield */}
      <path
        d="M28 22 L32 19 L68 19 L72 22 L68 28 L32 28 Z"
        fill="rgba(255,255,255,0.4)"
        stroke={colors.accent}
        strokeWidth="1"
      />

      {/* Sports wheels */}
      <circle cx="25" cy="42" r="7" fill={colors.accent} filter={`url(#coupe-shadow-${status})`} />
      <circle cx="75" cy="42" r="7" fill={colors.accent} filter={`url(#coupe-shadow-${status})`} />
      <circle cx="25" cy="42" r="4" fill={colors.primary} />
      <circle cx="75" cy="42" r="4" fill={colors.primary} />

      {/* Sports car details */}
      <path d="M30 30 L70 30" stroke={colors.accent} strokeWidth="2" opacity="0.8" />
      <path d="M35 33 L65 33" stroke={colors.secondary} strokeWidth="1" opacity="0.6" />

      {/* Spoiler */}
      <rect x="75" y="25" width="8" height="2" fill={colors.accent} />
    </svg>
  )

  const BusIcon = () => (
    <svg viewBox="0 0 120 75" className={cn(sizeClasses[size], className, animate && "vehicle-pulse")}>
      <defs>
        <linearGradient id={`bus-gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
        <filter id={`bus-shadow-${status}`}>
          <feDropShadow dx="4" dy="7" stdDeviation="5" floodColor={colors.shadow} />
        </filter>
      </defs>

      {/* Bus body - large and rectangular */}
      <path
        d="M8 45 L10 15 L12 8 L108 8 L110 15 L112 45 L112 62 L108 68 L12 68 L8 62 Z"
        fill={`url(#bus-gradient-${status})`}
        filter={`url(#bus-shadow-${status})`}
      />

      {/* Front windshield */}
      <path
        d="M12 25 L15 12 L25 12 L22 25 L18 35 L15 35 Z"
        fill="rgba(255,255,255,0.3)"
        stroke={colors.accent}
        strokeWidth="2"
      />

      {/* Passenger windows */}
      <rect x="30" y="15" width="15" height="18" fill="rgba(255,255,255,0.2)" stroke={colors.accent} strokeWidth="1" />
      <rect x="50" y="15" width="15" height="18" fill="rgba(255,255,255,0.2)" stroke={colors.accent} strokeWidth="1" />
      <rect x="70" y="15" width="15" height="18" fill="rgba(255,255,255,0.2)" stroke={colors.accent} strokeWidth="1" />
      <rect x="90" y="15" width="15" height="18" fill="rgba(255,255,255,0.2)" stroke={colors.accent} strokeWidth="1" />

      {/* Wheels */}
      <circle cx="25" cy="62" r="11" fill={colors.accent} filter={`url(#bus-shadow-${status})`} />
      <circle cx="95" cy="62" r="11" fill={colors.accent} filter={`url(#bus-shadow-${status})`} />
      <circle cx="25" cy="62" r="7" fill={colors.primary} />
      <circle cx="95" cy="62" r="7" fill={colors.primary} />

      {/* Luxury bus details */}
      <rect x="15" y="40" width="90" height="3" fill={colors.accent} opacity="0.9" />
      <rect x="20" y="44" width="80" height="2" fill={colors.secondary} opacity="0.7" />
    </svg>
  )

  const TruckIcon = () => (
    <svg viewBox="0 0 130 75" className={cn(sizeClasses[size], className, animate && "vehicle-pulse")}>
      <defs>
        <linearGradient id={`truck-gradient-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
        <filter id={`truck-shadow-${status}`}>
          <feDropShadow dx="4" dy="7" stdDeviation="5" floodColor={colors.shadow} />
        </filter>
      </defs>

      {/* Truck cab */}
      <path
        d="M10 45 L12 20 L15 12 L45 12 L48 20 L50 45 L50 58 L45 63 L15 63 L10 58 Z"
        fill={`url(#truck-gradient-${status})`}
        filter={`url(#truck-shadow-${status})`}
      />

      {/* Truck trailer */}
      <path
        d="M50 35 L52 15 L118 15 L120 35 L120 58 L115 63 L55 63 L50 58 Z"
        fill={`url(#truck-gradient-${status})`}
        filter={`url(#truck-shadow-${status})`}
      />

      {/* Cab windshield */}
      <path
        d="M15 25 L18 15 L35 15 L32 25 L28 35 L18 35 Z"
        fill="rgba(255,255,255,0.3)"
        stroke={colors.accent}
        strokeWidth="2"
      />

      {/* Trailer details */}
      <rect x="60" y="20" width="50" height="25" fill="rgba(255,255,255,0.1)" stroke={colors.accent} strokeWidth="1" />

      {/* Wheels */}
      <circle cx="25" cy="58" r="10" fill={colors.accent} filter={`url(#truck-shadow-${status})`} />
      <circle cx="75" cy="58" r="10" fill={colors.accent} filter={`url(#truck-shadow-${status})`} />
      <circle cx="105" cy="58" r="10" fill={colors.accent} filter={`url(#truck-shadow-${status})`} />
      <circle cx="25" cy="58" r="6" fill={colors.primary} />
      <circle cx="75" cy="58" r="6" fill={colors.primary} />
      <circle cx="105" cy="58" r="6" fill={colors.primary} />

      {/* Luxury truck details */}
      <rect x="15" y="48" width="100" height="2" fill={colors.accent} opacity="0.8" />
      <rect x="20" y="51" width="90" height="1" fill={colors.secondary} opacity="0.6" />
    </svg>
  )

  const renderIcon = () => {
    switch (type) {
      case "sedan":
        return <SedanIcon />
      case "suv":
        return <SUVIcon />
      case "van":
        return <VanIcon />
      case "coupe":
        return <CoupeIcon />
      case "bus":
        return <BusIcon />
      case "truck":
        return <TruckIcon />
      default:
        return <SedanIcon />
    }
  }

  return <div className={cn("inline-flex items-center justify-center", className)}>{renderIcon()}</div>
}

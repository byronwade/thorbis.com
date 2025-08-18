"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { 
  CheckCircle, 
  Sparkles,
  Loader2
} from "lucide-react";
import { logger } from "@lib/utils/logger";

/**
 * Micro-interactions System
 * Features: Hover effects, click feedback, loading states, success animations
 */
export default function MicroInteractions({ 
  children, 
  type = "default",
  onInteraction,
  disabled = false,
  className = ""
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [particles, setParticles] = useState([]);

  const router = useRouter();
  const pathname = usePathname();

  // Interaction types and their animations
  const interactionVariants = {
    default: {
      hover: { scale: 1.02, transition: { duration: 0.2 } },
      tap: { scale: 0.98, transition: { duration: 0.1 } },
      loading: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: "linear" } }
    },
    button: {
      hover: { 
        scale: 1.05, 
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: { duration: 0.2, ease: "easeOut" }
      },
      tap: { 
        scale: 0.95, 
        transition: { duration: 0.1 } 
      },
      success: {
        scale: [1, 1.2, 1],
        transition: { duration: 0.6, ease: "easeInOut" }
      }
    },
    navigation: {
      hover: { 
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      },
      tap: { 
        y: 0,
        transition: { duration: 0.1 } 
      }
    },
    card: {
      hover: { 
        y: -4,
        scale: 1.02,
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        transition: { duration: 0.3, ease: "easeOut" }
      },
      tap: { 
        scale: 0.98,
        transition: { duration: 0.1 } 
      }
    },
    notification: {
      initial: { x: 300, opacity: 0 },
      animate: { 
        x: 0, 
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
      },
      exit: { 
        x: 300, 
        opacity: 0,
        transition: { duration: 0.3, ease: "easeIn" }
      }
    },
    sparkle: {
      initial: { scale: 0, rotate: 0 },
      animate: { 
        scale: [0, 1.2, 0], 
        rotate: [0, 180, 360],
        transition: { duration: 0.8, ease: "easeInOut" }
      }
    }
  };

  const variants = interactionVariants[type] || interactionVariants.default;

  // Create sparkle particles
  const createSparkles = useCallback(() => {
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
      delay: i * 0.1,
      scale: Math.random() * 0.5 + 0.5
    }));
    
    setParticles(newParticles);
    setShowSparkle(true);
    
    setTimeout(() => {
      setShowSparkle(false);
      setParticles([]);
    }, 1000);
  }, []);

  // Handle interactions
  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
    
    // Log hover interactions for analytics
    logger.debug('Micro interaction hover', {
      action: 'micro_interaction_hover',
      type,
      pathname,
      timestamp: Date.now(),
    });
  }, [disabled, type, pathname]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback((event) => {
    if (disabled) return;
    
    // Create visual feedback
    if (type === "button" || type === "sparkle") {
      createSparkles();
    }
    
    // Show success animation for certain types
    if (type === "button") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 600);
    }

    // Call custom interaction handler
    if (onInteraction) {
      onInteraction(event);
    }

    // Log interaction
    logger.debug('Micro interaction click', {
      action: 'micro_interaction_click',
      type,
      pathname,
      timestamp: Date.now(),
    });
  }, [disabled, type, createSparkles, onInteraction, pathname]);

  // Loading simulation (for demo purposes)
  const simulateLoading = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 600);
    }, 2000);
  }, []);

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      variants={variants}
      initial={type === "notification" ? "initial" : false}
      animate={
        isLoading ? "loading" :
        showSuccess ? "success" :
        isPressed ? "tap" :
        isHovered ? "hover" :
        type === "notification" ? "animate" : "default"
      }
      exit={type === "notification" ? "exit" : undefined}
      onHoverStart={handleMouseEnter}
      onHoverEnd={handleMouseLeave}
      onTapStart={handleMouseDown}
      onTap={handleClick}
      whileTap={variants.tap}
      style={{ 
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1
      }}
    >
      {children}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded"
          >
            <div className="w-4 h-4 border-2 border-primary border-r-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Checkmark */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle Particles */}
      <AnimatePresence>
        {showSparkle && particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              scale: 0, 
              x: 0, 
              y: 0, 
              opacity: 0 
            }}
            animate={{ 
              scale: particle.scale,
              x: particle.x,
              y: particle.y,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 0.8,
              delay: particle.delay,
              ease: "easeOut"
            }}
            className="absolute top-1/2 left-1/2 pointer-events-none"
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hover Glow Effect */}
      <AnimatePresence>
        {isHovered && type === "button" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-primary rounded pointer-events-none"
            style={{ filter: "blur(8px)", zIndex: -1 }}
          />
        )}
      </AnimatePresence>

      {/* Ripple Effect */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 bg-primary/20 rounded-full pointer-events-none"
            style={{ 
              top: "50%", 
              left: "50%", 
              transform: "translate(-50%, -50%)" 
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Enhanced Button with Micro-interactions
 */
export function InteractiveButton({ 
  children, 
  onClick, 
  loading = false,
  success = false,
  variant = "default",
  ...props 
}) {
  return (
    <MicroInteractions 
      type="button" 
      onInteraction={onClick}
      disabled={loading}
    >
      <motion.button
        className={`
          relative px-4 py-2 rounded-lg font-medium transition-colors
          ${variant === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          ${variant === "secondary" ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}
          ${variant === "outline" ? "border border-border hover:bg-accent" : ""}
        `}
        disabled={loading}
        {...props}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Success!</span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </MicroInteractions>
  );
}

/**
 * Enhanced Card with Micro-interactions
 */
export function InteractiveCard({ 
  children, 
  onClick, 
  className = "",
  ...props 
}) {
  return (
    <MicroInteractions 
      type="card" 
      onInteraction={onClick}
      className={className}
    >
      <motion.div
        className="p-6 bg-card rounded-lg border border-border cursor-pointer"
        {...props}
      >
        {children}
      </motion.div>
    </MicroInteractions>
  );
}

/**
 * Notification Toast with Micro-interactions
 */
export function InteractiveNotification({ 
  children, 
  onDismiss,
  type = "info",
  className = ""
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (onDismiss) {
      setTimeout(onDismiss, 300);
    }
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <MicroInteractions 
      type="notification" 
      onInteraction={handleDismiss}
      className={className}
    >
      <motion.div
        className={`
          p-4 rounded-lg border shadow-lg cursor-pointer
          ${type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
          ${type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
          ${type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-800" : ""}
          ${type === "info" ? "bg-blue-50 border-blue-200 text-blue-800" : ""}
        `}
        layout
      >
        {children}
      </motion.div>
    </MicroInteractions>
  );
}

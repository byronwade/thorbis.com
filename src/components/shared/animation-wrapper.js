"use client";
import { useEffect } from 'react';

// Client component wrapper to trigger animations
export default function AnimationWrapper({ children }) {
  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      // Add animation trigger class to body to enable animations
      document.body.classList.add('animations-ready');
      
      // Find elements with animate classes and ensure they're visible
      const animatedElements = document.querySelectorAll('[class*="animate-"]');
      animatedElements.forEach(element => {
        element.style.visibility = 'visible';
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return children;
}

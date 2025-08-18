"use client";
import { useEffect } from 'react';

// Hook to trigger CSS animations on page load
export function useAnimationTrigger() {
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Find all elements with animation classes and trigger them
      const animatedElements = document.querySelectorAll('[class*="animate-"]');
      
      animatedElements.forEach((element, index) => {
        // Add a slight stagger delay
        const delay = index * 50; // 50ms stagger
        
        setTimeout(() => {
          element.style.animationPlayState = 'running';
        }, delay);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);
}

// Hook for intersection observer animations (scroll-triggered)
export function useScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            entry.target.classList.add('animate-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('[class*="animate-"]');
    animatedElements.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

export default useAnimationTrigger;

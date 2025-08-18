"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { 
  Clock, 
  Cloud, 
  CreditCard, 
  Headphones, 
  BarChart3, 
  Smartphone,
  Zap,
  Shield,
  Monitor,
  Wifi,
  Package
} from 'lucide-react';

const AppleStyleProductShowcase = ({ product }) => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);

  // Comprehensive feature sections with varied layouts
  const features = [
    {
      id: 'fast',
      title: 'Fast',
      subtitle: 'Incredibly fast.',
      description: 'Process payments in under 2 seconds. That\'s 4x faster than anything else. ARM architecture with local compute delivers lightning-fast performance.',
      stat: '2 seconds',
      detail: 'Payment processing',
      visual: 'speed',
      layout: 'split'
    },
    {
      id: 'design',
      title: 'Beautiful',
      subtitle: 'Sleek. Modern. Timeless.',
      description: 'Crafted from premium magnesium alloy with a matte graphite finish. The minimal design language speaks sophistication while the ergonomic form factor ensures comfort during the busiest service hours.',
      stat: '364mm',
      detail: 'Ultra-wide display',
      visual: 'design',
      layout: 'fullwidth'
    },
    {
      id: 'durable',
      title: 'Durable',
      subtitle: 'Built to last.',
      description: 'IP54 sealed. Fanless cooling. Drop resistant. Chemically strengthened glass. This is the most durable POS system ever engineered for commercial use.',
      stat: 'IP54 rated',
      detail: 'Industrial grade',
      visual: 'durability',
      layout: 'split'
    },
    {
      id: 'experience',
      title: 'Intuitive',
      subtitle: 'Designed for humans.',
      description: 'Every interaction has been carefully considered. From the responsive 15.6" display to the satisfying tactile feedback, using Thorbis POS feels natural and effortless.',
      visual: 'experience',
      layout: 'centered'
    },
    {
      id: 'secure',
      title: 'Secure',
      subtitle: 'Fort Knox level protection.',
      description: 'TPM 2.0 hardware security module. Bank-level encryption. PCI certified from day one. Your data and your customers\' information are protected by military-grade security.',
      stat: 'TPM 2.0',
      detail: 'Hardware security',
      visual: 'security',
      layout: 'split'
    },
    {
      id: 'ecosystem',
      title: 'Complete',
      subtitle: 'One system. Infinite possibilities.',
      description: 'Handheld terminals for tableside service. Kitchen displays for order management. Self-serve kiosks for fast-casual dining. All seamlessly connected.',
      visual: 'ecosystem-large',
      layout: 'showcase'
    },
    {
      id: 'materials',
      title: 'Premium',
      subtitle: 'Materials that matter.',
      description: 'Every component has been selected for both beauty and performance. Magnesium alloy chassis. Chemically strengthened aluminosilicate glass. Oleophobic coating that resists fingerprints.',
      visual: 'materials',
      layout: 'materials'
    },
    {
      id: 'reliable',
      title: 'Reliable',
      subtitle: 'Never miss a sale.',
      description: 'Built-in UPS battery keeps you running during power outages. Offline-first architecture means you can process sales even without internet. This system simply never stops working.',
      stat: '70 minutes',
      detail: 'Battery backup',
      visual: 'reliability',
      layout: 'split'
    },
    {
      id: 'performance',
      title: 'Superior',
      subtitle: 'Leave the competition behind.',
      description: 'Every metric that matters, Thorbis POS delivers unmatched performance. From payment speed to system reliability, we don\'t just meet industry standards - we set them.',
      visual: 'performance',
      layout: 'comparison'
    }
  ];

  // Intersection Observer for scroll-based animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionIndex = parseInt(entry.target.dataset.section);
            setActiveSection(sectionIndex);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = containerRef.current?.querySelectorAll('[data-section]');
    sections?.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white overflow-hidden">
      {/* Hero Section with Premium Thorbis Styling */}
      <section className="min-h-screen flex items-center justify-center relative" data-section="0">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-800" />
        
        <div className="relative z-10 text-center max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                New Product Launch
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-none bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
              {product.name.split(' ')[0]}
              <span className="block text-3xl md:text-5xl lg:text-6xl font-medium text-neutral-600 dark:text-neutral-400 bg-none bg-clip-text text-transparent bg-gradient-to-br from-neutral-600 to-neutral-500 dark:from-neutral-400 dark:to-neutral-500">
                {product.name.split(' ').slice(1).join(' ')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 mb-12 font-light max-w-4xl mx-auto leading-relaxed">
              Revolutionary technology meets elegant design. Experience the next generation of business solutions.
            </p>
          </motion.div>

          {/* Enhanced Product Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative mb-16"
          >
            <div className="max-w-2xl mx-auto relative">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 rounded-[3rem] blur-3xl scale-110" />
              
              {/* Main product container */}
              <div className="relative bg-gradient-to-br from-white via-neutral-50 to-neutral-100 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950 rounded-[3rem] p-16 shadow-2xl border border-neutral-200 dark:border-neutral-700">
                <div className="relative">
                  {/* Product icon with enhanced styling */}
                  <div className="w-64 h-64 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-3xl flex items-center justify-center shadow-inner border border-primary/30 dark:border-primary/30">
                    <Monitor className="w-40 h-40 text-primary dark:text-primary" />
                  </div>
                  
                  {/* Premium feature callouts with Thorbis styling */}
                  <motion.div 
                    className="absolute -top-8 -left-12 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl border border-neutral-200 dark:border-neutral-700"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>2s processing</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -bottom-8 -right-12 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl border border-neutral-200 dark:border-neutral-700"
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>IP54 sealed</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute top-1/2 -right-16 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl border border-neutral-200 dark:border-neutral-700"
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Enterprise</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center"
          >
            <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-3xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-2xl max-w-md mx-auto">
              <div className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                From ${product.price.toLocaleString()}
              </div>
              <div className="text-lg text-neutral-600 dark:text-neutral-300 mb-4">
                or ${Math.round(product.price / 24)}/mo. for 24 months
              </div>
              <div className="text-sm text-primary dark:text-primary font-semibold">
                ✓ 30-day free trial • ✓ No setup fees • ✓ Premium support
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Sections with Large Images */}
      {features.map((feature, index) => (
        <FeatureSection 
          key={feature.id}
          feature={feature}
          index={index + 1}
          isActive={activeSection === index + 1}
        />
      ))}

      {/* Enhanced Bento Grid Section */}
      <section className="py-32 bg-neutral-50 dark:bg-neutral-900" data-section={features.length + 2}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Complete Ecosystem
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-neutral-900 dark:text-white">
              Everything Included
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed">
              A comprehensive solution designed to streamline your entire business workflow
            </p>
          </motion.div>

          {/* Compact Bento Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[120px]"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <BentoCard section={{
              id: 'speed-compact',
              type: 'feature-compact',
              title: 'Lightning Fast',
              metric: '< 2s',
              detail: 'Payment time',
              icon: 'zap',
              color: 'blue',
              gridSpan: 'col-span-1'
            }} index={0} />
            
            <BentoCard section={{
              id: 'durability-compact', 
              type: 'feature-compact',
              title: 'Industrial Grade',
              metric: 'IP54',
              detail: 'Sealed & fanless',
              icon: 'shield',
              color: 'purple',
              gridSpan: 'col-span-1'
            }} index={1} />
            
            <BentoCard section={{
              id: 'security-compact',
              type: 'feature-compact', 
              title: 'Bank Security',
              metric: 'TPM 2.0',
              detail: 'Hardware chip',
              icon: 'lock',
              color: 'green',
              gridSpan: 'col-span-1'
            }} index={2} />
            
            <BentoCard section={{
              id: 'battery-compact',
              type: 'feature-compact',
              title: 'Always On',
              metric: '70min',
              detail: 'UPS backup',
              icon: 'battery',
              color: 'orange',
              gridSpan: 'col-span-1'
            }} index={3} />
            
            <BentoCard section={{
              id: 'processor-visual',
              type: 'visual-compact',
              title: 'ARM Power',
              subtitle: 'RK3588S 8-Core',
              visual: 'chip-compact',
              gridSpan: 'col-span-2'
            }} index={4} />
            
            <BentoCard section={{
              id: 'analytics-visual',
              type: 'visual-compact',
              title: 'Live Analytics',
              subtitle: 'Real-time insights',
              visual: 'analytics-compact',
              gridSpan: 'col-span-2'
            }} index={5} />
          </motion.div>
        </div>
      </section>

      {/* Enhanced Closing CTA Section */}
      <section className="py-32 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black dark:from-neutral-950 dark:via-black dark:to-neutral-900" data-section={features.length + 3}>
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Limited Time Offer
            </div>
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-white">
              Ready to Transform
              <span className="block text-neutral-400">Your Business?</span>
            </h2>
            
            <p className="text-xl text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of businesses that have already revolutionized their operations with Thorbis technology
            </p>
            
            <div className="mb-16">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 max-w-md mx-auto">
                <div className="text-5xl font-bold text-white mb-3">
                  ${product.price.toLocaleString()}
                </div>
                <div className="text-lg text-primary font-semibold mb-4">
                  Save ${(product.originalPrice - product.price).toLocaleString()} • Limited Time Only
                </div>
                <div className="text-sm text-neutral-300">
                  or ${Math.round(product.price / 24)}/month for 24 months
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto mb-12">
              <button className="flex-1 bg-white text-black py-4 px-8 rounded-2xl font-semibold hover:bg-neutral-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105">
                Add to Cart
              </button>
              <button className="flex-1 bg-transparent text-white py-4 px-8 rounded-2xl font-semibold border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200">
                Contact Sales
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                30-day trial
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Free shipping
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                24/7 support
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Large Feature Section Component with Multiple Layouts
const FeatureSection = ({ feature, index, isActive }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.3 });
  const isEven = index % 2 === 0;

  // Different layout variants
  const renderLayout = () => {
    switch (feature.layout) {
      case 'fullwidth':
        return (
          <div className="relative">
            {/* Background Image/Visual */}
            <div className="relative h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
              <AppleVisual feature={feature} />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-center max-w-4xl mx-auto px-6"
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-none tracking-tight text-neutral-900 dark:text-white">
                    {feature.title}
                  </h2>
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-medium mb-12 text-neutral-600 dark:text-neutral-300 leading-snug">
                    {feature.subtitle}
                  </h3>
                  <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 mb-16 leading-relaxed font-light max-w-3xl mx-auto">
                    {feature.description}
                  </p>
                  {feature.stat && (
                    <div className="text-4xl md:text-5xl font-semibold text-neutral-900 dark:text-white">
                      {feature.stat} <span className="text-xl text-neutral-600 dark:text-neutral-400 font-light">{feature.detail}</span>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        );

      case 'centered':
        return (
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              className="text-center max-w-5xl mx-auto px-6"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-thin mb-8 leading-none tracking-tight text-white">
                {feature.title}
              </h2>
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-medium mb-12 text-neutral-600 dark:text-neutral-300 leading-snug">
                {feature.subtitle}
              </h3>
              <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 mb-16 leading-relaxed font-light max-w-4xl mx-auto">
                {feature.description}
              </p>
              <div className="flex justify-center">
                <AppleVisual feature={feature} />
              </div>
            </motion.div>
          </div>
        );

      case 'showcase':
        return (
          <div className="relative min-h-screen flex items-center justify-center py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                                <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-none tracking-tight text-neutral-900 dark:text-white">
                {feature.title}
              </h2>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-8 text-neutral-600 dark:text-neutral-400 leading-snug">
                {feature.subtitle}
              </h3>
              <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-300 leading-relaxed font-light max-w-3xl mx-auto">
                {feature.description}
              </p>
                </motion.div>
              </div>
              <AppleVisual feature={feature} />
            </div>
          </div>
        );

      case 'materials':
        return (
          <div className="relative min-h-screen flex items-center justify-center py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
                {/* Content */}
                <motion.div
                  className="lg:col-span-2"
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-thin mb-6 leading-none tracking-tight text-white">
                    {feature.title}
                  </h2>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-light mb-8 text-gray-400 leading-snug">
                    {feature.subtitle}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed font-light">
                    {feature.description}
                  </p>
                  
                  {/* Materials List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'Magnesium Alloy', detail: 'Aerospace-grade AZ91D' },
                      { name: 'Aluminosilicate Glass', detail: 'Chemically strengthened' },
                      { name: 'Oleophobic Coating', detail: 'Fingerprint resistant' },
                      { name: 'Matte Finish', detail: '400-600 grit texture' }
                    ].map((material, i) => (
                      <motion.div
                        key={i}
                        className="border border-gray-700 rounded-2xl p-4 bg-gray-800/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <div className="text-white font-medium">{material.name}</div>
                        <div className="text-sm text-gray-400">{material.detail}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Visual */}
                <motion.div
                  className="flex justify-center lg:justify-end"
                  initial={{ opacity: 0, x: 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                >
                  <AppleVisual feature={feature} />
                </motion.div>
              </div>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="relative min-h-screen flex items-center justify-center py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h2 className="text-5xl md:text-7xl font-thin mb-6 leading-none tracking-tight text-white">
                    {feature.title}
                  </h2>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-light mb-8 text-gray-400 leading-snug">
                    {feature.subtitle}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light max-w-4xl mx-auto mb-16">
                    {feature.description}
                  </p>
                </motion.div>
              </div>
              <AppleVisual feature={feature} />
            </div>
          </div>
        );

      default: // 'split' layout
        return (
          <div className="max-w-7xl mx-auto px-6">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${
              isEven ? '' : 'lg:grid-flow-col-dense'
            }`}>
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={isEven ? '' : 'lg:col-start-2'}
              >
                <div className="max-w-xl">
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-thin mb-6 leading-none tracking-tight text-white">
                    {feature.title}
                  </h2>
                  
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-light mb-8 text-gray-400 leading-snug">
                    {feature.subtitle}
                  </h3>
                  
                  <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed font-light">
                    {feature.description}
                  </p>
                  
                  {/* Simple stat highlight */}
                  {feature.stat && (
                    <div className="flex items-baseline gap-4">
                      <div className="text-3xl md:text-4xl font-semibold text-white">
                        {feature.stat}
                      </div>
                      <div className="text-base text-gray-400">
                        {feature.detail}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className={`relative ${isEven ? '' : 'lg:col-start-1'}`}
              >
                <AppleVisual feature={feature} />
              </motion.div>
            </div>
          </div>
        );
    }
  };

  return (
    <section 
      ref={ref}
      className={`min-h-screen flex items-center justify-center relative py-20 ${
        feature.layout === 'fullwidth' ? 'p-0' : ''
      } ${index % 2 === 0 ? 'bg-white dark:bg-neutral-950' : 'bg-neutral-50 dark:bg-neutral-900'}`}
      data-section={index}
    >
      <div className="relative z-10 w-full">
        {renderLayout()}
      </div>
    </section>
  );
};

// Apple-style large visuals
const AppleVisual = ({ feature }) => {
  const visualComponents = {
    speed: (
      <div className="relative w-full max-w-lg mx-auto">
        <div className="aspect-square bg-neutral-800 rounded-3xl flex items-center justify-center shadow-2xl border border-neutral-700">
          <div className="text-center">
            <div className="text-6xl font-semibold text-white mb-4">2s</div>
            <div className="text-lg text-neutral-300">Payment complete</div>
          </div>
        </div>
        
        {/* Floating elements */}
        <motion.div 
          className="absolute -top-6 -right-6 bg-blue-600 shadow-lg rounded-2xl px-4 py-2 border border-blue-500"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="text-sm font-medium text-white">ARM RK3588S</div>
          <div className="text-xs text-blue-200">8-core processor</div>
        </motion.div>
      </div>
    ),
    
    design: (
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Large product showcase for fullwidth layout */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="w-80 h-80 lg:w-96 lg:h-96 relative">
            {/* Main product */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 rounded-[3rem] shadow-2xl transform rotate-3" />
            <div className="absolute inset-2 bg-gradient-to-br from-neutral-600 via-neutral-700 to-neutral-800 rounded-[2.5rem] flex items-center justify-center">
              <Monitor className="w-32 h-32 lg:w-40 lg:h-40 text-neutral-300" />
            </div>
            
            {/* Floating design elements */}
            <motion.div 
              className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="text-white text-xs font-medium text-center">
                <div>364mm</div>
                <div className="text-[10px] text-neutral-300">Ultra-wide</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
            >
              <div className="text-white text-xs font-medium text-center">
                <div>Mg Alloy</div>
                <div className="text-[10px] text-neutral-300">Aerospace</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    ),
    
    durability: (
      <div className="relative w-full max-w-lg mx-auto">
        <div className="aspect-square bg-neutral-800 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden border border-neutral-700">
          <div className="text-center text-white">
            <Shield className="w-24 h-24 mx-auto mb-4 text-neutral-300" />
            <div className="text-2xl font-semibold mb-2">IP54</div>
            <div className="text-sm text-neutral-400">Sealed & fanless</div>
          </div>
          
          {/* Water droplets effect */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${15 + (i % 3) * 20}%`
                }}
                animate={{
                  y: [0, 200],
                  opacity: [0.6, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    ),

    experience: (
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
          {/* UI Mockup */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Payment Processing</div>
                <div className="text-gray-400 text-sm">Tap, dip, or swipe</div>
              </div>
            </div>
            
            {/* Touch targets */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="bg-gray-700 rounded-xl p-4 h-16 flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-white text-2xl">{i}</div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="text-center text-white">
            <div className="text-sm text-neutral-400">15.6" Responsive Display</div>
            <div className="text-xs text-neutral-500">10-point multi-touch</div>
          </div>
        </div>
      </div>
    ),
    
    security: (
      <div className="relative w-full max-w-lg mx-auto">
        <div className="aspect-square bg-neutral-800 rounded-3xl flex items-center justify-center shadow-2xl border border-neutral-700">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-green-600 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="text-lg font-medium text-white mb-2">TPM 2.0 Chip</div>
            <div className="text-sm text-neutral-400">Hardware security</div>
          </div>
        </div>
        
        {/* Security indicators */}
        <motion.div 
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          PCI Certified
        </motion.div>
      </div>
    ),

    'ecosystem-large': (
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              name: 'Handheld Terminal', 
              icon: Smartphone, 
              features: ['6.5" Display', 'NFC + EMV', '5G Ready', 'Hot-swap Battery'],
              color: 'from-blue-500 to-cyan-500'
            },
            { 
              name: 'Kitchen Display', 
              icon: Monitor, 
              features: ['21.5" High-brightness', 'Glove Touch', 'IP54 Front', '1000 nits'],
              color: 'from-green-500 to-teal-500'
            },
            { 
              name: 'Self-Serve Kiosk', 
              icon: Package, 
              features: ['21.5" Interactive', 'ADA Compliant', 'Payment Integration', 'Floor Mount'],
              color: 'from-purple-500 to-pink-500'
            }
          ].map((device, i) => (
            <motion.div
              key={i}
              className={`bg-gradient-to-br ${device.color} p-6 rounded-3xl text-white shadow-2xl`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <device.icon className="w-16 h-16 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-4">{device.name}</h3>
              <ul className="space-y-2 text-sm opacity-90">
                {device.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        {/* Connection visualization */}
        <div className="mt-12 text-center">
          <motion.div
            className="inline-flex items-center gap-4 bg-neutral-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-neutral-700"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Wifi className="w-5 h-5 text-green-400" />
            <span className="text-white text-sm">Seamlessly Connected</span>
            <div className="flex space-x-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    ),

    materials: (
      <div className="relative w-full max-w-md mx-auto">
        <div className="relative">
          {/* Layered material visualization */}
          <motion.div 
            className="w-64 h-64 bg-gradient-to-br from-gray-600 to-gray-800 rounded-3xl shadow-2xl transform rotate-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div 
            className="absolute top-4 left-4 w-64 h-64 bg-gradient-to-br from-gray-500 to-gray-700 rounded-3xl shadow-xl transform -rotate-3"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
          <motion.div 
            className="absolute top-8 left-8 w-64 h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-600 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-center text-white">
              <Monitor className="w-20 h-20 mx-auto mb-4 text-gray-400" />
              <div className="text-sm font-medium">Graphite Finish</div>
              <div className="text-xs text-gray-400">400-600 grit</div>
            </div>
          </motion.div>
          
          {/* Material indicators */}
          <motion.div 
            className="absolute -top-4 -right-4 bg-gray-700 text-white px-3 py-2 rounded-xl text-xs font-medium border border-gray-600"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            AZ91D Alloy
          </motion.div>
        </div>
      </div>
    ),
    
    reliability: (
      <div className="relative w-full max-w-lg mx-auto">
        <div className="aspect-square bg-gray-800 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-700">
          <div className="text-center">
            <div className="w-16 h-24 mx-auto bg-green-500 rounded-lg flex items-center justify-center mb-4 relative">
              {/* Battery level indicator */}
              <div className="absolute inset-2 bg-green-400 rounded" />
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-400 rounded-full" />
            </div>
            <div className="text-lg font-medium text-white mb-2">70 minutes</div>
            <div className="text-sm text-gray-400">Battery backup</div>
          </div>
        </div>
        
        {/* Status indicator */}
        <motion.div 
          className="absolute top-4 right-4 flex items-center space-x-2 bg-gray-700 shadow-lg rounded-full px-3 py-2 border border-gray-600"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <div className="text-xs font-medium text-white">Always On</div>
        </motion.div>
      </div>
    ),

    performance: (
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side - Comparison Chart */}
          <div className="bg-gray-800/50 rounded-3xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Performance Comparison</h3>
            
            <div className="space-y-8">
              {[
                { metric: 'Payment Speed', thorbis: '2s', competitors: '5-8s', multiplier: '4x faster' },
                { metric: 'System Uptime', thorbis: '99.9%', competitors: '95%', multiplier: '5x reliable' },
                { metric: 'Boot Time', thorbis: '15s', competitors: '45s', multiplier: '3x faster' },
                { metric: 'Battery Backup', thorbis: '70min', competitors: '0min', multiplier: 'Always on' },
                { metric: 'Security Level', thorbis: 'TPM 2.0', competitors: 'Software', multiplier: 'Hardware' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="space-y-3"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <div className="flex justify-between items-center text-white font-medium">
                    <span>{item.metric}</span>
                    <span className="text-green-400 text-sm">{item.multiplier}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Thorbis bar */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">Thorbis POS</div>
                      <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600"
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          transition={{ duration: 0.5, delay: i * 0.05 + 0.2 }}
                        />
                      </div>
                      <div className="text-xs text-white font-medium">{item.thorbis}</div>
                    </div>
                    
                    {/* Competitor bar */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">Competitors</div>
                      <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-red-400 to-red-600"
                          initial={{ width: 0 }}
                          whileInView={{ width: '60%' }}
                          transition={{ duration: 0.5, delay: i * 0.05 + 0.3 }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">{item.competitors}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Right side - Key Stats */}
          <div className="space-y-6">
            {[
              { 
                title: 'Customer Satisfaction', 
                value: '4.9/5', 
                detail: '2,500+ reviews',
                color: 'from-green-500 to-emerald-500'
              },
              { 
                title: 'Processing Volume', 
                value: '$2.1B+', 
                detail: 'Annual transaction value',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                title: 'Active Locations', 
                value: '15,000+', 
                detail: 'Businesses served',
                color: 'from-purple-500 to-pink-500'
              },
              { 
                title: 'System Reliability', 
                value: '99.97%', 
                detail: 'Uptime guarantee',
                color: 'from-orange-500 to-red-500'
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl text-white shadow-xl`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg font-medium mb-1">{stat.title}</div>
                <div className="text-sm opacity-90">{stat.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom testimonial */}
        <motion.div
          className="mt-16 text-center bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="text-xl text-gray-300 mb-4 italic max-w-3xl mx-auto">
            "We switched to Thorbis POS and immediately saw a 40% reduction in checkout times. Our customers love how fast and reliable it is."
          </div>
          <div className="text-white font-medium">Sarah Chen, Restaurant Owner</div>
          <div className="text-sm text-gray-400">Downtown Bistro, San Francisco</div>
        </motion.div>
      </div>
    )
  };

  return visualComponents[feature.visual] || <div className="w-64 h-64 bg-gray-800 rounded-3xl" />;
};

// Bento Grid Card Component
const BentoCard = ({ section, index }) => {
  const getIconComponent = (iconName) => {
    const icons = {
      zap: Zap,
      shield: Shield,
      lock: Shield,
      battery: Clock,
      printer: Package
    };
    return icons[iconName] || Clock;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      green: 'from-green-500/20 to-green-600/20 border-green-500/30',
      orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      teal: 'from-teal-500/20 to-teal-600/20 border-teal-500/30'
    };
    return colors[color] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  };

  const renderContent = () => {
    switch (section.type) {
      case 'feature-compact':
        const IconComponent = getIconComponent(section.icon);
        return (
          <div className={`h-full flex flex-col justify-between p-4 bg-gradient-to-br ${getColorClasses(section.color)} border backdrop-blur-sm rounded-2xl`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white leading-tight">
                  {section.title}
                </h3>
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <div className="text-xl font-bold text-white">
                  {section.metric}
                </div>
                <div className="text-xs text-white/80">
                  {section.detail}
                </div>
              </div>
            </div>
          </div>
        );

      case 'visual-compact':
        return (
          <div className="h-full flex flex-col justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl">
            {section.visual === 'chip-compact' && (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <div className="text-white font-bold text-xs">ARM</div>
                </div>
                <h3 className="text-sm font-semibold mb-1 text-white">
                  {section.title}
                </h3>
                <p className="text-xs text-blue-300">
                  {section.subtitle}
                </p>
              </div>
            )}
            
            {section.visual === 'analytics-compact' && (
              <div className="text-center">
                <div className="grid grid-cols-7 gap-1 h-12 items-end mb-3">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <motion.div
                      key={i}
                      className="bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ duration: 0.4, delay: i * 0.025 }}
                    />
                  ))}
                </div>
                <h3 className="text-sm font-semibold mb-1 text-white">
                  {section.title}
                </h3>
                <p className="text-xs text-gray-300">
                  {section.subtitle}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`${section.gridSpan} hover:scale-[1.02] transition-transform duration-300`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      {renderContent()}
    </motion.div>
  );
};

export default AppleStyleProductShowcase;

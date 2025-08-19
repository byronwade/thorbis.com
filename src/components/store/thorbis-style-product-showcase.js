"use client";

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Zap,
  Shield,
  Monitor,
  Wifi,
  Battery,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Layers,
  Globe
} from 'lucide-react';

const ThorbisStyleProductShowcase = ({ product }) => {
  // Create deterministic random values based on product ID for SSR consistency
  const getDeterministicRandom = (seed, index = 0) => {
    const hash = product?.id?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) || 0;
    const combinedSeed = hash + index;
    const x = Math.sin(combinedSeed) * 10000;
    return x - Math.floor(x);
  };

  // Generate deterministic positions for particles
  const getParticlePosition = (index) => {
    const left = getDeterministicRandom(product?.id || 'default', index * 2) * 100;
    const top = getDeterministicRandom(product?.id || 'default', index * 2 + 1) * 100;
    return { left: `${left}%`, top: `${top}%` };
  };

  // Generate deterministic animation values
  const getAnimationValues = (index) => {
    const duration = 3 + getDeterministicRandom(product?.id || 'default', index * 3) * 2;
    const delay = getDeterministicRandom(product?.id || 'default', index * 3 + 1) * 2;
    return { duration, delay };
  };

  // Unique feature sections with different designs and layouts
  const features = [
    {
      id: 'performance',
      title: 'Lightning Fast',
      subtitle: '2-second payments',
      description: 'ARM architecture with local compute delivers unprecedented speed. Process transactions 4x faster than traditional systems.',
      stat: '2s',
      detail: 'Payment processing',
      icon: Zap,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      layout: 'split',
      visualStyle: 'solid',
      animationType: 'slide'
    },
    {
      id: 'security',
      title: 'Bank-Grade Security',
      subtitle: 'TPM 2.0 hardware',
      description: 'Military-grade encryption with TPM 2.0 security module. PCI certified from day one with zero compromise on protection.',
      stat: 'TPM 2.0',
      detail: 'Hardware security',
      icon: Shield,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      layout: 'stacked',
      visualStyle: 'geometric',
      animationType: 'fade'
    },
    {
      id: 'design',
      title: 'Premium Design',
      subtitle: 'Magnesium alloy chassis',
      description: 'Crafted from aerospace-grade materials with chemically strengthened glass. Oleophobic coating resists fingerprints.',
      stat: '364mm',
      detail: 'Ultra-wide display',
      icon: Monitor,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      layout: 'centered',
      visualStyle: 'minimal',
      animationType: 'scale'
    },
    {
      id: 'durability',
      title: 'Industrial Grade',
      subtitle: 'IP54 sealed',
      description: 'Drop resistant, fanless cooling, chemically strengthened glass. Built for the harshest commercial environments.',
      stat: 'IP54',
      detail: 'Water & dust proof',
      icon: CheckCircle,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      layout: 'hero',
      visualStyle: 'industrial',
      animationType: 'rotate'
    },
    {
      id: 'ecosystem',
      title: 'Complete Ecosystem',
      subtitle: 'Seamlessly connected',
      description: 'Mobile terminals, kitchen displays, and self-serve kiosks. All devices work together in perfect harmony.',
      stat: '3-in-1',
      detail: 'System integration',
      icon: Wifi,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      layout: 'cards',
      visualStyle: 'network',
      animationType: 'float'
    },
    {
      id: 'reliability',
      title: 'Always Online',
      subtitle: '70-minute backup',
      description: 'Built-in UPS battery and offline-first architecture. Never miss a sale, even during power outages.',
      stat: '70min',
      detail: 'Battery backup',
      icon: Battery,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      layout: 'timeline',
      visualStyle: 'energy',
      animationType: 'pulse'
    }
  ];

  // Bento grid layout configuration
  const bentoGridItems = [
    {
      id: 'hero',
      title: 'Thorbis POS Lite',
      subtitle: 'Next-Generation Payment Terminal',
      description: 'The most advanced point-of-sale system ever created',
      icon: Sparkles,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      size: 'large',
      className: 'col-span-2 row-span-2'
    },
    {
      id: 'performance',
      title: 'Lightning Fast',
      subtitle: '2s Payments',
      icon: Zap,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      size: 'medium',
      className: 'col-span-1 row-span-1'
    },
    {
      id: 'security',
      title: 'Bank-Grade',
      subtitle: 'TPM 2.0',
      icon: Shield,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      size: 'medium',
      className: 'col-span-1 row-span-1'
    },
    {
      id: 'design',
      title: 'Premium Design',
      subtitle: 'Aerospace Materials',
      icon: Monitor,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      size: 'small',
      className: 'col-span-1 row-span-1'
    },
    {
      id: 'durability',
      title: 'Industrial Grade',
      subtitle: 'IP54 Sealed',
      icon: CheckCircle,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      size: 'small',
      className: 'col-span-1 row-span-1'
    },
    {
      id: 'ecosystem',
      title: 'Complete Ecosystem',
      subtitle: '3-in-1 System',
      icon: Wifi,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      size: 'medium',
      className: 'col-span-1 row-span-1'
    },
    {
      id: 'reliability',
      title: 'Always Online',
      subtitle: '70min Backup',
      icon: Battery,
      color: 'primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      size: 'small',
      className: 'col-span-1 row-span-1'
    }
  ];

  const renderBentoGrid = () => {
    return (
      <section className="py-16 lg:py-24 bg-black relative overflow-hidden">
        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => {
            const position = getParticlePosition(i);
            const animation = getAnimationValues(i);
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/20 rounded-full"
                style={position}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: animation.duration,
                  repeat: Infinity,
                  delay: animation.delay,
                }}
              />
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-6 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Core Features
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover what makes Thorbis POS Lite the most advanced payment terminal ever created
            </p>
          </motion.div>

          {/* Enhanced Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
            {bentoGridItems.map((item, index) => {
              const IconComponent = item.icon;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                  whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                  className={`
                    ${item.className}
                    ${item.bgColor} 
                    ${item.borderColor} 
                    border rounded-2xl p-6 lg:p-8 
                    backdrop-blur-sm shadow-xl
                    relative overflow-hidden group
                    cursor-pointer transition-all duration-300
                    transform-gpu perspective-1000
                  `}
                >
                  {/* 3D Background Layers */}
                  <div className={`absolute inset-0 bg-${item.color}/5 group-hover:bg-${item.color}/15 transition-opacity duration-500`} />
                  <div className={`absolute -inset-1 bg-${item.color}/0 group-hover:bg-${item.color}/30 blur-xl transition-opacity duration-500`} />
                  
                  {/* Floating Particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-1 h-1 bg-${item.color} rounded-full opacity-60`}
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${20 + i * 20}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          x: [0, 10, 0],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </div>

                  {/* Geometric Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="grid grid-cols-3 gap-2 h-full">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className={`bg-${item.color} rounded-sm`}
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 h-full flex flex-col">
                    {/* Enhanced Icon with 3D Effect */}
                    <motion.div 
                      className={`w-12 h-12 lg:w-16 lg:h-16 bg-${item.color} rounded-2xl flex items-center justify-center mb-4 lg:mb-6 shadow-2xl relative`}
                      whileHover={{ 
                        scale: 1.1,
                        rotateY: 15,
                        transition: { duration: 0.3 }
                      }}
                    >
                      {/* Icon Glow */}
                      <div className={`absolute inset-0 bg-${item.color} rounded-2xl blur-md opacity-50`} />
                      <IconComponent className="w-6 h-6 lg:w-8 lg:h-8 text-white relative z-10" />
                      
                      {/* Floating Elements around Icon */}
                      <motion.div
                        className={`absolute -top-1 -right-1 w-3 h-3 bg-${item.color} rounded-full opacity-80`}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </motion.div>
                    
                    {/* Enhanced Content */}
                    <div className="flex-1">
                      <motion.h3 
                        className="text-lg lg:text-xl font-bold text-white mb-2"
                        whileHover={{ scale: 1.02 }}
                      >
                        {item.title}
                      </motion.h3>
                      
                      {item.subtitle && (
                        <motion.p 
                          className="text-sm lg:text-base text-muted-foreground mb-3"
                          whileHover={{ scale: 1.01 }}
                        >
                          {item.subtitle}
                        </motion.p>
                      )}
                      
                      {item.description && (
                        <motion.p 
                          className="text-sm text-muted-foreground leading-relaxed"
                          whileHover={{ scale: 1.01 }}
                        >
                          {item.description}
                        </motion.p>
                      )}

                      {/* Feature Stats (for hero card) */}
                      {item.id === 'hero' && (
                        <motion.div 
                          className="mt-4 grid grid-cols-2 gap-3"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="bg-black/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white">2s</div>
                            <div className="text-xs text-muted-foreground">Payments</div>
                          </div>
                          <div className="bg-black/20 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white">TPM 2.0</div>
                            <div className="text-xs text-muted-foreground">Security</div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Enhanced Arrow Indicator */}
                    <motion.div 
                      className="mt-auto pt-4"
                      whileHover={{ x: 5 }}
                    >
                      <motion.div 
                        className={`w-8 h-8 bg-${item.color} rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg`}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5,
                        }}
                      >
                        <ArrowRight className="w-4 h-4 text-white" />
                      </motion.div>
                    </motion.div>

                    {/* Interactive Border Glow */}
                    <motion.div
                      className={`absolute inset-0 border-2 border-${item.color}/20 rounded-2xl`}
                      animate={{
                        borderColor: [`hsl(var(--${item.color})/20)`, `hsl(var(--${item.color})/40)`, `hsl(var(--${item.color})/20)`],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-primary/25 transition-all duration-300"
            >
              Explore All Features
            </motion.button>
          </motion.div>
        </div>
      </section>
    );
  };

  const renderFeatureSection = (feature, index) => {
    const IconComponent = feature.icon;
    
    // Simplified rendering without complex animations for now
    return (
      <section key={index} className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">{feature.title}</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{feature.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h3 className="text-2xl font-semibold mb-4">{feature.subtitle}</h3>
              <p className="text-gray-300 mb-6">{feature.content}</p>
            </div>
            <div className="flex justify-center">
              {IconComponent && <IconComponent className="w-32 h-32 text-blue-500" />}
            </div>
          </div>
        </div>
      </section>
    );

    // Simplified layout rendering
    return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <motion.div
          style={{
            x: smoothContentX,
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
              className="space-y-4"
            >
              <div className="space-y-3">
            <motion.div 
              className={`inline-flex items-center gap-2 ${feature.bgColor} ${feature.borderColor} border px-3 py-1.5 rounded-full`}
              style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
            >
                  <IconComponent className={`w-4 h-4 text-${feature.color}`} />
                  <span className="text-xs font-semibold text-muted-foreground">{feature.subtitle}</span>
            </motion.div>
                
                <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                  {feature.title}
                </h2>
              </div>
              
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg">
                {feature.description}
              </p>

              <div className="pt-4">
            <motion.div 
              className={`inline-flex items-center gap-3 ${feature.bgColor} ${feature.borderColor} border px-4 py-3 rounded-xl`}
              style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
            >
                  <div className={`text-2xl lg:text-3xl font-bold text-${feature.color}`}>
                    {feature.stat}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {feature.detail}
              </div>
            </motion.div>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
          style={{
            x: smoothVisualX,
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
          className="relative"
        >
          {renderVisualStyle()}
        </motion.div>
      </div>
    );

    const renderStackedLayout = () => (
      <div className="text-center space-y-8">
        {/* Icon and Title */}
        <motion.div
          style={{
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
          className="space-y-4"
        >
          <div className={`w-20 h-20 bg-${feature.color} rounded-3xl flex items-center justify-center mx-auto shadow-2xl`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight">
            {feature.title}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            {feature.description}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          style={{
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6`}>
            <div className={`text-3xl font-bold text-${feature.color}`}>
              {feature.stat}
            </div>
            <div className="text-sm text-muted-foreground mt-2">{feature.detail}</div>
          </div>
          <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6`}>
            <div className="text-3xl font-bold text-white">{feature.subtitle}</div>
            <div className="text-sm text-muted-foreground mt-2">Hardware Security</div>
          </div>
          <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6`}>
            <div className="text-3xl font-bold text-white">PCI</div>
            <div className="text-sm text-muted-foreground mt-2">Certified</div>
          </div>
        </motion.div>
      </div>
    );

    const renderCenteredLayout = () => (
      <div className="text-center space-y-8">
        <motion.div
          style={{
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
          className="space-y-6"
        >
          <h2 className="text-5xl lg:text-7xl font-bold text-white tracking-tight">
            {feature.title}
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {feature.description}
          </p>
        </motion.div>

        <motion.div
          style={{
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
          className="flex justify-center"
        >
          {renderVisualStyle()}
        </motion.div>
      </div>
    );

    const renderHeroLayout = () => (
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-4 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className={`bg-${feature.color} rounded-lg`} />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center space-y-8">
          <motion.div
            style={{
              opacity: smoothOpacity,
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform, opacity'
            }}
            className="space-y-6"
          >
            <div className={`w-24 h-24 bg-${feature.color} rounded-full flex items-center justify-center mx-auto shadow-2xl`}>
              <IconComponent className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight">
              {feature.title}
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              {feature.description}
            </p>
          </motion.div>

          <motion.div
            style={{
              opacity: smoothOpacity,
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform, opacity'
            }}
            className="flex justify-center items-center gap-8"
          >
            <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-8 text-center`}>
              <div className={`text-4xl font-bold text-${feature.color}`}>
                {feature.stat}
              </div>
              <div className="text-sm text-muted-foreground mt-2">{feature.detail}</div>
            </div>
          </motion.div>
        </div>
      </div>
    );

    const renderCardsLayout = () => (
      <div className="space-y-8">
        <motion.div
          style={{
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
          className="text-center space-y-4"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight">
            {feature.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {feature.description}
          </p>
        </motion.div>

        <motion.div
          style={{
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 text-center`}>
            <Wifi className={`w-8 h-8 mx-auto mb-4 bg-${feature.color} bg-clip-text text-transparent`} />
            <h3 className="text-xl font-bold text-white mb-2">Mobile Terminals</h3>
            <p className="text-sm text-muted-foreground">Wireless connectivity</p>
          </div>
          <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 text-center`}>
            <Monitor className={`w-8 h-8 mx-auto mb-4 bg-${feature.color} bg-clip-text text-transparent`} />
            <h3 className="text-xl font-bold text-white mb-2">Kitchen Displays</h3>
            <p className="text-sm text-muted-foreground">Real-time updates</p>
          </div>
          <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 text-center`}>
            <Globe className={`w-8 h-8 mx-auto mb-4 bg-${feature.color} bg-clip-text text-transparent`} />
            <h3 className="text-xl font-bold text-white mb-2">Self-Serve Kiosks</h3>
            <p className="text-sm text-muted-foreground">24/7 availability</p>
          </div>
        </motion.div>
      </div>
    );

    const renderTimelineLayout = () => (
      <div className="space-y-8">
        <motion.div
          style={{
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
          className="text-center space-y-4"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight">
            {feature.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {feature.description}
          </p>
        </motion.div>

        <motion.div
          style={{
            opacity: smoothOpacity,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
              className="relative"
            >
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-muted" />
          
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 w-5/12`}>
                <div className="flex items-center gap-3 mb-2">
                  <Battery className={`w-5 h-5 bg-${feature.color} bg-clip-text text-transparent`} />
                  <span className="text-sm font-semibold text-muted-foreground">UPS Battery</span>
                </div>
                <p className="text-sm text-muted-foreground">Built-in backup power</p>
              </div>
              <div className={`w-4 h-4 bg-${feature.color} rounded-full`} />
              <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 w-5/12`}>
                <div className="flex items-center gap-3 mb-2">
                  <Wifi className={`w-5 h-5 bg-${feature.color} bg-clip-text text-transparent`} />
                  <span className="text-sm font-semibold text-muted-foreground">Offline Mode</span>
                </div>
                <p className="text-sm text-muted-foreground">Never miss a sale</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-8 text-center`}>
                <div className={`text-4xl font-bold bg-${feature.color} bg-clip-text text-transparent`}>
                  {feature.stat}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{feature.detail}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );

    const renderVisualStyle = () => {
      switch (feature.visualStyle) {
        case 'solid':
          return (
              <div className={`relative ${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 lg:p-8 shadow-2xl overflow-hidden`}>
                <div className={`absolute inset-0 bg-primary opacity-5`} />
                <div className={`absolute -inset-1 bg-${feature.color} opacity-20 blur-lg`} />
                <div className="relative z-10">
                  <div className="aspect-square bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                    <div className="text-center space-y-4">
                      <div className={`w-16 h-16 bg-${feature.color} rounded-2xl flex items-center justify-center mx-auto shadow-2xl`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-2">
                      <div className="text-xl font-bold text-white">{feature.title}</div>
                      <div className="text-sm text-muted-foreground">{feature.subtitle}</div>
                        </div>
                    <div className={`inline-flex items-center gap-2 ${feature.bgColor} border ${feature.borderColor} px-3 py-1.5 rounded-lg`}>
                        <span className={`text-lg font-bold bg-${feature.color} bg-clip-text text-transparent`}>
                          {feature.stat}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        
        case 'geometric':
          return (
            <div className="relative">
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`aspect-square ${feature.bgColor} ${feature.borderColor} border rounded-xl flex items-center justify-center`}>
                    {i === 4 && (
                      <div className={`w-12 h-12 bg-${feature.color} rounded-xl flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        
        case 'minimal':
          return (
            <div className={`${feature.bgColor} ${feature.borderColor} border rounded-3xl p-12 text-center`}>
              <div className={`w-20 h-20 bg-${feature.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.subtitle}</p>
                <div className={`text-3xl font-bold bg-${feature.color} bg-clip-text text-transparent`}>
                  {feature.stat}
                </div>
              </div>
            </div>
          );
        
        case 'industrial':
          return (
            <div className="relative">
              <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-8`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 bg-${feature.color} rounded-full`} />
                    <span className="text-sm text-muted-foreground">STATUS</span>
                  </div>
                  					<div className="text-sm text-primary">ONLINE</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-6 h-6 bg-${feature.color} bg-clip-text text-transparent`} />
                    <span className="text-white font-semibold">{feature.title}</span>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{feature.stat}</div>
                    <div className="text-sm text-muted-foreground">{feature.detail}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        
        case 'network':
          return (
            <div className="relative">
              <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-8`}>
                <div className="flex items-center justify-center mb-6">
                  <div className={`w-16 h-16 bg-${feature.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">Terminal</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">Display</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">Kiosk</div>
                  </div>
                </div>
              </div>
            </div>
          );
        
        case 'energy':
          return (
            <div className="relative">
              <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-8`}>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className={`w-20 h-20 bg-${feature.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Battery Level</span>
                      						<span className="text-sm text-primary">100%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`bg-${feature.color} h-2 rounded-full`} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold bg-${feature.color} bg-clip-text text-transparent`}>
                      {feature.stat}
                    </div>
                    <div className="text-sm text-muted-foreground">{feature.detail}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        
        default:
          return (
            <div className={`${feature.bgColor} ${feature.borderColor} border rounded-2xl p-6 lg:p-8 shadow-2xl`}>
              <div className="aspect-square bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 bg-${feature.color} rounded-2xl flex items-center justify-center mx-auto shadow-2xl`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xl font-bold text-white">{feature.title}</div>
                    <div className="text-sm text-muted-foreground">{feature.subtitle}</div>
                  </div>
                  <div className={`inline-flex items-center gap-2 ${feature.bgColor} border ${feature.borderColor} px-3 py-1.5 rounded-lg`}>
                    <span className={`text-lg font-bold bg-${feature.color} bg-clip-text text-transparent`}>
                      {feature.stat}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
      }
    };

    return (
      <section
        key={feature.id}
        ref={sectionRef}
        className="py-16 lg:py-24 bg-black relative overflow-hidden"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform, opacity'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-6 w-full">
          {renderLayout()}
        </div>
      </section>
    );
  };

  const renderTestimonialsSection = () => {
    return (
      <section className="py-16 lg:py-24 bg-black relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 w-full relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Don't just take our word for it. See what businesses like yours have to say about Thorbis POS Lite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <p className="text-lg text-muted-foreground italic">"Thorbis POS Lite has revolutionized our checkout process. The lightning-fast speed and robust security features have made it a game-changer for our retail store."</p>
              <div className="mt-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Sarah Johnson, Owner of TechMart</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <p className="text-lg text-muted-foreground italic">"The industrial-grade durability and offline-first architecture have made Thorbis POS Lite a reliable partner for our food truck operations. No more power outages affecting sales!"</p>
              <div className="mt-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Mike Chen, Manager of Foodie Junction</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <p className="text-lg text-muted-foreground italic">"The seamless ecosystem of mobile terminals, kitchen displays, and kiosks has transformed our restaurant operations. Thorbis POS Lite truly is a complete solution."</p>
              <div className="mt-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
                <Star className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Lisa Rodriguez, Manager of Local Market</p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderComparisonSection = () => {
    return (
      <section className="py-16 lg:py-24 bg-black relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 w-full relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Key Comparisons
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare Thorbis POS Lite with other leading point-of-sale systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Thorbis POS Lite</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>ARM architecture with local compute</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>2-second payment processing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>Built-in UPS battery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>Offline-first architecture</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>Military-grade encryption</span>
                </li>
              </ul>
            </div>
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Traditional Systems</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>Intel architecture</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>Higher latency for payments</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>More susceptible to power outages</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>Less robust security</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span>Higher cost of ownership</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderBehindTheScenesSection = () => {
    return (
      <section className="py-16 lg:py-24 bg-black relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 w-full relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Behind the Scenes
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn about the innovative technologies powering Thorbis POS Lite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Advanced Hardware</h3>
              <p className="text-muted-foreground">Thorbis POS Lite is powered by a custom ARM processor, ensuring unparalleled speed and reliability. The TPM 2.0 security module provides military-grade encryption, safeguarding your sensitive data.</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Powerful Software</h3>
              <p className="text-muted-foreground">Our proprietary software is designed to be lightweight and efficient, yet feature-rich. It seamlessly integrates with your existing infrastructure and can be deployed in minutes.</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Seamless Connectivity</h3>
              <p className="text-muted-foreground">With built-in Wi-Fi, Bluetooth, and cellular connectivity, Thorbis POS Lite can operate in virtually any environment. It's also compatible with a wide range of peripherals and payment gateways.</p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderFAQSection = () => {
    return (
      <section className="py-16 lg:py-24 bg-black relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 w-full relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Answers to common questions about Thorbis POS Lite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Is Thorbis POS Lite suitable for all types of businesses?</h3>
              <p className="text-muted-foreground">Absolutely. Thorbis POS Lite is designed to be versatile and adaptable to any retail, restaurant, or service-based business. Whether you're a small shop or a large enterprise, we have a solution for you.</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">How long does it take to set up Thorbis POS Lite?</h3>
              <p className="text-muted-foreground">Our goal is to make it as quick and painless as possible. With our intuitive software and user-friendly interface, you can be up and running in just a few minutes. We also offer comprehensive training and support.</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">What are the system requirements for Thorbis POS Lite?</h3>
              <p className="text-muted-foreground">Thorbis POS Lite is a lightweight application that runs on most modern devices. You'll need a computer with a minimum of 2GB RAM, a stable internet connection, and a modern web browser. For optimal performance, we recommend a dedicated device.</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Is my data secure with Thorbis POS Lite?</h3>
              <p className="text-muted-foreground">Absolutely. Thorbis POS Lite implements the highest security standards, including military-grade encryption (TPM 2.0) and offline-first architecture. Your data is encrypted in transit and at rest, and you have full control over your security settings.</p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div 
      className="bg-black"
      style={{
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      {/* Bento Grid Section */}
      {renderBentoGrid()}

      {/* Feature sections */}
      {features.map((feature, index) => renderFeatureSection(feature, index))}
      
      {/* Customer Testimonials Section */}
      {renderTestimonialsSection()}

      {/* Interactive Comparison Section */}
      {renderComparisonSection()}

      {/* Behind the Scenes Section */}
      {renderBehindTheScenesSection()}

      {/* FAQ Section */}
      {renderFAQSection()}
    </div>
  );
};

export default ThorbisStyleProductShowcase;

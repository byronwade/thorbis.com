"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { 
  RotateCcw, 
  Maximize, 
  Box, 
  Eye,
  Move3D,
  Loader2,
  X
} from "lucide-react";

/**
 * Enhanced 3D Product Viewer with Three.js
 * Features: Interactive rotation, zoom, professional lighting, mobile-optimized controls
 */
export default function Product3DViewer({ 
  productName, 
  productCategory = "product",
  className = "",
  showControls = true,
  autoRotate = false
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const animationIdRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const handleResizeRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(autoRotate);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    try {
      // Scene setup with premium Thorbis styling
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff); // Pure white background for clean look
      sceneRef.current = scene;

      // Camera setup - optimized for product viewing
      const camera = new THREE.PerspectiveCamera(
        45, // Field of view
        1, // Aspect ratio (will be updated)
        0.1,
        1000
      );
      camera.position.set(5, 3, 8);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer setup with high quality settings
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(400, 400);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      rendererRef.current = renderer;

      // Professional lighting setup
      setupLighting(scene);

      // Create product display
      createProductDisplay(scene);

      // Add to DOM
      mountRef.current.appendChild(renderer.domElement);

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current) return;
        
        const container = mountRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      // Store resize handler in ref for cleanup
      handleResizeRef.current = handleResize;

      // Add event listeners
      window.addEventListener('resize', handleResize);
      handleResize();

      // Add mouse/touch controls
      addInteractionControls(renderer.domElement, camera);

      // Start animation loop
      animate();

      setIsLoading(false);

    } catch (err) {
      console.error('3D Viewer initialization error:', err);
      setError('Failed to load 3D viewer');
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (handleResizeRef.current) {
        window.removeEventListener('resize', handleResizeRef.current);
      }
    };
  }, []);

  // Professional lighting setup
  const setupLighting = (scene) => {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Main key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(10, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    // Fill light (opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    // Rim light (from behind)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 10, -10);
    scene.add(rimLight);

    // Bottom bounce light
    const bounceLight = new THREE.DirectionalLight(0x87ceeb, 0.2);
    bounceLight.position.set(0, -10, 0);
    scene.add(bounceLight);
  };

  // Create product display without platform
  const createProductDisplay = (scene) => {
    // Create product representation (rounded cube for now)
    const productGeometry = new THREE.BoxGeometry(2, 2, 2);
    // Round the edges
    const edges = new THREE.EdgesGeometry(productGeometry);
    
    // Premium Thorbis-branded product material
    const productMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e40af, // Deep Thorbis blue (blue-700)
      metalness: 0.8,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.2,
      reflectivity: 0.9
    });

    const productMesh = new THREE.Mesh(productGeometry, productMaterial);
    productMesh.position.y = 0;
    productMesh.castShadow = true;
    productMesh.receiveShadow = true;
    meshRef.current = productMesh;
    scene.add(productMesh);

    // Add subtle edge highlighting
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x64748b, 
      transparent: true, 
      opacity: 0.3 
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    productMesh.add(edgeLines);

    // Add logo or branding (simple for now)
    const logoGeometry = new THREE.PlaneGeometry(0.8, 0.3);
    const logoMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0, 0, 1.01);
    productMesh.add(logo);
  };

  // Add mouse/touch interaction controls
  const addInteractionControls = (canvas, camera) => {
    let lastX = 0;
    let lastY = 0;

    const handleStart = (clientX, clientY) => {
      isDraggingRef.current = true;
      lastX = clientX;
      lastY = clientY;
      setAutoRotateEnabled(false);
    };

    const handleMove = (clientX, clientY) => {
      if (!isDraggingRef.current || !meshRef.current) return;

      const deltaX = clientX - lastX;
      const deltaY = clientY - lastY;

      // Rotate the product
      meshRef.current.rotation.y += deltaX * 0.01;
      meshRef.current.rotation.x += deltaY * 0.01;

      // Limit vertical rotation
      meshRef.current.rotation.x = Math.max(
        -Math.PI / 3, 
        Math.min(Math.PI / 3, meshRef.current.rotation.x)
      );

      lastX = clientX;
      lastY = clientY;
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
    };

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
      handleStart(e.clientX, e.clientY);
    });

    canvas.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleEnd();
    });

    // Zoom with mouse wheel
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoom = e.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(zoom);
      
      // Limit zoom range
      const distance = camera.position.length();
      if (distance < 4) camera.position.normalize().multiplyScalar(4);
      if (distance > 15) camera.position.normalize().multiplyScalar(15);
    });
  };

  // Animation loop
  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate);

    if (autoRotateEnabled && meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  // Control functions
  const resetView = () => {
    if (meshRef.current && cameraRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(5, 3, 8);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const toggleAutoRotate = () => {
    setAutoRotateEnabled(!autoRotateEnabled);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
          <div className="text-center">
            <Box className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">3D viewer unavailable</p>
            <p className="text-xs mt-1">Fallback to 2D images</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white dark:bg-neutral-950 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      {/* Enhanced Header with Thorbis Branding */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            					<Badge className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 text-sm font-medium shadow-lg border-0">
              <Move3D className="h-4 w-4 mr-1.5" />
              Interactive 3D
            </Badge>
            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 font-medium">
              {productName}
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetView}
                className="h-10 w-10 p-0 bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 shadow-md border border-gray-200 dark:border-neutral-700 transition-all duration-200"
                title="Reset view"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAutoRotate}
                className={`h-10 w-10 p-0 bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 shadow-md border transition-all duration-200 ${
                  autoRotateEnabled 
                    					? 'border-primary text-primary dark:border-primary' 
                    : 'border-gray-200 dark:border-neutral-700'
                }`}
                title="Auto rotate"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-10 w-10 p-0 bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 shadow-md border border-gray-200 dark:border-neutral-700 transition-all duration-200"
                title="Fullscreen view"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced 3D Viewer Container */}
      <div 
        ref={mountRef}
        className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-neutral-950' : 'aspect-square'}`}
        style={{ minHeight: isFullscreen ? '100vh' : '500px' }}
      />

      {/* Enhanced Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm">
          <div className="text-center">
            <div className="relative mb-6">
              					<div className="w-16 h-16 mx-auto bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading 3D Experience</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Preparing interactive product view...</p>
          </div>
        </div>
      )}

      {/* Modern Instructions Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-neutral-700/50 p-4 shadow-lg">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-sm flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <span className="hidden sm:inline">Drag to rotate</span>
              <span className="sm:hidden">Touch & drag</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 border-2 border-gray-300 dark:border-gray-500 rounded-sm relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <span className="hidden sm:inline">Scroll to zoom</span>
              <span className="sm:hidden">Pinch to zoom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Fullscreen Close Button */}
      {isFullscreen && (
        <div className="absolute top-6 right-6 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-12 w-12 p-0 bg-white/95 hover:bg-white dark:bg-neutral-800/95 dark:hover:bg-neutral-800 shadow-lg border border-gray-200 dark:border-neutral-700 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Product Info Overlay for Enhanced Context */}
      <div className="absolute top-20 right-6 z-10">
        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200/50 dark:border-neutral-700/50 max-w-xs">
          <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">Premium Build Quality</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">360° interactive view • Professional materials</div>
        </div>
      </div>
    </div>
  );
}

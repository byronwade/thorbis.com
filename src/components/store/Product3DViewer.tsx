"use client";

import { useState } from "react";

interface Product3DViewerProps {
  productName: string;
  productCategory: string;
  className?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

export default function Product3DViewer({ 
  productName, 
  productCategory, 
  className,
  autoRotate = true,
  showControls = false
}: Product3DViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for the 3D viewer
  setTimeout(() => setIsLoading(false), 1000);

  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center ${className}`}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-sm">Loading 3D View...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-dashed rounded-xl flex items-center justify-center">
              <span className="text-primary font-bold text-xs">3D</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold text-lg">{productName}</p>
            <p className="text-gray-400 text-sm">{productCategory}</p>
            <p className="text-gray-500 text-xs">3D viewer coming soon</p>
          </div>
          {showControls && (
            <div className="flex space-x-2 mt-4">
              <button className="px-3 py-1 bg-primary/20 text-primary rounded text-xs">
                Rotate
              </button>
              <button className="px-3 py-1 bg-primary/20 text-primary rounded text-xs">
                Zoom
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import React from 'react';
import SmartBusinessNavigation from './SmartBusinessNavigation';

/**
 * Test component for SmartBusinessNavigation
 * Use this to test the navigation dropdowns
 */
export default function TestSmartNavigation() {
  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h1 className="text-white text-2xl mb-4">Smart Navigation Test</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <SmartBusinessNavigation 
          userId="test_user_1"
          userRole="OWNER"
          businessId="test_business_1"
          className="w-full"
          maxHeaderItems={5}
          showAppLauncher={true}
          showCustomization={true}
        />
      </div>
      
      <div className="mt-4 text-white text-sm">
        <p>Instructions:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Click the "Apps" button to test the app launcher dropdown</li>
          <li>Click the "Customize" button to test the customization menu</li>
          <li>Check the browser console for debug logs</li>
        </ul>
      </div>
    </div>
  );
}

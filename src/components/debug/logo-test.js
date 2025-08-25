"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { dashboardBusinesses } from '@data/dashboard-businesses';

export default function LogoTest() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Logo Test</h1>
        <p className="text-gray-600">Testing business logo display functionality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardBusinesses.map((business) => (
          <Card key={business.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={business.logo || "/placeholder-logo.png"} 
                    alt={business.name}
                    onError={(e) => {
                      console.error(`Failed to load logo for ${business.name}:`, e.target.src);
                    }}
                    onLoad={() => {
                      console.log(`Successfully loaded logo for ${business.name}:`, business.logo);
                    }}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {business.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{business.name}</h3>
                  <p className="text-sm text-gray-600">{business.industry}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Logo Path:</span>
                  <p className="text-sm text-gray-600 font-mono">{business.logo || "No logo set"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Business ID:</span>
                  <p className="text-sm text-gray-600">{business.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Plan:</span>
                  <p className="text-sm text-gray-600">{business.plan || "Free"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>Check browser console for logo loading status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Instructions:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Open browser developer tools (F12)</li>
              <li>• Check the Console tab for logo loading messages</li>
              <li>• Check the Network tab to see if logo files are being requested</li>
              <li>• Verify that placeholder logos are displayed as fallbacks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HandHeart, Users } from 'lucide-react'

export default function PartnershipsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="w-5 h-5" />
          Partnerships
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Partnerships section will be implemented here</p>
        </div>
      </CardContent>
    </Card>
  )
}
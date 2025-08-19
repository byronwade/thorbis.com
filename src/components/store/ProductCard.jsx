"use client"

import React from "react"

export default function ProductCard({ product }) {
  return (
    <div className="p-4 border border-border rounded-lg">
      <h3 className="font-semibold">{product?.name || 'Product'}</h3>
      <p className="text-muted-foreground">{product?.description || 'Product description'}</p>
    </div>
  )
}

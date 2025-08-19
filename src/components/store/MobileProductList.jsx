"use client"

import React from "react"

export default function MobileProductList({ products }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <div className="space-y-4">
        {products?.map((product, index) => (
          <div key={index} className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold">{product?.name || 'Product'}</h3>
            <p className="text-muted-foreground">{product?.description || 'Product description'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

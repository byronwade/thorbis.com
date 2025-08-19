"use client";

import React from "react";
import ProductListItem from "./ProductListItem";

export default function MobileProductList({ title, subtitle, link, children, className = "" }) {
  return (
    <div className={`bg-background ${className}`}>
      {/* Product List - Native app style without card wrapper */}
      {React.Children.map(children, (child, index) => (
        <div key={index}>
          {child && React.cloneElement(child)}
        </div>
      ))}
    </div>
  );
}

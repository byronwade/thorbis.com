"use client";

import { ReactNode } from "react";

interface MobileProductListProps {
  children: ReactNode;
}

export default function MobileProductList({ children }: MobileProductListProps) {
  return (
    <div className="space-y-4 px-4">
      {children}
    </div>
  );
}
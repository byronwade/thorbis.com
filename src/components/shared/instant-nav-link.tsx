'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface InstantNavLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
  prefetch?: boolean
}

export function InstantNavLink({ 
  href, 
  children, 
  className, 
  onClick,
  prefetch = true 
}: InstantNavLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.()
    
    // Use router.push for instant navigation
    router.push(href)
  }

  const handleMouseEnter = () => {
    if (prefetch) {
      // Prefetch on hover for instant loading
      router.prefetch(href)
    }
  }

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      prefetch={prefetch}
    >
      {children}
    </Link>
  )
}
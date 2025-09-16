interface ThorbisLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  alt?: string
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6', 
  lg: 'size-8'
}

export function ThorbisLogo({ 
  className = ', 
  size = 'md',
  alt = 'Thorbis Logo'
}: ThorbisLogoProps) {
  return (
    <img 
      src="/images/ThorbisLogo.webp" 
      alt={alt}
      className={'object-contain ${sizeClasses[size]} ${className}'}
    />
  )
}

export default ThorbisLogo

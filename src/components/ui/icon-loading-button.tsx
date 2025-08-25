import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconLoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  icon: React.ReactNode;
  loadingIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const IconLoadingButton: React.FC<IconLoadingButtonProps> = ({
  loading = false,
  icon,
  loadingIcon,
  size = 'md',
  className,
  disabled,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <Button
      disabled={disabled || loading}
      className={cn(
        "relative rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? (
        loadingIcon || <Loader2 className={cn(iconSizeClasses[size], "text-foreground animate-spin")} />
      ) : (
        icon
      )}
      {children}
    </Button>
  );
};

export default IconLoadingButton;

import React from 'react';
import { Button } from '../shared/Button';
import { cn } from '../../lib/utils';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  provider: string;
  isLoading?: boolean;
}

export function SocialButton({ 
  icon, 
  provider, 
  className,
  isLoading,
  ...props 
}: SocialButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "w-full bg-background hover:bg-accent hover:text-accent-foreground",
        className
      )}
      icon={icon}
      isLoading={isLoading}
      {...props}
    >
      <span className="ml-2">{provider}</span>
    </Button>
  );
}
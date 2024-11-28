import React from 'react';
import { Button } from '../shared/Button';
import { cn } from '../../lib/utils';

interface SocialButtonProps {
  icon: React.ReactNode;
  provider: string;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SocialButton({ 
  icon, 
  provider, 
  className,
  isLoading,
  onClick
}: SocialButtonProps) {
  return (
    <Button
      variant="outline"
      size="md"
      className={cn(
        "w-full bg-background hover:bg-accent hover:text-accent-foreground",
        className
      )}
      isLoading={isLoading}
      onClick={onClick}
    >
      {icon}
      <span className="ml-2">{provider}</span>
    </Button>
  );
}
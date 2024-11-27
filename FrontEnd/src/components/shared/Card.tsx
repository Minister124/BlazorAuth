import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover';
}

export const Card = ({ className, variant = 'default', children, ...props }: CardProps) => {
  const baseStyles = 'rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900';
  const variants = {
    default: 'border-gray-200 dark:border-gray-800',
    hover: 'border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-gray-500 dark:text-gray-400', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-4 flex items-center justify-end space-x-4', className)} {...props}>
    {children}
  </div>
);

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, icon, children, ...props }, ref) => {
    const baseStyles = 'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900';
    const variants = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              baseStyles,
              icon ? 'pl-9' : 'pl-3',
              error ? variants.error : variants.default,
              className
            )}
            {...props}
          >
            {children}
          </select>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

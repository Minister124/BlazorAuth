import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const result = zxcvbn(password);
  const score = result.score;

  const getStrengthColor = () => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getStrengthText = () => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  };

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getStrengthColor()} transition-all duration-300`}
          style={{ width: `${(score + 1) * 20}%` }}
        />
      </div>
      <p className="text-xs text-gray-600">
        Password Strength: <span className="font-medium">{getStrengthText()}</span>
      </p>
    </div>
  );
}
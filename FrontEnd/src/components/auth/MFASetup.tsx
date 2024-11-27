import React, { useState, useRef, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../shared/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../shared/Card';

interface MFASetupProps {
  onComplete: () => void;
}

export function MFASetup({ onComplete }: MFASetupProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      // Simulate MFA verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Two-factor authentication enabled successfully');
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enable 2FA');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single character

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = [...code];
    
    [...pastedData].forEach((char, index) => {
      if (index < 6) newCode[index] = char;
    });
    
    setCode(newCode);
    if (pastedData.length > 0) {
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
        <p className="text-center text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="w-12 h-12 text-center text-lg font-medium rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={digit}
                onChange={(e) => handleInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={code.join('').length !== 6}
            isLoading={isVerifying}
            icon={!isVerifying ? <Check className="w-4 h-4" /> : undefined}
          >
            {isVerifying ? 'Verifying...' : 'Verify and Enable'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          You can always set up 2FA later from your account settings
        </p>
      </CardFooter>
    </Card>
  );
}
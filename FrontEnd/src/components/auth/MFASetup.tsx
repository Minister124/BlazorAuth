import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface MFASetupProps {
  onComplete: () => void;
}

export function MFASetup({ onComplete }: MFASetupProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      // Simulate MFA verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('MFA setup complete!');
      onComplete();
    } catch (error) {
      toast.error('MFA setup failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
    >
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-purple-100 rounded-full">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Set Up Two-Factor Authentication</h2>
      <p className="text-center text-gray-600 mb-8">
        Enhance your account security with 2FA
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xl font-semibold"
              value={code[i] || ''}
              onChange={(e) => {
                const newCode = code.split('');
                newCode[i] = e.target.value;
                setCode(newCode.join(''));
                if (e.target.value && e.target.nextElementSibling) {
                  (e.target.nextElementSibling as HTMLInputElement).focus();
                }
              }}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-semibold shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          type="submit"
          disabled={isVerifying || code.length !== 6}
        >
          {isVerifying ? (
            'Verifying...'
          ) : (
            <>
              <Check size={20} />
              <span>Verify and Complete Setup</span>
            </>
          )}
        </motion.button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-500">
        You can always set up 2FA later from your account settings
      </p>
    </motion.div>
  );
}
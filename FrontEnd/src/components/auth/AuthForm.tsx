import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { MFASetup } from './MFASetup';
import { WaterBubbles } from '../background/WaterBubbles';
import { useAuthStore } from '../../store/useAuthStore';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showMFA, setShowMFA] = useState(false);
  const {initialize } = useAuthStore();

  useEffect(() => {
    // Initialize the auth store when component mounts
    initialize();
  }, [initialize]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const handleLoginSuccess = () => {
    setShowMFA(true);
  };

  if (showMFA) {
    return (
      <>
        <WaterBubbles />
        <MFASetup onComplete={() => setShowMFA(false)} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900/10 to-blue-900/10 p-4">
      <WaterBubbles />
      <div className="absolute inset-0 backdrop-blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <AnimatePresence mode="wait" custom={isLogin ? 1 : -1}>
          <motion.div
            key={isLogin ? 'login' : 'register'}
            custom={isLogin ? 1 : -1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {isLogin ? (
              <LoginForm onSuccess={handleLoginSuccess} onToggle={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggle={() => setIsLogin(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
import { useEffect, useState, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, useToasterStore, toast } from 'react-hot-toast';
import { Sun, Moon, Menu, Loader2, X } from 'lucide-react';
import Navigation from './components/Navigation';
import UserList from './components/UserList';
import { ProfileForm } from './components/profile/ProfileForm';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DepartmentManagement } from './components/DepartmentManagement';
import { RoleManagement } from './components/RoleManagement';
import { UserCreationForm } from './components/UserCreationForm';
import { Settings } from './components/shared/Settings';
import { DepartmentAssignment } from './components/DepartmentAssignment';
import { Analytics } from './components/Analytics';
import { ProtectedRoute } from './components/ProtectedRoute';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const ToastComponent = ({ t, dismiss }: { t: any; dismiss: () => void }) => {
  return (
    <div className="relative flex items-center justify-between gap-2 group">
      <div className="flex-1">{t.message}</div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }}
        className="p-1.5 transition-opacity rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isLoading, initialize } = useAuthStore();
  const location = useLocation();
  const { toasts } = useToasterStore();

  // Initialize auth state
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Limit the maximum number of notifications
  useEffect(() => {
    const TOAST_LIMIT = 3;
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .slice(TOAST_LIMIT) // Get the excess toasts beyond the limit
      .forEach((t) => toast.dismiss(t.id)); // Dismiss excess toasts using toast.dismiss
  }, [toasts]);

  // Initialize theme on mount
  useEffect(() => {
    // Disable transitions on page load
    document.documentElement.classList.add('preload');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      setIsDarkMode(prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }

    // Remove preload class after a short delay to enable transitions
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('preload');
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
        >
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading...</span>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const toggleTheme = () => {
    // Add preload class to disable transitions during theme change
    document.documentElement.classList.add('preload');
    
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');

    // Remove preload class after a short delay to re-enable transitions
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('preload');
    });
  };
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white bg-white text-gray-900',
          duration: 4000,
          style: {
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        }}
      >
        {(t) => <ToastComponent t={t} dismiss={() => toast.dismiss(t.id)} />}
      </Toaster>
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              BlazorAuth
            </motion.h1>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-950 shadow-lg mt-16"
              onClick={e => e.stopPropagation()}
            >
              <Navigation onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Navigation */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <Navigation onClose={() => {}} />
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <Suspense
                fallback={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-64"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-gray-600 dark:text-gray-300" />
                  </motion.div>
                }
              >
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <Routes>
                    <Route 
                      path="/users" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin']}>
                          <UserList />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/users/new" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin']}>
                          <UserCreationForm />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/departments" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin']}>
                          <DepartmentManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/departments/assign" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin']}>
                          <DepartmentAssignment />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/roles" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin']}>
                          <RoleManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute requiredRoles={['Admin']}>
                          <Analytics />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfileForm user={user} />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="*" element={<Navigate to="/users" replace />} />
                  </Routes>
                </motion.div>
              </Suspense>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
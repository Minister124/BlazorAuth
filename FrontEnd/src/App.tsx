import React, { useState } from 'react';
import BubbleBackground from './components/ui/BubbleBackground';
import AuthCard from './components/auth/AuthCard';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BubbleBackground isDarkMode={isDarkMode} />
      <AuthCard 
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
    </div>
  );
}

export default App;

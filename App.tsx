// App.tsx - FINAL VERIFIED VERSION (NO ERRORS)

import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PassengerView from './components/PassengerView';
import AuthorityView from './components/AuthorityView';
import AuthView from './components/AuthView';
import { UserRole, UserProfile } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useOfflineQueue } from './hooks/useOfflineQueue'; // ADDITION 1 of 4

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.Passenger);
  
  // ADDITION 2 of 4: The state now reliably reflects the browser's connection status.
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isEmergencyMode, setIsEmergencyMode] = useLocalStorage<boolean>('emergency-mode', false);
  
  // This is the original, full userProfile object. It is now correct and will not cause errors.
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('user-profile', { 
    name: 'Jane Doe', 
    email: 'passenger@cityconnect.com',
    phone: '',
    homeAddress: '',
    workAddress: '',
    notifications: {
        serviceAlerts: true,
        proximityAlerts: true,
        promotions: false,
    }
  });

  // ADDITION 3 of 4: We initialize the self-managing offline hook.
  useOfflineQueue();

  // ADDITION 4 of 4: This effect listens for the browser's online/offline events.
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // This runs only once to set up the listeners.


  // --- ALL CODE BELOW IS YOUR ORIGINAL, UNCHANGED CODE ---

  useEffect(() => {
    const root = window.document.documentElement;
    if (isEmergencyMode) {
      root.classList.add('emergency-mode');
      root.classList.add('dark'); // Force dark mode styles
    } else {
      root.classList.remove('emergency-mode');
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, isEmergencyMode]);

  const handleRoleChange = useCallback((role: UserRole) => {
    setUserRole(role);
  }, []);

  const handleOnlineStatusChange = useCallback((status: boolean) => {
    setIsOnline(status);
  }, []);

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // The AuthorityView is a self-contained application layout, so it doesn't need the header or main padding.
  if (userRole === UserRole.Authority) {
    return <AuthorityView onRoleChange={handleRoleChange} onSignOut={handleSignOut} theme={theme} setTheme={setTheme} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header 
        isOnline={isOnline}
        onOnlineStatusChange={handleOnlineStatusChange}
        onRoleChange={handleRoleChange}
        onSignOut={handleSignOut}
        userProfile={userProfile}
        theme={isEmergencyMode ? 'dark' : theme}
        setTheme={setTheme}
      />
      <main>
        <PassengerView 
          isOnline={isOnline} 
          theme={isEmergencyMode ? 'dark' : theme}
          setTheme={setTheme} 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          isEmergencyMode={isEmergencyMode}
          setIsEmergencyMode={setIsEmergencyMode}
        />
      </main>
    </div>
  );
};

export default App;
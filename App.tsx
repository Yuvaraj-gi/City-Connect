// App.tsx - RECTIFIED

import React, { useState, useCallback, useEffect } from 'react';
// ADDITION 1 of 2: Import the Toaster component for notifications
import { Toaster } from 'react-hot-toast'; 
import Header from './components/Header';
import PassengerView from './components/PassengerView';
import AuthorityView from './components/AuthorityView';
import AuthView from './components/AuthView';
import { UserRole, UserProfile } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useOfflineQueue } from './hooks/useOfflineQueue';
import { getProfile } from './services/apiService';

const App: React.FC = () => {
  // ... All the state variables are unchanged ...
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.Passenger);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isEmergencyMode, setIsEmergencyMode] = useLocalStorage<boolean>('emergency-mode', false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('user-profile', { 
    name: 'Jane Doe', email: 'passenger@cityconnect.com', phone: '', homeAddress: '', workAddress: '',
    notifications: { serviceAlerts: true, proximityAlerts: true, promotions: false, }
  });

  useOfflineQueue(); // This is correct, it initializes the self-managing hook

  const handleLoginSuccess = async () => { /* ... unchanged ... */ };
  useEffect(() => { /* ... unchanged ... */ }, []);
  useEffect(() => { /* ... unchanged ... */ }, [theme, isEmergencyMode]);
  const handleRoleChange = useCallback((role: UserRole) => setUserRole(role), []);
  const handleOnlineStatusChange = useCallback((status: boolean) => setIsOnline(status), []);
  const handleSignOut = useCallback(() => { /* ... unchanged ... */ }, []);

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (userRole === UserRole.Authority) {
    return <AuthorityView onRoleChange={handleRoleChange} onSignOut={handleSignOut} theme={theme} setTheme={setTheme} />;
  }

  return (
    // We wrap the main div to include the Toaster
    <div>
      {/* ADDITION 2 of 2: This component will display all our pop-up notifications */}
      <Toaster position="top-center" reverseOrder={false} />

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
    </div>
  );
};

// --- Full code for copy-paste ---
const AppFull: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.Passenger);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isEmergencyMode, setIsEmergencyMode] = useLocalStorage<boolean>('emergency-mode', false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('user-profile', { name: 'Jane Doe', email: 'passenger@cityconnect.com', phone: '', homeAddress: '', workAddress: '', notifications: { serviceAlerts: true, proximityAlerts: true, promotions: false, } });
  useOfflineQueue();
  const handleLoginSuccess = async () => { const profile = await getProfile(); if (profile) { setUserProfile(profile); } setIsAuthenticated(true); };
  useEffect(() => { const handleOnline = () => setIsOnline(true); const handleOffline = () => setIsOnline(false); window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline); return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); }; }, []);
  useEffect(() => { const root = window.document.documentElement; if (isEmergencyMode) { root.classList.add('emergency-mode', 'dark'); } else { root.classList.remove('emergency-mode'); root.classList.toggle('dark', theme === 'dark'); } }, [theme, isEmergencyMode]);
  const handleRoleChange = useCallback((role: UserRole) => setUserRole(role), []);
  const handleOnlineStatusChange = useCallback((status: boolean) => setIsOnline(status), []);
  const handleSignOut = useCallback(() => { supabase.auth.signOut(); setIsAuthenticated(false); }, []);
  if (!isAuthenticated) { return <AuthView onLoginSuccess={handleLoginSuccess} />; }
  if (userRole === UserRole.Authority) { return <AuthorityView onRoleChange={handleRoleChange} onSignOut={handleSignOut} theme={theme} setTheme={setTheme} />; }
  return ( <div> <Toaster position="top-center" reverseOrder={false} /> <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200"> <Header isOnline={isOnline} onOnlineStatusChange={handleOnlineStatusChange} onRoleChange={handleRoleChange} onSignOut={handleSignOut} userProfile={userProfile} theme={isEmergencyMode ? 'dark' : theme} setTheme={setTheme} /> <main> <PassengerView isOnline={isOnline} theme={isEmergencyMode ? 'dark' : theme} setTheme={setTheme} userProfile={userProfile} setUserProfile={setUserProfile} isEmergencyMode={isEmergencyMode} setIsEmergencyMode={setIsEmergencyMode} /> </main> </div> </div> );
};
import { supabase } from './supabaseClient';
export default AppFull;
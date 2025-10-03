// AuthorityView.tsx - RECTIFIED (Driver Mode Removed)

import React, { useState } from 'react';
import { UserRole, AuthorityViewType, AuthorityNavItem } from '../types';
import { AuthorityHeader } from './authority/AuthorityHeader';
import AuthoritySidebar from './authority/AuthoritySidebar';
import Dashboard from './authority/Dashboard';
import ChatView from './authority/ChatView';
import SettingsView from './authority/SettingsView';
import ChartBarIcon from './icons/ChartBarIcon';
import ChatIcon from './icons/ChatIcon';
import TruckIcon from './icons/TruckIcon';
import CogIcon from './icons/CogIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import VehiclesTableView from './authority/VehiclesTableView';
import LiveTrackingView from './authority/LiveTrackingView';
// NOTE: DriverModeView and its icon are no longer imported

interface AuthorityViewProps {
    onRoleChange: (role: UserRole) => void;
    onSignOut: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const AuthorityView: React.FC<AuthorityViewProps> = ({ onRoleChange, onSignOut, theme, setTheme }) => {
  const [activeView, setActiveView] = useState<AuthorityViewType>('analytics');
  const [vehicleToTrack, setVehicleToTrack] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTrackVehicle = (vehicleId: string) => {
    setVehicleToTrack(vehicleId);
    setActiveView('live-tracking');
  };

  // THE FIX IS HERE: The "Driver Mode" item has been removed from this list.
  const navItems: AuthorityNavItem[] = [
    { id: 'analytics', icon: <ChartBarIcon />, label: 'Analytics' },
    { id: 'vehicles', icon: <TruckIcon />, label: 'Vehicles' },
    { id: 'live-tracking', icon: <GlobeAltIcon />, label: 'Live Tracking' },
    { id: 'chat', icon: <ChatIcon />, label: 'Chat' },
    { id: 'settings', icon: <CogIcon />, label: 'Settings' },
  ];
  
  // THE FIX IS HERE: We no longer need to check for 'driver-mode'
  const needsPadding = ['analytics', 'vehicles', 'settings'].includes(activeView);

  const renderActiveView = () => {
    switch (activeView) {
        case 'analytics':
            return <Dashboard />;
        case 'vehicles':
            return <VehiclesTableView onTrackVehicle={handleTrackVehicle} />;
        case 'live-tracking':
            const initialVehicleId = vehicleToTrack;
            if (vehicleToTrack) setVehicleToTrack(null);
            return <LiveTrackingView initialVehicleId={initialVehicleId} />;
        case 'chat':
            return <ChatView />;
        // THE FIX IS HERE: The case for 'driver-mode' has been removed.
        case 'settings':
            return <SettingsView theme={theme} setTheme={setTheme} />;
        default:
            return <Dashboard />; // Default to dashboard to prevent errors
    }
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden dark:bg-slate-900 dark:text-slate-300">
      <AuthoritySidebar 
        navItems={navItems}
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AuthorityHeader 
          onRoleChange={onRoleChange}
          onSignOut={onSignOut}
          theme={theme}
          setTheme={setTheme}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className="flex-1 overflow-hidden relative">
            <main className={`absolute inset-0 overflow-y-auto ${needsPadding ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
                {renderActiveView()}
            </main>
        </div>
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around z-20 dark:bg-slate-800 dark:border-slate-700">
        {navItems.map(item => (
            <button 
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center p-2 w-full transition-colors duration-200 ${activeView === item.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'}`}
            >
                {React.cloneElement(item.icon, { className: "h-6 w-6" })}
                <span className="text-xs mt-1">{item.label}</span>
            </button>
        ))}
      </nav>
    </div>
  );
};

export default AuthorityView;
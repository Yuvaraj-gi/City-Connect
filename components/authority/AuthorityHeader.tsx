import React, { useState, useRef, useEffect } from 'react';
import UserCircleIcon from '../icons/UserCircleIcon';
import SunIcon from '../icons/SunIcon';
import MoonIcon from '../icons/MoonIcon';
import Bars3Icon from '../icons/Bars3Icon';
import { UserRole } from '../../types';

interface AuthorityHeaderProps {
    onRoleChange: (role: UserRole) => void;
    onSignOut: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    onMenuClick: () => void;
}

const SwitchRoleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 00-3.375-3.375H8.25a3.375 3.375 0 00-3.375 3.375v5.002" />
  </svg>
);

const SignOutIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);


export const AuthorityHeader: React.FC<AuthorityHeaderProps> = ({ onRoleChange, onSignOut, theme, setTheme, onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6 lg:px-8 dark:border-slate-700 dark:bg-slate-800">
        <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            onClick={onMenuClick}
            aria-label="Open sidebar"
        >
            <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Separator for mobile */}
        <div className="h-6 w-px bg-slate-200 lg:hidden dark:bg-slate-700" aria-hidden="true" />
      
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
             <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
                {theme === 'light' ? (
                    <MoonIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                ) : (
                    <SunIcon className="h-6 w-6 text-yellow-400" />
                )}
            </button>
            <div className="relative" ref={profileRef}>
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label="Open user menu"
                    aria-haspopup="true"
                >
                    <UserCircleIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </button>
                {isProfileOpen && (
                    <div className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700 dark:ring-slate-600">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                            <div className="border-b px-4 py-2 dark:border-slate-600">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Authority Manager</p>
                                <p className="truncate text-sm text-slate-500 dark:text-slate-400">manager@cityconnect.com</p>
                            </div>
                             <a href="#" onClick={(e) => { e.preventDefault(); onRoleChange(UserRole.Passenger); }} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-600" role="menuitem">
                               <SwitchRoleIcon className="mr-3 h-5 w-5 text-slate-400 dark:text-slate-300" />
                                <span>Switch to Passenger</span>
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onSignOut(); }} className="flex w-full items-center px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10" role="menuitem">
                                <SignOutIcon className="mr-3 h-5 w-5 text-red-400" />
                                <span>Sign Out</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
      </div>
    </header>
  );
};

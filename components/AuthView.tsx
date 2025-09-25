import React, { useState } from 'react';
import BusIcon from './icons/BusIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import UserIcon from './icons/UserIcon';

interface AuthViewProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'signup';

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  const inputClasses = "block w-full rounded-lg border-0 py-2.5 bg-white pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500";

  const LoginForm = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email address
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
             <EnvelopeIcon className="h-5 w-5 text-slate-400" />
           </div>
          <input
            type="email"
            name="email"
            id="email"
            className={inputClasses}
            placeholder="you@example.com"
            defaultValue="manager@cityconnect.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password"  className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
             <LockClosedIcon className="h-5 w-5 text-slate-400" />
           </div>
          <input
            type="password"
            name="password"
            id="password"
            className={inputClasses}
            placeholder="••••••••"
             defaultValue="password"
          />
        </div>
      </div>
       <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">Remember me</label>
        </div>
        <div className="text-sm">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Forgot your password?</a>
        </div>
      </div>

      <div>
        <button
          onClick={onLoginSuccess}
          className="flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Sign in
        </button>
      </div>
    </div>
  );

  const SignupForm = () => (
    <div className="space-y-6">
        <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Full name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    name="fullname"
                    id="fullname"
                    className={inputClasses}
                    placeholder="John Doe"
                />
            </div>
        </div>
        <div>
            <label htmlFor="signup-email"  className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="email"
                    name="signup-email"
                    id="signup-email"
                    className={inputClasses}
                    placeholder="you@example.com"
                />
            </div>
        </div>
        <div>
            <label htmlFor="signup-password"  className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="password"
                    name="signup-password"
                    id="signup-password"
                    className={inputClasses}
                    placeholder="••••••••"
                />
            </div>
        </div>
        <div>
            <button
                onClick={onLoginSuccess}
                className="flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                Create Account
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
            <div className="flex justify-center">
                 <div className="bg-indigo-600 p-3 rounded-2xl text-white">
                    <BusIcon className="w-10 h-10" />
                </div>
            </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome to CityConnect
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Your urban transport management solution
          </p>
        </div>
        
        <div className="bg-white p-8 shadow-xl rounded-2xl dark:bg-slate-800">
            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setMode('login')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${mode === 'login' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300 dark:hover:border-slate-500'}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${mode === 'signup' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300 dark:hover:border-slate-500'}`}
                    >
                        Sign Up
                    </button>
                </nav>
            </div>

            {mode === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
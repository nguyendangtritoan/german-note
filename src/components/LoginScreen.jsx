import React from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';

const LoginScreen = ({ onGoogleLogin, onGuestLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors">
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-8 text-center space-y-8 border border-slate-100 dark:border-slate-700">
      <div>
        <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="BookOpen" className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">German Class Companion</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Your smart assistant for the classroom.</p>
      </div>
      <div className="space-y-4">
        <Button variant="google" size="lg" className="w-full flex items-center justify-center" onClick={onGoogleLogin}>
          Sign in with Google
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Or continue as</span>
          </div>
        </div>
        <Button variant="ghost" size="lg" className="w-full" onClick={onGuestLogin}>Guest (Anonymous)</Button>
      </div>
    </div>
  </div>
);

export default LoginScreen;
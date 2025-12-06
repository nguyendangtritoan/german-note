import React from 'react';
import {
  LayoutDashboard, Settings, Book, ArrowRight, Loader2, Eye, EyeOff, 
  Printer, X, Layers, Sparkles, LogOut, User, BookOpen, AlertTriangle, 
  Clock, Flag, Zap, Check, ChevronDown // Added Zap, Check, ChevronDown
} from 'lucide-react';

const ICONS = {
  LayoutDashboard, Settings, Book, ArrowRight, Loader2, Eye, EyeOff, 
  Printer, X, Layers, Sparkles, LogOut, User, BookOpen, AlertTriangle, 
  Clock, Flag, Zap, Check, ChevronDown
};

export const Icon = ({ name, className = "w-5 h-5" }) => {
  const LucideIcon = ICONS[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};
import React, { useEffect } from 'react';
import Button from './Button';
import { Icon } from './Icon';

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  // Lock body scroll to prevent "double scrollbar" on the page
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div 
        className={`relative bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Always fixed at top */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal" className="rounded-full hover:bg-slate-100 text-slate-400">
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </header>

        {/* Content Area */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
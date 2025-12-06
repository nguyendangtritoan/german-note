import React from 'react';
import Button from './Button';
import { Icon } from './Icon';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal"><Icon name="X" /></Button>
        </header>
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Modal;
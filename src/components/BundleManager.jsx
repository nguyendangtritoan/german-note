import React from 'react';
import { Icon } from './ui/Icon';

const BundleManager = ({ bundles, onSelectBundle }) => {
  if (bundles.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white rounded-xl shadow-md border-2 border-dashed border-slate-200">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon name="Layers" className="text-slate-400 w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">No Bundles Yet</h3>
        <p className="text-slate-500 text-sm">
          Go to the <b>Feed</b>, add some words, and click "Create New Bundle" to save your progress.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {bundles.map(bundle => {
        const dateObj = new Date(bundle.date);
        
        return (
          <button key={bundle.id} onClick={() => onSelectBundle(bundle)} className="w-full text-left p-5 bg-white shadow-lg rounded-xl flex justify-between items-center hover:scale-[1.02] transition-transform">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Icon name="Book" className="text-indigo-500 w-5 h-5" />
                <span>{dateObj.toLocaleDateString()}</span>
                <span className="text-sm font-normal text-slate-400">
                  {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </h3>
              <p className="text-slate-500 mt-1 ml-7">{bundle.wordCount} words collected</p>
            </div>
            <Icon name="ArrowRight" className="text-indigo-500" />
          </button>
        );
      })}
    </div>
  );
};

export default BundleManager;
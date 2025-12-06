import React from 'react';
import { Icon } from './ui/Icon';

const BundleManager = ({ bundles, onSelectBundle }) => {
  if (bundles.length === 0) return <div className="text-center py-10 px-6 bg-white rounded-xl shadow-md"><h3 className="text-xl font-semibold mb-2">No Bundles Yet</h3></div>;
  return (
    <div className="space-y-4">
      {bundles.map(bundle => (
        <button key={bundle.id} onClick={() => onSelectBundle(bundle)} className="w-full text-left p-5 bg-white shadow-lg rounded-xl flex justify-between items-center hover:scale-[1.02] transition-transform">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{new Date(bundle.date).toLocaleDateString()}</h3>
            <p className="text-slate-500">{bundle.wordCount} words</p>
          </div>
          <Icon name="ArrowRight" className="text-indigo-500" />
        </button>
      ))}
    </div>
  );
};

export default BundleManager;
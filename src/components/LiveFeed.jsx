import React, { useState } from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';
import { WordCard, WordCardSkeleton } from './WordCard';
import { useBundle } from '../context/BundleContext';
import ConfirmationModal from './ConfirmationModal';
import BundleSelector from './BundleSelector';

const LiveFeed = ({ words, isLoading, onSummarize, onDeleteBundle, pastBundles }) => {
  const { activeBundleId, setActiveBundleId } = useBundle();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const hasWords = words && words.length > 0;
  
  const handleDeleteClick = () => {
    if (activeBundleId) {
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (activeBundleId) {
      onDeleteBundle(activeBundleId);
      setIsDeleteModalOpen(false);
    }
  };

  const renderListWithDividers = () => {
    if (!words) return null;

    const listItems = [];
    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];
      const nextWord = words[i + 1];

      const itemKey = currentWord.id || `word-${i}-${currentWord.original}`;
      listItems.push(<WordCard key={itemKey} wordData={currentWord} />);

      if (nextWord) {
        const currentTime = currentWord.timestamp || 0;
        const nextTime = nextWord.timestamp || 0;
        
        if (currentTime > 0 && nextTime > 0 && (currentTime - nextTime > 3600000)) {
          listItems.push(
            <div key={`divider-${i}`} className="flex items-center justify-center py-4">
              <div className="h-px bg-slate-200 w-full"></div>
              <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center whitespace-nowrap">
                <Icon name="Clock" className="w-3 h-3 mr-1" /> Previous Session
              </span>
              <div className="h-px bg-slate-200 w-full"></div>
            </div>
          );
        }
      }
    }
    return listItems;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header Controls */}
        <div className="flex justify-between items-start md:items-center mb-4 gap-4 flex-col md:flex-row">
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <BundleSelector 
              activeBundleId={activeBundleId}
              onSelect={setActiveBundleId}
              pastBundles={pastBundles}
            />

            {activeBundleId && (
              <Button variant="ghost" size="icon" onClick={handleDeleteClick} className="text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100" title="Delete Bundle">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </Button>
            )}
          </div>
          
          {hasWords && (
            <div className="w-full md:w-auto flex justify-end">
              <Button variant="primary" onClick={onSummarize} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm whitespace-nowrap w-full md:w-auto">
                <Icon name="Sparkles" className="mr-2" />
                {activeBundleId ? "Update Bundle" : "Create New Bundle"}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isLoading && <WordCardSkeleton />}
          {renderListWithDividers()}
          {!isLoading && !hasWords && (
            <div className="text-center py-12 px-6 bg-white rounded-xl shadow-sm border border-slate-100 dashed-border">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="BookOpen" className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {activeBundleId ? "Bundle Empty" : "Ready for Class"}
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                {activeBundleId 
                  ? "This bundle has no words yet." 
                  : "Type a word in the search bar above to start building your vocabulary."}
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Bundle?"
        message="Are you sure you want to delete this study bundle? This action cannot be undone and all words in this specific list will be lost."
      />
    </>
  );
};

export default LiveFeed;
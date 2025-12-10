import React, { useState } from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';
import { WordCard, WordCardSkeleton } from './WordCard';
import { useBundle } from '../context/BundleContext';
import ConfirmationModal from './ConfirmationModal';
import BundleSelector from './BundleSelector';

const LiveFeed = ({ words, isLoading, onSummarize, onDeleteBundle, onDeleteWord, onDeleteWordFromBundle, pastBundles }) => {
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
      
      // LOGIC SWITCH: Determine which delete function to use
      const deleteHandler = activeBundleId
        ? () => onDeleteWordFromBundle(activeBundleId, currentWord.id) // Delete from saved bundle
        : () => onDeleteWord(currentWord.id); // Delete from live session

      listItems.push(
        <WordCard 
          key={itemKey} 
          wordData={currentWord} 
          onDelete={deleteHandler} 
        />
      );

      if (nextWord) {
        const currentTime = currentWord.timestamp || 0;
        const nextTime = nextWord.timestamp || 0;
        if (currentTime > 0 && nextTime > 0 && (currentTime - nextTime > 3600000)) {
          listItems.push(
            <div key={`divider-${i}`} className="flex items-center justify-center py-6">
              <div className="h-px bg-slate-200 w-full"></div>
              <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center whitespace-nowrap bg-slate-50 rounded-full py-1">
                <Icon name="Clock" className="w-3 h-3 mr-2" /> Session Break
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <BundleSelector 
              activeBundleId={activeBundleId}
              onSelect={setActiveBundleId}
              pastBundles={pastBundles}
            />
            {activeBundleId && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDeleteClick} 
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 h-[42px] w-[42px]" 
                title="Delete Bundle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </Button>
            )}
          </div>
          {hasWords && (
            <Button variant="primary" onClick={onSummarize} className="bg-indigo-600 hover:bg-indigo-700 shadow-md whitespace-nowrap w-full sm:w-auto px-6 py-2.5">
              <Icon name="Sparkles" className="mr-2 w-4 h-4" />
              {activeBundleId ? "Update Bundle" : "Create New Bundle"}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {isLoading && <WordCardSkeleton />}
          {renderListWithDividers()}
          {!isLoading && !hasWords && (
            <div className="text-center py-16 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Icon name={activeBundleId ? "BookOpen" : "Layers"} className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {activeBundleId ? "Bundle Empty" : "Ready for Class"}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
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
        message="Are you sure you want to delete this study bundle? This action cannot be undone."
        confirmText="Yes, Delete Bundle"
      />
    </>
  );
};

export default LiveFeed;
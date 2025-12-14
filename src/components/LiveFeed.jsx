import React from 'react';
import { WordCard, WordCardSkeleton } from './WordCard';
import { Icon } from './ui/Icon';

const LiveFeed = ({ words, isLoading, onDeleteWord, onDeleteWordFromBundle, onRegenerateWord, activeBundleId }) => {
  const hasWords = words && words.length > 0;
  
  const renderListWithDividers = () => {
    if (!words) return null;
    const listItems = [];
    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];
      const nextWord = words[i + 1];
      const itemKey = currentWord.id || `word-${i}-${currentWord.original}`;
      
      const deleteHandler = activeBundleId
        ? () => onDeleteWordFromBundle(activeBundleId, currentWord.id)
        : () => onDeleteWord(currentWord.id);

      // FIX: Only allow regeneration if NOT in a saved bundle (activeBundleId is null)
      const regenerateHandler = !activeBundleId 
        ? () => onRegenerateWord(currentWord.id) 
        : null;

      listItems.push(
        <WordCard 
          key={itemKey} 
          wordData={currentWord} 
          onDelete={deleteHandler} 
          onRegenerate={regenerateHandler} 
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
    <div className="space-y-4 pb-20"> 
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
  );
};

export default LiveFeed;
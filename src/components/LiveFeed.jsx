import React from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';
import { WordCard, WordCardSkeleton } from './WordCard';

const LiveFeed = ({ words, isLoading, onSummarize }) => {
  const hasWords = words && words.length > 0;
  
  const renderListWithDividers = () => {
    if (!words) return null;

    const listItems = [];
    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];
      const nextWord = words[i + 1];

      // FIX: Fallback key if 'id' is missing (handles old data)
      const itemKey = currentWord.id || `word-${i}-${currentWord.original || 'unknown'}`;

      listItems.push(<WordCard key={itemKey} wordData={currentWord} />);

      if (nextWord) {
        // Safe check for timestamps
        const currentTime = currentWord.timestamp || 0;
        const nextTime = nextWord.timestamp || 0;
        const timeDiff = currentTime - nextTime;

        // If gap > 1 hour (3600000 ms) and both have valid timestamps
        if (currentTime > 0 && nextTime > 0 && timeDiff > 3600000) {
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
    <div className="space-y-4">
      {hasWords && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={onSummarize} className="bg-indigo-500 hover:bg-indigo-600">
            <Icon name="Sparkles" className="mr-2" />Summarize Today ({words.length})
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {isLoading && <WordCardSkeleton />}
        {renderListWithDividers()}
        {!isLoading && !hasWords && (
          <div className="text-center py-10 px-6 bg-white rounded-xl shadow-md border border-slate-100">
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Welcome!</h3>
            <p className="text-slate-500">Type a word above to start your German lesson.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;
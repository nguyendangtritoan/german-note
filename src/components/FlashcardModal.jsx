import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

// Helper to render bold text segments (Same as WordCard)
const renderHighlightedText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span 
          key={index} 
          className="text-indigo-700 font-bold bg-indigo-100/60 px-1.5 rounded-md mx-0.5 border border-indigo-200/50 shadow-sm"
        >
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const FlashcardModal = ({ isOpen, onClose, bundle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => { 
    if (isOpen) { 
      setCurrentIndex(0); 
      setIsFlipped(false); 
    } 
  }, [isOpen]);

  if (!bundle?.words?.length) return null;

  const words = bundle.words;
  const currentWord = words[currentIndex];

  if (!currentWord) return null;

  const hasValidArticle = currentWord.article && currentWord.article !== 'null';

  const nextCard = () => { 
    setIsFlipped(false); 
    setCurrentIndex(prev => (prev + 1) % words.length); 
  };
  
  const prevCard = () => { 
    setIsFlipped(false); 
    setCurrentIndex(prev => (prev - 1 + words.length) % words.length); 
  };

  // Helper: Auto-resize font based on character count
  const getDynamicFontSize = (text, isBack = false) => {
    const len = text ? text.length : 0;
    
    if (isBack) {
      if (len > 20) return 'text-2xl';
      if (len > 12) return 'text-3xl';
      if (len > 8) return 'text-4xl';
      return 'text-5xl';
    }

    if (len > 20) return 'text-3xl';
    if (len > 12) return 'text-5xl';
    if (len > 8) return 'text-6xl';
    return 'text-7xl'; 
  };

  const frontSize = getDynamicFontSize(currentWord.original, false);
  const backSize = getDynamicFontSize(currentWord.original, true);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Study: ${new Date(bundle.date).toLocaleDateString()}`}>
      <div className="flex flex-col p-6 h-full">
        
        {/* Flashcard Container */}
        <div className="w-full h-96 rounded-xl bg-slate-50 border-2 border-slate-200 cursor-pointer flex items-center justify-center relative group" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px' }}>
          <div className="w-full h-full relative transition-all duration-500" style={{ transformStyle: 'preserve-3d', transform: `rotateY(${isFlipped ? 180 : 0}deg)` }}>
            
            {/* --- FRONT SIDE --- */}
            <div className="absolute w-full h-full flex items-center justify-center bg-white rounded-xl backface-hidden shadow-sm" style={{ backfaceVisibility: 'hidden' }}>
              <div className="p-6 flex flex-col items-center w-full">
                <span className="mb-6 px-3 py-1 rounded-lg text-sm uppercase font-bold bg-slate-100 text-slate-400 tracking-widest">{currentWord.type}</span>
                
                <h2 className={`${frontSize} font-extrabold text-slate-800 text-center tracking-tight break-words max-w-full leading-tight`}>
                  {hasValidArticle && (
                    <span className="text-indigo-600 mr-2 opacity-0 group-hover:opacity-50 transition-opacity text-[0.6em]" title="Hint: Article">
                      {currentWord.article.charAt(0)}...
                    </span>
                  )}
                  {currentWord.original}
                </h2>
                
                <p className="mt-12 text-sm text-slate-300 uppercase tracking-widest font-bold">Click to Flip</p>
              </div>
            </div>

            {/* --- BACK SIDE --- */}
            <div className="absolute w-full h-full bg-indigo-50 rounded-xl backface-hidden shadow-sm" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="p-8 flex flex-col justify-center h-full text-center space-y-3">
                 
                 <h2 className={`${backSize} font-extrabold text-slate-800 mb-1 tracking-tight leading-tight`}>
                  {hasValidArticle && <span className="text-indigo-600 mr-3">{currentWord.article}</span>}
                  {currentWord.original}
                </h2>
                
                {/* Plural */}
                {currentWord.plural && currentWord.plural !== 'null' && (
                   <div className="bg-white/60 px-3 py-1 rounded-full inline-block mx-auto mb-1 border border-indigo-100">
                     <span className="text-[10px] font-bold text-indigo-400 uppercase mr-2 tracking-wider">Plural</span>
                     <span className="text-lg font-bold text-indigo-900">{currentWord.plural}</span>
                   </div>
                )}

                {/* Verb Forms */}
                {currentWord.verbForms && currentWord.verbForms !== 'null' && (
                   <p className="text-sm text-indigo-700 font-medium bg-indigo-100/50 px-3 py-1.5 rounded-lg mx-auto inline-block">
                     {currentWord.verbForms.replace(/,/g, ' \u00B7 ')}
                   </p>
                )}

                {/* Translations */}
                <div className="my-2 space-y-2">
                  {currentWord.translations && Object.entries(currentWord.translations).map(([lang, text]) => (
                    // FIXED: items-baseline to align text bottom-lines, preventing floating look
                    <div key={lang} className="flex items-baseline justify-center gap-3">
                      <span className="text-xs font-bold text-slate-400 uppercase w-8 text-right">{lang}</span>
                      <span className="text-2xl text-slate-700 font-bold">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Example with Highlighting */}
                <p className="italic text-slate-600 p-3 bg-white/60 rounded-xl mt-1 text-lg leading-relaxed border border-indigo-100/60 font-medium">
                  "{renderHighlightedText(currentWord.example)}"
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <Button variant="secondary" onClick={prevCard}>Previous</Button>
          <span className="text-slate-500 font-bold text-lg">{currentIndex + 1} <span className="text-slate-300 font-normal mx-1">/</span> {words.length}</span>
          <Button variant="secondary" onClick={nextCard}>Next</Button>
        </div>
      </div>
    </Modal>
  );
};

export default FlashcardModal;
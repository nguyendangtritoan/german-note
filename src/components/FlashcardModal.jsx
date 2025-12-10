import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

const FlashcardModal = ({ isOpen, onClose, bundle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Reset state when the modal opens
  useEffect(() => { 
    if (isOpen) { 
      setCurrentIndex(0); 
      setIsFlipped(false); 
    } 
  }, [isOpen]);

  // Basic check: If no bundle or no words, don't render
  if (!bundle?.words?.length) return null;

  const words = bundle.words;
  const currentWord = words[currentIndex];

  // CRITICAL FIX: Safety check
  // If currentIndex is out of bounds or currentWord is missing, stop here.
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Study: ${new Date(bundle.date).toLocaleDateString()}`}>
      <div className="flex flex-col p-6 h-full">
        
        {/* Flashcard Area */}
        <div className="w-full h-80 rounded-xl bg-slate-50 border-2 border-slate-200 cursor-pointer flex items-center justify-center relative group" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px' }}>
          <div className="w-full h-full relative transition-all duration-500" style={{ transformStyle: 'preserve-3d', transform: `rotateY(${isFlipped ? 180 : 0}deg)` }}>
            {/* Front */}
            <div className="absolute w-full h-full flex items-center justify-center bg-white rounded-xl backface-hidden shadow-sm" style={{ backfaceVisibility: 'hidden' }}>
              <div className="p-6 flex flex-col items-center">
                <span className="mb-4 px-2 py-0.5 rounded text-xs uppercase font-bold bg-slate-100 text-slate-400">{currentWord.type}</span>
                <h2 className="text-4xl font-bold text-slate-800 text-center">
                  {hasValidArticle && <span className="text-indigo-600 mr-2 opacity-0 group-hover:opacity-50 transition-opacity" title="Hint: Article">{currentWord.article.charAt(0)}...</span>}
                  {currentWord.original}
                </h2>
                <p className="mt-8 text-xs text-slate-400 uppercase tracking-widest">Click to Flip</p>
              </div>
            </div>
            {/* Back */}
            <div className="absolute w-full h-full bg-indigo-50 rounded-xl backface-hidden shadow-sm" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="p-6 flex flex-col justify-center h-full text-center space-y-4">
                 <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  {hasValidArticle && <span className="text-indigo-600 mr-2">{currentWord.article}</span>}
                  {currentWord.original}
                </h2>
                {currentWord.translations && Object.entries(currentWord.translations).map(([lang, text]) => (
                  <div key={lang}><span className="text-xs font-bold text-slate-400 uppercase mr-2">{lang}</span><span className="text-xl text-slate-700 font-medium">{text}</span></div>
                ))}
                <p className="italic text-slate-600 p-2 bg-white/50 rounded mt-4">"{currentWord.example}"</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <Button variant="secondary" onClick={prevCard}>Previous</Button>
          <span className="text-slate-500 font-medium">{currentIndex + 1} / {words.length}</span>
          <Button variant="secondary" onClick={nextCard}>Next</Button>
        </div>
      </div>
    </Modal>
  );
};

export default FlashcardModal;
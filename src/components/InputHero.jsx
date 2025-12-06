import React, { useState } from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';

const InputHero = ({ onSearch, isLoading }) => {
  const [word, setWord] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim() && !isLoading) { onSearch(word.trim()); setWord(""); }
  };
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input type="text" value={word} onChange={(e) => setWord(e.target.value)} placeholder="Type a German word..." className="w-full pl-6 pr-20 py-5 text-lg border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400" disabled={isLoading} autoFocus />
      <Button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" disabled={isLoading}>
        {isLoading ? <Icon name="Loader2" className="animate-spin" /> : <Icon name="ArrowRight" />}
      </Button>
    </form>
  );
};

export default InputHero;
import React, { useState, useEffect, useRef } from 'react';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface FlashcardGeneratorProps {
  onBack: () => void;
}

interface CardInput {
  id: number;
  question: string;
  answer: string;
}

const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ onBack }) => {
  const [cards, setCards] = useState<CardInput[]>([
    { id: 1, question: '', answer: '' },
  ]);
  const [filename, setFilename] = useState('flashcards.txt');
  const prevCardCount = useRef(cards.length);

  useEffect(() => {
    if (cards.length > prevCardCount.current) {
      // Small delay to ensure the new element is in the DOM before scrolling
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
    prevCardCount.current = cards.length;
  }, [cards.length]);

  const addCard = () => {
    setCards([...cards, { id: Date.now(), question: '', answer: '' }]);
  };

  const removeCard = (id: number) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const handleCardChange = (id: number, field: 'question' | 'answer', value: string) => {
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const generateFile = () => {
    const content = cards
      .map((card) => `Q: ${card.question.trim()}\nA: ${card.answer.trim()}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const areAllCardsFilled = cards.every(card => card.question.trim() && card.answer.trim());

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-4xl pb-8">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-4" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600 dark:text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">Anki Cards</h1>
              <p className="text-md text-slate-600 dark:text-slate-400 mt-1">Create a flashcard file to use with the app.</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`question-${card.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Question</label>
                  <textarea
                    id={`question-${card.id}`}
                    rows={4}
                    value={card.question}
                    onChange={(e) => handleCardChange(card.id, 'question', e.target.value)}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    placeholder="e.g., What is React?"
                  />
                </div>
                <div>
                  <label htmlFor={`answer-${card.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Answer</label>
                  <textarea
                    id={`answer-${card.id}`}
                    rows={4}
                    value={card.answer}
                    onChange={(e) => handleCardChange(card.id, 'answer', e.target.value)}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    placeholder="e.g., A JavaScript library for building user interfaces."
                  />
                </div>
              </div>
              {cards.length > 1 && (
                  <button onClick={() => removeCard(card.id)} className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Remove card">
                      <TrashIcon className="w-5 h-5" />
                  </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
                onClick={addCard}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Another Card
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                 <div className="w-full sm:w-auto">
                    <label htmlFor="filename" className="sr-only">Filename</label>
                    <input
                        type="text"
                        id="filename"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="w-full sm:w-auto p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        placeholder="filename.txt"
                    />
                 </div>
                <button
                    onClick={generateFile}
                    disabled={!areAllCardsFilled || cards.length === 0}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
                    >
                    Generate .txt File
                </button>
            </div>
        </div>
        {!areAllCardsFilled && cards.length > 0 && (
             <p className="text-center text-sm text-yellow-600 dark:text-yellow-400 mt-4">Please fill in all question and answer fields before generating the file.</p>
        )}
      </div>
    </div>
  );
};

export default FlashcardGenerator;
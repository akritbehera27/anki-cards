import React, { useState } from 'react';
import type { FlashcardData } from '../types.ts';

interface FlashcardProps {
  card: FlashcardData;
}

const Flashcard: React.FC<FlashcardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="w-full h-full cursor-pointer group"
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 ease-in-out`}
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front of the card (Question) */}
        <div className="absolute w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
          <div>
            <p className="text-sm font-medium text-sky-500 dark:text-sky-400 mb-2">Question</p>
            <p className="text-2xl font-semibold text-slate-700 dark:text-slate-200">{card.question}</p>
          </div>
        </div>

        {/* Back of the card (Answer) */}
        <div className="absolute w-full h-full bg-sky-100 dark:bg-slate-700 rounded-2xl shadow-lg flex items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
           <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Answer</p>
            <p className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{card.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
import React, { useState, useEffect, useCallback } from 'react';
import Flashcard from './Flashcard.tsx';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';
import ShuffleIcon from './icons/ShuffleIcon.tsx';
import type { AppFile, FlashcardData } from '../types.ts';

interface FlashcardViewerProps {
  selectedFile: AppFile;
}

const parseFlashcards = (content: string): FlashcardData[] => {
    if (!content) return [];
    const cardBlocks = content.trim().split(/\n\n+/);
    return cardBlocks
        .map((block, index) => {
            const lines = block.split('\n');
            const questionLine = lines.find(line => line.trim().startsWith('Q:'));
            const answerLine = lines.find(line => line.trim().startsWith('A:'));

            if (questionLine && answerLine) {
                return {
                    id: index,
                    question: questionLine.substring(questionLine.indexOf(':') + 1).trim(),
                    answer: answerLine.substring(answerLine.indexOf(':') + 1).trim(),
                };
            }
            return null;
        })
        .filter((card): card is FlashcardData => card !== null);
};

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ selectedFile }) => {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shuffleFlashcards = useCallback(() => {
    setFlashcards(prev => shuffleArray(prev));
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    const parsed = parseFlashcards(selectedFile.content);
    setFlashcards(shuffleArray(parsed));
    setCurrentIndex(0);
  }, [selectedFile]);
  
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };
  
  if (flashcards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">No Flashcards Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          This file is empty or not formatted correctly. 
          Ensure your file uses the 'Q: ...' and 'A: ...' format, with each card separated by a blank line.
        </p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl h-80 md:h-96 mb-6">
        {currentCard && <Flashcard key={currentCard.id} card={currentCard} />}
      </div>
      
      <div className="flex items-center justify-center space-x-4 w-full max-w-2xl">
        <button onClick={goToPrevious} className="p-3 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-md transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>

        <div className="text-lg font-semibold text-slate-600 dark:text-slate-400">
          {currentIndex + 1} / {flashcards.length}
        </div>

        <button onClick={goToNext} className="p-3 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-md transition-colors">
          <ChevronRightIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>

        <button onClick={shuffleFlashcards} className="p-3 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-md transition-colors ml-auto">
          <ShuffleIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardViewer;
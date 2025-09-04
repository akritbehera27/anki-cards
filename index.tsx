import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// --- From types.ts ---
interface FlashcardData {
  id: number;
  question: string;
  answer: string;
}

interface AppFile {
  path: string;
  name: string;
  content: string;
}

interface FileNode {
  type: 'file';
  name: string;
  file: AppFile;
}

interface DirectoryNode {
  type: 'directory';
  name: string;
  children: TreeNode[];
}

type TreeNode = FileNode | DirectoryNode;


// --- From passwords.ts ---
const VALID_PASSWORDS: string[] = [
  'top123',
  'akrit2712',
];

// --- Icon Components ---

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
  </svg>
);

const ShuffleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-3.181-4.991-3.181-3.183a8.25 8.25 0 0 0-11.667 0L2.985 14.652" />
  </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const ArrowUturnLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.43-6.108a2.25 2.25 0 0 1 3.96 0l4.43 6.108a1.012 1.012 0 0 1 0 .639l-4.43 6.108a2.25 2.25 0 0 1-3.96 0l-4.43-6.108Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
  </svg>
);

// --- App Components ---

const Flashcard: React.FC<{ card: FlashcardData }> = ({ card }) => {
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
        <div className="absolute w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
          <div>
            <p className="text-sm font-medium text-sky-500 dark:text-sky-400 mb-2">Question</p>
            <p className="text-2xl font-semibold text-slate-700 dark:text-slate-200">{card.question}</p>
          </div>
        </div>
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

const FlashcardViewer: React.FC<{ selectedFile: AppFile }> = ({ selectedFile }) => {
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

// --- Sidebar components need to be hoisted ---
type TreeItemProps = {
    node: TreeNode;
    selectedFile: AppFile | null;
    onSelectFile: (file: AppFile) => void;
    depth: number;
};

type DirectoryItemProps = {
    node: DirectoryNode;
    selectedFile: AppFile | null;
    onSelectFile: (file: AppFile) => void;
    depth: number;
};

type FileItemProps = {
    node: FileNode;
    selectedFile: AppFile | null;
    onSelectFile: (file: AppFile) => void;
    depth: number;
};


function DirectoryItem({ node, selectedFile, onSelectFile, depth }: DirectoryItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 rounded-md cursor-pointer hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors"
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        <FolderIcon className="w-5 h-5 mr-2 text-sky-500 dark:text-sky-400" />
        <span className="font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">{node.name}</span>
         <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
      {isOpen && (
        <div>
          {node.children.map((child, index) => (
            <TreeItem key={index} node={child} selectedFile={selectedFile} onSelectFile={onSelectFile} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

function FileItem({ node, selectedFile, onSelectFile, depth }: FileItemProps) {
  const isSelected = selectedFile?.path === node.file.path;
  return (
    <div
      onClick={() => onSelectFile(node.file)}
      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
        isSelected ? 'bg-sky-500 text-white' : 'hover:bg-sky-100 dark:hover:bg-slate-700'
      }`}
      style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
    >
      <FileIcon className={`w-5 h-5 mr-2 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
      <span className={`flex-1 truncate ${isSelected ? 'font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>{node.name}</span>
    </div>
  );
};

function TreeItem({ node, selectedFile, onSelectFile, depth }: TreeItemProps) {
    if (node.type === 'directory') {
        return <DirectoryItem node={node} selectedFile={selectedFile} onSelectFile={onSelectFile} depth={depth} />;
    }
    return <FileItem node={node} selectedFile={selectedFile} onSelectFile={onSelectFile} depth={depth} />;
};


const Sidebar: React.FC<{
  fileTree: TreeNode[];
  selectedFile: AppFile | null;
  onSelectFile: (file: AppFile) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ fileTree, selectedFile, onSelectFile, isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}
      <aside className={`fixed inset-y-0 left-0 z-30 w-80 h-full shrink-0 bg-white dark:bg-slate-800 p-4 border-r border-slate-200 dark:border-slate-700 overflow-y-auto transition-all duration-300 ease-in-out md:relative md:dark:bg-slate-800/50 ${isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-80 md:translate-x-0'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 px-2">Chapters</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden" aria-label="Close sidebar">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="space-y-1">
            {fileTree.map((node, index) => (
                <TreeItem key={index} node={node} selectedFile={selectedFile} onSelectFile={onSelectFile} depth={0} />
            ))}
        </nav>
      </aside>
    </>
  );
};

const FileUpload: React.FC<{
  onFilesChange: (files: FileList) => void;
  onGenerateClick: () => void;
  onAccessPNotesClick: () => void;
}> = ({ onFilesChange, onGenerateClick, onAccessPNotesClick }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFormatGuideOpen, setIsFormatGuideOpen] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFilesChange(event.target.files);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const processEntry = async (entry: any): Promise<File[]> => {
      if (entry.isFile) {
        return new Promise((resolve, reject) => {
          entry.file((file: File) => {
            Object.defineProperty(file, 'webkitRelativePath', {
              value: entry.fullPath.startsWith('/') ? entry.fullPath.substring(1) : entry.fullPath,
              configurable: true,
              enumerable: true,
              writable: true,
            });
            resolve([file]);
          }, reject);
        });
      }
      
      if (entry.isDirectory) {
        return new Promise((resolve, reject) => {
          const reader = entry.createReader();
          let allEntries: any[] = [];
          
          const readEntries = () => {
            reader.readEntries(async (entries: any[]) => {
              if (entries.length > 0) {
                allEntries = allEntries.concat(entries);
                readEntries();
              } else {
                try {
                    const files = await Promise.all(allEntries.map(processEntry));
                    resolve(files.flat());
                } catch (err) {
                    reject(err);
                }
              }
            }, reject);
          };
          readEntries();
        });
      }
      return [];
    };

    const items = e.dataTransfer.items;
    if (items && items.length > 0 && typeof items[0].webkitGetAsEntry === 'function') {
      const entryPromises = Array.from(items)
        .map(item => item.webkitGetAsEntry())
        .filter(entry => !!entry)
        .map(entry => processEntry(entry));
      
      try {
        const nestedFiles = await Promise.all(entryPromises);
        const allFiles = nestedFiles.flat();

        if (allFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          allFiles.forEach(file => dataTransfer.items.add(file));
          onFilesChange(dataTransfer.files);
          return;
        }
      } catch (error) {
          console.error("Error processing dropped folder:", error);
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesChange(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-slate-50 dark:bg-slate-900 p-4 pt-24">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">Anki Cards</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Your digital flashcard companion.</p>
        </div>
      <div 
        className={`w-full max-w-xl p-8 border-4 border-dashed rounded-2xl text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleChange}
          className="hidden"
          multiple
          // @ts-ignore
          webkitdirectory=""
        />
        <div className="flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Click to select</p>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Upload your flash notes.</p>
        </div>
      </div>
      
      <div className="mt-8 w-full max-w-xl text-center">
        <div className="mb-8">
            <button 
                onClick={() => setIsFormatGuideOpen(!isFormatGuideOpen)} 
                className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                aria-expanded={isFormatGuideOpen}
                aria-controls="format-guide"
            >
                <span>Format Guide</span>
                <svg className={`w-4 h-4 ml-1 transition-transform duration-300 ${isFormatGuideOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {isFormatGuideOpen && (
            <div id="format-guide" className="mt-3 text-left max-w-md mx-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Each flashcard should have a question prefixed with <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">Q:</code> and an answer with <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">A:</code>. Separate each card with a blank line. and the file shall be in <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">.txt file format</code>.
              </p>
              <pre className="bg-white dark:bg-slate-900/50 p-3 rounded-md text-sm text-slate-700 dark:text-slate-300 overflow-x-auto">
                <code>
{`Q: Who Made this website
A: Akrit Behera

Q: What is 2 + 2?
A: 4`}
                </code>
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-4">
            <button onClick={onAccessPNotesClick} className="w-full max-w-xs mx-auto px-6 py-3 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                Access PNotes
            </button>
            <button onClick={onGenerateClick} className="w-full max-w-xs mx-auto px-6 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg shadow-md transition-transform transform hover:scale-105">
                Create Flashcards
            </button>
        </div>
      </div>
    </div>
  );
};


interface CardInput {
  id: number;
  question: string;
  answer: string;
}

const FlashcardGenerator: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const [cards, setCards] = useState<CardInput[]>([
    { id: 1, question: '', answer: '' },
  ]);
  const [filename, setFilename] = useState('flashcards.txt');
  const prevCardCount = useRef(cards.length);

  useEffect(() => {
    if (cards.length > prevCardCount.current) {
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


const Login: React.FC<{
  onLogin: (password: string) => Promise<boolean>;
  onBack: () => void;
}> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(password);
    if (!success) {
      setError('Invalid password or session already active.');
      setIsLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">PNotes</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Access your private study notes.</p>
        </div>

        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 p-3 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="Enter your access key"
                  required
                  aria-describedby="password-error"
                />
                 <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-slate-500" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
              </div>
            </div>

            {error && <p id="password-error" className="text-red-500 text-sm text-center mb-4" role="alert">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full px-6 py-3 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button onClick={onBack} className="flex items-center justify-center mx-auto px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
            <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
            Back to Upload
          </button>
        </div>
      </div>
    </div>
  );
};


const buildFileTree = (files: AppFile[]): TreeNode[] => {
    const root: DirectoryNode = { type: 'directory', name: 'root', children: [] };

    files.forEach(file => {
        const parts = file.path.split('/').filter(p => p);
        let currentNode: DirectoryNode = root;

        parts.forEach((part, index) => {
            if (index === parts.length - 1) { 
                currentNode.children.push({ type: 'file', name: part, file });
            } else { 
                let dirNode = currentNode.children.find(
                    (child): child is DirectoryNode => child.type === 'directory' && child.name === part
                );

                if (!dirNode) {
                    dirNode = { type: 'directory', name: part, children: [] };
                    currentNode.children.push(dirNode);
                }
                currentNode = dirNode;
            }
        });
    });
    return root.children;
};

const USED_PASSWORDS_KEY = 'ankicards_used_passwords';

const App: React.FC = () => {
    const [appFiles, setAppFiles] = useState<AppFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [currentView, setCurrentView] = useState<'upload' | 'generate' | 'login'>('upload');
    const [loggedInPassword, setLoggedInPassword] = useState<string | null>(null);

    const handleFilesChange = async (fileList: FileList) => {
        setIsLoading(true);
        const filesArray = Array.from(fileList).filter(file => file.type === 'text/plain' || !file.type);
        
        const filePromises = filesArray.map(file => {
            return new Promise<AppFile>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve({
                        // @ts-ignore
                        path: file.webkitRelativePath || file.name,
                        name: file.name,
                        content: event.target?.result as string,
                    });
                };
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            });
        });

        try {
            const loadedFiles = await Promise.all(filePromises);
            loadedFiles.sort((a, b) => a.path.localeCompare(b.path));
            setAppFiles(loadedFiles);
            if (loadedFiles.length > 0) {
                setSelectedFile(loadedFiles[0]);
            }
        } catch (error) {
            console.error("Error reading files:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogin = async (password: string): Promise<boolean> => {
        const usedPasswords = JSON.parse(sessionStorage.getItem(USED_PASSWORDS_KEY) || '[]');
        
        if (VALID_PASSWORDS.includes(password) && !usedPasswords.includes(password)) {
            const newUsedPasswords = [...usedPasswords, password];
            sessionStorage.setItem(USED_PASSWORDS_KEY, JSON.stringify(newUsedPasswords));
            
            setLoggedInPassword(password);
            setIsLoading(true);

            try {
                const manifestResponse = await fetch('/PNotes/manifest.json');
                if (!manifestResponse.ok) throw new Error('Failed to fetch PNotes manifest.');
                const filePaths: string[] = await manifestResponse.json();

                const filePromises = filePaths.map(async (path) => {
                    const fileResponse = await fetch(`/PNotes/${path}`);
                    if (!fileResponse.ok) {
                        console.error(`Failed to fetch /PNotes/${path}`);
                        return null;
                    }
                    const content = await fileResponse.text();
                    const name = path.split('/').pop() || path;
                    return { path: `PNotes/${path}`, name, content };
                });

                const loadedFiles = (await Promise.all(filePromises))
                    .filter((f): f is AppFile => f !== null)
                    .sort((a, b) => a.path.localeCompare(b.path));
                
                setAppFiles(loadedFiles);
                setSelectedFile(null);
                setCurrentView('upload');
            } catch (error) {
                console.error("Error accessing PNotes:", error);
                const usedPasswords = JSON.parse(sessionStorage.getItem(USED_PASSWORDS_KEY) || '[]');
                const newUsedPasswords = usedPasswords.filter((p: string) => p !== password);
                sessionStorage.setItem(USED_PASSWORDS_KEY, JSON.stringify(newUsedPasswords));
                setLoggedInPassword(null);
            } finally {
                setIsLoading(false);
            }
            return true;
        }
        return false;
    };

    const handleReturnToHome = () => {
        if (loggedInPassword) {
            const usedPasswords = JSON.parse(sessionStorage.getItem(USED_PASSWORDS_KEY) || '[]');
            const newUsedPasswords = usedPasswords.filter((p: string) => p !== loggedInPassword);
            sessionStorage.setItem(USED_PASSWORDS_KEY, JSON.stringify(newUsedPasswords));
            setLoggedInPassword(null);
        }
        setAppFiles([]);
        setSelectedFile(null);
        setCurrentView('upload');
    };

    const handleSelectFile = (file: AppFile) => {
        setSelectedFile(file);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const fileTree = useMemo(() => buildFileTree(appFiles), [appFiles]);

    useEffect(() => {
        if (appFiles.length > 0 && !selectedFile) {
            const findFirstFile = (nodes: TreeNode[]): AppFile | null => {
                for (const node of nodes) {
                    if (node.type === 'file') {
                        return node.file;
                    }
                    if (node.type === 'directory') {
                        const file = findFirstFile(node.children);
                        if (file) return file;
                    }
                }
                return null;
            }
            setSelectedFile(findFirstFile(fileTree));
        }
    }, [appFiles, fileTree, selectedFile]);


    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <p className="text-xl font-semibold">{loggedInPassword === null ? 'Loading your study materials...' : 'Accessing PNotes...'}</p>
            </div>
        );
    }
    
    if (currentView === 'login') {
        return <Login onLogin={handleLogin} onBack={() => setCurrentView('upload')} />;
    }

    if (appFiles.length === 0) {
        if (currentView === 'generate') {
            return <FlashcardGenerator onBack={() => setCurrentView('upload')} />;
        }
        return <FileUpload 
            onFilesChange={handleFilesChange} 
            onGenerateClick={() => setCurrentView('generate')}
            onAccessPNotesClick={() => setCurrentView('login')} 
        />;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <Sidebar 
                fileTree={fileTree} 
                selectedFile={selectedFile} 
                onSelectFile={handleSelectFile} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden">
                 <header className="flex items-center justify-between p-4 h-16 shrink-0 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 z-10">
                    <div className="flex items-center min-w-0">
                        <button
                            className="mr-3 p-2 -ml-2 text-slate-600 dark:text-slate-300"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate" title={loggedInPassword ? 'PNotes' : selectedFile?.name}>
                           {loggedInPassword ? 'PNotes' : (selectedFile?.name ?? 'Flashcards')}
                        </h1>
                    </div>

                    <button
                        onClick={handleReturnToHome}
                        className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm transition-colors shrink-0"
                    >
                        <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
                        {loggedInPassword ? 'Logout' : 'New Upload'}
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto">
                    {selectedFile ? (
                        <FlashcardViewer selectedFile={selectedFile} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-center p-4">
                            <p className="text-xl text-slate-500">Select a chapter from the menu to begin your study session.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};


// --- Root Renderer ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
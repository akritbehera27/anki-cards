import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFilesChange: (files: FileList) => void;
  onGenerateClick: () => void;
  onAccessPNotesClick: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, onGenerateClick, onAccessPNotesClick }) => {
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

    // Using `any` to handle non-standard File System Access API properties
    const processEntry = async (entry: any): Promise<File[]> => {
      if (entry.isFile) {
        return new Promise((resolve, reject) => {
          entry.file((file: File) => {
            // Manually add webkitRelativePath for dropped files
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
                readEntries(); // Read next batch
              } else {
                // All entries read
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
          // Optionally, show error to user
      }
    }

    // Fallback for file-only drops or browsers not supporting .webkitGetAsEntry
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
          // @ts-ignore - webkitdirectory is a non-standard attribute for folder uploads
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

export default FileUpload;
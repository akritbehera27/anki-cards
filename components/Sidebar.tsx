import React, { useState } from 'react';
import type { AppFile, DirectoryNode, FileNode, TreeNode } from '../types.ts';
import FolderIcon from './icons/FolderIcon.tsx';
import FileIcon from './icons/FileIcon.tsx';
import XIcon from './icons/XIcon.tsx';

interface SidebarProps {
  fileTree: TreeNode[];
  selectedFile: AppFile | null;
  onSelectFile: (file: AppFile) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DirectoryItem: React.FC<{
  node: DirectoryNode;
  selectedFile: AppFile | null;
  onSelectFile: (file: AppFile) => void;
  depth: number;
}> = ({ node, selectedFile, onSelectFile, depth }) => {
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

const FileItem: React.FC<{
  node: FileNode;
  selectedFile: AppFile | null;
  onSelectFile: (file: AppFile) => void;
  depth: number;
}> = ({ node, selectedFile, onSelectFile, depth }) => {
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

const TreeItem: React.FC<{
    node: TreeNode;
    selectedFile: AppFile | null;
    onSelectFile: (file: AppFile) => void;
    depth: number;
}> = ({ node, selectedFile, onSelectFile, depth }) => {
    if (node.type === 'directory') {
        return <DirectoryItem node={node} selectedFile={selectedFile} onSelectFile={onSelectFile} depth={depth} />;
    }
    return <FileItem node={node} selectedFile={selectedFile} onSelectFile={onSelectFile} depth={depth} />;
};


const Sidebar: React.FC<SidebarProps> = ({ fileTree, selectedFile, onSelectFile, isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop for mobile */}
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

export default Sidebar;
import React, { useState, useMemo, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Sidebar from './components/Sidebar';
import FlashcardViewer from './components/FlashcardViewer';
import type { AppFile, TreeNode, DirectoryNode } from './types';
import MenuIcon from './components/icons/MenuIcon';
import FlashcardGenerator from './components/FlashcardGenerator';
import ArrowUturnLeftIcon from './components/icons/ArrowUturnLeftIcon';
import Login from './components/Login';
import { VALID_PASSWORDS } from './passwords';

const buildFileTree = (files: AppFile[]): TreeNode[] => {
    const root: DirectoryNode = { type: 'directory', name: 'root', children: [] };

    files.forEach(file => {
        const parts = file.path.split('/').filter(p => p);
        let currentNode: DirectoryNode = root;

        parts.forEach((part, index) => {
            if (index === parts.length - 1) { // It's a file
                currentNode.children.push({ type: 'file', name: part, file });
            } else { // It's a directory
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

const USED_PASSWORDS_KEY = 'flashgen_used_passwords';

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
            // Optionally, show an error message to the user
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
                // Rollback login state on error
                const usedPasswords = JSON.parse(sessionStorage.getItem(USED_PASSWORDS_KEY) || '[]');
                const newUsedPasswords = usedPasswords.filter((p: string) => p !== password);
                sessionStorage.setItem(USED_PASSWORDS_KEY, JSON.stringify(newUsedPasswords));
                setLoggedInPassword(null);
                // Optionally, show an error message to the user
            } finally {
                setIsLoading(false);
            }
            return true;
        }
        return false;
    };

    const handleReturnToHome = () => {
        // This function handles both "Logout" and "New Upload"
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
        if (window.innerWidth < 768) { // Tailwind's `md` breakpoint
            setIsSidebarOpen(false);
        }
    };

    const fileTree = useMemo(() => buildFileTree(appFiles), [appFiles]);

    useEffect(() => {
        // Auto-select the first file when files are loaded
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

    // This condition covers the initial state, after logging out, or after clearing an upload.
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

export default App;
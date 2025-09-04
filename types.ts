
export interface FlashcardData {
  id: number;
  question: string;
  answer: string;
}

export interface AppFile {
  path: string;
  name: string;
  content: string;
}

export interface FileNode {
  type: 'file';
  name: string;
  file: AppFile;
}

export interface DirectoryNode {
  type: 'directory';
  name: string;
  children: TreeNode[];
}

export type TreeNode = FileNode | DirectoryNode;

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'author' | 'admin' | 'staff';
  createdAt: string;
}

export interface Manuscript {
  id: number;
  title: string;
  fileName: string;
  fileType: 'txt' | 'docx' | 'pdf';
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  version: number;
}

export interface AnalysisResult {
  manuscriptId: number;
  pacing: {
    slow: number[];
    medium: number[];
    fast: number[];
  };
  emotionFlow: Array<{
    chapter: number;
    emotion: string;
    intensity: number;
  }>;
  characters: Array<{
    name: string;
    appearances: number;
    role: string;
  }>;
  characterRelations: Array<{
    character1: string;
    character2: string;
    relationship: string;
    strength: number;
  }>;
  summary: {
    totalChapters: number;
    totalWords: number;
    averageWordsPerChapter: number;
    writingStyle: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CharacterRelation {
  character1: string;
  character2: string;
  relationship: string;
  strength: number;
}


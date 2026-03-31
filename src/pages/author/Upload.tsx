import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import mammoth from 'mammoth';
import { 
  Upload as UploadIcon, 
  FileText, 
  X, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  BarChart3,
  Edit3,
  Save,
  FilePlus,
  FolderOpen,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Minus,
  GitCompare,
  Star,
  Copy,
  Plus,
  Undo,
  Redo,
  Underline
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

// Data structures
interface Version {
  id: string;
  version: number;
  label: string;
  content: string;
  createdAt: string;
  isMain: boolean;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  versions: Version[];
}

interface Story {
  id: string;
  title: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

// Mock data
const mockStories: Story[] = [
  {
    id: '1',
    title: 'Shadows Under the Moonlight',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-25',
    chapters: [
      {
        id: '1-1',
        title: 'Chapter 1 - The Beginning',
        order: 1,
        versions: [
          { id: 'v1-1-1', version: 1, label: 'Draft', content: 'Chapter 1 content version 1...', createdAt: '2024-12-15', isMain: false },
          { id: 'v1-1-2', version: 2, label: 'Revised', content: 'Chapter 1 content version 2...', createdAt: '2024-12-18', isMain: true },
        ]
      },
      {
        id: '1-2',
        title: 'Chapter 2 - The Incident',
        order: 2,
        versions: [
          { id: 'v1-2-1', version: 1, label: 'Draft', content: 'Chapter 2 content version 1...', createdAt: '2024-12-20', isMain: true },
        ]
      },
      {
        id: '1-3',
        title: 'Chapter 3 - Development',
        order: 3,
        versions: [
          { id: 'v1-3-1', version: 1, label: 'Draft', content: 'Chapter 3 content version 1...', createdAt: '2024-12-22', isMain: false },
          { id: 'v1-3-2', version: 2, label: 'Revised', content: 'Chapter 3 content version 2...', createdAt: '2024-12-23', isMain: false },
          { id: 'v1-3-3', version: 3, label: 'Final', content: 'Chapter 3 content version 3...', createdAt: '2024-12-25', isMain: true },
        ]
      },
    ]
  },
  {
    id: '2',
    title: 'Rainy Days in the South',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-24',
    chapters: [
      {
        id: '2-1',
        title: 'Chapter 1 - Opening',
        order: 1,
        versions: [
          { id: 'v2-1-1', version: 1, label: 'Draft', content: 'Chapter 1 content...', createdAt: '2024-12-20', isMain: true },
        ]
      },
    ]
  },
];

const STORAGE_KEY = 'storynest_stories';

function EditorToolbar({ 
  onUndo,
  onRedo,
  onBold, 
  onItalic,
  onUnderline,
  canUndo,
  canRedo
}: {
  onUndo: () => void;
  onRedo: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/30 rounded-t-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8 p-0"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-8 w-8 p-0"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onBold}
        className="h-8 w-8 p-0"
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onItalic}
        className="h-8 w-8 p-0"
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onUnderline}
        className="h-8 w-8 p-0"
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </Button>
    </div>
  );
}

function StorySidebar({ 
  stories, 
  selectedChapterId, 
  onSelectChapter,
  onSelectStory,
  onCreateStory,
  onImportFile,
  onUpdateStoryTitle
}: {
  stories: Story[];
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onSelectStory: (storyId: string) => void;
  onCreateStory: () => void;
  onImportFile: () => void;
  onUpdateStoryTitle: (storyId: string, newTitle: string) => void;
}) {
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [editingStoryTitle, setEditingStoryTitle] = useState('');

  const toggleStory = (storyId: string) => {
    setExpandedStories(prev => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  return (
    <div className="w-64 border-r border-border bg-secondary/20 h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground mb-3">Stories</h3>
        <div className="flex gap-2">
          <Button
            onClick={onCreateStory}
            className="flex-1 bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button
            onClick={onImportFile}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <UploadIcon className="w-4 h-4 mr-1" />
            Import
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {stories.map((story) => (
          <div key={story.id} className="mb-2 group">
            <div
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50"
            >
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer"
                onClick={() => {
                  if (editingStoryId !== story.id) {
                    toggleStory(story.id);
                    onSelectStory(story.id);
                  }
                }}
              >
                {expandedStories.has(story.id) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <BookOpen className="w-4 h-4 text-primary" />
                {editingStoryId === story.id ? (
                  <Input
                    value={editingStoryTitle}
                    onChange={(e) => setEditingStoryTitle(e.target.value)}
                    onBlur={() => {
                      if (editingStoryTitle.trim() && editingStoryTitle.trim() !== story.title) {
                        onUpdateStoryTitle(story.id, editingStoryTitle.trim());
                      }
                      setEditingStoryId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editingStoryTitle.trim() && editingStoryTitle.trim() !== story.title) {
                          onUpdateStoryTitle(story.id, editingStoryTitle.trim());
                        }
                        setEditingStoryId(null);
                      }
                      if (e.key === 'Escape') {
                        setEditingStoryTitle(story.title);
                        setEditingStoryId(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 text-sm font-medium flex-1"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-sm font-medium text-foreground flex-1 truncate"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingStoryId(story.id);
                      setEditingStoryTitle(story.title);
                    }}
                  >
                    {story.title}
                  </span>
                )}
              </div>
              {editingStoryId !== story.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingStoryId(story.id);
                    setEditingStoryTitle(story.title);
                  }}
                  title="Edit story title"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              )}
            </div>
            {expandedStories.has(story.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {story.chapters.map((chapter) => (
                  <div key={chapter.id}>
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedChapterId === chapter.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-secondary/30'
                      }`}
                      onClick={() => {
                        toggleChapter(chapter.id);
                        onSelectChapter(chapter.id);
                      }}
                    >
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      )}
                      <FileText className="w-3 h-3" />
                      <span className="text-xs text-foreground flex-1 truncate">
                        {chapter.title}
                      </span>
                    </div>
                    {expandedChapters.has(chapter.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {chapter.versions.map((version) => (
                          <div
                            key={version.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                              version.isMain
                                ? 'bg-primary/5 text-primary font-medium'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <span className="w-8">v{version.version}</span>
                            <span className="flex-1 truncate">{version.label}</span>
                            {version.isMain && <Star className="w-3 h-3 fill-primary text-primary" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Version Manager Modal
function VersionManagerModal({
  chapter,
  isOpen,
  onClose,
  onView,
  onEdit,
  onCompare,
  onSetMain
}: {
  chapter: Chapter | null;
  isOpen: boolean;
  onClose: () => void;
  onView: (versionId: string) => void;
  onEdit: (versionId: string) => void;
  onCompare: (versionId1: string, versionId2: string) => void;
  onSetMain: (versionId: string) => void;
}) {
  if (!chapter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{chapter.title}</DialogTitle>
          <DialogDescription>
            Manage versions of this chapter
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          <div className="text-sm font-medium text-foreground mb-2">Versions:</div>
          {chapter.versions.map((version) => (
            <div
              key={version.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/30"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">v{version.version}</span>
                  <Badge variant="outline" className="text-xs">
                    {version.label}
                  </Badge>
                  {version.isMain && (
                    <Badge variant="default" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Main
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(version.createdAt).toLocaleDateString('en-US')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(version.id)}
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(version.id)}
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const otherVersion = chapter.versions.find(v => v.id !== version.id);
                    if (otherVersion) onCompare(version.id, otherVersion.id);
                  }}
                  title="Compare"
                >
                  <GitCompare className="w-4 h-4" />
                </Button>
                {!version.isMain && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetMain(version.id)}
                    title="Set as Main"
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Import Dialog Component
function ImportDialog({
  fileName,
  defaultStoryName,
  isOpen,
  onClose,
  onConfirm
}: {
  fileName: string;
  defaultStoryName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (storyName: string, versionLabel: string) => void;
}) {
  const [storyName, setStoryName] = useState(defaultStoryName);
  const [versionLabel, setVersionLabel] = useState('Draft');

  useEffect(() => {
    if (isOpen) {
      setStoryName(defaultStoryName);
      setVersionLabel('Draft');
    }
  }, [isOpen, defaultStoryName]);

  const handleConfirm = () => {
    if (storyName.trim()) {
      onConfirm(storyName.trim(), versionLabel.trim() || 'Draft');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Story Information</DialogTitle>
          <DialogDescription>
            Set name for story and version for file: {fileName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="story-name">Story Name</Label>
            <Input
              id="story-name"
              value={storyName}
              onChange={(e) => setStoryName(e.target.value)}
              placeholder="Enter story name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="version-label">Version Name (applies to all chapters)</Label>
            <Input
              id="version-label"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="Example: Draft, First Draft, Imported..."
            />
            <p className="text-xs text-muted-foreground">
              This version name will be applied to all chapters in the story
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!storyName.trim()}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Version Name Dialog Component
function VersionNameDialog({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (versionName: string) => void;
}) {
  const [versionName, setVersionName] = useState('Draft');

  useEffect(() => {
    if (isOpen) {
      setVersionName('Draft');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (versionName.trim()) {
      onConfirm(versionName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Version Name</DialogTitle>
          <DialogDescription>
            Enter a name for this version
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="version-name">Version Name</Label>
            <Input
              id="version-name"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="Example: Draft, First Draft, Revised..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!versionName.trim()}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Create Story Dialog Component
function CreateStoryDialog({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (storyTitle: string) => void;
}) {
  const [storyTitle, setStoryTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStoryTitle('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (storyTitle.trim()) {
      onConfirm(storyTitle.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Story</DialogTitle>
          <DialogDescription>
            Enter a title for your new story
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="story-title">Story Title</Label>
            <Input
              id="story-title"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="Example: My First Story..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!storyTitle.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Create Chapter Dialog Component
function CreateChapterDialog({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (chapterTitle: string) => void;
}) {
  const [chapterTitle, setChapterTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setChapterTitle('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (chapterTitle.trim()) {
      onConfirm(chapterTitle.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Chapter</DialogTitle>
          <DialogDescription>
            Enter a title for the new chapter
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Chapter Title</Label>
            <Input
              id="chapter-title"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Example: Chapter 1, Chapter 2 - Title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!chapterTitle.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compare Version View
function CompareVersionView({
  version1,
  version2,
  isOpen,
  onClose,
  onSetMain,
  onCreateNew
}: {
  version1: Version | null;
  version2: Version | null;
  isOpen: boolean;
  onClose: () => void;
  onSetMain: (versionId: string) => void;
  onCreateNew: () => void;
}) {
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignorePunctuation, setIgnorePunctuation] = useState(false);

  if (!version1 || !version2) return null;

  // Simple diff algorithm (for demo)
  const getDiff = (text1: string, text2: string) => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLen = Math.max(lines1.length, lines2.length);
    const diff: Array<{ type: 'deleted' | 'added' | 'modified' | 'unchanged'; line1?: string; line2?: string; lineNum: number }> = [];

    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (!line1 && line2) {
        diff.push({ type: 'added', line2, lineNum: i + 1 });
      } else if (line1 && !line2) {
        diff.push({ type: 'deleted', line1, lineNum: i + 1 });
      } else if (line1 !== line2) {
        diff.push({ type: 'modified', line1, line2, lineNum: i + 1 });
      } else {
        diff.push({ type: 'unchanged', line1, line2, lineNum: i + 1 });
      }
    }

    return diff;
  };

  const diff = getDiff(version1.content, version2.content);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Version</DialogTitle>
          <DialogDescription>
            v{version1.version} vs v{version2.version}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Select defaultValue={version1.id}>
              <SelectTrigger>
                <SelectValue>v{version1.version} - {version1.label}</SelectValue>
              </SelectTrigger>
            </Select>
          </div>
          <div className="text-muted-foreground">vs</div>
          <div className="flex-1">
            <Select defaultValue={version2.id}>
              <SelectTrigger>
                <SelectValue>v{version2.version} - {version2.label}</SelectValue>
              </SelectTrigger>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Switch
              id="ignore-whitespace"
              checked={ignoreWhitespace}
              onCheckedChange={setIgnoreWhitespace}
            />
            <Label htmlFor="ignore-whitespace" className="text-xs">
              Ignore whitespace
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="ignore-punctuation"
              checked={ignorePunctuation}
              onCheckedChange={setIgnorePunctuation}
            />
            <Label htmlFor="ignore-punctuation" className="text-xs">
              Ignore punctuation
            </Label>
          </div>
        </div>

        <div className="flex-1 overflow-auto border border-border rounded-lg">
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Left column */}
            <div className="bg-background">
              <div className="sticky top-0 bg-secondary/50 p-2 border-b border-border text-sm font-medium">
                v{version1.version} - {version1.label}
              </div>
              <div className="p-4 font-mono text-sm">
                {diff.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      item.type === 'deleted'
                        ? 'bg-destructive/20 text-destructive'
                        : item.type === 'modified'
                        ? 'bg-yellow-500/20'
                        : ''
                    }`}
                  >
                    <span className="text-muted-foreground mr-2 select-none">
                      {item.lineNum}
                    </span>
                    {item.line1 && (
                      <span className={item.type === 'deleted' ? 'line-through' : ''}>
                        {item.line1}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="bg-background">
              <div className="sticky top-0 bg-secondary/50 p-2 border-b border-border text-sm font-medium">
                v{version2.version} - {version2.label}
              </div>
              <div className="p-4 font-mono text-sm">
                {diff.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      item.type === 'added'
                        ? 'bg-primary/20 text-primary'
                        : item.type === 'modified'
                        ? 'bg-yellow-500/20'
                        : ''
                    }`}
                  >
                    <span className="text-muted-foreground mr-2 select-none">
                      {item.lineNum}
                    </span>
                    {item.line2 && <span>{item.line2}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onSetMain(version2.id)}>
            <Star className="w-4 h-4 mr-2" />
            Set this version as main
          </Button>
          <Button onClick={onCreateNew}>
            <Copy className="w-4 h-4 mr-2" />
            Create new version from comparison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UploadPage() {
  const [mode, setMode] = useState<'upload' | 'editor'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  
  // Stories state
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  
  // Editor states
  const [editorContent, setEditorContent] = useState('');
  const [currentChapterTitle, setCurrentChapterTitle] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Undo/Redo states
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Modals
  const [versionManagerOpen, setVersionManagerOpen] = useState(false);
  const [compareViewOpen, setCompareViewOpen] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<Version | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<Version | null>(null);
  
  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; fileId: string; progressInterval: NodeJS.Timeout } | null>(null);
  
  // Version name dialog state
  const [versionNameDialogOpen, setVersionNameDialogOpen] = useState(false);
  
  // Create chapter dialog state
  const [createChapterDialogOpen, setCreateChapterDialogOpen] = useState(false);
  
  // Create story dialog state
  const [createStoryDialogOpen, setCreateStoryDialogOpen] = useState(false);

  // Option 2: Upload by chapter — select story + chapter
  const [selectedStoryIdForUpload, setSelectedStoryIdForUpload] = useState<string | null>(null);
  const [selectedChapterIdForUpload, setSelectedChapterIdForUpload] = useState<string | null>(null);
  const [isDraggingOption2, setIsDraggingOption2] = useState(false);
  const [uploadingChapterFile, setUploadingChapterFile] = useState<UploadingFile | null>(null);

  // Get selected chapter
  const selectedChapter = stories
    .flatMap(s => s.chapters)
    .find(c => c.id === selectedChapterId);

  // Get selected version
  const selectedVersion = selectedChapter?.versions.find(v => v.id === selectedVersionId);

  // Load stories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedStories = JSON.parse(saved);
        setStories(savedStories);
      } catch (error) {
        console.error('Error loading stories:', error);
      }
    }
  }, []);

  // Track if we're currently undoing/redoing to avoid saving to history
  const isUndoRedoRef = useRef(false);

  // Sync editor content with innerHTML when content changes externally
  useEffect(() => {
    if (editorRef.current && isUndoRedoRef.current) {
      editorRef.current.innerHTML = editorContent || '<p><br></p>';
      isUndoRedoRef.current = false;
    } else if (editorRef.current && editorRef.current.innerHTML !== editorContent && editorContent) {
      // Only sync if content is different and not from user typing
      const currentText = editorRef.current.textContent || '';
      const newText = htmlToText(editorContent);
      // Only update if it's a significant difference (not just from typing)
      if (Math.abs(currentText.length - newText.length) > 10) {
        editorRef.current.innerHTML = editorContent || '<p><br></p>';
      }
    }
  }, [editorContent]);

  // Auto-save to history when content changes (debounced)
  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    if (!editorRef.current) return;

    const timeoutId = setTimeout(() => {
      const currentContent = editorRef.current?.innerHTML || '';
      if (currentContent !== editorContent) {
        setEditorContent(currentContent);
        setHistory(prev => {
          const currentIndex = historyIndex;
          const newHistory = prev.slice(0, currentIndex + 1);
          // Only add if content is different from last history entry
          if (newHistory[newHistory.length - 1] !== currentContent) {
            newHistory.push(currentContent);
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
          }
          return prev;
        });
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorContent]);

  // Save stories to localStorage
  const saveStories = (newStories: Story[]) => {
    setStories(newStories);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStories));
  };

  // Upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  // Parse Word file and detect chapters
  const parseWordFile = async (file: File, storyTitle: string, versionLabel: string): Promise<Story | null> => {
    try {
      // Convert Word to HTML
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      // Parse HTML to extract structured content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Extract all paragraphs and headings
      const elements: Array<{ type: 'heading' | 'paragraph'; level?: number; text: string }> = [];
      
      // Process all child nodes
      const processNode = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          
          // Check for headings (h1-h6)
          if (tagName.match(/^h[1-6]$/)) {
            const level = parseInt(tagName.charAt(1));
            const text = el.textContent?.trim() || '';
            if (text) {
              elements.push({ type: 'heading', level, text });
            }
          } else if (tagName === 'p') {
            // Regular paragraph
            const text = el.textContent?.trim() || '';
            if (text) {
              elements.push({ type: 'paragraph', text });
            }
          }
          
          // Process children
          Array.from(el.childNodes).forEach(processNode);
        }
      };
      
      Array.from(tempDiv.childNodes).forEach(processNode);
      
      // If no structured elements found, fallback to plain text
      if (elements.length === 0) {
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        paragraphs.forEach(p => {
          elements.push({ type: 'paragraph', text: p.trim() });
        });
      }
      
      // Detect chapters using multiple strategies
      const chapterPatterns = [
        /^#\s*(Chương|Chapter)\s*(\d+)[\s:–-]*(.*)$/i,     // # Chương 1: Title
        /^(Chương|Chapter)\s*(\d+)[\s:–-]*(.*)$/i,         // Chương 1: Title
        /^Chương\s*(\d+)[\s:–-]*(.*)$/i,                    // Chương 1 Title
        /^Chapter\s*(\d+)[\s:–-]*(.*)$/i,                   // Chapter 1 Title
        /^(\d+)[\s.:–-]+\s*(.+)$/i,                        // 1. Title or 1: Title
      ];
      
      const chapters: Chapter[] = [];
      let currentChapter: { title: string; content: string[] } | null = null;
      let chapterOrder = 0;
      
      elements.forEach((element, index) => {
        const { type, level, text } = element;
        let isChapterHeader = false;
        let chapterTitle = '';
        let chapterNumber = 0;
        
        // Strategy 1: Check if it's a Heading 1 (H1)
        if (type === 'heading' && level === 1) {
          isChapterHeader = true;
          chapterNumber = chapterOrder + 1;
          chapterTitle = text;
        }
        
        // Strategy 2: Check if it's a Heading 2 (H2) and matches chapter pattern
        if (!isChapterHeader && type === 'heading' && level === 2) {
          for (const pattern of chapterPatterns) {
            const match = text.match(pattern);
            if (match) {
              isChapterHeader = true;
              if (match[2]) {
                chapterNumber = parseInt(match[2], 10);
                chapterTitle = match[3]?.trim() || `Chapter ${chapterNumber}`;
              } else if (match[1] && !isNaN(parseInt(match[1], 10))) {
                chapterNumber = parseInt(match[1], 10);
                chapterTitle = match[2]?.trim() || `Chapter ${chapterNumber}`;
              } else {
                chapterNumber = chapterOrder + 1;
                chapterTitle = text;
              }
              break;
            }
          }
        }
        
        // Strategy 3: Check paragraph text for chapter patterns
        if (!isChapterHeader && type === 'paragraph') {
          for (const pattern of chapterPatterns) {
            const match = text.match(pattern);
            if (match && text.length < 150) { // Likely a header if short
              isChapterHeader = true;
              if (match[2]) {
                chapterNumber = parseInt(match[2], 10);
                chapterTitle = match[3]?.trim() || `Chapter ${chapterNumber}`;
              } else if (match[1] && !isNaN(parseInt(match[1], 10))) {
                chapterNumber = parseInt(match[1], 10);
                chapterTitle = match[2]?.trim() || `Chapter ${chapterNumber}`;
              } else {
                chapterNumber = chapterOrder + 1;
                chapterTitle = text;
              }
              break;
            }
          }
        }
        
        if (isChapterHeader) {
          // Save previous chapter if exists
          if (currentChapter && currentChapter.content.length > 0) {
            chapterOrder++;
            chapters.push({
              id: `${Date.now()}-${chapterOrder}`,
              title: currentChapter.title,
              order: chapterOrder,
          versions: [{
            id: `${Date.now()}-${chapterOrder}-v1`,
            version: 1,
            label: versionLabel,
            content: currentChapter.content.join('\n\n'),
            createdAt: new Date().toISOString(),
            isMain: true
          }]
            });
          }
          
          // Start new chapter
          currentChapter = {
            title: chapterTitle || `Chapter ${chapterNumber || chapterOrder + 1}`,
            content: []
          };
        } else {
          // Add to current chapter or create default chapter
          if (!currentChapter) {
            chapterOrder = 1;
            currentChapter = {
              title: 'Chapter 1',
              content: []
            };
          }
          if (text.trim()) {
            currentChapter.content.push(text);
          }
        }
      });
      
      // Save last chapter
      if (currentChapter) {
        if (currentChapter.content.length > 0 || chapters.length === 0) {
          chapterOrder++;
          chapters.push({
            id: `${Date.now()}-${chapterOrder}`,
            title: currentChapter.title,
            order: chapterOrder,
            versions: [{
              id: `${Date.now()}-${chapterOrder}-v1`,
              version: 1,
              label: versionLabel,
              content: currentChapter.content.join('\n\n'),
              createdAt: new Date().toISOString(),
              isMain: true
            }]
          });
        }
      }
      
      // If no chapters detected, create one chapter with all content
      if (chapters.length === 0) {
        const allText = elements.map(e => e.text).join('\n\n');
        chapters.push({
          id: `${Date.now()}-1`,
          title: 'Chapter 1',
          order: 1,
          versions: [{
            id: `${Date.now()}-1-v1`,
            version: 1,
            label: versionLabel,
            content: allText,
            createdAt: new Date().toISOString(),
            isMain: true
          }]
        });
      }
      
      // Create story
      const newStory: Story = {
        id: Date.now().toString(),
        title: storyTitle,
        chapters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newStory;
    } catch (error) {
      console.error('Error parsing Word file:', error);
      return null;
    }
  };

  // Parse Word file as single chapter (entire file = 1 chapter, no splitting)
  const parseWordFileAsSingleChapter = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const elements: string[] = [];
      const processNode = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          if (tagName.match(/^h[1-6]$/) || tagName === 'p') {
            const text = el.textContent?.trim() || '';
            if (text) elements.push(text);
          }
          Array.from(el.childNodes).forEach(processNode);
        }
      };
      Array.from(tempDiv.childNodes).forEach(processNode);
      if (elements.length === 0) {
        const text = tempDiv.textContent || tempDiv.innerText || '';
        return text.split(/\n\s*\n/).filter(p => p.trim()).join('\n\n');
      }
      return elements.join('\n\n');
    } catch (error) {
      console.error('Error parsing Word file as single chapter:', error);
      throw error;
    }
  };

  const handleFiles = async (files: File[]) => {
    const newFiles: UploadingFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (const file of files) {
      const fileId = newFiles.find(f => f.name === file.name)?.id;
      if (!fileId) continue;

      // Update progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
          progress = 90; // Keep at 90% until processing is done
        }
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress } : f)
        );
      }, 200);

      try {
        // Show import dialog first
        setPendingFile({ file, fileId, progressInterval });
        setImportDialogOpen(true);
        
        // Wait for user input - processing will continue in handleImportConfirm
        // Note: progressInterval will be cleared in handleImportConfirm or handleImportCancel
      } catch (error) {
        console.error('Error processing file:', error);
        clearInterval(progressInterval);
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'error' } : f)
        );
        alert(`Error processing file ${file.name}`);
      }
    }
  };

  // Handle import confirmation
  const handleImportConfirm = async (storyName: string, versionLabel: string) => {
    if (!pendingFile) return;

    const { file, fileId, progressInterval: oldInterval } = pendingFile;
    clearInterval(oldInterval); // Clear the old interval
    setPendingFile(null);

    // Update progress
    let progress = 90;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 2, 98);
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress } : f)
      );
    }, 100);

    try {
      // Check if it's a Word file
      if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
        // Parse Word file and detect chapters
        const newStory = await parseWordFile(file, storyName, versionLabel);
        
        if (newStory) {
          // Add to stories
          setStories(prev => {
            const updated = [...prev, newStory];
            saveStories(updated);
            return updated;
          });
          
          // Show success message
          alert(`Import successful!\nStory: ${newStory.title}\nChapters: ${newStory.chapters.length}`);
          
          // Switch to editor mode and select the new story
          setMode('editor');
          setSelectedStoryId(newStory.id);
          // Default to first chapter
          if (newStory.chapters.length > 0) {
            const firstChapter = newStory.chapters[0];
            setSelectedChapterId(firstChapter.id);
            setCurrentChapterTitle(firstChapter.title);
            const mainVersion = firstChapter.versions.find(v => v.isMain) || firstChapter.versions[0];
            const content = mainVersion ? mainVersion.content : '';
            if (mainVersion) {
              setSelectedVersionId(mainVersion.id);
            }
            // Convert plain text to HTML if needed
            let htmlContent = content || '<p><br></p>';
            if (content && !content.includes('<')) {
              htmlContent = content.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
            }
            setEditorContent(htmlContent);
            // Reset history
            setHistory([htmlContent]);
            setHistoryIndex(0);
            // Update editor HTML
            if (editorRef.current) {
              editorRef.current.innerHTML = htmlContent;
            }
          }
        }
      } else if (file.name.toLowerCase().endsWith('.txt')) {
        // Handle text files
        const text = await file.text();
        const newStory: Story = {
          id: Date.now().toString(),
          title: storyName,
          chapters: [{
            id: `${Date.now()}-1`,
            title: 'Chapter 1',
            order: 1,
            versions: [{
              id: `${Date.now()}-1-v1`,
              version: 1,
              label: versionLabel,
              content: text,
              createdAt: new Date().toISOString(),
              isMain: true
            }]
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setStories(prev => {
          const updated = [...prev, newStory];
          saveStories(updated);
          return updated;
        });
        
        alert(`Import successful!\nStory: ${newStory.title}`);
        setMode('editor');
        setSelectedStoryId(newStory.id);
        // Default to first chapter
        if (newStory.chapters.length > 0) {
          const firstChapter = newStory.chapters[0];
          setSelectedChapterId(firstChapter.id);
          setCurrentChapterTitle(firstChapter.title);
          const mainVersion = firstChapter.versions.find(v => v.isMain) || firstChapter.versions[0];
          const content = mainVersion ? mainVersion.content : '';
          if (mainVersion) {
            setSelectedVersionId(mainVersion.id);
          }
          // Convert plain text to HTML if needed
          let htmlContent = content || '<p><br></p>';
          // If content doesn't contain HTML tags, convert it
          if (content && !content.includes('<')) {
            htmlContent = content.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
          }
          setEditorContent(htmlContent);
          // Reset history
          setHistory([htmlContent]);
          setHistoryIndex(0);
          // Update editor HTML
          if (editorRef.current) {
            editorRef.current.innerHTML = htmlContent;
          }
        }
      }
      
      // Mark as success
      clearInterval(progressInterval);
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'success' } : f)
      );
    } catch (error) {
      console.error('Error processing file:', error);
      clearInterval(progressInterval);
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'error' } : f)
      );
      alert(`Error processing file ${file.name}`);
    }
  };

  const handleImportCancel = () => {
    if (pendingFile) {
      clearInterval(pendingFile.progressInterval); // Clear the interval
      setUploadingFiles(prev => 
        prev.map(f => f.id === pendingFile.fileId ? { ...f, progress: 100, status: 'error' } : f)
      );
      setPendingFile(null);
    }
    setImportDialogOpen(false);
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  // Option 1: Upload 1 full story file only (.docx/.doc)
  const handleFullStoryFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const wordFiles = files.filter(f => /\.(docx|doc)$/i.test(f.name));
    if (wordFiles.length > 0) handleFiles(wordFiles.slice(0, 1));
    e.target.value = '';
  };

  const handleFullStoryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => /\.(docx|doc)$/i.test(f.name));
    if (files.length > 0) handleFiles(files.slice(0, 1));
  };

  // Option 2: Upload Word file for selected chapter
  const handleChapterFileUpload = async (file: File) => {
    if (!selectedStoryIdForUpload || !selectedChapterIdForUpload) {
      alert('Please select a story and chapter before uploading.');
      return;
    }
    if (!/\.(docx|doc)$/i.test(file.name)) {
      alert('Only Word files (.docx, .doc) are supported.');
      return;
    }
    const fileId = Math.random().toString(36).substr(2, 9);
    setUploadingChapterFile({
      id: fileId,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading'
    });
    const progressInterval = setInterval(() => {
      setUploadingChapterFile(prev => prev ? { ...prev, progress: Math.min((prev.progress || 0) + 10, 90) } : null);
    }, 150);
    try {
      const content = await parseWordFileAsSingleChapter(file);
      clearInterval(progressInterval);
      setUploadingChapterFile(prev => prev ? { ...prev, progress: 100, status: 'success' } : null);
      const newStories = stories.map(story => {
        if (story.id !== selectedStoryIdForUpload) return story;
        return {
          ...story,
          chapters: story.chapters.map(chapter => {
            if (chapter.id !== selectedChapterIdForUpload) return chapter;
            const newVersion: Version = {
              id: `${Date.now()}-v`,
              version: chapter.versions.length + 1,
              label: 'Imported',
              content,
              createdAt: new Date().toISOString(),
              isMain: chapter.versions.length === 0
            };
            return {
              ...chapter,
              versions: [...chapter.versions, newVersion]
            };
          }),
          updatedAt: new Date().toISOString()
        };
      });
      saveStories(newStories);
      alert('Chapter content imported successfully.');
      setTimeout(() => setUploadingChapterFile(null), 2000);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadingChapterFile(prev => prev ? { ...prev, progress: 100, status: 'error' } : null);
      alert(`Error processing file ${file.name}`);
      setTimeout(() => setUploadingChapterFile(null), 2000);
    }
  };

  const handleChapterFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) handleChapterFileUpload(files[0]);
    e.target.value = '';
  };

  const handleChapterDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOption2(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleChapterFileUpload(files[0]);
  };

  // Delete story handler
  const handleDeleteStory = (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    if (window.confirm(`Are you sure you want to delete the story "${story.title}"?\n\nThis action cannot be undone.`)) {
      const newStories = stories.filter(s => s.id !== storyId);
      saveStories(newStories);
      
      if (selectedStoryId === storyId) {
        setSelectedStoryId(null);
        setSelectedChapterId(null);
        setSelectedVersionId(null);
        setEditorContent('');
        setCurrentChapterTitle('');
      }
    }
  };

  // Save to history for undo/redo
  const saveToHistory = (content: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      // Only add if content is different from last history entry
      if (newHistory[newHistory.length - 1] !== content) {
        newHistory.push(content);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      }
      return prev;
    });
  };

  // Convert HTML to plain text for character count
  const htmlToText = (html: string): string => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Undo handler
  const handleUndo = () => {
    if (historyIndex > 0 && editorRef.current) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditorContent(history[newIndex]);
      editorRef.current.innerHTML = history[newIndex];
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
    }
  };

  // Redo handler
  const handleRedo = () => {
    if (historyIndex < history.length - 1 && editorRef.current) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditorContent(history[newIndex]);
      editorRef.current.innerHTML = history[newIndex];
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
    }
  };

  // Editor toolbar handlers using execCommand for rich text
  const executeCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    // Focus editor first
    editorRef.current.focus();
    
    // Execute formatting command
    document.execCommand(command, false, value);
    
    // Update content from innerHTML
    const newContent = editorRef.current.innerHTML;
    setEditorContent(newContent);
    saveToHistory(newContent);
  };

  const handleBold = () => executeCommand('bold');
  const handleItalic = () => executeCommand('italic');
  const handleUnderline = () => executeCommand('underline');

  // Chapter/Version handlers
  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    const chapter = stories
      .flatMap(s => s.chapters)
      .find(c => c.id === chapterId);
    
    if (chapter) {
      const mainVersion = chapter.versions.find(v => v.isMain) || chapter.versions[0];
      const content = mainVersion ? mainVersion.content : '';
      setSelectedVersionId(mainVersion?.id || null);
      
      // Convert plain text to HTML if needed
      let htmlContent = content || '<p><br></p>';
      if (content && !content.includes('<')) {
        htmlContent = content.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
      }
      
      setEditorContent(htmlContent);
      // Reset history when switching chapters
      setHistory([htmlContent]);
      setHistoryIndex(0);
      setCurrentChapterTitle(chapter.title);
      
      // Update editor HTML
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
    }
  };

  // Update chapter title
  const handleUpdateChapterTitle = (newTitle: string) => {
    if (!selectedChapterId || !newTitle.trim()) return;

    const newStories = stories.map(story => ({
      ...story,
      chapters: story.chapters.map(chapter => {
        if (chapter.id === selectedChapterId) {
          return {
            ...chapter,
            title: newTitle.trim()
          };
        }
        return chapter;
      }),
      updatedAt: new Date().toISOString()
    }));

    saveStories(newStories);
    setCurrentChapterTitle(newTitle.trim());
  };

  const handleSelectStory = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  // Update story title handler
  const handleUpdateStoryTitle = (storyId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    const newStories = stories.map(story => {
      if (story.id === storyId) {
        return {
          ...story,
          title: newTitle.trim(),
          updatedAt: new Date().toISOString()
        };
      }
      return story;
    });

    saveStories(newStories);
  };

  const handleSaveChapter = () => {
    if (!selectedChapterId || !currentChapterTitle.trim()) {
      alert('Please select a chapter or enter chapter name');
      return;
    }

    if (!editorRef.current) return;

    // Get current content from editor
    const currentContent = editorRef.current.innerHTML.trim() || '';
    
    if (!currentContent || currentContent === '<p><br></p>' || currentContent === '<p></p>') {
      alert('Please enter some content');
      return;
    }

    // Check if content has changed compared to the current version
    const selectedVersion = selectedChapter?.versions.find(v => v.id === selectedVersionId) || 
                           selectedChapter?.versions.find(v => v.isMain) || 
                           selectedChapter?.versions[0];
    
    if (selectedVersion) {
      // Compare text content (ignore HTML formatting differences)
      const getTextContent = (html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return (div.textContent || div.innerText || '').trim();
      };
      
      const currentText = getTextContent(currentContent);
      const versionText = getTextContent(selectedVersion.content);
      
      // If text content hasn't changed, no need to save
      if (currentText === versionText && currentText !== '') {
        // No changes, just show message
        alert('No changes to save');
        return;
      }
    } else {
      // No version exists yet - create first version automatically without dialog
      if (!editorRef.current) return;
      
      const htmlContent = editorRef.current.innerHTML;
      const content = htmlContent.trim() || '';
      const textContent = htmlToText(content).trim();
      
      if (!textContent) {
        alert('Please enter some content');
        return;
      }
      
      // Auto-save as first version with "Draft" label
      handleSaveChapterWithVersion('Draft');
      return;
    }

    // Content has changed, show version name dialog
    setVersionNameDialogOpen(true);
  };

  const handleSaveChapterWithVersion = (versionName: string) => {
    if (!selectedChapterId || !editorRef.current) return;

    // Get HTML content from editor
    const htmlContent = editorRef.current.innerHTML;
    const content = htmlContent.trim() || '';

    const newStories = stories.map(story => ({
      ...story,
      chapters: story.chapters.map(chapter => {
        if (chapter.id === selectedChapterId) {
          const newVersion: Version = {
            id: Date.now().toString(),
            version: chapter.versions.length + 1,
            label: versionName,
            content: content,
            createdAt: new Date().toISOString(),
            isMain: chapter.versions.length === 0
          };
          return {
            ...chapter,
            versions: [...chapter.versions, newVersion]
          };
        }
        return chapter;
      }),
      updatedAt: new Date().toISOString()
    }));

    saveStories(newStories);
    setEditorContent(content);
    
    // Update selected version to the new one
    const updatedChapter = newStories
      .flatMap(s => s.chapters)
      .find(c => c.id === selectedChapterId);
    if (updatedChapter && updatedChapter.versions.length > 0) {
      const latestVersion = updatedChapter.versions[updatedChapter.versions.length - 1];
      setSelectedVersionId(latestVersion.id);
    }
    
    alert('Saved successfully!');
  };

  const handleCreateChapter = () => {
    if (!selectedStoryId) {
      alert('Please select a story first');
      return;
    }
    setCreateChapterDialogOpen(true);
  };

  const handleCreateChapterConfirm = (chapterTitle: string) => {
    if (!selectedStoryId) return;

    const newStories = stories.map(story => {
      if (story.id === selectedStoryId) {
        const newChapter: Chapter = {
          id: Date.now().toString(),
          title: chapterTitle,
          order: story.chapters.length + 1,
          versions: []
        };
        return {
          ...story,
          chapters: [...story.chapters, newChapter],
          updatedAt: new Date().toISOString()
        };
      }
      return story;
    });

    saveStories(newStories);
    
    // Select the new chapter
    const newStory = newStories.find(s => s.id === selectedStoryId);
    if (newStory && newStory.chapters.length > 0) {
      const newChapter = newStory.chapters[newStory.chapters.length - 1];
      setSelectedChapterId(newChapter.id);
      setCurrentChapterTitle(newChapter.title);
      setEditorContent('');
    }
  };

  // Create new story handler
  const handleCreateStory = () => {
    setCreateStoryDialogOpen(true);
  };

  const handleCreateStoryConfirm = (storyTitle: string) => {
    // Create new story with default Chapter 1
    const storyId = Date.now().toString();
    const chapterId = `${storyId}-1`;
    const newStory: Story = {
      id: storyId,
      title: storyTitle,
      chapters: [{
        id: chapterId,
        title: 'Chapter 1',
        order: 1,
        versions: []
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newStories = [...stories, newStory];
    saveStories(newStories);

    // Select the new story and default to Chapter 1
    setSelectedStoryId(newStory.id);
    setSelectedChapterId(chapterId);
    setCurrentChapterTitle('Chapter 1');
    const emptyContent = '<p><br></p>';
    setEditorContent(emptyContent);
    // Reset history
    setHistory([emptyContent]);
    setHistoryIndex(0);
    // Update editor HTML
    if (editorRef.current) {
      editorRef.current.innerHTML = emptyContent;
    }
    setMode('editor');
  };

  // Import file from sidebar
  const handleImportFromSidebar = () => {
    setMode('upload');
    // Trigger file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.docx,.doc';
    fileInput.multiple = false;
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFiles(Array.from(target.files));
      }
    };
    fileInput.click();
  };

  const handleVersionView = (versionId: string) => {
    const version = selectedChapter?.versions.find(v => v.id === versionId);
    if (version) {
      setSelectedVersionId(versionId);
      // Convert plain text to HTML if needed
      let htmlContent = version.content || '<p><br></p>';
      if (version.content && !version.content.includes('<')) {
        htmlContent = version.content.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
      }
      setEditorContent(htmlContent);
      // Reset history
      setHistory([htmlContent]);
      setHistoryIndex(0);
      // Update editor HTML
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
      setVersionManagerOpen(false);
    }
  };

  const handleVersionEdit = (versionId: string) => {
    handleVersionView(versionId);
    setMode('editor');
    setVersionManagerOpen(false);
  };

  const handleVersionCompare = (versionId1: string, versionId2: string) => {
    const v1 = selectedChapter?.versions.find(v => v.id === versionId1);
    const v2 = selectedChapter?.versions.find(v => v.id === versionId2);
    if (v1 && v2) {
      setCompareVersion1(v1);
      setCompareVersion2(v2);
      setCompareViewOpen(true);
      setVersionManagerOpen(false);
    }
  };

  const handleSetMain = (versionId: string) => {
    if (!selectedChapterId) return;

    const newStories = stories.map(story => ({
      ...story,
      chapters: story.chapters.map(chapter => {
        if (chapter.id === selectedChapterId) {
          return {
            ...chapter,
            versions: chapter.versions.map(v => ({
              ...v,
              isMain: v.id === versionId
            }))
          };
        }
        return chapter;
      })
    }));

    saveStories(newStories);
    setVersionManagerOpen(false);
  };

  return (
    <DefaultLayout title="Upload & Editor" role="author">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Mode Selection Tabs */}
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={mode === 'upload' ? 'default' : 'outline'}
                onClick={() => setMode('upload')}
                className="flex-1"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload / Import
              </Button>
              <Button
                variant={mode === 'editor' ? 'default' : 'outline'}
                onClick={() => setMode('editor')}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editor
              </Button>
            </div>
          </CardContent>
        </Card>

        {mode === 'upload' ? (
          <>
            {/* Import Story — 2 khung cho 2 option */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Import Story</CardTitle>
                <CardDescription>
                  Choose one of two options: upload full story (auto-detect chapters) or upload by chapter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option 1: Upload full story — 1 Word file, auto-detect chapters */}
                  <div className="border border-border rounded-xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <FilePlus className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Option 1: Upload full story</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload 1 Word file (.docx, .doc) containing the full story. The system will auto-detect and split into chapters.
                    </p>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFullStoryDrop}
                      className={`
                        relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 flex-1 flex flex-col justify-center
                        ${isDragging 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                        }
                      `}
                    >
                      <input
                        type="file"
                        accept=".docx,.doc"
                        onChange={handleFullStoryFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadIcon className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-medium text-foreground">Drop Word file here</p>
                      <p className="text-xs text-muted-foreground mt-1">or click to select file</p>
                    </div>
                    {uploadingFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadingFiles.map(file => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 text-sm"
                          >
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate flex-1">{file.name}</span>
                            <Progress value={file.progress} className="w-16 h-1.5" />
                            {file.status === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                            ) : (
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeUploadingFile(file.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Option 2: Upload by chapter — select story + chapter, upload 1 Word file for that chapter */}
                  <div className="border border-border rounded-xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <FolderOpen className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Option 2: Upload by chapter</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create story and chapters first (in Editor), then select story and chapter below and upload 1 Word file for that chapter.
                    </p>
                    <div className="space-y-3 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Story</Label>
                        <Select value={selectedStoryIdForUpload ?? ''} onValueChange={(v) => { setSelectedStoryIdForUpload(v || null); setSelectedChapterIdForUpload(null); }}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select story..." />
                          </SelectTrigger>
                          <SelectContent>
                            {stories.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Chapter</Label>
                        <Select 
                          value={selectedChapterIdForUpload ?? ''} 
                          onValueChange={(v) => setSelectedChapterIdForUpload(v || null)}
                          disabled={!selectedStoryIdForUpload}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select chapter..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(stories.find(s => s.id === selectedStoryIdForUpload)?.chapters ?? []).map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingOption2(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDraggingOption2(false); }}
                      onDrop={handleChapterDrop}
                      className={`
                        relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 flex-1 flex flex-col justify-center
                        ${!selectedChapterIdForUpload ? 'opacity-60 pointer-events-none' : ''}
                        ${isDraggingOption2 ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/30'}
                      `}
                    >
                      <input
                        type="file"
                        accept=".docx,.doc"
                        onChange={handleChapterFileInput}
                        disabled={!selectedChapterIdForUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <UploadIcon className={`w-10 h-10 mx-auto mb-2 ${isDraggingOption2 ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-medium text-foreground">
                        {selectedChapterIdForUpload ? 'Drop Word file here' : 'Select story and chapter first'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">1 Word file = 1 chapter content</p>
                    </div>
                    {uploadingChapterFile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 flex items-center gap-3 p-2 rounded-lg bg-secondary/30 text-sm"
                      >
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate flex-1">{uploadingChapterFile.name}</span>
                        <Progress value={uploadingChapterFile.progress} className="w-16 h-1.5" />
                        {uploadingChapterFile.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : uploadingChapterFile.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stories List */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Stories</CardTitle>
                <CardDescription>
                  Your stories list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stories.map((story) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedStoryId(story.id);
                        setMode('editor');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{story.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {story.chapters.length} chapter • Updated: {new Date(story.updatedAt).toLocaleDateString('en-US')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStoryId(story.id);
                              setMode('editor');
                            }}
                            title="View story"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => handleDeleteStory(story.id, e)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete story"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Editor Mode with Sidebar */}
            <div className="flex gap-4 h-[calc(100vh-300px)]">
              {/* Story Sidebar */}
              <StorySidebar
                stories={stories}
                selectedChapterId={selectedChapterId}
                onSelectChapter={handleSelectChapter}
                onSelectStory={handleSelectStory}
                onCreateStory={handleCreateStory}
                onImportFile={handleImportFromSidebar}
                onUpdateStoryTitle={handleUpdateStoryTitle}
              />

              {/* Editor Area */}
              <div className="flex-1 flex flex-col">
                <Card variant="elevated" className="flex-1 flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Story Editor</CardTitle>
                        <CardDescription>
                          {selectedChapter ? selectedChapter.title : 'Select a chapter to edit'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {selectedStoryId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreateChapter}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Chapter
                          </Button>
                        )}
                        {selectedChapterId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVersionManagerOpen(true)}
                          >
                            <GitCompare className="w-4 h-4 mr-2" />
                            Versions
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveChapter}
                          disabled={!selectedChapterId || !editorContent.trim()}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Chapter Title Editor */}
                    {selectedChapter && (
                      <div className="px-4 pt-4 pb-2 border-b border-border">
                        <Input
                          value={currentChapterTitle}
                          onChange={(e) => setCurrentChapterTitle(e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value.trim() !== selectedChapter.title) {
                              handleUpdateChapterTitle(e.target.value.trim());
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                            if (e.key === 'Escape') {
                              setCurrentChapterTitle(selectedChapter.title);
                              e.currentTarget.blur();
                            }
                          }}
                          placeholder="Chapter title..."
                          className="text-2xl font-bold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-2 h-auto font-serif"
                        />
                      </div>
                    )}

                    {/* Editor Toolbar */}
                    <EditorToolbar
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      onBold={handleBold}
                      onItalic={handleItalic}
                      onUnderline={handleUnderline}
                      canUndo={historyIndex > 0}
                      canRedo={historyIndex < history.length - 1}
                    />

                    {/* Rich Text Editor */}
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => {
                        if (!isUndoRedoRef.current) {
                          const newContent = e.currentTarget.innerHTML;
                          setEditorContent(newContent);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle Ctrl+S for save
                        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                          e.preventDefault();
                          handleSaveChapter();
                        }
                        // Handle Ctrl+Z for undo
                        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                          e.preventDefault();
                          handleUndo();
                        }
                        // Handle Ctrl+Shift+Z or Ctrl+Y for redo
                        if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
                            ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
                          e.preventDefault();
                          handleRedo();
                        }
                      }}
                      onPaste={(e) => {
                        // Handle paste to preserve formatting
                        e.preventDefault();
                        const text = e.clipboardData.getData('text/plain');
                        document.execCommand('insertText', false, text);
                      }}
                      className="flex-1 w-full px-4 py-3 border-0 rounded-b-lg bg-background text-foreground focus:outline-none resize-none text-sm min-h-[200px] overflow-y-auto"
                      style={{ 
                        minHeight: '200px',
                        outline: 'none'
                      }}
                      data-placeholder="Select a chapter from sidebar or start writing a new story..."
                    />
                    <style>{`
                      [contenteditable][data-placeholder]:empty:before {
                        content: attr(data-placeholder);
                        color: hsl(var(--muted-foreground));
                        pointer-events: none;
                      }
                      [contenteditable] h1 {
                        font-size: 1.5rem;
                        font-weight: bold;
                        margin: 1rem 0;
                      }
                      [contenteditable] h2 {
                        font-size: 1.25rem;
                        font-weight: bold;
                        margin: 0.75rem 0;
                      }
                      [contenteditable] p {
                        margin: 0.5rem 0;
                      }
                      [contenteditable] hr {
                        margin: 1rem 0;
                        border: none;
                        border-top: 1px solid hsl(var(--border));
                      }
                    `}</style>
                    <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground text-right">
                      {editorRef.current ? htmlToText(editorRef.current.innerHTML).length : htmlToText(editorContent).length} characters
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Version Manager Modal */}
        {selectedChapter && (
          <VersionManagerModal
            chapter={selectedChapter}
            isOpen={versionManagerOpen}
            onClose={() => setVersionManagerOpen(false)}
            onView={handleVersionView}
            onEdit={handleVersionEdit}
            onCompare={handleVersionCompare}
            onSetMain={handleSetMain}
          />
        )}

        {/* Import Dialog */}
        {pendingFile && (
          <ImportDialog
            fileName={pendingFile.file.name}
            defaultStoryName={pendingFile.file.name.replace(/\.(docx|doc|txt)$/i, '')}
            isOpen={importDialogOpen}
            onClose={handleImportCancel}
            onConfirm={handleImportConfirm}
          />
        )}

        {/* Compare Version View */}
        <CompareVersionView
          version1={compareVersion1}
          version2={compareVersion2}
          isOpen={compareViewOpen}
          onClose={() => setCompareViewOpen(false)}
          onSetMain={handleSetMain}
          onCreateNew={() => {
            alert('Feature to create new version from comparison will be implemented');
            setCompareViewOpen(false);
          }}
        />

        {/* Version Name Dialog */}
        <VersionNameDialog
          isOpen={versionNameDialogOpen}
          onClose={() => setVersionNameDialogOpen(false)}
          onConfirm={handleSaveChapterWithVersion}
        />

        {/* Create Chapter Dialog */}
        <CreateChapterDialog
          isOpen={createChapterDialogOpen}
          onClose={() => setCreateChapterDialogOpen(false)}
          onConfirm={handleCreateChapterConfirm}
        />

        {/* Create Story Dialog */}
        <CreateStoryDialog
          isOpen={createStoryDialogOpen}
          onClose={() => setCreateStoryDialogOpen(false)}
          onConfirm={handleCreateStoryConfirm}
        />
      </motion.div>
    </DefaultLayout>
  );
}

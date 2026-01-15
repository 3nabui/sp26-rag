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
  Plus
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
    title: 'Bóng Tối Dưới Ánh Trăng',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-25',
    chapters: [
      {
        id: '1-1',
        title: 'Chương 1 - Khởi đầu',
        order: 1,
        versions: [
          { id: 'v1-1-1', version: 1, label: 'Draft', content: 'Nội dung chương 1 version 1...', createdAt: '2024-12-15', isMain: false },
          { id: 'v1-1-2', version: 2, label: 'Revised', content: 'Nội dung chương 1 version 2...', createdAt: '2024-12-18', isMain: true },
        ]
      },
      {
        id: '1-2',
        title: 'Chương 2 - Biến cố',
        order: 2,
        versions: [
          { id: 'v1-2-1', version: 1, label: 'Draft', content: 'Nội dung chương 2 version 1...', createdAt: '2024-12-20', isMain: true },
        ]
      },
      {
        id: '1-3',
        title: 'Chương 3 - Phát triển',
        order: 3,
        versions: [
          { id: 'v1-3-1', version: 1, label: 'Draft', content: 'Nội dung chương 3 version 1...', createdAt: '2024-12-22', isMain: false },
          { id: 'v1-3-2', version: 2, label: 'Revised', content: 'Nội dung chương 3 version 2...', createdAt: '2024-12-23', isMain: false },
          { id: 'v1-3-3', version: 3, label: 'Final', content: 'Nội dung chương 3 version 3...', createdAt: '2024-12-25', isMain: true },
        ]
      },
    ]
  },
  {
    id: '2',
    title: 'Những Ngày Mưa Phương Nam',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-24',
    chapters: [
      {
        id: '2-1',
        title: 'Chương 1 - Mở đầu',
        order: 1,
        versions: [
          { id: 'v2-1-1', version: 1, label: 'Draft', content: 'Nội dung chương 1...', createdAt: '2024-12-20', isMain: true },
        ]
      },
    ]
  },
];

const STORAGE_KEY = 'storynest_stories';

function EditorToolbar({ 
  onBold, 
  onItalic, 
  onHeading1, 
  onHeading2, 
  onDivider 
}: {
  onBold: () => void;
  onItalic: () => void;
  onHeading1: () => void;
  onHeading2: () => void;
  onDivider: () => void;
}) {
  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/30 rounded-t-lg">
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
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onHeading1}
        className="h-8 px-2 text-xs"
        title="Chương (H1)"
      >
        <Heading1 className="w-4 h-4 mr-1" />
        Chương
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onHeading2}
        className="h-8 px-2 text-xs"
        title="Cảnh (H2)"
      >
        <Heading2 className="w-4 h-4 mr-1" />
        Cảnh
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onDivider}
        className="h-8 px-2 text-xs"
        title="Divider"
      >
        <Minus className="w-4 h-4 mr-1" />
        Divider
      </Button>
    </div>
  );
}

function StorySidebar({ 
  stories, 
  selectedChapterId, 
  onSelectChapter,
  onSelectStory 
}: {
  stories: Story[];
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onSelectStory: (storyId: string) => void;
}) {
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set(['1']));
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

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
    <div className="w-64 border-r border-border bg-secondary/20 h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">Truyện</h3>
      </div>
      <div className="p-2">
        {stories.map((story) => (
          <div key={story.id} className="mb-2">
            <div
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
              onClick={() => {
                toggleStory(story.id);
                onSelectStory(story.id);
              }}
            >
              {expandedStories.has(story.id) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground flex-1 truncate">
                {story.title}
              </span>
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
            Quản lý các phiên bản của chương này
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
                  {new Date(version.createdAt).toLocaleDateString('vi-VN')}
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
          <DialogTitle>Nhập thông tin truyện</DialogTitle>
          <DialogDescription>
            Đặt tên cho truyện và version cho file: {fileName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="story-name">Tên truyện</Label>
            <Input
              id="story-name"
              value={storyName}
              onChange={(e) => setStoryName(e.target.value)}
              placeholder="Nhập tên truyện"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="version-label">Tên version (áp dụng cho tất cả chương)</Label>
            <Input
              id="version-label"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="Ví dụ: Draft, First Draft, Imported..."
            />
            <p className="text-xs text-muted-foreground">
              Tên version này sẽ được áp dụng cho tất cả các chương trong truyện
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={!storyName.trim()}>
            Xác nhận
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
          <DialogTitle>So sánh Version</DialogTitle>
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
            Đóng
          </Button>
          <Button variant="outline" onClick={() => onSetMain(version2.id)}>
            <Star className="w-4 h-4 mr-2" />
            Chọn version này làm bản chính
          </Button>
          <Button onClick={onCreateNew}>
            <Copy className="w-4 h-4 mr-2" />
            Tạo version mới từ kết quả so sánh
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
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  // Modals
  const [versionManagerOpen, setVersionManagerOpen] = useState(false);
  const [compareViewOpen, setCompareViewOpen] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<Version | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<Version | null>(null);
  
  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; fileId: string; progressInterval: NodeJS.Timeout } | null>(null);

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
                chapterTitle = match[3]?.trim() || `Chương ${chapterNumber}`;
              } else if (match[1] && !isNaN(parseInt(match[1], 10))) {
                chapterNumber = parseInt(match[1], 10);
                chapterTitle = match[2]?.trim() || `Chương ${chapterNumber}`;
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
                chapterTitle = match[3]?.trim() || `Chương ${chapterNumber}`;
              } else if (match[1] && !isNaN(parseInt(match[1], 10))) {
                chapterNumber = parseInt(match[1], 10);
                chapterTitle = match[2]?.trim() || `Chương ${chapterNumber}`;
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
            title: chapterTitle || `Chương ${chapterNumber || chapterOrder + 1}`,
            content: []
          };
        } else {
          // Add to current chapter or create default chapter
          if (!currentChapter) {
            chapterOrder = 1;
            currentChapter = {
              title: 'Chương 1',
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
          title: 'Chương 1',
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
        alert(`Lỗi khi xử lý file ${file.name}`);
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
          alert(`Đã import thành công!\nTruyện: ${newStory.title}\nSố chương: ${newStory.chapters.length}`);
          
          // Switch to editor mode and select the new story
          setMode('editor');
          setSelectedStoryId(newStory.id);
          if (newStory.chapters.length > 0) {
            setSelectedChapterId(newStory.chapters[0].id);
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
            title: 'Chương 1',
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
        
        alert(`Đã import thành công!\nTruyện: ${newStory.title}`);
        setMode('editor');
        setSelectedStoryId(newStory.id);
        setSelectedChapterId(newStory.chapters[0].id);
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
      alert(`Lỗi khi xử lý file ${file.name}`);
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

  // Editor toolbar handlers
  const insertText = (text: string) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    const before = editorContent.substring(0, start);
    const after = editorContent.substring(end);
    
    setEditorContent(before + text + selectedText + after);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length + selectedText.length);
    }, 0);
  };

  const handleBold = () => insertText('**');
  const handleItalic = () => insertText('*');
  const handleHeading1 = () => insertText('# ');
  const handleHeading2 = () => insertText('## ');
  const handleDivider = () => insertText('\n---\n');

  // Chapter/Version handlers
  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    const chapter = stories
      .flatMap(s => s.chapters)
      .find(c => c.id === chapterId);
    
    if (chapter) {
      const mainVersion = chapter.versions.find(v => v.isMain) || chapter.versions[0];
      if (mainVersion) {
        setSelectedVersionId(mainVersion.id);
        setEditorContent(mainVersion.content);
        setCurrentChapterTitle(chapter.title);
      }
    }
  };

  const handleSelectStory = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  const handleSaveChapter = () => {
    if (!selectedChapterId || !currentChapterTitle.trim()) {
      alert('Vui lòng chọn chương hoặc nhập tên chương');
      return;
    }

    const newStories = stories.map(story => ({
      ...story,
      chapters: story.chapters.map(chapter => {
        if (chapter.id === selectedChapterId) {
          const newVersion: Version = {
            id: Date.now().toString(),
            version: chapter.versions.length + 1,
            label: 'Draft',
            content: editorContent,
            createdAt: new Date().toISOString(),
            isMain: chapter.versions.length === 0
          };
          return {
            ...chapter,
            versions: [...chapter.versions, newVersion]
          };
        }
        return chapter;
      })
    }));

    saveStories(newStories);
    alert('Đã lưu thành công!');
  };

  const handleVersionView = (versionId: string) => {
    const version = selectedChapter?.versions.find(v => v.id === versionId);
    if (version) {
      setSelectedVersionId(versionId);
      setEditorContent(version.content);
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
            {/* Upload Zone */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Import Story</CardTitle>
                <CardDescription>
                  Supported formats: TXT, DOCX, PDF (Max 50MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                    ${isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                    }
                  `}
                >
                  <input
                    type="file"
                    accept=".txt,.docx,.pdf"
                    multiple
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${isDragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-secondary text-muted-foreground'}
                    `}>
                      <UploadIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground mb-1">
                        Drag and drop files here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or <span className="text-primary font-medium">click to select files</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploading Files */}
                {uploadingFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Uploading</p>
                    {uploadingFiles.map(file => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={file.progress} className="flex-1 h-1" />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {Math.round(file.progress)}%
                            </span>
                          </div>
                        </div>
                        {file.status === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeUploadingFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stories List */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Stories</CardTitle>
                <CardDescription>
                  Danh sách truyện của bạn
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
                              {story.chapters.length} chương • Cập nhật: {new Date(story.updatedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
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
              />

              {/* Editor Area */}
              <div className="flex-1 flex flex-col">
                <Card variant="elevated" className="flex-1 flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Story Editor</CardTitle>
                        <CardDescription>
                          {selectedChapter ? selectedChapter.title : 'Chọn chương để chỉnh sửa'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
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
                    {/* Editor Toolbar */}
                    <EditorToolbar
                      onBold={handleBold}
                      onItalic={handleItalic}
                      onHeading1={handleHeading1}
                      onHeading2={handleHeading2}
                      onDivider={handleDivider}
                    />

                    {/* Text Editor */}
                    <textarea
                      ref={editorRef}
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      placeholder="Chọn chương từ sidebar hoặc bắt đầu viết truyện mới..."
                      className="flex-1 w-full px-4 py-3 border-0 rounded-b-lg bg-background text-foreground focus:outline-none resize-none font-mono text-sm"
                    />
                    <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground text-right">
                      {editorContent.length} ký tự
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
            alert('Tính năng tạo version mới từ so sánh sẽ được triển khai');
            setCompareViewOpen(false);
          }}
        />
      </motion.div>
    </DefaultLayout>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  ChevronLeft,
  ChevronRight,
  FileText,
  Trash2,
  BookOpen,
  Search,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Type,
  Send,
  MessageSquare,
  History,
  MoreHorizontal,
  Edit,
  Copy,
  GripVertical,
  Sparkles,
  GitBranch,
  Clock,
  Check,
  Save,
  Drama,
  Users,
  Globe
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatDateTime } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { chapterApi, projectApi, ChapterResponse, characterApi, CharacterResponse, worldSettingApi, WorldSettingResponse } from '@/lib/api';
import { createChapterVersion, deleteChapterVersion, getChapterVersions, updateChapterVersion } from '@/services/chapterVersionService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Story Bible Interfaces
interface Genre {
  id: string;
  name: string;
}

interface Character {
  id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  backstory: string;
  goals?: string;
  metadataJson?: string;
}

interface WorldSetting {
  id: string;
  settingName: string;
  category: 'geography' | 'culture' | 'magic' | 'technology' | 'politics' | 'other';
  description: string;
  rules: string;
}

interface CharacterRelationship {
  id: string;
  characterAId: string;
  characterBId: string;
  relationType: string;
  description: string;
}

interface ChapterVersion {
  id: string;
  name: string;
  content: string;
  wordCount: number;
  createdAt: string;
  isActive: boolean;
}

interface Chapter {
  id: string;
  title: string;
  chapterNo?: number;
  summary?: string;
  versions: ChapterVersion[];
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Mock data with versions
const mockChapters: Chapter[] = [
  {
    id: '1',
    title: 'Chapter 1',
    chapterNo: 1,
    summary: '',
    versions: [
      {
        id: 'v1-1',
        name: 'Version 1',
        content: `Sunlight streamed through the dusty windows, illuminating the eclectic decor of his cottage. Faded tapestries depicting heroic deeds hung crookedly on the walls, while tarnished trophies and exotic trinkets cluttered every available surface. It was the home of someone who had once been destined for greatness, now reduced to churning butter for tourists.

Cavendish let the handle rest, forearms burning pleasantly, and peered into the churn. The cream was thickening, but he'd need another ten minutes to get a respectable yield. He licked a blot of sour butter from his thumb, wrinkling his nose at the metallic tang that lingered—a reminder that he'd been out of salt since Tuesday.

The pantry, once brimming from his travels, now held nothing but a bottle of honey, two shriveled onions, and a sack of winter potatoes that had long since started to sprout. He'd meant to trade for supplies at the market in Eidsheim, but the urge to leave the cottage had proved less compelling than the urge to stay put and stew.

A knock echoed through the kitchen, sudden and unnatural. It was too early for the tourist buses, and anyway, they wouldn't bother with a cottage so far from the fjord's edge. Cavendish considered ignoring it, but the knock came again,`,
        wordCount: 502,
        createdAt: '2024-12-15 10:00',
        isActive: true,
      },
      {
        id: 'v1-2',
        name: 'Draft 2',
        content: 'Nội dung draft 2 của chapter 1...',
        wordCount: 150,
        createdAt: '2024-12-16 14:30',
        isActive: false,
      },
    ],
    createdAt: '2024-12-15',
    updatedAt: 'Vừa xong',
  },
  {
    id: '2',
    title: 'Chapter 2',
    chapterNo: 2,
    summary: '',
    versions: [
      {
        id: 'v2-1',
        name: 'Version 1',
        content: 'Nội dung chapter 2...',
        wordCount: 0,
        createdAt: '2024-12-16 09:00',
        isActive: true,
      },
    ],
    createdAt: '2024-12-16',
    updatedAt: '2 ngày trước',
  },
  {
    id: '3',
    title: 'Copy of Chapter 1',
    chapterNo: 3,
    summary: '',
    versions: [],
    createdAt: '2024-12-17',
    updatedAt: '3 ngày trước',
  },
  {
    id: '4',
    title: 'Untitled',
    chapterNo: 4,
    summary: '',
    versions: [],
    createdAt: '2024-12-18',
    updatedAt: '4 ngày trước',
  },
];

const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Xin chào! Tôi có thể giúp gì cho tác phẩm của bạn?',
    timestamp: '10:00',
  },
];

// Available Genres
const availableGenres: Genre[] = [
  { id: '1', name: 'Fantasy' },
  { id: '2', name: 'Science Fiction' },
  { id: '3', name: 'Romance' },
  { id: '4', name: 'Mystery' },
  { id: '5', name: 'Thriller' },
  { id: '6', name: 'Horror' },
  { id: '7', name: 'Historical Fiction' },
  { id: '8', name: 'Literary Fiction' },
  { id: '9', name: 'Adventure' },
  { id: '10', name: 'Comedy' },
];

// Mock Characters
const mockCharacters: Character[] = [
  {
    id: '1',
    name: 'Cavendish',
    role: 'Protagonist',
    appearance: 'A weathered man in his late forties with salt-and-pepper hair',
    personality: 'Cynical but kind-hearted, world-weary adventurer',
    backstory: 'Once a renowned hero, now living in quiet retirement',
  },
];

// Mock World Settings
const mockWorldSettings: WorldSetting[] = [
  {
    id: '1',
    settingName: 'The Fjordlands',
    category: 'geography',
    description: 'A rugged coastal region with deep fjords and misty mountains',
    rules: 'Magic is weaker near the sea, stronger in the mountains',
  },
];

// Sortable Chapter Item Component
function SortableChapterItem({ 
  chapter, 
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}: { 
  chapter: Chapter;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (chapter: Chapter) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(chapter.title);
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(chapter.title);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onEdit({ ...chapter, title: editTitle.trim() });
    } else {
      setEditTitle(chapter.title); // Reset if empty
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors mb-1",
        isSelected 
          ? "bg-primary/20 text-primary" 
          : "hover:bg-primary/10",
        isDragging && "shadow-lg"
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-primary/10 rounded p-1 -ml-1"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      <FileText className="w-4 h-4 shrink-0" />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-6 text-sm p-1"
          />
        ) : (
          <>
            <span 
              onDoubleClick={handleDoubleClick}
              className="truncate text-sm block cursor-text hover:underline"
            >
              {chapter.title}
            </span>
            {chapter.versions.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {chapter.versions.length} version{chapter.versions.length > 1 ? 's' : ''}
              </span>
            )}
          </>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleStartEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Đổi tên
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <Copy className="mr-2 h-4 w-4" />
            Nhân bản
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function ProjectEditor() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [projectTitle, setProjectTitle] = useState('');
  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ChapterVersion | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [chatInput, setChatInput] = useState('');
  const [isStoryBibleEnabled, setIsStoryBibleEnabled] = useState(false);
  const [showNewChapterDialog, setShowNewChapterDialog] = useState(false);
  const [showNewVersionDialog, setShowNewVersionDialog] = useState(false);
  const [showVersionsPanel, setShowVersionsPanel] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterSummary, setNewChapterSummary] = useState('');
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chaptersError, setChaptersError] = useState<string | null>(null);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [creatingVersion, setCreatingVersion] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [updatingChapter, setUpdatingChapter] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('chat');
  const [aiMode, setAiMode] = useState('standard');
  const { t } = useI18n();

  // Story Bible States
  const [showGenreDialog, setShowGenreDialog] = useState(false);
  const [showCharactersPanel, setShowCharactersPanel] = useState(false);
  const [showWorldbuildingPanel, setShowWorldbuildingPanel] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['1', '3']); // Fantasy, Romance
  const [characters, setCharacters] = useState<Character[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [worldSettings, setWorldSettings] = useState<WorldSetting[]>([]);
  const [worldSettingsLoading, setWorldSettingsLoading] = useState(false);
  const [showNewCharacterDialog, setShowNewCharacterDialog] = useState(false);
  const [showNewWorldSettingDialog, setShowNewWorldSettingDialog] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingWorldSetting, setEditingWorldSetting] = useState<WorldSetting | null>(null);
  const [newCharacter, setNewCharacter] = useState<Omit<Character, 'id'>>({
    name: '', role: '', appearance: '', personality: '', backstory: '', goals: '', metadataJson: ''
  });
  const [newWorldSetting, setNewWorldSetting] = useState<Omit<WorldSetting, 'id'>>({
    settingName: '', category: 'other', description: '', rules: ''
  });

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      UnderlineExtension,
      Placeholder.configure({
        placeholder: 'Bắt đầu viết tác phẩm của bạn...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[calc(100vh-200px)] font-serif',
      },
    },
    onUpdate: ({ editor }) => {
      // Update word count based on text content
    },
  });

  // Update editor content when version changes
  useEffect(() => {
    if (selectedVersion && editor) {
      editor.commands.setContent(selectedVersion.content);
    }
  }, [selectedVersion, editor]);

  // Fetch project detail to get title
  useEffect(() => {
    if (projectId) {
      const loadProject = async () => {
        try {
          const res = await projectApi.getProjectDetail(projectId);
          setProjectTitle(res.data?.title || 'Chưa có tên');
        } catch (err) {
          console.error('Error fetching project:', err);
          setProjectTitle('Chưa có tên');
        }
      };
      loadProject();
    }
  }, [projectId]);

  // Fetch chapters from API when projectId changes
  useEffect(() => {
    if (projectId) {
      const loadChapters = async () => {
        setChaptersLoading(true);
        setChaptersError(null);
        try {
          // Convert projectId to number for API
          const res = await chapterApi.getChaptersByProject(parseInt(projectId));
          if (res.data && Array.isArray(res.data)) {
            const apiChapters = res.data.map((ch: ChapterResponse) => ({
              id: String(ch.chapterId || ch.chapterID || ch.id || ''),
              title: ch.title || 'Untitled',
              chapterNo: ch.chapterNo || ch.chapterNumber,
              summary: ch.summary || '',
              versions: [],
              createdAt: ch.createdAt || new Date().toISOString().split('T')[0],
              updatedAt: ch.updatedAt || 'Vừa xong',
            }));
            setChapters(apiChapters);
          }
        } catch (err) {
          console.error('Error fetching chapters:', err);
          setChaptersError(err instanceof Error ? err.message : 'Failed to load chapters');
        } finally {
          setChaptersLoading(false);
        }
      };
      loadChapters();
    }
  }, [projectId]);

  // Fetch characters from API when projectId changes
  useEffect(() => {
    if (projectId) {
      const loadCharacters = async () => {
        setCharactersLoading(true);
        try {
          const res = await characterApi.getCharactersByProject(parseInt(projectId));
          if (res.data && Array.isArray(res.data)) {
            const apiCharacters: Character[] = res.data.map((char: CharacterResponse) => ({
              id: String(char.characterId),
              name: char.name || '',
              role: char.role || '',
              appearance: char.appearance || '',
              personality: char.personality || '',
              backstory: char.backstory || '',
              goals: char.goals || '',
              metadataJson: char.metadataJson || '',
            }));
            setCharacters(apiCharacters);
          }
        } catch (err) {
          console.error('Error fetching characters:', err);
          toast.error('Không thể tải danh sách nhân vật');
        } finally {
          setCharactersLoading(false);
        }
      };
      loadCharacters();
    }
  }, [projectId]);

  // Fetch world settings from API when projectId changes
  useEffect(() => {
    if (projectId) {
      const loadWorldSettings = async () => {
        setWorldSettingsLoading(true);
        try {
          const res = await worldSettingApi.getWorldSettingsByProject(parseInt(projectId));
          if (res.data && Array.isArray(res.data)) {
            const apiWorldSettings: WorldSetting[] = res.data.map((setting: WorldSettingResponse) => ({
              id: String(setting.settingId),
              settingName: setting.settingName || '',
              category: (setting.category as WorldSetting['category']) || 'other',
              description: setting.description || '',
              rules: setting.rules || '',
            }));
            setWorldSettings(apiWorldSettings);
          }
        } catch (err) {
          console.error('Error fetching world settings:', err);
          toast.error('Không thể tải danh sách world settings');
        } finally {
          setWorldSettingsLoading(false);
        }
      };
      loadWorldSettings();
    }
  }, [projectId]);

  // Calculate word count from editor
  const wordCount = editor?.storage.characterCount?.words?.() || 
    (editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering chapters
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle chapter selection - show versions panel, fetch versions from API
  const handleSelectChapter = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setShowVersionsPanel(true);
    setSelectedVersion(null);

    // Fetch versions from API
    const chapterId = Number(chapter.id);
    if (!isNaN(chapterId)) {
      try {
        const res = await getChapterVersions(chapterId);
        // API trả về versionId (số); dùng versionId cho DELETE /api/ChapterVersion/{id}
        const versions: ChapterVersion[] = (res.data || []).map((v, idx) => {
          const rawContent = v.rawContent ?? '';
          const versionId = v.versionId ?? v.chapterVersionId;
          return {
            id: String(versionId ?? `v-${chapterId}-${idx}`),
            name: `Version ${v.versionNumber ?? idx + 1}`,
            content: rawContent,
            wordCount: (v as { wordCount?: number }).wordCount ?? rawContent.trim().split(/\s+/).filter(Boolean).length,
            createdAt: v.uploadDate ?? v.createdAt ?? new Date().toLocaleString('vi-VN'),
            isActive: v.isActive ?? idx === 0,
          };
        });

        setChapters((prev) =>
          prev.map((ch) =>
            ch.id === chapter.id ? { ...ch, versions } : ch
          )
        );
        setSelectedChapter((prev) =>
          prev?.id === chapter.id ? { ...chapter, versions } : prev
        );
      } catch (err: unknown) {
        console.error('Error fetching chapter versions:', err);
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('403')) {
          toast.error('Bạn không có quyền truy cập. Vui lòng đăng nhập lại hoặc kiểm tra quyền tài khoản.');
        } else {
          toast.error(msg || 'Không thể tải danh sách version.');
        }
      }
    }
  };

  const handleSaveVersion = async () => {
    if (!selectedVersion || !editor) return;
    const rawContent = editor.getHTML();
    setSavingVersion(true);
    try {
      await updateChapterVersion(selectedVersion.id, rawContent);
      const updatedContent = rawContent;
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === selectedChapter?.id
            ? {
                ...ch,
                versions: ch.versions.map((v) =>
                  v.id === selectedVersion.id
                    ? {
                        ...v,
                        content: updatedContent,
                        wordCount: editor.getText().trim().split(/\s+/).filter(Boolean).length,
                      }
                    : v
                ),
              }
            : ch
        )
      );
      if (selectedChapter) {
        setSelectedChapter({
          ...selectedChapter,
          versions: selectedChapter.versions.map((v) =>
            v.id === selectedVersion.id
              ? {
                  ...v,
                  content: updatedContent,
                  wordCount: editor.getText().trim().split(/\s+/).filter(Boolean).length,
                }
              : v
          ),
        });
      }
      setSelectedVersion({
        ...selectedVersion,
        content: updatedContent,
        wordCount: editor.getText().trim().split(/\s+/).filter(Boolean).length,
      });
      toast.success('Đã lưu version');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể lưu version';
      toast.error(message);
    } finally {
      setSavingVersion(false);
    }
  };

  // Handle version selection - open editor directly
  const handleSelectVersion = (version: ChapterVersion) => {
    setSelectedVersion(version);
    if (editor) {
      editor.commands.setContent(version.content);
    }
    setShowVersionsPanel(false);
  };

  const handleCreateChapter = async () => {
    if (newChapterTitle.trim() && projectId) {
      setCreatingChapter(true);
      try {
        // FE tự tính chapterNo tăng dần dựa trên số lượng chapters hiện tại
        const chapterNo = chapters.length + 1;
        const payload = {
          projectId: parseInt(projectId),
          title: newChapterTitle.trim(),
          summary: '', // Empty string as requested
          chapterNo: chapterNo,
        };
        const res = await chapterApi.createChapter(payload);
        if (res.data) {
          const newChapter: Chapter = {
            id: String(res.data.chapterId || res.data.chapterID || res.data.id || ''),
            title: res.data.title || newChapterTitle,
            chapterNo: res.data.chapterNo || res.data.chapterNumber || chapterNo,
            summary: res.data.summary || '',
            versions: [],
            createdAt: res.data.createdAt || new Date().toISOString().split('T')[0],
            updatedAt: res.data.updatedAt || 'Vừa xong',
          };
          setChapters([...chapters, newChapter]);
          setSelectedChapter(newChapter);
          setShowVersionsPanel(true);
          setNewChapterTitle('');
          setNewChapterSummary('');
          setShowNewChapterDialog(false);
        }
      } catch (err) {
        console.error('Error creating chapter:', err);
        alert('Lỗi khi tạo chương: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setCreatingChapter(false);
      }
    }
  };

  const handleOpenEditChapter = async (chapter: Chapter) => {
    if (!chapter.title.trim()) {
      return;
    }
    
    // Optimistic update - update UI immediately
    const previousChapters = [...chapters];
    setChapters(chapters.map(ch => 
      ch.id === chapter.id ? chapter : ch
    ));
    
    setUpdatingChapter(true);
    try {
      // Gửi đầy đủ các field theo yêu cầu API
      const payload = { 
        title: chapter.title.trim(),
        summary: chapter.summary ?? '',
        chapterNo: chapter.chapterNo ?? 1,
      };
      
      console.log('Update chapter payload:', payload);
      console.log('Chapter ID:', chapter.id, '-> parseInt:', parseInt(chapter.id));
      
      // Convert chapter.id to number for API
      const res = await chapterApi.updateChapter(parseInt(chapter.id), payload);
      
      console.log('Update response:', res);
      
      if (res.data) {
        // Update with server response
        setChapters(prevChapters => prevChapters.map(ch => 
          ch.id === chapter.id 
            ? { 
                ...ch, 
                title: res.data.title || chapter.title,
                summary: res.data.summary ?? chapter.summary,
                chapterNo: res.data.chapterNo ?? res.data.chapterNumber ?? chapter.chapterNo,
              }
            : ch
        ));
      }
    } catch (err) {
      // Rollback on error
      setChapters(previousChapters);
      console.error('Error updating chapter title:', err);
      alert('Lỗi khi cập nhật tên chương: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUpdatingChapter(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!selectedChapter) return;
    const chapterId = Number(selectedChapter.id);
    if (isNaN(chapterId)) {
      toast.error('Chapter ID không hợp lệ');
      return;
    }

    // rawContent = nội dung truyện, mặc định "Text here" khi tạo version mới
    const rawContent = 'Text here';
    const versionNumber = selectedChapter.versions.length + 1;
    const versionName = `Version ${versionNumber}`;

    setCreatingVersion(true);
    try {
      const res = await createChapterVersion({ chapterId, rawContent });
      const data = res.data;

      const versionId = data?.versionId ?? data?.chapterVersionId;
      const newVersion: ChapterVersion = {
        id: String(versionId ?? `v-${Date.now()}`),
        name: versionName,
        content: rawContent,
        wordCount: 0,
        createdAt: data?.createdAt ?? new Date().toLocaleString('vi-VN'),
        isActive: selectedChapter.versions.length === 0,
      };

      setChapters(chapters.map(ch => {
        if (ch.id === selectedChapter.id) {
          return {
            ...ch,
            versions: [...ch.versions, newVersion],
            updatedAt: 'Vừa xong',
          };
        }
        return ch;
      }));

      setSelectedChapter({
        ...selectedChapter,
        versions: [...selectedChapter.versions, newVersion],
      });

      setShowNewVersionDialog(false);
      toast.success('Đã tạo version mới thành công');
      handleSelectVersion(newVersion);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tạo version mới';
      toast.error(message);
    } finally {
      setCreatingVersion(false);
    }
  };

  const handleSetActiveVersion = (versionId: string) => {
    if (!selectedChapter) return;

    const updatedVersions = selectedChapter.versions.map(v => ({
      ...v,
      isActive: v.id === versionId,
    }));

    setChapters(chapters.map(ch => {
      if (ch.id === selectedChapter.id) {
        return { ...ch, versions: updatedVersions };
      }
      return ch;
    }));

    setSelectedChapter({
      ...selectedChapter,
      versions: updatedVersions,
    });
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!selectedChapter) return;

    try {
      await deleteChapterVersion(versionId);
      const updatedVersions = selectedChapter.versions.filter(v => v.id !== versionId);

      setChapters(chapters.map(ch => {
        if (ch.id === selectedChapter.id) {
          return { ...ch, versions: updatedVersions };
        }
        return ch;
      }));

      setSelectedChapter({
        ...selectedChapter,
        versions: updatedVersions,
      });

      if (selectedVersion?.id === versionId) {
        setSelectedVersion(null);
      }
      toast.success('Đã xóa version');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xóa version';
      toast.error(message);
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: chatInput,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages([...chatMessages, userMessage]);
      setChatInput('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Đây là phản hồi mẫu từ AI. Tôi đang phân tích nội dung của bạn và sẽ đưa ra gợi ý phù hợp.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapters(chapters.filter(c => c.id !== chapterId));
    if (selectedChapter?.id === chapterId) {
      setSelectedChapter(null);
      setSelectedVersion(null);
      setShowVersionsPanel(false);
    }
  };

  const handleDuplicateChapter = (chapter: Chapter) => {
    const newChapter: Chapter = {
      ...chapter,
      id: Date.now().toString(),
      title: `Copy of ${chapter.title}`,
      chapterNo: (chapter.chapterNo || 0) + 1,
      versions: chapter.versions.map(v => ({
        ...v,
        id: `v-${Date.now()}-${Math.random()}`,
      })),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'Vừa xong',
    };
    setChapters([...chapters, newChapter]);
  };

  // Handlers for project title editing
  const handleEditProjectTitle = () => {
    setEditProjectTitle(projectTitle);
    setIsEditingProjectTitle(true);
  };

  const handleSaveProjectTitle = () => {
    if (editProjectTitle.trim()) {
      setProjectTitle(editProjectTitle.trim());
      // TODO: Call API to update project title
      // await projectApi.updateProject(projectId, { title: editProjectTitle.trim() });
    }
    setIsEditingProjectTitle(false);
  };

  const handleCancelEditProjectTitle = () => {
    setIsEditingProjectTitle(false);
    setEditProjectTitle('');
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-[#fde2d4] via-[#f8d5dd] to-[#d5d5f5]">
      {/* Left Sidebar - Chapters */}
      <motion.div 
        initial={{ width: 280 }}
        animate={{ width: sidebarCollapsed ? 0 : 280 }}
        className="bg-white/80 backdrop-blur-sm border-r border-border/50 flex flex-col overflow-hidden"
      >
        {/* Project Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/author/projects')}
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            {isEditingProjectTitle ? (
              <Input
                autoFocus
                value={editProjectTitle}
                onChange={(e) => setEditProjectTitle(e.target.value)}
                onBlur={handleSaveProjectTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveProjectTitle();
                  if (e.key === 'Escape') handleCancelEditProjectTitle();
                }}
                className="h-8 font-serif font-semibold text-lg flex-1"
              />
            ) : (
              <h1 
                className="font-serif font-semibold text-lg truncate flex-1 cursor-pointer hover:bg-primary/5 px-2 py-1 rounded"
                onClick={handleEditProjectTitle}
                title="Click để đổi tên"
              >
                {projectTitle || 'Đang tải...'}
              </h1>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarCollapsed(true)}
              className="ml-auto hover:bg-primary/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          
          {/* New & Import Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => setShowNewChapterDialog(true)}
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </div>
        </div>

        {/* Chapters List with Drag and Drop */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {chaptersLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : chaptersError ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-destructive text-sm">{chaptersError}</p>
              </div>
            ) : chapters.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-sm">Chưa có chương nào</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={chapters.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {chapters.map((chapter) => (
                    <SortableChapterItem
                      key={chapter.id}
                      chapter={chapter}
                      isSelected={selectedChapter?.id === chapter.id}
                      onSelect={() => handleSelectChapter(chapter)}
                      onEdit={(updatedChapter) => handleOpenEditChapter(updatedChapter)}
                      onDuplicate={() => handleDuplicateChapter(chapter)}
                      onDelete={() => handleDeleteChapter(chapter.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </ScrollArea>

        {/* Story Bible Toggle */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Story Bible</span>
            </div>
            <Switch 
              checked={isStoryBibleEnabled} 
              onCheckedChange={setIsStoryBibleEnabled}
            />
          </div>
          
          {/* Story Bible Menu Items */}
          <AnimatePresence>
            {isStoryBibleEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 px-3 hover:bg-primary/10"
                    onClick={() => setShowGenreDialog(true)}
                  >
                    <Drama className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{t('storyBible.genre')}</span>
                    {selectedGenres.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {selectedGenres.length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 px-3 hover:bg-primary/10"
                    onClick={() => {
                      setShowWorldbuildingPanel(false);
                      setShowCharactersPanel(!showCharactersPanel);
                    }}
                  >
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{t('storyBible.characters')}</span>
                    {characters.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {characters.length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 px-3 hover:bg-primary/10"
                    onClick={() => {
                      setShowCharactersPanel(false);
                      setShowWorldbuildingPanel(!showWorldbuildingPanel);
                    }}
                  >
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{t('storyBible.worldbuilding')}</span>
                    {worldSettings.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {worldSettings.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trash */}
        <div className="p-4 pt-0">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <Trash2 className="w-4 h-4" />
            {t('app.trash')}
          </Button>
        </div>
      </motion.div>

      {/* Collapsed Sidebar Toggle */}
      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-4 z-10"
          onClick={() => setSidebarCollapsed(false)}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      {/* Versions Panel */}
      <AnimatePresence>
        {showVersionsPanel && selectedChapter && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white/90 backdrop-blur-sm border-r border-border/50 flex flex-col overflow-hidden"
          >
            {/* Versions Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg">{selectedChapter.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowVersionsPanel(false)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Chọn version để chỉnh sửa hoặc tạo version mới
              </p>
              <Button 
                className="w-full gap-2"
                onClick={() => setShowNewVersionDialog(true)}
              >
                <Plus className="w-4 h-4" />
                Tạo Version Mới
              </Button>
            </div>

            {/* Versions List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {selectedChapter.versions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Chưa có version nào</p>
                    <p className="text-xs mt-1">Tạo version đầu tiên để bắt đầu viết</p>
                  </div>
                ) : (
                  selectedChapter.versions.map((version) => (
                    <div
                      key={version.id}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        version.isActive 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => handleSelectVersion(version)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-primary" />
                          <span className="font-medium">{version.name}</span>
                        </div>
                        {version.isActive && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(version.createdAt)}
                        </span>
                        <span>{version.wordCount} từ</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {!version.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetActiveVersion(version.id);
                            }}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVersion(version.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedVersion ? (
          <>
            {/* Editor Toolbar */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-border/50 p-2 flex items-center gap-1 editor-toolbar">
              <div className="flex items-center gap-2 mr-4">
                <Badge 
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setShowVersionsPanel(true)}
                >
                  <GitBranch className="w-3 h-3 mr-1" />
                  {selectedVersion.name}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
              >
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8", editor?.isActive('bold') && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8", editor?.isActive('italic') && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8", editor?.isActive('underline') && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8", editor?.isActive('strike') && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8", editor?.isActive('bulletList') && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8", editor?.isActive('orderedList') && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-8 px-2 text-xs", editor?.isActive('heading', { level: 1 }) && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                H1
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-8 px-2 text-xs", editor?.isActive('heading', { level: 2 }) && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                H2
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-8 px-2 text-xs", editor?.isActive('heading', { level: 3 }) && "bg-muted")}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                H3
              </Button>
              <div className="flex-1" />
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5 px-3"
                onClick={handleSaveVersion}
                disabled={savingVersion}
              >
                <Save className="w-4 h-4" />
                {savingVersion ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>

            {/* Editor Content - TipTap */}
            <div className="flex-1 overflow-auto bg-white/40">
              <div className="max-w-3xl mx-auto p-8">
                <EditorContent 
                  editor={editor} 
                  className="tiptap min-h-[calc(100vh-200px)]"
                />
              </div>
            </div>

            {/* Word Count */}
            <div className="bg-white/60 backdrop-blur-sm border-t border-border/50 px-4 py-2 text-sm text-muted-foreground text-center">
              {wordCount.toLocaleString()} từ
            </div>
          </>
        ) : (
          /* Empty State - No version selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Chọn một chapter</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Chọn chapter từ danh sách bên trái, sau đó chọn hoặc tạo version để bắt đầu viết
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Chat */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-l border-border/50 flex flex-col">
        {/* Tabs */}
        <div className="border-b border-border/50">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab}>
            <TabsList className="w-full justify-start rounded-none bg-transparent border-0 p-0">
              <TabsTrigger 
                value="history" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {rightPanelTab === 'chat' ? (
            <>
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Welcome Message */}
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 mx-auto text-primary/40 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask questions about your project, get writing suggestions, or paste long text for analysis.
                    </p>
                  </div>

                  {/* Messages */}
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "p-3 rounded-lg",
                        message.role === 'user' 
                          ? "bg-primary/10 ml-8" 
                          : "bg-muted mr-8"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {message.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 border-t border-border/50 space-y-3">
                <div className="relative">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about your project"
                    className="pr-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleSendMessage}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Select value={aiMode} onValueChange={setAiMode}>
                    <SelectTrigger className="w-28 h-8 text-xs bg-primary/10 border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="precise">Precise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Support & Upgrade */}
              <div className="p-4 pt-0 flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Support
                </Button>
                <Button className="flex-1 gap-2 bg-gradient-to-r from-primary to-purple-500">
                  <Sparkles className="w-4 h-4" />
                  Upgrade
                </Button>
              </div>
            </>
          ) : (
            /* History Tab */
            <ScrollArea className="flex-1 p-4">
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Lịch sử chỉnh sửa sẽ hiển thị ở đây</p>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* New Chapter Dialog */}
      <Dialog open={showNewChapterDialog} onOpenChange={setShowNewChapterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Chapter Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho chapter mới
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="chapter-title">Tên chapter</Label>
              <Input
                id="chapter-title"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Ví dụ: Chapter 1"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="chapter-summary">Tóm tắt (tùy chọn)</Label>
              <Textarea
                id="chapter-summary"
                value={newChapterSummary}
                onChange={(e) => setNewChapterSummary(e.target.value)}
                placeholder="Tóm tắt nội dung chapter..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChapterDialog(false)} disabled={creatingChapter}>
              Hủy
            </Button>
            <Button onClick={handleCreateChapter} disabled={creatingChapter || !newChapterTitle.trim()}>
              {creatingChapter ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Version Dialog */}
      <Dialog open={showNewVersionDialog} onOpenChange={setShowNewVersionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Version Mới</DialogTitle>
            <DialogDescription>
              Tạo version mới cho chapter &quot;{selectedChapter?.title}&quot;. Version sẽ có tên mặc định (Version 1, Version 2, ...).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVersionDialog(false)} disabled={creatingVersion}>
              Hủy
            </Button>
            <Button onClick={handleCreateVersion} disabled={creatingVersion}>
              {creatingVersion ? 'Đang tạo...' : 'Tạo Version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Genre Selection Dialog */}
      <Dialog open={showGenreDialog} onOpenChange={setShowGenreDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Drama className="w-5 h-5 text-primary" />
              Chọn Genre
            </DialogTitle>
            <DialogDescription>
              Chọn các thể loại phù hợp với tác phẩm của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-2">
              {availableGenres.map((genre) => (
                <Button
                  key={genre.id}
                  variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                  className="justify-start h-10"
                  onClick={() => {
                    if (selectedGenres.includes(genre.id)) {
                      setSelectedGenres(selectedGenres.filter(id => id !== genre.id));
                    } else {
                      setSelectedGenres([...selectedGenres, genre.id]);
                    }
                  }}
                >
                  {selectedGenres.includes(genre.id) && <Check className="w-4 h-4 mr-2" />}
                  {genre.name}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowGenreDialog(false)}>Xong</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Characters Panel */}
      <AnimatePresence>
        {showCharactersPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[480px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Characters</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowCharactersPanel(false)}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4">
              <Button 
                className="w-full gap-2"
                onClick={() => {
                  setNewCharacter({ name: '', role: '', appearance: '', personality: '', backstory: '', goals: '', metadataJson: '' });
                  setEditingCharacter(null);
                  setShowNewCharacterDialog(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Thêm Character
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 pt-0 space-y-3">
                {charactersLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Đang tải...</p>
                  </div>
                ) : characters.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Chưa có character nào</p>
                  </div>
                ) : (
                  characters.map((char) => (
                    <div
                      key={char.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setEditingCharacter(char);
                        setNewCharacter(char);
                        setShowNewCharacterDialog(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{char.name}</h3>
                          <Badge variant="secondary" className="mt-1 text-xs">{char.role}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Bạn có chắc muốn xóa nhân vật này?')) {
                              try {
                                await characterApi.deleteCharacter(char.id);
                                setCharacters(characters.filter(c => c.id !== char.id));
                                toast.success('Đã xóa nhân vật thành công');
                              } catch (err) {
                                console.error('Error deleting character:', err);
                                toast.error(err instanceof Error ? err.message : 'Không thể xóa nhân vật');
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {char.appearance && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{char.appearance}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Worldbuilding Panel */}
      <AnimatePresence>
        {showWorldbuildingPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[480px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Worldbuilding</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowWorldbuildingPanel(false)}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4">
              <Button 
                className="w-full gap-2"
                onClick={() => {
                  setNewWorldSetting({ settingName: '', category: 'other', description: '', rules: '' });
                  setEditingWorldSetting(null);
                  setShowNewWorldSettingDialog(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Thêm World Setting
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 pt-0 space-y-3">
                {worldSettingsLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Đang tải...</p>
                  </div>
                ) : worldSettings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Chưa có world setting nào</p>
                  </div>
                ) : (
                  worldSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setEditingWorldSetting(setting);
                        setNewWorldSetting(setting);
                        setShowNewWorldSettingDialog(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{setting.settingName}</h3>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">{setting.category}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Bạn có chắc muốn xóa world setting này?')) {
                              try {
                                await worldSettingApi.deleteWorldSetting(setting.id);
                                setWorldSettings(worldSettings.filter(s => s.id !== setting.id));
                                toast.success('Đã xóa world setting thành công');
                              } catch (err) {
                                console.error('Error deleting world setting:', err);
                                toast.error(err instanceof Error ? err.message : 'Không thể xóa world setting');
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {setting.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{setting.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New/Edit Character Dialog */}
      <Dialog open={showNewCharacterDialog} onOpenChange={setShowNewCharacterDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {editingCharacter ? 'Chỉnh sửa Character' : 'Thêm Character Mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto flex flex-col items-center">
            <div className="w-full max-w-md">
              <Label>Tên</Label>
              <Input
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                placeholder="Tên nhân vật"
                className="mt-1 w-full"
              />
            </div>
            <div className="w-full max-w-md">
              <Label>Vai trò</Label>
              <Input
                value={newCharacter.role}
                onChange={(e) => setNewCharacter({ ...newCharacter, role: e.target.value })}
                placeholder="Protagonist, Antagonist, Supporting..."
                className="mt-1 w-full"
              />
            </div>
            <div className="w-full max-w-md">
              <Label>Ngoại hình</Label>
              <Textarea
                value={newCharacter.appearance}
                onChange={(e) => setNewCharacter({ ...newCharacter, appearance: e.target.value })}
                placeholder="Mô tả ngoại hình của nhân vật..."
                className="mt-1 w-full"
                rows={1}
              />
            </div>
            <div className="w-full max-w-md">
              <Label>Tính cách</Label>
              <Textarea
                value={newCharacter.personality}
                onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                placeholder="Mô tả tính cách của nhân vật..."
                className="mt-1 w-full"
                rows={1}
              />
            </div>
            <div className="w-full max-w-md">
              <Label>Backstory</Label>
              <Textarea
                value={newCharacter.backstory}
                onChange={(e) => setNewCharacter({ ...newCharacter, backstory: e.target.value })}
                placeholder="Câu chuyện quá khứ của nhân vật..."
                className="mt-1 w-full"
                rows={2}
              />
            </div>
            <div className="w-full max-w-md">
              <Label>Mục tiêu</Label>
              <Textarea
                value={newCharacter.goals || ''}
                onChange={(e) => setNewCharacter({ ...newCharacter, goals: e.target.value })}
                placeholder="Mục tiêu của nhân vật..."
                className="mt-1 w-full"
                rows={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCharacterDialog(false)}>
              Hủy
            </Button>
            <Button onClick={async () => {
              if (!newCharacter.name.trim()) {
                toast.error('Vui lòng nhập tên nhân vật');
                return;
              }
              if (!projectId) {
                toast.error('Không tìm thấy project ID');
                return;
              }

              try {
                if (editingCharacter) {
                  // Update character
                  const res = await characterApi.updateCharacter(editingCharacter.id, {
                    name: newCharacter.name,
                    role: newCharacter.role || undefined,
                    appearance: newCharacter.appearance || undefined,
                    personality: newCharacter.personality || undefined,
                    backstory: newCharacter.backstory || undefined,
                    goals: newCharacter.goals || undefined,
                    metadataJson: newCharacter.metadataJson || undefined,
                  });
                  const updatedChar: Character = {
                    id: String(res.data.characterId),
                    name: res.data.name,
                    role: res.data.role || '',
                    appearance: res.data.appearance || '',
                    personality: res.data.personality || '',
                    backstory: res.data.backstory || '',
                    goals: res.data.goals || '',
                    metadataJson: res.data.metadataJson || '',
                  };
                  setCharacters(characters.map(c => 
                    c.id === editingCharacter.id ? updatedChar : c
                  ));
                  toast.success('Đã cập nhật nhân vật thành công');
                } else {
                  // Create character
                  const res = await characterApi.createCharacter({
                    projectId: parseInt(projectId),
                    name: newCharacter.name,
                    role: newCharacter.role || undefined,
                    appearance: newCharacter.appearance || undefined,
                    personality: newCharacter.personality || undefined,
                    backstory: newCharacter.backstory || undefined,
                    goals: newCharacter.goals || undefined,
                    metadataJson: newCharacter.metadataJson || undefined,
                  });
                  const newChar: Character = {
                    id: String(res.data.characterId),
                    name: res.data.name,
                    role: res.data.role || '',
                    appearance: res.data.appearance || '',
                    personality: res.data.personality || '',
                    backstory: res.data.backstory || '',
                    goals: res.data.goals || '',
                    metadataJson: res.data.metadataJson || '',
                  };
                  setCharacters([...characters, newChar]);
                  toast.success('Đã thêm nhân vật thành công');
                }
                setShowNewCharacterDialog(false);
              } catch (err) {
                console.error('Error saving character:', err);
                toast.error(err instanceof Error ? err.message : 'Không thể lưu nhân vật');
              }
            }}>
              {editingCharacter ? 'Lưu' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New/Edit World Setting Dialog */}
      <Dialog open={showNewWorldSettingDialog} onOpenChange={setShowNewWorldSettingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {editingWorldSetting ? 'Chỉnh sửa World Setting' : 'Thêm World Setting Mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto flex flex-col items-center">
            <div className="w-full max-w-md">
              <Label>Tên</Label>
              <Input
                value={newWorldSetting.settingName}
                onChange={(e) => setNewWorldSetting({ ...newWorldSetting, settingName: e.target.value })}
                placeholder="Ví dụ: The Fjordlands, Magic System..."
                className="mt-1 w-full"
              />
            </div>
            <div className="w-full max-w-md">
              <Label>Category</Label>
              <Select
                value={newWorldSetting.category}
                onValueChange={(value: WorldSetting['category']) => 
                  setNewWorldSetting({ ...newWorldSetting, category: value })
                }
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geography">Geography</SelectItem>
                  <SelectItem value="culture">Culture</SelectItem>
                  <SelectItem value="magic">Magic</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="politics">Politics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full max-w-md">
              <Label>Mô tả</Label>
              <Textarea
                value={newWorldSetting.description}
                onChange={(e) => setNewWorldSetting({ ...newWorldSetting, description: e.target.value })}
                placeholder="Mô tả chi tiết về setting này..."
                className="mt-1 w-full"
                rows={2}
              />
            </div>
            <div className="w-full max-w-md">
              <Label>Quy tắc / Rules</Label>
              <Textarea
                value={newWorldSetting.rules}
                onChange={(e) => setNewWorldSetting({ ...newWorldSetting, rules: e.target.value })}
                placeholder="Các quy tắc đặc biệt áp dụng cho setting này..."
                className="mt-1 w-full"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWorldSettingDialog(false)}>
              Hủy
            </Button>
            <Button onClick={async () => {
              if (!newWorldSetting.settingName.trim()) {
                toast.error('Vui lòng nhập tên world setting');
                return;
              }
              if (!projectId) {
                toast.error('Không tìm thấy project ID');
                return;
              }

              try {
                if (editingWorldSetting) {
                  // Update world setting
                  const res = await worldSettingApi.updateWorldSetting(editingWorldSetting.id, {
                    settingName: newWorldSetting.settingName,
                    category: newWorldSetting.category || undefined,
                    description: newWorldSetting.description || undefined,
                    rules: newWorldSetting.rules || undefined,
                  });
                  const updatedSetting: WorldSetting = {
                    id: String(res.data.settingId),
                    settingName: res.data.settingName || '',
                    category: (res.data.category as WorldSetting['category']) || 'other',
                    description: res.data.description || '',
                    rules: res.data.rules || '',
                  };
                  setWorldSettings(worldSettings.map(s => 
                    s.id === editingWorldSetting.id ? updatedSetting : s
                  ));
                  toast.success('Đã cập nhật world setting thành công');
                } else {
                  // Create world setting
                  const res = await worldSettingApi.createWorldSetting({
                    projectId: parseInt(projectId),
                    settingName: newWorldSetting.settingName,
                    category: newWorldSetting.category || undefined,
                    description: newWorldSetting.description || undefined,
                    rules: newWorldSetting.rules || undefined,
                  });
                  const newSetting: WorldSetting = {
                    id: String(res.data.settingId),
                    settingName: res.data.settingName || '',
                    category: (res.data.category as WorldSetting['category']) || 'other',
                    description: res.data.description || '',
                    rules: res.data.rules || '',
                  };
                  setWorldSettings([...worldSettings, newSetting]);
                  toast.success('Đã thêm world setting thành công');
                }
                setShowNewWorldSettingDialog(false);
              } catch (err) {
                console.error('Error saving world setting:', err);
                toast.error(err instanceof Error ? err.message : 'Không thể lưu world setting');
              }
            }}>
              {editingWorldSetting ? 'Lưu' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

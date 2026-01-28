import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Paperclip, 
  Mic,
  MoreHorizontal,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BookOpen,
  AlertCircle,
  Zap,
  Heart,
  GitBranch,
  ChevronsUpDown,
  Check,
  Folder,
  FileText as FileIcon,
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockManuscripts, mockChapterContents, type ChatMessage, type Manuscript, type ChapterContent } from '@/utils/mockData';

// Story structure from Upload page
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

const STORAGE_KEY = 'storynest_stories';

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        ${isUser ? 'bg-primary text-primary-foreground' : 'bg-accent/20 text-accent'}
      `}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`
          inline-block p-4 rounded-2xl text-sm
          ${isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-md' 
            : 'bg-secondary/50 text-foreground rounded-tl-md'
          }
        `}>
          <p className="whitespace-pre-wrap text-left">{message.content}</p>
        </div>
        <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {!isUser && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
        <Bot className="w-5 h-5 text-accent" />
      </div>
      <div className="bg-secondary/50 rounded-2xl rounded-tl-md p-4 flex items-center gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </motion.div>
  );
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('all'); // 'all' or specific version id
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [chapterVersionPickerOpen, setChapterVersionPickerOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load stories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedStories = JSON.parse(saved);
        setStories(savedStories);
        if (savedStories.length > 0) {
          setSelectedStoryId(savedStories[0].id);
          // Default behavior: if author doesn't choose chapter/version => analyze whole story
          setSelectedChapterId('');
          setSelectedVersionId('all');
        }
      } catch (error) {
        console.error('Error loading stories:', error);
      }
    }
  }, []);

  const selectedStory = useMemo(
    () => stories.find(s => s.id === selectedStoryId),
    [stories, selectedStoryId]
  );

  const selectedChapterData = useMemo(
    () => selectedStory?.chapters.find(c => c.id === selectedChapterId),
    [selectedStory, selectedChapterId]
  );

  const mockVersions = useMemo(
    () => [
      { id: 'v1', version: 1, label: 'Draft' },
      { id: 'v2', version: 2, label: 'Revised' },
      { id: 'v3', version: 3, label: 'Final' },
    ],
    [],
  );

  const chapterVersionPickerLabel = useMemo(() => {
    if (selectedStory && selectedChapterData) {
      const chapterLabel = selectedChapterData.title;
      if (selectedVersionId === 'all') return `${chapterLabel} • All versions`;
      const v = selectedChapterData.versions.find(ver => ver.id === selectedVersionId);
      return v ? `${chapterLabel} • v${v.version} (${v.label})` : chapterLabel;
    }

    if (selectedChapter) {
      const chapterLabel = `Chapter ${selectedChapter}`;
      if (selectedVersionId === 'all') return `${chapterLabel} • All versions`;
      const mv = mockVersions.find(ver => ver.id === selectedVersionId);
      return mv ? `${chapterLabel} • v${mv.version} (${mv.label})` : chapterLabel;
    }

    return 'Select chapter & version';
  }, [selectedStory, selectedChapterData, selectedVersionId, selectedChapter, mockVersions]);
  const selectedManuscript = mockManuscripts.find(m => m.id.toString() === selectedManuscriptId);
  const selectedChapterContent = selectedManuscriptId && selectedChapter
    ? mockChapterContents.find(
        c => c.manuscriptId.toString() === selectedManuscriptId && 
        c.chapter.toString() === selectedChapter
      )
    : null;
  
  // Use uploaded story content if available, otherwise use mock
  const displayContent = useMemo(() => {
    if (selectedChapterData && selectedVersionId !== 'all') {
      const version = selectedChapterData.versions.find(v => v.id === selectedVersionId);
      return version ? version.content : null;
    } else if (selectedChapterData && selectedVersionId === 'all') {
      // Combine all versions content
      return selectedChapterData.versions.map(v => `--- Version ${v.version} (${v.label}) ---\n\n${v.content}`).join('\n\n');
    }
    return selectedChapterContent?.content || null;
  }, [selectedChapterData, selectedVersionId, selectedChapterContent]);

  // Ready when a story is selected. If no chapter/version chosen => analyze whole story.
  const isWholeStory = (selectedStoryId && !selectedChapterId) || (selectedManuscriptId && !selectedChapter);
  const isReadyToChat = Boolean(selectedStoryId || selectedManuscriptId);

  // Generate chapter options based on selected manuscript (for mock data fallback)
  const chapterOptions = selectedManuscript 
    ? Array.from({ length: selectedManuscript.chapters || 0 }, (_, i) => i + 1)
    : [];

  // Suggested questions depend on scope:
  // - If no chapter selected => whole story
  // - If chapter selected => chapter/version
  const suggestedQuestions = useMemo(() => {
    if (isWholeStory) {
      return [
        'Analyze the overall story structure and pacing',
        'Which characters appear most throughout the story?',
        'What are the main themes of the story?',
        'Suggest improvements for character development across all chapters',
      ];
    }

    const chapterTitle = selectedChapterData?.title || (selectedChapter ? `chapter ${selectedChapter}` : '');
    if (!chapterTitle) return [];

    const versionSuffix = selectedVersionId === 'all'
      ? ' (all versions)'
      : selectedChapterData && selectedVersionId !== 'all'
        ? ` (v${selectedChapterData.versions.find(v => v.id === selectedVersionId)?.version})`
        : '';

    return [
      `Analyze pacing of ${chapterTitle}${versionSuffix}`,
      `Which character appears most in ${chapterTitle}?`,
      `Suggest improvements for the ending of ${chapterTitle}${versionSuffix}`,
      `What is the dominant emotion of ${chapterTitle}?`,
    ];
  }, [isWholeStory, selectedChapter, selectedChapterData, selectedVersionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Reset messages when manuscript/story/chapter selection changes
  useEffect(() => {
    if (isReadyToChat && messages.length === 0) {
      const storyTitle = selectedStory?.title || selectedManuscript?.title || 'Story';
      const chapterTitle = selectedChapterData?.title || `Chapter ${selectedChapter}`;
      const versionInfo = selectedVersionId === 'all' && selectedChapterData
        ? `all ${selectedChapterData.versions.length} versions`
        : selectedChapterData && selectedVersionId !== 'all'
        ? `version ${selectedChapterData.versions.find(v => v.id === selectedVersionId)?.version}`
        : '';
      
      // Add welcome message when selection is made
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: (() => {
          if (isWholeStory) {
            return (
              `Hello! I'm ready to analyze **${storyTitle} (Whole Story)**.\n\n` +
              `You can ask me about:\n` +
              `• Overall story structure and pacing\n` +
              `• Themes and emotions across chapters\n` +
              `• Character arcs and consistency\n` +
              `• Improvement suggestions\n\n` +
              `Ask a question to get started!`
            );
          }

          const versionSuffix = versionInfo ? ` (${versionInfo})` : '';
          const versionsNote =
            selectedVersionId === 'all'
              ? '\nAnalyzing all versions will provide comparative insights across different drafts.'
              : '';

          return (
            `Hello! I'm ready to analyze **${storyTitle} - ${chapterTitle}**${versionSuffix}.\n\n` +
            `You can ask me about:\n` +
            `• Pacing and chapter structure\n` +
            `• Emotions and atmosphere\n` +
            `• Characters and relationships\n` +
            `• Improvement suggestions` +
            versionsNote +
            `\n\nAsk a question to get started!`
          );
        })(),
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isReadyToChat, isWholeStory, selectedStoryId, selectedChapterId, selectedVersionId, selectedManuscriptId, selectedChapter, selectedStory, selectedChapterData, selectedManuscript, messages.length]);

  const handleSend = () => {
    if (!inputValue.trim() || !isReadyToChat) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response with specific context
    setTimeout(() => {
      const storyTitle = selectedStory?.title || selectedManuscript?.title || 'Story';
      const chapterTitle = selectedChapterData?.title || `Chapter ${selectedChapter}`;
      const versionInfo = selectedVersionId === 'all' && selectedChapterData
        ? ` (analyzing all ${selectedChapterData.versions.length} versions)`
        : selectedChapterData && selectedVersionId !== 'all'
        ? ` (v${selectedChapterData.versions.find(v => v.id === selectedVersionId)?.version})`
        : '';
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on analysis of **${storyTitle} - ${chapterTitle}${versionInfo}**, I can share:\n\n• **Pacing**: ${chapterTitle} has ${selectedChapter === '4' || selectedChapter === '8' ? 'fast' : 'moderate'} pacing, fitting the story progression\n• **Emotion**: The dominant emotion is ${selectedChapter === '4' ? 'tension and suspense' : 'focus and determination'}\n• **Characters**: Main characters appear consistently, with clear character development\n${selectedVersionId === 'all' ? '• **Version Comparison**: Analyzing all versions will help identify improvements across drafts\n' : ''}• **Suggestion**: ${selectedChapter === '4' ? 'Could add descriptive details to slow pacing slightly' : 'Chapter structure is good, maintain current pacing'}\n\nWhich aspect would you like me to analyze in more detail?`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!isReadyToChat) return;
    setInputValue(question);
  };

  return (
    <DefaultLayout title="AI" role="author">
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Left Sidebar - Selection */}
        <div className="w-80 space-y-4">
          {/* Selection Header */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-base">Select Story & Chapter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Story Selector (from uploaded stories) */}
              {stories.length > 0 && (
                <div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Story (Uploaded)</label>
                    <Select
                      value={selectedStoryId}
                      onValueChange={(value) => {
                        setSelectedStoryId(value);
                        setSelectedManuscriptId(''); // Clear mock selection
                        // Default: whole story until author chooses a chapter/version
                        setSelectedChapterId('');
                        setSelectedChapter(''); // Clear mock chapter
                        setSelectedVersionId('all');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select story" />
                      </SelectTrigger>
                      <SelectContent>
                        {stories.map((story) => (
                          <SelectItem key={story.id} value={story.id}>
                            {story.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chapter + Version as folder tree */}
                  {selectedStory && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Chapter & Version</label>
                      <Popover open={chapterVersionPickerOpen} onOpenChange={setChapterVersionPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={chapterVersionPickerOpen}
                            className="w-full justify-between"
                          >
                            <span className="truncate">{chapterVersionPickerLabel}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[22rem] p-0" align="start">
                          <Command>
                          <CommandInput placeholder="Search chapter/version..." />
                          <CommandList>
                            <CommandEmpty>No results.</CommandEmpty>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                // None = không chọn chapter/version => phân tích toàn bộ truyện
                                setSelectedChapterId('');
                                setSelectedChapter('');
                                setSelectedVersionId('all');
                                setChapterVersionPickerOpen(false);
                              }}
                              className="pl-2"
                            >
                              <Folder className="mr-2 h-4 w-4" />
                              <span className="truncate">None (Whole story)</span>
                              {!selectedChapterId && (
                                <Check className="ml-auto h-4 w-4 opacity-100" />
                              )}
                            </CommandItem>
                            <CommandSeparator />
                            {selectedStory.chapters.map((chapter) => {
                                const chapterKey = chapter.id;
                                const isExpanded =
                                  expandedChapters.includes(chapterKey) ||
                                  selectedChapterId === chapterKey;
                                return (
                                  <CommandGroup
                                    key={chapter.id}
                                    heading={
                                      <button
                                        type="button"
                                        className="flex w-full items-center justify-between text-left text-xs font-medium text-muted-foreground"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setExpandedChapters((prev) =>
                                            prev.includes(chapterKey)
                                              ? prev.filter((id) => id !== chapterKey)
                                              : [...prev, chapterKey],
                                          );
                                        }}
                                      >
                                        <span className="flex items-center gap-2 truncate text-foreground">
                                          <Folder className="h-3 w-3" />
                                          <span className="truncate">{chapter.title}</span>
                                        </span>
                                        <ChevronsUpDown
                                          className={`ml-2 h-3 w-3 shrink-0 transition-transform ${
                                            isExpanded ? 'rotate-180' : 'rotate-0'
                                          }`}
                                        />
                                      </button>
                                    }
                                    className="mt-1 rounded-md border border-border bg-secondary/20 px-1 py-1"
                                  >
                                    {isExpanded && (
                                      <>
                                        <CommandItem
                                          value={`${chapter.title} all`}
                                          onSelect={() => {
                                            setSelectedChapterId(chapter.id);
                                            setSelectedChapter('');
                                            setSelectedVersionId('all');
                                            setChapterVersionPickerOpen(false);
                                          }}
                                          className="pl-6"
                                        >
                                          <Folder className="mr-2 h-4 w-4" />
                                          All versions
                                          {selectedChapterId === chapter.id && selectedVersionId === 'all' && (
                                            <Check className="ml-auto h-4 w-4 opacity-100" />
                                          )}
                                        </CommandItem>
                                        <CommandSeparator />
                                        {chapter.versions.map((version) => (
                                          <CommandItem
                                            key={version.id}
                                            value={`${chapter.title} v${version.version} ${version.label}`}
                                            onSelect={() => {
                                              setSelectedChapterId(chapter.id);
                                              setSelectedChapter('');
                                              setSelectedVersionId(version.id);
                                              setChapterVersionPickerOpen(false);
                                            }}
                                            className="pl-10"
                                          >
                                            <FileIcon className="mr-2 h-4 w-4" />
                                            <span className="mr-2 w-10 text-xs text-muted-foreground">
                                              v{version.version}
                                            </span>
                                            <span className="truncate">{version.label}</span>
                                            {version.isMain && (
                                              <Badge variant="secondary" className="ml-2 text-[10px]">Main</Badge>
                                            )}
                                            {selectedChapterId === chapter.id && selectedVersionId === version.id && (
                                              <Check className="ml-auto h-4 w-4 opacity-100" />
                                            )}
                                          </CommandItem>
                                        ))}
                                      </>
                                    )}
                                  </CommandGroup>
                                );
                              })}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              )}

              {/* Fallback to mock manuscripts if no uploaded stories */}
              {stories.length === 0 && (
                <div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Story</label>
                    <Select value={selectedManuscriptId} onValueChange={setSelectedManuscriptId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select story to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockManuscripts.map((manuscript) => (
                          <SelectItem key={manuscript.id} value={manuscript.id.toString()}>
                            {manuscript.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chapter + Version as folder tree (mock) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Chapter & Version</label>
                    <Popover open={chapterVersionPickerOpen} onOpenChange={setChapterVersionPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={chapterVersionPickerOpen}
                          disabled={!selectedManuscriptId}
                          className="w-full justify-between"
                        >
                          <span className="truncate">{chapterVersionPickerLabel}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[22rem] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search chapter/version..." />
                          <CommandList>
                            <CommandEmpty>No results.</CommandEmpty>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                // None = không chọn chapter/version => phân tích toàn bộ truyện
                                setSelectedChapter('');
                                setSelectedVersionId('all');
                                setChapterVersionPickerOpen(false);
                              }}
                              className="pl-2"
                            >
                              <Folder className="mr-2 h-4 w-4" />
                              <span className="truncate">None (Whole story)</span>
                              {!selectedChapter && (
                                <Check className="ml-auto h-4 w-4 opacity-100" />
                              )}
                            </CommandItem>
                            <CommandSeparator />
                            {chapterOptions.map((ch) => {
                              const chapterLabel = `Chapter ${ch}`;
                              const chapterKey = `mock-${ch}`;
                              const isExpanded =
                                expandedChapters.includes(chapterKey) ||
                                selectedChapter === String(ch);
                              return (
                                <CommandGroup
                                  key={ch}
                                  heading={
                                    <button
                                      type="button"
                                      className="flex w-full items-center justify-between text-left text-xs font-medium text-muted-foreground"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setExpandedChapters((prev) =>
                                          prev.includes(chapterKey)
                                            ? prev.filter((id) => id !== chapterKey)
                                            : [...prev, chapterKey],
                                        );
                                      }}
                                    >
                                      <span className="flex items-center gap-2 truncate text-foreground">
                                        <Folder className="h-3 w-3" />
                                        <span className="truncate">{chapterLabel}</span>
                                      </span>
                                      <ChevronsUpDown
                                        className={`ml-2 h-3 w-3 shrink-0 transition-transform ${
                                          isExpanded ? 'rotate-180' : 'rotate-0'
                                        }`}
                                      />
                                    </button>
                                  }
                                  className="mt-1 rounded-md border border-border bg-secondary/20 px-1 py-1"
                                >
                                  {isExpanded && (
                                    <>
                                      <CommandItem
                                        value={`${chapterLabel} all`}
                                        onSelect={() => {
                                          setSelectedChapter(String(ch));
                                          setSelectedVersionId('all');
                                          setChapterVersionPickerOpen(false);
                                        }}
                                        className="pl-6"
                                      >
                                        <Folder className="mr-2 h-4 w-4" />
                                        All versions
                                        {selectedChapter === String(ch) && selectedVersionId === 'all' && (
                                          <Check className="ml-auto h-4 w-4 opacity-100" />
                                        )}
                                      </CommandItem>
                                      <CommandSeparator />
                                      {mockVersions.map((version) => (
                                        <CommandItem
                                          key={`${ch}-${version.id}`}
                                          value={`${chapterLabel} v${version.version} ${version.label}`}
                                          onSelect={() => {
                                            setSelectedChapter(String(ch));
                                            setSelectedVersionId(version.id);
                                            setChapterVersionPickerOpen(false);
                                          }}
                                          className="pl-10"
                                        >
                                          <FileIcon className="mr-2 h-4 w-4" />
                                          <span className="mr-2 w-10 text-xs text-muted-foreground">
                                            v{version.version}
                                          </span>
                                          <span className="truncate">{version.label}</span>
                                          {selectedChapter === String(ch) && selectedVersionId === version.id && (
                                            <Check className="ml-auto h-4 w-4 opacity-100" />
                                          )}
                                        </CommandItem>
                                      ))}
                                    </>
                                  )}
                                </CommandGroup>
                              );
                            })}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center justify-center pt-2">
                {isReadyToChat ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Sẵn sàng
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Selected
                  </Badge>
                )}
              </div>

              {/* Selected Info */}
              {isReadyToChat && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {selectedStory ? (
                        <>
                          <span className="text-primary">{selectedStory.title}</span> - {selectedChapterData?.title || 'Chapter'}
                          {selectedVersionId === 'all' ? (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              All {selectedChapterData?.versions.length || 0} versions
                            </Badge>
                          ) : selectedChapterData && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              v{selectedChapterData.versions.find(v => v.id === selectedVersionId)?.version}
                            </Badge>
                          )}
                        </>
                      ) : selectedManuscript ? (
                        <>
                          <span className="text-primary">{selectedManuscript.title}</span> - Chapter {selectedChapter}
                        </>
                      ) : null}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Story/Manuscript Info */}
          {(selectedStory || selectedManuscript) && (
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Story Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-2">
                      {selectedStory ? selectedStory.title : selectedManuscript?.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedStory ? (
                        <>
                          <Badge variant="secondary" className="text-xs">
                            {selectedStory.chapters.length} chương
                          </Badge>
                          {selectedChapterData && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedChapterData.versions.length} versions
                            </Badge>
                          )}
                        </>
                      ) : selectedManuscript ? (
                        <>
                      <Badge variant="secondary" className="text-xs">
                        {selectedManuscript.chapters} chương
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {(selectedManuscript.words! / 1000).toFixed(0)}K từ
                      </Badge>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {selectedChapterData && selectedVersionId !== 'all' && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Version: <span className="text-primary">
                            v{selectedChapterData.versions.find(v => v.id === selectedVersionId)?.version} - {selectedChapterData.versions.find(v => v.id === selectedVersionId)?.label}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedChapterData && selectedVersionId === 'all' && (
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">
                          Analyzing: <span className="text-accent">All {selectedChapterData.versions.length} versions</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {isReadyToChat && (
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() =>
                      setInputValue(
                        isWholeStory
                          ? 'Analyze the overall story structure and pacing'
                          : `Analyze pacing of chapter ${selectedChapter}`,
                      )
                    }
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isWholeStory ? 'Analyze Story Structure' : 'Analyze Pacing'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() =>
                      setInputValue(
                        isWholeStory
                          ? 'Which characters appear most throughout the story?'
                          : `Which character appears most in chapter ${selectedChapter}?`,
                      )
                    }
                  >
                    <User className="w-4 h-4 mr-2" />
                    Analyze Characters
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() =>
                      setInputValue(
                        isWholeStory
                          ? 'What are the main themes of the story?'
                          : `What is the dominant emotion of chapter ${selectedChapter}?`,
                      )
                    }
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {isWholeStory ? 'Analyze Themes' : 'Analyze Emotions'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

          {/* Center - Chapter Content */}
        <div className="flex-1 flex flex-col">
          <Card variant="elevated" className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedChapterData ? (
                      <>
                        {selectedChapterData.title}
                        {selectedVersionId === 'all' && (
                          <Badge variant="secondary" className="ml-2">
                            All Versions
                          </Badge>
                        )}
                      </>
                    ) : selectedChapterContent ? (
                      <>Chapter {selectedChapter}: {selectedChapterContent.title}</>
                    ) : (
                      'Chapter Content'
                    )}
                  </CardTitle>
                  {(selectedChapterContent || displayContent) && (
                    <CardDescription className="mt-1">
                      {selectedVersionId === 'all' && selectedChapterData
                        ? `${selectedChapterData.versions.length} versions`
                        : selectedChapterContent
                        ? `${selectedChapterContent.wordCount} words`
                        : displayContent
                        ? `${displayContent.length} characters`
                        : ''}
                    </CardDescription>
                  )}
                </div>
                {isReadyToChat && (
                  <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Analyzing
                  </Badge>
                )}
              </div>
            </CardHeader>
            <ScrollArea className="flex-1">
              {!isReadyToChat ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Select a Story
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Please select a story from the left panel to start analyzing.
                  </p>
                </div>
              ) : isWholeStory ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Whole Story Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    No chapter/version selected, so AI will analyze the entire story. Pick a chapter/version if you want chapter-level analysis.
                  </p>
                </div>
              ) : isWholeStory ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Whole Story Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    You haven't selected a chapter/version, so AI will analyze the entire story. Select a chapter/version if you want chapter-level analysis.
                  </p>
                </div>
              ) : displayContent ? (
                <div className="p-8 prose prose-invert max-w-none">
                  <div className="text-foreground leading-relaxed font-serif">
                    {displayContent.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : selectedChapterContent ? (
                <div className="p-8 prose prose-invert max-w-none">
                  <div className="text-foreground leading-relaxed font-serif">
                    {selectedChapterContent.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-warning" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Chapter Content Not Available
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    The content for this chapter is not available yet. Please select another chapter.
                  </p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>

        {/* Right Side - Chat Box */}
        <div className="w-96 flex flex-col">
          <Card variant="elevated" className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Assistant</CardTitle>
                  <CardDescription className="text-xs">
                    {isReadyToChat
                      ? isWholeStory
                        ? 'Analyzing Whole Story'
                        : `Analyzing Chapter ${selectedChapterData?.title || selectedChapter}`
                      : 'Select story to start'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {!isReadyToChat ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Bot className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Select a story and chapter to start chatting with AI.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {isTyping && <TypingIndicator />}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {/* Suggested Questions */}
            {isReadyToChat && (
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Sugession questions:</p>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-2" style={{ width: 'max-content' }}>
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs whitespace-nowrap shrink-0"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="shrink-0" disabled={!isReadyToChat}>
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={
                      isReadyToChat
                        ? isWholeStory
                          ? 'Ask about the whole story...'
                          : `Ask about Chapter ${selectedChapterData?.title || selectedChapter}...`
                        : 'Select story first'
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="pr-12"
                    disabled={!isReadyToChat}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    disabled={!isReadyToChat}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                </div>
                <Button 
                  variant="gradient" 
                  size="icon" 
                  className="shrink-0"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || !isReadyToChat}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Heart, 
  Zap, 
  BookOpen,
  Info,
  FileText,
  Clock3,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockManuscripts } from '@/utils/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  loadAnalysisOverrides,
  makeMockScopeKey,
  makeStoryScopeKey,
  subscribeAnalysisOverrides,
  type AnalysisOverride,
} from '@/utils/analysisOverrides';

type Pacing = 'slow' | 'medium' | 'fast';

interface Scene {
  id: string;
  index: number;
  title: string;
  mainIssue: string;
  emotion: string;
  emotionIntensity: number;
  pacing: Pacing;
  characters: string[];
  wordCount: number;
}

interface ChapterVersion {
  version: number;
  chapter: number;
  updatedAt: string;
  note: string;
}

const mockScenesByChapter: Record<number, Scene[]> = {
  1: [
    {
      id: '1-1',
      index: 1,
      title: 'Bến sông về đêm',
      mainIssue: 'Giới thiệu bối cảnh và tâm trạng cô đơn của Minh',
      emotion: 'Calm',
      emotionIntensity: 35,
      pacing: 'slow',
      characters: ['Minh'],
      wordCount: 950,
    },
    {
      id: '1-2',
      index: 2,
      title: 'Gặp lại Linh',
      mainIssue: 'Thiết lập mối quan hệ và xung đột tiềm ẩn',
      emotion: 'Hopeful',
      emotionIntensity: 55,
      pacing: 'medium',
      characters: ['Minh', 'Linh'],
      wordCount: 1200,
    },
  ],
  4: [
    {
      id: '4-1',
      index: 1,
      title: 'Đêm truy đuổi trong rừng',
      mainIssue: 'Minh bị Hùng dồn vào thế bí',
      emotion: 'Fearful',
      emotionIntensity: 85,
      pacing: 'fast',
      characters: ['Minh', 'Hùng'],
      wordCount: 1400,
    },
    {
      id: '4-2',
      index: 2,
      title: 'Cliffhanger at the Cliff',
      mainIssue: 'Open ending with life-or-death choice',
      emotion: 'Tense',
      emotionIntensity: 90,
      pacing: 'fast',
      characters: ['Minh', 'Hùng'],
      wordCount: 1100,
    },
  ],
};

const chapterVersionHistory: ChapterVersion[] = [
  {
    version: 3,
    chapter: 4,
    updatedAt: '2024-12-22',
    note: 'Revised climax, increased pacing in final scene.',
  },
  {
    version: 2,
    chapter: 4,
    updatedAt: '2024-12-18',
    note: 'Added dialogue between Minh and Hung.',
  },
  {
    version: 1,
    chapter: 4,
    updatedAt: '2024-12-10',
    note: 'First draft of the chapter.',
  },
];

const pacingLabel: Record<Pacing, string> = {
  slow: 'Slow',
  medium: 'Medium',
  fast: 'Fast',
};

const pacingColor: Record<Pacing, string> = {
  slow: 'bg-success/10 text-success border-success/20',
  medium: 'bg-info/10 text-info border-info/20',
  fast: 'bg-warning/10 text-warning border-warning/20',
};

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

const mockVersions = [
  { id: 'v1', version: 1, label: 'Draft' },
  { id: 'v2', version: 2, label: 'Revised' },
  { id: 'v3', version: 3, label: 'Final' },
];

export default function AnalysisPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>(''); // specific version id
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<number>(mockManuscripts[0].id);
  const [selectedChapter, setSelectedChapter] = useState<number>(4);
  const [overrideRevision, setOverrideRevision] = useState(0);

  // Load stories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedStories = JSON.parse(saved);
        setStories(savedStories);
        if (savedStories.length > 0) {
          setSelectedStoryId(savedStories[0].id);
          if (savedStories[0].chapters.length > 0) {
            setSelectedChapterId(savedStories[0].chapters[0].id);
            const mainVersion = savedStories[0].chapters[0].versions.find(v => v.isMain) || savedStories[0].chapters[0].versions[0];
            if (mainVersion) {
              setSelectedVersionId(mainVersion.id);
            }
          }
        }
      } catch (error) {
        console.error('Error loading stories:', error);
      }
    }
  }, []);

  useEffect(() => {
    return subscribeAnalysisOverrides(() => setOverrideRevision((v) => v + 1));
  }, []);

  const selectedStory = useMemo(
    () => stories.find(s => s.id === selectedStoryId),
    [stories, selectedStoryId]
  );

  const selectedChapterData = useMemo(
    () => selectedStory?.chapters.find(c => c.id === selectedChapterId),
    [selectedStory, selectedChapterId]
  );

  const selectedManuscript = useMemo(
    () => mockManuscripts.find((m) => m.id === selectedManuscriptId)!,
    [selectedManuscriptId],
  );

  const effectiveChapterNumber = selectedChapterData?.order || selectedChapter;

  const overrideStore = useMemo(() => loadAnalysisOverrides(), [overrideRevision]);

  const activeOverride: AnalysisOverride | undefined = useMemo(() => {
    if (selectedStory && selectedChapterData && selectedVersionId) {
      const key = makeStoryScopeKey({
        storyId: selectedStory.id,
        chapterId: selectedChapterData.id,
        versionId: selectedVersionId,
      });
      return overrideStore[key];
    }

    const mockKey = makeMockScopeKey({
      manuscriptId: selectedManuscriptId,
      chapter: effectiveChapterNumber,
      versionId: selectedVersionId || undefined,
    });
    return overrideStore[mockKey];
  }, [
    overrideStore,
    selectedStory,
    selectedChapterData,
    selectedVersionId,
    selectedManuscriptId,
    effectiveChapterNumber,
  ]);

  const scenes = mockScenesByChapter[effectiveChapterNumber] || [];
  const totalScenes = scenes.length;

  const characterFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    scenes.forEach((scene) => {
      scene.characters.forEach((name) => {
        freq.set(name, (freq.get(name) || 0) + 1);
      });
    });
    return Array.from(freq.entries()).map(([name, count]) => ({ name, count }));
  }, [scenes]);

  const avgWordsPerSceneComputed = totalScenes
    ? Math.round(scenes.reduce((sum, s) => sum + s.wordCount, 0) / totalScenes)
    : 0;

  const dominantEmotionComputed = useMemo(() => {
    if (!scenes.length) return '—';
    const map = new Map<string, number>();
    scenes.forEach((s) => map.set(s.emotion, (map.get(s.emotion) || 0) + s.emotionIntensity));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }, [scenes]);

  const effectiveDominantEmotion = activeOverride?.dominantEmotion || dominantEmotionComputed;
  const effectiveAvgWordsPerScene =
    typeof activeOverride?.avgWordsPerScene === 'number' ? activeOverride.avgWordsPerScene : avgWordsPerSceneComputed;
  const effectiveCharacterFrequency = activeOverride?.characterFrequency || characterFrequency;

  return (
    <DefaultLayout title="Chapter Analysis" role="author">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header: chọn truyện & chương */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-foreground">AI Content Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Select manuscript and chapter to view pacing, emotion, character, and scene analysis.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Story Selector (from uploaded stories) */}
            {stories.length > 0 && (
              <div className="w-56">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Story (Uploaded)</p>
                <Select
                  value={selectedStoryId}
                  onValueChange={(value) => {
                    setSelectedStoryId(value);
                    const story = stories.find(s => s.id === value);
                    if (story && story.chapters.length > 0) {
                      setSelectedChapterId(story.chapters[0].id);
                      const mainVersion = story.chapters[0].versions.find(v => v.isMain) || story.chapters[0].versions[0];
                      if (mainVersion) {
                        setSelectedVersionId(mainVersion.id);
                      }
                    }
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
            )}

            {/* Chapter Selector */}
            {selectedStory && (
              <div className="w-56">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Chapter</p>
                <Select
                  value={selectedChapterId}
                  onValueChange={(value) => {
                    setSelectedChapterId(value);
                    const chapter = selectedStory.chapters.find(c => c.id === value);
                    if (chapter && chapter.versions.length > 0) {
                      const mainVersion = chapter.versions.find(v => v.isMain) || chapter.versions[0];
                      if (mainVersion) {
                        setSelectedVersionId(mainVersion.id);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStory.chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Version Selector */}
            {selectedChapterData && selectedChapterData.versions.length > 0 && (
              <div className="w-48">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Version</p>
                <Select
                  value={selectedVersionId}
                  onValueChange={(value) => setSelectedVersionId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedChapterData.versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        <div className="flex items-center gap-2">
                          <span>v{version.version}</span>
                          <Badge variant="outline" className="text-xs">
                            {version.label}
                          </Badge>
                          {version.isMain && (
                            <Badge variant="default" className="text-xs">Main</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Fallback to mock manuscripts if no uploaded stories */}
            {stories.length === 0 && (
              <>
            <div className="w-56">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Manuscript</p>
              <Select
                value={String(selectedManuscriptId)}
                onValueChange={(value) => setSelectedManuscriptId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manuscript" />
                </SelectTrigger>
                <SelectContent>
                  {mockManuscripts.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                        {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Chapter</p>
              <Select
                value={String(selectedChapter)}
                onValueChange={(value) => setSelectedChapter(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: selectedManuscript.chapters || 0 }, (_, i) => i + 1).map(
                    (ch) => (
                      <SelectItem key={ch} value={String(ch)}>
                        Chapter {ch}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
                <div className="w-40">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Version</p>
                  <Select
                    value={selectedVersionId}
                    onValueChange={(value) => setSelectedVersionId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVersions.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          <div className="flex items-center gap-2">
                            <span>v{version.version}</span>
                            <Badge variant="outline" className="text-xs">
                              {version.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button variant="gradient" className="gap-2 mt-2 md:mt-5">
              Request AI Analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Thông tin bản thảo & version */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="metric">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Story</p>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {selectedStory ? selectedStory.title : selectedManuscript.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {selectedChapterData && selectedChapterData.versions.length > 0 && (
            <Card variant="metric">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedChapterData.versions.find(v => v.id === selectedVersionId)?.version || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedChapterData.versions.find(v => v.id === selectedVersionId) 
                        ? `v${selectedChapterData.versions.find(v => v.id === selectedVersionId)?.version} - ${selectedChapterData.versions.find(v => v.id === selectedVersionId)?.label || ''}`
                        : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
          {!selectedChapterData && selectedManuscript && (
          <Card variant="metric">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">File Type</p>
                    <p className="text-sm font-semibold text-foreground">
                    {selectedManuscript.fileName.split('.').pop()?.toUpperCase()} •{' '}
                    {new Date(selectedManuscript.uploadedAt).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
          <Card variant="metric">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedStory ? selectedStory.chapters.length : (selectedManuscript.chapters ?? '—')}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Chapters</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="metric">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Clock3 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedChapterData ? selectedChapterData.title : `Chapter ${selectedChapter}`} History
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedChapterData 
                      ? `${selectedChapterData.versions.length} versions saved`
                      : `${chapterVersionHistory.length} versions saved`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs phân tích */}
        <Tabs defaultValue="chapter" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="chapter" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Chapter Overview
            </TabsTrigger>
            <TabsTrigger value="scenes" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Scenes & Emotions
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Chapter History
            </TabsTrigger>
          </TabsList>

          {/* Tổng quan chương */}
          <TabsContent value="chapter">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Chapter {effectiveChapterNumber} Overview
                  {activeOverride && (
                    <Badge variant="secondary" className="text-xs">Adjusted</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Statistics on pacing, dominant emotions, and scene structure of the chapter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card variant="metric">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{totalScenes || '—'}</p>
                          <p className="text-xs text-muted-foreground">Scenes in Chapter</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="metric">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-heart/10 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-pink-500" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">{effectiveDominantEmotion}</p>
                          <p className="text-xs text-muted-foreground">Dominant Emotion</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="metric">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-info" />
                        </div>
                  <div>
                          <p className="text-xl font-bold text-foreground">
                            {effectiveAvgWordsPerScene ? effectiveAvgWordsPerScene.toLocaleString() : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">Words / Scene (Est.)</p>
                        </div>
                  </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Pacing by Scene
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={scenes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="index"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(v) => `Scene ${v}`}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const s = payload[0].payload as Scene;
                            return (
                              <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow">
                                <p className="font-medium text-foreground">
                                  Scene {s.index}: {s.title}
                                </p>
                                <p className="text-muted-foreground">
                                  {s.emotion} • Pacing {pacingLabel[s.pacing]}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="emotionIntensity"
                        name="Emotion Intensity"
                        radius={[4, 4, 0, 0]}
                        fill="hsl(var(--primary))"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scene & cảm xúc */}
          <TabsContent value="scenes">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Scenes in Chapter {effectiveChapterNumber}</CardTitle>
                <CardDescription>
                  Description of main content, issues, and emotions of each scene.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scenes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    This chapter has no scene analysis yet. Please upload manuscript or request AI analysis.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {scenes.map((scene) => (
                      <div
                        key={scene.id}
                        className="rounded-lg border border-border bg-secondary/30 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Scene {scene.index}
                            </Badge>
                            <p className="font-medium text-foreground">{scene.title}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${pacingColor[scene.pacing]}`}
                          >
                            Pacing: {pacingLabel[scene.pacing]}
                          </Badge>
                </div>
                        <p className="mt-2 text-sm text-muted-foreground">{scene.mainIssue}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            Emotion: <span className="font-medium text-foreground">{scene.emotion}</span>
                          </span>
                          <span>
                            Est. Word Count:{' '}
                            <span className="font-medium text-foreground">
                              {scene.wordCount.toLocaleString()}
                            </span>
                          </span>
                          <span className="flex flex-wrap items-center gap-1">
                            Characters:{' '}
                            {scene.characters.map((c) => (
                              <Badge key={c} variant="secondary" className="text-[10px]">
                                {c}
                    </Badge>
                            ))}
                          </span>
                        </div>
                      </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nhân vật */}
          <TabsContent value="characters">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Characters in Chapter {effectiveChapterNumber}</CardTitle>
                <CardDescription>
                  Frequency of appearance for each character based on analyzed scenes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {effectiveCharacterFrequency.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No character data available for this chapter.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Character</TableHead>
                        <TableHead>Scenes Appeared</TableHead>
                        <TableHead className="text-right">Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effectiveCharacterFrequency.map((char) => (
                        <TableRow key={char.name}>
                          <TableCell className="font-medium">{char.name}</TableCell>
                          <TableCell>{char.count}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            Appears in{' '}
                            {Math.round((char.count / (totalScenes || 1)) * 100)}% of scenes
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lịch sử chương & upload/version */}
          <TabsContent value="versions">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Chapter {selectedChapter} Manuscript History</CardTitle>
                <CardDescription>
                  Track edits and uploaded versions for this chapter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  New upload will create a new version for{' '}
                  <span className="font-semibold text-foreground">
                    Chapter {selectedChapter}
                          </span>
                  . After AI analysis, history will be updated below.
                        </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Update Date</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapterVersionHistory.map((ver) => (
                      <TableRow key={`${ver.version}-${ver.updatedAt}`}>
                        <TableCell className="font-medium">v{ver.version}</TableCell>
                        <TableCell>
                          {new Date(ver.updatedAt).toLocaleDateString('en-US')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{ver.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DefaultLayout>
  );
}

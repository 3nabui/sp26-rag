import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { projectApi, chapterApi, ProjectResponse, ChapterResponse } from '@/lib/api';
import { getChapterVersions, ChapterVersionResponse } from '@/services/chapterVersionService';
import { toast } from 'sonner';
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

// Project with chapters and versions
interface ProjectWithChapters extends ProjectResponse {
  chapters?: ChapterWithVersions[];
}

interface ChapterWithVersions extends ChapterResponse {
  versions?: ChapterVersionResponse[];
}

interface Version {
  id: string;
  version: number;
  label: string;
  content: string;
  createdAt: string;
  isActive: boolean;
}

export default function AnalysisPage() {
  const [projects, setProjects] = useState<ProjectWithChapters[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [overrideRevision, setOverrideRevision] = useState(0);

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const res = await projectApi.getMyProjects();
        if (res.data && Array.isArray(res.data)) {
          const projectsList: ProjectWithChapters[] = res.data.map((p: ProjectResponse) => ({
            ...p,
            id: String(p.id || p.projectId || ''),
            projectId: p.id || p.projectId,
            chapters: [],
          }));
          setProjects(projectsList);
          if (projectsList.length > 0) {
            setSelectedProjectId(String(projectsList[0].id || projectsList[0].projectId || ''));
          }
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        toast.error('Không thể tải danh sách dự án');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  // Load chapters when project is selected
  useEffect(() => {
    if (!selectedProjectId) return;
    
    const loadChapters = async () => {
      try {
        setLoadingChapters(true);
        const projectIdNum = parseInt(selectedProjectId);
        if (isNaN(projectIdNum)) return;
        
        const res = await chapterApi.getChaptersByProject(projectIdNum);
        if (res.data && Array.isArray(res.data)) {
          const chaptersList: ChapterWithVersions[] = res.data.map((ch: ChapterResponse) => ({
            ...ch,
            id: String(ch.chapterId || ch.chapterID || ch.id || ''),
            chapterId: ch.chapterId || ch.chapterID || ch.id,
            versions: [],
          }));
          
          // Update project with chapters
          setProjects(prev => prev.map(p => 
            String(p.id || p.projectId) === selectedProjectId 
              ? { ...p, chapters: chaptersList }
              : p
          ));
          
          // Auto-select first chapter if available
          if (chaptersList.length > 0) {
            const firstChapter = chaptersList[0];
            const firstChapterId = String(firstChapter.id || firstChapter.chapterId || '');
            if (firstChapterId) {
              setSelectedChapterId(firstChapterId);
            }
          } else {
            setSelectedChapterId('');
          }
        }
      } catch (err) {
        console.error('Error loading chapters:', err);
        toast.error('Không thể tải danh sách chương');
      } finally {
        setLoadingChapters(false);
      }
    };
    
    loadChapters();
  }, [selectedProjectId]);

  // Load versions when chapter is selected
  useEffect(() => {
    if (!selectedChapterId) return;
    
    const loadVersions = async () => {
      try {
        setLoadingVersions(true);
        const chapterIdNum = parseInt(selectedChapterId);
        if (isNaN(chapterIdNum)) return;
        
        const res = await getChapterVersions(chapterIdNum);
        if (res.data && Array.isArray(res.data)) {
          const versionsList = res.data.map((v: ChapterVersionResponse) => ({
            id: String(v.versionId || v.chapterVersionId || ''),
            version: v.versionNumber || 1,
            label: v.isActive ? 'Active' : 'Draft',
            content: v.rawContent || '',
            createdAt: v.createdAt || v.uploadDate || new Date().toISOString(),
            isActive: v.isActive || false,
          }));
          
          // Update chapter with versions
          setProjects(prev => prev.map(p => ({
            ...p,
            chapters: p.chapters?.map(ch => 
              String(ch.id || ch.chapterId) === selectedChapterId
                ? { ...ch, versions: versionsList }
                : ch
            ) || [],
          })));
          
          if (versionsList.length > 0) {
            const activeVersion = versionsList.find(v => v.isActive) || versionsList[0];
            setSelectedVersionId(activeVersion.id);
          }
        }
      } catch (err) {
        console.error('Error loading versions:', err);
        toast.error('Không thể tải danh sách phiên bản');
      } finally {
        setLoadingVersions(false);
      }
    };
    
    loadVersions();
  }, [selectedChapterId]);

  useEffect(() => {
    return subscribeAnalysisOverrides(() => setOverrideRevision((v) => v + 1));
  }, []);

  const selectedProject = useMemo(
    () => projects.find(p => String(p.id || p.projectId) === selectedProjectId),
    [projects, selectedProjectId]
  );

  const selectedChapterData = useMemo(
    () => selectedProject?.chapters?.find(c => String(c.id || c.chapterId) === selectedChapterId),
    [selectedProject, selectedChapterId]
  );

  const effectiveChapterNumber = selectedChapterData?.chapterNo || selectedChapterData?.chapterNumber || 0;

  const overrideStore = useMemo(() => loadAnalysisOverrides(), [overrideRevision]);

  const activeOverride: AnalysisOverride | undefined = useMemo(() => {
    if (selectedProject && selectedChapterData && selectedVersionId) {
      const key = makeStoryScopeKey({
        storyId: String(selectedProject.id || selectedProject.projectId),
        chapterId: String(selectedChapterData.id || selectedChapterData.chapterId),
        versionId: selectedVersionId,
      });
      return overrideStore[key];
    }
    return undefined;
  }, [
    overrideStore,
    selectedProject,
    selectedChapterData,
    selectedVersionId,
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

  // Memoized handlers for better performance
  const handleProjectChange = useCallback((value: string) => {
    setSelectedProjectId(value);
    setSelectedChapterId('');
    setSelectedVersionId('');
  }, []);

  const handleChapterChange = useCallback((value: string) => {
    setSelectedChapterId(value);
    setSelectedVersionId('');
  }, []);

  const handleVersionChange = useCallback((value: string) => {
    setSelectedVersionId(value);
  }, []);

  return (
    <DefaultLayout title="Chapter Analysis" role="author">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3,
          ease: "easeOut"
        }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Phân tích Nội dung AI</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Chọn dự án, chương và phiên bản để xem phân tích về nhịp độ, cảm xúc, nhân vật và cảnh.
            </p>
          </div>

          {/* Selection Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                {/* Project Selector */}
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Dự án</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : projects.length > 0 ? (
                    <Select
                      value={selectedProjectId}
                      onValueChange={handleProjectChange}
                    >
                      <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                        <SelectValue placeholder="Chọn dự án" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={String(project.id || project.projectId)} value={String(project.id || project.projectId)}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 rounded-md bg-secondary/50 flex items-center justify-center border border-dashed">
                      <p className="text-sm text-muted-foreground">Chưa có dự án</p>
                    </div>
                  )}
                </div>

                {/* Chapter Selector */}
                <motion.div 
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: selectedProject ? 1 : 0, 
                    x: selectedProject ? 0 : -10
                  }}
                  transition={{ 
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                  style={{ 
                    display: selectedProject ? 'block' : 'none'
                  }}
                >
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Chương</Label>
                  {loadingChapters ? (
                    <Skeleton className="h-10 w-full animate-pulse" />
                  ) : (() => {
                    // Kiểm tra chapters từ selectedProject hoặc từ projects state
                    const projectChapters = selectedProject?.chapters || 
                      projects.find(p => String(p.id || p.projectId) === selectedProjectId)?.chapters;
                    
                    if (projectChapters && projectChapters.length > 0) {
                      return (
                        <Select
                          value={selectedChapterId}
                          onValueChange={handleChapterChange}
                        >
                          <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                            <SelectValue placeholder="Chọn chương" />
                          </SelectTrigger>
                          <SelectContent>
                            {projectChapters.map((chapter) => (
                              <SelectItem key={String(chapter.id || chapter.chapterId)} value={String(chapter.id || chapter.chapterId)}>
                                {chapter.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    } else if (selectedProject && !loadingChapters) {
                      return (
                        <div className="h-10 rounded-md bg-secondary/50 flex items-center justify-center border border-dashed">
                          <p className="text-sm text-muted-foreground">Chưa có chương</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </motion.div>

                {/* Version Selector */}
                <motion.div 
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: selectedChapterData ? 1 : 0, 
                    x: selectedChapterData ? 0 : -10
                  }}
                  transition={{ 
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                  style={{ 
                    display: selectedChapterData ? 'block' : 'none'
                  }}
                >
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Phiên bản</Label>
                  {loadingVersions ? (
                    <Skeleton className="h-10 w-full animate-pulse" />
                  ) : selectedChapterData?.versions && selectedChapterData.versions.length > 0 ? (
                    <Select
                      value={selectedVersionId}
                      onValueChange={handleVersionChange}
                    >
                      <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                        <SelectValue placeholder="Chọn phiên bản" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedChapterData.versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            <div className="flex items-center gap-2">
                              <span>v{version.version}</span>
                              <Badge variant="outline" className="text-xs">
                                {version.label}
                              </Badge>
                              {version.isActive && (
                                <Badge variant="default" className="text-xs">Active</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : selectedChapterData ? (
                    <div className="h-10 rounded-md bg-secondary/50 flex items-center justify-center border border-dashed">
                      <p className="text-sm text-muted-foreground">Chưa có phiên bản</p>
                    </div>
                  ) : null}
                </motion.div>

                {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Button 
                    variant="gradient" 
                    className="gap-2 h-10 transition-all duration-200 hover:scale-105 active:scale-95 group"
                  >
                    Phân tích AI
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
          </motion.div>
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
                <CardTitle>Chapter {effectiveChapterNumber || '—'} Manuscript History</CardTitle>
                <CardDescription>
                  Track edits and uploaded versions for this chapter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedChapterData && selectedChapterData.versions && selectedChapterData.versions.length > 0 ? (
                  <>
                    <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                      New upload will create a new version for{' '}
                      <span className="font-semibold text-foreground">
                        {selectedChapterData.title}
                      </span>
                      . After AI analysis, history will be updated below.
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Update Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedChapterData.versions.map((ver) => (
                          <TableRow key={ver.id}>
                            <TableCell className="font-medium">v{ver.version}</TableCell>
                            <TableCell>
                              {new Date(ver.createdAt).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={ver.isActive ? 'default' : 'outline'} className="text-xs">
                                {ver.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground text-center">
                    {selectedChapterData 
                      ? 'Chưa có phiên bản nào cho chương này'
                      : 'Vui lòng chọn dự án và chương để xem lịch sử'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DefaultLayout>
  );
}

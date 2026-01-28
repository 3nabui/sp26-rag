import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  RefreshCw,
  Pencil,
  MessageSquare,
  Info,
  BookOpen,
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import {
  loadAnalysisOverrides,
  makeStoryScopeKey,
  removeAnalysisOverride,
  saveAnalysisOverride,
  type AnalysisCharacterFrequency,
} from '@/utils/analysisOverrides';
import { appendStaffAuditEvent, getStaffAuditForScope } from '@/utils/staffAudit';

type FlagStatus = 'pending' | 'needs-review' | 'resolved';

interface FlaggedManuscript {
  id: string;
  title: string;
  author: string;
  flaggedReason: string;
  status: FlagStatus;
  lastUpdated: string;
  // Link to the exact chapter/version staff is allowed to view (read-only)
  linkedStoryId?: string;
  linkedChapterId?: string;
  linkedVersionId?: string;
}

const flaggedManuscripts: FlaggedManuscript[] = [
  {
    id: 'MS-1042',
    title: 'Bóng Tối Ven Sông',
    author: 'Trần Minh Anh',
    flaggedReason: 'AI detected broken plot line in chapter 7',
    status: 'needs-review',
    lastUpdated: '2024-12-03',
  },
  {
    id: 'MS-1068',
    title: 'Hành Trình Phía Bắc',
    author: 'Lê Quang',
    flaggedReason: 'Missing emotion analysis for chapters 3-4',
    status: 'pending',
    lastUpdated: '2024-12-01',
  },
  {
    id: 'MS-1005',
    title: 'Những Vì Sao Trên Đỉnh Đồi',
    author: 'Hoàng Gia Bảo',
    flaggedReason: 'Analysis incomplete due to timeout',
    status: 'resolved',
    lastUpdated: '2024-11-28',
  },
];

const FLAGGED_STORAGE_KEY = 'storynest_flagged_manuscripts';

function loadFlaggedManuscripts(): FlaggedManuscript[] {
  try {
    const raw = localStorage.getItem(FLAGGED_STORAGE_KEY);
    if (!raw) return flaggedManuscripts;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FlaggedManuscript[]) : flaggedManuscripts;
  } catch {
    return flaggedManuscripts;
  }
}

function saveFlaggedManuscripts(next: FlaggedManuscript[]) {
  try {
    localStorage.setItem(FLAGGED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

// Story structure from Upload page (localStorage)
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

const STORIES_STORAGE_KEY = 'storynest_stories';

const statusConfig: Record<FlagStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  'needs-review': { label: 'Needs Review', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  resolved: { label: 'Resolved', className: 'bg-success/10 text-success border-success/20' },
};

const mockAiDetails: Record<string, { emotion: string; pacing: string; scenes: number; avgWords: number; characters: string; lastRun: string; status: string; summary: string }> = {
  'MS-1042': {
    emotion: 'Tense',
    pacing: 'Fast',
    scenes: 6,
    avgWords: 1150,
    characters: 'Minh, Hùng, Linh',
    lastRun: '2024-12-02 09:15',
    status: 'Completed with warnings',
    summary: 'Climax sequence flagged due to possible plot inconsistency in scene 4; AI may have missed prior setup from Ch.6.',
  },
  'MS-1068': {
    emotion: 'Melancholy',
    pacing: 'Medium',
    scenes: 5,
    avgWords: 980,
    characters: 'Quang, An',
    lastRun: '2024-12-01 16:40',
    status: 'Incomplete (timeout)',
    summary: 'Emotion analysis missing for scenes 3-4 because of timeout. Consider re-run or partial adjustment.',
  },
};

export default function StaffReviewPage() {
  const [flaggedList, setFlaggedList] = useState<FlaggedManuscript[]>(() => loadFlaggedManuscripts());
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>(() => (loadFlaggedManuscripts()[0]?.id || ''));
  const selectedManuscript = useMemo(
    () => flaggedList.find((m) => m.id === selectedManuscriptId) || null,
    [flaggedList, selectedManuscriptId]
  );
  const [statusDraft, setStatusDraft] = useState<FlagStatus>(() => selectedManuscript?.status || 'pending');
  const [reasonDraft, setReasonDraft] = useState<string>(() => selectedManuscript?.flaggedReason || '');
  const [feedback, setFeedback] = useState('');
  const [stories, setStories] = useState<Story[]>([]);

  const [adjustOpen, setAdjustOpen] = useState(false);

  const [overrideEmotion, setOverrideEmotion] = useState('');
  const [overrideAvgWords, setOverrideAvgWords] = useState<string>('');
  const [overrideCharactersText, setOverrideCharactersText] = useState('');
  const [overrideNote, setOverrideNote] = useState('');

  const [viewOpen, setViewOpen] = useState(false);
  const [viewAiOpen, setViewAiOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORIES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setStories(Array.isArray(parsed) ? (parsed as Story[]) : []);
      } else {
        setStories([]);
      }
    } catch {
      setStories([]);
    }
  }, []);

  // Demo-only helper: if system has not provided links yet but stories exist,
  // auto-link flagged cases to the first story so UI can be tested.
  useEffect(() => {
    if (!stories.length) return;
    const story = stories[0];
    const pickChapterByReason = (reason: string) => {
      const m = reason.match(/chapter\s+(\d+)/i);
      const chapterNumber = m ? Number(m[1]) : NaN;
      if (Number.isFinite(chapterNumber)) {
        const found = story.chapters.find((c) => c.order === chapterNumber);
        if (found) return found;
      }
      return story.chapters[0];
    };
    const needLink = flaggedList.some(
      (m) => !m.linkedStoryId || !m.linkedChapterId || !m.linkedVersionId
    );
    if (!needLink) return;
    const next = flaggedList.map((item) => {
      if (item.linkedStoryId && item.linkedChapterId && item.linkedVersionId) return item;
      const chapter = pickChapterByReason(item.flaggedReason);
      const version = chapter?.versions.find((v) => v.isMain) || chapter?.versions[0];
      if (!chapter || !version) return item;
      return {
        ...item,
        linkedStoryId: story.id,
        linkedChapterId: chapter.id,
        linkedVersionId: version.id,
      };
    });
    setFlaggedList(next);
    saveFlaggedManuscripts(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories.length]);

  const markNeedsRelink = () => {
    if (!selectedManuscript) return;
    const nextReason = selectedManuscript.flaggedReason?.trim()
      ? `${selectedManuscript.flaggedReason.trim()} (missing link: story/chapter/version)`
      : 'Missing link: story/chapter/version';
    updateSelectedReason(nextReason);
    updateSelectedStatus('needs-review');
  };

  useEffect(() => {
    if (selectedManuscript) setStatusDraft(selectedManuscript.status);
  }, [selectedManuscript]);

  useEffect(() => {
    if (selectedManuscript) setReasonDraft(selectedManuscript.flaggedReason);
  }, [selectedManuscript]);

  const updateSelectedStatus = (nextStatus: FlagStatus) => {
    if (!selectedManuscript) return;
    const nextList = flaggedList.map((m) =>
      m.id === selectedManuscript.id
        ? { ...m, status: nextStatus, lastUpdated: new Date().toISOString().slice(0, 10) }
        : m
    );
    setFlaggedList(nextList);
    saveFlaggedManuscripts(nextList);
  };

  const updateSelectedReason = (nextReason: string) => {
    if (!selectedManuscript) return;
    const nextList = flaggedList.map((m) =>
      m.id === selectedManuscript.id
        ? { ...m, flaggedReason: nextReason, lastUpdated: new Date().toISOString().slice(0, 10) }
        : m
    );
    setFlaggedList(nextList);
    saveFlaggedManuscripts(nextList);
  };

  const linkedStory = useMemo(
    () => stories.find((s) => s.id === selectedManuscript?.linkedStoryId),
    [stories, selectedManuscript?.linkedStoryId]
  );
  const linkedChapter = useMemo(
    () => linkedStory?.chapters.find((c) => c.id === selectedManuscript?.linkedChapterId),
    [linkedStory, selectedManuscript?.linkedChapterId]
  );
  const linkedVersion = useMemo(
    () => linkedChapter?.versions.find((v) => v.id === selectedManuscript?.linkedVersionId),
    [linkedChapter, selectedManuscript?.linkedVersionId]
  );

  const canViewLinkedChapter = Boolean(selectedManuscript?.linkedStoryId && selectedManuscript?.linkedChapterId && selectedManuscript?.linkedVersionId && linkedVersion);

  const linkedScopeKey = useMemo(() => {
    if (!selectedManuscript?.linkedStoryId || !selectedManuscript?.linkedChapterId || !selectedManuscript?.linkedVersionId) return '';
    return makeStoryScopeKey({
      storyId: selectedManuscript.linkedStoryId,
      chapterId: selectedManuscript.linkedChapterId,
      versionId: selectedManuscript.linkedVersionId,
    });
  }, [selectedManuscript?.linkedStoryId, selectedManuscript?.linkedChapterId, selectedManuscript?.linkedVersionId]);

  const openViewDialog = () => {
    if (!selectedManuscript) return;
    if (!canViewLinkedChapter) {
      alert('This case is missing a linked story/chapter/version. Staff cannot choose content to view. Please mark as "Needs Review" and request a relink.');
      return;
    }
    const scopeKeyForAudit = makeStoryScopeKey({
      storyId: selectedManuscript.linkedStoryId!,
      chapterId: selectedManuscript.linkedChapterId!,
      versionId: selectedManuscript.linkedVersionId!,
    });

    // actor identity from Profile localStorage (best-effort)
    let actorName = 'Staff';
    let actorEmail = 'staff@example.com';
    try {
      const raw = localStorage.getItem('storynest_profile');
      if (raw) {
        const p = JSON.parse(raw) as any;
        if (p?.name) actorName = String(p.name);
        if (p?.email) actorEmail = String(p.email);
      }
    } catch {
      // ignore
    }

    appendStaffAuditEvent({
      actorName,
      actorEmail,
      action: 'view_flagged_chapter',
      scopeKey: scopeKeyForAudit,
      at: new Date().toISOString(),
    });

    setViewOpen(true);
  };

  // Policy: staff cannot link/select chapter/version. Link is set by system when creating the flagged case.

  const existingOverride = useMemo(() => {
    const store = loadAnalysisOverrides();
    return linkedScopeKey ? store[linkedScopeKey] : undefined;
  }, [linkedScopeKey, adjustOpen]);

  const parseCharacterFrequency = (text: string): AnalysisCharacterFrequency[] => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const result: AnalysisCharacterFrequency[] = [];
    for (const line of lines) {
      const parts = line.includes(':') ? line.split(':') : line.split(',');
      const name = (parts[0] || '').trim();
      const count = Number((parts[1] || '').trim());
      if (!name || !Number.isFinite(count) || count < 0) continue;
      result.push({ name, count: Math.floor(count) });
    }
    return result;
  };

  const openAdjustDialog = () => {
    if (!selectedManuscript) return;
    if (!canViewLinkedChapter || !linkedScopeKey) {
      alert('This case is missing a linked story/chapter/version. Staff cannot adjust analysis without a link. Please mark as "Needs Review" and request a relink.');
      return;
    }
    setAdjustOpen(true);
  };

  useEffect(() => {
    if (!adjustOpen) return;
    if (existingOverride) {
      setOverrideEmotion(existingOverride.dominantEmotion || '');
      setOverrideAvgWords(
        typeof existingOverride.avgWordsPerScene === 'number' ? String(existingOverride.avgWordsPerScene) : ''
      );
      setOverrideCharactersText(
        (existingOverride.characterFrequency || []).map((c) => `${c.name}: ${c.count}`).join('\n')
      );
      setOverrideNote(existingOverride.note || '');
    } else {
      setOverrideEmotion('');
      setOverrideAvgWords('');
      setOverrideCharactersText('');
      setOverrideNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustOpen, linkedScopeKey]);

  return (
    <DefaultLayout title="Staff Desk" role="staff">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Top summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="metric" className="hover-lift">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Flagged Manuscripts</p>
                <p className="text-3xl font-bold text-foreground font-serif">{flaggedList.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card variant="metric" className="hover-lift">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Needs Review</p>
                <p className="text-3xl font-bold text-foreground font-serif">
                  {flaggedList.filter(f => f.status === 'needs-review').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <FileSearch className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card variant="metric" className="hover-lift">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                <p className="text-3xl font-bold text-foreground font-serif">
                  {flaggedList.filter(f => f.status === 'resolved').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cases</h3>
            <p className="text-sm text-muted-foreground">Review flagged cases and support authors.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/staff/cms')}>
            Open Content (FAQs & Tips)
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Flagged list */}
              <Card variant="elevated" className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Flagged manuscripts</CardTitle>
                    <CardDescription>Cases that require staff review</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-secondary/30">
                      {flaggedList.length} items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {flaggedList.map((item) => {
                    const isActive = selectedManuscriptId === item.id;
                    const status = statusConfig[item.status];
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          isActive ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30 hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedManuscriptId(item.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{item.title}</p>
                              <Badge variant="outline" className={status.className}>{status.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Author: {item.author}</p>
                            <p className="text-sm text-foreground mt-2">{item.flaggedReason}</p>
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            <p>ID: {item.id}</p>
                            <p>Updated: {new Date(item.lastUpdated).toLocaleDateString('en-US')}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Case detail */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Case detail</CardTitle>
                  <CardDescription>Review, update status, and send feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedManuscript ? (
                    <>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-sm text-muted-foreground">Viewing</p>
                        <p className="font-medium text-foreground">{selectedManuscript.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Author: {selectedManuscript.author}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Linked chapter (read-only)</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              openViewDialog();
                            }}
                          >
                            <BookOpen className="w-4 h-4" />{' '}
                            Open linked chapter
                          </Button>
                          {!canViewLinkedChapter && (
                            <Button variant="outline" size="sm" onClick={markNeedsRelink}>
                              Mark needs relink
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {canViewLinkedChapter
                            ? 'Staff can only view the linked chapter/version. Each view is audited.'
                            : 'No linked scope is available for this case. Staff cannot choose content to view.'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Flag status</p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Select value={statusDraft} onValueChange={(v) => setStatusDraft(v as FlagStatus)}>
                            <SelectTrigger className="sm:w-56">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="needs-review">Needs Review</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            className="sm:ml-auto"
                            onClick={() => updateSelectedStatus(statusDraft)}
                            disabled={!selectedManuscript || statusDraft === selectedManuscript.status}
                          >
                            Update status
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Flag reason</p>
                        <Textarea
                          value={reasonDraft}
                          onChange={(e) => setReasonDraft(e.target.value)}
                          className="min-h-[90px]"
                          placeholder="Describe why this manuscript was flagged..."
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSelectedReason(reasonDraft)}
                            disabled={!selectedManuscript || reasonDraft.trim() === selectedManuscript.flaggedReason.trim()}
                          >
                            Update reason
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">Manual feedback to author</p>
                        </div>
                        <Textarea
                          placeholder="Enter detailed feedback for the author..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setFeedback('')}>
                            Clear
                          </Button>
                          <Button variant="gradient" size="sm" disabled={!feedback.trim()}>
                            Send feedback
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border bg-secondary/30 p-3">
                        <p className="text-sm font-medium text-foreground mb-2">Technical actions</p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewAiOpen(true)}>
                            <Info className="w-4 h-4" /> View AI details
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2" onClick={openAdjustDialog}>
                            <Pencil className="w-4 h-4" /> Adjust analysis (override)
                          </Button>
                          <Button variant="gradient" size="sm" className="gap-2">
                            <RefreshCw className="w-4 h-4" /> Re-run analysis
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Use overrides only for incomplete/incorrect analysis outputs. Do not edit manuscript content.
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a case to take action.</p>
                  )}
                </CardContent>
              </Card>
        </div>

        {/* Adjust analysis override (scoped to the linked chapter/version only) */}
        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adjust analysis (override)</DialogTitle>
              <DialogDescription>
                Override key AI metrics for the linked chapter/version. Authors will see the adjusted values in Analysis (marked as “Adjusted”).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">Linked scope</p>
                <p className="text-sm font-medium text-foreground">
                  {linkedStory?.title || '—'} — {linkedChapter?.title || '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Version: {linkedVersion ? `v${linkedVersion.version} — ${linkedVersion.label}` : '—'}
                </p>
                <p className="text-[11px] text-muted-foreground break-all mt-2">
                  Scope key: {linkedScopeKey || '—'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Dominant emotion (override)</p>
                  <Input
                    value={overrideEmotion}
                    onChange={(e) => setOverrideEmotion(e.target.value)}
                    placeholder="e.g. Tense"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Avg words / scene (override)</p>
                  <Input
                    value={overrideAvgWords}
                    onChange={(e) => setOverrideAvgWords(e.target.value)}
                    placeholder="e.g. 1200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Character frequency (override)</p>
                <Textarea
                  value={overrideCharactersText}
                  onChange={(e) => setOverrideCharactersText(e.target.value)}
                  placeholder={"Format:\nMinh: 4\nLinh: 2"}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  One per line. Use “Name: count”. This overrides the Characters table only.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Staff note (optional)</p>
                <Textarea
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="Why was this adjusted?"
                  className="min-h-[80px]"
                />
              </div>

              {existingOverride && (
                <div className="rounded-lg border bg-secondary/30 p-3 text-xs text-muted-foreground">
                  Existing override found for this scope (last updated: {new Date(existingOverride.updatedAt).toLocaleString('en-US')}).
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (linkedScopeKey) removeAnalysisOverride(linkedScopeKey);
                  setAdjustOpen(false);
                }}
                disabled={!existingOverride}
              >
                Remove override
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  if (!linkedScopeKey) {
                    setAdjustOpen(false);
                    return;
                  }
                  const parsedAvg = overrideAvgWords.trim() ? Number(overrideAvgWords) : undefined;
                  const avgWords = typeof parsedAvg === 'number' && Number.isFinite(parsedAvg) ? Math.round(parsedAvg) : undefined;
                  const characters = overrideCharactersText.trim()
                    ? parseCharacterFrequency(overrideCharactersText)
                    : undefined;

                  saveAnalysisOverride({
                    scopeKey: linkedScopeKey,
                    dominantEmotion: overrideEmotion.trim() || undefined,
                    avgWordsPerScene: avgWords,
                    characterFrequency: characters && characters.length ? characters : undefined,
                    note: overrideNote.trim() || undefined,
                    updatedAt: new Date().toISOString(),
                    updatedBy: 'staff',
                  });

                  setAdjustOpen(false);
                }}
              >
                Save override
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Read-only view of linked chapter + audit */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Flagged chapter (read-only)</DialogTitle>
              <DialogDescription>
                Viewing is limited to the linked chapter/version. No export/download controls are provided.
              </DialogDescription>
            </DialogHeader>

            {!canViewLinkedChapter ? (
              <div className="rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
                This flagged case is not linked to a specific chapter/version yet. Click “Link” first.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border bg-secondary/30 p-3">
                  <p className="text-sm font-medium text-foreground">
                    {linkedStory?.title} — {linkedChapter?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Version: v{linkedVersion?.version} — {linkedVersion?.label}
                  </p>
                </div>

                <div className="rounded-lg border bg-background p-4 max-h-[45vh] overflow-auto">
                  {/* Render as HTML (read-only). In a real app, enforce server-side access control. */}
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: linkedVersion?.content || '' }}
                  />
                </div>

                <div className="rounded-lg border bg-secondary/30 p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Audit log</p>
                  {(() => {
                    const auditScopeKey = makeStoryScopeKey({
                      storyId: selectedManuscript!.linkedStoryId!,
                      chapterId: selectedManuscript!.linkedChapterId!,
                      versionId: selectedManuscript!.linkedVersionId!,
                    });
                    const events = getStaffAuditForScope(auditScopeKey).slice(0, 10);
                    if (!events.length) {
                      return <p className="text-sm text-muted-foreground">No views logged yet.</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {events.map((e) => (
                          <div key={e.id} className="flex items-center justify-between text-xs">
                            <span className="text-foreground">
                              {e.actorName} ({e.actorEmail})
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(e.at).toLocaleString('en-US')}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI details modal (read-only) */}
        <Dialog open={viewAiOpen} onOpenChange={setViewAiOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>AI details</DialogTitle>
              <DialogDescription>
                Summary of the latest analysis for this case. This is read-only and does not expose manuscript editing.
              </DialogDescription>
            </DialogHeader>
            {selectedManuscript ? (
              (() => {
                const detail = mockAiDetails[selectedManuscript.id];
                if (!detail) {
                  return (
                    <div className="rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
                      No AI detail available for this case.
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm font-medium text-foreground">{detail.status}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Last run</p>
                        <p className="text-sm font-medium text-foreground">{detail.lastRun}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Dominant emotion</p>
                        <p className="text-sm font-medium text-foreground">{detail.emotion}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Pacing</p>
                        <p className="text-sm font-medium text-foreground">{detail.pacing}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Scenes</p>
                        <p className="text-sm font-medium text-foreground">{detail.scenes}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Words / scene</p>
                        <p className="text-sm font-medium text-foreground">{detail.avgWords.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-secondary/30 sm:col-span-2">
                        <p className="text-xs text-muted-foreground">Characters</p>
                        <p className="text-sm font-medium text-foreground">{detail.characters}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-secondary/30 p-4">
                      <p className="text-xs text-muted-foreground mb-1">Summary / notes</p>
                      <p className="text-sm text-foreground">{detail.summary}</p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
                Select a case first.
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setViewAiOpen(false);
                  openAdjustDialog();
                }}
                disabled={!canViewLinkedChapter}
              >
                Adjust analysis
              </Button>
              <Button variant="outline" onClick={() => setViewAiOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DefaultLayout>
  );
}


import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  FolderOpen
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockManuscripts } from '@/utils/mockData';

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    completed: { 
      label: 'Completed', 
      className: 'bg-success/10 text-success border-success/20',
      icon: <CheckCircle2 className="w-3 h-3" />
    },
    processing: { 
      label: 'Processing', 
      className: 'bg-info/10 text-info border-info/20',
      icon: <Clock className="w-3 h-3 animate-spin" />
    },
    pending: { 
      label: 'Pending', 
      className: 'bg-warning/10 text-warning border-warning/20',
      icon: <Clock className="w-3 h-3" />
    },
    failed: { 
      label: 'Failed', 
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: <AlertCircle className="w-3 h-3" />
    },
  };

  const variant = variants[status] || variants.pending;

  return (
    <Badge variant="outline" className={`${variant.className} flex items-center gap-1`}>
      {variant.icon}
      {variant.label}
    </Badge>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface SavedDraft {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
}

const STORAGE_KEY = 'storynest_drafts';

export default function UploadPage() {
  const [mode, setMode] = useState<'upload' | 'editor'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  
  // Editor states
  const [editorContent, setEditorContent] = useState('');
  const [currentDraftName, setCurrentDraftName] = useState('');
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

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

  const handleFiles = (files: File[]) => {
    const newFiles: UploadingFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadingFiles(prev => 
            prev.map(f => f.id === file.id ? { ...f, progress: 100, status: 'success' } : f)
          );
        } else {
          setUploadingFiles(prev => 
            prev.map(f => f.id === file.id ? { ...f, progress } : f)
          );
        }
      }, 200);
    });
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const drafts = JSON.parse(saved);
        setSavedDrafts(drafts);
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    }
  }, []);

  const saveDraft = () => {
    if (!currentDraftName.trim()) {
      alert('Vui lòng nhập tên file');
      return;
    }

    const draft: SavedDraft = {
      id: selectedDraftId || Date.now().toString(),
      name: currentDraftName.trim(),
      content: editorContent,
      updatedAt: new Date().toISOString()
    };

    let updatedDrafts: SavedDraft[];
    if (selectedDraftId) {
      updatedDrafts = savedDrafts.map(d => d.id === selectedDraftId ? draft : d);
    } else {
      const existingDraft = savedDrafts.find(d => d.name === draft.name);
      if (existingDraft) {
        if (!confirm(`File "${draft.name}" đã tồn tại. Bạn có muốn ghi đè không?`)) {
          return;
        }
        updatedDrafts = savedDrafts.map(d => d.id === existingDraft.id ? draft : d);
        setSelectedDraftId(existingDraft.id);
      } else {
        updatedDrafts = [...savedDrafts, draft];
        setSelectedDraftId(draft.id);
      }
    }

    setSavedDrafts(updatedDrafts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrafts));
    alert('Đã lưu thành công!');
  };

  const loadDraft = (draftId: string) => {
    const draft = savedDrafts.find(d => d.id === draftId);
    if (draft) {
      setEditorContent(draft.content);
      setCurrentDraftName(draft.name);
      setSelectedDraftId(draftId);
    }
  };

  const deleteDraft = (draftId: string) => {
    const draft = savedDrafts.find(d => d.id === draftId);
    if (draft && confirm(`Bạn có chắc muốn xóa "${draft.name}"?`)) {
      const updatedDrafts = savedDrafts.filter(d => d.id !== draftId);
      setSavedDrafts(updatedDrafts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrafts));
      
      if (selectedDraftId === draftId) {
        setEditorContent('');
        setCurrentDraftName('');
        setSelectedDraftId(null);
      }
    }
  };
  
  const createNewDraft = () => {
    if (editorContent.trim() && !confirm('Bạn có muốn tạo file mới? Nội dung hiện tại sẽ bị xóa.')) {
      return;
    }
    setEditorContent('');
    setCurrentDraftName('');
    setSelectedDraftId(null);
  };

  return (
    <DefaultLayout title="Upload Manuscript" role="author">
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
                Upload File
              </Button>
              <Button
                variant={mode === 'editor' ? 'default' : 'outline'}
                onClick={() => setMode('editor')}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Direct Editor
              </Button>
            </div>
          </CardContent>
        </Card>

        {mode === 'upload' ? (
          <>
            {/* Upload Zone */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Upload New Manuscript</CardTitle>
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

        {/* Manuscripts List */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Your Manuscripts</CardTitle>
            <CardDescription>
              List of all uploaded manuscripts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Manuscript Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Format</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Size</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Upload Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockManuscripts.map((manuscript, index) => (
                    <motion.tr
                      key={manuscript.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{manuscript.title}</p>
                            <p className="text-xs text-muted-foreground">v{manuscript.version}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="uppercase">
                          {manuscript.fileType}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {formatFileSize(manuscript.fileSize)}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(manuscript.uploadedAt).toLocaleDateString('en-US')}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={manuscript.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {manuscript.status === 'completed' && (
                            <Button variant="ghost" size="icon" title="Analyze">
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
          </>
        ) : (
          <>
            {/* Editor Mode */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Story Editor</CardTitle>
                    <CardDescription>
                      Write and edit stories directly in your browser
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createNewDraft}
                    >
                      <FilePlus className="w-4 h-4 mr-2" />
                      New File
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={saveDraft}
                      disabled={!currentDraftName.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Name Input */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={currentDraftName}
                    onChange={(e) => setCurrentDraftName(e.target.value)}
                    placeholder="Enter file name (e.g., My Story)"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Text Editor */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Content
                  </label>
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Start writing your story here..."
                    className="w-full h-96 px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                  />
                  <div className="mt-2 text-xs text-muted-foreground text-right">
                    {editorContent.length} characters
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Drafts List */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Saved Files</CardTitle>
                <CardDescription>
                  List of saved files, you can reopen them to continue editing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedDrafts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No files saved yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedDrafts.map((draft) => (
                      <motion.div
                        key={draft.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                          flex items-center justify-between p-4 rounded-lg border transition-colors
                          ${selectedDraftId === draft.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-secondary/30'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{draft.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(draft.updatedAt).toLocaleString('en-US')} • {draft.content.length} characters
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => loadDraft(draft.id)}
                            title="Open file"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => deleteDraft(draft.id)}
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </DefaultLayout>
  );
}

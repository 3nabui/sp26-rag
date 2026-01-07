import { useState, useCallback } from 'react';
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
  BarChart3
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
      label: 'Hoàn thành', 
      className: 'bg-success/10 text-success border-success/20',
      icon: <CheckCircle2 className="w-3 h-3" />
    },
    processing: { 
      label: 'Đang xử lý', 
      className: 'bg-info/10 text-info border-info/20',
      icon: <Clock className="w-3 h-3 animate-spin" />
    },
    pending: { 
      label: 'Chờ xử lý', 
      className: 'bg-warning/10 text-warning border-warning/20',
      icon: <Clock className="w-3 h-3" />
    },
    failed: { 
      label: 'Lỗi', 
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

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

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

  return (
    <DefaultLayout title="Upload Bản Thảo" role="author">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Upload Zone */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Upload bản thảo mới</CardTitle>
            <CardDescription>
              Hỗ trợ các định dạng: TXT, DOCX, PDF (Tối đa 50MB)
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
                    Kéo thả file vào đây
                  </p>
                  <p className="text-sm text-muted-foreground">
                    hoặc <span className="text-primary font-medium">nhấn để chọn file</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Đang tải lên</p>
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
            <CardTitle>Bản thảo của bạn</CardTitle>
            <CardDescription>
              Danh sách tất cả bản thảo đã upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tên bản thảo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Định dạng</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Kích thước</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ngày upload</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Trạng thái</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Hành động</th>
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
                        {new Date(manuscript.uploadedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={manuscript.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Xem">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {manuscript.status === 'completed' && (
                            <Button variant="ghost" size="icon" title="Phân tích">
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive" title="Xóa">
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
      </motion.div>
    </DefaultLayout>
  );
}

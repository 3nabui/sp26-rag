import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  MoreHorizontal, 
  Search, 
  Settings, 
  HelpCircle,
  Trash2,
  Edit,
  FolderOpen,
  FileText
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

// Mock project data
interface Project {
  id: string;
  title: string;
  description?: string;
  wordCount: number;
  updatedAt: string;
  createdAt: string;
  coverImage?: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Bóng Tối Dưới Ánh Trăng',
    description: 'Một câu chuyện trinh thám ly kỳ',
    wordCount: 85000,
    updatedAt: 'Vừa xong',
    createdAt: '2024-12-15',
  },
  {
    id: '2',
    title: 'Những Ngày Mưa Phương Nam',
    description: 'Tiểu thuyết tình cảm',
    wordCount: 62000,
    updatedAt: '2 ngày trước',
    createdAt: '2024-12-20',
  },
  {
    id: '3',
    title: 'Hành Trình Vô Tận',
    description: 'Phiêu lưu hành động',
    wordCount: 120000,
    updatedAt: '1 tuần trước',
    createdAt: '2024-12-25',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function ProjectCard({ 
  project, 
  onOpen, 
  onEdit, 
  onDelete 
}: { 
  project: Project; 
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card 
        className="group relative cursor-pointer hover:shadow-xl transition-all duration-300 bg-white dark:bg-card border-0 shadow-lg overflow-hidden"
        onClick={onOpen}
      >
        {/* Project Menu */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(); }}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Mở project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="p-6 flex flex-col items-center text-center min-h-[280px]">
          {/* Cover Image Placeholder */}
          <div className="w-full h-32 mb-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
            <FileText className="w-12 h-12 text-primary/40" />
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2 line-clamp-2">
            {project.title}
          </h3>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-auto text-sm text-muted-foreground">
            <p>{project.wordCount.toLocaleString()} từ</p>
            <p className="text-xs">{project.updatedAt}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.div variants={itemVariants}>
      <Card 
        className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-primary/30 hover:border-primary/50 bg-gradient-to-br from-primary/5 to-transparent min-h-[280px] flex items-center justify-center"
        onClick={onClick}
      >
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
            Tạo Project Mới
          </h3>
          <p className="text-sm text-muted-foreground">
            Bắt đầu một tác phẩm mới
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    if (newProject.title.trim()) {
      const project: Project = {
        id: Date.now().toString(),
        title: newProject.title,
        description: newProject.description,
        wordCount: 0,
        updatedAt: 'Vừa xong',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProjects([project, ...projects]);
      setNewProject({ title: '', description: '' });
      setIsCreateDialogOpen(false);
    }
  };

  const handleUploadProject = () => {
    if (uploadFile) {
      const project: Project = {
        id: Date.now().toString(),
        title: uploadFile.name.replace(/\.[^/.]+$/, ''),
        description: 'Imported project',
        wordCount: Math.floor(Math.random() * 50000) + 10000,
        updatedAt: 'Vừa xong',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProjects([project, ...projects]);
      setUploadFile(null);
      setIsUploadDialogOpen(false);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleOpenProject = (projectId: string) => {
    // Navigate to project editor
    navigate(`/author/project/${projectId}`);
  };

  return (
    <DefaultLayout title="Projects" role="author">
      {/* Gradient Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #fde2d4 0%, #fcd5ce 25%, #f8d5dd 50%, #e8d5eb 75%, #d5d5f5 100%)'
        }}
      />

      <div className="relative min-h-screen">
        {/* Header Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          {/* Left Actions */}
          <div className="flex items-center gap-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="gap-2 text-foreground hover:bg-white/50">
                  <Plus className="w-4 h-4" />
                  Tạo mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-serif">Tạo Project Mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin cho tác phẩm mới của bạn
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Tên tác phẩm</Label>
                    <Input
                      id="title"
                      placeholder="Nhập tên tác phẩm..."
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả ngắn về tác phẩm..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateProject}>Tạo Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="gap-2 text-foreground hover:bg-white/50">
                  <Upload className="w-4 h-4" />
                  Import Novel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-serif">Import Novel</DialogTitle>
                  <DialogDescription>
                    Tải lên file tác phẩm của bạn (.docx, .pdf, .txt)
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div 
                    className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto text-primary/40 mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {uploadFile ? uploadFile.name : 'Kéo thả file hoặc click để chọn'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hỗ trợ: .docx, .pdf, .txt
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".docx,.pdf,.txt"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleUploadProject} disabled={!uploadFile}>
                    Import
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Center - Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="font-serif text-2xl font-bold text-foreground">StoryNest</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-white/50">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/50">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/50">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm project..."
              className="pl-10 bg-white/70 border-0 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4"
        >
          {/* Create Project Card */}
          <CreateProjectCard onClick={() => setIsCreateDialogOpen(true)} />

          {/* Project Cards */}
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => handleOpenProject(project.id)}
                onEdit={() => {/* TODO: Edit dialog */}}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProjects.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              Không tìm thấy project nào với từ khóa "{searchQuery}"
            </p>
          </motion.div>
        )}
      </div>
    </DefaultLayout>
  );
}

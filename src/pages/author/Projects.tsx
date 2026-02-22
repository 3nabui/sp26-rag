import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { toast } from 'sonner';
import { projectApi, ProjectResponse } from '@/lib/api';
import { deleteProject } from '@/services/projectService';

interface Project {
  id: string;
  title: string;
  description?: string;
  updatedAt: string;
  createdAt: string;
  coverImage?: string;
}

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
            <p className="text-sm text-muted-foreground mt-auto line-clamp-2">
              {project.description}
            </p>
          )}
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editDetail, setEditDetail] = useState<ProjectResponse | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectApi.getMyProjects();
      const items = (res.data || []).map((p: ProjectResponse & { UpdatedAt?: string }) => {
        // Backend returns projectId or id, handle both
        const id = String(p.projectId || p.id || '');
        const updatedAt = p.UpdatedAt || p.updatedAt || '';
        return {
          id: id,
          title: p.title || 'Untitled',
          description: p.summary || p.description || '',
          updatedAt: updatedAt,
          createdAt: p.createdAt || '',
          coverImage: p.coverImage || undefined,
        };
      });
      // Sort by createdAt descending (newest first)
      items.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setProjects(items);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải project';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) reload();
    return () => { mounted = false; };
  }, []);

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        title: newProject.title,
        summary: newProject.description || '',
      };
      await projectApi.createProject(payload);
      // Reload projects from server to avoid duplicates
      await reload();
      setNewProject({ title: '', description: '' });
      setIsCreateDialogOpen(false);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tạo project';
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      toast.success('Đã xóa project thành công');
      await reload();
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xóa project';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    // Navigate to project editor
    navigate(`/author/project/${projectId}`);
  };

  const handleOpenEdit = async (project: Project) => {
    setEditingProject(project);
    setEditForm({ title: project.title, description: project.description || '' });
    setUpdateError(null);
    try {
      // Fetch full project detail
      const res = await projectApi.getProjectDetail(project.id);
      setEditDetail(res.data);
    } catch (err) {
      console.error('Error fetching project detail:', err);
      // If getProjectDetail fails, use local data as fallback
      setEditDetail({
        id: project.id,
        title: project.title,
        summary: project.description,
        status: 'draft',
      } as ProjectResponse);
      setUpdateError('');
    }
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editDetail) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      // Send complete payload with all fields
      const payload: { title: string; summary: string; status: string; coverImageUrl?: string } = {
        title: editForm.title || editDetail.title,
        summary: editForm.description || editDetail.summary || '',
        status: (editDetail.status || 'Draft').charAt(0).toUpperCase() + (editDetail.status || 'Draft').slice(1).toLowerCase(),
      };
      
      // Only add coverImageUrl if it has a value
      if (editDetail.coverImageUrl) {
        payload.coverImageUrl = editDetail.coverImageUrl;
      }
      
      console.log('Updating project with payload:', payload);
      await projectApi.updateProject(editingProject.id, payload);
      // Reload projects from server to get latest data
      await reload();
      setIsEditDialogOpen(false);
      setEditingProject(null);
      setEditDetail(null);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật project';
      console.error('Update error:', message);
      setUpdateError(message);
    } finally {
      setUpdating(false);
    }
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
                {createError && (
                  <div className="text-destructive text-sm px-6">{createError}</div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={creating}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateProject} disabled={creating}>
                    {creating ? 'Đang tạo...' : 'Tạo Project'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-serif">Chỉnh sửa Project</DialogTitle>
                  <DialogDescription>
                    Cập nhật thông tin tác phẩm
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">Tên tác phẩm</Label>
                    <Input
                      id="edit-title"
                      placeholder="Nhập tên tác phẩm..."
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Mô tả (tùy chọn)</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Mô tả ngắn về tác phẩm..."
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                </div>
                {updateError && (
                  <div className="text-destructive text-sm px-6">{updateError}</div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingProject(null); }} disabled={updating}>
                    Hủy
                  </Button>
                  <Button onClick={handleUpdateProject} disabled={updating}>
                    {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
              if (!open && !deleting) {
                setIsDeleteDialogOpen(false);
                setProjectToDelete(null);
              }
            }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa project &quot;{projectToDelete?.title}&quot;? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => { e.preventDefault(); handleConfirmDelete(); }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting ? 'Đang xóa...' : 'Xóa'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

        {/* Projects Grid / Loading / Error */}
        {loading ? (
          <div className="text-center py-12">Đang tải dự án...</div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={reload}>Thử lại</Button>
          </div>
        ) : (
          <>
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
                    onEdit={() => handleOpenEdit(project)}
                    onDelete={() => handleDeleteProject(project)}
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

            {filteredProjects.length === 0 && !searchQuery && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <p className="text-muted-foreground">Chưa có project nào — hãy tạo project mới.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
}

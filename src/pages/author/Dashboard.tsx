import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Lightbulb,
  FolderOpen
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockWritingTips } from '@/utils/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { projectApi, ProjectResponse, chapterApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up' 
}: { 
  title: string; 
  value: string | number; 
  change?: number; 
  icon: React.ElementType; 
  trend?: 'up' | 'down';
}) {
  return (
    <Card variant="metric" className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground font-serif">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                <TrendingUp className={`w-4 h-4 ${trend === 'down' && 'rotate-180'}`} />
                <span>{change}% from last week</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'bg-success/10 text-success border-success/20' },
    processing: { label: 'Processing', className: 'bg-info/10 text-info border-info/20' },
    pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
    failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  };

  const variant = variants[status] || variants.pending;

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

export default function AuthorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalChapters: 0,
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const res = await projectApi.getMyProjects();
        if (res.data && Array.isArray(res.data)) {
          // First, set projects immediately with basic info (no blocking)
          const basicProjects: ProjectResponse[] = res.data.map((p: any) => ({
            id: String(p.id || p.projectId || ''),
            projectId: p.id || p.projectId,
            title: p.title || '',
            description: p.description,
            summary: p.summary,
            wordCount: p.wordCount || 0,
            totalChapters: p.totalChapters || 0, // Use from API if available, will update later
            status: p.status || 'Draft',
            updatedAt: p.updatedAt,
            createdAt: p.createdAt,
          }));
          
          setProjects(basicProjects);
          setLoading(false); // Show projects immediately
          
          // Then fetch chapters count in background (non-blocking)
          const projectsWithChapters = await Promise.all(
            res.data.map(async (p: any) => {
              const projectId = p.id || p.projectId;
              let chapterCount = p.totalChapters || 0;
              
              // Fetch chapters to get actual count
              if (projectId) {
                try {
                  const chaptersRes = await chapterApi.getChaptersByProject(projectId);
                  if (chaptersRes.data && Array.isArray(chaptersRes.data)) {
                    chapterCount = chaptersRes.data.length;
                  }
                } catch (err) {
                  console.error(`Error loading chapters for project ${projectId}:`, err);
                  // Keep the original value
                }
              }
              
              return {
                id: String(projectId || ''),
                projectId: projectId,
                title: p.title || '',
                description: p.description,
                summary: p.summary,
                wordCount: p.wordCount || 0,
                totalChapters: chapterCount,
                status: p.status || 'Draft',
                updatedAt: p.updatedAt,
                createdAt: p.createdAt,
              };
            })
          );
          
          // Update with accurate chapter counts
          setProjects(projectsWithChapters);
          
          // Calculate stats
          const totalProjects = projectsWithChapters.length;
          const totalChapters = projectsWithChapters.reduce((sum, p) => sum + (p.totalChapters || 0), 0);
          
          setStats({
            totalProjects,
            totalChapters,
          });
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        toast.error('Không thể tải danh sách dự án');
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const userName = user?.fullName || 'Author';
  const recentProjects = projects.slice(0, 5);

  return (
    <DefaultLayout title="Dashboard" role="author">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <Card variant="gradient" className="overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                    Chào mừng, {userName}! 👋
                  </h2>
                  <p className="text-muted-foreground max-w-lg">
                    Bạn có {projects.length} dự án đang thực hiện. 
                    Hãy tiếp tục sáng tạo và phát triển tác phẩm của bạn!
                  </p>
                </div>
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/author/projects">
                    <FolderOpen className="w-5 h-5 mr-2" />
                    Quản lý Dự án
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard 
            title="Tổng Dự án" 
            value={loading ? '...' : stats.totalProjects} 
            icon={FolderOpen} 
          />
          <MetricCard 
            title="Tổng Chương" 
            value={loading ? '...' : stats.totalChapters} 
            icon={FileText} 
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dự án Gần đây</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/author/projects">
                    Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Đang tải...</p>
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Chưa có dự án nào</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/author/projects">
                        Tạo dự án mới
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProjects.map((project, index) => {
                      const projectId = String(project.projectId || project.id || '');
                      return (
                        <motion.div
                          key={projectId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          onClick={() => navigate(`/author/project/${projectId}`)}
                          className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <FolderOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{project.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.totalChapters || 0} chương
                            </p>
                          </div>
                          {/* Chỉ hiển thị status nếu là Published hoặc Completed, không hiển thị Draft */}
                          {project.status && (project.status === 'Published' || project.status === 'Completed') && (
                            <Badge variant="outline" className="capitalize">
                              {project.status === 'Published' ? 'Đã xuất bản' : 'Đã hoàn thành'}
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Writing Tips */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Mẹo Viết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWritingTips.map((tip, index) => (
                    <div 
                      key={tip.id} 
                      className="p-3 rounded-lg bg-secondary/30 border-l-2 border-primary"
                    >
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {tip.category}
                      </Badge>
                      <h5 className="font-medium text-foreground text-sm mb-1">{tip.title}</h5>
                      <p className="text-xs text-muted-foreground">{tip.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Thao tác Nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/author/projects">
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Quản lý Dự án
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/author/analysis">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Phân tích AI
                    </Link>
                  </Button>
                  {/* Đã loại bỏ nút Chat với AI khỏi Dashboard theo yêu cầu */}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DefaultLayout>
  );
}

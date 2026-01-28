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
  Lightbulb
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockManuscripts, mockDashboardStats, mockWritingTips } from '@/utils/mockData';
import { Link } from 'react-router-dom';

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
                    Good Morning, John! 👋
                  </h2>
                  <p className="text-muted-foreground max-w-lg">
                    You have 2 new manuscripts to review and 1 completed analysis. 
                    Start your day with creative ideas!
                  </p>
                </div>
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/author/upload">
                    <Sparkles className="w-5 h-5" />
                    Upload New Manuscript
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Manuscripts" 
            value={mockDashboardStats.totalManuscripts} 
            change={mockDashboardStats.weeklyChange.manuscripts}
            icon={FileText} 
          />
          <MetricCard 
            title="Analyzed" 
            value={mockDashboardStats.analyzedManuscripts} 
            change={mockDashboardStats.weeklyChange.analysis}
            icon={BarChart3} 
          />
          <MetricCard 
            title="Total Words" 
            value={`${(mockDashboardStats.totalWords / 1000).toFixed(0)}K`} 
            change={mockDashboardStats.weeklyChange.words}
            icon={BookOpen} 
          />
          <MetricCard 
            title="Words/Chapter Avg" 
            value={mockDashboardStats.avgChapterLength.toLocaleString()} 
            icon={Clock} 
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Manuscripts */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Manuscripts</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/author/upload">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockManuscripts.map((manuscript, index) => (
                    <motion.div
                      key={manuscript.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{manuscript.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {manuscript.chapters} chapters • {(manuscript.words! / 1000).toFixed(0)}K words
                        </p>
                      </div>
                      <StatusBadge status={manuscript.status} />
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick AI Query */}
            <Card variant="interactive" className="gradient-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quick AI Query
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask questions about your manuscript and get instant analysis.
                </p>
                <Button variant="gradient" className="w-full" asChild>
                  <Link to="/author/chatbot">
                    Start Chatting
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Writing Tips
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

            {/* Character Summary */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Featured Characters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Minh', 'Linh', 'Hùng', 'Bà Tư', 'Đức'].map((name, index) => (
                    <div 
                      key={name}
                      className="px-3 py-2 rounded-full bg-secondary/50 text-sm text-foreground border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DefaultLayout>
  );
}

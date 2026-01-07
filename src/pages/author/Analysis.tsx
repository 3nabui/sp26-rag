import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Heart, 
  Zap, 
  TrendingUp,
  BookOpen,
  Info
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { mockAnalysisResult, mockManuscripts } from '@/utils/mockData';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';

const COLORS = {
  primary: '#f59e0b',
  accent: '#14b8a6',
  success: '#22c55e',
  info: '#0ea5e9',
  warning: '#f59e0b',
  destructive: '#ef4444',
};

// Prepare pacing data
const pacingData = Array.from({ length: 24 }, (_, i) => {
  const chapter = i + 1;
  let pacing: 'slow' | 'medium' | 'fast' = 'medium';
  let value = 50;

  if (mockAnalysisResult.pacing.slow.includes(chapter)) {
    pacing = 'slow';
    value = 25;
  } else if (mockAnalysisResult.pacing.fast.includes(chapter)) {
    pacing = 'fast';
    value = 85;
  }

  return { chapter, pacing, value };
});

// Prepare emotion data
const emotionData = mockAnalysisResult.emotionFlow;

// Prepare character data
const characterData = mockAnalysisResult.characters.map(char => ({
  name: char.name,
  appearances: char.appearances,
  role: char.role,
}));

// Character relation data for radar chart
const relationData = mockAnalysisResult.characterRelations.map(rel => ({
  subject: `${rel.character1}-${rel.character2}`,
  relationship: rel.relationship,
  strength: rel.strength,
}));

function PacingLegend() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-success" />
        <span className="text-muted-foreground">Chậm</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-info" />
        <span className="text-muted-foreground">Vừa</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-warning" />
        <span className="text-muted-foreground">Nhanh</span>
      </div>
    </div>
  );
}

const getPacingColor = (pacing: string) => {
  switch (pacing) {
    case 'slow': return COLORS.success;
    case 'fast': return COLORS.warning;
    default: return COLORS.info;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">Chương {label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} className="text-sm text-muted-foreground">
            {p.name}: <span className="font-medium text-foreground">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalysisPage() {
  const [selectedManuscript] = useState(mockManuscripts[0]);
  const summary = mockAnalysisResult.summary;

  return (
    <DefaultLayout title="Phân Tích" role="author">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">{selectedManuscript.title}</h2>
            <p className="text-muted-foreground mt-1">
              Phân tích chi tiết bản thảo của bạn
            </p>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Hoàn thành phân tích
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="metric">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{summary.totalChapters}</p>
                  <p className="text-xs text-muted-foreground">Tổng chương</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="metric">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{(summary.totalWords / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Tổng số từ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="metric">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{summary.averageWordsPerChapter.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Từ/chương TB</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="metric">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{summary.writingStyle}</p>
                  <p className="text-xs text-muted-foreground">Phong cách viết</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="pacing" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="pacing" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Nhịp độ
            </TabsTrigger>
            <TabsTrigger value="emotion" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Cảm xúc
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Nhân vật
            </TabsTrigger>
            <TabsTrigger value="relations" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Mối quan hệ
            </TabsTrigger>
          </TabsList>

          {/* Pacing Tab */}
          <TabsContent value="pacing">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Phân tích nhịp độ</CardTitle>
                    <CardDescription>Nhịp độ câu chuyện qua từng chương</CardDescription>
                  </div>
                  <PacingLegend />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pacingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="chapter" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `Ch.${value}`}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Nhịp độ" radius={[4, 4, 0, 0]}>
                        {pacingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getPacingColor(entry.pacing)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emotion Tab */}
          <TabsContent value="emotion">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Dòng chảy cảm xúc</CardTitle>
                <CardDescription>Cường độ cảm xúc qua từng chương</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emotionData}>
                      <defs>
                        <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="chapter" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `Ch.${value}`}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="intensity" 
                        name="Cường độ"
                        stroke={COLORS.accent} 
                        fillOpacity={1} 
                        fill="url(#emotionGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {emotionData.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      Ch.{item.chapter}: {item.emotion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Phân tích nhân vật</CardTitle>
                <CardDescription>Số lần xuất hiện và vai trò của nhân vật</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={characterData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        type="number" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="appearances" 
                        name="Lần xuất hiện"
                        fill={COLORS.primary} 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  {characterData.map((char) => (
                    <Card key={char.name} variant="glass" className="p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg font-medium text-primary">{char.name[0]}</span>
                      </div>
                      <p className="font-medium text-foreground text-sm">{char.name}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{char.role}</Badge>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relations Tab */}
          <TabsContent value="relations">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Mối quan hệ nhân vật</CardTitle>
                <CardDescription>Cường độ và loại mối quan hệ giữa các nhân vật</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={relationData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis 
                          dataKey="relationship" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                        />
                        <Radar
                          name="Cường độ"
                          dataKey="strength"
                          stroke={COLORS.primary}
                          fill={COLORS.primary}
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {mockAnalysisResult.characterRelations.map((rel, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-secondary/30 border-l-2 border-primary"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{rel.character1}</span>
                            <span className="text-muted-foreground">↔</span>
                            <span className="font-medium text-foreground">{rel.character2}</span>
                          </div>
                          <Badge variant="outline">{rel.relationship}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${rel.strength}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {rel.strength}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DefaultLayout>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  RefreshCw,
  Pencil,
  MessageSquare,
  Plus,
  Info,
  Wand2,
  BookOpen,
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

type FlagStatus = 'pending' | 'needs-review' | 'resolved';

interface FlaggedManuscript {
  id: string;
  title: string;
  author: string;
  flaggedReason: string;
  status: FlagStatus;
  lastUpdated: string;
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

const faqs = [
  {
    id: 'faq-1',
    question: 'How to improve pacing in climax scenes?',
    answer: 'Increase event frequency, shorten descriptions, and interweave dialogue.',
  },
  {
    id: 'faq-2',
    question: 'When should I introduce new characters?',
    answer: 'Only when the character serves the main plot or clarifies conflict.',
  },
];

const tips = [
  {
    id: 'tip-1',
    title: 'Maintain Consistent Narrative Voice',
    content: 'Ensure narrative perspective and point of view don\'t change abruptly between chapters.',
  },
  {
    id: 'tip-2',
    title: 'Place Hook at Chapter Start',
    content: 'Begin each chapter with a situation or question that sparks curiosity.',
  },
];

const statusConfig: Record<FlagStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  'needs-review': { label: 'Needs Review', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  resolved: { label: 'Resolved', className: 'bg-success/10 text-success border-success/20' },
};

export default function StaffReviewPage() {
  const [selectedManuscript, setSelectedManuscript] = useState<FlaggedManuscript | null>(flaggedManuscripts[0]);
  const [feedback, setFeedback] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [tipTitle, setTipTitle] = useState('');
  const [tipContent, setTipContent] = useState('');

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
                <p className="text-3xl font-bold text-foreground font-serif">{flaggedManuscripts.length}</p>
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
                  {flaggedManuscripts.filter(f => f.status === 'needs-review').length}
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
                  {flaggedManuscripts.filter(f => f.status === 'resolved').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flagged list */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Flagged Manuscripts</CardTitle>
                <CardDescription>List of manuscripts requiring staff review</CardDescription>
              </div>
              <Badge variant="outline" className="bg-secondary/30">
                {flaggedManuscripts.length} items
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {flaggedManuscripts.map((item) => {
                const isActive = selectedManuscript?.id === item.id;
                const status = statusConfig[item.status];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      isActive ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedManuscript(item)}
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

          {/* Actions on selected */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Review, provide feedback, and process analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedManuscript ? (
                <>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Viewing</p>
                    <p className="font-medium text-foreground">{selectedManuscript.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Author: {selectedManuscript.author}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Info className="w-4 h-4" /> View AI Details
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Pencil className="w-4 h-4" /> Adjust Results
                    </Button>
                    <Button variant="gradient" size="sm" className="gap-2">
                      <RefreshCw className="w-4 h-4" /> Re-run Analysis
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Feedback for Author</p>
                    </div>
                    <Textarea
                      placeholder="Enter detailed feedback, e.g., need to add emotional arc for chapters 5-6..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-end">
                      <Button variant="gradient" size="sm" disabled={!feedback.trim()}>
                        Send Feedback
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a manuscript to take action.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ & Tips management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage FAQs</CardTitle>
                <CardDescription>Edit FAQ content for authors</CardDescription>
              </div>
              <Badge variant="outline" className="bg-secondary/30">{faqs.length} items</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <p className="font-medium text-foreground">{faq.question}</p>
                    <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-3">
                <Input
                  placeholder="New question"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                />
                <Textarea
                  placeholder="Answer"
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  variant="gradient"
                  className="gap-2"
                  disabled={!faqQuestion.trim() || !faqAnswer.trim()}
                >
                  <Plus className="w-4 h-4" /> Add FAQ
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Writing Tips</CardTitle>
                <CardDescription>Create and manage writing tips for authors</CardDescription>
              </div>
              <Badge variant="outline" className="bg-secondary/30">{tips.length} tips</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {tips.map((tip) => (
                  <div key={tip.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-primary" />
                      <p className="font-medium text-foreground">{tip.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{tip.content}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-3">
                <Input
                  placeholder="Tip title"
                  value={tipTitle}
                  onChange={(e) => setTipTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Tip content"
                  value={tipContent}
                  onChange={(e) => setTipContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  variant="gradient"
                  className="gap-2"
                  disabled={!tipTitle.trim() || !tipContent.trim()}
                >
                  <BookOpen className="w-4 h-4" /> Add Tip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DefaultLayout>
  );
}


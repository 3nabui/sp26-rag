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
    flaggedReason: 'AI phát hiện mạch truyện đứt đoạn ở chương 7',
    status: 'needs-review',
    lastUpdated: '2024-12-03',
  },
  {
    id: 'MS-1068',
    title: 'Hành Trình Phía Bắc',
    author: 'Lê Quang',
    flaggedReason: 'Thiếu phân tích cảm xúc cho chương 3-4',
    status: 'pending',
    lastUpdated: '2024-12-01',
  },
  {
    id: 'MS-1005',
    title: 'Những Vì Sao Trên Đỉnh Đồi',
    author: 'Hoàng Gia Bảo',
    flaggedReason: 'Kết quả phân tích incomplete do timeout',
    status: 'resolved',
    lastUpdated: '2024-11-28',
  },
];

const faqs = [
  {
    id: 'faq-1',
    question: 'Làm sao để cải thiện nhịp độ ở đoạn cao trào?',
    answer: 'Tăng tần suất sự kiện, rút ngắn đoạn mô tả và xen kẽ hội thoại.',
  },
  {
    id: 'faq-2',
    question: 'Khi nào nên giới thiệu nhân vật mới?',
    answer: 'Chỉ khi nhân vật phục vụ mạch chính hoặc làm rõ xung đột.',
  },
];

const tips = [
  {
    id: 'tip-1',
    title: 'Giữ giọng kể nhất quán',
    content: 'Đảm bảo ngôi kể và điểm nhìn không thay đổi đột ngột giữa các chương.',
  },
  {
    id: 'tip-2',
    title: 'Đặt hook đầu chương',
    content: 'Mở đầu mỗi chương bằng tình huống hoặc câu hỏi kích thích tò mò.',
  },
];

const statusConfig: Record<FlagStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ xử lý', className: 'bg-warning/10 text-warning border-warning/20' },
  'needs-review': { label: 'Cần rà soát', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  resolved: { label: 'Đã xử lý', className: 'bg-success/10 text-success border-success/20' },
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
                <p className="text-sm text-muted-foreground mb-1">Bản thảo bị gắn cờ</p>
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
                <p className="text-sm text-muted-foreground mb-1">Đang cần rà soát</p>
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
                <p className="text-sm text-muted-foreground mb-1">Đã xử lý</p>
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
                <CardTitle>Bản thảo bị gắn cờ</CardTitle>
                <CardDescription>Danh sách hệ thống yêu cầu staff kiểm tra</CardDescription>
              </div>
              <Badge variant="outline" className="bg-secondary/30">
                {flaggedManuscripts.length} mục
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
                        <p className="text-sm text-muted-foreground mt-1">Tác giả: {item.author}</p>
                        <p className="text-sm text-foreground mt-2">{item.flaggedReason}</p>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <p>ID: {item.id}</p>
                        <p>Cập nhật: {new Date(item.lastUpdated).toLocaleDateString('vi-VN')}</p>
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
              <CardTitle>Thao tác</CardTitle>
              <CardDescription>Rà soát, phản hồi, và xử lý phân tích</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedManuscript ? (
                <>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-sm text-muted-foreground">Đang xem</p>
                    <p className="font-medium text-foreground">{selectedManuscript.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Tác giả: {selectedManuscript.author}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Info className="w-4 h-4" /> Xem chi tiết AI
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Pencil className="w-4 h-4" /> Điều chỉnh kết quả
                    </Button>
                    <Button variant="gradient" size="sm" className="gap-2">
                      <RefreshCw className="w-4 h-4" /> Re-run phân tích
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Phản hồi cho tác giả</p>
                    </div>
                    <Textarea
                      placeholder="Nhập phản hồi chi tiết, ví dụ: cần bổ sung mạch cảm xúc chương 5-6..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-end">
                      <Button variant="gradient" size="sm" disabled={!feedback.trim()}>
                        Gửi phản hồi
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Chọn một bản thảo để thao tác.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ & Tips management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quản lý FAQ</CardTitle>
                <CardDescription>Chỉnh sửa nội dung giải đáp cho tác giả</CardDescription>
              </div>
              <Badge variant="outline" className="bg-secondary/30">{faqs.length} mục</Badge>
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
                  placeholder="Câu hỏi mới"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                />
                <Textarea
                  placeholder="Câu trả lời"
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  variant="gradient"
                  className="gap-2"
                  disabled={!faqQuestion.trim() || !faqAnswer.trim()}
                >
                  <Plus className="w-4 h-4" /> Thêm FAQ
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Writing Tips</CardTitle>
                <CardDescription>Soạn và quản lý gợi ý viết cho tác giả</CardDescription>
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
                  placeholder="Tiêu đề tip"
                  value={tipTitle}
                  onChange={(e) => setTipTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Nội dung gợi ý"
                  value={tipContent}
                  onChange={(e) => setTipContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  variant="gradient"
                  className="gap-2"
                  disabled={!tipTitle.trim() || !tipContent.trim()}
                >
                  <BookOpen className="w-4 h-4" /> Thêm tip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DefaultLayout>
  );
}


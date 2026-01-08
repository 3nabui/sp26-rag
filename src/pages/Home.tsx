import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Brain, 
  BarChart3, 
  MessageSquare, 
  Sparkles, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Brain,
    title: 'Phân Tích AI Thông Minh',
    description: 'Công nghệ RAG tiên tiến giúp phân tích sâu bản thảo của bạn, từ cấu trúc đến phong cách viết.'
  },
  {
    icon: BarChart3,
    title: 'Nhịp Độ & Cảm Xúc',
    description: 'Theo dõi dòng chảy cảm xúc và nhịp độ câu chuyện qua từng chương một cách trực quan.'
  },
  {
    icon: Users,
    title: 'Bản Đồ Nhân Vật',
    description: 'Khám phá mối quan hệ giữa các nhân vật và vai trò của họ trong câu chuyện.'
  },
  {
    icon: MessageSquare,
    title: 'Trợ Lý AI 24/7',
    description: 'Hỏi đáp trực tiếp với AI về bản thảo, nhận gợi ý cải thiện ngay lập tức.'
  }
];

const steps = [
  {
    number: '01',
    title: 'Tải Lên Bản Thảo',
    description: 'Upload file TXT, DOCX hoặc PDF của bạn một cách dễ dàng.'
  },
  {
    number: '02',
    title: 'AI Phân Tích',
    description: 'Hệ thống RAG tự động phân tích mọi khía cạnh của tác phẩm.'
  },
  {
    number: '03',
    title: 'Xem Kết Quả',
    description: 'Nhận báo cáo chi tiết với biểu đồ trực quan và insights.'
  },
  {
    number: '04',
    title: 'Cải Thiện',
    description: 'Áp dụng gợi ý từ AI để nâng cao chất lượng tác phẩm.'
  }
];

const testimonials = [
  {
    name: 'Nguyễn Minh Anh',
    role: 'Tác giả tiểu thuyết',
    content: 'StoryNest đã giúp tôi phát hiện những điểm yếu trong cấu trúc truyện mà tôi không nhận ra. Thật sự ấn tượng!',
    avatar: 'MA'
  },
  {
    name: 'Trần Văn Hùng',
    role: 'Nhà văn trẻ',
    content: 'Công cụ phân tích nhân vật cực kỳ hữu ích. Tôi có thể thấy rõ mối quan hệ giữa các nhân vật và cải thiện chúng.',
    avatar: 'VH'
  },
  {
    name: 'Lê Thị Hương',
    role: 'Biên tập viên',
    content: 'Tiết kiệm rất nhiều thời gian biên tập. AI chatbot trả lời nhanh và chính xác về nội dung bản thảo.',
    avatar: 'TH'
  }
];

const stats = [
  { value: '10,000+', label: 'Bản thảo đã phân tích' },
  { value: '5,000+', label: 'Tác giả tin dùng' },
  { value: '98%', label: 'Hài lòng' },
  { value: '24/7', label: 'Hỗ trợ AI' }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo-storynest.png" 
              alt="StoryNest Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-foreground">StoryNest</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Tính Năng
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              Cách Hoạt Động
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Đánh Giá
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Đăng Nhập</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                Bắt Đầu Miễn Phí
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-500 font-medium">Công nghệ AI tiên tiến nhất</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Phân Tích Truyện
              <br />
              <span className="bg-gradient-to-r from-amber-500 to-teal-500 bg-clip-text text-transparent">
                Với Sức Mạnh AI
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Khám phá chiều sâu tác phẩm của bạn với công nghệ RAG. 
              Phân tích nhịp độ, cảm xúc, nhân vật và nhận gợi ý cải thiện từ AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-6 text-lg">
                  Bắt Đầu Ngay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-border">
                  Xem Demo
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tất cả công cụ bạn cần để nâng cao chất lượng tác phẩm
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cách Hoạt Động
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Chỉ 4 bước đơn giản để phân tích bản thảo của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-6xl font-bold text-amber-500/10 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-amber-500/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Đánh Giá Từ Tác Giả
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hàng nghìn tác giả đã tin dùng StoryNest
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-teal-500/10" />
            <CardContent className="p-12 md:p-16 text-center relative z-10">
              <Zap className="w-12 h-12 text-amber-500 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Sẵn Sàng Nâng Cao Tác Phẩm?
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
                Bắt đầu miễn phí ngay hôm nay và khám phá sức mạnh của AI trong việc phân tích truyện.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8">
                    Đăng Ký Miễn Phí
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  Không cần thẻ tín dụng
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  Dùng thử 14 ngày
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  Hủy bất kỳ lúc nào
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-storynest.png" 
                alt="StoryNest Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-foreground">StoryNest</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-foreground transition-colors">Bảo mật</a>
              <a href="#" className="hover:text-foreground transition-colors">Liên hệ</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 StoryNest. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

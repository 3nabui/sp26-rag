import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Paperclip, 
  Mic,
  MoreHorizontal,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockChatMessages, mockManuscripts, type ChatMessage } from '@/utils/mockData';

const suggestedQuestions = [
  'Phân tích nhịp độ chương 4',
  'Nhân vật nào xuất hiện nhiều nhất?',
  'Đề xuất cải thiện phần kết thúc',
  'So sánh cảm xúc giữa chương 1 và 10',
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        ${isUser ? 'bg-primary text-primary-foreground' : 'bg-accent/20 text-accent'}
      `}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`
          inline-block p-4 rounded-2xl text-sm
          ${isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-md' 
            : 'bg-secondary/50 text-foreground rounded-tl-md'
          }
        `}>
          <p className="whitespace-pre-wrap text-left">{message.content}</p>
        </div>
        <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {!isUser && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
        <Bot className="w-5 h-5 text-accent" />
      </div>
      <div className="bg-secondary/50 rounded-2xl rounded-tl-md p-4 flex items-center gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </motion.div>
  );
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedManuscript] = useState(mockManuscripts[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Cảm ơn bạn đã hỏi về "${inputValue}". Đây là một câu hỏi thú vị!\n\nDựa trên phân tích bản thảo "${selectedManuscript.title}", tôi có thể chia sẻ những điểm sau:\n\n• **Phân tích tổng quan**: Bản thảo có cấu trúc chặt chẽ với ${selectedManuscript.chapters} chương\n• **Điểm mạnh**: Cách phát triển nhân vật rất tự nhiên\n• **Đề xuất**: Có thể thêm chi tiết ở phần cao trào\n\nBạn có muốn tôi phân tích chi tiết hơn không?`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <DefaultLayout title="Hỏi AI" role="author">
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <Card variant="glass" className="mb-4">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">AI Trợ lý Phân tích</h3>
                  <p className="text-xs text-muted-foreground">Đang phân tích: {selectedManuscript.title}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card variant="elevated" className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isTyping && <TypingIndicator />}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Suggested Questions */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Nhập câu hỏi về bản thảo..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="pr-12"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                </div>
                <Button 
                  variant="gradient" 
                  size="icon" 
                  className="shrink-0"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4 hidden lg:block">
          {/* Selected Manuscript */}
          <Card variant="elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bản thảo đang phân tích</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-secondary/30 border border-primary/20">
                <h4 className="font-medium text-foreground">{selectedManuscript.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedManuscript.chapters} chương
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {(selectedManuscript.words! / 1000).toFixed(0)}K từ
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Topics */}
          <Card variant="elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Chủ đề gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Phân tích nhịp độ', 'Mối quan hệ nhân vật', 'Cảm xúc chương 4'].map((topic, index) => (
                  <div 
                    key={index}
                    className="p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card variant="glass" className="gradient-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Mẹo sử dụng AI</p>
                  <p className="text-xs text-muted-foreground">
                    Hãy đặt câu hỏi cụ thể về chương hoặc nhân vật để có câu trả lời chi tiết hơn.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}

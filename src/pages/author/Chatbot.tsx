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
  RefreshCw,
  BookOpen,
  AlertCircle,
  Zap,
  Heart
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockManuscripts, type ChatMessage, type Manuscript } from '@/utils/mockData';

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
            {new Date(message.timestamp).toLocaleTimeString('en-US', { 
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedManuscript = mockManuscripts.find(m => m.id.toString() === selectedManuscriptId);
  const isReadyToChat = selectedManuscriptId && selectedChapter;

  // Generate chapter options based on selected manuscript
  const chapterOptions = selectedManuscript 
    ? Array.from({ length: selectedManuscript.chapters || 0 }, (_, i) => i + 1)
    : [];

  // Update suggested questions based on selected chapter
  const suggestedQuestions = selectedChapter ? [
    `Analyze pacing of chapter ${selectedChapter}`,
    `Which character appears most in chapter ${selectedChapter}?`,
    `Suggest improvements for the ending of chapter ${selectedChapter}`,
    `What is the dominant emotion of chapter ${selectedChapter}?`,
  ] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Reset messages when manuscript or chapter changes
  useEffect(() => {
    if (isReadyToChat && messages.length === 0) {
      // Add welcome message when selection is made
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm ready to analyze **${selectedManuscript?.title} - Chapter ${selectedChapter}**.\n\nYou can ask me about:\n• Pacing and chapter structure\n• Emotions and atmosphere\n• Characters and relationships\n• Improvement suggestions\n\nAsk a question to get started!`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isReadyToChat, selectedManuscriptId, selectedChapter]);

  const handleSend = () => {
    if (!inputValue.trim() || !isReadyToChat) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response with specific context
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on analysis of **${selectedManuscript?.title} - Chapter ${selectedChapter}**, I can share:\n\n• **Pacing**: Chapter ${selectedChapter} has ${selectedChapter === '4' || selectedChapter === '8' ? 'fast' : 'moderate'} pacing, fitting the story progression\n• **Emotion**: The dominant emotion is ${selectedChapter === '4' ? 'tension and suspense' : 'focus and determination'}\n• **Characters**: Main characters appear consistently, with clear character development\n• **Suggestion**: ${selectedChapter === '4' ? 'Could add descriptive details to slow pacing slightly' : 'Chapter structure is good, maintain current pacing'}\n\nWhich aspect would you like me to analyze in more detail?`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!isReadyToChat) return;
    setInputValue(question);
  };

  return (
    <DefaultLayout title="Hỏi AI" role="author">
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Selection Header */}
          <Card variant="glass" className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Manuscript Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Story</label>
                    <Select value={selectedManuscriptId} onValueChange={setSelectedManuscriptId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select story to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockManuscripts.map((manuscript) => (
                          <SelectItem key={manuscript.id} value={manuscript.id.toString()}>
                            {manuscript.title} (v{manuscript.version})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chapter Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Chapter</label>
                    <Select 
                      value={selectedChapter} 
                      onValueChange={setSelectedChapter}
                      disabled={!selectedManuscriptId}
                    >
                      <SelectTrigger disabled={!selectedManuscriptId}>
                        <SelectValue placeholder={selectedManuscriptId ? "Select chapter" : "Select story first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {chapterOptions.map((chapter) => (
                          <SelectItem key={chapter} value={chapter.toString()}>
                            Chapter {chapter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center">
                  {isReadyToChat ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Sẵn sàng
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Selected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Selected Info */}
              {isReadyToChat && selectedManuscript && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Analyzing: <span className="text-primary">{selectedManuscript.title}</span> - Chapter {selectedChapter}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card variant="elevated" className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {!isReadyToChat ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Select Story and Chapter to Start
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Please select a specific story and chapter above so AI can analyze accurately and provide the most relevant answers.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {isTyping && <TypingIndicator />}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {/* Suggested Questions */}
            {isReadyToChat && (
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
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="shrink-0" disabled={!isReadyToChat}>
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={isReadyToChat ? `Ask about Chapter ${selectedChapter}...` : "Select story and chapter first"}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="pr-12"
                    disabled={!isReadyToChat}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    disabled={!isReadyToChat}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                </div>
                <Button 
                  variant="gradient" 
                  size="icon" 
                  className="shrink-0"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || !isReadyToChat}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4 hidden lg:block">
          {/* Selected Manuscript Info */}
          {selectedManuscript && (
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Manuscript Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-2">{selectedManuscript.title}</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        v{selectedManuscript.version}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {selectedManuscript.chapters} chương
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {(selectedManuscript.words! / 1000).toFixed(0)}K từ
                      </Badge>
                    </div>
                  </div>
                  {selectedChapter && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Analyzing: <span className="text-primary">Chapter {selectedChapter}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card variant="glass" className="gradient-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">AI Usage Tips</p>
                  <p className="text-xs text-muted-foreground">
                    {isReadyToChat 
                      ? `Ask specific questions about Chapter ${selectedChapter} for the most detailed answers.`
                      : 'Select a specific story and chapter so AI can analyze accurately.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {isReadyToChat && (
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setInputValue(`Analyze pacing of chapter ${selectedChapter}`)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Pacing
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setInputValue(`Which character appears most in chapter ${selectedChapter}?`)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Analyze Characters
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setInputValue(`What is the dominant emotion of chapter ${selectedChapter}?`)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Analyze Emotions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

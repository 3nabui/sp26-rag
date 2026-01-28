import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  BookOpen, 
  Video, 
  FileText,
  Search,
  ChevronRight,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Zap,
  Users,
  Clock
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'upload' | 'analysis' | 'chatbot' | 'billing';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I upload a manuscript?',
    answer: 'Go to the Upload page and drag & drop your Word (.docx) file (or click to choose a file). The system will automatically detect chapters from your document.',
    category: 'upload'
  },
  {
    id: '2',
    question: 'Can I edit content after uploading?',
    answer: 'Yes. You can edit each chapter in the editor. When you save changes, the app creates a new chapter version so you can track your history.',
    category: 'upload'
  },
  {
    id: '3',
    question: 'How does AI analysis work?',
    answer: 'AI analyzes pacing, emotion, and characters for a selected chapter/version or the whole story, depending on what you choose.',
    category: 'analysis'
  },
  {
    id: '4',
    question: 'Can I ask AI questions about my manuscript?',
    answer: 'Yes. The “Ask AI” page lets you chat about your manuscript. Responses use the context you selected (a specific chapter/version or the whole story).',
    category: 'chatbot'
  },
  {
    id: '5',
    question: 'How does version control work?',
    answer: 'Each chapter can have multiple versions. The first version is typically “Draft”. You can create new versions on save, compare versions, and set a main version.',
    category: 'general'
  },
  {
    id: '6',
    question: 'Can I analyze multiple versions at once?',
    answer: 'In the Analysis page, you analyze one specific version at a time for accurate metrics. You can also analyze the whole story for a broader overview.',
    category: 'analysis'
  },
  {
    id: '7',
    question: 'How do I delete a story or chapter?',
    answer: 'This feature is still in development. Please contact support if you need help removing data.',
    category: 'general'
  },
  {
    id: '8',
    question: 'Is my data stored safely?',
    answer: 'Data is stored locally in your browser in this demo. We do not share your data with third parties.',
    category: 'general'
  }
];

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  readTime: string;
  content: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Uploading & Managing Your Manuscript',
    description: 'Learn how to upload a Word file, edit chapters, and manage versions.',
    icon: FileText,
    category: 'Tutorial',
    readTime: '5 min',
    content: `# Uploading & Managing Your Manuscript

## Step 1: Upload a Word file

1. Go to **Upload Manuscript**
2. Drag & drop a Word (.docx) file (or click to browse)
3. Wait while chapters are detected automatically

## Step 2: Review & confirm

- Review detected chapters
- Adjust chapter titles if needed
- Click **Confirm** to create a new story

## Step 3: Edit chapters

1. Select a chapter from the left sidebar
2. Edit content using the rich text editor
3. Click **Save** to store your changes

## Step 4: Manage versions

- Create a new version when saving meaningful changes
- Use clear labels like “Draft”, “Revised”, “Final”
- Compare versions when deciding which one is best
- Set a **Main** version for the chapter

## Tips

- The first version is usually “Draft”
- Use descriptive labels to keep history organized`
  },
  {
    id: '2',
    title: 'Using AI Analysis Effectively',
    description: 'Learn how to interpret pacing, emotion, and character insights.',
    icon: Zap,
    category: 'Guide',
    readTime: '8 min',
    content: `# Using AI Analysis Effectively

## What AI Analysis covers

- **Pacing**: slow / medium / fast
- **Emotion**: detected emotion and intensity per scene
- **Characters**: frequency and relationships

## Choosing analysis scope

### Analyze a specific chapter
1. Select a story
2. Choose **This Chapter**
3. Select a chapter and a specific version
4. Click **Request AI Analysis**

### Analyze the whole story
1. Select a story
2. Choose **Whole Story**
3. Click **Request AI Analysis**

## Reading the results

### Chapter Overview
- Total scenes, total words, character count, average words/scene

### Scenes & Emotions
- Per-scene issues, emotion + intensity, pacing, characters present

### Characters
- Frequency and relationship highlights

### Chapter History
- Version timeline for the chapter

## Best practices

1. Start with chapter-level analysis for details
2. Use whole-story analysis to spot broad patterns
3. Compare versions to see which reads better`
  },
  {
    id: '3',
    title: 'Getting Better Results from Ask AI',
    description: 'How to ask clear questions and use the right context.',
    icon: MessageSquare,
    category: 'Tips',
    readTime: '6 min',
    content: `# Getting Better Results from Ask AI

## Pick the right context

### Whole story context
- Select a story but do not select a specific chapter/version
- Best for questions about overall plot, arcs, and consistency

### Chapter-specific context
- Select a story → chapter → version
- Best for pacing, emotion, and character development within that chapter

## Ask better questions

### Good questions
- “Is the pacing in Chapter 4 too fast?”
- “Is the emotion in the opening scene of Chapter 5 too tense?”
- “Does the protagonist appear enough in Chapter 3?”
- “How does the relationship between Minh and Linh evolve?”

### Vague questions to avoid
- “Is it good?”
- “Fix it for me.”
- “Review my story.”

## Tips

1. Be specific
2. Mention the scene/chapter you care about
3. Ask follow-up questions
4. Provide examples when possible`
  },
  {
    id: '4',
    title: 'Version Control Best Practices',
    description: 'Practical ways to manage chapter versions without chaos.',
    icon: BookOpen,
    category: 'Best Practices',
    readTime: '7 min',
    content: `# Version Control Best Practices

## Why version control matters

- Track changes over time
- Compare versions and pick the best one
- Roll back if needed
- Share a specific version with editors/beta readers

## Naming conventions

### Good names
- “Draft”
- “Revised”
- “Final”
- “Beta Reader Feedback”
- “Editor Review”
- “v2 - Added dialogue”

### Names to avoid
- “Version 1”, “Version 2” (no context)
- “New”
- “Test”

## Recommended workflow

1. Upload → baseline “Draft”
2. Save meaningful edits as new versions
3. Set the best version as **Main**
4. Compare before you commit to big changes

## When to create a new version

### Create a new version when
- You change structure (add/remove scenes)
- You do a large rewrite
- You apply feedback from readers/editors

### Don’t create a new version when
- You only fix minor typos
- You only change formatting`
  }
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

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<HelpArticle | null>(null);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);

  const filteredFAQ = faqData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  const faqByCategory = {
    general: filteredFAQ.filter(f => f.category === 'general'),
    upload: filteredFAQ.filter(f => f.category === 'upload'),
    analysis: filteredFAQ.filter(f => f.category === 'analysis'),
    chatbot: filteredFAQ.filter(f => f.category === 'chatbot'),
    billing: filteredFAQ.filter(f => f.category === 'billing')
  };

  return (
    <DefaultLayout title="Support Center" role="author">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Card variant="gradient" className="overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Support Center
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  We’re here to help. Browse FAQs, read guides, or contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="interactive" className="hover-lift cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">FAQ</h3>
                  <p className="text-sm text-muted-foreground">Frequently asked questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="interactive" className="hover-lift cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Contact Us</h3>
                  <p className="text-sm text-muted-foreground">help</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="interactive" className="hover-lift cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Documentation</h3>
                  <p className="text-sm text-muted-foreground">Guides and documentation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Search answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* FAQ Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(faqByCategory).map(([category, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <div key={category} className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">
                          {category === 'general' ? 'General' :
                           category === 'upload' ? 'Upload & Management' :
                           category === 'analysis' ? 'AI Analysis' :
                           category === 'chatbot' ? 'Ask AI' :
                           'Billing'}
                        </h3>
                        {items.map((item) => (
                          <AccordionItem key={item.id} value={item.id}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </div>
                    );
                  })}
                </Accordion>

                {filteredFAQ.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No matching questions found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card variant="elevated" className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Submit a support request</CardTitle>
                  <CardDescription>
                    Fill out the form below and we’ll respond within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <p className="text-success">Your request was sent successfully. We’ll get back to you soon.</p>
                    </motion.div>
                  )}
                  <form onSubmit={handleSubmitContact} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Your name *
                        </label>
                        <Input
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Email *
                        </label>
                        <Input
                          required
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Subject *
                      </label>
                      <Input
                        required
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        placeholder="e.g. Upload issue"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Message *
                      </label>
                      <Textarea
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Describe your issue..."
                        rows={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="gradient" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <p className="text-sm text-muted-foreground">support@storynest.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Response Time</p>
                        <p className="text-sm text-muted-foreground">Within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Hours</p>
                        <p className="text-sm text-muted-foreground">24/7</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="interactive" className="gradient-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Lightbulb className="w-6 h-6 text-warning" />
                      <h3 className="font-semibold text-foreground">Quick tip</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Before submitting a request, check the FAQ to see if your question is already answered.
                    </p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      const faqTab = document.querySelector('[value="faq"]') as HTMLElement;
                      faqTab?.click();
                    }}>
                      View FAQ
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Guides & Documentation</CardTitle>
                <CardDescription>
                  Explore tutorials and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {helpArticles.map((article) => {
                    const Icon = article.icon;
                    return (
                      <motion.div
                        key={article.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="group"
                      >
                        <Card variant="interactive" className="h-full cursor-pointer hover-lift">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                                <Icon className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {article.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {article.readTime}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                  {article.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {article.description}
                                </p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="group-hover:text-primary"
                                  onClick={() => {
                                    setSelectedGuide(article);
                                    setIsGuideDialogOpen(true);
                                  }}
                                >
                                  Read more
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Guide Detail Dialog */}
        <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                {selectedGuide && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <selectedGuide.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl">{selectedGuide.title}</DialogTitle>
                      <DialogDescription className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {selectedGuide.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedGuide.readTime}
                        </span>
                      </DialogDescription>
                    </div>
                  </>
                )}
              </div>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 text-sm leading-relaxed">
                {selectedGuide?.content.split('\n\n').map((paragraph, pIndex) => {
                  const lines = paragraph.split('\n');
                  return (
                    <div key={pIndex} className="space-y-2">
                      {lines.map((line, lIndex) => {
                        const lineKey = `${pIndex}-${lIndex}`;
                        
                        // Headers
                        if (line.startsWith('# ')) {
                          return <h1 key={lineKey} className="text-2xl font-bold mt-6 mb-4 text-foreground">{line.substring(2)}</h1>;
                        }
                        if (line.startsWith('## ')) {
                          return <h2 key={lineKey} className="text-xl font-semibold mt-5 mb-3 text-foreground">{line.substring(3)}</h2>;
                        }
                        if (line.startsWith('### ')) {
                          return <h3 key={lineKey} className="text-lg font-semibold mt-4 mb-2 text-foreground">{line.substring(4)}</h3>;
                        }
                        
                        // Bold text (standalone)
                        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
                          return <div key={lineKey} className="font-semibold text-foreground mt-3 mb-2">{line.replace(/\*\*/g, '')}</div>;
                        }
                        
                        // List items with bold
                        if (line.match(/^[-*] \*\*.*\*\*: .*/)) {
                          const match = line.match(/^[-*] \*\*(.*?)\*\*: (.*)/);
                          if (match) {
                            return (
                              <div key={lineKey} className="ml-4 mb-2">
                                <strong className="text-foreground">{match[1]}</strong>: <span className="text-muted-foreground">{match[2]}</span>
                              </div>
                            );
                          }
                        }
                        
                        // Regular list items
                        if (line.startsWith('- ') || line.startsWith('* ')) {
                          const content = line.substring(2);
                          // Check for bold in list item
                          if (content.includes('**')) {
                            const parts = content.split(/(\*\*.*?\*\*)/g);
                            return (
                              <div key={lineKey} className="ml-4 mb-1 text-muted-foreground">
                                {parts.map((part, partIndex) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={partIndex} className="text-foreground">{part.replace(/\*\*/g, '')}</strong>;
                                  }
                                  return <span key={partIndex}>{part}</span>;
                                })}
                              </div>
                            );
                          }
                          return <div key={lineKey} className="ml-4 mb-1 text-muted-foreground">{content}</div>;
                        }
                        
                        // Regular paragraphs
                        if (line.trim() && !line.startsWith('#')) {
                          // Check for bold in paragraph
                          if (line.includes('**')) {
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <p key={lineKey} className="mb-3 text-muted-foreground">
                                {parts.map((part, partIndex) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={partIndex} className="text-foreground">{part.replace(/\*\*/g, '')}</strong>;
                                  }
                                  return <span key={partIndex}>{part}</span>;
                                })}
                              </p>
                            );
                          }
                          return <p key={lineKey} className="mb-3 text-muted-foreground">{line}</p>;
                        }
                        
                        return null;
                      })}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DefaultLayout>
  );
}

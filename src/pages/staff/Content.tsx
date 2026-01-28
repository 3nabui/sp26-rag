import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Wand2, HelpCircle } from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Faq = { id: string; question: string; answer: string };
type Tip = { id: string; title: string; content: string };

const initialFaqs: Faq[] = [
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

const initialTips: Tip[] = [
  {
    id: 'tip-1',
    title: 'Maintain Consistent Narrative Voice',
    content: "Ensure narrative perspective and point of view don't change abruptly between chapters.",
  },
  {
    id: 'tip-2',
    title: 'Place Hook at Chapter Start',
    content: 'Begin each chapter with a situation or question that sparks curiosity.',
  },
];

export default function StaffContentPage() {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [tips, setTips] = useState<Tip[]>(initialTips);

  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [tipTitle, setTipTitle] = useState('');
  const [tipContent, setTipContent] = useState('');

  const totalFaqs = useMemo(() => faqs.length, [faqs]);
  const totalTips = useMemo(() => tips.length, [tips]);

  return (
    <DefaultLayout title="Content" role="staff">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Content</h1>
              <p className="text-muted-foreground">
                Manage FAQs and writing tips shown to authors (Support Center and in-app guidance).
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline">{totalFaqs} FAQs</Badge>
                <Badge variant="outline">{totalTips} tips</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faqs" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Writing tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faqs">
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
                    onClick={() => {
                      const next: Faq = {
                        id: `faq-${Date.now()}`,
                        question: faqQuestion.trim(),
                        answer: faqAnswer.trim(),
                      };
                      setFaqs((prev) => [next, ...prev]);
                      setFaqQuestion('');
                      setFaqAnswer('');
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add FAQ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips">
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Writing tips</CardTitle>
                  <CardDescription>Create and manage writing tips for authors</CardDescription>
                </div>
                <Badge variant="outline" className="bg-secondary/30">{tips.length} tips</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {tips.map((tip) => (
                    <div key={tip.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
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
                    onClick={() => {
                      const next: Tip = {
                        id: `tip-${Date.now()}`,
                        title: tipTitle.trim(),
                        content: tipContent.trim(),
                      };
                      setTips((prev) => [next, ...prev]);
                      setTipTitle('');
                      setTipContent('');
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add tip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DefaultLayout>
  );
}


import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Settings, Repeat, SplitSquareHorizontal, Gauge } from 'lucide-react';
import { DefaultLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function AdminConfig() {
  const [chunkSize, setChunkSize] = useState(800);
  const [topK, setTopK] = useState(5);
  const [strategy, setStrategy] = useState('semantic');
  const [contextLength, setContextLength] = useState(4096);
  const [storageThreshold, setStorageThreshold] = useState(80);
  const [notes, setNotes] = useState('');

  return (
    <DefaultLayout title="RAG & System Config" role="admin">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RAG parameters */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>RAG Parameters</CardTitle>
                <CardDescription>Chunking, retrieval and splitting strategy</CardDescription>
              </div>
              <Badge variant="outline" className="bg-secondary/30">Realtime</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Chunk Size (tokens)</p>
                  <Input
                    type="number"
                    value={chunkSize}
                    min={200}
                    max={2000}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Top-K Retrieval</p>
                  <Input
                    type="number"
                    value={topK}
                    min={1}
                    max={50}
                    onChange={(e) => setTopK(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Text Splitting Strategy</p>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="semantic">Semantic (model-based)</option>
                  <option value="sentence">Sentence</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="hybrid">Hybrid (semantic + rules)</option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Max Context Length</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={2048}
                    max={16384}
                    step={512}
                    value={contextLength}
                    onChange={(e) => setContextLength(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-foreground w-16 text-right">{contextLength}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="gradient" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Save Parameters
                </Button>
                <Button variant="outline" className="gap-2">
                  <Repeat className="w-4 h-4" /> Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System & storage */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System & Storage</CardTitle>
                <CardDescription>Storage capacity and system policy configuration</CardDescription>
              </div>
              <Badge variant="outline" className="bg-secondary/30">Global</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Storage Alert Threshold (%)</p>
                <Input
                  type="number"
                  value={storageThreshold}
                  min={50}
                  max={100}
                  onChange={(e) => setStorageThreshold(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center gap-3 text-left">
                  <Settings className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto scale index</p>
                    <p className="text-xs text-muted-foreground">Enable/disable shard scaling</p>
                  </div>
                </button>
                <button className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center gap-3 text-left">
                  <SplitSquareHorizontal className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto re-chunk</p>
                    <p className="text-xs text-muted-foreground">When chunk parameters change</p>
                  </div>
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Deployment / Release Notes</p>
                <Textarea
                  placeholder="Example: Increase top-k to 8 for long stories; check shard-3 latency..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="gradient" className="gap-2">
                  <Gauge className="w-4 h-4" /> Save System Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DefaultLayout>
  );
}


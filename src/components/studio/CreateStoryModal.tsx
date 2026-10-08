import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CreateStoryModal({ open, onOpenChange }: { open: boolean; onOpenChange: (next: boolean) => void }) {
  const [title, setTitle] = useState('');
  const [ageGroup, setAgeGroup] = useState('6-8');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !idea.trim()) return;
    setLoading(true);
    try {
      console.log('Story created', { title, ageGroup, idea });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl border border-border bg-card shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" /> Create new story
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Story title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Night the Lantern Bloomed"
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none ring-0 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Age group</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none ring-0 focus:border-primary"
              >
                <option value="3-5">3-5</option>
                <option value="6-8">6-8</option>
                <option value="9-12">9-12</option>
                <option value="13+">13+</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Core idea</label>
            <textarea
              rows={6}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="A shy fox learns to shine in a town that only feels safe in the dark..."
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none ring-0 focus:border-primary"
            />
          </div>

          <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Free plan</p>
            <p className="mt-2 text-sm text-muted-foreground">
              2 full stories included. Lifetime is $89 and includes 100 stories per year, 4 videos/month, all future features.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreate} disabled={!title.trim() || !idea.trim() || loading}>
              {loading ? 'Generating...' : 'Generate outline'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateStoryModal;

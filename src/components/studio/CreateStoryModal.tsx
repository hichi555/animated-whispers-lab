import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export function CreateStoryModal({ open, onOpenChange }: CreateStoryModalProps) {
  const [title, setTitle] = useState('');
  const [ageGroup, setAgeGroup] = useState('6-8');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !idea) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to create story
      console.log('Creating story:', { title, ageGroup, idea });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Create new story
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Story title *</label>
                <input
                  type="text"
                  placeholder="The Night the Lantern Bloomed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Age group *</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none"
                >
                  <option value="3-5">3-5 years old</option>
                  <option value="6-8">6-8 years old</option>
                  <option value="9-12">9-12 years old</option>
                  <option value="13+">13+ years old</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Core story idea *</label>
              <textarea
                rows={5}
                placeholder="A shy fox learns to shine in a town that only feels safe in the dark..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none"
              />
            </div>

            <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4">
              <p className="text-xs uppercase tracking-[0.1em] font-medium text-muted-foreground mb-2">✨ Premium outline generation</p>
              <p className="text-sm text-muted-foreground">
                Our editorial engine will create a page-by-page outline, character suggestions, and illustration prompts—all optimized for your age group.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleCreate}
                disabled={!title || !idea || loading}
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Generating...' : 'Generate outline'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

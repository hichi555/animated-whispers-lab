import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FREE_PLAN, formatLifetimePrice, type UserPlan } from '@/lib/pricing';

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: UserPlan;
  canCreate?: boolean;
  freeStoriesUsed?: number;
  booksThisYear?: number;
}

export function CreateStoryModal({
  open,
  onOpenChange,
  plan = 'free',
  canCreate = true,
  freeStoriesUsed = 0,
  booksThisYear = 0,
}: CreateStoryModalProps) {
  const [title, setTitle] = useState('');
  const [ageGroup, setAgeGroup] = useState('6-8');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);

  const storyLimit = plan === 'lifetime' ? FREE_PLAN.lifetimeStoriesPerYear : FREE_PLAN.freeStories;
  const currentUsage = plan === 'lifetime' ? booksThisYear : freeStoriesUsed;

  const handleCreate = async () => {
    if (!title.trim() || !idea.trim() || !canCreate) return;
    setLoading(true);
    try {
      console.log('Story created', { title, ageGroup, idea });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (!canCreate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-xl border border-border bg-card shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" /> Story limit reached
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm text-muted-foreground">
                You used {currentUsage}/{storyLimit} stories.
              </p>
              <p className="mt-2 text-base font-medium">
                Upgrade to the lifetime plan for {formatLifetimePrice()} and unlock 100 stories per year plus 4 video exports per month.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => onOpenChange(false)}>
                Upgrade now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Usage cap</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan === 'free'
                ? `Free users get ${FREE_PLAN.freeStories} story slots. Lifetime unlocks ${FREE_PLAN.lifetimeStoriesPerYear} stories/year and ${FREE_PLAN.lifetimeVideosPerMonth} video exports/month.`
                : `Lifetime plan active: ${FREE_PLAN.lifetimeStoriesPerYear} stories/year and ${FREE_PLAN.lifetimeVideosPerMonth} video exports/month.`}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreate} disabled={!title.trim() || !idea.trim() || loading || !canCreate}>
              {loading ? 'Generating...' : 'Generate outline'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateStoryModal;

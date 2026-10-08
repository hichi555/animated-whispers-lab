import { useMemo, useState } from 'react';
import { Plus, Sparkles, BookOpen, PencilLine, Mic, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { CreateStoryModal } from '@/components/studio/CreateStoryModal';
import { canCreateStory, canCreateVideo, FREE_PLAN, getPlanSummary, getPlanStatusText, formatLifetimePrice, type UserPlan } from '@/lib/pricing';

const MOCK_STORIES = [
  { id: '1', title: 'Fern and the Lantern Fox', pages: 8, updated: '2 days ago', status: 'draft', ageGroup: '6-8' },
  { id: '2', title: 'Milo and the Moonberry Tree', pages: 12, updated: '5 days ago', status: 'draft', ageGroup: '6-8' },
];

const FREE_FEATURES = [
  'Create 2 full stories per month',
  'Write and preview pages',
  'Create characters and voice presets',
  'Export PDF preview',
];

function StudioDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [plan] = useState<UserPlan>('free');
  const [stories] = useState(MOCK_STORIES);
  const [videosThisMonth] = useState(0);

  const usage = useMemo(
    () => ({
      freeStoriesUsed: stories.length,
      booksThisYear: stories.length,
      videosThisMonth,
    }),
    [stories.length, videosThisMonth],
  );

  const canCreate = canCreateStory({ plan, ...usage });
  const canCreateVideoAccess = canCreateVideo({ plan, videosThisMonth });
  const summary = getPlanSummary(plan);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">CyliaTales Studio</p>
            <h1 className="mt-2 text-4xl font-semibold">Your story desk</h1>
          </div>

          <Button size="lg" className="gap-2" onClick={() => setShowCreateModal(true)} disabled={!canCreate}>
            <Plus className="h-4 w-4" />
            Create new story
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" /> Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stories.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan === 'free' ? `${Math.min(stories.length, FREE_PLAN.freeStories)}/${FREE_PLAN.freeStories} used` : `${usage.booksThisYear}/${FREE_PLAN.lifetimeStoriesPerYear} this year`}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <PencilLine className="h-4 w-4 text-primary" /> Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stories.reduce((sum, s) => sum + s.pages, 0)}</p>
              <p className="mt-1 text-sm text-muted-foreground">total written</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic className="h-4 w-4 text-primary" /> Voices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.narrationVoices}</p>
              <p className="mt-1 text-sm text-muted-foreground">voice presets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-4 w-4 text-primary" /> Exports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{videosThisMonth}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan === 'free' ? 'video exports this month' : `${videosThisMonth}/${FREE_PLAN.lifetimeVideosPerMonth} used`}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent stories</h2>
            </div>

            {stories.length > 0 ? (
              <div className="space-y-4">
                {stories.map((story) => (
                  <Card key={story.id} className="overflow-hidden transition-all hover:shadow-md">
                    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{story.title}</h3>
                          <p className="text-sm text-muted-foreground">{story.pages} pages • Updated {story.updated}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                          Draft
                        </span>
                        <Button variant="outline" size="sm">Open</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Sparkles className="h-8 w-8" />}
                    title="No stories yet"
                    description="Start with a story idea and let the studio build your first illustrated children's book."
                    actionLabel="Create your first story"
                    action={() => setShowCreateModal(true)}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> {plan === 'free' ? 'Free plan' : 'Lifetime plan'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-3xl font-semibold">{plan === 'free' ? `${FREE_PLAN.freeStories} stories` : `${FREE_PLAN.lifetimeStoriesPerYear} stories`}</p>
                <p className="text-sm text-muted-foreground">{getPlanStatusText(plan)}</p>
              </div>

              <ul className="space-y-3">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 h-4 w-4 rounded-full bg-primary/20" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border bg-secondary/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">{plan === 'free' ? 'Lifetime plan' : 'Your current plan'}</p>
                <p className="mt-2 text-3xl font-semibold">{plan === 'free' ? formatLifetimePrice() : '$0'}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan === 'free' ? 'Unlimited stories and exports' : 'Active lifetime access'}</p>
              </div>

              <Button className="w-full" size="lg" variant={plan === 'free' ? 'default' : 'outline'} disabled={plan !== 'free'}>
                {plan === 'free' ? 'Upgrade now' : 'Lifetime active'}
              </Button>

              {!canCreate && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
                  Free story limit reached. Upgrade to continue creating new stories.
                </div>
              )}

              {!canCreateVideoAccess && plan === 'free' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
                  Video exports are available on the lifetime plan.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateStoryModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        plan={plan}
        canCreate={canCreate}
        freeStoriesUsed={usage.freeStoriesUsed}
        booksThisYear={usage.booksThisYear}
      />
    </div>
  );
}

export const Route = createFileRoute('/studio/')({
  component: StudioDashboard,
});

export default StudioDashboard;

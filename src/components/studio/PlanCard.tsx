import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlanSummary, getPlanStatusText, formatLifetimePrice } from '@/lib/pricing';

export function PlanCard({ plan }: { plan: 'free' | 'lifetime' }) {
  const summary = getPlanSummary(plan);

  return (
    <Card className="h-full border border-border bg-card shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {plan === 'free' ? 'Free Trial' : 'Lifetime'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-semibold">
            {plan === 'free' ? 'Free' : formatLifetimePrice()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{getPlanStatusText(plan)}</p>
        </div>

        {plan === 'free' ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 2 full stories included</li>
            <li>• Write, illustrate, narrate</li>
            <li>• Export preview included</li>
          </ul>
        ) : (
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 100 stories/year</li>
            <li>• 4 videos/month</li>
            <li>• 6 voice presets and styles</li>
            <li>• All future features</li>
          </ul>
        )}

        <Button className="w-full" variant={plan === 'free' ? 'outline' : 'default'}>
          {plan === 'free' ? 'Start free trial' : 'Buy lifetime'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default PlanCard;

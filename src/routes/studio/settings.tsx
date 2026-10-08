import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/studio/settings')({
  component: StudioSettings,
});

function StudioSettings() {
  return (
    <div className="flex-1 overflow-auto md:mt-0 mt-16">
      <div className="p-6 md:p-8">
        <div className="mb-8 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/studio">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-2">
              <SettingsIcon className="h-6 w-6" /> Settings
            </h1>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <input type="email" defaultValue="user@example.com" disabled className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Name</label>
                <input type="text" defaultValue="Your Name" className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none" />
              </div>
              <Button>Save changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan & Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-secondary/30 p-4">
                <p className="text-sm font-medium">Current plan</p>
                <p className="mt-1 text-2xl font-semibold">Free</p>
                <p className="mt-1 text-sm text-muted-foreground">2 stories per month</p>
              </div>
              <Button>Upgrade to Lifetime ($89)</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

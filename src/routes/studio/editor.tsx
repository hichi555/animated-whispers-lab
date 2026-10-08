import { createFileRoute } from '@tanstack/react-router';
import { BookOpen, Wand2, Mic, ImageIcon, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/studio/editor')({
  component: StoryEditor,
});

function StoryEditor() {
  return (
    <div className="flex-1 overflow-auto md:mt-0 mt-16">
      <div className="p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/studio">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Workbook</p>
            <h1 className="mt-1 text-3xl font-semibold">Fern and the Lantern Fox</h1>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <Button variant="outline">Preview</Button>
          <Button>Publish</Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Page 1</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Title</label>
                <input
                  defaultValue="The Lantern in the Orchard"
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Story text</label>
                <textarea
                  rows={8}
                  defaultValue="On the very first evening of spring, Fern found a golden lantern glowing beneath the pear tree. It was warm as a pocket of sunlight, and it hummed softly as if it wanted to be noticed."
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wand2 className="h-4 w-4 text-primary" /> Studio tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2" variant="secondary">
                  <Wand2 className="h-4 w-4" /> Generate outline
                </Button>
                <Button className="w-full justify-start gap-2" variant="secondary">
                  <ImageIcon className="h-4 w-4" /> Create illustration
                </Button>
                <Button className="w-full justify-start gap-2" variant="secondary">
                  <Mic className="h-4 w-4" /> Narrate page
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" /> Quality check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Age-appropriate tone
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Visual-first scene structure
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Readability check passed
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Brush, Mic, UserRound, Clapperboard, Box, AudioLines, GraduationCap, Heart, PenTool } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CyliaTales — Create illustrated, narrated children's books" },
      { name: "description", content: "An AI story studio for families, classrooms and authors: write, illustrate, narrate and share original children's books." },
      { property: "og:title", content: "CyliaTales — Children's Story Studio" },
      { property: "og:description", content: "Write, illustrate and narrate original children's books in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  { icon: PenTool, title: "Story Writer", body: "Turn a spark of an idea into a paced, age-right picture book." },
  { icon: UserRound, title: "Character Builder", body: "Design a recurring cast with consistent looks and personalities." },
  { icon: Brush, title: "Illustration", body: "Six art styles, page-by-page scenes, regenerate any spread." },
  { icon: Mic, title: "Narration", body: "An original voice library, read aloud page by page." },
];

const SOON = [
  { icon: Clapperboard, title: "Video Stories", body: "Animate your book into a narrated short film." },
  { icon: Box, title: "3D Characters", body: "Sculpt and pose characters in three dimensions." },
  { icon: AudioLines, title: "Consented Voice Cloning", body: "Record your own voice — with verified consent — to narrate." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth">Start creating</Link></Button>
        </nav>
      </header>

      <section className="bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> The children's story studio
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] text-foreground md:text-6xl">
              Stories that feel <em className="text-primary">handmade</em>, made in minutes.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Write, illustrate and narrate original picture books with a cast of your own characters — for bedtime, the classroom, or your next published title.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/auth">Create your first book</Link></Button>
              <Button size="lg" variant="outline" asChild><a href="#studio">Explore the studio</a></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-accent" /> Families</span>
              <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-accent" /> Classrooms</span>
              <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /> Authors</span>
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="A girl and a fox reading a glowing storybook under the stars" width={1536} height={1024} className="rounded-3xl shadow-soft" />
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border bg-card p-4 shadow-soft md:block">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Now narrating</p>
              <p className="font-display text-lg">"Fern and the Lantern Fox"</p>
              <p className="text-sm text-muted-foreground">Voice · Wren — warm & gentle</p>
            </div>
          </div>
        </div>
      </section>

      <section id="studio" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-semibold md:text-4xl">One studio, every part of the book</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">Organized into clear workspaces so you always know where to go next.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <p.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-16 text-2xl font-semibold">Arriving next</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SOON.map((p) => (
            <div key={p.title} className="rounded-2xl border border-dashed bg-secondary/50 p-6">
              <p.icon className="h-6 w-6 text-muted-foreground" />
              <h4 className="mt-4 text-lg font-semibold">{p.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <Logo />
          <p>© {new Date().getFullYear()} CyliaTales. Original stories, original art, original voices.</p>
        </div>
      </footer>
    </div>
  );
}

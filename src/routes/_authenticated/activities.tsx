import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BookOpen, Printer, Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AGE_RANGES } from "@/lib/catalog";
import { generateLearningActivities } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({ meta: [
    { title: "Classroom activities — CyliaTales" },
    { name: "description", content: "Turn any finished story into age-appropriate comprehension questions and vocabulary activities." },
    { property: "og:title", content: "Classroom activities — CyliaTales" },
    { property: "og:description", content: "Comprehension questions and vocabulary activities for parents and teachers." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: Activities,
});

type Result = Awaited<ReturnType<typeof generateLearningActivities>>;
type Book = { id: string; title: string; age_range: string };

function Activities() {
  const run = useServerFn(generateLearningActivities);
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [age, setAge] = useState<"0-3" | "4-6" | "7-9" | "10-12">("4-6");
  const [questions, setQuestions] = useState(6);
  const [vocab, setVocab] = useState(6);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [showAnswers, setShowAnswers] = useState(true);

  useEffect(() => {
    supabase.from("stories").select("id,title,age_range").order("updated_at", { ascending: false }).limit(50)
      .then(({ data }) => setBooks((data ?? []) as Book[]));
  }, []);

  async function loadBook(id: string) {
    const book = books.find((b) => b.id === id); if (!book) return undefined;
    const { data, error } = await supabase.from("story_pages").select("text,page_number").eq("story_id", id).order("page_number");
    if (error) { toast.error(error.message); return; }
    setTitle(book.title); setStory((data ?? []).map((p) => p.text).filter(Boolean).join("\n\n"));
    if (AGE_RANGES.some((a) => a.id === book.age_range)) setAge(book.age_range as typeof age);
  }

  async function generate() {
    if (story.trim().length < 80) { toast.error("Paste at least a short paragraph of story text."); return; }
    setBusy(true); setResult(null);
    try { setResult(await run({ data: { title: title || undefined, story, ageRange: age, questionCount: questions, vocabCount: vocab } })); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <div className="print:hidden">
        <PageHeader eyebrow="For parents & teachers" title="Classroom activities" subtitle="Bring a finished story, choose the reader's age, and get questions and word work you can use today." />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4 border bg-card p-6">
            {books.length > 0 && (
              <label className="block text-sm font-medium">Start from one of your books
                <select className="mt-1.5 h-10 w-full border bg-background px-3 text-sm" defaultValue="" onChange={(e) => loadBook(e.target.value)}>
                  <option value="" disabled>Choose a book…</option>
                  {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </label>
            )}
            <label className="block text-sm font-medium">Title (optional)
              <input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-10 w-full border bg-background px-3 text-sm" placeholder="The Lantern in the Woods" />
            </label>
            <label className="block text-sm font-medium">Story text
              <textarea value={story} maxLength={20000} onChange={(e) => setStory(e.target.value)} rows={14} className="mt-1.5 w-full border bg-background p-3 text-sm leading-relaxed" placeholder="Paste the full story here…" />
              <span className="mt-1 block text-xs text-muted-foreground">{story.length.toLocaleString()} / 20,000 characters</span>
            </label>
          </div>
          <aside className="space-y-5 border bg-card p-6">
            <div>
              <p className="text-sm font-medium">Reader age</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {AGE_RANGES.map((a) => (
                  <button key={a.id} type="button" onClick={() => setAge(a.id)} className={`border px-3 py-2 text-left text-sm ${age === a.id ? "border-foreground bg-secondary" : "bg-background"}`}>
                    <span className="block font-semibold">{a.id}</span><span className="text-xs text-muted-foreground">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Counter label="Questions" value={questions} onChange={setQuestions} />
            <Counter label="Vocabulary words" value={vocab} onChange={setVocab} />
            <Button className="w-full" disabled={busy} onClick={generate}>{busy ? <Loader2 className="animate-spin" /> : <Sparkles />}{busy ? "Writing activities…" : "Create activities"}</Button>
            <p className="text-xs text-muted-foreground">Usually takes 20–60 seconds. Always review before sharing with children.</p>
          </aside>
        </div>
      </div>

      {result && (
        <article className="mt-10 border bg-card p-8 print:mt-0 print:border-0 print:p-0">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ages {age} · Reading guide</p>
              <h2 className="mt-2 font-display text-3xl">{title || "Story activities"}</h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{result.summary}</p>
              <p className="mt-2 max-w-2xl text-sm italic text-muted-foreground">{result.readingLevelNote}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={() => setShowAnswers(!showAnswers)}>{showAnswers ? "Hide answers" : "Show answers"}</Button>
              <Button variant="outline" onClick={() => window.print()}><Printer />Print</Button>
            </div>
          </div>

          <section className="mt-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><BookOpen className="h-5 w-5" />Comprehension</h3>
            <ol className="mt-4 space-y-5">
              {result.questions.map((q, i) => (
                <li key={i} className="break-inside-avoid border-l-2 pl-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{q.level}</p>
                  <p className="mt-1 font-medium">{i + 1}. {q.question}</p>
                  {q.choices.length > 0 && <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-3">{q.choices.map((c, j) => <li key={j} className="border px-3 py-1.5">{String.fromCharCode(65 + j)}. {c}</li>)}</ul>}
                  {showAnswers && <p className="mt-2 text-sm"><span className="font-semibold">Answer:</span> {q.answer} <span className="text-muted-foreground">— {q.teacherNote}</span></p>}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h3 className="text-lg font-semibold">Word work</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {result.vocabulary.map((v, i) => (
                <div key={i} className="break-inside-avoid border p-4">
                  <p className="font-display text-2xl">{v.word}</p>
                  <p className="mt-1 text-sm">{v.kidDefinition}</p>
                  <p className="mt-3 text-sm italic text-muted-foreground">“{v.fromStory}”</p>
                  <p className="mt-2 text-sm"><span className="font-semibold">Use it:</span> {v.useItSentence}</p>
                  <p className="mt-2 text-sm"><span className="font-semibold">Try it:</span> {v.activity}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h3 className="text-lg font-semibold">Beyond the book</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {result.extensionActivities.map((x, i) => (
                <div key={i} className="break-inside-avoid border p-4"><p className="font-semibold">{x.title} <span className="text-xs font-normal text-muted-foreground">· {x.minutes} min</span></p><p className="mt-2 text-sm">{x.instructions}</p></div>
              ))}
            </div>
          </section>
        </article>
      )}
    </div>
  );
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">{label}</span>
      <div className="flex items-center border">
        <button type="button" className="px-3 py-1" onClick={() => onChange(Math.max(3, value - 1))} aria-label={`Fewer ${label}`}>−</button>
        <span className="w-8 text-center tabular-nums">{value}</span>
        <button type="button" className="px-3 py-1" onClick={() => onChange(Math.min(12, value + 1))} aria-label={`More ${label}`}>+</button>
      </div>
    </div>
  );
}

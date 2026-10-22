import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const audiences = [
  {
    title: "Families",
    body: "Bedtime books starring the characters your child invents; print-ready PDF and offline reader for the car or plane.",
  },
  {
    title: "Educators",
    body: "Reading-age bands, classroom activities generated from the story's real themes, and printable worksheets.",
  },
  {
    title: "Independent authors",
    body: "Bring your own manuscript, lock your cast and art direction, and export every source asset as a ZIP.",
  },
];

const faq = [
  {
    question: "What can I make with CyliaTales?",
    answer:
      "Illustrated picture books, narrated read-alouds, comic pages, story posters, motion-scene storyboards and classroom activities — all from one story and one cast.",
  },
  {
    question: "How do characters stay consistent?",
    answer:
      "Define each character once — appearance, outfit, fixed colours and an optional private reference image — and those traits are carried into every page illustration.",
  },
  {
    question: "Can I change a single page?",
    answer:
      "Yes. Each page can be re-illustrated or re-narrated on its own without regenerating the rest of the book.",
  },
  {
    question: "Which reading ages are supported?",
    answer:
      "Four reading bands — 0–3, 4–6, 7–9 and 10–12 — each with its own sentence length and vocabulary guidance.",
  },
  {
    question: "Can I narrate with my own voice?",
    answer:
      "Yes, with recorded consent. Create a private cloned voice from a short sample, or choose one of eight original narrator voices.",
  },
  {
    question: "Is my family's information private?",
    answer:
      "Stories, characters and reference images are private to your account by default. Nothing appears on the public shelf unless you choose to publish it.",
  },
];

export function AudienceAndFaq() {
  return (
    <>
      <section className="border-y border-border/70 bg-secondary/35">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Made for the people who read aloud
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            A story can begin at home, in class or at your own desk.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {audiences.map((audience) => (
              <article key={audience.title} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
                <h3 className="font-display text-2xl">{audience.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{audience.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section aria-labelledby="faq-title" className="mx-auto max-w-4xl px-5 py-16 sm:px-6 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          A few useful details
        </p>
        <h2 id="faq-title" className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Questions from the story desk.
        </h2>
        <Accordion type="single" collapsible className="mt-7">
          {faq.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger className="py-5 text-left text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}

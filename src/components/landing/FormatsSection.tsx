import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FORM_SAMPLES } from "@/lib/showcase";

const formats = [
  {
    value: "picture-book",
    label: "Picture book",
    title: "A page-turning book",
    description: "Give one idea a beginning, middle and end, then read it as illustrated pages.",
    image: FORM_SAMPLES.pictureBook.image,
    alt: "Fern and Ember on an illustrated storybook page",
    bullets: ["An editable story plan", "One saved illustration per page", "Print-ready PDF delivery"],
    link: "/stories/new" as const,
    linkText: "Start a picture book",
  },
  {
    value: "comic",
    label: "Comic page",
    title: "One beat, told in panels",
    description: "Turn a selected story page into a three-panel sequence with the same cast.",
    image: FORM_SAMPLES.comic.image,
    alt: "Three comic panels following Fern and Ember",
    bullets: ["Three connected panels", "Approved cast references", "Saved panels for each page"],
    link: "/stories" as const,
    linkText: "Open the story library",
  },
  {
    value: "poster",
    label: "Story poster",
    title: "A keepsake for the wall",
    description: "Build a portrait poster from a story's approved art direction and cast.",
    image: FORM_SAMPLES.poster.image,
    alt: "Poster artwork featuring Fern and Ember",
    bullets: ["Portrait composition", "The story's existing cast", "Saved poster output"],
    link: "/stories" as const,
    linkText: "See story outputs",
  },
  {
    value: "motion",
    label: "Motion scene",
    title: "A moment with a camera move",
    description: "Plan the shot, camera movement and action for a selected story scene.",
    image: FORM_SAMPLES.motion.image,
    alt: "A storyboard frame of Fern and Ember beneath the trees",
    bullets: ["Shot-by-shot direction", "A previewable scene sequence", "Selected scenes can be animated"],
    link: "/labs" as const,
    linkText: "Open the scene studio",
  },
  {
    value: "classroom",
    label: "Classroom activity",
    title: "A story that starts a conversation",
    description: "Use the story's real moments as prompts for a short classroom discussion.",
    bullets: ["Three story questions", "A word to explore", "A printable activity surface"],
    link: "/activities" as const,
    linkText: "Open classroom activities",
  },
] as const;

function WorksheetSample() {
  return (
    <article className="flex h-full min-h-[22rem] flex-col justify-center rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Read, notice, wonder
      </p>
      <h3 className="mt-3 font-display text-2xl leading-tight">
        After reading: Fern and the Lantern Fox
      </h3>
      <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
        <li>What did Fern see glowing between the trees?</li>
        <li>How did Ember help Fern when the forest grew dark?</li>
        <li>Think about it: when have you helped a friend feel braver?</li>
      </ol>
      <p className="mt-5 rounded-xl bg-secondary p-4 text-sm leading-6">
        <span className="font-semibold">Word to explore — ember:</span> a small piece of glowing
        wood left in a fire.
      </p>
    </article>
  );
}

export function FormatsSection() {
  return (
    <section
      id="formats"
      aria-labelledby="formats-title"
      className="scroll-mt-8 border-y border-border/70 bg-secondary/35"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          One story, more than one way to share it
        </p>
        <h2 id="formats-title" className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          One story. Every form.
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          Start with Fern and Ember, then explore the different ways a story can travel.
        </p>
        <Tabs defaultValue="picture-book" className="mt-8">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl">
            {formats.map((format) => (
              <TabsTrigger
                key={format.value}
                value={format.value}
                className="whitespace-nowrap px-3 py-2.5"
              >
                {format.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {formats.map((format) => (
            <TabsContent key={format.value} value={format.value} className="mt-5">
              <div className="grid gap-6 rounded-3xl border bg-background p-4 shadow-soft sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8">
                <div
                  className={`flex items-center justify-center overflow-hidden rounded-2xl ${
                    format.value === "classroom" ? "min-h-[22rem] bg-secondary" : ""
                  }`}
                >
                  {format.value === "classroom" ? (
                    <WorksheetSample />
                  ) : (
                    <figure
                      className="relative mx-auto flex w-fit max-w-full overflow-hidden rounded-2xl"
                    >
                      <img
                        src={format.image}
                        alt={format.alt}
                        loading="lazy"
                        className="block h-auto w-auto max-h-[420px] max-w-full object-cover lg:max-h-[560px]"
                      />
                      {format.value === "poster" && (
                        <figcaption className="absolute inset-x-0 top-0 bg-gradient-to-b from-foreground/60 to-transparent px-4 pb-10 pt-4 text-center font-display text-2xl leading-tight text-balance text-background sm:px-6 sm:pt-6 sm:text-3xl">
                          Fern and the Lantern Fox
                        </figcaption>
                      )}
                      {format.value === "motion" && (
                        <figcaption className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-sm">
                          Storyboard frame · tracking shot
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>
                <div className="flex flex-col justify-center py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {format.label}
                  </p>
                  <h3 className="mt-3 font-display text-3xl leading-tight">{format.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{format.description}</p>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    What you get
                  </p>
                  <ul className="mt-3 space-y-3">
                    {format.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-6">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-7 w-fit" variant="outline" asChild>
                    <Link to={format.link}>
                      {format.linkText} <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

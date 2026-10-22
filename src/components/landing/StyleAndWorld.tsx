import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART_STYLES } from "@/lib/catalog";
import { STYLE_SAMPLES, WORLD_REFERENCES } from "@/lib/showcase";

export function StyleGallery() {
  return (
    <section aria-labelledby="styles-title" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            One cast, fourteen art directions
          </p>
          <h2 id="styles-title" className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Same cast. Fourteen styles.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Fern and Ember stay the same while the materials, light and linework change.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/styles">
            Compare every style <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-7">
        {ART_STYLES.map(({ id }) => {
          const sample = STYLE_SAMPLES[id];
          return (
            <article
              key={id}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-soft motion-reduce:transition-none"
            >
              <img
                src={sample.image}
                alt={`${id} illustration of Fern and Ember`}
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
              <div className="p-3">
                <h3 className="font-display text-lg leading-tight">{id}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{sample.bestFor}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const worldCards = [
  {
    title: "Characters stay themselves",
    image: WORLD_REFERENCES.characterSheet.image,
    alt: "Character sheet showing Fern and Ember's consistent features and clothing",
    detail: "Fern's bun, rust scarf and moss tunic; Ember's white-tipped, glowing tail.",
  },
  {
    title: "Places stay recognisable",
    image: WORLD_REFERENCES.place.image,
    alt: "Reference image of Willowmere village beside the lake",
    detail: WORLD_REFERENCES.place.name,
  },
  {
    title: "Props stay consistent",
    image: WORLD_REFERENCES.prop.image,
    alt: "Reference image of Fern's brass lantern",
    detail: WORLD_REFERENCES.prop.name,
  },
] as const;

export function StoryWorld() {
  return (
    <section className="border-y border-border/70 bg-secondary/35">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Story World · Fern and Ember
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Define the world once.
            </h2>
          </div>
          <p className="max-w-2xl leading-7 text-muted-foreground md:justify-self-end">
            Keep a character's look, a place's landmarks and a meaningful prop close at hand while
            the story moves from page to page.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {worldCards.map((card) => (
            <article key={card.title} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <img
                src={card.image}
                alt={card.alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <h3 className="font-display text-xl">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <figure className="mt-7 rounded-2xl border bg-card p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
            {WORLD_REFERENCES.bookPages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Fern and Ember story page ${index + 1}`}
                loading="lazy"
                className="aspect-[3/2] w-full rounded-lg object-cover"
              />
            ))}
          </div>
          <figcaption className="mt-4 text-center font-display text-lg text-muted-foreground">
            The same Fern and Ember on every page.
          </figcaption>
        </figure>
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link to="/world">
              Explore Story World <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

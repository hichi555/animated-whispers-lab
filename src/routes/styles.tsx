import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART_STYLES } from "@/lib/catalog";
import { STYLE_SAMPLES } from "@/lib/showcase";

export const Route = createFileRoute("/styles")({
  head: () => ({
    meta: [
      { title: "Compare art styles — CyliaTales" },
      {
        name: "description",
        content:
          "See Fern and Ember in fourteen art styles, with a note on what each style is best for.",
      },
      { property: "og:title", content: "Fourteen styles, fourteen different scenes — CyliaTales" },
      {
        property: "og:description",
        content:
          "Explore fourteen distinct scenes in different art styles with the recognisable Fern and Ember cast.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Styles,
});

function Styles() {
  const navigate = useNavigate();

  function chooseStyle(id: string) {
    sessionStorage.setItem("cylia:pending-style", id);
    void navigate({ to: "/stories/new" });
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> CyliaTales
      </Link>
      <header className="mt-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          A side-by-side art direction guide
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
          A new scene for every style.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Fourteen styles, fourteen different scenes, one recognisable cast. Fern and Ember keep
          their faces, colours and outfits in every style, while the medium changes how the story
          feels.
        </p>
      </header>
      <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {ART_STYLES.map(({ id, hint }) => {
          const sample = STYLE_SAMPLES[id];
          return (
            <article
              key={id}
              className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm"
            >
              <img
                src={sample.image}
                alt={sample.alt}
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h2 className="font-display text-lg leading-tight sm:text-xl">{id}</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
                <p className="mt-3 flex-1 text-xs font-semibold leading-5 text-foreground">
                  {sample.bestFor}
                </p>
                <Button
                  className="mt-4 w-full px-2 text-xs sm:text-sm"
                  variant="outline"
                  onClick={() => chooseStyle(id)}
                >
                  Use this style <ArrowRight />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

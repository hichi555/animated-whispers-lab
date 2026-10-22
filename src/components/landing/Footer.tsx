import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export function LandingCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 md:pb-24 lg:px-8">
      <div className="rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
              Start with one line
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
              Make a story they will ask for again.
            </h2>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-primary-foreground/85">
              {["Choose the reader", "Review the story plan", "Keep every page yours"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth">
              Start creating <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const productLinks = [
  { label: "Start creating", to: "/auth" },
  { label: "Styles", to: "/styles" },
  { label: "Explore", to: "/explore" },
  { label: "Sign in", to: "/auth" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Stories made with care, from the first sentence to the last page.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Product</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {productLinks.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <Link className="hover:text-foreground" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Formats</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {["Picture books", "Comic pages", "Story posters", "Classroom activities"].map((label) => (
              <li key={label}>
                <a className="hover:text-foreground" href="#formats">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="border-t pt-5 text-xs text-muted-foreground md:col-span-3">
          © {new Date().getFullYear()} CyliaTales
        </p>
      </div>
    </footer>
  );
}

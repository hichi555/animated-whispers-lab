import { useRef, useState, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { label: "Sample book", href: "#sample", type: "anchor" },
  { label: "Formats", href: "#formats", type: "anchor" },
  { label: "Styles", href: "/styles", type: "route" },
  { label: "Explore", href: "/explore", type: "route" },
] as const;

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingAnchorRef = useRef<string | null>(null);

  function handleMobileAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    pendingAnchorRef.current = href;
    setMenuOpen(false);
  }

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
      <Logo />
      <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
        {links.map((link) =>
          link.type === "anchor" ? (
            <a
              key={link.label}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              href={link.href}
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              to={link.href}
            >
              {link.label}
            </Link>
          ),
        )}
        <Button variant="ghost" asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
        <Button asChild>
          <Link to="/auth">
            Start creating <ArrowRight />
          </Link>
        </Button>
      </nav>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[min(22rem,88vw)]"
          onCloseAutoFocus={(event) => {
            const href = pendingAnchorRef.current;
            if (!href) return;
            event.preventDefault();
            pendingAnchorRef.current = null;
            requestAnimationFrame(() => {
              const target = document.querySelector<HTMLElement>(href);
              if (target) {
                const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth";
                target.scrollIntoView({ behavior, block: "start" });
              }
              window.history.replaceState(null, "", href);
            });
          }}
        >
          <SheetHeader className="text-left">
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile navigation" className="mt-8 flex flex-col gap-2">
            {links.map((link) =>
              link.type === "anchor" ? (
                <a
                  key={link.label}
                  className="rounded-xl px-3 py-3 text-base font-medium hover:bg-secondary"
                  href={link.href}
                  onClick={(event) => handleMobileAnchorClick(event, link.href)}
                >
                  {link.label}
                </a>
              ) : (
                <SheetClose asChild key={link.label}>
                  <Link
                    className="rounded-xl px-3 py-3 text-base font-medium hover:bg-secondary"
                    to={link.href}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ),
            )}
            <SheetClose asChild>
              <Link
                className="rounded-xl px-3 py-3 text-base font-medium hover:bg-secondary"
                to="/auth"
              >
                Sign in
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Button className="mt-2" asChild>
                <Link to="/auth">
                  Start creating <ArrowRight />
                </Link>
              </Button>
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

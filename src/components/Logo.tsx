import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 6.5C3 5.7 3.7 5 4.5 5H10a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4.5A1.5 1.5 0 0 1 3 15.5z" />
          <path d="M21 6.5c0-.8-.7-1.5-1.5-1.5H14a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h5.5c.8 0 1.5-.7 1.5-1.5z" />
          <path d="M17 2.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className={cn("font-display text-xl font-semibold", light ? "text-sidebar-foreground" : "text-foreground")}>
        CyliaTales
      </span>
    </Link>
  );
}

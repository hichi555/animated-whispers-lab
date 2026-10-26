import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" aria-label="CyliaTales home" className={cn("group flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 transition-transform duration-200 group-hover:scale-[1.04]" aria-hidden="true" fill="none">
        <path d="M29.5 10.8A14.2 14.2 0 1 0 29.5 29.2" stroke="#17484a" strokeWidth="4.3" strokeLinecap="round" />
        <path d="M30.1 17.8c1.25 1.25 1.25 3.15 0 4.4-1.25-1.25-1.25-3.15 0-4.4Z" fill="#e78c62" />
      </svg>
      <span className={cn("font-sans text-[1.24rem] font-extrabold tracking-[-0.045em]", light ? "text-sidebar-foreground" : "text-[#233437]")}>CyliaTales</span>
    </Link>
  );
}

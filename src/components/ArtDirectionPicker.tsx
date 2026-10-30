import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ART_DIRECTION_BOARDS } from "@/lib/art-direction";

export function ArtDirectionPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ART_DIRECTION_BOARDS.map((board) => {
        const active = selected === board.id;
        return (
          <Button
            key={board.id}
            type="button"
            variant="outline"
            aria-pressed={active}
            onClick={() => onSelect(board.id)}
            className={cn(
              "group h-auto overflow-hidden rounded-2xl border p-0 text-left flex-col items-stretch gap-0",
              active
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "bg-card hover:bg-secondary",
            )}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <img
                src={board.image}
                alt={`${board.name} art direction board`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              {active && (
                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </div>
            <span className="flex flex-col gap-2 p-4">
              <span className="flex items-center gap-2 font-semibold">
                <Palette className="h-4 w-4 text-primary" />
                {board.name}
              </span>
              <span className="text-xs text-muted-foreground">{board.medium}</span>
              <span className="text-xs text-muted-foreground">{board.palette}</span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}

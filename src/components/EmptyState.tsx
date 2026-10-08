import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-muted-foreground mb-4">{Icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">{description}</p>
      {action && actionLabel && (
        <Button onClick={action} size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

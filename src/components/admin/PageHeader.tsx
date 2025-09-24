
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

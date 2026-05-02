import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  badge?: string;
  right?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, badge, right }: PageHeaderProps) {
  return (
    <header className="flex items-center px-4 md:px-8 py-3.5 border-b border-border gap-3">
      <div className="flex items-center gap-2 text-[13px] text-text-dim">
        <Icon className="h-3 w-3 text-accent" />
        <strong className="text-text font-medium">{title}</strong>
        {badge && <Badge>{badge}</Badge>}
      </div>
      {right && <div className="ml-auto">{right}</div>}
    </header>
  );
}

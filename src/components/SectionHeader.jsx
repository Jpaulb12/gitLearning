import React from 'react';

export function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <span className="rounded-full border border-border bg-panel-2 px-2 py-0.5 text-xs text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

import React from 'react';

export function StatusBadge({ label }) {
  let badgeStyle = 'text-[var(--warn)] border-[var(--warn)]/40 bg-[var(--warn)]/10';
  
  if (label === 'Delivered') {
    badgeStyle = 'text-[var(--ok)] border-[var(--ok)]/40 bg-[var(--ok)]/10';
  } else if (label === 'Overdue') {
    badgeStyle = 'text-[var(--danger)] border-[var(--danger)]/40 bg-[var(--danger)]/10';
  } else if (label === 'Failed' || label === 'Removed') {
    badgeStyle = 'text-[var(--muted-foreground)] border-border bg-panel-2';
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badgeStyle}`}>
      {label}
    </span>
  );
}

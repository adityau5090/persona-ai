"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  title: string;
  date: string; // ISO date string
}

function groupHistory(items: HistoryItem[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfLastWeek = new Date(startOfToday);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const groups: Record<string, HistoryItem[]> = {
    Today: [],
    Yesterday: [],
    "Last Week": [],
    Older: [],
  };

  for (const item of items) {
    const d = new Date(item.date);
    if (d >= startOfToday) groups.Today.push(item);
    else if (d >= startOfYesterday) groups.Yesterday.push(item);
    else if (d >= startOfLastWeek) groups["Last Week"].push(item);
    else groups.Older.push(item);
  }

  return groups;
}

export function HistoryPanel({
  items,
  activeId,
  onSelect,
}: {
  items: HistoryItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const groups = groupHistory(items);

  return (
    <aside
      className={cn(
        "relative h-full border-r border-border bg-secondary/40 transition-all duration-300",
        open ? "w-72" : "w-14"
      )}
    >
      <div className="flex items-center justify-between p-3">
        {open && <span className="text-sm font-semibold text-muted-foreground">History</span>}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle history panel"
          className="rounded-md p-1.5 hover:bg-secondary"
        >
          {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-5 overflow-y-auto px-3 pb-4" style={{ maxHeight: "calc(100vh - 8rem)" }}>
          {Object.entries(groups).map(([label, list]) =>
            list.length ? (
              <div key={label}>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <div className="flex flex-col gap-2">
                  {list.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => onSelect?.(item.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-sm shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
                        idx % 2 === 0 ? "ml-0 mr-4" : "ml-4 mr-0",
                        activeId === item.id && "border-primary bg-accent text-accent-foreground"
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null
          )}
          {items.length === 0 && (
            <p className="px-1 text-sm text-muted-foreground">No conversations yet.</p>
          )}
        </div>
      )}
    </aside>
  );
}

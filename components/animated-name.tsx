"use client";

import { useEffect, useState } from "react";

export function AnimatedName({ name }: { name: string }) {
  // console.log("AnimatedName rendered with name:", name);
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (phase === "typing") {
      if (visibleCount < name.length) {
        timeout = setTimeout(() => setVisibleCount((c) => c + 1), 120);
      } else {
        timeout = setTimeout(() => setPhase("holding"), 5000);
      }
    } else if (phase === "holding") {
      timeout = setTimeout(() => setPhase("deleting"), 0);
    } else if (phase === "deleting") {
      if (visibleCount > 0) {
        timeout = setTimeout(() => setVisibleCount((c) => c - 1), 80);
      } else {
        timeout = setTimeout(() => setPhase("typing"), 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, visibleCount, name.length]);

  return (
    <span className="font-semibold text-sm sm:text-base tracking-wide text-primary min-w-[1ch] inline-block">
      {name
        .slice(0, visibleCount)
        .split("")
        .map((letter, i) => (
          <span key={i} className="inline-block">
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      <span className="inline-block w-[2px] h-4 bg-primary/70 ml-0.5 align-middle animate-pulse" />
    </span>
  );
}

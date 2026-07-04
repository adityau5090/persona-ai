"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LogOut } from "lucide-react";
import { AnimatedName } from "@/components/animated-name";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Span } from "next/dist/trace";

export function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { href: "/chat", label: "Chat" },
    { href: "/persona", label: "Persona" },
    { href: "/profile", label: "Profile" },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-10 flex gap-5 h-16 max-w-8xl items-center justify-between">
        <div className="flex gap-3 items-center justify-start  px-5">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">Persona AI</span>
        </div>

        <div className="flex flex-1 items-center justify-between gap-4 px-20">
          <div className="flex items-center gap-2 w-40 overflow-hidden shrink-0">
          
          <AnimatedName name={userName} />
        </div>

        <nav className="flex items-center gap-1 rounded-md bg-secondary px-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === tab.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </div>
    </header>
  );
}

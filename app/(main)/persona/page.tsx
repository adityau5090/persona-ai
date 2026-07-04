"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Palette, GraduationCap, Briefcase } from "lucide-react";
import { useEffect } from "react";

const PERSONAS = [
  {
    name: "Hitesh Chaudhary",
    description: "Breaks down complex topics into simple, friendly explanations.",
    icon: GraduationCap,
    tilt: "-3deg",
  },
  {
    name: "Sage the Strategist",
    description: "Helps you think through decisions with structured, calm advice.",
    icon: Briefcase,
    tilt: "2.5deg",
  },
  {
    name: "Muse the Creative",
    description: "Brainstorms ideas, stories, and creative writing with you.",
    icon: Palette,
    tilt: "-2deg",
  },
  {
    name: "Byte the Assistant",
    description: "A practical everyday helper for tasks, code, and quick answers.",
    icon: Bot,
    tilt: "3deg",
  },
];




export default function PersonaPage() {

  return (
    <main className="flex-1 overflow-y-auto px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold">Your Personas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a personality to chat with — each one pinned up like a note on your board.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {PERSONAS.map((p, i) => {
            const Icon = p.icon;
            const isEven = i % 2 === 0;
            return (
              <div
                key={p.name}
                className={`flex ${isEven ? "justify-start" : "justify-end"}`}
              >
                <Card
                  className="pin-card w-full max-w-sm bg-card"
                  style={{ "--tilt": p.tilt } as React.CSSProperties}
                >
                  <CardHeader className="items-center text-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button size="sm">Chat as {p.name.split(" ")[0]}</Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setUser(data);
      });
  }, []);

  return (
    <main className="flex-1 overflow-y-auto px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="mb-3 h-16 w-16 text-lg">
              <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
            <CardTitle>{user?.name ?? "Loading…"}</CardTitle>
            <CardDescription>{user?.email ?? ""}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-md bg-secondary p-4">
              <p className="text-2xl font-semibold text-primary">2</p>
              <p className="text-xs text-muted-foreground">Personas</p>
            </div>
            <div className="rounded-md bg-secondary p-4">
              <p className="text-2xl font-semibold text-primary">∞</p>
              <p className="text-xs text-muted-foreground">Conversations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

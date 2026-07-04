import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/navbar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect("/login");

  

  return (
    <div className="flex h-screen flex-col">
      <Navbar userName={session.name} />
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
